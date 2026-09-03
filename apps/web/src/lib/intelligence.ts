'use client';

import {
  BusinessHealthScore,
  AISituationSummary,
  AIInsightItem,
  AnomalyEvent,
  WhatIfSimulationInput,
  WhatIfSimulationResult,
  CustomerSegmentProfile,
  ProductIntelligenceItem,
  AIAgentModuleStatus,
  AutomationRule
} from '@race/types';

export function getBusinessHealthScore(): BusinessHealthScore {
  return {
    overall: 89,
    status: 'HEALTHY',
    metrics: {
      revenue: { score: 92, value: 842000, changePct: 12.4, trend: 'up' },
      orders: { score: 88, value: 342, changePct: 8.6, trend: 'up' },
      conversion: { score: 81, value: 4.8, changePct: -1.2, trend: 'down' },
      aov: { score: 94, value: 2462, changePct: 15.1, trend: 'up' },
      retention: { score: 86, value: 68.4, changePct: 4.2, trend: 'up' },
      profitability: { score: 90, value: 34.2, changePct: 3.8, trend: 'up' },
      policyIntegrity: { score: 100, value: 100, changePct: 0.0, trend: 'flat' },
      agentAutonomy: { score: 95, value: 92.4, changePct: 18.0, trend: 'up' }
    },
    topPriorities: [
      {
        id: 'prio_1',
        title: 'Optimize Mobile Checkout Latency',
        impact: 'HIGH',
        urgency: 'IMMEDIATE',
        description: 'Mobile conversion dropped 8.2% in last 24h on TechNova Keyboard Pro.',
        recommendedAction: 'Apply 1-click Express Delegated Mandate Checkout',
        expectedOutcome: '+₹74,000 projected monthly recovery'
      },
      {
        id: 'prio_2',
        title: 'Launch Creator Workspace Bundle Incentive',
        impact: 'HIGH',
        urgency: 'IMMEDIATE',
        description: 'Keyboard + Wrist Rest organic co-occurrence attach rate is 8.2% (Target: 14.5%).',
        recommendedAction: 'Approve 15% accessory incentive in Growth Hub',
        expectedOutcome: '+₹18,450 projected monthly revenue lift'
      },
      {
        id: 'prio_3',
        title: 'Replenish Keyboard Pro Inventory',
        impact: 'MEDIUM',
        urgency: 'PLANNED',
        description: 'Stock is at 19 units with 30-day forecast predicting 38 units demand.',
        recommendedAction: 'Trigger Automated Reorder to Supplier',
        expectedOutcome: 'Zero stock-out during upcoming weekend surge'
      }
    ]
  };
}

export function getSituationSummary(): AISituationSummary {
  return {
    headline: 'AI Executive Brief: High AOV Velocity with Mobile Conversion Anomaly',
    narrative:
      'Overall net revenue increased +12.4% today driven by high attach-rate bundles, but mobile conversion has decreased by 8.2% primarily on the mechanical keyboard category during authorization handshakes.',
    whyThisHappened: [
      'Multi-SKU agent baskets increased Average Order Value from ₹2,199 to ₹2,462 (+15.1%).',
      'Mobile checkout abandonments rose 2.8 standard deviations due to extra mandate confirmation friction.',
      'TechNova Precision Wireless Mouse organic search velocity surged +34% after review aggregator indexing.'
    ],
    whatWillHappenNext: [
      'Projected 30-day revenue will reach ₹10.1L (±4.5%) if bundle attachment rate maintains above 12%.',
      'Mobile checkout drop-offs will cause estimated ₹74,000 revenue drag if left unmitigated.',
      'Keyboard Pro inventory will reach critical threshold in 14 days at current conversion velocity.'
    ],
    whatShouldYouDo: [
      {
        id: 'act_1',
        actionTitle: 'Investigate Mobile Conversion Friction',
        type: 'INVESTIGATE',
        impactText: 'Recover up to 11.4% lost mobile checkout sessions',
        confidence: 0.94
      },
      {
        id: 'act_2',
        actionTitle: 'Simulate +5% Price Elasticity vs Bundling',
        type: 'SIMULATE',
        impactText: 'Test profitability balance in What-If Simulation Lab',
        confidence: 0.91
      },
      {
        id: 'act_3',
        actionTitle: 'Activate Creator Bundle 15% Incentive',
        type: 'APPLY_CAMPAIGN',
        impactText: '+₹18,450 projected monthly revenue lift',
        confidence: 0.88
      }
    ],
    generatedAt: new Date().toLocaleTimeString()
  };
}

export function getAIInsights(): AIInsightItem[] {
  return [
    {
      id: 'ins_1',
      title: 'High-Converting Bundle Synergy Detected',
      category: 'GROWTH',
      severity: 'OPPORTUNITY',
      explanation:
        'Customers purchasing Mechanical Keyboard are 4.2x more likely to accept Memory Foam Wrist Rest when offered at 15% delegated discount during agent checkout.',
      confidence: 0.92,
      impactEstimated: '+₹18,450 / month',
      recommendedAction: 'Activate Growth Campaign with automated agent incentive delegation.',
      status: 'PENDING',
      createdAt: '12m ago'
    },
    {
      id: 'ins_2',
      title: 'Mobile Conversion Drop-off Alert',
      category: 'CONVERSION',
      severity: 'WARNING',
      explanation:
        'Conversion on mobile screens is 2.8 standard deviations below the 30-day rolling baseline.',
      confidence: 0.89,
      impactEstimated: '-₹74,000 risk',
      recommendedAction: 'Enable Express Agent Mandate with biometric passkey authentication.',
      status: 'INVESTIGATED',
      createdAt: '28m ago'
    },
    {
      id: 'ins_3',
      title: 'Optimal Price Elasticity Window for USB-C Hub',
      category: 'PRICING',
      severity: 'OPPORTUNITY',
      explanation:
        'Competitor stockouts in accessories category provide a 72-hour window where +6% price increase yields minimal demand elasticity drop (-1.1%).',
      confidence: 0.85,
      impactEstimated: '+₹12,200 margin',
      recommendedAction: 'Adjust price from ₹1,299 to ₹1,379 in Product Intelligence.',
      status: 'SIMULATED',
      createdAt: '1h ago'
    },
    {
      id: 'ins_4',
      title: 'Inventory Exhaustion Forecast on Keyboard Pro',
      category: 'INVENTORY',
      severity: 'CRITICAL',
      explanation:
        'Remaining 19 units will deplete in 14.2 days based on 30-day autoregressive demand forecast.',
      confidence: 0.96,
      impactEstimated: 'Prevents 18 lost sales',
      recommendedAction: 'Dispatch automated supplier restock purchase order (MOQ: 50 units).',
      status: 'PENDING',
      createdAt: '2h ago'
    }
  ];
}

export function getAnomalies(): AnomalyEvent[] {
  return [
    {
      id: 'anom_1',
      metricName: 'Mobile Authorization Conversion',
      detectedAt: '20:41:12',
      severity: 'HIGH',
      deviationStdDev: 2.8,
      affectedEntities: '4,218 mobile user sessions',
      estimatedFinancialImpact: '₹74,000 projected drag',
      rootCauseAnalysis:
        'Mandate budget cap confirmation screen takes >3.8s to render on mobile WebKit browsers.',
      recommendedMitigation:
        'Streamline 1-tap confirmation with pre-signed cryptographic mandate token.',
      status: 'ACTIVE'
    },
    {
      id: 'anom_2',
      metricName: 'Sudden Nighttime Demand Velocity Spike',
      detectedAt: '19:15:04',
      severity: 'LOW',
      deviationStdDev: 2.1,
      affectedEntities: 'TechNova Precision Wireless Mouse',
      estimatedFinancialImpact: '+₹14,300 surge revenue',
      rootCauseAnalysis:
        'Featured in tech influencer ergonomics roundup with machine-readable ACP link.',
      recommendedMitigation: 'Allocate temporary reserve inventory pool for agent purchases.',
      status: 'RESOLVING'
    }
  ];
}

export function runWhatIfSimulation(input: WhatIfSimulationInput): WhatIfSimulationResult {
  const { priceDeltaPercent, discountPercent, targetSegment, bundleAccessoryDiscount } = input;

  // Realistic microeconomic modeling
  // Price elasticity of demand e = -1.35
  const elasticity = -1.35;
  const demandChangePct = (priceDeltaPercent * elasticity) + (discountPercent * 0.8) + (bundleAccessoryDiscount * 0.4);
  
  const baseConversion = 4.8;
  const conversionMultiplier = 1 + (demandChangePct / 100);
  const predictedConversionRate = Number(Math.max(0.5, Math.min(15.0, baseConversion * conversionMultiplier)).toFixed(2));
  const conversionDeltaPct = Number(((predictedConversionRate - baseConversion) / baseConversion * 100).toFixed(1));

  const baseMonthlyRevenue = 842000;
  const effectivePriceMultiplier = 1 + (priceDeltaPercent / 100) - (discountPercent * 0.4 / 100);
  const predictedRevenue = Math.round(baseMonthlyRevenue * effectivePriceMultiplier * (1 + demandChangePct / 100));
  const revenueDeltaPct = Number(((predictedRevenue - baseMonthlyRevenue) / baseMonthlyRevenue * 100).toFixed(1));

  const baseMonthlyProfit = 288000;
  const marginExpansion = (priceDeltaPercent * 0.7) - (discountPercent * 0.5);
  const predictedProfit = Math.round(baseMonthlyProfit * (1 + (revenueDeltaPct + marginExpansion) / 100));
  const profitDeltaPct = Number(((predictedProfit - baseMonthlyProfit) / baseMonthlyProfit * 100).toFixed(1));

  let aiRecommendation = '';
  if (profitDeltaPct > 5 && revenueDeltaPct > 0) {
    aiRecommendation = `Strategy demonstrates strong margin expansion (+${profitDeltaPct}%) with positive revenue trajectory. Recommended for deployment.`;
  } else if (revenueDeltaPct < -5) {
    aiRecommendation = `Price sensitivity exceeds elasticity threshold. Revenue contraction (-${Math.abs(revenueDeltaPct)}%) outweighs margin gains.`;
  } else {
    aiRecommendation = `Balanced scenario with steady cash flow. Combine with targeted segment discount for maximum conversion lift.`;
  }

  return {
    scenarioName: `Scenario: Price ${priceDeltaPercent >= 0 ? '+' : ''}${priceDeltaPercent}% | Segment: ${targetSegment}`,
    predictedConversionRate,
    conversionDeltaPct,
    predictedRevenue,
    revenueDeltaPct,
    predictedProfit,
    profitDeltaPct,
    customerDemandIndex: Math.round(100 + demandChangePct),
    aiRecommendation,
    confidenceScore: 0.91,
    factorImportance: [
      { factor: 'Price Elasticity of Demand', weightPercent: 42, direction: (priceDeltaPercent > 0 ? 'negative' : 'positive') as 'positive' | 'negative', description: 'Sensitivity to base unit cost' },
      { factor: 'Customer Segment Affinity', weightPercent: 28, direction: 'positive' as const, description: 'Intent match on target cohort' },
      { factor: 'Accessory Bundle Synergy', weightPercent: 18, direction: 'positive' as const, description: 'Multi-SKU attachment lift' },
      { factor: 'Inventory Availability Buffer', weightPercent: 12, direction: 'positive' as const, description: 'Stock readiness for demand surge' }
    ],
    scenariosComparison: [
      { strategyName: 'Conservative Baseline (Current)', priceDelta: 0, expectedRevenue: 842000, expectedMargin: 288000, isOptimal: false },
      { strategyName: 'Moderate Growth (+5% Price, 10% Bundle)', priceDelta: 5, expectedRevenue: 894000, expectedMargin: 312000, isOptimal: true },
      { strategyName: 'Aggressive Volume (-5% Price, 15% Discount)', priceDelta: -5, expectedRevenue: 865000, expectedMargin: 270000, isOptimal: false }
    ]
  };
}

export function getCustomerSegments(): CustomerSegmentProfile[] {
  return [
    {
      id: 'seg_1',
      name: 'High-Value Enthusiasts',
      slug: 'high-value',
      badgeColor: 'emerald',
      customerCount: 148,
      totalRevenue: 384000,
      avgOrderValue: 3420,
      conversionRate: 8.9,
      growthRate: 18.4,
      churnRiskScore: 12,
      purchaseIntentScore: 94,
      characteristics: ['Mechanical keyboard customizers', 'Orders ≥ 2 items', 'Zero returns'],
      aiActionProposal: 'Offer early access to TechNova Pro CNC Aluminum drop with VIP reservation mandate.'
    },
    {
      id: 'seg_2',
      name: 'High-Intent Returning Buyers',
      slug: 'returning-intent',
      badgeColor: 'indigo',
      customerCount: 312,
      totalRevenue: 282000,
      avgOrderValue: 2199,
      conversionRate: 6.4,
      growthRate: 12.0,
      churnRiskScore: 24,
      purchaseIntentScore: 88,
      characteristics: ['Viewed products ≥ 3 times in 7d', 'Frequently requests comparisons', 'Cart additions active'],
      aiActionProposal: 'Deploy 15% accessory incentive during autonomous agent checkout.'
    },
    {
      id: 'seg_3',
      name: 'At-Risk / Dormant (45+ Days)',
      slug: 'at-risk',
      badgeColor: 'amber',
      customerCount: 86,
      totalRevenue: 98000,
      avgOrderValue: 1890,
      conversionRate: 2.1,
      growthRate: -6.5,
      churnRiskScore: 78,
      purchaseIntentScore: 32,
      characteristics: ['Inactive > 45 days', 'Past buyers of entry accessories', 'Price sensitive'],
      aiActionProposal: 'Dispatch tailored win-back recommendation with personalized discount token.'
    },
    {
      id: 'seg_4',
      name: 'New First-Time Discoverers',
      slug: 'new-discoverers',
      badgeColor: 'cyan',
      customerCount: 220,
      totalRevenue: 178000,
      avgOrderValue: 1299,
      conversionRate: 3.8,
      growthRate: 24.2,
      churnRiskScore: 38,
      purchaseIntentScore: 65,
      characteristics: ['First interaction via ACP search', 'Browsing single category', 'Exploring warranty info'],
      aiActionProposal: 'Present beginner-friendly starter bundle with guided Buyer Agent assistant.'
    }
  ];
}

export function getProductIntelligenceList(): ProductIntelligenceItem[] {
  return [
    {
      id: 'prod_intel_1',
      productId: 'prod_keyboard_01',
      productName: 'TechNova Mechanical Keyboard',
      category: 'keyboard',
      price: 2199,
      aiScore: 92,
      demandScore: 94,
      conversionScore: 86,
      profitabilityScore: 88,
      customerFitScore: 96,
      trendVelocity: 14.2,
      riskLevel: 'LOW',
      demandForecast30d: [
        { day: 'Day 1-7', predictedUnits: 28, lowerBound: 24, upperBound: 32 },
        { day: 'Day 8-14', predictedUnits: 34, lowerBound: 29, upperBound: 39 },
        { day: 'Day 15-21', predictedUnits: 38, lowerBound: 32, upperBound: 44 },
        { day: 'Day 22-30', predictedUnits: 46, lowerBound: 38, upperBound: 54 }
      ],
      historicalWeeklySales: [
        { week: 'W1', units: 18, revenue: 39582 },
        { week: 'W2', units: 22, revenue: 48378 },
        { week: 'W3', units: 26, revenue: 57174 },
        { week: 'W4', units: 31, revenue: 68169 }
      ],
      aiInsights: [
        'Strongest demand growth is observed in returning customers aged 21-35 (+28%).',
        'Top search terms leading to conversion: "wireless 75% hot swap keyboard under 2500".',
        'Wrist Rest co-occurrence attach rate reaches 14.5% when bundled at checkout.'
      ],
      recommendedActions: [
        { action: 'Increase catalog exposure for returning segment', impact: '+₹24,000 / mo', confidence: 0.94 },
        { action: 'Maintain active bundle campaign with Memory Foam Wrist Rest', impact: '+₹18,450 / mo', confidence: 0.88 }
      ]
    },
    {
      id: 'prod_intel_2',
      productId: 'prod_keyboard_pro_05',
      productName: 'TechNova Mechanical Keyboard Pro',
      category: 'keyboard',
      price: 3299,
      aiScore: 88,
      demandScore: 89,
      conversionScore: 82,
      profitabilityScore: 94,
      customerFitScore: 91,
      trendVelocity: 21.0,
      riskLevel: 'MEDIUM',
      demandForecast30d: [
        { day: 'Day 1-7', predictedUnits: 8, lowerBound: 6, upperBound: 10 },
        { day: 'Day 8-14', predictedUnits: 11, lowerBound: 9, upperBound: 13 },
        { day: 'Day 15-21', predictedUnits: 14, lowerBound: 11, upperBound: 17 },
        { day: 'Day 22-30', predictedUnits: 18, lowerBound: 14, upperBound: 22 }
      ],
      historicalWeeklySales: [
        { week: 'W1', units: 4, revenue: 13196 },
        { week: 'W2', units: 7, revenue: 23093 },
        { week: 'W3', units: 9, revenue: 29691 },
        { week: 'W4', units: 12, revenue: 39588 }
      ],
      aiInsights: [
        'Highest margin contributor (58% gross margin).',
        'Current inventory (19 units) is projected to deplete within 14 days without reordering.',
        'High upsell conversion when buyer mandate budget exceeds ₹3,000.'
      ],
      recommendedActions: [
        { action: 'Trigger inventory replenishment (MOQ: 50 units)', impact: 'Prevents 18 lost orders', confidence: 0.96 },
        { action: 'Activate automated upsell recommendation for high-budget buyers', impact: '+₹14,500 / mo', confidence: 0.84 }
      ]
    },
    {
      id: 'prod_intel_3',
      productId: 'prod_hub_03',
      productName: 'TechNova 7-in-1 USB-C Hub',
      category: 'accessories',
      price: 1299,
      aiScore: 85,
      demandScore: 81,
      conversionScore: 88,
      profitabilityScore: 84,
      customerFitScore: 89,
      trendVelocity: 9.5,
      riskLevel: 'LOW',
      demandForecast30d: [
        { day: 'Day 1-7', predictedUnits: 14, lowerBound: 11, upperBound: 17 },
        { day: 'Day 8-14', predictedUnits: 16, lowerBound: 13, upperBound: 19 },
        { day: 'Day 15-21', predictedUnits: 19, lowerBound: 15, upperBound: 23 },
        { day: 'Day 22-30', predictedUnits: 24, lowerBound: 19, upperBound: 29 }
      ],
      historicalWeeklySales: [
        { week: 'W1', units: 10, revenue: 12990 },
        { week: 'W2', units: 12, revenue: 15588 },
        { week: 'W3', units: 15, revenue: 19485 },
        { week: 'W4', units: 18, revenue: 23382 }
      ],
      aiInsights: [
        'Optimal attach rate product for workspace bundles.',
        'Low price sensitivity allows +5-7% price testing with negligible conversion impact.'
      ],
      recommendedActions: [
        { action: 'Test +₹80 price increase in What-If Simulator', impact: '+₹12,200 margin', confidence: 0.85 }
      ]
    }
  ];
}

export function getAIAgentsStatus(): AIAgentModuleStatus[] {
  return [
    {
      id: 'agent_analytics',
      name: 'Analytics Sentinel Agent',
      role: 'Continuous metric & anomaly detection across transactions and traffic',
      status: 'MONITORING',
      efficiencyScore: 98,
      lastActive: 'Just now',
      recentAction: 'Scanned 1,420 sessions; detected mobile conversion drift anomaly',
      pendingTasksCount: 1
    },
    {
      id: 'agent_growth',
      name: 'Growth & Bundle Agent',
      role: 'Multi-item basket co-occurrence clustering and campaign proposals',
      status: 'AWAITING_APPROVAL',
      efficiencyScore: 94,
      lastActive: '2m ago',
      recentAction: 'Formulated Creator Workspace Bundle 15% discount incentive',
      pendingTasksCount: 2
    },
    {
      id: 'agent_risk',
      name: 'Risk & Policy Gate Agent',
      role: 'Deterministic 12-rule gatekeeper and multi-signal risk evaluator',
      status: 'MONITORING',
      efficiencyScore: 100,
      lastActive: '1m ago',
      recentAction: 'Evaluated order #ord_seed_002: Zero price-drift, Risk score: 8/100 (ALLOW)',
      pendingTasksCount: 0
    },
    {
      id: 'agent_inventory',
      name: 'Inventory Forecast Sentinel',
      role: 'Autoregressive stock depletion modeling and safety stock alerts',
      status: 'ANALYZING',
      efficiencyScore: 92,
      lastActive: '5m ago',
      recentAction: 'Updated 30-day demand forecast for TechNova Keyboard Pro',
      pendingTasksCount: 1
    },
    {
      id: 'agent_buyer',
      name: 'Conversational Buyer Copilot',
      role: 'Natural language intent parsing, spec comparison, and bounded checkout',
      status: 'MONITORING',
      efficiencyScore: 96,
      lastActive: 'Just now',
      recentAction: 'Processed natural language query: "keyboard under ₹2500"',
      pendingTasksCount: 0
    }
  ];
}

export function getAutomationRules(): AutomationRule[] {
  return [
    {
      id: 'auto_1',
      name: 'Conversion Anomaly Auto-Investigation',
      triggerEvent: 'Conversion drops > 5% within 4-hour window',
      conditionDescription: 'Standard deviation ≥ 2.5 on mobile checkout path',
      aiDecisionLogic: 'Execute session friction analysis & suggest pre-signed mandate tokens',
      automatedAction: 'Generate high-severity AI insight and alert merchant dashboard',
      status: 'ACTIVE',
      executionCount: 14,
      lastTriggeredAt: '28m ago'
    },
    {
      id: 'auto_2',
      name: 'Dynamic Basket Synergy Proposal',
      triggerEvent: 'Co-occurrence between 2 SKUs exceeds 8.0%',
      conditionDescription: 'Both SKUs have stock > 15 units and gross margin > 30%',
      aiDecisionLogic: 'Calculate optimal bundle discount (10-15%) for maximum profit lift',
      automatedAction: 'Submit Growth Recommendation for merchant 1-click approval',
      status: 'ACTIVE',
      executionCount: 28,
      lastTriggeredAt: '2h ago'
    },
    {
      id: 'auto_3',
      name: 'Safety Stock Replenishment Warning',
      triggerEvent: '30-day forecast demand exceeds remaining inventory',
      conditionDescription: 'Days of inventory cover ≤ 15 days',
      aiDecisionLogic: 'Formulate restock purchase order with recommended reorder quantity',
      automatedAction: 'Flag inventory tile & prepare restock requisition',
      status: 'ACTIVE',
      executionCount: 6,
      lastTriggeredAt: '1d ago'
    },
    {
      id: 'auto_4',
      name: 'Deterministic Price Drift Guard',
      triggerEvent: 'Live merchant price exceeds buyer quote price',
      conditionDescription: 'Delta > ₹0.00 INR during authorization stage',
      aiDecisionLogic: 'Deterministic Policy Rule 007 enforcement: Zero-Tolerance Policy',
      automatedAction: 'Instantly block execution, record audit event, notify buyer agent',
      status: 'ACTIVE',
      executionCount: 3,
      lastTriggeredAt: 'Yesterday'
    }
  ];
}
