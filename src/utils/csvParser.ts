
/**
 * Parses a CSV string into an array of JSON objects.
 * Assumes the CSV has a header row with comma-separated columns.
 *
 * @param csvData - The CSV string to parse.
 * @returns An array of objects where keys are column headers and values are row values.
 */
export function parseCSVToJSON(csvData: string): any[] {
  // Split the CSV string by newlines, trim each line, and filter out any empty lines.
  const lines = csvData
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length < 2) {
    throw new Error('CSV data must include a header and at least one data row.');
  }

  // Use the first line as headers.
  const headers = lines[0].split(',').map(header => header.trim());

  // Map each subsequent row into an object, converting appropriate fields to numbers.
  const records = lines.slice(1).map(line => {
    const values = line.split(',').map(value => value.trim());
    const record: any = {};
    headers.forEach((header, idx) => {
      if (
        header === 'Epoch' ||
        header === 'Effective Slot' ||
        header === 'Effective Time Unix' ||
        header === 'Reward Amount' ||
        header === 'Change Percentage' ||
        header === 'Post Balance' ||
        header === 'Commission'
      ) {
        record[header] = parseFloat(values[idx]);
      } else {
        record[header] = values[idx];
      }
    });
    return record;
  });

  return records;
}
