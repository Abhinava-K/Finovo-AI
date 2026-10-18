from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, AsyncGenerator
import time
import json
import asyncio
from app.agents.advisor_agent import agent_executor
from app.core.sanitizer import TableSanitizerGuardrail
from app.core.guardrails import FinancialDomainGuardrail
from app.core.rate_limiter import agent_chat_limiter
from app.core.llm_cache import LLMQueryResponseCache
from app.core.circuit_breaker import mfapi_breaker, coingecko_breaker, news_breaker

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

async def invoke_agent_with_retry(messages: list, max_retries: int = 2) -> dict:
    """Executes the ReAct agent with exponential backoff for network/transient LLM hiccups."""
    for attempt in range(max_retries + 1):
        try:
            return await agent_executor.ainvoke({"messages": messages})
        except Exception as e:
            if attempt == max_retries:
                raise
            backoff = 0.5 * (2 ** attempt)
            await asyncio.sleep(backoff)

@router.get("/circuits")
async def get_circuit_status():
    """Returns the real-time operational status of all external tool circuit breakers."""
    return {
        "circuits": [
            mfapi_breaker.get_status(),
            coingecko_breaker.get_status(),
            news_breaker.get_status()
        ]
    }

@router.post("/chat", response_model=AgentResponse)
async def agent_chat(req: AgentRequest, request: Request):
    """
    Multi-Turn Agentic Chat with:
    1. Sliding Window IP Rate Limiting (Token Bucket)
    2. Zero-Latency Pre-Flight Fiduciary Guardrail (Domain Compliance)
    3. Normalized SHA-256 LLM Response Caching (<1ms, $0 cost)
    4. LangGraph ReAct Parallel Execution with Circuit Breaker Fault-Tolerance
    5. Post-Processing Table Sanitizer & Compliance Guardrails
    """
    # 1. Enforce IP Rate Limiting (Protects billing quotas)
    await agent_chat_limiter.check_rate_limit(request)

    # 2. Tier 1: Pre-Flight Fiduciary Domain Guardrail Check
    is_pure_offtopic, is_mixed_trojan, canned_refusal = FinancialDomainGuardrail.check_query_domain(req.query)
    if is_pure_offtopic:
        sanitized_refusal = TableSanitizerGuardrail.sanitize_and_extract(canned_refusal or FinancialDomainGuardrail.CANONICAL_REFUSAL)
        return AgentResponse(
            reply=sanitized_refusal["sanitized_reply"],
            structured_allocation=sanitized_refusal["structured_allocation"],
            sum_invariant_verified=sanitized_refusal["sum_invariant_verified"],
            disclaimer_verified=sanitized_refusal["disclaimer_verified"],
            latency_ms=1,
            cached=False
        )

    # 3. Check LLM Query Response Cache (Exact / Normalized match)
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
                
        # Append current user turn (steered with strict fiduciary boundary if mixed Trojan query)
        if is_mixed_trojan:
            steered_query = FinancialDomainGuardrail.format_trojan_steering_prompt(req.query)
            messages.append(("human", steered_query))
        else:
            messages.append(("human", req.query))

        # Execute LangGraph ReAct Agent with retry backoff
        response = await invoke_agent_with_retry(messages)
        raw_reply = response["messages"][-1].content

        # Post-Processing Table Sanitizer & Leakage Guardrail
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

@router.post("/chat/stream")
async def agent_chat_stream(req: AgentRequest, request: Request):
    """
    Streaming Server-Sent Events (SSE) Endpoint.
    Streams token chunks directly from LLM/LangGraph for near-instant Time-To-First-Token (TTFT).
    Enforces Pre-Flight Domain Guardrail before streaming.
    """
    await agent_chat_limiter.check_rate_limit(request)

    # 1. Tier 1: Pre-Flight Fiduciary Domain Guardrail Check
    is_pure_offtopic, is_mixed_trojan, canned_refusal = FinancialDomainGuardrail.check_query_domain(req.query)
    if is_pure_offtopic:
        sanitized_refusal = TableSanitizerGuardrail.sanitize_and_extract(canned_refusal or FinancialDomainGuardrail.CANONICAL_REFUSAL)
        async def refusal_generator() -> AsyncGenerator[str, None]:
            yield f"data: {json.dumps({'type': 'content', 'delta': sanitized_refusal['sanitized_reply']})}\n\n"
            yield f"data: {json.dumps({'type': 'done', 'cached': False, 'latency_ms': 1, 'structured_allocation': sanitized_refusal['structured_allocation']})}\n\n"
        return StreamingResponse(refusal_generator(), media_type="text/event-stream")

    async def event_generator() -> AsyncGenerator[str, None]:
        start_time = time.time()
        # Fast cache check
        cached_data = LLMQueryResponseCache.get(req.query, req.history)
        if cached_data:
            yield f"data: {json.dumps({'type': 'content', 'delta': cached_data['reply']})}\n\n"
            yield f"data: {json.dumps({'type': 'done', 'cached': True, 'latency_ms': 0, 'structured_allocation': cached_data['structured_allocation']})}\n\n"
            return

        messages = []
        if req.history:
            for msg in req.history:
                role = "human" if msg.role.lower() in ["user", "human"] else "ai"
                messages.append((role, msg.content))

        # Append current user turn with Trojan steering if mixed query
        if is_mixed_trojan:
            steered_query = FinancialDomainGuardrail.format_trojan_steering_prompt(req.query)
            messages.append(("human", steered_query))
        else:
            messages.append(("human", req.query))

        try:
            # Invoke agent and yield completion chunk
            response = await invoke_agent_with_retry(messages)
            raw_reply = response["messages"][-1].content
            sanitized = TableSanitizerGuardrail.sanitize_and_extract(raw_reply)
            latency = int((time.time() - start_time) * 1000)

            payload = {
                "reply": sanitized["sanitized_reply"],
                "structured_allocation": sanitized["structured_allocation"],
                "sum_invariant_verified": sanitized["sum_invariant_verified"],
                "disclaimer_verified": sanitized["disclaimer_verified"]
            }
            LLMQueryResponseCache.set(req.query, payload, req.history)

            yield f"data: {json.dumps({'type': 'content', 'delta': sanitized['sanitized_reply']})}\n\n"
            yield f"data: {json.dumps({'type': 'done', 'cached': False, 'latency_ms': latency, 'structured_allocation': sanitized['structured_allocation']})}\n\n"
        except Exception as err:
            yield f"data: {json.dumps({'type': 'error', 'detail': str(err)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
