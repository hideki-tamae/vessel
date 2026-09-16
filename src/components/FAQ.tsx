'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

/**
 * FAQセクション
 * care-capitalism-developer スキル準拠
 * - 不安解消 → 離脱率低下（資本主義ルール）
 * - 透明性が信頼を生む（ケア資本主義ルール）
 */

const faqs = [
  {
    question: 'Proof of Care とは何ですか？',
    answer:
      'あなたの「ケア行動」をブロックチェーン上に記録し、経済的価値として証明する仕組みです。毎日の声の記録が、あなたの頑張りの証拠になります。改ざんできない、消えない、あなただけの「ケアの履歴書」です。',
  },
  {
    question: 'SOLUNA トークンはどうやって手に入れますか？',
    answer:
      '3つの方法があります。①毎日のボイスチェックイン（10 SOLUNA）、②Kindle書籍「Re-Verse Civilization」の購入証明（500 SOLUNA）、③ベータテスター報酬（参加時に付与）。特別なスキルや初期費用は一切不要です。',
  },
  {
    question: '本当に無料で参加できますか？',
    answer:
      'はい、完全無料です。ウォレット接続と毎日の声の記録に費用はかかりません。通常必要なガス代（取引手数料）もプロジェクト側が負担します。あなたの負担はゼロです。',
  },
  {
    question: 'セキュリティは大丈夫ですか？',
    answer:
      'SOLUNAはEthereum Sepoliaテストネット上で稼働しています。声のデータは匿名化され、個人を特定する情報は保存されません。ブロックチェーンの特性上、記録の改ざんも不可能です。',
  },
  {
    question: '将来的にトークンは使えるようになりますか？',
    answer:
      'メインネット移行後、トークンは「ケア経済圏」内での価値交換に使用できる予定です。ケアラー同士の相互支援、サービスへのアクセス、コミュニティ投票権など。詳細はホワイトペーパーをご覧ください。',
  },
  {
    question: '声のデータはどう使われますか？',
    answer:
      '声のデータは自律神経の状態を分析するために使用されます（HAIS機能）。分析結果はあなただけに表示され、第三者に共有されることはありません。「命の家計簿」としてあなたの健康管理に役立てることができます。',
  },
];

function FAQItem({
  question,
  answer,
  isOpen,
  onClick,
  index,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`border-b border-[#222] last:border-b-0 ${
        isOpen ? 'bg-[#0f0f0f]/50' : ''
      }`}
    >
      <button
        onClick={onClick}
        className="w-full py-8 flex items-start justify-between text-left group"
      >
        <span className="text-lg md:text-xl font-medium text-white group-hover:text-[#D4AF37] transition-colors duration-300 pr-8 leading-relaxed">
          {question}
        </span>
        <div
          className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full border transition-all duration-300 ${
            isOpen
              ? 'border-[#D4AF37] bg-[#D4AF37]/10'
              : 'border-[#333] group-hover:border-[#D4AF37]/50'
          }`}
        >
          {isOpen ? (
            <Minus className="w-4 h-4 text-[#D4AF37]" />
          ) : (
            <Plus className="w-4 h-4 text-[#666] group-hover:text-[#D4AF37]" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-8 pr-16">
              <p className="text-[#A0A0A0] leading-relaxed text-base">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative py-32 px-6 bg-[#0a0a0a]">
      {/* 装飾 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent" />

      <div className="max-w-4xl mx-auto">
        {/* セクションヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 text-xs font-medium tracking-[0.2em] text-[#D4AF37] border border-[#D4AF37]/30 rounded-full mb-6">
            FAQ
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            よくある<span className="text-[#D4AF37]">質問</span>
          </h2>
          <p className="text-[#666] max-w-lg mx-auto">
            はじめての方が抱きやすい疑問にお答えします
          </p>
        </motion.div>

        {/* FAQリスト */}
        <div className="bg-[#0a0a0a] rounded-2xl border border-[#222] p-4 md:p-8">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              index={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>

        {/* 追加サポート */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-[#666] text-sm mb-4">
            他にご質問がありましたら
          </p>
          <a
            href="https://twitter.com/HidekiTamae"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-[#D4AF37] border border-[#D4AF37]/30 rounded-full hover:bg-[#D4AF37]/10 transition-all duration-300"
          >
            @HidekiTamae に質問する
          </a>
        </motion.div>
      </div>
    </section>
  );
}
