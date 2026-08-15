# HAIS Polyvagal Research Sandbox (`harness`)

**HAIS Polyvagal Research Sandbox**（コードネーム: `harness`）は、多迷走神経理論（Polyvagal Theory）に基づき、自律神経状態の推移や心理的安全性をシミュレーション・分析するための研究開発用サンドボックスです。

資本主義のバグを修正し、ケアを価値化する「Care Capitalism」の実現に向け、生体・行動データから「Proof of Care（ケアの証明）」を算出・検証するコアエンジンとして機能します。

---

## 💡 主な特徴 (Features)

- **Polyvagal 状態遷移モデル**: 生体データや状態ログから自律神経の3状態（腹側迷走神経 / 交感神経 / 背側迷走神経）を可視化・推定。
- **CrewAI マルチエージェント解析**: エージェント群による文脈評価および状態のメタ分析（`crew.py`）。
- **Proof of Care 計算基盤**: 得られた状態遷移結果を Web3 / SOLUNA エコシステムへ証明データとして引き渡す評価インターフェース。
- **Web UI / Sandbox**: パラメータを動的に変更してシミュレーションできる評価ダッシュボード。

---

## 📥 入出力イメージ (Input / Output)

### 入力データ例 (Input)

```json
{
  "heart_rate_variability": 55,
  "heart_rate": 72,
  "subjective_stress_level": 3,
  "context_log": "Safe environment, engaging in collaborative discussion."
}

出力データ例 (Output)

{
  "polyvagal_state": {
    "ventral_vagal_score": 0.75,
    "sympathetic_score": 0.20,
    "dorsal_vagal_score": 0.05
  },
  "dominant_state": "Ventral Vagal (Safe & Connected)",
  "proof_of_care_index": 0.82
}

🛠 技術スタック (Tech Stack)

Core Engine: Python 3.10+

AI Agent Strategy: CrewAI

Interface & Deploy: Hugging Face Spaces, Docker

Verification & Smart Contracts: TypeScript, Hardhat

📁 リポジトリ構成 (Repository Structure)

.
├── src/               # Polyvagal 計算モデルおよびデータ解析コア
├── test/              # Python / TypeScript のテストスイート
├── types/             # TypeScript 型定義
├── main.py            # アプリケーション・UI エントリーポイント
├── crew.py            # CrewAI ワークフロー定義
├── Dockerfile         # HF Spaces / コンテナ化構成
├── .env.example       # 環境変数サンプル
├── requirements.txt   # Python 依存パッケージ一覧
└── README.md

🚀 クイックスタート (Getting Started)

前提要件

Python 3.10 以上

Node.js 18 以上（Hardhat 使用時）

Docker（任意）

1. ローカルでの実行

# 依存関係のインストール
pip install -r requirements.txt

# 環境変数の設定
cp .env.example .env

# .env 内に API キー等を設定

# アプリケーションの起動
python main.py

2. Docker での実行

docker build -t harness-sandbox .
docker run -p 7860:7860 --env-file .env harness-sandbox

🧪 テストの実行 (Testing)

# Python 単体テスト
pytest

# Smart Contract / TypeScript テスト
npx hardhat test

⚠️ 免責事項 (Disclaimer)

本プロジェクトは研究・評価用（PoC）のサンドボックスです。

医療機器ではありません。自己診断、臨床判断、または医療行為の代用として使用することはできません。

👤 保守・管理者 (Maintainer & License)

Maintainer: Limelien Inc. / HAIS & SOLUNA Dev Team

License: MIT License

