// src/app/api/admin/reports/[id]/content/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/requireAdmin';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = requireAdmin(request);
  if (forbidden) return forbidden;

  try {
    const { id: reportId } = await params;

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        reportedUserId: true,
        status: true,
        reason: true,
        content: true,
        createdAt: true,
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Signalement introuvable' }, { status: 404 });
    }

    if (!report.reportedUserId) {
      return NextResponse.json(
        { message: 'Aucun utilisateur signalé dans ce signalement', report },
        { status: 200 }
      );
    }

    const reportedUser = await prisma.user.findUnique({
      where: { id: report.reportedUserId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        isBlocked: true,
        createdAt: true,
        profile: true,
        formations: true,
        experiences: { orderBy: { startDate: 'desc' } },
        posts: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!reportedUser) {
      return NextResponse.json({ error: 'Utilisateur signalé introuvable' }, { status: 404 });
    }

    return NextResponse.json({
      report: {
        id: report.id,
        reportedUserId: report.reportedUserId,
        status: report.status,
        reason: report.reason,
        details: report.content,
        createdAt: report.createdAt,
      },
      user: {
        id: reportedUser.id,
        email: reportedUser.email,
        firstName: reportedUser.firstName,
        lastName: reportedUser.lastName,
        username: reportedUser.username,
        isBlocked: reportedUser.isBlocked,
        createdAt: reportedUser.createdAt,
        profile: reportedUser.profile,
        formations: reportedUser.formations,
        experiences: reportedUser.experiences,
        posts: reportedUser.posts,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur inspection contenu signalé :', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
