import Dashboard from '@/components/civilization/Dashboard';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  // 本来はAuthから取得しますが、テスト用にあなたのWallet ID等で仮置き
  const testUserId = "hideki_tamae_01"; 
  return <Dashboard userId={testUserId} />;
}
