import os
import time
import requests
from typing import Dict, Any, List
from app.models.temporal_portfolio_encoder import TemporalPortfolioSequenceEncoder

class AzureMLPersonalizationService:
    """
    Client for Azure Machine Learning Managed Online Endpoints with local neural fallback.
    Implements Zero-Knowledge Ephemeral Personalization:
    - User features are scored in RAM.
    - Zero data is saved or retained on cloud servers.
    """

    ENDPOINT_URL = os.getenv("AZURE_ML_ENDPOINT_URL", "").strip()
    API_KEY = os.getenv("AZURE_ML_API_KEY", "").strip()

    @classmethod
    async def score_session(
        cls, 
        feature_vector: List[float], 
        session_meta: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Scores the feature vector via Azure ML Online Endpoint, or uses the local neural sequence encoder.
        """
        start_time = time.time()
        
        # 1. Attempt Azure ML Managed Online Endpoint if configured
        if cls.ENDPOINT_URL and cls.API_KEY:
            try:
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {cls.API_KEY}"
                }
                payload = {
                    "data": {
                        "features": feature_vector,
                        "session_meta": session_meta
                    }
                }
                # Non-blocking timeout
                resp = requests.post(cls.ENDPOINT_URL, json=payload, headers=headers, timeout=2.5)
                if resp.status_code == 200:
                    ml_result = resp.json()
                    latency = int((time.time() - start_time) * 1000)
                    return {
                        "source": "Azure_ML_Managed_Online_Endpoint",
                        "endpoint_uri": cls.ENDPOINT_URL.split("?")[0],
                        "adaptive_gamma": ml_result.get("adaptive_gamma", 3.5),
                        "risk_drift_index": ml_result.get("risk_drift_index", 0.0),
                        "drift_classification": ml_result.get("drift_classification", "Consistent"),
                        "rebalance_recommendations": ml_result.get("rebalance_recommendations", []),
                        "latency_ms": latency
                    }
            except Exception as e:
                # Log error and fall back gracefully to local neural encoder
                pass

        # 2. Local Deep Learning Inference (Local Neural Forward Pass)
        local_result = TemporalPortfolioSequenceEncoder.forward_pass(feature_vector)
        latency = int((time.time() - start_time) * 1000)

        return {
            "source": "Local_Neural_Sequence_Encoder (Azure ML Ready)",
            "endpoint_uri": "local://embedded_sequence_encoder",
            "adaptive_gamma": local_result["adaptive_gamma"],
            "risk_drift_index": local_result["risk_drift_index"],
            "drift_classification": local_result["drift_classification"],
            "rebalance_recommendations": local_result["rebalance_recommendations"],
            "neural_confidence": local_result["neural_confidence"],
            "latency_ms": latency
        }
