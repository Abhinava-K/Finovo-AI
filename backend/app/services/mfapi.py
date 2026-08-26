import httpx
from cachetools import TTLCache
from datetime import datetime

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

def calculate_cagr_since_inception(history_data: dict) -> float:
    """Calculates the Compound Annual Growth Rate (CAGR) since inception."""
    try:
        data = history_data.get("data", [])
        if not data:
            return 0.0
            
        parsed_data = []
        for item in data:
            try:
                date_obj = datetime.strptime(item["date"], "%d-%m-%Y")
                parsed_data.append({"date": date_obj, "nav": float(item["nav"])})
            except Exception:
                pass
                
        if not parsed_data:
            return 0.0
            
        parsed_data.sort(key=lambda x: x["date"], reverse=True) # newest first
        end_nav = parsed_data[0]["nav"]
        end_date = parsed_data[0]["date"]
        
        start_nav = parsed_data[-1]["nav"]
        start_date = parsed_data[-1]["date"]
        
        years = (end_date - start_date).days / 365.25
        if years <= 0: return 0.0
        
        cagr = ((end_nav / start_nav) ** (1 / years)) - 1
        return round(cagr * 100, 2)
    except Exception:
        return 0.0
