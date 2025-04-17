
import { supabase } from "@/integrations/supabase/client";
import { SolscanResponse, StakeAccount } from "@/types/solana";
import { Database } from "@/integrations/supabase/types";

const SOLSCAN_API_URL = 'https://pro-api.solscan.io/v2.0/account/stake';

// To use this key properly, make sure you've set the SOLSCAN_API_KEY in your Supabase project secrets
const SOLSCAN_API_KEY = "your-solscan-api-key"; // Replace with your actual Solscan API key

export const fetchStakeAccounts = async (address: string): Promise<SolscanResponse> => {
  // Add query parameters for pagination
  const url = new URL(SOLSCAN_API_URL);
  url.searchParams.append('address', address);

  console.log('Fetching stake accounts with URL:', url.toString());
  
  const response = await fetch(url.toString(), {
    headers: {
      'token': SOLSCAN_API_KEY,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Failed to fetch stake accounts: ${response.status} ${response.statusText}`, errorText);
    throw new Error(`Failed to fetch stake accounts: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  console.log('Successfully fetched stake accounts:', data);

  // Store fetched stake accounts in Supabase
  if (data.data && data.data.length > 0) {
    await storeStakeAccounts(address, data.data);
  }

  return data;
};

// Helper function to map status to enum
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
      return 'inactive'; // Default to inactive if status is not recognized
  }
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

  // Prepare stake accounts for insertion with proper status mapping
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
