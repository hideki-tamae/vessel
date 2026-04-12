import pytest
from server import calculate_reverse_factor

class TestReverseFactor:
    """The Re-Verse Factor マルチモーダル拡張テスト"""
    
    def test_legacy_red_state_detection(self):
        """互換性: 旧audio_features/facial_dataからの検知"""
        result = calculate_reverse_factor(
            user_input="短",
            audio_features={'jitter': 0.6},
            facial_data={'flatness_score': 0.8}
        )
        assert result['neuroception_state'] == 'RED'
        assert result['re_verse_factor_active'] == True
        
    def test_explicit_multimodal_red_state(self):
        """Phase 2/3: 明示的引数による凍結(RED)検知"""
        result = calculate_reverse_factor(
            user_input="短",
            jitter_shimmer=0.6,
            facial_flatness=0.8,
            pupil_dilation=1.2 # Future expansion
        )
        assert result['neuroception_state'] == 'RED'
        assert result['care_score_multiplier'] == 1.5
        
    def test_explicit_multimodal_overrides_dict(self):
        """Phase 2/3: 明示的引数が辞書をオーバーライドする確認"""
        result = calculate_reverse_factor(
            user_input="短",
            audio_features={'jitter': 0.1}, # 正常（Green）
            jitter_shimmer=0.8 # 異常値（Red）を優先
        )
        assert result['neuroception_state'] == 'RED'
        assert result['re_verse_factor_active'] == True

    def test_green_state_multimodal(self):
        """Phase 2/3: マルチモーダルデータ正常時のGREEN検知"""
        result = calculate_reverse_factor(
            user_input="安全な状態です。豊かに表情が動き、声も穏やかです",
            jitter_shimmer=0.1,
            facial_flatness=0.2,
            f0_hz=120.0
        )
        assert result['neuroception_state'] == 'GREEN'
        assert result['care_score_multiplier'] == 1.0
