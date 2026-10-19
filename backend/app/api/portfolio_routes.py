from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, Any, Dict, List
import json
from app.core.portfolio_engine import UnifiedPortfolioEngine
from app.core.rate_limiter import portfolio_limiter
from app.services.session_parser import SessionParserService
from app.services.azure_ml_service import AzureMLPersonalizationService

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

class PersonalizePortfolioRequest(BaseModel):
    age: Optional[int] = Field(default=25, gt=0, lt=120)
    capital: Optional[float] = Field(default=100000.0)
    risk: Optional[str] = Field(default="medium")
    duration_years: Optional[int] = Field(default=5, gt=0, le=50)
    inflation_pct: Optional[float] = Field(default=6.0, ge=0.0, le=20.0)
    session_data: Optional[Dict[str, Any]] = Field(default=None, description="Uploaded past chat transcript or portfolio capsule JSON")
    is_executed: Optional[bool] = Field(default=True, description="Whether past capsule funds are already executed holdings")

@router.post("/recommend")
async def recommend_unified_portfolio(req: UnifiedPortfolioRequest, request: Request):
    """
    Calculates unified multi-asset allocation (Equity MFs + Debt + Gold + Web3 Crypto)
    with strict mathematical invariants, lifecycle rebalancing, and inflation-adjusted projections.
    Protected by IP-based sliding window rate limiter.
    """
    await portfolio_limiter.check_rate_limit(request)
    
    portfolio = UnifiedPortfolioEngine.calculate_unified_allocation(
        age=req.age,
        capital=req.capital,
        risk=req.risk,
        duration_years=req.duration_years,
        annual_inflation_pct=req.inflation_pct
    )
    return portfolio

@router.post("/personalize")
async def personalize_portfolio_with_session(req: PersonalizePortfolioRequest, request: Request):
    """
    Zero-Knowledge Ephemeral Personalization via Deep Learning / Azure ML:
    1. Ingests user-uploaded past session (chat transcript or portfolio capsule).
    2. Vectorizes longitudinal behavioral history into a 16-dimensional tensor.
    3. Scores the tensor via Azure ML Managed Online Endpoint (or local neural sequence model).
    4. Computes Adaptive Merton Risk Aversion (γ̂) and Behavioral Risk Drift (β).
    5. Solves personalized Markowitz MPT allocation with strict mathematical invariants.
    """
    await portfolio_limiter.check_rate_limit(request)

    current_inputs = {
        "age": req.age or 25,
        "capital": req.capital or 100000.0,
        "risk": (req.risk or "medium").lower(),
        "duration_years": req.duration_years or 5
    }

    # If no session data uploaded, execute standard MPT
    if not req.session_data:
        return UnifiedPortfolioEngine.calculate_unified_allocation(
            age=current_inputs["age"],
            capital=current_inputs["capital"],
            risk=current_inputs["risk"],
            duration_years=current_inputs["duration_years"],
            annual_inflation_pct=req.inflation_pct or 6.0
        )

    try:
        # 1. Parse historical session JSON
        parsed_history = SessionParserService.parse_session_file(json.dumps(req.session_data))
        
        # 2. Extract 16-dimensional longitudinal feature vector
        feature_vector = SessionParserService.vectorize_features(parsed_history, current_inputs)

        # 3. Score via Azure ML Online Endpoint (or local neural sequence encoder)
        ml_scoring = await AzureMLPersonalizationService.score_session(
            feature_vector=feature_vector,
            session_meta={
                "source_type": parsed_history.get("source_type"),
                "timestamp": parsed_history.get("timestamp")
            }
        )

        # 4. Calculate Marginal Asset Allocation if previous executed holdings exist
        is_exec = getattr(req, "is_executed", True)
        if parsed_history.get("previous_allocations") and is_exec:
            marginal_res = UnifiedPortfolioEngine.calculate_marginal_allocation(
                current_age=current_inputs["age"],
                fresh_capital=current_inputs["capital"],
                risk=current_inputs["risk"],
                duration_years=current_inputs["duration_years"],
                past_session_profile=parsed_history,
                annual_inflation_pct=req.inflation_pct or 6.0,
                adaptive_gamma=ml_scoring.get("adaptive_gamma"),
                is_executed=True,
                personalization_meta={
                    "session_summary": parsed_history.get("summary"),
                    "detected_past_capital": parsed_history.get("capital"),
                    "detected_past_risk": parsed_history.get("risk_profile"),
                    "azure_ml_scoring": ml_scoring
                }
            )
            # Mirror marginal allocation into allocation_matrix for seamless UI backwards-compatibility
            marginal_res["allocation_matrix"] = marginal_res["marginal_allocation"]
            return marginal_res

        # 5. Standard Unified Allocation with Adaptive Gamma
        personalized_portfolio = UnifiedPortfolioEngine.calculate_unified_allocation(
            age=current_inputs["age"],
            capital=current_inputs["capital"],
            risk=current_inputs["risk"],
            duration_years=current_inputs["duration_years"],
            annual_inflation_pct=req.inflation_pct or 6.0,
            adaptive_gamma=ml_scoring.get("adaptive_gamma"),
            personalization_meta={
                "session_summary": parsed_history.get("summary"),
                "detected_past_capital": parsed_history.get("capital"),
                "detected_past_risk": parsed_history.get("risk_profile"),
                "azure_ml_scoring": ml_scoring
            }
        )

        return personalized_portfolio

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to personalize portfolio from uploaded session: {str(e)}")
