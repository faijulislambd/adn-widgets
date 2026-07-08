"use client";

import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
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
  LineController,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

const ClientChart = () => {
  const dispatch = useAppDispatch();
  const { smsData } = useAppSelector(selectDailyReport);
  const loading = useAppSelector(selectIsDailyReportLoading);
  const refreshing = useAppSelector(selectIsDailyReportRefreshing);

  const handleManualRefresh = () => dispatch(fetchDailyReport(true));

  const topClients = groupCompanies(smsData?.topClients ?? []);
  const labels = topClients.map((company) => company.company);
  const totalSmsData = topClients.map((company) => company.totalSMS);
  const smsPerClientData = topClients.map((company) => {
    const clientCount = company.users?.length ?? 0;
    return clientCount > 0 ? Math.round(company.totalSMS / clientCount) : 0;
  });

  const chartData = {
    labels,
    datasets: [
      {
        type: "bar" as const,
        label: "Total SMS",
        data: totalSmsData,
        backgroundColor: "#2563eb",
        yAxisID: "y",
      },
      {
        type: "line" as const,
        label: "SMS per Client",
        data: smsPerClientData,
        borderColor: "#ef4444",
        backgroundColor: "#ef4444",
        tension: 0.3,
        yAxisID: "y1",
        ticks: { display: false },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { font: { size: 11 }, padding: 12, boxWidth: 12 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"bar" | "line">) =>
            ` ${ctx.dataset.label}: ${(ctx.parsed.y ?? 0).toLocaleString()}`,
        },
      },
      // chartjs-plugin-datalabels is registered globally by sibling charts
      // (SFPChart/AllMaskChart) — explicitly opt out here so it doesn't draw
      // raw values on every bar/point; tooltip-on-hover is the only place
      // numbers should show.
      datalabels: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: { font: { size: 10 }, maxRotation: 45, minRotation: 0 },
      },
      y: {
        type: "linear" as const,
        position: "left" as const,
        beginAtZero: true,
        title: { display: true, text: "Total SMS" },
      },
      y1: {
        type: "linear" as const,
        position: "right" as const,
        beginAtZero: true,
        title: { display: true, text: "SMS per Client" },
        grid: { drawOnChartArea: false },
      },
    },
  };

  if (loading || refreshing) {
    return (
      <div className="w-full aspect-[2/1] bg-gray-200 rounded-lg animate-pulse" />
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
