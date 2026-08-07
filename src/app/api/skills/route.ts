// src/app/api/skills/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const VALID_CATEGORIES = ['acquis', 'poste_vise', 'domaine_formation', 'experience'];

// GET : lister ses propres compétences
export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const skills = await prisma.skill.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(skills, { status: 200 });
  } catch (error) {
    console.error('Erreur lecture compétences :', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des compétences' }, { status: 500 });
  }
}

// POST : ajouter une compétence
export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { category, title, description } = await request.json();

    if (!category || !title) {
      return NextResponse.json(
        { error: 'Catégorie et titre sont requis' },
        { status: 400 }
      );
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: `Catégorie invalide. Valeurs autorisées : ${VALID_CATEGORIES.join(', ')}` },
        { status: 400 }
      );
    }

    const skill = await prisma.skill.create({
      data: { userId, category, title, description },
    });

    return NextResponse.json(skill, { status: 201 });
  } catch (error) {
    console.error('Erreur création compétence :', error);
    return NextResponse.json({ error: 'Erreur lors de la création de la compétence' }, { status: 500 });
  }
}
