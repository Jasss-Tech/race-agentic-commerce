import { FastifyInstance } from 'fastify';
import { prisma } from '../prisma';
import { PolicyEngine } from '@race/policy-engine';
import { AuditService } from '../services/audit';
import { EvaluatePolicySchema } from '../validation';

export async function policyRoutes(app: FastifyInstance) {
  // Get active rules list
  app.get('/api/policies', async () => {
    return {
      engine: 'RACE-Deterministic-Policy-Engine/v1.0',
      status: 'OPERATIONAL',
      version: 1,
      activeRulesCount: 12,
      rules: [
        { id: 'RULE_001', name: 'BUDGET_CAP_ENFORCEMENT', description: 'Transaction amount must not exceed mandate max amount cap.' },
        { id: 'RULE_002', name: 'CURRENCY_MATCH', description: 'Currency must match mandate currency (e.g. INR).' },
        { id: 'RULE_003', name: 'MERCHANT_AUTHORIZATION', description: 'Merchant must be verified and agent-enabled.' },
        { id: 'RULE_004', name: 'PRODUCT_STATUS_ACTIVE', description: 'Product must be active and discoverable in live catalog.' },
        { id: 'RULE_005', name: 'AGENT_PURCHASABLE_FLAG', description: 'Merchant has explicitly permitted agentic checkout on SKU.' },
        { id: 'RULE_006', name: 'INVENTORY_AVAILABILITY', description: 'Live inventory stock must satisfy order quantity.' },
        { id: 'RULE_007', name: 'PRICE_DRIFT_INTEGRITY', description: 'Live catalog price must not exceed authorized/quoted price.' },
        { id: 'RULE_008', name: 'MANDATE_STATUS_ACTIVE', description: 'Mandate must be in ACTIVE status.' },
        { id: 'RULE_009', name: 'MANDATE_EXPIRY_CHECK', description: 'Current timestamp must not exceed mandate expiry.' },
        { id: 'RULE_010', name: 'ACTION_PERMISSION', description: 'Requested action must exist in mandate allowedActions.' },
        { id: 'RULE_011', name: 'CATEGORY_CONSTRAINT', description: 'Product category must match allowedCategories bound.' },
        { id: 'RULE_012', name: 'IDEMPOTENCY_PROTECTION', description: 'Duplicate payment attempts must be prevented.' }
      ]
    };
  });

  // Evaluate policy for a potential transaction
  app.post('/api/policies/evaluate', async (req, reply) => {
    const parseResult = EvaluatePolicySchema.safeParse(req.body);
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
      action = 'purchase',
      idempotencyKey
    } = parseResult.data;

    const mandate = await prisma.mandate.findUnique({ where: { id: mandateId } });
    if (!mandate) {
      return reply.status(404).send({
        error: { code: 'MANDATE_NOT_FOUND', message: 'Mandate not found.' }
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { merchant: true }
    });
    if (!product) {
      return reply.status(404).send({
        error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found.' }
      });
    }

    const requestedAmount = product.price * quantity;

    let isDuplicate = false;
    if (idempotencyKey) {
      const existing = await prisma.order.findUnique({ where: { idempotencyKey } });
      if (existing) isDuplicate = true;
    }

    const evaluation = PolicyEngine.evaluate({
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
      action,
      idempotencyKey,
      isDuplicateIdempotency: isDuplicate
    });

    const recorded = await prisma.policyDecision.create({
      data: {
        mandateId: mandate.id,
        decision: evaluation.decision,
        reasonCodes: JSON.stringify(evaluation.reasonCodes),
        rulesEvaluated: JSON.stringify(evaluation.rules)
      }
    });

    await AuditService.recordEvent({
      eventType: 'POLICY_EVALUATED',
      actorType: 'POLICY_ENGINE',
      actorId: 'deterministic_policy_engine',
      resourceType: 'MANDATE',
      resourceId: mandate.id,
      decision: evaluation.decision,
      reasonCodes: evaluation.reasonCodes,
      metadata: {
        decisionId: recorded.id,
        productId,
        requestedAmount,
        expectedPrice,
        currentCatalogPrice: product.price,
        rulesPassed: evaluation.rules.filter(r => r.passed).length,
        rulesTotal: evaluation.rules.length
      }
    });

    return {
      decisionId: recorded.id,
      ...evaluation
    };
  });

  // Get specific Policy Decision by ID
  app.get('/api/policies/decisions/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const decision = await prisma.policyDecision.findUnique({
      where: { id },
      include: { mandate: true, order: true }
    });

    if (!decision) {
      return reply.status(404).send({
        error: { code: 'DECISION_NOT_FOUND', message: `Policy decision '${id}' not found.` }
      });
    }

    return {
      id: decision.id,
      mandateId: decision.mandateId,
      orderId: decision.orderId,
      decision: decision.decision,
      reasonCodes: JSON.parse(decision.reasonCodes || '[]'),
      rules: JSON.parse(decision.rulesEvaluated || '[]'),
      createdAt: decision.createdAt.toISOString()
    };
  });
}
