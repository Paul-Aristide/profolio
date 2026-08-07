// src/app/api/pageviews/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { targetUserId } = await request.json();

    if (!targetUserId) {
      return NextResponse.json({ error: 'targetUserId requis' }, { status: 400 });
    }

    const visitorIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;
    const referrer = request.headers.get('referer') || undefined;

    await prisma.pageView.create({
      data: {
        userId: targetUserId,
        visitorIp: visitorIp.split(',')[0].trim(),
        userAgent,
        referrer,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Erreur enregistrement visite :', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const days = parseInt(url.searchParams.get('days') || '30', 10);

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const views = await prisma.pageView.findMany({
      where: {
        userId,
        viewedAt: { gte: startDate },
      },
      select: {
        viewedAt: true,
        visitorIp: true,
        referrer: true,
      },
      orderBy: { viewedAt: 'asc' },
    });

    // Grouper par jour
    const byDay: Record<string, number> = {};
    for (const v of views) {
      const day = new Date(v.viewedAt).toISOString().split('T')[0];
      byDay[day] = (byDay[day] || 0) + 1;
    }

    return NextResponse.json({
      total: views.length,
      uniqueVisitors: new Set(views.map((v) => v.visitorIp).filter((ip): ip is string => Boolean(ip))).size,
      byDay: Object.entries(byDay).map(([date, count]) => ({ date, count })),
    });
  } catch (error) {
    console.error('Erreur récupération visites :', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
