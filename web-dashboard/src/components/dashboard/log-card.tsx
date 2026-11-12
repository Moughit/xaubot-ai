"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, Activity } from "lucide-react";
import type { LogEntry } from "@/types/trading";

interface LogCardProps {
  logs: LogEntry[];
}

export function LogCard({ logs }: LogCardProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case "error": return "text-apple-red";
      case "warn": return "text-apple-orange";
      case "trade": return "text-apple-blue";
      default: return "text-apple-green";
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "error": return "ERR";
      case "warn": return "WRN";
      case "trade": return "TRD";
      default: return "INF";
    }
  };

  return (
    <Card className="glass flex h-full min-h-0 min-w-0 flex-col overflow-hidden accent-top-purple">
      <CardHeader className="shrink-0">
        <CardTitle className="flex items-center gap-1.5 text-sm font-medium uppercase tracking-wider text-apple-purple">
          <Terminal className="h-4 w-4 shrink-0" />
          Activity
          <span className="ml-auto text-[10px] font-normal normal-case tracking-normal text-muted-foreground">
            {logs.length} {logs.length === 1 ? "event" : "events"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <div
          className="h-full min-h-[150px] min-w-0 overflow-x-hidden overflow-y-auto rounded-xl border border-border/70 bg-black/20 p-3 font-mono text-xs leading-5 sm:text-sm"
          role="log"
          aria-live="polite"
          aria-label="System activity log"
        >
          {logs.length === 0 ? (
            <div className="flex h-full min-h-[120px] flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <Activity className="h-5 w-5 opacity-50" />
              <p className="font-medium">No activity yet</p>
              <p className="max-w-[24rem] text-[11px] leading-4 opacity-70">
                System events will appear here when a connected data service reports them.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log, i) => (
                <div key={`${log.time}-${i}`} className="flex min-w-0 flex-col gap-1 rounded-lg border-b border-border/40 pb-2 last:border-0 sm:grid sm:grid-cols-[minmax(0,8rem)_auto_minmax(0,1fr)] sm:items-start sm:gap-x-2">
                  <time className="max-w-full truncate text-[10px] leading-4 text-muted-foreground sm:max-w-[8rem] sm:text-xs">
                    {log.time || "—"}
                  </time>
                  <span className={`text-[10px] font-bold tracking-wide ${getLevelColor(log.level)}`}>
                    {getLevelBadge(log.level)}
                  </span>
                  <span className="min-w-0 whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-foreground/80">
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
