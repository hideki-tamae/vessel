'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSignMessage } from 'wagmi';
import { SiweMessage } from 'siwe';

type AuthMode = 'email' | 'web3';

// ─── Neural network background canvas ────────────────────────────────────────
function NeuralCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let frame = 0;

    const nodes = Array.from({ length: 32 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.5 + 0.5,
      phase: Math.random() * Math.PI * 2,
    }));

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    let raf: number;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      frame++;

      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      });

      // Connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.hypot(dx, dy);
          if (d < 180) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(16,185,129,${(1 - d / 180) * 0.1})`;
            ctx.lineWidth = 0.4;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      nodes.forEach((n) => {
        const pulse = (Math.sin(frame * 0.018 + n.phase) + 1) * 0.5;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + pulse * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16,185,129,${0.12 + pulse * 0.18})`;
        ctx.fill();
      });

      // Radial vignette — keep corners dark
      const vgrd = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.75);
      vgrd.addColorStop(0, 'rgba(0,0,0,0)');
      vgrd.addColorStop(1, 'rgba(5,8,10,0.7)');
      ctx.fillStyle = vgrd;
      ctx.fillRect(0, 0, w, h);

      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.9 }}
    />
  );
}

// ─── Grain overlay ────────────────────────────────────────────────────────────
function GrainOverlay() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf: ReturnType<typeof setTimeout>;
    const draw = () => {
      el.width = 256;
      el.height = 256;
      const ctx = el.getContext('2d')!;
      const img = ctx.createImageData(256, 256);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 20;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 20;
      }
      ctx.putImageData(img, 0, 0);
      raf = setTimeout(draw, 100);
    };
    draw();
    return () => clearTimeout(raf);
  }, []);
  return (
    <canvas
      ref={ref}
      className="fixed inset-0 pointer-events-none w-full h-full"
      style={{ zIndex: 1, mixBlendMode: 'overlay', imageRendering: 'pixelated' }}
    />
  );
}

// ─── Waveform brandmark ───────────────────────────────────────────────────────
function WaveformMark({ size = 16 }: { size?: number }) {
  const bars = [4, 8, 14, 11, 7, 12, 5];
  const scale = size / 28;
  return (
    <svg width={28 * scale} height={20 * scale} viewBox="0 0 28 20" fill="none" aria-hidden>
      {bars.map((h, i) => (
        <rect
          key={i}
          x={i * 4}
          y={(20 - h) / 2}
          width={2}
          height={h}
          rx={1}
          fill="#10B981"
          opacity={0.65 + i * 0.05}
        />
      ))}
    </svg>
  );
}

// ─── Floating label input ─────────────────────────────────────────────────────
function FloatField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  suffix,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  suffix?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div className="relative">
      <label
        className="absolute left-4 pointer-events-none transition-all duration-200 font-mono"
        style={{
          top: lifted ? '7px' : '50%',
          transform: lifted ? 'translateY(0) scale(0.75)' : 'translateY(-50%)',
          transformOrigin: 'left top',
          fontSize: '11px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: focused
            ? 'rgba(16,185,129,0.65)'
            : lifted
            ? 'rgba(255,255,255,0.22)'
            : 'rgba(255,255,255,0.18)',
          zIndex: 2,
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={lifted ? placeholder : ''}
        autoComplete={autoComplete}
        className="w-full rounded-2xl text-sm text-white outline-none transition-all duration-250"
        style={{
          paddingTop: '22px',
          paddingBottom: '10px',
          paddingLeft: '16px',
          paddingRight: suffix ? '48px' : '16px',
          background: focused ? 'rgba(16,185,129,0.03)' : 'rgba(255,255,255,0.025)',
          border: focused
            ? '1px solid rgba(16,185,129,0.32)'
            : '1px solid rgba(255,255,255,0.07)',
          boxShadow: focused
            ? 'inset 0 1px 3px rgba(0,0,0,0.25), 0 0 0 3px rgba(16,185,129,0.04)'
            : 'inset 0 1px 2px rgba(0,0,0,0.2)',
          caretColor: '#10B981',
          color: 'rgba(255,255,255,0.82)',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {suffix && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10">
          {suffix}
        </div>
      )}
    </div>
  );
}

// ─── Eye toggle icon ──────────────────────────────────────────────────────────
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M17.94 17.94A10 10 0 0112 20C5 20 1 12 1 12a18 18 0 015.06-5.94M9.9 4.24A9 9 0 0112 4c7 0 11 8 11 8a18 18 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// ─── Mode tab switcher ────────────────────────────────────────────────────────
function ModeTabs({
  mode,
  onChange,
}: {
  mode: AuthMode;
  onChange: (m: AuthMode) => void;
}) {
  return (
    <div
      className="relative flex mb-8 p-1 rounded-2xl"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
      role="tablist"
    >
      {/* Sliding pill */}
      <motion.div
        layoutId="mode-pill"
        layout
        transition={{ type: 'spring', stiffness: 600, damping: 42 }}
        className="absolute top-1 bottom-1 rounded-xl pointer-events-none"
        style={{
          left: mode === 'email' ? '4px' : 'calc(50%)',
          right: mode === 'email' ? 'calc(50%)' : '4px',
          background: 'rgba(16,185,129,0.07)',
          border: '1px solid rgba(16,185,129,0.18)',
          boxShadow: '0 2px 12px rgba(16,185,129,0.06)',
        }}
      />
      {(['email', 'web3'] as AuthMode[]).map((m) => {
        const active = mode === m;
        return (
          <button
            key={m}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(m)}
            className="relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 transition-all duration-200"
          >
            {m === 'email' ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke={active ? 'rgba(16,185,129,0.8)' : 'rgba(255,255,255,0.2)'}
                strokeWidth="1.5" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke={active ? 'rgba(16,185,129,0.8)' : 'rgba(255,255,255,0.2)'}
                strokeWidth="1.5" strokeLinecap="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            )}
            <span
              className="text-[11px] font-mono tracking-[0.18em] uppercase"
              style={{
                color: active ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.22)',
              }}
            >
              {m === 'email' ? 'Email' : 'Web3 ID'}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Error banner ─────────────────────────────────────────────────────────────
function ErrorBanner({ msg }: { msg: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
      animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.22 }}
      className="overflow-hidden"
    >
      <div
        className="rounded-xl px-4 py-3 flex items-center gap-3 text-xs"
        style={{
          background: 'rgba(244,63,94,0.06)',
          border: '1px solid rgba(244,63,94,0.18)',
          color: 'rgba(251,113,133,0.9)',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {msg}
      </div>
    </motion.div>
  );
}

// ─── Submit button ────────────────────────────────────────────────────────────
function SubmitBtn({
  loading,
  children,
  onClick,
  type = 'button',
}: {
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={loading}
      whileTap={!loading ? { scale: 0.97 } : {}}
      className="w-full py-3.5 rounded-2xl text-sm font-medium relative overflow-hidden"
      style={{
        background: loading
          ? 'rgba(16,185,129,0.15)'
          : 'linear-gradient(135deg, #13d6a0 0%, #059669 100%)',
        color: loading ? 'rgba(255,255,255,0.3)' : 'white',
        letterSpacing: '0.04em',
        boxShadow: loading
          ? 'none'
          : '0 6px 32px rgba(16,185,129,0.2), inset 0 1px 0 rgba(255,255,255,0.14)',
      }}
    >
      {/* Sheen */}
      {!loading && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.07) 50%, transparent 70%)',
          }}
        />
      )}
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <motion.svg
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
            width="15" height="15" viewBox="0 0 24 24" fill="none"
          >
            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
            <path fill="rgba(255,255,255,0.6)" d="M4 12a8 8 0 018-8v8H4z" />
          </motion.svg>
          処理中…
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}

// ─── HAIS signature metric strip ──────────────────────────────────────────────
function MetricStrip() {
  const items = [
    { label: 'HRV精度', value: '99.2%' },
    { label: '解析速度', value: '<0.8s' },
    { label: 'データ暗号化', value: 'AES-256' },
  ];
  return (
    <div
      className="flex items-center justify-center gap-6 py-4"
      style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
    >
      {items.map((item, i) => (
        <React.Fragment key={item.label}>
          <div className="text-center">
            <p
              className="text-[10px] font-mono mb-0.5"
              style={{ color: 'rgba(16,185,129,0.6)', letterSpacing: '0.05em' }}
            >
              {item.value}
            </p>
            <p
              className="text-[8px] font-mono tracking-widest uppercase"
              style={{ color: 'rgba(255,255,255,0.15)' }}
            >
              {item.label}
            </p>
          </div>
          {i < items.length - 1 && (
            <div
              className="w-px h-6 flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Extracted Content Component ───────────────────────────────────────────────
function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/hais/dashboard';
  const errorParam = searchParams.get('error');

  const [mode, setMode] = useState<AuthMode>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [web3Loading, setWeb3Loading] = useState(false);
  const [error, setError] = useState(
    errorParam ? 'メールアドレスまたはパスワードが正しくありません。' : ''
  );

  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  // ── Email sign-in ──────────────────────────────────────────────────────────
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('メールアドレスとパスワードを入力してください。'); return; }
    setLoading(true);
    setError('');
    const result = await signIn('credentials', { email, password, redirect: false, callbackUrl });
    setLoading(false);
    if (result?.error) setError('メールアドレスまたはパスワードが正しくありません。');
    else if (result?.url) router.push(result.url);
  };

  // ── Web3 sign-in ───────────────────────────────────────────────────────────
  const handleWeb3SignIn = async () => {
    if (!address) return;
    setWeb3Loading(true);
    setError('');
    try {
      const { nonce } = await (await fetch('/api/auth/nonce')).json();
      const siweMsg = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'HAIS へのアクセスを承認します。',
        uri: window.location.origin,
        version: '1',
        chainId: 1,
        nonce,
      });
      const signature = await signMessageAsync({ message: siweMsg.prepareMessage() });
      const result = await signIn('web3', {
        message: JSON.stringify(siweMsg),
        signature,
        redirect: false,
        callbackUrl,
      });
      if (result?.error) setError('ウォレット認証に失敗しました。');
      else if (result?.url) router.push(result.url);
    } catch (err: any) {
      setError(err?.code === 4001 ? '署名がキャンセルされました。' : 'ウォレット認証中にエラーが発生しました。');
    } finally { setWeb3Loading(false); }
  };

  useEffect(() => {
    if (mode === 'web3' && isConnected && address) {
      const t = setTimeout(handleWeb3SignIn, 500);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, mode]);

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * 18, filter: 'blur(1.5px)' }),
    center: { opacity: 1, x: 0, filter: 'blur(0px)' },
    exit: (dir: number) => ({ opacity: 0, x: dir * -18, filter: 'blur(1.5px)' }),
  };

  return (
    <>
      {/* ── Brand ── */}
      <div className="fixed top-7 left-8 z-20 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{
            background: 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.18)',
          }}
        >
          <WaveformMark size={28} />
        </div>
        <div>
          <p
            className="font-mono text-[11px] font-semibold tracking-[0.28em] uppercase leading-none"
            style={{ color: 'rgba(255,255,255,0.48)' }}
          >
            HAIS
          </p>
          <p
            className="font-mono text-[8px] tracking-[0.18em] uppercase"
            style={{ color: 'rgba(255,255,255,0.16)' }}
          >
            Health Analysis
          </p>
        </div>
      </div>

      {/* ── New account link ── */}
      <div className="fixed top-7 right-8 z-20">
        <a
          href="/auth/signup"
          className="flex items-center gap-2 text-[11px] font-mono transition-all duration-200 group"
          style={{ color: 'rgba(255,255,255,0.22)', letterSpacing: '0.08em' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.55)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.22)')}
        >
          新規登録
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>

      {/* ── Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[420px] mx-4"
      >
        {/* Card outer glow */}
        <div
          className="absolute -inset-px rounded-[26px] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(16,185,129,0.1) 0%, transparent 55%)',
            zIndex: -1,
          }}
        />

        <div
          className="relative overflow-hidden"
          style={{
            background: 'rgba(10,15,20,0.94)',
            borderRadius: '22px',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(52px)',
            boxShadow:
              '0 0 0 0.5px rgba(0,0,0,0.7), 0 60px 120px rgba(0,0,0,0.7), 0 20px 40px rgba(0,0,0,0.4)',
          }}
        >
          {/* Top accent line */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '22%',
              right: '22%',
              height: '1px',
              background:
                'linear-gradient(90deg, transparent, rgba(16,185,129,0.55), transparent)',
            }}
          />

          {/* Subtle inner grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(rgba(16,185,129,0.025) 1px, transparent 1px),
                linear-gradient(90deg, rgba(16,185,129,0.025) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
              maskImage:
                'radial-gradient(ellipse 80% 80% at 50% 0%, black 0%, transparent 70%)',
            }}
          />

          <div className="relative p-8 md:p-10">
            {/* ── Header ── */}
            <div className="mb-7 text-center">
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
                style={{
                  background: 'rgba(16,185,129,0.07)',
                  border: '1px solid rgba(16,185,129,0.18)',
                }}
              >
                <motion.span
                  animate={{ opacity: [1, 0.35, 1] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#10B981' }}
                />
                <span
                  className="text-[9px] font-mono tracking-[0.25em] uppercase"
                  style={{ color: 'rgba(16,185,129,0.72)' }}
                >
                  Secure Channel
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
                className="text-[28px] font-light text-white mb-1.5"
                style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  letterSpacing: '-0.03em',
                  textShadow: '0 0 80px rgba(16,185,129,0.07)',
                }}
              >
                おかえりなさい
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.28 }}
                className="text-[13px]"
                style={{ color: 'rgba(255,255,255,0.22)', letterSpacing: '0.04em' }}
              >
                HAISへアクセスするための認証を行います
              </motion.p>
            </div>

            {/* ── Mode tabs ── */}
            <ModeTabs mode={mode} onChange={(m) => { setMode(m); setError(''); }} />

            {/* ── Error ── */}
            <AnimatePresence>
              {error && <ErrorBanner msg={error} />}
            </AnimatePresence>

            {/* ── Forms ── */}
            <AnimatePresence mode="wait" custom={mode === 'email' ? -1 : 1}>
              {/* Email mode */}
              {mode === 'email' && (
                <motion.form
                  key="email"
                  custom={-1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.26 }}
                  onSubmit={handleEmailSignIn}
                  className="space-y-4"
                >
                  <FloatField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />

                  <FloatField
                    label="Password"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={setPassword}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    suffix={
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        tabIndex={-1}
                        style={{ color: 'rgba(255,255,255,0.22)' }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.55)')
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.22)')
                        }
                      >
                        <EyeIcon open={showPw} />
                      </button>
                    }
                  />

                  {/* Forgot password */}
                  <div className="flex justify-end">
                    <a
                      href="/auth/forgot-password"
                      className="text-[10px] font-mono transition-colors"
                      style={{ color: 'rgba(16,185,129,0.45)', letterSpacing: '0.08em' }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(16,185,129,0.75)')
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(16,185,129,0.45)')
                      }
                    >
                      パスワードをお忘れですか？
                    </a>
                  </div>

                  <div className="pt-1">
                    <SubmitBtn type="submit" loading={loading}>
                      サインイン →
                    </SubmitBtn>
                  </div>
                </motion.form>
              )}

              {/* Web3 mode */}
              {mode === 'web3' && (
                <motion.div
                  key="web3"
                  custom={1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.26 }}
                  className="space-y-5"
                >
                  {/* Description card */}
                  <div
                    className="rounded-2xl p-5"
                    style={{
                      background: 'rgba(255,255,255,0.015)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: 'rgba(16,185,129,0.07)',
                          border: '1px solid rgba(16,185,129,0.18)',
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                          stroke="#10B981" strokeWidth="1.5" strokeLinecap="round">
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                      </div>
                      <div>
                        <p
                          className="text-xs font-medium mb-1"
                          style={{ color: 'rgba(255,255,255,0.55)' }}
                        >
                          SIWEプロトコル認証
                        </p>
                        <p
                          className="text-[11px] leading-relaxed"
                          style={{ color: 'rgba(255,255,255,0.25)' }}
                        >
                          ウォレット署名によるゼロ知識認証。<br />
                          資産の移動は一切ありません。
                        </p>
                      </div>
                    </div>

                    {/* Security badges */}
                    <div className="flex gap-2 mt-4">
                      {['Non-custodial', 'Zero-knowledge', 'EIP-4361'].map((badge) => (
                        <span
                          key={badge}
                          className="text-[8px] font-mono tracking-wider px-2 py-1 rounded-md"
                          style={{
                            background: 'rgba(16,185,129,0.06)',
                            color: 'rgba(16,185,129,0.5)',
                            border: '1px solid rgba(16,185,129,0.12)',
                          }}
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Connect button */}
                  <div className="flex justify-center">
                    <ConnectButton
                      label="ウォレットを接続"
                      accountStatus="address"
                      showBalance={false}
                      chainStatus="none"
                    />
                  </div>

                  {/* Connected state */}
                  <AnimatePresence>
                    {isConnected && !web3Loading && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-3"
                      >
                        {/* Wallet address pill */}
                        <div
                          className="rounded-xl px-4 py-3 flex items-center gap-3"
                          style={{
                            background: 'rgba(16,185,129,0.05)',
                            border: '1px solid rgba(16,185,129,0.15)',
                          }}
                        >
                          <motion.span
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ repeat: Infinity, duration: 1.6 }}
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: '#10B981' }}
                          />
                          <p
                            className="text-xs font-mono truncate"
                            style={{ color: 'rgba(16,185,129,0.7)' }}
                          >
                            {address}
                          </p>
                        </div>
                        <SubmitBtn loading={false} onClick={handleWeb3SignIn}>
                          署名してアクセス →
                        </SubmitBtn>
                      </motion.div>
                    )}
                    {web3Loading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center gap-3 py-2"
                        style={{ color: 'rgba(16,185,129,0.65)' }}
                      >
                        <motion.svg
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                          width="14" height="14" viewBox="0 0 24 24" fill="none"
                        >
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" opacity={0.2} />
                          <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </motion.svg>
                        <span className="text-xs font-mono tracking-wider">署名を確認中…</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Bottom metric strip ── */}
            <div className="mt-8">
              <MetricStrip />
            </div>
          </div>
        </div>

        {/* Footer */}
        <p
          className="text-center text-[9px] mt-5 tracking-[0.28em] font-mono uppercase"
          style={{ color: 'rgba(255,255,255,0.1)' }}
        >
          HAIS · 医療機関向け高度セキュアシステム · v2.0
        </p>
      </motion.div>
    </>
  );
}

// ─── Main Page Wrapper with Suspense ──────────────────────────────────────────
export default function SignInPage() {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: '#04080C' }}
    >
      <NeuralCanvas />
      <GrainOverlay />

      <div
        className="fixed pointer-events-none"
        style={{
          top: '-120px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '400px',
          background:
            'radial-gradient(ellipse at 50% 30%, rgba(16,185,129,0.07) 0%, transparent 65%)',
          zIndex: 0,
        }}
      />

      <Suspense fallback={
        <div className="relative z-10 w-full max-w-[420px] mx-4 flex justify-center items-center h-64">
           <motion.svg
              animate={{ rotate: 360 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
              width="24" height="24" viewBox="0 0 24 24" fill="none"
            >
              <circle cx="12" cy="12" r="10" stroke="rgba(16,185,129,0.2)" strokeWidth="3" />
              <path fill="rgba(16,185,129,0.8)" d="M4 12a8 8 0 018-8v8H4z" />
            </motion.svg>
        </div>
      }>
        <SignInContent />
      </Suspense>
    </div>
  );
}