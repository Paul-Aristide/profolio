// src/app/api/posts/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PUT : modifier un post
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Post introuvable' }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, content, mediaUrl, mediaType, backgroundColor, linkUrl } = body;

    // Utiliser description si disponible, sinon content
    const postContent = description || content;

    // Construire l'objet data dynamiquement
    const data: {
      content: string;
      mediaUrl: string | null;
      mediaType: string | null;
      title?: string;
      description?: string;
       backgroundColor?: string;
      linkUrl?: string | null;
    } = {
      content: postContent,
      mediaUrl,
      mediaType,
    };
    
    // Ajouter les champs optionnels s'ils existent dans le body
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (backgroundColor !== undefined) data.backgroundColor = backgroundColor;
    if (linkUrl !== undefined) data.linkUrl = linkUrl;

    const post = await prisma.post.update({
      where: { id },
      data,
    });

    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    console.error('Erreur modification post :', error);
    return NextResponse.json({ error: 'Erreur lors de la modification' }, { status: 500 });
  }
}

// DELETE : supprimer un post
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Post introuvable' }, { status: 404 });
    }

    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ message: 'Post supprimé' }, { status: 200 });
  } catch (error) {
    console.error('Erreur suppression post :', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}