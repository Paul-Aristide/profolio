// src/app/api/dashboard/comments/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const comments = await prisma.comment.findMany({
      where: {
        post: {
          userId,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Erreur récupération commentaires :', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
