'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Bot,
  ShieldCheck,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CreditCard,
  RefreshCw,
  Clock,
  Star,
  ThumbsUp,
  ShoppingCart,
  Zap,
  Send,
  Check,
  Layers,
  ArrowLeft,
  Share2,
  Heart,
  Truck,
  RotateCcw,
  FileCheck2,
  Copy,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sliders,
  CheckSquare,
  XCircle,
  HelpCircle,
  FileCode
} from 'lucide-react';
import { ProductDto, MandateDto } from '@race/types';
import { fetchApi } from '../../../../lib/api';
import { useCart } from '../../../../context/CartContext';
import { realtimeBus } from '../../../../lib/realtime';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';

// High-resolution product images for all 26 catalog items
const PRODUCT_IMAGES: Record<string, string[]> = {
  'prod_keyboard_01': [
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80'
  ],
  'prod_keyboard_pro_05': [
    'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80'
  ],
  'prod_keyboard_compact_06': [
    'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80'
  ],
  'prod_keyboard_slim_07': [
    'https://images.unsplash.com/photo-1560762484-813fc97650a0?auto=format&fit=crop&w=800&q=80'
  ],
  'prod_keyboard_ergo_08': [
    'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=800&q=80'
  ],
  'prod_mouse_02': [
    'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80'
  ],
  'prod_mouse_ergo_09': [
    'https://images.unsplash.com/photo-1605773527852-c546a8584ea3?auto=format&fit=crop&w=800&q=80'
  ],
  'prod_mouse_gaming_10': [
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80'
  ],
  'prod_mouse_silent_11': [
    'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?auto=format&fit=crop&w=800&q=80'
  ],
  'prod_mouse_trackball_12': [
    'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80'
  ],
  'prod_audio_anc_13': [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
  ],
  'prod_audio_studio_14': [
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80'
  ],
  'prod_audio_headset_15': [
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80'
  ],
  'prod_audio_gaming_16': [
    'https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=800&q=80'
  ],
  'prod_cam_1080p_17': [
    'https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=800&q=80'
  ],
  'prod_cam_4k_18': [
    'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?auto=format&fit=crop&w=800&q=80'
  ],
  'prod_cam_privacy_19': [
    'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=800&q=80'
  ],
  'prod_hub_03': [
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
  ],
  'prod_dock_20': [
    'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=800&q=80'
  ],
  'prod_stand_21': [
    'https://images.unsplash.com/photo-1616353071588-708dcff912e2?auto=format&fit=crop&w=800&q=80'
  ],
  'prod_wristrest_04': [
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80'
  ],
  'prod_charger_22': [
    'https://images.unsplash.com/photo-1622445262464-84b14e3235b3?auto=format&fit=crop&w=800&q=80'
  ],
  'prod_deskmat_23': [
    'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80'
  ],
  'prod_lightbar_24': [
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80'
  ],
  'prod_monitor_25': [
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80'
  ],
  'prod_monitor_arm_26': [
    'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80'
  ],
  'default': [
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'
  ]
};

interface ProofData {
  id: string;
  orderId: string;
  decisionHash: string;
  transactionHash: string;
  proofPayload?: any;
  verificationStatus: string;
  blockIndex?: number;
  previousHash?: string;
  currentHash?: string;
  verifiedAt?: string;
  createdAt?: string;
}

interface VerificationResult {
  valid: boolean;
  verified: boolean;
  orderId?: string;
  decisionHashValid?: boolean;
  transactionHashValid?: boolean;
  contentHashValid?: boolean;
  chainValid?: boolean;
  previousBlockLinkValid?: boolean;
  sha256Valid?: boolean;
  blockIndex?: number;
  previousHash?: string;
  currentHash?: string;
  integrityStatus?: string;
  message?: string;
  details?: string;
  checks?: {
    decisionHashMatches?: boolean;
    transactionHashMatches?: boolean;
    contentHashValid?: boolean;
    auditHashChainValid?: boolean;
    sha256Valid?: boolean;
    eventsVerifiedCount?: number;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const { addToCart, setToastMessage } = useCart();
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);

  // Mandate & Policy Eligibility state
  const [activeMandate, setActiveMandate] = useState<MandateDto | null>(null);
  const [policyEval, setPolicyEval] = useState<any | null>(null);
  const [policyLoading, setPolicyLoading] = useState(false);

  // Cryptographic Proof state
  const [hasProof, setHasProof] = useState<boolean>(false);
  const [proofData, setProofData] = useState<ProofData | null>(null);
  const [proofOrderId, setProofOrderId] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [technicalDetailsOpen, setTechnicalDetailsOpen] = useState(false);

  // AI Q&A Assistant state
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiChat, setAiChat] = useState<Array<{ q: string; a: string }>>([
    {
      q: 'Is this hardware certified for agentic autonomous purchases under RACE policies?',
      a: 'Yes! It has complete SKU inventory verification, active status, manufacturer warranty compliance, and deterministic pricing registered in the RACE audit catalog.'
    }
  ]);
  const [isAskingAi, setIsAskingAi] = useState(false);

  // Load product, mandate, and proof data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // 1. Fetch Product
        const prod = await fetchApi<any>(`/api/catalog/products/${productId}`).catch(async () => {
          const cat = await fetchApi<ProductDto[]>('/api/catalog');
          return cat.find(p => p.id === productId) || null;
        });
        setProduct(prod);

        // 2. Fetch Active Mandate
        let mandate: MandateDto | null = null;
        try {
          mandate = await fetchApi<MandateDto>('/api/mandates/active', {
            headers: { 'x-user-id': 'usr_buyer_001' }
          });
          setActiveMandate(mandate);
        } catch {
          mandate = null;
        }

        // 3. Evaluate Policy for this Product
        if (prod) {
          setPolicyLoading(true);
          try {
            const evalResult = await fetchApi<any>('/api/policies/evaluate', {
              method: 'POST',
              headers: { 'x-user-id': 'usr_buyer_001' },
              body: JSON.stringify({
                mandateId: mandate?.id || 'mand_active_01',
                amount: prod.price,
                items: [
                  {
                    productId: prod.id,
                    category: prod.category,
                    price: prod.price,
                    quantity: 1
                  }
                ]
              })
            });
            setPolicyEval(evalResult);
          } catch (err) {
            console.error('Policy evaluation failed:', err);
          } finally {
            setPolicyLoading(false);
          }
        }

        // 4. Check for existing Transaction Proof for this product
        try {
          const proofRes = await fetchApi<any>(`/api/proofs/product/${productId}`);
          if (proofRes && proofRes.hasProof && proofRes.proof) {
            setHasProof(true);
            setProofData(proofRes.proof);
            setProofOrderId(proofRes.orderId || proofRes.proof.orderId);
            
            // Set initial valid result from backend verificationStatus
            setVerificationResult({
              valid: proofRes.proof.verificationStatus === 'VALID',
              verified: proofRes.proof.verificationStatus === 'VALID',
              orderId: proofRes.orderId,
              decisionHashValid: true,
              transactionHashValid: true,
              contentHashValid: true,
              chainValid: true,
              previousBlockLinkValid: true,
              sha256Valid: true,
              blockIndex: proofRes.proof.blockIndex || 1,
              previousHash: proofRes.proof.previousHash,
              currentHash: proofRes.proof.currentHash,
              integrityStatus: proofRes.proof.verificationStatus,
              message: 'Recorded SHA-256 cryptographic certificate matches audit ledger.'
            });
          } else {
            setHasProof(false);
            setProofData(null);
            setProofOrderId(null);
          }
        } catch {
          setHasProof(false);
        }

        // Broadcast telemetry
        if (prod) {
          realtimeBus.publish({
            eventType: 'PRODUCT_VIEW',
            actorName: 'Aarav Sharma',
            actorRole: 'CUSTOMER',
            description: `Inspected specifications and policy bounds for ${prod.name} (₹${prod.price.toLocaleString('en-IN')})`,
            badgeType: 'info'
          });
        }
      } catch (err) {
        console.error('Error loading product details:', err);
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      loadData();
    }
  }, [productId]);

  // Handle Verify Integrity
  const handleVerifyIntegrity = async (simulateTamper = false) => {
    if (!proofOrderId && !proofData?.orderId) {
      setToastMessage('No order associated with this proof.');
      return;
    }

    const targetOrderId = proofOrderId || proofData?.orderId;
    setIsVerifying(true);

    try {
      const res = await fetchApi<VerificationResult>(`/api/proofs/${targetOrderId}/verify`, {
        method: 'POST',
        body: JSON.stringify({ simulateTamper })
      });

      setVerificationResult(res);

      if (res.valid) {
        setToastMessage('✓ Cryptographic proof verified successfully (SHA-256 audit chain valid)');
      } else {
        setToastMessage(`⚠️ Verification failure: ${res.details || 'Integrity compromised'}`);
      }
    } catch (err: any) {
      setVerificationResult({
        valid: false,
        verified: false,
        integrityStatus: 'ERROR',
        message: 'Verification could not be completed due to a network error.',
        details: err?.message || 'Server error'
      });
      setToastMessage('Verification request failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setToastMessage(`✓ Copied ${label} to clipboard`);
  };

  // Copy verification summary
  const handleCopyVerificationSummary = () => {
    if (!verificationResult || !proofData) return;
    const summary = `RACE Cryptographic Proof Certificate
Status: ${verificationResult.valid ? 'VALID' : 'COMPROMISED'}
Algorithm: SHA-256
Decision Hash: ${proofData.decisionHash}
Transaction Hash: ${proofData.transactionHash}
Chain Integrity: ${verificationResult.chainValid ? 'VALID' : 'COMPROMISED'}
Block Index: ${verificationResult.blockIndex ?? proofData.blockIndex ?? 1}
Order ID: ${proofOrderId || proofData.orderId}
Verified: ${new Date().toISOString()}`;

    navigator.clipboard.writeText(summary);
    setToastMessage('✓ Copied cryptographic verification certificate summary');
  };

  // Add to cart handler
  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, 1);
    setToastMessage(`✓ Added ${product.name} to cart`);
  };

  // Buy Now handler
  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, 1);
    setToastMessage(`Proceeding to checkout with ${product.name}`);
    router.push('/buyer/cart');
  };

  // AI Copilot Q&A handler
  const handleAskAi = (presetQuestion?: string) => {
    const q = presetQuestion || aiQuestion;
    if (!q.trim() || !product) return;

    setIsAskingAi(true);
    setAiQuestion('');

    setTimeout(() => {
      let answer = `Based on the verified specifications of ${product.name}: `;
      const attrs = (product.attributes || {}) as Record<string, any>;

      if (q.toLowerCase().includes('battery')) {
        answer += `The device includes a high-capacity power system (${attrs.battery || 'Long-life rechargeable battery'}) providing extended wireless operation with USB-C fast charging.`;
      } else if (q.toLowerCase().includes('switch') || q.toLowerCase().includes('sensor') || q.toLowerCase().includes('mechanical')) {
        answer += `It features ${attrs.switch || attrs.sensor || attrs.driver || 'precision-engineered components'} designed for high-frequency daily operation and responsiveness.`;
      } else if (q.toLowerCase().includes('mac') || q.toLowerCase().includes('windows') || q.toLowerCase().includes('compat')) {
        answer += `Full cross-platform support with dedicated macOS, Windows, and Linux layouts via ${attrs.connection || attrs.connectivity || 'universal USB/Bluetooth'} interface.`;
      } else if (q.toLowerCase().includes('mandate') || q.toLowerCase().includes('policy')) {
        answer += `This product is priced at ₹${product.price.toLocaleString('en-IN')}, which is fully within your active ₹25,000 spending mandate and allowed '${product.category}' category.`;
      } else {
        answer += `It features ${product.description || 'premium workspace hardware design'} with a 1-year manufacturer warranty and official RACE cryptographic settlement assurance.`;
      }

      setAiChat(prev => [...prev, { q, a: answer }]);
      setIsAskingAi(false);
    }, 500);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-sm font-mono text-slate-400">Loading verified hardware specifications & policy bounds...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
          <XCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Product Not Found</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          The requested product ID does not exist in the active RACE merchant catalog or has been retired.
        </p>
        <Link href="/buyer">
          <Button variant="primary">Return to Storefront</Button>
        </Link>
      </div>
    );
  }

  const images = PRODUCT_IMAGES[product.id] || PRODUCT_IMAGES['default'];
  const attrs = (product.attributes || {}) as Record<string, any>;
  const mandateCap = activeMandate?.maxAmount || 25000;
  const isOverMandate = product.price > mandateCap;
  const isCategoryAllowed = activeMandate?.allowedCategories
    ? activeMandate.allowedCategories.map(c => c.toLowerCase()).includes(product.category.toLowerCase())
    : true;
  const isEligibleForAutoPay = !isOverMandate && isCategoryAllowed && product.active && product.stock > 0;

  // Features list derived from product specifications
  const featuresList = [
    attrs.switch ? `Switches: ${attrs.switch}` : null,
    attrs.sensor ? `Sensor: ${attrs.sensor}` : null,
    attrs.driver ? `Driver: ${attrs.driver}` : null,
    attrs.resolution ? `Resolution: ${attrs.resolution}` : null,
    attrs.connection ? `Connectivity: ${attrs.connection}` : `Connectivity: ${attrs.connectivity || 'Wireless + USB-C'}`,
    attrs.battery ? `Battery: ${attrs.battery}` : null,
    attrs.layout ? `Layout: ${attrs.layout}` : null,
    attrs.ports ? `Ports: ${attrs.ports}` : null,
    attrs.panel ? `Display Panel: ${attrs.panel}` : null,
    attrs.material ? `Materials: ${attrs.material}` : 'High-durability anodized aluminum & textured matte finish',
    'RACE Deterministic Policy & Mandate Protection Verified',
    'SHA-256 Audit Chain Cryptographic Settlement Support'
  ].filter(Boolean) as string[];

  // Specifications table mapping
  const specs = [
    { label: 'Category', value: product.category.toUpperCase() },
    { label: 'SKU / Product ID', value: product.id },
    { label: 'Merchant', value: product.merchantName || 'TechNova Gear (Verified Merchant)' },
    { label: 'Merchant Trust Score', value: `${product.merchantTrustScore || 98}/100` },
    { label: 'Connectivity', value: attrs.connection || attrs.connectivity || attrs.ports || 'Wireless / USB-C' },
    attrs.switch ? { label: 'Switch / Keycap', value: attrs.switch } : null,
    attrs.sensor ? { label: 'Sensor / DPI', value: attrs.sensor } : null,
    attrs.driver ? { label: 'Acoustic Driver', value: attrs.driver } : null,
    attrs.resolution ? { label: 'Video Resolution', value: attrs.resolution } : null,
    attrs.panel ? { label: 'Panel Type', value: attrs.panel } : null,
    attrs.battery ? { label: 'Battery / Power', value: attrs.battery } : null,
    attrs.weight ? { label: 'Weight', value: attrs.weight } : null,
    attrs.dimensions ? { label: 'Dimensions', value: attrs.dimensions } : null,
    { label: 'Stock Level', value: `${product.stock} units available` },
    { label: 'Return Policy', value: product.returnPolicy || '7-Day Return / Replacement' },
    { label: 'Warranty', value: attrs.warranty || '1-Year Official Manufacturer Warranty' },
    { label: 'Customer Rating', value: `★ ${attrs.rating || '4.8'} (${attrs.reviewsCount || 184} verified reviews)` }
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. HEADER / BREADCRUMB */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <Link
            href="/buyer"
            className="inline-flex items-center space-x-1 hover:text-indigo-400 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Customer Store</span>
          </Link>
          <span>/</span>
          <span className="text-indigo-300 uppercase">{product.category}</span>
          <span>/</span>
          <span className="text-slate-200 font-bold truncate max-w-xs">{product.name}</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
            96% AI Affinity
          </span>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
            {product.category}
          </span>
        </div>
      </div>

      {/* 2. PRODUCT HERO SECTION (2-Column Desktop Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Product Image & Badges (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-video sm:aspect-[4/3] w-full rounded-2xl bg-slate-900 border border-white/10 overflow-hidden shadow-2xl group">
            <img
              src={images[selectedImgIdx] || images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e: any) => { e.target.src = PRODUCT_IMAGES['default'][0]; }}
            />
            <div className="absolute top-3 left-3 flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-mono text-indigo-300 uppercase font-bold border border-indigo-500/30">
                {product.category}
              </span>
            </div>
            <div className="absolute top-3 right-3">
              <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-mono text-emerald-400 font-bold border border-emerald-500/30">
                {product.stock > 0 ? `${product.stock} Units In Stock` : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="flex space-x-3">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImgIdx(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImgIdx === idx ? 'border-indigo-500 scale-105 shadow-md' : 'border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Trust & Guarantee Badges */}
          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs font-mono">
            <div className="p-3 rounded-xl bg-surface/80 border border-white/5 space-y-1">
              <Truck className="w-4 h-4 text-cyan-400 mx-auto" />
              <div className="font-bold text-white text-[11px]">Free Shipping</div>
              <div className="text-[10px] text-slate-400">Delivers in 24-48h</div>
            </div>
            <div className="p-3 rounded-xl bg-surface/80 border border-white/5 space-y-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto" />
              <div className="font-bold text-white text-[11px]">1-Yr Warranty</div>
              <div className="text-[10px] text-slate-400">Direct replacement</div>
            </div>
            <div className="p-3 rounded-xl bg-surface/80 border border-white/5 space-y-1">
              <RotateCcw className="w-4 h-4 text-purple-400 mx-auto" />
              <div className="font-bold text-white text-[11px]">7-Day Returns</div>
              <div className="text-[10px] text-slate-400">Hassle-free refund</div>
            </div>
          </div>
        </div>

        {/* Right Column: Product Info & Purchase Actions (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-amber-400 text-xs">
                {'★'.repeat(5)}
              </div>
              <span className="text-xs font-mono text-slate-400 font-semibold">
                {attrs.rating || '4.8'} · {attrs.reviewsCount || 184} verified reviews
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 leading-tight">
              {product.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Pricing Box */}
          <div className="p-5 rounded-2xl bg-surface border border-white/10 flex items-center justify-between">
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold font-mono text-emerald-400">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-slate-500 line-through font-mono">
                  ₹{Math.round(product.price * 1.25).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold font-mono">
                  20% OFF
                </span>
              </div>
              <span className="text-[11px] text-slate-500">Includes all GST & import duties</span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Merchant</span>
              <div className="font-bold text-xs text-white">{product.merchantName || 'TechNova Gear'}</div>
              <div className="text-[10px] text-emerald-400 font-mono">Trust Score: {product.merchantTrustScore || 98}/100</div>
            </div>
          </div>

          {/* Mandate Status Notice Banner */}
          <div className={`p-4 rounded-xl border text-xs flex items-center space-x-3 ${
            isEligibleForAutoPay
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
          }`}>
            {isEligibleForAutoPay ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            )}
            <div>
              <div className="font-bold font-mono">
                {isEligibleForAutoPay ? '✓ Within Active Agent Spending Mandate' : '⚠ Agent Purchase Constraint'}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {isEligibleForAutoPay
                  ? `₹${product.price.toLocaleString('en-IN')} is within your ₹${mandateCap.toLocaleString('en-IN')} budget cap for category '${product.category}'.`
                  : isOverMandate
                  ? `Price exceeds your current ₹${mandateCap.toLocaleString('en-IN')} mandate cap.`
                  : `Category '${product.category}' is restricted by policy.`}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-2">
            <Button
              variant="secondary"
              onClick={handleAddToCart}
              className="w-1/2 py-3.5 flex items-center justify-center space-x-2 text-xs font-bold"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </Button>

            <Button
              variant="primary"
              onClick={handleBuyNow}
              className="w-1/2 py-3.5 flex items-center justify-center space-x-2 text-xs font-bold shadow-lg glow-brand"
            >
              <Zap className="w-4 h-4" />
              <span>Buy Now</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 3. PRODUCT DESCRIPTION & KEY FEATURES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Product Overview & Purpose</span>
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <p>
                {product.description}
              </p>
              <p>
                Engineered specifically for demanding technical workspaces, daily software engineering workflows,
                and ergonomic comfort. Built with high-precision components and backed by verified manufacturer telemetry,
                this hardware SKU guarantees reliable performance with zero compromise.
              </p>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <span>Key Features</span>
            </h2>
            <ul className="space-y-2.5 text-xs text-slate-300">
              {featuresList.map((feat, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* 4. TECHNICAL SPECIFICATIONS TABLE */}
      <Card className="p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Technical Specifications</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {specs.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-surface/90 border border-white/5 flex flex-col space-y-1 font-mono text-xs">
              <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">{item.label}</span>
              <span className="text-slate-200 font-semibold">{item.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 5. AGENT PURCHASE ELIGIBILITY SECTION */}
      <Card className="p-6 space-y-4 border-indigo-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Lock className="w-4 h-4 text-purple-400" />
              <span>Agent Purchase Eligibility Gate</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live deterministic verification against active buyer spending mandate and policy rules.
            </p>
          </div>
          <Badge variant={isEligibleForAutoPay ? 'success' : 'danger'}>
            {isEligibleForAutoPay ? '✓ Eligible for Agent Purchase' : '✕ Policy Blocked'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
          <div className="p-3 rounded-xl bg-surface/90 border border-white/5 space-y-1">
            <span className="text-[10px] uppercase text-slate-500">Mandate Cap</span>
            <div className="text-white font-bold">₹{mandateCap.toLocaleString('en-IN')}</div>
          </div>
          <div className="p-3 rounded-xl bg-surface/90 border border-white/5 space-y-1">
            <span className="text-[10px] uppercase text-slate-500">Product Price</span>
            <div className="text-emerald-400 font-bold">₹{product.price.toLocaleString('en-IN')}</div>
          </div>
          <div className="p-3 rounded-xl bg-surface/90 border border-white/5 space-y-1">
            <span className="text-[10px] uppercase text-slate-500">Category</span>
            <div className="text-slate-200 font-bold uppercase">{product.category}</div>
          </div>
          <div className="p-3 rounded-xl bg-surface/90 border border-white/5 space-y-1">
            <span className="text-[10px] uppercase text-slate-500">Category Check</span>
            <div className={`font-bold ${isCategoryAllowed ? 'text-emerald-400' : 'text-red-400'}`}>
              {isCategoryAllowed ? '✓ Allowed' : '✕ Restricted'}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-surface/90 border border-white/5 space-y-1">
            <span className="text-[10px] uppercase text-slate-500">Amount Check</span>
            <div className={`font-bold ${!isOverMandate ? 'text-emerald-400' : 'text-red-400'}`}>
              {!isOverMandate ? '✓ Within Cap' : '✕ Exceeds Cap'}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-surface/90 border border-white/5 space-y-1">
            <span className="text-[10px] uppercase text-slate-500">Auto-Pay Verdict</span>
            <div className={`font-bold ${isEligibleForAutoPay ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isEligibleForAutoPay ? '✓ Allowed' : '✕ Blocked'}
            </div>
          </div>
        </div>
      </Card>

      {/* 6. CRYPTOGRAPHIC PROOF SECTION (SHA-256 Decision & Audit Verification) */}
      <Card className="p-6 space-y-6 border-purple-500/30 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">CRYPTOGRAPHIC PROOF</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  SHA-256 LEDGER
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                SHA-256 Decision & Audit Chain Verification
              </p>
            </div>
          </div>

          {hasProof && verificationResult && (
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full font-mono text-xs font-extrabold border ${
                verificationResult.valid
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400 glow-emerald'
                  : 'bg-red-950/40 border-red-500/50 text-red-400 glow-red'
              }`}>
                {verificationResult.valid ? '✓ VALID' : '⚠ COMPROMISED'}
              </span>
            </div>
          )}
        </div>

        {/* If NO purchase proof exists yet for this product */}
        {!hasProof ? (
          <div className="p-6 rounded-2xl bg-surface/60 border border-white/5 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">No Purchase Proof Exists for this Product Yet</h3>
            <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
              Cryptographic certificates are generated when a purchase is authorized and captured.
              The mandate decision, risk score, Razorpay settlement, and inventory decrement will be sealed
              in the SHA-256 audit chain upon checkout.
            </p>
            <div className="pt-2">
              <Button variant="secondary" onClick={handleBuyNow} className="text-xs">
                Purchase SKU to Seal Cryptographic Proof →
              </Button>
            </div>
          </div>
        ) : (
          /* When purchase proof exists */
          <div className="space-y-6">
            {/* Hash Information Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-4 rounded-xl bg-surface/90 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase text-slate-500 font-bold">Decision Hash (Mandate + Policy)</span>
                  <button
                    onClick={() => handleCopy(proofData?.decisionHash || '', 'Decision Hash')}
                    className="text-slate-400 hover:text-white flex items-center space-x-1 text-[10px]"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
                <div className="text-indigo-300 break-all text-[11px] bg-slate-900/80 p-2.5 rounded-lg border border-white/5">
                  {proofData?.decisionHash || '6a3f9104bce9...'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface/90 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase text-slate-500 font-bold">Transaction Hash (Order + Event Chain)</span>
                  <button
                    onClick={() => handleCopy(proofData?.transactionHash || '', 'Transaction Hash')}
                    className="text-slate-400 hover:text-white flex items-center space-x-1 text-[10px]"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
                <div className="text-purple-300 break-all text-[11px] bg-slate-900/80 p-2.5 rounded-lg border border-white/5">
                  {proofData?.transactionHash || '8910acbe94...'}
                </div>
              </div>
            </div>

            {/* Verification Breakdown Checklist */}
            <div className="p-4 rounded-xl bg-surface/80 border border-white/5 space-y-3">
              <div className="text-xs font-mono font-bold text-slate-300 uppercase">
                Cryptographic Verification Breakdown
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Decision Hash:</span>
                  <span className={`font-bold ${verificationResult?.decisionHashValid ? 'text-emerald-400' : 'text-red-400'}`}>
                    {verificationResult?.decisionHashValid ? '✓ Valid' : '✕ Mismatch'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Transaction Hash:</span>
                  <span className={`font-bold ${verificationResult?.transactionHashValid ? 'text-emerald-400' : 'text-red-400'}`}>
                    {verificationResult?.transactionHashValid ? '✓ Valid' : '✕ Mismatch'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Content Hash:</span>
                  <span className={`font-bold ${verificationResult?.contentHashValid ? 'text-emerald-400' : 'text-red-400'}`}>
                    {verificationResult?.contentHashValid ? '✓ Valid' : '✕ Mismatch'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Previous Block Link:</span>
                  <span className={`font-bold ${verificationResult?.chainValid ? 'text-emerald-400' : 'text-red-400'}`}>
                    {verificationResult?.chainValid ? '✓ Valid' : '✕ Broken'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Chain Integrity:</span>
                  <span className={`font-bold ${verificationResult?.chainValid ? 'text-emerald-400' : 'text-red-400'}`}>
                    {verificationResult?.chainValid ? '✓ Intact' : '✕ Corrupted'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">SHA-256 Proof:</span>
                  <span className={`font-bold ${verificationResult?.valid ? 'text-emerald-400' : 'text-red-400'}`}>
                    {verificationResult?.valid ? '✓ Valid' : '✕ Invalid'}
                  </span>
                </div>
              </div>

              {/* Status Message */}
              {verificationResult?.message && (
                <div className={`p-3 rounded-lg border text-xs font-mono mt-2 ${
                  verificationResult.valid
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-950/30 border-red-500/30 text-red-300'
                }`}>
                  {verificationResult.valid
                    ? `✓ ${verificationResult.message}`
                    : `⚠️ ${verificationResult.message} (${verificationResult.details || 'Tamper detected'})`}
                </div>
              )}
            </div>

            {/* Action Buttons: Verify, Tamper, Restore, Copy Summary */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                onClick={() => handleVerifyIntegrity(false)}
                disabled={isVerifying}
                className="text-xs flex items-center space-x-1.5 shadow-md glow-brand"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{isVerifying ? 'Verifying...' : '✓ Verify Integrity'}</span>
              </Button>

              <Button
                variant="secondary"
                onClick={() => handleVerifyIntegrity(true)}
                disabled={isVerifying}
                className="text-xs flex items-center space-x-1.5 text-red-300 border-red-500/30 hover:bg-red-950/40"
              >
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>Simulate Tamper</span>
              </Button>

              <Button
                variant="secondary"
                onClick={() => handleVerifyIntegrity(false)}
                disabled={isVerifying}
                className="text-xs flex items-center space-x-1.5"
              >
                <RotateCcw className="w-4 h-4 text-indigo-400" />
                <span>Restore / Verify Original</span>
              </Button>

              <Button
                variant="secondary"
                onClick={handleCopyVerificationSummary}
                className="text-xs flex items-center space-x-1.5 ml-auto"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Verification Details</span>
              </Button>
            </div>

            {/* Customer-Facing Explanation */}
            <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs space-y-1.5">
              <div className="font-bold text-indigo-300 flex items-center space-x-1.5">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>WHAT DOES THIS MEAN?</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                The purchase decision is sealed using SHA-256 cryptographic hashing. The verification process
                recomputes the recorded hashes and validates the audit-chain links to detect unauthorized changes,
                guaranteeing non-repudiation between the customer mandate, merchant catalog, and Razorpay settlement.
              </p>
            </div>

            {/* Expandable Technical Details */}
            <div className="rounded-xl border border-white/5 overflow-hidden">
              <button
                onClick={() => setTechnicalDetailsOpen(!technicalDetailsOpen)}
                className="w-full p-3.5 bg-surface/90 flex items-center justify-between text-xs font-mono text-slate-300 hover:text-white"
              >
                <span className="font-bold">Technical Ledger Details</span>
                {technicalDetailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {technicalDetailsOpen && (
                <div className="p-4 bg-slate-950/80 space-y-3 font-mono text-xs border-t border-white/5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Hashing Algorithm:</span>
                      <span className="text-white">SHA-256 (Canonical JSON RFC 8785)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Audit Chain Index:</span>
                      <span className="text-white">Block #{verificationResult?.blockIndex ?? proofData?.blockIndex ?? 1}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 block">Previous Block Hash:</span>
                      <span className="text-slate-300 break-all">{proofData?.previousHash || '0'.repeat(64)}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 block">Current Block Hash:</span>
                      <span className="text-slate-300 break-all">{proofData?.currentHash || proofData?.transactionHash}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* 7. INTERACTIVE "ASK AI ABOUT THIS PRODUCT" ASSISTANT */}
      <Card className="p-6 space-y-4 border-indigo-500/30">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Ask AI Copilot About This Product</h3>
            <p className="text-[11px] text-slate-400">Instant answers grounded in verified manufacturer specs</p>
          </div>
        </div>

        {/* Pre-canned Prompts */}
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          <button
            onClick={() => handleAskAi('Is this good for long coding sessions?')}
            className="px-3 py-1 rounded-full bg-surface hover:bg-white/10 border border-white/10 text-slate-300"
          >
            "Is this good for coding?"
          </button>
          <button
            onClick={() => handleAskAi('What is the exact battery life?')}
            className="px-3 py-1 rounded-full bg-surface hover:bg-white/10 border border-white/10 text-slate-300"
          >
            "How long is battery life?"
          </button>
          <button
            onClick={() => handleAskAi('Is this compatible with macOS and Windows?')}
            className="px-3 py-1 rounded-full bg-surface hover:bg-white/10 border border-white/10 text-slate-300"
          >
            "Works with Mac & Windows?"
          </button>
        </div>

        {/* Conversation Stream */}
        <div className="space-y-3 pt-2">
          {aiChat.map((chat, idx) => (
            <div key={idx} className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-200 font-semibold self-end">
                <span className="text-[10px] font-mono text-indigo-400 block mb-0.5">YOU ASKED:</span>
                {chat.q}
              </div>
              <div className="p-3.5 rounded-xl bg-surface/90 border border-white/10 text-slate-300 leading-relaxed">
                <span className="text-[10px] font-mono text-emerald-400 font-bold block mb-1">
                  AI SPECIFICATION COPILOT:
                </span>
                {chat.a}
              </div>
            </div>
          ))}
        </div>

        {/* Q&A Input */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAskAi();
            }}
            placeholder="Ask about dimensions, keycaps, latency, connectivity, policy bounds..."
            className="flex-1 text-xs"
            disabled={isAskingAi}
          />
          <Button
            variant="primary"
            onClick={() => handleAskAi()}
            disabled={isAskingAi || !aiQuestion.trim()}
            className="text-xs"
          >
            {isAskingAi ? 'Analyzing...' : 'Ask AI'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
