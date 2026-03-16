import type { Mock } from 'vitest';
import { postAsk } from '@/features/terminal/api/ask';

vi.mock('@/shared/api/api-client', () => ({ fetchJson: vi.fn() }));

describe('postAsk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('success', () => {
    it('returns response content for successful request', async () => {
      const mockResponse = {
        result: { kwargs: { content: 'Test response content' } },
      };
      const { fetchJson } = await import('@/shared/api/api-client');
      (fetchJson as Mock).mockResolvedValue(mockResponse);

      const result = await postAsk('test question');

      expect(result).toBe('Test response content');
      expect(fetchJson).toHaveBeenCalledWith('/api/ask', {
        method: 'POST',
        body: JSON.stringify({ question: 'test question' }),
      });
    });
    it('handles different question types', async () => {
      const mockResponse = { result: { kwargs: { content: 'Who response' } } };
      const { fetchJson } = await import('@/shared/api/api-client');
      (fetchJson as Mock).mockResolvedValue(mockResponse);

      const result = await postAsk('who');

      expect(result).toBe('Who response');
      expect(fetchJson).toHaveBeenCalledWith('/api/ask', {
        method: 'POST',
        body: JSON.stringify({ question: 'who' }),
      });
    });
  });

  describe('error', () => {
    it('throws error when API call fails', async () => {
      const { fetchJson } = await import('@/shared/api/api-client');
      (fetchJson as Mock).mockRejectedValue(new Error('API Error'));

      await expect(postAsk('test question')).rejects.toThrow('API Error');
    });
    it('throws error when response structure is invalid', async () => {
      const invalidResponse = { result: {} };

      const { fetchJson } = await import('@/shared/api/api-client');
      (fetchJson as Mock).mockResolvedValue(invalidResponse);

      await expect(postAsk('test question')).rejects.toThrow();
    });
  });
});
