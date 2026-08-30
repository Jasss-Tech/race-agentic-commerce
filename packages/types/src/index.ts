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

export interface BuyerIntent {
  rawQuery: string;
  category?: string;
  maxBudget?: number;
  currency: string;
  action: 'search' | 'compare' | 'purchase' | 'inquire';
  tool?: string;
  preferences?: string[];
  attributes?: Record<string, string>;
}

export interface BuyerAgentMessageResponse {
  message: string;
  intentSummary?: {
    category?: string;
    maxBudget?: number;
    currency?: string;
    action?: string;
    tool?: string;
  };
  products?: ProductDto[];
  comparison?: {
    recommendation: string;
    topChoiceId: string;
    keyDifferences: string[];
  };
  mandate?: MandateDto;
  suggestedAction?: 'CREATE_MANDATE' | 'PROCEED_CHECKOUT' | 'CLARIFY' | 'BLOCKED';
  blockDetails?: {
    reasonCode: string;
    message: string;
    expectedPrice?: number;
    currentPrice?: number;
    maxAuthorized?: number;
  };
}
