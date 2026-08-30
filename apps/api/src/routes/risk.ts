import { FastifyInstance } from 'fastify';
import { prisma } from '../prisma';
import { RiskEngine } from '@race/agent-core';
import { AuditService } from '../services/audit';
import { EvaluateRiskSchema } from '../validation';

export async function riskRoutes(app: FastifyInstance) {
  // Evaluate Risk
  app.post('/api/risk/evaluate', async (req, reply) => {
    const parseResult = EvaluateRiskSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: { code: 'INVALID_REQUEST', message: parseResult.error.errors.map(e => e.message).join(', ') }
      });
    }

    const {
      mandateId,
      productId,
      quantity = 1,
      expectedPrice
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

    // Check user order velocity in last 24h
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

    const recorded = await prisma.riskCheck.create({
      data: {
        mandateId: mandate.id,
        score: riskResult.score,
        level: riskResult.level,
        signals: JSON.stringify(riskResult.signals)
      }
    });

    await AuditService.recordEvent({
      eventType: 'RISK_EVALUATED',
      actorType: 'RISK_ENGINE',
      actorId: 'explainable_risk_engine',
      resourceType: 'MANDATE',
      resourceId: mandate.id,
      decision: riskResult.level === 'HIGH' ? 'BLOCK' : 'ALLOW',
      metadata: {
        riskCheckId: recorded.id,
        score: riskResult.score,
        level: riskResult.level,
        signals: riskResult.signals
      }
    });

    return {
      riskCheckId: recorded.id,
      ...riskResult
    };
  });

  // Get Risk Check record by ID
  app.get('/api/risk/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const check = await prisma.riskCheck.findUnique({
      where: { id },
      include: { mandate: true, order: true }
    });

    if (!check) {
      return reply.status(404).send({
        error: { code: 'RISK_CHECK_NOT_FOUND', message: `Risk check '${id}' not found.` }
      });
    }

    return {
      id: check.id,
      mandateId: check.mandateId,
      orderId: check.orderId,
      score: check.score,
      level: check.level,
      signals: JSON.parse(check.signals || '[]'),
      createdAt: check.createdAt.toISOString()
    };
  });
}
