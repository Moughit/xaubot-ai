import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type TwelveDataValue = {
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
};

type TwelveDataResponse = {
  meta?: { symbol?: string; interval?: string };
  values?: TwelveDataValue[];
  status?: string;
  code?: number;
  message?: string;
};

const noStore = { "Cache-Control": "no-store, max-age=0" };

export async function GET() {
  const now = new Date().toISOString();
  const apiKey = process.env.TWELVEDATA_API_KEY;

  const base = {
    timestamp: now,
    connected: false,
    dataSource: "Twelve Data",
    symbol: "XAU/USD",
    interval: "1min",
    price: 0,
    priceSource: "unavailable",
    quoteRetrievedAt: null as string | null,
    spread: 0,
    priceChange: 0,
    priceHistory: [] as number[],
    priceTimestamps: [] as string[],
    balance: 0,
    equity: 0,
    profit: 0,
    equityHistory: [] as number[],
    balanceHistory: [] as number[],
    session: "Unavailable",
    isGoldenTime: false,
    canTrade: false,
    dailyLoss: 0,
    dailyProfit: 0,
    consecutiveLosses: 0,
    riskPercent: 0,
    smc: { signal: "", confidence: 0, reason: "Educational market-data display only. No trading signals or execution." },
    ml: { signal: "", confidence: 0, buyProb: 0, sellProb: 0 },
    regime: { name: "Unavailable", volatility: 0, confidence: 0 },
    positions: [],
    logs: [] as { time: string; level: "info" | "warn" | "error"; message: string }[],
    entryFilters: [],
    riskMode: { mode: "unavailable", reason: "No account connection", recommendedLot: 0, maxAllowedLot: 0, totalLoss: 0, maxTotalLoss: 0, remainingDailyRisk: 0 },
    cooldown: { active: false, secondsRemaining: 0, totalSeconds: 0 },
    timeFilter: { wibHour: 0, isBlocked: false, blockedHours: [] as number[] },
    sessionMultiplier: 0,
    positionDetails: [],
    autoTrainer: { lastRetrain: null, currentAuc: null, minAucThreshold: 0, hoursSinceRetrain: 0, nextRetrainHour: 0, modelsFitted: false },
    performance: { loopCount: 0, avgExecutionMs: 0, uptimeHours: 0, totalSessionTrades: 0, totalSessionProfit: 0 },
    marketClose: { hoursToDailyClose: 0, hoursToWeekendClose: 0, nearWeekend: false, marketOpen: false },
    h1BiasDetails: { bias: "UNAVAILABLE", ema20: 0, price: 0 },
  };

  if (!apiKey) {
    return NextResponse.json(
      { ...base, logs: [{ time: now, level: "warn", message: "Twelve Data API key is not configured. Add TWELVEDATA_API_KEY in Vercel Environment Variables." }] },
      { headers: noStore }
    );
  }

  try {
    const url = new URL("https://api.twelvedata.com/time_series");
    url.searchParams.set("symbol", "XAU/USD");
    url.searchParams.set("interval", "1min");
    url.searchParams.set("outputsize", "120");
    url.searchParams.set("timezone", "UTC");

    const response = await fetch(url.toString(), {
      headers: { Authorization: `apikey ${apiKey}`, Accept: "application/json" },
      next: { revalidate: 30 },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`Twelve Data returned HTTP ${response.status}`);
    }

    const result = (await response.json()) as TwelveDataResponse;
    if (result.status === "error" || !Array.isArray(result.values)) {
      throw new Error(result.message || "XAU/USD price history is unavailable for this API key or plan.");
    }

    const candles = result.values
      .map((candle) => ({
        time: candle.datetime,
        timestamp: new Date(candle.datetime.replace(" ", "T") + "Z").toISOString(),
        close: Number(candle.close),
      }))
      .filter((candle) => Number.isFinite(candle.close) && candle.close > 0)
      .reverse();

    if (candles.length === 0) {
      throw new Error("The provider returned no valid XAU/USD candles.");
    }


    // /price returns the provider's latest available quote. The one-minute
    // candle close remains the historical series value and may be older.
    let latestQuote: number | null = null;
    let quoteRetrievedAt: string | null = null;
    try {
      const quoteUrl = new URL("https://api.twelvedata.com/price");
      quoteUrl.searchParams.set("symbol", "XAU/USD");
      const quoteResponse = await fetch(quoteUrl.toString(), {
        headers: { Authorization: `apikey ${apiKey}`, Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });
      if (quoteResponse.ok) {
        const quote = await quoteResponse.json() as { price?: string; status?: string; message?: string };
        const parsedQuote = Number(quote.price);
        if (quote.status !== "error" && Number.isFinite(parsedQuote) && parsedQuote > 0) {
          latestQuote = parsedQuote;
          quoteRetrievedAt = new Date().toISOString();
        }
      }
    } catch {
      // Keep the verified last candle close as an explicitly labelled fallback.
    }

    const prices = candles.map((candle) => candle.close);
    const candleClose = prices[prices.length - 1];
    const latest = latestQuote ?? candleClose;
    const previous = prices.length > 1 ? prices[prices.length - 2] : latest;
    const change = latest - (prices[0] ?? latest);

    return NextResponse.json(
      {
        ...base,
        connected: true,
        timestamp: now,
        price: latest,
        priceSource: latestQuote !== null ? "Twelve Data latest-price endpoint" : "Last one-minute candle close (fallback)",
        quoteRetrievedAt,
        priceChange: change,
        priceHistory: prices,
        priceTimestamps: candles.map((candle) => candle.timestamp),
        logs: [{
          time: now,
          level: "info",
          message: `Twelve Data feed connected. ${candles.length} XAU/USD one-minute candles loaded; latest provider candle: ${candles[candles.length - 1].time} UTC. Account data and trading functions remain disabled.`,
        }],
        marketData: {
          provider: "Twelve Data",
          symbol: result.meta?.symbol || "XAU/USD",
          interval: result.meta?.interval || "1min",
          latestCandleTime: candles[candles.length - 1].time,
          previousClose: previous,
          candleCount: candles.length,
          latestQuoteRetrievedAt: quoteRetrievedAt,
        },
      },
      { headers: noStore }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to retrieve market data.";
    return NextResponse.json(
      {
        ...base,
        logs: [{ time: now, level: "error", message: `Market-data feed unavailable: ${message}` }],
        marketDataError: message,
      },
      { headers: noStore }
    );
  }
}
