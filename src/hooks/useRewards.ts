
import { useState, useCallback } from 'react';
import { RewardEntry } from '@/types/solana';
import { getRewardsForStakeAccount, getRewardsForWallet } from '@/services/solscan';
import { useToast } from "@/hooks/use-toast";

export const useRewards = () => {
  const [rewards, setRewards] = useState<RewardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRewardsForStakeAccount = useCallback(async (stakeAccount: string, limit = 10, offset = 0) => {
    if (!stakeAccount) {
      toast({
        title: "Error",
        description: "Please provide a valid stake account address",
        variant: "destructive",
      });
      return [];
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching rewards for stake account: ${stakeAccount}`);
      const rewardData = await getRewardsForStakeAccount(stakeAccount, limit, offset);
      
      setRewards(rewardData);
      return rewardData;
    } catch (error) {
      console.error('Error fetching rewards:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch rewards');
      
      toast({
        title: "Error",
        description: "We were unable to load rewards data, please retry later.",
        variant: "destructive",
      });
      
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchRewardsForWallet = useCallback(async (stakeAccounts: string[], limit = 50, offset = 0) => {
    if (!stakeAccounts || stakeAccounts.length === 0) {
      toast({
        title: "Information",
        description: "No stake accounts available to fetch rewards",
      });
      return [];
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching rewards for ${stakeAccounts.length} stake accounts`);
      const rewardData = await getRewardsForWallet(stakeAccounts, limit, offset);
      
      setRewards(rewardData);
      return rewardData;
    } catch (error) {
      console.error('Error fetching wallet rewards:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch wallet rewards');
      
      toast({
        title: "Error",
        description: "We were unable to load rewards data, please retry later.",
        variant: "destructive",
      });
      
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    rewards,
    isLoading,
    error,
    fetchRewardsForStakeAccount,
    fetchRewardsForWallet,
  };
};
