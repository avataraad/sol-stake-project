
import { supabase } from '@/integrations/supabase/client';
import { RewardEntry } from '@/types/solana';

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || 'demo';
const ALCHEMY_RPC_URL = `https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

export async function fetchRewards() {
  try {
    console.log('Starting the reward fetching process...');
    
    // 1. Read all stake account addresses from the stake_accounts table
    const { data: stakeAccounts, error: fetchError } = await supabase
      .from('stake_accounts')
      .select('stake_account')
      .order('stake_account');

    if (fetchError) {
      console.error('Error fetching stake accounts:', fetchError);
      throw new Error('Failed to fetch stake accounts');
    }

    if (!stakeAccounts || stakeAccounts.length === 0) {
      console.log('No stake accounts found');
      return { processed: 0, message: 'No stake accounts found' };
    }

    const stakeAddresses = stakeAccounts.map(account => account.stake_account);
    console.log(`Found ${stakeAddresses.length} stake accounts, fetching rewards...`);

    // 2. Call Alchemy's getInflationReward endpoint with all addresses at once
    const rewardsResponse = await fetch(ALCHEMY_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'getInflationReward',
        params: [stakeAddresses],
      }),
    });

    if (!rewardsResponse.ok) {
      const errorText = await rewardsResponse.text();
      console.error('Alchemy API error:', errorText);
      throw new Error('Failed to fetch rewards from Alchemy API');
    }

    const rewardsData = await rewardsResponse.json();
    const rewards = rewardsData.result;

    if (!rewards || !Array.isArray(rewards)) {
      console.error('Invalid response from Alchemy:', rewardsData);
      throw new Error('Invalid response from Alchemy API');
    }

    // 3. Filter out null entries and map to reward objects
    const validRewards: RewardEntry[] = rewards
      .map((reward, index) => {
        if (!reward) return null;
        return {
          stake_account: stakeAddresses[index],
          epoch: reward.epoch,
          effective_slot: reward.effectiveSlot,
          amount: reward.amount,
          commission: reward.commission || 0,
          post_balance: reward.postBalance,
          timestamp: new Date().toISOString(), // Temporary timestamp, will be updated later
        };
      })
      .filter((reward): reward is RewardEntry => reward !== null);

    if (validRewards.length === 0) {
      console.log('No valid rewards found');
      return { processed: 0, message: 'No valid rewards found' };
    }

    console.log(`Processing ${validRewards.length} valid rewards...`);

    // 4. Upsert all rewards in one go
    const { error: upsertError } = await supabase
      .from('rewards')
      .upsert(validRewards, {
        onConflict: 'stake_account,epoch', // Use the unique constraint
        ignoreDuplicates: false, // Update existing records
      });

    if (upsertError) {
      console.error('Error upserting rewards:', upsertError);
      throw new Error('Failed to store rewards');
    }

    // 5. Update timestamps for each reward by fetching block times
    for (const reward of validRewards) {
      try {
        console.log(`Fetching block time for slot ${reward.effective_slot}...`);
        // Get block time from Alchemy API
        const blockTimeResponse = await fetch(ALCHEMY_RPC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: 1,
            jsonrpc: '2.0',
            method: 'getBlockTime',
            params: [reward.effective_slot],
          }),
        });

        if (!blockTimeResponse.ok) {
          console.error(`Failed to get block time for slot ${reward.effective_slot}`);
          continue;
        }

        const blockTimeData = await blockTimeResponse.json();
        const timestamp = blockTimeData.result;

        if (!timestamp) {
          console.error(`No timestamp returned for slot ${reward.effective_slot}`);
          continue;
        }

        // Convert Unix timestamp to ISO string
        const timestampISO = new Date(timestamp * 1000).toISOString();
        console.log(`Got timestamp ${timestampISO} for slot ${reward.effective_slot}`);

        // Update the reward's timestamp
        const { error: updateError } = await supabase
          .from('rewards')
          .update({ timestamp: timestampISO })
          .eq('stake_account', reward.stake_account)
          .eq('epoch', reward.epoch);

        if (updateError) {
          console.error(`Failed to update timestamp for reward ${reward.stake_account} epoch ${reward.epoch}:`, updateError);
        }
      } catch (error) {
        console.error(`Error updating timestamp for reward ${reward.stake_account} epoch ${reward.epoch}:`, error);
      }
    }

    // 6. Return summary
    console.log(`Successfully processed ${validRewards.length} rewards`);
    return { 
      processed: validRewards.length,
      message: `Successfully processed ${validRewards.length} rewards`
    };
  } catch (error) {
    console.error('Unexpected error in fetchRewards function:', error);
    throw error;
  }
}
