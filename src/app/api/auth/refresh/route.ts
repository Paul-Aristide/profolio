// src/app/api/auth/refresh/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { consumeRefreshToken, issueRefreshToken } from '@/lib/refreshToken';

const JWT_SECRET = process.env.JWT_SECRET || 'GpALjMisbhDjx7IlJcvQaMqIlh9FOyyBrhrIak+mEdU=';

export async function POST(request: Request) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token requis' },
        { status: 400 }
      );
    }

    const user = await consumeRefreshToken(refreshToken);

    if (!user) {
      return NextResponse.json(
        { error: 'Refresh token invalide, expiré ou déjà utilisé' },
        { status: 401 }
      );
    }

    // Vérifier que le compte n'a pas été bloqué entre-temps
    const freshUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!freshUser || freshUser.isBlocked) {
      return NextResponse.json(
        { error: 'Ce compte est bloqué' },
        { status: 403 }
      );
    }

    const newJwtToken = jwt.sign(
      { userId: freshUser.id, role: freshUser.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    const newRefreshToken = await issueRefreshToken(freshUser.id);

    const jsonResponse = NextResponse.json(
      {
        token: newJwtToken,
        refreshToken: newRefreshToken,
      },
      { status: 200 }
    );
    jsonResponse.cookies.set('token', newJwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 3600,
    });
    return jsonResponse;
  } catch (error) {
    console.error('Erreur refresh :', error);
    return NextResponse.json(
      { error: 'Erreur lors du renouvellement de session' },
      { status: 500 }
    );
  }
}
