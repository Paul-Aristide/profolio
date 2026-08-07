// src/app/api/admin/metrics/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/requireAdmin';

export async function GET(request: Request) {
  const forbidden = requireAdmin(request);
  if (forbidden) return forbidden;

  try {
    const days = 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [posts, messages, pageViews, comments] = await Promise.all([
      prisma.post.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
      prisma.message.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
      prisma.pageView.findMany({
        where: { viewedAt: { gte: startDate } },
        select: { viewedAt: true },
      }),
      prisma.comment.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
    ]);

    const byDay = (items: Date[]) => {
      const map: Record<string, number> = {};
      items.forEach((d) => {
        const day = new Date(d).toISOString().split('T')[0];
        map[day] = (map[day] || 0) + 1;
      });
      return Object.entries(map)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
    };

    const totalMessages = await prisma.message.count();
    const totalPosts = await prisma.post.count();
    const totalPageViews = await prisma.pageView.count();
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { isBlocked: false } });
    const blockedUsers = await prisma.user.count({ where: { isBlocked: true } });
    const pendingReports = await prisma.report.count({ where: { status: 'pending' } });

    return NextResponse.json({
      postsByDay: byDay(posts.map((p) => p.createdAt)),
      messagesByDay: byDay(messages.map((m) => m.createdAt)),
      viewsByDay: byDay(pageViews.map((v) => v.viewedAt)),
      commentsByDay: byDay(comments.map((c) => c.createdAt)),
      totals: {
        users: totalUsers,
        activeUsers,
        blockedUsers,
        posts: totalPosts,
        messages: totalMessages,
        pageViews: totalPageViews,
        comments: await prisma.comment.count(),
        pendingReports,
      },
    });
  } catch (error) {
    console.error('Erreur metrics admin :', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
