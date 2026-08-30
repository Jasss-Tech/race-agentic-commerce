import { FastifyInstance } from 'fastify';
import { prisma } from '../prisma';
import { AuditService } from '../services/audit';
import { getAuthContext } from '../auth';
import { CreateMandateSchema, ValidateMandateSchema } from '../validation';

export async function mandateRoutes(app: FastifyInstance) {
  // Create Intent Mandate
  app.post('/api/mandates', async (req, reply) => {
    const user = await getAuthContext(req, 'BUYER');
    const parseResult = CreateMandateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: { code: 'INVALID_REQUEST', message: parseResult.error.errors.map(e => e.message).join(', ') }
      });
    }

    const {
      agentId,
      merchantId,
      intent,
      maxAmount,
      currency,
      allowedCategories,
      allowedActions,
      confirmationRequired,
      expiresInMinutes
    } = parseResult.data;

    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    const mandate = await prisma.mandate.create({
      data: {
        userId: user.id, // Always use authenticated user ID
        agentId,
        merchantId: merchantId || null,
        intent,
        maxAmount,
        currency,
        allowedCategories: JSON.stringify(allowedCategories),
        allowedActions: JSON.stringify(allowedActions),
        confirmationRequired,
        status: 'ACTIVE',
        expiresAt
      }
    });

    await AuditService.recordEvent({
      eventType: 'MANDATE_CREATED',
      actorType: 'BUYER',
      actorId: user.id,
      resourceType: 'MANDATE',
      resourceId: mandate.id,
      decision: 'CREATED',
      metadata: {
        maxAmount,
        currency,
        allowedCategories,
        allowedActions,
        expiresAt: expiresAt.toISOString()
      }
    });

    return {
      id: mandate.id,
      userId: mandate.userId,
      agentId: mandate.agentId,
      merchantId: mandate.merchantId,
      intent: mandate.intent,
      maxAmount: mandate.maxAmount,
      currency: mandate.currency,
      allowedCategories: JSON.parse(mandate.allowedCategories),
      allowedActions: JSON.parse(mandate.allowedActions),
      confirmationRequired: mandate.confirmationRequired,
      status: mandate.status,
      expiresAt: mandate.expiresAt.toISOString(),
      createdAt: mandate.createdAt.toISOString()
    };
  });

  // Get Mandate by ID
  app.get('/api/mandates/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const mandate = await prisma.mandate.findUnique({
      where: { id },
      include: { user: true, orders: true }
    });

    if (!mandate) {
      return reply.status(404).send({
        error: { code: 'MANDATE_NOT_FOUND', message: `Mandate with ID '${id}' not found.` }
      });
    }

    const isExpired = new Date(mandate.expiresAt).getTime() < Date.now();
    const effectiveStatus = isExpired && mandate.status === 'ACTIVE' ? 'EXPIRED' : mandate.status;

    return {
      id: mandate.id,
      userId: mandate.userId,
      agentId: mandate.agentId,
      merchantId: mandate.merchantId,
      intent: mandate.intent,
      maxAmount: mandate.maxAmount,
      currency: mandate.currency,
      allowedCategories: JSON.parse(mandate.allowedCategories),
      allowedActions: JSON.parse(mandate.allowedActions),
      confirmationRequired: mandate.confirmationRequired,
      status: effectiveStatus,
      isExpired,
      expiresAt: mandate.expiresAt.toISOString(),
      createdAt: mandate.createdAt.toISOString()
    };
  });

  // Dedicated Mandate Validation Endpoint
  app.post('/api/mandates/:id/validate', async (req, reply) => {
    const user = await getAuthContext(req, 'BUYER');
    const { id } = req.params as { id: string };
    const parseResult = ValidateMandateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: { code: 'INVALID_REQUEST', message: parseResult.error.errors.map(e => e.message).join(', ') }
      });
    }

    const { requestedAmount, category, action, currency, merchantId } = parseResult.data;

    const mandate = await prisma.mandate.findUnique({ where: { id } });
    if (!mandate) {
      return reply.status(404).send({
        error: { code: 'MANDATE_NOT_FOUND', message: 'Mandate not found.' }
      });
    }

    // Authenticated user ownership check
    const ownership = (mandate.userId === user.id || user.role === 'ADMIN');
    if (!ownership) {
      return reply.status(403).send({
        error: { code: 'UNAUTHORIZED_MANDATE_ACCESS', message: 'You do not have permission to validate this mandate.' }
      });
    }

    const isExpired = new Date(mandate.expiresAt).getTime() < Date.now();
    const allowedCategories: string[] = JSON.parse(mandate.allowedCategories || '[]');
    const allowedActions: string[] = JSON.parse(mandate.allowedActions || '[]');

    const checks = {
      status: mandate.status === 'ACTIVE',
      expiry: !isExpired,
      currency: currency !== undefined ? mandate.currency.toUpperCase() === currency.toUpperCase() : true,
      merchant: (mandate.merchantId && merchantId) ? mandate.merchantId === merchantId : true,
      amount: requestedAmount !== undefined ? requestedAmount <= mandate.maxAmount : true,
      category: category !== undefined ? (allowedCategories.length === 0 || allowedCategories.some(c => category.toLowerCase().includes(c.toLowerCase()))) : true,
      action: action !== undefined ? allowedActions.includes(action) : true
    };

    const valid = Object.values(checks).every(Boolean);

    await AuditService.recordEvent({
      eventType: 'MANDATE_VALIDATED',
      actorType: 'SYSTEM',
      actorId: 'mandate_validator',
      resourceType: 'MANDATE',
      resourceId: mandate.id,
      decision: valid ? 'ALLOW' : 'BLOCK',
      metadata: { checks, requestedAmount, category, action, currency, merchantId }
    });

    return {
      valid,
      mandateId: mandate.id,
      status: isExpired ? 'EXPIRED' : mandate.status,
      maxAmount: mandate.maxAmount,
      currency: mandate.currency,
      checks,
      reason: valid ? 'Mandate bounds satisfied' : 'One or more mandate bounds failed verification'
    };
  });

  // Revoke Mandate
  app.post('/api/mandates/:id/revoke', async (req, reply) => {
    const user = await getAuthContext(req, 'BUYER');
    const { id } = req.params as { id: string };
    const mandate = await prisma.mandate.findUnique({ where: { id } });
    if (!mandate) {
      return reply.status(404).send({
        error: { code: 'MANDATE_NOT_FOUND', message: 'Mandate not found.' }
      });
    }

    if (mandate.userId !== user.id && user.role !== 'ADMIN') {
      return reply.status(403).send({
        error: { code: 'UNAUTHORIZED_MANDATE_ACCESS', message: 'Cannot revoke mandate belonging to another user.' }
      });
    }

    const updated = await prisma.mandate.update({
      where: { id },
      data: { status: 'REVOKED' }
    });

    await AuditService.recordEvent({
      eventType: 'MANDATE_REVOKED',
      actorType: 'BUYER',
      actorId: user.id,
      resourceType: 'MANDATE',
      resourceId: mandate.id,
      decision: 'ALLOW',
      metadata: { reason: 'User revoked mandate authority' }
    });

    return {
      success: true,
      mandate: {
        id: updated.id,
        status: updated.status,
        revokedAt: new Date().toISOString()
      }
    };
  });
}
