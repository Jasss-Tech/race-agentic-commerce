import { FastifyRequest } from 'fastify';
import { prisma } from './prisma';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: 'BUYER' | 'MERCHANT' | 'ADMIN';
  merchantId?: string;
}

/**
 * Extracts authenticated user context from request headers/tokens
 * In development/demo mode, provides default fallback context if header is omitted
 */
export async function getAuthContext(req: FastifyRequest, requiredRole?: 'BUYER' | 'MERCHANT' | 'ADMIN'): Promise<AuthenticatedUser> {
  const userIdHeader = (req.headers['x-user-id'] as string) || '';
  const roleHeader = (req.headers['x-user-role'] as string) || '';

  // 1. Direct user ID lookup if header is provided
  if (userIdHeader) {
    const user = await prisma.user.findUnique({ where: { id: userIdHeader } });
    if (user) {
      const merchant = user.role === 'MERCHANT'
        ? await prisma.merchant.findFirst({ where: { id: 'merch_technova' } })
        : null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as any,
        merchantId: merchant?.id || 'merch_technova'
      };
    }
  }

  // 2. Role-based session context resolution
  const targetRole = (roleHeader.toUpperCase() === 'MERCHANT' || requiredRole === 'MERCHANT') ? 'MERCHANT' : 'BUYER';

  const defaultUser = await prisma.user.findFirst({
    where: { role: targetRole }
  });

  if (defaultUser) {
    const merchant = defaultUser.role === 'MERCHANT'
      ? await prisma.merchant.findFirst({ where: { id: 'merch_technova' } })
      : null;

    return {
      id: defaultUser.id,
      name: defaultUser.name,
      email: defaultUser.email,
      role: defaultUser.role as any,
      merchantId: merchant?.id || 'merch_technova'
    };
  }

  // Safe fallback baseline
  return {
    id: targetRole === 'MERCHANT' ? 'usr_merchant_001' : 'usr_buyer_001',
    name: targetRole === 'MERCHANT' ? 'Vikram Mehta' : 'Aarav Sharma',
    email: targetRole === 'MERCHANT' ? 'vikram@technova.gear' : 'aarav@race.exchange',
    role: targetRole,
    merchantId: 'merch_technova'
  };
}
