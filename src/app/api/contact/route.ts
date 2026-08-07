// src/app/api/contact/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET : récupérer ses infos de contact (privé)
export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        phone: true,
        profile: {
          select: {
            city: true,
            country: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Erreur lecture contact :', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des infos de contact' }, { status: 500 });
  }
}

// PUT : mettre à jour ses infos de contact
export async function PUT(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { email, phone, city, country, linkedin, twitter, github, facebook } = await request.json();

    // Mettre à jour les champs de base dans User
    const updateData: any = {};
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
    }

    // Mettre à jour les champs de localisation dans Profile
    const profileUpdateData: any = {};
    if (city) profileUpdateData.city = city;
    if (country) profileUpdateData.country = country;

    if (Object.keys(profileUpdateData).length > 0) {
      await prisma.profile.upsert({
        where: { userId },
        create: { userId, ...profileUpdateData },
        update: profileUpdateData,
      });
    }

    // Pour les liens sociaux, on pourrait ajouter un modèle SocialLink si besoin
    // (à faire en Phase 3 si nécessaire)

    return NextResponse.json(
      { message: 'Infos de contact mises à jour' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur mise à jour contact :', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}
