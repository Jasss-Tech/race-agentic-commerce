'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Layers,
  Search,
  ShoppingCart,
  Check,
  Star,
  ThumbsUp,
  Tag,
  Zap,
  Info,
  Sliders,
  Scale,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  Plus,
  Minus,
  Trash2,
  MessageSquare
} from 'lucide-react';
import {
  ProductDto,
  ProductMatchDto,
  MandateDto,
  BuyerAgentMessageResponse
} from '@race/types';
import { fetchApi } from '../../lib/api';
import { realtimeBus } from '../../lib/realtime';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useCart } from '../../context/CartContext';

type CheckoutStep =
  | 'idle'
  | 'authorizing'
  | 'ready_to_pay'
  | 'paid'
  | 'blocked'
  | 'failed';

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
  order?: { id?: string };
  receipt?: { razorpayPaymentId?: string };
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

// Curated high quality product assets for all 26 catalog items
const PRODUCT_IMAGES: Record<string, string> = {
  'prod_keyboard_01': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
  'prod_keyboard_pro_05': 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80',
  'prod_keyboard_compact_06': 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=600&q=80',
  'prod_keyboard_slim_07': 'https://images.unsplash.com/photo-1560762484-813fc97650a0?auto=format&fit=crop&w=600&q=80',
  'prod_keyboard_ergo_08': 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=600&q=80',
  'prod_mouse_02': 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
  'prod_mouse_ergo_09': 'https://images.unsplash.com/photo-1605773527852-c546a8584ea3?auto=format&fit=crop&w=600&q=80',
  'prod_mouse_gaming_10': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80',
  'prod_mouse_silent_11': 'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?auto=format&fit=crop&w=600&q=80',
  'prod_mouse_trackball_12': 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=600&q=80',
  'prod_audio_anc_13': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
  'prod_audio_studio_14': 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80',
  'prod_audio_headset_15': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
  'prod_audio_gaming_16': 'https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=600&q=80',
  'prod_cam_1080p_17': 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=600&q=80',
  'prod_cam_4k_18': 'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?auto=format&fit=crop&w=600&q=80',
  'prod_cam_privacy_19': 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=600&q=80',
  'prod_hub_03': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
  'prod_dock_20': 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=600&q=80',
  'prod_stand_21': 'https://images.unsplash.com/photo-1616353071588-708dcff912e2?auto=format&fit=crop&w=600&q=80',
  'prod_wristrest_04': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80',
  'prod_charger_22': 'https://images.unsplash.com/photo-1622445262464-84b14e3235b3?auto=format&fit=crop&w=600&q=80',
  'prod_deskmat_23': 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80',
  'prod_lightbar_24': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80',
  'prod_monitor_25': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
  'prod_monitor_arm_26': 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80',
  'default': 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80'
};

export default function BuyerPage() {
  const router = useRouter();
  const { items: cartItems, addToCart, removeFromCart, updateQuantity, setIsCartOpen, setToastMessage } = useCart();
  const [messages, setMessages] = useState<
    Array<{
      sender: 'user' | 'agent';
      text: string;
      data?: BuyerAgentMessageResponse;
    }>
  >([
    {
      sender: 'agent',
      text: 'Hello! 👋 I am your **RACE AI Shopping Copilot**. Ask me to discover gear (*"wireless keyboard under ₹2500"*), compare options (*"compare top mice"*), or manage your cart (*"what is in my cart"*). I ensure all recommendations fit your policy and authorized spending bounds.'
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStateText, setLoadingStateText] = useState('Thinking...');
  const [activeMandate, setActiveMandate] = useState<MandateDto | null>(null);
  const [catalogProducts, setCatalogProducts] = useState<ProductDto[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('idle');
  const [authDetails, setAuthDetails] = useState<any>(null);
  const [blockError, setBlockError] = useState<any>(null);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [verifyingProof, setVerifyingProof] = useState(false);
  const [proofVerified, setProofVerified] = useState<ProofVerificationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'storefront' | 'copilot' | 'compare'>('copilot');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [lastShownProductIds, setLastShownProductIds] = useState<string[]>([]);
  const [isEditingMandate, setIsEditingMandate] = useState(false);
  const [customMandateCap, setCustomMandateCap] = useState(25000);

  useEffect(() => {
    async function init() {
      try {
        // 1. Fetch or create active mandate
        let mandate: MandateDto;
        try {
          mandate = await fetchApi<MandateDto>('/api/mandates/active');
        } catch {
          mandate = await fetchApi<MandateDto>('/api/mandates', {
            method: 'POST',
            body: JSON.stringify({
              userId: 'usr_buyer_001',
              maxAmount: 25000,
              currency: 'INR',
              allowedCategories: ['keyboard', 'mouse', 'audio', 'webcam', 'accessories', 'monitors'],
              allowedActions: ['search', 'compare', 'purchase']
            })
          });
        }
        setActiveMandate(mandate);
        setCustomMandateCap(mandate.maxAmount);

        // 2. Fetch full catalog
        const res = await fetchApi<any>('/api/agents/buyer/search', {
          method: 'POST',
          body: JSON.stringify({ query: '' })
        });
        if (res.products && res.products.length > 0) {
          setCatalogProducts(res.products);
          setSelectedProduct(res.products[0]);
          setLastShownProductIds(res.products.map((p: any) => p.id));
        }
      } catch (err) {
        console.error('Error initializing buyer state:', err);
      }
    }
    init();
  }, []);

  const handleSendMessage = async (customQuery?: string) => {
    const queryText = (customQuery || input).trim();
    if (!queryText || loading) return;

    const newMessages = [...messages, { sender: 'user' as const, text: queryText }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setLoadingStateText(
      queryText.toLowerCase().includes('compare')
        ? 'Comparing technical specifications...'
        : queryText.toLowerCase().includes('cart')
        ? 'Inspecting shopping cart state...'
        : 'Searching verified product catalog...'
    );
    setCheckoutStep('idle');
    setAuthDetails(null);
    setBlockError(null);
    setReceiptData(null);
    setProofVerified(null);

    // Broadcast user search event to realtime stream
    realtimeBus.publish({
      eventType: 'USER_SEARCH',
      actorName: 'Aarav Sharma',
      actorRole: 'CUSTOMER',
      description: `Queried shopping assistant: "${queryText}"`,
      badgeType: 'info'
    });

    try {
      const response = await fetchApi<BuyerAgentMessageResponse>('/api/agents/buyer/message', {
        method: 'POST',
        body: JSON.stringify({
          message: queryText,
          mandateId: activeMandate?.id,
          lastShownProductIds,
          selectedProductId: selectedProduct?.id,
          cartItems: cartItems.map(i => ({
            productId: i.product.id,
            productName: i.product.name,
            price: i.product.price,
            quantity: i.quantity
          }))
        })
      });

      // Execute AI Cart Action if returned
      if (response.cartAction) {
        if (response.cartAction.type === 'ADD_TO_CART' && response.cartAction.productId) {
          const prodToAdd = catalogProducts.find(p => p.id === response.cartAction?.productId);
          if (prodToAdd) {
            addToCart(prodToAdd, response.cartAction.quantity || 1);
            setToastMessage(`✓ Added ${prodToAdd.name} to cart`);
            setIsCartOpen(true);
          }
        } else if (response.cartAction.type === 'REMOVE_FROM_CART' && response.cartAction.productId) {
          removeFromCart(response.cartAction.productId);
          setToastMessage('Item removed from cart');
        } else if (response.cartAction.type === 'UPDATE_QUANTITY' && response.cartAction.productId) {
          updateQuantity(response.cartAction.productId, response.cartAction.quantity || 1);
        }
      }

      setMessages([
        ...newMessages,
        {
          sender: 'agent',
          text: response.message,
          data: response
        }
      ]);

      if (response.products && response.products.length > 0) {
        setSelectedProduct(response.products[0]);
        setLastShownProductIds(response.products.map(p => p.id));
      }
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          sender: 'agent',
          text: `⚠️ Agent processing error: ${err?.message || 'Unable to connect to AI engine'}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (prod: ProductDto) => {
    setSelectedProduct(prod);
    setCheckoutStep('idle');
    setAuthDetails(null);
    setBlockError(null);

    realtimeBus.publish({
      eventType: 'USER_VIEW',
      actorName: 'Aarav Sharma',
      actorRole: 'CUSTOMER',
      description: `Selected ${prod.name} (₹${prod.price.toLocaleString('en-IN')})`,
      badgeType: 'info'
    });
  };

  const handleBuyNow = (prod: ProductDto) => {
    addToCart(prod, 1);
    setSelectedProduct(prod);
    setToastMessage(`Proceeding to checkout with ${prod.name}`);
    router.push('/buyer/cart');
  };

  const handleUpdateMandate = async () => {
    try {
      const updated = await fetchApi<MandateDto>('/api/mandates', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'usr_buyer_001',
          maxAmount: customMandateCap,
          currency: 'INR',
          allowedCategories: ['keyboard', 'mouse', 'audio', 'webcam', 'accessories', 'monitors'],
          allowedActions: ['search', 'compare', 'purchase']
        })
      });
      setActiveMandate(updated);
      setIsEditingMandate(false);
      setToastMessage(`✓ Mandate spending cap updated to ₹${customMandateCap.toLocaleString('en-IN')}`);

      realtimeBus.publish({
        eventType: 'INTENT_MANDATE_CREATED',
        actorName: 'Aarav Sharma',
        actorRole: 'CUSTOMER',
        description: `Updated mandate authorization cap to ₹${customMandateCap.toLocaleString('en-IN')}`,
        badgeType: 'purple'
      });
    } catch (err: any) {
      setToastMessage(`Failed to update mandate: ${err?.message}`);
    }
  };

  const mandateCap = activeMandate?.maxAmount || 25000;
  const isSelectedOverMandate = selectedProduct ? selectedProduct.price > mandateCap : false;

  const categories = ['ALL', 'keyboard', 'mouse', 'audio', 'webcam', 'accessories', 'monitors'];
  const filteredProducts = selectedCategory === 'ALL'
    ? catalogProducts
    : catalogProducts.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. CUSTOMER WELCOME BANNER & ACTIVE MANDATE */}
      <div className="p-6 rounded-2xl glass-panel border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white flex items-center justify-center font-bold shadow-lg">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-white">TechNova Store & AI Copilot</h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/40 font-semibold">
                AUTHENTICATED BUYER SESSION
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Natural language product discovery & bounded autonomous checkout protected by your{' '}
              <strong className="text-white font-mono">₹{mandateCap.toLocaleString('en-IN')} INR</strong> mandate cap.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {isEditingMandate ? (
            <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-surface/90 border border-indigo-500/40 text-xs font-mono">
              <span className="text-slate-400 pl-2">Cap ₹</span>
              <input
                type="number"
                value={customMandateCap}
                onChange={(e) => setCustomMandateCap(Number(e.target.value))}
                className="w-24 bg-slate-900 px-2 py-1 rounded text-white font-bold outline-none border border-white/10"
              />
              <button
                onClick={handleUpdateMandate}
                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditingMandate(false)}
                className="px-2 py-1 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingMandate(true)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-surface border border-white/10 hover:border-indigo-500/50 transition-all text-xs font-mono text-slate-300"
              title="Click to adjust mandate authorization cap"
            >
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Mandate: ₹{mandateCap.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-indigo-400 underline">Edit</span>
            </button>
          )}

          <Button
            variant="primary"
            onClick={() => setActiveTab('copilot')}
            className="text-xs flex items-center space-x-1.5"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Copilot</span>
          </Button>

          <Link href="/buyer/cart">
            <Button variant="outline" className="text-xs flex items-center space-x-1.5">
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Cart ({cartItems.reduce((s, i) => s + i.quantity, 0)})</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
        {[
          { id: 'copilot', label: 'AI Shopping Copilot', icon: Bot },
          { id: 'storefront', label: `Catalog (${catalogProducts.length} Items)`, icon: Layers },
          { id: 'compare', label: 'Hardware Spec Comparison', icon: Scale }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg glow-brand'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. TAB: STOREFRONT CATALOG */}
      {activeTab === 'storefront' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-mono">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl uppercase tracking-wider transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white font-bold shadow-md'
                    : 'bg-surface text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid (26 realistic products) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(prod => {
              const imgUrl = PRODUCT_IMAGES[prod.id] || PRODUCT_IMAGES['default'];
              const isOver = prod.price > mandateCap;
              const attrs = (prod.attributes || {}) as Record<string, any>;

              return (
                <Card
                  key={prod.id}
                  className="p-5 flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition-all group"
                >
                  <div className="space-y-3">
                    <Link
                      href={`/buyer/product/${prod.id}`}
                      className="block relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-white/5 cursor-pointer group/img"
                    >
                      <img
                        src={imgUrl}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e: any) => { e.target.src = PRODUCT_IMAGES['default']; }}
                      />
                      <div className="absolute top-2 right-2 flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur text-[10px] font-mono text-amber-400 font-bold border border-white/10">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{attrs.rating || '4.8'}</span>
                      </div>
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur text-[9px] font-mono text-slate-300 uppercase">
                        {prod.category}
                      </div>
                    </Link>

                    <div>
                      <Link href={`/buyer/product/${prod.id}`} className="block">
                        <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-indigo-300 hover:underline transition-colors">
                          {prod.name}
                        </h3>
                      </Link>
                      <p className="text-slate-400 text-xs line-clamp-2 mt-1 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-400 font-mono">
                      <div className="truncate">
                        <span className="text-slate-500">Feature:</span> {attrs.switch || attrs.sensor || attrs.driver || attrs.resolution || attrs.ports || attrs.capacity || 'Premium Build'}
                      </div>
                      <div className="truncate">
                        <span className="text-slate-500">Conn:</span> {attrs.connection || attrs.ports || 'Wireless / USB'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 space-y-3">
                    <div className="flex items-baseline justify-between font-mono">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase">Price</div>
                        <div className="text-lg font-extrabold text-white">
                          ₹{prod.price.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-bold ${isOver ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {isOver ? `Over cap (₹${mandateCap})` : '✓ In Mandate'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          addToCart(prod, 1);
                          setToastMessage(`✓ Added ${prod.name} to cart`);
                        }}
                        className="py-2 text-[11px] flex items-center justify-center space-x-1"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>Add</span>
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => handleBuyNow(prod)}
                        className="py-2 text-[11px] flex items-center justify-center space-x-1 shadow-md glow-brand"
                      >
                        <span>Buy Now</span>
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. TAB: AI SHOPPING COPILOT */}
      {activeTab === 'copilot' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Chat Pane */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            <Card className="p-6 flex-1 min-h-[500px] flex flex-col justify-between space-y-4">
              <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed space-y-3 ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-surface/90 border border-white/10 text-slate-200 rounded-bl-none'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>

                      {/* Display Product Recommendations Cards if returned */}
                      {msg.data?.products && msg.data.products.length > 0 && (
                        <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-white/10">
                          {msg.data.products.slice(0, 4).map(prod => (
                            <div
                              key={prod.id}
                              className="p-3 rounded-xl bg-slate-900/80 border border-white/10 space-y-2 hover:border-indigo-500/50 transition-all"
                            >
                              <div className="flex items-center justify-between">
                                <Link href={`/buyer/product/${prod.id}`} className="hover:underline truncate max-w-[70%]">
                                  <h4 className="font-bold text-white text-xs truncate hover:text-indigo-300">{prod.name}</h4>
                                </Link>
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold">
                                  {prod.aiMatchScore}% Match
                                </span>
                              </div>
                              <div className="flex items-center justify-between font-mono text-xs">
                                <span className="text-white font-bold">₹{prod.price.toLocaleString('en-IN')}</span>
                                <span className="text-[10px] text-slate-400 uppercase">{prod.category}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-1.5 pt-1">
                                <button
                                  onClick={() => {
                                    addToCart(prod, 1);
                                    setToastMessage(`✓ Added ${prod.name} to cart`);
                                  }}
                                  className="py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold"
                                >
                                  + Cart
                                </button>
                                <button
                                  onClick={() => handleBuyNow(prod)}
                                  className="py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold"
                                >
                                  Buy Now →
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center space-x-2 text-xs text-indigo-400 font-mono p-3 bg-indigo-950/20 rounded-xl border border-indigo-500/20 w-fit">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{loadingStateText}</span>
                  </div>
                )}
              </div>

              {/* Quick reply suggestion chips */}
              <div className="flex items-center space-x-1.5 overflow-x-auto py-2 text-xs">
                {[
                  'Keyboards under ₹2500',
                  'Best wireless mouse',
                  'Compare keyboards',
                  "What's in my cart?",
                  'Show accessories under ₹1000',
                  'Show me something cheaper'
                ].map(chip => (
                  <button
                    key={chip}
                    onClick={() => handleSendMessage(chip)}
                    className="px-3 py-1 rounded-full bg-surface border border-white/10 hover:border-indigo-500/40 text-slate-300 hover:text-white transition-all whitespace-nowrap text-[11px]"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Input box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center space-x-2 pt-2 border-t border-white/10"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask for hardware, compare specs, or manage your cart..."
                  className="flex-1 bg-surface border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <Button type="submit" variant="primary" disabled={loading || !input.trim()} className="px-4 py-2.5">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </Card>
          </div>

          {/* Context & Active Selection Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="p-5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Active Selection Context
              </h3>
              {selectedProduct ? (
                <div className="space-y-3 text-xs">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-white/5">
                    <img
                      src={PRODUCT_IMAGES[selectedProduct.id] || PRODUCT_IMAGES['default']}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                      onError={(e: any) => { e.target.src = PRODUCT_IMAGES['default']; }}
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{selectedProduct.name}</h4>
                    <p className="text-slate-400 text-[11px] mt-1 line-clamp-2">{selectedProduct.description}</p>
                  </div>
                  <div className="flex justify-between font-mono pt-1">
                    <span className="text-slate-500">Price:</span>
                    <span className="text-white font-bold">₹{selectedProduct.price.toLocaleString('en-IN')} INR</span>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => handleBuyNow(selectedProduct)}
                    className="w-full py-2.5 text-xs font-bold shadow-md glow-brand"
                  >
                    Proceed to Checkout with this SKU →
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-slate-400">Ask Copilot to discover and select a product.</p>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* 4. TAB: INTERACTIVE HARDWARE COMPARISON MATRIX */}
      {activeTab === 'compare' && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Scale className="w-5 h-5 text-indigo-400" />
                <span>Interactive Hardware Comparison Matrix</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Dynamic side-by-side specification decomposition, AI match confidence, and price-to-value scoring across real catalog products.
              </p>
            </div>
            <Badge variant="brand">{Math.min(catalogProducts.length, 4)} SKUs Evaluated</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr>
                  <th className="w-1/5 text-left p-3 text-slate-400 uppercase text-[10px]">Specification Factor</th>
                  {catalogProducts.slice(0, 4).map((prod, i) => (
                    <th key={prod.id} className="w-1/5 text-center p-3 border-l border-white/5">
                      <div className="text-white font-bold text-sm font-sans">{prod.name}</div>
                      <div className="text-emerald-400 font-extrabold text-base mt-1">₹{prod.price.toLocaleString('en-IN')}</div>
                      {i === 0 && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-bold border border-indigo-500/30">
                          ★ TOP VALUE
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Category</td>
                  {catalogProducts.slice(0, 4).map(prod => (
                    <td key={prod.id} className="p-3 text-center text-slate-300 uppercase border-l border-white/5">
                      {prod.category}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Key Connectivity</td>
                  {catalogProducts.slice(0, 4).map(prod => (
                    <td key={prod.id} className="p-3 text-center text-slate-300 border-l border-white/5">
                      {String((prod.attributes as any)?.connection || (prod.attributes as any)?.connectivity || (prod.attributes as any)?.ports || 'Wired USB-C')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Switch / Sensor / Driver</td>
                  {catalogProducts.slice(0, 4).map(prod => (
                    <td key={prod.id} className="p-3 text-center text-slate-300 border-l border-white/5">
                      {String((prod.attributes as any)?.switch || (prod.attributes as any)?.sensor || (prod.attributes as any)?.driver || (prod.attributes as any)?.resolution || (prod.attributes as any)?.panel || 'Tactile Build')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Battery Life / Power</td>
                  {catalogProducts.slice(0, 4).map(prod => (
                    <td key={prod.id} className="p-3 text-center text-slate-300 border-l border-white/5">
                      {String((prod.attributes as any)?.battery || (prod.attributes as any)?.power || 'Bus Powered')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Weight & Dimensions</td>
                  {catalogProducts.slice(0, 4).map(prod => (
                    <td key={prod.id} className="p-3 text-center text-slate-300 border-l border-white/5">
                      {(prod.attributes as any)?.weight || 'N/A'} · {(prod.attributes as any)?.dimensions || 'Compact'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Customer Rating</td>
                  {catalogProducts.slice(0, 4).map(prod => (
                    <td key={prod.id} className="p-3 text-center text-amber-400 border-l border-white/5">
                      ★ {(prod.attributes as any)?.rating || '4.8'} ({(prod.attributes as any)?.reviewsCount || 200} reviews)
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Key Strength</td>
                  {catalogProducts.slice(0, 4).map(prod => (
                    <td key={prod.id} className="p-3 text-center text-slate-300 border-l border-white/5 text-[11px]">
                      {(prod.attributes as any)?.keyStrength || prod.description}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Warranty</td>
                  {catalogProducts.slice(0, 4).map(prod => (
                    <td key={prod.id} className="p-3 text-center text-slate-300 border-l border-white/5">
                      {(prod.attributes as any)?.warranty || prod.returnPolicy}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Action</td>
                  {catalogProducts.slice(0, 4).map(prod => (
                    <td key={prod.id} className="p-3 text-center border-l border-white/5">
                      <Button
                        variant="primary"
                        onClick={() => handleBuyNow(prod)}
                        className="text-xs py-1.5 px-3"
                      >
                        Buy Now
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}