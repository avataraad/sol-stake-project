
import { useState, useCallback, useEffect } from 'react';
import { StakeAccount } from '@/types/solana';
import { fetchAllStakeAccountPages, fetchStakeAccounts } from '@/services/solscan';
import { getStoredStakeAccounts } from '@/services/solscan/database';
import { fetchWalletPortfolio } from '@/services/solscan';
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
  const [isFetchingPages, setIsFetchingPages] = useState(false);
  const [progressCount, setProgressCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();
  const PAGE_SIZE = 10;

  // Load all accounts from the database if available, otherwise fetch from API
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
    setIsFetchingPages(true);
    setProgressCount(0);
    
    try {
      console.log(`Starting data fetch for wallet: ${address}`);
      
      // First, try to fetch from the database
      const storedAccounts = await getStoredStakeAccounts(address);
      
      if (storedAccounts && storedAccounts.length > 0) {
        console.log(`Found ${storedAccounts.length} stake accounts in database. Using cached data.`);
        setStakeAccounts(storedAccounts);
        updateDisplayedAccounts(storedAccounts, page);
        
        // Still fetch portfolio for native balance
        try {
          const portfolioResponse = await fetchWalletPortfolio(address);
          if (portfolioResponse.data?.native_balance?.amount) {
            const balance = portfolioResponse.data.native_balance.amount;
            console.log(`Setting native balance: ${balance} (${balance / 1e9} SOL)`);
            setNativeBalance(balance);
          }
        } catch (portfolioError) {
          console.error('Error fetching portfolio:', portfolioError);
        }
        
        toast({
          title: "Success",
          description: `Loaded ${storedAccounts.length} stake accounts from cache`,
        });
      } else {
        console.log("No cached data found or data needs refresh. Fetching from API...");
        
        // Display first page immediately to improve UX
        try {
          const [firstPageResponse, portfolioResponse] = await Promise.all([
            fetchStakeAccounts(address, 1, PAGE_SIZE),
            fetchWalletPortfolio(address)
          ]);
          
          console.log("Initial page and portfolio data fetched");
          
          if (firstPageResponse.data) {
            setDisplayedAccounts(firstPageResponse.data);
            setHasNextPage(firstPageResponse.data.length === PAGE_SIZE);
            
            // Show progress toast
            toast({
              title: "Loading",
              description: `Loading page 1 of stake accounts...`,
            });
          }
          
          // Set native balance from portfolio
          if (portfolioResponse.data?.native_balance?.amount) {
            const balance = portfolioResponse.data.native_balance.amount;
            console.log(`Setting native balance: ${balance} (${balance / 1e9} SOL)`);
            setNativeBalance(balance);
          }
          
          // Fetch all pages in the background and store them
          console.log("Starting background fetch of all pages...");
          const allAccounts = await fetchAllStakeAccountPages(address);
          setStakeAccounts(allAccounts);
          
          // No need to update displayed accounts, we already did that
          toast({
            title: "Success",
            description: `Fetched ${allAccounts.length} total stake accounts`,
          });
        } catch (apiError) {
          console.error("Error in API fetch:", apiError);
          setError(apiError instanceof Error ? apiError.message : 'Failed to fetch data');
          
          toast({
            title: "Error",
            description: "We were unable to load your stake accounts, please retry later.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error in fetchAllStakeAccounts:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
      
      toast({
        title: "Error",
        description: "We were unable to load your stake accounts, please retry later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsFetchingPages(false);
    }
  };

  const updateDisplayedAccounts = (accounts: StakeAccount[], page: number) => {
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    setCurrentPage(page);
    
    const pageAccounts = accounts.slice(startIndex, endIndex);
    setDisplayedAccounts(pageAccounts);
    setHasNextPage(endIndex < accounts.length);
  };

  const getTotalPages = useCallback(() => {
    return Math.ceil(stakeAccounts.length / PAGE_SIZE);
  }, [stakeAccounts.length]);

  const handlePageChange = (page: number) => {
    if (isLoading) return;
    updateDisplayedAccounts(stakeAccounts, page);
  };

  const getTotalStakedBalance = useCallback(() => {
    const total = stakeAccounts.reduce((sum, account) => sum + account.delegated_stake_amount, 0);
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

  const getActiveStakeBalance = useCallback(() => {
    console.log("Calculating active stake balance from", stakeAccounts.length, "accounts");
    
    const totalActiveStake = stakeAccounts.reduce((sum, account) => {
      // Convert active_stake_amount to number and handle potential undefined or null values
      const activeStake = Number(account.active_stake_amount || 0);
      return sum + activeStake;
    }, 0);
    
    console.log("Total calculated active stake:", totalActiveStake);
    return totalActiveStake;
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
    getActiveStakeBalance,
    totalPages: getTotalPages(),
    nativeBalance,
    isFetchingPages,
    progressCount,
    totalCount
  };
};
