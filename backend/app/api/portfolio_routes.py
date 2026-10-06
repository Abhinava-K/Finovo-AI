from fastapi import APIRouter
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, Any
from app.core.portfolio_engine import UnifiedPortfolioEngine

router = APIRouter()

class UnifiedPortfolioRequest(BaseModel):
    age: int = Field(..., gt=0, lt=120, description="Investor Age")
    capital: float = Field(default=0.0, description="Investment Capital Amount in INR/USD")
    amount: Optional[float] = Field(default=None, description="Alias for capital amount")
    risk: str = Field(..., description="Risk Tolerance: low, medium, or high")
    duration_years: int = Field(..., gt=0, le=50, description="Investment Horizon in Years")
    inflation_pct: float = Field(default=6.0, ge=0.0, le=20.0, description="Expected Annual Inflation Rate")

    @model_validator(mode='before')
    @classmethod
    def reconcile_capital_and_amount(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "amount" in data and "capital" not in data:
                data["capital"] = data["amount"]
            elif "capital" in data and "amount" not in data:
                data["amount"] = data["capital"]
        return data

    @field_validator('capital')
    @classmethod
    def validate_capital(cls, v: float) -> float:
        if v < 1000:
            raise ValueError("Investment capital must be at least ₹1,000")
        return v

    @field_validator('risk')
    @classmethod
    def validate_risk(cls, v: str) -> str:
        v_clean = v.lower().strip()
        norm_map = {"conservative": "low", "moderate": "medium", "aggressive": "high"}
        v_clean = norm_map.get(v_clean, v_clean)
        if v_clean not in ["low", "medium", "high"]:
            raise ValueError("Risk must be one of 'low', 'medium', or 'high'")
        return v_clean

@router.post("/recommend")
async def recommend_unified_portfolio(req: UnifiedPortfolioRequest):
    """
    Calculates unified multi-asset allocation (Equity MFs + Debt + Gold + Web3 Crypto)
    with strict mathematical invariants, lifecycle rebalancing, and inflation-adjusted projections.
    """
    portfolio = UnifiedPortfolioEngine.calculate_unified_allocation(
        age=req.age,
        capital=req.capital,
        risk=req.risk,
        duration_years=req.duration_years,
        annual_inflation_pct=req.inflation_pct
    )
    return portfolio
