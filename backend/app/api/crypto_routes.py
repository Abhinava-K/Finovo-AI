from fastapi import APIRouter
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, Any
from app.core.crypto_engine import calculate_crypto_allocation

router = APIRouter()

class CryptoRequest(BaseModel):
    amount: float = Field(default=0.0, description="Investment Amount in INR/USD")
    capital: Optional[float] = Field(default=None, description="Alias for investment amount")
    investment_horizon: str = Field(default="medium-term", description="short-term, medium-term, or long-term")
    duration_years: Optional[int] = Field(default=None, description="Horizon in years (coerced automatically)")
    max_drawdown: int = Field(default=50, description="Max acceptable drawdown: 20, 50, or 80")
    risk: Optional[str] = Field(default=None, description="Risk tolerance (coerced to drawdown)")

    @model_validator(mode='before')
    @classmethod
    def coerce_crypto_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # 1. Reconcile amount and capital
            if "capital" in data and ("amount" not in data or data["amount"] == 0):
                data["amount"] = data["capital"]
            elif "amount" in data and "capital" not in data:
                data["capital"] = data["amount"]

            # 2. Coerce duration_years into investment_horizon
            if "duration_years" in data and ("investment_horizon" not in data or not data["investment_horizon"]):
                years = int(data["duration_years"])
                if years <= 1:
                    data["investment_horizon"] = "short-term"
                elif years <= 3:
                    data["investment_horizon"] = "medium-term"
                else:
                    data["investment_horizon"] = "long-term"

            # 3. Coerce risk profile into max_drawdown
            if "risk" in data and ("max_drawdown" not in data or data["max_drawdown"] == 50):
                r = str(data["risk"]).lower().strip()
                if r in ["low", "conservative"]:
                    data["max_drawdown"] = 20
                elif r in ["medium", "moderate"]:
                    data["max_drawdown"] = 50
                elif r in ["high", "aggressive"]:
                    data["max_drawdown"] = 80

        return data

    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v < 1000:
            raise ValueError("Investment amount must be at least 1,000")
        if v % 100 != 0:
            raise ValueError("Investment amount must be in multiples of 100")
        return v

    @field_validator('investment_horizon')
    @classmethod
    def validate_horizon(cls, v: str) -> str:
        clean = v.lower().strip()
        if clean not in ["short-term", "medium-term", "long-term"]:
            return "medium-term"
        return clean

    @field_validator('max_drawdown')
    @classmethod
    def validate_drawdown(cls, v: int) -> int:
        if v not in [20, 50, 80]:
            return 50
        return v

@router.post("/recommend")
async def recommend_crypto(req: CryptoRequest):
    return calculate_crypto_allocation(req.amount, req.investment_horizon.lower(), req.max_drawdown)
