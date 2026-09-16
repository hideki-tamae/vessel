'use client';

import { motion } from 'framer-motion';
import { BookOpen, Briefcase, Users, ArrowRight } from 'lucide-react';

/**
 * ユースケースセクション
 * care-capitalism-developer スキル準拠
 * - 具体的ペルソナで自分事化（資本主義: ターゲティング精度向上）
 * - 多様なケアラーを包摂（ケア資本主義: 排除しない設計）
 */

const useCases = [
  {
    icon: BookOpen,
    persona: 'ヤングケアラー',
    age: '17歳・高校生',
    quote: '「誰にも言えなかった」',
    story:
      '学校から帰ると、祖母の介護が待っている。友達には言えない。先生にも相談できない。でも今は、帰宅後の5秒間の声が「頑張ってるね」の証になる。',
    impact: '孤独なケアが「見える化」され、自己肯定感に繋がる',
    gradient: 'from-purple-500/20 via-purple-500/5 to-transparent',
    accentColor: 'purple',
  },
  {
    icon: Briefcase,
    persona: '在宅介護者',
    age: '52歳・会社員',
    quote: '「価値がないと思っていた」',
    story:
      '親の介護のために時短勤務に。収入は減り、疲労は蓄積するばかり。SOLUNAは「無償の労働」を「価値」として認めてくれた最初のシステムだった。',
    impact: 'ケアの負担が「資産」として可視化され、報われる感覚を得る',
    gradient: 'from-blue-500/20 via-blue-500/5 to-transparent',
    accentColor: 'blue',
  },
  {
    icon: Users,
    persona: '地域ボランティア',
    age: '68歳・退職者',
    quote: '「残したかった」',
    story:
      '近所のお年寄りの見守り、買い物代行。お金はもらえないけど、必要な仕事。SOLUNAで「善意」が記録されることで、地域の絆がデジタルに残る。',
    impact: '地域のソーシャルキャピタルが数値化され、次世代に継承される',
    gradient: 'from-amber-500/20 via-amber-500/5 to-transparent',
    accentColor: 'amber',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function UseCases() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* 背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] via-[#0f0f1a] to-[#0a0a0a]" />

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
            USE CASES
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            SOLUNAが届く
            <br />
            <span className="text-[#D4AF37]">3つの風景</span>
          </h2>
          <p className="text-[#666] max-w-lg mx-auto">
            見えないケアを担う人々に、価値の証明を届ける
          </p>
        </motion.div>

        {/* カードグリッド */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {useCases.map((useCase, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="group relative"
            >
              <div
                className={`relative h-full rounded-2xl overflow-hidden border border-[#222] hover:border-[#D4AF37]/30 transition-all duration-500`}
              >
                {/* 背景グラデーション */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${useCase.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                {/* コンテンツ */}
                <div className="relative p-10">
                  {/* アイコン */}
                  <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-[#0a0a0a] border border-[#333] mb-8 group-hover:border-[#D4AF37]/30 transition-colors duration-300">
                    <useCase.icon
                      className="w-6 h-6 text-[#D4AF37]"
                      strokeWidth={1.5}
                    />
                  </div>

                  {/* ペルソナ情報 */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {useCase.persona}
                    </h3>
                    <span className="text-sm text-[#666]">{useCase.age}</span>
                  </div>

                  {/* 引用 */}
                  <p className="text-[#D4AF37] text-lg font-medium mb-6 italic">
                    {useCase.quote}
                  </p>

                  {/* ストーリー */}
                  <p className="text-[#A0A0A0] leading-relaxed text-sm mb-8">
                    {useCase.story}
                  </p>

                  {/* インパクト */}
                  <div className="pt-6 border-t border-[#222]">
                    <span className="text-[10px] font-medium tracking-[0.2em] text-[#D4AF37]/60 uppercase">
                      Impact
                    </span>
                    <p className="text-white text-sm mt-3 leading-relaxed">
                      {useCase.impact}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-20"
        >
          <p className="text-[#666] mb-8">
            あなたのケアにも、価値の証明を
          </p>
          <a
            href="/v3"
            className="group inline-flex items-center gap-3 px-10 py-5 bg-[#D4AF37] text-[#0a0a0a] font-bold rounded-xl hover:bg-[#F4D03F] transition-all duration-300"
          >
            今すぐ始める
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
