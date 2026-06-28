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
  RefreshCw,
  Users,
  Users2,
} from "lucide-react";
import StatusCard from "@/components/daily-update/StatusCard";
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

  const getFormatedReportStyle = (source: Element, target: Element) => {
    const computedStyle = window.getComputedStyle(source);

    for (const property of computedStyle) {
      (target as HTMLElement).style.setProperty(
        property,
        computedStyle.getPropertyValue(property),
        computedStyle.getPropertyPriority(property),
      );
    }
  };

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
          <p>Loading...</p>
        ) : dailyReportData ? (
          <div className="grid grid-cols-3 gap-x-4" ref={reportRef}>
            <div className="col-span-2">
              <UpdateHeader
                title="ADN SMS PANEL STATUS"
                icon={<RefreshCw className="size-4" />}
              />
              <div className="capitalize text-sm grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2 ">
                <StatusCard
                  title="Success"
                  value={dailyReportData.success}
                  bgColor="green-200"
                  textColor="green-600"
                  icon={<Check className="size-6" />}
                />
                <StatusCard
                  title="Failed"
                  value={dailyReportData.failed}
                  bgColor="red-200"
                  textColor="red-600"
                  icon={<AlertTriangle className="size-6" />}
                />
                <StatusCard
                  title="Pending"
                  value={dailyReportData.pending}
                  bgColor="yellow-200"
                  textColor="yellow-600"
                  icon={<Clock className="size-6" />}
                />
              </div>
            </div>

            <div>
              <UpdateHeader
                title="TOP 3 CLIENTS"
                icon={<Users2 className="size-4" />}
              />
              <ul className="capitalize text-sm list-disc list-inside">
                {dailyReportData.topThreeClients.map((client, index) => (
                  <li key={index}>{client.clientName}</li>
                ))}
              </ul>
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
