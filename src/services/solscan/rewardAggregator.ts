
import { fetchRewardsForStakeAccount } from './rewardService';
import { fetchStakeAccounts } from './stakeAccounts';

/**
 * Aggregates rewards for all stake accounts.
 * Groups and sums reward amounts by the compound key of "Epoch|Effective Time".
 */
export async function aggregateAllRewards(address: string) {
  const aggregatedRewards: { [key: string]: number } = {};

  try {
    const response = await fetchStakeAccounts(address);
    const accounts = response.data || [];

    await Promise.all(
      accounts.map(async (account) => {
        try {
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

    return aggregatedRewards;
  } catch (error) {
    console.error('Error fetching stake accounts:', error);
    throw error;
  }
}
