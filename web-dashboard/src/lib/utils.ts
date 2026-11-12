
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatGoldPrice(value: number): string {
  return value.toFixed(2);
}

export function getValueColor(value: number): string {
  if (value > 0) return "text-success";
  if (value < 0) return "text-danger";
  return "text-muted-foreground";
}

export function getConfidenceColor(value: number): string {
  if (value >= 70) return "text-apple-green";
  if (value >= 40) return "text-yellow-500";
  return "text-apple-red";
}

export function getSignalColor(signal: string): string {
  const normalized = signal.toUpperCase();

  if (normalized.includes("BUY")) return "text-apple-green";
  if (normalized.includes("SELL")) return "text-apple-red";

  return "text-muted-foreground";
}
