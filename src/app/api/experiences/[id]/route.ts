// src/app/api/experiences/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

    const existing = await prisma.experience.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Expérience introuvable' }, { status: 404 });
    }

    const { title, company, logo, startDate, endDate, current, description } = await request.json();

    const experience = await prisma.experience.update({
      where: { id },
      data: {
        title,
        company,
        logo,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : null,
        current,
        description,
      },
    });

    return NextResponse.json(experience, { status: 200 });
  } catch (error) {
    console.error('Erreur modification expérience :', error);
    return NextResponse.json({ error: 'Erreur lors de la modification' }, { status: 500 });
  }
}

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

    const existing = await prisma.experience.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Expérience introuvable' }, { status: 404 });
    }

    await prisma.experience.delete({ where: { id } });

    return NextResponse.json({ message: 'Expérience supprimée' }, { status: 200 });
  } catch (error) {
    console.error('Erreur suppression expérience :', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
