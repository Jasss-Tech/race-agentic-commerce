'use client';

import React, { useEffect, useState } from 'react';
import {
  Bot,
  Send,
  ShieldCheck,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  CreditCard,
  RefreshCw,
  Clock,
  Layers
} from 'lucide-react';
import {
  ProductDto,
  MandateDto,
  BuyerAgentMessageResponse
} from '@race/types';
import { fetchApi } from '../../lib/api';

type CheckoutStep =
  | 'idle'
  | 'authorizing'
  | 'ready_to_pay'
  | 'paid'
  | 'blocked';

type ReceiptData = {
  success?: boolean;
  orderId?: string;
  paymentId?: string;
  razorpayPaymentId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  message?: string;
  isDuplicate?: boolean;

  order?: {
    id?: string;
  };

  receipt?: {
    razorpayPaymentId?: string;
  };

  proof?: {
    id?: string;
    decisionHash?: string;
    transactionHash?: string;
    verificationStatus?: string;
  } | null;
};

type ProofVerificationResult = {
  verified: boolean;
  orderId: string;
  decisionHash: string;
  transactionHash: string;

  checks?: {
    decisionHashMatches?: boolean;
    transactionHashMatches?: boolean;
    auditHashChainValid?: boolean;
    eventsVerifiedCount?: number;
  };

  integrityStatus?: string;
  details?: string;
};

export default function BuyerPage() {
  const [messages, setMessages] = useState<
    Array<{
      sender: 'user' | 'agent';
      text: string;
      data?: BuyerAgentMessageResponse;
    }>
  >([
    {
      sender: 'agent',
      text:
        'Hello! I am your autonomous Buyer Agent. Tell me what you are looking for, and I will search the agentic catalog, compare specifications, and safely prepare a bounded checkout.'
    }
  ]);

  const [input, setInput] = useState(
    'Find me a mechanical keyboard under ₹2500'
  );

  const [loading, setLoading] = useState(false);

  const [activeMandate, setActiveMandate] =
    useState<MandateDto | null>(null);

  const [selectedProduct, setSelectedProduct] =
    useState<ProductDto | null>(null);

  const [checkoutStep, setCheckoutStep] =
    useState<CheckoutStep>('idle');

  const [authDetails, setAuthDetails] =
    useState<any>(null);

  const [blockError, setBlockError] =
    useState<any>(null);

  const [receiptData, setReceiptData] =
    useState<ReceiptData | null>(null);

  const [verifyingProof, setVerifyingProof] =
    useState(false);

  const [proofVerified, setProofVerified] =
    useState<ProofVerificationResult | null>(null);

  useEffect(() => {
    async function initMandate() {
      try {
        const mandate = await fetchApi<MandateDto>(
          '/api/mandates',
          {
            method: 'POST',
            body: JSON.stringify({
              userId: 'usr_buyer_001',
              maxAmount: 2500,
              currency: 'INR',
              allowedCategories: [
                'keyboard',
                'accessories'
              ],
              allowedActions: [
                'search',
                'compare',
                'purchase'
              ]
            })
          }
        );

        setActiveMandate(mandate);
      } catch (err) {
        console.error(
          'Error creating default mandate:',
          err
        );
      }
    }

    initMandate();
  }, []);

  const handleSendMessage = async (
    customQuery?: string
  ) => {
    const queryText = customQuery || input;

    if (!queryText.trim() || loading) {
      return;
    }

    const newMessages = [
      ...messages,
      {
        sender: 'user' as const,
        text: queryText
      }
    ];

    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setSelectedProduct(null);
    setCheckoutStep('idle');
    setAuthDetails(null);
    setBlockError(null);
    setReceiptData(null);
    setProofVerified(null);

    try {
      const response =
        await fetchApi<BuyerAgentMessageResponse>(
          '/api/agents/buyer/message',
          {
            method: 'POST',
            body: JSON.stringify({
              message: queryText,
              mandateId: activeMandate?.id
            })
          }
        );

      setMessages([
        ...newMessages,
        {
          sender: 'agent',
          text: response.message,
          data: response
        }
      ]);

      if (
        response.products &&
        response.products.length > 0
      ) {
        setSelectedProduct(
          response.products[0]
        );
      }
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          sender: 'agent',
          text:
            `⚠️ Agent processing error: ${err?.message || 'Unknown error'
            }`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript =
    (): Promise<boolean> => {
      return new Promise((resolve) => {
        if (
          typeof window !== 'undefined' &&
          (window as any).Razorpay
        ) {
          resolve(true);
          return;
        }

        const existingScript =
          document.querySelector(
            'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
          );

        if (existingScript) {
          existingScript.addEventListener(
            'load',
            () => resolve(true)
          );

          existingScript.addEventListener(
            'error',
            () => resolve(false)
          );

          return;
        }

        const script =
          document.createElement('script');

        script.src =
          'https://checkout.razorpay.com/v1/checkout.js';

        script.async = true;

        script.onload = () =>
          resolve(true);

        script.onerror = () =>
          resolve(false);

        document.body.appendChild(script);
      });
    };

  const savePaymentVerification = (
    verifyResult: any
  ) => {
    /*
     * IMPORTANT:
     *
     * /api/payments/verify returns:
     *
     * {
     *   orderId,
     *   paymentId,
     *   razorpayPaymentId,
     *   amount,
     *   currency,
     *   status,
     *   proof
     * }
     *
     * It does NOT necessarily return:
     *
     * {
     *   order: {},
     *   receipt: {}
     * }
     *
     * Normalize everything here so the rest of the
     * UI always works with one predictable structure.
     */

    const normalized: ReceiptData = {
      ...verifyResult,

      orderId:
        verifyResult?.orderId ||
        verifyResult?.order?.id,

      razorpayPaymentId:
        verifyResult?.razorpayPaymentId ||
        verifyResult?.receipt
          ?.razorpayPaymentId ||
        verifyResult?.paymentId,

      proof:
        verifyResult?.proof || null
    };

    setReceiptData(normalized);
    setProofVerified(null);
    setCheckoutStep('paid');
  };

  const handleInitiateCheckout =
    async (product: ProductDto) => {
      if (!activeMandate) {
        alert(
          'Active intent mandate is not available.'
        );
        return;
      }

      setCheckoutStep('authorizing');
      setBlockError(null);
      setReceiptData(null);
      setProofVerified(null);

      try {
        const result =
          await fetchApi<any>(
            '/api/agents/buyer/checkout',
            {
              method: 'POST',
              body: JSON.stringify({
                mandateId:
                  activeMandate.id,

                productId:
                  product.id,

                expectedPrice:
                  product.price,

                quantity: 1,

                idempotencyKey:
                  `idemp_${product.id}_${Date.now()}`
              })
            }
          );

        setAuthDetails(result);
        setCheckoutStep('ready_to_pay');
      } catch (err: any) {
        console.error(
          'Checkout authorization failed:',
          err
        );

        const error =
          err?.error ||
          err?.response?.error ||
          err;

        setBlockError({
          code:
            error?.code ||
            'AUTHORIZATION_BLOCKED',

          message:
            error?.message ||
            'Authorization declined by deterministic policy engine.',

          details:
            error?.details
        });

        setCheckoutStep('blocked');
      }
    };

  const handleExecutePayment =
    async () => {
      if (!authDetails) {
        return;
      }

      setLoading(true);

      try {
        /*
         * LOCAL MOCK PROVIDER
         */
        if (
          authDetails.isMockProvider ||
          !authDetails.razorpayKeyId ||
          authDetails.razorpayKeyId
            .toLowerCase()
            .includes('mock')
        ) {
          const verifyResult =
            await fetchApi<any>(
              '/api/payments/verify',
              {
                method: 'POST',

                body: JSON.stringify({
                  orderId:
                    authDetails.orderId,

                  razorpayOrderId:
                    authDetails.razorpayOrderId,

                  razorpayPaymentId:
                    `pay_mock_${Date.now()}`,

                  razorpaySignature:
                    'mock_signature_valid'
                })
              }
            );

          savePaymentVerification(
            verifyResult
          );

          return;
        }

        /*
         * REAL RAZORPAY CHECKOUT
         */
        const loaded =
          await loadRazorpayScript();

        if (!loaded) {
          throw new Error(
            'Razorpay Checkout SDK failed to load.'
          );
        }

        const RazorpayConstructor =
          (window as any).Razorpay;

        if (!RazorpayConstructor) {
          throw new Error(
            'Razorpay Checkout is unavailable.'
          );
        }

        const options = {
          key:
            authDetails.razorpayKeyId,

          amount:
            Math.round(
              Number(authDetails.amount) * 100
            ),

          currency:
            authDetails.currency || 'INR',

          name:
            'TechNova Gear',

          description:
            'Autonomous Agent Delegated Checkout',

          order_id:
            authDetails.razorpayOrderId,

          handler:
            async function (
              response: any
            ) {
              try {
                const verifyResult =
                  await fetchApi<any>(
                    '/api/payments/verify',
                    {
                      method: 'POST',

                      body: JSON.stringify({
                        orderId:
                          authDetails.orderId,

                        razorpayOrderId:
                          response
                            .razorpay_order_id,

                        razorpayPaymentId:
                          response
                            .razorpay_payment_id,

                        razorpaySignature:
                          response
                            .razorpay_signature
                      })
                    }
                  );

                savePaymentVerification(
                  verifyResult
                );
              } catch (
              verifyErr: any
              ) {
                console.error(
                  'Payment verification error:',
                  verifyErr
                );

                alert(
                  `Payment verification error: ${verifyErr?.message ||
                  'Verification failed.'
                  }`
                );
              } finally {
                setLoading(false);
              }
            },

          prefill: {
            name: 'Aarav Sharma',
            email: 'aarav@race.exchange'
          },

          theme: {
            color: '#6366f1'
          },

          modal: {
            ondismiss:
              function () {
                setLoading(false);
              }
          }
        };

        const razorpay =
          new RazorpayConstructor(
            options
          );

        razorpay.open();
      } catch (err: any) {
        console.error(
          'Payment error:',
          err
        );

        alert(
          `Payment error: ${err?.message ||
          'Unable to process payment.'
          }`
        );

        setLoading(false);
      }
    };

  /*
   * NORMAL PROOF VERIFICATION
   *
   * The API endpoint is:
   *
   * POST /api/proofs/:orderId/verify
   *
   * Fastify requires JSON for this route.
   * Therefore we explicitly send:
   *
   * Content-Type: application/json
   * Body: {}
   */
  const handleVerifyProof =
    async () => {
      const orderId =
        receiptData?.orderId ||
        receiptData?.order?.id;

      if (!orderId) {
        alert(
          'Order ID is missing. Cannot verify proof.'
        );
        return;
      }

      setVerifyingProof(true);
      setProofVerified(null);

      try {
        const result =
          await fetchApi<ProofVerificationResult>(
            `/api/proofs/${encodeURIComponent(
              orderId
            )}/verify`,
            {
              method: 'POST',
              headers: {
                'Content-Type':
                  'application/json'
              },
              body: JSON.stringify({})
            }
          );

        setProofVerified(result);
      } catch (err: any) {
        console.error(
          'Proof verification failed:',
          err
        );

        alert(
          `Proof verification failed: ${err?.message ||
          'Unable to verify cryptographic proof.'
          }`
        );
      } finally {
        setVerifyingProof(false);
      }
    };

  /*
   * TAMPER SIMULATION
   *
   * This intentionally asks the backend to alter
   * an audit block only in memory and verify it.
   *
   * The real database chain remains untouched.
   */
  const handleSimulateTamper =
    async () => {
      const orderId =
        receiptData?.orderId ||
        receiptData?.order?.id;

      if (!orderId) {
        alert(
          'Order ID is missing. Cannot run tamper test.'
        );
        return;
      }

      setVerifyingProof(true);
      setProofVerified(null);

      try {
        const result =
          await fetchApi<ProofVerificationResult>(
            `/api/proofs/${encodeURIComponent(
              orderId
            )}/verify`,
            {
              method: 'POST',
              headers: {
                'Content-Type':
                  'application/json'
              },
              body: JSON.stringify({
                simulateTamper: true
              })
            }
          );

        setProofVerified(result);
      } catch (err: any) {
        console.error(
          'Tamper test failed:',
          err
        );

        alert(
          `Tamper test failed: ${err?.message ||
          'Unable to run tamper test.'
          }`
        );
      } finally {
        setVerifyingProof(false);
      }
    };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* ACTIVE MANDATE */}
      <div className="p-4 rounded-2xl glass-panel border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-4">

        <div className="flex items-center space-x-3">

          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>

          <div>

            <div className="flex items-center space-x-2">

              <span className="font-bold text-white text-sm">
                Active Intent Mandate
              </span>

              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/40">
                ACTIVE
              </span>

            </div>

            <p className="text-xs text-slate-400 mt-0.5">
              Bounded to{' '}
              <strong className="text-white">
                ₹{activeMandate?.maxAmount || 2500} INR
              </strong>{' '}
              for categories: [
              keyboard, accessories
              ]
            </p>

          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono text-slate-300">

          <div className="flex items-center space-x-1.5">

            <Clock className="w-3.5 h-3.5 text-indigo-400" />

            <span>
              Expires in ~120m
            </span>

          </div>

        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* BUYER AGENT */}
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">

          <div className="p-5 border-b border-white/10">

            <div className="flex items-center space-x-3">

              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <Bot className="w-5 h-5 text-indigo-400" />
              </div>

              <div>

                <h2 className="text-base font-bold text-white">
                  Buyer Agent
                </h2>

                <p className="text-xs text-slate-400">
                  Bounded autonomous commerce assistant
                </p>

              </div>

            </div>

          </div>

          <div className="p-5 space-y-4">

            {/* CHAT MESSAGES */}
            <div className="space-y-3 max-h-[430px] overflow-y-auto pr-1">

              {messages.map(
                (message, index) => (

                  <div
                    key={index}
                    className={
                      message.sender === 'user'
                        ? 'flex justify-end'
                        : 'flex justify-start'
                    }
                  >

                    <div
                      className={
                        message.sender === 'user'
                          ? 'max-w-[85%] rounded-xl bg-indigo-600/20 border border-indigo-500/30 px-4 py-3 text-xs text-indigo-100'
                          : 'max-w-[90%] rounded-xl bg-slate-900/70 border border-white/10 px-4 py-3 text-xs text-slate-300'
                      }
                    >
                      {message.text}
                    </div>

                  </div>

                )
              )}

            </div>

            {/* INPUT */}
            <div className="flex items-center gap-2">

              <input
                value={input}
                onChange={(e) =>
                  setInput(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
                disabled={loading}
                className="flex-1 rounded-xl bg-slate-900/80 border border-white/10 px-4 py-3 text-xs text-white outline-none focus:border-indigo-500/50"
                placeholder="Ask the Buyer Agent..."
              />

              <button
                onClick={() =>
                  handleSendMessage()
                }
                disabled={
                  loading ||
                  !input.trim()
                }
                className="w-11 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 flex items-center justify-center"
              >

                {loading ? (
                  <RefreshCw className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Send className="w-4 h-4 text-white" />
                )}

              </button>

            </div>

          </div>

        </div>

        {/* CHECKOUT / PRODUCT */}
        <div className="space-y-5">

          {selectedProduct ? (

            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">

              {/* PRODUCT HEADER */}
              <div className="p-5 border-b border-white/10">

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <div className="flex items-center space-x-2">

                      <Layers className="w-4 h-4 text-indigo-400" />

                      <span className="text-[10px] uppercase tracking-wider font-mono text-indigo-300">
                        Agent Selected Product
                      </span>

                    </div>

                    <h2 className="mt-2 text-lg font-bold text-white">
                      {selectedProduct.name}
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      {selectedProduct.description}
                    </p>

                  </div>

                  <div className="text-right">

                    <div className="text-xl font-bold text-white">
                      ₹{selectedProduct.price}
                    </div>

                    <div className="text-[10px] text-slate-500">
                      {selectedProduct.currency}
                    </div>

                  </div>

                </div>

              </div>

              {/* PRODUCT DETAILS */}
              <div className="p-5 space-y-4">

                <div className="grid grid-cols-2 gap-3">

                  <div className="rounded-xl bg-slate-900/60 border border-white/5 p-3">

                    <div className="text-[10px] text-slate-500">
                      Category
                    </div>

                    <div className="text-xs text-white font-semibold mt-1">
                      {selectedProduct.category}
                    </div>

                  </div>

                  <div className="rounded-xl bg-slate-900/60 border border-white/5 p-3">

                    <div className="text-[10px] text-slate-500">
                      Stock
                    </div>

                    <div className="text-xs text-emerald-400 font-semibold mt-1">
                      {selectedProduct.stock}
                    </div>

                  </div>

                </div>

                {/* ATTRIBUTES */}
                <div className="p-3.5 rounded-xl bg-surface/70 border border-white/5 space-y-2">

                  <span className="font-semibold text-slate-300 text-[11px]">
                    Machine-Readable Specifications:
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">

                    {Object.entries(
                      selectedProduct.attributes || {}
                    ).map(
                      ([key, value]) => (

                        <div
                          key={key}
                          className="p-1.5 rounded bg-white/5 flex flex-col"
                        >

                          <span className="text-[9px] uppercase text-slate-500">
                            {key}
                          </span>

                          <span className="text-slate-200 font-medium truncate">
                            {String(value)}
                          </span>

                        </div>

                      )
                    )}

                  </div>

                </div>

                {/* IDLE */}
                {checkoutStep === 'idle' && (

                  <div className="space-y-3">

                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center space-x-2">

                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />

                      <span>
                        Price ₹{selectedProduct.price}
                        {' '}
                        satisfies current Mandate Cap of ₹
                        {activeMandate?.maxAmount || 2500}
                      </span>

                    </div>

                    <button
                      onClick={() =>
                        handleInitiateCheckout(
                          selectedProduct
                        )
                      }
                      disabled={
                        !activeMandate ||
                        loading
                      }
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center space-x-2"
                    >

                      <ShieldCheck className="w-4 h-4" />

                      <span>
                        Authorize Purchase
                      </span>

                    </button>

                  </div>

                )}

                {/* AUTHORIZING */}
                {checkoutStep === 'authorizing' && (

                  <div className="p-5 rounded-xl bg-indigo-950/40 border border-indigo-500/40 text-center">

                    <RefreshCw className="w-7 h-7 text-indigo-400 animate-spin mx-auto" />

                    <h3 className="text-sm font-bold text-white mt-3">
                      Evaluating Authorization
                    </h3>

                    <p className="text-xs text-slate-400 mt-1">
                      Evaluating deterministic commerce rules,
                      merchant status, inventory and live catalog price.
                    </p>

                  </div>

                )}

                {/* BLOCKED */}
                {checkoutStep === 'blocked' &&
                  blockError && (

                    <div className="p-5 rounded-xl bg-red-950/40 border border-red-500/50 space-y-3">

                      <div className="flex items-center space-x-2 text-red-400 font-bold text-sm">

                        <AlertCircle className="w-5 h-5" />

                        <span>
                          TRANSACTION BLOCKED
                        </span>

                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed">
                        {blockError.message ||
                          'Authorization declined by deterministic policy engine.'}
                      </p>

                      {blockError.code && (

                        <div className="p-3 rounded-lg bg-slate-950/70 border border-red-500/20">

                          <div className="text-[10px] text-slate-500">
                            Reason Code
                          </div>

                          <div className="text-xs text-red-400 font-bold font-mono mt-1">
                            {blockError.code}
                          </div>

                        </div>

                      )}

                      {blockError.details && (

                        <div className="p-3 rounded-lg bg-slate-950/70 border border-red-500/20">

                          <div className="text-[10px] text-slate-500 mb-2">
                            Authorization Details
                          </div>

                          <pre className="text-[10px] text-slate-400 whitespace-pre-wrap break-words">
                            {JSON.stringify(
                              blockError.details,
                              null,
                              2
                            )}
                          </pre>

                        </div>

                      )}

                    </div>

                  )}

                {/* READY TO PAY */}
                {checkoutStep === 'ready_to_pay' &&
                  authDetails && (

                    <div className="p-5 rounded-xl bg-indigo-950/40 border border-indigo-500/40 space-y-4">

                      <div className="flex items-center space-x-2">

                        <ShieldCheck className="w-5 h-5 text-emerald-400" />

                        <span className="font-bold text-sm text-white">
                          AUTHORIZATION APPROVED
                        </span>

                      </div>

                      <div className="p-3 rounded-lg bg-slate-950/70 border border-white/5 text-xs space-y-2 font-mono">

                        <div className="flex justify-between gap-3">

                          <span className="text-slate-500">
                            Internal Order ID:
                          </span>

                          <span className="text-slate-200 break-all text-right">
                            {authDetails.orderId}
                          </span>

                        </div>

                        <div className="flex justify-between gap-3">

                          <span className="text-slate-500">
                            Razorpay Order ID:
                          </span>

                          <span className="text-slate-200 break-all text-right">
                            {authDetails.razorpayOrderId}
                          </span>

                        </div>

                        <div className="flex justify-between">

                          <span className="text-slate-500">
                            Total Authorized:
                          </span>

                          <span className="text-emerald-400 font-bold">
                            ₹{authDetails.amount}
                            {' '}
                            {authDetails.currency ||
                              'INR'}
                          </span>

                        </div>

                      </div>

                      <button
                        onClick={
                          handleExecutePayment
                        }
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center space-x-2"
                      >

                        {loading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <CreditCard className="w-4 h-4" />
                        )}

                        <span>
                          {loading
                            ? 'Verifying Razorpay Signature...'
                            : 'Confirm Razorpay Test Payment'}
                        </span>

                      </button>

                    </div>

                  )}

                {/* PAID */}
                {checkoutStep === 'paid' &&
                  receiptData && (

                    <div className="p-5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-4">

                      <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">

                        <CheckCircle2 className="w-5 h-5" />

                        <span>
                          PAYMENT COMPLETED & VERIFIED
                        </span>

                      </div>

                      <div className="p-3 rounded-lg bg-slate-950/80 border border-emerald-500/20 text-[11px] font-mono space-y-2 text-slate-300">

                        {/* ORDER ID */}
                        <div className="flex justify-between gap-3">

                          <span className="text-slate-500">
                            Order ID:
                          </span>

                          <span className="text-white font-bold text-right break-all">
                            {receiptData.orderId ||
                              receiptData.order?.id ||
                              'N/A'}
                          </span>

                        </div>

                        {/* PAYMENT ID */}
                        <div className="flex justify-between gap-3">

                          <span className="text-slate-500">
                            Payment ID:
                          </span>

                          <span className="text-emerald-400 text-right break-all">
                            {receiptData.razorpayPaymentId ||
                              receiptData.receipt?.razorpayPaymentId ||
                              receiptData.paymentId ||
                              'N/A'}
                          </span>

                        </div>

                        {/* AMOUNT */}
                        <div className="flex justify-between gap-3">

                          <span className="text-slate-500">
                            Amount:
                          </span>

                          <span className="text-white">
                            ₹
                            {receiptData.amount ??
                              selectedProduct.price}
                            {' '}
                            {receiptData.currency ||
                              'INR'}
                          </span>

                        </div>

                        {/* DECISION HASH */}
                        <div className="flex justify-between gap-3">

                          <span className="text-slate-500">
                            Decision Hash:
                          </span>

                          <span
                            className="text-indigo-300 truncate max-w-[220px]"
                            title={
                              receiptData.proof
                                ?.decisionHash
                            }
                          >
                            {receiptData.proof
                              ?.decisionHash ||
                              'N/A'}
                          </span>

                        </div>

                        {/* TRANSACTION HASH */}
                        <div className="flex justify-between gap-3">

                          <span className="text-slate-500">
                            Transaction Hash:
                          </span>

                          <span
                            className="text-indigo-300 truncate max-w-[220px]"
                            title={
                              receiptData.proof
                                ?.transactionHash
                            }
                          >
                            {receiptData.proof
                              ?.transactionHash ||
                              'N/A'}
                          </span>

                        </div>

                      </div>

                      {/* NORMAL PROOF VERIFICATION */}
                      <button
                        onClick={
                          handleVerifyProof
                        }
                        disabled={
                          verifyingProof
                        }
                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all"
                      >

                        {verifyingProof ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-4 h-4" />
                        )}

                        <span>
                          {verifyingProof
                            ? 'Verifying SHA-256 Hash Chain...'
                            : 'Verify Cryptographic Proof Certificate'}
                        </span>

                      </button>

                      {/* TAMPER TEST */}
                      <button
                        onClick={
                          handleSimulateTamper
                        }
                        disabled={
                          verifyingProof
                        }
                        className="w-full py-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 disabled:opacity-50 border border-red-500/30 text-red-300 font-semibold text-[11px] flex items-center justify-center space-x-1.5"
                      >

                        <AlertCircle className="w-3.5 h-3.5" />

                        <span>
                          Simulate Tamper Detection
                        </span>

                      </button>

                      {/* VERIFICATION RESULT */}
                      {proofVerified && (

                        <div
                          className={
                            proofVerified.verified
                              ? 'p-4 rounded-lg bg-emerald-950/60 border border-emerald-500/30 space-y-3'
                              : 'p-4 rounded-lg bg-red-950/60 border border-red-500/30 space-y-3'
                          }
                        >

                          <div
                            className={
                              proofVerified.verified
                                ? 'font-bold flex items-center space-x-2 text-emerald-400'
                                : 'font-bold flex items-center space-x-2 text-red-400'
                            }
                          >

                            {proofVerified.verified ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <AlertCircle className="w-4 h-4" />
                            )}

                            <span>
                              {proofVerified.verified
                                ? '✓ VALID_UNMODIFIED'
                                : 'TAMPER DETECTED'}
                            </span>

                          </div>

                          <p
                            className={
                              proofVerified.verified
                                ? 'text-[10px] text-emerald-300 leading-relaxed'
                                : 'text-[10px] text-red-300 leading-relaxed'
                            }
                          >
                            {proofVerified.details ||
                              'Verification completed.'}
                          </p>

                          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">

                            <div className="rounded bg-black/20 p-2">

                              <div className="text-slate-500">
                                Decision Hash
                              </div>

                              <div
                                className={
                                  proofVerified.checks
                                    ?.decisionHashMatches
                                    ? 'text-emerald-400 mt-1'
                                    : 'text-red-400 mt-1'
                                }
                              >
                                {proofVerified.checks
                                  ?.decisionHashMatches
                                  ? 'MATCH'
                                  : 'FAILED'}
                              </div>

                            </div>

                            <div className="rounded bg-black/20 p-2">

                              <div className="text-slate-500">
                                Transaction Hash
                              </div>

                              <div
                                className={
                                  proofVerified.checks
                                    ?.transactionHashMatches
                                    ? 'text-emerald-400 mt-1'
                                    : 'text-red-400 mt-1'
                                }
                              >
                                {proofVerified.checks
                                  ?.transactionHashMatches
                                  ? 'MATCH'
                                  : 'FAILED'}
                              </div>

                            </div>

                            <div className="rounded bg-black/20 p-2">

                              <div className="text-slate-500">
                                Audit Chain
                              </div>

                              <div
                                className={
                                  proofVerified.checks
                                    ?.auditHashChainValid
                                    ? 'text-emerald-400 mt-1'
                                    : 'text-red-400 mt-1'
                                }
                              >
                                {proofVerified.checks
                                  ?.auditHashChainValid
                                  ? 'VALID'
                                  : 'BROKEN'}
                              </div>

                            </div>

                            <div className="rounded bg-black/20 p-2">

                              <div className="text-slate-500">
                                Events Verified
                              </div>

                              <div className="text-white mt-1">
                                {proofVerified.checks
                                  ?.eventsVerifiedCount ??
                                  0}
                              </div>

                            </div>

                          </div>

                          <div className="text-[9px] text-slate-500 font-mono">
                            Status:{' '}
                            {proofVerified.integrityStatus ||
                              'UNKNOWN'}
                          </div>

                        </div>

                      )}

                    </div>

                  )}

              </div>

            </div>

          ) : (

            <div className="p-8 rounded-2xl glass-panel border border-white/10 text-center space-y-4">

              <Bot className="w-12 h-12 text-indigo-400 mx-auto" />

              <h3 className="text-base font-bold text-white">
                No Item Selected
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed">
                Chat with the Buyer Agent on the left.
                When the agent identifies a product matching
                your intent, select it to review specifications
                and run policy gating.
              </p>

              <button
                onClick={() =>
                  handleSendMessage()
                }
                disabled={
                  loading ||
                  !input.trim()
                }
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold"
              >

                <span>
                  Search Catalog
                </span>

                <ArrowRight className="w-3.5 h-3.5" />

              </button>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}