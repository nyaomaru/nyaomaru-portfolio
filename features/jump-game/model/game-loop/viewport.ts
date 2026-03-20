import type { RefObject } from 'react';
import { isMobile } from '@/shared/lib/window';
import {
  BASELINE_ARM_RIGHT_OFFSET,
  BASELINE_BOSS_BASE_WIDTH,
  BASELINE_GAME_HEIGHT,
  FALLBACK_GAME_HEIGHT,
  FALLBACK_GAME_WIDTH,
  MOBILE_BOSS_RIGHT_MARGIN_MIN_PX,
  MOBILE_BOSS_RIGHT_MARGIN_RATIO,
  MOBILE_BOSS_RIGHT_SHIFT_BASELINE_PX,
} from '../config/game-loop';

/**
 * Callback set for runtime viewport metrics used by jump-game loop calculations.
 */
export type GameViewportMetrics = {
  /** Returns current game viewport width in pixels. */
  getGameWidth: () => number;
  /** Returns current game viewport height in pixels. */
  getGameHeight: () => number;
  /** Returns viewport-to-baseline height scale ratio. */
  getBaselineScale: () => number;
  /** Returns boss base width in pixels for current scale. */
  getBossBaseWidthPx: () => number;
  /** Returns boss anchor right offset in pixels for current viewport mode. */
  getBossRightOffsetPx: (isMobileViewport?: boolean) => number;
};

/**
 * Creates viewport-derived metric callbacks for frame computations.
 *
 * @param gameRef - Game viewport element reference.
 * @returns Callback set for width/height/scale and boss placement metrics.
 */
export const createGameViewportMetrics = (
  gameRef: RefObject<HTMLDivElement | null>,
): GameViewportMetrics => {
  const getGameWidth = () => {
    const gameElement = gameRef.current;
    if (!gameElement) {
      return typeof window !== 'undefined' ? window.innerWidth : FALLBACK_GAME_WIDTH;
    }
    return (
      gameElement.clientWidth || gameElement.getBoundingClientRect().width || FALLBACK_GAME_WIDTH
    );
  };

  const getGameHeight = () => {
    const gameElement = gameRef.current;
    if (!gameElement) return FALLBACK_GAME_HEIGHT;
    return (
      gameElement.clientHeight || gameElement.getBoundingClientRect().height || FALLBACK_GAME_HEIGHT
    );
  };

  const getBaselineScale = () => getGameHeight() / BASELINE_GAME_HEIGHT;
  const getBossBaseWidthPx = () => BASELINE_BOSS_BASE_WIDTH * getBaselineScale();

  const getBossRightOffsetPx = (isMobileViewport?: boolean) => {
    const resolvedIsMobileViewport = isMobileViewport ?? isMobile();
    const gameWidth = getGameWidth();
    const baselineScale = getBaselineScale();
    const baseOffsetPx = BASELINE_ARM_RIGHT_OFFSET * baselineScale;
    if (!resolvedIsMobileViewport) return baseOffsetPx;
    const tunedOffsetPx = baseOffsetPx - MOBILE_BOSS_RIGHT_SHIFT_BASELINE_PX * baselineScale;
    const responsiveMarginPx = Math.max(
      MOBILE_BOSS_RIGHT_MARGIN_MIN_PX,
      gameWidth * MOBILE_BOSS_RIGHT_MARGIN_RATIO,
    );
    return Math.max(tunedOffsetPx, responsiveMarginPx);
  };

  return {
    getGameWidth,
    getGameHeight,
    getBaselineScale,
    getBossBaseWidthPx,
    getBossRightOffsetPx,
  };
};
