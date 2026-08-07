// src/app/api/messages/received/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET : récupérer les messages reçus par l'utilisateur connecté
export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const messages = await prisma.message.findMany({
      where: { receiverId: userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        createdAt: true,
        senderId: true,
        senderName: true,
        senderEmail: true,
        sender: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error('Erreur récupération messages reçus :', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des messages' }, { status: 500 });
  }
}
