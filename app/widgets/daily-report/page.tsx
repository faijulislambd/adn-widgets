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
  Globe2,
  Lock,
  MessageSquareCode,
  RefreshCw,
  Unlock,
  Users,
  Users2,
} from "lucide-react";
import StatusCard from "@/components/daily-update/StatusCard";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import TopClientsTable from "@/components/daily-update/TopClientsTable";
import { groupCompanies } from "@/lib/group-companies";
const DailyReportPage = () => {
  const [dailyReportData, setDailyReportData] = useState<{
    success: number;
    failed: number;
    pending: number;
    topThreeClients: { clientName: string; totalSMS: number }[];
  } | null>(null);
  const [metlifeReport, setMetlifeReport] = useState<{
    maskConsumption: number;
    nonMaskConsumption: number;
    internationalConsumption: number;
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
  const fetchDailyMetlifeReportData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/metlife-report");
      if (!response.ok) {
        throw new Error("Failed to fetch daily report data");
      }
      const data = await response.json();
      setMetlifeReport(data.metlifeData);
    } catch (error) {
      console.error("Error fetching daily report data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyReportData();
    fetchDailyMetlifeReportData();
  }, []);

  const topClients = groupCompanies(dailyReportData?.topThreeClients ?? []);

  const sumOfMetlifeValues = (mask: number, nonMask: number, int: number) => {
    return Number(mask) + Number(nonMask) + Number(int);
  };

  const copyFormattedReportToClipboard = async () => {
    if (!reportRef.current) return;
    if (dailyReportData && metlifeReport) {
      const html = `
<div style="font-family: Segoe UI, Arial, sans-serif; font-size:14px;">
    <div style="font-weight:700;">-> ADN SMS PANEL STATUS ${moment().format("DD-MMMM-YYYY")}
    </div>

<br>

    <div>SUCCESS: ${dailyReportData.success}</div>
    <div>FAILED: ${dailyReportData.failed}</div>
    <div>PENDING: ${dailyReportData.pending}</div>

    <br>

    <div style="font-weight:700;">-> TOP 3 CLIENTS ${moment().format("DD-MMMM-YYYY")}
    </div>

<br>

    ${topClients
      .slice(0, 3)
      .map((c) => `<div>${c.company}</div>`)
      .join("")}
<br>
         <div style="font-weight:700;">-> MetLife Bangladesh ${moment().format("DD-MMMM-YYYY")}
    </div>

<br>

  <div>Volume: ${sumOfMetlifeValues(metlifeReport.maskConsumption, metlifeReport.nonMaskConsumption, metlifeReport.internationalConsumption)}</div>

  <br>
         <div style="font-weight:700;">-> One Bank PLC ${moment().format("DD-MMMM-YYYY")}
    </div>

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
    }
  };

  const handleRefresh = () => {
    fetchDailyReportData();
    fetchDailyMetlifeReportData();
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
              onClick={() => handleRefresh()}
            >
              <RefreshCw
                className={`size-3.5 ${loading ? "animate-spin" : ""}`}
              />
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
        ) : dailyReportData && metlifeReport ? (
          <div className="grid grid-cols-5 gap-x-6" ref={reportRef}>
            <div className="col-span-3">
              <div className="mb-9">
                <UpdateHeader
                  title="ADN SMS PANEL STATUS"
                  icon={<MessageSquareCode className="size-4" />}
                />
                <div className="capitalize text-sm grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2 ">
                  <StatusCard
                    title="Success"
                    value={dailyReportData?.success}
                    bgColor="bg-green-200"
                    borderColor="border-green-600"
                    textColor="text-green-600"
                    icon={<Check className="size-6" />}
                  />
                  <StatusCard
                    title="Failed"
                    value={dailyReportData?.failed}
                    bgColor="bg-red-200"
                    borderColor="border-red-600"
                    textColor="text-red-600"
                    icon={<AlertTriangle className="size-6" />}
                  />
                  <StatusCard
                    title="Pending"
                    value={dailyReportData?.pending}
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
                <div className="capitalize text-sm grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2 ">
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

            <div className="col-span-2">
              <UpdateHeader
                title={`TOP CLIENTS`}
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
