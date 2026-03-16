import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { useAutoScroll } from '@/shared/lib/scroll';
import { TerminalHeader } from './TerminalHeader';
import { Card } from '@/shared/ui';
import { History } from './History';
import { InputLine } from './InputLine';
import { TerminalWaiting } from './TerminalWriting';
import { useTerminal } from '../model/useTerminal';

const DEFAULT_TERMINAL_WIDTH_REM = 60;
const FALLBACK_ROOT_FONT_SIZE_PX = 16;
const TERMINAL_MIN_WIDTH_PX = 384;

const TERMINAL_CARD_CLASS_NAME =
  'w-[60rem] max-w-full aspect-[3/4] sm:aspect-video min-w-0 sm:min-w-[24rem] mx-2 sm:mx-0 flex flex-col shadow-2xl p-2 relative';
const TERMINAL_CONTENT_CLASS_NAME =
  'flex-1 bg-background p-4 text-foreground font-mono flex flex-col min-h-0';
const RESIZE_HANDLE_CLASS_NAME =
  'h-6 w-6 touch-none opacity-0 hover:opacity-40 bg-primary/40 absolute';
const RESIZE_NW_CLASS_NAME = `${RESIZE_HANDLE_CLASS_NAME} left-0 top-0 cursor-nwse-resize`;
const RESIZE_NE_CLASS_NAME = `${RESIZE_HANDLE_CLASS_NAME} right-0 top-0 cursor-nesw-resize`;
const RESIZE_SE_CLASS_NAME = `${RESIZE_HANDLE_CLASS_NAME} right-0 bottom-0 cursor-nwse-resize`;
const RESIZE_SW_CLASS_NAME = `${RESIZE_HANDLE_CLASS_NAME} left-0 bottom-0 cursor-nesw-resize`;

const Terminal = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [widthRatio, setWidthRatio] = useState<number | null>(null);
  const resizeState = useRef<{
    corner: 'nw' | 'ne' | 'sw' | 'se' | null;
    left: number;
    right: number;
    maxWidth: number;
  }>({
    corner: null,
    left: 0,
    right: 0,
    maxWidth: 0,
  });

  const {
    history,
    input,
    isLoading,
    setInput,
    execCommand,
    handleTypingComplete,
    resetTerminal,
    showAsciiArt,
  } = useTerminal();
  const { containerRef } = useAutoScroll(history);

  useEffect(() => {
    if (!cardRef.current?.parentElement) return;
    const parentWidth = cardRef.current.parentElement.getBoundingClientRect().width;
    if (!parentWidth) return;
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const defaultWidthPx =
      DEFAULT_TERMINAL_WIDTH_REM *
      (Number.isNaN(rootFontSize) ? FALLBACK_ROOT_FONT_SIZE_PX : rootFontSize);
    const minWidth = Math.min(TERMINAL_MIN_WIDTH_PX, parentWidth);
    const clampedWidth = Math.max(minWidth, Math.min(parentWidth, defaultWidthPx));
    setWidthRatio(clampedWidth / parentWidth);
  }, []);

  const startResize =
    (corner: 'nw' | 'ne' | 'sw' | 'se') => (event: PointerEvent<HTMLButtonElement>) => {
      if (!cardRef.current) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      const rect = cardRef.current.getBoundingClientRect();
      const parentRect = cardRef.current.parentElement?.getBoundingClientRect();
      resizeState.current = {
        corner,
        left: rect.left,
        right: rect.right,
        maxWidth: parentRect ? parentRect.width : window.innerWidth,
      };
    };

  const onResize = (event: PointerEvent<HTMLButtonElement>) => {
    if (!resizeState.current.corner) return;
    const { corner, left, right, maxWidth } = resizeState.current;
    const minWidth = Math.min(TERMINAL_MIN_WIDTH_PX, maxWidth);
    if (!maxWidth) return;
    const nextWidth =
      corner === 'ne' || corner === 'se' ? event.clientX - left : right - event.clientX;
    const clampedWidth = Math.max(minWidth, Math.min(maxWidth, nextWidth));
    setWidthRatio(clampedWidth / maxWidth);
  };

  const endResize = (event: PointerEvent<HTMLButtonElement>) => {
    resizeState.current.corner = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <Card
      ref={cardRef}
      className={TERMINAL_CARD_CLASS_NAME}
      style={widthRatio !== null ? { width: `${widthRatio * 100}%` } : undefined}
    >
      <TerminalHeader onRedButtonClick={resetTerminal} onGreenButtonClick={showAsciiArt} />

      <div className={TERMINAL_CONTENT_CLASS_NAME}>
        <History ref={containerRef} history={history} onDone={handleTypingComplete} />

        {isLoading && <TerminalWaiting isLoading={isLoading} />}

        <InputLine value={input} onChange={setInput} onSubmit={execCommand} />
      </div>

      <button
        type='button'
        aria-label='Resize terminal (top-left)'
        className={RESIZE_NW_CLASS_NAME}
        onPointerDown={startResize('nw')}
        onPointerMove={onResize}
        onPointerUp={endResize}
        onPointerCancel={endResize}
      />
      <button
        type='button'
        aria-label='Resize terminal (top-right)'
        className={RESIZE_NE_CLASS_NAME}
        onPointerDown={startResize('ne')}
        onPointerMove={onResize}
        onPointerUp={endResize}
        onPointerCancel={endResize}
      />
      <button
        type='button'
        aria-label='Resize terminal (bottom-right)'
        className={RESIZE_SE_CLASS_NAME}
        onPointerDown={startResize('se')}
        onPointerMove={onResize}
        onPointerUp={endResize}
        onPointerCancel={endResize}
      />
      <button
        type='button'
        aria-label='Resize terminal (bottom-left)'
        className={RESIZE_SW_CLASS_NAME}
        onPointerDown={startResize('sw')}
        onPointerMove={onResize}
        onPointerUp={endResize}
        onPointerCancel={endResize}
      />
    </Card>
  );
};
Terminal.displayName = 'Terminal';

export { Terminal };
