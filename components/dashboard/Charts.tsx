"use client";

import AllMaskChart from "./AllMaskChart";
import SFPChart from "./SFPChart";
import UpdateHeader from "../daily-update/UpdateHeader";
import { Lock, MessageSquareIcon, RefreshCw, Unlock } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchDailyReport,
  selectDailyReport,
  selectIsDailyReportLoading,
  selectIsDailyReportRefreshing,
} from "@/store/daily-report-slice";

const Charts = () => {
  const dispatch = useAppDispatch();
  const { smsData } = useAppSelector(selectDailyReport);
  const loading = useAppSelector(selectIsDailyReportLoading);
  const refreshing = useAppSelector(selectIsDailyReportRefreshing);

  const RefreshBtn = () => (
    <button
      onClick={() => dispatch(fetchDailyReport(true))}
      disabled={refreshing}
      className="absolute top-3 right-3 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
      title="Refresh"
    >
      <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
    </button>
  );

  if (!smsData) {
    return (
      <p className="text-sm text-muted-foreground">
        {loading ? "Loading…" : "Failed to load data."}
      </p>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="relative border rounded-lg shadow-lg p-4">
        <RefreshBtn />
        <UpdateHeader
          title="SMS Status"
          icon={<MessageSquareIcon size={16} />}
        />
        <AllMaskChart
          label=""
          chartData={{
            mask_success: smsData.maskSuccess,
            mask_failed: smsData.maskFailed,
            mask_pending: smsData.maskPending,
            nonmask_success: smsData.nonmaskSuccess,
            nonmask_failed: smsData.nonmaskFailed,
            nonmask_pending: smsData.nonmaskPending,
          }}
        />
      </div>
      <div className="relative border rounded-lg shadow-lg p-4">
        <RefreshBtn />
        <UpdateHeader title="Masked SMS Status" icon={<Lock size={16} />} />
        <SFPChart
          label=""
          chartData={{
            success: smsData.maskSuccess,
            failed: smsData.maskFailed,
            pending: smsData.maskPending,
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
            success: smsData.nonmaskSuccess,
            failed: smsData.nonmaskFailed,
            pending: smsData.nonmaskPending,
          }}
        />
      </div>
    </section>
  );
};

export default Charts;
