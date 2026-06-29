import { writeFileSync, readFileSync, existsSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"

const CACHE_FILE = join(tmpdir(), "adn-monthly-sms-cache.json")
const FRESH_TTL_MS = 30 * 60 * 1000 // 30 minutes

export interface MonthlySmsData {
  success: string
  failed: string
  pending: string
  topThreeClients: { clientName: string; totalSMS: string }[]
}

interface CacheEntry {
  data: MonthlySmsData
  cachedAt: number
}

export function readMonthlyCache(): CacheEntry | null {
  if (!existsSync(CACHE_FILE)) return null
  try {
    return JSON.parse(readFileSync(CACHE_FILE, "utf-8")) as CacheEntry
  } catch {
    return null
  }
}

export function writeMonthlyCache(data: MonthlySmsData): void {
  const entry: CacheEntry = { data, cachedAt: Date.now() }
  writeFileSync(CACHE_FILE, JSON.stringify(entry), "utf-8")
}

export function isCacheFresh(entry: CacheEntry): boolean {
  return Date.now() - entry.cachedAt < FRESH_TTL_MS
}
