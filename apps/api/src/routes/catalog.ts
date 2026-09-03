import { FastifyInstance } from 'fastify';
import { prisma } from '../prisma';

function parseAttributes(attr: any) {
  if (!attr) return {};
  if (typeof attr === 'object') return attr;
  try {
    return JSON.parse(attr);
  } catch {
    return {};
  }
}

export async function catalogRoutes(app: FastifyInstance) {
  // Human & UI catalog
  app.get('/api/catalog', async () => {
    const products = await prisma.product.findMany({
      include: { merchant: true, inventory: true }
    });

    return products.map(p => ({
      id: p.id,
      merchantId: p.merchantId,
      name: p.name,
      slug: p.slug,
      description: p.description,
      category: p.category,
      price: p.price,
      currency: p.currency,
      stock: p.stock,
      active: p.active,
      agentPurchasable: p.agentPurchasable,
      attributes: parseAttributes(p.attributes),
      returnPolicy: p.returnPolicy,
      merchantName: p.merchant.name,
      merchantTrustScore: p.merchant.trustScore,
      inventory: p.inventory ? {
        available: p.inventory.available,
        reserved: p.inventory.reserved,
        sold: p.inventory.sold
      } : undefined
    }));
  });

  app.get('/api/catalog/products', async () => {
    const products = await prisma.product.findMany({
      include: { merchant: true, inventory: true }
    });

    return products.map(p => ({
      id: p.id,
      merchantId: p.merchantId,
      name: p.name,
      slug: p.slug,
      description: p.description,
      category: p.category,
      price: p.price,
      currency: p.currency,
      stock: p.stock,
      active: p.active,
      agentPurchasable: p.agentPurchasable,
      attributes: parseAttributes(p.attributes),
      returnPolicy: p.returnPolicy,
      merchantName: p.merchant.name,
      merchantTrustScore: p.merchant.trustScore,
      inventory: p.inventory ? {
        available: p.inventory.available,
        reserved: p.inventory.reserved,
        sold: p.inventory.sold
      } : undefined
    }));
  });

  app.get('/api/catalog/products/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const product = await prisma.product.findUnique({
      where: { id },
      include: { merchant: true, inventory: true }
    });

    if (!product) {
      return reply.status(404).send({
        error: { code: 'PRODUCT_NOT_FOUND', message: `Product with ID '${id}' not found.` }
      });
    }

    return {
      id: product.id,
      merchantId: product.merchantId,
      name: product.name,
      slug: product.slug,
      description: product.description,
      category: product.category,
      price: product.price,
      currency: product.currency,
      stock: product.stock,
      active: product.active,
      agentPurchasable: product.agentPurchasable,
      attributes: parseAttributes(product.attributes),
      returnPolicy: product.returnPolicy,
      merchantName: product.merchant.name,
      merchantTrustScore: product.merchant.trustScore,
      inventory: product.inventory ? {
        available: product.inventory.available,
        reserved: product.inventory.reserved,
        sold: product.inventory.sold
      } : undefined
    };
  });

  // Machine-Readable Agent Commerce Feed (ACP Specification)
  app.get('/api/catalog/agent-feed', async () => {
    const products = await prisma.product.findMany({
      where: { active: true },
      include: { merchant: true, inventory: true }
    });

    return {
      protocol: 'RACE-ACP/v1.0',
      generated_at: new Date().toISOString(),
      catalog_hash: `sha256-${products.length}-${Date.now()}`,
      products: products.map(p => ({
        product_id: p.id,
        merchant_id: p.merchantId,
        merchant_name: p.merchant.name,
        name: p.name,
        slug: p.slug,
        description: p.description,
        category: p.category,
        pricing: {
          amount: p.price,
          currency: p.currency
        },
        availability: {
          in_stock: p.stock > 0,
          quantity: p.stock,
          inventory_available: p.inventory?.available ?? p.stock
        },
        attributes: JSON.parse(p.attributes || '{}'),
        commerce: {
          purchasable_by_agent: p.agentPurchasable,
          returnable: true,
          return_policy: p.returnPolicy,
          max_delegated_quantity: Math.min(5, p.stock)
        },
        updated_at: p.updatedAt.toISOString()
      }))
    };
  });
}
