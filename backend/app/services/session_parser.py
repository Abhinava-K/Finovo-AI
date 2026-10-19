from typing import Dict, Any, List, Optional, Tuple
import json
import re

class SessionParserService:
    """
    Parses and extracts structured financial features from user-uploaded session artifacts:
    1. Chat Transcript JSON (e.g., zfinovo_chat_transcript_*.json)
    2. Portfolio Capsule JSON (e.g., finovo_capsule_*.json)
    3. Generic Financial Summary JSON
    """

    @classmethod
    def parse_session_file(cls, content_str: str) -> Dict[str, Any]:
        """
        Parses raw JSON string and normalizes it into a standardized financial profile.
        """
        try:
            data = json.loads(content_str)
        except Exception as e:
            raise ValueError(f"Invalid JSON format: {str(e)}")

        export_type = data.get("export_type", "")
        capsule_type = data.get("capsule_type", "")
        
        # 1. Handle Chat Transcript (AGENT_CHAT_TRANSCRIPT)
        if export_type == "AGENT_CHAT_TRANSCRIPT" or "conversation" in data:
            return cls._parse_chat_transcript(data)

        # 2. Handle Mutual Fund TradFi Capsule (MUTUAL_FUND_TRADFI)
        if capsule_type == "MUTUAL_FUND_TRADFI" or ("portfolio_allocation" in data and "investor_profile" in data and "equity_pct" in data.get("portfolio_allocation", {})):
            return cls._parse_mf_capsule(data)

        # 3. Handle Crypto DeFi Capsule (CRYPTO_DEFI)
        if capsule_type == "CRYPTO_DEFI":
            return cls._parse_crypto_capsule(data)

        # 4. Handle Portfolio Capsule (PORTFOLIO_CAPSULE or schema_version + computed_allocations)
        if "computed_allocations" in data or "inputs" in data:
            return cls._parse_portfolio_capsule(data)

        # 5. Fallback generic profile
        return cls._parse_generic_profile(data)

    @classmethod
    def _parse_chat_transcript(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extracts implicit and explicit financial parameters from conversation turns.
        """
        conversation = data.get("conversation", [])
        combined_user_text = " ".join([
            turn.get("content", "") for turn in conversation if turn.get("sender", "").lower() in ["investor", "user"]
        ])
        combined_all_text = " ".join([turn.get("content", "") for turn in conversation])

        # Extract capital mentions (e.g., ₹50k, 50,000, 1 Lakh, 10L, etc.)
        detected_capital = 50000.0
        capital_match = re.search(r'(?:₹|rs\.?|inr)?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d+)?)\s*(?:lakhs?|l|k|crores?|cr)?', combined_user_text, re.IGNORECASE)
        if capital_match:
            raw_num_str = capital_match.group(1).replace(",", "")
            try:
                base_val = float(raw_num_str)
                lower_match = capital_match.group(0).lower()
                if "lakh" in lower_match or " l" in lower_match:
                    detected_capital = base_val * 100000.0
                elif "cr" in lower_match or "crore" in lower_match:
                    detected_capital = base_val * 10000000.0
                elif "k" in lower_match:
                    detected_capital = base_val * 1000.0
                elif base_val >= 1000:
                    detected_capital = base_val
            except Exception:
                pass

        # Extract risk indicators
        risk_level = "medium"
        if any(w in combined_user_text.lower() for w in ["yolo", "10x", "crypto", "high return", "aggressive", "micro-cap"]):
            risk_level = "high"
        elif any(w in combined_user_text.lower() for w in ["safe", "low risk", "preservation", "guaranteed", "liquid fund", "debt"]):
            risk_level = "low"

        # Extract past allocations mentioned by the advisor
        allocations = {"equity": 50.0, "debt": 35.0, "gold": 10.0, "crypto": 5.0}
        eq_m = re.findall(r'equity[^\n\d]*(\d{1,2}(?:\.\d+)?)\s*\%', combined_all_text, re.IGNORECASE)
        debt_m = re.findall(r'debt[^\n\d]*(\d{1,2}(?:\.\d+)?)\s*\%', combined_all_text, re.IGNORECASE)
        gold_m = re.findall(r'gold[^\n\d]*(\d{1,2}(?:\.\d+)?)\s*\%', combined_all_text, re.IGNORECASE)
        crypto_m = re.findall(r'crypto[^\n\d]*(\d{1,2}(?:\.\d+)?)\s*\%', combined_all_text, re.IGNORECASE)

        if eq_m:
            allocations["equity"] = float(eq_m[-1])
        if debt_m:
            allocations["debt"] = float(debt_m[-1])
        if gold_m:
            allocations["gold"] = float(gold_m[-1])
        if crypto_m:
            allocations["crypto"] = float(crypto_m[-1])

        return {
            "source_type": "CHAT_TRANSCRIPT",
            "session_id": data.get("app_name", "FinovoAI") + "_" + data.get("exported_at", "session"),
            "timestamp": data.get("exported_at", ""),
            "capital": detected_capital,
            "risk_profile": risk_level,
            "detected_horizon_years": 7,
            "previous_allocations": allocations,
            "total_turns": len(conversation),
            "summary": f"Historical Chat Session with {len(conversation)} messages. Detected ₹{detected_capital:,.0f} capital interest, {risk_level.capitalize()} risk affinity."
        }

    @classmethod
    def _parse_portfolio_capsule(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extracts structured data from a FinovoAI Portfolio Capsule JSON.
        """
        inputs = data.get("inputs", {})
        alloc = data.get("computed_allocations", {})

        return {
            "source_type": "PORTFOLIO_CAPSULE",
            "session_id": data.get("session_id", "cap_session"),
            "timestamp": data.get("timestamp", ""),
            "capital": float(inputs.get("capital", 100000.0)),
            "age": int(inputs.get("age", 25)),
            "risk_profile": inputs.get("stated_risk_appetite", "medium").lower(),
            "detected_horizon_years": int(inputs.get("tenure_years", 5)),
            "previous_allocations": {
                "equity": float(alloc.get("equity_large_cap", 45.0) + alloc.get("equity_mid_cap", 25.0)),
                "equity_large_cap": float(alloc.get("equity_large_cap", 45.0)),
                "equity_mid_cap": float(alloc.get("equity_mid_cap", 25.0)),
                "debt": float(alloc.get("debt_funds", 15.0)),
                "gold": float(alloc.get("gold_etf", 5.0)),
                "crypto": float(alloc.get("crypto_assets", 10.0))
            },
            "metrics": data.get("risk_adjusted_metrics", {}),
            "summary": f"Portfolio Capsule. Age: {inputs.get('age', 25)}, Capital: ₹{float(inputs.get('capital', 100000)):,.0f}, Risk: {inputs.get('stated_risk_appetite', 'Moderate')}."
        }

    @classmethod
    def _parse_mf_capsule(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """Extracts structured data from a Mutual Fund TradFi Capsule JSON."""
        prof = data.get("investor_profile", {})
        alloc = data.get("portfolio_allocation", {})
        age = int(prof.get("age", 25))
        capital = float(prof.get("investment_capital_inr", 100000.0))
        risk = str(prof.get("risk_appetite", "high")).lower()
        horizon = int(prof.get("horizon_years", 5))

        eq_large = float(alloc.get("equity_pct", 50.0))
        eq_mid = float(alloc.get("midcap_pct", 30.0))
        debt = float(alloc.get("debt_pct", 20.0))

        return {
            "source_type": "MUTUAL_FUND_CAPSULE",
            "session_id": "mf_capsule_" + str(data.get("timestamp", "session")),
            "timestamp": data.get("timestamp", ""),
            "capital": capital,
            "age": age,
            "risk_profile": risk,
            "detected_horizon_years": horizon,
            "previous_allocations": {
                "equity": round(eq_large + eq_mid, 1),
                "equity_large_cap": eq_large,
                "equity_mid_cap": eq_mid,
                "debt": debt,
                "gold": 0.0,
                "crypto": 0.0
            },
            "summary": f"Mutual Fund Portfolio Capsule. Age: {age}, Capital: ₹{capital:,.0f}, Risk: {risk.capitalize()}."
        }

    @classmethod
    def _parse_crypto_capsule(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """Extracts structured data from a Crypto DeFi Capsule JSON."""
        prof = data.get("investor_profile", {})
        capital = float(prof.get("investment_capital_inr", 50000.0))
        horizon = int(prof.get("investment_horizon", 3))

        return {
            "source_type": "CRYPTO_CAPSULE",
            "session_id": "crypto_capsule_" + str(data.get("timestamp", "session")),
            "timestamp": data.get("timestamp", ""),
            "capital": capital,
            "age": 25,
            "risk_profile": "high",
            "detected_horizon_years": horizon,
            "previous_allocations": {
                "equity": 0.0,
                "equity_large_cap": 0.0,
                "equity_mid_cap": 0.0,
                "debt": 0.0,
                "gold": 0.0,
                "crypto": 100.0
            },
            "summary": f"Crypto DeFi Capsule. Capital: ₹{capital:,.0f}, 100% Digital Asset Exposure."
        }

    @classmethod
    def _parse_generic_profile(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback parser for generic financial payloads."""
        prof = data.get("investor_profile") or data.get("inputs") or data
        alloc = data.get("portfolio_allocation") or data.get("computed_allocations") or data.get("allocations") or {}

        capital = float(prof.get("investment_capital_inr") or prof.get("capital") or prof.get("amount") or 50000.0)
        age = int(prof.get("age", 25))
        risk = str(prof.get("risk_appetite") or prof.get("stated_risk_appetite") or prof.get("risk") or "medium").lower()
        horizon = int(prof.get("horizon_years") or prof.get("tenure_years") or prof.get("duration_years") or 5)

        eq_large = float(alloc.get("equity_large_cap", alloc.get("equity_pct", 45.0)))
        eq_mid = float(alloc.get("equity_mid_cap", alloc.get("midcap_pct", 25.0)))
        debt = float(alloc.get("debt_funds", alloc.get("debt_pct", alloc.get("debt", 20.0))))
        gold = float(alloc.get("gold_etf", alloc.get("gold", 5.0)))
        crypto = float(alloc.get("crypto_assets", alloc.get("crypto", 5.0)))

        return {
            "source_type": "GENERIC_JSON",
            "session_id": "generic_profile",
            "timestamp": data.get("timestamp", ""),
            "capital": capital,
            "age": age,
            "risk_profile": risk,
            "detected_horizon_years": horizon,
            "previous_allocations": {
                "equity": round(eq_large + eq_mid, 1),
                "equity_large_cap": eq_large,
                "equity_mid_cap": eq_mid,
                "debt": debt,
                "gold": gold,
                "crypto": crypto
            },
            "summary": f"Imported user financial profile. Age: {age}, Capital: ₹{capital:,.0f}, Risk: {risk.capitalize()}."
        }

    @classmethod
    def vectorize_features(cls, parsed_profile: Dict[str, Any], current_inputs: Dict[str, Any]) -> List[float]:
        """
        Transforms parsed history and current inputs into a normalized 20-dimensional feature vector
        capturing temporal lifecycle progression, capital expansion, and asset concentration.
        """
        # 1. Capital (log-normalized)
        hist_capital = parsed_profile.get("capital", 50000.0)
        curr_capital = current_inputs.get("capital", hist_capital)
        capital_ratio = min(5.0, max(0.2, curr_capital / (hist_capital or 1.0)))
        
        # 2. Risk encoding
        risk_map = {"low": 1.0, "conservative": 1.0, "medium": 2.0, "moderate": 2.0, "high": 3.0, "aggressive": 3.0}
        hist_risk = risk_map.get(parsed_profile.get("risk_profile", "medium"), 2.0)
        curr_risk = risk_map.get(current_inputs.get("risk", "medium"), 2.0)
        risk_drift_raw = curr_risk - hist_risk # Stated vs Revealed drift
        
        # 3. Horizon
        curr_horizon = max(0.033, float(current_inputs.get("duration_years", 5)) / 30.0)
        
        # 4. Allocations
        prev_alloc = parsed_profile.get("previous_allocations", {})
        eq_w = prev_alloc.get("equity", 50.0) / 100.0
        debt_w = prev_alloc.get("debt", 35.0) / 100.0
        gold_w = prev_alloc.get("gold", 10.0) / 100.0
        crypto_w = prev_alloc.get("crypto", 5.0) / 100.0

        # 5. Temporal Lifecycle Features
        past_age = float(parsed_profile.get("age", current_inputs.get("age", 25)))
        curr_age = float(current_inputs.get("age", past_age))
        age_delta_norm = max(-1.0, min(1.0, (curr_age - past_age) / 50.0))
        is_executed = 1.0 if current_inputs.get("is_executed", True) else 0.0

        # Construct 20-dim longitudinal vector
        vector = [
            capital_ratio,          # Feature 0: Capital expansion multiplier
            curr_risk / 3.0,        # Feature 1: Current risk appetite
            hist_risk / 3.0,        # Feature 2: Historical risk appetite
            risk_drift_raw,         # Feature 3: Stated vs revealed drift
            curr_horizon,           # Feature 4: Normalized investment horizon
            eq_w,                   # Feature 5: Previous equity weight
            debt_w,                 # Feature 6: Previous debt weight
            gold_w,                 # Feature 7: Previous gold weight
            crypto_w,               # Feature 8: Previous crypto weight
            1.0 if crypto_w > 0 else 0.0, # Feature 9: Crypto affinity flag
            1.0 if gold_w >= 0.10 else 0.0, # Feature 10: Inflation hedge priority
            min(1.0, curr_age / 80.0),      # Feature 11: Current age factor
            1.0 if "CHAT" in parsed_profile.get("source_type", "") else 0.5, # Feature 12: Source fidelity
            0.15,                   # Feature 13: Volatility sensitivity
            0.85,                   # Feature 14: Diversification index
            1.0,                    # Feature 15: Bias constant
            age_delta_norm,         # Feature 16: Normalized lifecycle age progression (e.g. +10 yrs)
            min(1.0, past_age / 80.0), # Feature 17: Past age factor
            is_executed,            # Feature 18: Executed past investment flag (1.0) vs draft (0.0)
            min(5.0, (hist_capital + curr_capital) / 200000.0) # Feature 19: Cumulative wealth scale
        ]
        return vector
