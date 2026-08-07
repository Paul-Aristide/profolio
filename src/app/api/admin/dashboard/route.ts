// src/app/api/admin/dashboard/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/requireAdmin';

export async function GET(request: Request) {
  const forbidden = requireAdmin(request);
  if (forbidden) return forbidden;

  try {
    const [
      totalUsers,
      activeUsers,
      blockedUsers,
      totalPosts,
      totalMessages,
      totalPageViews,
       pendingReports,
      totalFollowers,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isBlocked: false } }),
      prisma.user.count({ where: { isBlocked: true } }),
      prisma.post.count(),
      prisma.message.count(),
      prisma.pageView.count(),
      prisma.report.count({ where: { status: 'pending' } }),
      prisma.follower.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isBlocked: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      activeUsers,
      blockedUsers,
      totalPosts,
      totalMessages,
      totalPageViews,
      pendingReports,
      totalFollowers,
      recentUsers,
    });
  } catch (error) {
    console.error('Erreur dashboard admin :', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
