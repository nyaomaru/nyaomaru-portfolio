import { define, equals, hasKey, isObject, isString, safeParse, struct } from 'is-kit';

const isNonEmptyString = define<string>(
  (value): value is string => isString(value) && value !== '',
);
const isAskRequestBody = struct({ question: isString });

/**
 * Validates that a request has the correct method.
 *
 * @param request - The request to validate
 * @param expectedMethod - The expected HTTP method
 * @returns true if the method matches, false otherwise
 */
export const validateRequestMethod = (request: Request, expectedMethod: string): boolean => {
  return equals(expectedMethod)(request.method);
};

/**
 * Validates that the request body contains a valid question.
 *
 * @param body - The parsed request body
 * @returns The validated question string
 * @throws Error if validation fails
 */
export const validateQuestion = (body: unknown): string => {
  if (!isObject(body)) {
    throw new Error('Request body is required');
  }

  const hasQuestion = hasKey('question');
  if (!hasQuestion(body) || !body.question) {
    throw new Error('Question is required');
  }

  const parseResult = safeParse(isAskRequestBody, body);
  if (!parseResult.valid) {
    throw new Error('Question must be a string');
  }

  return parseResult.value.question;
};

/**
 * Validates that an environment variable is set.
 *
 * @param value - The environment variable value
 * @param name - The name of the environment variable for error messages
 * @returns The validated value
 * @throws Error if the environment variable is not set
 */
export const validateEnvironmentVariable = (value: string | undefined, name: string): string => {
  if (!isNonEmptyString(value)) {
    throw new Error(`${name} not configured`);
  }
  return value;
};
