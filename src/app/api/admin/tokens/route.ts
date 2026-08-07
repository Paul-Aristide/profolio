// src/app/api/admin/tokens/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/requireAdmin';
import crypto from 'crypto';

// GET : lister tous les tokens d'invitation (métadonnées uniquement)
export async function GET(request: Request) {
  const forbidden = requireAdmin(request);
  if (forbidden) return forbidden;

  try {
    const tokens = await prisma.adminToken.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        expiresAt: true,
        usedAt: true,
        usedByEmail: true,
        createdAt: true,
      },
    });

    return NextResponse.json(tokens, { status: 200 });
  } catch (error) {
    console.error('Erreur lecture tokens :', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des tokens' }, { status: 500 });
  }
}

// POST : générer un nouveau token d'invitation à usage unique
export async function POST(request: Request) {
  const forbidden = requireAdmin(request);
  if (forbidden) return forbidden;

  try {
    const adminUserId = request.headers.get('x-user-id');
    const { expiresInDays } = await request.json().catch(() => ({}));

    const days = Number(expiresInDays) > 0 ? Number(expiresInDays) : 7; // 7 jours par défaut

    const rawToken = crypto.randomBytes(16).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const adminToken = await prisma.adminToken.create({
      data: {
        token: tokenHash,
        expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
        createdByUser: adminUserId,
      },
    });

    return NextResponse.json(
      { ...adminToken, token: rawToken }, // retourne le token RAW une seule fois
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur création token :', error);
    return NextResponse.json({ error: 'Erreur lors de la création du token' }, { status: 500 });
  }
}
