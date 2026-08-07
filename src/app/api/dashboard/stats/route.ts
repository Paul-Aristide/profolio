// src/app/api/dashboard/stats/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const [profileCount, formationsCount, skillsCount, postsCount, messagesReceivedCount, commentsCount, viewsCount, viewsLast7Days, viewsLast30Days, followersCount] = await Promise.all([
      prisma.profile.count({ where: { userId } }),
      prisma.formation.count({ where: { userId } }),
      prisma.skill.count({ where: { userId } }),
      prisma.post.count({ where: { userId } }),
      prisma.message.count({ where: { receiverId: userId } }),
      prisma.message.count({ where: { receiverId: userId } }),
      prisma.pageView.count({ where: { userId } }),
      prisma.pageView.count({
        where: {
          userId,
          viewedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.pageView.count({
        where: {
          userId,
          viewedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.follower.count({ where: { userId } }),
    ]);

    const recentMessages = await prisma.message.findMany({
      where: { receiverId: userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        createdAt: true,
        senderName: true,
        senderEmail: true,
        sender: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    const recentPosts = await prisma.post.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      profile: profileCount,
      formations: formationsCount,
      skills: skillsCount,
      posts: postsCount,
      messagesReceived: messagesReceivedCount,
      comments: commentsCount,
      views: viewsCount,
      viewsLast7Days,
      viewsLast30Days,
      followers: followersCount,
      recentMessages,
      recentPosts,
    });
  } catch (error) {
    console.error('Erreur stats dashboard :', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
