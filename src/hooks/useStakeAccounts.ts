import { useState } from 'react';
import { StakeAccount } from '@/types/solana';
import { fetchStakeAccounts } from '@/services/solscan';
import { useToast } from "@/hooks/use-toast";

export const useStakeAccounts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [stakeAccounts, setStakeAccounts] = useState<StakeAccount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [lastFetchedAddress, setLastFetchedAddress] = useState('');
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
      console.log('Fetching stake accounts for page:', page);
      const response = await fetchStakeAccounts(address, page, PAGE_SIZE);
      
      if (response.data) {
        setStakeAccounts(response.data);
        setHasNextPage(response.data.length === PAGE_SIZE);
        
        if (response.data.length > 0) {
          toast({
            title: "Success",
            description: `Found ${response.data.length} stake accounts on page ${page}`,
          });
        } else {
          toast({
            title: "Information",
            description: "No more stake accounts found.",
          });
        }
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
    console.log('Changing to page:', page);
    fetchAllStakeAccounts(lastFetchedAddress, page);
  };

  return {
    stakeAccounts,
    isLoading,
    error,
    currentPage,
    hasNextPage,
    fetchAllStakeAccounts,
    handlePageChange,
    PAGE_SIZE,
  };
};
