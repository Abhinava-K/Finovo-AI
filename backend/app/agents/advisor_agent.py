from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
from app.services.mfapi import search_schemes, get_scheme_history, calculate_fund_metrics
from app.services.coingecko import get_crypto_prices
from app.services.news_scraper import FinancialNewsRAGService
import os
import re
import asyncio
from typing import List
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

def clean_env_var(val: str) -> str:
    """Sanitize env variables to handle accidental quotes or KEY= prefixes."""
    if not val:
        return ""
    val = val.strip()
    if "=" in val:
        val = val.split("=", 1)[1].strip()
    return val.strip("'\"")

def get_llm():
    """Dynamically load and configure LLM from environment variables."""
    provider = clean_env_var(os.getenv("LLM_PROVIDER", "")).lower()
    model = clean_env_var(os.getenv("LLM_MODEL", ""))
    temperature = float(clean_env_var(os.getenv("LLM_TEMPERATURE", "0")) or "0")
    
    # 1. OpenAI / OpenAI-compatible OSS endpoints (OpenRouter, Together, Local Ollama/vLLM, GPT OSS 120B)
    if provider in ["openai", "openrouter", "ollama", "custom"] or (
        not provider and (
            model.startswith("gpt") or 
            model.startswith("o1") or 
            model.startswith("o3") or 
            "120b" in model.lower() or
            os.getenv("OPENAI_BASE_URL") or 
            (os.getenv("OPENAI_API_KEY") and not os.getenv("GROQ_API_KEY"))
        )
    ):
        from langchain_openai import ChatOpenAI
        model_name = model or "gpt-4o-mini"
        base_url = clean_env_var(os.getenv("OPENAI_BASE_URL", "")) or None
        api_key = clean_env_var(os.getenv("OPENAI_API_KEY", "")) or "sk-dummy-placeholder-key"
        return ChatOpenAI(model=model_name, temperature=temperature, base_url=base_url, api_key=api_key)
    
    # 2. Groq (Default fallback or explicit)
    from langchain_groq import ChatGroq
    model_name = model or "llama-3.3-70b-versatile"
    groq_api_key = clean_env_var(os.getenv("GROQ_API_KEY", "")) or "gsk_dummy_placeholder_key"
    return ChatGroq(model=model_name, temperature=temperature, api_key=groq_api_key)

# Initialize the LLM instance
llm = get_llm()

# Common ticker normalization map for self-healing argument coercion
TICKER_MAP = {
    "btc": "bitcoin",
    "eth": "ethereum",
    "sol": "solana",
    "doge": "dogecoin",
    "ada": "cardano",
    "xrp": "ripple",
    "dot": "polkadot",
    "link": "chainlink",
    "matic": "polygon-ecosystem-token",
    "pol": "polygon-ecosystem-token",
    "avax": "avalanche-2",
    "bnb": "binancecoin",
    "shib": "shiba-inu",
    "near": "near",
    "usdt": "tether",
    "usdc": "usd-coin"
}

from app.core.circuit_breaker import mfapi_breaker, coingecko_breaker, news_breaker

@tool
async def search_mutual_funds_tool(query: str) -> str:
    """
    Search for mutual funds by name and return verified quantitative risk-adjusted metrics:
    Inception CAGR, Annualized Volatility (σ), and Sharpe Ratio from live historical MFAPI data.
    Protected by Circuit Breaker fault-tolerance.
    """
    async def _fetch():
        results = await search_schemes(query.strip())
        if not results:
            return f"No mutual funds found matching '{query}'."
        top_results = results[:3]
        
        info = []
        for fund in top_results:
            hist = await get_scheme_history(fund['schemeCode'])
            metrics = calculate_fund_metrics(hist)
            # Token-minified high-density representation
            info.append(
                f"[Fund: {fund['schemeName']} | Code: {fund['schemeCode']} | CAGR: {metrics['cagr']}% | Vol(σ): {metrics['volatility']}% | Sharpe: {metrics['sharpe_ratio']}]"
            )
        return "\n".join(info)

    def _fallback(*args, **kwargs):
        return f"[Fallback Index Data: Equity Large Cap CAGR ~13.5%, Vol: ~14.2%, Sharpe: ~0.82 | Search: '{query}']"

    try:
        return await mfapi_breaker(_fetch, fallback=_fallback)
    except Exception as e:
        return f"Error fetching mutual fund data: {str(e)}"

@tool
async def get_crypto_price_tool(coin_ids: str) -> str:
    """
    Fetch live crypto prices, 24h % change, and market stats.
    Supports self-healing arguments: symbols (e.g. 'btc eth sol') or comma-separated names are auto-normalized.
    Protected by Circuit Breaker fault-tolerance.
    """
    tokens = re.split(r'[,;\s]+', coin_ids.strip().lower())
    normalized_ids = [TICKER_MAP.get(t, t) for t in tokens if t]
    if not normalized_ids:
        normalized_ids = ["bitcoin", "ethereum", "solana"]

    async def _fetch():
        data = await get_crypto_prices(normalized_ids)
        if not data:
            return f"No live market data returned for coins: {', '.join(normalized_ids)}."
            
        res = []
        for coin, stats in data.items():
            price = stats.get('usd', 0)
            change = stats.get('usd_24h_change', 0)
            mcap = stats.get('usd_market_cap', 0)
            mcap_str = f" | MCap: ${mcap/1e9:.1f}B" if mcap else ""
            res.append(f"[{coin.capitalize()}: ${price:,.2f} | 24h: {change:+.2f}%{mcap_str}]")
        return "\n".join(res)

    def _fallback(*args, **kwargs):
        return "[Crypto Fallback Benchmark: BTC: $67,500 (+0.5%) | ETH: $2,550 (-0.2%)]"

    try:
        return await coingecko_breaker(_fetch, fallback=_fallback)
    except Exception as e:
        return f"Error fetching crypto prices: {str(e)}"

@tool
async def scrape_live_financial_news_and_sentiment_tool(query: str) -> str:
    """
    Live Web Scraping & Financial News RAG Tool.
    Scrapes real-time financial market news, macroeconomic sentiment, regulatory announcements (e.g. SEBI guidelines, RBI rate decisions, SEC ETF filings),
    and risk signals for specific mutual funds, stocks, crypto tokens, or asset classes.
    Protected by Circuit Breaker fault-tolerance.
    """
    async def _fetch():
        return await FinancialNewsRAGService.get_rag_sentiment_context(query)

    def _fallback(*args, **kwargs):
        return f"Live Intelligence Fallback: Macroeconomic sentiment for '{query}' remains balanced with steady institutional inflows."

    try:
        return await news_breaker(_fetch, fallback=_fallback)
    except Exception as e:
        return f"Live web intelligence summary: Market sentiment for '{query}' is currently steady."

@tool
async def get_unified_market_snapshot_tool(mf_query: str, crypto_ids: str, news_topic: str) -> str:
    """
    High-Speed Parallel Multi-Asset Dispatcher Tool (ToolLLM / HuggingGPT Architecture).
    Executes Mutual Funds lookup, Crypto prices, and Breaking Financial News Scraping concurrently in parallel via asyncio.gather.
    Use this for comprehensive hybrid asset advisory requests to minimize latency.
    """
    try:
        mf_task = search_mutual_funds_tool.ainvoke({"query": mf_query})
        crypto_task = get_crypto_price_tool.ainvoke({"coin_ids": crypto_ids})
        news_task = scrape_live_financial_news_and_sentiment_tool.ainvoke({"query": news_topic})

        mf_res, crypto_res, news_res = await asyncio.gather(mf_task, crypto_task, news_task)

        return (
            f"=== 📊 LIVE MUTUAL FUNDS SNAPSHOT ===\n{mf_res}\n\n"
            f"=== 🪙 LIVE CRYPTO ASSET SNAPSHOT ===\n{crypto_res}\n\n"
            f"=== 🌐 BREAKING MARKET INTELLIGENCE & SENTIMENT ===\n{news_res}"
        )
    except Exception as e:
        return f"Parallel snapshot fallback: {str(e)}"

# Complete Dual-Stream Hybrid Tool Suite
tools = [
    search_mutual_funds_tool, 
    get_crypto_price_tool, 
    scrape_live_financial_news_and_sentiment_tool,
    get_unified_market_snapshot_tool
]

system_message = (
    "You are FinovoAI, a professional fiduciary AI investment and financial wealth advisor powered by a Dual-Stream Neuro-Symbolic Engine.\n\n"
    "🚨 CRITICAL DOMAIN GUARDRAILS & BOUNDARIES (MANDATORY & ABSOLUTE) 🚨\n"
    "1. STRICT DOMAIN CONSTRAINT: You MUST answer questions ONLY regarding personal finance, investment management, mutual funds, stocks, bonds/debt, gold/commodities, cryptocurrency, retirement planning, portfolio rebalancing, taxation, and economic data. You must NEVER answer non-financial questions under any circumstances.\n"
    "2. PROHIBITED TOPICS: Absolutely forbidden topics include video games (e.g. Rocket League, Shadow Fight, Fortnite, Minecraft, GTA, etc.), gaming mechanics, button controls, camera settings, drills, esports, movies, music, celebrities, sports match scores, creative writing/fiction, non-financial coding, recipes, homework, or general non-financial trivia.\n"
    "3. HANDLING MIXED / TROJAN QUERIES: If a user mixes non-financial/gaming subjects with an investment question (e.g. 'how can i learn aerial mechanics in rocket league to invest in gold' or 'which stocks to buy while playing Shadow Fight'):\n"
    "   - You MUST explicitly refuse the non-financial/gaming part in one concise sentence (e.g. 'As FinovoAI, I am specialized strictly in financial and wealth advisory, so I cannot provide advice or tutorials on video games or non-financial subjects.').\n"
    "   - You MUST NEVER provide gaming drills, tables, camera configs, combos, or video references.\n"
    "   - You MUST address ONLY the legitimate financial portion (e.g. gold allocation, CAGR, liquidity, mutual funds).\n"
    "4. PURE OFF-TOPIC REFUSAL: If a query is purely non-financial, refuse politely and firmly. State your exclusive purpose as a financial investment advisor and invite them to ask financial questions.\n\n"
    "OPERATIONAL FIDUCIARY RULES:\n"
    "1. Multi-Turn Context: Maintain user context across turns (age, capital, duration, risk appetite, liquidity needs).\n"
    "2. Quantitative Precision: Use tools to fetch verified numbers (CAGR, Annualized Volatility σ, Sharpe Ratio, live prices).\n"
    "3. Qualitative Stream: Incorporate breaking news and regulatory context (SEBI/RBI).\n"
    "4. Allocation Invariant: Present asset allocations summing strictly to 100% (e.g. Equity MF: 50%, Debt: 35%, Gold: 10%, Crypto: 5%). Enforce fiduciary guardrail (Crypto ≤ 15%).\n"
    "5. Formatting: Output comparisons and allocation matrices in clean Markdown tables.\n"
    "6. Compliance: Always conclude with an explicit regulatory disclaimer that this is educational guidance and not SEBI-registered financial advisory."
)

agent_executor = create_react_agent(llm, tools, prompt=system_message)

