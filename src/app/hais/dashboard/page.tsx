'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ChevronRight,
  Building2,
  UserX,
  X,
  Calendar,
  MessageSquare,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  Heart,
  LogOut,
} from 'lucide-react';

// 真実のコード（承認カードコンポーネント）のインポート
import { CareActionApprovalCard } from '@/components/approval/CareActionApprovalCard';

// ════════════════════════════════════════════════════════════════════════════
// Design tokens — unified with the auth screens (Cyber-Organic / Tech-noir)
// ════════════════════════════════════════════════════════════════════════════
const C = {
  base: '#05070A',
  surface: 'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.08)',
  safe: '#10B981',
  danger: '#F43F5E',
  caution: '#F59E0B',
};

// ─── Custom SVG Icons ─────────────────────────────────────────────────────────
const AIBrainIcon = () => (
  <svg viewBox="0 0 32 32" className="w-6 h-6" fill="none">
    <defs>
      <linearGradient id="ai-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#10b981" />
      </linearGradient>
    </defs>
    <path
      d="M16 4C12 4 9 7 9 10C7 10 5 12 5 15C5 18 7 20 9 20C9 23 12 26 16 26C20 26 23 23 23 20C25 20 27 18 27 15C27 12 25 10 23 10C23 7 20 4 16 4Z"
      stroke="url(#ai-grad)" strokeWidth="1.5" fill="url(#ai-grad)" fillOpacity="0.1"
    />
    <circle cx="12" cy="12" r="1.5" fill="url(#ai-grad)" />
    <circle cx="20" cy="12" r="1.5" fill="url(#ai-grad)" />
    <circle cx="16" cy="16" r="2" fill="url(#ai-grad)" />
    <circle cx="12" cy="20" r="1.5" fill="url(#ai-grad)" />
    <circle cx="20" cy="20" r="1.5" fill="url(#ai-grad)" />
    <path d="M12 12L16 16L20 12" stroke="url(#ai-grad)" strokeWidth="1" opacity="0.6" />
    <path d="M12 20L16 16L20 20" stroke="url(#ai-grad)" strokeWidth="1" opacity="0.6" />
  </svg>
);

const IntegrityIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
    <defs>
      <linearGradient id="integrity-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>
    </defs>
    <path
      d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z"
      stroke="url(#integrity-grad)" strokeWidth="1.5" fill="url(#integrity-grad)" fillOpacity="0.1"
    />
    <path d="M8 12L11 15L16 9" stroke="url(#integrity-grad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function BreathingBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" style={{ background: C.base }}>
      <motion.div
        className="absolute rounded-full"
        style={{
          top: '-10%', left: '20%',
          width: 520, height: 520,
          background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          bottom: '-15%', right: '15%',
          width: 460, height: 460,
          background: 'radial-gradient(circle, rgba(244,63,94,0.04) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{ scale: [1.05, 1, 1.05], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────
const DEPARTMENTS = [
  { name: 'エンジニアリング', nameEn: 'Engineering', score: 42, risk: 'Critical', debt: 12500000, members: 24 },
  { name: '営業', nameEn: 'Sales', score: 88, risk: 'Safe', debt: 0, members: 18 },
  { name: 'マーケティング', nameEn: 'Marketing', score: 65, risk: 'Caution', debt: 4200000, members: 12 },
  { name: 'カスタマーサクセス', nameEn: 'CS', score: 58, risk: 'Caution', debt: 6800000, members: 15 },
  { name: '人事・総務', nameEn: 'HR', score: 72, risk: 'Safe', debt: 1500000, members: 8 },
];

const RISKY_EMPLOYEES = [
  { id: 'EMP-8823', employeeName: 'Hideki Tamae (Genesis)', neuralState: 'STRESSED', audioSizeBytes: 12400, analysisReason: '音声バイオマーカー異常：高周波帯域の減衰および発話テンポの遅延から重度の抑うつ・精神的疲労を検出。', createdAt: '2026-06-10' },
  { id: 'EMP-9102', employeeName: 'Anonymous Developer', neuralState: 'CRITICAL', audioSizeBytes: 8400, analysisReason: '過重労働および時間外動態アラート：連続稼働120時間超、バイタルリズムの同期不全。', createdAt: '2026-06-10' },
];

type Employee = typeof RISKY_EMPLOYEES[0];

const RiskBadge = ({ risk }: { risk: string }) => {
  const styles = {
    Critical: 'bg-rose-500 text-white',
    Caution: 'bg-yellow-500 text-yellow-950',
    Safe: 'bg-emerald-500 text-emerald-950',
  };
  const labels = { Critical: '危険', Caution: '注意', Safe: '良好' };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${styles[risk as keyof typeof styles] || styles.Critical}`}>
      {labels[risk as keyof typeof labels] || '注意'}
    </span>
  );
};

const ActionConfirmModal = ({
  actionType, onClose, onConfirm,
}: { actionType: string; onClose: () => void; onConfirm: () => void }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
      setTimeout(onConfirm, 1500);
    }, 2000);
  };

  const actionDetails = {
    'ai-recommendation': {
      title: 'AIレコメンデーション一括実行',
      desc: 'エンジニアリング部門全体へのケアアクションを一括で最適化します。',
      items: ['対象部署: エンジニアリング（24名）', '実施期間: 2週間', '予測効果: 離職リスク45%低減', '推定コスト削減: ¥1,125万'],
    },
  };

  const details = actionDetails[actionType as keyof typeof actionDetails] || actionDetails['ai-recommendation'];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 12 }}
        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
        className="rounded-2xl w-full max-w-md overflow-hidden"
        style={{ background: '#0A0D12', border: `1px solid ${C.border}`, boxShadow: '0 40px 90px rgba(0,0,0,0.7)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {!isComplete ? (
          <>
            <div className="p-6 border-b" style={{ borderColor: C.border }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 rounded-xl"><Calendar className="w-6 h-6 text-emerald-400" /></div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">{details.title}</h2>
                    <p className="text-sm text-slate-400 mt-1">アクション確認</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors" disabled={isProcessing}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-slate-300 text-sm leading-relaxed">{details.desc}</p>
              <div className="mt-4 p-4 rounded-xl space-y-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
                {details.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /><span className="text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={onClose} disabled={isProcessing} className="flex-1 px-4 py-3 border border-white/8 text-slate-300 rounded-xl hover:bg-white/5 transition-colors disabled:opacity-50">
                  キャンセル
                </button>
                <button onClick={handleConfirm} disabled={isProcessing} className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {isProcessing ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                      処理中...
                    </>
                  ) : '実行する'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }} className="w-20 h-20 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </motion.div>
            <h3 className="text-xl font-semibold text-white mb-2">アクション完了</h3>
            <p className="text-slate-400 text-sm">一括レコメンデーションが正常に送信されました。</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const AnimatedCounter = ({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const duration = 1500, steps = 60, increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <span className="font-mono">{prefix}{count.toLocaleString()}{suffix}</span>;
};

const LiveVitalChart = () => (
  <div className="relative h-28 w-full overflow-hidden rounded-lg border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: C.border }}>
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="vitalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.g animate={{ scaleY: [1, 1.06, 1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '50% 50%' }}>
        <motion.path d="M0,50 Q20,40 40,55 T80,45 T120,55 T160,40 T200,50 L200,100 L0,100 Z" fill="url(#vitalGradient)" initial={{ x: 0 }} animate={{ x: -200 }} transition={{ repeat: Infinity, ease: 'linear', duration: 4 }} />
        <motion.path d="M0,50 Q20,40 40,55 T80,45 T120,55 T160,40 T200,50" fill="none" stroke="#10b981" strokeWidth="2" initial={{ x: 0 }} animate={{ x: -200 }} transition={{ repeat: Infinity, ease: 'linear', duration: 4 }} />
      </motion.g>
    </svg>
    <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#05070A] to-transparent" />
    <div className="absolute bottom-2 left-3 text-[10px] font-mono text-emerald-400/60">リアルタイム生体モニター</div>
  </div>
);

const AuthLoading = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: C.base }}>
    <motion.div className="flex flex-col items-center gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div
        className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-400"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <p className="text-emerald-400/60 font-mono text-xs tracking-widest">認証を確認中...</p>
    </motion.div>
  </div>
);

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [showActionConfirm, setShowActionConfirm] = useState(false);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/hais/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') return <AuthLoading />;
  if (status === 'unauthenticated') return <AuthLoading />;

  const handleAIAction = () => { setActionType('ai-recommendation'); setShowActionConfirm(true); };
  const handleConfirmAction = () => { setShowActionConfirm(false); setActionType(''); };

  const totalDebt = DEPARTMENTS.reduce((sum, d) => sum + d.debt, 0);
  const avgScore = Math.round(DEPARTMENTS.reduce((sum, d) => sum + d.score, 0) / DEPARTMENTS.length);

  const userEmail = session?.user?.email ?? '';
  const userWallet = (session?.user as any)?.walletAddress ?? '';
  const displayName = userEmail
    ? userEmail.split('@')[0]
    : userWallet
    ? `${userWallet.slice(0, 6)}…${userWallet.slice(-4)}`
    : 'User';
  const avatarInitial = (displayName[0] ?? 'U').toUpperCase();

  return (
    <div className="min-h-screen text-slate-200 font-sans selection:bg-emerald-500/30" style={{ background: C.base }}>
      <BreathingBackground />

      {/* Modals */}
      <AnimatePresence>
        {showActionConfirm && (
          <ActionConfirmModal actionType={actionType} onClose={() => setShowActionConfirm(false)} onConfirm={handleConfirmAction} />
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 border-b sticky top-0 z-20 backdrop-blur-md" style={{ borderColor: C.border, background: 'rgba(5,7,10,0.8)' }}>
          <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-white tracking-wide">
                HAIS <span className="text-emerald-400 text-xs font-normal ml-1">Enterprise</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono -mt-0.5">Human Asset Integrity System</div>
            </div>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                システム稼働中
              </div>

              <div className="flex items-center gap-2.5 pl-5 border-l" style={{ borderColor: C.border }}>
                <div className="text-right hidden sm:block">
                  <div className="text-xs text-white font-medium leading-tight">{displayName}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{userWallet ? 'Web3 ID' : 'Email'}</div>
                </div>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium"
                  style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: C.safe }}>
                  {avatarInitial}
                </div>
                <button
                  onClick={() => router.push('/api/auth/signout')}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                  title="サインアウト"
                >
                  <LogOut className="w-4 h-4 text-slate-500 hover:text-slate-300" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Top KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Organization Score */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="md:col-span-4 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group"
                style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <h3 className="text-slate-400 text-xs uppercase tracking-widest mb-4 flex items-center gap-2"><IntegrityIcon /> 組織健全性スコア</h3>
                <div className="flex items-end gap-4">
                  <div className="text-6xl font-light text-white tracking-tighter">{avgScore}<span className="text-2xl text-slate-500">/100</span></div>
                  <div className={`text-xs mb-2 font-bold px-2 py-1 rounded ${avgScore >= 70 ? 'bg-emerald-500/20 text-emerald-400' : avgScore >= 50 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {avgScore >= 70 ? '良好' : avgScore >= 50 ? '要注意' : '危険'}
                  </div>
                </div>
                <div className="mt-4 h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-rose-500 via-yellow-500 to-emerald-500"
                    initial={{ width: 0 }} animate={{ width: `${avgScore}%` }} transition={{ duration: 1.2, ease: 'easeOut' }} />
                </div>
              </motion.div>

              {/* Hidden Debt */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="md:col-span-5 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group"
                style={{ background: C.surface, border: '1px solid rgba(244,63,94,0.18)' }}>
                <motion.div className="absolute -right-10 -top-10 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
                <h3 className="text-rose-400 text-xs uppercase tracking-widest mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> 未認識債務（HIDDEN DEBT）</h3>
                <div className="text-4xl md:text-5xl font-mono text-white tracking-tighter">¥<AnimatedCounter value={totalDebt} /></div>
                <p className="mt-3 text-xs text-slate-400 leading-relaxed">高リスク従業員が30日以内に離職した場合の<br />推定損失額（採用・教育・機会損失含む）</p>
              </motion.div>

              {/* Live Vital */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="md:col-span-3 rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-between"
                style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <h3 className="text-emerald-400 text-xs uppercase tracking-widest mb-3 flex items-center gap-2"><Activity className="w-4 h-4" /> 組織バイタル</h3>
                <LiveVitalChart />
                <div className="mt-3 flex justify-between text-[10px] font-mono text-slate-500"><span>ストレス: 低</span><span>バイタル: 正常</span></div>
              </motion.div>
            </div>

            {/* Heatmap & Active Verification Logs (融合エリア) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Heatmap */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                className="rounded-2xl p-6 backdrop-blur-sm" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-slate-300 text-sm uppercase tracking-widest flex items-center gap-2"><Building2 className="w-4 h-4" /> 部署別ヒートマップ</h3>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>良好</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span>注意</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span>危険</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {DEPARTMENTS.map((dept, i) => (
                    <motion.div key={dept.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }} whileHover={{ scale: 1.01 }}
                      className={`p-4 rounded-xl border relative overflow-hidden cursor-pointer transition-all ${dept.risk === 'Critical' ? 'border-rose-500/40 bg-rose-500/5 hover:bg-rose-500/10' : dept.risk === 'Caution' ? 'border-yellow-500/40 bg-yellow-500/5 hover:bg-yellow-500/10' : 'border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${dept.risk === 'Critical' ? 'bg-rose-500 text-white' : dept.risk === 'Caution' ? 'bg-yellow-500 text-yellow-950' : 'bg-emerald-500 text-emerald-950'}`}>{dept.score}</div>
                          <div><div className="text-sm font-medium text-white">{dept.name}</div><div className="text-[10px] text-slate-500">{dept.members}名</div></div>
                        </div>
                        <div className="text-right">
                          <RiskBadge risk={dept.risk} />
                          {dept.debt > 0 && <div className="text-xs font-mono text-rose-400 mt-1">¥{(dept.debt / 10000).toFixed(0)}万</div>}
                        </div>
                      </div>
                      <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-500 ${dept.risk === 'Critical' ? 'bg-rose-500' : dept.risk === 'Caution' ? 'bg-yellow-500' : 'bg-emerald-500'}`} style={{ width: `${dept.score}%` }} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Right Column: Web3 Verification Terminal (真実のコード統合) */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                className="rounded-2xl p-6 backdrop-blur-sm flex flex-col" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-cyan-400 text-sm uppercase tracking-widest flex items-center gap-2"><UserX className="w-4 h-4" /> PENDING_CARE_ACTIONS</h3>
                  <span className="bg-cyan-500/20 text-cyan-400 text-xs px-3 py-1 rounded-full font-mono font-bold">{RISKY_EMPLOYEES.length} AUTHS</span>
                </div>
                
                {/* スクリプトエラーを起こさないよう、スクロールエリアに承認カード群をマウント */}
                <div className="flex-1 space-y-4 overflow-y-auto pr-2 max-h-[500px]">
                  {RISKY_EMPLOYEES.map((action) => (
                    <div key={action.id} className="relative group">
                      <CareActionApprovalCard 
                        action={action} 
                        onSuccess={() => {
                          console.log(`Action ${action.id} approved successfully on-chain.`);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* AI Recommendation */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              className="rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              style={{ background: 'linear-gradient(90deg, rgba(16,185,129,0.08), rgba(255,255,255,0.02))', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20"><AIBrainIcon /></div>
                <div>
                  <h4 className="text-white text-sm font-semibold flex items-center gap-2">AIレコメンデーション<span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">NEW</span></h4>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">現在のリスクレベルに基づき、<strong className="text-white">エンジニアリング部門</strong>への「一括ケア判定」を走らせることで、組織健全性を維持できます。</p>
                </div>
              </div>
              <button onClick={handleAIAction} className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] whitespace-nowrap">アクション実行</button>
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t px-6 py-4" style={{ borderColor: C.border, background: 'rgba(5,7,10,0.5)' }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span>© 2026 ACES CARE HUB JAPAN</span>
              <span className="text-slate-700">|</span>
              <span>HAIS Enterprise Dashboard v3.5</span>
            </div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span><span>全システム正常稼働</span></div>
          </div>
        </footer>
      </div>
    </div>
  );
}