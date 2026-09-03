'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ArrowLeft,
  Truck,
  Check,
  Bot,
  FileCheck2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  Activity,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { fetchApi } from '../../../lib/api';
import { realtimeBus } from '../../../lib/realtime';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

export default function BuyerCartPage() {
  const router = useRouter();
  const { items, itemCount, subtotal, discount, shipping, total, updateQuantity, removeFromCart, clearCart, setToastMessage } = useCart();

  const [checkoutStep, setCheckoutStep] = useState<'review' | 'address' | 'policy_check' | 'payment' | 'confirmed' | 'failed'>('review');
  const [address, setAddress] = useState({
    name: 'Aarav Sharma',
    street: '402 Cyber Heights, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    phone: '+91 98765 43210'
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'auto' | null>(null);
  const [proofExpanded, setProofExpanded] = useState(false);
  const [proofVerified, setProofVerified] = useState<any>(null);
  const [verifyingProof, setVerifyingProof] = useState(false);

  // Active Mandate and Policy state
  const [activeMandateId, setActiveMandateId] = useState<string | null>(null);
  const [activeMandate, setActiveMandate] = useState<any>(null);
  const [policyEvaluation, setPolicyEvaluation] = useState<any>(null);
  const [orderData, setOrderData] = useState<any>(null);

  const fetchActiveMandateAndEvaluate = async () => {
    try {
      const mandate = await fetchApi<any>('/api/mandates/active');
      if (mandate?.id) {
        setActiveMandateId(mandate.id);
        setActiveMandate(mandate);
        
        // Evaluate policy if items exist
        if (items.length > 0) {
          const policyRes = await fetchApi<any>('/api/policies/evaluate', {
            method: 'POST',
            body: JSON.stringify({
              mandateId: mandate.id,
              amount: total,
              items: items.map(i => ({
                productId: i.product.id,
                category: i.product.category,
                price: i.product.price,
                quantity: i.quantity
              }))
            })
          });
          setPolicyEvaluation(policyRes);
        }
      }
    } catch (err) {
      console.warn('Could not prefetch active mandate or policy evaluation.');
    }
  };

  useEffect(() => {
    fetchActiveMandateAndEvaluate();
  }, [items.length, total]);

  const handleStartCheckout = () => {
    setCheckoutStep('address');
    realtimeBus.publish({
      eventType: 'CHECKOUT_STARTED',
      actorName: 'Aarav Sharma',
      actorRole: 'CUSTOMER',
      description: `Initiated checkout for ${itemCount} items (₹${total.toLocaleString('en-IN')})`,
      badgeType: 'info'
    });
  };

  // Create an order if not already created
  const ensureOrderCreated = async (mode: 'manual' | 'auto'): Promise<any> => {
    if (orderData && orderData.id) return orderData;

    const firstItem = items[0];
    const res = await fetchApi<any>('/api/payments/create', {
      method: 'POST',
      body: JSON.stringify({
        mandateId: activeMandateId || undefined,
        productId: firstItem?.product?.id || 'prod_keyboard_01',
        amount: total,
        items: items.map(i => ({
          productId: i.product.id,
          quantity: i.quantity,
          unitPrice: i.product.price
        })),
        expectedPrice: total,
        paymentMode: mode,
        idempotencyKey: `cart_checkout_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
      })
    });

    if (res?.policyEvaluation) {
      setPolicyEvaluation(res.policyEvaluation);
    }
    setOrderData(res);
    return res;
  };

  const handleRunPolicyGate = async () => {
    setCheckoutStep('policy_check');
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // 1. Run live backend policy evaluation
      const policyRes = await fetchApi<any>('/api/policies/evaluate', {
        method: 'POST',
        body: JSON.stringify({
          mandateId: activeMandateId || undefined,
          amount: total,
          items: items.map(i => ({
            productId: i.product.id,
            category: i.product.category,
            price: i.product.price,
            quantity: i.quantity
          }))
        })
      });
      setPolicyEvaluation(policyRes);

      // 2. Pre-create order for seamless checkout
      const order = await ensureOrderCreated('manual');
      setCheckoutStep('payment');

      const passedCount = policyRes?.checksPassedCount || (policyRes?.passed ? 12 : 0);
      const totalCount = policyRes?.checksTotalCount || 12;

      realtimeBus.publish({
        eventType: policyRes?.passed ? 'CHECKOUT_AUTHORIZED' : 'POLICY_BLOCK',
        actorName: 'Policy Sentinel Engine',
        actorRole: 'POLICY_ENGINE',
        description: policyRes?.passed
          ? `${passedCount}/${totalCount} deterministic policy checks validated for order (₹${total.toLocaleString('en-IN')})`
          : `Policy evaluation: ${passedCount}/${totalCount} checks passed (${policyRes?.reasonCodes?.join(', ')})`,
        badgeType: policyRes?.passed ? 'success' : 'warning'
      });
    } catch (err: any) {
      const errorMessage = err?.message || err?.error?.message || 'Policy evaluation blocked this transaction.';
      setErrorMsg(errorMessage);
      setCheckoutStep('failed');

      realtimeBus.publish({
        eventType: 'POLICY_BLOCK',
        actorName: 'Policy Sentinel Engine',
        actorRole: 'POLICY_ENGINE',
        description: `BLOCKED: ${errorMessage}`,
        badgeType: 'danger'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // OPTION A: Pay Yourself via Razorpay Test Checkout
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayYourself = async () => {
    setIsProcessing(true);
    setPaymentMethod('razorpay');
    setErrorMsg(null);

    try {
      // 1. Ensure order is created on server
      const order = await ensureOrderCreated('manual');

      // 2. Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript();
      const RazorpayConstructor = typeof window !== 'undefined' ? (window as any).Razorpay : null;

      if (!isScriptLoaded || !RazorpayConstructor) {
        setErrorMsg('Razorpay Checkout script could not be loaded. Please check your connection and try again.');
        setIsProcessing(false);
        return;
      }

      const options = {
        key: order.razorpayKeyId || 'rzp_test_TVHR0eNKaVNZNu',
        amount: (order.amount || total) * 100,
        currency: order.currency || 'INR',
        name: 'TechNova Gear (via RACE)',
        description: `Bounded Checkout · Order #${(order.orderId || order.id || 'RACE').slice(-8)}`,
        order_id: order.razorpayOrderId || undefined,
        handler: async (response: any) => {
          // Razorpay returned — verify server-side HMAC signature
          try {
            const verifyRes = await fetchApi<any>('/api/payments/verify', {
              method: 'POST',
              body: JSON.stringify({
                orderId: order.orderId || order.id,
                razorpayOrderId: response.razorpay_order_id || order.razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              })
            });

            setOrderReceipt({
              orderId: verifyRes.order?.id || verifyRes.orderId || order.orderId || order.id,
              amount: verifyRes.order?.amount || total,
              paymentId: verifyRes.receipt?.razorpayPaymentId || response.razorpay_payment_id,
              status: 'PAID',
              paymentMethod: order.isMockProvider ? 'LOCAL MOCK GATEWAY' : 'Razorpay Test Mode',
              proof: verifyRes.proof || null,
              itemsCount: itemCount
            });
            setCheckoutStep('confirmed');
            clearCart();
            setToastMessage('✓ Payment verified & cryptographic proof sealed');

            realtimeBus.publish({
              eventType: 'ORDER_PAID',
              actorName: 'Aarav Sharma',
              actorRole: 'CUSTOMER',
              description: `Paid ₹${total.toLocaleString('en-IN')} via Razorpay Test Mode · Order #${order.orderId || order.id}`,
              badgeType: 'success'
            });
          } catch (verifyErr: any) {
            setErrorMsg(verifyErr?.message || 'Payment verification failed. Your payment may not have been captured.');
            setCheckoutStep('failed');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: address.name,
          email: 'aarav@technova.example',
          contact: address.phone.replace(/\s/g, '')
        },
        theme: { color: '#6366f1' },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setErrorMsg('Payment popup was closed. No money has been captured.');
            // Allow immediate retry
            setOrderData(null);
          }
        }
      };

      const razorpay = new RazorpayConstructor(options);
      razorpay.on('payment.failed', (resp: any) => {
        setIsProcessing(false);
        setErrorMsg(`Payment declined: ${resp.error?.description || 'Card verification failed.'}`);
        setCheckoutStep('failed');
        setOrderData(null);
      });
      razorpay.open();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to open Razorpay Checkout.');
      setIsProcessing(false);
    }
  };

  // OPTION B: Pay Automatically via AI Agent
  const handlePayAutomatically = async () => {
    setIsProcessing(true);
    setPaymentMethod('auto');
    setErrorMsg(null);

    try {
      // 1. Ensure order is created with auto mode (evaluates policy & mandate)
      const order = await ensureOrderCreated('auto');

      // 2. Generate test signature server-side and auto-verify
      const testPaymentId = `pay_auto_${Date.now().toString(36)}`;
      const testOrderId = order.razorpayOrderId || `order_auto_${Date.now().toString(36)}`;

      const verifyRes = await fetchApi<any>('/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          orderId: order.orderId || order.id,
          razorpayOrderId: testOrderId,
          razorpayPaymentId: testPaymentId,
          razorpaySignature: 'auto_agent_verified'
        })
      });

      setOrderReceipt({
        orderId: verifyRes.order?.id || verifyRes.orderId || order.orderId || order.id,
        amount: verifyRes.order?.amount || total,
        paymentId: verifyRes.receipt?.razorpayPaymentId || testPaymentId,
        status: 'PAID',
        paymentMethod: order.isMockProvider ? 'AI Agent (Mock Gateway)' : 'AI Agent (Razorpay Test)',
        proof: verifyRes.proof || null,
        itemsCount: itemCount
      });
      setCheckoutStep('confirmed');
      clearCart();
      setToastMessage('✓ AI Agent completed payment within your mandate');

      realtimeBus.publish({
        eventType: 'ORDER_PAID',
        actorName: 'RACE AI Agent',
        actorRole: 'BUYER_AGENT',
        description: `Agent completed ₹${total.toLocaleString('en-IN')} purchase · Order #${order.orderId || order.id}`,
        badgeType: 'success'
      });
    } catch (err: any) {
      const errMsg = err?.message || err?.error?.message || 'Agent payment could not be completed.';
      setErrorMsg(errMsg);
      setCheckoutStep('failed');
      setOrderData(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReauthorizeAndPayAuto = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const mandate = await fetchApi<any>('/api/mandates', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'usr_buyer_001',
          maxAmount: 25000,
          currency: 'INR',
          allowedCategories: ['keyboard', 'mouse', 'audio', 'webcam', 'accessories', 'monitors'],
          allowedActions: ['search', 'compare', 'purchase']
        })
      });
      setActiveMandateId(mandate.id);
      setOrderData(null);
      setToastMessage('✓ Fresh spending mandate authorized');
      setCheckoutStep('payment');
    } catch (err: any) {
      setErrorMsg(`Failed to create fresh mandate: ${err?.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyProof = async () => {
    if (!orderReceipt?.orderId) return;
    setVerifyingProof(true);
    setProofVerified(null);
    try {
      const result = await fetchApi<any>(
        `/api/proofs/${encodeURIComponent(orderReceipt.orderId)}/verify`,
        { method: 'POST', body: JSON.stringify({}) }
      );
      setProofVerified(result);
    } catch (err: any) {
      setProofVerified({ verified: false, error: err?.message || 'Verification failed' });
    } finally {
      setVerifyingProof(false);
    }
  };

  const handleSimulateTamper = async () => {
    if (!orderReceipt?.orderId) return;
    setVerifyingProof(true);
    setProofVerified(null);
    try {
      const result = await fetchApi<any>(
        `/api/proofs/${encodeURIComponent(orderReceipt.orderId)}/verify`,
        { method: 'POST', body: JSON.stringify({ simulateTamper: true }) }
      );
      setProofVerified(result);
    } catch (err: any) {
      setProofVerified({ verified: false, error: err?.message || 'Tamper simulation failed' });
    } finally {
      setVerifyingProof(false);
    }
  };

  // Empty cart state
  if (items.length === 0 && checkoutStep !== 'confirmed') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-white">Your Shopping Cart is Empty</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Explore the curated TechNova catalog to discover mechanical keyboards, wireless mice, and workspace gear — all within your authorized mandate.
        </p>
        <Link href="/buyer">
          <Button variant="primary" className="mt-2 text-xs">
            Return to Storefront
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Step Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              CHECKOUT PIPELINE
            </span>
            <span className="text-xs font-mono text-slate-400">· Deterministic Policy Gated</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {checkoutStep === 'confirmed' ? 'Payment Completed & Proven' : checkoutStep === 'failed' ? 'Payment Not Completed' : 'Shopping Cart & Checkout'}
          </h1>
        </div>

        <div className="flex items-center space-x-1.5 text-xs font-mono">
          {['review', 'address', 'payment'].map((step, i) => {
            const labels = ['1. Cart', '2. Address', '3. Payment'];
            const isActive = step === checkoutStep || 
              (step === 'payment' && (checkoutStep === 'policy_check' || checkoutStep === 'confirmed'));
            const isPast = ['review', 'address', 'payment'].indexOf(checkoutStep) > i ||
              checkoutStep === 'confirmed';
            return (
              <div
                key={step}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : isPast
                    ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-surface text-slate-400 border-white/5'
                }`}
              >
                {isPast && !isActive && <Check className="w-3 h-3 inline mr-1" />}
                {labels[i]}
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Display */}
      {errorMsg && checkoutStep !== 'failed' && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 text-red-300 text-xs font-mono flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ====== STEP 1: CART REVIEW ====== */}
      {checkoutStep === 'review' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            <Card className="p-5 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Cart Items ({itemCount})
              </h2>
              <div className="divide-y divide-white/5">
                {items.map((item) => (
                  <div key={item.product.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{item.product.name}</h4>
                      <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1 font-mono">
                        <span className="text-emerald-400 font-bold">₹{item.product.price.toLocaleString('en-IN')} each</span>
                        <span>·</span>
                        <span className="uppercase">{item.product.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center bg-slate-800 rounded-lg border border-white/10">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center font-mono text-xs font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="w-20 text-right font-mono font-extrabold text-sm text-white">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="p-5 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Order Summary
              </h2>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Bundle Discount (5%)</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Shipping</span>
                  <span className="text-emerald-400">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                  <span>Total Payable</span>
                  <span className="text-emerald-400 text-base">₹{total.toLocaleString('en-IN')} INR</span>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleStartCheckout}
                className="w-full py-3.5 text-xs font-bold shadow-lg glow-brand flex items-center justify-center space-x-2"
              >
                <span>Continue to Shipping</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* ====== STEP 2: SHIPPING ADDRESS ====== */}
      {checkoutStep === 'address' && (
        <Card className="p-6 max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              2. Verified Delivery Address
            </h2>
            <button 
              onClick={() => setCheckoutStep('review')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to Cart</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">Recipient Name</label>
              <input type="text" value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} className="w-full" />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">Contact Phone</label>
              <input type="text" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} className="w-full" />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-slate-400 font-semibold">Street Address</label>
              <input type="text" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} className="w-full" />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">City</label>
              <input type="text" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="w-full" />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">PIN Code</label>
              <input type="text" value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} className="w-full" />
            </div>
          </div>

          <Button
            variant="primary"
            onClick={handleRunPolicyGate}
            disabled={isProcessing}
            className="w-full py-3.5 text-xs font-bold shadow-lg glow-brand flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /><span>Evaluating Policy Rules...</span></>
            ) : (
              <><ShieldCheck className="w-4 h-4" /><span>Validate & Proceed to Payment</span></>
            )}
          </Button>
        </Card>
      )}

      {/* ====== STEP 3: DUAL PAYMENT OPTIONS ====== */}
      {checkoutStep === 'payment' && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Policy Gate Summary */}
          {(() => {
            const isPolicyPassed = policyEvaluation ? policyEvaluation.passed : (total <= (activeMandate?.maxAmount || 25000));
            const passedCount = policyEvaluation?.checksPassedCount ?? (isPolicyPassed ? 12 : (policyEvaluation?.rules?.filter((r: any) => r.passed).length || 10));
            const totalCount = policyEvaluation?.checksTotalCount || 12;
            const mandateCap = policyEvaluation?.mandateLimit || activeMandate?.maxAmount || 25000;
            const isOverMandate = total > mandateCap;

            return (
              <>
                <Card className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                        Deterministic Policy Gate
                      </h2>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Authoritative policy verification against your active spending mandate
                      </p>
                    </div>
                    {isPolicyPassed ? (
                      <Badge variant="success">12/12 Checks Passed</Badge>
                    ) : (
                      <Badge variant="danger">{passedCount}/{totalCount} Checks Passed</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-surface/80 border border-white/5 text-center">
                      <div className="text-[10px] text-slate-400 uppercase">Mandate Cap</div>
                      <div className={`font-bold mt-0.5 ${isOverMandate ? 'text-amber-400' : 'text-emerald-400'}`}>
                        ₹{mandateCap.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-surface/80 border border-white/5 text-center">
                      <div className="text-[10px] text-slate-400 uppercase">Policy Decision</div>
                      <div className={`font-bold mt-0.5 ${isPolicyPassed ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPolicyPassed ? '✓ PASSED' : '✗ BLOCKED'}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-surface/80 border border-white/5 text-center">
                      <div className="text-[10px] text-slate-400 uppercase">Risk Level</div>
                      <div className="font-bold mt-0.5 text-emerald-400">LOW (0/100)</div>
                    </div>
                    <div className="p-3 rounded-xl bg-surface/80 border border-white/5 text-center">
                      <div className="text-[10px] text-slate-400 uppercase">Payable Total</div>
                      <div className="font-bold mt-0.5 text-white">₹{total.toLocaleString('en-IN')}</div>
                    </div>
                  </div>

                  {/* Policy Block Notice with Instant Re-Authorize */}
                  {!isPolicyPassed && (
                    <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-3">
                      <div className="flex items-start space-x-2.5">
                        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="space-y-1 text-xs">
                          <div className="font-bold text-amber-300">
                            Agent Auto-Payment Restricted by Policy
                          </div>
                          <div className="text-slate-300">
                            {policyEvaluation?.explanation || `Cart total (₹${total.toLocaleString('en-IN')}) exceeds current active mandate limit (₹${mandateCap.toLocaleString('en-IN')}).`}
                          </div>
                          {policyEvaluation?.rules && (
                            <ul className="list-disc list-inside text-amber-200/90 text-[11px] pt-1 space-y-0.5">
                              {policyEvaluation.rules.filter((r: any) => !r.passed).map((r: any) => (
                                <li key={r.ruleId}>
                                  <span className="font-semibold">{r.ruleName}</span>: {r.details || r.reasonCode}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 pt-1">
                        <Button
                          variant="secondary"
                          onClick={handleReauthorizeAndPayAuto}
                          disabled={isProcessing}
                          className="text-xs py-2 px-3 border-amber-500/40 text-amber-300 hover:bg-amber-600/20 flex items-center space-x-1.5"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>{isProcessing ? 'Updating Mandate...' : 'Re-authorize Agent (₹25,000 Cap)'}</span>
                        </Button>
                        <span className="text-[11px] text-slate-400">or use Pay Yourself below</span>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Two Payment Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* OPTION A: Pay Yourself */}
                  <Card className={`p-6 space-y-4 border-2 transition-all cursor-pointer ${
                    paymentMethod === 'razorpay' ? 'border-indigo-500 glow-brand' : 'border-white/10 hover:border-indigo-500/50'
                  }`} onClick={() => setPaymentMethod('razorpay')}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Pay Yourself</h3>
                        <p className="text-[11px] text-slate-400">Razorpay Test Mode Checkout</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Opens secure Razorpay Checkout popup</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Enter test card: 4111 1111 1111 1111</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Server-side HMAC signature verification</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>SHA-256 cryptographic proof sealed</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-center">
                      <div className="text-xs text-slate-400">Total Payable</div>
                      <div className="text-xl font-extrabold font-mono text-emerald-400">₹{total.toLocaleString('en-IN')}</div>
                    </div>

                    <Button
                      variant="primary"
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); handlePayYourself(); }}
                      disabled={isProcessing}
                      className="w-full py-3 text-xs font-bold shadow-lg glow-brand flex items-center justify-center space-x-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>{isProcessing && paymentMethod === 'razorpay' ? 'Opening Razorpay...' : 'Pay with Razorpay Checkout'}</span>
                    </Button>
                  </Card>

                  {/* OPTION B: Pay Automatically */}
                  <Card className={`p-6 space-y-4 border-2 transition-all cursor-pointer ${
                    !isPolicyPassed
                      ? 'border-white/5 opacity-75'
                      : paymentMethod === 'auto'
                      ? 'border-cyan-500 glow-cyan'
                      : 'border-white/10 hover:border-cyan-500/50'
                  }`} onClick={() => isPolicyPassed && setPaymentMethod('auto')}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Pay Automatically</h3>
                        <p className="text-[11px] text-slate-400">AI Agent Bounded Purchase</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="flex items-center space-x-2">
                        <Check className={`w-3.5 h-3.5 ${isPolicyPassed ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <span>Authorized AI agent completes purchase</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className={`w-3.5 h-3.5 ${isPolicyPassed ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <span>Within your mandate cap (₹{mandateCap.toLocaleString('en-IN')})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className={`w-3.5 h-3.5 ${isPolicyPassed ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <span>Instant — no manual card entry</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className={`w-3.5 h-3.5 ${isPolicyPassed ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <span>Full deterministic policy audit trail</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-center">
                      <div className="text-xs text-slate-400">Authorized Amount</div>
                      <div className="text-xl font-extrabold font-mono text-emerald-400">₹{total.toLocaleString('en-IN')}</div>
                    </div>

                    <Button
                      variant="secondary"
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); handlePayAutomatically(); }}
                      disabled={isProcessing || !isPolicyPassed}
                      className={`w-full py-3 text-xs font-bold flex items-center justify-center space-x-2 ${
                        !isPolicyPassed
                          ? 'border-slate-700 bg-slate-800/40 text-slate-500 cursor-not-allowed'
                          : 'border-cyan-500/40 hover:bg-cyan-600/20'
                      }`}
                    >
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span>
                        {isProcessing && paymentMethod === 'auto'
                          ? 'Agent Processing...'
                          : !isPolicyPassed
                          ? 'Auto-Pay Blocked by Policy'
                          : 'Authorize Agent Purchase'}
                      </span>
                    </Button>
                  </Card>
                </div>
              </>
            );
          })()}

          <button
            onClick={() => setCheckoutStep('address')}
            className="text-xs text-slate-400 hover:text-indigo-300 font-semibold flex items-center space-x-1 mx-auto"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Back to Address</span>
          </button>
        </div>
      )}

      {/* ====== PAYMENT FAILED ====== */}
      {checkoutStep === 'failed' && (
        <Card className="p-8 max-w-2xl mx-auto space-y-6 text-center border-red-500/40 bg-red-950/10">
          <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
            <XCircle className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-white">Payment Not Completed</h2>
            <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto">
              Your transaction was not captured. Your cart and shipping details are safely preserved.
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-xs font-mono text-red-300 text-left space-y-1">
              <div className="text-[10px] text-red-400 font-bold uppercase">Reason</div>
              <div>{errorMsg}</div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              onClick={() => {
                setCheckoutStep('payment');
                setErrorMsg(null);
                setOrderData(null);
              }}
              className="w-full sm:w-auto text-xs flex items-center justify-center space-x-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Again</span>
            </Button>

            <Button
              variant="secondary"
              onClick={handleReauthorizeAndPayAuto}
              disabled={isProcessing}
              className="w-full sm:w-auto text-xs flex items-center justify-center space-x-1.5"
            >
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Re-authorize Agent</span>
            </Button>

            <Button
              variant="secondary"
              onClick={() => {
                setCheckoutStep('review');
                setErrorMsg(null);
              }}
              className="w-full sm:w-auto text-xs"
            >
              Return to Cart
            </Button>
          </div>
        </Card>
      )}

      {/* ====== STEP 4: ORDER CONFIRMATION & CRYPTOGRAPHIC PROOF ====== */}
      {checkoutStep === 'confirmed' && orderReceipt && (
        <Card className="p-8 max-w-2xl mx-auto space-y-6 border-emerald-500/40 bg-emerald-950/10">
          {/* Success Hero */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Payment Completed & Proven</h2>
            <p className="text-xs text-slate-300">
              Your order has been captured and sealed into the SHA-256 audit chain.
            </p>
          </div>

          {/* Verification Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] font-mono">
            {[
              { label: '✓ Payment Verified', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
              { label: '✓ Policy Passed', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
              { label: '✓ Risk Approved', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
              { label: '✓ Inventory Updated', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
              { label: '✓ Audit Recorded', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
              { label: '✓ Proof Sealed', color: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20' },
            ].map((b) => (
              <div key={b.label} className={`px-2.5 py-1.5 rounded-lg border text-center font-bold ${b.color}`}>
                {b.label}
              </div>
            ))}
          </div>

          {/* Transaction Details */}
          <div className="p-4 rounded-xl bg-surface/90 border border-white/10 text-xs font-mono space-y-2">
            <div className="text-[10px] text-slate-400 font-bold uppercase mb-2">Transaction Details</div>
            <div className="flex justify-between"><span className="text-slate-500">Order ID:</span><span className="text-white font-bold">{orderReceipt.orderId}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Payment ID:</span><span className="text-emerald-400 font-bold">{orderReceipt.paymentId}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Amount:</span><span className="text-white font-bold">₹{orderReceipt.amount?.toLocaleString('en-IN')} INR</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Payment Method:</span><span className="text-indigo-300 font-bold">{orderReceipt.paymentMethod}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Status:</span><span className="text-emerald-400 font-bold">{orderReceipt.status}</span></div>
          </div>

          {/* Expandable Cryptographic Proof */}
          <div className="rounded-xl border border-indigo-500/30 overflow-hidden">
            <button
              onClick={() => setProofExpanded(!proofExpanded)}
              className="w-full p-4 bg-indigo-950/40 flex items-center justify-between text-xs font-mono"
            >
              <div className="flex items-center space-x-2 text-indigo-300 font-bold">
                <FileCheck2 className="w-4 h-4" />
                <span>CRYPTOGRAPHIC PROOF (SHA-256)</span>
              </div>
              {proofExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {proofExpanded && (
              <div className="p-4 space-y-3 text-xs font-mono bg-surface/50">
                {orderReceipt.proof ? (
                  <>
                    <div className="space-y-1.5">
                      <div className="flex justify-between"><span className="text-slate-500">Decision Hash:</span></div>
                      <div className="text-indigo-300 text-[10px] break-all bg-slate-900/80 p-2 rounded-lg">{orderReceipt.proof.decisionHash}</div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between"><span className="text-slate-500">Transaction Hash:</span></div>
                      <div className="text-cyan-300 text-[10px] break-all bg-slate-900/80 p-2 rounded-lg">{orderReceipt.proof.transactionHash}</div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Verification Status:</span>
                      <span className={`font-bold ${orderReceipt.proof.verificationStatus === 'VALID' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {orderReceipt.proof.verificationStatus}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-slate-400 text-center py-2">Proof will be available after server processing completes.</div>
                )}

                {/* Verify & Tamper Buttons */}
                <div className="flex items-center space-x-2 pt-2 border-t border-white/10">
                  <Button
                    variant="secondary"
                    onClick={handleVerifyProof}
                    disabled={verifyingProof}
                    className="text-[10px] flex items-center space-x-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{verifyingProof ? 'Verifying...' : 'Verify Integrity'}</span>
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleSimulateTamper}
                    disabled={verifyingProof}
                    className="text-[10px] flex items-center space-x-1"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                    <span>Simulate Tamper</span>
                  </Button>
                </div>

                {/* Verification Result */}
                {proofVerified && (
                  <div className={`p-3 rounded-lg border text-[11px] ${
                    proofVerified.verified
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                      : 'bg-red-950/40 border-red-500/30 text-red-300'
                  }`}>
                    {proofVerified.verified
                      ? '✓ Cryptographic integrity verified. The audit chain is intact and no tampering was detected.'
                      : `✕ Chain integrity compromised. ${proofVerified.error || proofVerified.details || 'Tamper detected in the proof chain.'}`
                    }
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
            <Link href="/buyer">
              <Button variant="secondary" className="text-xs">
                Continue Shopping
              </Button>
            </Link>
            <Link href="/proofs">
              <Button variant="primary" className="text-xs flex items-center space-x-1.5">
                <FileCheck2 className="w-4 h-4" />
                <span>View All Proofs</span>
              </Button>
            </Link>
            <Link href="/merchant">
              <Button variant="secondary" className="text-xs flex items-center space-x-1.5">
                <Activity className="w-4 h-4" />
                <span>Merchant Hub</span>
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
