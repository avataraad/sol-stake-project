
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
  const [activeStakesBalance, setActiveStakesBalance] = useState(0);
  const { toast } = useToast();
  const PAGE_SIZE = 10;

  const loadAllPages = async (address: string, maxPageAttempts = 5) => {
    let allAccounts: StakeAccount[] = [];
    let currentPageNum = 1;
    let hasMore = true;
    let failedAttempts = 0;

    while (hasMore && failedAttempts < 3 && currentPageNum <= maxPageAttempts) {
      try {
        console.log(`Attempting to fetch page ${currentPageNum} for ${address}`);
        const response = await fetchStakeAccounts(address, currentPageNum, PAGE_SIZE);
        
        if (response.data && response.data.length > 0) {
          allAccounts = [...allAccounts, ...response.data];
          
          // Check if metadata indicates there are more pages
          if (response.metadata && response.metadata.hasNextPage === true) {
            currentPageNum++;
          } else {
            // If no metadata or hasNextPage is false, stop pagination
            hasMore = false;
          }
        } else {
          // No data returned, stop pagination
          hasMore = false;
        }
      } catch (error) {
        console.error(`Error loading page ${currentPageNum}:`, error);
        failedAttempts++;
        
        // Continue to next page despite error, to try to get as much data as possible
        currentPageNum++;
        
        if (failedAttempts >= 3) {
          console.warn(`Too many failed attempts, stopping pagination after page ${currentPageNum - 1}`);
          // But we'll continue with whatever data we have
          hasMore = false;
        }
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
      // Get first page for immediate display
      const currentPageResponse = await fetchStakeAccounts(address, page, PAGE_SIZE);
      
      if (currentPageResponse.data) {
        setDisplayedAccounts(currentPageResponse.data);
        setHasNextPage(currentPageResponse.metadata?.hasNextPage === true);
      }

      // Fetch additional pages in background
      const allAccounts = await loadAllPages(address);
      setStakeAccounts(allAccounts);
      
      // Calculate active stakes balance
      const activeBalance = calculateActiveStakesBalance(allAccounts);
      setActiveStakesBalance(activeBalance);
      
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
        description: "Error fetching some stake accounts. Showing partial data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateActiveStakesBalance = (accounts: StakeAccount[]) => {
    return accounts.reduce((sum, account) => {
      return account.status.toLowerCase() === 'active' ? sum + account.active_stake_amount : sum;
    }, 0);
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

  const getActiveStakesBalance = useCallback(() => {
    return activeStakesBalance;
  }, [activeStakesBalance]);

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
    getActiveStakesBalance,
    totalPages: getTotalPages(),
  };
};
