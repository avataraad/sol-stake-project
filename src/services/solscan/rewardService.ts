
import { parseCSVToJSON } from '@/utils/csvParser';

/**
 * Fetches the reward CSV data for a given stake account address,
 * converts it to JSON objects, and returns the parsed data.
 *
 * @param address - The stake account address.
 * @returns A promise that resolves to an array of reward objects.
 */
export async function fetchRewardsForStakeAccount(address: string): Promise<any[]> {
  // Ideally, store your token in an environment variable
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOjE3NDQ4Mzc3MTcyODksImVtYWlsIjoiZXJpYy5rdWhuQGdlbWluaS5jb20iLCJhY3Rpb24iOiJ0b2tlbi1hcGkiLCJhcGlWZXJzaW9uIjoidjIiLCJpYXQiOjE3NDQ4Mzc3MTd9.jrnAu5QlIHFbkjIiBIKEpFronu7cub9HbUNGJZc7e8M";
  
  const requestOptions = {
    method: "GET",
    headers: { token }
  };

  const url = `https://pro-api.solscan.io/v2.0/account/reward/export?address=${address}`;

  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      throw new Error(`Error fetching reward data for ${address}: ${response.statusText}`);
    }
    
    const csvData = await response.text();
    const parsedData = parseCSVToJSON(csvData);
    return parsedData;
  } catch (error) {
    console.error("Error in fetchRewardsForStakeAccount:", error);
    throw error;
  }
}
