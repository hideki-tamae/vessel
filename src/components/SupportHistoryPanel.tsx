'use client';

import { useEffect, useState } from 'react';
import LayerBadge from '@/components/LayerBadge';

// 「支援の履歴」タブ：4層データモデルのうち支援データ層のみを表示する。
// 本人データ・業務環境データ・検証データとは意図的に混在させない。
export default function SupportHistoryPanel({ walletAddress }: { walletAddress?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [careActions, setCareActions] = useState<any[] | null>(null);

  useEffect(() => {
    if (!walletAddress) return;
    setLoading(true);
    setError(null);
    fetch(`/api/hais/user-data?walletAddress=${encodeURIComponent(walletAddress)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCareActions(data.user.careActions || []);
        } else {
          setCareActions([]);
          if (data.error !== 'User not found') setError(data.error || '取得に失敗しました。');
        }
      })
      .catch(() => setError('取得に失敗しました。しばらくしてからもう一度お試しください。'))
      .finally(() => setLoading(false));
  }, [walletAddress]);

  if (!walletAddress) {
    return <div style={styles.emptyState}>支援の履歴を見るには、ウォレットの接続が必要です。</div>;
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.headerRow}>
        <LayerBadge layer="support" />
        <span style={styles.headerNote}>本人・支援者が閲覧できる記録です。本人への評価ではありません。</span>
      </div>

      {loading && <div style={styles.emptyState}>読み込み中...</div>}
      {error && <div style={styles.errorState}>{error}</div>}
      {!loading && !error && careActions?.length === 0 && (
        <div style={styles.emptyState}>まだ支援の記録がありません。</div>
      )}

      {careActions && careActions.length > 0 && (
        <div style={styles.list}>
          {careActions.map((a) => (
            <div key={a.id} style={styles.card}>
              <div style={styles.cardTop}>
                <span style={styles.actionName}>{a.action}</span>
                <span style={styles.date}>{new Date(a.createdAt).toLocaleDateString('ja-JP')}</span>
              </div>
              {a.actionType && <div style={styles.actionType}>{a.actionType}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, any> = {
  wrap: { padding: '4px 4px 24px' },
  headerRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' },
  headerNote: { fontSize: '11px', color: '#8b91a8' },
  emptyState: { fontSize: '12px', color: '#555c74', padding: '24px 0', textAlign: 'center' },
  errorState: { fontSize: '12px', color: '#e8b0b0', padding: '12px 0' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  card: { background: '#111520', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px 16px' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  actionName: { fontSize: '13px', color: '#e8eaf0' },
  date: { fontSize: '10px', color: '#555c74', fontFamily: "'DM Mono', monospace" },
  actionType: { fontSize: '11px', color: '#8b91a8', marginTop: '4px' },
};
