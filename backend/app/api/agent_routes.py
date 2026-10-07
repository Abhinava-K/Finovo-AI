from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import time
from app.agents.advisor_agent import agent_executor
from app.core.sanitizer import TableSanitizerGuardrail
from app.core.rate_limiter import agent_chat_limiter
from app.core.llm_cache import LLMQueryResponseCache

router = APIRouter()

class ChatMessagePayload(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(..., description="Message text content")

class AgentRequest(BaseModel):
    query: str = Field(..., description="Current user query")
    history: Optional[List[ChatMessagePayload]] = Field(default=None, description="Previous conversation message turns for multi-turn context")

class AgentResponse(BaseModel):
    reply: str
    structured_allocation: Dict[str, float]
    sum_invariant_verified: bool
    disclaimer_verified: bool
    latency_ms: int
    cached: bool = Field(default=False, description="True if served instantly from in-memory response cache ($0 LLM cost)")

@router.post("/chat", response_model=AgentResponse)
async def agent_chat(req: AgentRequest, request: Request):
    """
    Multi-Turn Agentic Chat with:
    1. Sliding Window IP Rate Limiting (Token Bucket)
    2. Normalized SHA-256 LLM Response Caching (<1ms, $0 cost)
    3. LangGraph Parallel Grounding & Table Sanitizer Guardrails
    """
    # 1. Enforce IP Rate Limiting (Protects billing quotas)
    await agent_chat_limiter.check_rate_limit(request)

    # 2. Check LLM Query Response Cache (Exact / Normalized match)
    cached_data = LLMQueryResponseCache.get(req.query, req.history)
    if cached_data:
        return AgentResponse(
            reply=cached_data["reply"],
            structured_allocation=cached_data["structured_allocation"],
            sum_invariant_verified=cached_data.get("sum_invariant_verified", True),
            disclaimer_verified=cached_data.get("disclaimer_verified", True),
            latency_ms=0,
            cached=True
        )

    start_time = time.time()
    try:
        # Build multi-turn messages context
        messages = []
        if req.history:
            for msg in req.history:
                role = "human" if msg.role.lower() in ["user", "human"] else "ai"
                messages.append((role, msg.content))
                
        # Append current user turn
        messages.append(("human", req.query))

        # Execute LangGraph ReAct Agent
        response = await agent_executor.ainvoke({"messages": messages})
        raw_reply = response["messages"][-1].content

        # Post-Processing Table Sanitizer Guardrail
        sanitized_res = TableSanitizerGuardrail.sanitize_and_extract(raw_reply)
        latency = int((time.time() - start_time) * 1000)

        response_payload = {
            "reply": sanitized_res["sanitized_reply"],
            "structured_allocation": sanitized_res["structured_allocation"],
            "sum_invariant_verified": sanitized_res["sum_invariant_verified"],
            "disclaimer_verified": sanitized_res["disclaimer_verified"],
        }

        # Cache response for 10 minutes to save future inference tokens
        LLMQueryResponseCache.set(req.query, response_payload, req.history)

        return AgentResponse(
            reply=response_payload["reply"],
            structured_allocation=response_payload["structured_allocation"],
            sum_invariant_verified=response_payload["sum_invariant_verified"],
            disclaimer_verified=response_payload["disclaimer_verified"],
            latency_ms=latency,
            cached=False
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
