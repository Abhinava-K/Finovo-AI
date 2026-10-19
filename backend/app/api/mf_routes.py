from fastapi import APIRouter
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, Any, Dict
import json
from app.core.mf_engine import calculate_allocation, calculate_projections
from app.core.portfolio_engine import UnifiedPortfolioEngine
from app.services.session_parser import SessionParserService
from app.models.temporal_portfolio_encoder import TemporalPortfolioSequenceEncoder

router = APIRouter()

class MFRequest(BaseModel):
    age: int = Field(..., gt=0, description="Investor Age")
    amount: float = Field(default=0.0, description="Investment Amount in INR")
    capital: Optional[float] = Field(default=None, description="Alias for investment amount")
    risk: str = Field(..., description="Risk Profile: low, medium, or high")
    duration_years: int = Field(..., gt=0, description="Investment duration in years")
    session_data: Optional[Dict[str, Any]] = Field(default=None, description="Uploaded past portfolio capsule")
    is_executed: Optional[bool] = Field(default=True, description="Whether past capsule was executed")

    @model_validator(mode='before')
    @classmethod
    def reconcile_amount_and_capital(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # If capital is provided and amount is not, set amount = capital
            if "capital" in data and "amount" not in data:
                data["amount"] = data["capital"]
            elif "amount" in data and "capital" not in data:
                data["capital"] = data["amount"]
        return data

    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v < 1000:
            raise ValueError("Investment amount must be at least ₹1,000")
        if v % 100 != 0:
            raise ValueError("Investment amount must be in multiples of 100")
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
async def recommend_mf(req: MFRequest):
    # Base allocation
    alloc = calculate_allocation(req.age, req.risk.lower(), req.duration_years)
    marginal_context = None

    # Marginal allocation if past capsule is provided
    if req.session_data:
        try:
            parsed_history = SessionParserService.parse_session_file(json.dumps(req.session_data))
            feature_vec = SessionParserService.vectorize_features(parsed_history, {
                "age": req.age,
                "capital": req.amount,
                "risk": req.risk.lower(),
                "duration_years": req.duration_years,
                "is_executed": req.is_executed
            })
            dl_res = TemporalPortfolioSequenceEncoder.forward_pass(feature_vec)
            
            marginal_res = UnifiedPortfolioEngine.calculate_marginal_allocation(
                current_age=req.age,
                fresh_capital=req.amount,
                risk=req.risk.lower(),
                duration_years=req.duration_years,
                past_session_profile=parsed_history,
                adaptive_gamma=dl_res.get("adaptive_gamma"),
                is_executed=req.is_executed,
                personalization_meta={
                    "session_summary": parsed_history.get("summary"),
                    "detected_past_capital": parsed_history.get("capital"),
                    "detected_past_risk": parsed_history.get("risk_profile"),
                    "neural_scoring": dl_res
                }
            )

            # Map the marginal allocation into the mutual fund categories (Equity Large, Mid-cap, Debt)
            m_matrix = marginal_res["marginal_allocation"]
            mf_raw_large = m_matrix["equity_largecap"]
            mf_raw_mid = m_matrix["equity_midcap"]
            mf_raw_debt = m_matrix["debt_and_liquid"]
            mf_total = mf_raw_large + mf_raw_mid + mf_raw_debt

            if mf_total > 0:
                alloc["allocation"]["equity"] = round((mf_raw_large / mf_total) * 100.0, 1)
                alloc["allocation"]["midcap"] = round((mf_raw_mid / mf_total) * 100.0, 1)
                alloc["allocation"]["debt"] = round((mf_raw_debt / mf_total) * 100.0, 1)
                
                # Strict 100% sum verification
                mf_check = round(alloc["allocation"]["equity"] + alloc["allocation"]["midcap"] + alloc["allocation"]["debt"], 1)
                mf_diff = round(100.0 - mf_check, 1)
                if mf_diff != 0.0:
                    max_mf_cat = max(alloc["allocation"], key=alloc["allocation"].get)
                    alloc["allocation"][max_mf_cat] = round(alloc["allocation"][max_mf_cat] + mf_diff, 1)

            marginal_context = {
                "is_personalized": True,
                "summary": marginal_res["summary"],
                "elapsed_years": marginal_res["summary"]["elapsed_years"],
                "past_compounded_value": marginal_res["summary"]["past_capital_current_estimated"],
                "consolidated_allocation": marginal_res["consolidated_allocation"],
                "target_lifecycle_equilibrium": marginal_res["target_lifecycle_equilibrium"],
                "rebalance_alerts": marginal_res.get("rebalance_alerts", []),
                "adaptive_gamma": dl_res.get("adaptive_gamma"),
                "risk_drift_index": dl_res.get("risk_drift_index"),
                "drift_classification": dl_res.get("drift_classification")
            }
        except Exception as e:
            import traceback
            traceback.print_exc()
            pass

    # Database of representative funds
    fund_db = {
        "equity": [
            {"name": "HDFC Top 100", "fund_house": "HDFC", "category": "equity", "cagr_inception": 14.2, "risk_level": "medium"},
            {"name": "Nippon India Large Cap", "fund_house": "Nippon", "category": "equity", "cagr_inception": 16.5, "risk_level": "high"},
            {"name": "SBI Bluechip", "fund_house": "SBI", "category": "equity", "cagr_inception": 12.8, "risk_level": "low"},
            {"name": "Axis Bluechip", "fund_house": "Axis", "category": "equity", "cagr_inception": 13.5, "risk_level": "low"},
            {"name": "ICICI Pru Bluechip", "fund_house": "ICICI", "category": "equity", "cagr_inception": 15.1, "risk_level": "medium"},
            {"name": "Parag Parikh Flexi Cap", "fund_house": "PPFAS", "category": "equity", "cagr_inception": 18.2, "risk_level": "high"},
        ],
        "midcap": [
            {"name": "SBI Magnum Midcap", "fund_house": "SBI", "category": "midcap", "cagr_inception": 18.1, "risk_level": "high"},
            {"name": "Kotak Emerging Equity", "fund_house": "Kotak", "category": "midcap", "cagr_inception": 19.4, "risk_level": "high"},
            {"name": "HDFC Mid-Cap Opportunities", "fund_house": "HDFC", "category": "midcap", "cagr_inception": 17.2, "risk_level": "medium"},
            {"name": "Axis Midcap", "fund_house": "Axis", "category": "midcap", "cagr_inception": 16.1, "risk_level": "medium"},
            {"name": "Nippon India Growth", "fund_house": "Nippon", "category": "midcap", "cagr_inception": 18.8, "risk_level": "high"},
        ],
        "debt": [
            {"name": "ICICI Prudential Debt", "fund_house": "ICICI", "category": "debt", "cagr_inception": 7.5, "risk_level": "low"},
            {"name": "HDFC Corporate Bond", "fund_house": "HDFC", "category": "debt", "cagr_inception": 8.1, "risk_level": "medium"},
            {"name": "SBI Liquid Fund", "fund_house": "SBI", "category": "debt", "cagr_inception": 6.2, "risk_level": "low"},
            {"name": "Kotak Bond Short Term", "fund_house": "Kotak", "category": "debt", "cagr_inception": 7.8, "risk_level": "low"},
            {"name": "Aditya Birla Sun Life Corp", "fund_house": "ABSL", "category": "debt", "cagr_inception": 8.0, "risk_level": "medium"},
        ]
    }

    top_funds = []
    
    def select_fund(category, target_risk, age, amount):
        available = fund_db.get(category, [])
        if not available: return None
        
        matches = [f for f in available if f["risk_level"] == target_risk]
        if not matches:
            matches = available
            
        index = (age * int(amount)) % len(matches)
        selected = matches[index]
        return {k: v for k, v in selected.items() if k != "risk_level"}

    if alloc["allocation"]["equity"] > 0:
        top_funds.append(select_fund("equity", req.risk.lower(), req.age, req.amount))
    if alloc["allocation"]["midcap"] > 0:
        top_funds.append(select_fund("midcap", req.risk.lower(), req.age, req.amount))
    if alloc["allocation"]["debt"] > 0:
        top_funds.append(select_fund("debt", req.risk.lower(), req.age, req.amount))
    
    avg_cagr = 0
    total_alloc = alloc["allocation"]["equity"] + alloc["allocation"]["midcap"] + alloc["allocation"]["debt"]
    
    if total_alloc > 0:
        for f in top_funds:
            if f:
                cat = f["category"]
                cat_alloc = alloc["allocation"][cat]
                avg_cagr += (cat_alloc * f["cagr_inception"]) / 100
                
    proj = calculate_projections(req.amount, avg_cagr, req.duration_years)
    
    response = {
        "allocation": alloc["allocation"],
        "top_funds": top_funds,
        "projection": proj,
        "rebalancing_plan": alloc["rebalancing_plan"]
    }
    if marginal_context:
        response["marginal_context"] = marginal_context

    return response
