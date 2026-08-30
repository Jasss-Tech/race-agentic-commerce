import { z } from 'zod';

export const CreateMandateSchema = z.object({
  userId: z.string().optional().default('usr_buyer_001'),
  agentId: z.string().optional().default('buyer_agent'),
  merchantId: z.string().optional(),
  intent: z.string().min(1, 'Intent description is required').default('purchase'),
  maxAmount: z.number().positive('maxAmount must be a positive number'),
  currency: z.string().default('INR'),
  allowedCategories: z.array(z.string()).default(['keyboard', 'mouse', 'accessories']),
  allowedActions: z.array(z.string()).default(['search', 'compare', 'purchase']),
  confirmationRequired: z.boolean().default(false),
  expiresInMinutes: z.number().int().positive().default(120)
});

export const ValidateMandateSchema = z.object({
  requestedAmount: z.number().positive().optional(),
  category: z.string().optional(),
  action: z.string().default('purchase'),
  currency: z.string().optional(),
  merchantId: z.string().optional()
});

export const EvaluatePolicySchema = z.object({
  mandateId: z.string().min(1, 'Mandate ID is required'),
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive().default(1),
  expectedPrice: z.number().positive().optional(),
  action: z.string().default('purchase'),
  idempotencyKey: z.string().optional()
});

export const EvaluateRiskSchema = z.object({
  mandateId: z.string().min(1, 'Mandate ID is required'),
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive().default(1),
  expectedPrice: z.number().positive().optional()
});

export const BuyerMessageSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  userId: z.string().optional().default('usr_buyer_001'),
  mandateId: z.string().optional()
});

export const BuyerSearchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  maxPrice: z.number().positive().optional()
});

export const BuyerCompareSchema = z.object({
  productIds: z.array(z.string().min(1)).min(1, 'At least one productId is required')
});

export const BuyerCheckoutSchema = z.object({
  mandateId: z.string().min(1, 'Mandate ID is required'),
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive().default(1),
  expectedPrice: z.number().positive().optional(),
  idempotencyKey: z.string().optional(),
  simulateFailure: z.boolean().optional().default(false)
});

export const CreateOrderSchema = z.object({
  userId: z.string().optional().default('usr_buyer_001'),
  merchantId: z.string().min(1, 'Merchant ID is required'),
  mandateId: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1, 'Product ID is required'),
      quantity: z.number().int().positive().default(1),
      unitPrice: z.number().positive('Unit price must be positive')
    })
  ).min(1, 'At least one order item is required'),
  currency: z.string().default('INR'),
  idempotencyKey: z.string().optional()
});

export const CreatePaymentSchema = z.object({
  mandateId: z.string().min(1, 'Mandate ID is required'),
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive().default(1),
  expectedPrice: z.number().positive().optional(),
  idempotencyKey: z.string().optional(),
  simulateFailure: z.boolean().optional().default(false)
});

export const VerifyPaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  razorpayOrderId: z.string().min(1, 'Razorpay Order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Razorpay Payment ID is required'),
  razorpaySignature: z.string().min(1, 'Razorpay Signature is required')
});

export const WebhookPaymentSchema = z.object({
  event: z.string().min(1),
  entity: z.string().optional(),
  contains: z.array(z.string()).optional(),
  payload: z.record(z.unknown()).optional(),
  created_at: z.number().optional()
});

export const CreateProductSchema = z.object({
  merchantId: z.string().optional().default('merch_technova'),
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Product slug is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().positive('Price must be positive'),
  currency: z.string().default('INR'),
  stock: z.number().int().nonnegative().default(10),
  active: z.boolean().default(true),
  agentPurchasable: z.boolean().default(true),
  attributes: z.record(z.unknown()).optional().default({}),
  returnPolicy: z.string().default('7-day replacement policy')
});

export const UpdateProductSchema = z.object({
  price: z.number().positive().optional(),
  stock: z.number().int().nonnegative().optional(),
  active: z.boolean().optional(),
  agentPurchasable: z.boolean().optional(),
  name: z.string().optional(),
  description: z.string().optional()
});

export const GrowthAnalyzeSchema = z.object({
  merchantId: z.string().optional().default('merch_technova')
});

export const VerifyProofSchema = z.object({
  simulateTamper: z.boolean().optional().default(false)
});

export const TamperDemoSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  tamperField: z.string().default('amount'),
  tamperValue: z.unknown().default(99999)
});

export const AIIntentSchema = z.object({
  category: z.string().optional(),
  maxBudget: z.number().positive().optional(),
  currency: z.string().default('INR'),
  action: z.enum(['search', 'compare', 'purchase', 'inquire']).default('search'),
  tool: z.string().optional(),
  preferences: z.array(z.string()).optional().default([])
});
