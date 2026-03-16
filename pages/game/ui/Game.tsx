import { useCallback, useEffect, useRef, useState } from 'react';
import { JumpGame } from '@/features/jump-game';
import { GAME } from '@/shared/constants';
import { Button, Card } from '@/shared/ui';

const JUMP_MESSAGE_ICON = '/assets/text/nyaomaru_web_icon_text_text_space_or_click_tap_to_jump.svg';
const JUMP_MESSAGE_ICON_MOBILE =
  '/assets/text/nyaomaru_web_icon_text_text_space_or_click_tap_to_jump_mobile.svg';
const START_NYAOMARU_ICON = '/assets/icons/nyaomaru_game_graphic_game_nyaomaru_icon.svg';
const START_GAME_TITLE_ICON = '/assets/icons/nyaomaru_text_game_title.svg';
const MOBILE_BREAKPOINT_MEDIA_QUERY = '(max-width: 639px)';

const START_SCREEN_CLASS_NAME =
  'relative w-full h-[min(24rem,62vh)] sm:h-auto sm:aspect-[67/20] overflow-hidden cursor-pointer select-none';
const START_SCREEN_TITLE_LAYER_CLASS_NAME =
  'absolute inset-0 flex items-center justify-center pointer-events-none px-8';
const START_SCREEN_TITLE_IMAGE_CLASS_NAME =
  'w-[56%] min-w-[180px] max-w-[520px] sm:w-[28%] sm:min-w-[90px] sm:max-w-[300px] h-auto object-contain mt-4';
const START_SCREEN_PLAYER_LAYER_CLASS_NAME =
  'absolute bottom-0 aspect-square pointer-events-none left-[max(0.5rem,2%)] sm:left-[max(2.5rem,8%)]';
const START_PLAYER_STYLE = {
  height: '14%',
  minHeight: '28px',
  maxHeight: '64px',
} as const;
const PAGE_CONTAINER_CLASS_NAME =
  'w-full max-w-[1440px] mx-auto min-h-screen justify-center flex flex-col items-center px-4';
const PAGE_HEADER_CLASS_NAME = 'mb-4 min-h-[2.5rem] flex items-center justify-center';
const GAME_MESSAGE_IMAGE_CLASS_NAME = 'h-[0.8rem] max-w-none sm:h-4 sm:max-w-full';
const GAME_VIEWPORT_WRAPPER_CLASS_NAME = 'w-full flex justify-center';
const GAME_VIEWPORT_CARD_CLASS_NAME = 'w-full max-w-[1340px] lg:w-[69.8vw] p-2';
const FOOTER_CLASS_NAME = 'mt-8 h-10 w-full flex justify-center';
const ACTION_BUTTON_CLASS_NAME = 'px-4 text-primary';

const StartScreen = () => (
  <section className={START_SCREEN_CLASS_NAME} aria-label='Jump game start screen'>
    <div className={START_SCREEN_TITLE_LAYER_CLASS_NAME} aria-hidden>
      <img
        src={START_GAME_TITLE_ICON}
        alt=''
        className={START_SCREEN_TITLE_IMAGE_CLASS_NAME}
        draggable={false}
      />
    </div>
    <div className={START_SCREEN_PLAYER_LAYER_CLASS_NAME} style={START_PLAYER_STYLE} aria-hidden>
      <img
        src={START_NYAOMARU_ICON}
        alt=''
        className='block w-full h-full object-contain object-center'
        draggable={false}
      />
    </div>
  </section>
);

const Game = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isRestartReady, setIsRestartReady] = useState(false);
  const [gameMessage, setGameMessage] = useState('');
  const resetGameRef = useRef<(() => void) | null>(null);
  const startAreaRef = useRef<HTMLElement | null>(null);

  const handleStart = useCallback(() => {
    setHasStarted(true);
    setIsGameOver(false);
    setIsRestartReady(false);
  }, []);

  const handleRestart = useCallback(() => {
    resetGameRef.current?.();
  }, []);

  useEffect(() => {
    const shouldHandleStart = !hasStarted;
    const shouldBlockRestartShortcut = hasStarted && isGameOver;
    const shouldHandleRestart = shouldBlockRestartShortcut && isRestartReady;
    if (!shouldHandleStart && !shouldBlockRestartShortcut) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== GAME.KEYBOARD.SPACE) return;
      event.preventDefault();
      if (shouldHandleStart) {
        handleStart();
        return;
      }
      if (shouldHandleRestart) {
        handleRestart();
      }
    };
    const handlePointerDown = () => {
      if (shouldHandleStart) {
        handleStart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const startArea = shouldHandleStart ? startAreaRef.current : null;
    startArea?.addEventListener('pointerdown', handlePointerDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      startArea?.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [hasStarted, isGameOver, isRestartReady, handleRestart, handleStart]);

  const handleRegisterReset = useCallback((resetFn: () => void) => {
    resetGameRef.current = resetFn;
  }, []);

  return (
    <main className={PAGE_CONTAINER_CLASS_NAME}>
      <header className={PAGE_HEADER_CLASS_NAME}>
        <h1 className='text-2xl font-bold text-center'>
          {!hasStarted || gameMessage === GAME.MESSAGES.DEFAULT ? (
            <picture>
              <source media={MOBILE_BREAKPOINT_MEDIA_QUERY} srcSet={JUMP_MESSAGE_ICON_MOBILE} />
              <img
                src={JUMP_MESSAGE_ICON}
                alt={GAME.MESSAGES.DEFAULT}
                className={GAME_MESSAGE_IMAGE_CLASS_NAME}
              />
            </picture>
          ) : (
            gameMessage
          )}
        </h1>
      </header>
      <section className={GAME_VIEWPORT_WRAPPER_CLASS_NAME} aria-label='Jump game play area'>
        <Card asChild className={GAME_VIEWPORT_CARD_CLASS_NAME}>
          <section aria-label='Game viewport' ref={startAreaRef}>
            {hasStarted ? (
              <JumpGame
                onGameOverChange={setIsGameOver}
                onRegisterReset={handleRegisterReset}
                onGameMessageChange={setGameMessage}
                onRestartReadyChange={setIsRestartReady}
              />
            ) : (
              <StartScreen />
            )}
          </section>
        </Card>
      </section>
      <footer className={FOOTER_CLASS_NAME}>
        {!hasStarted ? (
          <Button variant='secondary' onClick={handleStart} className={ACTION_BUTTON_CLASS_NAME}>
            Start
          </Button>
        ) : isGameOver && isRestartReady ? (
          <Button variant='secondary' onClick={handleRestart} className={ACTION_BUTTON_CLASS_NAME}>
            Restart
          </Button>
        ) : null}
      </footer>
    </main>
  );
};
Game.displayName = 'Game';

export { Game };
