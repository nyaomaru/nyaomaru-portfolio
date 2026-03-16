/**
 * Fetches JSON data from a URL using the Fetch API with automatic JSON parsing and error handling.
 *
 * @template T - The expected type of the response data
 * @param url - The URL to fetch data from
 * @param options - Optional fetch configuration options (headers, method, body, etc.)
 * @returns A promise that resolves to the parsed JSON response of type T
 * @throws {Error} Throws an error if the response is not ok, with the error message from the response body or a default API error message
 */
export const fetchJson = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody?.error || `API Error (${res.status})`);
  }

  return res.json();
};
