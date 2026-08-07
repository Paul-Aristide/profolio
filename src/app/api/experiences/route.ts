// src/app/api/experiences/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const experiences = await prisma.experience.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
    });

    return NextResponse.json(experiences, { status: 200 });
  } catch (error) {
    console.error('Erreur lecture expériences :', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des expériences' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { title, company, logo, startDate, endDate, current, description } = await request.json();

    if (!title || !company || !startDate) {
      return NextResponse.json(
        { error: 'Titre, entreprise et date de début sont requis' },
        { status: 400 }
      );
    }

    const experience = await prisma.experience.create({
      data: {
        userId,
        title,
        company,
        logo,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        current: current || false,
        description,
      },
    });

    return NextResponse.json(experience, { status: 201 });
  } catch (error) {
    console.error('Erreur création expérience :', error);
    return NextResponse.json({ error: 'Erreur lors de la création de l\'expérience' }, { status: 500 });
  }
}
