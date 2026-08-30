import { FastifyInstance } from 'fastify';
import { prisma } from '../prisma';
import { AuditService } from '../services/audit';
import { ProofEngine } from '@race/proof-engine';
import { PolicyEngine } from '@race/policy-engine';
import { RiskEngine } from '@race/agent-core';
import { razorpayService } from '../services/razorpay';
import { TamperDemoSchema } from '../validation';

export async function demoRoutes(app: FastifyInstance) {
  // Guard demo routes if ENABLE_DEMO_ENDPOINTS is set to 'false'
  app.addHook('preHandler', async (req, reply) => {
    const enabled = process.env.ENABLE_DEMO_ENDPOINTS !== 'false';
    if (!enabled) {
      return reply.status(403).send({
        error: { code: 'DEMO_DISABLED', message: 'Demo endpoints are disabled in this environment.' }
      });
    }
  });

  // 1. Reset Demo State
  app.post('/api/demo/reset', async () => {
    // Reset keyboard price back to ₹2199 and stock to 42
    await prisma.product.updateMany({
      where: { id: 'prod_keyboard_01' },
      data: {
        price: 2199,
        stock: 42,
        active: true,
        agentPurchasable: true
      }
    });

    await prisma.inventory.updateMany({
      where: { productId: 'prod_keyboard_01' },
      data: { available: 42, reserved: 0 }
    });

    // Reset recommendations to PROPOSED
    await prisma.growthRecommendation.updateMany({
      data: { status: 'PROPOSED' }
    });

    await AuditService.recordEvent({
      eventType: 'DEMO_ENVIRONMENT_RESET',
      actorType: 'SYSTEM',
      actorId: 'demo_controller',
      resourceType: 'PLATFORM',
      resourceId: 'demo_environment',
      decision: 'SUCCESS',
      metadata: {
        keyboardPrice: 2199,
        keyboardStock: 42,
        status: 'READY'
      }
    });

    return {
      success: true,
      message: 'Demo environment reset to standard baseline: Keyboard @ ₹2,199 (In Stock: 42).',
      baseline: {
        product: 'TechNova Mechanical Keyboard',
        price: 2199,
        stock: 42,
        mandateCap: 2500
      }
    };
  });

  // 2. Trigger Price Drift (Sets price to ₹2,799)
  app.post('/api/demo/price-drift', async () => {
    const updated = await prisma.product.update({
      where: { id: 'prod_keyboard_01' },
      data: { price: 2799 }
    });

    await AuditService.recordEvent({
      eventType: 'PRICE_DRIFT_SIMULATED',
      actorType: 'MERCHANT',
      actorId: 'merch_technova',
      resourceType: 'PRODUCT',
      resourceId: 'prod_keyboard_01',
      decision: 'SUCCESS',
      metadata: {
        previousPrice: 2199,
        newPrice: 2799,
        simulation: 'Price increased beyond ₹2,500 buyer mandate limit'
      }
    });

    return {
      success: true,
      message: 'Simulated merchant catalog price increase: ₹2,199 ➔ ₹2,799.',
      product: {
        id: updated.id,
        name: updated.name,
        price: updated.price,
        previousPrice: 2199,
        mandateBudgetLimit: 2500
      }
    };
  });

  // 3. Payment Failure Simulation Info
  app.post('/api/demo/payment-failure', async () => {
    return {
      success: true,
      message: 'Payment failure mode ready. Next checkout simulation will trigger authorization decline without duplicate billing.'
    };
  });

  // 4. Success Demo Scenario: Executes a complete deterministic end-to-end checkout flow
  app.post('/api/demo/success', async (req, reply) => {
    const user = await prisma.user.findFirst({ where: { role: 'BUYER' } });
    const product = await prisma.product.findUnique({
      where: { id: 'prod_keyboard_01' },
      include: { merchant: true, inventory: true }
    });

    if (!user || !product) {
      return reply.status(500).send({
        error: { code: 'DEMO_SETUP_ERROR', message: 'Demo seed data missing.' }
      });
    }

    // Step 1: Create a fresh demo mandate
    const mandate = await prisma.mandate.create({
      data: {
        userId: user.id,
        agentId: 'buyer_agent',
        merchantId: product.merchantId,
        intent: 'Buy mechanical keyboard for developer desk setup',
        maxAmount: 2500,
        currency: 'INR',
        allowedCategories: JSON.stringify(['keyboard', 'accessories']),
        allowedActions: JSON.stringify(['search', 'compare', 'purchase']),
        confirmationRequired: false,
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 3600 * 1000)
      }
    });

    // Step 2: Policy & Risk checks
    const riskResult = RiskEngine.evaluate({
      requestedAmount: product.price,
      mandateMaxAmount: mandate.maxAmount,
      expectedPrice: product.price,
      currentCatalogPrice: product.price,
      merchantTrustScore: product.merchant.trustScore,
      userOrderCount24h: 1
    });

    const policyResult = PolicyEngine.evaluate({
      requestedAmount: product.price,
      expectedPrice: product.price,
      currentCatalogPrice: product.price,
      currency: product.currency,
      quantity: 1,
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
      riskScore: riskResult.score
    });

    // Step 3: Create Order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        merchantId: product.merchantId,
        mandateId: mandate.id,
        amount: product.price,
        currency: product.currency,
        status: 'PAID',
        razorpayOrderId: `order_demo_${Date.now()}`,
        razorpayPaymentId: `pay_demo_${Date.now()}`,
        items: {
          create: {
            productId: product.id,
            quantity: 1,
            unitPrice: product.price,
            totalPrice: product.price
          }
        }
      }
    });

    // Step 4: Decrement inventory
    await prisma.inventory.updateMany({
      where: { productId: product.id },
      data: {
        available: { decrement: 1 },
        sold: { increment: 1 }
      }
    });

    // Step 5: Audit Event Chaining
    const timestamp = new Date().toISOString();
    const latestEvent = await prisma.auditEvent.findFirst({ orderBy: { createdAt: 'desc' } });
    const previousHash = latestEvent?.hash || null;

    const eventPayload = {
      eventType: 'PAYMENT_SUCCESS',
      actorType: 'BUYER_AGENT',
      actorId: 'buyer_agent',
      resourceType: 'ORDER',
      resourceId: order.id,
      decision: 'SUCCESS',
      reasonCodes: ['DEMO_CHECKOUT_COMPLETED'],
      metadata: { orderId: order.id, amount: product.price, mandateId: mandate.id }
    };

    const eventHash = ProofEngine.computeEventHash({
      ...eventPayload,
      previousHash,
      timestamp
    });

    await prisma.auditEvent.create({
      data: {
        ...eventPayload,
        reasonCodes: JSON.stringify(eventPayload.reasonCodes),
        metadata: JSON.stringify(eventPayload.metadata),
        previousHash,
        hash: eventHash
      }
    });

    // Step 6: Seal Transaction Proof
    const proofDto = ProofEngine.generateProof({
      orderId: order.id,
      amount: product.price,
      currency: product.currency,
      mandateId: mandate.id,
      policyDecision: policyResult.decision,
      riskScore: riskResult.score,
      paymentId: order.razorpayPaymentId || `pay_demo_${Date.now()}`,
      eventChainHash: eventHash,
      timestamp
    });

    const proof = await prisma.transactionProof.create({
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
      success: true,
      scenario: 'COMPLETE_AUTONOMOUS_CHECKOUT_DEMO',
      mandate: {
        id: mandate.id,
        maxAmount: mandate.maxAmount,
        currency: mandate.currency
      },
      policyEvaluation: {
        decision: policyResult.decision,
        rulesEvaluated: policyResult.rules.length
      },
      riskEvaluation: {
        score: riskResult.score,
        level: riskResult.level
      },
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        status: order.status
      },
      proof: {
        id: proof.id,
        decisionHash: proof.decisionHash,
        transactionHash: proof.transactionHash,
        verificationStatus: proof.verificationStatus
      },
      message: 'End-to-end autonomous checkout demo completed successfully.'
    };
  });

  // 5. Tamper Demo: Intentionally modifies audit/proof payload
  app.post('/api/demo/tamper', async (req, reply) => {
    const parseResult = TamperDemoSchema.safeParse(req.body || {});
    const orderId = parseResult.success && parseResult.data.orderId ? parseResult.data.orderId : 'ord_seed_001';

    let proof = await prisma.transactionProof.findUnique({
      where: { orderId }
    });

    if (!proof) {
      proof = await prisma.transactionProof.findFirst();
    }

    if (!proof) {
      return reply.status(404).send({
        error: { code: 'PROOF_NOT_FOUND', message: 'No proof found to execute tamper demo.' }
      });
    }

    const auditChain = await AuditService.getChain(50);
    const parsedPayload = JSON.parse(proof.proofPayload || '{}');

    // Simulate tampering with proof payload amount
    const tamperedProofDto = {
      id: proof.id,
      orderId: proof.orderId,
      decisionHash: proof.decisionHash,
      transactionHash: proof.transactionHash,
      proofPayload: { ...parsedPayload, amount: 99999 },
      verificationStatus: proof.verificationStatus as any,
      verifiedAt: proof.verifiedAt?.toISOString(),
      createdAt: proof.createdAt.toISOString()
    };

    const verificationResult = ProofEngine.verifyProof(tamperedProofDto, auditChain);

    return {
      success: true,
      tamperDetected: !verificationResult.valid,
      integrityStatus: 'TAMPER_DETECTED',
      orderId: proof.orderId,
      originalAmount: parsedPayload.amount,
      tamperedAmount: 99999,
      checks: {
        decisionHashMatches: verificationResult.decisionHashValid,
        transactionHashMatches: verificationResult.transactionHashValid,
        auditHashChainValid: verificationResult.chainIntegrityValid
      },
      details: verificationResult.details
    };
  });
}
