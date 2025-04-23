
import { SOLSCAN_API_URL, SOLSCAN_API_TOKEN, MAX_RETRIES, RETRY_DELAY } from './config';
import { delay, handleApiResponse, getRequestOptions } from './utils';

interface RewardDataPoint {
  date: string;
  reward: number;
}

export interface RewardsHistory {
  totalRewards: number;
  dataPoints: RewardDataPoint[];
}

export const fetchStakeAccountRewards = async (stakeAccount: string): Promise<RewardsHistory> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const url = new URL(`${SOLSCAN_API_URL}/account/reward/export`);
      url.searchParams.append('account', stakeAccount);
      
      console.log(`Fetching rewards for stake account ${stakeAccount} (Attempt ${attempt}/${MAX_RETRIES})`);
      
      const response = await fetch(url.toString(), getRequestOptions(SOLSCAN_API_TOKEN));
      const csvData = await response.text();
      
      // Parse CSV data (format: date,reward)
      const rows = csvData.trim().split('\n').slice(1); // Skip header row
      const dataPoints: RewardDataPoint[] = rows.map(row => {
        const [date, rewardStr] = row.split(',');
        return {
          date,
          reward: parseFloat(rewardStr) || 0
        };
      });
      
      const totalRewards = dataPoints.reduce((sum, point) => sum + point.reward, 0);
      
      return {
        totalRewards,
        dataPoints: dataPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error occurred');
      console.error(`Error fetching rewards for stake account ${stakeAccount} (Attempt ${attempt}/${MAX_RETRIES}):`, error);
      
      if (attempt < MAX_RETRIES) {
        await delay(RETRY_DELAY);
        continue;
      }
    }
  }
  
  throw new Error(`Failed to fetch rewards after ${MAX_RETRIES} attempts: ${lastError?.message}`);
};
