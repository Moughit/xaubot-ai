"""Public, read-only health API for the XAUBOT dashboard.

This service intentionally does not expose account balances, positions,
trade history, signal predictions, database access, or execution controls.
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="XAUBOT Public Status API", version="1.0.0")

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "https://xaubot-ai-zeta.vercel.app,https://xaubot-ai-git-main-moughitrade.vercel.app",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["Accept", "Content-Type"],
)

@app.get("/")
async def root():
    return {"service": "xaubot-public-status", "status": "ok", "mode": "read-only"}

@app.get("/api/health")
async def health():
    return {"status": "ok", "mode": "read-only", "private_data_exposed": False}

@app.get("/api/status")
async def status():
    # Safe placeholder: no private account or actionable trading data.
    return {
        "timestamp": "",
        "connected": False,
        "price": 0,
        "spread": 0,
        "priceChange": 0,
        "priceHistory": [],
        "balance": 0,
        "equity": 0,
        "profit": 0,
        "equityHistory": [],
        "balanceHistory": [],
        "session": "Unavailable",
        "isGoldenTime": False,
        "canTrade": False,
        "dailyLoss": 0,
        "dailyProfit": 0,
        "consecutiveLosses": 0,
        "riskPercent": 0,
        "smc": {"signal": "", "confidence": 0, "reason": "Live analysis is not connected"},
        "ml": {"signal": "", "confidence": 0, "buyProb": 0, "sellProb": 0},
        "regime": {"name": "Unavailable", "volatility": 0, "confidence": 0},
        "positions": [],
        "logs": [{"time": "", "level": "warning", "message": "Read-only public API is online; private data is not connected."}],
        "entryFilters": [],
        "riskMode": {"mode": "unavailable", "reason": "Private account data is not exposed", "recommendedLot": 0, "maxAllowedLot": 0, "totalLoss": 0, "maxTotalLoss": 0, "remainingDailyRisk": 0},
        "cooldown": {"active": False, "secondsRemaining": 0, "totalSeconds": 0},
        "timeFilter": {"wibHour": 0, "isBlocked": False, "blockedHours": []},
        "sessionMultiplier": 0,
        "positionDetails": [],
        "autoTrainer": {"lastRetrain": None, "currentAuc": None, "minAucThreshold": 0, "hoursSinceRetrain": 0, "nextRetrainHour": 0, "modelsFitted": False},
        "performance": {"loopCount": 0, "avgExecutionMs": 0, "uptimeHours": 0, "totalSessionTrades": 0, "totalSessionProfit": 0},
        "marketClose": {"hoursToDailyClose": 0, "hoursToWeekendClose": 0, "nearWeekend": False, "marketOpen": False},
        "h1BiasDetails": {"bias": "UNAVAILABLE", "ema20": 0, "price": 0},
    }

@app.get("/api/signals")
async def signals():
    return {"signals": [], "total": 0, "page": 1, "limit": 50}

@app.get("/api/signals/stats")
async def signal_stats():
    return {"total": 0, "executed": 0, "executionRate": 0, "avgConfidence": 0, "byType": {}}

@app.get("/api/trades")
async def trades():
    return {"trades": [], "total": 0, "page": 1, "limit": 25}

@app.get("/api/trades/stats")
async def trade_stats():
    return {"totalTrades": 0, "winRate": 0, "netProfit": 0, "profitFactor": 0, "avgWin": 0, "avgLoss": 0, "bestTrade": 0, "worstTrade": 0}

@app.get("/api/trades/equity-curve")
async def equity_curve():
    return {"points": []}

@app.get("/api/model/metrics")
async def model_metrics():
    return {"featureImportance": [], "trainAuc": 0, "testAuc": 0, "sampleCount": 0, "updatedAt": None}

@app.get("/api/model/training-history")
async def training_history():
    return {"runs": []}

@app.get("/api/model/regime-distribution")
async def regime_distribution():
    return {"distribution": []}
