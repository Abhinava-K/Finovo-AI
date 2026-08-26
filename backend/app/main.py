from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import mf_routes, crypto_routes, agent_routes

app = FastAPI(title="AI Investment Advisor API")

# Setup CORS for Frontend Team
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(mf_routes.router, prefix="/api/mf", tags=["Mutual Funds"])
app.include_router(crypto_routes.router, prefix="/api/crypto", tags=["Crypto"])
app.include_router(agent_routes.router, prefix="/api/agent", tags=["AI Agent"])

@app.get("/")
def read_root():
    return {"message": "AI Investment Advisor Backend is running!"}
