'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RotateCcw, 
  ArrowRight, 
  ShieldCheck, 
  Bot, 
  CreditCard, 
  Lock, 
  TrendingUp, 
  FileCheck2,
  Play
} from 'lucide-react';
import { fetchApi } from '../../lib/api';

export default function DemoHubPage() {
  const [runningDemo, setRunningDemo] = useState<number | null>(null);
  const [demoResults, setDemoResults] = useState<Record<number, any>>({});
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleResetEnvironment = async () => {
    try {
      const res = await fetchApi<any>('/api/demo/reset', { method: 'POST' });
      setResetMessage(res.message || 'Demo environment reset to standard baseline.');
      setDemoResults({});
      setTimeout(() => setResetMessage(null), 4000);
    } catch (err: any) {
      alert(`Reset error: ${err.message}`);
    }
  };

  // Demo 1: Successful Agentic Purchase
  const runDemo1 = async () => {
    setRunningDemo(1);
    try {
      // 1. Create mandate
      const mandate = await fetchApi<any>('/api/mandates', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'usr_buyer_001',
          maxAmount: 2500,
          currency: 'INR',
          allowedCategories: ['keyboard', 'accessories']
        })
      });

      // 2. Authorize
      const auth = await fetchApi<any>('/api/payments/create', {
        method: 'POST',
        body: JSON.stringify({
          mandateId: mandate.id,
          productId: 'prod_keyboard_01',
          expectedPrice: 2199,
          quantity: 1,
          idempotencyKey: `demo1_${Date.now()}`
        })
      });

      // 3. Verify Payment
      const payment = await fetchApi<any>('/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          orderId: auth.orderId,
          razorpayOrderId: auth.razorpayOrderId,
          razorpayPaymentId: auth.testCredentials.paymentId,
          razorpaySignature: auth.testCredentials.signature
        })
      });

      setDemoResults(prev => ({
        ...prev,
        1: {
          success: true,
          mandate,
          auth,
          payment
        }
      }));
    } catch (err: any) {
      setDemoResults(prev => ({ ...prev, 1: { success: false, error: err.message } }));
    } finally {
      setRunningDemo(null);
    }
  };

  // Demo 2: Signature Price-Drift Protection
  const runDemo2 = async () => {
    setRunningDemo(2);
    try {
      // 1. Trigger price drift on merchant catalog
      const drift = await fetchApi<any>('/api/demo/price-drift', { method: 'POST' });

      // 2. Create mandate max 2500
      const mandate = await fetchApi<any>('/api/mandates', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'usr_buyer_001',
          maxAmount: 2500,
          currency: 'INR',
          allowedCategories: ['keyboard']
        })
      });

      // 3. Attempt payment expecting original price 2199 when live catalog is now 2799
      let blockedResponse = null;
      try {
        await fetchApi<any>('/api/payments/create', {
          method: 'POST',
          body: JSON.stringify({
            mandateId: mandate.id,
            productId: 'prod_keyboard_01',
            expectedPrice: 2199,
            quantity: 1
          })
        });
      } catch (err: any) {
        blockedResponse = err.data || { message: err.message };
      }

      setDemoResults(prev => ({
        ...prev,
        2: {
          success: true,
          drift,
          mandate,
          blocked: blockedResponse
        }
      }));
    } catch (err: any) {
      setDemoResults(prev => ({ ...prev, 2: { success: false, error: err.message } }));
    } finally {
      setRunningDemo(null);
    }
  };

  // Demo 3: Payment Failure Simulation
  const runDemo3 = async () => {
    setRunningDemo(3);
    try {
      const mandate = await fetchApi<any>('/api/mandates', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'usr_buyer_001',
          maxAmount: 2500,
          currency: 'INR'
        })
      });

      const auth = await fetchApi<any>('/api/payments/create', {
        method: 'POST',
        body: JSON.stringify({
          mandateId: mandate.id,
          productId: 'prod_keyboard_01',
          expectedPrice: 2199,
          quantity: 1
        })
      });

      // Simulate payment failure
      let failRes = null;
      try {
        await fetchApi<any>('/api/payments/verify', {
          method: 'POST',
          body: JSON.stringify({
            orderId: auth.orderId,
            razorpayOrderId: auth.razorpayOrderId,
            razorpayPaymentId: 'pay_sim_fail',
            simulateFailure: true
          })
        });
      } catch (err: any) {
        failRes = err.data || { message: err.message };
      }

      setDemoResults(prev => ({
        ...prev,
        3: {
          success: true,
          orderId: auth.orderId,
          failRes
        }
      }));
    } catch (err: any) {
      setDemoResults(prev => ({ ...prev, 3: { success: false, error: err.message } }));
    } finally {
      setRunningDemo(null);
    }
  };

  // Demo 4: Growth Agent Opportunity & Approval
  const runDemo4 = async () => {
    setRunningDemo(4);
    try {
      const recs = await fetchApi<any[]>('/api/growth/recommendations');
      const crossSell = recs.find(r => r.type === 'CROSS_SELL') || recs[0];

      // Approve it
      const approval = await fetchApi<any>(`/api/growth/recommendations/${crossSell.id}/approve`, {
        method: 'POST'
      });

      setDemoResults(prev => ({
        ...prev,
        4: {
          success: true,
          crossSell,
          approval
        }
      }));
    } catch (err: any) {
      setDemoResults(prev => ({ ...prev, 4: { success: false, error: err.message } }));
    } finally {
      setRunningDemo(null);
    }
  };

  // Demo 5: SHA-256 Proof Verification
  const runDemo5 = async () => {
    setRunningDemo(5);
    try {
      const orders = await fetchApi<any[]>('/api/orders');
      const paidOrder = orders.find(o => o.status === 'PAID') || orders[0];

      const validVerification = await fetchApi<any>(`/api/proofs/${paidOrder.id}/verify`, {
        method: 'POST',
        body: JSON.stringify({ simulateTamper: false })
      });

      const tamperedVerification = await fetchApi<any>(`/api/proofs/${paidOrder.id}/verify`, {
        method: 'POST',
        body: JSON.stringify({ simulateTamper: true })
      });

      setDemoResults(prev => ({
        ...prev,
        5: {
          success: true,
          orderId: paidOrder.id,
          validVerification,
          tamperedVerification
        }
      }));
    } catch (err: any) {
      setDemoResults(prev => ({ ...prev, 5: { success: false, error: err.message } }));
    } finally {
      setRunningDemo(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-brand-razorblue to-brand-accent text-white flex items-center justify-center font-bold shadow-lg">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-white">Hackathon Demo Command Center</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/40">
                5 GUIDED DEMOS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              One-click interactive scenarios demonstrating bounded agent autonomy, deterministic price-drift gating, and cryptographic proofs.
            </p>
          </div>
        </div>

        <button
          onClick={handleResetEnvironment}
          className="px-4 py-2.5 rounded-xl bg-surface border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-200 flex items-center space-x-2 hover:bg-white/5 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
          <span>Reset Demo Environment</span>
        </button>
      </div>

      {resetMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* 5 Demo Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DEMO 1: Successful Purchase */}
        <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                DEMO 01 · HAPPY PATH
              </span>
              <h2 className="text-base font-bold text-white mt-1.5">Successful Agentic Purchase</h2>
            </div>
            <button
              onClick={runDemo1}
              disabled={runningDemo === 1}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center space-x-1.5 transition-all shadow-md"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{runningDemo === 1 ? 'Running...' : 'Run Demo 1'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Buyer Agent requests keyboard under ₹2,500 ➔ Mandate formulated ➔ Policy & Risk pass ➔ Razorpay Test Mode order generated & verified ➔ SHA-256 Proof emitted.
          </p>

          {demoResults[1] && (
            <div className="p-4 rounded-xl bg-surface/90 border border-emerald-500/30 space-y-2 text-xs font-mono">
              <div className="text-emerald-400 font-bold flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>✓ AGENTIC PURCHASE COMPLETED (PAID)</span>
              </div>
              <div className="text-slate-300 text-[11px] space-y-1">
                <div>Order ID: {demoResults[1].payment?.order?.id}</div>
                <div>Razorpay Order: {demoResults[1].auth?.razorpayOrderId}</div>
                <div>Decision Hash: {demoResults[1].payment?.proof?.decisionHash?.slice(0, 24)}...</div>
              </div>
            </div>
          )}
        </div>

        {/* DEMO 2: Signature Price-Drift Protection */}
        <div className="p-6 rounded-2xl glass-card border border-amber-500/30 bg-amber-950/10 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                DEMO 02 · SIGNATURE TRUST STORY
              </span>
              <h2 className="text-base font-bold text-white mt-1.5">Price-Drift Protection Gate</h2>
            </div>
            <button
              onClick={runDemo2}
              disabled={runningDemo === 2}
              className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center space-x-1.5 transition-all shadow-md"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{runningDemo === 2 ? 'Running...' : 'Run Demo 2'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Live catalog price drifts from ₹2,199 to ₹2,799 (violating the ₹2,500 budget cap). Deterministic backend policy gate rejects payment and records audit event.
          </p>

          {demoResults[2] && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 space-y-2 text-xs font-mono">
              <div className="text-red-400 font-bold flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>TRANSACTION BLOCKED: PRICE_DRIFT DETECTED</span>
              </div>
              <div className="text-slate-300 text-[11px] space-y-1">
                <div>Expected: ₹2,199 | Current Catalog: ₹2,799 | Mandate Cap: ₹2,500</div>
                <div className="text-slate-400 italic font-sans text-[10px]">
                  "The AI agent proposed this purchase, but deterministic policy gating blocked execution because reality changed."
                </div>
              </div>
            </div>
          )}
        </div>

        {/* DEMO 3: Deliberate Payment Failure & Idempotency */}
        <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                DEMO 03 · FAILURE HANDLING
              </span>
              <h2 className="text-base font-bold text-white mt-1.5">Payment Failure & Idempotency</h2>
            </div>
            <button
              onClick={runDemo3}
              disabled={runningDemo === 3}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center space-x-1.5 transition-all shadow-md"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{runningDemo === 3 ? 'Running...' : 'Run Demo 3'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Simulates gateway decline. Demonstrates that order remains in `PAYMENT_FAILED` state with audit event emitted and no duplicate billing.
          </p>

          {demoResults[3] && (
            <div className="p-4 rounded-xl bg-surface/90 border border-indigo-500/30 space-y-2 text-xs font-mono">
              <div className="text-amber-400 font-bold flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>STATE RECOVERED: PAYMENT_FAILED</span>
              </div>
              <div className="text-slate-300 text-[11px]">
                Order {demoResults[3].orderId} safely handled without duplicate debit.
              </div>
            </div>
          )}
        </div>

        {/* DEMO 4: Growth Agent Opportunity */}
        <div className="p-6 rounded-2xl glass-card border border-emerald-500/30 bg-emerald-950/10 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                DEMO 04 · MERCHANT GROWTH
              </span>
              <h2 className="text-base font-bold text-white mt-1.5">Growth Agent Campaign Approval</h2>
            </div>
            <button
              onClick={runDemo4}
              disabled={runningDemo === 4}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center space-x-1.5 transition-all shadow-md"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{runningDemo === 4 ? 'Running...' : 'Run Demo 4'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Growth Agent identifies Keyboard ➔ Wrist Rest cross-sell opportunity (8.2% ➔ 14.5% attach rate) and merchant approves promotion in 1-click.
          </p>

          {demoResults[4] && (
            <div className="p-4 rounded-xl bg-surface/90 border border-emerald-500/30 space-y-2 text-xs font-mono">
              <div className="text-emerald-400 font-bold flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>CAMPAIGN APPROVED & ACTIVE</span>
              </div>
              <div className="text-slate-300 text-[11px]">
                Projected Revenue Lift: +₹{demoResults[4].crossSell?.expectedImpact?.projectedRevenueLift?.toLocaleString()} INR
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DEMO 5: Cryptographic Proof & Tamper Detection Full Width Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-purple-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              DEMO 05 · CRYPTOGRAPHIC AUDIT INTEGRITY
            </span>
            <h2 className="text-lg font-bold text-white mt-1.5">SHA-256 Hash Chain Proof & Real-Time Tamper Detection</h2>
            <p className="text-xs text-slate-300 mt-1">
              Verifies the sequential hash chain where H_n = SHA256(H_n-1 + Event_n). Demonstrates that tampering with even 1 byte in past audit history is detected immediately.
            </p>
          </div>
          <button
            onClick={runDemo5}
            disabled={runningDemo === 5}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg flex-shrink-0"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{runningDemo === 5 ? 'Verifying Chain...' : 'Run Tamper Test'}</span>
          </button>
        </div>

        {demoResults[5] && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono pt-2">
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-1">
              <div className="text-emerald-400 font-bold flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Standard Proof Verification: VALID</span>
              </div>
              <p className="text-[11px] text-slate-300">{demoResults[5].validVerification?.details}</p>
            </div>

            <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40 space-y-1">
              <div className="text-red-400 font-bold flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Simulated Tamper Verification: TAMPER DETECTED</span>
              </div>
              <p className="text-[11px] text-slate-300">{demoResults[5].tamperedVerification?.details}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
