import { readReportCache, REDIS_KEYS } from "@/lib/redis";
import type { TelcoSmsDataEntry } from "@/types";

// Returns the full scraped dataset once — searching/filtering happens
// entirely client-side against this, no per-keystroke server round trip.
export async function GET() {
  const cache = await readReportCache<TelcoSmsDataEntry>(
    REDIS_KEYS.telcoSmsData,
  );

  if (!cache) {
    return Response.json({
      success: true,
      rows: [],
      startDate: null,
      endDate: null,
      scrapedAt: null,
    });
  }

  const { rows, startDate, endDate } = cache.data;

  return Response.json({
    success: true,
    rows,
    startDate,
    endDate,
    scrapedAt: cache.scrapedAt,
  });
}
