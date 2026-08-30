import { FastifyInstance } from 'fastify';
import { prisma } from '../prisma';
import { AuditService } from '../services/audit';
import { getAuthContext } from '../auth';
import { CreateProductSchema, UpdateProductSchema } from '../validation';

export async function merchantRoutes(app: FastifyInstance) {
  // Merchant Dashboard Metrics
  app.get('/api/merchant/dashboard', async (req, reply) => {
    const user = await getAuthContext(req, 'MERCHANT');
    const merchantId = user.merchantId || 'merch_technova';

    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      include: {
        products: { include: { inventory: true } },
        orders: { include: { items: true } },
        growthRecommendations: true
      }
    });

    if (!merchant) {
      return reply.status(404).send({
        error: { code: 'MERCHANT_NOT_FOUND', message: 'Merchant profile not found.' }
      });
    }

    const paidOrders = merchant.orders.filter(o => o.status === 'PAID');
    const blockedOrders = merchant.orders.filter(o => o.status === 'BLOCKED' || o.status === 'PAYMENT_FAILED');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount, 0);
    const averageOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : null;
    const passport = JSON.parse(merchant.passportData || '{}');
    const agentInteractionsCount = await prisma.agentInteraction.count({});

    return {
      merchant: {
        id: merchant.id,
        name: merchant.name,
        slug: merchant.slug,
        description: merchant.description,
        currency: merchant.currency,
        trustScore: merchant.trustScore,
        aiReadinessScore: merchant.aiReadinessScore,
        agentEnabled: merchant.agentEnabled
      },
      kpis: {
        totalRevenue,
        totalOrders: paidOrders.length,
        averageOrderValue,
        aiReadinessScore: merchant.aiReadinessScore,
        agentInteractionsCount,
        activeProductsCount: merchant.products.filter(p => p.active).length,
        blockedTransactionsCount: blockedOrders.length,
        growthOpportunitiesCount: merchant.growthRecommendations.filter(r => r.status === 'PROPOSED').length
      },
      recentOrders: merchant.orders.slice(0, 5).map(o => ({
        id: o.id,
        amount: o.amount,
        currency: o.currency,
        status: o.status,
        createdAt: o.createdAt.toISOString()
      })),
      passport
    };
  });

  // Merchant Products list
  app.get('/api/merchant/products', async (req) => {
    const user = await getAuthContext(req, 'MERCHANT');
    const merchantId = user.merchantId || 'merch_technova';

    const products = await prisma.product.findMany({
      where: { merchantId },
      include: { inventory: true },
      orderBy: { createdAt: 'desc' }
    });

    return products.map(p => ({
      id: p.id,
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
      inventory: p.inventory ? {
        available: p.inventory.available,
        reserved: p.inventory.reserved,
        sold: p.inventory.sold
      } : undefined,
      updatedAt: p.updatedAt.toISOString()
    }));
  });

  // Create Product (Protected Merchant Context)
  app.post('/api/merchant/products', async (req, reply) => {
    const user = await getAuthContext(req, 'MERCHANT');
    const merchantId = user.merchantId || 'merch_technova';

    const parseResult = CreateProductSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: { code: 'INVALID_REQUEST', message: parseResult.error.errors.map(e => e.message).join(', ') }
      });
    }

    const {
      name,
      slug,
      description,
      category,
      price,
      currency = 'INR',
      stock,
      active = true,
      agentPurchasable = true,
      attributes = {},
      returnPolicy = '30-day money-back guarantee'
    } = parseResult.data;

    // Validate price and stock bounds
    if (price <= 0) {
      return reply.status(400).send({
        error: { code: 'INVALID_PRICE', message: 'Product price must be greater than 0.' }
      });
    }

    if (stock < 0) {
      return reply.status(400).send({
        error: { code: 'INVALID_STOCK', message: 'Product stock cannot be negative.' }
      });
    }

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const product = await prisma.product.create({
      data: {
        merchantId, // Always use authenticated merchant context
        name,
        slug: generatedSlug,
        description,
        category,
        price,
        currency,
        stock,
        active,
        agentPurchasable,
        attributes: JSON.stringify(attributes || {}),
        returnPolicy,
        inventory: {
          create: {
            available: stock,
            reserved: 0,
            sold: 0
          }
        }
      },
      include: { inventory: true }
    });

    await AuditService.recordEvent({
      eventType: 'PRODUCT_CREATED',
      actorType: 'MERCHANT',
      actorId: merchantId,
      resourceType: 'PRODUCT',
      resourceId: product.id,
      decision: 'CREATED',
      metadata: { name, price, stock, category, merchantId }
    });

    return {
      id: product.id,
      merchantId: product.merchantId,
      name: product.name,
      slug: product.slug,
      description: product.description,
      category: product.category,
      price: product.price,
      currency: product.currency,
      stock: product.stock,
      active: product.active,
      agentPurchasable: product.agentPurchasable,
      attributes: JSON.parse(product.attributes),
      returnPolicy: product.returnPolicy,
      inventory: product.inventory ? {
        available: product.inventory.available,
        reserved: product.inventory.reserved,
        sold: product.inventory.sold
      } : undefined
    };
  });

  // Update Product
  app.patch('/api/merchant/products/:id', async (req, reply) => {
    const user = await getAuthContext(req, 'MERCHANT');
    const merchantId = user.merchantId || 'merch_technova';
    const { id } = req.params as { id: string };

    const parseResult = UpdateProductSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: { code: 'INVALID_REQUEST', message: parseResult.error.errors.map(e => e.message).join(', ') }
      });
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return reply.status(404).send({
        error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found.' }
      });
    }

    if (product.merchantId !== merchantId && user.role !== 'ADMIN') {
      return reply.status(403).send({
        error: { code: 'UNAUTHORIZED_PRODUCT_ACCESS', message: 'Cannot modify products belonging to another merchant.' }
      });
    }

    const { price, stock, active, agentPurchasable, name, description } = parseResult.data;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(price !== undefined ? { price } : {}),
        ...(stock !== undefined ? { stock } : {}),
        ...(active !== undefined ? { active } : {}),
        ...(agentPurchasable !== undefined ? { agentPurchasable } : {}),
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {})
      }
    });

    if (stock !== undefined) {
      await prisma.inventory.updateMany({
        where: { productId: id },
        data: { available: stock }
      });
    }

    await AuditService.recordEvent({
      eventType: 'PRODUCT_UPDATED',
      actorType: 'MERCHANT',
      actorId: merchantId,
      resourceType: 'PRODUCT',
      resourceId: product.id,
      decision: 'SUCCESS',
      metadata: {
        oldPrice: product.price,
        newPrice: updated.price,
        oldStock: product.stock,
        newStock: updated.stock,
        active: updated.active,
        agentPurchasable: updated.agentPurchasable
      }
    });

    return {
      success: true,
      product: {
        id: updated.id,
        name: updated.name,
        price: updated.price,
        stock: updated.stock,
        active: updated.active,
        agentPurchasable: updated.agentPurchasable
      }
    };
  });

  // Merchant Passport
  app.get('/api/merchant/passport', async (req, reply) => {
    const user = await getAuthContext(req, 'MERCHANT');
    const merchantId = user.merchantId || 'merch_technova';

    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId }
    });

    if (!merchant) {
      return reply.status(404).send({
        error: { code: 'MERCHANT_NOT_FOUND', message: 'Merchant not found.' }
      });
    }

    const passport = JSON.parse(merchant.passportData || '{}');
    return {
      merchantId: merchant.id,
      merchantName: merchant.name,
      trustScore: merchant.trustScore,
      aiReadinessScore: merchant.aiReadinessScore,
      passport
    };
  });

  // Merchant Orders (Strictly scoped to authenticated merchant)
  app.get('/api/merchant/orders', async (req) => {
    const user = await getAuthContext(req, 'MERCHANT');
    const merchantId = user.merchantId || 'merch_technova';

    const orders = await prisma.order.findMany({
      where: { merchantId },
      include: {
        items: { include: { product: true } },
        user: true,
        transactionProof: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return orders.map(o => ({
      id: o.id,
      merchantId: o.merchantId,
      userId: o.userId,
      buyerName: o.user.name,
      buyerEmail: o.user.email,
      amount: o.amount,
      currency: o.currency,
      status: o.status,
      paymentStatus: o.status === 'PAID' ? 'CAPTURED' : o.status === 'PAYMENT_FAILED' ? 'DECLINED' : 'PENDING',
      razorpayOrderId: o.razorpayOrderId,
      razorpayPaymentId: o.razorpayPaymentId,
      createdAt: o.createdAt.toISOString(),
      items: o.items.map(i => ({
        id: i.id,
        productId: i.productId,
        productName: i.product.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice
      })),
      hasProof: !!o.transactionProof
    }));
  });
}
