'use client';

import React, { useState, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSignMessage } from 'wagmi';
import { SiweMessage } from 'siwe';

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3;
type RegMethod = 'email' | 'web3';

// ─── Animated waveform logo ───────────────────────────────────────────────────
function WaveformMark({ size = 28 }: { size?: number }) {
  const bars = [4, 8, 14, 11, 7, 12, 5];
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      {bars.map((h, i) => (
        <rect
          key={i}
          x={i * 4}
          y={(28 - h) / 2}
          width={2.4}
          height={h}
          rx={1.2}
          fill="#10B981"
          opacity={0.7 + i * 0.04}
        />
      ))}
    </svg>
  );
}

// ─── Canvas noise / grain background ─────────────────────────────────────────
function GrainCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = el.getContext('2d')!;
    let raf: number;
    const draw = () => {
      el.width = window.innerWidth;
      el.height = window.innerHeight;
      const img = ctx.createImageData(el.width, el.height);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 18;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 22;
      }
      ctx.putImageData(img, 0, 0);
      raf = setTimeout(() => requestAnimationFrame(draw), 80) as unknown as number;
    };
    draw();
    return () => clearTimeout(raf);
  }, []);
  return (
    <canvas
      ref={ref}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, mixBlendMode: 'overlay' }}
    />
  );
}

// ─── Subtle animated grid ─────────────────────────────────────────────────────
function GridBg() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(16,185,129,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(16,185,129,0.035) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 80%)',
      }}
    />
  );
}

// ─── Step stepper ─────────────────────────────────────────────────────────────
function Stepper({ current, total }: { current: Step; total: number }) {
  const labels = ['認証方法', '情報入力', '確認・同意'];
  return (
    <div className="flex items-center justify-between mb-10 relative">
      {/* connector line */}
      <div
        className="absolute h-px top-4 left-4 right-4"
        style={{ background: 'rgba(255,255,255,0.06)', zIndex: 0 }}
      />
      <motion.div
        className="absolute h-px top-4 left-4"
        style={{ background: 'rgba(16,185,129,0.4)', zIndex: 1 }}
        animate={{ width: `${((current - 1) / (total - 1)) * (100 - 8)}%` }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      />
      {Array.from({ length: total }, (_, i) => {
        const s = (i + 1) as Step;
        const done = s < current;
        const active = s === current;
        return (
          <div key={s} className="flex flex-col items-center gap-2 relative z-10">
            <motion.div
              animate={{
                background: done
                  ? '#10B981'
                  : active
                  ? 'rgba(16,185,129,0.15)'
                  : 'rgba(255,255,255,0.04)',
                borderColor: done || active
                  ? '#10B981'
                  : 'rgba(255,255,255,0.1)',
                scale: active ? 1.15 : 1,
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              className="w-8 h-8 rounded-full flex items-center justify-center border"
              style={{ border: '1px solid' }}
            >
              {done ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span
                  className="text-[10px] font-mono"
                  style={{ color: active ? '#10B981' : 'rgba(255,255,255,0.2)' }}
                >
                  {s}
                </span>
              )}
            </motion.div>
            <span
              className="text-[9px] tracking-widest font-mono uppercase whitespace-nowrap"
              style={{ color: active ? 'rgba(16,185,129,0.8)' : 'rgba(255,255,255,0.2)' }}
            >
              {labels[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Input field ──────────────────────────────────────────────────────────────
function Field({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  hint,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;

  return (
    <div className="relative">
      <div className="relative">
        <label
          className="absolute left-4 transition-all duration-200 pointer-events-none font-mono"
          style={{
            top: focused || hasValue ? '8px' : '50%',
            transform: focused || hasValue ? 'translateY(0) scale(0.78)' : 'translateY(-50%)',
            transformOrigin: 'left',
            fontSize: '11px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: focused
              ? 'rgba(16,185,129,0.7)'
              : hasValue
              ? 'rgba(255,255,255,0.25)'
              : 'rgba(255,255,255,0.2)',
            zIndex: 1,
          }}
        >
          {label}
        </label>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={focused || hasValue ? placeholder : ''}
          autoComplete={autoComplete}
          className="w-full rounded-2xl text-sm text-white outline-none transition-all duration-200"
          style={{
            paddingTop: '22px',
            paddingBottom: '10px',
            paddingLeft: '16px',
            paddingRight: '16px',
            background: focused
              ? 'rgba(16,185,129,0.04)'
              : 'rgba(255,255,255,0.03)',
            border: focused
              ? '1px solid rgba(16,185,129,0.35)'
              : '1px solid rgba(255,255,255,0.07)',
            boxShadow: focused
              ? 'inset 0 1px 2px rgba(0,0,0,0.3), 0 0 0 3px rgba(16,185,129,0.05)'
              : 'inset 0 1px 2px rgba(0,0,0,0.2)',
            caretColor: '#10B981',
            color: 'rgba(255,255,255,0.85)',
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
      {hint && (
        <p
          className="text-[9px] mt-1.5 pl-1 font-mono leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.18)', letterSpacing: '0.05em' }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

// ─── Password strength ────────────────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const meta = [
    { label: '弱い', color: '#F43F5E' },
    { label: '普通', color: '#F59E0B' },
    { label: '強い', color: '#10B981' },
    { label: '最強', color: '#10B981' },
  ];
  if (!password) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2.5 px-1"
    >
      <div className="flex gap-1 mb-1.5">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={{ background: i < score ? meta[score - 1].color : 'rgba(255,255,255,0.07)' }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            className="flex-1 h-0.5 rounded-full"
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-mono tracking-widest" style={{ color: meta[score - 1]?.color || 'transparent' }}>
          {meta[score - 1]?.label || ''}
        </p>
        <div className="flex gap-2">
          {['8文字以上', '大文字', '数字', '記号'].map((hint, i) => (
            <span
              key={i}
              className="text-[8px] font-mono"
              style={{ color: checks[i] ? 'rgba(16,185,129,0.6)' : 'rgba(255,255,255,0.1)' }}
            >
              {hint}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Method card ──────────────────────────────────────────────────────────────
function MethodCard({
  active,
  onClick,
  icon,
  title,
  subtitle,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="w-full rounded-2xl p-4 text-left transition-all duration-300 relative overflow-hidden group"
      style={{
        background: active
          ? 'rgba(16,185,129,0.06)'
          : 'rgba(255,255,255,0.02)',
        border: active
          ? '1px solid rgba(16,185,129,0.28)'
          : '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* hover shimmer */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            'linear-gradient(105deg, transparent 40%, rgba(16,185,129,0.03) 50%, transparent 60%)',
        }}
      />
      <div className="flex items-center gap-4 relative z-10">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
          style={{
            background: active
              ? 'rgba(16,185,129,0.12)'
              : 'rgba(255,255,255,0.04)',
            border: active
              ? '1px solid rgba(16,185,129,0.2)'
              : '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p
              className="text-sm font-medium"
              style={{ color: active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)' }}
            >
              {title}
            </p>
            {badge && (
              <span
                className="text-[8px] font-mono tracking-widest px-1.5 py-0.5 rounded-full uppercase"
                style={{
                  background: 'rgba(16,185,129,0.1)',
                  color: 'rgba(16,185,129,0.7)',
                  border: '1px solid rgba(16,185,129,0.2)',
                }}
              >
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.22)' }}>
            {subtitle}
          </p>
        </div>
        <motion.div
          animate={{
            background: active ? '#10B981' : 'transparent',
            borderColor: active ? '#10B981' : 'rgba(255,255,255,0.15)',
          }}
          className="w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0"
          style={{ border: '1px solid' }}
        >
          {active && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-1.5 h-1.5 rounded-full bg-white"
            />
          )}
        </motion.div>
      </div>
    </motion.button>
  );
}

// ─── Primary button ───────────────────────────────────────────────────────────
function PrimaryBtn({
  onClick,
  disabled,
  loading,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      whileTap={!disabled ? { scale: 0.97 } : {}}
      onClick={onClick}
      disabled={disabled}
      className="relative flex-1 py-3.5 rounded-2xl text-sm font-medium overflow-hidden"
      style={{
        background: disabled
          ? 'rgba(16,185,129,0.12)'
          : 'linear-gradient(135deg, #12c995 0%, #059669 100%)',
        color: disabled ? 'rgba(255,255,255,0.25)' : 'white',
        boxShadow: disabled ? 'none' : '0 6px 28px rgba(16,185,129,0.22), inset 0 1px 0 rgba(255,255,255,0.15)',
        letterSpacing: '0.02em',
      }}
    >
      {!disabled && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.07) 50%, transparent 65%)',
          }}
        />
      )}
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="white" strokeWidth="3" />
            <path className="opacity-80" fill="white" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          処理中…
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}

// ─── Ghost button ─────────────────────────────────────────────────────────────
function GhostBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 py-3.5 rounded-2xl text-sm transition-all duration-200"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        color: 'rgba(255,255,255,0.3)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)';
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.12)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.3)';
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)';
      }}
    >
      {children}
    </button>
  );
}

// ─── Error banner ─────────────────────────────────────────────────────────────
function ErrorBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -4, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden mb-5"
    >
      <div
        className="rounded-xl px-4 py-3 flex items-center gap-3 text-xs"
        style={{
          background: 'rgba(244,63,94,0.06)',
          border: '1px solid rgba(244,63,94,0.18)',
          color: 'rgba(251,113,133,0.9)',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {message}
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [method, setMethod] = useState<RegMethod>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [web3Loading, setWeb3Loading] = useState(false);

  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const validateStep1 = () => {
    if (method === 'email') {
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        setError('有効なメールアドレスを入力してください。');
        return false;
      }
      if (password.length < 8) {
        setError('パスワードは8文字以上にしてください。');
        return false;
      }
      if (password !== confirmPassword) {
        setError('パスワードが一致しません。');
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleEmailRegister = async () => {
    if (!agreed) { setError('利用規約への同意が必要です。'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'アカウント作成に失敗しました。'); setLoading(false); return; }
      const result = await signIn('credentials', { email, password, redirect: false, callbackUrl: '/hais/dashboard' });
      if (result?.url) router.push(result.url);
      else setError('自動ログインに失敗しました。');
    } catch { setError('ネットワークエラーが発生しました。'); }
    finally { setLoading(false); }
  };

  const handleWeb3Register = async () => {
    if (!address || !agreed) { if (!agreed) setError('利用規約への同意が必要です。'); return; }
    setWeb3Loading(true);
    setError('');
    try {
      const { nonce } = await (await fetch('/api/auth/nonce')).json();
      const siweMsg = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'HAISアカウントを作成します。',
        uri: window.location.origin,
        version: '1',
        chainId: 1,
        nonce,
      });
      const message = siweMsg.prepareMessage();
      const signature = await signMessageAsync({ message });
      const result = await signIn('web3', { message: JSON.stringify(siweMsg), signature, redirect: false, callbackUrl: '/hais/dashboard' });
      if (result?.error) setError('ウォレット認証に失敗しました。');
      else if (result?.url) router.push(result.url);
    } catch (err: any) {
      setError(err?.code === 4001 ? '署名がキャンセルされました。' : 'ウォレット認証中にエラーが発生しました。');
    } finally { setWeb3Loading(false); }
  };

  const pageVariants = {
    initial: (dir: number) => ({ opacity: 0, x: dir * 24, filter: 'blur(2px)' }),
    animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
    exit: (dir: number) => ({ opacity: 0, x: dir * -24, filter: 'blur(2px)' }),
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden py-10"
      style={{ background: '#050809' }}
    >
      {/* Layered ambient light */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 900px 600px at 20% 110%, rgba(16,185,129,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 600px 400px at 80% -10%, rgba(16,185,129,0.04) 0%, transparent 60%),
            radial-gradient(ellipse 400px 400px at 50% 50%, rgba(255,255,255,0.01) 0%, transparent 70%)
          `,
          zIndex: 0,
        }}
      />
      <GridBg />
      <GrainCanvas />

      {/* Brand mark */}
      <div className="fixed top-7 left-8 z-20 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{
            background: 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.18)',
          }}
        >
          <WaveformMark size={16} />
        </div>
        <div className="flex flex-col">
          <span
            className="text-[11px] font-semibold tracking-[0.3em] uppercase"
            style={{ color: 'rgba(255,255,255,0.5)', fontFamily: '"DM Mono", monospace', lineHeight: 1 }}
          >
            HAIS
          </span>
          <span
            className="text-[8px] tracking-[0.2em] uppercase"
            style={{ color: 'rgba(255,255,255,0.18)', fontFamily: '"DM Mono", monospace' }}
          >
            Health Analysis
          </span>
        </div>
      </div>

      {/* Already have account */}
      <div className="fixed top-7 right-8 z-20">
        <a
          href="/auth/signin"
          className="flex items-center gap-2 text-xs transition-all duration-200"
          style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.55)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.25)')}
        >
          既にアカウントをお持ちの方
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[440px] mx-4"
      >
        {/* Card glow */}
        <div
          className="absolute -inset-px rounded-[28px] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(16,185,129,0.12) 0%, transparent 60%)',
            zIndex: -1,
          }}
        />

        <div
          className="relative"
          style={{
            background: 'rgba(12,16,20,0.92)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(48px)',
            boxShadow:
              '0 0 0 0.5px rgba(0,0,0,0.6), 0 60px 120px rgba(0,0,0,0.7), 0 24px 48px rgba(0,0,0,0.4)',
          }}
        >
          {/* Top gradient line */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '20%',
              right: '20%',
              height: '1px',
              background:
                'linear-gradient(90deg, transparent, rgba(16,185,129,0.5), transparent)',
              borderRadius: '999px',
            }}
          />

          <div className="p-8 md:p-10">
            {/* Header */}
            <div className="mb-8 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
                style={{
                  background: 'rgba(16,185,129,0.07)',
                  border: '1px solid rgba(16,185,129,0.18)',
                }}
              >
                <motion.span
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#10B981' }}
                />
                <span
                  className="text-[9px] font-mono tracking-[0.25em] uppercase"
                  style={{ color: 'rgba(16,185,129,0.75)' }}
                >
                  System Online
                </span>
              </motion.div>

              <h1
                className="text-[26px] font-light text-white mb-1.5"
                style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  letterSpacing: '-0.03em',
                  textShadow: '0 0 60px rgba(16,185,129,0.08)',
                }}
              >
                {step === 1 && 'アカウント作成'}
                {step === 2 && '情報を入力'}
                {step === 3 && '確認・同意'}
              </h1>
              <p
                className="text-sm"
                style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.03em' }}
              >
                {step === 1 && '認証方法を選択してください'}
                {step === 2 && 'アカウント情報を入力してください'}
                {step === 3 && '内容を確認して登録を完了してください'}
              </p>
            </div>

            {/* Stepper */}
            <Stepper current={step} total={3} />

            {/* Error */}
            <AnimatePresence>
              {error && <ErrorBanner message={error} />}
            </AnimatePresence>

            {/* Steps */}
            <AnimatePresence mode="wait" custom={1}>
              {/* ── Step 1: Method ── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={-1}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.28 }}
                  className="space-y-3"
                >
                  <MethodCard
                    active={method === 'email'}
                    onClick={() => setMethod('email')}
                    title="メールアドレス"
                    subtitle="メール＋パスワードで登録"
                    icon={
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke={method === 'email' ? '#10B981' : 'rgba(255,255,255,0.25)'}
                        strokeWidth="1.5">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    }
                  />
                  <MethodCard
                    active={method === 'web3'}
                    onClick={() => setMethod('web3')}
                    title="Web3 ウォレット"
                    subtitle="ウォレット署名で登録"
                    badge="推奨"
                    icon={
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke={method === 'web3' ? '#10B981' : 'rgba(255,255,255,0.25)'}
                        strokeWidth="1.5">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                    }
                  />

                  <div className="pt-2">
                    <PrimaryBtn onClick={() => { setError(''); setStep(2); }}>
                      次へ →
                    </PrimaryBtn>
                  </div>
                </motion.div>
              )}

              {/* ── Step 2: Details ── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={1}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.28 }}
                  className="space-y-4"
                >
                  {method === 'email' ? (
                    <>
                      <Field
                        label="Email"
                        type="email"
                        value={email}
                        onChange={setEmail}
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                      <div>
                        <Field
                          label="Password"
                          type="password"
                          value={password}
                          onChange={setPassword}
                          placeholder="8文字以上"
                          autoComplete="new-password"
                        />
                        <PasswordStrength password={password} />
                      </div>
                      <Field
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        placeholder="パスワードを再入力"
                        autoComplete="new-password"
                      />
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div
                        className="rounded-2xl p-6 text-center"
                        style={{
                          background: 'rgba(255,255,255,0.015)',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        <div
                          className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                          style={{
                            background: 'rgba(16,185,129,0.07)',
                            border: '1px solid rgba(16,185,129,0.18)',
                          }}
                        >
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                          </svg>
                        </div>
                        <p className="text-xs leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          ウォレットを接続すると、署名によって<br />
                          <span style={{ color: 'rgba(255,255,255,0.5)' }}>新規アカウントが自動生成</span>されます。
                        </p>
                        <div className="flex justify-center">
                          <ConnectButton
                            label="ウォレットを接続"
                            accountStatus="address"
                            showBalance={false}
                            chainStatus="none"
                          />
                        </div>
                      </div>
                      <AnimatePresence>
                        {isConnected && (
                          <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className="rounded-xl px-4 py-3 flex items-center gap-3"
                            style={{
                              background: 'rgba(16,185,129,0.05)',
                              border: '1px solid rgba(16,185,129,0.18)',
                            }}
                          >
                            <motion.span
                              animate={{ opacity: [1, 0.3, 1] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ background: '#10B981' }}
                            />
                            <p className="text-xs font-mono truncate" style={{ color: 'rgba(16,185,129,0.75)' }}>
                              {address}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <GhostBtn onClick={() => { setError(''); setStep(1); }}>← 戻る</GhostBtn>
                    <PrimaryBtn
                      onClick={() => {
                        if (method === 'email' && !validateStep1()) return;
                        if (method === 'web3' && !isConnected) { setError('ウォレットを接続してください。'); return; }
                        setError(''); setStep(3);
                      }}
                    >
                      次へ →
                    </PrimaryBtn>
                  </div>
                </motion.div>
              )}

              {/* ── Step 3: Confirm ── */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={1}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.28 }}
                  className="space-y-4"
                >
                  {/* Summary */}
                  <div
                    className="rounded-2xl p-5 space-y-3"
                    style={{
                      background: 'rgba(255,255,255,0.015)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <p
                      className="text-[9px] tracking-[0.2em] font-mono uppercase mb-4"
                      style={{ color: 'rgba(255,255,255,0.2)' }}
                    >
                      登録内容の確認
                    </p>
                    <div className="space-y-3">
                      {[
                        ['認証方法', method === 'email' ? 'Email / Password' : 'Web3 Wallet (SIWE)'],
                        method === 'email'
                          ? ['メールアドレス', email]
                          : ['ウォレット', address?.slice(0, 20) + '…' + address?.slice(-6)],
                      ].map(([k, v]) => (
                        <div key={k} className="flex items-center gap-4">
                          <span
                            className="text-[10px] font-mono w-24 flex-shrink-0"
                            style={{ color: 'rgba(255,255,255,0.22)' }}
                          >
                            {k}
                          </span>
                          <div
                            className="flex-1 h-px"
                            style={{ background: 'rgba(255,255,255,0.04)' }}
                          />
                          <span
                            className="text-[11px] font-mono truncate max-w-[180px]"
                            style={{ color: 'rgba(255,255,255,0.55)' }}
                          >
                            {v}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Terms */}
                  <button
                    onClick={() => setAgreed((v) => !v)}
                    className="w-full flex items-start gap-3 text-left py-1 group"
                  >
                    <motion.div
                      animate={{
                        background: agreed ? '#10B981' : 'transparent',
                        borderColor: agreed ? '#10B981' : 'rgba(255,255,255,0.18)',
                      }}
                      className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ border: '1px solid' }}
                    >
                      <AnimatePresence>
                        {agreed && (
                          <motion.svg
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            fill="none"
                          >
                            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </motion.svg>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    <span className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      <a
                        href="/terms"
                        className="transition-colors"
                        style={{ color: 'rgba(16,185,129,0.6)' }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#10B981')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(16,185,129,0.6)')}
                        onClick={(e) => e.stopPropagation()}
                      >
                        利用規約
                      </a>
                      {' '}および{' '}
                      <a
                        href="/privacy"
                        className="transition-colors"
                        style={{ color: 'rgba(16,185,129,0.6)' }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#10B981')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(16,185,129,0.6)')}
                        onClick={(e) => e.stopPropagation()}
                      >
                        プライバシーポリシー
                      </a>
                      に同意します。本システムは医療機関向けの高度セキュア領域です。
                    </span>
                  </button>

                  {/* Security notice */}
                  <div
                    className="rounded-xl px-4 py-3 flex items-start gap-3"
                    style={{
                      background: 'rgba(245,158,11,0.05)',
                      border: '1px solid rgba(245,158,11,0.12)',
                    }}
                  >
                    <svg
                      className="flex-shrink-0 mt-0.5"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="2"
                    >
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(245,158,11,0.55)' }}>
                      無断アクセス及びデータの複製を固く禁じます。すべての操作は記録されます。
                    </p>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <GhostBtn onClick={() => { setError(''); setStep(2); }}>← 戻る</GhostBtn>
                    <PrimaryBtn
                      disabled={!agreed}
                      loading={loading || web3Loading}
                      onClick={method === 'email' ? handleEmailRegister : handleWeb3Register}
                    >
                      登録する
                    </PrimaryBtn>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <p
          className="text-center text-[9px] mt-5 tracking-[0.25em] font-mono uppercase"
          style={{ color: 'rgba(255,255,255,0.1)' }}
        >
          HAIS · 医療機関向け高度セキュアシステム · v2.0
        </p>
      </motion.div>
    </div>
  );
}
