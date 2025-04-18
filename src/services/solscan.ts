
import { supabase } from "@/integrations/supabase/client";
import { SolscanResponse, StakeAccount } from "@/types/solana";
import { Database } from "@/integrations/supabase/types";

const SOLSCAN_API_URL = 'https://pro-api.solscan.io/v2.0/account/stake';
const SOLSCAN_API_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOjE3NDQ4Mzc3MTcyODksImVtYWlsIjoiZXJpYy5rdWhuQGdlbWluaS5jb20iLCJhY3Rpb24iOiJ0b2tlbi1hcGkiLCJhcGlWZXJzaW9uIjoidjIiLCJpYXQiOjE3NDQ4Mzc3MTd9.jrnAu5QlIHFbkjIiBIKEpFronu7cub9HbUNGJZc7e8M";

export const fetchStakeAccounts = async (address: string, page = 1): Promise<SolscanResponse> => {
  // Always set page_size to 40
  const pageSize = 40;

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
    const response = await fetch(url.toString(), requestOptions);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch stake accounts: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Failed to fetch stake accounts: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log(`Successfully fetched stake accounts for page ${page}:`, {
      page,
      dataLength: data.data?.length || 0
    });

    return data;
  } catch (error) {
    console.error(`Error fetching stake accounts page ${page}:`, error);
    throw error;
  }
};

// Helper function to fetch all pages of stake accounts
export const fetchAllStakeAccountPages = async (address: string): Promise<StakeAccount[]> => {
  let currentPage = 1;
  const pageSize = 40; // Fixed page size as per API limit
  let hasMorePages = true;
  
  console.log('Starting to fetch all stake account pages');
  
  try {
    // First, clear existing stake accounts for this wallet
    const { error: deleteError } = await supabase
      .from('stake_accounts')
      .delete()
      .eq('wallet_address', address);

    if (deleteError) {
      console.error('Error deleting existing stake accounts:', deleteError);
      throw deleteError;
    }

    while (hasMorePages) {
      console.log(`Fetching stake accounts page ${currentPage}`);
      // Updated: Only passing address and page as parameters (removed pageSize)
      const response = await fetchStakeAccounts(address, currentPage);
      
      if (response.data && response.data.length > 0) {
        console.log(`Processing ${response.data.length} accounts from page ${currentPage}`);
        
        // Map and store current page of accounts
        const stakeAccountsToInsert = response.data.map(account => ({
          wallet_address: address,
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

        // Insert this page's accounts into database
        const { error: insertError } = await supabase
          .from('stake_accounts')
          .insert(stakeAccountsToInsert);

        if (insertError) {
          console.error(`Error storing stake accounts for page ${currentPage}:`, insertError);
          throw insertError;
        }

        console.log(`Successfully stored ${stakeAccountsToInsert.length} accounts from page ${currentPage}`);
        currentPage++; // Move to next page
      } else {
        // No more data received, stop pagination
        hasMorePages = false;
        console.log('No more data received, stopping pagination');
      }
    }
    
    // Retrieve all stored accounts
    const { data: allStoredAccounts, error: fetchError } = await supabase
      .from('stake_accounts')
      .select('*')
      .eq('wallet_address', address);

    if (fetchError) {
      console.error('Error retrieving stored stake accounts:', fetchError);
      throw fetchError;
    }

    console.log(`Total stake accounts stored and retrieved: ${allStoredAccounts?.length || 0}`);
    return allStoredAccounts as StakeAccount[] || [];
    
  } catch (error) {
    console.error('Error in fetchAllStakeAccountPages:', error);
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
