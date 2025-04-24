
import { fetchRewardsForStakeAccount } from './rewardService';
import { StakeAccount } from '@/types/solana';

/**
 * Aggregates rewards for all stake accounts.
 * Groups reward amounts by the compound key "Epoch|Effective Time".
 *
 * @returns A promise that resolves to an object where each key is "Epoch|Effective Time" and its value is the summed reward.
 */
export async function aggregateAllRewards(stakeAccounts: StakeAccount[]) {
  const aggregatedRewards: { [key: string]: number } = {};
  console.log(`Starting reward aggregation for ${stakeAccounts.length} stake accounts`);

  // Track accounts with successful fetches
  let successfulFetches = 0;
  let failedFetches = 0;
  let totalRewardRecords = 0;

  // Find appropriate field names based on first successful fetch
  let epochFieldName: string | null = null;
  let timeFieldName: string | null = null;
  let rewardFieldName: string | null = null;

  // Process accounts sequentially to help with debugging
  for (const account of stakeAccounts) {
    try {
      console.log(`Processing account ${account.stake_account.substring(0, 8)}...`);
      const rewards = await fetchRewardsForStakeAccount(account.stake_account);
      
      if (rewards.length > 0) {
        successfulFetches++;
        totalRewardRecords += rewards.length;
        
        // If this is our first successful fetch, determine field names
        if (!epochFieldName || !timeFieldName || !rewardFieldName) {
          const firstRecord = rewards[0];
          console.log('First successful record keys:', Object.keys(firstRecord));
          
          // Try to find field names that match what we're looking for
          epochFieldName = Object.keys(firstRecord).find(key => 
            key === 'Epoch' || key.toLowerCase() === 'epoch');
          
          timeFieldName = Object.keys(firstRecord).find(key => 
            key === 'Effective Time' || key.toLowerCase().includes('time'));
          
          rewardFieldName = Object.keys(firstRecord).find(key => 
            key === 'Reward Amount' || key.toLowerCase().includes('reward'));
          
          console.log(`Determined field names: Epoch=${epochFieldName}, Time=${timeFieldName}, Reward=${rewardFieldName}`);
          
          if (!epochFieldName || !timeFieldName || !rewardFieldName) {
            console.error('Could not determine all required field names from response:', firstRecord);
          }
        }
        
        rewards.forEach((record, recordIndex) => {
          if (recordIndex === 0) {
            console.log(`Example record from account ${account.stake_account.substring(0, 8)}...`, record);
          }
          
          // Skip records with missing fields
          if (!epochFieldName || !record[epochFieldName] || 
              !timeFieldName || !record[timeFieldName] || 
              !rewardFieldName) {
            console.warn('Record missing expected fields:', record);
            return;
          }
          
          const epoch = record[epochFieldName];
          const effectiveTime = record[timeFieldName];
          const key = `${epoch}|${effectiveTime}`;
          
          if (!aggregatedRewards[key]) {
            aggregatedRewards[key] = 0;
          }
          
          // Add better handling for the reward amount
          const rewardAmount = parseFloat(record[rewardFieldName] || '0');
          if (isNaN(rewardAmount)) {
            console.warn(`Invalid reward amount in record:`, record[rewardFieldName]);
          } else {
            aggregatedRewards[key] += rewardAmount;
          }
        });
      } else {
        failedFetches++;
        console.log(`No reward data found for account ${account.stake_account}`);
      }
    } catch (error) {
      failedFetches++;
      console.error(`Error processing account ${account.stake_account}:`, error);
    }
  }

  console.log(`Completed aggregation with:
  - ${Object.keys(aggregatedRewards).length} unique epoch/time combinations
  - ${successfulFetches} accounts with reward data
  - ${failedFetches} accounts with no data or errors
  - ${totalRewardRecords} total reward records processed`);
  
  // Log a sample of the aggregated data
  const sampleKeys = Object.keys(aggregatedRewards).slice(0, 3);
  if (sampleKeys.length > 0) {
    console.log('Sample of aggregated rewards:');
    sampleKeys.forEach(key => {
      console.log(`  ${key}: ${aggregatedRewards[key]}`);
    });
  } else {
    console.log('No reward data was aggregated. Check API responses and field mappings.');
  }
  
  return aggregatedRewards;
}
