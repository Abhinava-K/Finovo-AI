from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
from app.services.mfapi import search_schemes, get_scheme_history, calculate_cagr_since_inception
from app.services.coingecko import get_crypto_prices
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

def get_llm():
    """Dynamically load and configure LLM from environment variables."""
    provider = os.getenv("LLM_PROVIDER", "").strip().lower()
    model = os.getenv("LLM_MODEL", "").strip()
    temperature = float(os.getenv("LLM_TEMPERATURE", "0"))
    
    # 1. OpenAI / OpenAI-compatible OSS endpoints (OpenRouter, Together, Local Ollama/vLLM)
    if provider in ["openai", "openrouter", "ollama", "custom"] or (
        not provider and (
            model.startswith("gpt") or 
            model.startswith("o1") or 
            model.startswith("o3") or 
            os.getenv("OPENAI_BASE_URL") or 
            (os.getenv("OPENAI_API_KEY") and not os.getenv("GROQ_API_KEY"))
        )
    ):
        from langchain_openai import ChatOpenAI
        model_name = model or "gpt-4o-mini"
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
    """Search for mutual funds by name and return top results with 3Y CAGR."""
    try:
        results = await search_schemes(query)
        if not results: return "No funds found."
        top_results = results[:3]
        
        info = []
        for fund in top_results:
            hist = await get_scheme_history(fund['schemeCode'])
            cagr = calculate_cagr_since_inception(hist)
            info.append(f"Name: {fund['schemeName']} | Code: {fund['schemeCode']} | Inception CAGR: {cagr}%")
        return "\n".join(info)
    except Exception as e:
        return str(e)

@tool
async def get_crypto_price_tool(coin_ids: str) -> str:
    """Fetch current price and 24h change for crypto coins. coin_ids should be comma-separated like 'bitcoin,ethereum'."""
    try:
        ids = coin_ids.split(",")
        data = await get_crypto_prices(ids)
        res = []
        for coin, stats in data.items():
            res.append(f"{coin.capitalize()}: ${stats.get('usd', 0)} (24h change: {stats.get('usd_24h_change', 0)}%)")
        return "\n".join(res)
    except Exception as e:
        return str(e)

tools = [search_mutual_funds_tool, get_crypto_price_tool]
system_message = "You are an expert AI Investment Advisor. Answer the user's queries using the provided tools to fetch live data. Always format comparisons in Markdown tables. Add a disclaimer that this is not financial advice."

agent_executor = create_react_agent(llm, tools, prompt=system_message)
