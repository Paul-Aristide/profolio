// src/app/api/admin/reports/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/requireAdmin';
import { revokeAllUserRefreshTokens } from '@/lib/refreshToken';

const VALID_STATUSES = ['resolved', 'dismissed'];

// PATCH : traiter un signalement (résoudre/rejeter), avec option de bloquer le compte concerné
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = requireAdmin(request);
  if (forbidden) return forbidden;

  try {
    const { id } = await params;
    const { status, blockAccount } = await request.json();

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Status invalide. Valeurs autorisées : ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const report = await prisma.report.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!report) {
      return NextResponse.json({ error: 'Signalement introuvable' }, { status: 404 });
    }

    const updatedReport = await prisma.report.update({
      where: { id },
      data: { status },
    });

    // Si l'admin décide de bloquer le compte suite au signalement (ex: piratage confirmé)
    if (blockAccount === true) {
      if (report.user.isProtected) {
        return NextResponse.json(
          { error: 'Signalement traité, mais ce compte est protégé et ne peut pas être bloqué' },
          { status: 200 }
        );
      }
      await prisma.user.update({
        where: { id: report.userId },
        data: { isBlocked: true, blockedAt: new Date() },
      });
      await revokeAllUserRefreshTokens(report.userId);
    }

    return NextResponse.json(
      { report: updatedReport, accountBlocked: blockAccount === true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur traitement signalement :', error);
    return NextResponse.json({ error: 'Erreur lors du traitement' }, { status: 500 });
  }
}
