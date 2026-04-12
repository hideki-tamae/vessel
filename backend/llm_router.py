"""
LLM Router with fallback chain: Gemini → Claude
Integrated with "Civilization OS" System Prompt for HAIS analysis.
"""

import logging
import os
from typing import Optional, Dict, Any
from tenacity import retry, stop_after_attempt, wait_exponential
from dotenv import load_dotenv

load_dotenv(".env.local")

# =================================================================
# 文明OS / HAIS 設計思想プロンプト
# =================================================================
SYSTEM_PROMPT = """
あなたは「文明OS」の設計思想を司る、Liberal Arts Architectの右腕です。
回答は簡潔かつ洞察に満ちたトーンで行ってください。前置きや挨拶は不要です。

【分析指針】
1. 数値（Polyvagal Score等）を単なる医学データとしてではなく、V.フランクルの「意味への意志」に基づき、現在の状態を「次なる創造への資産」と定義して解釈してください。
2. 「逆境（ACEs）を資産に変える」という哲学に基づき、現在のストレス状態を「ケアを実装し、価値を生成する機会」として捉え直させます。
3. 薩摩の「知行合一」の精神を宿し、理論だけでなく、その瞬間に実践可能な具体的かつ哲学的な一言を添えてください。
"""

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

class LLMRouter:
    """
    Multi-LLM router with intelligent fallback and philosophical context injection.
    """
    
    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        self.anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
        self.fallback_threshold = int(os.getenv("FALLBACK_LLM_THRESHOLD", "3"))
        
        self.gemini_client = None
        self.anthropic_client = None
        self.failure_count = 0
        
        self._init_clients()
    
    def _init_clients(self):
        """Initialize both LLM clients"""
        try:
            from google import genai
            self.gemini_client = genai.Client(api_key=self.gemini_api_key)
            logger.info("✅ Gemini クライアント初期化完了")
        except Exception as e:
            logger.warning(f"⚠️ Gemini 初期化失敗: {e}")
        
        try:
            from anthropic import Anthropic
            self.anthropic_client = Anthropic(api_key=self.anthropic_api_key, timeout=30.0)
            logger.info("✅ Anthropic クライアント初期化完了")
        except Exception as e:
            logger.warning(f"⚠️ Anthropic 初期化失敗: {e}")
    
    @retry(stop=stop_after_attempt(2), wait=wait_exponential(multiplier=1, min=2, max=5))
    def _call_gemini(self, user_prompt: str, model: str = "gemini-2.0-flash") -> Optional[str]:
        """Try Gemini with System Prompt prepended"""
        if not self.gemini_client:
            raise ValueError("Gemini client not initialized")
        
        # Gemini 2.0 では contents の前にシステム命令を結合（または config で指定）
        full_prompt = f"{SYSTEM_PROMPT}\n\nユーザー入力:\n{user_prompt}"
        
        response = self.gemini_client.models.generate_content(
            model=model,
            contents=full_prompt,
            config={"timeout": 30}
        )
        return response.text
    
    @retry(stop=stop_after_attempt(2), wait=wait_exponential(multiplier=1, min=2, max=5))
    def _call_claude(self, user_prompt: str, model: str = "claude-sonnet-4-20250514") -> Optional[str]:
        """Try Claude using native system parameter"""
        if not self.anthropic_client:
            raise ValueError("Anthropic client not initialized")
        
        message = self.anthropic_client.messages.create(
            model=model,
            max_tokens=1024,
            system=SYSTEM_PROMPT,  # 思想をここに注入
            messages=[
                {"role": "user", "content": user_prompt}
            ]
        )
        return message.content[0].text
    
    def route(self, user_prompt: str) -> Dict[str, Any]:
        """Route request through LLM chain with injected context."""
        result = {
            "status": "error", "model_used": None, "response": None,
            "stats": {"models_tried": []}
        }
        
        # Phase 1: Gemini 2.0 Flash
        model_p1 = "gemini-2.0-flash"
        logger.info(f"→ Phase 1: {model_p1} 試行...")
        result["stats"]["models_tried"].append(model_p1)
        try:
            response = self._call_gemini(user_prompt, model_p1)
            result.update({"status": "success", "model_used": model_p1, "response": response})
            return result
        except Exception as e:
            logger.warning(f"⚠️ Phase 1 失敗: {type(e).__name__}")
            self.failure_count += 1

        # Phase 2: Claude 3.5 Sonnet (Fallback)
        model_p2 = "claude-sonnet-4-20250514"
        logger.info(f"→ Phase 2: {model_p2} へフォールバック...")
        result["stats"]["models_tried"].append(model_p2)
        try:
            response = self._call_claude(user_prompt, model_p2)
            result.update({"status": "success", "model_used": model_p2, "response": response})
            return result
        except Exception as e:
            logger.error(f"❌ 全フェーズ失敗: {str(e)}")
            result["error"] = str(e)
        
        return result

# Singleton
_llm_router = None
def get_llm_router():
    global _llm_router
    if _llm_router is None: _llm_router = LLMRouter()
    return _llm_router

if __name__ == "__main__":
    router = get_llm_router()
    test_res = router.route("スコア 45.0, 状態: 疲弊。今の私に『意味』をください。")
    print(f"\n【文明OS 回答】\n{test_res['response']}")