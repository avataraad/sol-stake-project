
import { SolscanResponse } from "@/types/solana";

const SOLSCAN_API_URL = 'https://pro-api.solscan.io/v2.0/account/stake';

export const fetchStakeAccounts = async (address: string): Promise<SolscanResponse> => {
  const response = await fetch(`${SOLSCAN_API_URL}?address=${address}`, {
    headers: {
      'token': 'YOUR_API_KEY', // This should be replaced with a proper API key management solution
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch stake accounts');
  }

  return response.json();
};
