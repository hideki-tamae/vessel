import os
import requests
import logging
from typing import Optional

logger = logging.getLogger(__name__)
PINATA_JWT = os.getenv("PINATA_JWT")

def upload_to_ipfs(data: dict) -> Optional[str]:
    """
    AIの解析レポート（JSON）を Pinata 経由で IPFS にアップロードし、CIDを返す。
    """
    if not PINATA_JWT:
        logger.warning("⚠️ Pinata JWT not configured. Skipping IPFS upload.")
        return None
        
    url = "https://api.pinata.cloud/pinning/pinJSONToIPFS"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {PINATA_JWT}"
    }
    
    payload = {
        "pinataOptions": {
            "cidVersion": 1
        },
        "pinataMetadata": {
            "name": f"HAIS_Care_Asset_{data.get('user', 'unknown')}.json"
        },
        "pinataContent": data
    }
    
    logger.info(">> IPFS (Pinata) へレポートをアップロード中...")
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        
        if response.status_code == 200:
            cid = response.json().get("IpfsHash")
            logger.info(f"✅ IPFS にアップロード完了: CID = {cid}")
            return cid
        else:
            logger.error(f"❌ Pinata API エラー (Code: {response.status_code}): {response.text}")
            return None
            
    except requests.exceptions.Timeout:
        logger.error("❌ IPFS ピン留め通信タイムアウト")
        return None
    except Exception as e:
        logger.error(f"❌ IPFS ピン留め通信例外エラー: {e}")
        return None
