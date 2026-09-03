'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  Play, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  History, 
  Sliders, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Bell, 
  Trash2, 
  RefreshCw,
  Sparkles,
  TrendingDown,
  Lock
} from 'lucide-react';
import { Card, MetricCard } from '../../../components/ui/Card';
import { Badge, SeverityBadge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

interface AutomationRule {
  id: string;
  name: string;
  triggerMetric: string;
  triggerCondition: string;
  triggerThreshold: string;
  actions: string[];
  status: 'ACTIVE' | 'PAUSED';
  lastTriggered: string;
  triggerCount: number;
  successRate: number;
}

export default function AutomationsPage() {
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: 'rule-1',
      name: 'Dynamic Price Elasticity Guardrail',
      triggerMetric: 'Conversion Rate',
      triggerCondition: 'drops more than',
      triggerThreshold: '5.0%',
      actions: ['Run Price Elasticity Audit', 'Notify Merchant on Slack', 'Generate AI Price Proposal'],
      status: 'ACTIVE',
      lastTriggered: '18 mins ago',
      triggerCount: 14,
      successRate: 99.2
    },
    {
      id: 'rule-2',
      name: 'Autonomous Inventory Sentinel',
      triggerMetric: 'Stock Level',
      triggerCondition: 'falls below',
      triggerThreshold: '15 units',
      actions: ['Trigger Supplier PO Draft', 'Cap Buyer Agent Max Quantity', 'Alert Inventory Lead'],
      status: 'ACTIVE',
      lastTriggered: '1 hour ago',
      triggerCount: 8,
      successRate: 100.0
    },
    {
      id: 'rule-3',
      name: 'Price Drift Tamper Trap',
      triggerMetric: 'Checkout Client Price',
      triggerCondition: 'differs from DB Price by',
      triggerThreshold: '> 0.00%',
      actions: ['Block Transaction via Policy Engine', 'Seal Tamper Proof in SHA-256 Chain', 'Log Security Event'],
      status: 'ACTIVE',
      lastTriggered: '3 hours ago',
      triggerCount: 3,
      successRate: 100.0
    },
    {
      id: 'rule-4',
      name: 'High-Intent Cart Recovery Booster',
      triggerMetric: 'Cart Abandonment Time',
      triggerCondition: 'exceeds',
      triggerThreshold: '10 minutes',
      actions: ['Verify Merchant Retention Policy', 'Formulate Bounded 5% Incentive Bundle', 'Dispatch Copilot Notification'],
      status: 'ACTIVE',
      lastTriggered: '24 mins ago',
      triggerCount: 42,
      successRate: 95.8
    }
  ]);

  const [testResult, setTestResult] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // New Rule Form State
  const [isCreating, setIsCreating] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newMetric, setNewMetric] = useState('Conversion Rate');
  const [newCondition, setNewCondition] = useState('drops more than');
  const [newThreshold, setNewThreshold] = useState('5%');
  const [newAction, setNewAction] = useState('Run Price Elasticity Audit');

  const handleTestRule = (rule: AutomationRule) => {
    setIsSimulating(true);
    setTestResult(null);
    setTimeout(() => {
      setIsSimulating(false);
      setTestResult(
        `✓ [TEST SIMULATION PASS] Condition "${rule.triggerMetric} ${rule.triggerCondition} ${rule.triggerThreshold}" triggered successfully. ` +
        `Policy Engine evaluated 3 actions: ALL PERMITTED. Execution simulated in 12ms.`
      );
    }, 800);
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName) return;
    const rule: AutomationRule = {
      id: `rule-${Date.now()}`,
      name: newRuleName,
      triggerMetric: newMetric,
      triggerCondition: newCondition,
      triggerThreshold: newThreshold,
      actions: [newAction, 'Notify Merchant Hub'],
      status: 'ACTIVE',
      lastTriggered: 'Never',
      triggerCount: 0,
      successRate: 100.0
    };
    setRules([rule, ...rules]);
    setNewRuleName('');
    setIsCreating(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              WHEN-THIS-THEN-THAT ENGINE
            </span>
            <span className="text-xs font-mono text-slate-400">· Policy-Bounded Rules</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Automation & Policy Trigger Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Configure continuous automated triggers that connect real-time telemetry events to AI analysis and bounded policy executions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button 
            variant="primary" 
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Automation Rule</span>
          </Button>
        </div>
      </div>

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Automations"
          value={rules.filter(r => r.status === 'ACTIVE').length.toString()}
          subtitle="All bounded by Policy Engine"
          icon={<Zap className="w-4 h-4 text-indigo-400" />}
        />
        <MetricCard
          title="Executions Today"
          value="67"
          change={14.2}
          subtitle="Automated evaluations"
          icon={<Cpu className="w-4 h-4 text-cyan-400" />}
        />
        <MetricCard
          title="Policy Gate Pass Rate"
          value="99.4%"
          subtitle="Deterministic validation"
          icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
        />
        <MetricCard
          title="Avg Trigger Latency"
          value="14.8ms"
          subtitle="Real-time event loop"
          icon={<History className="w-4 h-4 text-amber-400" />}
        />
      </div>

      {/* Simulation Result Alert */}
      {testResult && (
        <div className="p-4 rounded-xl glass-card border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{testResult}</span>
          </div>
          <button onClick={() => setTestResult(null)} className="text-emerald-400 hover:text-white font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Create Rule Modal / Expandable Panel */}
      {isCreating && (
        <Card className="border-indigo-500/40 bg-slate-900/90">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-brand-accent" />
                <span>Build New Bounded Automation Rule</span>
              </h3>
              <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white text-xs">
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddRule} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Rule Name</label>
                <input
                  type="text"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  placeholder="e.g. VIP Margin Safeguard"
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">WHEN Metric</label>
                <select 
                  value={newMetric} 
                  onChange={(e) => setNewMetric(e.target.value)}
                  className="w-full"
                >
                  <option value="Conversion Rate">Conversion Rate</option>
                  <option value="Stock Level">Stock Level</option>
                  <option value="Profit Margin">Profit Margin</option>
                  <option value="Price Drift">Price Drift Delta</option>
                  <option value="Cart Abandonment">Cart Abandonment Time</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Condition & Threshold</label>
                <div className="flex space-x-1">
                  <select 
                    value={newCondition} 
                    onChange={(e) => setNewCondition(e.target.value)}
                    className="w-1/2"
                  >
                    <option value="drops more than">drops &gt;</option>
                    <option value="falls below">falls below</option>
                    <option value="exceeds">exceeds</option>
                    <option value="differs by">differs by</option>
                  </select>
                  <input
                    type="text"
                    value={newThreshold}
                    onChange={(e) => setNewThreshold(e.target.value)}
                    placeholder="e.g. 5%"
                    className="w-1/2"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">THEN Bounded Action</label>
                <select 
                  value={newAction} 
                  onChange={(e) => setNewAction(e.target.value)}
                  className="w-full"
                >
                  <option value="Run Price Elasticity Audit">Run Price Elasticity Audit</option>
                  <option value="Trigger Supplier PO Draft">Trigger Supplier PO Draft</option>
                  <option value="Block Transaction via Policy Engine">Block Transaction via Policy</option>
                  <option value="Formulate Bounded 5% Retention Bundle">Formulate Bounded 5% Retention</option>
                  <option value="Alert Merchant On-Call">Alert Merchant On-Call</option>
                </select>
              </div>

              <div className="md:col-span-4 flex justify-end space-x-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save & Activate Rule
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      {/* Rules List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Active Automation Rule Matrix</h2>
          <span className="text-xs text-slate-400 font-mono">
            {rules.length} Rules Enforced · 0 Policy Conflicts
          </span>
        </div>

        <div className="space-y-3">
          {rules.map((rule) => (
            <Card key={rule.id} className="p-5 border-white/10 hover:border-indigo-500/40 transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Trigger Expression */}
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="font-bold text-white text-sm">{rule.name}</h3>
                    <Badge variant="success">● {rule.status}</Badge>
                    <span className="text-[11px] font-mono text-slate-500">
                      Triggered {rule.triggerCount} times · Last {rule.lastTriggered}
                    </span>
                  </div>

                  {/* Visual Rule Flow: WHEN -> THEN */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono pt-1">
                    <span className="px-2 py-1 rounded bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 font-bold">
                      WHEN
                    </span>
                    <span className="text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-white/5">
                      {rule.triggerMetric} {rule.triggerCondition} <strong className="text-amber-400">{rule.triggerThreshold}</strong>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    <span className="px-2 py-1 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-bold">
                      THEN
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {rule.actions.map((act, i) => (
                        <span key={i} className="text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-white/5 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>{act}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Actions & Metrics */}
                <div className="flex items-center space-x-3 self-end lg:self-center">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-slate-400 font-mono">Success Rate</div>
                    <div className="text-sm font-bold text-emerald-400 font-mono">{rule.successRate}%</div>
                  </div>

                  <Button
                    variant="secondary"
                    onClick={() => handleTestRule(rule)}
                    disabled={isSimulating}
                    className="flex items-center space-x-1 text-xs"
                  >
                    <Play className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isSimulating ? 'Simulating...' : 'Test Simulation'}</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Execution Audit Log */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Recent Automation Execution Stream</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Realtime Telemetry Log</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Rule Name</th>
                <th>Trigger Event</th>
                <th>Policy Engine Decision</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {[
                { time: '22:14:08', rule: 'Dynamic Price Elasticity Guardrail', event: 'Conversion fell to 6.2% (-1.2%)', policy: 'ALLOW (Bounded Delta)', status: 'EXECUTED (PO Generated)' },
                { time: '21:58:32', rule: 'Price Drift Tamper Trap', event: 'Client amount ₹4,699 != Server ₹4,999', policy: 'BLOCK (PRICE_DRIFT)', status: 'REJECTED & SEALED' },
                { time: '21:40:19', rule: 'Autonomous Inventory Sentinel', event: 'SKU-001 stock reached 12 units', policy: 'ALLOW (Safety Order)', status: 'EXECUTED (Draft Sent)' },
                { time: '21:12:05', rule: 'High-Intent Cart Recovery Booster', event: 'Cart idle > 10 min for Segment A', policy: 'ALLOW (Max 5% Cap)', status: 'EXECUTED (Copilot Notified)' }
              ].map((row, idx) => (
                <tr key={idx}>
                  <td className="text-slate-400">{row.time}</td>
                  <td className="text-white font-sans font-semibold">{row.rule}</td>
                  <td className="text-slate-300">{row.event}</td>
                  <td>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      row.policy.startsWith('ALLOW') 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {row.policy}
                    </span>
                  </td>
                  <td className="text-slate-400">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
