
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import RewardsHistoryChart from './RewardsHistoryChart';
import { useStakeAccounts } from '@/hooks/useStakeAccounts';

const dummyChartData = Array.from({ length: 30 }, (_, i) => ({
  name: `Day ${30 - i}`,
  value: 0,
}));

const StakingCharts = () => {
  const { allStakeAccounts } = useStakeAccounts();

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="chart-card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold">Staked Balance (30 days)</h3>
          <div className="flex gap-2">
            {["1W", "1M", "3M", "1Y"].map((period) => (
              <button
                key={period}
                className="px-3 py-1 text-sm rounded-md hover:bg-white/5"
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dummyChartData}>
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

      <RewardsHistoryChart stakeAccounts={allStakeAccounts} />
    </div>
  );
};

export default StakingCharts;
