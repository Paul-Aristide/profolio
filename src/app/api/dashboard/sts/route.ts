// src/app/api/dashboard/sts/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const [
      profileCount,
      formationsCount,
      skillsCount,
      postsCount,
      messagesReceivedCount,
      commentsCount,
      viewsCount,
    ] = await Promise.all([
      prisma.profile.count({ where: { userId } }),
      prisma.formation.count({ where: { userId } }),
      prisma.skill.count({ where: { userId } }),
      prisma.post.count({ where: { userId } }),
      prisma.message.count({ where: { receiverId: userId } }),
      prisma.comment.count({ where: { post: { userId } } }),
      prisma.pageView.count({ where: { userId } }),
    ]);

    return NextResponse.json([
      { label: 'Profils', value: profileCount, icon: '👤', color: 'bg-brand-blue-bright' },
      { label: 'Formations', value: formationsCount, icon: '🎓', color: 'bg-green-500' },
      { label: 'Compétences', value: skillsCount, icon: '⭐', color: 'bg-brand-purple' },
      { label: 'Publications', value: postsCount, icon: '📝', color: 'bg-brand-blue-sky' },
      { label: 'Messages reçus', value: messagesReceivedCount, icon: '💬', color: 'bg-blue-600' },
      { label: 'Commentaires', value: commentsCount, icon: '💭', color: 'bg-orange-500' },
      { label: 'Visites', value: viewsCount, icon: '📊', color: 'bg-pink-500' },
    ]);
  } catch (error) {
    console.error('Erreur stats dashboard :', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
