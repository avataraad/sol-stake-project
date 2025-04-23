
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

  await Promise.all(
    stakeAccounts.map(async (account) => {
      try {
        console.log(`Processing account ${account.stake_account}`);
        const rewards = await fetchRewardsForStakeAccount(account.stake_account);
        rewards.forEach((record) => {
          const key = `${record['Epoch']}|${record['Effective Time']}`;
          if (!aggregatedRewards[key]) {
            aggregatedRewards[key] = 0;
          }
          aggregatedRewards[key] += record['Reward Amount'] || 0;
        });
      } catch (error) {
        console.error(`Error processing account ${account.stake_account}:`, error);
      }
    })
  );

  console.log(`Completed aggregation with ${Object.keys(aggregatedRewards).length} unique epoch/time combinations`);
  return aggregatedRewards;
}
