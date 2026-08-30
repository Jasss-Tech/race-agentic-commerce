# RACE Hackathon Presentation & Demo Script

## ⏱️ Recommended Duration: 5–7 Minutes

---

## 🎙️ Act 1: The Core Question (0:00 – 1:00)

**Speaker**:
> "Judges, today's AI shopping assistants can tell you what to buy. But what happens when AI can **actually buy it**?
> 
> When an autonomous agent gains the ability to transact, a critical problem emerges: **Capability does not equal Authority**.
> 
> If an agent is capable of initiating a purchase, what stops it from overspending? What happens if product prices change between recommendation and execution? What if the agent hallucinated a transaction?
> 
> Welcome to **RACE: Razorpay Agentic Commerce Exchange** — the zero-trust control plane for bounded agentic commerce."

---

## 💻 Act 2: Demo 1 — The Happy Path (1:00 – 2:30)

1. Open **`/demo`** (or **`/buyer`**).
2. Click **Run Demo 1** (or enter: *"Find me a mechanical keyboard under ₹2500"*).
3. **Show**:
   - The Buyer Agent discovers the TechNova Mechanical Keyboard (₹2,199).
   - An Intent Mandate is constructed bounding max budget to ₹2,500 INR.
   - The Deterministic Policy Engine validates 12 rules (budget, inventory, merchant status).
   - Explainable Risk Engine scores transaction at 12/100 (LOW risk).
   - Razorpay Test Mode order is generated (`order_rzp_...`) and verified with HMAC-SHA256 signature.
   - Order marked **PAID** and a cryptographic SHA-256 proof is emitted.

---

## 🛡️ Act 3: Demo 2 — The Signature Price-Drift Protection (2:30 – 4:00)

**Speaker**:
> "Now let's see what happens when reality changes."

1. In **`/demo`**, click **Run Demo 2**.
2. **Show**:
   - Merchant price drifts from ₹2,199 to ₹2,799 (exceeding the user's ₹2,500 mandate).
   - Agent attempts checkout.
   - **Result**: `TRANSACTION BLOCKED: PRICE_DRIFT`.
   - **Key Speaker Line**:
     > *"The AI didn't fail. The control system worked. The agent had the capability to request the item, but our deterministic policy gate prevented execution before a single rupee could move."*

---

## 🔍 Act 4: Demo 5 — Cryptographic Proof & Tamper Detection (4:00 – 5:00)

1. Open **`/proofs`** or click **Run Demo 5**.
2. **Show**:
   - Verify Proof: All 12 audit events and hash chain are valid.
   - Click **Simulate Tamper Test**: Modifying even 1 byte in past audit history causes immediate cryptographic alarm (`TAMPER DETECTED`).

---

## 📈 Act 5: Merchant Growth Agent & Passport (5:00 – 6:00)

1. Open **`/merchant/growth`**.
2. **Show**:
   - Growth Agent detects Keyboard ➔ Wrist Rest cross-sell opportunity (8.2% ➔ 14.5% attach rate, +₹18,450 projected lift).
   - Merchant clicks **Approve Proposal** ➔ campaign activated with human-in-the-loop governance.
3. Open **`/merchant/passport`** ➔ Show 94/100 Agent Readiness Scorecard.

---

## 🎯 Closing Statement (6:00 – 6:30)

**Speaker**:
> "RACE turns AI from an unrestricted financial risk into a bounded, verifiable, and growth-driving commerce participant.
> 
> With RACE, AI can act — without losing control. Thank you!"
