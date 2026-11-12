"use client";

import { useTradingData } from "@/hooks/use-trading-data";
import { useStaggerEntry } from "@/hooks/use-stagger-entry";
import {
  Header,
  PriceCard,
  AccountCard,
  SessionCard,
  RiskCard,
  SignalCard,
  RegimeCard,
  PositionsCard,
  LogCard,
  PriceChart,
  BotStatusCard,
  EntryFilterCard,
  PerformanceCard,
  ModelCard,
  AssistantCard,
} from "@/components/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function LoadingSkeleton() {
  return (
    <div className="flex-1 min-h-0 flex flex-col gap-1.5 p-1.5 overflow-y-auto md:overflow-hidden">
      <div className="grid grid-cols-2 gap-2 md:flex-[1] md:min-h-0 md:grid-cols-4 md:gap-1.5">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 md:flex-[1] md:min-h-0 md:grid-cols-4 md:gap-1.5">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-2 md:flex-[1.6] md:min-h-0 md:grid md:grid-cols-5 md:gap-1.5">
        <Skeleton className="col-span-3 rounded-lg" />
        <Skeleton className="col-span-2 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 gap-2 md:flex-[1.2] md:min-h-0 md:grid-cols-4 md:gap-1.5">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function ErrorDisplay({ message, apiConfigured, onRetry }: { message: string; apiConfigured: boolean; onRetry: () => void }) {
  return (
    <main className="flex-1 min-h-0 overflow-y-auto px-4 py-8 sm:px-6">
      <section className="mx-auto flex min-h-full w-full max-w-2xl items-center justify-center">
        <div className="glass w-full rounded-3xl p-6 text-center shadow-2xl sm:p-9">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-danger/20 bg-danger-bg">
            <span className="text-3xl font-bold text-danger">!</span>
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">System connection</p>
          <h2 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl">Dashboard is offline</h2>
          <p className="mx-auto max-w-lg break-words text-sm leading-6 text-muted-foreground">{message}</p>
          <div className="my-6 rounded-2xl border border-border bg-surface-light p-4 text-left">
            <p className="mb-2 text-sm font-semibold">{apiConfigured ? "Backend check" : "Setup required"}</p>
            <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
              <li>Deploy the Python API as a separate web service.</li>
              <li>Copy its public HTTPS service URL.</li>
              <li>In Vercel, open Project Settings → Environment Variables.</li>
              <li>Add <code className="rounded bg-surface px-1.5 py-0.5 text-foreground">NEXT_PUBLIC_API_URL</code> with that URL, then redeploy.</li>
            </ol>
          </div>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button onClick={onRetry} className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90">Retry connection</button>
            <a href="/books" className="rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-surface-light">Open system documentation</a>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">No live data is being displayed. Historical backtest results are not current market information.</p>
        </div>
      </section>
    </main>
  );
}

export default function Dashboard() {
  const { data, loading, error, dataAge, refetch, apiConfigured } = useTradingData();
  const visible = useStaggerEntry(15, 40);

  const now = new Date();
  const wibTime = now.toLocaleTimeString("en-US", {
    timeZone: "Asia/Jakarta",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  if (loading && !data) {
    return (
      <div className="h-dvh flex flex-col overflow-hidden bg-background">
        <Header connected={false} lastUpdate={wibTime} dataAge={999} />
        <LoadingSkeleton />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="h-dvh flex flex-col overflow-hidden bg-background">
        <Header connected={false} lastUpdate={wibTime} dataAge={999} />
        <ErrorDisplay message={error} apiConfigured={apiConfigured} onRetry={() => void refetch()} />
      </div>
    );
  }

  if (!data) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="h-dvh flex flex-col overflow-hidden bg-background">
        <Header
          connected={data.connected}
          lastUpdate={wibTime}
          dataAge={dataAge}
        />

        {/* Main grid — fills remaining height, NO scroll */}
        <main className="flex-1 min-h-0 flex flex-col gap-2 p-2 overflow-y-auto md:overflow-hidden md:gap-1.5 md:p-1.5">

          {/* Row 1: Market Overview */}
          <div className="grid grid-cols-2 gap-2 md:flex-[1] md:min-h-0 md:grid-cols-4 md:gap-1.5">
            <div className={cn("stagger-enter min-h-[150px] md:min-h-0 h-full", visible[0] && "visible")}>
              <PriceCard
                price={data.price}
                spread={data.spread}
                priceChange={data.priceChange}
                priceHistory={data.priceHistory}
              />
            </div>
            <div className={cn("stagger-enter min-h-[150px] md:min-h-0 h-full", visible[1] && "visible")}>
              <AccountCard
                balance={data.balance}
                equity={data.equity}
                profit={data.profit}
                equityHistory={data.equityHistory}
              />
            </div>
            <div className={cn("stagger-enter min-h-[150px] md:min-h-0 h-full", visible[2] && "visible")}>
              <SessionCard
                session={data.session}
                isGoldenTime={data.isGoldenTime}
                canTrade={data.canTrade}
                sessionMultiplier={data.sessionMultiplier}
                timeFilter={data.timeFilter}
              />
            </div>
            <div className={cn("stagger-enter min-h-[150px] md:min-h-0 h-full", visible[3] && "visible")}>
              <RiskCard
                dailyLoss={data.dailyLoss}
                dailyProfit={data.dailyProfit}
                consecutiveLosses={data.consecutiveLosses}
                riskPercent={data.riskPercent}
                riskMode={data.riskMode}
              />
            </div>
          </div>

          {/* Row 2: AI Signals */}
          <div className="grid grid-cols-2 gap-2 md:flex-[1] md:min-h-0 md:grid-cols-5 md:gap-1.5">
            <div className={cn("stagger-enter min-h-[170px] md:min-h-0 h-full", visible[4] && "visible")}>
              <SignalCard
                title="SMC Signal"
                icon="smc"
                signal={data.smc.signal}
                confidence={data.smc.confidence}
                detail={`${data.smc.reason || ""}${data.h1Bias ? ` | H1: ${data.h1Bias}` : ""}`}
                updatedAt={data.smc.updatedAt}
              />
            </div>
            <div className={cn("stagger-enter min-h-[170px] md:min-h-0 h-full", visible[5] && "visible")}>
              <SignalCard
                title="ML Prediction"
                icon="ml"
                signal={data.ml.signal}
                confidence={data.ml.confidence}
                buyProb={data.ml.buyProb}
                sellProb={data.ml.sellProb}
                updatedAt={data.ml.updatedAt}
                threshold={data.dynamicThreshold}
                marketQuality={data.marketQuality}
              />
            </div>
            <div className={cn("stagger-enter min-h-[170px] md:min-h-0 h-full", visible[6] && "visible")}>
              <RegimeCard
                name={data.regime.name}
                volatility={data.regime.volatility}
                confidence={data.regime.confidence}
                updatedAt={data.regime.updatedAt}
                h1Bias={data.h1Bias}
              />
            </div>
            <div className={cn("stagger-enter min-h-[170px] md:min-h-0 h-full", visible[7] && "visible")}>
              <PerformanceCard
                marketScore={data.marketScore}
                marketQuality={data.marketQuality}
                dynamicThreshold={data.dynamicThreshold}
                performance={data.performance}
                riskMode={data.riskMode}
              />
            </div>
            <div className={cn("stagger-enter min-h-[170px] md:min-h-0 h-full", visible[8] && "visible")}>
              <ModelCard />
            </div>
          </div>

          {/* Row 3: Charts */}
          <div className="grid grid-cols-1 gap-2 md:flex-[1.6] md:min-h-0 md:grid md:grid-cols-5 md:gap-1.5">
            <div className={cn("stagger-enter min-h-[300px] md:col-span-3 md:min-h-0", visible[9] && "visible")}>
              <PriceChart data={data.priceHistory} />
            </div>
            <div className={cn("stagger-enter min-h-[240px] md:col-span-2 md:min-h-0", visible[10] && "visible")}>
              <AssistantCard data={data} />
            </div>
          </div>

          {/* Row 4: Trading + Log */}
          <div className="grid grid-cols-2 gap-2 md:flex-[1.2] md:min-h-0 md:grid-cols-4 md:gap-1.5">
            <div className={cn("stagger-enter min-h-[170px] md:min-h-0 h-full", visible[11] && "visible")}>
              <EntryFilterCard filters={data.entryFilters || []} />
            </div>
            <div className={cn("stagger-enter min-h-[170px] md:min-h-0 h-full", visible[12] && "visible")}>
              <PositionsCard
                positions={data.positions}
                positionDetails={data.positionDetails}
              />
            </div>
            <div className={cn("stagger-enter min-h-[170px] md:min-h-0 h-full", visible[13] && "visible")}>
              <BotStatusCard
                riskMode={data.riskMode}
                cooldown={data.cooldown}
                autoTrainer={data.autoTrainer}
                performance={data.performance}
                marketClose={data.marketClose}
                settings={data.settings}
              />
            </div>
            <div className={cn("stagger-enter col-span-2 h-[260px] min-h-0 md:col-span-1 md:h-full", visible[14] && "visible")}>
              <LogCard logs={data.logs} />
            </div>
          </div>

        </main>
      </div>
    </TooltipProvider>
  );
}
