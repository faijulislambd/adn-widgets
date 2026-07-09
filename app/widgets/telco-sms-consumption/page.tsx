"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { TelcoSmsRow, TelcoSmsStatusEntry } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_POLL_INTERVAL_MS = 15 * 1000;

const STATUS_LABELS: Record<TelcoSmsStatusEntry["status"], string> = {
  idle: "No data scraped yet — set a date range above and start a scrape.",
  running:
    "Scrape in progress — this can take up to 20 minutes for a large date range. This page will update automatically.",
  done: "Data ready.",
  failed: "Last scrape failed.",
};

function formatTimestamp(ts: number) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(ts));
}

function formatDateRange(start: string, end: string) {
  const fmt = (d: string) =>
    new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
      new Date(d + "T00:00:00"),
    );
  return `${fmt(start)} – ${fmt(end)}`;
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

const TelcoSmsConsumptionPage = () => {
  const [status, setStatus] = useState<TelcoSmsStatusEntry | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [triggering, setTriggering] = useState(false);
  const [triggerError, setTriggerError] = useState<string | null>(null);
  const [triggerSuccess, setTriggerSuccess] = useState(false);
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<TelcoSmsRow[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [scrapedAt, setScrapedAt] = useState<number | null>(null);
  const [dataStartDate, setDataStartDate] = useState<string | null>(null);
  const [dataEndDate, setDataEndDate] = useState<string | null>(null);
  const prevStatusRef = useRef<TelcoSmsStatusEntry["status"] | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const fetchStatus = useCallback(async () => {
    const res = await fetch("/api/telco-sms/status");
    const json = await res.json();
    if (json.success) setStatus(json.status);
  }, []);

  // Loads the whole dataset once — all searching/filtering below happens
  // client-side against this, no server round trip per keystroke.
  const loadAllData = useCallback(async () => {
    setLoadingData(true);
    try {
      const res = await fetch("/api/telco-sms/search");
      const json = await res.json();
      if (json.success) {
        setRows(json.rows);
        if (json.scrapedAt) setScrapedAt(json.scrapedAt);
        if (json.startDate) setDataStartDate(json.startDate);
        if (json.endDate) setDataEndDate(json.endDate);
      }
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    loadAllData();
    const interval = setInterval(fetchStatus, STATUS_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchStatus, loadAllData]);

  // The moment a running scrape flips to done, pull the fresh dataset
  // automatically — no need to notice and manually reload.
  useEffect(() => {
    if (status?.status === "done" && prevStatusRef.current === "running") {
      loadAllData();
    }
    prevStatusRef.current = status?.status ?? null;
  }, [status, loadAllData]);

  const isRunning = status?.status === "running";
  const dateRangeInvalid = !startDate || !endDate || endDate < startDate;

  // Ticks once a second while a scrape is running, purely to drive the
  // live "running for Xm Ys" display below.
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleTrigger = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (dateRangeInvalid) return;

    setTriggering(true);
    setTriggerError(null);
    setTriggerSuccess(false);
    try {
      const res = await fetch("/api/telco-sms/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Failed to trigger scrape");
      }
      setTriggerSuccess(true);
      fetchStatus();
    } catch (error) {
      setTriggerError(
        error instanceof Error ? error.message : "Failed to trigger scrape",
      );
    } finally {
      setTriggering(false);
    }
  };

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      Object.values(row).some((value) => value.toLowerCase().includes(q)),
    );
  }, [rows, query]);

  return (
    <div className="min-w-0">
      <h1 className="text-2xl font-semibold tracking-tight">
        Telco SMS Consumption
      </h1>
      <p className="text-sm text-muted-foreground mt-0.5">
        Trigger a manual scrape for a date range, then search the results.
      </p>

      <div className="mt-4 border rounded-xl p-4 sm:p-6 space-y-6">
        <div>
          <h2 className="text-sm font-semibold mb-3">Start a scrape</h2>
          <form
            onSubmit={handleTrigger}
            className="flex flex-col sm:flex-row sm:items-end gap-3"
          >
            <Field className="w-full sm:w-auto">
              <FieldLabel htmlFor="start-date">Start date</FieldLabel>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                disabled={isRunning}
              />
            </Field>
            <Field className="w-full sm:w-auto">
              <FieldLabel htmlFor="end-date">End date</FieldLabel>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                disabled={isRunning}
              />
            </Field>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={isRunning || triggering || dateRangeInvalid}
            >
              {triggering ? "Starting..." : "Start Scrape"}
            </Button>
          </form>
          {triggerError && (
            <p className="mt-2 text-sm text-destructive">{triggerError}</p>
          )}
          {triggerSuccess && !triggerError && (
            <p className="mt-2 text-sm text-muted-foreground">
              Scrape triggered — this page will update automatically once it
              starts.
            </p>
          )}
        </div>

        <div
          className={`rounded-md border px-4 py-3 text-sm ${
            status?.status === "failed"
              ? "border-destructive/50 text-destructive"
              : status?.status === "running"
                ? "border-amber-500/50 text-amber-600"
                : "border-muted text-muted-foreground"
          }`}
        >
          {status ? STATUS_LABELS[status.status] : "Checking status..."}
          {status?.startDate && status?.endDate && (
            <>
              {" "}
              ({status.startDate} to {status.endDate})
            </>
          )}
          {status?.status === "running" && status.startedAt && (
            <> — running for {formatDuration(now - status.startedAt)}.</>
          )}
          {status?.status === "done" && status.rowCount !== undefined && (
            <> — {status.rowCount} rows.</>
          )}
          {status?.status === "done" &&
            status.startedAt &&
            status.finishedAt && (
              <> Took {formatDuration(status.finishedAt - status.startedAt)}.</>
            )}
          {status?.status === "failed" && status.startedAt && status.finishedAt && (
            <> Ran for {formatDuration(status.finishedAt - status.startedAt)} before failing.</>
          )}
          {status?.status === "failed" && status.error && (
            <div className="mt-1">{status.error}</div>
          )}
        </div>

        <Field className="w-full">
          <FieldLabel htmlFor="telco-sms-search">Search</FieldLabel>
          <Input
            id="telco-sms-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by account, telco, sender number…"
            disabled={isRunning || rows.length === 0}
          />
        </Field>

        {loadingData ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : rows.length > 0 ? (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {scrapedAt && (
                <span>
                  Last pull:{" "}
                  <span className="font-medium text-foreground">
                    {formatTimestamp(scrapedAt)}
                  </span>
                </span>
              )}
              {dataStartDate && dataEndDate && (
                <>
                  {scrapedAt && <span className="opacity-40">·</span>}
                  <span>
                    Data range:{" "}
                    <span className="font-medium text-foreground">
                      {formatDateRange(dataStartDate, dataEndDate)}
                    </span>
                  </span>
                </>
              )}
            </div>
            <div className="overflow-x-auto border rounded-lg">
              <Table className="w-full text-sm">
                <TableHeader>
                  <TableRow className="border-b bg-muted/50">
                    {columns.map((col) => (
                      <TableHead
                        key={col}
                        className="text-left font-semibold px-3 py-2 whitespace-nowrap"
                      >
                        {col}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.map((row, i) => (
                    <TableRow key={i} className="border-b last:border-0">
                      {columns.map((col) => (
                        <TableCell
                          key={col}
                          className="px-3 py-2 whitespace-nowrap"
                        >
                          {row[col]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="px-3 py-2 text-xs text-muted-foreground">
                {filteredRows.length} of {rows.length} row
                {rows.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No data yet — start a scrape above.
          </p>
        )}
      </div>
    </div>
  );
};

export default TelcoSmsConsumptionPage;
