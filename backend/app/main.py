"""
मराठी टिप्पणी: हे FastAPI application entrypoint आहे. येथे API app तयार होते, CORS middleware जोडले जाते, platform routes register होतात आणि health check endpoint दिला जातो.
"""

from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import random
from pydantic import BaseModel

from app.core.config import get_settings

settings = get_settings()
app = FastAPI(title="Web3 Portfolio & Analytics Platform", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock Data Schemas
class AIQuery(BaseModel):
    message: str
    portfolio: dict | None = None

# Mock Web3 Endpoints
@app.get("/health", tags=["health"])
async def health() -> dict[str, str]:
    return {"status": "ok", "environment": settings.environment}

@app.get("/api/v1/web3/gas")
async def get_gas_fees():
    """Mock live Ethereum gas tracker"""
    base = random.randint(15, 45)
    return {
        "base_fee": base,
        "slow": max(5, base - 5),
        "standard": base,
        "fast": base + 8,
        "instant": base + 22,
        "unit": "Gwei",
        "congestion": "Low" if base < 25 else ("Medium" if base < 38 else "High")
    }

@app.get("/api/v1/web3/prices")
async def get_token_prices():
    """Mock live cryptocurrency price feed with micro-variations"""
    eth_var = random.uniform(-5.0, 5.0)
    sol_var = random.uniform(-0.5, 0.5)
    link_var = random.uniform(-0.1, 0.1)
    uni_var = random.uniform(-0.05, 0.05)
    return {
        "ETH": {"price": round(3245.50 + eth_var, 2), "change_24h": round(1.24 + (eth_var/10), 2)},
        "SOL": {"price": round(142.30 + sol_var, 2), "change_24h": round(-0.45 + (sol_var/2), 2)},
        "LINK": {"price": round(15.75 + link_var, 2), "change_24h": round(3.81 + (link_var*5), 2)},
        "UNI": {"price": round(7.92 + uni_var, 2), "change_24h": round(-1.12 + (uni_var*8), 2)},
    }

@app.get("/api/v1/web3/staking")
async def get_staking_pools():
    """Mock DeFi Yield/Staking pools"""
    return [
        {"id": "eth-staking", "token": "ETH", "platform": "Lido Finance", "apy": 3.75, "tvl": "12.4B", "risk": "Low"},
        {"id": "sol-staking", "token": "SOL", "platform": "Jito", "apy": 6.82, "tvl": "1.8B", "risk": "Medium"},
        {"id": "link-staking", "token": "LINK", "platform": "Chainlink Staking v0.2", "apy": 4.15, "tvl": "450M", "risk": "Low"},
        {"id": "uni-v3-weth", "token": "UNI-ETH", "platform": "Uniswap v3 LP", "apy": 18.4, "tvl": "120M", "risk": "High"},
    ]

@app.post("/api/v1/web3/ai-analyst")
async def get_ai_analysis(payload: AIQuery):
    """Mock AI Analyst responding to Web3 portfolio questions"""
    query = payload.message.lower()
    
    if "gas" in query or "fee" in query:
        response = (
            "Based on live network parameters, current gas is standard (around 28 Gwei). "
            "I recommend executing high-volume contract calls (like complex swaps or LP mints) "
            "when gas drops below 20 Gwei (typically between 02:00 and 06:00 UTC)."
        )
    elif "stake" in query or "apy" in query or "yield" in query:
        response = (
            "Your highest yielding option is currently the **Uniswap v3 UNI-ETH LP** pool (18.40% APY), "
            "but beware of Impermanent Loss. For a safer strategy, staking SOL via Jito (6.82% APY) "
            "offers liquid staking yield with MEV rewards."
        )
    elif "portfolio" in query or "allocation" in query or "risk" in query:
        response = (
            "Looking at your current wallet, your assets are highly concentrated in ETH (73%) and SOL (20%). "
            "To reduce systemic smart contract risk, consider diversifying 10% into Chainlink (LINK) "
            "or yield-bearing stablecoin products."
        )
    else:
        responses = [
            "Market indicators are turning bullish on DeFi blue chips. Staking yields are rising in lockstep.",
            "Gas fees have spiked recently due to a high-volume NFT mint. Delay non-urgent token swaps.",
            "Double-check your smart contract approvals. I suggest revoking unlimited approvals on older DEX routes.",
            "Solana Liquid Staking (LSTs) continues to outpace Ethereum staking yields. Consider shifting allocation."
        ]
        response = random.choice(responses)
        
    return {
        "reply": response,
        "suggested_actions": [
            "Check Gas Tracker",
            "View Yield Opportunities",
            "Revoke Contract Allowances"
        ]
    }

# Mount frontend/dist static files at /
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")


