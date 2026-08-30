import fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { prisma } from './prisma';
import { authRoutes } from './routes/auth';
import { catalogRoutes } from './routes/catalog';
import { agentRoutes } from './routes/agents';
import { mandateRoutes } from './routes/mandates';
import { policyRoutes } from './routes/policies';
import { riskRoutes } from './routes/risk';
import { paymentRoutes } from './routes/payments';
import { orderRoutes } from './routes/orders';
import { merchantRoutes } from './routes/merchant';
import { growthRoutes } from './routes/growth';
import { auditRoutes } from './routes/audit';
import { proofRoutes } from './routes/proofs';
import { demoRoutes } from './routes/demo';

dotenv.config();

const app = fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  }
});

async function start() {
  await app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  });

  // Health check endpoint (Unauthenticated with DB connectivity status)
  app.get('/health', async (req, reply) => {
    let dbStatus = 'connected';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'disconnected';
    }

    return {
      status: 'ok',
      service: 'RACE-Agentic-Commerce-API',
      version: '1.0.0',
      database: dbStatus,
      paymentProvider: process.env.PAYMENT_PROVIDER || 'mock',
      aiProvider: process.env.AI_PROVIDER || 'deterministic',
      timestamp: new Date().toISOString()
    };
  });

  // Register all domain routes
  await app.register(authRoutes);
  await app.register(catalogRoutes);
  await app.register(agentRoutes);
  await app.register(mandateRoutes);
  await app.register(policyRoutes);
  await app.register(riskRoutes);
  await app.register(paymentRoutes);
  await app.register(orderRoutes);
  await app.register(merchantRoutes);
  await app.register(growthRoutes);
  await app.register(auditRoutes);
  await app.register(proofRoutes);
  await app.register(demoRoutes);

  const port = parseInt(process.env.API_PORT || process.env.PORT || '4000', 10);
  const host = '0.0.0.0';

  try {
    await app.listen({ port, host });
    console.log(`\n🚀 RACE Agentic Commerce API running on http://localhost:${port}\n`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
