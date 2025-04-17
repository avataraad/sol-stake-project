
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

interface ChartSectionProps {
  title: string;
  data: Array<{ name: string; value: number }>;
}

const TimeframeButton = ({ period }: { period: string }) => (
  <button className="px-3 py-1 text-sm rounded-md hover:bg-white/5">
    {period}
  </button>
);

export const ChartSection = ({ title, data }: ChartSectionProps) => {
  return (
    <div className="chart-card">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold">{title}</h3>
        <div className="flex gap-2">
          {["1W", "1M", "3M", "1Y"].map((period) => (
            <TimeframeButton key={period} period={period} />
          ))}
        </div>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#666" />
            <YAxis stroke="#666" />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
