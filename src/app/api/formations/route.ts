// src/app/api/formations/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET : lister ses propres formations
export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const formations = await prisma.formation.findMany({
      where: { userId },
      orderBy: { year: 'desc' },
    });

    return NextResponse.json(formations, { status: 200 });
  } catch (error) {
    console.error('Erreur lecture formations :', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des formations' }, { status: 500 });
  }
}

// POST : ajouter une formation
export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { title, institution, year, description, photo } = await request.json();

    if (!title || !institution || !year) {
      return NextResponse.json(
        { error: 'Titre, institution et année sont requis' },
        { status: 400 }
      );
    }

    const formation = await prisma.formation.create({
      data: {
        userId,
        title,
        institution,
        year: Number(year),
        description,
        photo,
      },
    });

    return NextResponse.json(formation, { status: 201 });
  } catch (error) {
    console.error('Erreur création formation :', error);
    return NextResponse.json({ error: 'Erreur lors de la création de la formation' }, { status: 500 });
  }
}
