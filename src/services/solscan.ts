
import { supabase } from "@/integrations/supabase/client";
import { SolscanResponse, StakeAccount } from "@/types/solana";

const SOLSCAN_API_URL = 'https://pro-api.solscan.io/v2.0/account/stake';

export const fetchStakeAccounts = async (address: string): Promise<SolscanResponse> => {
  // Get the API key from Supabase secrets
  const { data: secretData, error: secretError } = await supabase
    .from('_secrets')
    .select('value')
    .eq('name', 'SOLSCAN_API_KEY')
    .single();
  
  if (secretError) {
    console.error('Error fetching Solscan API key:', secretError);
    throw new Error('Failed to fetch API key');
  }

  const apiKey = secretData?.value;
  
  if (!apiKey) {
    console.error('Solscan API key is not set');
    throw new Error('Solscan API key is not configured');
  }

  // Add query parameters for pagination
  const url = new URL(SOLSCAN_API_URL);
  url.searchParams.append('address', address);

  console.log('Fetching stake accounts with URL:', url.toString());
  
  const response = await fetch(url.toString(), {
    headers: {
      'token': apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Failed to fetch stake accounts: ${response.status} ${response.statusText}`, errorText);
    throw new Error('Failed to fetch stake accounts');
  }

  const data = await response.json();
  console.log('Successfully fetched stake accounts:', data);

  // Store fetched stake accounts in Supabase
  await storeStakeAccounts(address, data.data);

  return data;
};

// Helper function to map status to enum
const mapStakeAccountStatus = (status: string): 'active' | 'inactive' | 'deactivating' | 'activating' => {
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
