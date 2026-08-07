// src/app/api/cv/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { renderToBuffer } from '@react-pdf/renderer';
import { CvDocument } from '@/lib/cv/CvDocument';
import React from 'react';

// GET : génère et télécharge le CV PDF de l'utilisateur connecté
export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        formations: { orderBy: { year: 'desc' } },
        experiences: { orderBy: { startDate: 'desc' } },
        skills: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    const cvData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      birthDate: user.birthDate ? user.birthDate.toISOString() : null,
      birthPlace: user.birthPlace || null,
      username: user.username,
      profile: user.profile
        ? {
            bio: user.profile.bio,
            expertise: user.profile.expertise,
            city: user.profile.city,
            country: user.profile.country,
            neighborhood: user.profile.neighborhood,
            maritalStatus: user.profile.maritalStatus,
            hobbies: user.profile.hobbies,
            profilePhoto: user.profile.profilePhoto,
            githubUrl: user.profile.githubUrl,
            facebookUrl: user.profile.facebookUrl,
            youtubeUrl: user.profile.youtubeUrl,
            linkedinUrl: user.profile.linkedinUrl,
            whatsappUrl: user.profile.whatsappUrl,
            instagramUrl: user.profile.instagramUrl,
          }
        : null,
      formations: user.formations.map((f) => ({
        title: f.title,
        institution: f.institution,
        year: f.year,
        description: f.description,
        photo: f.photo,
      })),
      experiences: (user.experiences || []).map((exp: any) => ({
        title: exp.title,
        company: exp.company,
        startDate: exp.startDate,
        endDate: exp.endDate,
        current: exp.current,
        description: exp.description,
        logo: exp.logo,
      })),
      skills: user.skills.map((s) => ({
        category: s.category,
        title: s.title,
        description: s.description,
      })),
    };

    const pdfBuffer = await renderToBuffer(React.createElement(CvDocument, { data: cvData }) as any);

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CV_${user.firstName}_${user.lastName}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Erreur génération CV :', error);
    return NextResponse.json({ error: 'Erreur lors de la génération du CV' }, { status: 500 });
  }
}
