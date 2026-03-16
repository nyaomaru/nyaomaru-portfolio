import { useState, useCallback } from 'react';
import { useSearchParams } from '@remix-run/react';
import { equals, isError } from 'is-kit';
import { postAsk } from '@/features/terminal';
import { isMobile } from '@/shared/lib/window';
import type { TerminalHistory } from './types';
import { INITIAL_MESSAGE } from './terminal';

/**
 * React hook that encapsulates all business logic for the "Terminal" widget.
 * It sends every command to the LangChain API and appends the result to history.
 */
export const useTerminal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [history, setHistory] = useState<TerminalHistory[]>([
    { text: INITIAL_MESSAGE, isTyping: true },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const showSvg = equals('true')(searchParams.get('showSvg'));

  const handleTypingComplete = useCallback((idx: number) => {
    setHistory((prev: TerminalHistory[]) =>
      prev.map((line: TerminalHistory, index: number) =>
        index === idx ? { ...line, isTyping: false } : line,
      ),
    );
  }, []);

  const resetTerminal = useCallback(() => {
    setHistory([{ text: INITIAL_MESSAGE, isTyping: true }]);
    setInput('');
  }, []);

  const toggleSvg = useCallback(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (showSvg) {
      newSearchParams.delete('showSvg');
    } else {
      newSearchParams.set('showSvg', 'true');
    }
    setSearchParams(newSearchParams);
  }, [searchParams, setSearchParams, showSvg]);

  const showAsciiArt = useCallback(() => {
    const asciiArtDesktop = [
      '    ╔═════════════════════╗',
      '    ║                     ║',
      '    ║       /\\___/\\       ║',
      '    ║      (  o o  )      ║',
      '    ║      (  =^=  )      ║',
      '    ║       (______)      ║',
      '    ║                     ║',
      '    ║       Nyaomaru      ║',
      '    ║                     ║',
      '    ╚═════════════════════╝',
    ].join('\n');
    const asciiArtMobile = [
      '    ╔══════════════╗',
      '    ║   /\\___/\\    ║',
      '    ║  (  o o  )   ║',
      '    ║  (  =^=  )   ║',
      '    ║   (______)   ║',
      '    ║   Nyaomaru   ║',
      '    ╚══════════════╝',
    ].join('\n');
    const isMobileViewport = isMobile();
    setHistory((prev: TerminalHistory[]) => [
      ...prev,
      { text: isMobileViewport ? asciiArtMobile : asciiArtDesktop, isTyping: true },
    ]);
  }, []);

  const execCommand = useCallback(async (cmd: string) => {
    setIsLoading(true);

    setHistory((prev: TerminalHistory[]) => [...prev, { text: `> ${cmd}`, isTyping: true }]);
    setInput('');

    try {
      const response = await postAsk(cmd);
      setHistory((prev: TerminalHistory[]) => [...prev, { text: response, isTyping: true }]);
    } catch (err: unknown) {
      const errorMessage = isError(err) ? err.message : 'Unknown error';
      setHistory((prev: TerminalHistory[]) => [
        ...prev,
        { text: `❌ Error: ${errorMessage}`, isTyping: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    history,
    input,
    setInput,
    execCommand,
    handleTypingComplete,
    resetTerminal,
    toggleSvg,
    showAsciiArt,
    showSvg,
    isLoading,
  };
};
