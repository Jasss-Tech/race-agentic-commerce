import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Navigation } from '../components/Navigation';
import { ThemeProvider } from '../context/ThemeContext';
import { CartProvider } from '../context/CartContext';
import { GlobalToast } from '../components/layout/GlobalToast';
import { ShieldCheck, FileCheck2, CreditCard } from 'lucide-react';

export const metadata: Metadata = {
  title: 'RACE Decision AI | Real-Time Decision Intelligence & Agentic Commerce',
  description: 'Where AI can act — without losing control. Real-time decision intelligence platform with bounded autonomy, policy gating, explainable risk, and cryptographic audit proofs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased">
        <ThemeProvider>
          <CartProvider>
            <Navigation />
            <GlobalToast />
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t border-border bg-card/50 py-6">
              <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-display text-sm font-bold text-foreground">RACE Decision AI</span>
                  <span>— Razorpay Agentic Commerce Exchange</span>
                </div>
                <div className="flex items-center gap-4 font-mono text-[11px]">
                  <span className="flex items-center gap-1.5 text-success">
                    <ShieldCheck className="h-3 w-3" /> Bounded Autonomy Active
                  </span>
                  <span className="flex items-center gap-1.5 text-primary">
                    <FileCheck2 className="h-3 w-3" /> SHA-256 Audit Chain Valid
                  </span>
                  <span className="flex items-center gap-1.5 text-signal-telemetry">
                    <CreditCard className="h-3 w-3" /> Razorpay Test Mode
                  </span>
                </div>
              </div>
            </footer>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
