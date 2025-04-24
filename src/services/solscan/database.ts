
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

// Batch size for processing stake accounts
const BATCH_SIZE = 100;

export const storeStakeAccounts = async (walletAddress: string, accounts: StakeAccount[]) => {
  try {
    // Only delete existing accounts once at the beginning of a wallet fetch
    // This way we don't delete accounts between pagination calls
    if (accounts.length > 0) {
      // Check if we already have accounts for this wallet
      const { data: existingAccounts, error: checkError } = await supabase
        .from('stake_accounts')
        .select('count(*)', { count: 'exact', head: true })
        .eq('wallet_address', walletAddress);

      // If this is the first page (i.e., no existing accounts found), delete any old records
      if (checkError) {
        console.error('Error checking existing stake accounts:', checkError);
      } else if (!existingAccounts || existingAccounts.length === 0) {
        console.log('No existing accounts found. Performing initial cleanup for wallet:', walletAddress);
        const { error: deleteError } = await supabase
          .from('stake_accounts')
          .delete()
          .eq('wallet_address', walletAddress);

        if (deleteError) {
          console.error('Error deleting existing stake accounts:', deleteError);
        }
      }
    }

    // Process accounts in batches to avoid large payloads
    for (let i = 0; i < accounts.length; i += BATCH_SIZE) {
      const batch = accounts.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      
      console.log(`Processing batch ${batchNumber} with ${batch.length} accounts`);
      
      const stakeAccountsToInsert = batch.map(account => ({
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
        console.error(`Error inserting batch ${batchNumber}:`, error);
        console.log('Error details:', JSON.stringify(error, null, 2));
        throw error;
      } else {
        console.log(`Successfully inserted batch ${batchNumber} with ${batch.length} accounts`);
      }
    }
    
    console.log(`Finished storing ${accounts.length} stake accounts for wallet ${walletAddress}`);
  } catch (error) {
    console.error('Error in storeStakeAccounts:', error);
    throw error;
  }
};

export const getStoredStakeAccounts = async (walletAddress: string) => {
  try {
    console.log(`Retrieving stored stake accounts for wallet: ${walletAddress}`);
    
    const { data, error, count } = await supabase
      .from('stake_accounts')
      .select('*', { count: 'exact' })
      .eq('wallet_address', walletAddress);

    if (error) {
      console.error('Error retrieving stake accounts:', error);
      return [];
    }

    console.log(`Retrieved ${count || data?.length || 0} stored stake accounts`);
    return data;
  } catch (err) {
    console.error('Exception retrieving stake accounts:', err);
    return [];
  }
};
