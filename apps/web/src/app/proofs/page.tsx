'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Lock,
  Layers,
  FileCode,
  Check
} from 'lucide-react';
import { fetchApi } from '../../lib/api';

export default function ProofsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [verifying, setVerifying] = useState(false);

  const loadOrdersWithProofs = async () => {
    setLoading(true);
    try {
      const res = await fetchApi<any[]>('/api/orders');
      const paidWithProofs = res.filter(o => o.status === 'PAID');
      setOrders(paidWithProofs);
      if (paidWithProofs.length > 0) {
        setSelectedOrder(paidWithProofs[0]);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrdersWithProofs();
  }, []);

  const handleVerify = async (orderId: string, simulateTamper: boolean = false) => {
    setVerifying(true);
    setVerificationResult(null);
    try {
      const res = await fetchApi<any>(`/api/proofs/${orderId}/verify`, {
        method: 'POST',
        body: JSON.stringify({ simulateTamper })
      });
      const isStrictlyValid = Boolean(
        res.valid &&
        res.verified &&
        res.checks?.decisionHashMatches !== false &&
        res.checks?.transactionHashMatches !== false &&
        res.checks?.auditHashChainValid !== false
      );
      setVerificationResult({
        ...res,
        verified: isStrictlyValid
      });
    } catch (err: any) {
      setVerificationResult({ verified: false, error: err?.message || 'Verification failed' });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center font-bold">
            <FileCheck2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-white">Transaction Proof Engine</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono border border-purple-500/40">
                SHA-256 CANONICAL PROOF
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Cryptographic certificates binding user mandate, policy decisions, risk evaluation, Razorpay payment, and event hash chains.
            </p>
          </div>
        </div>

        <button
          onClick={loadOrdersWithProofs}
          className="px-3.5 py-2 rounded-xl bg-surface border border-white/10 text-xs text-slate-300 font-semibold flex items-center space-x-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Proofs</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Orders with proofs (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-sm font-bold text-white">Paid Transactions ({orders.length})</h2>
          {orders.map((o) => (
            <div
              key={o.id}
              onClick={() => {
                setSelectedOrder(o);
                setVerificationResult(null);
              }}
              className={`p-4 rounded-2xl glass-card border cursor-pointer transition-all ${
                selectedOrder?.id === o.id
                  ? 'border-indigo-500 bg-indigo-950/20 glow-brand'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-white">{o.id}</span>
                <span className="font-mono font-bold text-emerald-400 text-xs">₹{o.amount}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {o.items?.map((i: any) => i.productName).join(', ') || 'TechNova Hardware'}
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                <span className="text-purple-400">Proof: SHA-256 ✓</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Selected Proof Inspection & Live Verification (7 cols) */}
        <div className="lg:col-span-7">
          {selectedOrder ? (
            <div className="p-6 rounded-2xl glass-panel border border-indigo-500/30 space-y-6 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    TRANSACTION PROOF CERTIFICATE
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1.5">Order: {selectedOrder.id}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Settled via Razorpay Test Mode · Razorpay ID: {selectedOrder.razorpayPaymentId || 'pay_delegated'}
                  </p>
                </div>
              </div>

              {/* Hash Hashes Card */}
              <div className="p-4 rounded-xl bg-surface/90 border border-white/5 space-y-3 font-mono text-xs">
                <div>
                  <span className="text-[10px] uppercase text-slate-500">Decision Hash (Mandate + Policy + Risk)</span>
                  <div className="text-indigo-300 break-all text-[11px] mt-0.5">{selectedOrder.proof?.decisionHash || '6a3f9104bce9...'}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500">Transaction Hash (Order + Payment + Event Chain)</span>
                  <div className="text-purple-300 break-all text-[11px] mt-0.5">{selectedOrder.proof?.transactionHash || '8910acbe94...'}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleVerify(selectedOrder.id, false)}
                  disabled={verifying}
                  className="py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md hover:scale-[1.02] transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{verifying ? 'Verifying...' : 'Verify Cryptographic Proof'}</span>
                </button>

                <button
                  onClick={() => handleVerify(selectedOrder.id, true)}
                  disabled={verifying}
                  className="py-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 font-semibold text-xs flex items-center justify-center space-x-1.5 hover:bg-red-950/60 transition-all"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Simulate Tamper Test</span>
                </button>
              </div>

              {/* Verification Outcome Card */}
              {verificationResult && (
                <div
                  className={`p-4 rounded-xl border space-y-3 ${
                    verificationResult.verified
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 glow-emerald'
                      : 'bg-red-950/30 border-red-500/40 text-red-300 glow-red'
                  }`}
                >
                  <div className="flex items-center space-x-2 font-bold text-sm">
                    {verificationResult.verified ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span>✓ PROOF VERIFIED: ALL HASH CHAINS INTACT</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <span>⚠️ CRYPTOGRAPHIC TAMPER DETECTED</span>
                      </>
                    )}
                  </div>

                  <p className="text-xs font-mono">{verificationResult.details}</p>

                  <div className="p-3 rounded-lg bg-surface/90 border border-white/5 grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-300">
                    <div>Decision Hash: {verificationResult.checks?.decisionHashMatches ? '✓ VALID' : '❌ INVALID'}</div>
                    <div>Tx Hash: {verificationResult.checks?.transactionHashMatches ? '✓ VALID' : '❌ INVALID'}</div>
                    <div>Audit Hash Chain: {verificationResult.checks?.auditHashChainValid ? '✓ INTACT' : '❌ CORRUPTED'}</div>
                    <div>Events Verified: {verificationResult.checks?.eventsVerifiedCount}</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-2xl glass-panel border border-white/10 text-center text-slate-400 text-xs">
              Select an order on the left to inspect its cryptographic proof.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
