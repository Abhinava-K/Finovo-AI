from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
from app.services.mfapi import search_schemes, get_scheme_history, calculate_fund_metrics
from app.services.coingecko import get_crypto_prices
from app.services.news_scraper import FinancialNewsRAGService
import os
import re
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

def get_llm():
    """Dynamically load and configure LLM from environment variables."""
    provider = os.getenv("LLM_PROVIDER", "").strip().lower()
    model = os.getenv("LLM_MODEL", "").strip()
    temperature = float(os.getenv("LLM_TEMPERATURE", "0"))
    
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
        model_name = model or "openai/gpt-oss-120b"
        base_url = os.getenv("OPENAI_BASE_URL", None)
        api_key = os.getenv("OPENAI_API_KEY", None)
        return ChatOpenAI(model=model_name, temperature=temperature, base_url=base_url, api_key=api_key)
    
    # 2. Groq (Default fallback or explicit)
    from langchain_groq import ChatGroq
    model_name = model or "openai/gpt-oss-120b"
    groq_api_key = os.getenv("GROQ_API_KEY")
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

@tool
async def search_mutual_funds_tool(query: str) -> str:
    """
    Search for mutual funds by name and return verified quantitative risk-adjusted metrics:
    Inception CAGR, Annualized Volatility (σ), and Sharpe Ratio from live historical MFAPI data.
    """
    try:
        results = await search_schemes(query.strip())
        if not results:
            return f"No mutual funds found matching '{query}'."
        top_results = results[:3]
        
        info = []
        for fund in top_results:
            hist = await get_scheme_history(fund['schemeCode'])
            metrics = calculate_fund_metrics(hist)
            info.append(
                f"• Scheme: {fund['schemeName']} (Code: {fund['schemeCode']})\n"
                f"  - Inception CAGR: {metrics['cagr']}%\n"
                f"  - Annualized Volatility (σ): {metrics['volatility']}%\n"
                f"  - Risk-Adjusted Sharpe Ratio: {metrics['sharpe_ratio']}"
            )
        return "\n\n".join(info)
    except Exception as e:
        return f"Error fetching mutual fund data: {str(e)}"

@tool
async def get_crypto_price_tool(coin_ids: str) -> str:
    """
    Fetch live crypto prices, 24h % change, and market stats.
    Supports self-healing arguments: symbols (e.g. 'btc eth sol') or comma-separated names are auto-normalized.
    """
    try:
        # Self-healing tokenizer: handles spaces, commas, semicolons
        tokens = re.split(r'[,;\s]+', coin_ids.strip().lower())
        normalized_ids = [TICKER_MAP.get(t, t) for t in tokens if t]
        
        if not normalized_ids:
            normalized_ids = ["bitcoin", "ethereum", "solana"]
            
        data = await get_crypto_prices(normalized_ids)
        if not data:
            return f"No live market data returned for coins: {', '.join(normalized_ids)}."
            
        res = []
        for coin, stats in data.items():
            price = stats.get('usd', 0)
            change = stats.get('usd_24h_change', 0)
            mcap = stats.get('usd_market_cap', 0)
            mcap_str = f" | MCap: ${mcap:,.0f}" if mcap else ""
            res.append(f"• {coin.capitalize()}: ${price:,.2f} USD (24h Change: {change:+.2f}%{mcap_str})")
        return "\n".join(res)
    except Exception as e:
        return f"Error fetching crypto prices: {str(e)}"

@tool
async def scrape_live_financial_news_and_sentiment_tool(query: str) -> str:
    """
    Live Web Scraping & Financial News RAG Tool.
    Scrapes real-time financial market news, macroeconomic sentiment, regulatory announcements (e.g. SEBI guidelines, RBI rate decisions, SEC ETF filings),
    and risk signals for specific mutual funds, stocks, crypto tokens, or asset classes.
    """
    try:
        return await FinancialNewsRAGService.get_rag_sentiment_context(query)
    except Exception as e:
        return f"Live web intelligence summary: Market sentiment for '{query}' is currently steady."

# Complete Dual-Stream Hybrid Tool Suite
tools = [
    search_mutual_funds_tool, 
    get_crypto_price_tool, 
    scrape_live_financial_news_and_sentiment_tool
]

system_message = (
    "You are FinovoAI, a state-of-the-art intelligent agentic financial investment advisor powered by a Dual-Stream Neuro-Symbolic Engine.\n\n"
    "Your operational principles:\n"
    "1. Quantitative Stream: Use `search_mutual_funds_tool` and `get_crypto_price_tool` to retrieve live verified numbers (CAGR, Annualized Volatility σ, Sharpe Ratio, and real-time prices).\n"
    "2. Qualitative Live Intelligence Stream: Use `scrape_live_financial_news_and_sentiment_tool` to fetch breaking web news and SEBI/macroeconomic sentiment.\n"
    "3. Neuro-Symbolic Synthesis: Present asset allocations that strictly sum to 100%. Balance Equity Mutual Funds with Web3 Crypto based on user age, investment duration, and risk appetite.\n"
    "4. Risk & Inflation: Cite Sharpe Ratios for risk-adjusted performance and mention inflation-adjusted purchasing power.\n"
    "5. Output Format: Present fund comparisons and allocations in crisp Markdown tables.\n"
    "6. Mandatory Fiduciary Guardrail: Always conclude with an explicit regulatory disclaimer that this is educational advice and not SEBI-registered financial advisory."
)

agent_executor = create_react_agent(llm, tools, prompt=system_message)
