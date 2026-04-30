'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

/**
 * This component is mounted globally (in layout.tsx) to keep the
 * Zustand authStore in sync with the NextAuth session after social login.
 */
export function SocialAuthSync() {
  const { data: session, status } = useSession();
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session) {
      const s = session as any;

      // Only sync if we have WP JWT data and it's a social login session
      if (s.wpToken && !user) {
        setUser({
          id: s.wpId || 0,
          email: s.wpEmail || session.user?.email || '',
          firstName: s.wpFirstName || session.user?.name?.split(' ')[0] || '',
          lastName: s.wpLastName || session.user?.name?.split(' ').slice(1).join(' ') || '',
          displayName: s.wpDisplayName || session.user?.name || '',
          token: s.wpToken,
        });
      }
    }
  }, [session, status, user, setUser]);

  return null; // Invisible component
}
