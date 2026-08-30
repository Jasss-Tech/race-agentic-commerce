# RACE Architecture & System Design

## 1. Executive Summary

**RACE (Razorpay Agentic Commerce Exchange)** is a zero-trust **Agentic Commerce Control Plane** designed to allow autonomous AI agents to browse, discover, compare, and transact on digital commerce networks without having direct or unrestricted access to payment credentials or financial execution APIs.

The foundational principle of RACE is:

$$\text{Capability} \ne \text{Authority}$$

While an LLM or autonomous agent possesses the natural-language *capability* to find products, evaluate options, and propose commercial actions, the *authority* to execute those actions is strictly governed by deterministic, verifiable backend systems:

$$\text{Authority} = \text{User Mandate} + \text{Policy Rules} + \text{Risk Assessment} + \text{Authorization Gate}$$

---

## 2. End-to-End Execution Flow

```text
+-----------------------------------------------------------------------------------+
|                                  USER / BUYER                                     |
+-----------------------------------------------------------------------------------+
                                         |
                                         | 1. Natural Language Intent
                                         v
+-----------------------------------------------------------------------------------+
|                         BUYER AGENT (AI REASONING LAYER)                          |
|  - Interprets Natural Language                                                    |
|  - Searches Machine-Readable ACP Catalog Feed                                     |
|  - Compares Specifications & Technical Attributes                                 |
|  - Formulates Bounded Intent Proposal                                             |
+-----------------------------------------------------------------------------------+
                                         |
                                         | 2. Structured Tool Request
                                         v
+-----------------------------------------------------------------------------------+
|                        INTENT MANDATE VALIDATION ENGINE                           |
|  - Enforces Max Budget Cap (e.g. <= Rs 2,500 INR)                                 |
|  - Verifies Allowed Product Categories                                            |
|  - Validates Mandate Expiration & Status (ACTIVE vs EXPIRED)                      |
+-----------------------------------------------------------------------------------+
                                         |
                                         | 3. Mandate Validated
                                         v
+-----------------------------------------------------------------------------------+
|                    DETERMINISTIC POLICY ENGINE (12 RULES)                         |
|  - Non-LLM, Rule-Based Deterministic Evaluator                                    |
|  - Rule 007: Price-Drift Protection (Live Catalog Price == Validated Price)       |
|  - Rule 003: Merchant Vetted & Agent-Enabled                                      |
|  - Rule 006: Warehouse Inventory Check                                            |
+-----------------------------------------------------------------------------------+
                                         |
                                         | 4. Policy Check Passed
                                         v
+-----------------------------------------------------------------------------------+
|                        EXPLAINABLE RISK ENGINE (0-100)                            |
|  - Budget Utilization Ratio Vector                                                |
|  - Merchant Trust Vector (96/100)                                                 |
|  - 24h Velocity Vector                                                            |
|  - Outputs Explainable Signals & Risk Level (LOW / MEDIUM / HIGH)                 |
+-----------------------------------------------------------------------------------+
                                         |
                                         | 5. Authorization Decision
                                         v
+-----------------------------------------------------------------------------------+
|                             AUTHORIZATION GATE                                    |
|                     [ ALLOW | BLOCK | REQUIRE_CONFIRM ]                           |
+-----------------------------------------------------------------------------------+
                           /                                 \
           IF ALLOW       /                                   \   IF BLOCK
                         v                                     v
+------------------------------------+             +--------------------------------+
|      BACKEND PAYMENT SERVICE       |             |     PAYMENT PREVENTED          |
|  - Server-side Razorpay Key Secret |             |  - No Razorpay API Call        |
|  - Creates Order (amount in paise) |             |  - Structured Rejection Error  |
|  - Generates HMAC-SHA256 Signature |             |  - Emits Block Audit Event     |
+------------------------------------+             +--------------------------------+
                 |
                 | 6. Test Mode Settlement
                 v
+-----------------------------------------------------------------------------------+
|                    ORDER & STOCK SERVICE (ATOMIC MUTATION)                        |
|  - Atomically marks Order as PAID                                                 |
|  - Decrements Warehouse Inventory Stock                                           |
+-----------------------------------------------------------------------------------+
                 |
                 | 7. Event Block Chaining
                 v
+-----------------------------------------------------------------------------------+
|                     TAMPER-EVIDENT AUDIT CHAIN (SHA-256)                          |
|  - H_n = SHA256(H_n-1 + Canonical(Event_n))                                       |
|  - Chains all actions: Request -> Mandate -> Policy -> Risk -> Pay -> Order       |
+-----------------------------------------------------------------------------------+
                 |
                 | 8. Proof Certificate
                 v
+-----------------------------------------------------------------------------------+
|                      CRYPTOGRAPHIC TRANSACTION PROOF                              |
|  - Emits Decision Hash & Transaction Hash Certificate                             |
|  - Verifiable On-Demand by User, Merchant, or Auditor                             |
+-----------------------------------------------------------------------------------+
```

---

## 3. Merchant Growth Architecture

Operating independently from the buyer pipeline, the **Merchant Growth Agent** uses historical basket clusters and sales graphs to identify growth opportunities:

```text
Merchant Commerce Data (Orders, Items, SKUs)
          |
          v
    Growth Agent (Correlation Engine)
          |
    +-----+-----+-----+
    |           |     |
    v           v     v
 Cross-Sell   Upsell Bundle
 (Keyboard-> (Keyboard (Creator
 WristRest)  ->Pro)    Setup)
    |           |     |
    +-----+-----+-----+
          |
          v
 Structured Opportunity & Statistical Reasoning
 (8.2% Attach Rate -> 14.5% Lift, +Rs 18,450 INR)
          |
          v
 Merchant Review & 1-Click Signoff
          |
    +-----+-----+
    |           |
 Approve     Reject
    |           |
    v           v
 Live Campaign Dismissed
 Activated
```

---

## 4. Key Subsystems

### 4.1. Intent Mandate Engine
The user delegates a strictly scoped authority window rather than broad wallet access:
- `maxAmount`: The absolute financial cap in INR.
- `allowedCategories`: Specific categories permitted for autonomous delegation.
- `allowedActions`: Explicitly permitted operations (e.g. `['search', 'compare', 'purchase']`).
- `expiresAt`: Automatic expiration timestamp.

### 4.2. Deterministic Policy Engine
12 explicit rules evaluate every transaction before financial execution. The policy engine is independent of LLMs to prevent prompt injection, hallucination, or adversarial budget evasion.

### 4.3. Price-Drift Protection
Before calling payment APIs, the backend queries the live catalog price. If the merchant or network has altered the SKU price between initial discovery and checkout, the policy engine detects the drift and halts execution immediately.

### 4.4. Cryptographic Proof Engine
Every event block is serialized canonically and chained using SHA-256. Modifying even 1 byte in past audit records causes subsequent hashes to mismatch, providing undeniable tamper evidence.
