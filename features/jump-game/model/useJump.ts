import { useCallback, useEffect, useRef } from 'react';
import { isMobile } from '@/shared/lib/window';
import {
  BASELINE_JUMP_DELTA,
  BASELINE_JUMP_MAX_HEIGHT,
  FALLBACK_PLAYER_HEIGHT,
  FALL_SPEED_MULTIPLIER,
  MOBILE_FALL_SPEED_MULTIPLIER,
} from './config/jump';
import { BASELINE_GAME_HEIGHT, FALLBACK_GAME_HEIGHT } from './config/metrics';
import {
  MAX_JUMP_COUNT,
  JUMP_VELOCITY,
  JUMP_UP_INTERVAL,
  JUMP_DOWN_INTERVAL,
  JUMP_LOCK_INTERVAL,
} from './config/gameplay';

// Baseline dimensions used to scale jump behavior with current game height.

/**
 * Interval handles for the current jump animation.
 * `up` and `down` run exclusively and are reset before starting a new jump.
 */
type JumpAnimationHandles = {
  /** Interval id for ascent animation. */
  up?: number;
  /** Interval id for descent animation. */
  down?: number;
};

/**
 * Player jump controller.
 * Handles double-jump limits, lock timing, and frame-by-frame vertical position updates.
 *
 * @param playerRef - Player element whose bottom style is animated during jump motion.
 * @returns Jump API and refs consumed by scene and animation hooks.
 */
export function useJump(playerRef: React.RefObject<HTMLDivElement>) {
  const jumpCountRef = useRef(0);
  const risingRef = useRef(false);
  const onGroundRef = useRef(true);
  const jumpLockRef = useRef(false);
  const currentAnimRef = useRef<JumpAnimationHandles>({});
  const posRef = useRef(0);
  const jumpLockTimeoutRef = useRef<number | undefined>(undefined);

  const jump = () => {
    if (!canJump()) return;

    cleanupIntervals();
    lockJump();

    updateJumpCount();
    prepareJump();

    startUpAnimation();
  };

  const canJump = () =>
    !jumpLockRef.current && (onGroundRef.current || jumpCountRef.current < MAX_JUMP_COUNT);

  const cleanupIntervals = () => {
    clearInterval(currentAnimRef.current.up);
    clearInterval(currentAnimRef.current.down);
    currentAnimRef.current.up = undefined;
    currentAnimRef.current.down = undefined;
  };

  const clearJumpLockTimeout = () => {
    if (jumpLockTimeoutRef.current === undefined) return;
    clearTimeout(jumpLockTimeoutRef.current);
    jumpLockTimeoutRef.current = undefined;
  };

  const lockJump = () => {
    clearJumpLockTimeout();
    jumpLockRef.current = true;
    jumpLockTimeoutRef.current = window.setTimeout(() => {
      jumpLockRef.current = false;
      jumpLockTimeoutRef.current = undefined;
    }, JUMP_LOCK_INTERVAL);
  };

  const updateJumpCount = () => {
    jumpCountRef.current += 1;
  };

  const prepareJump = () => {
    onGroundRef.current = false;
    risingRef.current = true;
    posRef.current = parseInt(playerRef.current?.style.bottom || '0', 10);
  };

  const startUpAnimation = () => {
    const gameElement = playerRef.current?.parentElement as HTMLDivElement | null;
    const gameHeight = gameElement?.clientHeight || FALLBACK_GAME_HEIGHT;
    const playerHeight = playerRef.current?.clientHeight || FALLBACK_PLAYER_HEIGHT;
    const scale = gameHeight / BASELINE_GAME_HEIGHT;
    const jumpDelta = BASELINE_JUMP_DELTA * scale;
    const jumpCeiling = BASELINE_JUMP_MAX_HEIGHT * scale;
    const containerCeiling = Math.max(0, gameHeight - playerHeight);
    const maxHeight = Math.min(posRef.current + jumpDelta, jumpCeiling, containerCeiling);

    const up = window.setInterval(() => {
      if (posRef.current + JUMP_VELOCITY >= maxHeight) {
        posRef.current = maxHeight;
        applyPosition();

        clearInterval(up);
        currentAnimRef.current.up = undefined;
        risingRef.current = false;

        startDownAnimation();
      } else {
        posRef.current += JUMP_VELOCITY;
        applyPosition();
      }
    }, JUMP_UP_INTERVAL);

    currentAnimRef.current.up = up;
  };

  const startDownAnimation = () => {
    const isMobileViewport = isMobile();
    const downVelocity =
      JUMP_VELOCITY * FALL_SPEED_MULTIPLIER * (isMobileViewport ? MOBILE_FALL_SPEED_MULTIPLIER : 1);

    const down = window.setInterval(() => {
      if (posRef.current <= downVelocity) {
        posRef.current = 0;
        applyPosition();

        clearInterval(down);
        currentAnimRef.current.down = undefined;

        jumpCountRef.current = 0;
        onGroundRef.current = true;
      } else {
        posRef.current -= downVelocity;
        applyPosition();
      }
    }, JUMP_DOWN_INTERVAL);

    currentAnimRef.current.down = down;
  };

  const applyPosition = () => {
    if (playerRef.current) {
      playerRef.current.style.bottom = `${posRef.current}px`;
    }
  };

  /**
   * Resets jump internals so retry/restart always begins from a clean grounded state.
   */
  const resetJumpState = useCallback(() => {
    cleanupIntervals();
    clearJumpLockTimeout();
    jumpCountRef.current = 0;
    risingRef.current = false;
    onGroundRef.current = true;
    jumpLockRef.current = false;
    posRef.current = 0;
  }, []);

  useEffect(
    () => () => {
      cleanupIntervals();
      clearJumpLockTimeout();
    },
    [],
  );

  return {
    jump,
    isOnGroundRef: onGroundRef,
    resetJumpState,
  };
}
