# RACE Security Architecture & Threat Model

## 1. Zero-Trust Security Perimeter

RACE is designed around a strict zero-trust boundary separating non-deterministic AI capabilities from financial execution.

```text
  [ Untrusted Client / LLM Agent Space ]
                     |
                     | Structured JSON Tool Call
                     v
===================================================  SECURITY PERIMETER
                     v
   [ Zero-Trust Backend Enforcement Plane ]
    1. Authenticate Buyer Session
    2. Validate Intent Mandate Bounds
    3. Deterministic 12-Rule Policy Check
    4. Price-Drift Live Catalog Verification
    5. Warehouse Stock Atomic Verification
    6. Explainable Risk Score Gating
    7. Idempotency Key Lock
    8. Razorpay Order Generation
    9. Razorpay HMAC-SHA256 Signature Verification
   10. Append-Only SHA-256 Audit Chaining
```

---

## 2. Key Security Principles

### 2.1. Complete Payment Credential Isolation
- `RAZORPAY_KEY_SECRET` and private credentials are stored exclusively in secure server-side environment variables.
- The AI Agent, model context, prompt logs, and client browser have **zero access** to API secrets, cardholder details, or banking authentication tokens.

### 2.2. Deterministic Price-Drift Protection
- **Attack Vector / Risk**: An agent receives permission to purchase a product at ₹2,199, but before payment execution, dynamic pricing or merchant modification increases the price to ₹2,799.
- **RACE Mitigation**: Before calling Razorpay order creation, the backend re-queries the live product database (`Rule 007`). If $\text{Catalog Price} \ne \text{Validated Price}$ or $\text{Total} > \text{Mandate Cap}$, the transaction is blocked immediately with a structured rejection error (`PRICE_DRIFT`) and an audit event is emitted.

### 2.3. Anti-Replay & Idempotency Guarantee
- Every checkout request requires an `idempotencyKey`.
- If an agent retries a purchase due to a temporary network blip, the idempotency layer identifies the existing order and returns the settled receipt rather than initiating a duplicate debit.

### 2.4. Tamper-Evident SHA-256 Hash Chaining
- Each audit event is cryptographically linked to its predecessor:
  $$H_n = \text{SHA256}(H_{n-1} + \text{CanonicalJSON}(E_n))$$
- Modifying any past database record (e.g. changing transaction amount from ₹2,199 to ₹9,999) corrupts the downstream hash chain, causing instant tamper detection upon verification.
