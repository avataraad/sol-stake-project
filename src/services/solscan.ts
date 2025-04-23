
import { supabase } from "@/integrations/supabase/client";
import { SolscanResponse, StakeAccount } from "@/types/solana";
import { Database } from "@/integrations/supabase/types";

const SOLSCAN_API_URL = 'https://pro-api.solscan.io/v2.0/account/stake';

// Add your Solscan API token here
const SOLSCAN_API_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOjE3NDQ4Mzc3MTcyODksImVtYWlsIjoiZXJpYy5rdWhuQGdlbWluaS5jb20iLCJhY3Rpb24iOiJ0b2tlbi1hcGkiLCJhcGlWZXJzaW9uIjoidjIiLCJpYXQiOjE3NDQ4Mzc3MTd9.jrnAu5QlIHFbkjIiBIKEpFronu7cub9HbUNGJZc7e8M";

export const fetchStakeAccounts = async (address: string, page = 1, pageSize = 10): Promise<SolscanResponse> => {
  // Add query parameters for pagination
  const url = new URL(SOLSCAN_API_URL);
  url.searchParams.append('address', address);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('page_size', pageSize.toString());

  console.log(`Fetching stake accounts for page ${page} with URL:`, url.toString());
  
  const requestOptions = {
    method: 'GET',
    headers: {
      'token': SOLSCAN_API_TOKEN
    }
  };
  
  try {
    // Set a timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url.toString(), {
      ...requestOptions,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId); // Clear timeout if request completes

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch stake accounts: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Failed to fetch stake accounts: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log(`Successfully fetched stake accounts for page ${page}:`, {
      page,
      dataLength: data.data?.length || 0,
      hasNextPage: data.metadata?.hasNextPage,
      nextPage: data.metadata?.nextPage,
      totalItems: data.metadata?.totalItems
    });

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`Request timeout for page ${page}`);
      throw new Error(`Request timeout for page ${page}`);
    }
    console.error(`Error fetching stake accounts page ${page}:`, error);
    throw error;
  }
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
  try {
    // Delete existing stake accounts for this wallet before inserting new ones
    const { error: deleteError } = await supabase
      .from('stake_accounts')
      .delete()
      .eq('wallet_address', walletAddress);

    if (deleteError) {
      console.error('Error deleting existing stake accounts:', deleteError);
      throw deleteError;
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
      throw error;
    }
  } catch (error) {
    // Re-throw the error to be caught by the calling function
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
