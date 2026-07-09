"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/store/hooks";
import { fetchDailyReport } from "@/store/daily-report-slice";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

// Mounted exactly once, in Providers, so the app has exactly one place that
// fetches/polls the SMS dashboard data — every chart, table, and "last
// updated" badge just reads the shared store instead of fetching on its own.
const DailyReportSync = () => {
  const dispatch = useAppDispatch();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Preload whatever's already cached first, so the UI has real data to
    // paint immediately instead of showing nothing while it waits. Then
    // quietly force a live scrape in the background — GitHub's cron can lag
    // by hours, so this still guarantees freshness, it just doesn't block
    // first paint on it.
    dispatch(fetchDailyReport(false)).then(() => {
      dispatch(fetchDailyReport(true));
    });

    intervalRef.current = setInterval(() => {
      dispatch(fetchDailyReport(false));
    }, REFRESH_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [dispatch]);

  return null;
};

export default DailyReportSync;
