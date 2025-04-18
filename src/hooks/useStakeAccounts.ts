
import { useState } from 'react';
import { StakeAccount } from '@/types/solana';
import { fetchAllStakeAccountPages, getStoredStakeAccounts } from '@/services/solscan';
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
        
        // Show a toast to let the user know we're using cached data initially
        toast({
          title: "Loading",
          description: `Found ${storedAccounts.length} cached stake accounts. Refreshing data...`,
        });
      } else {
        console.log('No stored accounts found');
        toast({
          title: "Loading",
          description: "Fetching stake accounts. This might take a moment...",
        });
      }

      // Then fetch and update from Solscan API using our function that handles all pages
      console.log('Fetching all stake accounts from Solscan API');
      try {
        // Fetch all pages of stake accounts
        const allAccounts = await fetchAllStakeAccountPages(address);
        
        console.log(`Total accounts fetched across all pages: ${allAccounts.length}`);
        if (allAccounts.length > 0) {
          setStakeAccounts(allAccounts);
          toast({
            title: "Success",
            description: `Found ${allAccounts.length} stake accounts`,
          });
        } else if (storedAccounts.length === 0) {
          toast({
            title: "Information",
            description: "No stake accounts found for this address.",
          });
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
