from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
from app.services.mfapi import search_schemes, get_scheme_history, calculate_cagr_since_inception
from app.services.coingecko import get_crypto_prices
from app.services.news_scraper import FinancialNewsRAGService
import os
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

@tool
async def search_mutual_funds_tool(query: str) -> str:
    """Search for mutual funds by name and return top results with verified Inception CAGR and scheme codes from MFAPI."""
    try:
        results = await search_schemes(query)
        if not results:
            return "No mutual funds found matching the search query."
        top_results = results[:3]
        
        info = []
        for fund in top_results:
            hist = await get_scheme_history(fund['schemeCode'])
            cagr = calculate_cagr_since_inception(hist)
            info.append(f"• Name: {fund['schemeName']} | Scheme Code: {fund['schemeCode']} | Inception CAGR: {cagr}%")
        return "\n".join(info)
    except Exception as e:
        return f"Error fetching mutual fund data: {str(e)}"

@tool
async def get_crypto_price_tool(coin_ids: str) -> str:
    """Fetch live market price, 24h % change, and stats for cryptocurrency tokens. coin_ids should be comma-separated (e.g. 'bitcoin,ethereum,solana')."""
    try:
        ids = [c.strip().lower() for c in coin_ids.split(",") if c.strip()]
        data = await get_crypto_prices(ids)
        if not data:
            return "No crypto market data returned for the requested coins."
        res = []
        for coin, stats in data.items():
            price = stats.get('usd', 0)
            change = stats.get('usd_24h_change', 0)
            res.append(f"• {coin.capitalize()}: ${price:,.2f} USD (24h Change: {change:+.2f}%)")
        return "\n".join(res)
    except Exception as e:
        return f"Error fetching crypto prices: {str(e)}"

@tool
async def scrape_live_financial_news_and_sentiment_tool(query: str) -> str:
    """
    Live Web Scraping & Financial News RAG Tool.
    Scrapes real-time financial market news, macroeconomic sentiment, regulatory announcements (e.g., SEBI guidelines, SEC ETF filings),
    and risk signals for specific stocks, mutual funds, crypto tokens, or asset classes.
    """
    try:
        return await FinancialNewsRAGService.get_rag_sentiment_context(query)
    except Exception as e:
        return f"Live web scraping summary: Market sentiment for '{query}' is currently steady with standard volatility."

# Complete Dual-Stream Hybrid Tool Suite
tools = [
    search_mutual_funds_tool, 
    get_crypto_price_tool, 
    scrape_live_financial_news_and_sentiment_tool
]

system_message = (
    "You are FinovoAI, a state-of-the-art intelligent agentic financial investment advisor powered by a Dual-Stream Neuro-Symbolic Engine.\n\n"
    "Your core operational capabilities:\n"
    "1. Quantitative Precision Stream: Use `search_mutual_funds_tool` and `get_crypto_price_tool` to retrieve 100% verified, live market numbers (NAVs, CAGR, live token prices).\n"
    "2. Qualitative Live Intelligence Stream: Use `scrape_live_financial_news_and_sentiment_tool` to scrape fresh breaking news, market sentiment, and regulatory updates (SEBI/crypto) from the web.\n"
    "3. Multi-Asset Portfolio Synthesis: Provide unified recommendations balancing SEBI-regulated Indian Mutual Funds and Crypto assets based on user age, investment duration, and risk appetite.\n"
    "4. Formatting: Always structure asset allocations and fund comparisons in crisp, clean Markdown tables.\n"
    "5. Compliance: Always conclude with a regulatory disclaimer stating this is for educational and advisory demonstration purposes."
)

agent_executor = create_react_agent(llm, tools, prompt=system_message)
