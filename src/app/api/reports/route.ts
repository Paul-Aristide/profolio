// src/app/api/reports/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const VALID_REASONS = ['identity_theft', 'hacking', 'other'];

// POST : un utilisateur connecté signale que son propre compte semble compromis
export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { reason, content } = await request.json();

    if (!reason || !content) {
      return NextResponse.json(
        { error: 'reason et content sont requis' },
        { status: 400 }
      );
    }

    if (!VALID_REASONS.includes(reason)) {
      return NextResponse.json(
        { error: `Motif invalide. Valeurs autorisées : ${VALID_REASONS.join(', ')}` },
        { status: 400 }
      );
    }

    const report = await prisma.report.create({
      data: { userId, reason, content, status: 'pending' },
    });

    return NextResponse.json(
      { message: 'Signalement enregistré. Un administrateur va examiner votre compte.', reportId: report.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur création signalement :', error);
    return NextResponse.json({ error: 'Erreur lors de l\'envoi du signalement' }, { status: 500 });
  }
}

// GET : lister ses propres signalements (suivi personnel)
export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const reports = await prisma.report.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reports, { status: 200 });
  } catch (error) {
    console.error('Erreur lecture signalements :', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des signalements' }, { status: 500 });
  }
}
