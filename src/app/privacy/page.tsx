import React from 'react';

const PrivacyPage = () => {
  // Tallyのお問い合わせリンクを定数として定義
  const TALLY_CONTACT_URL = "https://tally.so/r/VLGQoy";

  return (
    <main className="min-h-screen bg-[#050511] text-white">
      {/* ページヘッダー */}
      <div className="pt-20">
        <div className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-200 to-cyan-400 mb-8 leading-tight">
            SOLUNA プロトコル プライバシーポリシー
          </h1>
          
          <p className="text-gray-400 max-w-3xl mx-auto mb-12 text-base md:text-lg leading-relaxed text-balance">
            SOLUNA Protocolがユーザーの皆様の情報をどのように取り扱うかを明確に定めています。
          </p>
        </div>
        
        {/* プライバシーポリシー本文 */}
        <div className="bg-[#080808] py-16">
          <section className="container mx-auto px-6 max-w-4xl space-y-12">
            
            {/* 第1章 総則 */}
            <div>
              <h2 className="text-2xl font-bold text-cyan-400 mb-6 border-b border-gray-700 pb-2">
                第1章 総則
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  本プライバシーポリシーは、SOLUNAプロトコル（以下、「本プロトコル」）が提供する各種サービスにおける、ユーザーの個人情報およびプライバシー情報の取扱いに関する方針を定めるものです。
                </p>
                <p>
                  本プロトコルは、ユーザーの「優しさ」を資産として証明する、透明性の高い社会インフラを目指します。
                </p>
              </div>
            </div>

            {/* 第2章 取得する情報と利用目的 */}
            <div>
              <h2 className="text-2xl font-bold text-cyan-400 mb-6 border-b border-gray-700 pb-2">
                第2章 取得する情報と利用目的
              </h2>
              <div className="space-y-6">
                <div className="text-gray-400 leading-relaxed">
                  <h3 className="text-xl font-semibold text-white mb-2">1. 任意に提供いただく情報</h3>
                  <p>メールアドレス、お名前など、ユーザーが本サービスを通じて任意に入力される情報。本プロトコルからの連絡、サービスに関する情報の提供に利用します。</p>
                </div>
                <div className="text-gray-400 leading-relaxed">
                  <h3 className="text-xl font-semibold text-white mb-2">2. プロトコル上で取得する情報</h3>
                  <p>パブリックウォレットアドレス、トークン保有履歴、ガバナンス投票履歴などのオンチェーンデータ。これらはプロトコルの透明性、トークン分配、ガバナンス投票の実施、およびサービスの改善に利用されます。</p>
                </div>
                <div className="text-gray-400 leading-relaxed">
                  <h3 className="text-xl font-semibold text-white mb-2">3. サービス利用に関する情報</h3>
                  <p>本サービスの利用状況、アクセス日時、IPアドレスなどのログ情報。サービスの維持、改善、不正利用防止のために利用されます。</p>
                </div>
              </div>
            </div>

            {/* 第3章 情報の共有と第三者提供 */}
            <div>
              <h2 className="text-2xl font-bold text-cyan-400 mb-6 border-b border-gray-700 pb-2">
                第3章 情報の共有と第三者提供
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  本プロトコルは、法令に基づく場合や、人の生命・身体の保護のために必要がある場合を除き、ユーザーの同意なく個人情報（メールアドレス等のオフチェーン情報）を第三者に提供することはありません。
                </p>
                <p>
                  なお、ウォレットアドレスなどのオンチェーンデータは、ブロックチェーンの特性上、公開情報となります。
                </p>
              </div>
            </div>
            
            {/* 第4章 情報の管理とセキュリティ */}
            <div>
              <h2 className="text-2xl font-bold text-cyan-400 mb-6 border-b border-gray-700 pb-2">
                第4章 情報の管理とセキュリティ
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  本プロトコルは、個人情報への不正アクセス、紛失、破壊、改ざん及び漏洩などを防止するため、厳重なセキュリティ対策を講じます。
                </p>
              </div>
            </div>

            {/* 第5章 ユーザーの権利 */}
            <div>
              <h2 className="text-2xl font-bold text-cyan-400 mb-6 border-b border-gray-700 pb-2">
                第5章 ユーザーの権利
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  ユーザーは、本プロトコルに対して自己に関する個人情報の開示、訂正、利用停止、または削除を請求する権利を有します。ご請求いただいた場合、本人確認を行った上で速やかに対応いたします。
                </p>
              </div>
            </div>
            
            {/* 第6章 お問い合わせ窓口 (Tally Link実装済み) */}
            <div>
              <h2 className="text-2xl font-bold text-cyan-400 mb-6 border-b border-gray-700 pb-2">
                第6章 お問い合わせ窓口
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg">
                プライバシーに関する開示・訂正・削除のご請求、その他のお問い合わせは、
                <a 
                  href={TALLY_CONTACT_URL} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-cyan-300 hover:text-cyan-400 transition-colors font-medium underline underline-offset-4"
                >
                  公式サイトの指定フォーム
                </a>
                よりご連絡ください。
              </p>
            </div>
            
            {/* 第7章 制定と改定 */}
            <div>
              <h2 className="text-2xl font-bold text-cyan-400 mb-6 border-b border-gray-700 pb-2">
                第7章 制定と改定
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>制定日：2025年12月6日</p>
                <p>本ポリシーの内容は、法令の改正、本サービスの改善に応じて予告なく変更されることがあります。</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default PrivacyPage;
