"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { TrendingUp, Radio } from "lucide-react";

interface PriceChartProps {
  data: number[];
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    timeZone: "Asia/Jakarta",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PriceChart({ data }: PriceChartProps) {
  const validData = useMemo(
    () => data.filter((price) => Number.isFinite(price) && price > 0),
    [data]
  );

  const chartData = useMemo(() => {
    if (validData.length === 0) return [];
    const now = Date.now();
    const totalMs = 2 * 60 * 60 * 1000;
    const step = validData.length > 1 ? totalMs / (validData.length - 1) : 0;

    return validData.map((price, i) => {
      const ts = new Date(now - totalMs + i * step);
      return { time: formatTime(ts), timestamp: ts.getTime(), price };
    });
  }, [validData]);

  const tickIndices = useMemo(() => {
    if (chartData.length <= 6) return chartData.map((d) => d.timestamp);
    const step = Math.max(1, Math.floor(chartData.length / 5));
    const ticks: number[] = [];
    for (let i = 0; i < chartData.length; i += step) ticks.push(chartData[i].timestamp);
    if (ticks[ticks.length - 1] !== chartData[chartData.length - 1].timestamp) {
      ticks.push(chartData[chartData.length - 1].timestamp);
    }
    return ticks;
  }, [chartData]);

  return (
    <Card className="glass flex h-full min-h-[280px] min-w-0 flex-col overflow-hidden accent-top-blue">
      <CardHeader className="shrink-0">
        <CardTitle className="flex items-center gap-1.5 text-sm font-medium uppercase tracking-wider text-apple-blue">
          <TrendingUp className="h-4 w-4 shrink-0" />
          Price Chart (2H)
          {validData.length > 0 && (
            <span className="ml-auto text-base font-number font-bold text-apple-blue">
              ${validData[validData.length - 1].toFixed(2)}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 min-w-0 flex-1 overflow-hidden pb-2">
        <div className="h-full min-h-[210px] w-full min-w-0">
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.16)" />
                <XAxis
                  dataKey="timestamp"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  ticks={tickIndices}
                  tickFormatter={(ts: number) => formatTime(new Date(ts))}
                  tick={{ fontSize: 11, fill: "#86868b", fontFamily: "var(--font-mono)" }}
                  axisLine={{ stroke: "rgba(128,128,128,0.2)" }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 11, fill: "#86868b", fontFamily: "var(--font-mono)" }}
                  axisLine={false}
                  tickLine={false}
                  width={58}
                  tickFormatter={(v: number) => v.toFixed(2)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(24, 24, 27, 0.96)",
                    border: "1px solid rgba(128, 128, 128, 0.25)",
                    borderRadius: "12px",
                    fontSize: "13px",
                    fontFamily: "var(--font-mono)",
                    color: "#f4f4f5",
                    padding: "8px 10px",
                  }}
                  labelFormatter={(ts: number) => formatTime(new Date(ts))}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
                  cursor={{ stroke: "#007AFF", strokeDasharray: "3 3" }}
                />
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#007AFF" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#007AFF" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="price" stroke="#007AFF" strokeWidth={2} fill="url(#priceGradient)" dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full min-h-[210px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-black/10 px-5 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
                <Radio className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Market data unavailable</p>
                <p className="mx-auto max-w-xs text-xs leading-5 text-muted-foreground">
                  The dashboard API is responding, but no verified XAUUSD price history has been received yet.
                </p>
              </div>
              <span className="rounded-full border border-border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Waiting for data feed
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
