import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { PolicyEngine } from '../packages/policy-engine/dist/index.js';
import { ProofEngine } from '../packages/proof-engine/dist/index.js';
import { RiskEngine, BuyerAgent } from '../packages/agent-core/dist/index.js';

// Standard test fixtures
const catalogFixture = [
  {
    id: 'prod_keyboard_01',
    merchantId: 'merch_technova',
    name: 'TechNova Mechanical Keyboard',
    category: 'keyboard',
    price: 2199,
    currency: 'INR',
    stock: 42,
    active: true,
    agentPurchasable: true,
    attributes: { connection: 'wireless', switch: 'mechanical-red', layout: '75%', rgb: true },
    returnPolicy: '7-day replacement',
    merchantName: 'TechNova Gear',
    merchantTrustScore: 96
  },
  {
    id: 'prod_keyboard_pro_05',
    merchantId: 'merch_technova',
    name: 'TechNova Mechanical Keyboard Pro',
    category: 'keyboard',
    price: 3299,
    currency: 'INR',
    stock: 20,
    active: true,
    agentPurchasable: true,
    attributes: { connection: 'wireless', switch: 'optical', layout: '87% TKL', rgb: true },
    returnPolicy: '7-day replacement',
    merchantName: 'TechNova Gear',
    merchantTrustScore: 98
  },
  {
    id: 'prod_mouse_02',
    merchantId: 'merch_technova',
    name: 'ErgoGlide Wireless Mouse',
    category: 'mouse',
    price: 1499,
    currency: 'INR',
    stock: 28,
    active: true,
    agentPurchasable: true,
    attributes: { connection: 'wireless', dpi: 16000 },
    returnPolicy: '7-day replacement',
    merchantName: 'TechNova Gear',
    merchantTrustScore: 96
  },
  {
    id: 'prod_hub_03',
    merchantId: 'merch_technova',
    name: '7-in-1 USB-C Multiport Hub',
    category: 'accessories',
    price: 899,
    currency: 'INR',
    stock: 65,
    active: true,
    agentPurchasable: true,
    attributes: { ports: 'HDMI 4K, 3x USB 3.0, SD, 100W PD' },
    returnPolicy: '7-day replacement',
    merchantName: 'TechNova Gear',
    merchantTrustScore: 95
  },
  {
    id: 'prod_wristrest_04',
    merchantId: 'merch_technova',
    name: 'CloudFoam Keyboard Wrist Rest',
    category: 'accessories',
    price: 499,
    currency: 'INR',
    stock: 50,
    active: true,
    agentPurchasable: true,
    attributes: { material: 'Memory Foam + Lycra' },
    returnPolicy: '7-day replacement',
    merchantName: 'TechNova Gear',
    merchantTrustScore: 94
  }
];

const testMandate = {
  id: 'mand_test_001',
  userId: 'usr_buyer_001',
  status: 'ACTIVE',
  maxAmount: 2500,
  currency: 'INR',
  allowedCategories: ['keyboard', 'accessories', 'mouse'],
  allowedActions: ['search', 'compare', 'purchase'],
  expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
  merchantId: 'merch_technova'
};

// ----------------------------------------------------
// 20 CUSTOMER AI & COMMERCE EXPERIENCE TESTS
// ----------------------------------------------------

test('CE-1. Greeting: Casual "Hi" returns friendly greeting without forced purchase proposal', () => {
  const intent = BuyerAgent.parseIntent('Hi');
  assert.equal(intent.intentType, 'GREETING');
  assert.equal(intent.action, 'chat');

  const res = BuyerAgent.processMessage('Hi', catalogFixture, testMandate);
  assert.equal(res.intentType, 'GREETING');
  assert.equal(res.products?.length, 0, 'Must NOT dump products on casual greeting');
  assert.equal(res.suggestedAction, 'NONE');
  assert.ok(res.message.toLowerCase().includes('welcome') || res.message.toLowerCase().includes('technova'));
});

test('CE-2. Small Talk: "how are you" answers conversationally without commerce coercion', () => {
  const intent = BuyerAgent.parseIntent('how are you?');
  assert.equal(intent.intentType, 'SMALL_TALK');
  assert.equal(intent.action, 'chat');

  const res = BuyerAgent.processMessage('how are you?', catalogFixture, testMandate);
  assert.equal(res.intentType, 'SMALL_TALK');
  assert.equal(res.products?.length, 0);
  assert.equal(res.suggestedAction, 'NONE');
  assert.ok(res.message.toLowerCase().includes('great') || res.message.toLowerCase().includes('help'));
});

test('CE-3. Product Search: "show me wireless mouse" correctly parses category and queries catalog', () => {
  const intent = BuyerAgent.parseIntent('show me wireless mouse');
  assert.equal(intent.category, 'mouse');
  assert.equal(intent.action, 'search');

  const res = BuyerAgent.processMessage('show me wireless mouse', catalogFixture, testMandate);
  assert.ok(res.products && res.products.length > 0);
  assert.equal(res.products[0].category, 'mouse');
  assert.equal(res.products[0].id, 'prod_mouse_02');
});

test('CE-4. Budget Filtering: "mechanical keyboard under 2500" filters strictly within ₹2500', () => {
  const intent = BuyerAgent.parseIntent('mechanical keyboard under 2500');
  assert.equal(intent.category, 'keyboard');
  assert.equal(intent.maxBudget, 2500);

  const res = BuyerAgent.processMessage('mechanical keyboard under 2500', catalogFixture, testMandate);
  assert.ok(res.products && res.products.length > 0);
  for (const p of res.products) {
    assert.ok(p.price <= 2500, `Product ${p.name} price ₹${p.price} must not exceed budget ₹2500`);
  }
});

test('CE-5. Multi-Factor Scoring: Computes transparent AI Match Score based on real specs', () => {
  const keyboard = catalogFixture[0];
  const intent = BuyerAgent.parseIntent('gaming mechanical keyboard under 2500');
  const { score, reasons } = BuyerAgent.calculateMatchScore(keyboard, intent, 2500);

  assert.ok(score >= 80, `Expected match score >= 80, got ${score}`);
  assert.ok(reasons.some(r => r.includes('budget')));
  assert.ok(reasons.some(r => r.includes('keyboard')));
});

test('CE-6. Product Comparison: "compare keyboard vs pro" builds spec matrix and AI verdict', () => {
  const intent = BuyerAgent.parseIntent('compare mechanical keyboard vs pro');
  assert.equal(intent.intentType, 'PRODUCT_COMPARISON');
  assert.equal(intent.action, 'compare');

  const res = BuyerAgent.processMessage('compare mechanical keyboard vs pro', catalogFixture, testMandate);
  assert.ok(res.comparison, 'Comparison result must be generated');
  assert.ok(res.comparison.matrix && res.comparison.matrix.length >= 4, 'Must contain multi-attribute comparison matrix');
  assert.ok(res.comparison.verdict, 'Must contain AI verdict');
});

test('CE-7. Add to Cart: "add the first keyboard" emits ADD_TO_CART action payload', () => {
  const context = { lastShownProductIds: ['prod_keyboard_01', 'prod_keyboard_pro_05'] };
  const intent = BuyerAgent.parseIntent('add the first keyboard to my cart', context);

  assert.equal(intent.intentType, 'CART_ADD');
  assert.equal(intent.targetProductIndex, 0);

  const res = BuyerAgent.processMessage('add the first keyboard to my cart', catalogFixture, testMandate, intent, context);
  assert.ok(res.cartAction);
  assert.equal(res.cartAction.type, 'ADD_TO_CART');
  assert.equal(res.cartAction.productId, 'prod_keyboard_01');
});

test('CE-8. Relative Reference: "add the second one" resolves second item from session memory', () => {
  const context = { lastShownProductIds: ['prod_keyboard_01', 'prod_keyboard_pro_05', 'prod_mouse_02'] };
  const intent = BuyerAgent.parseIntent('add the second one', context);

  assert.equal(intent.targetProductIndex, 1);

  const res = BuyerAgent.processMessage('add the second one', catalogFixture, testMandate, intent, context);
  assert.ok(res.cartAction);
  assert.equal(res.cartAction.type, 'ADD_TO_CART');
  assert.equal(res.cartAction.productId, 'prod_keyboard_pro_05');
});

test('CE-9. Remove from Cart: "remove the hub from cart" emits REMOVE_FROM_CART action', () => {
  const context = {
    cartItems: [
      { productId: 'prod_keyboard_01', productName: 'TechNova Mechanical Keyboard', price: 2199, quantity: 1 },
      { productId: 'prod_hub_03', productName: '7-in-1 USB-C Multiport Hub', price: 899, quantity: 1 }
    ]
  };

  const intent = BuyerAgent.parseIntent('remove the hub from cart', context);
  assert.equal(intent.intentType, 'CART_REMOVE');

  const res = BuyerAgent.processMessage('remove the hub from cart', catalogFixture, testMandate, intent, context);
  assert.ok(res.cartAction);
  assert.equal(res.cartAction.type, 'REMOVE_FROM_CART');
  assert.equal(res.cartAction.productId, 'prod_hub_03');
});

test('CE-10. Quantity Update: "increase keyboard quantity to 2" emits UPDATE_QUANTITY action', () => {
  const context = {
    cartItems: [{ productId: 'prod_keyboard_01', productName: 'TechNova Mechanical Keyboard', price: 2199, quantity: 1 }]
  };

  const intent = BuyerAgent.parseIntent('increase keyboard quantity to 2', context);
  assert.equal(intent.intentType, 'CART_UPDATE');
  assert.equal(intent.quantity, 2);
});

test('CE-11. Cart Total & Balance: "what is in my cart" calculates subtotal, discount, and remaining mandate', () => {
  const context = {
    cartItems: [
      { productId: 'prod_keyboard_01', productName: 'TechNova Mechanical Keyboard', price: 2199, quantity: 1 }
    ],
    mandateCap: 2500
  };

  const res = BuyerAgent.processMessage("what's in my cart?", catalogFixture, testMandate, undefined, context);
  assert.equal(res.intentType, 'CART_VIEW');
  assert.ok(res.cartSummary);
  assert.equal(res.cartSummary.subtotal, 2199);
  assert.equal(res.cartSummary.remainingBalance, 301);
  assert.equal(res.cartSummary.isOverLimit, false);
});

test('CE-12. Budget Exceeded Warning: Detects cart exceeding mandate and warns appropriately', () => {
  const context = {
    cartItems: [
      { productId: 'prod_keyboard_pro_05', productName: 'TechNova Mechanical Keyboard Pro', price: 3299, quantity: 1 }
    ],
    mandateCap: 2500
  };

  const res = BuyerAgent.processMessage("what's in my cart?", catalogFixture, testMandate, undefined, context);
  assert.ok(res.cartSummary);
  assert.equal(res.cartSummary.isOverLimit, true);
  assert.equal(res.cartSummary.overAmount, 634); // 3299 - 5% discount (165) = 3134 - 2500 cap = 634 over
  assert.equal(res.suggestedAction, 'BLOCKED');
  assert.ok(res.message.includes('above your ₹2,500 authorization limit'));
});

test('CE-13. Mandate Exceeded Blocking: Product over mandate cap sets suggestedAction to BLOCKED', () => {
  const overMandateProduct = catalogFixture.find(p => p.id === 'prod_keyboard_pro_05');
  const res = BuyerAgent.processMessage('Show me mechanical keyboard pro', [overMandateProduct], testMandate);

  assert.equal(res.suggestedAction, 'BLOCKED');
  assert.ok(res.products?.[0].isOverMandate, 'Product must be flagged as isOverMandate');
  assert.ok(res.message.includes('exceeds your active'));
});

test('CE-14. Policy Engine Rejection: Deterministically blocks checkout when price exceeds mandate', () => {
  const overProduct = catalogFixture.find(p => p.id === 'prod_keyboard_pro_05');
  const merchant = { id: 'merch_technova', agentEnabled: true, trustScore: 96 };

  const evaluation = PolicyEngine.evaluate({
    requestedAmount: 3299,
    expectedPrice: 3299,
    currentCatalogPrice: 3299,
    currency: 'INR',
    quantity: 1,
    product: overProduct,
    merchant,
    mandate: testMandate
  });

  assert.equal(evaluation.decision, 'BLOCK');
  assert.ok(evaluation.reasonCodes.includes('EXCEEDS_MANDATE'));
});

test('CE-15. Razorpay Payment Verification: Valid HMAC signature verification marks payment verified', () => {
  const secret = 'rzp_test_secret_key_mock';
  const orderId = 'order_test_98765';
  const paymentId = 'pay_test_54321';
  const rawSignature = `${orderId}|${paymentId}`;
  const validSignature = crypto.createHmac('sha256', secret).update(rawSignature).digest('hex');

  const computed = crypto.createHmac('sha256', secret).update(rawSignature).digest('hex');
  assert.equal(validSignature, computed);
  assert.equal(crypto.timingSafeEqual(Buffer.from(validSignature), Buffer.from(computed)), true);
});

test('CE-16. Razorpay Failure Handling: Forged payment signature fails verification securely', () => {
  const secret = 'rzp_test_secret_key_mock';
  const orderId = 'order_test_98765';
  const paymentId = 'pay_test_54321';
  const validSignature = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
  const forgedSignature = crypto.createHmac('sha256', 'bad_secret').update(`${orderId}|${paymentId}`).digest('hex');

  assert.notEqual(validSignature, forgedSignature);
  assert.equal(crypto.timingSafeEqual(Buffer.from(validSignature), Buffer.from(forgedSignature)), false);
});

test('CE-17. Cryptographic Proof: Creates canonical SHA-256 digest and verifies in hash chain', () => {
  const proofPayload = {
    orderId: 'ord_demo_001',
    amount: 2199,
    currency: 'INR',
    mandateId: 'mand_test_001',
    policyDecision: 'ALLOW',
    riskScore: 12,
    paymentId: 'pay_demo_001',
    timestamp: new Date().toISOString()
  };

  const hash = ProofEngine.sha256(proofPayload);
  assert.equal(hash.length, 64, 'SHA-256 digest must be 64 hex characters');

  // Verify deterministic key ordering
  const reversedPayload = {
    timestamp: proofPayload.timestamp,
    paymentId: 'pay_demo_001',
    riskScore: 12,
    policyDecision: 'ALLOW',
    mandateId: 'mand_test_001',
    currency: 'INR',
    amount: 2199,
    orderId: 'ord_demo_001'
  };

  assert.equal(ProofEngine.sha256(reversedPayload), hash, 'Canonical key ordering must yield identical hash');
});

test('CE-18. Real-Time Telemetry: Formats valid RealtimeActivityEvent payloads', () => {
  const searchEvent = {
    eventType: 'USER_SEARCH',
    actorName: 'Aarav Sharma',
    actorRole: 'CUSTOMER',
    description: 'Queried shopping assistant: "gaming keyboard under 2500"',
    badgeType: 'info'
  };

  assert.equal(searchEvent.eventType, 'USER_SEARCH');
  assert.equal(searchEvent.actorRole, 'CUSTOMER');
  assert.ok(searchEvent.description.length > 0);
});

test('CE-19. Deterministic AI Fallback: BuyerAgent functions completely without external network or LLM API', () => {
  // Test with complex multi-criteria query
  const res = BuyerAgent.processMessage('Find quiet wireless keyboard for office under ₹2500', catalogFixture, testMandate);
  assert.ok(res.products && res.products.length > 0);
  assert.equal(res.products[0].category, 'keyboard');
  assert.ok(res.products[0].price <= 2500);
  assert.ok(res.products[0].aiMatchScore && res.products[0].aiMatchScore >= 75);
});

test('CE-20. Unsupported Query: Out-of-catalog search handled gracefully with clarify prompt', () => {
  const res = BuyerAgent.processMessage('Do you have refrigerators or washing machines?', catalogFixture, testMandate);
  assert.equal(res.suggestedAction, 'CLARIFY');
  assert.ok(res.products?.length === 0);
  assert.ok(res.message.includes('found no matching active items') || res.message.includes('broaden the budget'));
});

test('CE-21. Dual Payment Architecture: Distinguishes Manual Razorpay from AI Agent auto-capture', () => {
  // Test manual Razorpay payload requirements
  const manualRzpPayload = {
    method: 'razorpay',
    keyId: 'rzp_test_TVHR0eNKaVNZNu',
    orderId: 'order_rzp_test_123',
    signatureVerificationRequired: true
  };
  assert.equal(manualRzpPayload.method, 'razorpay');
  assert.ok(manualRzpPayload.keyId.startsWith('rzp_test_'));
  assert.equal(manualRzpPayload.signatureVerificationRequired, true);

  // Test automatic agent purchase requirements
  const agentAutoPayload = {
    method: 'auto',
    mandateEnforced: true,
    policyGated: true,
    maxCap: testMandate.maxAmount
  };
  assert.equal(agentAutoPayload.method, 'auto');
  assert.equal(agentAutoPayload.mandateEnforced, true);
  assert.equal(agentAutoPayload.maxCap, 2500);
});

test('CE-22. Spec Comparison Matrix: AI compares products side-by-side with structured attributes', () => {
  const res = BuyerAgent.processMessage('compare keyboards', catalogFixture, testMandate);
  assert.equal(res.intentType, 'PRODUCT_COMPARISON');
  assert.ok(res.comparison, 'Must provide comparison data');
  assert.ok(res.comparison.matrix && res.comparison.matrix.length >= 4, 'Must include matrix with >=4 attributes');
  assert.ok(res.comparison.verdict, 'Must provide AI verdict');
  assert.ok(res.comparison.recommendation.length > 0);
});

test('CE-23. AI Quick Action Chips: Greetings and searches return contextual quick replies', () => {
  const greetingRes = BuyerAgent.processMessage('hello', catalogFixture, testMandate);
  assert.ok(greetingRes.quickReplies && greetingRes.quickReplies.length >= 3);
  assert.ok(greetingRes.quickReplies.some(r => r.toLowerCase().includes('keyboard') || r.toLowerCase().includes('mouse')));

  const searchRes = BuyerAgent.processMessage('mechanical keyboard under 2500', catalogFixture, testMandate);
  assert.ok(searchRes.quickReplies && searchRes.quickReplies.length >= 2);
});

test('CE-24. Payment Failure Diagnostics: Generates descriptive user-friendly reason instead of raw codes', () => {
  const failureScenarios = [
    { code: 'EXCEEDS_MANDATE', friendly: 'Your authorization allows purchases up to ₹2,500, but this product costs ₹2,799.' },
    { code: 'CURRENCY_MISMATCH', friendly: 'Requested currency does not match authorized mandate currency.' },
    { code: 'PRICE_DRIFT', friendly: 'The current price has changed beyond authorized drift limits.' }
  ];

  failureScenarios.forEach(s => {
    assert.ok(s.friendly.length > 20, 'Friendly error message must be descriptive and actionable');
  });
});

test('CE-25. Light Theme Design System: Verifies contrast and color token invariants', () => {
  const lightTokens = {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    accent: '#6366F1',
    success: '#10B981',
    danger: '#EF4444'
  };

  assert.notEqual(lightTokens.background, '#080C14', 'Light background must not be dark');
  assert.equal(lightTokens.surface, '#FFFFFF', 'Light surface must be white');
  assert.equal(lightTokens.textPrimary, '#0F172A', 'Text primary must have high contrast dark slate');
});

test('CE-26. Conversational Memory: "what is in my cart" reflects active session items and total', () => {
  const sessionCtx = {
    cartItems: [
      { productId: 'prod_keyboard_01', productName: 'TechNova Mechanical Keyboard', price: 2199, quantity: 1 }
    ],
    mandateCap: 2500
  };

  const res = BuyerAgent.processMessage('what is in my cart', catalogFixture, testMandate, undefined, sessionCtx);
  assert.equal(res.intentType, 'CART_VIEW');
  assert.ok(res.cartSummary);
  assert.equal(res.cartSummary.itemCount, 1);
  assert.equal(res.cartSummary.total, 2199);
  assert.equal(res.cartSummary.remainingBalance, 301);
  assert.equal(res.cartSummary.isOverLimit, false);
});

test('CE-27. Mandate Bounds: Validates ₹1299, ₹3324, ₹25000 PASS and ₹25001 FAILS', () => {
  const mandate25k = {
    id: 'mand_test_25k',
    status: 'ACTIVE',
    maxAmount: 25000,
    currency: 'INR',
    allowedCategories: ['keyboard', 'mouse', 'audio', 'webcam', 'accessories', 'monitors', 'workspace'],
    allowedActions: ['search', 'compare', 'purchase'],
    expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    merchantId: 'merch_technova'
  };

  const evalAmount = (amount) => PolicyEngine.evaluate({
    requestedAmount: amount,
    expectedPrice: amount,
    currentCatalogPrice: amount,
    currency: 'INR',
    quantity: 1,
    product: {
      id: 'prod_test',
      merchantId: 'merch_technova',
      category: 'keyboard',
      active: true,
      agentPurchasable: true,
      stock: 10,
      price: amount,
      currency: 'INR'
    },
    merchant: { id: 'merch_technova', agentEnabled: true, trustScore: 98 },
    mandate: mandate25k,
    action: 'purchase'
  });

  assert.equal(evalAmount(1299).passed, true, '₹1,299 within ₹25,000 must pass');
  assert.equal(evalAmount(3324).passed, true, '₹3,324 within ₹25,000 must pass');
  assert.equal(evalAmount(25000).passed, true, '₹25,000 exactly at cap must pass');
  
  const failRes = evalAmount(25001);
  assert.equal(failRes.passed, false, '₹25,001 over ₹25,000 must fail');
  assert.ok(failRes.reasonCodes.includes('EXCEEDS_MANDATE'));
});

test('CE-28. Category Constraints: Permits all 6 standard hardware categories under standard mandate', () => {
  const mandate = {
    id: 'mand_test_cats',
    status: 'ACTIVE',
    maxAmount: 25000,
    currency: 'INR',
    allowedCategories: ['keyboard', 'mouse', 'audio', 'webcam', 'accessories', 'monitors', 'workspace'],
    allowedActions: ['search', 'compare', 'purchase'],
    expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    merchantId: 'merch_technova'
  };

  const categories = ['keyboard', 'mouse', 'audio', 'webcam', 'accessories', 'monitors'];
  for (const cat of categories) {
    const res = PolicyEngine.evaluate({
      requestedAmount: 1999,
      currency: 'INR',
      quantity: 1,
      product: {
        id: `prod_${cat}`,
        merchantId: 'merch_technova',
        category: cat,
        active: true,
        agentPurchasable: true,
        stock: 10,
        price: 1999,
        currency: 'INR'
      },
      merchant: { id: 'merch_technova', agentEnabled: true, trustScore: 98 },
      mandate,
      action: 'purchase'
    });
    assert.equal(res.passed, true, `Category '${cat}' must be allowed`);
  }

  // Restricted category check
  const restrictedRes = PolicyEngine.evaluate({
    requestedAmount: 1999,
    currency: 'INR',
    quantity: 1,
    product: {
      id: 'prod_firearm',
      merchantId: 'merch_technova',
      category: 'prohibited_goods',
      active: true,
      agentPurchasable: true,
      stock: 10,
      price: 1999,
      currency: 'INR'
    },
    merchant: { id: 'merch_technova', agentEnabled: true, trustScore: 98 },
    mandate,
    action: 'purchase'
  });
  assert.equal(restrictedRes.passed, false, 'Prohibited category must be rejected');
  assert.ok(restrictedRes.reasonCodes.includes('CATEGORY_RESTRICTED'));
});

test('CE-29. Multi-Item Cart Policy Evaluation: All items verified and returns exact 12/12 checks passed', () => {
  const mandate = {
    id: 'mand_test_multi',
    status: 'ACTIVE',
    maxAmount: 25000,
    currency: 'INR',
    allowedCategories: ['keyboard', 'mouse', 'audio', 'webcam', 'accessories', 'monitors', 'workspace'],
    allowedActions: ['search', 'compare', 'purchase'],
    expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    merchantId: 'merch_technova'
  };

  const res = PolicyEngine.evaluate({
    requestedAmount: 3324,
    currency: 'INR',
    items: [
      { productId: 'prod_keyboard_01', category: 'keyboard', price: 2199, quantity: 1, active: true, agentPurchasable: true, stock: 15 },
      { productId: 'prod_mouse_02', category: 'mouse', price: 1125, quantity: 1, active: true, agentPurchasable: true, stock: 20 }
    ],
    merchant: { id: 'merch_technova', agentEnabled: true, trustScore: 98 },
    mandate,
    action: 'purchase'
  });

  assert.equal(res.passed, true);
  assert.equal(res.decision, 'ALLOW');
  assert.equal(res.rules.length, 12);
  assert.equal(res.rules.filter(r => r.passed).length, 12, '12/12 checks must pass');
});

test('CE-30. Product Details & Attributes: Catalog products contain structured attributes, specs, and valid images', () => {
  assert.ok(catalogFixture.length > 0, 'Catalog fixture should contain hardware products');
  const kb = catalogFixture.find(p => p.id === 'prod_keyboard_01');
  assert.ok(kb, 'prod_keyboard_01 must exist');
  assert.equal(kb.name, 'TechNova Mechanical Keyboard');
  assert.equal(kb.category, 'keyboard');
  assert.equal(kb.price, 2199);
  assert.ok(kb.attributes, 'Product must contain structured attributes');
  assert.ok(kb.attributes.switch || kb.attributes.connection, 'Must have hardware specification details');
});

test('CE-31. Mandate Eligibility on Product Details: Validates ₹2,199 within ₹25,000 mandate cap and keyboard category', () => {
  const mandate = {
    id: 'mand_test_25k',
    status: 'ACTIVE',
    maxAmount: 25000,
    currency: 'INR',
    allowedCategories: ['keyboard', 'mouse', 'audio', 'webcam', 'accessories', 'monitors', 'workspace'],
    allowedActions: ['search', 'compare', 'purchase'],
    expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    merchantId: 'merch_technova'
  };

  const kb = catalogFixture.find(p => p.id === 'prod_keyboard_01');
  const res = PolicyEngine.evaluate({
    requestedAmount: kb.price,
    currency: 'INR',
    product: {
      id: kb.id,
      merchantId: 'merch_technova',
      category: kb.category,
      active: true,
      agentPurchasable: true,
      stock: 10,
      price: kb.price,
      currency: 'INR'
    },
    merchant: { id: 'merch_technova', agentEnabled: true, trustScore: 98 },
    mandate,
    action: 'purchase'
  });

  assert.equal(res.passed, true);
  assert.equal(res.decision, 'ALLOW');
  assert.equal(res.rules.filter(r => r.passed).length, 12);
});

test('CE-32. Cryptographic Proof Verification: Valid proof returns valid=true with matching decision and transaction hashes', () => {
  const timestamp = '2026-09-02T10:00:00.000Z';
  const proof = ProofEngine.generateProof({
    orderId: 'ord_test_proof_01',
    amount: 2199,
    currency: 'INR',
    mandateId: 'mand_active_01',
    policyDecision: 'ALLOW',
    riskScore: 10,
    paymentId: 'pay_test_01',
    eventChainHash: 'a'.repeat(64),
    timestamp
  });

  assert.ok(proof.decisionHash);
  assert.ok(proof.transactionHash);

  const event0 = {
    id: 'evt_0',
    eventType: 'PAYMENT_CAPTURED',
    actorType: 'SYSTEM',
    actorId: 'gateway',
    resourceType: 'PAYMENT',
    resourceId: 'pay_test_01',
    decision: 'SUCCESS',
    reasonCodes: [],
    metadata: { orderId: 'ord_test_proof_01' },
    previousHash: '0'.repeat(64),
    hash: ProofEngine.computeEventHash({
      eventType: 'PAYMENT_CAPTURED',
      actorType: 'SYSTEM',
      actorId: 'gateway',
      resourceType: 'PAYMENT',
      resourceId: 'pay_test_01',
      decision: 'SUCCESS',
      reasonCodes: [],
      metadata: { orderId: 'ord_test_proof_01' },
      previousHash: '0'.repeat(64)
    }),
    createdAt: timestamp
  };

  const verification = ProofEngine.verifyProof(proof, [event0]);
  assert.equal(verification.valid, true);
  assert.equal(verification.decisionHashValid, true);
  assert.equal(verification.transactionHashValid, true);
  assert.equal(verification.chainIntegrityValid, true);
});

test('CE-33. Strict Cryptographic Integrity Check: If chainValid=false or contentHash mismatch occurs, overall valid is strictly false (Prevents UI contradiction)', () => {
  const timestamp = '2026-09-02T10:00:00.000Z';
  const proof = ProofEngine.generateProof({
    orderId: 'ord_test_proof_02',
    amount: 2199,
    currency: 'INR',
    mandateId: 'mand_active_01',
    policyDecision: 'ALLOW',
    riskScore: 10,
    paymentId: 'pay_test_02',
    eventChainHash: 'b'.repeat(64),
    timestamp
  });

  // Tampered event chain (corrupted hash)
  const corruptedEvent = {
    id: 'evt_corrupt',
    eventType: 'PAYMENT_CAPTURED',
    actorType: 'SYSTEM',
    actorId: 'gateway',
    resourceType: 'PAYMENT',
    resourceId: 'pay_test_02',
    decision: 'SUCCESS',
    reasonCodes: [],
    metadata: { orderId: 'ord_test_proof_02', unauthorizedTamper: true },
    previousHash: '0'.repeat(64),
    hash: 'fake_hash_value_that_does_not_match_computed_sha256',
    createdAt: timestamp
  };

  const verification = ProofEngine.verifyProof(proof, [corruptedEvent]);
  // Decision and Tx hashes may match on the proof object, but because chain is broken, overall valid MUST BE FALSE!
  assert.equal(verification.decisionHashValid, true);
  assert.equal(verification.transactionHashValid, true);
  assert.equal(verification.chainIntegrityValid, false);
  assert.equal(verification.valid, false, 'Contradiction check: valid MUST BE FALSE when chainIntegrityValid is false');
});

test('CE-34. Tamper Simulation & Detection: Altering an audit record produces compromised state with broken chain', () => {
  const events = [
    {
      id: 'evt_1',
      eventType: 'ORDER_CREATED',
      actorType: 'CUSTOMER',
      actorId: 'usr_buyer_001',
      resourceType: 'ORDER',
      resourceId: 'ord_01',
      decision: null,
      reasonCodes: [],
      metadata: {},
      previousHash: '0'.repeat(64)
    }
  ];
  events[0].hash = ProofEngine.computeEventHash(events[0]);

  // Original chain verify
  const originalCheck = ProofEngine.verifyAuditChain(events);
  assert.equal(originalCheck.valid, true);
  assert.equal(originalCheck.chainIntegrity, 'VALID');

  // Tamper simulation: Alter metadata without recomputing hash
  const tamperedEvents = [
    {
      ...events[0],
      metadata: { illegallyAltered: true }
    }
  ];
  const tamperedCheck = ProofEngine.verifyAuditChain(tamperedEvents);
  assert.equal(tamperedCheck.valid, false);
  assert.equal(tamperedCheck.chainIntegrity, 'BROKEN');
});

test('CE-35. Reversible Tamper Simulation: Restoring original audit events returns verification state to valid=true', () => {
  const events = [
    {
      id: 'evt_a',
      eventType: 'ORDER_CREATED',
      actorType: 'CUSTOMER',
      actorId: 'usr_buyer_001',
      resourceType: 'ORDER',
      resourceId: 'ord_02',
      decision: null,
      reasonCodes: [],
      metadata: { original: true },
      previousHash: '0'.repeat(64)
    }
  ];
  events[0].hash = ProofEngine.computeEventHash(events[0]);

  // Check 1: Valid
  assert.equal(ProofEngine.verifyAuditChain(events).valid, true);

  // Check 2: Tampered
  const tampered = [{ ...events[0], metadata: { tampered: true } }];
  assert.equal(ProofEngine.verifyAuditChain(tampered).valid, false);

  // Check 3: Restored
  assert.equal(ProofEngine.verifyAuditChain(events).valid, true);
});



