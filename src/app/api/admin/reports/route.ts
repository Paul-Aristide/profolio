// src/app/api/admin/reports/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/requireAdmin';

export async function GET(request: Request) {
  const forbidden = requireAdmin(request);
  if (forbidden) return forbidden;

  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Erreur lecture signalements :', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
