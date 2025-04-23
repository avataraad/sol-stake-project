import { useState, useCallback } from 'react';
import { StakeAccount } from '@/types/solana';
import { fetchStakeAccounts } from '@/services/solscan';
import { useToast } from "@/hooks/use-toast";

export const useStakeAccounts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [stakeAccounts, setStakeAccounts] = useState<StakeAccount[]>([]);
  const [displayedAccounts, setDisplayedAccounts] = useState<StakeAccount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [lastFetchedAddress, setLastFetchedAddress] = useState('');
  const { toast } = useToast();
  const PAGE_SIZE = 10;

  const loadAllPages = async (address: string) => {
    let allAccounts: StakeAccount[] = [];
    let currentPageNum = 1;
    let hasMore = true;
    let failedAttempts = 0;

    while (hasMore) {
      try {
        const response = await fetchStakeAccounts(address, currentPageNum, PAGE_SIZE);
        if (response.data && response.data.length > 0) {
          allAccounts = [...allAccounts, ...response.data];
          currentPageNum++;
        } else {
          hasMore = false;
        }
      } catch (error) {
        console.error(`Error loading page ${currentPageNum}:`, error);
        hasMore = false;
        throw new Error('Unable to load all stake accounts');
      }
    }

    return allAccounts;
  };

  const fetchAllStakeAccounts = async (address: string, page = 1) => {
    if (!address) {
      toast({
        title: "Error",
        description: "Please enter a valid Solana wallet address",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setCurrentPage(page);
    setLastFetchedAddress(address);
    
    try {
      const currentPageResponse = await fetchStakeAccounts(address, page, PAGE_SIZE);
      
      if (currentPageResponse.data) {
        setDisplayedAccounts(currentPageResponse.data);
        setHasNextPage(currentPageResponse.data.length === PAGE_SIZE);
      }

      const allAccounts = await loadAllPages(address);
      setStakeAccounts(allAccounts);
      
      if (allAccounts.length > 0) {
        toast({
          title: "Success",
          description: `Found ${allAccounts.length} total stake accounts`,
        });
      } else {
        toast({
          title: "Information",
          description: "No stake accounts found.",
        });
      }
    } catch (error) {
      console.error('Error fetching stake accounts:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch stake accounts');
      
      toast({
        title: "Error",
        description: "We were unable to load all your stake accounts, please retry later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalPages = useCallback(() => {
    return Math.ceil(stakeAccounts.length / PAGE_SIZE);
  }, [stakeAccounts.length]);

  const handlePageChange = (page: number) => {
    if (isLoading) return;
    
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    setCurrentPage(page);
    
    setDisplayedAccounts(stakeAccounts.slice(startIndex, endIndex));
    setHasNextPage(endIndex < stakeAccounts.length);
  };

  const getTotalStakedBalance = useCallback(() => {
    return stakeAccounts.reduce((sum, account) => sum + account.delegated_stake_amount, 0);
  }, [stakeAccounts]);

  const getLifetimeRewards = useCallback(() => {
    return stakeAccounts.reduce((sum, account) => {
      const reward = Number(account.total_reward) || 0;
      return sum + reward;
    }, 0);
  }, [stakeAccounts]);

  return {
    stakeAccounts: displayedAccounts,
    allStakeAccounts: stakeAccounts,
    isLoading,
    error,
    currentPage,
    hasNextPage,
    fetchAllStakeAccounts,
    handlePageChange,
    PAGE_SIZE,
    getTotalStakedBalance,
    getLifetimeRewards,
    totalPages: getTotalPages(),
  };
};
