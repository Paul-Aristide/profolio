// src/app/api/admin/cron/cleanup-blocked/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const CRON_SECRET = process.env.CRON_SECRET || 'ChangeMoiEnProductionSVP2026';

// POST : supprime définitivement les comptes bloqués depuis plus de 7 jours
// Appelé par un cron externe (GitHub Actions / Render Cron Job), pas par un utilisateur
export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const usersToDelete = await prisma.user.findMany({
      where: {
        isBlocked: true,
        isProtected: false,
        blockedAt: { lte: sevenDaysAgo },
      },
      select: { id: true, email: true },
    });

    if (usersToDelete.length === 0) {
      return NextResponse.json({ message: 'Aucun compte à supprimer', deletedCount: 0 }, { status: 200 });
    }

    const idsToDelete = usersToDelete.map((u) => u.id);

    await prisma.user.deleteMany({
      where: { id: { in: idsToDelete } },
    });

    console.log(`[CRON] ${usersToDelete.length} compte(s) supprimé(s) après 7 jours de blocage :`, usersToDelete.map((u) => u.email));

    return NextResponse.json(
      { message: 'Nettoyage effectué', deletedCount: usersToDelete.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur job cleanup-blocked :', error);
    return NextResponse.json({ error: 'Erreur lors du nettoyage' }, { status: 500 });
  }
}
