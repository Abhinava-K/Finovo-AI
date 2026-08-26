def calculate_allocation(age: int, risk: str, duration: int):
    # Base allocation logic
    equity = 0
    midcap = 0
    debt = 0
    
    # Dynamic allocation based on continuous age and risk profile
    
    # Debt increases as age increases
    base_debt = age
    
    # Adjust overall risk tolerance based on risk profile
    if risk == "high":
        debt = base_debt - 15
    elif risk == "medium":
        debt = base_debt
    else:  # low
        debt = base_debt + 15
        
    # Clamp debt between 10% and 90%
    debt = max(10, min(90, debt))
    risky = 100 - debt
    
    # Split risky assets between Equity and Midcap
    # The dad's rule: Young -> Equity, Middle-aged -> Midcaps, Older -> Debt (already handled above)
    # We create a peak for midcap allocation around age 45.
    distance_from_middle_age = abs(age - 45)
    
    # Midcap ratio peaks at 80% of risky assets at age 45, and drops as you get younger or older
    midcap_ratio = max(0.1, 0.8 - (distance_from_middle_age * 0.03))
    
    midcap = int(risky * midcap_ratio)
    equity = risky - midcap
    # Duration rebalancing (multiples of 10 years, and remaining years at the end)
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
        
        # Shift 10% from risky assets (Midcap first, then Equity) into Debt for the NEXT phase
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
    
def calculate_projections(amount: float, cagr: float, duration: int):
    expected = amount * ((1 + cagr / 100) ** duration)
    conservative = amount * ((1 + max(cagr - 4, 4) / 100) ** duration)
    optimistic = amount * ((1 + (cagr + 4) / 100) ** duration)
    
    return {
        "conservative": round(conservative, 2),
        "expected": round(expected, 2),
        "optimistic": round(optimistic, 2)
    }
