'use client';

import { motion } from 'framer-motion';
import { Heart, Shield, Mic } from 'lucide-react';

/**
 * 価値提案セクション
 * care-capitalism-developer スキル準拠
 * - デュアルゲーム: CVR向上（資本主義）+ 包摂的メッセージ（ケア資本主義）
 * - デザイン: Modern Renaissance、余白重視、黄金比
 */

const propositions = [
  {
    icon: Heart,
    label: 'FOR WHOM',
    title: '見えないケアを担う\nすべての人へ',
    description:
      'ヤングケアラー、家族介護者、地域で支え合う人々。あなたの「優しさ」は、これまで経済的に評価されてこなかった。',
    highlight: '優しさ',
  },
  {
    icon: Shield,
    label: 'WHAT WE DO',
    title: 'ケアを「価値」として\n証明する',
    description:
      '声の記録だけで、あなたの日々の頑張りがブロックチェーン上に刻まれる。誰にも奪えない、あなただけの証。',
    highlight: '価値',
  },
  {
    icon: Mic,
    label: 'HOW IT WORKS',
    title: '毎日5秒\n声を残すだけ',
    description:
      '特別なスキル不要。スマホで声を録音するだけでSOLUNAトークンが届く。それが Proof of Care。',
    highlight: '5秒',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.25, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function ValueProposition() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* 背景グラデーション */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f1a] to-[#1a1a2e]" />

      {/* 装飾: 微細なグリッド */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#D4AF37 1px, transparent 1px),
                            linear-gradient(90deg, #D4AF37 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-7xl mx-auto">
        {/* セクションヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-2 text-xs font-medium tracking-[0.2em] text-[#D4AF37] border border-[#D4AF37]/30 rounded-full mb-6">
            VALUE PROPOSITION
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            SOLUNAが届ける
            <br />
            <span className="text-[#D4AF37]">3つの約束</span>
          </h2>
        </motion.div>

        {/* 3カラムグリッド */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6"
        >
          {propositions.map((prop, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative"
            >
              {/* カード */}
              <div className="relative h-full p-10 rounded-2xl bg-[#0a0a0a]/80 backdrop-blur-sm border border-[#333] hover:border-[#D4AF37]/40 transition-all duration-500">
                {/* ラベル */}
                <span className="text-[10px] font-medium tracking-[0.3em] text-[#D4AF37]/70">
                  {prop.label}
                </span>

                {/* アイコン */}
                <div className="mt-8 mb-8">
                  <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 group-hover:from-[#D4AF37]/30 group-hover:to-[#D4AF37]/10 transition-all duration-500">
                    <prop.icon className="w-7 h-7 text-[#D4AF37]" strokeWidth={1.5} />
                  </div>
                </div>

                {/* タイトル */}
                <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight whitespace-pre-line mb-6">
                  {prop.title}
                </h3>

                {/* 説明 */}
                <p className="text-[#A0A0A0] leading-relaxed text-base">
                  {prop.description}
                </p>

                {/* 装飾ライン */}
                <div className="absolute bottom-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ボトムCTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-20"
        >
          <p className="text-[#666] text-sm mb-8">
            あなたのケアには価値がある。それを証明する仕組みがここにある。
          </p>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 text-[#D4AF37] text-sm font-medium hover:gap-4 transition-all duration-300"
          >
            仕組みを詳しく見る
            <span>→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
