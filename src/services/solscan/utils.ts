
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${errorText}`);
  }
  return response.json();
};

export const getRequestOptions = (token: string): RequestInit => ({
  method: 'GET',
  headers: {
    'token': token
  }
});
