// src/app/api/admin/users/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/requireAdmin';
import { revokeAllUserRefreshTokens } from '@/lib/refreshToken';

// PATCH : bloquer ou débloquer un compte
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = requireAdmin(request);
  if (forbidden) return forbidden;

  try {
    const { id } = await params;
    const { action } = await request.json(); // "block" ou "unblock"

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    if (targetUser.isProtected) {
      return NextResponse.json(
        { error: 'Ce compte est protégé et ne peut pas être bloqué' },
        { status: 403 }
      );
    }

    if (action === 'block') {
      const updated = await prisma.user.update({
        where: { id },
        data: { isBlocked: true, blockedAt: new Date() },
      });
      // Déconnecter immédiatement le compte bloqué de toutes ses sessions
      await revokeAllUserRefreshTokens(id);
      return NextResponse.json(
        { id: updated.id, isBlocked: updated.isBlocked, blockedAt: updated.blockedAt },
        { status: 200 }
      );
    }

    if (action === 'unblock') {
      const updated = await prisma.user.update({
        where: { id },
        data: { isBlocked: false, blockedAt: null },
      });
      return NextResponse.json(
        { id: updated.id, isBlocked: updated.isBlocked },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Action invalide. Utilisez "block" ou "unblock"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Erreur modification statut utilisateur :', error);
    return NextResponse.json({ error: 'Erreur lors de la modification du statut' }, { status: 500 });
  }
}

// DELETE : suppression définitive d'un compte (SEULEMENT si bloqué depuis plus de 7 jours)
// Conforme au CDC : "l'admin ne peut pas supprimer dans un délai de moins d'une semaine"
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const forbidden = requireAdmin(request);
  if (forbidden) return forbidden;

  try {
    const { id } = await params;

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    if (targetUser.isProtected) {
      return NextResponse.json(
        { error: 'Ce compte est protégé et ne peut pas être supprimé' },
        { status: 403 }
      );
    }

    // Vérification : le compte doit être bloqué depuis plus de 7 jours
    if (!targetUser.isBlocked || !targetUser.blockedAt) {
      return NextResponse.json(
        { error: 'Le compte doit d\'abord être bloqué avant de pouvoir être supprimé' },
        { status: 400 }
      );
    }

    const daysSinceBlocked = (Date.now() - targetUser.blockedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceBlocked < 7) {
      return NextResponse.json(
        { error: `Suppression impossible : le compte est bloqué depuis seulement ${Math.floor(daysSinceBlocked)} jour(s). Attendez 7 jours.` },
        { status: 400 }
      );
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: 'Compte supprimé définitivement' }, { status: 200 });
  } catch (error) {
    console.error('Erreur suppression utilisateur :', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
