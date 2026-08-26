def calculate_crypto_allocation(amount: float, horizon: str, drawdown: int):
    # Logic to select coins based on horizon and drawdown
    if drawdown == 20: # Conservative
        alloc = {"USDC (Stable)": 60, "PAXG (Gold)": 20, "BTC": 20}
        proj_cagr = 8.0
        volatility = "Low"
    elif drawdown == 50: # Moderate
        if horizon == "short-term":
            alloc = {"USDC": 30, "BTC": 40, "ETH": 30}
        else:
            alloc = {"BTC": 50, "ETH": 30, "LINK": 10, "UNI": 10}
        proj_cagr = 15.0
        volatility = "Medium"
    else: # 80 - Aggressive
        if horizon == "short-term":
            alloc = {"SOL": 40, "DOGE": 20, "RNDR": 20, "BTC": 20}
        elif horizon == "medium-term":
            alloc = {"ETH": 40, "SOL": 30, "FET": 15, "INJ": 15}
        else: # long term
            alloc = {"BTC": 40, "ETH": 30, "DOT": 15, "ATOM": 15}
        proj_cagr = 30.0
        volatility = "Very High"
        
    duration_map = {"short-term": 1, "medium-term": 2, "long-term": 5}
    duration_years = duration_map[horizon]
        
    conservative = amount * ((1 + max(proj_cagr - 15, 0) / 100) ** duration_years)
    expected = amount * ((1 + proj_cagr / 100) ** duration_years)
    optimistic = amount * ((1 + (proj_cagr + 25) / 100) ** duration_years)
    
    return {
        "allocation": alloc,
        "projection": {
            "duration_years": duration_years,
            "conservative": round(conservative, 2),
            "expected": round(expected, 2),
            "optimistic": round(optimistic, 2)
        },
        "risk_analysis": {
            "volatility": volatility,
            "max_drawdown_limit": drawdown,
            "reasoning": f"Assets selected dynamically based on {horizon} horizon and {drawdown}% drawdown tolerance. Higher risk limits allocate to Altcoins while strict drawdowns rely heavily on Stablecoins and Gold-pegged tokens."
        }
    }
