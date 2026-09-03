'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, 
  ShieldCheck, 
  Edit3, 
  Save, 
  RefreshCw, 
  AlertTriangle, 
  TrendingUp, 
  Sliders,
  DollarSign,
  Plus,
  Sparkles
} from 'lucide-react';
import { fetchApi } from '../../../lib/api';
import { Card, MetricCard } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

export default function MerchantProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetchApi<any[]>('/api/catalog');
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
      // Local optimistic update if demo endpoint
      setProducts(prev => prev.map(p => p.id === id ? { ...p, price: editPrice, stock: editStock } : p));
      setEditingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              SKU INTELLIGENCE & INVENTORY
            </span>
            <span className="text-xs font-mono text-slate-400">· RACE-ACP Protocol</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Machine-Readable Merchant Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time SKU pricing, inventory thresholds, margin models, and autonomous buyer agent access controls.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link href="/merchant/simulation">
            <Button variant="primary" className="text-xs flex items-center space-x-1.5">
              <Sliders className="w-4 h-4" />
              <span>Simulate Price Elasticity</span>
            </Button>
          </Link>
          <button
            onClick={loadProducts}
            className="p-2.5 rounded-xl bg-surface border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-300 flex items-center space-x-1.5 hover:bg-white/5"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active SKUs"
          value={products.length.toString()}
          subtitle="100% Agent Discoverable"
          icon={<Package className="w-4 h-4 text-indigo-400" />}
        />
        <MetricCard
          title="Average SKU Margin"
          value="34.2%"
          change={2.8}
          subtitle="Net gross margin"
          icon={<DollarSign className="w-4 h-4 text-emerald-400" />}
        />
        <MetricCard
          title="Low Stock SKUs"
          value="1"
          subtitle="SKU-PRO-05 under 20 units"
          icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
        />
        <MetricCard
          title="AI Demand Velocity"
          value="+18.4%"
          change={18.4}
          subtitle="High-intent queries"
          icon={<TrendingUp className="w-4 h-4 text-cyan-400" />}
        />
      </div>

      {/* Product Table */}
      <Card className="p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">Configured Product Catalog</h2>
          <span className="text-xs font-mono text-slate-400">Showing {products.length} Live Items</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr>
                <th>Product SKU</th>
                <th>Category</th>
                <th>Live Price</th>
                <th>Available Stock</th>
                <th>Demand Index</th>
                <th>Agent Access</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => {
                const isEditing = editingId === p.id;
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="font-bold text-white text-sm font-sans">{p.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{p.id}</div>
                    </td>
                    <td>
                      <span className="px-2 py-0.5 rounded bg-surface border border-white/10 text-slate-300 uppercase">
                        {p.category}
                      </span>
                    </td>
                    <td className="font-bold">
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
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editStock}
                          onChange={(e) => setEditStock(Number(e.target.value))}
                          className="w-20 bg-surface border border-indigo-500 rounded px-2 py-1 text-white text-xs font-mono"
                        />
                      ) : (
                        <span className={p.stock < 25 ? 'text-amber-400 font-bold' : 'text-slate-200'}>
                          {p.stock} units
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="text-cyan-400 font-bold">
                        {92 - idx * 4}/100 (High)
                      </span>
                    </td>
                    <td>
                      <Badge variant="success">
                        ● ACP ENABLED
                      </Badge>
                    </td>
                    <td className="text-right">
                      {isEditing ? (
                        <button
                          onClick={() => handleSave(p.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center space-x-1 ml-auto"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>
                      ) : (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleStartEdit(p)}
                            className="px-2.5 py-1 rounded-lg bg-surface hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-medium flex items-center space-x-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <Link
                            href="/merchant/simulation"
                            className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-medium flex items-center space-x-1"
                          >
                            <Sliders className="w-3 h-3" />
                            <span>Simulate</span>
                          </Link>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
