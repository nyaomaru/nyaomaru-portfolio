import { useCallback, useRef } from 'react';
import { isMobile } from '@/shared/lib/window';
import {
  BASELINE_JUMP_DELTA,
  BASELINE_JUMP_MAX_HEIGHT,
  FALLBACK_PLAYER_HEIGHT,
  FALL_SPEED_MULTIPLIER,
  JUMP_APEX_HOLD_MS,
  MOBILE_FALL_SPEED_MULTIPLIER,
} from './config/jump';
import { getJumpSoundEffect } from './audio';
import { BASELINE_GAME_HEIGHT, FALLBACK_GAME_HEIGHT } from './config/metrics';
import {
  MAX_JUMP_COUNT,
  JUMP_VELOCITY,
  JUMP_UP_INTERVAL,
  JUMP_DOWN_INTERVAL,
  JUMP_LOCK_INTERVAL,
} from './config/gameplay';

// Baseline dimensions used to scale jump behavior with current game height.
const ASCENT_VELOCITY_PX_PER_MS = JUMP_VELOCITY / JUMP_UP_INTERVAL;

/**
 * Named phases for jump motion driven by the shared animation frame loop.
 */
type JumpMotionPhase = 'idle' | 'ascending' | 'apexHold' | 'descending';

/**
 * Per-frame jump update inputs.
 */
type UpdateJumpFrameParams = {
  /** Current high-resolution frame timestamp from the game loop. */
  nowMs: number;
  /** Elapsed frame time in milliseconds used for delta-based jump motion. */
  deltaTimeMs: number;
};

/**
 * Player jump controller.
 * Handles double-jump limits, lock timing, and per-frame vertical position updates
 * coordinated by the shared game loop.
 *
 * @param playerRef - Player element whose bottom style is animated during jump motion.
 * @returns Jump API and refs consumed by scene and animation hooks.
 */
export function useJump(playerRef: React.RefObject<HTMLDivElement | null>) {
  const jumpCountRef = useRef(0);
  const risingRef = useRef(false);
  const onGroundRef = useRef(true);
  const jumpMotionPhaseRef = useRef<JumpMotionPhase>('idle');
  const posRef = useRef(0);
  const jumpLockUntilMsRef = useRef(0);
  const jumpMaxHeightRef = useRef(0);
  const jumpApexHoldUntilMsRef = useRef(0);
  const descentVelocityPxPerMsRef = useRef(0);

  const jump = () => {
    const nowMs = performance.now();
    if (!canJump(nowMs)) return;

    lockJump(nowMs);

    updateJumpCount();
    prepareJump(nowMs);
    playJumpSoundEffect();
  };

  const canJump = (nowMs: number) =>
    nowMs >= jumpLockUntilMsRef.current &&
    (onGroundRef.current || jumpCountRef.current < MAX_JUMP_COUNT);

  const lockJump = (nowMs: number) => {
    jumpLockUntilMsRef.current = nowMs + JUMP_LOCK_INTERVAL;
  };

  const updateJumpCount = () => {
    jumpCountRef.current += 1;
  };

  const prepareJump = (nowMs: number) => {
    const gameElement = playerRef.current?.parentElement as HTMLDivElement | null;
    const gameHeight = gameElement?.clientHeight || FALLBACK_GAME_HEIGHT;
    const playerHeight = playerRef.current?.clientHeight || FALLBACK_PLAYER_HEIGHT;
    const scale = gameHeight / BASELINE_GAME_HEIGHT;
    const jumpDelta = BASELINE_JUMP_DELTA * scale;
    const jumpCeiling = BASELINE_JUMP_MAX_HEIGHT * scale;
    const containerCeiling = Math.max(0, gameHeight - playerHeight);

    onGroundRef.current = false;
    risingRef.current = true;
    posRef.current = parseInt(playerRef.current?.style.bottom || '0', 10);
    jumpMaxHeightRef.current = Math.min(posRef.current + jumpDelta, jumpCeiling, containerCeiling);
    jumpApexHoldUntilMsRef.current = nowMs + JUMP_APEX_HOLD_MS;
    descentVelocityPxPerMsRef.current =
      (JUMP_VELOCITY * FALL_SPEED_MULTIPLIER * (isMobile() ? MOBILE_FALL_SPEED_MULTIPLIER : 1)) /
      JUMP_DOWN_INTERVAL;
    jumpMotionPhaseRef.current = 'ascending';
  };

  const applyPosition = () => {
    if (playerRef.current) {
      playerRef.current.style.bottom = `${posRef.current}px`;
    }
  };

  const updateJumpFrame = useCallback(({ nowMs, deltaTimeMs }: UpdateJumpFrameParams) => {
    if (jumpMotionPhaseRef.current === 'idle') return;

    if (jumpMotionPhaseRef.current === 'ascending') {
      posRef.current = Math.min(
        jumpMaxHeightRef.current,
        posRef.current + ASCENT_VELOCITY_PX_PER_MS * deltaTimeMs,
      );
      applyPosition();
      if (posRef.current >= jumpMaxHeightRef.current) {
        risingRef.current = false;
        jumpMotionPhaseRef.current = 'apexHold';
        jumpApexHoldUntilMsRef.current = nowMs + JUMP_APEX_HOLD_MS;
      }
      return;
    }

    if (jumpMotionPhaseRef.current === 'apexHold') {
      if (nowMs < jumpApexHoldUntilMsRef.current) return;
      jumpMotionPhaseRef.current = 'descending';
      return;
    }

    posRef.current = Math.max(0, posRef.current - descentVelocityPxPerMsRef.current * deltaTimeMs);
    applyPosition();
    if (posRef.current > 0) return;

    jumpMotionPhaseRef.current = 'idle';
    jumpCountRef.current = 0;
    onGroundRef.current = true;
  }, []);

  const playJumpSoundEffect = () => {
    const jumpSound = getJumpSoundEffect();
    if (!jumpSound) return;

    jumpSound.currentTime = 0;
    const playbackAttempt = jumpSound.play();
    if (!playbackAttempt) return;

    void playbackAttempt.catch(() => {
      // Ignore autoplay-blocked or interrupted playback. Jump behavior should continue unchanged.
    });
  };

  /**
   * Resets jump internals so retry/restart always begins from a clean grounded state.
   */
  const resetJumpState = useCallback(() => {
    jumpCountRef.current = 0;
    risingRef.current = false;
    onGroundRef.current = true;
    jumpMotionPhaseRef.current = 'idle';
    jumpLockUntilMsRef.current = 0;
    jumpMaxHeightRef.current = 0;
    jumpApexHoldUntilMsRef.current = 0;
    descentVelocityPxPerMsRef.current = 0;
    posRef.current = 0;
    applyPosition();
  }, []);

  return {
    jump,
    isOnGroundRef: onGroundRef,
    resetJumpState,
    updateJumpFrame,
  };
}
