import { FastifyInstance } from 'fastify';
import { prisma } from '../prisma';
import { ProofEngine } from '@race/proof-engine';
import { AuditService } from '../services/audit';
import { VerifyProofSchema } from '../validation';

export async function proofRoutes(app: FastifyInstance) {
  // Get Transaction Proof for a Product ID (if purchased in an order)
  app.get('/api/proofs/product/:productId', async (req, reply) => {
    const { productId } = req.params as { productId: string };

    const order = await prisma.order.findFirst({
      where: {
        items: {
          some: { productId }
        },
        status: 'PAID'
      },
      include: {
        transactionProof: true
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!order || !order.transactionProof) {
      return {
        hasProof: false,
        productId,
        message: 'No purchase proof exists for this product yet. The purchase decision will be cryptographically sealed in the SHA-256 audit chain upon checkout.'
      };
    }

    const proof = order.transactionProof;
    const proofPayload = JSON.parse(proof.proofPayload || '{}');
    const auditChain = await AuditService.getChain(50);
    const relatedAudit = auditChain.find(a => a.resourceId === proof.id || a.metadata?.orderId === order.id);

    return {
      hasProof: true,
      productId,
      orderId: order.id,
      proof: {
        id: proof.id,
        orderId: proof.orderId,
        decisionHash: proof.decisionHash,
        transactionHash: proof.transactionHash,
        proofPayload,
        verificationStatus: proof.verificationStatus,
        blockIndex: relatedAudit ? auditChain.indexOf(relatedAudit) : auditChain.length,
        previousHash: relatedAudit?.previousHash || (auditChain.length > 1 ? auditChain[auditChain.length - 2]?.hash : '0'.repeat(64)),
        currentHash: relatedAudit?.hash || proof.transactionHash,
        verifiedAt: proof.verifiedAt?.toISOString() || new Date().toISOString(),
        createdAt: proof.createdAt.toISOString()
      }
    };
  });

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

    const auditChain = await AuditService.getChain(50);
    const relatedAudit = auditChain.find(a => a.resourceId === proof.id || a.metadata?.orderId === orderId);

    return {
      id: proof.id,
      orderId: proof.orderId,
      decisionHash: proof.decisionHash,
      transactionHash: proof.transactionHash,
      proofPayload: JSON.parse(proof.proofPayload || '{}'),
      verificationStatus: proof.verificationStatus,
      blockIndex: relatedAudit ? auditChain.indexOf(relatedAudit) : auditChain.length,
      previousHash: relatedAudit?.previousHash || (auditChain.length > 1 ? auditChain[auditChain.length - 2]?.hash : '0'.repeat(64)),
      currentHash: relatedAudit?.hash || proof.transactionHash,
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

    const relatedAudit = chainToVerify.find(a => a.resourceId === proof.id || a.metadata?.orderId === orderId);
    const blockIndex = relatedAudit ? chainToVerify.indexOf(relatedAudit) : Math.max(0, chainToVerify.length - 1);

    return {
      valid: result.valid,
      verified: result.valid,
      orderId,
      decisionHash: proof.decisionHash,
      transactionHash: proof.transactionHash,
      decisionHashValid: result.decisionHashValid,
      transactionHashValid: result.transactionHashValid,
      contentHashValid: result.chainIntegrityValid,
      chainValid: result.chainIntegrityValid,
      previousBlockLinkValid: result.chainIntegrityValid,
      sha256Valid: result.valid,
      blockIndex,
      previousHash: relatedAudit?.previousHash || (chainToVerify.length > 1 ? chainToVerify[chainToVerify.length - 2]?.hash : '0'.repeat(64)),
      currentHash: relatedAudit?.hash || proof.transactionHash,
      verifiedAt: new Date().toISOString(),
      checks: {
        decisionHashMatches: result.decisionHashValid,
        transactionHashMatches: result.transactionHashValid,
        contentHashValid: result.chainIntegrityValid,
        auditHashChainValid: result.chainIntegrityValid,
        sha256Valid: result.valid,
        eventsVerifiedCount: chainToVerify.length
      },
      integrityStatus: result.valid ? 'VALID' : 'COMPROMISED',
      message: result.valid
        ? 'Cryptographic proof verified successfully.'
        : `Cryptographic integrity failure: ${result.details}`,
      details: result.details
    };
  });
}
