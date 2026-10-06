from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import time
from app.agents.advisor_agent import agent_executor
from app.core.sanitizer import TableSanitizerGuardrail

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

@router.post("/chat", response_model=AgentResponse)
async def agent_chat(req: AgentRequest):
    """
    Multi-Turn Agentic Chat with Parallel Grounding, 
    Table Sanitizer Guardrails, and Dual Markdown + Structured JSON Chart Payloads.
    """
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

        return AgentResponse(
            reply=sanitized_res["sanitized_reply"],
            structured_allocation=sanitized_res["structured_allocation"],
            sum_invariant_verified=sanitized_res["sum_invariant_verified"],
            disclaimer_verified=sanitized_res["disclaimer_verified"],
            latency_ms=latency
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
