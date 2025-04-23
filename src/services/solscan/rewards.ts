
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
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      
      const csvData = await response.text();
      console.log(`Received CSV data length: ${csvData.length} characters`);
      
      // Log a sample of the data to help debug
      if (csvData.length > 0) {
        const sampleData = csvData.split('\n').slice(0, Math.min(3, csvData.split('\n').length)).join('\n');
        console.log(`CSV data sample (first few lines):\n${sampleData}`);
      } else {
        console.log('Received empty CSV response');
      }
      
      // Parse CSV data (format: date,reward)
      const rows = csvData.trim().split('\n');
      
      if (rows.length <= 1) {
        console.log(`No reward data found for account ${stakeAccount} (only header row)`);
        return { totalRewards: 0, dataPoints: [] };
      }
      
      // Skip header row
      const dataRows = rows.slice(1);
      console.log(`Processing ${dataRows.length} data rows`);
      
      const dataPoints: RewardDataPoint[] = dataRows.map(row => {
        const [date, rewardStr] = row.split(',');
        const reward = parseFloat(rewardStr) || 0;
        return { date, reward };
      });
      
      const totalRewards = dataPoints.reduce((sum, point) => sum + point.reward, 0);
      console.log(`Total rewards for account ${stakeAccount}: ${totalRewards}`);
      
      // Sort by date (oldest to newest)
      const sortedDataPoints = dataPoints.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      return {
        totalRewards,
        dataPoints: sortedDataPoints
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error occurred');
      console.error(`Error fetching rewards for stake account ${stakeAccount} (Attempt ${attempt}/${MAX_RETRIES}):`, error);
      
      if (attempt < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY}ms...`);
        await delay(RETRY_DELAY);
        continue;
      }
    }
  }
  
  console.error(`Failed to fetch rewards after ${MAX_RETRIES} attempts for account ${stakeAccount}`);
  throw new Error(`Failed to fetch rewards after ${MAX_RETRIES} attempts: ${lastError?.message}`);
};
