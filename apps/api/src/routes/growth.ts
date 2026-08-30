import { FastifyInstance } from 'fastify';
import { prisma } from '../prisma';
import { AuditService } from '../services/audit';
import { getAuthContext } from '../auth';
import { GrowthAgent } from '@race/agent-core';
import { ProductDto } from '@race/types';
import { GrowthAnalyzeSchema } from '../validation';

export async function growthRoutes(app: FastifyInstance) {
  // Get Growth Recommendations
  app.get('/api/growth/recommendations', async (req) => {
    const user = await getAuthContext(req, 'MERCHANT');
    const merchantId = user.merchantId || 'merch_technova';

    const recs = await prisma.growthRecommendation.findMany({
      where: { merchantId },
      include: { product: true },
      orderBy: { createdAt: 'desc' }
    });

    return recs.map(r => ({
      id: r.id,
      merchantId: r.merchantId,
      productId: r.productId,
      productName: r.product?.name || 'Workspace Setup',
      type: r.type,
      recommendation: r.recommendation,
      reason: r.reason,
      confidence: r.confidence,
      expectedImpact: JSON.parse(r.expectedImpact || '{}'),
      status: r.status,
      createdAt: r.createdAt.toISOString()
    }));
  });

  // Run Growth Agent Analysis against real database orders
  app.post('/api/growth/analyze', async (req, reply) => {
    const user = await getAuthContext(req, 'MERCHANT');
    const merchantId = user.merchantId || 'merch_technova';

    const parseResult = GrowthAnalyzeSchema.safeParse(req.body || {});

    // 1. Fetch live products
    const products = await prisma.product.findMany({
      where: { merchantId, active: true }
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
      returnPolicy: p.returnPolicy
    }));

    // 2. Fetch historical orders with line items
    const orders = await prisma.order.findMany({
      where: { merchantId },
      include: { items: true }
    });

    const paidOrders = orders.filter(o => o.status === 'PAID');

    // If no paid orders exist, explicitly return INSUFFICIENT_DATA without fabricating metrics
    if (paidOrders.length === 0) {
      return {
        success: true,
        status: 'INSUFFICIENT_DATA',
        analyzedOrdersCount: 0,
        recommendationsCount: 0,
        recommendations: [],
        message: 'Insufficient transaction history to generate high-confidence growth recommendations.'
      };
    }

    const orderSummaries = orders.map(o => ({
      id: o.id,
      amount: o.amount,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
      items: o.items.map(i => ({
        id: i.id,
        orderId: i.orderId,
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice
      }))
    }));

    // 3. Run Growth Agent
    const opportunities = GrowthAgent.analyzeOpportunities(merchantId, productDtos, orderSummaries);

    // 4. Persist newly discovered recommendations
    for (const opp of opportunities) {
      const existing = await prisma.growthRecommendation.findFirst({
        where: { merchantId, type: opp.type, productId: opp.productId }
      });

      if (!existing) {
        await prisma.growthRecommendation.create({
          data: {
            merchantId: opp.merchantId,
            productId: opp.productId,
            type: opp.type,
            recommendation: opp.recommendation,
            reason: opp.reason,
            confidence: opp.confidence,
            expectedImpact: JSON.stringify(opp.expectedImpact),
            status: 'PROPOSED'
          }
        });
      }
    }

    await AuditService.recordEvent({
      eventType: 'GROWTH_ANALYSIS_EXECUTED',
      actorType: 'GROWTH_AGENT',
      actorId: 'growth_agent',
      resourceType: 'CAMPAIGN',
      resourceId: merchantId,
      decision: 'SUCCESS',
      metadata: {
        analyzedOrdersCount: orderSummaries.length,
        recommendationsGenerated: opportunities.length
      }
    });

    return {
      success: true,
      status: opportunities.length > 0 ? 'RECOMMENDATIONS_GENERATED' : 'INSUFFICIENT_DATA',
      analyzedOrdersCount: orderSummaries.length,
      recommendationsCount: opportunities.length,
      recommendations: opportunities
    };
  });

  // Merchant Approve Recommendation
  app.post('/api/growth/recommendations/:id/approve', async (req, reply) => {
    const user = await getAuthContext(req, 'MERCHANT');
    const { id } = req.params as { id: string };
    const rec = await prisma.growthRecommendation.findUnique({ where: { id } });

    if (!rec) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'Recommendation not found' }
      });
    }

    if (rec.merchantId !== (user.merchantId || 'merch_technova') && user.role !== 'ADMIN') {
      return reply.status(403).send({
        error: { code: 'UNAUTHORIZED_ACCESS', message: 'Cannot approve recommendations for another merchant.' }
      });
    }

    const updated = await prisma.growthRecommendation.update({
      where: { id },
      data: { status: 'APPROVED' }
    });

    // Create Campaign
    await prisma.campaign.create({
      data: {
        merchantId: rec.merchantId,
        title: `Agent Promotion: ${rec.type}`,
        description: rec.recommendation,
        discountPercent: 15.0,
        targetCategory: 'keyboard',
        status: 'ACTIVE'
      }
    });

    await AuditService.recordEvent({
      eventType: 'GROWTH_RECOMMENDATION_APPROVED',
      actorType: 'MERCHANT',
      actorId: rec.merchantId,
      resourceType: 'CAMPAIGN',
      resourceId: rec.id,
      decision: 'ALLOW',
      metadata: {
        type: rec.type,
        recommendation: rec.recommendation
      }
    });

    return {
      success: true,
      recommendation: updated,
      message: 'Growth opportunity approved by merchant. Agent commerce promotion activated.'
    };
  });

  // Merchant Reject Recommendation
  app.post('/api/growth/recommendations/:id/reject', async (req, reply) => {
    const user = await getAuthContext(req, 'MERCHANT');
    const { id } = req.params as { id: string };
    const rec = await prisma.growthRecommendation.findUnique({ where: { id } });

    if (!rec) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'Recommendation not found' }
      });
    }

    if (rec.merchantId !== (user.merchantId || 'merch_technova') && user.role !== 'ADMIN') {
      return reply.status(403).send({
        error: { code: 'UNAUTHORIZED_ACCESS', message: 'Cannot reject recommendations for another merchant.' }
      });
    }

    const updated = await prisma.growthRecommendation.update({
      where: { id },
      data: { status: 'REJECTED' }
    });

    await AuditService.recordEvent({
      eventType: 'GROWTH_RECOMMENDATION_REJECTED',
      actorType: 'MERCHANT',
      actorId: rec.merchantId,
      resourceType: 'CAMPAIGN',
      resourceId: rec.id,
      decision: 'BLOCK',
      metadata: { reason: 'Merchant dismissed recommendation' }
    });

    return { success: true, recommendation: updated };
  });
}
