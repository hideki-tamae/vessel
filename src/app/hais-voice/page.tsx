'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceScanner from '@/components/VoiceScanner';
import SyncProposal from '@/components/SyncProposal';
import { useSyncProposal } from '@/hooks/useSyncProposal';

/**
 * CIVILIZATION OS - HAIS Neural Interface Page
 * 統合: 深層推論(DeepMind)の生体解析と、審美眼(Jobs)・意味への意志(Frankl)に基づく価値の結晶化
 */
export default function HaisVoicePage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { proposal, handleSync } = useSyncProposal(address || "");

  const [phase, setPhase] = useState<'idle' | 'minting' | 'crystallized'>('idle');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleScanComplete = async (payload: any) => {
    try {
      console.log("Routing to Civilization OS (Backend):", payload);
      // バックエンドの /analyze エンドポイントを叩き、Notion等へ魂を刻む（The Re-Verse Factor）
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      console.log("Civilization OS Analysis Result:", data);
    } catch (error) {
      console.error("Backend routing failed:", error);
    }
  };

  // 提案受諾時の統合フロー（スマートコントラクト＆API処理のラップ）
  const executeIntegration = async () => {
    setPhase('minting'); // フェーズ 1: 静寂と脈動（防衛本能の鎮静化）
    
    try {
      // 薩摩ロジック: 元のフックの同期処理を実行し、結果を待つ
      await handleSync();
      
      // 成功した場合のみ結晶化フェーズへ
      setPhase('crystallized'); // フェーズ 2: 意味の提示
    } catch (error) {
      console.error("Integration failed:", error);
      setPhase('idle'); // 失敗時は元の状態へロールバック
    }
  };

  if (!mounted) {
    return (
      <div className="relative min-h-screen bg-[#0a0c12] text-[#e8eaf0] flex flex-col items-center justify-center overflow-hidden font-sans">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(64,150,255,0.05)_0%,transparent_70%)] pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0a0c12] text-[#e8eaf0] flex flex-col items-center justify-center overflow-hidden font-sans">
      
      {/* 背景エフェクト: スキャンへの没入感 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(64,150,255,0.05)_0%,transparent_70%)] pointer-events-none" />

      {/* ヘッダー: フェーズに関わらずOSのコンテキストを維持（結晶化時は非表示にしても良い） */}
      <motion.div 
        animate={{ opacity: phase === 'crystallized' ? 0 : 1 }}
        className="absolute top-12 text-center z-10"
      >
        <p className="text-[#555c74] font-mono text-[10px] tracking-[0.3em] uppercase mb-2">Re-Verse Civilization OS</p>
        <h1 className="text-4xl font-serif mb-1 bg-gradient-to-b from-white to-[#8a94ad] bg-clip-text text-transparent">Neural State Scan</h1>
        <p className="text-xs text-[#555c74] tracking-wider">ポリヴェーガル理論に基づく生体解析</p>
      </motion.div>

      <AnimatePresence mode="wait">
        
        {/* フェーズ 0: スキャンと救済の提示 */}
        {phase === 'idle' && (
          <motion.div
            key="idle-phase"
            exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="z-10 flex flex-col items-center w-full max-w-lg mt-24"
          >
            <VoiceScanner onScanComplete={handleScanComplete} />

            {/* 救済の波紋: スキャン完了しフラグが立った時のみ静かにフェードイン */}
            <AnimatePresence>
              {isConnected && proposal?.proposed && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 1.2, duration: 1.5, ease: "easeOut" }}
                  className="mt-8 w-full"
                >
                  <SyncProposal
                    proposed={proposal.proposed}
                    reason={proposal.reason}
                    onSync={executeIntegration} // 統合フローをトリガー
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* フェーズ 1: The Void (処理中の脈動) */}
        {phase === 'minting' && (
          <motion.div
            key="minting-phase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="z-10 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5], boxShadow: ["0 0 20px rgba(64,150,255,0.1)", "0 0 60px rgba(64,150,255,0.3)", "0 0 20px rgba(64,150,255,0.1)"] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-32 h-32 rounded-full border border-gray-700 bg-[#0d1117] flex items-center justify-center"
            >
              <span className="text-[10px] tracking-[0.2em] text-[#8a94ad]">CRYSTALLIZING...</span>
            </motion.div>
          </motion.div>
        )}

        {/* フェーズ 2: 価値の結晶化と意味の提示 */}
        {phase === 'crystallized' && (
          <motion.div
            key="crystallized-phase"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20"
          >
            {/* 光の結晶エフェクト */}
            <motion.div
              initial={{ boxShadow: "0 0 0 rgba(255,255,255,0)" }}
              animate={{ boxShadow: "0 0 80px rgba(255,255,255,0.15)" }}
              transition={{ delay: 0.5, duration: 2 }}
              className="w-40 h-40 rounded-full bg-gradient-to-br from-[#e8eaf0] to-[#555c74] flex items-center justify-center"
            >
              <span className="text-2xl font-serif text-[#0a0c12] tracking-widest">SOLUNA</span>
            </motion.div>

            {/* 意味の提示 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="mt-12 text-center"
            >
              <p className="text-[#8a94ad] font-light tracking-wide mb-2">Your resilience has been crystallized.</p>
              <p className="text-3xl font-semibold tracking-widest text-white">+ 100 SOLUNA</p>
            </motion.div>

            {/* ダッシュボードへの導線 (The Flywheel) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3, duration: 1 }}
              className="mt-16"
            >
              <button 
                onClick={() => router.push('/dashboard')}
                className="px-8 py-3 border border-[#555c74] rounded-full text-xs tracking-[0.15em] text-[#e8eaf0] hover:bg-white hover:text-[#0a0c12] transition-colors duration-500 uppercase"
              >
                View your Integrity
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="absolute bottom-6 z-10 pointer-events-none">
        <p className="text-[9px] text-[#333b4d] font-mono tracking-widest uppercase">© 2026 Limelien Inc. | Care Capitalism Protocol</p>
      </footer>
    </div>
  );
}