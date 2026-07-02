"use client";

import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import ChartDataLabels, { Context } from "chartjs-plugin-datalabels";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

type pieData = {
  mask_success: number;
  mask_failed: number;
  mask_pending: number;
  nonmask_success: number;
  nonmask_failed: number;
  nonmask_pending: number;
};

const COLORS: Record<string, string> = {
  "Mask Success": "#4ade80",
  "Non-Mask Success": "#3b82f6",
  "Mask Failed": "#fecaca",
  "Non-Mask Failed": "#fecaca",
  "Mask Pending": "#fde68a",
  "Non-Mask Pending": "#fde68a",
};

const AllMaskChart = ({
  chartData,
  label,
}: {
  chartData: pieData;
  label: string;
}) => {
  const rawData = [
    { name: "Mask Success", value: chartData.mask_success },
    { name: "Non-Mask Success", value: chartData.nonmask_success },
    { name: "Mask Failed", value: chartData.mask_failed },
    { name: "Non-Mask Failed", value: chartData.nonmask_failed },
    { name: "Mask Pending", value: chartData.mask_pending },
    { name: "Non-Mask Pending", value: chartData.nonmask_pending },
  ].filter((d) => d.value > 0);

  const total = rawData.reduce((sum, d) => sum + d.value, 0);

  const data = {
    labels: rawData.map((d) => d.name),
    datasets: [
      {
        data: rawData.map((d) => d.value),
        backgroundColor: rawData.map((d) => COLORS[d.name]),
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          font: { size: 11 },
          padding: 12,
          boxWidth: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { label: string; parsed: number }) =>
            ` ${ctx.label}: ${ctx.parsed.toLocaleString()}`,
        },
      },
      datalabels: {
        color: "#1f2937",
        font: { weight: "bold" as const, size: 12 },
        formatter: (value: number) => {
          const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
          return `${value.toLocaleString()}\n${pct}%`;
        },
        display: (ctx: Context) => {
          const value = ctx.dataset.data[ctx.dataIndex] as number;
          return total > 0 && value / total >= 0.05;
        },
      },
    },
  };

  return (
    <div className="flex flex-col items-center gap-1 w-full">
      {label && (
        <p className="text-xs font-semibold capitalize text-muted-foreground">
          {label}
        </p>
      )}
      <div className="w-full aspect-square">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

export default AllMaskChart;
