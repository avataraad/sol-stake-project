
import { StakeAccount, SolscanResponse } from '@/types/solana';
import { supabase } from "@/integrations/supabase/client";
import { SOLSCAN_API_URL, SOLSCAN_API_TOKEN, MAX_RETRIES, RETRY_DELAY } from './config';
import { delay, handleApiResponse, getRequestOptions } from './utils';
import { Database } from "@/integrations/supabase/types";
import { storeStakeAccounts } from './database';

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
        
        // Store each page in the database as soon as it's received
        try {
          await storeStakeAccounts(address, response.data);
          console.log(`Successfully stored page ${currentPage} with ${response.data.length} stake accounts in Supabase`);
        } catch (error) {
          console.error(`Error storing stake accounts from page ${currentPage} in Supabase:`, error);
        }
        
        // Add to our in-memory collection
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
    return allAccounts;
  } catch (error) {
    console.error('Error in fetchAllStakeAccountPages:', error);
    throw error;
  }
};
