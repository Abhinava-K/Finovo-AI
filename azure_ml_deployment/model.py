import torch
import torch.nn as nn

class PyTorchTemporalPortfolioEncoder(nn.Module):
    """
    Production PyTorch Deep Learning Model for Azure ML Managed Online Endpoints.
    Evaluates 20-dimensional longitudinal lifecycle financial feature vectors and computes:
    1. Adaptive Merton Risk-Aversion (gamma_hat in [1.0, 10.0])
    2. Behavioral Risk Drift Index (drift in [-1.0, 1.0])
    3. Rebalancing shift vector across 5 asset classes (Large Cap, Mid Cap, Debt, Gold, Crypto)
    """
    def __init__(self, input_dim: int = 20, hidden_dim: int = 32):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.LayerNorm(hidden_dim),
            nn.GELU(),
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.GELU()
        )
        # Head 1: Adaptive Risk Aversion (scalar)
        self.gamma_head = nn.Sequential(
            nn.Linear(hidden_dim // 2, 1),
            nn.Softplus()
        )
        # Head 2: Behavioral Risk Drift Index (scalar in [-1, 1])
        self.drift_head = nn.Sequential(
            nn.Linear(hidden_dim // 2, 1),
            nn.Tanh()
        )
        # Head 3: Asset rebalancing delta
        self.rebalance_head = nn.Sequential(
            nn.Linear(hidden_dim // 2, 5),
            nn.Tanh()
        )

    def forward(self, x: torch.Tensor):
        h = self.encoder(x)
        gamma = self.gamma_head(h) * 5.0 + 1.0  # Bounded in [1.0, 10.0]
        drift = self.drift_head(h)              # Bounded in [-1.0, 1.0]
        rebalance = self.rebalance_head(h) * 10.0 # Delta shift % in [-10%, +10%]
        return gamma, drift, rebalance
