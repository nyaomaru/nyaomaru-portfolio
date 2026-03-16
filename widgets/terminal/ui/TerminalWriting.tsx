import { useThinkingDots } from '@/shared/lib/terminal';

export const TerminalWaiting = ({ isLoading }: { isLoading: boolean }) => {
  const thinkingText = useThinkingDots(isLoading);

  if (!isLoading) return null;

  return <div className='text-primary whitespace-pre'>{thinkingText}</div>;
};
