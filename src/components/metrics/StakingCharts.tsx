
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { fetchStakeAccountRewards } from "@/services/solscan/rewards";
import { useStakeAccounts } from "@/hooks/useStakeAccounts";

const StakingCharts = () => {
  const [rewardsData, setRewardsData] = useState<{ date: string; reward: number }[]>([]);
  const { allStakeAccounts } = useStakeAccounts();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRewardsHistory = async () => {
      if (!allStakeAccounts.length) return;
      
      setIsLoading(true);
      try {
        // For now, we'll just get rewards for the first stake account
        const firstAccount = allStakeAccounts[0];
        if (firstAccount) {
          const history = await fetchStakeAccountRewards(firstAccount.stake_account);
          setRewardsData(history.dataPoints);
        }
      } catch (error) {
        console.error('Error fetching rewards history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRewardsHistory();
  }, [allStakeAccounts]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      <div className="chart-card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold">Rewards History (30 days)</h3>
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
            <LineChart data={rewardsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="date" 
                stroke="#666"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis stroke="#666" />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(4)} SOL`, 'Reward']}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Line
                type="monotone"
                dataKey="reward"
                stroke="#4ade80"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StakingCharts;
