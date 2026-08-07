// src/app/api/profile/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET : récupérer son propre profil complet (y compris données privées)
export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        birthDate: true,
        birthPlace: true,
        phone: true,
        role: true,
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Erreur lecture profil :', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération du profil' }, { status: 500 });
  }
}

// PUT : créer ou mettre à jour son propre profil (upsert)
export async function PUT(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const {
      bio,
      expertise,
      maritalStatus,
      hobbies,
      coverPhoto,
      profilePhoto,
      city,
      country,
      neighborhood,
      interests,
      username,
      githubUrl,
      facebookUrl,
      youtubeUrl,
      linkedinUrl,
      whatsappUrl,
      instagramUrl,
    } = body;

    // Validation des longueurs
    if (bio && bio.length > 2000) {
      return NextResponse.json({ error: 'La biographie est trop longue (max 2000 caractères)' }, { status: 400 });
    }
    if (expertise && expertise.length > 200) {
      return NextResponse.json({ error: 'Le domaine d\'expertise est trop long (max 200 caractères)' }, { status: 400 });
    }
    if (hobbies && Array.isArray(hobbies) && hobbies.length > 20) {
      return NextResponse.json({ error: 'Trop de loisirs (max 20)' }, { status: 400 });
    }

    // Si l'utilisateur veut changer son username, vérifier l'unicité d'abord
    if (username) {
      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing && existing.id !== userId) {
        return NextResponse.json(
          { error: 'Ce nom d\'utilisateur est déjà pris' },
          { status: 409 }
        );
      }
      await prisma.user.update({
        where: { id: userId },
        data: { username },
      });
    }

    const profile = await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        bio,
        expertise,
        maritalStatus,
        hobbies: hobbies || [],
        coverPhoto,
        profilePhoto,
        city,
        country,
        neighborhood,
        interests,
        githubUrl,
        facebookUrl,
        youtubeUrl,
        linkedinUrl,
        whatsappUrl,
        instagramUrl,
      },
      update: {
        bio,
        expertise,
        maritalStatus,
        hobbies,
        coverPhoto,
        profilePhoto,
        city,
        country,
        neighborhood,
        interests,
        githubUrl,
        facebookUrl,
        youtubeUrl,
        linkedinUrl,
        whatsappUrl,
        instagramUrl,
      },
    });

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error('Erreur mise à jour profil :', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du profil' }, { status: 500 });
  }
}
