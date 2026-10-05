from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.agents.advisor_agent import agent_executor

router = APIRouter()

class AgentRequest(BaseModel):
    query: str

@router.post("/chat")
async def agent_chat(req: AgentRequest):
    try:
        response = await agent_executor.ainvoke({"messages": [("user", req.query)]})
        return {"reply": response["messages"][-1].content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
