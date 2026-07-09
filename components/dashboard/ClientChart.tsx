"use client";

import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  TooltipItem,
} from "chart.js";
import { RefreshCw } from "lucide-react";
import { Chart } from "react-chartjs-2";
import { groupCompanies } from "@/lib/group-companies";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchDailyReport,
  selectDailyReport,
  selectIsDailyReportLoading,
  selectIsDailyReportRefreshing,
} from "@/store/daily-report-slice";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  Tooltip,
  Legend,
);

// Show each company's real top clients stacked to their actual SMS count
// (not an equal division of the company total) — the bar's full height is
// still the company total, it's just built from genuine per-client
// numbers instead of an average.
const MAX_SEGMENTS = 6;
const SEGMENT_COLORS = [
  "#2563eb",
  "#0ea5e9",
  "#22c55e",
  "#f59e0b",
  "#a855f7",
  "#ec4899",
];
const OTHERS_COLOR = "#9ca3af";

const ClientChart = () => {
  const dispatch = useAppDispatch();
  const { smsData } = useAppSelector(selectDailyReport);
  const loading = useAppSelector(selectIsDailyReportLoading);
  const refreshing = useAppSelector(selectIsDailyReportRefreshing);

  const handleManualRefresh = () => dispatch(fetchDailyReport(true));

  const companies = groupCompanies(smsData?.topClients ?? []).map(
    (company) => ({
      ...company,
      sortedUsers: [...(company.users ?? [])].sort((a, b) => b.sms - a.sms),
    }),
  );

  const labels = companies.map((company) => company.company);

  const segmentDatasets = Array.from({ length: MAX_SEGMENTS }, (_, i) => ({
    type: "bar" as const,
    label: `Client ${i + 1}`,
    data: companies.map((company) => company.sortedUsers[i]?.sms ?? 0),
    backgroundColor: SEGMENT_COLORS[i],
    stack: "clients",
  }));

  const othersDataset = {
    type: "bar" as const,
    label: "Others",
    data: companies.map((company) =>
      company.sortedUsers
        .slice(MAX_SEGMENTS)
        .reduce((sum, user) => sum + user.sms, 0),
    ),
    backgroundColor: OTHERS_COLOR,
    stack: "clients",
  };

  const chartData = {
    labels,
    datasets: [...segmentDatasets, othersDataset],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        filter: (ctx: TooltipItem<"bar">) => (ctx.parsed.y ?? 0) > 0,
        callbacks: {
          label: (ctx: TooltipItem<"bar">) => {
            const company = companies[ctx.dataIndex];
            const value = ctx.parsed.y ?? 0;
            if (ctx.datasetIndex === MAX_SEGMENTS) {
              const othersCount = Math.max(
                company.sortedUsers.length - MAX_SEGMENTS,
                0,
              );
              return ` Others (${othersCount} clients): ${value.toLocaleString()}`;
            }
            const client = company.sortedUsers[ctx.datasetIndex];
            return client ? ` ${client.user}: ${value.toLocaleString()}` : "";
          },
          footer: (items: TooltipItem<"bar">[]) => {
            const total = items.reduce(
              (sum, item) => sum + (item.parsed.y ?? 0),
              0,
            );
            return `Total: ${total.toLocaleString()}`;
          },
        },
      },
      // chartjs-plugin-datalabels is registered globally by sibling charts
      // (SFPChart/AllMaskChart) — explicitly opt out here so it doesn't draw
      // raw values on every bar segment; tooltip-on-hover is the only place
      // numbers should show.
      datalabels: {
        display: false,
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: { font: { size: 10 }, maxRotation: 45, minRotation: 0 },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: { display: true, text: "Total SMS" },
      },
    },
  };

  if (!smsData) {
    return (
      <p className="text-sm text-muted-foreground">
        {loading ? "Loading…" : "Failed to load data."}
      </p>
    );
  }

  return (
    <div className="relative flex flex-col items-center gap-1 w-full">
      <button
        onClick={handleManualRefresh}
        disabled={refreshing}
        className="absolute top-0 right-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
        title="Refresh"
      >
        <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
      </button>
      <p className="text-xs font-semibold capitalize text-muted-foreground">
        Top Clients
      </p>
      <div className="w-full">
        <Chart type="bar" data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ClientChart;
