
import { supabase } from "@/integrations/supabase/client";
import { SolscanResponse, StakeAccount } from "@/types/solana";

const SOLSCAN_API_URL = 'https://pro-api.solscan.io/v2.0/account/stake';

export const fetchStakeAccounts = async (address: string): Promise<SolscanResponse> => {
  const response = await fetch(`${SOLSCAN_API_URL}?address=${address}`, {
    headers: {
      'token': import.meta.env.VITE_SOLSCAN_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch stake accounts');
  }

  const data = await response.json();

  // Store fetched stake accounts in Supabase
  await storeStakeAccounts(address, data.data);

  return data;
};

const storeStakeAccounts = async (walletAddress: string, accounts: StakeAccount[]) => {
  // Delete existing stake accounts for this wallet before inserting new ones
  const { error: deleteError } = await supabase
    .from('stake_accounts')
    .delete()
    .eq('wallet_address', walletAddress);

  if (deleteError) {
    console.error('Error deleting existing stake accounts:', deleteError);
  }

  // Prepare stake accounts for insertion
  const stakeAccountsToInsert = accounts.map(account => ({
    wallet_address: walletAddress,
    stake_account: account.stake_account,
    sol_balance: account.sol_balance,
    status: account.status.toLowerCase(),
    delegated_stake_amount: account.delegated_stake_amount,
    total_reward: account.total_reward,
    voter: account.voter,
    type: account.type,
    active_stake_amount: account.active_stake_amount,
    activation_epoch: account.activation_epoch,
    role: account.role
  }));

  // Insert new stake accounts
  const { error } = await supabase
    .from('stake_accounts')
    .insert(stakeAccountsToInsert);

  if (error) {
    console.error('Error storing stake accounts:', error);
  }
};

export const getStoredStakeAccounts = async (walletAddress: string) => {
  const { data, error } = await supabase
    .from('stake_accounts')
    .select('*')
    .eq('wallet_address', walletAddress);

  if (error) {
    console.error('Error retrieving stake accounts:', error);
    return [];
  }

  return data;
};
