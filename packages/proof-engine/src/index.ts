import * as crypto from 'crypto';

import { TransactionProofDto, AuditEventDto } from '@race/types';

export class ProofEngine {
  /**
   * Deterministically canonicalizes JSON by sorting keys recursively
   */
  public static canonicalize(obj: unknown): string {
    if (obj === null || typeof obj !== 'object') {
      return JSON.stringify(obj);
    }

    if (Array.isArray(obj)) {
      return (
        '[' +
        obj.map((item) => this.canonicalize(item)).join(',') +
        ']'
      );
    }

    const record = obj as Record<string, unknown>;
    const sortedKeys = Object.keys(record).sort();

    return (
      '{' +
      sortedKeys
        .map(
          (key) =>
            `${JSON.stringify(key)}:${this.canonicalize(record[key])}`
        )
        .join(',') +
      '}'
    );
  }

  /**
   * Generates a SHA-256 hash of canonicalized data
   */
  public static sha256(data: unknown): string {
    const canonical =
      typeof data === 'string'
        ? data
        : this.canonicalize(data);

    return crypto
      .createHash('sha256')
      .update(canonical)
      .digest('hex');
  }

  /**
   * Computes deterministic event hash for audit chaining.
   * Normalizes the payload to the canonical shape so that
   * the hash is consistent regardless of which optional
   * fields the caller supplies.
   */
  public static computeEventHash(payload: {
    eventType: string;
    actorType: string;
    actorId: string;
    resourceType: string;
    resourceId: string;
    decision?: string | null;
    reasonCodes?: string[] | string;
    metadata?: Record<string, unknown> | string;
    previousHash?: string | null;
    timestamp?: string;
  }): string {
    let reasonCodes = payload.reasonCodes ?? [];
    if (typeof reasonCodes === 'string') {
      try {
        reasonCodes = JSON.parse(reasonCodes);
      } catch {
        reasonCodes = [];
      }
    }

    let metadata = payload.metadata ?? {};
    if (typeof metadata === 'string') {
      try {
        metadata = JSON.parse(metadata);
      } catch {
        metadata = {};
      }
    }

    const normalized = {
      eventType: payload.eventType,
      actorType: payload.actorType,
      actorId: payload.actorId,
      resourceType: payload.resourceType,
      resourceId: payload.resourceId,
      decision: payload.decision ?? null,
      reasonCodes,
      metadata,
      previousHash: payload.previousHash || '0'.repeat(64)
    };
    return this.sha256(normalized);
  }

  /**
   * Generates a tamper-evident decision hash
   */
  public static generateDecisionHash(payload: {
    mandateId: string;
    amount: number;
    currency: string;
    decision: string;
    reasonCodes: string[];
    timestamp: string;
  }): string {
    return this.sha256(payload);
  }

  /**
   * Generates transaction hash
   */
  public static generateTransactionHash(payload: {
    orderId: string;
    amount: number;
    currency: string;
    razorpayOrderId?: string | null;
    razorpayPaymentId?: string | null;
    status: string;
    timestamp: string;
  }): string {
    return this.sha256(payload);
  }

  /**
   * Creates a sealed Transaction Proof object
   */
  public static generateProof(params: {
    orderId: string;
    amount: number;
    currency: string;
    mandateId: string;
    policyDecision: string;
    riskScore: number;
    paymentId: string;
    eventChainHash: string;
    timestamp: string;
  }): TransactionProofDto {
    const decisionHash = this.generateDecisionHash({
      mandateId: params.mandateId,
      amount: params.amount,
      currency: params.currency,
      decision: params.policyDecision,
      reasonCodes: [],
      timestamp: params.timestamp
    });

    const transactionHash = this.generateTransactionHash({
      orderId: params.orderId,
      amount: params.amount,
      currency: params.currency,
      razorpayPaymentId: params.paymentId,
      status: 'PAID',
      timestamp: params.timestamp
    });

    return {
      id: `proof_${params.orderId}`,
      orderId: params.orderId,
      decisionHash,
      transactionHash,
      proofPayload: params,
      verificationStatus: 'VALID',
      verifiedAt: new Date().toISOString(),
      createdAt: params.timestamp
    };
  }

  /**
   * Verifies the cryptographic integrity of an entire
   * sequential audit chain.
   *
   * IMPORTANT:
   * The exact same payload used when creating an audit
   * event must be used here when verifying it.
   */
  public static verifyAuditChain(events: AuditEventDto[]): {
    valid: boolean;
    chainIntegrity: 'VALID' | 'BROKEN';
    tamperedIndex?: number;
    details: string;
  } {
    if (!events || events.length === 0) {
      return {
        valid: true,
        chainIntegrity: 'VALID',
        details: 'Empty chain is trivially valid.'
      };
    }

    for (let i = 0; i < events.length; i++) {
      const ev = events[i];

      /**
       * The first block must point to the zero hash.
       * Every subsequent block must point to the hash
       * of the previous block.
       */
      const expectedPreviousHash =
        i === 0
          ? '0'.repeat(64)
          : events[i - 1].hash;

      const actualPreviousHash =
        ev.previousHash || '0'.repeat(64);

      /**
       * Verify previous-hash linkage.
       */
      if (actualPreviousHash !== expectedPreviousHash) {
        return {
          valid: false,
          chainIntegrity: 'BROKEN',
          tamperedIndex: i,
          details:
            `Broken previous hash linkage at block index ${i}. ` +
            `Expected ${expectedPreviousHash} ` +
            `but found ${actualPreviousHash}.`
        };
      }

      /**
       * Normalize optional values exactly the same way
       * as AuditService.recordEvent().
       */
      let reasonCodes = ev.reasonCodes ?? [];
      if (typeof reasonCodes === 'string') {
        try {
          reasonCodes = JSON.parse(reasonCodes);
        } catch {
          reasonCodes = [];
        }
      }

      let metadata = ev.metadata ?? {};
      if (typeof metadata === 'string') {
        try {
          metadata = JSON.parse(metadata);
        } catch {
          metadata = {};
        }
      }

      /**
       * Reconstruct the EXACT payload that was hashed
       * when the audit event was created.
       */
      const payloadToHash = {
        eventType: ev.eventType,
        actorType: ev.actorType,
        actorId: ev.actorId,
        resourceType: ev.resourceType,
        resourceId: ev.resourceId,
        decision: ev.decision ?? null,
        reasonCodes,
        metadata,
        previousHash: actualPreviousHash
      };

      /**
       * Recompute SHA-256.
       */
      const expectedHash =
        this.computeEventHash(payloadToHash);

      /**
       * Verify current block hash.
       */
      if (ev.hash !== expectedHash) {
        return {
          valid: false,
          chainIntegrity: 'BROKEN',
          tamperedIndex: i,
          details:
            `Content hash mismatch at block index ${i}. ` +
            `Recorded ${ev.hash} ` +
            `vs computed ${expectedHash}.`
        };
      }
    }

    return {
      valid: true,
      chainIntegrity: 'VALID',
      details:
        `All ${events.length} sequential blocks verified ` +
        `with valid SHA-256 hashes and tamper-free linkage.`
    };
  }

  /**
   * Verifies a TransactionProof against the recorded Audit Chain
   */
  public static verifyProof(
    proof: TransactionProofDto,
    chainEvents: AuditEventDto[]
  ): {
    valid: boolean;
    decisionHashValid: boolean;
    transactionHashValid: boolean;
    chainIntegrityValid: boolean;
    details: string;
  } {
    /**
     * Recompute decision hash.
     */
    const recomputedDecisionHash =
      this.generateDecisionHash({
        mandateId: proof.proofPayload.mandateId,
        amount: proof.proofPayload.amount,
        currency: proof.proofPayload.currency,
        decision: proof.proofPayload.policyDecision,
        reasonCodes: [],
        timestamp: proof.proofPayload.timestamp
      });

    /**
     * Recompute transaction hash.
     */
    const recomputedTransactionHash =
      this.generateTransactionHash({
        orderId: proof.orderId,
        amount: proof.proofPayload.amount,
        currency: proof.proofPayload.currency,
        razorpayPaymentId: proof.proofPayload.paymentId,
        status: 'PAID',
        timestamp: proof.proofPayload.timestamp
      });

    /**
     * Compare hashes.
     */
    const decisionHashValid =
      proof.decisionHash === recomputedDecisionHash;

    const transactionHashValid =
      proof.transactionHash === recomputedTransactionHash;

    /**
     * Verify complete audit chain.
     */
    const chainVerification =
      this.verifyAuditChain(chainEvents);

    /**
     * Proof is valid only when all checks pass.
     */
    const valid =
      decisionHashValid &&
      transactionHashValid &&
      chainVerification.valid;

    return {
      valid,
      decisionHashValid,
      transactionHashValid,
      chainIntegrityValid: chainVerification.valid,
      details: valid
        ? 'Transaction proof successfully verified against canonical SHA-256 audit chain.'
        : `Verification failed: decisionHashValid=${decisionHashValid}, ` +
        `txHashValid=${transactionHashValid}, ` +
        `chainValid=${chainVerification.valid}. ` +
        `(${chainVerification.details})`
    };
  }
}