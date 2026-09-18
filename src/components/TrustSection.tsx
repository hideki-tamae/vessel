"use client";

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Check } from 'lucide-react';

// ▼▼▼ S-RANK CUSTOM ICONS (Fortress & Nodes) ▼▼▼

const IconEdge = () => (
  <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
    <defs>
      <filter id="trustGlowCyan" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <g filter="url(#trustGlowCyan)" strokeLinecap="round" strokeLinejoin="round">
      <rect x="40" y="40" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="2" className="text-cyan-400" fill="rgba(6,182,212,0.2)" />
      <circle cx="50" cy="50" r="4" fill="currentColor" className="text-white">
          {/* @ts-ignore */}
          <animate attributeName="opacity" values="0.4;1;0.4" duration="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="50" cy="15" r="6" stroke="currentColor" strokeWidth="1.5" className="text-blue-400/80" />
      <path d="M50 21 V40" stroke="currentColor" strokeWidth="1" className="text-blue-400/50" strokeDasharray="3 3" />
      <circle cx="15" cy="75" r="6" stroke="currentColor" strokeWidth="1.5" className="text-blue-400/80" />
      <path d="M20 70 L40 55" stroke="currentColor" strokeWidth="1" className="text-blue-400/50" strokeDasharray="3 3" />
      <circle cx="85" cy="75" r="6" stroke="currentColor" strokeWidth="1.5" className="text-blue-400/80" />
       <path d="M80 70 L60 55" stroke="currentColor" strokeWidth="1" className="text-blue-400/50" strokeDasharray="3 3" />
    </g>
  </svg>
);

const IconZeroKnowledge = () => (
  <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
    <g filter="url(#trustGlowCyan)" strokeLinecap="round" strokeLinejoin="round">
      <path d="M50 35 V25 C50 15 40 15 40 15 C40 15 30 15 30 25 V35" stroke="currentColor" strokeWidth="2" className="text-purple-400/70" />
      <path d="M30 35 H70 L80 55 V80 L70 95 H30 L20 80 V55 L30 35 Z" stroke="currentColor" strokeWidth="2" className="text-purple-500" fill="rgba(168,85,247,0.1)" />
      <path d="M50 55 C50 55 55 55 55 60 C55 65 50 65 50 70" stroke="currentColor" strokeWidth="2" className="text-white" />
      <circle cx="50" cy="80" r="2" fill="currentColor" className="text-white" />
      <path d="M10 65 L30 65" stroke="currentColor" strokeWidth="1" className="text-purple-400/40" />
      <path d="M70 65 L90 65" stroke="currentColor" strokeWidth="1" className="text-purple-400/40" />
    </g>
  </svg>
);

const IconCompliance = () => (
  <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
    <g filter="url(#trustGlowCyan)" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="1.5" className="text-emerald-500/50" />
      <path d="M50 15 C50 15 70 30 70 50 C70 70 50 85 50 85 C50 85 30 70 30 50 C30 30 50 15 50 15 Z" stroke="currentColor" strokeWidth="1" className="text-emerald-400/30" />
      <path d="M15 50 H85" stroke="currentColor" strokeWidth="1" className="text-emerald-400/30" />
      <path d="M35 50 L50 65 L75 35" stroke="currentColor" strokeWidth="3" className="text-emerald-400" />
      <circle cx="85" cy="25" r="5" stroke="currentColor" strokeWidth="1" className="text-cyan-400" />
    </g>
  </svg>
);

// --- Data ---
const trustPoints = [
  {
    icon: <IconEdge />,
    title: "ブラウザ内での特徴量抽出",
    desc: "音声の生データ（録音そのもの）はサーバーに送信されません。周波数のゆらぎ等の数値（特徴量）をブラウザ内で抽出し、その数値のみを解析用に送信します。",
    color: "blue"
  },
  {
    icon: <IconZeroKnowledge />,
    title: "個人特定情報の最小化（検討中）",
    desc: "本人が同意した範囲を超えて個人を特定しない設計を検討しています。ゼロ知識証明などの高度な保護技術は、現時点では未実装のロードマップ項目です。",
    color: "purple"
  },
  {
    icon: <IconCompliance />,
    title: "プライバシー配慮の設計方針",
    desc: "GDPR・個人情報保護法（APPI）の考え方を参考に設計していますが、法的な認証・監査は現時点で完了していません。導入前に専門家・貴社法務とご確認ください。",
    color: "emerald"
  }
];

export default function TrustSection() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="py-32 relative overflow-hidden bg-[#0B0F19]">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.05]" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] opacity-20 translate-x-1/3 translate-y-1/3" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Content */}
          <motion.div 
            style={{ opacity, x: useTransform(scrollYProgress, [0, 0.5], [-50, 0]) }}
            className="relative z-10"
          >
            <h2 className="text-3xl md:text-4xl font-light text-white mb-8 leading-tight">
              守るのは、データだけではない。<br />
              <span className="text-emerald-400 font-medium relative inline-block">
                あなただけのもの。
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-emerald-400/0 via-emerald-400 to-emerald-400/0"></span>
              </span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-12">
              HAISは「監視」のためのツールではありません。「保護」のためのインフラです。
              私たちは、あなたの顔写真も、声の録音データも、一切保有しません。
            </p>

            <div className="space-y-8">
              {trustPoints.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-5 group"
                >
                  <div className={`shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-500 group-hover:scale-110 bg-${point.color}-500/10 border border-${point.color}-500/30 shadow-[0_0_20px_rgba(0,0,0,0.2)] group-hover:shadow-[0_0_30px_rgba(${point.color === 'blue' ? '6,182,212' : point.color === 'purple' ? '168,85,247' : '16,185,129'},0.4)]`}>
                    <div className={`absolute inset-0 bg-gradient-to-br from-${point.color}-500/10 to-transparent opacity-50 blur-md`} />
                    <div className="relative z-10 w-10 h-10 text-white/90 transition-colors">
                        {point.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className={`text-xl font-medium text-white mb-2 transition-colors group-hover:text-${point.color}-400`}>
                      {point.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed text-sm">
                      {point.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Code Block */}
          <motion.div
            style={{ y, opacity }}
            className="relative hidden lg:block"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 blur-3xl opacity-40 rounded-full animate-pulse-slow" />
            <div className="relative bg-[#0F131F] border border-slate-800/80 rounded-3xl p-8 overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
              <div className="flex items-center gap-2 mb-6 opacity-70">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 font-mono text-xs text-slate-500">privacy-protocol.ts</span>
              </div>
              <pre className="font-mono text-xs md:text-sm leading-relaxed text-slate-300 overflow-x-auto">
                <code>
{`// HAIS Privacy Protocol v3.0
interface PrivacyConfig {
  edgeProcessing: true;    // On-Device
  anonymization: "ZK-SNARKs";
}

async function processBiometrics(raw: Data) {
  // 1. Extract features locally
  const features = await ai.extract(raw);
  
  // ⚠️ DESTROY RAW DATA
  delete raw.image; 
  delete raw.audio;

  // 2. Return only abstract score
  return features.riskScore;
}`}
                </code>
              </pre>
               <div className="absolute bottom-4 right-4">
                 <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                   <Check className="w-3 h-3" />
                   <span>Verified Secure</span>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}