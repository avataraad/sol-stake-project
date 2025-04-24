
/**
 * Parses a CSV string into an array of JSON objects.
 * Assumes the CSV has a header row with comma-separated columns.
 *
 * @param csvData - The CSV string to parse.
 * @returns An array of objects where keys are the column headers and values are the row values.
 */
export function parseCSVToJSON(csvData: string): any[] {
  const lines = csvData
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length < 2) {
    throw new Error('CSV data must include a header row and at least one data row.');
  }

  // Use the first line as headers.
  const headers = lines[0].split(',').map(header => header.trim());

  // Process each row, mapping headers to their corresponding value.
  const records = lines.slice(1).map((line, index) => {
    const values = line.split(',').map(value => value.trim());
    const record: any = {};
    
    headers.forEach((header, idx) => {
      let value = values[idx];
      
      // Handle reward amount specifically to ensure it's a number
      if (header === 'Reward Amount' || header === 'reward_amount') {
        // Remove any currency symbols or commas and convert to number
        const cleanedValue = value.replace(/[^-.\d]/g, '');
        const numValue = parseFloat(cleanedValue);
        
        if (isNaN(numValue)) {
          console.warn(`Invalid reward amount in row ${index + 1}: "${value}"`);
          record[header] = 0; // Default to 0 for invalid numbers
        } else {
          record[header] = numValue;
        }
      }
      // Convert other numeric fields
      else if (
        header === 'Epoch' ||
        header === 'Effective Slot' ||
        header === 'Effective Time Unix' ||
        header === 'Change Percentage' ||
        header === 'Post Balance' ||
        header === 'Commission'
      ) {
        const numValue = parseFloat(value);
        record[header] = isNaN(numValue) ? 0 : numValue;
      } else {
        record[header] = value;
      }
    });

    // Add debug logging for the first few records
    if (index < 3) {
      console.log(`Parsed record ${index + 1}:`, record);
      if ('Reward Amount' in record) {
        console.log(`Reward Amount type: ${typeof record['Reward Amount']}, value: ${record['Reward Amount']}`);
      }
    }

    return record;
  });

  return records;
}

