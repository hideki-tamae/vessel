import os
import re
import json
import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from dotenv import load_dotenv

# dotenv settings
env_path = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../.env.local'))
load_dotenv(env_path)

import requests
import google.genai as genai
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey, Text, JSON, create_engine
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

# ====================================================
# 🆕 LLM Router Import
# ====================================================
try:
    from llm_router import get_llm_router
    logger_setup = logging.getLogger(__name__)
    logger_setup.info("✅ LLM Router successfully imported")
    llm_router = get_llm_router()
except ImportError as e:
    logger_setup = logging.getLogger(__name__)
    logger_setup.warning(f"⚠️ LLM Router import failed: {e}")
    llm_router = None

Base = declarative_base()

class User(Base):
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    broca_shutdown_detected = Column(Boolean)
    re_verse_factor_active = Column(Boolean)
    last_neuroception_state = Column(String(10))
    care_score = Column(Float)
    resilience_score = Column(Float)
    initial_soluna_balance = Column(Float)
    last_assessment_id = Column(String(36))
    last_assessment_timestamp = Column(DateTime)

class Assessment(Base):
    __tablename__ = 'assessment'
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey('user.id'))
    text_input = Column(Text)
    audio_features = Column(JSON)
    facial_data = Column(JSON)
    f0_hz = Column(Float)
    jitter_shimmer = Column(Float)
    facial_flatness = Column(Float)
    pupil_dilation = Column(Float)
    neuroception_state = Column(String(10))
    broca_offline = Column(Boolean)
    care_score = Column(Float)
    soluna_allocated = Column(Float)
    re_verse_factor_applied = Column(Boolean)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    user = relationship("User")

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'hais.db')
engine = create_engine(f'sqlite:///{DB_PATH}', connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# モック/ブリッジ関数
try:
    from proof_of_care_bridge import run_proof_of_care_bridge
except ImportError:
    def run_proof_of_care_bridge(user_id, text):
        return {"status": "mock", "message": "Module not found"}

from care_marketplace import request_care_session, get_balances

try:
    from utils.ipfs_handler import upload_to_ipfs
except ImportError:
    upload_to_ipfs = None

# ====================================================
# 1. 基本設定
# ====================================================
logging.basicConfig(level=logging.INFO, format='[%(asctime)s] [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

GOOGLE_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
GAS_URL = os.getenv("GAS_URL")
JST = timezone(timedelta(hours=9), 'JST')

if GOOGLE_API_KEY:
    client = genai.Client(api_key=GOOGLE_API_KEY)
else:
    client = None

app = FastAPI(title="HAIS Civilization OS API", version="2.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # 開発用。本番環境では適切に制限してください
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ====================================================
# 2. Pydantic モデル
# ====================================================
class VoiceInsightRequest(BaseModel):
    user_id: str
    polyvagal_score: float
    autonomic_state: str
    f0_hz: Optional[float] = None
    jitter_pct: Optional[float] = None
    shimmer_pct: Optional[float] = None
    hnr_db: Optional[float] = None
    condition: Optional[str] = None

# ====================================================
# 3. ユーティリティ
# ====================================================
def identify_user(user_id: str) -> str:
    uid = str(user_id).lower()
    if 'tamae' in uid or 'hideki' in uid: return "田前 秀樹"
    return user_id

# ====================================================
# 🆕 4. Proof of Care 報酬計算ロジック (The Re-Verse Factor)
# ====================================================
def calculate_care_reward(score: float, state: str) -> float:
    """
    逆境（低いスコア）ほど高い報酬を割り当てる Care Capitalism ロジック。
    """
    # 基本計算: スコアが低いほど（ストレスが高いほど）ケアの価値が高いと見なす
    base_reward = (100.0 - score) * 0.5
    
    # 状態による補正
    multipliers = {
        "sympathetic": 1.2, # 交感神経優位（闘争・逃走）
        "dorsal_vagal": 1.5, # 背側迷走神経（凍結状態）- 最大の逆境
        "ventral_vagal": 1.0 # 腹側迷走神経（安全）
    }
    
    multiplier = multipliers.get(state.lower(), 1.0)
    reward = round(base_reward * multiplier, 2)
    return max(0.1, reward) # 最低でも0.1 SOLUNA

# ====================================================
# 5. エンドポイント: Voice Insight (LLM Router & Token Reward)
# ====================================================
@app.post("/api/hais/voice-insight")
async def get_voice_insight(req: VoiceInsightRequest):
    if not llm_router:
        raise HTTPException(status_code=503, detail="LLM Router is not available")

    user_name = identify_user(req.user_id)
    
    # 報酬計算（Proof of Care）
    token_reward = calculate_care_reward(req.polyvagal_score, req.autonomic_state)

    # プロンプト（詳細は llm_router の SYSTEM_PROMPT が処理する）
    prompt = f"""
    【データ】
    ユーザー: {user_name}
    Polyvagal Score: {req.polyvagal_score}
    State: {req.autonomic_state}
    F0: {req.f0_hz} Hz, Jitter: {req.jitter_pct}%, Shimmer: {req.shimmer_pct}%
    本人の自覚症状: {req.condition or '特になし'}
    
    このデータに基づき、文明OSの視点から「意味」と「ケアのアクション」を提示してください。
    """

    try:
        result = llm_router.route(prompt)
        if result["status"] == "success":
            insight_text = result["response"]
            assessment_id = None
            
            # --- DB 保存処理 ---
            db_session = SessionLocal()
            try:
                # ユーザーの取得 (存在しない場合は新規作成)
                user = db_session.query(User).filter(User.name == user_name).first()
                if not user:
                    user = User(name=user_name)
                    db_session.add(user)
                    db_session.commit()
                    db_session.refresh(user)
                
                # Assessment レコードの作成
                assessment_id = str(uuid.uuid4())
                new_assessment = Assessment(
                    id=assessment_id,
                    user_id=user.id,
                    text_input=insight_text,
                    neuroception_state=req.autonomic_state,
                    care_score=req.polyvagal_score,
                    soluna_allocated=token_reward,
                    f0_hz=req.f0_hz,
                    jitter_shimmer=req.jitter_pct,
                    timestamp=datetime.now(JST)
                )
                db_session.add(new_assessment)
                db_session.commit()
            except Exception as db_e:
                logger.error(f"DB Save Error: {db_e}")
            finally:
                db_session.close()

            return {
                "status": "success",
                "assessment_id": assessment_id,
                "user": user_name,
                "polyvagal_score": req.polyvagal_score,
                "autonomic_state": req.autonomic_state,
                "insight": insight_text,
                "care_token_reward": token_reward,
                "model_used": result["model_used"],
                "timestamp": datetime.now(JST).isoformat()
            }
        else:
            raise HTTPException(status_code=500, detail=result["error"])
    except Exception as e:
        logger.error(f"Insight Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- ヘルスチェック ---
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "llm_router": llm_router is not None,
        "engine": "Civilization OS Engine v2.2.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=False)