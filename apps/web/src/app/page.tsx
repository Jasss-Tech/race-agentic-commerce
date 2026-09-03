'use client';

import React from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Bot,
  Brain,
  CheckCircle2,
  FileCheck2,
  LineChart,
  Quote,
  Scale,
  Send,
  ShieldCheck,
  Sliders,
  Sparkles,
  Store,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const stats = [
  { value: '+38%', label: 'Conversion lift', desc: 'Copilot-guided discovery, pilot storefront cohort' },
  { value: '6×', label: 'Average order value', desc: 'Bundle intelligence with explainable synergy scores' },
  { value: '100%', label: 'Actions policy-gated', desc: 'Every autonomous intent passes 12 deterministic rules' },
  { value: '0', label: 'Unauthorized executions', desc: 'All-time, sealed on the SHA-256 audit chain' }
];

const stackWordmarks = ['RAZORPAY', 'AP2 PROTOCOL', 'NEXT.JS', 'PRISMA', 'POSTGRESQL', 'SHADCN/UI'];

const engineSteps = [
  {
    step: '01',
    icon: Activity,
    title: 'REAL-TIME DATA',
    desc: 'Continuous buyer, catalog and payment telemetry streamed into one decision plane.',
    gate: 'gate-telemetry'
  },
  {
    step: '02',
    icon: Brain,
    title: 'AI REASONING',
    desc: 'Anomaly detection and elasticity analysis turn raw signals into hypotheses.',
    gate: 'gate-telemetry'
  },
  {
    step: '03',
    icon: LineChart,
    title: 'PREDICTION',
    desc: '30-day autoregressive demand forecasts with confidence intervals.',
    gate: 'gate-brand'
  },
  {
    step: '04',
    icon: Sliders,
    title: 'SIMULATION',
    desc: 'What-if price, bundle and margin modeling — before anything goes live.',
    gate: 'gate-review'
  },
  {
    step: '05',
    icon: Sparkles,
    title: 'RECOMMENDATION',
    desc: 'Multi-SKU synergy and bundle proposals, each with factor-level explanations.',
    gate: 'gate-review'
  },
  {
    step: '06',
    icon: ShieldCheck,
    title: 'BOUNDED ACTION',
    desc: 'Agents execute only what deterministic policy gates and mandates allow.',
    gate: 'gate-halted'
  },
  {
    step: '07',
    icon: FileCheck2,
    title: 'AUDIT PROOF',
    desc: 'Every decision sealed with SHA-256 — replayable, tamper-evident, yours.',
    gate: 'gate-sealed'
  }
];

const pillars = [
  {
    href: '/merchant',
    icon: Store,
    label: 'MERCHANT HUB',
    title: 'Merchant AI Command Center',
    desc: 'Live Business Health Score (0–100), automated situation summaries — why it happened, what to do next — prioritized revenue opportunities, and a live activity stream.',
    cta: 'Open Command Center'
  },
  {
    href: '/merchant/simulation',
    icon: Sliders,
    label: 'WHAT-IF LAB',
    title: 'What-If Simulation Lab',
    desc: 'Interactive price-elasticity and bundle-incentive simulator with explainable factor importance weights and comparative scenario matrices.',
    cta: 'Launch Simulator'
  },
  {
    href: '/buyer',
    icon: Bot,
    label: 'CUSTOMER STORE',
    title: 'Customer Store & Copilot',
    desc: 'Personalized discovery with match scores and transparent why-recommended explanations, plus a natural-language shopping assistant.',
    cta: 'Experience the Store'
  }
];

const voices = [
  {
    quote:
      'The copilot didn\u2019t just recommend — it showed the policy check before checkout. That is the first assistant I would let near a corporate card.',
    name: 'Head of Commerce Ops',
    role: 'Merchant pilot'
  },
  {
    quote:
      'Every agent intent hits a mandate gate in real time. Nothing executes without authorization — and every decision leaves a proof I can replay.',
    name: 'Platform Auditor',
    role: 'Risk & compliance'
  },
  {
    quote:
      'Match scores with why-recommended explanations lifted our attach rate overnight. Buyers trust it because they can see the reasoning.',
    name: 'Growth Lead',
    role: 'Consumer storefront'
  }
];

const resourceCards = [
  {
    href: '/demo',
    icon: Zap,
    tag: 'ONE CLICK EACH',
    title: '5 Guided Demo Scenarios',
    desc: 'Happy-path agentic checkout, deterministic price-drift gating, gateway failure handling, growth campaign approval, and SHA-256 tamper detection.'
  },
  {
    href: '/proofs',
    icon: FileCheck2,
    tag: 'VERIFIABLE',
    title: 'Proof Ledger',
    desc: 'Browse the SHA-256 hash chain. Every bounded action the platform ever took, sealed and independently verifiable.'
  },
  {
    href: '/trust',
    icon: Scale,
    tag: 'THE THESIS',
    title: 'Trust Center',
    desc: 'User mandates, the 12 deterministic policy rules, and explainable risk scoring — how capability is separated from authority.'
  },
  {
    href: '/audit',
    icon: Activity,
    tag: 'REPLAYABLE',
    title: 'Audit Log',
    desc: 'The full decision trail — every gate evaluation, risk factor, and agent action on one explainable timeline.'
  }
];

const merchantBullets = [
  'Live Business Health Score (0–100) with automated why-it-happened summaries',
  'What-If Lab: simulate price and bundle moves before you commit',
  'Deterministic policy gates — 12 rules, zero surprises'
];

const buyerBullets = [
  'Match scores with transparent why-recommended reasoning',
  'Natural-language copilot for discovery through checkout',
  'Every order carries its own cryptographic proof'
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  return (
    <div className="pb-0">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        {/* dotted grid backdrop */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_0%,#000_55%,transparent_100%)]"
          style={{
            backgroundImage: 'radial-gradient(hsl(var(--primary) / 0.14) 1px, transparent 1px)',
            backgroundSize: '26px 26px'
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-[10%] h-72 w-72 rounded-full bg-primary/10 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pt-14 pb-16 sm:px-6 sm:pt-20 lg:grid-cols-2 lg:gap-10 lg:px-8 lg:pt-24 lg:pb-24">
          {/* Left: copy */}
          <div className="animate-fadeIn max-w-xl">
            <Badge variant="brand" className="h-auto px-3.5 py-1.5 text-[11px]">
              <Sparkles className="h-3.5 w-3.5" />
              Agentic commerce control plane · B2C &amp; B2B
            </Badge>

            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Your AI-native commerce revenue engine —{' '}
              <span className="text-primary">without losing control.</span>
            </h1>

            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              RACE unifies real-time decision intelligence, what-if simulation and autonomous
              buyer agents on one engine — every action bounded by deterministic financial
              policy gates and sealed with cryptographic proofs. Higher conversion, larger
              baskets, zero unauthorized executions.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="h-12 px-7">
                <Link href="/merchant">
                  Launch Merchant Hub
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-7">
                <a href="#engine">See the platform</a>
              </Button>
            </div>

            <div className="gate-rail gate-brand mt-10 rounded-lg border border-border bg-card p-4">
              <div className="flex items-start gap-3 pl-3">
                <Scale className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm leading-snug text-muted-foreground">
                  <strong className="font-semibold text-foreground">Core principle: capability ≠ authority.</strong>{' '}
                  Agents formulate intent; deterministic policy engines decide what executes — and
                  every decision lands on an audit chain.
                </p>
              </div>
            </div>
          </div>

          {/* Right: interactive-feel product mock */}
          <div className="relative mx-auto w-full max-w-md animate-fadeIn lg:max-w-none">
            <div
              aria-hidden
              className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/15 via-transparent to-signal-telemetry/10 blur-xl"
            />

            {/* Copilot chat mock */}
            <div className="glass-panel-elevated relative rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-display text-sm font-bold text-foreground">RACE Copilot</div>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Buyer agent · mandate M-2481
                    </div>
                  </div>
                </div>
                <Badge variant="cyan" dot>LIVE</Badge>
              </div>

              <div className="space-y-3 pt-3">
                {/* user message */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-lg rounded-br-sm bg-primary px-3 py-2 text-[13px] leading-snug text-primary-foreground">
                    Find a rain-ready ultrabook for my weekend trip — inside my ₹1,30,000 mandate.
                  </div>
                </div>

                {/* agent message + product card */}
                <div className="max-w-[92%] rounded-lg rounded-bl-sm bg-muted px-3 py-2.5">
                  <p className="text-[13px] leading-snug text-foreground">
                    Found 3 matches inside your mandate. Top pick:
                  </p>

                  <div className="mt-2 rounded-lg border border-border bg-card p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-display text-sm font-bold text-foreground">Aurora Book 14</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {['16 GB RAM', '1.4 kg', '18 h battery'].map((chip) => (
                            <span
                              key={chip}
                              className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                            >
                              {chip}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Badge variant="success">96% match</Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-foreground">₹1,24,900</span>
                      <Button size="sm" className="h-8 px-3">
                        Add to cart
                      </Button>
                    </div>
                  </div>

                  {/* policy gate strip */}
                  <div className="gate-rail gate-sealed mt-2.5 rounded-lg border border-border bg-card p-3">
                    <div className="space-y-1.5 pl-3">
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-muted-foreground">MANDATE</span>
                        <span className="flex items-center gap-1 font-semibold text-success">
                          <CheckCircle2 className="h-3 w-3" /> Verified
                        </span>
                      </div>
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-muted-foreground">POLICY GATES</span>
                        <span className="flex items-center gap-1 font-semibold text-success">
                          <CheckCircle2 className="h-3 w-3" /> 12/12 passed
                        </span>
                      </div>
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-muted-foreground">RISK SCORE</span>
                        <span className="font-semibold text-signal-telemetry">18/100 · explainable</span>
                      </div>
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-muted-foreground">PROOF</span>
                        <span className="flex items-center gap-1 font-semibold text-success">
                          <FileCheck2 className="h-3 w-3" /> SHA-256 sealed
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* typing indicator */}
                <div className="flex items-center gap-1.5 px-1">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>

                {/* input */}
                <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3 py-2.5">
                  <span className="flex-1 truncate text-[13px] text-muted-foreground">
                    Ask Copilot anything…
                  </span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Send className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* floating merchant proposal card */}
            <div className="absolute -right-3 -top-5 z-10 hidden rotate-2 sm:block lg:-right-6">
              <div className="glass-card gate-rail gate-review w-56 p-3 pl-4 shadow-lg">
                <div className="flex items-start gap-2 pl-2">
                  <Zap className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  <div>
                    <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-warning">
                      Bundle proposal
                    </div>
                    <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                      +₹42K projected revenue — awaiting merchant sign-off
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* floating proof chip */}
            <div className="absolute -bottom-5 -left-3 z-10 hidden -rotate-1 sm:block lg:-left-6">
              <div className="glass-card gate-rail gate-sealed flex items-center gap-2 p-2.5 pl-4 shadow-lg">
                <FileCheck2 className="h-4 w-4 shrink-0 text-success" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-success">
                  Proof #A3F9 sealed
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ STATS STRIP ============ */}
      <section className="border-y border-border bg-card/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
          {stats.map((s) => (
            <div key={s.label} className="px-2 lg:px-6">
              <div className="font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                {s.value}
              </div>
              <div className="mt-1 font-mono text-[11px] font-bold uppercase tracking-wider text-foreground">
                {s.label}
              </div>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ STACK / TRUST BAR ============ */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-center font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Built on the agentic commerce stack
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {stackWordmarks.map((mark) => (
            <span
              key={mark}
              className="font-display text-sm font-bold tracking-wide text-muted-foreground/70 transition-colors hover:text-foreground sm:text-base"
            >
              {mark}
            </span>
          ))}
        </div>
      </section>

      {/* ============ ONE PLATFORM, TWO PLAYBOOKS ============ */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
            One platform
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Two playbooks. One engine.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Merchants get a control plane they can defend. Buyers get an assistant they can
            trust. Same telemetry, same gates, same audit chain.
          </p>
        </div>

        <Tabs defaultValue="merchants" className="mx-auto mt-10 max-w-4xl">
          <TabsList className="mx-auto flex h-11 w-fit p-1">
            <TabsTrigger value="merchants" className="px-5 text-sm">
              For Merchants
            </TabsTrigger>
            <TabsTrigger value="buyers" className="px-5 text-sm">
              For Buyers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="merchants" className="mt-6">
            <Card className="grid gap-8 p-8 md:grid-cols-[1.2fr_1fr] md:p-10">
              <div>
                <h3 className="font-display text-2xl font-bold tracking-tight text-foreground">
                  Merchants who control.
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Autonomous growth with a human-ownable off switch. See every gate evaluation
                  as it happens, simulate before you commit, and approve proposals on your terms.
                </p>
                <ul className="mt-5 space-y-2.5">
                  {merchantBullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-6">
                  <Link href="/merchant">
                    Open Merchant Hub
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="flex flex-col justify-center gap-3">
                <div className="gate-rail gate-telemetry rounded-lg border border-border bg-background p-4 pl-5">
                  <div className="pl-2">
                    <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-signal-telemetry">
                      Telemetry
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Live activity stream across agents, orders and payments
                    </p>
                  </div>
                </div>
                <div className="gate-rail gate-review rounded-lg border border-border bg-background p-4 pl-5">
                  <div className="pl-2">
                    <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-warning">
                      Under review
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Growth proposals wait for explicit merchant sign-off
                    </p>
                  </div>
                </div>
                <div className="gate-rail gate-sealed rounded-lg border border-border bg-background p-4 pl-5">
                  <div className="pl-2">
                    <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-success">
                      Sealed
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Approved actions land on the SHA-256 audit chain
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="buyers" className="mt-6">
            <Card className="grid gap-8 p-8 md:grid-cols-[1.2fr_1fr] md:p-10">
              <div>
                <h3 className="font-display text-2xl font-bold tracking-tight text-foreground">
                  Buyers who trust.
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  An AI shopping assistant that shows its work — every recommendation explained,
                  every purchase backed by a mandate you control, every order provable forever.
                </p>
                <ul className="mt-5 space-y-2.5">
                  {buyerBullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-6">
                  <Link href="/buyer">
                    Experience the Store
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="flex flex-col justify-center gap-3">
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Match score
                    </span>
                    <span className="font-mono text-sm font-bold text-success">96%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[96%] rounded-full bg-success" />
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Why recommended: battery life, weight, and 3 prior purchases
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Mandate ceiling
                    </span>
                    <span className="font-mono text-sm font-bold text-primary">₹1,30,000</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[38%] rounded-full bg-primary" />
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Copilot cannot spend a rupee beyond what you authorized
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* ============ THE RACE ENGINE ============ */}
      <section id="engine" className="scroll-mt-24 border-t border-border bg-card/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
              The RACE engine
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              One engine. Every capability bounded autonomy needs.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Adopt the full loop or start with a single stage — every stage feeds the next,
              and every stage writes to the same audit chain.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {engineSteps.map((s) => (
              <div
                key={s.step}
                className={`gate-rail ${s.gate} rounded-lg border border-border bg-card p-5 pl-6 transition-all hover:-translate-y-0.5 hover:shadow-md`}
              >
                <div className="flex items-center justify-between pl-2">
                  <span className="font-mono text-[10px] font-bold text-muted-foreground">{s.step}</span>
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-3 pl-2">
                  <span className="font-mono text-xs font-bold tracking-wide text-foreground">{s.title}</span>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}

            {/* engine summary card fills the 8th grid cell */}
            <div className="flex flex-col justify-between rounded-lg border border-primary/30 bg-primary/5 p-5">
              <p className="font-display text-lg font-bold leading-snug text-foreground">
                Data → reasoning → simulation → bounded action → proof.
              </p>
              <Button asChild size="sm" className="mt-4 w-fit">
                <Link href="/demo">
                  Watch the loop run
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PLATFORM PILLARS ============ */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
            Start anywhere
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Three surfaces, one control plane.
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {pillars.map((p) => (
            <Card key={p.href} className="flex flex-col justify-between gap-4 p-6">
              <div className="space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
                  <p.icon className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {p.label}
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold text-foreground">{p.title}</h3>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">{p.desc}</p>
              </div>
              <Link
                href={p.href}
                className="inline-flex items-center gap-1 pt-1 text-xs font-semibold text-primary transition-all hover:gap-2 hover:underline"
              >
                <span>{p.cta}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* ============ VOICES ============ */}
      <section className="border-y border-border bg-card/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
              Voices
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Trusted by teams building agentic commerce.
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {voices.map((v) => (
              <Card key={v.name} className="flex flex-col gap-4 p-6">
                <Quote className="h-5 w-5 text-primary/60" />
                <p className="flex-1 text-sm leading-relaxed text-foreground">“{v.quote}”</p>
                <div className="border-t border-border pt-3">
                  <div className="text-sm font-semibold text-foreground">{v.name}</div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {v.role}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============ DEMOS & RESOURCES ============ */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
              See it working
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Not slideware — running code.
            </h2>
          </div>
          <Button asChild variant="outline" className="shrink-0">
            <Link href="/demo">
              Open Demonstration Center
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {resourceCards.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="group flex flex-col rounded-lg border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <r.icon className="h-5 w-5" />
              </div>
              <Badge variant="slate" className="mt-4 w-fit">{r.tag}</Badge>
              <h3 className="mt-2 font-display text-base font-bold text-foreground">{r.title}</h3>
              <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground">{r.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary transition-all group-hover:gap-2">
                Explore
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ CLOSING CTA ============ */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            See the engine that powers bounded agentic commerce.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Run every demo scenario end-to-end in minutes — mandate-gated checkout, live
            policy gates, and the cryptographic proof chain behind them.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="h-12 px-7">
              <Link href="/demo">
                Open 5 Demo Scenarios
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-7">
              <Link href="/proofs">Browse the Proof Ledger</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ============ BOTTOM BANNER ============ */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="invert-headings relative overflow-hidden rounded-2xl bg-foreground px-6 py-12 text-center text-background sm:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(hsl(var(--primary) / 0.9) 1px, transparent 1px)',
              backgroundSize: '22px 22px'
            }}
          />
          <div className="relative">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-background/70">
              5 interactive demos · one click each
            </span>
            <h2 className="mx-auto mt-3 max-w-2xl font-display text-2xl font-bold tracking-tight text-background sm:text-3xl">
              Your agents are ready. Your controls are too.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-background/70">
              Watch bounded autonomy run end-to-end — every autonomous purchase gated,
              explained and sealed in under five minutes.
            </p>
            <Button asChild size="lg" className="mt-7 h-12 bg-primary px-8 text-primary-foreground hover:bg-primary/90">
              <Link href="/demo">
                Start the demo run
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
