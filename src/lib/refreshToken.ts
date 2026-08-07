// src/lib/refreshToken.ts
import crypto from 'crypto';
import prisma from '@/lib/prisma';

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours

function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Génère un nouveau refresh token, le stocke haché en base, et retourne la valeur brute (à donner au client).
 */
export async function issueRefreshToken(userId: string): Promise<string> {
  const rawToken = crypto.randomBytes(48).toString('hex');
  const tokenHash = hashToken(rawToken);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });

  return rawToken;
}

/**
 * Vérifie un refresh token brut. Si valide, le révoque (rotation) et retourne l'utilisateur associé.
 * Retourne null si invalide, expiré, ou déjà révoqué.
 */
export async function consumeRefreshToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);

  const record = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record || record.revokedAt || record.expiresAt < new Date()) {
    return null;
  }

  // Rotation : on révoque l'ancien token dès qu'il est utilisé
  await prisma.refreshToken.update({
    where: { id: record.id },
    data: { revokedAt: new Date() },
  });

  return record.user;
}

/**
 * Révoque un refresh token spécifique (ex: déconnexion).
 */
export async function revokeRefreshToken(rawToken: string): Promise<void> {
  const tokenHash = hashToken(rawToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/**
 * Révoque TOUS les refresh tokens actifs d'un utilisateur (ex: compte bloqué par l'admin).
 */
export async function revokeAllUserRefreshTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
