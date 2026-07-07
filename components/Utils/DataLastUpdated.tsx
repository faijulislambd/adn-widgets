"use client";

import { useCallback, useEffect, useState } from "react";
import moment from "moment";
import { Badge } from "../ui/badge";

const POLL_INTERVAL_MS = 30 * 1000;

// Any component that triggers a force-refresh should dispatch this event on
// `window` once it completes, so this badge updates immediately instead of
// waiting for its own poll interval.
export const REPORT_REFRESHED_EVENT = "report-data-refreshed";

const DataLastUpdated = ({ className }: { className?: string }) => {
  const [scrapedAt, setScrapedAt] = useState<number | null>(null);

  const fetchLastUpdated = useCallback(async () => {
    try {
      const res = await fetch("/api/daily-report-data");
      const json = await res.json();
      if (json.success) setScrapedAt(json.cachedAt);
    } catch {
      // Transient failure — keep showing the last known value.
    }
  }, []);

  useEffect(() => {
    fetchLastUpdated();

    const interval = setInterval(fetchLastUpdated, POLL_INTERVAL_MS);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchLastUpdated();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", fetchLastUpdated);
    window.addEventListener(REPORT_REFRESHED_EVENT, fetchLastUpdated);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", fetchLastUpdated);
      window.removeEventListener(REPORT_REFRESHED_EVENT, fetchLastUpdated);
    };
  }, [fetchLastUpdated]);

  if (scrapedAt === null) return null;
  return (
    <Badge
      className={`${className} bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400`}
    >
      Last updated {moment(scrapedAt).format("h:mm A")}
    </Badge>
  );
};

export default DataLastUpdated;
