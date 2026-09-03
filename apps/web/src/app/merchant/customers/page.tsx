'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Mail, 
  CheckCircle2,
  Sliders,
  DollarSign,
  UserCheck
} from 'lucide-react';
import { Card, MetricCard } from '../../../components/ui/Card';
import { Badge, SeverityBadge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

export default function MerchantCustomersPage() {
  const [activeSegment, setActiveSegment] = useState<string>('ALL');
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  const segments = [
    {
      id: 'vip',
      name: 'VIP Power Buyers',
      count: 482,
      revenue: '₹34.8L',
      aov: '₹7,220',
      churnRisk: 'Low (4%)',
      badge: 'brand',
      aiRec: 'Grant exclusive early access to TechNova Mechanical Keyboard Pro pre-orders.'
    },
    {
      id: 'high_value',
      name: 'High Value Regulars',
      count: 1240,
      revenue: '₹58.2L',
      aov: '₹4,690',
      churnRisk: 'Moderate (12%)',
      badge: 'success',
      aiRec: 'Recommend wireless mouse + desk mat synergy bundle with 5% attach discount.'
    },
    {
      id: 'at_risk',
      name: 'At-Risk Churn Cohort',
      count: 618,
      revenue: '₹14.2L',
      aov: '₹2,300',
      churnRisk: 'High (68%)',
      badge: 'warning',
      aiRec: 'Dispatch automated 7% personalized reactivation voucher bounded by policy cap.'
    },
    {
      id: 'new',
      name: 'New First-Time Buyers',
      count: 890,
      revenue: '₹19.5L',
      aov: '₹2,190',
      churnRisk: 'Uncalibrated (25%)',
      badge: 'cyan',
      aiRec: 'Trigger post-purchase onboarding sequence and accessory discovery assistant.'
    }
  ];

  const customersList = [
    { id: 'CUST-1082', name: 'Aarav Sharma', segment: 'VIP Power Buyers', totalSpent: '₹18,490', orders: 6, lastActive: '12 mins ago', status: 'ACTIVE' },
    { id: 'CUST-1083', name: 'Priya Patel', segment: 'High Value Regulars', totalSpent: '₹12,890', orders: 4, lastActive: '2 hours ago', status: 'ACTIVE' },
    { id: 'CUST-1084', name: 'Rohan Verma', segment: 'At-Risk Churn Cohort', totalSpent: '₹4,398', orders: 2, lastActive: '18 days ago', status: 'DORMANT' },
    { id: 'CUST-1085', name: 'Ananya Iyer', segment: 'New First-Time Buyers', totalSpent: '₹2,199', orders: 1, lastActive: 'Yesterday', status: 'ACTIVE' },
    { id: 'CUST-1086', name: 'Karan Malhotra', segment: 'VIP Power Buyers', totalSpent: '₹24,190', orders: 8, lastActive: '3 hours ago', status: 'ACTIVE' }
  ];

  const handleTriggerRetention = (segName: string) => {
    setActionAlert(`✓ [POLICY APPROVED] Formulated bounded retention incentive for "${segName}". Policy Engine verified max 10% discount cap.`);
    setTimeout(() => setActionAlert(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              RFM SEGMENTATION ENGINE
            </span>
            <span className="text-xs font-mono text-slate-400">· Real-Time Cohort Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Customer Intelligence & Lifetime Value Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Recency, Frequency, and Monetary (RFM) clustering with predictive churn prevention and automated campaigns.
          </p>
        </div>

        <Link href="/merchant/simulation">
          <Button variant="primary" className="flex items-center space-x-1.5 text-xs">
            <Sliders className="w-4 h-4" />
            <span>Simulate Customer Retention</span>
          </Button>
        </Link>
      </div>

      {actionAlert && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{actionAlert}</span>
        </div>
      )}

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Active Customers"
          value="3,230"
          change={8.4}
          subtitle="Past 30 days active"
          icon={<Users className="w-4 h-4 text-indigo-400" />}
        />
        <MetricCard
          title="Average Order Value"
          value="₹4,120"
          change={12.1}
          subtitle="Across all cohorts"
          icon={<DollarSign className="w-4 h-4 text-emerald-400" />}
        />
        <MetricCard
          title="Projected Churn at Risk"
          value="₹14.2L"
          subtitle="618 customers dormant"
          icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
        />
        <MetricCard
          title="VIP Retention Rate"
          value="96.2%"
          change={2.1}
          subtitle="Repeat purchase loyalty"
          icon={<UserCheck className="w-4 h-4 text-cyan-400" />}
        />
      </div>

      {/* Segment Cards Matrix */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">RFM Behavioral Cohorts</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {segments.map((seg) => (
            <Card key={seg.id} className="p-6 space-y-4 border-white/10 hover:border-indigo-500/40 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    COHORT
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">{seg.name}</h3>
                </div>
                <div className="text-right font-mono">
                  <div className="text-base font-extrabold text-emerald-400">{seg.revenue}</div>
                  <span className="text-[10px] text-slate-500">{seg.count} buyers</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-surface/60 p-3 rounded-xl border border-white/5">
                <div>
                  <span className="text-slate-500 text-[10px]">Avg Order Value:</span>
                  <div className="text-white font-bold">{seg.aov}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Churn Probability:</span>
                  <div className={seg.churnRisk.startsWith('High') ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {seg.churnRisk}
                  </div>
                </div>
              </div>

              {/* AI Recommendation */}
              <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-1.5">
                <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Cohort Recommendation</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-snug">{seg.aiRec}</p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <Button
                  variant="primary"
                  onClick={() => handleTriggerRetention(seg.name)}
                  className="text-xs"
                >
                  Deploy Campaign
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Customer Directory Table */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Recent Customer Telemetry Directory</h2>
          <span className="text-xs font-mono text-slate-400">Live Active Profiles</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Name</th>
                <th>Segment</th>
                <th>Total Spent</th>
                <th>Orders</th>
                <th>Last Active</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {customersList.map((c) => (
                <tr key={c.id}>
                  <td className="text-indigo-400 font-bold">{c.id}</td>
                  <td className="text-white font-sans font-semibold">{c.name}</td>
                  <td className="text-slate-300">{c.segment}</td>
                  <td className="text-emerald-400 font-bold">{c.totalSpent}</td>
                  <td className="text-slate-400">{c.orders}</td>
                  <td className="text-slate-400">{c.lastActive}</td>
                  <td>
                    <Badge variant={c.status === 'ACTIVE' ? 'success' : 'warning'}>
                      ● {c.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
