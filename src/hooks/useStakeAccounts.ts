
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
      // First load the current page for immediate display
      const currentPageResponse = await fetchStakeAccounts(address, page, PAGE_SIZE);
      
      if (currentPageResponse.data) {
        setDisplayedAccounts(currentPageResponse.data);
        setHasNextPage(currentPageResponse.data.length === PAGE_SIZE);
      }

      // Start background loading of all pages
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
        description: error instanceof Error ? error.message : "Failed to fetch stake accounts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (isLoading) return;
    
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    setCurrentPage(page);
    
    // Update displayed accounts from the full dataset
    setDisplayedAccounts(stakeAccounts.slice(startIndex, endIndex));
    setHasNextPage(endIndex < stakeAccounts.length);
  };

  const getTotalStakedBalance = useCallback(() => {
    return stakeAccounts.reduce((sum, account) => sum + account.delegated_stake_amount, 0);
  }, [stakeAccounts]);

  const getLifetimeRewards = useCallback(() => {
    return stakeAccounts.reduce((sum, account) => sum + account.total_reward, 0);
  }, [stakeAccounts]);

  return {
    stakeAccounts: displayedAccounts, // For UI display
    allStakeAccounts: stakeAccounts, // Complete dataset
    isLoading,
    error,
    currentPage,
    hasNextPage,
    fetchAllStakeAccounts,
    handlePageChange,
    PAGE_SIZE,
    getTotalStakedBalance,
    getLifetimeRewards,
  };
};
