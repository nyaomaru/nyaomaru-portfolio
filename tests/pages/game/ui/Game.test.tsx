import type { MouseEventHandler, ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Game } from '@/pages/game/ui/Game';

const { getJumpGameSoundEnabledMock, setJumpGameSoundEnabledMock, unlockJumpGameAudioMock } =
  vi.hoisted(() => ({
    getJumpGameSoundEnabledMock: vi.fn(() => true),
    setJumpGameSoundEnabledMock: vi.fn(),
    unlockJumpGameAudioMock: vi.fn(),
  }));

vi.mock('@/shared/ui', () => ({
  Button: ({
    children,
    onClick,
    className,
  }: {
    children: ReactNode;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    className?: string;
  }) => (
    <button type='button' onClick={onClick} className={className}>
      {children}
    </button>
  ),
  Card: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock('@/features/jump-game', () => ({
  JumpGame: () => <div data-testid='jump-game' />,
  getJumpGameSoundEnabled: getJumpGameSoundEnabledMock,
  setJumpGameSoundEnabled: setJumpGameSoundEnabledMock,
  unlockJumpGameAudio: unlockJumpGameAudioMock,
}));

describe('Game start interactions', () => {
  beforeEach(() => {
    getJumpGameSoundEnabledMock.mockReturnValue(true);
    setJumpGameSoundEnabledMock.mockClear();
    unlockJumpGameAudioMock.mockClear();
  });

  it('unlocks jump-game audio when the start button is clicked', () => {
    render(<Game />);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));

    expect(unlockJumpGameAudioMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('jump-game')).toBeInTheDocument();
  });

  it('unlocks jump-game audio when the start viewport is tapped', () => {
    render(<Game />);

    fireEvent.pointerDown(screen.getByLabelText('Game viewport'));

    expect(unlockJumpGameAudioMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('jump-game')).toBeInTheDocument();
  });

  it('toggles the sound icon and shared audio state from pointer input', () => {
    render(<Game />);

    const soundToggleButton = screen.getByRole('button', { name: 'Turn sound off' });
    fireEvent.pointerDown(soundToggleButton);

    expect(setJumpGameSoundEnabledMock).toHaveBeenCalledWith(false);
    expect(unlockJumpGameAudioMock).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Turn sound on' })).toBeInTheDocument();

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Turn sound on' }));

    expect(setJumpGameSoundEnabledMock).toHaveBeenCalledWith(true);
    expect(unlockJumpGameAudioMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Turn sound off' })).toBeInTheDocument();
  });

  it('does not toggle the sound icon from keyboard input while focused', () => {
    render(<Game />);

    const soundToggleButton = screen.getByRole('button', { name: 'Turn sound off' });
    soundToggleButton.focus();

    fireEvent.keyDown(soundToggleButton, { key: ' ', code: 'Space' });
    fireEvent.keyUp(soundToggleButton, { key: ' ', code: 'Space' });

    expect(setJumpGameSoundEnabledMock).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Turn sound off' })).toBeInTheDocument();
  });
});
