// src/app/api/u/[username]/posts/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, isBlocked: true },
    });

    if (!user || user.isBlocked) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    const posts = await prisma.post.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error('Erreur lecture posts publics :', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des posts' }, { status: 500 });
  }
}
