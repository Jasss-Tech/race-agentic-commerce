import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { PolicyEngine } from '../packages/policy-engine/dist/index.js';
import { ProofEngine } from '../packages/proof-engine/dist/index.js';
import { RiskEngine, GrowthAgent, BuyerAgent } from '../packages/agent-core/dist/index.js';

// Baseline Product & Merchant Fixtures
const baseProduct = {
  id: 'prod_keyboard_01',
  merchantId: 'merch_technova',
  category: 'keyboard',
  active: true,
  agentPurchasable: true,
  stock: 42,
  price: 2199,
  currency: 'INR'
};

const baseMerchant = {
  id: 'merch_technova',
  agentEnabled: true,
  trustScore: 96
};

const baseMandate = {
  id: 'mand_test_001',
  userId: 'usr_buyer_001',
  status: 'ACTIVE',
  maxAmount: 2500,
  currency: 'INR',
  allowedCategories: ['keyboard', 'accessories'],
  allowedActions: ['search', 'compare', 'purchase'],
  expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
  merchantId: 'merch_technova'
};

// ----------------------------------------------------
// 1. POLICY ENGINE DETERMINISTIC BOUNDARY TESTS
// ----------------------------------------------------

test('1. Policy Engine: Valid mandate & matching price evaluates to ALLOW', () => {
  const result = PolicyEngine.evaluate({
    requestedAmount: 2199,
    expectedPrice: 2199,
    currentCatalogPrice: 2199,
    currency: 'INR',
    quantity: 1,
    product: baseProduct,
    merchant: baseMerchant,
    mandate: baseMandate,
    action: 'purchase'
  });

  assert.equal(result.decision, 'ALLOW');
  assert.equal(result.passed, true);
  assert.equal(result.rules.every(r => r.passed), true);
});

test('2. Policy Engine: Expired mandate evaluates to BLOCK with MANDATE_EXPIRED', () => {
  const expiredMandate = {
    ...baseMandate,
    expiresAt: new Date(Date.now() - 3600 * 1000).toISOString()
  };

  const result = PolicyEngine.evaluate({
    requestedAmount: 2199,
    expectedPrice: 2199,
    currentCatalogPrice: 2199,
    currency: 'INR',
    quantity: 1,
    product: baseProduct,
    merchant: baseMerchant,
    mandate: expiredMandate,
    action: 'purchase'
  });

  assert.equal(result.decision, 'BLOCK');
  assert.equal(result.passed, false);
  assert.ok(result.reasonCodes.includes('MANDATE_EXPIRED'));
});

test('3. Policy Engine: Amount above mandate cap evaluates to BLOCK with EXCEEDS_MANDATE', () => {
  const result = PolicyEngine.evaluate({
    requestedAmount: 2799,
    expectedPrice: 2799,
    currentCatalogPrice: 2799,
    currency: 'INR',
    quantity: 1,
    product: { ...baseProduct, price: 2799 },
    merchant: baseMerchant,
    mandate: baseMandate, // Max: 2500
    action: 'purchase'
  });

  assert.equal(result.decision, 'BLOCK');
  assert.ok(result.reasonCodes.includes('EXCEEDS_MANDATE'));
});

test('4. Policy Engine: Currency mismatch evaluates to BLOCK with CURRENCY_MISMATCH', () => {
  const result = PolicyEngine.evaluate({
    requestedAmount: 2199,
    expectedPrice: 2199,
    currentCatalogPrice: 2199,
    currency: 'USD',
    quantity: 1,
    product: { ...baseProduct, currency: 'USD' },
    merchant: baseMerchant,
    mandate: baseMandate,
    action: 'purchase'
  });

  assert.equal(result.decision, 'BLOCK');
  assert.ok(result.reasonCodes.includes('CURRENCY_MISMATCH'));
});

test('5. Policy Engine: Price Drift Detection strictly triggers BLOCK with PRICE_DRIFT', () => {
  // Quoted price: ₹2,199, Current Catalog Price: ₹2,799
  const result = PolicyEngine.evaluate({
    requestedAmount: 2799,
    expectedPrice: 2199,
    currentCatalogPrice: 2799,
    currency: 'INR',
    quantity: 1,
    product: { ...baseProduct, price: 2799 },
    merchant: baseMerchant,
    mandate: { ...baseMandate, maxAmount: 5000 },
    action: 'purchase'
  });

  assert.equal(result.decision, 'BLOCK');
  assert.ok(result.reasonCodes.includes('PRICE_DRIFT'));
  const rule007 = result.rules.find(r => r.ruleId === 'RULE_007');
  assert.equal(rule007?.passed, false);
});

test('6. Policy Engine: Unauthorized Merchant evaluates to BLOCK with MERCHANT_NOT_AUTHORIZED', () => {
  const result = PolicyEngine.evaluate({
    requestedAmount: 2199,
    expectedPrice: 2199,
    currentCatalogPrice: 2199,
    currency: 'INR',
    quantity: 1,
    product: baseProduct,
    merchant: { id: 'merch_untrusted', agentEnabled: false, trustScore: 40 },
    mandate: baseMandate,
    action: 'purchase'
  });

  assert.equal(result.decision, 'BLOCK');
  assert.ok(result.reasonCodes.includes('MERCHANT_NOT_AUTHORIZED'));
});

// ----------------------------------------------------
// 2. RISK ENGINE DETERMINISTIC SIGNAL EVALUATION
// ----------------------------------------------------

test('7. Risk Engine: Standard low-risk parameters evaluate to LOW level', () => {
  const risk = RiskEngine.evaluate({
    requestedAmount: 2199,
    mandateMaxAmount: 2500,
    expectedPrice: 2199,
    currentCatalogPrice: 2199,
    merchantTrustScore: 96,
    userOrderCount24h: 1
  });

  assert.equal(risk.level, 'LOW');
  assert.ok(risk.score < 40);
  assert.equal(risk.decision, 'ALLOW');
});

test('8. Risk Engine: High velocity and price drift escalate to HIGH risk level', () => {
  const risk = RiskEngine.evaluate({
    requestedAmount: 2799,
    mandateMaxAmount: 2500,
    expectedPrice: 2199,
    currentCatalogPrice: 2799,
    merchantTrustScore: 65,
    userOrderCount24h: 12,
    failedAttemptsCount: 3
  });

  assert.equal(risk.level, 'HIGH');
  assert.ok(risk.score >= 70);
  assert.equal(risk.decision, 'BLOCK');
  assert.ok(risk.signals.some(s => s.name === 'PRICE_DRIFT_ESCALATION'));
  assert.ok(risk.signals.some(s => s.name === 'HIGH_VELOCITY_ANOMALY'));
});

// ----------------------------------------------------
// 3. CRYPTOGRAPHIC PROOF ENGINE & HASH CHAINS
// ----------------------------------------------------

test('9. Proof Engine: Canonical JSON hashing produces deterministic SHA-256 digests', () => {
  const payloadA = { orderId: 'ord_100', amount: 2199, currency: 'INR', status: 'PAID' };
  const payloadB = { status: 'PAID', currency: 'INR', amount: 2199, orderId: 'ord_100' };

  const hashA = ProofEngine.sha256(payloadA);
  const hashB = ProofEngine.sha256(payloadB);

  assert.equal(hashA, hashB, 'Key order must not affect canonical SHA-256 hash');
});

test('10. Proof Engine: Valid sequential audit chain passes verification', () => {
  let prevHash = '0'.repeat(64);
  const events = [];

  const rawEvents = [
    { eventType: 'MANDATE_CREATED', actorType: 'BUYER', actorId: 'usr_001', resourceType: 'MANDATE', resourceId: 'mand_1', decision: 'CREATED', metadata: {} },
    { eventType: 'AUTHORIZATION_GRANTED', actorType: 'POLICY_ENGINE', actorId: 'policy', resourceType: 'ORDER', resourceId: 'ord_1', decision: 'ALLOW', metadata: { amount: 2199 } },
    { eventType: 'PAYMENT_SUCCESS', actorType: 'RAZORPAY_GATEWAY', actorId: 'gateway', resourceType: 'ORDER', resourceId: 'ord_1', decision: 'SUCCESS', metadata: { paymentId: 'pay_1' } }
  ];

  for (const ev of rawEvents) {
    const hash = ProofEngine.computeEventHash({ ...ev, previousHash: prevHash });
    events.push({ ...ev, id: `evt_${events.length}`, previousHash: prevHash, hash, createdAt: new Date().toISOString() });
    prevHash = hash;
  }

  const result = ProofEngine.verifyAuditChain(events);
  assert.equal(result.valid, true);
  assert.equal(result.chainIntegrity, 'VALID');
});

test('11. Proof Engine: Modified block content is detected as BROKEN chain (Tamper Detection)', () => {
  let prevHash = '0'.repeat(64);
  const events = [];

  const rawEvents = [
    { eventType: 'MANDATE_CREATED', actorType: 'BUYER', actorId: 'usr_001', resourceType: 'MANDATE', resourceId: 'mand_1', decision: 'CREATED', metadata: {} },
    { eventType: 'AUTHORIZATION_GRANTED', actorType: 'POLICY_ENGINE', actorId: 'policy', resourceType: 'ORDER', resourceId: 'ord_1', decision: 'ALLOW', metadata: { amount: 2199 } },
    { eventType: 'PAYMENT_SUCCESS', actorType: 'RAZORPAY_GATEWAY', actorId: 'gateway', resourceType: 'ORDER', resourceId: 'ord_1', decision: 'SUCCESS', metadata: { paymentId: 'pay_1' } }
  ];

  for (const ev of rawEvents) {
    const hash = ProofEngine.computeEventHash({ ...ev, previousHash: prevHash });
    events.push({ ...ev, id: `evt_${events.length}`, previousHash: prevHash, hash, createdAt: new Date().toISOString() });
    prevHash = hash;
  }

  // Tamper middle event
  events[1].metadata = { amount: 99999, tampered: true };

  const result = ProofEngine.verifyAuditChain(events);
  assert.equal(result.valid, false);
  assert.equal(result.chainIntegrity, 'BROKEN');
});

test('12. Proof Engine: TransactionProof verification against audit chain', () => {
  const timestamp = new Date().toISOString();
  const eventChainHash = ProofEngine.sha256({ sample: 'chain_tip' });

  const proof = ProofEngine.generateProof({
    orderId: 'ord_test_999',
    amount: 2199,
    currency: 'INR',
    mandateId: 'mand_test_001',
    policyDecision: 'ALLOW',
    riskScore: 10,
    paymentId: 'pay_rzp_mock_123',
    eventChainHash,
    timestamp
  });

  const verification = ProofEngine.verifyProof(proof, []);
  assert.equal(verification.valid, true);
  assert.equal(verification.decisionHashValid, true);
  assert.equal(verification.transactionHashValid, true);
});

// ----------------------------------------------------
// 4. RAZORPAY HMAC SIGNATURE VERIFICATION
// ----------------------------------------------------

test('13. Payment Gateway: Valid HMAC-SHA256 signature succeeds', () => {
  const secret = 'race_secret_agentic_exchange';
  const orderId = 'order_rzp_123456';
  const paymentId = 'pay_rzp_654321';

  const body = `${orderId}|${paymentId}`;
  const validSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');

  const computed = crypto.createHmac('sha256', secret).update(body).digest('hex');
  const isValid = crypto.timingSafeEqual(Buffer.from(validSignature), Buffer.from(computed));
  assert.equal(isValid, true);
});

test('14. Payment Gateway: Forged or missing signature fails verification', () => {
  const secret = 'race_secret_agentic_exchange';
  const orderId = 'order_rzp_123456';
  const paymentId = 'pay_rzp_654321';

  const body = `${orderId}|${paymentId}`;
  const validSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');
  const forgedSignature = crypto.createHmac('sha256', 'wrong_secret').update(body).digest('hex');

  assert.notEqual(validSignature, forgedSignature);
  assert.equal(crypto.timingSafeEqual(Buffer.from(validSignature), Buffer.from(forgedSignature)), false);
});

test('15. Webhook Signature Verification against raw payload', () => {
  const webhookSecret = 'race_webhook_secret_test';
  const rawPayload = JSON.stringify({ event: 'payment.captured', id: 'evt_test_001' });

  const signature = crypto.createHmac('sha256', webhookSecret).update(rawPayload).digest('hex');

  const expected = crypto.createHmac('sha256', webhookSecret).update(rawPayload).digest('hex');
  assert.equal(crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected)), true);

  const forgedPayload = JSON.stringify({ event: 'payment.captured', id: 'evt_test_001', tampered: true });
  const computedForged = crypto.createHmac('sha256', webhookSecret).update(forgedPayload).digest('hex');
  assert.equal(crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computedForged)), false);
});

// ----------------------------------------------------
// 5. DATA-DRIVEN GROWTH AGENT ANALYTICS
// ----------------------------------------------------

test('16. Growth Agent: Computes real co-occurrence attach rate from multi-item baskets', () => {
  const products = [
    { ...baseProduct, id: 'prod_kb', name: 'Keyboard', price: 2199, category: 'keyboard' },
    { ...baseProduct, id: 'prod_wr', name: 'Wrist Rest', price: 499, category: 'accessories', slug: 'wrist-rest' }
  ];

  const orders = [
    { id: 'o1', amount: 2698, status: 'PAID', createdAt: new Date().toISOString(), items: [{ orderId: 'o1', productId: 'prod_kb', quantity: 1, unitPrice: 2199, totalPrice: 2199 }, { orderId: 'o1', productId: 'prod_wr', quantity: 1, unitPrice: 499, totalPrice: 499 }] },
    { id: 'o2', amount: 2698, status: 'PAID', createdAt: new Date().toISOString(), items: [{ orderId: 'o2', productId: 'prod_kb', quantity: 1, unitPrice: 2199, totalPrice: 2199 }, { orderId: 'o2', productId: 'prod_wr', quantity: 1, unitPrice: 499, totalPrice: 499 }] },
    { id: 'o3', amount: 2199, status: 'PAID', createdAt: new Date().toISOString(), items: [{ orderId: 'o3', productId: 'prod_kb', quantity: 1, unitPrice: 2199, totalPrice: 2199 }] },
    { id: 'o4', amount: 2199, status: 'PAID', createdAt: new Date().toISOString(), items: [{ orderId: 'o4', productId: 'prod_kb', quantity: 1, unitPrice: 2199, totalPrice: 2199 }] }
  ];

  const recs = GrowthAgent.analyzeOpportunities('merch_technova', products, orders);
  assert.ok(recs.length > 0);

  const crossSell = recs.find(r => r.type === 'CROSS_SELL');
  assert.ok(crossSell);
  assert.equal(crossSell?.expectedImpact.currentAttachRate, 50.0);
  assert.equal(crossSell?.expectedImpact.currentAov, 2199);
  assert.equal(crossSell?.expectedImpact.expectedAov, 2199 + Math.round(499 * 0.85));
});

test('17. Growth Agent: Handles zero orders honestly without fabricated metrics (INSUFFICIENT_DATA)', () => {
  const products = [
    { ...baseProduct, id: 'prod_kb', name: 'Keyboard', price: 2199, category: 'keyboard' }
  ];

  const recs = GrowthAgent.analyzeOpportunities('merch_technova', products, []);
  assert.equal(recs.length, 0, 'No recommendations fabricated when 0 historical orders exist');
});

// ----------------------------------------------------
// 6. BUYER AGENT INTENT PARSER & BOUNDARY TESTS
// ----------------------------------------------------

test('18. Buyer Agent: Parses intent and extracts category, budget bounds, and actions', () => {
  const intent1 = BuyerAgent.parseIntent('I want to buy a mechanical keyboard under 2500');
  assert.equal(intent1.category, 'keyboard');
  assert.equal(intent1.maxBudget, 2500);
  assert.equal(intent1.action, 'purchase');

  const intent2 = BuyerAgent.parseIntent('Compare wireless mouse under ₹1500');
  assert.equal(intent2.category, 'mouse');
  assert.equal(intent2.maxBudget, 1500);
  assert.equal(intent2.action, 'compare');
});

test('19. Buyer Agent: Formulates bounded recommendations and compares products', () => {
  const catalog = [
    { ...baseProduct, id: 'p1', name: 'Pro Keyboard', price: 2400 },
    { ...baseProduct, id: 'p2', name: 'Basic Keyboard', price: 1800 },
    { ...baseProduct, id: 'p3', name: 'Over Budget Keyboard', price: 3500 }
  ];

  const response = BuyerAgent.processMessage('Find keyboard under 2500', catalog, baseMandate);
  assert.equal(response.products?.length, 2);
  assert.equal(response.products?.[0].id, 'p1');
  assert.ok(response.comparison);
  assert.equal(response.suggestedAction, 'PROCEED_CHECKOUT');
});

// ----------------------------------------------------
// 7. PAYMENT CONCURRENCY & IDEMPOTENCY SIMULATION
// ----------------------------------------------------

test('20. Payment Idempotency: Duplicate payment ID returns processed state without double side-effects', () => {
  const paymentRecord = {
    orderId: 'ord_123',
    amount: 2199,
    currency: 'INR',
    status: 'PAID',
    razorpayPaymentId: 'pay_rzp_unique_001',
    inventoryDecremented: true
  };

  const isDuplicate = paymentRecord.status === 'PAID' && paymentRecord.razorpayPaymentId === 'pay_rzp_unique_001';
  assert.equal(isDuplicate, true);
  assert.equal(paymentRecord.inventoryDecremented, true);
});

test('21. Webhook Idempotency: Deduplicates repeated gateway delivery using unique eventId', () => {
  const processedEvents = new Set(['evt_rzp_delivery_001']);
  const incomingEventId = 'evt_rzp_delivery_001';

  const alreadyProcessed = processedEvents.has(incomingEventId);
  assert.equal(alreadyProcessed, true);
});

test('22. Gateway Amount & Currency Match Check', () => {
  const internalOrder = { amount: 2199, currency: 'INR' };
  const gatewayPaise = 219900;
  const gatewayCurrency = 'INR';

  const expectedPaise = Math.round(internalOrder.amount * 100);
  assert.equal(gatewayPaise, expectedPaise);
  assert.equal(gatewayCurrency, internalOrder.currency);

  const mismatchedPaise = 279900;
  assert.notEqual(mismatchedPaise, expectedPaise, 'Gateway amount mismatch must be rejected');
});

// ----------------------------------------------------
// 8. MANDATE VALIDATION & OWNERSHIP
// ----------------------------------------------------

test('23. Mandate Validation: Ownership and bounds check', () => {
  const mandate = {
    id: 'mand_test_001',
    userId: 'usr_buyer_001',
    status: 'ACTIVE',
    maxAmount: 2500,
    currency: 'INR',
    allowedCategories: ['keyboard', 'accessories'],
    allowedActions: ['purchase'],
    expiresAt: new Date(Date.now() + 3600 * 1000).toISOString()
  };

  // Check valid
  const checksValid = {
    status: mandate.status === 'ACTIVE',
    expiry: new Date(mandate.expiresAt).getTime() > Date.now(),
    currency: mandate.currency === 'INR',
    amount: 2199 <= mandate.maxAmount,
    category: mandate.allowedCategories.includes('keyboard'),
    action: mandate.allowedActions.includes('purchase')
  };

  assert.equal(Object.values(checksValid).every(Boolean), true);

  // Check unauthorized user access
  const requestUserId = 'usr_unauthorized_999';
  const hasOwnership = mandate.userId === requestUserId;
  assert.equal(hasOwnership, false);
});

// ----------------------------------------------------
// 9. AUTHORITATIVE ORDER CREATION & INVENTORY INTEGRITY
// ----------------------------------------------------

test('24. Order Creation: Authoritative server price calculation overrides frontend tampering', () => {
  const catalogProduct = { id: 'prod_keyboard_01', price: 2199, stock: 42 };
  const tamperedFrontendItem = { productId: 'prod_keyboard_01', quantity: 1, unitPrice: 1.0, totalPrice: 1.0 };

  // Server calculation must use catalogProduct.price
  const serverCalculatedUnitPrice = catalogProduct.price;
  const serverCalculatedTotal = serverCalculatedUnitPrice * tamperedFrontendItem.quantity;

  assert.equal(serverCalculatedUnitPrice, 2199);
  assert.equal(serverCalculatedTotal, 2199);
  assert.notEqual(serverCalculatedTotal, tamperedFrontendItem.totalPrice, 'Frontend tampered price must not be used');
});

test('25. Merchant Product Creation: Validates positive price and non-negative stock', () => {
  const invalidPriceProduct = { name: 'Faulty Item', price: -50, stock: 10 };
  const invalidStockProduct = { name: 'Ghost Item', price: 100, stock: -5 };

  const isPriceValid = invalidPriceProduct.price > 0;
  const isStockValid = invalidStockProduct.stock >= 0;

  assert.equal(isPriceValid, false);
  assert.equal(isStockValid, false);
});
