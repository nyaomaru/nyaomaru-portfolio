import type { Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTerminal } from '@/widgets/terminal/model/useTerminal';

vi.mock('@/features/terminal/api', () => ({ postAsk: vi.fn() }));
vi.mock('@remix-run/react', () => ({
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));

describe('useTerminal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('initializes with initial message', () => {
      const { result } = renderHook(() => useTerminal());

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].text).toContain('Welcome');
      expect(result.current.history[0].isTyping).toBe(true);
    });
    it('initializes with empty input', () => {
      const { result } = renderHook(() => useTerminal());

      expect(result.current.input).toBe('');
    });
  });

  describe('command execution', () => {
    it('adds command to history when executed', async () => {
      const { result } = renderHook(() => useTerminal());
      const mockPostAsk = (await import('@/features/terminal/api')).postAsk as Mock;
      mockPostAsk.mockResolvedValue('Test response');

      await act(async () => {
        await result.current.execCommand('test command');
      });

      expect(result.current.history).toHaveLength(3); // Initial + command + response
      expect(result.current.history[1].text).toBe('> test command');
    });
  });
});
