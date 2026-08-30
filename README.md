# RACE — Razorpay Agentic Commerce Exchange

> **Bounded-Autonomy Control Plane & Growth Engine for Agentic Commerce**

RACE is a financial infrastructure and bounded-autonomy control plane designed to enable autonomous AI buyer agents to discover, negotiate, and execute commercial transactions within strict, deterministic risk and policy boundaries.

---

## 🏛️ Architecture Overview

```
Buyer Agent (Natural Language / ACP Feed)
    ↓
AI Provider (OpenAI SDK / Deterministic Parser) -> Structured Intent (Validated with Zod)
    ↓
POST /api/agents/buyer/checkout
    ↓
Server-Side Authorization & Trust Gate:
  1. Mandate Validation (Scope, Limits, Expiry, Status)
  2. Deterministic Policy Engine (12 Rules + Price Drift Protection)
  3. Explainable Risk Engine (Multi-Signal Scoring)
    ↓ (If ALLOW)
Internal Order Created (Status: AUTHORIZED / PAYMENT_PENDING)
    ↓
Razorpay Service (Official Test Mode SDK / Mock Gateway)
    ↓
Frontend Razorpay Checkout (Loads via public Key ID only)
    ↓
POST /api/payments/verify
    ↓
Server-Side Verification:
  - Gateway Amount & Currency Match (Paise conversion)
  - HMAC-SHA256(order_id + "|" + payment_id, RAZORPAY_KEY_SECRET)
  - Razorpay Order ID Ownership Match
    ↓ (If Valid)
Concurrency-Safe Atomic Transaction:
  1. Status -> PAID
  2. Inventory decremented exactly once
  3. Immutable Audit Event hashed into SHA-256 chain
  4. Cryptographic Proof sealed
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: `v20+` or `v22+`
- **npm**: `v10+`
- **Database**: PostgreSQL (Recommended) or SQLite for isolated offline development.

### 2. Installation
```bash
git clone https://github.com/your-org/race-agentic-commerce.git
cd race-agentic-commerce
npm install
```

### 3. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```

Configure your environment variables in `.env`:
```bash
# Database (PostgreSQL Target)
DATABASE_URL="postgresql://postgres:password@localhost:5432/race_db?schema=public"

# Payment Mode (razorpay | mock)
PAYMENT_PROVIDER=mock
RAZORPAY_KEY_ID=rzp_test_YourKeyIdHere
RAZORPAY_KEY_SECRET=YourKeySecretHere
RAZORPAY_WEBHOOK_SECRET=YourWebhookSecretHere

# AI Provider (openai | deterministic)
AI_PROVIDER=deterministic
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

### 4. Database Migration & Seeding
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed initial baseline data (Products, Merchant, Intent Mandates, Historical Orders)
npm run db:seed
```

### 5. Build Workspace Packages
```bash
npm run build
```

### 6. Run Automated Test Suite
Run the 22-scenario unit, concurrency, and integration test suite:
```bash
npm test
```

### 7. Start Development Servers
```bash
# Start API Backend (Port 4000)
npm run start:api

# In a separate terminal, start Next.js Web Client (Port 3000)
npm run start:web
```

Open [http://localhost:3000](http://localhost:3000) to access the interactive web console.

---

## 💳 Razorpay Test Mode Setup

1. Log in to the [Razorpay Dashboard](https://dashboard.razorpay.com/) and switch to **Test Mode**.
2. Navigate to **Settings > API Keys** and generate a **Key ID** and **Key Secret**.
3. Add these credentials to your `.env` file:
   ```bash
   PAYMENT_PROVIDER=razorpay
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. Restart the API server (`npm run start:api`).
5. When executing a checkout, the official Razorpay Checkout popup will open and generate authentic Test Mode payment signatures.

---

## 🛡️ Trust & Security Features

- **Zero Client Trust**: All authorization, policy evaluation, price verification, and signature checks occur server-side.
- **Server-Side Secret Isolation**: `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, and `OPENAI_API_KEY` are never exposed to frontend bundles.
- **Deterministic Price Drift Enforcement**: If a merchant increases catalog pricing after a quote or intent is authorized, the transaction is immediately blocked with `PRICE_DRIFT`.
- **Payment Idempotency**: Concurrency-safe atomic transactions prevent double-billing and duplicate inventory decrements across repeated verification calls.
- **Cryptographic Audit Hash Chain**: Every state transition is hashed using canonical SHA-256 (`hash_n = SHA256(event_n + hash_n-1)`), enabling mathematical proof of tamper-free execution.
- **Data-Driven Growth Agent**: Analyzes actual multi-item order baskets to calculate real co-occurrence attach rates without fabricated metrics.

---

## 🧪 Testing Verification Scenarios

Run `npm test` to execute automated tests covering:
1. Mandate budget limit enforcement (`ALLOW` vs `EXCEEDS_MANDATE`)
2. Mandate expiry checks (`MANDATE_EXPIRED`)
3. Currency match checks (`CURRENCY_MISMATCH`)
4. Merchant authorization verification
5. Server-side price drift block (`PRICE_DRIFT`)
6. Multi-signal explainable risk engine
7. ProofEngine canonical JSON SHA-256 hashing
8. Cryptographic sequential audit chain verification
9. Detection of broken chains / tampered payload blocks
10. Razorpay HMAC-SHA256 signature verification
11. Webhook signature verification and duplicate event idempotency
12. Data-driven growth attach-rate calculation
13. Buyer Agent structured intent parsing with fallback

---

## 📄 License
MIT License. Built for the Razorpay Agentic Commerce Hackathon.
