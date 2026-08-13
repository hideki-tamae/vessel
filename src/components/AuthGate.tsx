'use client';

import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="py-20 text-center text-gray-500 animate-pulse">Loading System...</div>;
  }

  // ✅ 認証済みなら中身（証拠提出画面）を表示
  if (isConnected) {
    return <>{children}</>;
  }

  // 🔒 未認証ならロック画面を表示
  return (
    <div className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-10 md:p-16 text-center group">
      {/* 背景装飾 */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity duration-500">
        <svg className="w-64 h-64 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* 中身のティーザー：誓いの内容をぼかし表示でプレビュー */}
        <div className="w-full max-w-lg select-none pointer-events-none">
          <h3 className="text-2xl font-bold text-white/50 mb-4 blur-[2px]">
            Re-Verse Civilization<br/><span className="text-slate-400 text-xl font-light">への誓い</span>
          </h3>
          <p className="text-gray-500/70 leading-relaxed blur-[2px]">
            私は、ケア資本主義（Care Capitalism）の実装者として、優しさが循環する社会を創り上げることを宣言します。
          </p>
        </div>

        <div className="space-y-3 max-w-lg">
          <p className="text-gray-400 leading-relaxed">
            誓いを刻み、優しさを証明するには接続が必要です。
          </p>
        </div>

        <div className="mt-2 scale-110">
          <ConnectButton label="接続してはじめる" accountStatus="avatar" showBalance={false} />
        </div>
      </div>
    </div>
  );
}