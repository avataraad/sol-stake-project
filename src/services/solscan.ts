import { supabase } from "@/integrations/supabase/client";
import { SolscanResponse, StakeAccount } from "@/types/solana";
import { Database } from "@/integrations/supabase/types";

const SOLSCAN_API_URL = 'https://pro-api.solscan.io/v2.0/account/stake';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second delay between retries

// Add your Solscan API token here
const SOLSCAN_API_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOjE3NDQ4Mzc3MTcyODksImVtYWlsIjoiZXJpYy5rdWhuQGdlbWluaS5jb20iLCJhY3Rpb24iOiJ0b2tlbi1hcGkiLCJhcGlWZXJzaW9uIjoidjIiLCJpYXQiOjE3NDQ4Mzc3MTd9.jrnAu5QlIHFbkjIiBIKEpFronu7cub9HbUNGJZc7e8M";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchStakeAccounts = async (address: string, page = 1, pageSize = 40): Promise<SolscanResponse> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const url = new URL(SOLSCAN_API_URL);
      url.searchParams.append('address', address);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('page_size', pageSize.toString());

      console.log(`Fetching stake accounts for page ${page} (Attempt ${attempt}/${MAX_RETRIES})`);
      
      const requestOptions = {
        method: 'GET',
        headers: {
          'token': SOLSCAN_API_TOKEN
        }
      };
      
      const response = await fetch(url.toString(), requestOptions);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch stake accounts: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log(`Successfully fetched stake accounts for page ${page}`);
      
      return data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error occurred');
      console.error(`Error fetching stake accounts page ${page} (Attempt ${attempt}/${MAX_RETRIES}):`, error);
      
      if (attempt < MAX_RETRIES) {
        await delay(RETRY_DELAY);
        continue;
      }
    }
  }
  
  throw new Error(`Failed to fetch stake accounts after ${MAX_RETRIES} attempts: ${lastError?.message}`);
};

export const fetchAllStakeAccountPages = async (address: string): Promise<StakeAccount[]> => {
  let currentPage = 1;
  let allAccounts: StakeAccount[] = [];
  let hasMorePages = true;
  const pageSize = 40; // Using maximum allowed page size
  
  console.log('Starting to fetch all stake account pages');
  
  try {
    while (hasMorePages) {
      console.log(`Fetching stake accounts page ${currentPage}`);
      const response = await fetchStakeAccounts(address, currentPage, pageSize);
      
      if (response.data && response.data.length > 0) {
        console.log(`Received ${response.data.length} accounts from page ${currentPage}`);
        allAccounts = [...allAccounts, ...response.data];
        
        // Check if there are more pages based on the response metadata
        if (response.metadata && response.metadata.hasNextPage === true) {
          currentPage++;
          console.log(`More pages available, moving to page ${currentPage}`);
        } else {
          hasMorePages = false;
          console.log('No more pages available - metadata indicates last page');
        }
      } else {
        // No data or empty array, stop pagination
        hasMorePages = false;
        console.log('No data received or empty array, stopping pagination');
      }
    }
    
    console.log(`Total stake accounts fetched across all pages: ${allAccounts.length}`);
    
    // Try to store all fetched accounts in Supabase
    if (allAccounts.length > 0) {
      try {
        await storeStakeAccounts(address, allAccounts);
        console.log(`Successfully stored ${allAccounts.length} stake accounts in Supabase`);
      } catch (error) {
        console.warn('Error storing stake accounts in Supabase (RLS policy may be restricting access):', error);
        console.info('Continuing with API response data without storing in database');
      }
    }
    
    return allAccounts;
  } catch (error) {
    console.error('Error in fetchAllStakeAccountPages:', error);
    throw error;
  }
};

export const fetchWalletPortfolio = async (address: string): Promise<SolscanPortfolioResponse> => {
  const url = new URL('https://pro-api.solscan.io/v2.0/account/portfolio');
  url.searchParams.append('address', address);

  const requestOptions = {
    method: 'GET',
    headers: {
      'token': SOLSCAN_API_TOKEN
    }
  };

  const response = await fetch(url.toString(), requestOptions);
  if (!response.ok) {
    throw new Error('Failed to fetch wallet portfolio');
  }

  return response.json();
};

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
