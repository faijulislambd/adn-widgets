"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import moment from "moment";
import UpdateHeader from "@/components/daily-update/UpdateHeader";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Check,
  Clock,
  Copy,
  Globe2,
  Lock,
  MessageSquareCode,
  RefreshCw,
  Unlock,
  Users2,
} from "lucide-react";
import StatusCard from "@/components/daily-update/StatusCard";
import TopClientsTable from "@/components/daily-update/TopClientsTable";
import { groupCompanies } from "@/lib/group-companies";
import { toast } from "sonner";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

const StatusCardSkeleton = () => (
  <div className="flex flex-col items-center gap-y-2 justify-center w-full px-4 py-6 bg-gray-100 rounded-lg shadow-md animate-pulse">
    <div className="h-3 w-20 bg-gray-300 rounded" />
    <div className="h-12 w-12 rounded-full bg-gray-300" />
    <div className="h-8 w-16 bg-gray-300 rounded" />
  </div>
);

const TableRowSkeleton = () => (
  <div className="flex gap-2 py-2 animate-pulse">
    <div className="h-4 w-4 bg-gray-200 rounded" />
    <div className="h-4 flex-1 bg-gray-200 rounded" />
    <div className="h-4 w-16 bg-gray-200 rounded" />
  </div>
);

const DailyReportPage = () => {
  const [dailyReportData, setDailyReportData] = useState<{
    success: number;
    failed: number;
    pending: number;
    topClients: { clientName: string; totalSMS: number }[];
  } | null>(null);
  const [metlifeReport, setMetlifeReport] = useState<{
    maskConsumption: number;
    nonMaskConsumption: number;
    internationalConsumption: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const fetchAllReportData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [smsResponse, metlifeResponse] = await Promise.all([
        fetch("/api/daily-report-data"),
        fetch("/api/metlife-report"),
      ]);
      if (!smsResponse.ok) throw new Error("Failed to fetch daily report data");
      if (!metlifeResponse.ok)
        throw new Error("Failed to fetch metlife report data");
      const [smsJson, metlifeJson] = await Promise.all([
        smsResponse.json(),
        metlifeResponse.json(),
      ]);
      setDailyReportData(smsJson.smsData);
      setMetlifeReport(metlifeJson.metlifeData);
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllReportData();
    intervalRef.current = setInterval(
      () => fetchAllReportData(),
      REFRESH_INTERVAL_MS,
    );
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchAllReportData]);

  const topClients = groupCompanies(dailyReportData?.topClients ?? []);

  const sumOfMetlifeValues = (mask: number, nonMask: number, int: number) =>
    Number(mask) + Number(nonMask) + Number(int);

  const copyFormattedReportToClipboard = async () => {
    if (!reportRef.current || !dailyReportData || !metlifeReport) return;
    const html = `
<div style="font-family: Segoe UI, Arial, sans-serif; font-size:14px;">
    <div style="font-weight:700;">-> ADN SMS PANEL STATUS ${moment().format("DD-MMMM-YYYY")}</div>
<br>
    <div>SUCCESS: ${dailyReportData.success}</div>
    <div>FAILED: ${dailyReportData.failed}</div>
    <div>PENDING: ${dailyReportData.pending}</div>
<br>
    <div style="font-weight:700;">-> TOP 3 CLIENTS ${moment().format("DD-MMMM-YYYY")}</div>
<br>
    ${topClients.slice(0, 3).map((c) => `<div>${c.company}</div>`).join("")}
<br>
    <div style="font-weight:700;">-> MetLife Bangladesh ${moment().format("DD-MMMM-YYYY")}</div>
<br>
    <div>Volume: ${sumOfMetlifeValues(metlifeReport.maskConsumption, metlifeReport.nonMaskConsumption, metlifeReport.internationalConsumption)}</div>
<br>
    <div style="font-weight:700;">-> One Bank PLC ${moment().format("DD-MMMM-YYYY")}</div>
<br>
    <div>Volume: 0</div>
</div>
`;
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([reportRef.current.innerText], {
          type: "text/plain",
        }),
      }),
    ]);
    toast.success("Content Copied For Teams");
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Daily Report</h1>
      <p className="text-sm text-muted-foreground mt-0.5">
        Get the daily ADN DigiNet SMS platform updates.
      </p>
      <div className="mt-4 border rounded-xl p-4 sm:p-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="font-semibold uppercase text-base sm:text-lg">
            Report of the day: {moment().format("DD-MMMM-YYYY")}
          </h1>
          <div className="flex gap-x-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => fetchAllReportData(true)}
              disabled={refreshing}
            >
              <RefreshCw
                className={`size-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={copyFormattedReportToClipboard}
              disabled={!dailyReportData}
            >
              <Copy className="size-3.5" />
              Copy For Teams
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="col-span-1 lg:col-span-3 space-y-9">
              <div>
                <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-3" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
                  <StatusCardSkeleton />
                  <StatusCardSkeleton />
                  <StatusCardSkeleton />
                </div>
              </div>
              <div>
                <div className="h-5 w-56 bg-gray-200 rounded animate-pulse mb-3" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
                  <StatusCardSkeleton />
                  <StatusCardSkeleton />
                  <StatusCardSkeleton />
                </div>
              </div>
            </div>
            <div className="col-span-1 lg:col-span-2">
              <div className="h-5 w-36 bg-gray-200 rounded animate-pulse mb-3" />
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRowSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : dailyReportData && metlifeReport ? (
          <div
            className="grid grid-cols-1 lg:grid-cols-5 gap-6"
            ref={reportRef}
          >
            <div className="col-span-1 lg:col-span-3">
              <div className="mb-9">
                <UpdateHeader
                  title="ADN SMS PANEL STATUS"
                  icon={<MessageSquareCode className="size-4" />}
                />
                <div className="capitalize text-sm grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
                  <StatusCard
                    title="Success"
                    value={dailyReportData.success}
                    bgColor="bg-green-200"
                    borderColor="border-green-600"
                    textColor="text-green-600"
                    icon={<Check className="size-6" />}
                  />
                  <StatusCard
                    title="Failed"
                    value={dailyReportData.failed}
                    bgColor="bg-red-200"
                    borderColor="border-red-600"
                    textColor="text-red-600"
                    icon={<AlertTriangle className="size-6" />}
                  />
                  <StatusCard
                    title="Pending"
                    value={dailyReportData.pending}
                    bgColor="bg-amber-200"
                    borderColor="border-amber-500"
                    textColor="text-amber-500"
                    icon={<Clock className="size-6" />}
                  />
                </div>
              </div>
              <div>
                <UpdateHeader
                  title="METLIFE CONSUMPTION STATUS"
                  icon={<MessageSquareCode className="size-4" />}
                />
                <div className="capitalize text-sm grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
                  <StatusCard
                    title="Mask"
                    value={metlifeReport.maskConsumption}
                    bgColor="bg-green-200"
                    borderColor="border-green-600"
                    textColor="text-green-600"
                    icon={<Lock className="size-6" />}
                  />
                  <StatusCard
                    title="Nonmask"
                    value={metlifeReport.nonMaskConsumption}
                    bgColor="bg-amber-200"
                    borderColor="border-amber-500"
                    textColor="text-amber-500"
                    icon={<Unlock className="size-6" />}
                  />
                  <StatusCard
                    title="International"
                    value={metlifeReport.internationalConsumption}
                    bgColor="bg-blue-200"
                    borderColor="border-blue-500"
                    textColor="text-blue-500"
                    icon={<Globe2 className="size-6" />}
                  />
                </div>
              </div>
            </div>

            <div className="col-span-1 lg:col-span-2">
              <UpdateHeader
                title={`TOP CLIENTS (${topClients.length})`}
                icon={<Users2 className="size-4" />}
              />
              <TopClientsTable clients={topClients} />
            </div>
          </div>
        ) : (
          <p>No data available.</p>
        )}
      </div>
    </div>
  );
};

export default DailyReportPage;
