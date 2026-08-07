// src/app/api/agenda/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const VALID_STATUSES = ['available', 'busy', 'uncertain', 'holiday'];

// GET : lister ses événements d'agenda
export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { start, end } = await request.json().catch(() => ({}));

    const events = await prisma.agendaEvent.findMany({
      where: {
        userId,
        ...(start && { startTime: { gte: new Date(start) } }),
        ...(end && { endTime: { lte: new Date(end) } }),
      },
      orderBy: { startTime: 'asc' },
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error('Erreur lecture agenda :', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération de l\'agenda' }, { status: 500 });
  }
}

// POST : ajouter un événement
export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { title, description, startTime, endTime, timezone, status } = await request.json();

    if (!title || !startTime || !endTime || !timezone || !status) {
      return NextResponse.json(
        { error: 'Titre, startTime, endTime, timezone et status sont requis' },
        { status: 400 }
      );
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Status invalide. Valeurs autorisées : ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const event = await prisma.agendaEvent.create({
      data: {
        userId,
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        timezone,
        status,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Erreur création événement :', error);
    return NextResponse.json({ error: 'Erreur lors de la création de l\'événement' }, { status: 500 });
  }
}
