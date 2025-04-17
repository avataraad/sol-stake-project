
import { useState } from 'react';
import { StakeAccount } from '@/types/solana';
import { fetchStakeAccounts, getStoredStakeAccounts } from '@/services/solscan';
import { useToast } from "@/hooks/use-toast";

export const useStakeAccounts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [stakeAccounts, setStakeAccounts] = useState<StakeAccount[]>([]);
  const { toast } = useToast();

  const fetchAllStakeAccounts = async (address: string) => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      // First, try to get stored accounts
      const storedAccounts = await getStoredStakeAccounts(address);
      
      if (storedAccounts.length > 0) {
        setStakeAccounts(storedAccounts as StakeAccount[]);
      }

      // Then fetch and update from Solscan API
      const response = await fetchStakeAccounts(address);
      setStakeAccounts(response.data);
      
      // Handle pagination if needed
      let nextPage = response.next_page;
      while (nextPage) {
        const nextResponse = await fetchStakeAccounts(address + '&next=' + nextPage);
        setStakeAccounts(prev => [...prev, ...nextResponse.data]);
        nextPage = nextResponse.next_page;
      }
    } catch (error) {
      console.error('Error fetching stake accounts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch stake accounts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    stakeAccounts,
    isLoading,
    fetchAllStakeAccounts,
  };
};
