import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Safe read-only placeholder. No account credentials, private positions,
// trade execution, or actionable trade instructions are exposed.
export async function GET() {
  const now = new Date().toISOString();

  return NextResponse.json(
    {
      timestamp: now,
      connected: false,
      price: 0,
      spread: 0,
      priceChange: 0,
      priceHistory: [],
      balance: 0,
      equity: 0,
      profit: 0,
      equityHistory: [],
      balanceHistory: [],
      session: "Unavailable",
      isGoldenTime: false,
      canTrade: false,
      dailyLoss: 0,
      dailyProfit: 0,
      consecutiveLosses: 0,
      riskPercent: 0,
      smc: { signal: "", confidence: 0, reason: "Read-only status service. Live data is not connected." },
      ml: { signal: "", confidence: 0, buyProb: 0, sellProb: 0 },
      regime: { name: "Unavailable", volatility: 0, confidence: 0 },
      positions: [],
      logs: [{ time: now, level: "info", message: "Vercel status API is online. No private account data is connected." }],
      entryFilters: [],
      riskMode: { mode: "unavailable", reason: "Private account data is not exposed", recommendedLot: 0, maxAllowedLot: 0, totalLoss: 0, maxTotalLoss: 0, remainingDailyRisk: 0 },
      cooldown: { active: false, secondsRemaining: 0, totalSeconds: 0 },
      timeFilter: { wibHour: 0, isBlocked: false, blockedHours: [] },
      sessionMultiplier: 0,
      positionDetails: [],
      autoTrainer: { lastRetrain: null, currentAuc: null, minAucThreshold: 0, hoursSinceRetrain: 0, nextRetrainHour: 0, modelsFitted: false },
      performance: { loopCount: 0, avgExecutionMs: 0, uptimeHours: 0, totalSessionTrades: 0, totalSessionProfit: 0 },
      marketClose: { hoursToDailyClose: 0, hoursToWeekendClose: 0, nearWeekend: false, marketOpen: false },
      h1BiasDetails: { bias: "UNAVAILABLE", ema20: 0, price: 0 },
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
