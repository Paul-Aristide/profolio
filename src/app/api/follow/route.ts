// src/app/api/follow/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getClientIp, checkRateLimit } from '@/lib/rateLimit';

export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const url = new URL(request.url);
  const targetUserId = url.searchParams.get('targetUserId');

  if (!targetUserId) {
    return NextResponse.json({ error: 'targetUserId requis' }, { status: 400 });
  }

  const follow = await prisma.follower.findUnique({
    where: { userId_followerId: { userId: targetUserId, followerId: userId } },
  });

  return NextResponse.json({ following: !!follow });
}

export async function POST(request: Request) {  const ip = getClientIp(request);
  const rl = checkRateLimit(`follow:${ip}`, 60, 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez plus tard.' },
      { status: 429 }
    );
  }

  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { targetUserId, action } = await request.json();

    if (!targetUserId || action !== 'follow' && action !== 'unfollow') {
      return NextResponse.json(
        { error: 'targetUserId et action (follow/unfollow) requis' },
        { status: 400 }
      );
    }

    if (targetUserId === userId) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas suivre votre propre profil' },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    if (action === 'follow') {
      try {
        await prisma.follower.create({
          data: { userId: targetUserId, followerId: userId },
        });
        return NextResponse.json({ success: true, action: 'followed' }, { status: 201 });
      } catch {
        return NextResponse.json({ success: true, alreadyFollowing: true }, { status: 200 });
      }
    }

    await prisma.follower.deleteMany({
      where: { userId: targetUserId, followerId: userId },
    });
    return NextResponse.json({ success: true, action: 'unfollowed' }, { status: 200 });
  } catch (error) {
    console.error('Erreur follow :', error);
    return NextResponse.json({ error: 'Erreur lors du suivi' }, { status: 500 });
  }
}
