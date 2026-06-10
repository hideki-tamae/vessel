'use client';
import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import '../../app/globals.css';

export default function HaisLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/hais/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050511]">
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '2px solid rgba(6,182,212,0.2)',
          borderTopColor: 'rgba(6,182,212,0.8)',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <main className="container mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
