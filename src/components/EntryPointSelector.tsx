// components/EntryPointSelector.tsx

'use client';

import Link from 'next/link';
import { ArrowRight, HeartPulse, BookOpen, Compass } from 'lucide-react';

// トップページには複数の導線（無料診断／書籍読者向けトークン受け取り／SOLUNA自体の説明）が
// 縦に並んでおり、初回訪問者がどれが自分向けか選びにくい状態だった。
// 既存の各セクション・導線は一切変更せず、Hero直下に「入口の道案内」だけを追加する。
const ENTRY_POINTS = [
  {
    icon: HeartPulse,
    title: '無料診断を受ける',
    desc: '人生で背負ってきた重さを、科学的エビデンスに基づいて数値化',
    href: 'https://omori-hensachi.vercel.app',
    external: true,
    accent: 'from-purple-500/10 to-indigo-500/10 border-purple-500/20 hover:border-purple-400/40',
  },
  {
    icon: BookOpen,
    title: '書籍の読者の方はこちら',
    desc: 'Amazon購入履歴・Kindle Unlimitedでトークンを無料受け取り',
    href: '/tester-claim',
    external: false,
    accent: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 hover:border-emerald-400/40',
  },
  {
    icon: Compass,
    title: 'SOLUNA / HAISを詳しく知る',
    desc: 'ケアを記録し、支援につなげる仕組みそのものを見る',
    href: '/hais',
    external: false,
    accent: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20 hover:border-cyan-400/40',
  },
];

export default function EntryPointSelector() {
  return (
    <section className="relative py-14 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <p className="text-center text-gray-500 text-xs font-mono tracking-widest uppercase mb-6">
          今日、何をしにいらっしゃいましたか？
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ENTRY_POINTS.map((ep) => {
            const Icon = ep.icon;
            const content = (
              <div
                className={`group h-full flex flex-col gap-3 p-6 rounded-2xl border bg-gradient-to-br ${ep.accent} backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5`}
              >
                <Icon className="w-6 h-6 text-white/70 group-hover:text-white transition-colors" />
                <div className="text-white font-semibold text-base">{ep.title}</div>
                <p className="text-gray-400 text-sm leading-relaxed flex-1">{ep.desc}</p>
                <span className="inline-flex items-center gap-1 text-xs text-gray-300 group-hover:text-white transition-colors">
                  進む <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            );

            return ep.external ? (
              <a key={ep.title} href={ep.href} target="_blank" rel="noopener noreferrer">
                {content}
              </a>
            ) : (
              <Link key={ep.title} href={ep.href}>
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
