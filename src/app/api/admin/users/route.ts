// src/app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/requireAdmin';

export async function GET(request: Request) {
  const forbidden = requireAdmin(request);
  if (forbidden) return forbidden;

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isBlocked: true,
        isProtected: true,
        blockedAt: true,
        createdAt: true,
        pageViews: {
          select: { id: true },
        },
      },
    });

    const result = users.map(u => ({
      ...u,
      pageViewsCount: u.pageViews?.length || 0,
    }));

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Erreur lecture utilisateurs :', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des utilisateurs' }, { status: 500 });
  }
}
