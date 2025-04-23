
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, BarChart, Bar } from "recharts";
import { fetchStakeAccountRewards } from "@/services/solscan/rewards";
import { useStakeAccounts } from "@/hooks/useStakeAccounts";

// Define dummy data for the staked balance chart
const dummyChartData = [
  { name: "Apr 1", value: 24.2 },
  { name: "Apr 8", value: 25.1 },
  { name: "Apr 15", value: 26.3 },
  { name: "Apr 22", value: 27.8 },
  { name: "Apr 29", value: 29.1 },
  { name: "May 6", value: 28.6 },
  { name: "May 13", value: 30.2 },
];

const StakingCharts = () => {
  const [rewardsData, setRewardsData] = useState<{ date: string; reward: number }[]>([]);
  const { allStakeAccounts } = useStakeAccounts();
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedAccounts, setFetchedAccounts] = useState(0);
  const [totalAccounts, setTotalAccounts] = useState(0);

  useEffect(() => {
    const fetchRewardsHistory = async () => {
      if (!allStakeAccounts.length) {
        console.log("No stake accounts found");
        return;
      }
      
      setIsLoading(true);
      setTotalAccounts(allStakeAccounts.length);
      console.log(`Starting to fetch rewards for ${allStakeAccounts.length} stake accounts`);
      
      try {
        // Aggregate rewards data from all stake accounts
        const aggregatedRewards = new Map<string, number>();
        
        // Limit the number of accounts to process to avoid rate limiting
        // We can adjust this number based on API constraints
        const accountsToProcess = allStakeAccounts.slice(0, 10); // Process first 10 accounts
        
        console.log(`Processing ${accountsToProcess.length} stake accounts for reward history`);
        
        // Process accounts sequentially to avoid overwhelming the API
        for (const [index, account] of accountsToProcess.entries()) {
          try {
            console.log(`Fetching rewards for account ${index+1}/${accountsToProcess.length}: ${account.stake_account.substring(0, 8)}...`);
            
            const history = await fetchStakeAccountRewards(account.stake_account);
            console.log(`Received ${history.dataPoints.length} data points for account ${account.stake_account.substring(0, 8)}...`);
            
            if (history.dataPoints.length === 0) {
              console.log(`No reward data for account ${account.stake_account.substring(0, 8)}...`);
              continue;
            }
            
            // Log a sample of the data
            if (history.dataPoints.length > 0) {
              console.log(`Sample data point: ${JSON.stringify(history.dataPoints[0])}`);
            }
            
            // Aggregate rewards by date
            history.dataPoints.forEach(point => {
              const currentReward = aggregatedRewards.get(point.date) || 0;
              aggregatedRewards.set(point.date, currentReward + point.reward);
            });
            
            setFetchedAccounts(index + 1);
          } catch (error) {
            console.error(`Error fetching rewards for account ${account.stake_account.substring(0, 8)}...`, error);
          }
        }
        
        console.log(`Aggregated rewards for ${aggregatedRewards.size} unique dates`);
        
        // Convert Map to array and sort by date
        const aggregatedArray = Array.from(aggregatedRewards, ([date, reward]) => ({ date, reward }));
        aggregatedArray.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        console.log(`Final aggregated data: ${aggregatedArray.length} entries`);
        if (aggregatedArray.length > 0) {
          console.log(`First entry: ${JSON.stringify(aggregatedArray[0])}`);
          console.log(`Last entry: ${JSON.stringify(aggregatedArray[aggregatedArray.length - 1])}`);
        } else {
          console.log("No aggregated data available");
        }
        
        setRewardsData(aggregatedArray);
      } catch (error) {
        console.error('Error in overall rewards aggregation process:', error);
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

      <div className="chart-card relative">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold">Rewards History (Daily)</h3>
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
          {rewardsData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rewardsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="date" 
                  stroke="#666"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth()+1}/${date.getDate()}`;
                  }}
                />
                <YAxis stroke="#666" />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(4)} SOL`, 'Reward']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Bar
                  dataKey="reward"
                  fill="#4ade80"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              {isLoading ? "Loading rewards data..." : "No rewards data available"}
            </div>
          )}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
              <div className="text-sm text-muted-foreground">
                {fetchedAccounts > 0 ? 
                  `Loaded ${fetchedAccounts}/${totalAccounts} accounts` : 
                  "Loading rewards data..."}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StakingCharts;
