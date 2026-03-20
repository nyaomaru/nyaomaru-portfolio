import { type RefObject, useCallback, useEffect, useRef } from 'react';
import { CLICK_INTERVAL, KEY_SPACE } from './config/gameplay';

/**
 * Input wiring options for jump controls.
 */
type UseJumpInputControlsOptions = {
  /** Playfield element that receives pointer-based jump input. */
  gameRef: RefObject<HTMLDivElement | null>;
  /** Callback invoked when a jump input is accepted. */
  onJump: () => void;
};

/**
 * Handles keyboard and pointer jump input.
 * Guards jump spam by sharing a local `canJumpRef` gate.
 *
 * @param options - Input wiring options for keyboard and pointer controls.
 * @param options.gameRef - Playfield element that receives pointer-based jump input.
 * @param options.onJump - Callback executed when an input is accepted as a jump.
 * @returns Reset handler for jump input throttling state.
 */
export function useJumpInputControls({ gameRef, onJump }: UseJumpInputControlsOptions) {
  const canJumpRef = useRef(true);
  const onJumpRef = useRef(onJump);
  const clickThrottleTimeoutIdRef = useRef<number | null>(null);
  onJumpRef.current = onJump;

  const clearClickThrottleTimeout = useCallback(() => {
    if (clickThrottleTimeoutIdRef.current === null) return;
    window.clearTimeout(clickThrottleTimeoutIdRef.current);
    clickThrottleTimeoutIdRef.current = null;
  }, []);

  const resetJumpInput = useCallback(() => {
    clearClickThrottleTimeout();
    canJumpRef.current = true;
  }, [clearClickThrottleTimeout]);

  useEffect(() => {
    const gameElement = gameRef.current;

    const handleKeyDown = (keyEvent: KeyboardEvent) => {
      if (keyEvent.code === KEY_SPACE && canJumpRef.current) {
        canJumpRef.current = false;
        onJumpRef.current();
      }
    };
    const handleKeyUp = (keyEvent: KeyboardEvent) => {
      if (keyEvent.code === KEY_SPACE) {
        canJumpRef.current = true;
      }
    };
    const handleClick = () => {
      if (canJumpRef.current) {
        canJumpRef.current = false;
        onJumpRef.current();
        clearClickThrottleTimeout();
        clickThrottleTimeoutIdRef.current = window.setTimeout(() => {
          canJumpRef.current = true;
          clickThrottleTimeoutIdRef.current = null;
        }, CLICK_INTERVAL);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    gameElement?.addEventListener('pointerdown', handleClick);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      gameElement?.removeEventListener('pointerdown', handleClick);
      clearClickThrottleTimeout();
    };
  }, [clearClickThrottleTimeout, gameRef]);

  return {
    resetJumpInput,
  };
}
