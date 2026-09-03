'use client';

import React from 'react';
import Link from 'next/link';
import { 
  X, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Zap,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from './ui/Button';

export function CartDrawer() {
  const { 
    items, 
    itemCount, 
    subtotal, 
    discount, 
    shipping, 
    total, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity 
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md bg-surface border-l border-white/10 shadow-2xl flex flex-col justify-between animate-slideLeft text-slate-100">
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Shopping Cart ({itemCount})</h2>
                <p className="text-[11px] text-slate-400 font-mono">Bounded by Active Buyer Mandate</p>
              </div>
            </div>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12 text-slate-400">
                <ShoppingCart className="w-12 h-12 text-slate-600" />
                <div className="font-bold text-white text-sm">Your cart is currently empty</div>
                <p className="text-xs max-w-xs">Discover workspace gear and hardware from the customer store.</p>
                <Button 
                  variant="primary" 
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 text-xs"
                >
                  Browse Store
                </Button>
              </div>
            ) : (
              items.map((item) => (
                <div 
                  key={item.product.id}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono uppercase">
                        {item.product.category}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                        96% AI Match
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white truncate mt-1">{item.product.name}</h4>
                    <div className="font-mono text-xs font-extrabold text-emerald-400 mt-0.5">
                      ₹{item.product.price}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
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

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Summary */}
          {items.length > 0 && (
            <div className="p-5 border-t border-white/10 bg-slate-950/60 space-y-3">
              {/* Mandate Cap Tracker */}
              <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-[11px] font-mono flex items-center justify-between">
                <span className="text-slate-300 flex items-center space-x-1.5">
                  <Lock className="w-3 h-3 text-indigo-400" />
                  <span>Mandate Remaining:</span>
                </span>
                <span className="text-emerald-400 font-bold">
                  ₹{Math.max(0, 10000 - total).toLocaleString()} INR
                </span>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal ({itemCount} items):</span>
                  <span className="text-slate-200">₹{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>AI Synergy Discount (5%):</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Standard Delivery:</span>
                  <span className="text-emerald-400">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                  <span>Total Amount:</span>
                  <span className="text-emerald-400 text-base">₹{total.toLocaleString()} INR</span>
                </div>
              </div>

              <Link
                href="/buyer/cart"
                onClick={() => setIsCartOpen(false)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg glow-brand transition-all block text-center"
              >
                <span>Proceed to Bounded Checkout</span>
                <ArrowRight className="w-4 h-4 inline" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
