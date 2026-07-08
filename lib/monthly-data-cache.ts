import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import type { MonthlyCacheEntry, MonthlySmsData } from "@/types";

const CACHE_FILE = join(tmpdir(), "adn-monthly-sms-cache.json");
const FRESH_TTL_MS = 30 * 60 * 1000; // 30 minutes

export function readMonthlyCache(): MonthlyCacheEntry | null {
  if (!existsSync(CACHE_FILE)) return null;
  try {
    return JSON.parse(readFileSync(CACHE_FILE, "utf-8")) as MonthlyCacheEntry;
  } catch {
    return null;
  }
}

export function writeMonthlyCache(data: MonthlySmsData): void {
  const entry: MonthlyCacheEntry = { data, cachedAt: Date.now() };
  writeFileSync(CACHE_FILE, JSON.stringify(entry), "utf-8");
}

export function isCacheFresh(entry: MonthlyCacheEntry): boolean {
  return Date.now() - entry.cachedAt < FRESH_TTL_MS;
}
