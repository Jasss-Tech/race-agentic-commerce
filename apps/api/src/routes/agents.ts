import { FastifyInstance } from 'fastify';
import { prisma } from '../prisma';
import { BuyerAgent, RiskEngine } from '@race/agent-core';
import { PolicyEngine } from '@race/policy-engine';
import { AuditService } from '../services/audit';
import { razorpayService } from '../services/razorpay';
import { aiService } from '../services/ai';
import { ProductDto } from '@race/types';
import {
  BuyerMessageSchema,
  BuyerSearchSchema,
  BuyerCompareSchema,
  BuyerCheckoutSchema
} from '../validation';

export async function agentRoutes(app: FastifyInstance) {
  // Conversational Buyer Agent Interface
  app.post('/api/agents/buyer/message', async (req, reply) => {
    const parseResult = BuyerMessageSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: { code: 'INVALID_REQUEST', message: parseResult.error.errors.map(e => e.message).join(', ') }
      });
    }

    const { message, userId, mandateId } = parseResult.data;

    // 1. Fetch catalog
    const products = await prisma.product.findMany({
      where: { active: true },
      include: { merchant: true }
    });

    const productDtos: ProductDto[] = products.map(p => ({
      id: p.id,
      merchantId: p.merchantId,
      name: p.name,
      slug: p.slug,
      description: p.description,
      category: p.category,
      price: p.price,
      currency: p.currency,
      stock: p.stock,
      active: p.active,
      agentPurchasable: p.agentPurchasable,
      attributes: JSON.parse(p.attributes || '{}'),
      returnPolicy: p.returnPolicy,
      merchantName: p.merchant.name,
      merchantTrustScore: p.merchant.trustScore
    }));

    // 2. Fetch existing mandate if any
    let currentMandate = undefined;
    if (mandateId) {
      const m = await prisma.mandate.findUnique({ where: { id: mandateId } });
      if (m) {
        currentMandate = {
          id: m.id,
          userId: m.userId,
          agentId: m.agentId,
          merchantId: m.merchantId,
          intent: m.intent,
          maxAmount: m.maxAmount,
          currency: m.currency,
          allowedCategories: JSON.parse(m.allowedCategories || '[]'),
          allowedActions: JSON.parse(m.allowedActions || '[]'),
          confirmationRequired: m.confirmationRequired,
          status: m.status as any,
          expiresAt: m.expiresAt.toISOString(),
          createdAt: m.createdAt.toISOString()
        };
      }
    }

    // 3. Extract intent with AI provider (or deterministic fallback)
    const structuredIntent = await aiService.parseBuyerIntent(message);

    // 4. Process with Buyer Agent
    const agentResponse = BuyerAgent.processMessage(message, productDtos, currentMandate, structuredIntent);

    // 5. Record agent interaction
    await prisma.agentInteraction.create({
      data: {
        agentId: 'buyer_agent',
        userId,
        tool: structuredIntent.tool || 'catalog.search',
        action: structuredIntent.action,
        input: JSON.stringify({ message, currentMandateId: mandateId, aiProvider: aiService.getProvider() }),
        outputSummary: JSON.stringify({
          category: agentResponse.intentSummary?.category,
          budget: agentResponse.intentSummary?.maxBudget,
          matchedCount: agentResponse.products?.length || 0,
          suggestedAction: agentResponse.suggestedAction
        }),
        success: true
      }
    });

    // 6. Record Audit event
    await AuditService.recordEvent({
      eventType: 'AGENT_REQUEST',
      actorType: 'BUYER_AGENT',
      actorId: 'buyer_agent',
      resourceType: 'MANDATE',
      resourceId: mandateId || 'intent_search',
      decision: 'SUCCESS',
      metadata: {
        rawQuery: message,
        extractedIntent: agentResponse.intentSummary,
        productsCount: agentResponse.products?.length,
        aiProvider: aiService.getProvider()
      }
    });

    return agentResponse;
  });

  // Tool: search_catalog
  app.post('/api/agents/buyer/search', async (req, reply) => {
    const parseResult = BuyerSearchSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: { code: 'INVALID_REQUEST', message: parseResult.error.errors.map(e => e.message).join(', ') }
      });
    }

    const { query, category, maxPrice } = parseResult.data;

    const products = await prisma.product.findMany({
      where: {
        active: true,
        ...(category ? { category: { contains: category } } : {}),
        ...(query ? {
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
            { category: { contains: query } }
          ]
        } : {}),
        ...(maxPrice ? { price: { lte: maxPrice } } : {})
      },
      include: { merchant: true }
    });

    return {
      success: true,
      count: products.length,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        currency: p.currency,
        stock: p.stock,
        agentPurchasable: p.agentPurchasable,
        merchantName: p.merchant.name
      }))
    };
  });

  // Tool: compare_products
  app.post('/api/agents/buyer/compare', async (req, reply) => {
    const parseResult = BuyerCompareSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: { code: 'INVALID_REQUEST', message: parseResult.error.errors.map(e => e.message).join(', ') }
      });
    }

    const { productIds } = parseResult.data;

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { merchant: true }
    });

    return {
      success: true,
      comparedCount: products.length,
      items: products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        category: p.category,
        attributes: JSON.parse(p.attributes || '{}')
      }))
    };
  });

  // Buyer Agent Autonomous Checkout Gateway
  app.post('/api/agents/buyer/checkout', async (req, reply) => {
    const parseResult = BuyerCheckoutSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: { code: 'INVALID_REQUEST', message: parseResult.error.errors.map(e => e.message).join(', ') }
      });
    }

    const {
      mandateId,
      productId,
      quantity = 1,
      expectedPrice,
      idempotencyKey,
      simulateFailure = false
    } = parseResult.data;

    // 1. Fetch Mandate
    const mandate = await prisma.mandate.findUnique({ where: { id: mandateId } });
    if (!mandate) {
      return reply.status(404).send({
        error: { code: 'MANDATE_NOT_FOUND', message: 'No active intent mandate found with the provided ID.' }
      });
    }

    // 2. Fetch Product & Merchant
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { merchant: true, inventory: true }
    });

    if (!product) {
      return reply.status(404).send({
        error: { code: 'PRODUCT_NOT_FOUND', message: 'Product is not available in catalog.' }
      });
    }

    const requestedAmount = product.price * quantity;

    // 3. Idempotency Check: reuse pending order if identical idempotency key is supplied
    if (idempotencyKey) {
      const existing = await prisma.order.findUnique({
        where: { idempotencyKey },
        include: { payments: true }
      });
      if (existing) {
        return reply.status(200).send({
          success: true,
          isDuplicate: true,
          orderId: existing.id,
          razorpayOrderId: existing.razorpayOrderId,
          razorpayKeyId: razorpayService.getKeyId(),
          amount: existing.amount,
          currency: existing.currency,
          status: existing.status,
          message: 'Idempotency key matched existing order.'
        });
      }
    }

    // 4. Calculate Risk
    const orderCount24h = await prisma.order.count({
      where: {
        userId: mandate.userId,
        createdAt: { gte: new Date(Date.now() - 24 * 3600 * 1000) }
      }
    });

    const riskResult = RiskEngine.evaluate({
      requestedAmount,
      mandateMaxAmount: mandate.maxAmount,
      expectedPrice,
      currentCatalogPrice: product.price,
      merchantTrustScore: product.merchant.trustScore,
      userOrderCount24h: orderCount24h
    });

    // 5. Evaluate Deterministic Policy Engine (12 Rules)
    const policyResult = PolicyEngine.evaluate({
      requestedAmount,
      expectedPrice,
      currentCatalogPrice: product.price,
      currency: product.currency,
      quantity,
      product: {
        id: product.id,
        merchantId: product.merchantId,
        category: product.category,
        active: product.active,
        agentPurchasable: product.agentPurchasable,
        stock: product.stock,
        price: product.price,
        currency: product.currency
      },
      merchant: {
        id: product.merchant.id,
        agentEnabled: product.merchant.agentEnabled,
        trustScore: product.merchant.trustScore
      },
      mandate: {
        id: mandate.id,
        status: mandate.status,
        maxAmount: mandate.maxAmount,
        currency: mandate.currency,
        allowedCategories: JSON.parse(mandate.allowedCategories || '[]'),
        allowedActions: JSON.parse(mandate.allowedActions || '[]'),
        expiresAt: mandate.expiresAt,
        merchantId: mandate.merchantId
      },
      action: 'purchase',
      idempotencyKey,
      riskScore: riskResult.score
    });

    // Record Policy and Risk checks
    await prisma.policyDecision.create({
      data: {
        mandateId: mandate.id,
        decision: policyResult.decision,
        reasonCodes: JSON.stringify(policyResult.reasonCodes),
        rulesEvaluated: JSON.stringify(policyResult.rules)
      }
    });

    await prisma.riskCheck.create({
      data: {
        mandateId: mandate.id,
        score: riskResult.score,
        level: riskResult.level,
        signals: JSON.stringify(riskResult.signals)
      }
    });

    // 6. Policy Gate: Check for Block / Price Drift
    if (policyResult.decision === 'BLOCK') {
      const primaryReason = policyResult.reasonCodes[0] || 'POLICY_VIOLATION';

      await AuditService.recordEvent({
        eventType: primaryReason === 'PRICE_DRIFT' ? 'PRICE_DRIFT_DETECTED' : 'AUTHORIZATION_BLOCKED',
        actorType: 'POLICY_ENGINE',
        actorId: 'deterministic_policy_engine',
        resourceType: 'MANDATE',
        resourceId: mandate.id,
        decision: 'BLOCK',
        reasonCodes: policyResult.reasonCodes,
        metadata: {
          productId: product.id,
          expectedPrice,
          currentPrice: product.price,
          requestedAmount,
          mandateMaxAmount: mandate.maxAmount
        }
      });

      return reply.status(422).send({
        error: {
          code: primaryReason,
          message: policyResult.explanation,
          details: {
            expectedPrice,
            currentPrice: product.price,
            mandateLimit: mandate.maxAmount,
            rules: policyResult.rules.filter(r => !r.passed)
          }
        }
      });
    }

    // 7. Create Internal Order in AUTHORIZED state
    const order = await prisma.order.create({
      data: {
        userId: mandate.userId,
        merchantId: product.merchantId,
        mandateId: mandate.id,
        amount: requestedAmount,
        currency: product.currency,
        status: simulateFailure ? 'PAYMENT_FAILED' : 'AUTHORIZED',
        idempotencyKey: idempotencyKey || null,
        failureReason: simulateFailure ? 'SIMULATED_AUTHORIZATION_DECLINE' : null,
        items: {
          create: {
            productId: product.id,
            quantity,
            unitPrice: product.price,
            totalPrice: requestedAmount
          }
        }
      }
    });

    if (simulateFailure) {
      await AuditService.recordEvent({
        eventType: 'PAYMENT_FAILED',
        actorType: 'SYSTEM',
        actorId: 'demo_controller',
        resourceType: 'ORDER',
        resourceId: order.id,
        decision: 'FAILURE',
        metadata: { reason: 'Simulated payment failure scenario' }
      });

      return reply.status(402).send({
        error: {
          code: 'PAYMENT_FAILED',
          message: 'Payment declined in simulation mode. No funds were debited.',
          orderId: order.id
        }
      });
    }

    // 8. Create Razorpay Test Order Server-Side
    let razorpayOrder;
    try {
      razorpayOrder = await razorpayService.createOrder({
        amountInRupees: requestedAmount,
        receipt: `rcpt_${order.id.slice(-8)}`,
        notes: {
          internalOrderId: order.id,
          mandateId: mandate.id,
          merchantId: product.merchantId,
          productId: product.id
        }
      });
    } catch (err: any) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'PAYMENT_FAILED', failureReason: err.message }
      });

      return reply.status(502).send({
        error: { code: 'GATEWAY_ERROR', message: `Gateway order creation failed: ${err.message}` }
      });
    }

    // Attach Razorpay order ID to internal order
    await prisma.order.update({
      where: { id: order.id },
      data: {
        razorpayOrderId: razorpayOrder.id,
        status: 'PAYMENT_PENDING'
      }
    });

    // 9. Record Audit Event
    await AuditService.recordEvent({
      eventType: 'AUTHORIZATION_GRANTED',
      actorType: 'POLICY_ENGINE',
      actorId: 'deterministic_policy_engine',
      resourceType: 'ORDER',
      resourceId: order.id,
      decision: 'ALLOW',
      metadata: {
        orderId: order.id,
        razorpayOrderId: razorpayOrder.id,
        amount: requestedAmount,
        riskScore: riskResult.score,
        isMockProvider: razorpayOrder.isMockProvider
      }
    });

    return {
      success: true,
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: razorpayService.getKeyId(),
      amount: requestedAmount,
      currency: product.currency,
      status: 'PAYMENT_PENDING',
      product: {
        id: product.id,
        name: product.name,
        price: product.price
      },
      mandate: {
        id: mandate.id,
        maxAmount: mandate.maxAmount
      },
      policyDecision: policyResult.decision,
      riskScore: riskResult.score,
      isMockProvider: razorpayOrder.isMockProvider
    };
  });
}
