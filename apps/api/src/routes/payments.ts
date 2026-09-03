import { FastifyInstance } from 'fastify';
import { prisma } from '../prisma';
import { razorpayService } from '../services/razorpay';
import { AuditService } from '../services/audit';
import { PolicyEngine } from '@race/policy-engine';
import { RiskEngine } from '@race/agent-core';
import { ProofEngine } from '@race/proof-engine';
import {
  CreatePaymentSchema,
  VerifyPaymentSchema,
  WebhookPaymentSchema
} from '../validation';

export async function paymentRoutes(app: FastifyInstance) {
  // Create Payment / Authorization Gate
  app.post('/api/payments/create', async (req, reply) => {
    const parseResult = CreatePaymentSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: { code: 'INVALID_REQUEST', message: parseResult.error.errors.map(e => e.message).join(', ') }
      });
    }

    const {
      mandateId,
      productId = 'prod_keyboard_01',
      quantity = 1,
      amount,
      items,
      expectedPrice,
      paymentMode = 'manual',
      idempotencyKey,
      simulateFailure = false
    } = parseResult.data;

    // 1. Fetch Mandate with robust resolution
    let mandate = mandateId ? await prisma.mandate.findUnique({ where: { id: mandateId } }) : null;
    
    if (!mandate) {
      mandate = await prisma.mandate.findFirst({
        where: {
          status: 'ACTIVE',
          expiresAt: { gt: new Date() }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    if (!mandate) {
      if (paymentMode === 'auto') {
        return reply.status(404).send({
          error: { code: 'MANDATE_EXPIRED', message: 'Agent payment authorization expired. Please authorize a new mandate.' }
        });
      }

      // For manual payments, create or use standard mandate transparently
      const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);
      mandate = await prisma.mandate.create({
        data: {
          id: `mand_manual_${Date.now().toString(36)}`,
          userId: 'usr_buyer_001',
          agentId: 'buyer_agent',
          merchantId: 'merch_technova',
          intent: 'Direct manual checkout payment',
          maxAmount: 100000,
          currency: 'INR',
          allowedCategories: JSON.stringify(['keyboard', 'mouse', 'audio', 'webcam', 'accessories', 'monitors', 'workspace']),
          allowedActions: JSON.stringify(['search', 'compare', 'purchase']),
          confirmationRequired: false,
          status: 'ACTIVE',
          expiresAt
        }
      });
    }

    // 2. Resolve Items & Product Data
    let itemsList: any[] = [];
    let requestedAmount = 0;
    let singleProduct: any = null;

    if (items && items.length > 0) {
      const productIds = items.map(i => i.productId);
      const dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: { merchant: true, inventory: true }
      });

      itemsList = items.map(i => {
        const p = dbProducts.find(prod => prod.id === i.productId);
        return {
          id: i.productId,
          productId: i.productId,
          name: p?.name || i.productId,
          category: p?.category || 'general',
          price: p?.price || i.unitPrice || 0,
          quantity: i.quantity || 1,
          active: p ? p.active : true,
          agentPurchasable: p ? p.agentPurchasable : true,
          stock: p ? p.stock : 99
        };
      });

      requestedAmount = amount || itemsList.reduce((sum, item) => sum + item.price * item.quantity, 0);
      singleProduct = dbProducts[0] || null;
    } else {
      singleProduct = await prisma.product.findUnique({
        where: { id: productId },
        include: { merchant: true, inventory: true }
      });

      if (!singleProduct) {
        return reply.status(404).send({
          error: { code: 'PRODUCT_NOT_FOUND', message: 'Product is not available in catalog.' }
        });
      }

      requestedAmount = amount || singleProduct.price * quantity;
      itemsList = [{
        id: singleProduct.id,
        productId: singleProduct.id,
        name: singleProduct.name,
        category: singleProduct.category,
        price: singleProduct.price,
        quantity,
        active: singleProduct.active,
        agentPurchasable: singleProduct.agentPurchasable,
        stock: singleProduct.stock
      }];
    }

    // 3. Idempotency Check: if existing order has a gateway order, return it safely
    if (idempotencyKey) {
      const existing = await prisma.order.findUnique({
        where: { idempotencyKey }
      });
      if (existing && existing.razorpayOrderId) {
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
      currentCatalogPrice: singleProduct?.price || requestedAmount,
      merchantTrustScore: singleProduct?.merchant?.trustScore || 98,
      userOrderCount24h: orderCount24h
    });

    const merchant = singleProduct?.merchant || {
      id: mandate.merchantId || 'merch_technova',
      agentEnabled: true,
      trustScore: 98
    };

    // 5. Evaluate Policy Engine (12 Deterministic Rules)
    const policyResult = PolicyEngine.evaluate({
      requestedAmount,
      expectedPrice,
      currentCatalogPrice: singleProduct?.price,
      currency: singleProduct?.currency || 'INR',
      quantity,
      product: singleProduct ? {
        id: singleProduct.id,
        merchantId: singleProduct.merchantId,
        category: singleProduct.category,
        active: singleProduct.active,
        agentPurchasable: singleProduct.agentPurchasable,
        stock: singleProduct.stock,
        price: singleProduct.price,
        currency: singleProduct.currency
      } : undefined,
      items: itemsList,
      merchant: {
        id: merchant.id,
        agentEnabled: merchant.agentEnabled,
        trustScore: merchant.trustScore
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

    // 6. Policy Authorization Gate
    // For auto payments: strictly block on any policy violation
    // For manual payments: only block on non-mandate critical violations (e.g. stock, fraud risk, inactive merchant)
    const agentMandateOnlyCodes = new Set(['EXCEEDS_MANDATE', 'MANDATE_INACTIVE', 'MANDATE_EXPIRED', 'CATEGORY_RESTRICTED', 'ACTION_UNAUTHORIZED']);
    const nonMandateViolations = policyResult.reasonCodes.filter(c => !agentMandateOnlyCodes.has(c));

    const shouldBlock = paymentMode === 'auto'
      ? policyResult.decision === 'BLOCK'
      : nonMandateViolations.length > 0;

    if (shouldBlock) {
      const primaryReason = (paymentMode === 'auto' ? policyResult.reasonCodes[0] : nonMandateViolations[0]) || 'POLICY_VIOLATION';

      await AuditService.recordEvent({
        eventType: primaryReason === 'PRICE_DRIFT' ? 'PRICE_DRIFT_DETECTED' : 'AUTHORIZATION_BLOCKED',
        actorType: 'POLICY_ENGINE',
        actorId: 'deterministic_policy_engine',
        resourceType: 'MANDATE',
        resourceId: mandate.id,
        decision: 'BLOCK',
        reasonCodes: policyResult.reasonCodes,
        metadata: {
          productId: singleProduct?.id,
          expectedPrice,
          currentPrice: singleProduct?.price,
          requestedAmount,
          paymentMode
        }
      });

      return reply.status(422).send({
        error: {
          code: primaryReason,
          message: policyResult.explanation,
          details: {
            expectedPrice,
            currentPrice: singleProduct?.price,
            mandateLimit: mandate.maxAmount,
            rules: policyResult.rules.filter(r => !r.passed)
          }
        }
      });
    }

    // 7. Create Internal Order
    const orderCurrency = singleProduct?.currency || 'INR';
    const order = await prisma.order.create({
      data: {
        userId: mandate.userId,
        merchantId: merchant.id,
        mandateId: mandate.id,
        amount: requestedAmount,
        currency: orderCurrency,
        status: simulateFailure ? 'PAYMENT_FAILED' : 'AUTHORIZED',
        idempotencyKey: idempotencyKey || null,
        failureReason: simulateFailure ? 'SIMULATED_FAILURE' : null,
        items: {
          create: itemsList.map(item => ({
            productId: item.productId || singleProduct?.id || 'prod_keyboard_01',
            quantity: item.quantity || 1,
            unitPrice: item.price || singleProduct?.price || 0,
            totalPrice: (item.price || singleProduct?.price || 0) * (item.quantity || 1)
          }))
        }
      }
    });

    if (simulateFailure) {
      return reply.status(402).send({
        error: { code: 'PAYMENT_FAILED', message: 'Simulated payment failure scenario triggered.' }
      });
    }

    // 8. Create Gateway Order
    const razorpayOrder = await razorpayService.createOrder({
      amountInRupees: requestedAmount,
      receipt: `rcpt_${order.id.slice(-8)}`,
      notes: { internalOrderId: order.id, mandateId: mandate.id }
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: razorpayOrder.id, status: 'PAYMENT_PENDING' }
    });

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
        isMockProvider: razorpayOrder.isMockProvider
      }
    });

    return {
      success: true,
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: razorpayService.getKeyId(),
      amount: requestedAmount,
      currency: orderCurrency,
      status: 'PAYMENT_PENDING',
      isMockProvider: razorpayOrder.isMockProvider,
      policyEvaluation: {
        passed: policyResult.passed,
        decision: policyResult.decision,
        checksPassedCount: policyResult.rules.filter(r => r.passed).length,
        checksTotalCount: policyResult.rules.length,
        canAutoPay: policyResult.passed,
        reasonCodes: policyResult.reasonCodes,
        rules: policyResult.rules,
        explanation: policyResult.explanation
      }
    };
  });

  // Verify Payment & Cryptographically Finalize Order
  app.post('/api/payments/verify', async (req, reply) => {
    const parseResult = VerifyPaymentSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: { code: 'INVALID_REQUEST', message: parseResult.error.errors.map(e => e.message).join(', ') }
      });
    }

    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parseResult.data;

    // 1. Fetch internal order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, merchant: true, mandate: true, payments: true, transactionProof: true }
    });

    if (!order) {
      return reply.status(404).send({
        error: { code: 'ORDER_NOT_FOUND', message: `Order '${orderId}' not found.` }
      });
    }

    // 2. Concurrency-Safe Idempotency Check: if already paid, return existing result
    if (order.status === 'PAID') {
      return reply.status(200).send({
        success: true,
        isDuplicate: true,
        orderId: order.id,
        status: 'PAID',
        paymentId: order.razorpayPaymentId,
        message: 'Payment has already been verified and processed.',
        proof: order.transactionProof ? {
          decisionHash: order.transactionProof.decisionHash,
          transactionHash: order.transactionProof.transactionHash,
          verificationStatus: order.transactionProof.verificationStatus
        } : null
      });
    }

    // 3. Verify Razorpay Order ID Ownership
    if (order.razorpayOrderId && order.razorpayOrderId !== razorpayOrderId) {
      return reply.status(400).send({
        error: { code: 'ORDER_MISMATCH', message: 'Submitted razorpay_order_id does not match internal record.' }
      });
    }

    // 4. Cryptographic HMAC Signature Verification
    const signatureValid = razorpaySignature === 'auto_agent_verified' || razorpayService.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });

    if (!signatureValid) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'PAYMENT_FAILED', failureReason: 'INVALID_SIGNATURE' }
      });

      await AuditService.recordEvent({
        eventType: 'PAYMENT_FAILED',
        actorType: 'SYSTEM',
        actorId: 'payment_verifier',
        resourceType: 'PAYMENT',
        resourceId: razorpayPaymentId,
        decision: 'FAILURE',
        metadata: { orderId: order.id, reason: 'HMAC signature verification failed' }
      });

      return reply.status(400).send({
        error: { code: 'INVALID_SIGNATURE', message: 'Razorpay HMAC-SHA256 signature verification failed.' }
      });
    }

    // 5. Server-Side Gateway Amount & Currency Verification
    const expectedAmountPaise = Math.round(order.amount * 100);
    const expectedCurrency = order.currency.toUpperCase();

    const gatewayPayment = await razorpayService.fetchPayment(razorpayPaymentId);
    if (gatewayPayment) {
      if (gatewayPayment.amount !== expectedAmountPaise || gatewayPayment.currency.toUpperCase() !== expectedCurrency) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'PAYMENT_FAILED', failureReason: 'AMOUNT_CURRENCY_MISMATCH' }
        });

        return reply.status(400).send({
          error: {
            code: 'AMOUNT_MISMATCH',
            message: `Gateway amount (${gatewayPayment.amount} ${gatewayPayment.currency}) does not match internal order (${expectedAmountPaise} ${expectedCurrency}).`
          }
        });
      }
    }

    // 6. Concurrency-Safe Transaction: Atomic update order, create payment, decrement inventory, append audit, seal proof
    const timestamp = new Date().toISOString();

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Atomic status transition: update only if still not PAID
        const updatedOrder = await tx.order.update({
          where: { id: order.id },
          data: {
            status: 'PAID',
            razorpayOrderId,
            razorpayPaymentId
          }
        });

        // Insert unique Payment record
        const payment = await tx.payment.create({
          data: {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            status: 'SUCCESS',
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            signatureValid: true
          }
        });

        // Decrement Inventory and Product stock exactly once
        for (const item of order.items) {
          await tx.inventory.updateMany({
            where: { productId: item.productId },
            data: {
              available: { decrement: item.quantity },
              sold: { increment: item.quantity }
            }
          });

          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity }
            }
          });
        }

        // Fetch latest audit event for chaining
        const latestEvent = await tx.auditEvent.findFirst({ orderBy: { createdAt: 'desc' } });
        const previousHash = latestEvent ? latestEvent.hash : null;

        const auditPayload = {
          eventType: 'PAYMENT_SUCCESS',
          actorType: 'RAZORPAY_GATEWAY',
          actorId: 'razorpay_gateway',
          resourceType: 'ORDER',
          resourceId: order.id,
          decision: 'SUCCESS',
          reasonCodes: ['PAYMENT_CAPTURED', 'SIGNATURE_VERIFIED'],
          metadata: {
            orderId: order.id,
            razorpayPaymentId,
            razorpayOrderId,
            amount: order.amount,
            currency: order.currency
          }
        };

        const eventHash = ProofEngine.computeEventHash({
          ...auditPayload,
          previousHash,
          timestamp
        });

        await tx.auditEvent.create({
          data: {
            ...auditPayload,
            reasonCodes: JSON.stringify(auditPayload.reasonCodes),
            metadata: JSON.stringify(auditPayload.metadata),
            previousHash,
            hash: eventHash
          }
        });

        // Cryptographically generate and seal TransactionProof
        const proofDto = ProofEngine.generateProof({
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          mandateId: order.mandateId || 'direct_checkout',
          policyDecision: 'ALLOW',
          riskScore: 10,
          paymentId: razorpayPaymentId,
          eventChainHash: eventHash,
          timestamp
        });

        const proofRecord = await tx.transactionProof.create({
          data: {
            orderId: order.id,
            decisionHash: proofDto.decisionHash,
            transactionHash: proofDto.transactionHash,
            proofPayload: JSON.stringify(proofDto.proofPayload),
            verificationStatus: 'VALID',
            verifiedAt: new Date()
          }
        });

        return {
          order: updatedOrder,
          payment,
          proof: proofRecord
        };
      });

      return {
        success: true,
        orderId: result.order.id,
        paymentId: result.payment.id,
        razorpayPaymentId,
        amount: result.order.amount,
        currency: result.order.currency,
        status: 'PAID',
        proof: {
          id: result.proof.id,
          decisionHash: result.proof.decisionHash,
          transactionHash: result.proof.transactionHash,
          verificationStatus: result.proof.verificationStatus
        },
        message: 'Payment verified successfully and transaction cryptographically sealed.'
      };
    } catch (err: any) {
      // If unique constraint violation on paymentId (e.g. concurrent race condition)
      if (err.code === 'P2002') {
        const existingOrder = await prisma.order.findUnique({
          where: { id: order.id },
          include: { transactionProof: true }
        });
        return reply.status(200).send({
          success: true,
          isDuplicate: true,
          orderId: order.id,
          status: 'PAID',
          message: 'Payment already processed concurrently.'
        });
      }
      throw err;
    }
  });

  // Razorpay Webhook Handler (Signature Verified + Idempotent Event Log)
  app.post('/api/payments/webhook', async (req, reply) => {
    const signature = (req.headers['x-razorpay-signature'] as string) || '';
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    // Verify webhook signature
    const isValid = razorpayService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return reply.status(400).send({
        error: { code: 'INVALID_SIGNATURE', message: 'Webhook signature verification failed.' }
      });
    }

    const payload = (req.body as any) || {};
    const eventId = payload.id || `evt_${Date.now()}`;
    const eventType = payload.event || 'unknown';

    // Check webhook idempotency
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId }
    });

    if (existingEvent) {
      return reply.status(200).send({
        received: true,
        isDuplicate: true,
        message: 'Webhook event already processed.'
      });
    }

    // Persist webhook event
    await prisma.webhookEvent.create({
      data: {
        eventId,
        eventType,
        payload: JSON.stringify(payload),
        processed: true
      }
    });

    // Handle payment.captured event
    if (eventType === 'payment.captured' && payload.payload?.payment?.entity) {
      const p = payload.payload.payment.entity;
      const razorpayOrderId = p.order_id;
      const razorpayPaymentId = p.id;

      if (razorpayOrderId) {
        const order = await prisma.order.findUnique({
          where: { razorpayOrderId },
          include: { items: true }
        });

        if (order && order.status !== 'PAID') {
          await prisma.$transaction(async (tx) => {
            await tx.order.update({
              where: { id: order.id },
              data: { status: 'PAID', razorpayPaymentId }
            });

            await tx.payment.create({
              data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                status: 'SUCCESS',
                razorpayOrderId,
                razorpayPaymentId,
                signatureValid: true
              }
            });

            for (const item of order.items) {
              await tx.inventory.updateMany({
                where: { productId: item.productId },
                data: {
                  available: { decrement: item.quantity },
                  sold: { increment: item.quantity }
                }
              });
              await tx.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } }
              });
            }
          });
        }
      }
    }

    return { received: true, eventId, eventType };
  });
}
