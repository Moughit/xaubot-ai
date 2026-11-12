"use client";

import { useState, useEffect, useCallback } from "react";
import type { TradingStatus } from "@/types/trading";

// Set NEXT_PUBLIC_API_URL in Vercel after deploying the API separately.
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").trim().replace(/\/$/, "");
const POLL_INTERVAL_MS = 5000;

export function useTradingData() {
  const [data, setData] = useState<TradingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    if (!API_URL) {
      setError("API address is not configured. Deploy the backend, then add NEXT_PUBLIC_API_URL in Vercel.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(`${API_URL}/api/status`, {
        cache: "no-store",
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`API returned HTTP ${res.status}`);

      const json = (await res.json()) as TradingStatus;
      setData(json);
      setError(null);
      setLastFetch(new Date());
    } catch (err) {
      setError(
        err instanceof DOMException && err.name === "AbortError"
          ? "The API did not respond within 10 seconds."
          : err instanceof Error
            ? err.message
            : "Unable to reach the API server."
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
  return { data, loading, error, dataAge, refetch: fetchData, apiConfigured: Boolean(API_URL) };
}
