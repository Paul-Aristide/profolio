// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { issueRefreshToken } from '@/lib/refreshToken';

const JWT_SECRET = process.env.JWT_SECRET || 'GpALjMisbhDjx7IlJcvQaMqIlh9FOyyBrhrIak+mEdU=';

export async function POST(request: Request) {
  try {
    const { token, email, password, firstName, lastName, birthDate, birthPlace, phone, country, city, profilePhoto, coverPhoto } = await request.json();
    const ip = getClientIp(request);
    const rl = checkRateLimit(`register:${ip}`, 5, 15 * 60 * 1000); // 5 tentatives / 15 min
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Trop de tentatives d'inscription. Réessayez plus tard." },
        { status: 429 }
      );
    }

    // 1. Vérifier le token d'invitation (haché avec SHA-256)
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const adminToken = await prisma.adminToken.findUnique({
      where: { token: tokenHash },
    });

    if (!adminToken) {
      return NextResponse.json(
        { error: 'Token d\'invitation invalide' },
        { status: 400 }
      );
    }

    if (adminToken.usedAt) {
      return NextResponse.json(
        { error: 'Token déjà utilisé' },
        { status: 400 }
      );
    }

    if (adminToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Token expiré' },
        { status: 400 }
      );
    }

    // 2. Vérifier que l'email n'existe pas déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email déjà utilisé' },
        { status: 400 }
      );
    }

    // 3. Valider la force du mot de passe
    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial' },
        { status: 400 }
      );
    }

    // 4. Hacher le mot de passe et générer un username unique
    const hashedPassword = await argon2.hash(password);
    const baseUsername = `${firstName}-${lastName}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
    const uniqueSuffix = Math.random().toString(36).slice(2, 6);
    const username = `${baseUsername}-${uniqueSuffix}`;

    // 5. Créer l'utilisateur avec son profil (photos incluses si fournies)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        username,
        birthDate: new Date(birthDate),
        birthPlace,
        phone,
        role: 'USER',
        profile: {
          create: {
            profilePhoto: profilePhoto || null,
            coverPhoto: coverPhoto || null,
            city: city || null,
            country: country || null,
          },
        },
      },
    });

    // 6. Marquer le token comme utilisé
    await prisma.adminToken.update({
      where: { id: adminToken.id },
      data: { usedAt: new Date(), usedByEmail: email },
    });

    // 7. Générer un JWT (valide 1h) + un refresh token
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
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
      { status: 201 }
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
    console.error('Erreur inscription :', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}
