'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Store, 
  Bot, 
  Sliders, 
  Users, 
  TrendingUp, 
  FileCheck2, 
  Zap, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Package,
  Layers,
  X
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    { label: 'Merchant AI Command Center', category: 'Navigation', icon: Store, href: '/merchant' },
    { label: 'What-If Simulation Lab', category: 'Intelligence', icon: Sliders, href: '/merchant/simulation' },
    { label: 'Product & SKU Intelligence', category: 'Intelligence', icon: Package, href: '/merchant/intelligence' },
    { label: 'Customer RFM Segmentation', category: 'Intelligence', icon: Users, href: '/merchant/customers' },
    { label: 'Automation & Rule Center', category: 'Governance', icon: Zap, href: '/merchant/automations' },
    { label: 'Multi-Agent Control Center', category: 'Agents', icon: Bot, href: '/merchant/agents' },
    { label: 'Customer Store & Copilot', category: 'Store', icon: Bot, href: '/buyer' },
    { label: 'Interactive 5 Demos', category: 'Demonstration', icon: Sparkles, href: '/demo' },
    { label: 'SHA-256 Proof Explorer', category: 'Trust', icon: FileCheck2, href: '/proofs' },
    { label: 'Cryptographic Audit Log', category: 'Trust', icon: ShieldCheck, href: '/audit' }
  ];

  const filtered = quickActions.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      <div className="relative mx-auto max-w-xl rounded-2xl bg-surface border border-indigo-500/30 shadow-2xl overflow-hidden animate-scaleIn text-slate-100">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10">
          <Search className="w-5 h-5 text-indigo-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search navigation, products, simulations, or AI insights..."
            className="w-full bg-transparent border-none text-sm text-white placeholder-slate-500 outline-none"
            autoFocus
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No matching pages or actions found for "{query}".
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(item.href)}
                  className="w-full p-2.5 rounded-xl hover:bg-indigo-600/20 hover:border-indigo-500/30 border border-transparent flex items-center justify-between text-left transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-indigo-200">
                        {item.label}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
