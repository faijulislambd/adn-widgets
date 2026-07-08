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
    // Force a live scrape on app load rather than trusting whatever's
    // cached — the background GitHub Actions cron can lag by hours, so the
    // first visitor of a stretch is what actually guarantees fresh data.
    dispatch(fetchDailyReport(true));

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
