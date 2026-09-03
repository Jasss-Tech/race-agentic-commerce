import { PolicyEvaluationResult, PolicyRuleResult } from '@race/types';

export interface CartItemContext {
  id?: string;
  productId?: string;
  name?: string;
  category: string;
  price: number;
  quantity: number;
  active?: boolean;
  agentPurchasable?: boolean;
  stock?: number;
}

export interface PolicyContext {
  requestedAmount: number;
  expectedPrice?: number;
  currentCatalogPrice?: number;
  currency: string;
  quantity?: number;
  product?: {
    id: string;
    merchantId: string;
    category: string;
    active: boolean;
    agentPurchasable: boolean;
    stock: number;
    price: number;
    currency: string;
  };
  items?: CartItemContext[];
  merchant: {
    id: string;
    agentEnabled: boolean;
    trustScore: number;
  };
  mandate: {
    id: string;
    status: string;
    maxAmount: number;
    currency: string;
    allowedCategories: string[];
    allowedActions: string[];
    expiresAt: Date | string;
    merchantId?: string | null;
  };
  action: string;
  idempotencyKey?: string | null;
  isDuplicateIdempotency?: boolean;
  riskScore?: number;
  policyVersion?: number;
}

export class PolicyEngine {
  /**
   * Evaluates all deterministic commerce policy rules.
   * Completely independent of LLMs. Transparent, deterministic, and auditable.
   */
  public static evaluate(ctx: PolicyContext): PolicyEvaluationResult {
    const rules: PolicyRuleResult[] = [];
    const reasonCodes: string[] = [];

    // Helper: Normalize category
    const normalizeCat = (cat: string) => cat.toLowerCase().trim().replace(/s$/, '');

    const allowedCats = (ctx.mandate.allowedCategories || []).map(normalizeCat);
    const isCategoryPermitted = (category: string) => {
      if (allowedCats.length === 0 || allowedCats.includes('*') || allowedCats.includes('all')) {
        return true;
      }
      const norm = normalizeCat(category);
      return allowedCats.some(c => norm.includes(c) || c.includes(norm));
    };

    // Extract items list
    const itemsList: CartItemContext[] = ctx.items && ctx.items.length > 0
      ? ctx.items
      : (ctx.product ? [{
          id: ctx.product.id,
          productId: ctx.product.id,
          category: ctx.product.category,
          price: ctx.product.price,
          quantity: ctx.quantity || 1,
          active: ctx.product.active,
          agentPurchasable: ctx.product.agentPurchasable,
          stock: ctx.product.stock
        }] : []);

    // RULE 001: Transaction amount must not exceed mandate max amount
    const rule001Passed = ctx.requestedAmount <= ctx.mandate.maxAmount;
    rules.push({
      ruleId: 'RULE_001',
      ruleName: 'BUDGET_CAP_ENFORCEMENT',
      passed: rule001Passed,
      reasonCode: rule001Passed ? 'WITHIN_BUDGET' : 'EXCEEDS_MANDATE',
      details: `Requested ₹${ctx.requestedAmount.toLocaleString('en-IN')} vs Mandate Cap ₹${ctx.mandate.maxAmount.toLocaleString('en-IN')}`
    });
    if (!rule001Passed) reasonCodes.push('EXCEEDS_MANDATE');

    // RULE 002: Currency must match mandate currency
    const rule002Passed = ctx.currency.toUpperCase() === ctx.mandate.currency.toUpperCase();
    rules.push({
      ruleId: 'RULE_002',
      ruleName: 'CURRENCY_MATCH',
      passed: rule002Passed,
      reasonCode: rule002Passed ? 'CURRENCY_VALID' : 'CURRENCY_MISMATCH',
      details: `Requested ${ctx.currency} vs Mandate ${ctx.mandate.currency}`
    });
    if (!rule002Passed) reasonCodes.push('CURRENCY_MISMATCH');

    // RULE 003: Merchant must be authorized & agent-enabled
    const merchantAllowed = (!ctx.mandate.merchantId || ctx.mandate.merchantId === ctx.merchant.id) && ctx.merchant.agentEnabled;
    rules.push({
      ruleId: 'RULE_003',
      ruleName: 'MERCHANT_AUTHORIZATION',
      passed: merchantAllowed,
      reasonCode: merchantAllowed ? 'MERCHANT_ALLOWED' : 'MERCHANT_NOT_AUTHORIZED',
      details: `Merchant ${ctx.merchant.id} (AgentEnabled: ${ctx.merchant.agentEnabled})`
    });
    if (!merchantAllowed) reasonCodes.push('MERCHANT_NOT_AUTHORIZED');

    // RULE 004: Product must be active
    const inactiveItems = itemsList.filter(item => item.active === false);
    const rule004Passed = inactiveItems.length === 0;
    rules.push({
      ruleId: 'RULE_004',
      ruleName: 'PRODUCT_STATUS_ACTIVE',
      passed: rule004Passed,
      reasonCode: rule004Passed ? 'PRODUCT_ACTIVE' : 'PRODUCT_INACTIVE',
      details: rule004Passed ? 'All products active in catalog' : `Inactive items detected: ${inactiveItems.map(i => i.name || i.productId).join(', ')}`
    });
    if (!rule004Passed) reasonCodes.push('PRODUCT_INACTIVE');

    // RULE 005: Product must be agent-purchasable
    const nonPurchasableItems = itemsList.filter(item => item.agentPurchasable === false);
    const rule005Passed = nonPurchasableItems.length === 0;
    rules.push({
      ruleId: 'RULE_005',
      ruleName: 'AGENT_PURCHASABLE_FLAG',
      passed: rule005Passed,
      reasonCode: rule005Passed ? 'AGENT_PURCHASABLE' : 'AGENT_PURCHASE_DISABLED',
      details: rule005Passed ? 'All items permitted for agent delegation' : `Non-agent-purchasable items: ${nonPurchasableItems.map(i => i.name || i.productId).join(', ')}`
    });
    if (!rule005Passed) reasonCodes.push('AGENT_PURCHASE_DISABLED');

    // RULE 006: Inventory availability
    const outOfStockItems = itemsList.filter(item => (item.stock !== undefined && item.stock < item.quantity));
    const rule006Passed = outOfStockItems.length === 0;
    rules.push({
      ruleId: 'RULE_006',
      ruleName: 'INVENTORY_AVAILABILITY',
      passed: rule006Passed,
      reasonCode: rule006Passed ? 'IN_STOCK' : 'OUT_OF_STOCK',
      details: rule006Passed ? 'Sufficient stock for all items' : `Insufficient stock for items: ${outOfStockItems.map(i => `${i.name || i.productId} (Stock: ${i.stock} < Qty: ${i.quantity})`).join(', ')}`
    });
    if (!rule006Passed) reasonCodes.push('OUT_OF_STOCK');

    // RULE 007: Price Drift Protection (Server-Side Enforcement)
    let rule007Passed = true;
    if (ctx.expectedPrice !== undefined && ctx.expectedPrice !== null && ctx.currentCatalogPrice !== undefined) {
      rule007Passed = ctx.currentCatalogPrice <= ctx.expectedPrice;
    }
    rules.push({
      ruleId: 'RULE_007',
      ruleName: 'PRICE_DRIFT_INTEGRITY',
      passed: rule007Passed,
      reasonCode: rule007Passed ? 'PRICE_VERIFIED' : 'PRICE_DRIFT',
      details: `Catalog price verified against quoted expectations`
    });
    if (!rule007Passed) reasonCodes.push('PRICE_DRIFT');

    // RULE 008: Mandate Status must be ACTIVE
    const rule008Passed = ctx.mandate.status === 'ACTIVE';
    rules.push({
      ruleId: 'RULE_008',
      ruleName: 'MANDATE_STATUS_ACTIVE',
      passed: rule008Passed,
      reasonCode: rule008Passed ? 'MANDATE_ACTIVE' : 'MANDATE_INACTIVE',
      details: `Mandate status is ${ctx.mandate.status}`
    });
    if (!rule008Passed) reasonCodes.push('MANDATE_INACTIVE');

    // RULE 009: Mandate Expiry check
    const expiryTime = new Date(ctx.mandate.expiresAt).getTime();
    const rule009Passed = !isNaN(expiryTime) && expiryTime > Date.now();
    rules.push({
      ruleId: 'RULE_009',
      ruleName: 'MANDATE_EXPIRY_CHECK',
      passed: rule009Passed,
      reasonCode: rule009Passed ? 'MANDATE_VALID_TIME' : 'MANDATE_EXPIRED',
      details: `Expires at ${new Date(ctx.mandate.expiresAt).toISOString()}`
    });
    if (!rule009Passed) reasonCodes.push('MANDATE_EXPIRED');

    // RULE 010: Action permission check
    const rule010Passed = (ctx.mandate.allowedActions || []).includes(ctx.action);
    rules.push({
      ruleId: 'RULE_010',
      ruleName: 'ACTION_PERMISSION',
      passed: rule010Passed,
      reasonCode: rule010Passed ? 'ACTION_ALLOWED' : 'ACTION_UNAUTHORIZED',
      details: `Requested action '${ctx.action}' in [${(ctx.mandate.allowedActions || []).join(', ')}]`
    });
    if (!rule010Passed) reasonCodes.push('ACTION_UNAUTHORIZED');

    // RULE 011: Category constraint check
    const restrictedItems = itemsList.filter(item => !isCategoryPermitted(item.category));
    const rule011Passed = restrictedItems.length === 0;
    rules.push({
      ruleId: 'RULE_011',
      ruleName: 'CATEGORY_CONSTRAINT',
      passed: rule011Passed,
      reasonCode: rule011Passed ? 'CATEGORY_ALLOWED' : 'CATEGORY_RESTRICTED',
      details: rule011Passed 
        ? `All categories permitted within [${(ctx.mandate.allowedCategories || []).join(', ')}]`
        : `Categories restricted: ${restrictedItems.map(i => `${i.name || i.productId} (${i.category})`).join(', ')} not in [${(ctx.mandate.allowedCategories || []).join(', ')}]`
    });
    if (!rule011Passed) reasonCodes.push('CATEGORY_RESTRICTED');

    // RULE 012: Idempotency conflict check
    const rule012Passed = !ctx.isDuplicateIdempotency;
    rules.push({
      ruleId: 'RULE_012',
      ruleName: 'IDEMPOTENCY_PROTECTION',
      passed: rule012Passed,
      reasonCode: rule012Passed ? 'IDEMPOTENCY_OK' : 'DUPLICATE_TRANSACTION',
      details: ctx.isDuplicateIdempotency ? 'Duplicate transaction detected with same idempotency key' : 'Unique idempotency key verified'
    });
    if (!rule012Passed) reasonCodes.push('DUPLICATE_TRANSACTION');

    // Determine final Decision
    const allPassed = rules.every(r => r.passed);
    let decision: 'ALLOW' | 'BLOCK' | 'REQUIRE_CONFIRMATION' = allPassed ? 'ALLOW' : 'BLOCK';

    if (allPassed && ctx.riskScore && ctx.riskScore >= 70) {
      decision = 'REQUIRE_CONFIRMATION';
      reasonCodes.push('ELEVATED_RISK_CONFIRMATION');
    }

    const explanation = allPassed
      ? 'All 12 deterministic commerce boundary rules passed successfully. Transaction authorized.'
      : `Policy evaluation blocked due to violations: ${reasonCodes.join(', ')}.`;

    return {
      decision,
      passed: allPassed,
      reasonCodes,
      rules,
      explanation,
      policyVersion: ctx.policyVersion || 1
    };
  }
}
