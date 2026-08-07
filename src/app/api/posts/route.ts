// src/app/api/posts/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET : lister SES PROPRES posts (privé)
export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const posts = await prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error('Erreur lecture posts :', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des posts' }, { status: 500 });
  }
}

// POST : créer un post
export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, content, mediaUrl, mediaType, backgroundColor, linkUrl } = body;

    const postContent = description || content;
    
    if (!postContent) {
      return NextResponse.json(
        { error: 'Description ou contenu est requis' },
        { status: 400 }
      );
    }

    if (postContent.length > 10000) {
      return NextResponse.json(
        { error: 'Le contenu est trop long (maximum 10000 caractères)' },
        { status: 400 }
      );
    }

    if (title && title.length > 200) {
      return NextResponse.json(
        { error: 'Le titre est trop long (maximum 200 caractères)' },
        { status: 400 }
      );
    }

    // Construire l'objet data dynamiquement pour éviter les erreurs Prisma
    const data: {
      userId: string;
      content: string;
      mediaUrl: string | null;
      mediaType: string | null;
      title?: string;
      description?: string;
       backgroundColor?: string;
      linkUrl?: string | null;
    } = {
      userId,
      content: postContent,
      mediaUrl,
      mediaType,
    };
    
    // Ajouter les champs optionnels s'ils existent dans le body
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (backgroundColor !== undefined) data.backgroundColor = backgroundColor;
    if (linkUrl !== undefined) data.linkUrl = linkUrl;

    const post = await prisma.post.create({
      data,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Erreur création post :', error);
    return NextResponse.json({ error: 'Erreur lors de la création du post' }, { status: 500 });
  }
}