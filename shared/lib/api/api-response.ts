import { define, hasKey, isError, isObject } from 'is-kit';

/**
 * Type definitions for LangChain response structures
 */
export type LangChainResponse = {
  kwargs?: {
    content?: string;
  };
  content?: string;
  [key: string]: unknown;
};

/**
 * Standard API response structure
 */
export type StandardApiResponse = {
  result: {
    kwargs: {
      content: string;
    };
  };
};

/**
 * Error response structure
 */
export type ErrorResponse = {
  error: string;
};

const hasNonNullishContent = define<{ content: unknown }>(
  (value): value is { content: unknown } =>
    isObject(value) &&
    hasKey('content')(value) &&
    value.content !== null &&
    value.content !== undefined,
);

const hasKwargsWithNonNullishContent = define<{ kwargs: { content: unknown } }>(
  (value): value is { kwargs: { content: unknown } } =>
    isObject(value) && hasKey('kwargs')(value) && hasNonNullishContent(value.kwargs),
);

/**
 * Extracts content from various LangChain response structures in a type-safe manner.
 *
 * @param response - The response from LangChain
 * @returns The extracted content string
 * @throws Error if content cannot be extracted
 */
export const extractContentFromLangChainResponse = (response: unknown): string => {
  if (response === null || response === undefined) {
    throw new Error('No content could be extracted: response is null or undefined');
  }
  if (!isObject(response)) {
    return String(response);
  }

  // Try to extract content from kwargs.content
  if (hasKwargsWithNonNullishContent(response)) {
    return String(response.kwargs.content);
  }

  // Try to extract content directly
  if (hasNonNullishContent(response)) {
    return String(response.content);
  }

  // Fallback: log the full object, but return a generic message to the user
  console.error('Unable to extract content from LangChain response:', response);
  return 'Unable to extract content';
};

/**
 * Creates a standardized API response with proper error handling.
 *
 * @param content - The content to include in the response
 * @returns Standardized API response
 */
export const createStandardResponse = (content: string): StandardApiResponse => {
  return {
    result: {
      kwargs: {
        content,
      },
    },
  };
};

/**
 * Creates an error response with proper error handling.
 *
 * @param error - The error to include in the response
 * @returns Error response
 */
export const createErrorResponse = (error: unknown): ErrorResponse => {
  const errorMessage = isError(error) ? error.message : String(error);
  return { error: errorMessage };
};
