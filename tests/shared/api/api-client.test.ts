import type { Mock } from 'vitest';
import { fetchJson } from '@/shared/api/api-client';

global.fetch = vi.fn();

describe('fetchJson', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('success', () => {
    it('returns parsed JSON data for successful response', async () => {
      const mockData = { id: 1, name: 'test' };
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockData),
      };
      (fetch as Mock).mockResolvedValue(mockResponse);

      const result = await fetchJson<typeof mockData>('/api/test');

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('/api/test', {
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('includes custom headers when provided', async () => {
      const mockData = { success: true };
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockData),
      };
      (fetch as Mock).mockResolvedValue(mockResponse);
      const customHeaders = { Authorization: 'Bearer token' };

      await fetchJson('/api/test', { headers: customHeaders });

      expect(fetch).toHaveBeenCalledWith('/api/test', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token',
        },
      });
    });

    it('includes request body when provided', async () => {
      const mockData = { success: true };
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockData),
      };
      (fetch as Mock).mockResolvedValue(mockResponse);
      const requestBody = { data: 'test' };

      await fetchJson('/api/test', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      expect(fetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  describe('error', () => {
    it('throws error for non-ok response', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        json: vi.fn().mockResolvedValue({ error: 'Not found' }),
      };
      (fetch as Mock).mockResolvedValue(mockResponse);

      await expect(fetchJson('/api/test')).rejects.toThrow('Not found');
    });

    it('throws default error message when response has no error field', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({}),
      };
      (fetch as Mock).mockResolvedValue(mockResponse);

      await expect(fetchJson('/api/test')).rejects.toThrow('API Error (500)');
    });

    it('throws default error when JSON parsing fails', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: vi.fn().mockRejectedValue(new Error('Parse error')),
      };
      (fetch as Mock).mockResolvedValue(mockResponse);

      await expect(fetchJson('/api/test')).rejects.toThrow('API Error (500)');
    });
  });
});
