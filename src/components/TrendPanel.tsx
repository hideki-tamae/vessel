'use client';

import { useEffect, useState } from 'react';
import LayerBadge from '@/components/LayerBadge';

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

// 「90日間の変化」タブ：復職後90日間の記録モデル（MVP）に対応する一覧表示。
// 1件の記録の中に「本人データ（状態）」と「検証データ（測定条件・バージョン）」が
// 混在するため、フィールドごとにバッジで層を明示する（カード単位では分けきれないケース）。
// 業務環境データは現時点で記録する仕組みがなく、未実装であることを明示する。
export default function TrendPanel({ walletAddress }: { walletAddress?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scans, setScans] = useState<any[] | null>(null);

  useEffect(() => {
    if (!walletAddress) return;
    setLoading(true);
    setError(null);
    fetch(`/api/hais/user-data?walletAddress=${encodeURIComponent(walletAddress)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const cutoff = Date.now() - NINETY_DAYS_MS;
          const recent = (data.user.scans || [])
            .filter((s: any) => new Date(s.createdAt).getTime() >= cutoff)
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setScans(recent);
        } else {
          setScans([]);
          if (data.error !== 'User not found') setError(data.error || '取得に失敗しました。');
        }
      })
      .catch(() => setError('取得に失敗しました。しばらくしてからもう一度お試しください。'))
      .finally(() => setLoading(false));
  }, [walletAddress]);

  if (!walletAddress) {
    return <div style={styles.emptyState}>90日間の変化を見るには、ウォレットの接続が必要です。</div>;
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.headerRow}>
        <LayerBadge layer="self" />
        <LayerBadge layer="verification" />
        <span style={styles.headerNote}>直近90日間の記録。状態（本人データ）と測定条件（検証データ）を分けて表示します。</span>
      </div>

      <div style={styles.envNotice}>
        <LayerBadge layer="environment" /> 業務環境データ（勤務時間・業務負荷など）は現時点では記録の仕組みがなく、未実装です。
      </div>

      {loading && <div style={styles.emptyState}>読み込み中...</div>}
      {error && <div style={styles.errorState}>{error}</div>}
      {!loading && !error && scans?.length === 0 && (
        <div style={styles.emptyState}>直近90日間の記録はまだありません。</div>
      )}

      {scans && scans.length > 0 && (
        <div style={styles.list}>
          {scans.map((s) => (
            <div key={s.id} style={styles.card}>
              <div style={styles.selfRow}>
                <LayerBadge layer="self" />
                <span style={styles.state}>{s.neuralState}</span>
                <span style={styles.score}>{Number(s.omegaScore).toFixed(1)}</span>
              </div>
              <div style={styles.verifyRow}>
                <LayerBadge layer="verification" />
                <span style={styles.verifyText}>
                  {new Date(s.createdAt).toLocaleString('ja-JP')} ・ {s.logicVersion}
                  {s.hnrDb != null && ` ・ HNR ${Number(s.hnrDb).toFixed(1)}dB`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, any> = {
  wrap: { padding: '4px 4px 24px' },
  headerRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' },
  headerNote: { fontSize: '11px', color: '#8b91a8' },
  envNotice: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#8b91a8', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '10px 12px', marginBottom: '18px' },
  emptyState: { fontSize: '12px', color: '#555c74', padding: '24px 0', textAlign: 'center' },
  errorState: { fontSize: '12px', color: '#e8b0b0', padding: '12px 0' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  card: { background: '#111520', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '14px 16px' },
  selfRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  state: { fontSize: '13px', color: '#e8eaf0' },
  score: { fontSize: '13px', color: '#5ec984', fontFamily: "'DM Mono', monospace", marginLeft: 'auto' },
  verifyRow: { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' },
  verifyText: { fontSize: '10px', color: '#8b91a8', fontFamily: "'DM Mono', monospace" },
};
