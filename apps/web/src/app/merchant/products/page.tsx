'use client';

import React, { useState, useEffect } from 'react';
import { Package, ShieldCheck, Edit3, Save, RefreshCw, AlertTriangle } from 'lucide-react';
import { fetchApi } from '../../../lib/api';

export default function MerchantProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetchApi<any[]>('/api/merchant/products');
      setProducts(res);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleStartEdit = (p: any) => {
    setEditingId(p.id);
    setEditPrice(p.price);
    setEditStock(p.stock);
  };

  const handleSave = async (id: string) => {
    try {
      await fetchApi<any>(`/api/merchant/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          price: editPrice,
          stock: editStock
        })
      });
      setEditingId(null);
      loadProducts();
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Merchant Product Catalog</h1>
          <p className="text-xs text-slate-400 mt-1">
            Machine-readable SKUs exposed to autonomous buyer agents via RACE-ACP feed.
          </p>
        </div>
        <button
          onClick={loadProducts}
          className="px-3.5 py-2 rounded-xl bg-surface border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-300 flex items-center space-x-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Feed</span>
        </button>
      </div>

      <div className="rounded-2xl glass-panel border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface/90 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price (INR)</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Agent Delegated</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((p) => {
                const isEditing = editingId === p.id;
                return (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.id}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 font-mono text-[10px] uppercase">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(Number(e.target.value))}
                          className="w-24 bg-surface border border-indigo-500 rounded px-2 py-1 text-white text-xs font-mono"
                        />
                      ) : (
                        <span className="text-emerald-400 text-sm">₹{p.price}</span>
                      )}
                    </td>
                    <td className="p-4 font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editStock}
                          onChange={(e) => setEditStock(Number(e.target.value))}
                          className="w-20 bg-surface border border-indigo-500 rounded px-2 py-1 text-white text-xs font-mono"
                        />
                      ) : (
                        <span className={p.stock < 10 ? 'text-amber-400' : 'text-slate-200'}>
                          {p.stock} units
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] border border-emerald-500/40">
                        ✓ ACTIVE
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {isEditing ? (
                        <button
                          onClick={() => handleSave(p.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center space-x-1 ml-auto"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(p)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-medium ml-auto flex items-center space-x-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
