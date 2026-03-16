import type { ActionFunctionArgs, AppLoadContext } from '@remix-run/node';
import { action } from '@/app/routes/api.ask';

vi.mock('@/features/terminal/server', () => ({
  makeProfileQAChain: vi.fn(),
}));

const originalEnv = process.env;
const createActionArgs = (request: Request): ActionFunctionArgs => ({
  request,
  params: {},
  context: {} as AppLoadContext,
});

describe('api.ask action', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('request validation', () => {
    it('returns 405 for non-POST requests', async () => {
      const request = new Request('http://localhost/api/ask', {
        method: 'GET',
      });

      const response = await action(createActionArgs(request));
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.error).toBe('Method not allowed');
    });

    it('returns 400 when question is missing', async () => {
      const request = new Request('http://localhost/api/ask', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await action(createActionArgs(request));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Question is required');
    });

    it('returns 400 when question is not a string', async () => {
      const request = new Request('http://localhost/api/ask', {
        method: 'POST',
        body: JSON.stringify({ question: 123 }),
      });

      const response = await action(createActionArgs(request));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Question must be a string');
    });
  });

  describe('API key validation', () => {
    it('returns 500 when OpenAI API key is not configured', async () => {
      process.env.OPENAI_API_KEY = undefined;
      const request = new Request('http://localhost/api/ask', {
        method: 'POST',
        body: JSON.stringify({ question: 'test question' }),
      });

      const response = await action(createActionArgs(request));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('OpenAI API key not configured');
    });
  });

  describe('successful requests', () => {
    it('returns successful response with content', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      const mockResult = { kwargs: { content: 'Test response content' } };
      const { makeProfileQAChain } = await import('@/features/terminal/server');
      vi.mocked(makeProfileQAChain).mockResolvedValue(
        mockResult as unknown as Awaited<ReturnType<typeof makeProfileQAChain>>,
      );
      const request = new Request('http://localhost/api/ask', {
        method: 'POST',
        body: JSON.stringify({ question: 'test question' }),
      });

      const response = await action(createActionArgs(request));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.result.kwargs.content).toBe('Test response content');
      expect(makeProfileQAChain).toHaveBeenCalledWith('test-api-key', 'test question');
    });

    it('handles different response structures', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      const mockResult = { content: 'Direct content response' };
      const { makeProfileQAChain } = await import('@/features/terminal/server');
      vi.mocked(makeProfileQAChain).mockResolvedValue(
        mockResult as unknown as Awaited<ReturnType<typeof makeProfileQAChain>>,
      );
      const request = new Request('http://localhost/api/ask', {
        method: 'POST',
        body: JSON.stringify({ question: 'test question' }),
      });

      const response = await action(createActionArgs(request));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.result.kwargs.content).toBe('Direct content response');
    });
  });

  describe('error handling', () => {
    it('returns 500 when makeProfileQAChain throws error', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      const { makeProfileQAChain } = await import('@/features/terminal/server');
      vi.mocked(makeProfileQAChain).mockRejectedValue(new Error('API Error'));
      const request = new Request('http://localhost/api/ask', {
        method: 'POST',
        body: JSON.stringify({ question: 'test question' }),
      });

      const response = await action(createActionArgs(request));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('API Error');
    });
  });
});
