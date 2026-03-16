import type { ActionFunctionArgs } from '@remix-run/node';
import { define, isError, isString, oneOfValues } from 'is-kit';
import { makeProfileQAChain } from '@/features/terminal/server';
import {
  extractContentFromLangChainResponse,
  createStandardResponse,
  createErrorResponse,
  validateRequestMethod,
  validateQuestion,
  validateEnvironmentVariable,
} from '@/shared/lib/api';
import { HTTP_STATUS } from '@/shared/constants';

const isValidationErrorMessage = oneOfValues(
  'Question is required',
  'Question must be a string',
  'Request body is required',
);
const isConfigurationErrorMessage = define<string>(
  (message): message is string => isString(message) && message.includes('not configured'),
);

export async function action({ request }: ActionFunctionArgs) {
  try {
    // Validate request method
    if (!validateRequestMethod(request, 'POST')) {
      return Response.json(createErrorResponse('Method not allowed'), {
        status: HTTP_STATUS.METHOD_NOT_ALLOWED,
      });
    }

    // Parse and validate request body
    const body = await request.json();
    const question = validateQuestion(body);

    // Validate environment variable
    const apiKey = validateEnvironmentVariable(process.env.OPENAI_API_KEY, 'OpenAI API key');

    // Process the request
    const result = await makeProfileQAChain(apiKey, question);
    const content = extractContentFromLangChainResponse(result);

    return Response.json(createStandardResponse(content));
  } catch (error) {
    console.error('API error:', error);
    const errorResponse = createErrorResponse(error);

    // Determine status code based on error type
    let status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR; // Default to 500 for internal errors

    if (isError(error)) {
      if (isConfigurationErrorMessage(error.message)) {
        status = HTTP_STATUS.INTERNAL_SERVER_ERROR; // Configuration errors are 500
      } else if (isValidationErrorMessage(error.message)) {
        status = HTTP_STATUS.BAD_REQUEST; // Validation errors are 400
      }
    }

    return Response.json(errorResponse, { status });
  }
}
