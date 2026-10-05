import httpx
from cachetools import TTLCache
from datetime import datetime
import math
from typing import Dict, Any

# Cache for 30 minutes (max 100 items)
mf_cache = TTLCache(maxsize=100, ttl=1800)
BASE_URL = "https://api.mfapi.in"

async def fetch_json(url: str):
    if url in mf_cache:
        return mf_cache[url]
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        data = response.json()
        mf_cache[url] = data
        return data

async def search_schemes(query: str):
    url = f"{BASE_URL}/mf/search?q={query}"
    return await fetch_json(url)

async def get_latest_nav(scheme_code: int):
    url = f"{BASE_URL}/mf/{scheme_code}/latest"
    return await fetch_json(url)

async def get_scheme_history(scheme_code: int):
    url = f"{BASE_URL}/mf/{scheme_code}"
    return await fetch_json(url)

def calculate_fund_metrics(history_data: dict, risk_free_rate_pct: float = 6.5) -> Dict[str, float]:
    """
    Computes rigorous quantitative financial metrics from historical NAV:
    1. Compound Annual Growth Rate (Inception CAGR)
    2. Annualized Volatility (Standard Deviation of daily returns * sqrt(252))
    3. Sharpe Ratio ((CAGR - RiskFreeRate) / Volatility)
    """
    try:
        data = history_data.get("data", [])
        if not data or len(data) < 10:
            return {"cagr": 0.0, "volatility": 0.0, "sharpe_ratio": 0.0}
            
        parsed_data = []
        for item in data:
            try:
                date_obj = datetime.strptime(item["date"], "%d-%m-%Y")
                nav_val = float(item["nav"])
                if nav_val > 0:
                    parsed_data.append({"date": date_obj, "nav": nav_val})
            except Exception:
                pass
                
        if len(parsed_data) < 10:
            return {"cagr": 0.0, "volatility": 0.0, "sharpe_ratio": 0.0}
            
        parsed_data.sort(key=lambda x: x["date"], reverse=True) # newest first
        end_nav = parsed_data[0]["nav"]
        end_date = parsed_data[0]["date"]
        
        start_nav = parsed_data[-1]["nav"]
        start_date = parsed_data[-1]["date"]
        
        years = (end_date - start_date).days / 365.25
        if years <= 0.1:
            return {"cagr": 0.0, "volatility": 0.0, "sharpe_ratio": 0.0}
        
        # 1. CAGR
        cagr = (((end_nav / start_nav) ** (1 / years)) - 1) * 100
        
        # 2. Daily returns and Annualized Volatility
        # Calculate daily log returns from newest to oldest
        daily_returns = []
        for i in range(len(parsed_data) - 1):
            curr_nav = parsed_data[i]["nav"]
            prev_nav = parsed_data[i + 1]["nav"]
            if prev_nav > 0 and curr_nav > 0:
                ret = (curr_nav - prev_nav) / prev_nav
                daily_returns.append(ret)
                
        if len(daily_returns) > 5:
            mean_ret = sum(daily_returns) / len(daily_returns)
            variance = sum((r - mean_ret) ** 2 for r in daily_returns) / (len(daily_returns) - 1)
            daily_vol = math.sqrt(variance)
            annualized_vol = daily_vol * math.sqrt(252) * 100  # in percentage
        else:
            annualized_vol = 15.0 # fallback baseline volatility
            
        # 3. Sharpe Ratio
        if annualized_vol > 0.01:
            sharpe = (cagr - risk_free_rate_pct) / annualized_vol
        else:
            sharpe = 0.0
            
        return {
            "cagr": round(cagr, 2),
            "volatility": round(annualized_vol, 2),
            "sharpe_ratio": round(sharpe, 2)
        }
    except Exception:
        return {"cagr": 0.0, "volatility": 0.0, "sharpe_ratio": 0.0}

def calculate_cagr_since_inception(history_data: dict) -> float:
    """Calculates the Compound Annual Growth Rate (CAGR) since inception."""
    metrics = calculate_fund_metrics(history_data)
    return metrics["cagr"]
