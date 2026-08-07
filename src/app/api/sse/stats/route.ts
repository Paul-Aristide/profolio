// src/app/api/sse/stats/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET_FALLBACK = 'GpALjMisbhDjx7IlJcvQaMqIlh9FOyyBrhrIak+mEdU=';

function getUserIdFromCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/token=([^;]+)/);
  if (!match) return null;
  try {
    const payload = jwt.verify(match[1], process.env.JWT_SECRET || JWT_SECRET_FALLBACK) as { userId: string };
    return payload.userId;
  } catch {
    return null;
  }
}

async function getStats(userId: string) {
  const [
    postsCount,
    messagesReceivedCount,
    commentsCount,
    viewsCount,
    viewsLast7Days,
    followersCount,
  ] = await Promise.all([
    prisma.post.count({ where: { userId } }),
    prisma.message.count({ where: { receiverId: userId } }),
    prisma.comment.count({ where: { post: { userId } } }),
    prisma.pageView.count({ where: { userId } }),
    prisma.pageView.count({
      where: {
        userId,
        viewedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.follower.count({ where: { userId } }),
  ]);

  return {
    posts: postsCount,
    messagesReceived: messagesReceivedCount,
    comments: commentsCount,
    views: viewsCount,
    viewsLast7Days,
    followers: followersCount,
    timestamp: new Date().toISOString(),
  };
}

export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id') || getUserIdFromCookie(request);
  if (!userId) {
    return new NextResponse(null, { status: 401 });
  }

  let intervalId: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const sendStats = async () => {
        try {
          const stats = await getStats(userId);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(stats)}\n\n`));
        } catch {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'stats_error' })}\n\n`));
        }
      };

      await sendStats();
      intervalId = setInterval(sendStats, 10000);
    },
    cancel() {
      if (intervalId) clearInterval(intervalId);
    },
  });

  request.signal?.addEventListener('abort', () => {
    if (intervalId) clearInterval(intervalId);
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
