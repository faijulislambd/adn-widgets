"use client";

import { useEffect, useRef, useState } from "react";
import moment from "moment";
import UpdateHeader from "@/components/daily-update/UpdateHeader";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Check,
  Clock,
  Copy,
  MessageSquareCode,
  RefreshCw,
  Users,
  Users2,
} from "lucide-react";
import StatusCard from "@/components/daily-update/StatusCard";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import TopClientsTable from "@/components/daily-update/TopClientsTable";
const DailyReportPage = () => {
  const [dailyReportData, setDailyReportData] = useState<{
    success: number;
    failed: number;
    pending: number;
    topThreeClients: { clientName: string; totalSMS: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const reportRef = useRef<HTMLDivElement>(null);

  const fetchDailyReportData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/daily-report-data");
      if (!response.ok) {
        throw new Error("Failed to fetch daily report data");
      }
      const data = await response.json();
      setDailyReportData(data.smsData);
    } catch (error) {
      console.error("Error fetching daily report data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyReportData();
  }, []);

  const copyFormattedReportToClipboard = async () => {
    if (!reportRef.current) return;
    const html = `
<div style="font-family: Segoe UI, Arial, sans-serif; font-size:14px;">
    <div style="font-weight:700;">-> ADN SMS PANEL STATUS ${moment().format("DD-MMMM-YYYY")}
    </div>

<br>

    <div>SUCCESS: ${dailyReportData?.success}</div>
    <div>FAILED: ${dailyReportData?.failed}</div>
    <div>PENDING: ${dailyReportData?.pending}</div>

    <br>

    <div style="font-weight:700;">-> TOP 3 CLIENTS ${moment().format("DD-MMMM-YYYY")}
    </div>

<br>

    ${dailyReportData?.topThreeClients
      .map((c) => `<div>${c.clientName}</div>`)
      .join("")}
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
      <div className="mt-4 border rounded-xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-semibold uppercase text-lg">
            Report of the day: {moment().format("DD-MMMM-YYYY")}
          </h1>
          <div className="flex gap-x-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => fetchDailyReportData()}
            >
              <RefreshCw className="size-3.5" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={copyFormattedReportToClipboard}
            >
              <Copy className="size-3.5" />
              Copy For Teams
            </Button>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center">
            <Spinner className="size-8" />
          </div>
        ) : dailyReportData ? (
          <div className="grid grid-cols-5 gap-x-8" ref={reportRef}>
            <div className="col-span-3">
              <UpdateHeader
                title="ADN SMS PANEL STATUS"
                icon={<MessageSquareCode className="size-4" />}
              />
              <div className="capitalize text-sm grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2 ">
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

            <div className="col-span-2">
              <UpdateHeader
                title="TOP 3 CLIENTS"
                icon={<Users2 className="size-4" />}
              />
              <TopClientsTable clients={dailyReportData?.topThreeClients} />
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
