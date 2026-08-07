// src/lib/requireAdmin.ts
import { NextResponse } from 'next/server';

/**
 * Vérifie que la requête vient d'un ADMIN ou SUPER_ADMIN.
 * Retourne null si autorisé, ou une NextResponse d'erreur sinon.
 */
export function requireAdmin(request: Request): NextResponse | null {
  const role = request.headers.get('x-user-role');

  if (!role || (role !== 'ADMIN' && role !== 'SUPER_ADMIN')) {
    return NextResponse.json(
      { error: 'Accès réservé aux administrateurs' },
      { status: 403 }
    );
  }

  return null;
}
