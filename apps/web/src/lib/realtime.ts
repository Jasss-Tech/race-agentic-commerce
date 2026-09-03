'use client';

import { RealtimeActivityEvent } from '@race/types';

type EventListener = (event: RealtimeActivityEvent) => void;

class RealtimeEventBus {
  private listeners: Set<EventListener> = new Set();
  private history: RealtimeActivityEvent[] = [];
  private isAutoGenerating: boolean = false;
  private intervalId: any = null;

  constructor() {
    // Seed initial realistic baseline history
    const now = Date.now();
    this.history = [
      {
        id: 'evt_init_1',
        timestamp: new Date(now - 120000).toLocaleTimeString(),
        eventType: 'USER_VIEW',
        actorName: 'Aarav S. (Returning)',
        actorRole: 'CUSTOMER',
        description: 'Viewed TechNova Mechanical Keyboard Pro (3rd view in 7d)',
        badgeType: 'info'
      },
      {
        id: 'evt_init_2',
        timestamp: new Date(now - 90000).toLocaleTimeString(),
        eventType: 'CART_ADD',
        actorName: 'Aarav S.',
        actorRole: 'CUSTOMER',
        description: 'Added TechNova Ergonomic Memory Foam Wrist Rest to delegated cart',
        badgeType: 'success'
      },
      {
        id: 'evt_init_3',
        timestamp: new Date(now - 60000).toLocaleTimeString(),
        eventType: 'CHECKOUT_AUTHORIZED',
        actorName: 'RACE Policy Engine',
        actorRole: 'POLICY_ENGINE',
        description: 'Approved purchase intent ₹2,698 within mandate ₹2,500 + 15% growth campaign',
        badgeType: 'purple'
      },
      {
        id: 'evt_init_4',
        timestamp: new Date(now - 30000).toLocaleTimeString(),
        eventType: 'ORDER_PAID',
        actorName: 'Razorpay Gateway',
        actorRole: 'MERCHANT',
        description: 'Payment captured ₹2,698 · SHA-256 block sealed #a9f4c082',
        badgeType: 'success'
      },
      {
        id: 'evt_init_5',
        timestamp: new Date(now - 10000).toLocaleTimeString(),
        eventType: 'ANOMALY_DETECTED',
        actorName: 'Analytics Sentinel Agent',
        actorRole: 'GROWTH_AGENT',
        description: 'Detected +24% conversion surge on Mechanical Keyboard Bundle',
        badgeType: 'warning'
      }
    ];
  }

  public subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getHistory(): RealtimeActivityEvent[] {
    return [...this.history];
  }

  public publish(event: Omit<RealtimeActivityEvent, 'id' | 'timestamp'> & { timestamp?: string }) {
    const newEvent: RealtimeActivityEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: event.timestamp || new Date().toLocaleTimeString(),
      ...event
    };

    this.history = [newEvent, ...this.history].slice(0, 50); // keep last 50
    this.listeners.forEach((listener) => {
      try {
        listener(newEvent);
      } catch (err) {
        console.error('Error in realtime listener', err);
      }
    });
  }

  public startDemoStream() {
    if (this.isAutoGenerating) return;
    this.isAutoGenerating = true;

    const scenarios = [
      {
        eventType: 'USER_VIEW' as const,
        actorName: 'Priya K. (High-Value)',
        actorRole: 'CUSTOMER' as const,
        description: 'Inspected TechNova 7-in-1 USB-C Hub specs',
        badgeType: 'info' as const
      },
      {
        eventType: 'USER_SEARCH' as const,
        actorName: 'Rohan D.',
        actorRole: 'CUSTOMER' as const,
        description: 'Queried Buyer Agent: "wireless ergonomic setup under 3000"',
        badgeType: 'info' as const
      },
      {
        eventType: 'INTENT_MANDATE_CREATED' as const,
        actorName: 'Rohan D.',
        actorRole: 'CUSTOMER' as const,
        description: 'Bound autonomous mandate cap ₹3,000 INR for keyboard/audio',
        badgeType: 'purple' as const
      },
      {
        eventType: 'INVENTORY_THRESHOLD' as const,
        actorName: 'Inventory Sentinel',
        actorRole: 'MERCHANT' as const,
        description: 'TechNova Keyboard Pro inventory remaining: 19 units',
        badgeType: 'warning' as const
      },
      {
        eventType: 'ORDER_PAID' as const,
        actorName: 'Razorpay Delegated Pay',
        actorRole: 'MERCHANT' as const,
        description: 'Order paid ₹3,299 · SHA-256 block #5f1b89c3 valid',
        badgeType: 'success' as const
      }
    ];

    let idx = 0;
    this.intervalId = setInterval(() => {
      const scenario = scenarios[idx % scenarios.length];
      idx++;
      this.publish(scenario);
    }, 12000); // realistic gentle cadence
  }

  public stopDemoStream() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isAutoGenerating = false;
  }
}

export const realtimeBus = new RealtimeEventBus();
