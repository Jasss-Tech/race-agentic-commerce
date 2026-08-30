import { FastifyInstance } from 'fastify';
import { prisma } from '../prisma';
import { ProofEngine } from '@race/proof-engine';
import { AuditService } from '../services/audit';
import { VerifyProofSchema } from '../validation';

export async function proofRoutes(app: FastifyInstance) {
  // Get Transaction Proof by Order ID
  app.get('/api/proofs/:orderId', async (req, reply) => {
    const { orderId } = req.params as { orderId: string };
    const proof = await prisma.transactionProof.findUnique({
      where: { orderId }
    });

    if (!proof) {
      return reply.status(404).send({
        error: { code: 'PROOF_NOT_FOUND', message: 'Transaction proof not found for this order' }
      });
    }

    return {
      id: proof.id,
      orderId: proof.orderId,
      decisionHash: proof.decisionHash,
      transactionHash: proof.transactionHash,
      proofPayload: JSON.parse(proof.proofPayload || '{}'),
      verificationStatus: proof.verificationStatus,
      verifiedAt: proof.verifiedAt?.toISOString(),
      createdAt: proof.createdAt.toISOString()
    };
  });

  // Cryptographically Verify Proof against Audit Chain
  app.post('/api/proofs/:orderId/verify', async (req, reply) => {
    const { orderId } = req.params as { orderId: string };
    const parseResult = VerifyProofSchema.safeParse(req.body || {});
    const simulateTamper = parseResult.success ? parseResult.data.simulateTamper : false;

    const proof = await prisma.transactionProof.findUnique({
      where: { orderId }
    });

    if (!proof) {
      return reply.status(404).send({
        error: { code: 'PROOF_NOT_FOUND', message: 'Transaction proof not found' }
      });
    }

    const auditChain = await AuditService.getChain(200);
    const parsedProofPayload = JSON.parse(proof.proofPayload || '{}');

    const proofDto = {
      id: proof.id,
      orderId: proof.orderId,
      decisionHash: proof.decisionHash,
      transactionHash: proof.transactionHash,
      proofPayload: parsedProofPayload,
      verificationStatus: proof.verificationStatus as any,
      verifiedAt: proof.verifiedAt?.toISOString(),
      createdAt: proof.createdAt.toISOString()
    };

    // If tamper simulation requested, alter one audit block or payload
    let chainToVerify = auditChain;
    if (simulateTamper && chainToVerify.length > 1) {
      chainToVerify = auditChain.map((ev, idx) => {
        if (idx === 1) {
          return {
            ...ev,
            metadata: { ...ev.metadata, tamperedField: 'ILLEGAL_MODIFICATION_DETECTED' }
          };
        }
        return ev;
      });
    }

    const result = ProofEngine.verifyProof(proofDto, chainToVerify);

    await AuditService.recordEvent({
      eventType: 'PROOF_VERIFIED',
      actorType: 'SYSTEM',
      actorId: 'proof_verifier',
      resourceType: 'PROOF',
      resourceId: proof.id,
      decision: result.valid ? 'SUCCESS' : 'FAILURE',
      metadata: {
        orderId,
        decisionHashValid: result.decisionHashValid,
        transactionHashValid: result.transactionHashValid,
        chainIntegrityValid: result.chainIntegrityValid,
        simulateTamper
      }
    });

    return {
      verified: result.valid,
      orderId,
      decisionHash: proof.decisionHash,
      transactionHash: proof.transactionHash,
      checks: {
        decisionHashMatches: result.decisionHashValid,
        transactionHashMatches: result.transactionHashValid,
        auditHashChainValid: result.chainIntegrityValid,
        eventsVerifiedCount: chainToVerify.length
      },
      integrityStatus: result.valid ? 'VALID_UNMODIFIED' : 'TAMPER_DETECTED',
      details: result.details
    };
  });
}
