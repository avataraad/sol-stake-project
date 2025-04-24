import { StakeAccount, SolscanResponse } from '@/types/solana';
import { SOLSCAN_API_URL, SOLSCAN_API_TOKEN, MAX_RETRIES, RETRY_DELAY } from './config';
import { delay, handleApiResponse, getRequestOptions } from './utils';
import { storeStakeAccounts } from './database';
import { toast } from "@/components/ui/use-toast";

export const fetchStakeAccounts = async (address: string, page = 1, pageSize = 40): Promise<SolscanResponse> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const url = new URL(`${SOLSCAN_API_URL}/account/stake`);
      url.searchParams.append('address', address);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('page_size', pageSize.toString());

      console.log(`Fetching stake accounts for page ${page} (Attempt ${attempt}/${MAX_RETRIES})`);
      
      const response = await fetch(url.toString(), getRequestOptions(SOLSCAN_API_TOKEN));
      const data = await handleApiResponse(response);
      console.log(`Successfully fetched stake accounts for page ${page}`);
      
      return data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error occurred');
      console.error(`Error fetching stake accounts page ${page} (Attempt ${attempt}/${MAX_RETRIES}):`, error);
      
      if (attempt < MAX_RETRIES) {
        await delay(RETRY_DELAY);
        continue;
      }
    }
  }
  
  throw new Error(`Failed to fetch stake accounts after ${MAX_RETRIES} attempts: ${lastError?.message}`);
};

export const fetchAllStakeAccountPages = async (address: string): Promise<StakeAccount[]> => {
  let currentPage = 1;
  let allAccounts: StakeAccount[] = [];
  let hasMorePages = true;
  const pageSize = 40;
  
  console.log('Starting to fetch all stake account pages');
  
  try {
    while (hasMorePages) {
      console.log(`Fetching stake accounts page ${currentPage}`);
      const response = await fetchStakeAccounts(address, currentPage, pageSize);
      
      if (response.data && response.data.length > 0) {
        console.log(`Received ${response.data.length} accounts from page ${currentPage}`);
        allAccounts = [...allAccounts, ...response.data];
        
        if (response.metadata && response.metadata.hasNextPage === true) {
          currentPage++;
          console.log(`More pages available, moving to page ${currentPage}`);
        } else {
          hasMorePages = false;
          console.log('No more pages available - metadata indicates last page');
        }
      } else {
        hasMorePages = false;
        console.log('No data received or empty array, stopping pagination');
      }
    }
    
    console.log(`Total stake accounts fetched across all pages: ${allAccounts.length}`);
    
    if (allAccounts.length > 0) {
      try {
        await storeStakeAccounts(address, allAccounts);
        console.log(`Successfully stored ${allAccounts.length} stake accounts in database`);
        
        toast({
          title: "Success",
          description: `Found ${allAccounts.length} total stake accounts`,
        });
      } catch (storageError) {
        console.error('Error storing stake accounts:', storageError);
        toast({
          title: "Warning",
          description: "Retrieved stake accounts but failed to store them",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Information",
        description: "No stake accounts found.",
      });
    }
    
    return allAccounts;
  } catch (error) {
    console.error('Error in fetchAllStakeAccountPages:', error);
    toast({
      title: "Error",
      description: "Failed to fetch stake accounts. Please try again later.",
      variant: "destructive",
    });
    throw error;
  }
};
