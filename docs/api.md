# RACE REST API Reference

All endpoints run on `http://localhost:4000` (Fastify Server).

---

## 1. Authentication & Session
- `GET /api/auth/me` — Get active buyer identity (`usr_buyer_001`).
- `POST /api/auth/session` — Issue session token.

---

## 2. Catalog & Feed
- `GET /api/catalog` — Human/UI product catalog.
- `GET /api/catalog/products/:id` — Specific SKU details.
- `GET /api/catalog/agent-feed` — Machine-readable ACP feed with compatibility, attributes, and agent-purchasable flags.

---

## 3. Buyer Agent
- `POST /api/agents/buyer/message` — Natural language intent processing & recommendation.
- `POST /api/agents/buyer/search` — Tool execution: `search_catalog`.
- `POST /api/agents/buyer/compare` — Tool execution: `compare_products`.

---

## 4. Intent Mandates
- `POST /api/mandates` — Create bounded intent mandate (`maxAmount`, `allowedCategories`, `allowedActions`, `expiresInMinutes`).
- `GET /api/mandates/:id` — Retrieve mandate status and expiry.
- `POST /api/mandates/:id/revoke` — Revoke mandate authority.

---

## 5. Policy & Risk Engine
- `GET /api/policies` — List 12 deterministic active rules.
- `POST /api/policies/evaluate` — Evaluate rules against proposed transaction.
- `POST /api/risk/evaluate` — Compute 0-100 explainable risk score.

---

## 6. Payments & Razorpay
- `POST /api/payments/create` — Run authorization gate, validate live price & stock, and generate Razorpay Test Mode order.
- `POST /api/payments/verify` — Verify HMAC-SHA256 signature, mark order `PAID`, decrement stock, and emit SHA-256 proof.
- `POST /api/payments/webhook` — Process incoming Razorpay webhooks.

---

## 7. Merchant & Growth
- `GET /api/merchant/dashboard` — Net revenue, AOV, conversion, blocked attempts.
- `GET /api/merchant/products` — Catalog management.
- `PATCH /api/merchant/products/:id` — In-place price & stock adjustment.
- `GET /api/merchant/passport` — Agent Passport AI-Readiness scorecard (94/100).
- `GET /api/growth/recommendations` — Cross-sell, upsell, and bundle opportunities.
- `POST /api/growth/recommendations/:id/approve` — Approve growth proposal.

---

## 8. Audit & Cryptographic Proofs
- `GET /api/audit` — Chronological SHA-256 chained audit stream.
- `GET /api/audit/:resourceId` — Filtered audit events for order or mandate.
- `GET /api/proofs/:orderId` — Retrieve Transaction Proof certificate.
- `POST /api/proofs/:orderId/verify` — Verify proof and hash chain integrity (supports `{ simulateTamper: true }`).

---

## 9. Demo Hub
- `POST /api/demo/reset` — Reset keyboard to ₹2,199, stock to 42, and clean baseline.
- `POST /api/demo/price-drift` — Set keyboard to ₹2,799 to trigger deliberate price drift protection demo.
- `POST /api/demo/payment-failure` — Trigger simulated gateway decline.
