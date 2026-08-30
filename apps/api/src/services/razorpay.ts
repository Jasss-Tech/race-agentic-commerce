import crypto from 'crypto';
import Razorpay from 'razorpay';
import { RazorpayOrderCreateResponse } from '@race/types';

export class RazorpayService {
  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;
  private provider: 'razorpay' | 'mock';
  private client: Razorpay | null = null;

  constructor() {
    this.provider = (process.env.PAYMENT_PROVIDER || 'mock') as 'razorpay' | 'mock';
    this.keyId = process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'race_webhook_secret_default';

    if (this.provider === 'razorpay') {
      if (!this.keyId || !this.keySecret) {
        console.warn('⚠️ PAYMENT_PROVIDER=razorpay requested but RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing. Please configure credentials in .env.');
      } else {
        this.client = new Razorpay({
          key_id: this.keyId,
          key_secret: this.keySecret
        });
      }
    }
  }

  public getProvider(): 'razorpay' | 'mock' {
    return this.provider;
  }

  public getKeyId(): string {
    return this.keyId || (this.provider === 'mock' ? 'rzp_mock_key_public' : '');
  }

  public isMockMode(): boolean {
    return this.provider === 'mock' || !this.client;
  }

  /**
   * Creates an Order on Razorpay Test Mode gateway (or Mock Gateway if configured)
   * Amount must be in the smallest currency unit (paise for INR).
   */
  public async createOrder(params: {
    amountInRupees: number;
    receipt: string;
    notes?: Record<string, string>;
  }): Promise<RazorpayOrderCreateResponse> {
    const amountInPaise = Math.round(params.amountInRupees * 100);

    // If real Razorpay provider configured with valid credentials
    if (this.provider === 'razorpay' && this.client) {
      try {
        const order = await this.client.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: params.receipt,
          notes: params.notes || {}
        });

        return {
          id: order.id,
          entity: 'order',
          amount: Number(order.amount),
          amount_paid: Number(order.amount_paid || 0),
          amount_due: Number(order.amount_due || order.amount),
          currency: order.currency,
          receipt: order.receipt || params.receipt,
          status: (order.status as any) || 'created',
          attempts: Number(order.attempts || 0),
          notes: (order.notes as any) || {},
          created_at: Number(order.created_at || Math.floor(Date.now() / 1000)),
          isMockProvider: false
        };
      } catch (err: any) {
        console.error('Razorpay API order creation failed:', err.message);
        throw new Error(`Razorpay Gateway API Error: ${err.message}`);
      }
    }

    // Mock Gateway Mode
    const orderId = `order_mock_${crypto.randomBytes(8).toString('hex')}`;
    return {
      id: orderId,
      entity: 'order',
      amount: amountInPaise,
      amount_paid: 0,
      amount_due: amountInPaise,
      currency: 'INR',
      receipt: params.receipt,
      status: 'created',
      attempts: 0,
      notes: params.notes || {},
      created_at: Math.floor(Date.now() / 1000),
      isMockProvider: true
    };
  }

  /**
   * Fetches payment details from Razorpay gateway for server-side verification
   */
  public async fetchPayment(paymentId: string): Promise<{ id: string; amount: number; currency: string; status: string } | null> {
    if (this.provider === 'razorpay' && this.client) {
      try {
        const payment = await this.client.payments.fetch(paymentId);
        return {
          id: payment.id,
          amount: Number(payment.amount),
          currency: payment.currency,
          status: payment.status
        };
      } catch (err: any) {
        console.error('Razorpay fetchPayment failed:', err.message);
        return null;
      }
    }
    return null;
  }

  /**
   * Generates a valid test signature for automated integration tests or mock mode
   */
  public generateTestSignature(razorpayOrderId: string, razorpayPaymentId: string): string {
    const secret = this.keySecret || 'race_secret_agentic_exchange';
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    return crypto.createHmac('sha256', secret).update(body).digest('hex');
  }

  /**
   * Verifies Razorpay payment signature according to official Razorpay specifications
   * Verification must require: razorpay_order_id, razorpay_payment_id, razorpay_signature
   */
  public verifyPaymentSignature(params: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): boolean {
    if (!params.razorpayOrderId || !params.razorpayPaymentId || !params.razorpaySignature) {
      return false;
    }

    const secret = this.keySecret || 'race_secret_agentic_exchange';
    const body = `${params.razorpayOrderId}|${params.razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    try {
      const expectedBuffer = Buffer.from(expectedSignature);
      const actualBuffer = Buffer.from(params.razorpaySignature);

      if (expectedBuffer.length !== actualBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
    } catch {
      return false;
    }
  }

  /**
   * Verifies Razorpay webhook signature against raw body string
   */
  public verifyWebhookSignature(rawBodyString: string, signature: string): boolean {
    if (!signature || !rawBodyString) return false;

    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(rawBodyString)
      .digest('hex');

    try {
      const expectedBuffer = Buffer.from(expectedSignature);
      const actualBuffer = Buffer.from(signature);

      if (expectedBuffer.length !== actualBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
    } catch {
      return false;
    }
  }
}

export const razorpayService = new RazorpayService();
