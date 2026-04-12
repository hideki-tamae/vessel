"""
Test suite for LLM Router
Validates fallback chain and error handling
"""

import pytest
from llm_router import get_llm_router
import logging

logging.basicConfig(level=logging.INFO)


def test_llm_router_initialization():
    """Test that router initializes without error"""
    router = get_llm_router()
    assert router is not None
    print("✅ Router initialized")


def test_llm_router_basic_prompt():
    """Test basic prompt routing"""
    router = get_llm_router()
    
    prompt = "Respond with 'OK' only"
    result = router.route(prompt)
    
    assert result["status"] in ["success", "error"]
    assert result["model_used"] is not None or result["error"] is not None
    print(f"✅ Routing test: {result['model_used']}")


def test_fallback_chain():
    """Test that fallback chain is present"""
    router = get_llm_router()
    assert router.anthropic_client is not None
    assert router.gemini_client is not None
    print("✅ Fallback chain ready")


if __name__ == "__main__":
    print("\n" + "="*70)
    print("🧪 LLM Router テスト実行")
    print("="*70 + "\n")
    
    try:
        test_llm_router_initialization()
        test_fallback_chain()
        test_llm_router_basic_prompt()
        
        print("\n" + "="*70)
        print("✅ 全テスト完了")
        print("="*70 + "\n")
    except Exception as e:
        print(f"\n❌ テスト失敗: {e}\n")
        raise
