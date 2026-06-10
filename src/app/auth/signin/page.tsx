'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// useSearchParamsを使うコンポーネントを分離
function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/hais/dashboard';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-200">
      <div className="p-8 border border-slate-800 bg-slate-900/50 rounded-xl max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center text-emerald-400">システムログイン</h1>
        <p className="text-sm text-slate-400 mb-8 text-center">HAIS Enterprise Dashboardへのアクセス</p>
        
        {/* 一時的なバイパスログインボタン */}
        <button
          onClick={() => window.location.href = callbackUrl}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
        >
          ダッシュボードへ入室 (検証用)
        </button>
      </div>
    </div>
  );
}

// ページコンポーネントはSuspenseでラップする
export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-400">認証情報を読み込み中...</div>}>
      <SignInContent />
    </Suspense>
  );
}