import { FastifyInstance } from 'fastify';
import { prisma } from '../prisma';
import { AuditService } from '../services/audit';
import { getAuthContext } from '../auth';
import { CreateOrderSchema } from '../validation';

export async function orderRoutes(app: FastifyInstance) {
  // Create Order Server-Side (Calculates authoritative prices and validates inventory)
  app.post('/api/orders', async (req, reply) => {
    const user = await getAuthContext(req, 'BUYER');
    const parseResult = CreateOrderSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: { code: 'INVALID_REQUEST', message: parseResult.error.errors.map(e => e.message).join(', ') }
      });
    }

    const { items, mandateId, idempotencyKey } = parseResult.data;

    // Idempotency check
    if (idempotencyKey) {
      const existing = await prisma.order.findUnique({
        where: { idempotencyKey },
        include: { items: { include: { product: true } } }
      });
      if (existing) {
        return reply.status(200).send({
          isDuplicate: true,
          id: existing.id,
          status: existing.status,
          amount: existing.amount,
          currency: existing.currency,
          createdAt: existing.createdAt.toISOString()
        });
      }
    }

    if (!items || items.length === 0) {
      return reply.status(400).send({
        error: { code: 'EMPTY_ORDER', message: 'Order must contain at least one item.' }
      });
    }

    // Look up all products from DB to determine authoritative prices and merchant
    let calculatedTotal = 0;
    let orderCurrency = 'INR';
    let merchantId = '';
    const validatedItems: { productId: string; quantity: number; unitPrice: number; totalPrice: number }[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { merchant: true, inventory: true }
      });

      if (!product || !product.active) {
        return reply.status(404).send({
          error: { code: 'PRODUCT_UNAVAILABLE', message: `Product '${item.productId}' is not available.` }
        });
      }

      // Check inventory availability
      const availableStock = product.inventory?.available ?? product.stock;
      if (availableStock < item.quantity) {
        return reply.status(400).send({
          error: {
            code: 'INSUFFICIENT_STOCK',
            message: `Insufficient stock for product '${product.name}'. Available: ${availableStock}, Requested: ${item.quantity}.`
          }
        });
      }

      if (!merchantId) {
        merchantId = product.merchantId;
        orderCurrency = product.currency;
      }

      const itemTotal = product.price * item.quantity;
      calculatedTotal += itemTotal;

      validatedItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price, // Server-calculated authoritative price
        totalPrice: itemTotal
      });
    }

    // Verify Mandate bounds if mandateId is attached
    if (mandateId) {
      const mandate = await prisma.mandate.findUnique({ where: { id: mandateId } });
      if (!mandate || mandate.status !== 'ACTIVE' || new Date(mandate.expiresAt).getTime() < Date.now()) {
        return reply.status(422).send({
          error: { code: 'INVALID_MANDATE', message: 'Attached mandate is invalid or expired.' }
        });
      }

      if (calculatedTotal > mandate.maxAmount) {
        return reply.status(422).send({
          error: {
            code: 'EXCEEDS_MANDATE',
            message: `Order amount ₹${calculatedTotal} exceeds mandate limit of ₹${mandate.maxAmount}.`
          }
        });
      }
    }

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        merchantId,
        mandateId: mandateId || null,
        amount: calculatedTotal,
        currency: orderCurrency,
        status: 'PENDING',
        idempotencyKey: idempotencyKey || null,
        items: {
          create: validatedItems
        }
      },
      include: { items: true, merchant: true }
    });

    await AuditService.recordEvent({
      eventType: 'ORDER_CREATED',
      actorType: 'BUYER',
      actorId: user.id,
      resourceType: 'ORDER',
      resourceId: order.id,
      decision: 'CREATED',
      metadata: {
        totalAmount: calculatedTotal,
        currency: orderCurrency,
        itemsCount: validatedItems.length,
        merchantId
      }
    });

    return {
      id: order.id,
      userId: order.userId,
      merchantId: order.merchantId,
      merchantName: order.merchant.name,
      mandateId: order.mandateId,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      items: order.items.map(i => ({
        id: i.id,
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice
      })),
      createdAt: order.createdAt.toISOString()
    };
  });

  // Get all orders (scoped by user context)
  app.get('/api/orders', async (req) => {
    const user = await getAuthContext(req, 'BUYER');
    const orders = await prisma.order.findMany({
      where: user.role === 'ADMIN' ? {} : { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: true } },
        merchant: true,
        transactionProof: true
      }
    });

    return orders.map(o => ({
      id: o.id,
      userId: o.userId,
      merchantId: o.merchantId,
      merchantName: o.merchant.name,
      mandateId: o.mandateId,
      amount: o.amount,
      currency: o.currency,
      status: o.status,
      razorpayOrderId: o.razorpayOrderId,
      razorpayPaymentId: o.razorpayPaymentId,
      failureReason: o.failureReason,
      createdAt: o.createdAt.toISOString(),
      items: o.items.map(i => ({
        id: i.id,
        productId: i.productId,
        productName: i.product.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice
      })),
      proof: o.transactionProof ? {
        id: o.transactionProof.id,
        decisionHash: o.transactionProof.decisionHash,
        transactionHash: o.transactionProof.transactionHash,
        verificationStatus: o.transactionProof.verificationStatus
      } : null
    }));
  });

  // Get specific order by ID
  app.get('/api/orders/:id', async (req, reply) => {
    const user = await getAuthContext(req, 'BUYER');
    const { id } = req.params as { id: string };
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        merchant: true,
        mandate: true,
        transactionProof: true,
        policyDecisions: true,
        riskChecks: true
      }
    });

    if (!order) {
      return reply.status(404).send({
        error: { code: 'ORDER_NOT_FOUND', message: `Order '${id}' not found.` }
      });
    }

    if (order.userId !== user.id && user.role !== 'ADMIN' && user.role !== 'MERCHANT') {
      return reply.status(403).send({
        error: { code: 'UNAUTHORIZED_ORDER_ACCESS', message: 'You do not have access to this order.' }
      });
    }

    return {
      id: order.id,
      userId: order.userId,
      merchantId: order.merchantId,
      merchantName: order.merchant.name,
      mandateId: order.mandateId,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      razorpayOrderId: order.razorpayOrderId,
      razorpayPaymentId: order.razorpayPaymentId,
      failureReason: order.failureReason,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map(i => ({
        id: i.id,
        productId: i.productId,
        productName: i.product.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice
      })),
      proof: order.transactionProof ? {
        id: order.transactionProof.id,
        decisionHash: order.transactionProof.decisionHash,
        transactionHash: order.transactionProof.transactionHash,
        proofPayload: JSON.parse(order.transactionProof.proofPayload || '{}'),
        verificationStatus: order.transactionProof.verificationStatus,
        verifiedAt: order.transactionProof.verifiedAt?.toISOString()
      } : null,
      policyDecisions: order.policyDecisions.map(p => ({
        decision: p.decision,
        reasonCodes: JSON.parse(p.reasonCodes || '[]'),
        rules: JSON.parse(p.rulesEvaluated || '[]')
      })),
      riskChecks: order.riskChecks.map(r => ({
        score: r.score,
        level: r.level,
        signals: JSON.parse(r.signals || '[]')
      }))
    };
  });
}
