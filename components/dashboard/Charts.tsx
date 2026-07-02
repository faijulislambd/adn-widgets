"use client";

import { useEffect, useState } from "react";
import SFPChart from "./SFPChart";
import UpdateHeader from "../daily-update/UpdateHeader";
import { Lock } from "lucide-react";

const Charts = () => {
  const [dailyReportData, setDailyReportData] = useState<{
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
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/daily-report-data")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setDailyReportData(json.smsData);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="h-40 w-40 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-3 w-20 rounded bg-gray-200 animate-pulse" />
          </div>
        ))}
      </div>
    );
  if (!dailyReportData) return <div>Failed to load data.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="border rounded-lg shadow-lg p-4">
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
      <SFPChart
        label="non-mask"
        chartData={{
          success: dailyReportData.nonmaskSuccess,
          failed: dailyReportData.nonmaskFailed,
          pending: dailyReportData.nonmaskPending,
        }}
      />
    </div>
  );
};

export default Charts;
