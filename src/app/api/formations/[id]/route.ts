// src/app/api/formations/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PUT : modifier une formation (seulement si elle appartient à l'utilisateur connecté)
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

    const existing = await prisma.formation.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Formation introuvable' }, { status: 404 });
    }

    const { title, institution, year, description, photo } = await request.json();

    const formation = await prisma.formation.update({
      where: { id },
      data: {
        title,
        institution,
        year: year ? Number(year) : undefined,
        description,
        photo,
      },
    });

    return NextResponse.json(formation, { status: 200 });
  } catch (error) {
    console.error('Erreur modification formation :', error);
    return NextResponse.json({ error: 'Erreur lors de la modification' }, { status: 500 });
  }
}

// DELETE : supprimer une formation (seulement si elle appartient à l'utilisateur connecté)
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

    const existing = await prisma.formation.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Formation introuvable' }, { status: 404 });
    }

    await prisma.formation.delete({ where: { id } });

    return NextResponse.json({ message: 'Formation supprimée' }, { status: 200 });
  } catch (error) {
    console.error('Erreur suppression formation :', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
