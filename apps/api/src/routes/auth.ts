import { FastifyInstance } from 'fastify';
import { prisma } from '../prisma';

export async function authRoutes(app: FastifyInstance) {
  // Get current authenticated user
  app.get('/api/auth/me', async (req, reply) => {
    const user = await prisma.user.findFirst({
      where: { role: 'BUYER' }
    });

    if (!user) {
      return reply.status(404).send({
        error: { code: 'USER_NOT_FOUND', message: 'No buyer profile found.' }
      });
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString()
    };
  });

  // Create demo / auth session
  app.post('/api/auth/session', async (req, reply) => {
    const body = (req.body as { role?: string }) || {};
    const role = body.role === 'MERCHANT' ? 'MERCHANT' : 'BUYER';

    const user = await prisma.user.findFirst({
      where: { role }
    });

    return {
      authenticated: true,
      user: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      } : {
        id: role === 'MERCHANT' ? 'usr_merchant_001' : 'usr_buyer_001',
        name: role === 'MERCHANT' ? 'Vikram Mehta' : 'Aarav Sharma',
        email: role === 'MERCHANT' ? 'vikram@technova.gear' : 'aarav@race.exchange',
        role
      },
      token: `race_sess_${role.toLowerCase()}_token`
    };
  });
}
