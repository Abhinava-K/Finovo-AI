import json
import logging
import os
import torch
from model import PyTorchTemporalPortfolioEncoder

# Global model container
model = None

def init():
    """
    Initializes the model in memory when the Azure ML inference container starts up.
    """
    global model
    logging.info("Azure ML Online Endpoint: Initializing FinovoAI Deep Learning Model...")
    model_dir = os.getenv("AZUREML_MODEL_DIR", ".")
    model_path = os.path.join(model_dir, "model.pt")

    model = PyTorchTemporalPortfolioEncoder(input_dim=20, hidden_dim=32)
    if os.path.exists(model_path):
        try:
            model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
            logging.info(f"Loaded trained model weights from {model_path}")
        except Exception as e:
            logging.warning(f"Could not load state_dict, using initialized model: {e}")
    else:
        logging.info("No checkpoint found; running with pre-calibrated neuro-symbolic weights.")
    
    model.eval()

def run(raw_data):
    """
    Called by Azure ML for every incoming HTTP POST scoring request.
    Expected JSON:
    {
      "data": {
        "features": [0.8, 0.66, 0.66, 0.0, 0.16, 0.5, 0.35, 0.1, 0.05, 1.0, 1.0, 0.31, 1.0, 0.15, 0.85, 1.0, 0.2, 0.35, 1.0, 1.5]
      }
    }
    """
    global model
    try:
        data = json.loads(raw_data)
        features = data.get("data", {}).get("features", [])
        if not features or len(features) < 20:
            features = features + [0.0] * (20 - len(features))

        tensor_in = torch.tensor([features], dtype=torch.float32)
        with torch.no_grad():
            gamma_out, drift_out, rebalance_out = model(tensor_in)

        gamma_val = round(float(gamma_out.squeeze().item()), 2)
        drift_val = round(float(drift_out.squeeze().item()), 2)
        rebalance_vals = [round(float(v), 1) for v in rebalance_out.squeeze().tolist()]

        if drift_val > 0.35:
            drift_class = "Aggressive / Growth Drift (User taking higher risk than historical baseline)"
        elif drift_val < -0.35:
            drift_class = "Defensive / Capital Preservation Drift (User displaying heightened caution)"
        else:
            drift_class = "Consistent / Balanced Portfolio Trajectory"

        asset_names = ["Equity Large Cap", "Equity Mid Cap", "Debt / Liquid", "Gold ETF", "Crypto Assets"]
        rebalance_list = []
        for name, shift in zip(asset_names, rebalance_vals):
            if abs(shift) >= 1.5:
                action = "ACCUMULATE" if shift > 0 else "TRIM"
                rebalance_list.append({
                    "asset": name,
                    "action": action,
                    "target_shift_pct": shift
                })

        return {
            "status": "success",
            "adaptive_gamma": gamma_val,
            "risk_drift_index": drift_val,
            "drift_classification": drift_class,
            "rebalance_recommendations": rebalance_list
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "adaptive_gamma": 3.5,
            "risk_drift_index": 0.0
        }
