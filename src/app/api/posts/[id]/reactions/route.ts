// src/app/api/posts/[id]/reactions/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getClientIp, checkRateLimit } from '@/lib/rateLimit';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'SuperSecretProFolio2026!NePasPartager';

const REACTION_TYPES = ['like', 'upvote', 'downvote', 'favorite'] as const;
const ANON_SESSION_COOKIE = 'profolio_session_id';

type ReactionType = (typeof REACTION_TYPES)[number];

function getUserIdFromCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/token=([^;]+)/);
  if (!match) return null;
  try {
    const payload = jwt.verify(match[1], JWT_SECRET) as { userId: string };
    return payload.userId;
  } catch {
    return null;
  }
}

function getAnonymousSessionId(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${ANON_SESSION_COOKIE}=([^;]+)`));
  return match ? match[1] : null;
}

function createAnonymousSessionId(): string {
  return crypto.randomBytes(16).toString('hex');
}

function setSessionCookie(res: NextResponse, sessionId: string) {
  res.cookies.set(ANON_SESSION_COOKIE, sessionId, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;

    const reactions = await prisma.reaction.findMany({
      where: { postId },
      select: { type: true },
    });

    const counts: Record<ReactionType, number> = {
      like: 0,
      upvote: 0,
      downvote: 0,
      favorite: 0,
    };

    reactions.forEach((r) => {
      if (r.type in counts) {
        counts[r.type as ReactionType]++;
      }
    });

    const userId = getUserIdFromCookie(request);
    const sessionId = userId ? null : getAnonymousSessionId(request);

    let userReactions: ReactionType[] = [];

    if (userId || sessionId) {
      const userReactionRows = await prisma.reaction.findMany({
        where: {
          postId,
          ...(userId ? { userId } : { sessionId }),
        },
        select: { type: true },
      });
      userReactions = userReactionRows.map((r) => r.type as ReactionType);
    }

    return NextResponse.json({
      success: true,
      counts,
      total: reactions.length,
      userReactions,
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur récupération réactions :', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des réactions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`reactions:${ip}`, 120, 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez plus tard.' },
      { status: 429 }
    );
  }

  try {
    const { id: postId } = await params;
    const { type } = await request.json();

    if (!REACTION_TYPES.includes(type as ReactionType)) {
      return NextResponse.json(
        { error: 'Type de réaction invalide' },
        { status: 400 }
      );
    }

    const userId = getUserIdFromCookie(request);
    let sessionId = userId ? null : getAnonymousSessionId(request);

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json(
        { error: 'Publication introuvable' },
        { status: 404 }
      );
    }

    const isNewSession = !userId && !sessionId;
    if (isNewSession) {
      sessionId = createAnonymousSessionId();
    }

    const whereClause: { postId: string; type: string; userId?: string; sessionId?: string } = {
      postId,
      type,
    };
    if (userId) {
      whereClause.userId = userId;
    } else {
      whereClause.sessionId = sessionId!;
    }

    const existingReaction = await prisma.reaction.findFirst({
      where: whereClause,
    });

    let response: NextResponse;

    if (existingReaction) {
      await prisma.reaction.delete({ where: { id: existingReaction.id } });
      response = NextResponse.json(
        { success: true, action: 'removed', type },
        { status: 200 }
      );
    } else {
      await prisma.reaction.create({
        data: {
          postId,
          userId,
          sessionId,
          type,
        },
      });
      response = NextResponse.json(
        { success: true, action: 'added', type },
        { status: 201 }
      );
    }

    if (isNewSession && sessionId) {
      setSessionCookie(response, sessionId);
    }

    return response;
  } catch (error) {
    console.error('Erreur réaction :', error);
    return NextResponse.json(
      { error: 'Erreur lors de la réaction' },
      { status: 500 }
    );
  }
}
