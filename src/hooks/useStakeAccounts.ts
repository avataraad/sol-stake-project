
import { useState, useCallback } from 'react';
import { StakeAccount } from '@/types/solana';
import { fetchAllStakeAccountPages, fetchStakeAccounts, fetchWalletPortfolio } from '@/services/solscan';
import { useToast } from "@/hooks/use-toast";

export const useStakeAccounts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [stakeAccounts, setStakeAccounts] = useState<StakeAccount[]>([]);
  const [allStakeAccounts, setAllStakeAccounts] = useState<StakeAccount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [lastFetchedAddress, setLastFetchedAddress] = useState('');
  const [nativeBalance, setNativeBalance] = useState(0);
  const { toast } = useToast();
  const PAGE_SIZE = 10;

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
      
      // Fetch both stake accounts for the current page and portfolio data simultaneously
      const [currentPageResponse, portfolioResponse] = await Promise.all([
        fetchStakeAccounts(address, page, PAGE_SIZE),
        fetchWalletPortfolio(address)
      ]);
      
      console.log('API calls for initial page and portfolio completed successfully');
      
      // Set the current page of accounts for display
      if (currentPageResponse.data) {
        setStakeAccounts(currentPageResponse.data);
        setHasNextPage(currentPageResponse.data.length === PAGE_SIZE);
      }

      // Set native balance from portfolio
      if (portfolioResponse.data?.native_balance?.amount) {
        const balance = portfolioResponse.data.native_balance.amount;
        console.log(`Setting native balance in hook: ${balance} (${balance / 1e9} SOL)`);
        setNativeBalance(balance);
      } else {
        console.warn('Native balance not available in portfolio response or has unexpected structure');
        setNativeBalance(0);
      }

      // Fetch ALL stake accounts (this will also store them in the database)
      console.log('Now fetching all stake accounts...');
      const allAccounts = await fetchAllStakeAccountPages(address);
      console.log(`Received ${allAccounts.length} total accounts from fetchAllStakeAccountPages`);
      setAllStakeAccounts(allAccounts);
      
      // Update the UI display based on the current page
      handlePageChange(currentPage);
      
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
    return Math.ceil(allStakeAccounts.length / PAGE_SIZE);
  }, [allStakeAccounts.length]);

  const handlePageChange = (page: number) => {
    if (isLoading) return;
    
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    setCurrentPage(page);
    
    // Use allStakeAccounts instead of stakeAccounts for pagination
    setStakeAccounts(allStakeAccounts.slice(startIndex, endIndex));
    setHasNextPage(endIndex < allStakeAccounts.length);
  };

  const getTotalStakedBalance = useCallback(() => {
    const total = allStakeAccounts.reduce((sum, account) => sum + account.delegated_stake_amount, 0);
    console.log("Total staked balance calculated:", total);
    return total;
  }, [allStakeAccounts]);

  const getLifetimeRewards = useCallback(() => {
    const rewards = allStakeAccounts.reduce((sum, account) => {
      const reward = Number(account.total_reward) || 0;
      return sum + reward;
    }, 0);
    console.log("Lifetime rewards calculated:", rewards);
    return rewards;
  }, [allStakeAccounts]);

  return {
    stakeAccounts, // Currently displayed accounts
    allStakeAccounts, // All accounts for calculations
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
