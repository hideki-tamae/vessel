'use client';

import React, { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

function SignInContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get('callbackUrl') || '/hais-voice';

  const [mode, setMode] = useState<'select' | 'email' | 'signup'>('select');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { isConnected, address } = useAccount();

  // Web3ウォレット接続後に自動ログイン
  React.useEffect(() => {
    if (isConnected && address) {
      handleWeb3SignIn(address);
    }
  }, [isConnected, address]);

  async function handleWeb3SignIn(addr: string) {
    setLoading(true);
    setError('');
    const res = await signIn('credentials', {
      redirect: false,
      email: `${addr}@wallet`,
      password: addr,
      callbackUrl,
    });
    setLoading(false);
    if (res?.ok) {
      router.push(callbackUrl);
    } else {
      setError('ウォレット認証に失敗しました。');
    }
  }

  async function handleEmailSignIn(e: React.MouseEvent) {
    e.preventDefault();
    if (!email || !password) { setError('メールとパスワードを入力してください。'); return; }
    setLoading(true);
    setError('');
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl,
    });
    setLoading(false);
    if (res?.ok) {
      router.push(callbackUrl);
    } else {
      setError('メールアドレスまたはパスワードが正しくありません。');
    }
  }

  async function handleEmailSignUp(e: React.MouseEvent) {
    e.preventDefault();
    if (!name || !email || !password) { setError('すべての項目を入力してください。'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || '登録に失敗しました。'); setLoading(false); return; }
      // 登録後そのままサインイン
      const signInRes = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl,
      });
      setLoading(false);
      if (signInRes?.ok) {
        router.push(callbackUrl);
      } else {
        setError('登録は完了しましたが、ログインに失敗しました。もう一度ログインしてください。');
        setMode('email');
      }
    } catch {
      setError('ネットワークエラーが発生しました。');
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-200 px-4">
      {/* ロゴ・タイトル */}
      <div className="mb-8 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-slate-100 tracking-wide">HAIS Voice</h1>
        <p className="text-sm text-slate-500 mt-1">自律神経スキャンシステム</p>
      </div>

      <div className="w-full max-w-sm">
        {/* 選択画面 */}
        {mode === 'select' && (
          <div className="space-y-3">
            {/* Web3接続 */}
            <div className="p-4 border border-slate-800 rounded-xl bg-slate-900/50">
              <p className="text-xs text-slate-500 mb-3 text-center">Web3ウォレットで接続</p>
              <div className="flex justify-center">
                <ConnectButton
                  label="ウォレットで接続"
                  showBalance={false}
                  chainStatus="none"
                />
              </div>
              {loading && isConnected && (
                <p className="text-xs text-emerald-400 text-center mt-2 animate-pulse">認証中...</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-xs text-slate-600">または</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* メール選択 */}
            <button
              onClick={() => setMode('email')}
              className="w-full py-3 px-4 border border-slate-700 hover:border-emerald-500/50 bg-slate-900/50 hover:bg-slate-800/50 text-slate-300 rounded-xl text-sm font-medium transition-all"
            >
              メールアドレスでログイン
            </button>
            <button
              onClick={() => setMode('signup')}
              className="w-full py-3 px-4 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/40 hover:border-emerald-500/60 text-emerald-400 rounded-xl text-sm font-medium transition-all"
            >
              新規アカウント登録
            </button>
          </div>
        )}

        {/* メールログイン */}
        {mode === 'email' && (
          <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-300 text-center">ログイン</h2>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 focus:border-emerald-500/60 outline-none rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 transition-colors"
              />
              <input
                type="password"
                placeholder="パスワード"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 focus:border-emerald-500/60 outline-none rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 transition-colors"
              />
            </div>
            {error && <p className="text-xs text-red-400 text-center">{error}</p>}
            <button
              onClick={handleEmailSignIn}
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
            <button onClick={() => { setMode('select'); setError(''); }} className="w-full text-xs text-slate-600 hover:text-slate-400 transition-colors">
              ← 戻る
            </button>
          </div>
        )}

        {/* 新規登録 */}
        {mode === 'signup' && (
          <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-300 text-center">アカウント登録</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="お名前"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 focus:border-emerald-500/60 outline-none rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 transition-colors"
              />
              <input
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 focus:border-emerald-500/60 outline-none rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 transition-colors"
              />
              <input
                type="password"
                placeholder="パスワード（8文字以上）"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 focus:border-emerald-500/60 outline-none rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 transition-colors"
              />
            </div>
            {error && <p className="text-xs text-red-400 text-center">{error}</p>}
            <button
              onClick={handleEmailSignUp}
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? '登録中...' : '登録してスキャンへ進む'}
            </button>
            <button onClick={() => { setMode('select'); setError(''); }} className="w-full text-xs text-slate-600 hover:text-slate-400 transition-colors">
              ← 戻る
            </button>
          </div>
        )}

        {error && mode === 'select' && (
          <p className="text-xs text-red-400 text-center mt-3">{error}</p>
        )}
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
