import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
} from "recharts";

type pieData = {
  success: number;
  failed: number;
  pending: number;
};

const COLORS: Record<string, string> = {
  Success: "#4ade80",
  Failed: "#fecaca",
  Pending: "#fde68a",
};

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="rounded bg-white px-3 py-1.5 shadow text-sm font-medium">
      {name}: {value?.toLocaleString()}
    </div>
  );
};

const SFPChart = ({
  chartData,
  label,
}: {
  chartData: pieData;
  label: string;
}) => {
  const data = [
    { name: "Success", value: chartData.success },
    { name: "Failed", value: chartData.failed },
    { name: "Pending", value: chartData.pending },
  ].filter((d) => d.value > 0);

  return (
    <div className="flex flex-col items-center gap-1 w-full">
      <p className="text-xs font-semibold capitalize text-muted-foreground">
        {label}
      </p>
      <div className="w-full aspect-square">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius="90%"
              label={false}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              align="center"
              className="uppercase"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SFPChart;
