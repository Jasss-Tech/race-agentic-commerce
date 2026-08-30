const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function sha256(data) {
  return crypto.createHash('sha256').update(typeof data === 'string' ? data : JSON.stringify(data)).digest('hex');
}

async function main() {
  console.log('Seeding RACE database...');

  // 1. Cleanup existing tables
  await prisma.transactionProof.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.policyDecision.deleteMany({});
  await prisma.riskCheck.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.auditEvent.deleteMany({});
  await prisma.agentInteraction.deleteMany({});
  await prisma.growthRecommendation.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.mandate.deleteMany({});
  await prisma.merchant.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create User
  const user = await prisma.user.create({
    data: {
      id: 'usr_buyer_001',
      name: 'Aarav Sharma',
      email: 'aarav@race.exchange',
      role: 'BUYER'
    }
  });

  // 3. Create Merchant
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
    protocols: ['RACE-ACP/v1.0', 'RZP-AGENT-PAY/v2'],
    lastAudited: new Date().toISOString()
  };

  const merchant = await prisma.merchant.create({
    data: {
      id: 'merch_technova',
      name: 'TechNova Gear',
      slug: 'technova-gear',
      description: 'Premium ergonomic mechanical keyboards, audio accessories, and creator workspace hardware.',
      currency: 'INR',
      trustScore: 96,
      aiReadinessScore: 94,
      agentEnabled: true,
      passportData: JSON.stringify(merchantPassport)
    }
  });

  // 4. Create Products
  const productsData = [
    {
      id: 'prod_keyboard_01',
      merchantId: merchant.id,
      name: 'TechNova Mechanical Keyboard',
      slug: 'technova-mechanical-keyboard',
      description: 'Wireless 75% mechanical keyboard with hot-swappable red switches and RGB backlighting.',
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
      returnPolicy: '7-day replacement for manufacturing defects'
    },
    {
      id: 'prod_mouse_02',
      merchantId: merchant.id,
      name: 'TechNova Precision Wireless Mouse',
      slug: 'technova-precision-wireless-mouse',
      description: 'Ergonomic dual-mode 2.4GHz + Bluetooth mouse with 16,000 DPI optical sensor.',
      category: 'mouse',
      price: 1299,
      currency: 'INR',
      stock: 35,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        connection: 'bluetooth',
        dpi: 16000,
        weight: '68g',
        rgb: true
      }),
      returnPolicy: '7-day replacement'
    },
    {
      id: 'prod_wristrest_03',
      merchantId: merchant.id,
      name: 'Ergonomic Memory Foam Wrist Rest',
      slug: 'ergonomic-memory-foam-wrist-rest',
      description: 'High-density memory foam wrist rest with cooling gel layer and non-slip rubber base.',
      category: 'accessories',
      price: 399,
      currency: 'INR',
      stock: 80,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        material: 'Memory Foam + Cooling Gel',
        size: 'Compact 75% compatible',
        antiSlip: true
      }),
      returnPolicy: '14-day hassle-free returns'
    },
    {
      id: 'prod_hub_04',
      merchantId: merchant.id,
      name: '7-in-1 Aluminum USB-C Hub',
      slug: '7-in-1-aluminum-usb-c-hub',
      description: '4K@60Hz HDMI, 100W Power Delivery pass-through, SD/TF card reader, 3x USB 3.0 ports.',
      category: 'accessories',
      price: 1499,
      currency: 'INR',
      stock: 25,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        ports: '7 ports',
        powerDelivery: '100W',
        hdmiResolution: '4K 60Hz'
      }),
      returnPolicy: '7-day replacement'
    },
    {
      id: 'prod_headset_05',
      merchantId: merchant.id,
      name: 'TechNova Pro Gaming Headset',
      slug: 'technova-pro-gaming-headset',
      description: 'Spatial 7.1 surround sound gaming headset with detachable noise-cancelling microphone.',
      category: 'audio',
      price: 2499,
      currency: 'INR',
      stock: 18,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        audio: '7.1 Spatial Surround',
        driver: '50mm Neodymium',
        mic: 'Detachable AI Noise-Cancelling'
      }),
      returnPolicy: '7-day replacement'
    },
    {
      id: 'prod_keyboard_pro_06',
      merchantId: merchant.id,
      name: 'TechNova Mechanical Keyboard Pro (CNC Aluminum)',
      slug: 'technova-mechanical-keyboard-pro',
      description: 'Gasket-mounted CNC aluminum mechanical keyboard with per-key RGB, QMK/VIA support, and pre-lubed switches.',
      category: 'keyboard',
      price: 2999,
      currency: 'INR',
      stock: 15,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        connection: 'tri-mode',
        switch: 'lubed-linear-yellow',
        chassis: 'CNC Anodized Aluminum',
        programmable: 'QMK/VIA'
      }),
      returnPolicy: '7-day replacement'
    },
    {
      id: 'prod_lightbar_07',
      merchantId: merchant.id,
      name: 'ScreenBar Monitor Light with Wireless Dial',
      slug: 'screenbar-monitor-light',
      description: 'Asymmetric optical monitor lamp with touch dial, auto-dimming, and CRI > 95.',
      category: 'accessories',
      price: 1899,
      currency: 'INR',
      stock: 30,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        power: 'USB Type-C',
        colorTemp: '2700K - 6500K',
        cri: 95
      }),
      returnPolicy: '7-day replacement'
    },
    {
      id: 'prod_laptopstand_08',
      merchantId: merchant.id,
      name: 'Adjustable Aluminum Laptop Stand',
      slug: 'adjustable-aluminum-laptop-stand',
      description: 'Foldable ergonomic laptop riser with dual-hinge stability up to 17-inch laptops.',
      category: 'accessories',
      price: 1599,
      currency: 'INR',
      stock: 22,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        material: 'Anodized Aluminum',
        maxLoad: '10kg',
        coolingVent: true
      }),
      returnPolicy: '7-day replacement'
    }
  ];

  for (const p of productsData) {
    await prisma.product.create({ data: p });
  }

  // 5. Seed Historical Orders for Growth Analytics
  const historicalOrders = [
    {
      id: 'race_ord_hist_101',
      userId: user.id,
      merchantId: merchant.id,
      amount: 2598,
      status: 'PAID',
      razorpayOrderId: 'order_hist_rzp_101',
      razorpayPaymentId: 'pay_hist_rzp_101',
      createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000),
      items: [
        { productId: 'prod_keyboard_01', quantity: 1, unitPrice: 2199, totalPrice: 2199 },
        { productId: 'prod_wristrest_03', quantity: 1, unitPrice: 399, totalPrice: 399 }
      ]
    },
    {
      id: 'race_ord_hist_102',
      userId: user.id,
      merchantId: merchant.id,
      amount: 2199,
      status: 'PAID',
      razorpayOrderId: 'order_hist_rzp_102',
      razorpayPaymentId: 'pay_hist_rzp_102',
      createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
      items: [
        { productId: 'prod_keyboard_01', quantity: 1, unitPrice: 2199, totalPrice: 2199 }
      ]
    },
    {
      id: 'race_ord_hist_103',
      userId: user.id,
      merchantId: merchant.id,
      amount: 4997,
      status: 'PAID',
      razorpayOrderId: 'order_hist_rzp_103',
      razorpayPaymentId: 'pay_hist_rzp_103',
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      items: [
        { productId: 'prod_keyboard_01', quantity: 1, unitPrice: 2199, totalPrice: 2199 },
        { productId: 'prod_mouse_02', quantity: 1, unitPrice: 1299, totalPrice: 1299 },
        { productId: 'prod_hub_04', quantity: 1, unitPrice: 1499, totalPrice: 1499 }
      ]
    }
  ];

  for (const ord of historicalOrders) {
    const createdOrder = await prisma.order.create({
      data: {
        id: ord.id,
        userId: ord.userId,
        merchantId: ord.merchantId,
        amount: ord.amount,
        status: ord.status,
        razorpayOrderId: ord.razorpayOrderId,
        razorpayPaymentId: ord.razorpayPaymentId,
        createdAt: ord.createdAt
      }
    });

    for (const item of ord.items) {
      await prisma.orderItem.create({
        data: {
          orderId: createdOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          createdAt: ord.createdAt
        }
      });
    }
  }

  // 6. Seed Growth Recommendations
  const growthRecs = [
    {
      id: 'rec_cross_001',
      merchantId: merchant.id,
      productId: 'prod_keyboard_01',
      type: 'CROSS_SELL',
      recommendation: 'Bundle TechNova Mechanical Keyboard with Ergonomic Wrist Rest at 15% accessory discount during agent checkout',
      reason: 'Customers purchasing mechanical keyboards frequently search for ergonomic wrist support. Historical agent sessions show 8.2% organic attach rate which can be scaled to 14.5% with proactive agent delegation.',
      confidence: 0.88,
      expectedImpact: JSON.stringify({
        currentAov: 2199,
        expectedAov: 2538,
        currentAttachRate: 8.2,
        targetAttachRate: 14.5,
        projectedRevenueLift: 18450,
        currency: 'INR'
      }),
      status: 'PROPOSED'
    },
    {
      id: 'rec_up_002',
      merchantId: merchant.id,
      productId: 'prod_keyboard_01',
      type: 'UPSELL',
      recommendation: 'Offer TechNova Mechanical Keyboard Pro upgrade when buyer budget cap exceeds ₹2800',
      reason: '34% of buyer agent search queries for wireless keyboards specify a budget between ₹2800 and ₹3500, but settle for standard models due to lack of immediate feature comparison.',
      confidence: 0.82,
      expectedImpact: JSON.stringify({
        currentAov: 2199,
        expectedAov: 2999,
        currentAttachRate: 12.0,
        targetAttachRate: 22.0,
        projectedRevenueLift: 26400,
        currency: 'INR'
      }),
      status: 'PROPOSED'
    },
    {
      id: 'rec_bundle_003',
      merchantId: merchant.id,
      productId: 'prod_keyboard_01',
      type: 'BUNDLE',
      recommendation: 'Launch "Creator Workspace Bundle" (Keyboard + Mouse + USB-C Hub) at ₹4,499 (10% discount)',
      reason: 'Agentic multi-item basket queries increase checkout speed by 40% when items are pre-packaged with verified compatibility metadata.',
      confidence: 0.91,
      expectedImpact: JSON.stringify({
        currentAov: 2199,
        expectedAov: 4499,
        currentAttachRate: 5.4,
        targetAttachRate: 11.2,
        projectedRevenueLift: 42000,
        currency: 'INR'
      }),
      status: 'PROPOSED'
    }
  ];

  for (const rec of growthRecs) {
    await prisma.growthRecommendation.create({ data: rec });
  }

  // 7. Seed Genesis Audit Chain
  let prevHash = null;
  const auditEventsToSeed = [
    {
      eventType: 'SYSTEM_INITIALIZED',
      actorType: 'SYSTEM',
      actorId: 'race_control_plane',
      resourceType: 'PLATFORM',
      resourceId: 'race_core',
      decision: 'SUCCESS',
      metadata: JSON.stringify({ version: '1.0.0', network: 'razorpay-agentic-exchange' })
    },
    {
      eventType: 'MERCHANT_PASSPORT_VERIFIED',
      actorType: 'SYSTEM',
      actorId: 'passport_engine',
      resourceType: 'MERCHANT',
      resourceId: merchant.id,
      decision: 'ALLOW',
      metadata: JSON.stringify({ score: 94, agentEnabled: true })
    },
    {
      eventType: 'CATALOG_INDEXED',
      actorType: 'MERCHANT',
      actorId: merchant.id,
      resourceType: 'CATALOG',
      resourceId: 'technova_products',
      decision: 'SUCCESS',
      metadata: JSON.stringify({ productCount: productsData.length, agentPurchasable: true })
    }
  ];

  for (const ev of auditEventsToSeed) {
    const timestamp = new Date().toISOString();
    const eventPayload = {
      previousHash: prevHash || '0'.repeat(64),
      eventType: ev.eventType,
      actorType: ev.actorType,
      actorId: ev.actorId,
      resourceType: ev.resourceType,
      resourceId: ev.resourceId,
      decision: ev.decision,
      metadata: JSON.parse(ev.metadata),
      timestamp
    };
    const currentHash = sha256(eventPayload);

    await prisma.auditEvent.create({
      data: {
        eventType: ev.eventType,
        actorType: ev.actorType,
        actorId: ev.actorId,
        resourceType: ev.resourceType,
        resourceId: ev.resourceId,
        decision: ev.decision,
        metadata: ev.metadata,
        previousHash: prevHash,
        hash: currentHash
      }
    });

    prevHash = currentHash;
  }

  console.log('RACE database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
