'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Hash, 
  Lock, 
  Layers,
  AlertTriangle
} from 'lucide-react';
import { fetchApi } from '../../lib/api';

export default function AuditExplorerPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [chainIntegrity, setChainIntegrity] = useState<'VALID' | 'TAMPERED'>('VALID');

  const loadAudit = async () => {
    setLoading(true);
    try {
      const res = await fetchApi<any>('/api/audit');
      setEvents(res.events || []);
      setChainIntegrity(res.chainIntegrity || 'VALID');
    } catch (err) {
      console.error('Failed to load audit events', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-bold">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-white">RACE Audit Explorer</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/40">
                SHA-256 HASH CHAIN
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Tamper-evident, cryptographically chained event log tracing every autonomous action, policy gate, and payment.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Chain Integrity: {chainIntegrity}</span>
          </div>
          <button
            onClick={loadAudit}
            className="p-2 rounded-xl bg-surface border border-white/10 hover:border-white/20 text-slate-300 text-xs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Events Timeline */}
      <div className="space-y-3">
        {events.map((ev, idx) => {
          const isExpanded = expandedId === ev.id;
          const isAllowed = ev.decision === 'ALLOW' || ev.decision === 'SUCCESS' || ev.decision === 'CREATED';
          const isBlocked = ev.decision === 'BLOCK' || ev.decision === 'FAILURE';

          return (
            <div
              key={ev.id}
              className={`rounded-2xl glass-card border transition-all ${
                isBlocked
                  ? 'border-red-500/40 bg-red-950/10'
                  : 'border-white/10 hover:border-indigo-500/30'
              }`}
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : ev.id)}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center font-mono text-[10px] text-slate-400 border border-white/10">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-white">{ev.eventType}</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-indigo-300 border border-white/10">
                        {ev.actorType}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Resource: {ev.resourceType} · {ev.resourceId}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      isAllowed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : isBlocked
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {ev.decision || 'LOGGED'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(ev.createdAt).toLocaleTimeString()}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {/* Expanded Hash Block & Metadata */}
              {isExpanded && (
                <div className="p-4 border-t border-white/5 bg-surface/60 space-y-3 text-xs font-mono">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-surface/90 border border-white/5 space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase">Previous Event Hash</span>
                      <div className="text-slate-400 break-all">{ev.previousHash || '0000000000000000000000000000000000000000000000000000000000000000 (GENESIS)'}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface/90 border border-indigo-500/20 space-y-1">
                      <span className="text-[9px] text-indigo-400 uppercase font-bold">Current SHA-256 Hash</span>
                      <div className="text-indigo-200 break-all">{ev.hash}</div>
                    </div>
                  </div>

                  {ev.metadata && (
                    <div className="p-3 rounded-lg bg-surface/90 border border-white/5 space-y-1">
                      <span className="text-[9px] text-slate-400 uppercase">Payload Metadata</span>
                      <pre className="text-[10px] text-slate-300 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(ev.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
