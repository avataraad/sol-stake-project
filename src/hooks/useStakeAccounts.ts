
import { useState } from 'react';
import { StakeAccount } from '@/types/solana';
import { fetchStakeAccounts, getStoredStakeAccounts } from '@/services/solscan';
import { useToast } from "@/hooks/use-toast";

export const useStakeAccounts = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [stakeAccounts, setStakeAccounts] = useState<StakeAccount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAllStakeAccounts = async (address: string) => {
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
    
    try {
      // First, try to get stored accounts
      console.log('Fetching stored stake accounts for address:', address);
      const storedAccounts = await getStoredStakeAccounts(address);
      
      if (storedAccounts.length > 0) {
        console.log('Found stored accounts:', storedAccounts.length);
        setStakeAccounts(storedAccounts as StakeAccount[]);
      } else {
        console.log('No stored accounts found');
      }

      // Then fetch and update from Solscan API
      console.log('Fetching fresh stake accounts from Solscan API');
      try {
        const response = await fetchStakeAccounts(address, 1, 40);
        
        console.log('Received response from Solscan:', response);
        if (response.data && response.data.length > 0) {
          setStakeAccounts(response.data);
          
          // Handle additional pages if needed
          let currentPage = 2;
          if (response.metadata && response.metadata.hasNextPage) {
            while (response.metadata.hasNextPage) {
              console.log('Fetching next page:', currentPage);
              const nextResponse = await fetchStakeAccounts(address, currentPage, 40);
              if (nextResponse.data && nextResponse.data.length > 0) {
                setStakeAccounts(prev => [...prev, ...nextResponse.data]);
                currentPage++;
              } else {
                break;
              }
            }
          }
        } else {
          console.log('No stake accounts returned from API');
          if (storedAccounts.length === 0) {
            toast({
              title: "Information",
              description: "No stake accounts found for this address.",
            });
          }
        }
      } catch (apiError) {
        console.error('Error fetching from Solscan API:', apiError);
        // Only show an error toast if we also don't have stored accounts
        if (storedAccounts.length === 0) {
          toast({
            title: "Error",
            description: apiError instanceof Error ? apiError.message : "Failed to fetch from Solscan API. Using cached data if available.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Warning",
            description: "Could not refresh data from Solscan. Using cached data instead.",
            variant: "default",
          });
        }
      }
    } catch (error) {
      console.error('Error in fetch process:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch stake accounts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    stakeAccounts,
    isLoading,
    error,
    fetchAllStakeAccounts,
  };
};
