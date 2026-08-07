// src/app/api/agenda/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const VALID_STATUSES = ['available', 'busy', 'uncertain', 'holiday'];

// PUT : modifier un événement
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
    const existing = await prisma.agendaEvent.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 });
    }

    const { title, description, startTime, endTime, timezone, status } = await request.json();

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Status invalide. Valeurs autorisées : ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const event = await prisma.agendaEvent.update({
      where: { id },
      data: {
        title,
        description,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        timezone,
        status,
      },
    });

    return NextResponse.json(event, { status: 200 });
  } catch (error) {
    console.error('Erreur modification événement :', error);
    return NextResponse.json({ error: 'Erreur lors de la modification' }, { status: 500 });
  }
}

// DELETE : supprimer un événement
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
    const existing = await prisma.agendaEvent.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 });
    }

    await prisma.agendaEvent.delete({ where: { id } });
    return NextResponse.json({ message: 'Événement supprimé' }, { status: 200 });
  } catch (error) {
    console.error('Erreur suppression événement :', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
