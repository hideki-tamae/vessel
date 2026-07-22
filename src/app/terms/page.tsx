import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-gray-300 font-sans selection:bg-cyan-900 selection:text-white">
      {/* Header / Navigation (簡易版) */}
      <nav className="w-full p-6 flex justify-between items-center max-w-5xl mx-auto">
        <Link href="/" className="text-sm font-bold tracking-widest hover:text-white transition-colors">
          SOLUNA: Re-Verse Civilization
        </Link>
        <Link href="/" className="text-xs border border-gray-600 px-4 py-2 rounded-full hover:bg-gray-800 transition-colors">
          TOPへ戻る
        </Link>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 text-center">
          利用規約
        </h1>
        <p className="text-center text-gray-500 text-sm mb-16">
          Terms of Service | Last Updated: November 30, 2025
        </p>

        <div className="space-y-12 leading-relaxed">
          {/* 第1章 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-2">
              第1章 総則
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg text-gray-200 font-semibold mb-2">第1条（目的と理念）</h3>
                <p>
                  本規約は、ACES Care HUB JAPAN（以下「運営者」といいます）が提供する「SOLUNA Proof-of-Care Token エコシステム」（以下「本サービス」といいます）の利用条件を定めるものです。
                  本サービスは、「優しさが制度として機能する文明（Re-Verse Civilization）」の実現を目指し、AI、Web3、国際福祉政策を統合することで、見過ごされてきたケアの価値を社会システムとして再定義することを目的とします。
                </p>
              </div>
              <div>
                <h3 className="text-lg text-gray-200 font-semibold mb-2">第2条（定義）</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong className="text-white">SOLUNAトークン（SSLNS）:</strong> 本サービスを通じて発行されるデジタルトークン。これは投機的な暗号資産ではなく、「優しさの証明」として付与される社会貢献型の価値記録媒体（Utility Token）です。
                  </li>
                  <li>
                    <strong className="text-white">Proof-of-Care（PoC）:</strong> 「ケアの証明」。従来の資本主義経済において、貨幣という「解像度の粗い」尺度では測定困難であったがゆえに見過ごされてきた、「優しさ」や「ケア」といった本質的かつ高次元な価値貢献行為を指します。本サービスは、これをブロックチェーン技術によって捕捉し、不可逆かつ改ざん不可能な価値として可視化します。
                  </li>
                  <li>
                    <strong className="text-white">利用者:</strong> 本サービスにアクセスし、SOLUNAトークンのClaim（請求）、保有、または関連する機能を利用するすべての個人および法人（政策立案者、財団、社会起業家を含む）。
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 第2章 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-2">
              第2章 サービスの利用と責務
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg text-gray-200 font-semibold mb-2">第4条（利用資格と参加）</h3>
                <p>
                  1. <strong>ベータ版参加資格:</strong> 現在、本サービスは「Public Beta」フェーズにあります。利用者は、運営者が提供する「自己診断フォーム（Re-Verse Code）」または「共創参加フォーム」を通じ、真実かつ正確な情報を提供することで参加資格を得るものとします。<br />
                  2. <strong>ウォレットの管理:</strong> 利用者は、SOLUNAトークンを受け取るためのWeb3ウォレット（MetaMask等）およびその秘密鍵を、自己の責任において厳重に管理するものとします。秘密鍵の紛失による資産の喪失について、運営者は技術的に復旧不可能であり、一切の責任を負いません。
                </p>
              </div>
              <div>
                <h3 className="text-lg text-gray-200 font-semibold mb-2">第5条（禁止事項）</h3>
                <p className="mb-2">利用者は、以下の行為を行ってはなりません。</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>システムへの攻撃: サーバーへの過度な負荷（DDoS攻撃）、APIの不正利用、レートリミット（Rate Limit）を意図的に回避する行為。</li>
                  <li>Proof-of-Careの偽装: 虚偽のケア経験の申告、Botや自動化ツールを用いた不正なClaim、複数アカウントを用いたトークンの不当取得（Sybil Attack）。</li>
                  <li>違法行為への利用: SOLUNAトークンを用いたマネーロンダリング、テロ資金供与、その他法令に違反する行為。</li>
                  <li>リバースエンジニアリング: 本サービスの非公開ソースコードの解析、改変。</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg text-gray-200 font-semibold mb-2">第6条（違反時の措置）</h3>
                <p>
                  運営者は、利用者が前条に違反したと判断した場合、事前の通知なく以下の措置を講じることができます。<br />
                  ・SOLUNAトークンの付与停止または無効化<br />
                  ・本サービスへのアクセス遮断（IPブロック）<br />
                  ・該当アカウントの凍結
                </p>
              </div>
            </div>
          </section>

          {/* 第3章 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-2">
              第3章 トークンの性質と免責
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg text-gray-200 font-semibold mb-2">第7条（経済的価値の非保証）</h3>
                <p>
                  SOLUNAトークンは、ケアの実践を証明するソーシャル・トークンであり、将来的な金銭的価値や、法定通貨との交換可能性を保証するものではありません。暗号資産市場の変動、規制環境の変化により、トークンの機能や価値が変動、または消失する可能性があります。
                </p>
              </div>
              <div>
                <h3 className="text-lg text-gray-200 font-semibold mb-2">第8条（免責事項）</h3>
                <p>
                  本サービスはブロックチェーン技術（Smart Contract）を利用しています。コードのバグ、ネットワークの混雑、Gas代の高騰、ハッキング等により生じた損害について、運営者は一切の責任を負いません。また、運営者は、「制度設計」の進捗や技術的な理由により、予告なく本サービスの内容を変更、中断、または終了する権利を有します。
                </p>
              </div>
            </div>
          </section>

          {/* 第4章 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-2">
              第4章 ガバナンスと一般条項
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg text-gray-200 font-semibold mb-2">第9条（透明性とプライバシー）</h3>
                <p>
                  本サービスは「完全透明性」を哲学としており、トークンのトランザクションおよびシステム監査ログは、個人を特定しない形で公開される場合があります。収集した個人情報（メールアドレス等）は、別途定めるプライバシーポリシーに基づき、厳重に管理されます。
                </p>
              </div>
              <div>
                <h3 className="text-lg text-gray-200 font-semibold mb-2">第10条（準拠法と管轄）</h3>
                <p>
                  本規約の解釈にあたっては、日本国法を準拠法とします。本サービスに関して紛争が生じた場合には、運営者の所在地を管轄する地方裁判所を専属的合意管轄裁判所とします。
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Link */}
        <div className="mt-20 pt-10 border-t border-gray-800 text-center">
          <Link href="/" className="text-cyan-500 hover:text-cyan-400 transition-colors">
            ← ホームに戻る
          </Link>
        </div>
      </main>
    </div>
  );
}
