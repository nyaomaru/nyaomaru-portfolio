import { fetchJson } from '@/shared/api';

/**
 * Request type for the ask API endpoint.
 */
type AskRequest = {
  /** The question string to be sent to the API */
  question: string;
};

/**
 * Response type for the ask API endpoint.
 */
type AskResponse = {
  /** The result object containing the response data */
  result: {
    /** Keyword arguments containing the response content */
    kwargs: {
      /** The content string returned by the API */
      content: string;
    };
  };
};

/**
 * Sends a question to the ask API endpoint and returns the response content.
 *
 * @param question - The question string to be sent to the API
 * @returns A promise that resolves to the content string from the API response
 * @throws Will throw an error if the API request fails or returns an invalid response
 */
export const postAsk = async (question: string): Promise<string> => {
  const res = await fetchJson<AskResponse>('/api/ask', {
    method: 'POST',
    body: JSON.stringify({ question } satisfies AskRequest),
  });

  return res.result.kwargs.content;
};
