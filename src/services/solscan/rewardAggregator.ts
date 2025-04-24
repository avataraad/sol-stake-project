
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

  await Promise.all(
    stakeAccounts.map(async (account) => {
      try {
        console.log(`Processing account ${account.stake_account}`);
        const rewards = await fetchRewardsForStakeAccount(account.stake_account);
        
        if (rewards.length > 0) {
          successfulFetches++;
          totalRewardRecords += rewards.length;
          
          rewards.forEach((record) => {
            // Log the record structure to identify potential key mismatches
            if (successfulFetches === 1 && rewards.indexOf(record) === 0) {
              console.log('Example reward record structure:', Object.keys(record));
            }
            
            // Check if the expected fields exist in the record
            if (!record['Epoch'] || !record['Effective Time']) {
              console.warn('Record missing expected fields:', record);
              return;
            }
            
            const key = `${record['Epoch']}|${record['Effective Time']}`;
            if (!aggregatedRewards[key]) {
              aggregatedRewards[key] = 0;
            }
            
            // Add better handling for the reward amount
            const rewardAmount = parseFloat(record['Reward Amount'] || '0');
            if (isNaN(rewardAmount)) {
              console.warn(`Invalid reward amount in record:`, record['Reward Amount']);
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
    })
  );

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
  }
  
  return aggregatedRewards;
}
