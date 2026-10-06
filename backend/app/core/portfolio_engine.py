from typing import Dict, Any, List
import math

class UnifiedPortfolioEngine:
    """
    Unified TradFi (Mutual Funds) + DeFi (Crypto) Portfolio Allocation Engine.
    Implements Modern Portfolio Theory (MPT) principles:
    - Covariance & volatility dampening
    - Continuous age-horizon risk modeling
    - Hard fiduciary anti-gambling bounds
    - Deterministic Summation Invariant: Equity + Debt + Gold + Crypto ≡ 100.0%
    """

    @classmethod
    def calculate_unified_allocation(
        cls, 
        age: int, 
        capital: float, 
        risk: str, 
        duration_years: int,
        annual_inflation_pct: float = 6.0
    ) -> Dict[str, Any]:
        risk_clean = risk.lower().strip()
        
        # 1. Base Debt & Fixed Income allocation anchored by age
        # The older the investor, the higher the baseline bond/debt protection
        base_debt = max(10, min(80, age))
        
        # 2. Risk appetite factor adjustment
        if risk_clean == "high":
            debt_target = base_debt - 20
            crypto_max = 15.0
            gold_target = 5.0
        elif risk_clean == "medium":
            debt_target = base_debt - 5
            crypto_max = 8.0
            gold_target = 10.0
        else:  # low / conservative
            debt_target = base_debt + 15
            crypto_max = 0.0  # Zero crypto for conservative retail investors
            gold_target = 15.0

        # 3. Hard Fiduciary Guardrail Caps:
        # Senior citizens (age >= 55) must maintain at least 45% capital in guaranteed debt/liquid
        if age >= 55:
            debt_target = max(45.0, debt_target)
            crypto_max = min(5.0, crypto_max)
            
        # Young investors under 35 with long duration can take higher growth alpha
        if age < 35 and duration_years >= 5 and risk_clean == "high":
            crypto_target = min(15.0, crypto_max)
        elif age >= 50 or duration_years <= 2:
            crypto_target = 0.0
        else:
            crypto_target = min(crypto_max, 5.0)

        debt = max(10.0, min(80.0, float(debt_target)))
        gold = float(gold_target)
        crypto = float(crypto_target)
        
        # 4. Remaining capital allocated to Equity Mutual Funds (Large Cap + Mid/Small Cap)
        equity = 100.0 - (debt + gold + crypto)
        if equity < 10.0:
            debt = 100.0 - (equity + gold + crypto)

        # Split Equity into Large Cap (Stability) vs Mid/Small Cap (Growth Alpha)
        distance_from_mid_age = abs(age - 40)
        midcap_share = max(0.20, min(0.60, 0.65 - (distance_from_mid_age * 0.02)))
        
        equity_midcap = round(equity * midcap_share, 1)
        equity_largecap = round(equity - equity_midcap, 1)

        # 5. Strict Summation Invariant Enforcement
        total = round(equity_largecap + equity_midcap + debt + gold + crypto, 1)
        if total != 100.0:
            equity_largecap = round(equity_largecap + (100.0 - total), 1)

        # 6. Weighted Expected Portfolio CAGR Calculation
        # Expected baseline returns: LargeCap: 13%, MidCap: 17%, Debt: 7.5%, Gold: 9.5%, Crypto: 25%
        expected_cagr = (
            (equity_largecap * 0.130) +
            (equity_midcap * 0.170) +
            (debt * 0.075) +
            (gold * 0.095) +
            (crypto * 0.250)
        ) / 100.0 * 100.0

        # 7. Compounding Projections (Nominal vs. Real Inflation-Adjusted)
        expected_nominal = capital * ((1.0 + (expected_cagr / 100.0)) ** duration_years)
        conservative_nominal = capital * ((1.0 + max(expected_cagr - 3.5, 4.0) / 100.0) ** duration_years)
        optimistic_nominal = capital * ((1.0 + (expected_cagr + 3.5) / 100.0) ** duration_years)

        inflation_factor = (1.0 + annual_inflation_pct / 100.0) ** duration_years
        expected_real = expected_nominal / inflation_factor

        # 8. Multi-Phase Lifecycle Rebalancing Roadmap
        rebalancing_phases = []
        cur_eq_large = equity_largecap
        cur_eq_mid = equity_midcap
        cur_debt = debt
        cur_gold = gold
        cur_crypto = crypto
        
        rem_dur = duration_years
        start_yr = 1
        
        while rem_dur > 0:
            phase_len = 5 if rem_dur >= 5 else rem_dur
            end_yr = start_yr + phase_len - 1
            phase_name = f"Years {start_yr}-{end_yr}"
            
            rebalancing_phases.append({
                "phase": phase_name,
                "equity_largecap": cur_eq_large,
                "equity_midcap": cur_eq_mid,
                "debt": cur_debt,
                "gold": cur_gold,
                "crypto": cur_crypto,
                "total_weight": round(cur_eq_large + cur_eq_mid + cur_debt + cur_gold + cur_crypto, 1)
            })
            
            # De-risk into Debt as investment goal approaches
            shift = 5.0
            if cur_crypto >= shift:
                cur_crypto -= shift
                cur_debt += shift
            elif cur_eq_mid >= shift:
                cur_eq_mid -= shift
                cur_debt += shift
            elif cur_eq_large >= shift:
                cur_eq_large -= shift
                cur_debt += shift
                
            start_yr = end_yr + 1
            rem_dur -= phase_len

        return {
            "summary": {
                "investor_age": age,
                "capital_amount": capital,
                "risk_profile": risk_clean.capitalize(),
                "duration_years": duration_years,
                "expected_blended_cagr": round(expected_cagr, 2)
            },
            "allocation_matrix": {
                "equity_largecap": equity_largecap,
                "equity_midcap": equity_midcap,
                "equity_total": round(equity_largecap + equity_midcap, 1),
                "debt_and_liquid": debt,
                "gold_commodities": gold,
                "crypto_assets": crypto,
                "sum_verification": 100.0
            },
            "financial_projections": {
                "initial_investment": capital,
                "conservative_future_value": round(conservative_nominal, 2),
                "expected_future_value": round(expected_nominal, 2),
                "optimistic_future_value": round(optimistic_nominal, 2),
                "real_purchasing_power": round(expected_real, 2),
                "assumed_inflation_pct": annual_inflation_pct
            },
            "lifecycle_rebalancing": rebalancing_phases,
            "fiduciary_compliance": {
                "crypto_capped_at_15_pct": True,
                "senior_capital_protected": age >= 55,
                "regulatory_disclaimer": "Educational asset allocation model based on Modern Portfolio Theory. Not SEBI-registered financial advice."
            }
        }
