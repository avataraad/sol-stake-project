
import { SolscanPortfolioResponse } from '@/types/solana';
import { SOLSCAN_API_URL, SOLSCAN_API_TOKEN } from './config';
import { handleApiResponse, getRequestOptions } from './utils';

export const fetchWalletPortfolio = async (address: string): Promise<SolscanPortfolioResponse> => {
  const url = new URL(`${SOLSCAN_API_URL}/account/portfolio`);
  url.searchParams.append('address', address);

  console.log(`Fetching wallet portfolio for address: ${address}`);
  
  try {
    const response = await fetch(url.toString(), getRequestOptions(SOLSCAN_API_TOKEN));
    const data = await handleApiResponse(response);
    console.log('Portfolio API response:', JSON.stringify(data, null, 2));
    
    if (data?.data?.native_balance?.amount) {
      console.log(`Native balance from API: ${data.data.native_balance.amount} (${data.data.native_balance.amount / 1e9} SOL)`);
    } else {
      console.warn('Native balance not found in API response or has unexpected structure:', data);
    }
    
    return data;
  } catch (error) {
    console.error('Error in fetchWalletPortfolio:', error);
    throw error;
  }
};
