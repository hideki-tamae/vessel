import type { Metadata } from 'next';
import Dashboard from '@/components/civilization/Dashboard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Civilization OS ｜ Proof of Care Dashboard',
};

export default function DashboardPage() {
  // 本来はAuthから取得しますが、テスト用にあなたのWallet ID等で仮置き
  const testUserId = "hideki_tamae_01"; 
  return <Dashboard userId={testUserId} />;
}
