'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Cpu, 
  Bot, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Play, 
  ToggleLeft, 
  ToggleRight, 
  Zap, 
  Layers,
  ArrowRight,
  Activity
} from 'lucide-react';
import { getAIAgentsStatus, getAutomationRules } from '../../../lib/intelligence';
import { realtimeBus } from '../../../lib/realtime';

export default function AIAgentsAndAutomationsPage() {
  const [agents, setAgents] = useState(getAIAgentsStatus());
  const [rules, setRules] = useState(getAutomationRules());
  const [testSuccessMsg, setTestSuccessMsg] = useState<string | null>(null);

  const toggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === ruleId ? { ...r, status: r.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : r
      )
    );
  };

  const handleTestRule = (rule: any) => {
    setTestSuccessMsg(`Rule "${rule.name}" triggered test execution successfully.`);
    realtimeBus.publish({
      eventType: 'ANOMALY_DETECTED',
      actorName: 'Automation Engine',
      actorRole: 'GROWTH_AGENT',
      description: `Executed rule "${rule.name}": ${rule.automatedAction}`,
      badgeType: 'purple'
    });
    setTimeout(() => setTestSuccessMsg(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-brand-accent text-white flex items-center justify-center font-bold shadow-lg">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-white">AI Agents & Automation Center</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/40">
                MULTI-AGENT ORCHESTRATION
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active autonomous intelligence modules, real-time tool execution states, and deterministic policy automations.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="text-emerald-400 font-bold">5 Agents Online</span>
          <span className="text-slate-500">·</span>
          <span className="text-indigo-300 font-bold">4 Active Rules</span>
        </div>
      </div>

      {testSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-xs text-emerald-300 flex items-center space-x-2 shadow-lg animate-bounce">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold">{testSuccessMsg}</span>
        </div>
      )}

      {/* 1. SPECIALIZED AI AGENTS GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-4 h-4 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Specialized AI Intelligence Modules</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Deterministic Backend Bounded</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((ag) => {
            const isMonitoring = ag.status === 'MONITORING';
            const isAwaiting = ag.status === 'AWAITING_APPROVAL';

            return (
              <div
                key={ag.id}
                className="p-5 rounded-2xl glass-card border border-white/10 hover:border-indigo-500/40 transition-all space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">{ag.lastActive}</span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                        isMonitoring
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isAwaiting
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {ag.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm mt-2">{ag.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-snug">{ag.role}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="p-3 rounded-xl bg-surface/90 border border-white/5 text-xs space-y-1">
                    <span className="text-[9px] font-mono uppercase text-slate-500">Recent Action</span>
                    <p className="text-[11px] text-slate-300 leading-tight">{ag.recentAction}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-1">
                    <span className="text-slate-400">Efficiency Score</span>
                    <span className="text-emerald-400 font-bold">{ag.efficiencyScore}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. AUTOMATION RULES ENGINE */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-brand-accent" />
            <h2 className="text-base font-bold text-white">Rule Automation Engine</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">When-This-Then-That Logic</span>
        </div>

        <div className="space-y-3">
          {rules.map((rule) => {
            const isActive = rule.status === 'ACTIVE';

            return (
              <div
                key={rule.id}
                className={`p-5 rounded-2xl glass-panel border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isActive ? 'border-white/10' : 'border-white/5 opacity-60'
                }`}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm">{rule.name}</span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-700/50 text-slate-400'
                      }`}
                    >
                      {rule.status}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Executed {rule.executionCount}x</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                    <div className="p-2 rounded-lg bg-surface/80 border border-white/5">
                      <span className="text-[9px] uppercase text-slate-500 block">Trigger</span>
                      <span className="text-cyan-300 text-[11px]">{rule.triggerEvent}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-surface/80 border border-white/5">
                      <span className="text-[9px] uppercase text-slate-500 block">AI Reasoning</span>
                      <span className="text-indigo-300 text-[11px]">{rule.aiDecisionLogic}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-surface/80 border border-white/5">
                      <span className="text-[9px] uppercase text-slate-500 block">Automated Action</span>
                      <span className="text-emerald-300 text-[11px]">{rule.automatedAction}</span>
                    </div>
                  </div>
                </div>

                {/* Toggle & Test Action */}
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <button
                    onClick={() => handleTestRule(rule)}
                    className="px-3 py-1.5 rounded-lg bg-surface hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold flex items-center space-x-1"
                  >
                    <Play className="w-3 h-3 text-emerald-400" />
                    <span>Test Trigger</span>
                  </button>

                  <button
                    onClick={() => toggleRule(rule.id)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    {isActive ? (
                      <ToggleRight className="w-7 h-7 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-slate-600" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
