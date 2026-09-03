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
    // KEYBOARDS
    {
      id: 'prod_keyboard_01',
      merchantId: merchant.id,
      name: 'TechNova Mechanical Keyboard',
      slug: 'technova-mechanical-keyboard',
      description: 'Wireless 75% mechanical keyboard with hot-swappable red switches, PBT keycaps, and RGB backlighting.',
      category: 'keyboard',
      price: 2199,
      currency: 'INR',
      stock: 42,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        connection: 'Tri-Mode Wireless (BT 5.3 + 2.4GHz + Type-C)',
        switch: 'Hot-Swappable Red Switches (Linear 45g)',
        layout: '75% Compact (84 Keys)',
        battery: '4000mAh (Up to 90 hrs)',
        weight: '780g',
        dimensions: '315 x 132 x 38 mm',
        compatibility: 'Windows, macOS, Linux, iOS, Android',
        warranty: '1 Year Manufacturer Warranty',
        rating: 4.8,
        reviewsCount: 342,
        bestFor: 'Software Developers & Everyday Typing',
        keyStrength: 'Hot-swappable switches & long battery life',
        mainTradeoff: 'Slightly heavier frame than membrane alternatives',
        rgb: true
      }),
      returnPolicy: '7-day replacement for manufacturing defects'
    },
    {
      id: 'prod_keyboard_pro_05',
      merchantId: merchant.id,
      name: 'TechNova Mechanical Keyboard Pro',
      slug: 'technova-mechanical-keyboard-pro',
      description: 'Gasket-mounted CNC aluminum wireless keyboard with sound-dampening foam and factory-lubed switches.',
      category: 'keyboard',
      price: 3299,
      currency: 'INR',
      stock: 20,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        connection: 'Tri-Mode Wireless (BT 5.3 + 2.4GHz + Type-C)',
        switch: 'Factory Lubed Gateron Yellow (50g Smooth)',
        layout: '87% TKL Gasket Mount',
        battery: '5000mAh (Up to 120 hrs)',
        weight: '1420g',
        dimensions: '360 x 140 x 42 mm',
        compatibility: 'Windows, macOS, Linux',
        warranty: '2 Years Comprehensive Warranty',
        rating: 4.9,
        reviewsCount: 184,
        bestFor: 'Enthusiasts & Deep Work Sessions',
        keyStrength: 'Premium heavy CNC aluminum body & acoustic foam dampening',
        mainTradeoff: 'Priced above entry-level mandate budgets',
        rgb: true
      }),
      returnPolicy: '7-day replacement'
    },
    {
      id: 'prod_keyboard_compact_06',
      merchantId: merchant.id,
      name: 'TechNova Compact 60% RGB Keyboard',
      slug: 'technova-compact-60-rgb-keyboard',
      description: 'Ultra-portable 61-key mechanical keyboard engineered for minimalist desks and traveling developers.',
      category: 'keyboard',
      price: 1899,
      currency: 'INR',
      stock: 38,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        connection: 'Detachable USB Type-C + Bluetooth 5.0',
        switch: 'Outemu Blue Clicky Switches',
        layout: '60% Ultra-Compact (61 Keys)',
        battery: '2500mAh (Up to 45 hrs)',
        weight: '560g',
        dimensions: '292 x 102 x 35 mm',
        compatibility: 'Windows, macOS, Android',
        warranty: '1 Year Replacement',
        rating: 4.6,
        reviewsCount: 215,
        bestFor: 'Mobile Workstations & Minimalist Setups',
        keyStrength: 'Smallest desk footprint with tactile click feedback',
        mainTradeoff: 'Requires Fn layer for arrow and function keys',
        rgb: true
      }),
      returnPolicy: '7-day replacement'
    },
    {
      id: 'prod_keyboard_slim_07',
      merchantId: merchant.id,
      name: 'TechNova Ultra-Slim Wireless Keyboard',
      slug: 'technova-ultra-slim-wireless-keyboard',
      description: 'Scissor-switch low-profile wireless keyboard with aluminum top plate and whisper-quiet typing.',
      category: 'keyboard',
      price: 1499,
      currency: 'INR',
      stock: 45,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        connection: 'Bluetooth 5.2 (Multi-device 3-way pairing)',
        switch: 'Low-Profile Scissor Keys (1.5mm travel)',
        layout: 'Full Size with Numpad (104 Keys)',
        battery: 'Rechargeable USB-C (Up to 180 hrs)',
        weight: '490g',
        dimensions: '425 x 115 x 14 mm',
        compatibility: 'Windows, macOS, iOS, Android',
        warranty: '1 Year Replacement',
        rating: 4.7,
        reviewsCount: 156,
        bestFor: 'Office Environments & Quiet Typing',
        keyStrength: 'Whisper-quiet typing with full numeric keypad',
        mainTradeoff: 'Non-mechanical membrane scissor action',
        rgb: false
      }),
      returnPolicy: '7-day replacement'
    },
    {
      id: 'prod_keyboard_ergo_08',
      merchantId: merchant.id,
      name: 'TechNova Split Ergonomic Keyboard',
      slug: 'technova-split-ergonomic-keyboard',
      description: 'Curved split-keyframe ergonomic keyboard with integrated wrist rest and natural typing posture.',
      category: 'keyboard',
      price: 2799,
      currency: 'INR',
      stock: 22,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        connection: '2.4GHz Wireless + Bluetooth 5.1',
        switch: 'Cushioned Tactile Membrane Keys',
        layout: 'Split Ergonomic Wave Layout',
        battery: '2x AAA Batteries (Up to 24 months)',
        weight: '820g',
        dimensions: '450 x 240 x 48 mm',
        compatibility: 'Windows, macOS',
        warranty: '2 Years Replacement',
        rating: 4.8,
        reviewsCount: 98,
        bestFor: 'RSI Prevention & Long Coding Hours',
        keyStrength: 'Clinically proven wrist strain reduction',
        mainTradeoff: 'Requires adjustment period for split layout',
        rgb: false
      }),
      returnPolicy: '7-day replacement'
    },

    // MICE
    {
      id: 'prod_mouse_02',
      merchantId: merchant.id,
      name: 'TechNova Precision Wireless Mouse',
      slug: 'technova-precision-wireless-mouse',
      description: 'Ergonomic 2.4GHz + Bluetooth wireless mouse with silent clicks and 4000 DPI multi-surface sensor.',
      category: 'mouse',
      price: 899,
      currency: 'INR',
      stock: 35,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        connection: 'Dual Mode (2.4GHz USB Dongle + Bluetooth 5.1)',
        sensor: 'Optical Multi-Surface 4000 DPI',
        battery: 'Rechargeable 500mAh USB-C (60 days)',
        weight: '88g',
        dimensions: '108 x 64 x 38 mm',
        compatibility: 'Windows, macOS, Linux, ChromeOS',
        warranty: '1 Year Replacement',
        rating: 4.7,
        reviewsCount: 420,
        bestFor: 'Daily Productivity & Office Quiet Work',
        keyStrength: '90% noise reduction silent switches with quick DPI switch',
        mainTradeoff: 'Not optimized for high-refresh competitive gaming',
        rgb: false
      }),
      returnPolicy: '7-day replacement'
    },
    {
      id: 'prod_mouse_ergo_09',
      merchantId: merchant.id,
      name: 'TechNova Vertical Ergonomic Pro Mouse',
      slug: 'technova-vertical-ergonomic-pro-mouse',
      description: '57-degree vertical handshake grip mouse designed by ergonomists to eliminate forearm and wrist fatigue.',
      category: 'mouse',
      price: 1599,
      currency: 'INR',
      stock: 30,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        connection: 'Tri-Mode Wireless (BT 5.0 + 2.4GHz + Type-C)',
        sensor: 'High-Precision Optical 3200 DPI',
        battery: 'Rechargeable 800mAh (Up to 90 days)',
        weight: '115g',
        dimensions: '120 x 78 x 72 mm',
        compatibility: 'Windows, macOS, Linux',
        warranty: '2 Years Replacement',
        rating: 4.8,
        reviewsCount: 265,
        bestFor: 'Carpal Tunnel Relief & Heavy Desk Work',
        keyStrength: 'Natural handshake angle eliminates forearm twisting',
        mainTradeoff: 'Larger shape not suitable for small hands or travel',
        rgb: true
      }),
      returnPolicy: '7-day replacement'
    },
    {
      id: 'prod_mouse_gaming_10',
      merchantId: merchant.id,
      name: 'TechNova Ultra-Light 54g Gaming Mouse',
      slug: 'technova-ultra-light-54g-gaming-mouse',
      description: 'Esports-grade ultra-lightweight wireless mouse with 26,000 DPI optical sensor and 1000Hz polling rate.',
      category: 'mouse',
      price: 2499,
      currency: 'INR',
      stock: 25,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        connection: 'Ultra-Low Latency 2.4GHz (1ms) + Type-C Paracord',
        sensor: 'PixArt PAW3395 26,000 DPI (650 IPS, 50G)',
        battery: '300mAh Ultra-Light (Up to 70 hrs)',
        weight: '54g (Featherweight solid shell)',
        dimensions: '118 x 61 x 38 mm',
        compatibility: 'Windows, macOS, Linux',
        warranty: '1 Year Replacement',
        rating: 4.9,
        reviewsCount: 310,
        bestFor: 'Competitive FPS Gaming & Rapid Aiming',
        keyStrength: 'Extremely lightweight with top-tier optical sensor',
        mainTradeoff: 'Compact symmetrical shell not for palm grip users',
        rgb: false
      }),
      returnPolicy: '7-day replacement'
    },
    {
      id: 'prod_mouse_silent_11',
      merchantId: merchant.id,
      name: 'TechNova Silent Office Mouse',
      slug: 'technova-silent-office-mouse',
      description: 'Compact wireless travel mouse with silent click buttons and magnetic battery compartment.',
      category: 'mouse',
      price: 699,
      currency: 'INR',
      stock: 60,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        connection: '2.4GHz Nano Receiver USB',
        sensor: 'Optical 1600 DPI (3 adjustable steps)',
        battery: '1x AA Battery (Up to 12 months)',
        weight: '68g',
        dimensions: '100 x 58 x 32 mm',
        compatibility: 'Windows, macOS, ChromeOS',
        warranty: '1 Year Replacement',
        rating: 4.5,
        reviewsCount: 180,
        bestFor: 'Laptops, Students & Commuters',
        keyStrength: 'Ultra-affordable with dependable battery life',
        mainTradeoff: 'No Bluetooth mode (USB receiver required)',
        rgb: false
      }),
      returnPolicy: '7-day replacement'
    },
    {
      id: 'prod_mouse_trackball_12',
      merchantId: merchant.id,
      name: 'TechNova Precision Wireless Trackball',
      slug: 'technova-precision-wireless-trackball',
      description: 'Thumb-controlled precision trackball mouse with adjustable 20-degree tilt plate for zero arm movement.',
      category: 'mouse',
      price: 2199,
      currency: 'INR',
      stock: 18,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        connection: 'Bluetooth 5.0 + 2.4GHz Wireless Dongle',
        sensor: 'Precision Optical Trackball 2000 DPI',
        battery: 'Rechargeable 600mAh (Up to 4 months)',
        weight: '165g',
        dimensions: '135 x 98 x 50 mm',
        compatibility: 'Windows, macOS, Linux',
        warranty: '2 Years Replacement',
        rating: 4.7,
        reviewsCount: 92,
        bestFor: 'Audio Engineers, CAD Design & Small Desks',
        keyStrength: 'Operates on any surface without moving your arm',
        mainTradeoff: 'Requires trackball muscle memory adaptation',
        rgb: false
      }),
      returnPolicy: '7-day replacement'
    },

    // HEADPHONES & AUDIO
    {
      id: 'prod_audio_anc_13',
      merchantId: merchant.id,
      name: 'TechNova Hybrid ANC Wireless Headphones',
      slug: 'technova-hybrid-anc-wireless-headphones',
      description: 'Over-ear wireless headphones with -42dB Active Noise Cancellation, transparency mode, and 40mm drivers.',
      category: 'audio',
      price: 3499,
      currency: 'INR',
      stock: 24,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        connection: 'Bluetooth 5.3 + 3.5mm Aux Cable (Multipoint)',
        driver: '40mm Titanium Dynamic Drivers (Hi-Res Audio)',
        battery: '600mAh (60 hrs ANC Off / 40 hrs ANC On)',
        weight: '240g',
        dimensions: '185 x 165 x 78 mm',
        compatibility: 'iOS, Android, Windows, macOS',
        warranty: '1 Year Replacement',
        rating: 4.8,
        reviewsCount: 280,
        bestFor: 'Deep Focus & Noisy Office Environments',
        keyStrength: '-42dB Hybrid Active Noise Cancellation',
        mainTradeoff: 'Slightly bulky carry case for compact bags',
        rgb: false
      }),
      returnPolicy: '7-day replacement'
    },
    {
      id: 'prod_audio_studio_14',
      merchantId: merchant.id,
      name: 'TechNova Studio Reference Monitor Headphones',
      slug: 'technova-studio-reference-monitor-headphones',
      description: 'Closed-back studio monitoring headphones with flat response tuning and memory foam protein leather earcups.',
      category: 'audio',
      price: 2899,
      currency: 'INR',
      stock: 20,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        connection: 'Wired 3.5mm Gold-Plated (with 6.35mm Adapter)',
        driver: '50mm Neodymium Drivers (15Hz - 28kHz)',
        battery: 'Passive Wired (Zero Latency, No Battery)',
        weight: '260g',
        dimensions: '190 x 175 x 82 mm',
        compatibility: 'Audio Interfaces, DACs, PC, Mac, Mixers',
        warranty: '2 Years Manufacturer Warranty',
        rating: 4.9,
        reviewsCount: 145,
        bestFor: 'Music Production, Video Editing & Podcasting',
        keyStrength: 'Neutral uncolored frequency response with zero latency',
        mainTradeoff: 'Wired only (no Bluetooth wireless mode)',
        rgb: false
      }),
      returnPolicy: '7-day replacement'
    },
    {
      id: 'prod_audio_headset_15',
      merchantId: merchant.id,
      name: 'TechNova USB Pro Office Headset',
      slug: 'technova-usb-pro-office-headset',
      description: 'On-ear call center headset with AI background noise-canceling boom microphone and in-line call controls.',
      category: 'audio',
      price: 1199,
      currency: 'INR',
      stock: 40,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        connection: 'USB-A + 3.5mm 2-in-1 Connector',
        driver: '32mm Voice-Optimized Neodymium',
        microphone: 'Bidirectional AI Noise Filter Boom Mic',
        weight: '130g',
        dimensions: '160 x 140 x 55 mm',
        compatibility: 'Zoom, Microsoft Teams, Google Meet, Skype, Webex',
        warranty: '1 Year Replacement',
        rating: 4.6,
        reviewsCount: 310,
        bestFor: 'Customer Support, Remote Meetings & Video Calls',
        keyStrength: 'Crystal-clear voice pickup rejecting ambient room noise',
        mainTradeoff: 'Not tuned for bass-heavy music listening',
        rgb: false
      }),
      returnPolicy: '7-day replacement'
    },
    {
      id: 'prod_audio_gaming_16',
      merchantId: merchant.id,
      name: 'TechNova 7.1 Spatial Gaming Headset',
      slug: 'technova-7-1-spatial-gaming-headset',
      description: '7.1 Virtual Surround gaming headset with RGB lighting, breathable fabric ear cushions, and detachable mic.',
      category: 'audio',
      price: 2299,
      currency: 'INR',
      stock: 30,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        connection: 'USB-A DAC Cable + 3.5mm Aux Splitter',
        driver: '53mm Custom Tuned Drivers (7.1 Surround Sound)',
        microphone: 'Detachable Cardioid Mic with Foam Pop Filter',
        weight: '280g',
        dimensions: '200 x 180 x 90 mm',
        compatibility: 'PC, PS5, Xbox Series X, Nintendo Switch',
        warranty: '1 Year Replacement',
        rating: 4.7,
        reviewsCount: 220,
        bestFor: 'Immersive Gaming & Positional Audio Clues',
        keyStrength: 'Precise 7.1 spatial positioning for footsteps & cues',
        mainTradeoff: 'Virtual 7.1 surround requires PC software driver',
        rgb: true
      }),
      returnPolicy: '7-day replacement'
    },

    // WEBCAMS
    {
      id: 'prod_cam_1080p_17',
      merchantId: merchant.id,
      name: 'TechNova StreamCam 1080p 60FPS',
      slug: 'technova-streamcam-1080p-60fps',
      description: 'Full HD 1080p 60FPS streaming webcam with autofocus, dual stereo microphones, and physical privacy shutter.',
      category: 'webcam',
      price: 1799,
      currency: 'INR',
      stock: 32,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        resolution: '1080p Full HD @ 60 FPS / 720p @ 60 FPS',
        fov: '78-degree Wide Angle Glass Lens',
        focus: 'Fast Auto-Focus with Low-Light Auto Correction',
        microphone: 'Dual Omni-directional Noise Cancelling Mics',
        mounting: 'Universal Tripod Mount & Monitor Clamp',
        compatibility: 'OBS, Streamlabs, Zoom, Teams, Mac, Windows',
        warranty: '1 Year Replacement',
        rating: 4.8,
        reviewsCount: 195,
        bestFor: 'Game Streamers, Content Creators & Professional Calls',
        keyStrength: 'Silky smooth 60 FPS video with natural color grading',
        mainTradeoff: 'No 4K resolution capture mode',
        rgb: false
      }),
      returnPolicy: '7-day replacement'
    },
    {
      id: 'prod_cam_4k_18',
      merchantId: merchant.id,
      name: 'TechNova 4K UHD Pro Conference Webcam',
      slug: 'technova-4k-uhd-pro-conference-webcam',
      description: 'Ultra HD 4K conference webcam with Sony STARVIS sensor, 5x digital zoom, and HDR light balancing.',
      category: 'webcam',
      price: 3899,
      currency: 'INR',
      stock: 15,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        resolution: '4K Ultra HD @ 30 FPS / 1080p @ 60 FPS HDR',
        sensor: 'Sony STARVIS 1/2.8" CMOS Sensor',
        fov: '90-degree Ultra-Wide Angle with Auto-Framing',
        microphone: 'Beamforming Array Mics with Acoustic Echo Cancellation',
        mounting: '360 Swivel Base with Standard 1/4" Thread',
        compatibility: 'Windows 11/10, macOS, Linux',
        warranty: '2 Years Comprehensive',
        rating: 4.9,
        reviewsCount: 88,
        bestFor: 'Executive Boardrooms & High-End Studio Broadcasts',
        keyStrength: 'Stunning 4K sharpness even in challenging backlit lighting',
        mainTradeoff: 'Higher price point requiring USB 3.0 port',
        rgb: false
      }),
      returnPolicy: '7-day replacement'
    },
    {
      id: 'prod_cam_privacy_19',
      merchantId: merchant.id,
      name: 'TechNova 2K Autofocus Privacy Webcam',
      slug: 'technova-2k-autofocus-privacy-webcam',
      description: 'Crisp 2K QHD webcam with magnetic privacy cover and automatic face-tracking exposure.',
      category: 'webcam',
      price: 1399,
      currency: 'INR',
      stock: 35,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        resolution: '2K QHD (2560x1440) @ 30 FPS',
        fov: '80-degree Field of View',
        focus: 'Smart Fast Auto-Focus',
        microphone: 'Built-in Digital Noise Reduction Mic',
        mounting: 'Foldable Monitor Clip',
        compatibility: 'Windows, macOS, ChromeOS',
        warranty: '1 Year Replacement',
        rating: 4.7,
        reviewsCount: 140,
        bestFor: 'Online Teaching, Remote Work & Daily Standups',
        keyStrength: 'Higher resolution than 1080p at an affordable budget',
        mainTradeoff: 'Fixed 30 FPS frame rate',
        rgb: false
      }),
      returnPolicy: '7-day replacement'
    },

    // ACCESSORIES
    {
      id: 'prod_hub_03',
      merchantId: merchant.id,
      name: 'TechNova 7-in-1 USB-C Hub',
      slug: 'technova-7-in-1-usb-c-hub',
      description: 'High-speed USB-C hub with 4K HDMI, 100W Power Delivery, SD/TF reader and 3x USB 3.0 ports.',
      category: 'accessories',
      price: 1299,
      currency: 'INR',
      stock: 28,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        ports: '1x HDMI 4K@30Hz, 1x USB-C PD 100W, 3x USB 3.0 (5Gbps), 1x SD, 1x MicroSD',
        material: 'Anodized Aluminum Space Grey',
        weight: '75g',
        dimensions: '115 x 30 x 11 mm',
        compatibility: 'MacBook Pro/Air, iPad Pro, Dell XPS, ThinkPad, Surface',
        warranty: '1 Year Replacement',
        rating: 4.8,
        reviewsCount: 450,
        bestFor: 'MacBook & Ultra-thin Laptop Port Expansion',
        keyStrength: 'Compact 7-port expansion with 100W pass-through charging',
        mainTradeoff: 'HDMI limited to 4K@30Hz / 1080p@60Hz',
        rgb: false
      }),
      returnPolicy: '7-day replacement'
    },
    {
      id: 'prod_dock_20',
      merchantId: merchant.id,
      name: 'TechNova Thunderbolt 4 12-in-1 Docking Station',
      slug: 'technova-thunderbolt-4-12-in-1-dock',
      description: 'Enterprise 12-in-1 docking station with dual 4K@60Hz display outputs, Gigabit Ethernet, and 85W host charging.',
      category: 'accessories',
      price: 4999,
      currency: 'INR',
      stock: 14,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        ports: '2x HDMI 4K@60Hz, 1x DP 1.4, 1x GbE LAN, 4x USB 3.2 (10Gbps), 2x USB-C, Audio 3.5mm, 100W DC Adapter',
        material: 'Extruded CNC Aluminum with Cooling Vents',
        weight: '380g',
        dimensions: '198 x 78 x 22 mm',
        compatibility: 'Thunderbolt 4/3, USB4, Windows, macOS',
        warranty: '2 Years Replacement',
        rating: 4.9,
        reviewsCount: 76,
        bestFor: 'Dual Monitor Power Users & Workstation Desks',
        keyStrength: 'Drives dual 4K monitors simultaneously with dedicated power supply',
        mainTradeoff: 'Requires external wall power adapter',
        rgb: false
      }),
      returnPolicy: '7-day replacement'
    },
    {
      id: 'prod_stand_21',
      merchantId: merchant.id,
      name: 'TechNova Ergonomic Aluminum Laptop Riser',
      slug: 'technova-ergonomic-aluminum-laptop-riser',
      description: 'Foldable aircraft-grade aluminum laptop stand with 6 adjustable height levels and heat dissipation cutouts.',
      category: 'accessories',
      price: 899,
      currency: 'INR',
      stock: 45,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        material: 'Solid Aircraft-Grade Aluminum Alloy (Anti-Slip Silicone Pads)',
        adjustability: '6 Angles (15 to 45 degrees, 5.5cm to 15cm height)',
        weight: '260g',
        dimensions: '240 x 45 x 15 mm (Folded)',
        compatibility: 'All laptops 10" to 17.3" (up to 10kg load)',
        warranty: 'Lifetime Structural Warranty',
        rating: 4.9,
        reviewsCount: 520,
        bestFor: 'Neck Posture Correction & Laptop Cooling',
        keyStrength: 'Folds flat into a pocketable pouch with rock-solid stability',
        mainTradeoff: 'Requires external keyboard when elevated high',
        rgb: false
      }),
      returnPolicy: '7-day replacement'
    },
    {
      id: 'prod_wristrest_04',
      merchantId: merchant.id,
      name: 'TechNova Ergonomic Memory Foam Wrist Rest',
      slug: 'technova-memory-foam-wrist-rest',
      description: 'Cooling gel infused memory foam wrist support for 75% and TKL mechanical keyboards with anti-slip base.',
      category: 'accessories',
      price: 499,
      currency: 'INR',
      stock: 50,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        material: 'High-Density Memory Foam with Cooling Gel Layer + Lycra Fabric',
        base: 'Non-Slip Textured Natural Rubber Base',
        weight: '180g',
        dimensions: '360 x 75 x 20 mm',
        compatibility: '75%, 80% TKL and Compact Keyboards',
        warranty: '1 Year Replacement',
        rating: 4.8,
        reviewsCount: 380,
        bestFor: 'Mechanical Keyboard Wrist Support & Pain Relief',
        keyStrength: 'Cooling gel prevents sweaty palms during long typing sessions',
        mainTradeoff: 'Specific length tuned for 75%/TKL (not full 100% boards)',
        rgb: false
      }),
      returnPolicy: '7-day replacement'
    },
    {
      id: 'prod_charger_22',
      merchantId: merchant.id,
      name: 'TechNova 15W Qi Fast Wireless Charging Pad',
      slug: 'technova-15w-qi-fast-wireless-charger',
      description: 'Ultra-thin aluminum 15W wireless fast charger with temperature protection and LED charging indicator.',
      category: 'accessories',
      price: 799,
      currency: 'INR',
      stock: 40,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        power: '15W / 10W / 7.5W / 5W Smart Auto-Detection',
        material: 'Aircraft Aluminum Base with Anti-Slip Fabric Top',
        weight: '62g',
        dimensions: '98 x 98 x 6.5 mm',
        compatibility: 'iPhone 12-16, Samsung Galaxy, Pixel, AirPods Pro, Qi Devices',
        warranty: '1 Year Replacement',
        rating: 4.6,
        reviewsCount: 290,
        bestFor: 'Clutter-Free Desk Charging & Nightstand Use',
        keyStrength: 'Ultra-thin 6.5mm profile with intelligent foreign object detection',
        mainTradeoff: 'Requires QuickCharge 3.0 / PD wall adapter for 15W speed',
        rgb: false
      }),
      returnPolicy: '7-day replacement'
    },
    {
      id: 'prod_deskmat_23',
      merchantId: merchant.id,
      name: 'TechNova Extended Anti-Fray Desk Mat',
      slug: 'technova-extended-anti-fray-desk-mat',
      description: 'Water-resistant 900x400mm desk mat with micro-woven cloth surface and reinforced anti-fray stitched edges.',
      category: 'accessories',
      price: 599,
      currency: 'INR',
      stock: 55,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        material: 'High-Density Micro-Woven Textile with Waterproof Coating',
        base: '4mm Thick Eco-Friendly Anti-Slip Rubber',
        weight: '680g',
        dimensions: '900 x 400 x 4 mm',
        compatibility: 'Full Desk Surface (Keyboard + Mouse + Accessories)',
        warranty: '1 Year Replacement',
        rating: 4.8,
        reviewsCount: 410,
        bestFor: 'Desk Protection, Smooth Mouse Tracking & Sound Dampening',
        keyStrength: 'Spill-resistant coating with premium seamless stitched borders',
        mainTradeoff: 'Large footprint requires at least 1 meter wide desk space',
        rgb: false
      }),
      returnPolicy: '7-day replacement'
    },
    {
      id: 'prod_lightbar_24',
      merchantId: merchant.id,
      name: 'TechNova ScreenBar Auto-Dimming Light Bar',
      slug: 'technova-screenbar-auto-dimming-light-bar',
      description: 'Monitor-mounted LED light bar with asymmetrical optical design, touch color temperature adjustment, and zero screen glare.',
      category: 'accessories',
      price: 1699,
      currency: 'INR',
      stock: 28,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        lighting: 'Asymmetrical Optical Glare-Free LED (CRI > 95)',
        colorTemp: '2700K (Warm) - 6500K (Cool White) Stepless Touch Control',
        power: '5V USB-C Powered (Connects to PC, monitor, or charger)',
        weight: '420g',
        dimensions: '450 x 20 x 20 mm',
        compatibility: 'Flat & Curved Monitors (0.5cm to 4cm thickness)',
        warranty: '2 Years Replacement',
        rating: 4.9,
        reviewsCount: 175,
        bestFor: 'Late Night Coding, Reading & Eye Strain Relief',
        keyStrength: 'Illuminates desk workspace with zero glare or reflection on screen',
        mainTradeoff: 'Cannot clamp to laptops (desktop monitors only)',
        rgb: false
      }),
      returnPolicy: '7-day replacement'
    },

    // MONITORS & MOUNTS
    {
      id: 'prod_monitor_25',
      merchantId: merchant.id,
      name: 'TechNova 27-inch 4K UHD Creator Display',
      slug: 'technova-27-inch-4k-uhd-creator-display',
      description: '27-inch 4K UHD (3840x2160) IPS monitor with 99% sRGB color accuracy, HDR400, and 65W USB-C single-cable connectivity.',
      category: 'monitors',
      price: 14999,
      currency: 'INR',
      stock: 12,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        panel: '27" IPS 4K UHD (3840 x 2160) @ 60Hz (Anti-Glare)',
        color: '99% sRGB, 95% DCI-P3, HDR400 Factory Calibrated (Delta E < 2)',
        ports: '1x USB-C (65W PD + DP Alt Mode), 2x HDMI 2.0, 1x DP 1.4, 2x USB 3.0',
        stand: 'Height, Pivot (90°), Swivel, and Tilt Adjustable',
        weight: '5.8 kg',
        compatibility: 'MacBook Pro, Mac Studio, Windows Workstations, Linux',
        warranty: '3 Years On-Site Replacement',
        rating: 4.9,
        reviewsCount: 64,
        bestFor: 'Video Editing, UI/UX Design & High-Density Code Viewing',
        keyStrength: 'Stunning 4K color fidelity with single-cable MacBook power & video',
        mainTradeoff: 'Higher budget tier for professional creators',
        rgb: false
      }),
      returnPolicy: '7-day replacement'
    },
    {
      id: 'prod_monitor_arm_26',
      merchantId: merchant.id,
      name: 'TechNova Heavy-Duty Gas Spring Dual Monitor Arm',
      slug: 'technova-gas-spring-dual-monitor-arm',
      description: 'Heavy-duty counterbalanced dual monitor arm with integrated cable management and 360-degree rotation.',
      category: 'monitors',
      price: 2499,
      currency: 'INR',
      stock: 20,
      active: true,
      agentPurchasable: true,
      attributes: JSON.stringify({
        capacity: 'Dual Screens 17" to 32" (Up to 9kg per arm)',
        vesa: 'VESA 75x75mm and 100x100mm Compatible',
        movement: '360° Rotation, 180° Swivel, +90°/-45° Tilt, 50cm Extension',
        mounting: 'Heavy-Duty C-Clamp & Grommet Mount Included',
        weight: '4.2 kg',
        compatibility: 'All VESA-compliant desktop monitors',
        warranty: '5 Years Mechanical Warranty',
        rating: 4.8,
        reviewsCount: 112,
        bestFor: 'Dual Monitor Productivity & Clean Desk Setup',
        keyStrength: 'Frees up 80% desk surface with effortless gas-spring repositioning',
        mainTradeoff: 'Requires sturdy desk edge for clamp installation',
        rgb: false
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
        'Purchase hardware, peripherals, and accessories for workspace upgrade',
      maxAmount: 25000,
      currency: 'INR',
      allowedCategories: JSON.stringify([
        'keyboard',
        'mouse',
        'audio',
        'webcam',
        'accessories',
        'monitors',
        'workspace'
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