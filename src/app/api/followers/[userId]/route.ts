// src/app/api/followers/[userId]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const take = Math.min(parseInt(url.searchParams.get('take') || '20', 10), 50);
    const skip = (page - 1) * take;

    const [followers, count] = await Promise.all([
      prisma.follower.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          createdAt: true,
          follower: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profile: { select: { profilePhoto: true, expertise: true } },
            },
          },
        },
      }),
      prisma.follower.count({ where: { userId } }),
    ]);

    return NextResponse.json({
      followers: followers.map(f => f.follower),
      total: count,
      page,
      pages: Math.ceil(count / take),
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur récupération abonnés :', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
