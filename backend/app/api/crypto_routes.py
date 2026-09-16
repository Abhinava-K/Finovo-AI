from fastapi import APIRouter
from pydantic import BaseModel, Field, field_validator
from app.core.crypto_engine import calculate_crypto_allocation

router = APIRouter()

class CryptoRequest(BaseModel):
    amount: float = Field(..., ge=1000)
    investment_horizon: str
    max_drawdown: int

    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v % 100 != 0:
            raise ValueError("Investment amount must be in multiples of 100")
        return v

    @field_validator('investment_horizon')
    @classmethod
    def validate_horizon(cls, v: str) -> str:
        if v.lower() not in ["short-term", "medium-term", "long-term"]:
            raise ValueError("Investment horizon must be 'short-term', 'medium-term', or 'long-term'")
        return v.lower()

    @field_validator('max_drawdown')
    @classmethod
    def validate_drawdown(cls, v: int) -> int:
        if v not in [20, 50, 80]:
            raise ValueError("Max drawdown must be 20, 50, or 80")
        return v

@router.post("/recommend")
async def recommend_crypto(req: CryptoRequest):
    return calculate_crypto_allocation(req.amount, req.investment_horizon.lower(), req.max_drawdown)
