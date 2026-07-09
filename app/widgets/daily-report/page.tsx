"use client";

import { useRef } from "react";
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
import DataLastUpdated from "@/components/Utils/DataLastUpdated";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchDailyReport,
  selectDailyReport,
  selectIsDailyReportLoading,
  selectIsDailyReportRefreshing,
} from "@/store/daily-report-slice";

const DailyReportPage = () => {
  const dispatch = useAppDispatch();
  const { smsData: dailyReportData, metlifeData: metlifeReport } =
    useAppSelector(selectDailyReport);
  const loading = useAppSelector(selectIsDailyReportLoading);
  const refreshing = useAppSelector(selectIsDailyReportRefreshing);
  const reportRef = useRef<HTMLDivElement>(null);

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
    ${topClients
      .slice(0, 3)
      .map((c) => `<div>${c.company}</div>`)
      .join("")}
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
            Report of the day: {moment().format("DD-MMMM-YYYY")}{" "}
            <DataLastUpdated className="text-xs uppercase" />
          </h1>
          <div className="flex gap-x-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => dispatch(fetchDailyReport(true))}
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

        {dailyReportData && metlifeReport ? (
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
                    refreshing={refreshing}
                  />
                  <StatusCard
                    title="Failed"
                    value={dailyReportData.failed}
                    bgColor="bg-red-200"
                    borderColor="border-red-600"
                    textColor="text-red-600"
                    icon={<AlertTriangle className="size-6" />}
                    refreshing={refreshing}
                  />
                  <StatusCard
                    title="Pending"
                    value={dailyReportData.pending}
                    bgColor="bg-amber-200"
                    borderColor="border-amber-500"
                    textColor="text-amber-500"
                    icon={<Clock className="size-6" />}
                    refreshing={refreshing}
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
                    refreshing={refreshing}
                  />
                  <StatusCard
                    title="Nonmask"
                    value={metlifeReport.nonMaskConsumption}
                    bgColor="bg-amber-200"
                    borderColor="border-amber-500"
                    textColor="text-amber-500"
                    icon={<Unlock className="size-6" />}
                    refreshing={refreshing}
                  />
                  <StatusCard
                    title="International"
                    value={metlifeReport.internationalConsumption}
                    bgColor="bg-blue-200"
                    borderColor="border-blue-500"
                    textColor="text-blue-500"
                    icon={<Globe2 className="size-6" />}
                    refreshing={refreshing}
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
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : "No data available."}
          </p>
        )}
      </div>
    </div>
  );
};

export default DailyReportPage;
