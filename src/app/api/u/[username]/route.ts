// src/app/api/u/[username]/route.ts
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
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        birthDate: true,
        birthPlace: true,
        isBlocked: true,
        profile: true,
        formations: true,
        experiences: { orderBy: { startDate: 'desc' } },
        skills: true,
        posts: { orderBy: { createdAt: 'desc' } },
        agendaEvents: { orderBy: { startTime: 'asc' } },
        pageViews: { select: { id: true } },
        followers: { select: { id: true } },
      },
    });

    // On ne renvoie jamais isBlocked au visiteur, c'est une info interne
    if (!user) {
      return NextResponse.json({ error: 'Portfolio introuvable' }, { status: 404 });
    }

    const { isBlocked, pageViews, followers, ...publicData } = user;

    return NextResponse.json({
      ...publicData,
      totalViews: pageViews.length,
      totalFollowers: followers.length,
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur lecture portfolio public :', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du portfolio' },
      { status: 500 }
    );
  }
}
