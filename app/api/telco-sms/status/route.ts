import { readReportCache, REDIS_KEYS } from "@/lib/redis";
import type { TelcoSmsStatusEntry } from "@/types";

export async function GET() {
  const cache = await readReportCache<TelcoSmsStatusEntry>(
    REDIS_KEYS.telcoSmsStatus,
  );

  const status: TelcoSmsStatusEntry = cache?.data ?? {
    status: "idle",
    startDate: "",
    endDate: "",
  };

  return Response.json({ success: true, status });
}
