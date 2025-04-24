
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
    console.log(`Making API request to: ${url}`);
    const response = await fetch(url, requestOptions);
    
    console.log(`Response status: ${response.status}`);
    if (!response.ok) {
      const responseText = await response.text();
      console.error(`Error response from API: ${responseText}`);
      throw new Error(`Error fetching reward data for ${address}: ${response.statusText} (${response.status})`);
    }
    
    // Read the CSV data from the response.
    const csvData = await response.text();
    console.log(`Received CSV data length: ${csvData.length} characters`);
    
    // Log a preview of the CSV data to help diagnose format issues
    if (csvData.length < 100) {
      console.log(`CSV data preview: ${csvData}`);
    } else {
      console.log(`CSV data preview: ${csvData.substring(0, 100)}...`);
      // Check if it actually looks like CSV by checking for commas and newlines
      const commaCount = csvData.split(',').length - 1;
      const newlineCount = csvData.split('\n').length - 1;
      console.log(`CSV data contains ${commaCount} commas and ${newlineCount} newlines`);
    }
    
    // Use the CSV parser to convert CSV into JSON.
    const parsedData = parseCSVToJSON(csvData);
    console.log(`Parsed ${parsedData.length} reward records for account ${address}`);
    
    // Log sample of parsed data to verify structure
    if (parsedData.length > 0) {
      console.log('Sample of first parsed reward record:', parsedData[0]);
    }
    
    return parsedData;
  } catch (error) {
    console.error(`Error in fetchRewardsForStakeAccount for ${address}:`, error);
    // Return empty array instead of throwing to prevent one failed account from breaking the aggregation
    return [];
  }
}
