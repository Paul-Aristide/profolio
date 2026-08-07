// src/app/api/admin/tokens/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/requireAdmin';
import crypto from 'crypto';

// POST : régénérer un token expiré (le token brut est retourné une seule fois)
// Le nouveau token remplace l'ancien — l'ancien hash devient invalide.
// Si le token avait déjà été utilisé, il ne peut pas être régénéré.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = requireAdmin(request);
  if (forbidden) return forbidden;

  try {
    const { id } = await params;

    const existingToken = await prisma.adminToken.findUnique({
      where: { id },
    });

    if (!existingToken) {
      return NextResponse.json(
        { error: 'Token introuvable' },
        { status: 404 }
      );
    }

    if (existingToken.usedAt) {
      return NextResponse.json(
        { error: 'Ce token a déjà été utilisé. Impossible de le régénérer.' },
        { status: 400 }
      );
    }

    const isExpired = existingToken.expiresAt < new Date();

    const { expiresInDays } = await request.json().catch(() => ({}));
    const days = Number(expiresInDays) > 0 ? Number(expiresInDays) : 7;

    const rawToken = crypto.randomBytes(16).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const updatedToken = await prisma.adminToken.update({
      where: { id },
      data: {
        token: tokenHash,
        expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
        // Reset usage state since this is a fresh token
        usedAt: null,
        usedByEmail: null,
      },
    });

    return NextResponse.json(
      {
        id: updatedToken.id,
        token: rawToken, // retourné une seule fois, en clair
        expiresAt: updatedToken.expiresAt,
        createdAt: updatedToken.createdAt,
        wasExpired: isExpired,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur régénération token :', error);
    return NextResponse.json(
      { error: 'Erreur lors de la régénération du token' },
      { status: 500 }
    );
  }
}
