import re
from typing import Tuple, Optional, List, Dict, Any

class FinancialDomainGuardrail:
    """
    Dual-Tier Fiduciary Domain Guardrail for FinovoAI.
    Tier 1: Pre-flight Intent Analysis (determines pure off-topic vs. mixed Trojan vs. financial).
    Tier 2: System Prompt Steering (enforces refusal of non-financial aspects).
    """

    # Non-financial off-topic domains: Gaming, Esports, Entertainment, Pop Culture, Sports, Recipes, Trivia, etc.
    OFF_TOPIC_PATTERNS = [
        # Gaming & Esports
        r'\b(?:rocket\s*league|shadow\s*fight|minecraft|fortnite|valorant|gta\s*5?|roblox|call\s*of\s*duty|cod|pubg|free\s*fire|apex\s*legends|overwatch|elden\s*ring|cyberpunk|clash\s*of\s*clans|genshin|candy\s*crush|fifa|fc\s*24|fc\s*25|league\s*of\s*legends|dota\s*2?|counter\s*strike|csgo|cs2)\b',
        r'\b(?:aerial\s*mechanics?|wave\s*dash|flip\s*cancel|aimbot|cheat\s*codes?|speedrun|boss\s*fight|weapon\s*mastery|stick\s*sensitivity|camera\s*height|camera\s*settings|bakkesmod|air\s*roll|double\s*jump|play\s*style|gameplay|gaming\s*tips?|esports?|ps5|xbox|nintendo|steam|gaming\s*console|kusarigama|combos?)\b',
        
        # Entertainment, Pop Culture, Movies, TV, Music
        r'\b(?:hollywood|bollywood|netflix|movie\s*review|actor|actress|pop\s*music|anime|manga|marvel|batman|superman|disney|cinema|celebrity|gossip|song\s*lyrics|tv\s*series|song\s*recommendation)\b',
        
        # Sports (non-financial match queries)
        r'\b(?:ipl\s*score|cricket\s*score|football\s*match|premier\s*league|world\s*cup\s*score|nba\s*score|messi|ronaldo|virat\s*kohli|tennis\s*grand\s*slam|formula\s*1|f1\s*race)\b',
        
        # Creative writing, fiction, non-financial homework, jokes
        r'\b(?:write\s*a\s*(?:poem|story|song|essay|joke)|tell\s*me\s*a\s*joke|solve\s*my\s*homework|riddle)\b',
        
        # General tech/coding unrelated to finance
        r'\b(?:write\s*(?:a\s*)?(?:python|javascript|c\+\+|java)?\s*(?:game|snake|flappy\s*bird)|hack\s*wifi|css\s*animation|leetcode|binary\s*tree)\b',
        
        # Food, Recipes & Cooking
        r'\b(?:recipe|cook(?:ing)?|bake|cake|pasta|pizza|biryani|ingredients\s*for)\b',
        
        # Health & Medical
        r'\b(?:symptoms\s*of|diagnos(?:e|is)|cure\s*for|treatment\s*for|headache\s*remedy)\b',
        
        # General non-financial trivia & geography
        r'\b(?:who\s*is\s*the\s*president\s*of|capital\s*of|weather\s*in|distance\s*to\s*the\s*moon)\b'
    ]

    # Core financial concepts & keywords
    FINANCIAL_PATTERNS = [
        r'\b(?:invest(?:ment|ing|or|s)?|sip|lump\s*sum|mutual\s*funds?|stocks?|shares?|equit(?:y|ies)|debt|bonds?|gold|silver|commodit(?:y|ies))\b',
        r'\b(?:crypto|bitcoin|btc|ethereum|eth|solana|digital\s*assets?|altcoins?)\b',
        r'\b(?:portfolio|asset\s*allocation|rebalanc(?:e|ing)|cagr|sharpe|volatility|nav|drawdown|benchmark)\b',
        r'\b(?:returns?|yields?|dividends?|capital\s*gains?|ltcg|stcg|tax(?:es|ation)?)\b',
        r'\b(?:wealth|retirement|pension|epf|ppf|nps|fixed\s*deposit|fd|rd|bank\s*savings?|inflation)\b',
        r'\b(?:rupees?|inr|₹|dollars?|\$|crores?|lakhs?|capital|budget|cash\s*flow|emergency\s*fund|liquidity)\b',
        r'\b(?:nifty|sensex|sebi|rbi|sec|etf|index\s*fund|small\s*cap|mid\s*cap|large\s*cap|flexi\s*cap|liquid\s*fund)\b',
        r'\b(?:alpha|beta|expense\s*ratio|amfi|fund\s*house|zerodha|groww|kuvera|mfapi)\b',
        r'\b(?:loans?|mortgage|interest\s*rates?|credit\s*score|cibil|reits?|real\s*estate|insurance|term\s*plan)\b',
        r'\b(?:bull\s*market|bear\s*market|trading|hedg(?:e|ing)|options|futures|forex|financial\s*freedom|fire)\b'
    ]

    CANONICAL_REFUSAL = (
        "### 🛡️ FinovoAI Policy Notice: Financial Queries Only\n\n"
        "I am **FinovoAI**, an AI assistant specialized **strictly and exclusively in investment advisory and personal finance**.\n\n"
        "I cannot answer questions about video games (such as Rocket League, Shadow Fight, or gaming mechanics), sports, entertainment, creative writing, or general non-financial topics.\n\n"
        "**Here are financial topics you can explore with me:**\n"
        "- 📊 *Personalized Mutual Fund & SIP allocation based on your age and risk appetite*\n"
        "- 📈 *Comparing Equity SIPs vs. Sovereign Gold Bonds (SGB) or Gold ETFs*\n"
        "- 🪙 *Conservative, Moderate, and Aggressive asset allocation matrices (summing to 100%)*\n"
        "- ⚖️ *Portfolio rebalancing strategies and market downside protection*\n\n"
        "*Feel free to ask any question regarding your investments, savings, or wealth building!*"
    )

    @classmethod
    def check_query_domain(cls, query: str) -> Tuple[bool, bool, Optional[str]]:
        """
        Inspects query for domain compliance.
        Returns:
            is_pure_offtopic (bool): True if query has off-topic terms and ZERO financial intent.
            is_mixed_trojan (bool): True if query mixes off-topic terms WITH legitimate financial terms.
            refusal_text (Optional[str]): Canned response if pure off-topic.
        """
        text = query.lower()

        has_offtopic = any(re.search(p, text, re.IGNORECASE) for p in cls.OFF_TOPIC_PATTERNS)
        has_financial = any(re.search(p, text, re.IGNORECASE) for p in cls.FINANCIAL_PATTERNS)

        # 1. Pure Off-Topic: matched non-financial domain and contains zero finance
        if has_offtopic and not has_financial:
            return True, False, cls.CANONICAL_REFUSAL

        # 2. Mixed Trojan Query: e.g. "how can i learn aerial mechanics in rocket league to invest in gold"
        if has_offtopic and has_financial:
            return False, True, None

        # 3. Clean financial or general finance query
        return False, False, None

    @classmethod
    def format_trojan_steering_prompt(cls, user_query: str) -> str:
        """
        Wraps a mixed query with strict fiduciary steering instructions so the LLM
        refuses the non-financial/gaming portion and answers ONLY the financial aspect.
        """
        return (
            "[SYSTEM DIRECTIVE / FIDUCIARY GUARDRAIL ACTIVE]\n"
            "The user query contains non-financial or gaming elements mixed with a legitimate financial topic.\n"
            "1. You MUST explicitly decline the gaming/non-financial aspect in one concise sentence (e.g., 'As FinovoAI, I specialize exclusively in investment advisory and personal finance, so I cannot provide gaming tutorials or mechanics.').\n"
            "2. You MUST NOT generate any gaming tables, camera settings, button drills, weapon guides, or video links.\n"
            "3. You MUST answer ONLY the financial and investment part of the query (e.g. gold investments, asset allocation, SIPs, liquidity).\n"
            "4. Provide quantitative metrics, structured tables, and the mandatory regulatory disclaimer.\n"
            "[END SYSTEM DIRECTIVE]\n\n"
            f"User Question: {user_query}"
        )
