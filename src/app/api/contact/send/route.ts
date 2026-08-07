// src/app/api/contact/send/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST : envoyer un message à un utilisateur
export async function POST(request: Request) {
  try {
    const { toUsername, senderEmail, senderName, content } = await request.json();

    if (!toUsername || !senderEmail || !content) {
      return NextResponse.json(
        { error: 'toUsername, senderEmail et content sont requis' },
        { status: 400 }
      );
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { error: 'Message trop long (maximum 5000 caractères)' },
        { status: 400 }
      );
    }

    // Trouver l'utilisateur destinataire
    const recipient = await prisma.user.findUnique({
      where: { username: toUsername },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: 'Utilisateur destinataire introuvable' },
        { status: 404 }
      );
    }

    // Créer le message
    const message = await prisma.message.create({
      data: {
        senderId: null,
        senderName: senderName || null,
        senderEmail: senderEmail || null,
        receiverId: recipient.id,
        content,
      },
    });

    // L'expéditeur devient automatiquement abonné au profil du destinataire
    // (règle métier : un visiteur s'abonne automatiquement lorsqu'il envoie un message)
    const sender = await prisma.user.findUnique({ where: { email: senderEmail } });
    if (sender) {
      await prisma.follower.createMany({
        data: { userId: recipient.id, followerId: sender.id },
        skipDuplicates: true,
      });
    }

    // Envoyer une notification email au destinataire via Gmail SMTP
    try {
      const { sendContactNotificationEmail } = await import('@/lib/email');
      // Construire le nom complet : NOM Prénom (format français standard)
      const fullName = recipient.lastName && recipient.firstName 
        ? `${recipient.lastName} ${recipient.firstName}`
        : recipient.lastName || recipient.firstName || recipient.username || 'Utilisateur';
      
      await sendContactNotificationEmail(
        recipient.email,
        fullName,
        senderName || 'Un visiteur',
        senderEmail || 'non-reply@profolio.com',
        content
      );
    } catch (emailError) {
      console.error('Erreur envoi notification email :', emailError);
    }

    return NextResponse.json(
      { message: 'Message envoyé avec succès' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur envoi message :', error);
    return NextResponse.json({ error: 'Erreur lors de l\'envoi du message' }, { status: 500 });
  }
}
