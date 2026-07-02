"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AllMaskChart from "./AllMaskChart";
import SFPChart from "./SFPChart";
import UpdateHeader from "../daily-update/UpdateHeader";
import { Lock, RefreshCw, Unlock } from "lucide-react";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

type DailyReportData = {
  success: number;
  failed: number;
  pending: number;
  topClients: { clientName: string; totalSMS: number }[];
  maskSuccess: number;
  maskFailed: number;
  maskPending: number;
  nonmaskSuccess: number;
  nonmaskFailed: number;
  nonmaskPending: number;
};

const ChartCardSkeleton = () => (
  <div className="border rounded-lg shadow-lg p-4 animate-pulse">
    <div className="h-4 w-36 bg-gray-200 rounded mb-4" />
    <div className="w-full aspect-square bg-gray-200 rounded-full" />
  </div>
);

const Charts = () => {
  const [dailyReportData, setDailyReportData] =
    useState<DailyReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch("/api/daily-report-data");
      const json = await res.json();
      if (json.success) setDailyReportData(json.smsData);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(() => fetchData(), REFRESH_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData]);

  const handleManualRefresh = () => fetchData(true);

  const RefreshBtn = () => (
    <button
      onClick={handleManualRefresh}
      disabled={refreshing}
      className="absolute top-3 right-3 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
      title="Refresh"
    >
      <RefreshCw
        size={14}
        className={refreshing ? "animate-spin" : ""}
      />
    </button>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ChartCardSkeleton />
        <ChartCardSkeleton />
        <ChartCardSkeleton />
      </div>
    );
  }

  if (!dailyReportData) return <div>Failed to load data.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="relative border rounded-lg shadow-lg p-4">
        <RefreshBtn />
        <UpdateHeader title="SMS Status" icon={<Lock size={16} />} />
        <AllMaskChart
          label=""
          chartData={{
            mask_success: dailyReportData.maskSuccess,
            mask_failed: dailyReportData.maskFailed,
            mask_pending: dailyReportData.maskPending,
            nonmask_success: dailyReportData.nonmaskSuccess,
            nonmask_failed: dailyReportData.nonmaskFailed,
            nonmask_pending: dailyReportData.nonmaskPending,
          }}
        />
      </div>
      <div className="relative border rounded-lg shadow-lg p-4">
        <RefreshBtn />
        <UpdateHeader title="Masked SMS Status" icon={<Lock size={16} />} />
        <SFPChart
          label=""
          chartData={{
            success: dailyReportData.maskSuccess,
            failed: dailyReportData.maskFailed,
            pending: dailyReportData.maskPending,
          }}
        />
      </div>
      <div className="relative border rounded-lg shadow-lg p-4">
        <RefreshBtn />
        <UpdateHeader
          title="Non-Masked SMS Status"
          icon={<Unlock size={16} />}
        />
        <SFPChart
          label=""
          chartData={{
            success: dailyReportData.nonmaskSuccess,
            failed: dailyReportData.nonmaskFailed,
            pending: dailyReportData.nonmaskPending,
          }}
        />
      </div>
    </div>
  );
};

export default Charts;
