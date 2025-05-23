
import { useState, useCallback } from 'react';
import { StakeAccount } from '@/types/solana';
import { fetchStakeAccounts, fetchWalletPortfolio } from '@/services/solscan';
import { useToast } from "@/hooks/use-toast";

export const useStakeAccounts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [stakeAccounts, setStakeAccounts] = useState<StakeAccount[]>([]);
  const [displayedAccounts, setDisplayedAccounts] = useState<StakeAccount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [lastFetchedAddress, setLastFetchedAddress] = useState('');
  const [nativeBalance, setNativeBalance] = useState(0);
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
          // Log first account on each page to inspect data structure
          if (response.data[0]) {
            console.log(`Page ${currentPageNum} first account sample:`, {
              stake_account: response.data[0].stake_account,
              active_stake_amount: response.data[0].active_stake_amount,
              type_of_active_stake: typeof response.data[0].active_stake_amount
            });
          }
          
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

    console.log(`Total accounts loaded: ${allAccounts.length}`);
    console.log(`Sample of active_stake_amount values:`, 
      allAccounts.slice(0, 3).map(a => a.active_stake_amount));
    
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
      console.log(`Starting data fetch for wallet: ${address}`);
      
      // Fetch both stake accounts and portfolio data simultaneously
      const [currentPageResponse, portfolioResponse] = await Promise.all([
        fetchStakeAccounts(address, page, PAGE_SIZE),
        fetchWalletPortfolio(address)
      ]);
      
      console.log('Both API calls completed successfully');
      
      if (currentPageResponse.data) {
        setDisplayedAccounts(currentPageResponse.data);
        setHasNextPage(currentPageResponse.data.length === PAGE_SIZE);
      }

      // Set native balance from portfolio using the correct amount property
      if (portfolioResponse.data?.native_balance?.amount) {
        const balance = portfolioResponse.data.native_balance.amount;
        console.log(`Setting native balance in hook: ${balance} (${balance / 1e9} SOL)`);
        setNativeBalance(balance);
      } else {
        console.warn('Native balance not available in portfolio response or has unexpected structure');
        setNativeBalance(0);
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
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
      
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
    const total = stakeAccounts.reduce((sum, account) => {
      // Explicitly convert sol_balance to number and handle potential undefined or null values
      const solBalance = Number(account.sol_balance || 0);
      return sum + solBalance;
    }, 0);
    console.log("Total staked balance calculated:", total);
    return total;
  }, [stakeAccounts]);

  const getLifetimeRewards = useCallback(() => {
    const rewards = stakeAccounts.reduce((sum, account) => {
      const reward = Number(account.total_reward) || 0;
      return sum + reward;
    }, 0);
    console.log("Lifetime rewards calculated:", rewards);
    return rewards;
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
    nativeBalance,
  };
};
