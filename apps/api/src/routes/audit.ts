import { FastifyInstance } from 'fastify';
import { prisma } from '../prisma';
import { AuditService } from '../services/audit';
import { ProofEngine } from '@race/proof-engine';

export async function auditRoutes(app: FastifyInstance) {
  // Get all audit events in sequential hash chain
  app.get('/api/audit', async () => {
    const chain = await AuditService.getChain(200);
    const verification = ProofEngine.verifyAuditChain(chain);

    return {
      eventsCount: chain.length,
      chainIntegrity: verification.chainIntegrity,
      isValid: verification.valid,
      details: verification.details,
      events: chain
    };
  });

  // Get audit events for specific resource
  app.get('/api/audit/:resourceId', async (req) => {
    const { resourceId } = req.params as { resourceId: string };
    const events = await prisma.auditEvent.findMany({
      where: {
        OR: [
          { resourceId },
          { metadata: { contains: resourceId } }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    return events.map(e => ({
      id: e.id,
      eventType: e.eventType,
      actorType: e.actorType,
      actorId: e.actorId,
      resourceType: e.resourceType,
      resourceId: e.resourceId,
      decision: e.decision,
      reasonCodes: e.reasonCodes ? JSON.parse(e.reasonCodes) : [],
      metadata: e.metadata ? JSON.parse(e.metadata) : {},
      previousHash: e.previousHash,
      hash: e.hash,
      createdAt: e.createdAt.toISOString()
    }));
  });
}
