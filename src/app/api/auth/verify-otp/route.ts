// src/app/api/auth/verify-otp/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { issueRefreshToken } from '@/lib/refreshToken';

const JWT_SECRET = process.env.JWT_SECRET || 'GpALjMisbhDjx7IlJcvQaMqIlh9FOyyBrhrIak+mEdU=';
const MAX_ATTEMPTS = 5;

export async function POST(request: Request) {
  try {
    const { tempToken, otp, deviceId } = await request.json();

    if (!tempToken || !otp) {
      return NextResponse.json(
        { error: 'Token temporaire et code OTP requis' },
        { status: 400 }
      );
    }
  const ip = getClientIp(request);
    const rl = checkRateLimit(`verify-otp:${ip}`, 10, 15 * 60 * 1000); // 10 tentatives / 15 min
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Trop de tentatives de validation OTP. Réessayez plus tard.' },
        { status: 429 }
      );
    }

    let decoded: { userId: string; role: string; requiresOTP: boolean; deviceId: string };
    try {
      decoded = jwt.verify(tempToken, JWT_SECRET) as typeof decoded;
    } catch {
      return NextResponse.json(
        { error: 'Token temporaire invalide ou expiré' },
        { status: 400 }
      );
    }

    if (!decoded.requiresOTP) {
      return NextResponse.json(
        { error: 'Ce token ne nécessite pas de validation OTP' },
        { status: 400 }
      );
    }

    const resolvedDeviceId = deviceId || decoded.deviceId || 'unknown';

    // Récupérer le code OTP le plus récent, non utilisé, non expiré, pour cet utilisateur/appareil
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        userId: decoded.userId,
        deviceId: resolvedDeviceId,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Aucun code OTP valide trouvé. Reconnectez-vous pour en recevoir un nouveau.' },
        { status: 400 }
      );
    }

    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Reconnectez-vous pour recevoir un nouveau code.' },
        { status: 429 }
      );
    }

    const isOtpValid = await argon2.verify(otpRecord.codeHash, otp);

    if (!isOtpValid) {
      await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      return NextResponse.json(
        { error: 'Code OTP invalide' },
        { status: 400 }
      );
    }

    // OTP valide : le marquer comme utilisé
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { usedAt: new Date() },
    });

    // Marquer l'appareil comme de confiance (30 jours)
    await prisma.trustedDevice.upsert({
      where: {
        userId_deviceId: {
          userId: decoded.userId,
          deviceId: resolvedDeviceId,
        },
      },
      create: {
        userId: decoded.userId,
        deviceId: resolvedDeviceId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      update: {
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    const jwtToken = jwt.sign(
      { userId: decoded.userId, role: decoded.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    const refreshToken = await issueRefreshToken(decoded.userId);

    const jsonResponse = NextResponse.json(
      {
        token: jwtToken,
        refreshToken,
        requiresOTP: false,
        message: 'Connexion réussie. Appareil marqué comme de confiance pour 30 jours.',
      },
      { status: 200 }
    );
    jsonResponse.cookies.set('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 3600,
    });
    return jsonResponse;
  } catch (error) {
    console.error('Erreur validation OTP :', error);
    return NextResponse.json(
      { error: 'Erreur lors de la validation OTP' },
      { status: 500 }
    );
  }
}
