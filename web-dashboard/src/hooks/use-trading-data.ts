"use client";

import { useState, useEffect, useCallback } from "react";
import type { TradingStatus } from "@/types/trading";

const POLL_INTERVAL_MS = 10000;

export function useTradingData() {
  const [data, setData] = useState<TradingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch("/api/status", {
        cache: "no-store",
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`Dashboard API returned HTTP ${res.status}`);
      const json = (await res.json()) as TradingStatus;
      setData(json);
      setError(null);
      setLastFetch(new Date());
    } catch (err) {
      setError(
        err instanceof DOMException && err.name === "AbortError"
          ? "The dashboard status service timed out."
          : err instanceof Error
            ? err.message
            : "Unable to load dashboard status."
      );
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
    const interval = window.setInterval(() => void fetchData(), POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [fetchData]);

  const dataAge = lastFetch ? (Date.now() - lastFetch.getTime()) / 1000 : 999;
  return { data, loading, error, dataAge, refetch: fetchData, apiConfigured: true };
}
