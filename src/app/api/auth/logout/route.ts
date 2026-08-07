// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { revokeRefreshToken } from '@/lib/refreshToken';

export async function POST(request: Request) {
  try {
    const { refreshToken } = await request.json();

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    const response = NextResponse.json(
      { message: 'Déconnexion réussie' },
      { status: 200 }
    );
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return response;
  } catch (error) {
    console.error('Erreur logout :', error);
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
}
