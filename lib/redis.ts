import { Redis } from "@upstash/redis";
import type { CachedReport, CacheSource } from "@/types";

let client: Redis | null = null;
let warnedMissingConfig = false;

function getClient(): Redis | null {
  if (client) return client;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    if (!warnedMissingConfig) {
      console.warn(
        "UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN not set — falling back to always-live scraping, no caching.",
      );
      warnedMissingConfig = true;
    }
    return null;
  }

  client = new Redis({ url, token });
  return client;
}

export async function readReportCache<T>(
  key: string,
): Promise<CachedReport<T> | null> {
  const redis = getClient();
  if (!redis) return null;

  try {
    const value = await redis.get<CachedReport<T>>(key);
    return value ?? null;
  } catch (error) {
    console.error(`Redis read failed for "${key}":`, error);
    return null;
  }
}

export async function writeReportCache<T>(
  key: string,
  data: T,
  source: CacheSource,
): Promise<void> {
  const redis = getClient();
  if (!redis) return;

  const entry: CachedReport<T> = { data, scrapedAt: Date.now(), source };
  try {
    await redis.set(key, entry);
  } catch (error) {
    console.error(`Redis write failed for "${key}":`, error);
  }
}

export const REDIS_KEYS = {
  adnsmsDaily: "adnsms:daily:latest",
  metlife: "metlife:latest",
} as const;
