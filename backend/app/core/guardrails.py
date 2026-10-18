import re
from typing import Tuple, Optional, Dict, Any
from app.agents.advisor_agent import llm

class FinancialDomainGuardrail:
    """
    Generalized Semantic & Fiduciary Domain Guardrail for FinovoAI.
    Zero Hardcoded Blacklists: Uses fast zero-shot LLM intent classification (NeMo/Llama-Guard style)
    to classify any user message across any open domain into:
    - FINANCIAL (in-domain personal finance, investing, wealth planning)
    - GREETING (onboarding, identity, conversational hello)
    - MIXED (combining an unrelated domain with a financial question)
    - OFF_TOPIC (pure non-financial topics: games, sports, recipes, entertainment, trivia, etc.)
    """

    CANONICAL_REFUSAL = (
        "### 🛡️ FinovoAI Policy Notice: Financial Queries Only\n\n"
        "I am **FinovoAI**, an AI assistant specialized **strictly and exclusively in investment advisory, portfolio management, and personal finance**.\n\n"
        "I cannot answer questions outside the domain of personal finance and investments.\n\n"
        "**Here are financial topics you can explore with me:**\n"
        "- 📊 *Personalized Mutual Fund & SIP allocation based on your age and risk appetite*\n"
        "- 📈 *Comparing Equity SIPs vs. Sovereign Gold Bonds (SGB) or Gold ETFs*\n"
        "- 🪙 *Conservative, Moderate, and Aggressive asset allocation matrices (summing to 100%)*\n"
        "- ⚖️ *Portfolio rebalancing strategies and market downside protection*\n\n"
        "*Feel free to ask any question regarding your investments, savings, or wealth building!*"
    )

    CLASSIFICATION_PROMPT = """You are a strict compliance domain filter for a personal finance AI advisor.
Classify the user message into ONE single word from:
[FINANCIAL, GREETING, MIXED, OFF_TOPIC]

- FINANCIAL: purely about money, investing, mutual funds, gold, crypto, savings, taxes, or wealth.
- GREETING: greetings, hello, who are you, help.
- MIXED: combines unrelated subjects (gaming, sports, recipes, general chat) WITH a financial question.
- OFF_TOPIC: completely unrelated to personal finance, money, or investing.

Reply ONLY with the single category word.

User message: "{query}"
Classification:"""

    @classmethod
    async def evaluate_query(cls, query: str) -> Tuple[bool, bool, Optional[str]]:
        """
        Classifies query dynamically using zero-shot semantic intent classification.
        Returns:
            is_pure_offtopic (bool): True if completely non-financial.
            is_mixed_trojan (bool): True if query combines off-topic and financial topics.
            refusal_text (Optional[str]): Canned policy refusal for off-topic.
        """
        clean_q = query.strip()
        if not clean_q:
            return False, False, None

        try:
            res = await llm.ainvoke(cls.CLASSIFICATION_PROMPT.format(query=clean_q))
            category = res.content.strip().split()[0].upper()
            category = re.sub(r'[^A-Z_]', '', category)

            if category == "OFF_TOPIC":
                return True, False, cls.CANONICAL_REFUSAL
            elif category == "MIXED":
                return False, True, None
            else:
                # FINANCIAL or GREETING
                return False, False, None
        except Exception:
            # Fallback if classification fails: allow agent system prompt to govern
            return False, False, None

    @classmethod
    def format_trojan_steering_prompt(cls, user_query: str) -> str:
        """
        Wraps a mixed query with strict fiduciary steering instructions so the LLM
        refuses the non-financial portion and answers ONLY the financial aspect.
        """
        return (
            "[SYSTEM DIRECTIVE / FIDUCIARY GUARDRAIL ACTIVE]\n"
            "The user query contains non-financial elements mixed with a legitimate financial topic.\n"
            "1. You MUST explicitly decline the non-financial aspect in one concise sentence (e.g., 'As FinovoAI, I specialize exclusively in investment advisory and personal finance, so I cannot assist with non-financial topics.').\n"
            "2. You MUST NOT generate any tutorials, drills, settings, or non-financial guides.\n"
            "3. You MUST answer ONLY the financial and investment part of the query (e.g. gold investments, asset allocation, SIPs, liquidity).\n"
            "4. Provide quantitative metrics, structured tables, and the mandatory regulatory disclaimer.\n"
            "[END SYSTEM DIRECTIVE]\n\n"
            f"User Question: {user_query}"
        )
