import { readReportCache, REDIS_KEYS } from "@/lib/redis";
import type { TelcoSmsDataEntry } from "@/types";

const MAX_RESULTS = 200;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim().toLowerCase();

  const cache = await readReportCache<TelcoSmsDataEntry>(
    REDIS_KEYS.telcoSmsData,
  );

  if (!cache) {
    return Response.json({
      success: true,
      rows: [],
      totalRows: 0,
      truncated: false,
      startDate: null,
      endDate: null,
      scrapedAt: null,
    });
  }

  const { rows, startDate, endDate, scrapedAt } = cache.data;

  const matches = query
    ? rows.filter((row) =>
        Object.values(row).some((value) =>
          value.toLowerCase().includes(query),
        ),
      )
    : rows;

  return Response.json({
    success: true,
    rows: matches.slice(0, MAX_RESULTS),
    totalRows: matches.length,
    truncated: matches.length > MAX_RESULTS,
    startDate,
    endDate,
    scrapedAt,
  });
}
