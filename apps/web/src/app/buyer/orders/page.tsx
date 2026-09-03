'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Package, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  ExternalLink,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import { fetchApi } from '../../../lib/api';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([
    {
      id: 'ord_race_90124',
      date: 'Today, 22:45',
      items: ['TechNova Mechanical Keyboard (1x)', 'TechNova Precision Wireless Mouse (1x)'],
      amount: 3098,
      status: 'PAID',
      paymentId: 'pay_rzp_98412891',
      proofHash: 'sha256_9b82fa018c129e84'
    },
    {
      id: 'ord_race_87123',
      date: 'Yesterday, 14:20',
      items: ['TechNova 7-in-1 USB-C Hub (1x)'],
      amount: 1299,
      status: 'DELIVERED',
      paymentId: 'pay_rzp_74829104',
      proofHash: 'sha256_4f21ab9382103984'
    }
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              CUSTOMER PORTAL
            </span>
            <span className="text-xs font-mono text-slate-400">· Cryptographically Sealed Receipts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Your Purchase History & Proofs
          </h1>
        </div>

        <Link href="/buyer">
          <Button variant="primary" className="text-xs flex items-center space-x-1.5">
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Products</span>
          </Button>
        </Link>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="p-6 space-y-4 border-white/10 hover:border-indigo-500/30 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-white text-sm font-mono">{order.id}</h3>
                    <Badge variant={order.status === 'PAID' ? 'brand' : 'success'}>
                      ● {order.status}
                    </Badge>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{order.date}</span>
                </div>
              </div>

              <div className="text-right font-mono">
                <div className="text-lg font-extrabold text-emerald-400">₹{order.amount.toLocaleString()} INR</div>
                <span className="text-[10px] text-slate-500">{order.paymentId}</span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-1 text-xs text-slate-300">
              <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">Items Purchased</div>
              <ul className="list-disc list-inside space-y-0.5">
                {order.items.map((it: string, i: number) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            </div>

            {/* Proof Verification Link */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono bg-surface/50 p-3 rounded-xl border border-white/5">
              <div className="flex items-center space-x-2 text-slate-400">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>SHA-256 Proof Hash:</span>
                <span className="text-indigo-300 font-bold">{order.proofHash}</span>
              </div>
              <Link 
                href="/proofs"
                className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
              >
                <span>Verify Chain</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
