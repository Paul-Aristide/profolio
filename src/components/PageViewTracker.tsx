// src/components/PageViewTracker.tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';

type PageViewTrackerProps = {
  targetUserId: string;
};

export default function PageViewTracker({ targetUserId }: PageViewTrackerProps) {
  const { user } = useAuth();

  useEffect(() => {
    async function trackView() {
      try {
        // Ne pas tracker ses propres visites
        if (user?.id === targetUserId) return;

        await fetch('/api/pageviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ targetUserId }),
        });
      } catch (err) {
        console.error('Erreur tracking visite :', err);
      }
    }
    trackView();
  }, [targetUserId, user?.id]);

  return null;
}
