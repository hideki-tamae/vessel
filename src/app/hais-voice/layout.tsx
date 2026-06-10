'use client';
import { ReactNode, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function HAISLayout({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/hais-voice');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: '#0a0c12',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '2px solid rgba(232,184,109,0.2)',
          borderTopColor: 'rgba(232,184,109,0.8)',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  return <>{children}</>;
}
