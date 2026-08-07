// src/app/api/posts/[id]/comments/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'GpALjMisbhDjx7IlJcvQaMqIlh9FOyyBrhrIak+mEdU=';

function getUserId(request: Request): string | null {
  const token = request.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    return payload.userId;
  } catch {
    return null;
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const comments = await prisma.comment.findMany({
      where: { postId: id },
      orderBy: { createdAt: 'desc' },
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
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Erreur récupération commentaires :', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const content = body.content;
    const senderName = body.senderName; // Optionnel pour les visiteurs non connectés
    const senderEmail = body.senderEmail; // Optionnel pour les visiteurs non connectés

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Contenu requis' }, { status: 400 });
    }

    if (content.trim().length > 2000) {
      return NextResponse.json({ error: 'Commentaire trop long (max 2000 caractères)' }, { status: 400 });
    }

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: 'Post introuvable' }, { status: 404 });
    }

    // Si un userId est fourni (utilisateur connecté), créer un commentaire lié
    const userId = getUserId(request);
    
    const comment = await prisma.comment.create({
      data: {
        postId: id,
        ...(userId && { userId }),
        ...(!userId && { senderName: senderName || undefined }),
        ...(!userId && { senderEmail: senderEmail || undefined }),
        content: content.trim(),
        // isAnonymous: !userId, // À décommenter après prisma generate
      },
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
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Erreur création commentaire :', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
