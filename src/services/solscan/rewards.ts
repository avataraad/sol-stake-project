
import { supabase } from "@/integrations/supabase/client";
import { RewardEntry } from "@/types/solana";

/**
 * Store reward data for a stake account in the database
 */
export const storeRewards = async (rewards: RewardEntry[]): Promise<void> => {
  try {
    if (!rewards.length) {
      console.log('No rewards to store');
      return;
    }
    
    console.log(`Storing ${rewards.length} rewards`);
    
    const { error } = await supabase
      .from('rewards')
      .upsert(rewards, {
        onConflict: 'stake_account,epoch',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error('Error storing rewards:', error);
      throw error;
    }
  } catch (error) {
    console.error('Exception storing rewards:', error);
    throw error;
  }
};

/**
 * Get rewards for a specific stake account
 */
export const getRewardsForStakeAccount = async (
  stakeAccount: string,
  limit: number = 10,
  offset: number = 0
): Promise<RewardEntry[]> => {
  try {
    console.log(`Fetching rewards for stake account: ${stakeAccount}`);
    
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('stake_account', stakeAccount)
      .order('epoch', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching rewards:', error);
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error('Exception fetching rewards:', err);
    return [];
  }
};

/**
 * Get all rewards for a wallet (aggregated across all stake accounts)
 */
export const getRewardsForWallet = async (
  stakeAccounts: string[],
  limit: number = 50,
  offset: number = 0
): Promise<RewardEntry[]> => {
  if (!stakeAccounts.length) {
    return [];
  }

  try {
    console.log(`Fetching rewards for ${stakeAccounts.length} stake accounts`);
    
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .in('stake_account', stakeAccounts)
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching rewards for wallet:', error);
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error('Exception fetching rewards for wallet:', err);
    return [];
  }
};

/**
 * Get total rewards earned for a collection of stake accounts 
 * in the specified time period
 */
export const getRewardsInPeriod = async (
  stakeAccounts: string[],
  startDate: Date,
  endDate: Date
): Promise<number> => {
  if (!stakeAccounts.length) {
    return 0;
  }

  try {
    console.log(`Fetching rewards between ${startDate.toISOString()} and ${endDate.toISOString()}`);
    
    const { data, error } = await supabase
      .from('rewards')
      .select('amount')
      .in('stake_account', stakeAccounts)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString());

    if (error) {
      console.error('Error fetching period rewards:', error);
      throw error;
    }

    // Sum all reward amounts
    const totalAmount = (data || []).reduce((sum, reward) => {
      return sum + Number(reward.amount || 0);
    }, 0);

    return totalAmount;
  } catch (err) {
    console.error('Exception fetching period rewards:', err);
    return 0;
  }
};
