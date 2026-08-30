import { PrismaClient } from '@prisma/client';
import { ProofEngine } from '@race/proof-engine';

const prisma = new PrismaClient();

function computeAuditHash(payload: {
  eventType: string;
  actorType: string;
  actorId: string;
  resourceType: string;
  resourceId: string;
  decision?: string | null;
  reasonCodes?: string[];
  metadata?: Record<string, unknown>;
  previousHash: string;
}): string {
  return ProofEngine.computeEventHash({
    eventType: payload.eventType,
    actorType: payload.actorType,
    actorId: payload.actorId,
    resourceType: payload.resourceType,
    resourceId: payload.resourceId,
    decision: payload.decision ?? null,
    reasonCodes: payload.reasonCodes ?? [],
    metadata: payload.metadata ?? {},
    previousHash: payload.previousHash
  });
}

export async function seed() {
  console.log('Seeding RACE PostgreSQL / Target database...');

  // ---------------------------------------------------------
  // 1. Cleanup existing tables in dependency order
  // ---------------------------------------------------------

  await prisma.transactionProof.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.policyDecision.deleteMany({});
  await prisma.riskCheck.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.auditEvent.deleteMany({});
  await prisma.webhookEvent.deleteMany({});
  await prisma.agentInteraction.deleteMany({});
  await prisma.growthRecommendation.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.agentTool.deleteMany({});
  await prisma.agent.deleteMany({});
  await prisma.policy.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.mandate.deleteMany({});
  await prisma.merchant.deleteMany({});
  await prisma.user.deleteMany({});

  // ---------------------------------------------------------
  // 2. Create Users
  // ---------------------------------------------------------

  const buyerUser = await prisma.user.create({
    data: {
      id: 'usr_buyer_001',
      name: 'Aarav Sharma',
      email: 'aarav@race.exchange',
      role: 'BUYER'
    }
  });

  await prisma.user.create({
    data: {
      id: 'usr_merchant_001',
      name: 'Vikram Mehta',
      email: 'vikram@technova.gear',
      role: 'MERCHANT'
    }
  });

  // ---------------------------------------------------------
  // 3. Create Merchant
  // ---------------------------------------------------------

  const merchantPassport = {
    catalogQuality: 19,
    pricingClarity: 18,
    inventoryReliability: 20,
    policyCompleteness: 17,
    paymentReliability: 20,
    totalScore: 94,
    checks: {
      agentDiscoverable: true,
      agentReadable: true,
      agentPurchasable: true,
      paymentEnabled: true,
      policyDefined: true
    },
    protocols: [
      'RACE-ACP/v1.0',
      'RZP-AGENT-PAY/v2'
    ],
    lastAudited: new Date().toISOString()
  };

  const merchant = await prisma.merchant.create({
    data: {
      id: 'merch_technova',
      name: 'TechNova Gear',
      slug: 'technova-gear',
      description:
        'Premium ergonomic mechanical keyboards, workspace audio, and creator hardware.',
      currency: 'INR',
      trustScore: 96,
      aiReadinessScore: 94,
      agentEnabled: true,
      passportData: JSON.stringify(merchantPassport)
    }
  });

  // ---------------------------------------------------------
  // 4. Create Policy
  // ---------------------------------------------------------

  await prisma.policy.create({
    data: {
      id: 'pol_technova_default',
      merchantId: merchant.id,
      name: 'TechNova Agentic Commerce Standard Policy v1',
      maxTransactionAmount: 10000,
      allowedCurrency: 'INR',
      mandateRequirement: true,
      priceDriftRule: true,
      status: 'ACTIVE',
      version: 1
    }
  });

  // ---------------------------------------------------------
  // 5. Create Agents & Tools
  // ---------------------------------------------------------

  const buyerAgent = await prisma.agent.create({
    data: {
      id: 'buyer_agent',
      type: 'BUYER',
      name: 'RACE Conversational Buyer Agent',
      status: 'ACTIVE',
      metadata: JSON.stringify({
        protocol: 'RACE-ACP/v1.0',
        allowedCategories: [
          'keyboard',
          'mouse',
          'audio',
          'accessories'
        ],
        maxAutonomousLimit: 5000
      })
    }
  });

  await prisma.agentTool.createMany({
    data: [
      {
        agentId: buyerAgent.id,
        toolName: 'catalog.search',
        endpoint: '/api/agents/buyer/search',
        enabled: true
      },
      {
        agentId: buyerAgent.id,
        toolName: 'catalog.compare',
        endpoint: '/api/agents/buyer/compare',
        enabled: true
      },
      {
        agentId: buyerAgent.id,
        toolName: 'commerce.checkout',
        endpoint: '/api/agents/buyer/checkout',
        enabled: true
      }
    ]
  });

  const growthAgent = await prisma.agent.create({
    data: {
      id: 'growth_agent',
      type: 'GROWTH',
      name: 'TechNova AI Growth Agent',
      status: 'ACTIVE',
      metadata: JSON.stringify({
        coOccurrenceThreshold: 0.1,
        minConfidence: 0.75
      })
    }
  });

  await prisma.agentTool.create({
    data: {
      agentId: growthAgent.id,
      toolName: 'growth.analyze',
      endpoint: '/api/growth/analyze',
      enabled: true
    }
  });

  // ---------------------------------------------------------
  // 6. Create Products and Inventories
  // ---------------------------------------------------------

  const productsData = [
    {
      id: 'prod_keyboard_01',
      merchantId: merchant.id,
      name: 'TechNova Mechanical Keyboard',
      slug: 'technova-mechanical-keyboard',
      description:
        'Wireless 75% mechanical keyboard with hot-swappable red switches and RGB backlighting.',
      category: 'keyboard',
      price: 2199,
      currency: 'INR',
      stock: 42,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        connection: 'wireless',
        switch: 'mechanical-red',
        layout: '75%',
        rgb: true,
        battery: '4000mAh',
        warranty: '1 Year Manufacturer Warranty'
      }),
      returnPolicy:
        '7-day replacement for manufacturing defects'
    },
    {
      id: 'prod_mouse_02',
      merchantId: merchant.id,
      name: 'TechNova Precision Wireless Mouse',
      slug: 'technova-precision-wireless-mouse',
      description:
        'Ergonomic 2.4GHz + Bluetooth wireless mouse with silent clicks and 4000 DPI sensor.',
      category: 'mouse',
      price: 899,
      currency: 'INR',
      stock: 35,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        connection: 'wireless',
        dpi: '4000 DPI',
        sensor: 'optical',
        battery: 'Rechargeable USB-C'
      }),
      returnPolicy: '7-day replacement'
    },
    {
      id: 'prod_hub_03',
      merchantId: merchant.id,
      name: 'TechNova 7-in-1 USB-C Hub',
      slug: 'technova-7-in-1-usb-c-hub',
      description:
        'High-speed USB-C hub with 4K HDMI, 100W Power Delivery, SD/TF reader and 3x USB 3.0.',
      category: 'accessories',
      price: 1299,
      currency: 'INR',
      stock: 28,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        ports:
          'HDMI 4K, 3x USB 3.0, PD 100W, SD, TF',
        material: 'Aluminum Space Grey'
      }),
      returnPolicy: '7-day replacement'
    },
    {
      id: 'prod_wristrest_04',
      merchantId: merchant.id,
      name: 'TechNova Ergonomic Memory Foam Wrist Rest',
      slug: 'technova-memory-foam-wrist-rest',
      description:
        'Cooling gel infused memory foam wrist support for 75% and TKL mechanical keyboards.',
      category: 'accessories',
      price: 499,
      currency: 'INR',
      stock: 50,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        material: 'Memory foam with cooling gel',
        base: 'Anti-slip rubber base'
      }),
      returnPolicy: '7-day replacement'
    },
    {
      id: 'prod_keyboard_pro_05',
      merchantId: merchant.id,
      name: 'TechNova Mechanical Keyboard Pro',
      slug: 'technova-mechanical-keyboard-pro',
      description:
        'Gasket-mounted CNC aluminum wireless keyboard with sound-dampening foam and PBT keycaps.',
      category: 'keyboard',
      price: 3299,
      currency: 'INR',
      stock: 20,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        mount: 'Gasket mount',
        body: 'CNC Aluminum',
        switch: 'Factory Lubed Gateron Yellow'
      }),
      returnPolicy: '7-day replacement'
    }
  ];

  for (const prod of productsData) {
    await prisma.product.create({
      data: prod
    });

    await prisma.inventory.create({
      data: {
        productId: prod.id,
        available: prod.stock,
        reserved: 0,
        sold: 15
      }
    });
  }

  // ---------------------------------------------------------
  // 7. Create Active Intent Mandate
  // ---------------------------------------------------------

  const mandate = await prisma.mandate.create({
    data: {
      id: 'mand_active_01',
      userId: buyerUser.id,
      agentId: buyerAgent.id,
      merchantId: merchant.id,
      intent:
        'Purchase mechanical keyboard and accessories for workspace upgrade',
      maxAmount: 2500,
      currency: 'INR',
      allowedCategories: JSON.stringify([
        'keyboard',
        'mouse',
        'accessories'
      ]),
      allowedActions: JSON.stringify([
        'search',
        'compare',
        'purchase'
      ]),
      confirmationRequired: false,
      status: 'ACTIVE',
      expiresAt: new Date(
        Date.now() + 7 * 24 * 3600 * 1000
      )
    }
  });

  // ---------------------------------------------------------
  // 8. Create Historical Orders
  // ---------------------------------------------------------

  const order1 = await prisma.order.create({
    data: {
      id: 'ord_seed_001',
      userId: buyerUser.id,
      merchantId: merchant.id,
      mandateId: mandate.id,
      amount: 2698,
      currency: 'INR',
      status: 'PAID',
      razorpayOrderId: 'order_seed_rzp_001',
      razorpayPaymentId: 'pay_seed_rzp_001'
    }
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order1.id,
        productId: 'prod_keyboard_01',
        quantity: 1,
        unitPrice: 2199,
        totalPrice: 2199
      },
      {
        orderId: order1.id,
        productId: 'prod_wristrest_04',
        quantity: 1,
        unitPrice: 499,
        totalPrice: 499
      }
    ]
  });

  await prisma.payment.create({
    data: {
      orderId: order1.id,
      amount: 2698,
      currency: 'INR',
      status: 'SUCCESS',
      razorpayOrderId: 'order_seed_rzp_001',
      razorpayPaymentId: 'pay_seed_rzp_001',
      signatureValid: true
    }
  });

  const order2 = await prisma.order.create({
    data: {
      id: 'ord_seed_002',
      userId: buyerUser.id,
      merchantId: merchant.id,
      mandateId: mandate.id,
      amount: 4397,
      currency: 'INR',
      status: 'PAID',
      razorpayOrderId: 'order_seed_rzp_002',
      razorpayPaymentId: 'pay_seed_rzp_002'
    }
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order2.id,
        productId: 'prod_keyboard_01',
        quantity: 1,
        unitPrice: 2199,
        totalPrice: 2199
      },
      {
        orderId: order2.id,
        productId: 'prod_mouse_02',
        quantity: 1,
        unitPrice: 899,
        totalPrice: 899
      },
      {
        orderId: order2.id,
        productId: 'prod_hub_03',
        quantity: 1,
        unitPrice: 1299,
        totalPrice: 1299
      }
    ]
  });

  await prisma.payment.create({
    data: {
      orderId: order2.id,
      amount: 4397,
      currency: 'INR',
      status: 'SUCCESS',
      razorpayOrderId: 'order_seed_rzp_002',
      razorpayPaymentId: 'pay_seed_rzp_002',
      signatureValid: true
    }
  });

  // ---------------------------------------------------------
  // 9. Create Initial Audit Trail
  // ---------------------------------------------------------

  let previousHash = '0'.repeat(64);

  const auditEvents = [
    {
      eventType: 'SYSTEM_INITIALIZED',
      actorType: 'SYSTEM',
      actorId: 'race_control_plane',
      resourceType: 'PLATFORM',
      resourceId: 'race_platform_v1',
      decision: 'SUCCESS',
      reasonCodes: [],
      metadata: {
        version: '1.0.0',
        target: 'PostgreSQL'
      }
    },
    {
      eventType: 'MERCHANT_REGISTERED',
      actorType: 'MERCHANT',
      actorId: merchant.id,
      resourceType: 'MERCHANT',
      resourceId: merchant.id,
      decision: 'SUCCESS',
      reasonCodes: [],
      metadata: {
        trustScore: 96,
        aiReadinessScore: 94
      }
    },
    {
      eventType: 'MANDATE_CREATED',
      actorType: 'BUYER',
      actorId: buyerUser.id,
      resourceType: 'MANDATE',
      resourceId: mandate.id,
      decision: 'CREATED',
      reasonCodes: [],
      metadata: {
        maxAmount: 2500,
        currency: 'INR'
      }
    }
  ];

  for (const event of auditEvents) {
    const hash = computeAuditHash({
      eventType: event.eventType,
      actorType: event.actorType,
      actorId: event.actorId,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      decision: event.decision,
      reasonCodes: event.reasonCodes,
      metadata: event.metadata,
      previousHash
    });

    await prisma.auditEvent.create({
      data: {
        eventType: event.eventType,
        actorType: event.actorType,
        actorId: event.actorId,
        resourceType: event.resourceType,
        resourceId: event.resourceId,
        decision: event.decision,
        reasonCodes: JSON.stringify(event.reasonCodes),
        metadata: JSON.stringify(event.metadata),
        previousHash,
        hash
      }
    });

    previousHash = hash;
  }

  // ---------------------------------------------------------
  // 10. Generate Cryptographic Transaction Proofs
  //
  // IMPORTANT:
  // Proofs are created AFTER the audit chain so the proof
  // contains the final audit-chain hash.
  // ---------------------------------------------------------

  const proofTimestamp1 = new Date().toISOString();

  const proofDto1 = ProofEngine.generateProof({
    orderId: order1.id,
    amount: order1.amount,
    currency: order1.currency,
    mandateId: mandate.id,
    policyDecision: 'APPROVED',
    riskScore: 8,
    paymentId: 'pay_seed_rzp_001',
    eventChainHash: previousHash,
    timestamp: proofTimestamp1
  });

  await prisma.transactionProof.create({
    data: {
      id: proofDto1.id,
      orderId: proofDto1.orderId,
      decisionHash: proofDto1.decisionHash,
      transactionHash: proofDto1.transactionHash,
      proofPayload: JSON.stringify(proofDto1.proofPayload),
      verificationStatus: proofDto1.verificationStatus,
      verifiedAt: new Date(proofTimestamp1),
      createdAt: new Date(proofTimestamp1)
    }
  });

  const proofTimestamp2 = new Date().toISOString();

  const proofDto2 = ProofEngine.generateProof({
    orderId: order2.id,
    amount: order2.amount,
    currency: order2.currency,
    mandateId: mandate.id,
    policyDecision: 'APPROVED',
    riskScore: 12,
    paymentId: 'pay_seed_rzp_002',
    eventChainHash: previousHash,
    timestamp: proofTimestamp2
  });

  await prisma.transactionProof.create({
    data: {
      id: proofDto2.id,
      orderId: proofDto2.orderId,
      decisionHash: proofDto2.decisionHash,
      transactionHash: proofDto2.transactionHash,
      proofPayload: JSON.stringify(proofDto2.proofPayload),
      verificationStatus: proofDto2.verificationStatus,
      verifiedAt: new Date(proofTimestamp2),
      createdAt: new Date(proofTimestamp2)
    }
  });

  // ---------------------------------------------------------
  // 11. Final Verification Before Completing Seed
  // ---------------------------------------------------------

  const seededProof1 =
    await prisma.transactionProof.findUnique({
      where: {
        orderId: order1.id
      }
    });

  const seededProof2 =
    await prisma.transactionProof.findUnique({
      where: {
        orderId: order2.id
      }
    });

  if (!seededProof1 || !seededProof2) {
    throw new Error(
      'Seed failed: transaction proofs were not created.'
    );
  }

  const auditChain =
    await prisma.auditEvent.findMany({
      orderBy: {
        createdAt: 'asc'
      }
    });

  const verifyProof1 = ProofEngine.verifyProof(
    {
      id: seededProof1.id,
      orderId: seededProof1.orderId,
      decisionHash: seededProof1.decisionHash,
      transactionHash: seededProof1.transactionHash,
      proofPayload: JSON.parse(
        seededProof1.proofPayload || '{}'
      ),
      verificationStatus:
        seededProof1.verificationStatus as any,
      verifiedAt:
        seededProof1.verifiedAt?.toISOString(),
      createdAt:
        seededProof1.createdAt.toISOString()
    },
    auditChain as any
  );

  const verifyProof2 = ProofEngine.verifyProof(
    {
      id: seededProof2.id,
      orderId: seededProof2.orderId,
      decisionHash: seededProof2.decisionHash,
      transactionHash: seededProof2.transactionHash,
      proofPayload: JSON.parse(
        seededProof2.proofPayload || '{}'
      ),
      verificationStatus:
        seededProof2.verificationStatus as any,
      verifiedAt:
        seededProof2.verifiedAt?.toISOString(),
      createdAt:
        seededProof2.createdAt.toISOString()
    },
    auditChain as any
  );

  if (!verifyProof1.valid) {
    throw new Error(
      `Seed verification failed for ${order1.id}: ${verifyProof1.details}`
    );
  }

  if (!verifyProof2.valid) {
    throw new Error(
      `Seed verification failed for ${order2.id}: ${verifyProof2.details}`
    );
  }

  console.log(
    `Proof created and verified successfully for ${order1.id}.`
  );

  console.log(
    `Proof created and verified successfully for ${order2.id}.`
  );

  console.log(
    'RACE database successfully seeded with users, merchant, products, inventories, mandate, agents, historical orders, transaction proofs, and a valid canonical SHA-256 audit chain.'
  );
}

if (require.main === module) {
  seed()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}