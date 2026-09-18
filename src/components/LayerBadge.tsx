'use client';

// 4層データモデルの層バッジ。どのデータがどの層に属するかを画面上で常に見分けられるようにする。
// 参照: 「本人データ／支援データ／業務環境データ／検証データ」を1枚のカードに混在させない設計方針。
export type DataLayer = 'self' | 'support' | 'environment' | 'verification';

const LAYER_CONFIG: Record<DataLayer, { label: string; color: string; bg: string; border: string }> = {
  self: { label: '本人データ', color: '#5ec984', bg: 'rgba(94,201,132,0.08)', border: 'rgba(94,201,132,0.25)' },
  support: { label: '支援データ', color: '#67b8e8', bg: 'rgba(103,184,232,0.08)', border: 'rgba(103,184,232,0.25)' },
  environment: { label: '業務環境データ', color: '#e8b86d', bg: 'rgba(232,184,109,0.08)', border: 'rgba(232,184,109,0.25)' },
  verification: { label: '検証データ', color: '#8b91a8', bg: 'rgba(139,145,168,0.1)', border: 'rgba(139,145,168,0.25)' },
};

export default function LayerBadge({ layer }: { layer: DataLayer }) {
  const c = LAYER_CONFIG[layer];
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '9px',
        fontFamily: "'DM Mono', monospace",
        letterSpacing: '0.05em',
        padding: '2px 8px',
        borderRadius: '999px',
        color: c.color,
        background: c.bg,
        border: `1px solid ${c.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {c.label}
    </span>
  );
}
