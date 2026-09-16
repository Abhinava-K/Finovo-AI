from fastapi import APIRouter
from pydantic import BaseModel, Field, field_validator
from app.core.mf_engine import calculate_allocation, calculate_projections

router = APIRouter()

class MFRequest(BaseModel):
    age: int = Field(..., gt=0)
    amount: float = Field(..., ge=1000)
    risk: str
    duration_years: int = Field(..., gt=0)

    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v % 100 != 0:
            raise ValueError("Investment amount must be in multiples of 100")
        return v

    @field_validator('risk')
    @classmethod
    def validate_risk(cls, v: str) -> str:
        if v.lower() not in ["low", "medium", "high"]:
            raise ValueError("Risk must be one of 'low', 'medium', or 'high'")
        return v.lower()

@router.post("/recommend")
async def recommend_mf(req: MFRequest):
    alloc = calculate_allocation(req.age, req.risk.lower(), req.duration_years)
    
    # Mock database of diverse funds
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

    # Dynamic selection logic based on risk and age and amount
    top_funds = []
    
    def select_fund(category, target_risk, age, amount):
        available = fund_db.get(category, [])
        if not available: return None
        
        # Try to find an exact risk match
        matches = [f for f in available if f["risk_level"] == target_risk]
        if not matches:
            matches = available
            
        # Use age, amount to add variety based on user profile dynamically
        index = (age * int(amount)) % len(matches)
        selected = matches[index]
        # Remove risk_level key for response
        return {k: v for k, v in selected.items() if k != "risk_level"}

    if alloc["allocation"]["equity"] > 0:
        top_funds.append(select_fund("equity", req.risk.lower(), req.age, req.amount))
    if alloc["allocation"]["midcap"] > 0:
        top_funds.append(select_fund("midcap", req.risk.lower(), req.age, req.amount))
    if alloc["allocation"]["debt"] > 0:
        top_funds.append(select_fund("debt", req.risk.lower(), req.age, req.amount))
    
    # Calculate a weighted average CAGR dynamically based on the specific funds selected
    avg_cagr = 0
    total_alloc = alloc["allocation"]["equity"] + alloc["allocation"]["midcap"] + alloc["allocation"]["debt"]
    
    if total_alloc > 0:
        for f in top_funds:
            if f:
                cat = f["category"]
                cat_alloc = alloc["allocation"][cat]
                avg_cagr += (cat_alloc * f["cagr_inception"]) / 100
                
    proj = calculate_projections(req.amount, avg_cagr, req.duration_years)
    
    return {
        "allocation": alloc["allocation"],
        "top_funds": top_funds,
        "projection": proj,
        "rebalancing_plan": alloc["rebalancing_plan"]
    }
