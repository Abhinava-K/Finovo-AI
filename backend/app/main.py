from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from app.api import mf_routes, crypto_routes, agent_routes, portfolio_routes

app = FastAPI(title="FinovoAI Investment Advisor API")

# Setup CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup GZip Payload Compression (compresses responses > 500 bytes by 75-85%)
app.add_middleware(GZipMiddleware, minimum_size=500)

app.include_router(portfolio_routes.router, prefix="/api/portfolio", tags=["Unified Portfolio Engine"])
app.include_router(mf_routes.router, prefix="/api/mf", tags=["Mutual Funds"])
app.include_router(crypto_routes.router, prefix="/api/crypto", tags=["Crypto"])
app.include_router(agent_routes.router, prefix="/api/agent", tags=["Agentic Advisor"])

@app.get("/")
def read_root():
    return {"message": "FinovoAI Investment Advisor Backend is running!"}
