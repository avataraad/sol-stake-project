
import { StakeAccount } from '@/types/solana';
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

const mapStakeAccountStatus = (status: string): Database["public"]["Enums"]["stake_account_status"] => {
  const loweredStatus = status.toLowerCase();
  switch (loweredStatus) {
    case 'active':
      return 'active';
    case 'inactive':
      return 'inactive';
    case 'deactivating':
      return 'deactivating';
    case 'activating':
      return 'activating';
    default:
      return 'inactive';
  }
};

export const storeStakeAccounts = async (walletAddress: string, accounts: StakeAccount[]) => {
  try {
    const { error: deleteError } = await supabase
      .from('stake_accounts')
      .delete()
      .eq('wallet_address', walletAddress);

    if (deleteError) {
      console.error('Error deleting existing stake accounts:', deleteError);
      throw deleteError;
    }

    const stakeAccountsToInsert = accounts.map(account => ({
      wallet_address: walletAddress,
      stake_account: account.stake_account,
      sol_balance: account.sol_balance,
      status: mapStakeAccountStatus(account.status),
      delegated_stake_amount: account.delegated_stake_amount,
      total_reward: account.total_reward,
      voter: account.voter,
      type: account.type,
      active_stake_amount: account.active_stake_amount,
      activation_epoch: account.activation_epoch,
      role: account.role
    }));

    const { error } = await supabase
      .from('stake_accounts')
      .insert(stakeAccountsToInsert);

    if (error) {
      console.error('Error storing stake accounts:', error);
      throw error;
    }
  } catch (error) {
    throw error;
  }
};

export const getStoredStakeAccounts = async (walletAddress: string) => {
  try {
    const { data, error } = await supabase
      .from('stake_accounts')
      .select('*')
      .eq('wallet_address', walletAddress);

    if (error) {
      console.error('Error retrieving stake accounts:', error);
      return [];
    }

    return data;
  } catch (err) {
    console.error('Exception retrieving stake accounts:', err);
    return [];
  }
};
