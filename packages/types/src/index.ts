export type Currency = 'INR' | 'USD';

export type MandateStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'CONSUMED' | 'BLOCKED';

export type OrderStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'PAYMENT_FAILED'
  | 'CANCELLED'
  | 'BLOCKED'
  | 'REFUNDED';

export type DecisionType = 'ALLOW' | 'BLOCK' | 'REQUIRE_CONFIRMATION';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type GrowthRecommendationType = 'UPSELL' | 'CROSS_SELL' | 'BUNDLE' | 'CAMPAIGN';

export type GrowthRecommendationStatus = 'PROPOSED' | 'REVIEWED' | 'APPROVED' | 'REJECTED' | 'EXECUTED';

export interface ProductAttributes {
  connection?: 'wireless' | 'wired' | 'bluetooth' | 'tri-mode';
  switch?: 'mechanical-red' | 'mechanical-blue' | 'mechanical-brown' | 'optical';
  layout?: '60%' | '75%' | '87% TKL' | '100% Full';
  rgb?: boolean;
  material?: string;
  warranty?: string;
  [key: string]: unknown;
}

export interface ProductCommerce {
  purchasable_by_agent: boolean;
  returnable: boolean;
  max_quantity_per_agent_order?: number;
}

export interface ProductDto {
  id: string;
  merchantId: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  stock: number;
  active: boolean;
  agentPurchasable: boolean;
  attributes: ProductAttributes;
  returnPolicy: string;
  merchantName?: string;
  merchantTrustScore?: number;
  inventory?: {
    available: number;
    reserved: number;
    sold: number;
  };
}

export interface MandateDto {
  id: string;
  userId: string;
  agentId: string;
  merchantId?: string | null;
  intent: string;
  maxAmount: number;
  currency: string;
  allowedCategories: string[];
  allowedActions: string[];
  confirmationRequired: boolean;
  status: MandateStatus;
  expiresAt: string;
  createdAt: string;
}

export interface PolicyRuleResult {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  reasonCode: string;
  details?: string;
}

export interface PolicyEvaluationResult {
  decision: DecisionType;
  passed: boolean;
  reasonCodes: string[];
  rules: PolicyRuleResult[];
  explanation: string;
  policyVersion?: number;
}

export interface RiskSignal {
  name: string;
  impact: number;
  description: string;
  weight?: number;
}

export interface RiskEvaluationResult {
  score: number; // 0 to 100
  level: RiskLevel;
  signals: RiskSignal[];
  explanation: string;
  reasons: string[];
  requiresConfirmation: boolean;
  decision: DecisionType;
}

export interface OrderItemDto {
  id?: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderDto {
  id: string;
  userId: string;
  merchantId: string;
  merchantName?: string;
  mandateId?: string | null;
  amount: number;
  currency: string;
  status: OrderStatus;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  failureReason?: string | null;
  createdAt: string;
  items: OrderItemDto[];
  proof?: {
    id: string;
    decisionHash: string;
    transactionHash: string;
    verificationStatus: string;
  } | null;
}

export interface OrderDetailDto extends OrderDto {
  proof: {
    id: string;
    decisionHash: string;
    transactionHash: string;
    proofPayload: Record<string, unknown>;
    verificationStatus: string;
    verifiedAt?: string;
  } | null;
  policyDecisions: {
    decision: string;
    reasonCodes: string[];
    rules: unknown[];
  }[];
  riskChecks: {
    score: number;
    level: string;
    signals: unknown[];
  }[];
}

export interface RazorpayOrderCreateResponse {
  id: string;
  entity: 'order';
  amount: number; // in paise
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: 'created' | 'attempted' | 'paid';
  attempts: number;
  notes?: Record<string, string>;
  created_at: number;
  isMockProvider?: boolean;
}

export interface AuditEventDto {
  id: string;
  eventType: string;
  actorType: string;
  actorId: string;
  resourceType: string;
  resourceId: string;
  decision?: string | null;
  reasonCodes?: string[];
  metadata?: Record<string, unknown>;
  previousHash?: string | null;
  hash: string;
  createdAt: string;
}

export interface TransactionProofDto {
  id: string;
  orderId: string;
  decisionHash: string;
  transactionHash: string;
  proofPayload: {
    orderId: string;
    amount: number;
    currency: string;
    mandateId: string;
    policyDecision: string;
    riskScore: number;
    paymentId: string;
    eventChainHash: string;
    timestamp: string;
  };
  verificationStatus: 'VALID' | 'INVALID' | 'TAMPERED';
  verifiedAt?: string | null;
  createdAt: string;
}

export interface AgentPassportMetrics {
  catalogQuality: number;      // max 20
  pricingClarity: number;      // max 20
  inventoryReliability: number;// max 20
  policyCompleteness: number;  // max 20
  paymentReliability: number;  // max 20
  totalScore: number;          // max 100
  checks: {
    agentDiscoverable: boolean;
    agentReadable: boolean;
    agentPurchasable: boolean;
    paymentEnabled: boolean;
    policyDefined: boolean;
  };
}

export interface GrowthImpactData {
  currentAov: number | null;
  expectedAov: number | null;
  currentAttachRate: number | null;
  targetAttachRate: number | null;
  projectedRevenueLift: number | null;
  currency: string;
}

export interface GrowthRecommendationDto {
  id: string;
  merchantId: string;
  productId?: string | null;
  productName?: string;
  type: GrowthRecommendationType;
  recommendation: string;
  reason: string;
  confidence: number;
  expectedImpact: GrowthImpactData;
  status: GrowthRecommendationStatus;
  createdAt: string;
}

export type BuyerIntentType =
  | 'GREETING'
  | 'SMALL_TALK'
  | 'PRODUCT_SEARCH'
  | 'PRODUCT_RECOMMENDATION'
  | 'PRODUCT_DETAILS'
  | 'PRODUCT_COMPARISON'
  | 'PRICE_QUERY'
  | 'BUDGET_QUERY'
  | 'DISCOUNT_QUERY'
  | 'INVENTORY_QUERY'
  | 'CART_VIEW'
  | 'CART_ADD'
  | 'CART_REMOVE'
  | 'CART_UPDATE'
  | 'CHECKOUT_REQUEST'
  | 'PURCHASE_REQUEST'
  | 'ORDER_STATUS'
  | 'HELP'
  | 'UNKNOWN';

export interface CartActionPayload {
  type: 'ADD_TO_CART' | 'REMOVE_FROM_CART' | 'UPDATE_QUANTITY' | 'CLEAR_CART' | 'OPTIMIZE_BUDGET';
  productId?: string;
  productName?: string;
  quantity?: number;
  targetBudget?: number;
  message?: string;
}

export interface BuyerIntent {
  rawQuery: string;
  intentType?: BuyerIntentType;
  category?: string;
  maxBudget?: number;
  currency: string;
  action: 'search' | 'compare' | 'purchase' | 'inquire' | 'cart' | 'chat';
  tool?: string;
  preferences?: string[];
  attributes?: Record<string, string>;
  targetProductId?: string;
  targetProductIndex?: number;
  quantity?: number;
  comparisonProductIds?: string[];
  useCase?: 'gaming' | 'office' | 'programming' | 'general';
}

export interface ProductMatchDto extends ProductDto {
  aiMatchScore?: number;
  matchReasons?: string[];
  isOverBudget?: boolean;
  isOverMandate?: boolean;
}

export interface BuyerAgentMessageResponse {
  message: string;
  intentType?: BuyerIntentType;
  intentSummary?: {
    category?: string;
    maxBudget?: number;
    currency?: string;
    action?: string;
    tool?: string;
    intentType?: BuyerIntentType;
    useCase?: string;
  };
  products?: ProductMatchDto[];
  comparison?: {
    recommendation: string;
    topChoiceId: string;
    keyDifferences: string[];
    matrix?: Array<{
      attribute: string;
      values: Record<string, string | number>;
    }>;
    verdict?: string;
  };
  cartAction?: CartActionPayload;
  cartSummary?: {
    itemCount: number;
    subtotal: number;
    discount: number;
    total: number;
    mandateCap: number;
    remainingBalance: number;
    isOverLimit: boolean;
    overAmount: number;
  };
  mandate?: MandateDto;
  suggestedAction?: 'CREATE_MANDATE' | 'PROCEED_CHECKOUT' | 'CLARIFY' | 'BLOCKED' | 'CART_UPDATED' | 'NONE';
  clarificationQuestion?: string;
  quickReplies?: string[];
  blockDetails?: {
    reasonCode: string;
    message: string;
    expectedPrice?: number;
    currentPrice?: number;
    maxAuthorized?: number;
  };
}

// -------------------------------------------------------------
// Decision Intelligence & Real-Time Business Intelligence Types
// -------------------------------------------------------------

export interface BusinessHealthScore {
  overall: number; // 0 - 100
  status: 'OPTIMAL' | 'HEALTHY' | 'NEEDS_ATTENTION' | 'CRITICAL';
  metrics: {
    revenue: { score: number; value: number; changePct: number; trend: 'up' | 'down' | 'flat' };
    orders: { score: number; value: number; changePct: number; trend: 'up' | 'down' | 'flat' };
    conversion: { score: number; value: number; changePct: number; trend: 'up' | 'down' | 'flat' };
    aov: { score: number; value: number; changePct: number; trend: 'up' | 'down' | 'flat' };
    retention: { score: number; value: number; changePct: number; trend: 'up' | 'down' | 'flat' };
    profitability: { score: number; value: number; changePct: number; trend: 'up' | 'down' | 'flat' };
    policyIntegrity: { score: number; value: number; changePct: number; trend: 'up' | 'down' | 'flat' };
    agentAutonomy: { score: number; value: number; changePct: number; trend: 'up' | 'down' | 'flat' };
  };
  topPriorities: {
    id: string;
    title: string;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    urgency: 'IMMEDIATE' | 'PLANNED' | 'MONITOR';
    description: string;
    recommendedAction: string;
    expectedOutcome: string;
  }[];
}

export interface AISituationSummary {
  headline: string;
  narrative: string;
  whyThisHappened: string[];
  whatWillHappenNext: string[];
  whatShouldYouDo: {
    id: string;
    actionTitle: string;
    type: 'INVESTIGATE' | 'SIMULATE' | 'APPLY_CAMPAIGN' | 'ADJUST_PRICE' | 'RESTOCK';
    impactText: string;
    confidence: number;
  }[];
  generatedAt: string;
}

export interface AIInsightItem {
  id: string;
  title: string;
  category: 'REVENUE' | 'CONVERSION' | 'CHURN_RISK' | 'PRICING' | 'INVENTORY' | 'ANOMALY' | 'GROWTH';
  severity: 'CRITICAL' | 'WARNING' | 'OPPORTUNITY' | 'INFO';
  explanation: string;
  confidence: number; // 0.0 - 1.0
  impactEstimated: string;
  recommendedAction: string;
  status: 'PENDING' | 'INVESTIGATED' | 'SIMULATED' | 'APPLIED' | 'DISMISSED';
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AnomalyEvent {
  id: string;
  metricName: string;
  detectedAt: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  deviationStdDev: number; // e.g. 2.8 standard deviations
  affectedEntities: string;
  estimatedFinancialImpact: string;
  rootCauseAnalysis: string;
  recommendedMitigation: string;
  status: 'ACTIVE' | 'RESOLVING' | 'RESOLVED';
}

export interface WhatIfSimulationInput {
  priceDeltaPercent: number; // -30% to +30%
  discountPercent: number;
  targetSegment: 'ALL' | 'HIGH_INTENT' | 'RETURNING' | 'AT_RISK' | 'NEW';
  bundleAccessoryDiscount: number;
  inventoryBoostPercent: number;
}

export interface WhatIfSimulationResult {
  scenarioName: string;
  predictedConversionRate: number;
  conversionDeltaPct: number;
  predictedRevenue: number;
  revenueDeltaPct: number;
  predictedProfit: number;
  profitDeltaPct: number;
  customerDemandIndex: number;
  aiRecommendation: string;
  confidenceScore: number;
  factorImportance: { factor: string; weightPercent: number; direction: 'positive' | 'negative'; description?: string }[];
  scenariosComparison: {
    strategyName: string;
    priceDelta: number;
    expectedRevenue: number;
    expectedMargin: number;
    isOptimal: boolean;
  }[];
}

export interface CustomerSegmentProfile {
  id: string;
  name: string;
  slug: string;
  badgeColor: string;
  customerCount: number;
  totalRevenue: number;
  avgOrderValue: number;
  conversionRate: number;
  growthRate: number;
  churnRiskScore: number; // 0 - 100
  purchaseIntentScore: number; // 0 - 100
  characteristics: string[];
  aiActionProposal: string;
}

export interface ProductIntelligenceItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  price: number;
  image?: string;
  aiScore: number; // 0 - 100
  demandScore: number;
  conversionScore: number;
  profitabilityScore: number;
  customerFitScore: number;
  trendVelocity: number; // e.g. +14%
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  demandForecast30d: { day: string; predictedUnits: number; lowerBound: number; upperBound: number }[];
  historicalWeeklySales: { week: string; units: number; revenue: number }[];
  aiInsights: string[];
  recommendedActions: { action: string; impact: string; confidence: number }[];
}

export interface RealtimeActivityEvent {
  id: string;
  timestamp: string;
  eventType:
    | 'USER_VIEW'
    | 'USER_SEARCH'
    | 'PRODUCT_VIEW'
    | 'PRODUCT_COMPARE'
    | 'CART_ADD'
    | 'CART_REMOVE'
    | 'CHECKOUT_STARTED'
    | 'INTENT_MANDATE_CREATED'
    | 'CHECKOUT_AUTHORIZED'
    | 'PURCHASE_AUTHORIZED'
    | 'ORDER_PAID'
    | 'POLICY_BLOCK'
    | 'PRICE_DRIFT_BLOCKED'
    | 'INVENTORY_THRESHOLD'
    | 'ANOMALY_DETECTED'
    | 'CAMPAIGN_ACTIVATED';
  actorName: string;
  actorRole: 'CUSTOMER' | 'MERCHANT' | 'BUYER_AGENT' | 'GROWTH_AGENT' | 'POLICY_ENGINE';
  description: string;
  metadata?: Record<string, unknown>;
  badgeType: 'info' | 'success' | 'warning' | 'danger' | 'purple';
}

export interface AIAgentModuleStatus {
  id: string;
  name: string;
  role: string;
  status: 'MONITORING' | 'ANALYZING' | 'AWAITING_APPROVAL' | 'EXECUTING' | 'IDLE';
  efficiencyScore: number;
  lastActive: string;
  recentAction: string;
  pendingTasksCount: number;
}

export interface AutomationRule {
  id: string;
  name: string;
  triggerEvent: string;
  conditionDescription: string;
  aiDecisionLogic: string;
  automatedAction: string;
  status: 'ACTIVE' | 'PAUSED';
  executionCount: number;
  lastTriggeredAt?: string;
}

