import httpx
from cachetools import TTLCache
import os

# Cache for 5 minutes (crypto moves fast)
cg_cache = TTLCache(maxsize=100, ttl=300)
BASE_URL = "https://api.coingecko.com/api/v3"

async def fetch_json(url: str, params: dict = None):
    # Sort params to ensure a consistent cache key
    cache_key = url
    if params:
        cache_key += "?" + "&".join([f"{k}={v}" for k, v in sorted(params.items())])
        
    if cache_key in cg_cache:
        return cg_cache[cache_key]
        
    headers = {"accept": "application/json"}
    api_key = os.getenv("COINGECKO_API_KEY")
    if api_key:
        headers["x-cg-demo-api-key"] = api_key
        
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, headers=headers)
        response.raise_for_status()
        data = response.json()
        cg_cache[cache_key] = data
        return data

async def get_crypto_prices(ids: list[str]):
    """Fetches simple prices, 24hr change, and market cap for given coin IDs."""
    url = f"{BASE_URL}/simple/price"
    params = {
        "ids": ",".join(ids),
        "vs_currencies": "usd",
        "include_24hr_vol": "true",
        "include_24hr_change": "true",
        "include_market_cap": "true"
    }
    return await fetch_json(url, params)
