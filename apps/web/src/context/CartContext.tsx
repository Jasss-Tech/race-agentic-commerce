'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProductDto } from '@race/types';
import { realtimeBus } from '../lib/realtime';

export interface CartItem {
  product: ProductDto;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: ProductDto, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('race-cart');
      if (stored) {
        setItems(JSON.parse(stored));
      } else {
        // Initial seed with Logitech / TechNova keyboard for demo continuity
        setItems([
          {
            product: {
              id: 'prod_keyboard_01',
              merchantId: 'merch_technova',
              name: 'TechNova Mechanical Keyboard',
              slug: 'technova-mechanical-keyboard',
              description: 'Wireless 75% mechanical keyboard with hot-swappable red switches and RGB backlighting.',
              category: 'keyboard',
              price: 2199,
              currency: 'INR',
              stock: 42,
              active: true,
              agentPurchasable: true,
              attributes: { layout: '75%', switch: 'mechanical-red', connection: 'wireless' },
              returnPolicy: '7-day replacement',
              merchantName: 'TechNova Gear',
              merchantTrustScore: 96
            },
            quantity: 1
          }
        ]);
      }
    } catch {
      // ignore
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('race-cart', JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const addToCart = (product: ProductDto, quantity: number = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock || 99) }
            : item
        );
      } else {
        return [...prev, { product, quantity: Math.min(quantity, product.stock || 99) }];
      }
    });

    // Broadcast Real-time event to Merchant Command Center
    realtimeBus.publish({
      eventType: 'CART_ADD',
      actorName: 'Aarav Sharma',
      actorRole: 'CUSTOMER',
      description: `Added "${product.name}" (${quantity}x · ₹${product.price}) to cart`,
      badgeType: 'info'
    });

    setToastMessage(`✓ Added ${product.name} to cart`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const removeFromCart = (productId: string) => {
    const item = items.find(i => i.product.id === productId);
    if (item) {
      realtimeBus.publish({
        eventType: 'CART_REMOVE',
        actorName: 'Aarav Sharma',
        actorRole: 'CUSTOMER',
        description: `Removed "${item.product.name}" from shopping cart`,
        badgeType: 'warning'
      });
    }
    setItems(prev => prev.filter(i => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(quantity, item.product.stock || 99) }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = subtotal > 3000 ? Math.round(subtotal * 0.05) : 0; // 5% bundle discount if > ₹3000
  const shipping = subtotal > 1500 ? 0 : 99;
  const total = Math.max(0, subtotal - discount + shipping);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        discount,
        shipping,
        total,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toastMessage,
        setToastMessage
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
