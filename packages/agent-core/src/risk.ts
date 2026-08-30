import { RiskEvaluationResult, RiskSignal, DecisionType, RiskLevel } from '@race/types';

export interface RiskEvaluationContext {
  requestedAmount: number;
  mandateMaxAmount: number;
  expectedPrice?: number;
  currentCatalogPrice: number;
  merchantTrustScore?: number;
  userOrderCount24h?: number;
  failedAttemptsCount?: number;
}

export class RiskEngine {
  /**
   * Evaluates transaction risk deterministically using multi-factor signal weights.
   * Outputs explainable risk scores and specific mitigating signals.
   */
  public static evaluate(ctx: RiskEvaluationContext): RiskEvaluationResult {
    let score = 10; // Baseline low risk
    const signals: RiskSignal[] = [];
    const reasons: string[] = [];

    // Factor 1: Mandate Budget Utilization
    const budgetUtilization = ctx.requestedAmount / ctx.mandateMaxAmount;
    if (budgetUtilization > 0.95) {
      score += 20;
      signals.push({
        name: 'HIGH_MANDATE_UTILIZATION',
        impact: +20,
        description: `Requested amount utilizes ${(budgetUtilization * 100).toFixed(1)}% of mandate cap.`
      });
      reasons.push('High mandate cap utilization');
    } else if (budgetUtilization > 0.75) {
      score += 10;
      signals.push({
        name: 'MODERATE_MANDATE_UTILIZATION',
        impact: +10,
        description: `Requested amount utilizes ${(budgetUtilization * 100).toFixed(1)}% of mandate cap.`
      });
    }

    // Factor 2: Price Drift Detection
    if (ctx.expectedPrice && ctx.currentCatalogPrice > ctx.expectedPrice) {
      score += 40;
      signals.push({
        name: 'PRICE_DRIFT_ESCALATION',
        impact: +40,
        description: `Current catalog price (₹${ctx.currentCatalogPrice}) exceeds quoted price (₹${ctx.expectedPrice}).`
      });
      reasons.push('Catalog price drift detected');
    }

    // Factor 3: Merchant Trust Score
    const trust = ctx.merchantTrustScore ?? 90;
    if (trust < 70) {
      score += 30;
      signals.push({
        name: 'LOW_MERCHANT_TRUST',
        impact: +30,
        description: `Merchant trust score (${trust}/100) is below safety threshold.`
      });
      reasons.push('Merchant trust score below standard threshold');
    } else if (trust >= 90) {
      score -= 5;
      signals.push({
        name: 'VERIFIED_HIGH_TRUST_MERCHANT',
        impact: -5,
        description: `Merchant is verified with excellent trust score (${trust}/100).`
      });
    }

    // Factor 4: 24h User Order Velocity
    const velocity = ctx.userOrderCount24h ?? 0;
    if (velocity > 10) {
      score += 35;
      signals.push({
        name: 'HIGH_VELOCITY_ANOMALY',
        impact: +35,
        description: `User generated ${velocity} orders in past 24 hours.`
      });
      reasons.push('Abnormal 24h order velocity');
    } else if (velocity > 5) {
      score += 15;
      signals.push({
        name: 'ELEVATED_VELOCITY',
        impact: +15,
        description: `User generated ${velocity} orders in past 24 hours.`
      });
    }

    // Factor 5: Previous Failed Attempts
    const failures = ctx.failedAttemptsCount ?? 0;
    if (failures > 2) {
      score += 25;
      signals.push({
        name: 'REPEATED_PAYMENT_FAILURES',
        impact: +25,
        description: `${failures} previous payment failures recorded for this mandate.`
      });
      reasons.push('Repeated prior payment failures');
    }

    // Normalize score to range [0, 100]
    score = Math.max(0, Math.min(100, score));

    let level: RiskLevel = 'LOW';
    let decision: DecisionType = 'ALLOW';
    let requiresConfirmation = false;

    if (score >= 70) {
      level = 'HIGH';
      decision = 'BLOCK';
      requiresConfirmation = true;
    } else if (score >= 40) {
      level = 'MEDIUM';
      decision = 'REQUIRE_CONFIRMATION';
      requiresConfirmation = true;
    }

    const explanation = reasons.length > 0
      ? `Risk level ${level} (Score ${score}/100) based on signals: ${reasons.join('; ')}.`
      : `Transaction evaluated as ${level} risk (Score ${score}/100) with verified merchant and normal velocity.`;

    return {
      score,
      level,
      signals,
      explanation,
      reasons,
      requiresConfirmation,
      decision
    };
  }
}
