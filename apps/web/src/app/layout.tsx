import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Navigation } from '../components/Navigation';

export const metadata: Metadata = {
  title: 'RACE | Razorpay Agentic Commerce Exchange',
  description: 'Where AI can act — without losing control. Agentic commerce control plane with bounded autonomy, policy gating, explainable risk, and cryptographic audit proofs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-slate-100 min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white">
        <Navigation />
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t border-white/10 py-6 bg-surface/50 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-300">RACE</span>
              <span>— Razorpay Agentic Commerce Exchange</span>
            </div>
            <div className="flex items-center space-x-4 font-mono text-[11px]">
              <span className="text-emerald-400">● Bounded Autonomy Active</span>
              <span className="text-indigo-400">● SHA-256 Audit Chain Valid</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
