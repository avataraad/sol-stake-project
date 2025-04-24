
import { StakeAccount } from '@/types/solana';
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "@/components/ui/use-toast";

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
    console.log(`Starting to store ${accounts.length} stake accounts for wallet ${walletAddress}`);
    
    // Delete existing accounts first to avoid duplicates
    console.log(`Deleting existing stake accounts for wallet ${walletAddress}`);
    const { error: deleteError } = await supabase
      .from('stake_accounts')
      .delete()
      .eq('wallet_address', walletAddress);

    if (deleteError) {
      console.error('Error deleting existing stake accounts:', deleteError);
      throw deleteError;
    }
    
    console.log('Successfully deleted existing stake accounts, preparing new data for insertion');

    // Prepare accounts data
    const stakeAccountsToInsert = accounts.map(account => {
      console.log(`Processing account ${account.stake_account.substring(0, 8)}...`);
      return {
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
      };
    });

    // Insert accounts in batches of 100 to avoid potential payload size issues
    const batchSize = 100;
    for (let i = 0; i < stakeAccountsToInsert.length; i += batchSize) {
      const batch = stakeAccountsToInsert.slice(i, i + batchSize);
      console.log(`Inserting batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(stakeAccountsToInsert.length/batchSize)}, size: ${batch.length}`);
      
      const { error: insertError } = await supabase
        .from('stake_accounts')
        .insert(batch);

      if (insertError) {
        console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, insertError);
        throw insertError;
      }
      console.log(`Successfully inserted batch ${Math.floor(i/batchSize) + 1}`);
    }

    console.log(`Successfully stored all ${accounts.length} stake accounts for wallet ${walletAddress}`);
    
    toast({
      title: "Success",
      description: `Stored ${accounts.length} stake accounts in database`,
    });

  } catch (error) {
    console.error('Error storing stake accounts:', error);
    toast({
      title: "Error",
      description: "Failed to store stake accounts in database",
      variant: "destructive",
    });
    throw error;
  }
};

export const getStoredStakeAccounts = async (walletAddress: string): Promise<StakeAccount[]> => {
  try {
    console.log(`Fetching stored stake accounts for wallet ${walletAddress}`);
    
    const { data, error } = await supabase
      .from('stake_accounts')
      .select()
      .eq('wallet_address', walletAddress);

    if (error) {
      console.error('Error retrieving stake accounts:', error);
      toast({
        title: "Error",
        description: "Failed to retrieve stake accounts from database",
        variant: "destructive",
      });
      return [];
    }

    console.log(`Retrieved ${data?.length || 0} stake accounts from database`);
    return data as StakeAccount[];
  } catch (err) {
    console.error('Exception retrieving stake accounts:', err);
    toast({
      title: "Error",
      description: "Failed to retrieve stake accounts from database",
      variant: "destructive",
    });
    return [];
  }
};
