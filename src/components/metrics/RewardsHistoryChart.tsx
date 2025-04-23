
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { aggregateAllRewards } from '@/services/solscan/rewardAggregator';
import { StakeAccount } from '@/types/solana';

interface RewardData {
  epoch: number;
  effectiveTime: string;
  reward: number;
}

interface RewardsHistoryChartProps {
  stakeAccounts: StakeAccount[];
}

const RewardsHistoryChart: React.FC<RewardsHistoryChartProps> = ({ stakeAccounts }) => {
  const [rewardHistoryData, setRewardHistoryData] = useState<RewardData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!stakeAccounts.length) {
        console.log('No stake accounts available, skipping rewards fetch');
        setLoading(false);
        return;
      }

      try {
        console.log(`Fetching rewards for ${stakeAccounts.length} stake accounts`);
        const aggregated = await aggregateAllRewards(stakeAccounts);
        console.log('Aggregated rewards data:', aggregated);
        
        const data: RewardData[] = Object.keys(aggregated).map((key) => {
          const [epoch, effectiveTime] = key.split('|');
          return {
            epoch: parseInt(epoch, 10),
            effectiveTime,
            reward: aggregated[key]
          };
        });
        
        // Sort the data by effective time.
        data.sort(
          (a, b) =>
            new Date(a.effectiveTime).getTime() - new Date(b.effectiveTime).getTime()
        );
        
        console.log(`Transformed data for chart: ${data.length} points`, data);
        setRewardHistoryData(data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching aggregated rewards:', err);
        setError('Failed to load rewards data.');
        setLoading(false);
      }
    }
    fetchData();
  }, [stakeAccounts]);

  if (loading) return <div>Loading Rewards History...</div>;
  if (error) return <div>{error}</div>;
  if (!rewardHistoryData.length) return <div>No rewards data available.</div>;

  return (
    <div className="chart-card">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold">Rewards History by Date</h3>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rewardHistoryData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="effectiveTime"
              stroke="#666"
              tickFormatter={(timeStr: string) =>
                new Date(timeStr).toLocaleDateString()
              }
            />
            <YAxis stroke="#666" />
            <Tooltip
              labelFormatter={(label) => new Date(label).toLocaleString()}
              formatter={(value: number) => [`Reward: ${value.toFixed(4)} SOL`, '']}
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
      </div>
    </div>
  );
};

export default RewardsHistoryChart;
