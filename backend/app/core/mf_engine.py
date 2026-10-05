def calculate_allocation(age: int, risk: str, duration: int):
    """
    Neuro-Symbolic Deterministic Allocation Engine with Hard Fiduciary Ceilings.
    Guarantees that allocations strictly sum to 100% and enforces regulatory protection bounds.
    """
    # Base allocation logic
    equity = 0
    midcap = 0
    debt = 0
    
    # 1. Base Debt allocation anchored by investor age
    base_debt = age
    
    # 2. Risk Profile adjustment
    risk_clean = risk.lower().strip()
    if risk_clean == "high":
        debt = base_debt - 15
    elif risk_clean == "medium":
        debt = base_debt
    else:  # low / conservative
        debt = base_debt + 15
        
    # 3. Hard Fiduciary Guardrail Caps:
    # Retiree protection (age >= 55 requires minimum 45% debt regardless of user appetite)
    if age >= 55:
        debt = max(45, debt)
        
    # Young investor liquidity buffer (minimum 10% debt/liquid, maximum 85% debt for elderly)
    debt = max(10, min(85, debt))
    risky = 100 - debt
    
    # 4. Split risky capital between Large Cap Equity and High-Beta Midcap
    # Midcap peaks around age 40-45, tapering off for younger and older investors
    distance_from_middle_age = abs(age - 45)
    midcap_ratio = max(0.15, min(0.65, 0.75 - (distance_from_middle_age * 0.025)))
    
    midcap = int(risky * midcap_ratio)
    equity = risky - midcap
    
    # Strict Mathematical Invariant Check
    total = equity + midcap + debt
    if total != 100:
        equity += (100 - total)
        
    # 5. Multi-Phase Lifecycle Rebalancing Schedule
    rebalancing_plan = []
    current_equity = equity
    current_midcap = midcap
    current_debt = debt
    
    remaining_duration = duration
    start_year = 1
    
    while remaining_duration > 0:
        phase_len = 10 if remaining_duration >= 10 else remaining_duration
        end_year = start_year + phase_len - 1
        phase_name = f"Years {start_year}-{end_year}"
        
        rebalancing_plan.append({
            "phase": phase_name,
            "equity": current_equity,
            "midcap": current_midcap,
            "debt": current_debt
        })
        
        # Shift 10% from risky assets into stable Debt as goal maturity approaches
        shift = 10
        if current_midcap >= shift:
            current_midcap -= shift
            current_debt += shift
        elif current_midcap > 0:
            rem_shift = shift - current_midcap
            current_debt += current_midcap
            current_midcap = 0
            if current_equity >= rem_shift:
                current_equity -= rem_shift
                current_debt += rem_shift
        elif current_equity >= shift:
            current_equity -= shift
            current_debt += shift
            
        start_year = end_year + 1
        remaining_duration -= phase_len
        
    return {
        "allocation": {"equity": equity, "midcap": midcap, "debt": debt},
        "rebalancing_plan": rebalancing_plan
    }
    
def calculate_projections(amount: float, cagr: float, duration: int, annual_inflation_pct: float = 6.0):
    """
    Computes both Nominal Future Value and Inflation-Adjusted Real Purchasing Power.
    """
    # Nominal future values
    expected_nominal = amount * ((1 + cagr / 100) ** duration)
    conservative_nominal = amount * ((1 + max(cagr - 4, 3) / 100) ** duration)
    optimistic_nominal = amount * ((1 + (cagr + 4) / 100) ** duration)
    
    # Inflation deflator factor: (1 + inflation)^duration
    inflation_factor = (1 + annual_inflation_pct / 100) ** duration
    expected_real = expected_nominal / inflation_factor
    
    return {
        "conservative": round(conservative_nominal, 2),
        "expected": round(expected_nominal, 2),
        "optimistic": round(optimistic_nominal, 2),
        "inflation_adjusted_real_value": round(expected_real, 2),
        "inflation_rate_assumed": annual_inflation_pct
    }
