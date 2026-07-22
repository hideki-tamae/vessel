import TransparencySection from '@/components/TransparencySection';

export default function AuditPage() {
  return (
    <main className="min-h-screen bg-[#050511] text-white">
      <div className="pt-20">
        <div className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 to-blue-500 mb-6">
            Security & Audit Verification
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto mb-12">
            SOLUNAは、システム設計と運用状況をすべて公開する「完全透明型プロジェクト」です。
          </p>
        </div>

        {/* 既存のヘビーなコンポーネントを表示 */}
        <TransparencySection />
      </div>
    </main>
  );
}
