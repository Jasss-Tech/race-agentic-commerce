# RACE — Razorpay Agentic Commerce Exchange

> **Bounded-Autonomy Control Plane & Growth Engine for Agentic Commerce**

RACE is a zero-trust financial infrastructure and bounded-autonomy control plane designed to enable autonomous AI buyer agents to discover, negotiate, and execute commercial transactions within strict, deterministic risk and policy boundaries.

### 💡 Core Thesis: Capability ≠ Authority
While modern LLMs and autonomous agents have the natural-language **capability** to search catalogs, compare products, and formulate purchase intents, they must **never possess direct authority** to execute payments or access financial credentials. RACE enforces deterministic backend boundaries where authority is strictly governed by **User Mandates + 12 Deterministic Policy Rules + Explainable Risk Scoring + Cryptographic Proofs**.

---

## 🌐 Live Demo & 🎥 Demo Video

### 🚀 Live Demo

**[Open RACE Live Demo](https://race-agentic-commerce-web-omega.vercel.app/)**

Experience the complete RACE platform, including the AI Buyer, bounded authorization, policy and risk evaluation, Razorpay Test Mode checkout, cryptographic transaction proofs, merchant growth intelligence, and Agent Passport.

### 🎥 Product Demo Video

**[Watch the RACE Demo on YouTube](https://youtu.be/Gu5sk_KvrII?si=Y3poCnuafP2ab0MI)**

A walkthrough of the RACE architecture and end-to-end agentic commerce flow:

**AI Intent → Mandate Validation → Policy & Risk → Authorization → Razorpay Execution → Cryptographic Proof → Merchant Growth**

---

## 🏛️ Architecture Overview

![alt text]<img width="1755" height="1714" alt="RACE Bounded-Autonomy Commerce Architecture (1)" src="https://github.com/user-attachments/assets/f18c9d98-e655-41cd-99c3-ed9d9dfcb179" />


```
Buyer Agent (Natural Language / Machine-Readable ACP Feed)
    ↓
AI Provider (OpenAI SDK / Deterministic Parser) -> Structured Intent (Validated with Zod)
    ↓
POST /api/agents/buyer/checkout
    ↓
Server-Side Authorization & Trust Gate:
  1. Mandate Validation (Scope, Limits, Expiry, Status, Ownership)
  2. Deterministic Policy Engine (12 Rules + Price Drift Protection)
  3. Explainable Risk Engine (Multi-Signal Scoring 0-100)
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
git clone https://github.com/Jasss-Tech/race-agentic-commerce.git
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
Run the 25-scenario unit, concurrency, and integration test suite:
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
- **Merchant AI Readiness Passport**: Scorecard (94/100) evaluating catalog structure, policy compatibility, and ACP feed readiness.

---

## 🧪 Testing Verification Scenarios

Run `npm test` to execute 25 automated tests covering:
1. Mandate budget limit enforcement (`ALLOW` vs `EXCEEDS_MANDATE`)
2. Mandate expiry checks (`MANDATE_EXPIRED`)
3. Currency match checks (`CURRENCY_MISMATCH`)
4. Merchant authorization verification (`MERCHANT_NOT_AUTHORIZED`)
5. Server-side price drift block (`PRICE_DRIFT`)
6. Multi-signal explainable risk engine (Low & High risk escalations)
7. ProofEngine canonical JSON SHA-256 hashing
8. Cryptographic sequential audit chain verification
9. Detection of broken chains / tampered payload blocks
10. TransactionProof verification against audit chain
11. Razorpay HMAC-SHA256 signature verification
12. Razorpay forged signature failure verification
13. Webhook signature verification against raw payload
14. Data-driven growth attach-rate calculation from multi-item baskets
15. Growth Agent honest handling of zero orders (`INSUFFICIENT_DATA`)
16. Buyer Agent structured intent parsing with fallback
17. Buyer Agent bounded recommendation formulation
18. Payment idempotency duplicate transaction protection
19. Webhook event deduplication idempotency
20. Gateway amount & currency verification
21. Mandate bounds and ownership validation
22. Server-side price calculation overriding frontend tampering
23. Merchant product creation bounds validation

---

## 📄 License
MIT License. Built for the Razorpay Agentic Commerce Hackathon.
