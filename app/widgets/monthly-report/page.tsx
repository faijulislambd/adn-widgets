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
  Users2,
} from "lucide-react";
import StatusCard from "@/components/daily-update/StatusCard";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

interface MonthlyData {
  success: string;
  failed: string;
  pending: string;
  topClients: { clientName: string; totalSMS: string }[];
}

const MonthlyReportPage = () => {
  const [data, setData] = useState<MonthlyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cachedAt, setCachedAt] = useState<number | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  const reportRef = useRef<HTMLDivElement>(null);

  const fetchData = async (force = false) => {
    setLoading(true);
    setWarning(null);
    try {
      const url = force
        ? "/api/monthly-report-data?force=true"
        : "/api/monthly-report-data";
      const response = await fetch(url);
      const json = await response.json();

      if (!response.ok || json.error) {
        throw new Error(json.error || "Failed to fetch monthly report data");
      }

      setData(json.monthlySmsData);
      setCachedAt(json.cachedAt ?? null);
      setIsStale(json.stale === true);
      if (json.warning) setWarning(json.warning);

      if (json.stale) {
        toast.warning("Showing cached data — live data took too long to load.");
      } else if (json.fromCache) {
        toast.info("Data loaded from cache.");
      }
    } catch (error) {
      console.error("Error fetching monthly report data:", error);
      toast.error("Failed to load monthly SMS data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const copyToClipboard = async () => {
    if (!reportRef.current) return;
    const month = moment().format("MMMM-YYYY");
    const html = `
<div style="font-family: Segoe UI, Arial, sans-serif; font-size:14px;">
    <div style="font-weight:700;">-> ADN SMS PANEL STATUS ${month}</div>
<br>
    <div>SUCCESS: ${data?.success}</div>
    <div>FAILED: ${data?.failed}</div>
    <div>PENDING: ${data?.pending}</div>
<br>
    <div style="font-weight:700;">-> TOP 3 CLIENTS ${month}</div>
<br>
    ${data?.topClients.map((c) => `<div>${c.clientName}</div>`).join("")}
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

  const cacheAge = cachedAt
    ? Math.round((Date.now() - cachedAt) / 60000)
    : null;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Monthly Report</h1>
      <p className="text-sm text-muted-foreground mt-0.5">
        Get the monthly ADN DiGiNet SMS platform updates.
      </p>
      <div className="mt-4 border rounded-xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-semibold uppercase text-lg">
              Report of the month: {moment().format("MMMM YYYY")}
            </h1>
            {cachedAt && (
              <p
                className={`text-xs mt-0.5 ${isStale ? "text-amber-500" : "text-muted-foreground"}`}
              >
                {isStale ? "⚠ Stale — " : ""}
                Last updated:{" "}
                {cacheAge === 0 ? "just now" : `${cacheAge} min ago`}
                {isStale && " (portal was too slow to respond)"}
              </p>
            )}
          </div>
          <div className="flex gap-x-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => fetchData(false)}
              disabled={loading}
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
              onClick={() => fetchData(true)}
              disabled={loading}
            >
              <RefreshCw className="size-3.5" />
              Force Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={copyToClipboard}
              disabled={!data}
            >
              <Copy className="size-3.5" />
              Copy For Teams
            </Button>
          </div>
        </div>

        {warning && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700">
            <AlertTriangle className="size-4 shrink-0" />
            {warning}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Spinner className="size-8" />
          </div>
        ) : data ? (
          <div className="grid grid-cols-5 gap-x-4" ref={reportRef}>
            <div className="col-span-3">
              <UpdateHeader
                title="ADN SMS PANEL STATUS"
                icon={<MessageSquareCode className="size-4" />}
              />
              <div className="capitalize text-sm grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
                <StatusCard
                  title="Success"
                  value={data.success}
                  bgColor="bg-green-200"
                  borderColor="border-green-600"
                  textColor="text-green-600"
                  icon={<Check className="size-6" />}
                />
                <StatusCard
                  title="Failed"
                  value={data.failed}
                  bgColor="bg-red-200"
                  borderColor="border-red-600"
                  textColor="text-red-600"
                  icon={<AlertTriangle className="size-6" />}
                />
                <StatusCard
                  title="Pending"
                  value={data.pending}
                  bgColor="bg-amber-200"
                  borderColor="border-amber-500"
                  textColor="text-amber-500"
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
                {data.topClients.map((client, index) => (
                  <li key={index}>{client.clientName}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No data available. Click <strong>Force Refresh</strong> to load
            fresh data from the portal (may take up to 60 seconds).
          </p>
        )}
      </div>
    </div>
  );
};

export default MonthlyReportPage;
