'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '../../../lib/api';
import { PackageCheck, ShieldCheck, Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function MerchantOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<any[]>('/api/merchant/orders')
      .then(data => setOrders(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Merchant Orders</h1>
          <p className="text-xs text-slate-400 mt-1">Autonomous agent delegated orders and verified transactions.</p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="p-8 text-center text-slate-400 glass-panel rounded-2xl">No orders recorded yet.</div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Buyer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Gateway Reference</th>
                <th className="p-4">Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-slate-800/30 transition">
                  <td className="p-4 font-mono font-bold text-white">{order.id}</td>
                  <td className="p-4">
                    <div className="font-semibold text-white">{order.buyerName}</div>
                    <div className="text-[10px] text-slate-500">{order.buyerEmail}</div>
                  </td>
                  <td className="p-4">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="truncate max-w-xs text-slate-300">
                        {item.quantity}x {item.productName}
                      </div>
                    ))}
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-400">
                    ₹{order.amount} {order.currency}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                      order.status === 'PAID'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : order.status === 'BLOCKED'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-[11px] text-slate-400">
                    {order.razorpayPaymentId || order.razorpayOrderId || '—'}
                  </td>
                  <td className="p-4">
                    {order.hasProof ? (
                      <Link
                        href={`/proofs`}
                        className="inline-flex items-center text-indigo-400 hover:text-indigo-300 font-mono text-[11px]"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                        Verified Proof
                      </Link>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
