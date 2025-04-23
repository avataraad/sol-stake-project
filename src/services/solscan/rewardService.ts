
import { parseCSVToJSON } from '../../utils/csvParser';

/**
 * Fetches reward CSV data for a given stake account address,
 * converts it to JSON, and returns an array of reward objects.
 *
 * @param address - The stake account address.
 * @returns A promise that resolves to an array of reward objects.
 */
export async function fetchRewardsForStakeAccount(address: string): Promise<any[]> {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOjE3NDQ4Mzc3MTcyODksImVtYWlsIjoiZXJpYy5rdWhuQGdlbWluaS5jb20iLCJhY3Rpb24iOiJ0b2tlbi1hcGkiLCJhcGlWZXJzaW9uIjoidjIiLCJpYXQiOjE3NDQ4Mzc3MTd9.jrnAu5QlIHFbkjIiBIKEpFronu7cub9HbUNGJZc7e8M";
  
  const requestOptions = {
    method: "GET",
    headers: { token }
  };

  const url = `https://pro-api.solscan.io/v2.0/account/reward/export?address=${address}`;
  console.log(`Fetching rewards for stake account: ${address}`);

  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      throw new Error(`Error fetching reward data for ${address}: ${response.statusText}`);
    }
    
    // Read the CSV data from the response.
    const csvData = await response.text();
    console.log(`Received CSV data length: ${csvData.length} characters`);
    if (csvData.length < 100) {
      console.log(`CSV data preview: ${csvData}`);
    }
    
    // Use the CSV parser to convert CSV into JSON.
    const parsedData = parseCSVToJSON(csvData);
    console.log(`Parsed ${parsedData.length} reward records for account ${address}`);
    
    return parsedData;
  } catch (error) {
    console.error(`Error in fetchRewardsForStakeAccount for ${address}:`, error);
    throw error;
  }
}
