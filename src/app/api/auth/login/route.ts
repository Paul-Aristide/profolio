// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { issueRefreshToken } from '@/lib/refreshToken';

const JWT_SECRET = process.env.JWT_SECRET || 'GpALjMisbhDjx7IlJcvQaMqIlh9FOyyBrhrIak+mEdU=';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const { email, password, deviceId } = await request.json();
    const ip = getClientIp(request);
    const rl = checkRateLimit(`login:${email}:${ip}`, 5, 15 * 60 * 1000); // 5 tentatives / 15 min
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Trop de tentatives de connexion. Réessayez plus tard.' },
        { status: 429 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    const resolvedDeviceId = deviceId || 'unknown';

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 400 }
      );
    }

    if (user.isBlocked) {
      return NextResponse.json(
        { error: 'Ce compte est bloqué' },
        { status: 403 }
      );
    }

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 400 }
      );
    }

    // Vérifier si CET appareil est déjà de confiance (30 jours)
    const trustedDevice = await prisma.trustedDevice.findUnique({
      where: {
        userId_deviceId: {
          userId: user.id,
          deviceId: resolvedDeviceId,
        },
      },
    });

    if (trustedDevice && trustedDevice.expiresAt > new Date()) {
      // Appareil de confiance : connexion directe, pas d'OTP
      const jwtToken = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      const refreshToken = await issueRefreshToken(user.id);

      const jsonResponse = NextResponse.json(
        {
          token: jwtToken,
          refreshToken,
          requiresOTP: false,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
          },
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
    }

    // Nouvel appareil : générer un vrai OTP, le hacher, le stocker
    const otp = generateOtp();
    const codeHash = await argon2.hash(otp);

    await prisma.otpCode.create({
      data: {
        userId: user.id,
        codeHash,
        deviceId: resolvedDeviceId,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
      },
    });

    // Envoi de l'OTP par email via Resend
    try {
      const { sendOtpEmail } = await import('@/lib/email');
      await sendOtpEmail(email, otp);
    } catch (emailError) {
      console.error('Erreur envoi email OTP :', emailError);
    }
    // Affiche l'OTP dans le terminal uniquement en développement
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] OTP pour ${email} (device: ${resolvedDeviceId}) : ${otp}`);
    }

    const tempToken = jwt.sign(
      { userId: user.id, role: user.role, requiresOTP: true, deviceId: resolvedDeviceId },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    return NextResponse.json(
      {
        tempToken,
        requiresOTP: true,
        message: 'Un code OTP a été envoyé à votre email (voir console en mode dev)',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur connexion :', error);
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
}
