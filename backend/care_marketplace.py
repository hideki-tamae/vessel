import os
import json
from datetime import datetime, timezone, timedelta

JST = timezone(timedelta(hours=9), 'JST')
LEDGER_FILE = "soluna_ledger.json"

# モックのWounded Healer データベース (Care Providers)
MOCK_HEALERS = [
    {
        "id": "healer_001",
        "name": "Sarah_WoundedHealer",
        "overcame": "摂食障害と完璧主義の呪縛",
        "rating": 4.8
    },
    {
        "id": "healer_002",
        "name": "Kenji_WoundedHealer",
        "overcame": "幼少期の言語的虐待と共依存",
        "rating": 4.9
    },
    {
        "id": "healer_003",
        "name": "Yumi_WoundedHealer",
        "overcame": "深刻な産後うつと孤独感",
        "rating": 4.7
    }
]


def _read_ledger() -> list:
    if not os.path.exists(LEDGER_FILE):
        return []
    with open(LEDGER_FILE, 'r', encoding='utf-8') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []


def _write_ledger(ledger: list):
    with open(LEDGER_FILE, 'w', encoding='utf-8') as f:
        json.dump(ledger, f, ensure_ascii=False, indent=4)


def get_balances() -> dict:
    """
    soluna_ledger.json を読み込み、全てのアカウントのSOLUNA残高を計算する
    """
    ledger = _read_ledger()
    balances = {}

    for tx in ledger:
        tx_type = tx.get("type")
        amount = tx.get("amount", 0)

        if tx_type == "MINT_CARE_TOKEN":
            # 新規発行 (System -> User)
            user = tx.get("user")
            balances[user] = balances.get(user, 0) + amount

        elif tx_type == "TRANSFER_CARE_TOKEN":
            # P2P 送金
            sender = tx.get("sender")
            receiver = tx.get("receiver")

            balances[sender] = balances.get(sender, 0) - amount
            balances[receiver] = balances.get(receiver, 0) + amount

    return balances


def find_matching_healer(trauma_keyword: str) -> dict:
    """
    ユーザーのトラウマに最も合致するWounded Healerをマッチングする
    """
    print(f"🔍 [Matching] 検索キーワード: {trauma_keyword} のWounded Healerを探しています...")
    for healer in MOCK_HEALERS:
        if trauma_keyword in str(healer.get("overcame", "")):
            return healer
    # デフォルト
    return MOCK_HEALERS[0]


def calculate_impact_value(user_ace_score: float, current_interaction_log: str) -> float:
    """
    Careの価値を「投下時間」ではなく「ACEs（有毒なストレス）の中和量」で算出する。
    思考検閲: 労働としてではなく、負の連鎖を断ち切った「文明への寄与」として評価。

    :param user_ace_score: ユーザーの過去のトラウマ・ストレス指数 (0〜10など)
    :param current_interaction_log: 現在の対話・行動ログ
    :return: 発生するSOLUNAトークンの量 (float)
    """
    # 簡易的な共鳴度（Resonance）の算出（キーワードベース）
    resonance_keywords = ["救われた", "共鳴", "理解", "安心", "涙", "浄化", "自分だけじゃない", "癒やし"]
    resonance_score = 0.0
    for kw in resonance_keywords:
        if kw in current_interaction_log:
            resonance_score += 1.0

    # ログの長さにも一定の重みを置く（深さの代理指標として）
    depth_multiplier = min(len(current_interaction_log) / 50.0, 3.0) 

    # ACEsスコアが高いほど、同じ共鳴でも「中和された毒」の社会・文明的価値は指数関数的に高いとみなす
    # Base value + (ACEs factor) * (Resonance factor)
    base_value = 10.0
    ace_factor = (user_ace_score ** 1.5) * 2.0
    
    impact_value = base_value + (ace_factor * (1.0 + resonance_score) * depth_multiplier)
    
    print(f"🧮 [Impact Calculation] ACEs Score: {user_ace_score}, Resonance: {resonance_score}")
    print(f"✨ [Contribution] 算出された文明への寄与度（SOLUNA）: {impact_value:.2f}")
    
    return round(impact_value, 2)


def request_care_session(sender_id: str, trauma_keyword: str, user_ace_score: float = 0.0, interaction_log: str = ""):
    """
    Care Sessionをリクエストし、マッチング成立後にトークンを転送する
    """
    print("\n=======================================================")
    print("🤝 Care Marketplace: Session Request Started")
    print("=======================================================")

    # 1. 提供されるCareの文明的価値を計算
    amount = calculate_impact_value(user_ace_score, interaction_log)

    # 2. 残高チェック
    balances = get_balances()
    sender_balance = balances.get(sender_id, 0)

    print(f"💰 [Balance Check] {sender_id} の現在の残高: {sender_balance} SOLUNA")

    if sender_balance < amount:
        print(f"❌ エラー: 残高が不足しています。(要求: {amount}, 残高: {sender_balance})")
        print("=======================================================\n")
        return {"status": "error", "message": "Insufficient balance"}

    # 3. マッチング
    matched_healer = find_matching_healer(trauma_keyword)
    receiver_id = matched_healer["id"]
    print(f"✅ [Matched] Wounded Healerがマッチングしました: {matched_healer['name']}")
    print(f"   (克服した痛み: {matched_healer['overcame']})")

    # 4. 決済トランザクション
    print(f"💸 [Transaction] 負の連鎖を断ち切る寄与として {amount} SOLUNA を {sender_id} から "
          f"{receiver_id} へ転送します...")

    ledger = _read_ledger()
    tx = {
        "timestamp": datetime.now(JST).isoformat(),
        "type": "TRANSFER_CARE_TOKEN",
        "sender": sender_id,
        "receiver": receiver_id,
        "amount": amount,
        "reason": f"P2P Care Session: Resonating with {trauma_keyword} (Impact Value calculated)",
        "context": {
            "healer_name": matched_healer["name"],
            "trauma_overcame": matched_healer["overcame"],
            "session_impact_value": amount,
            "user_aces": user_ace_score
        }
    }

    ledger.append(tx)
    _write_ledger(ledger)

    print("🧾 [Receipt] トランザクション完了！")
    print("=======================================================\n")
    return {
        "status": "success",
        "sender": sender_id,
        "receiver": receiver_id,
        "amount": amount,
        "healer_name": matched_healer["name"],
        "trauma_overcame": matched_healer["overcame"]
    }


if __name__ == "__main__":
    print("\n🚀 Running Care Marketplace Test Script...")

    # 発行フェーズのデータを読み取って残高確認
    current_balances = get_balances()
    print("\n📊 --- 初期残高 (Initial Balances) ---")
    for user, bal in current_balances.items():
        print(f"  {user}: {bal} SOLUNA")

    target_user = "beta_user_001"
    keyword = "言語的虐待"
    
    test_interaction = "ずっと苦しかった。でもあなたの話を聞いて、自分だけじゃないんだと安心し、涙が出ました。深く共鳴しています。"
    test_ace_score = 6.0

    # セッションリクエスト実行
    request_care_session(
        sender_id=target_user,
        trauma_keyword=keyword,
        user_ace_score=test_ace_score,
        interaction_log=test_interaction
    )

    # 実行後の残高確認
    updated_balances = get_balances()
    print("📊 --- 更新後の残高 (Updated Balances) ---")
    for user, bal in updated_balances.items():
        if isinstance(bal, float):
            print(f"  {user}: {bal:.2f} SOLUNA")
        else:
            print(f"  {user}: {bal} SOLUNA")
