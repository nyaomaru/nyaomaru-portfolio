import { forwardRef } from 'react';
import { Typewriter } from '@/shared/ui';
import type { TerminalHistory } from '../model/types';

type HistoryProps = {
  /** Array of terminal history entries to display */
  history: TerminalHistory[];
  /** Callback function called when a typewriter animation completes */
  onDone: (idx: number) => void;
};

const History = forwardRef<HTMLDivElement, HistoryProps>(({ history, onDone }, ref) => (
  <div ref={ref} className='flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-0'>
    {history.map((line, i) => (
      <div key={i} className='whitespace-pre-wrap leading-relaxed'>
        {line.isTyping ? (
          <Typewriter text={line.text} speed={10} onComplete={() => onDone(i)} />
        ) : (
          line.text
        )}
      </div>
    ))}
  </div>
));
History.displayName = 'History';

export { History };
