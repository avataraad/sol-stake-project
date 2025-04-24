
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

  // API endpoint for rewards - test with one account first
  const url = `https://pro-api.solscan.io/v2.0/account/reward/export?address=${address}`;
  console.log(`Fetching rewards for stake account: ${address.substring(0, 8)}...`);

  try {
    console.log(`Making API request to: ${url}`);
    const response = await fetch(url, requestOptions);
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error(`Error response from API: ${responseText}`);
      throw new Error(`Error fetching reward data for ${address}: ${response.statusText} (${response.status})`);
    }
    
    // Read the CSV data from the response.
    const csvData = await response.text();
    console.log(`Received CSV data length: ${csvData.length} characters`);
    
    // Log a preview of the CSV data to help diagnose format issues
    if (csvData.length === 0) {
      console.log(`Warning: Empty CSV data received for account ${address}`);
      return [];
    } else if (csvData.length < 100) {
      console.log(`CSV data preview: ${csvData}`);
    } else {
      console.log(`CSV data preview: ${csvData.substring(0, 100)}...`);
      // Check if it actually looks like CSV by checking for commas and newlines
      const commaCount = csvData.split(',').length - 1;
      const newlineCount = csvData.split('\n').length - 1;
      console.log(`CSV data contains ${commaCount} commas and ${newlineCount} newlines`);
      
      // Show the first complete line to check the header format
      const firstLine = csvData.split('\n')[0];
      console.log(`CSV header line: ${firstLine}`);
    }
    
    try {
      // Use the CSV parser to convert CSV into JSON.
      const parsedData = parseCSVToJSON(csvData);
      console.log(`Parsed ${parsedData.length} reward records for account ${address.substring(0, 8)}...`);
      
      // Log sample of parsed data to verify structure
      if (parsedData.length > 0) {
        console.log('First parsed reward record:', parsedData[0]);
        console.log('Keys in first record:', Object.keys(parsedData[0]));
        
        // Check if we have the expected fields
        const hasExpectedFields = 
          'Epoch' in parsedData[0] && 
          'Effective Time' in parsedData[0] && 
          'Reward Amount' in parsedData[0];
        
        console.log(`Record has expected fields? ${hasExpectedFields}`);
        
        // Show what fields we actually have (for case sensitivity issues)
        const epochKey = Object.keys(parsedData[0]).find(key => 
          key.toLowerCase() === 'epoch' || key.toLowerCase().includes('epoch'));
        const timeKey = Object.keys(parsedData[0]).find(key => 
          key.toLowerCase().includes('time'));
        const rewardKey = Object.keys(parsedData[0]).find(key => 
          key.toLowerCase().includes('reward'));
        
        console.log(`Actual field names found: Epoch=${epochKey}, Time=${timeKey}, Reward=${rewardKey}`);
      } else {
        console.log(`No records parsed from CSV for account ${address}`);
      }
      
      return parsedData;
    } catch (parseError) {
      console.error(`Error parsing CSV data for ${address}:`, parseError);
      console.log(`Raw CSV data that failed parsing:`, csvData);
      return [];
    }
  } catch (error) {
    console.error(`Error in fetchRewardsForStakeAccount for ${address}:`, error);
    // Return empty array instead of throwing to prevent one failed account from breaking the aggregation
    return [];
  }
}

