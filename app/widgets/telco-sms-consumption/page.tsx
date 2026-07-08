"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { TelcoSmsRow, TelcoSmsStatusEntry } from "@/types";

const STATUS_POLL_INTERVAL_MS = 15 * 1000;

const STATUS_LABELS: Record<TelcoSmsStatusEntry["status"], string> = {
  idle: "No data scraped yet — set a date range above and start a scrape.",
  running:
    "Scrape in progress — this can take up to 20 minutes for a large date range. This page will update automatically.",
  done: "Data ready.",
  failed: "Last scrape failed.",
};

const TelcoSmsConsumptionPage = () => {
  const [status, setStatus] = useState<TelcoSmsStatusEntry | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [triggering, setTriggering] = useState(false);
  const [triggerError, setTriggerError] = useState<string | null>(null);
  const [triggerSuccess, setTriggerSuccess] = useState(false);
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<TelcoSmsRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [truncated, setTruncated] = useState(false);
  const [searching, setSearching] = useState(false);

  const fetchStatus = useCallback(async () => {
    const res = await fetch("/api/telco-sms/status");
    const json = await res.json();
    if (json.success) setStatus(json.status);
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, STATUS_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const isRunning = status?.status === "running";
  const dateRangeInvalid =
    !startDate || !endDate || endDate < startDate;

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

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearching(true);
    try {
      const res = await fetch(
        `/api/telco-sms/search?q=${encodeURIComponent(query)}`,
      );
      const json = await res.json();
      if (json.success) {
        setRows(json.rows);
        setTotalRows(json.totalRows);
        setTruncated(json.truncated);
      }
    } finally {
      setSearching(false);
    }
  };

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Telco SMS Consumption
      </h1>
      <p className="text-sm text-muted-foreground mt-0.5">
        Trigger a manual scrape for a date range, then search the results.
      </p>

      <div className="mt-4 border rounded-xl p-6 space-y-6">
        <div>
          <h2 className="text-sm font-semibold mb-3">Start a scrape</h2>
          <form onSubmit={handleTrigger} className="flex items-end gap-3">
            <Field>
              <FieldLabel htmlFor="start-date">Start date</FieldLabel>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                disabled={isRunning}
              />
            </Field>
            <Field>
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
          {status?.status === "done" && status.rowCount !== undefined && (
            <> — {status.rowCount} rows.</>
          )}
          {status?.status === "failed" && status.error && (
            <div className="mt-1">{status.error}</div>
          )}
        </div>

        <form onSubmit={handleSearch} className="flex items-end gap-3">
          <Field className="flex-1">
            <FieldLabel htmlFor="telco-sms-search">Search</FieldLabel>
            <Input
              id="telco-sms-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search rows..."
              disabled={isRunning}
            />
          </Field>
          <Button type="submit" disabled={isRunning || searching}>
            {searching ? "Searching..." : "Search"}
          </Button>
        </form>

        {rows.length > 0 ? (
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="text-left font-semibold px-3 py-2 whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    {columns.map((col) => (
                      <td key={col} className="px-3 py-2 whitespace-nowrap">
                        {row[col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-3 py-2 text-xs text-muted-foreground">
              {totalRows} match{totalRows === 1 ? "" : "es"}
              {truncated ? ` (showing first ${rows.length})` : ""}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No results yet — try a search above.
          </p>
        )}
      </div>
    </div>
  );
};

export default TelcoSmsConsumptionPage;
