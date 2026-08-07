// src/app/api/skills/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const VALID_CATEGORIES = ['acquis', 'poste_vise', 'domaine_formation', 'experience'];

// PUT : modifier une compétence
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

    const existing = await prisma.skill.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Compétence introuvable' }, { status: 404 });
    }

    const { category, title, description } = await request.json();

    if (category && !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: `Catégorie invalide. Valeurs autorisées : ${VALID_CATEGORIES.join(', ')}` },
        { status: 400 }
      );
    }

    const skill = await prisma.skill.update({
      where: { id },
      data: { category, title, description },
    });

    return NextResponse.json(skill, { status: 200 });
  } catch (error) {
    console.error('Erreur modification compétence :', error);
    return NextResponse.json({ error: 'Erreur lors de la modification' }, { status: 500 });
  }
}

// DELETE : supprimer une compétence
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

    const existing = await prisma.skill.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Compétence introuvable' }, { status: 404 });
    }

    await prisma.skill.delete({ where: { id } });

    return NextResponse.json({ message: 'Compétence supprimée' }, { status: 200 });
  } catch (error) {
    console.error('Erreur suppression compétence :', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
