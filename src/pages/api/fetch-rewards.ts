
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/integrations/supabase/client';
import { RewardEntry } from '@/types/solana';

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || 'demo';
const ALCHEMY_RPC_URL = `https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed, use POST' });
  }

  try {
    // 1. Read all stake account addresses from the stake_accounts table
    const { data: stakeAccounts, error: fetchError } = await supabase
      .from('stake_accounts')
      .select('stake_account')
      .order('stake_account');

    if (fetchError) {
      console.error('Error fetching stake accounts:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch stake accounts' });
    }

    if (!stakeAccounts || stakeAccounts.length === 0) {
      return res.status(200).json({ processed: 0, message: 'No stake accounts found' });
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
      return res.status(500).json({ error: 'Failed to fetch rewards from Alchemy API' });
    }

    const rewardsData = await rewardsResponse.json();
    const rewards = rewardsData.result;

    if (!rewards || !Array.isArray(rewards)) {
      console.error('Invalid response from Alchemy:', rewardsData);
      return res.status(500).json({ error: 'Invalid response from Alchemy API' });
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
      return res.status(200).json({ processed: 0, message: 'No valid rewards found' });
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
      return res.status(500).json({ error: 'Failed to store rewards' });
    }

    // 5. Update timestamps for each reward by fetching block times
    for (const reward of validRewards) {
      try {
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
    return res.status(200).json({ 
      processed: validRewards.length,
      message: `Successfully processed ${validRewards.length} rewards`
    });
  } catch (error) {
    console.error('Unexpected error in fetch-rewards API:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}
