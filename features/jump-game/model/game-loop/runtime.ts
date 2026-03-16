import {
  BOSS_MODE_DURATION,
  CLEAR_DURATION,
  MOBILE_OBSTACLE_SPEED,
  MOBILE_OBSTACLE_SPEED_MULTIPLIER,
  PC_OBSTACLE_SPEED,
} from '../config/gameplay';
import { BOSS_MODE_TRIGGER_WINDOW_SECONDS, MS_PER_SECOND } from '../config/game-loop';

const BASE_FRAME_RATE = 60;
const BASE_FRAME_DURATION_MS = MS_PER_SECOND / BASE_FRAME_RATE;
const MAX_FRAME_DELTA_MULTIPLIER = 3;
const MAX_FRAME_DELTA_MS = BASE_FRAME_DURATION_MS * MAX_FRAME_DELTA_MULTIPLIER;
const DESKTOP_GAMEPLAY_LARGE_VIEWPORT_MIN_WIDTH_PX = 1900;

/**
 * Resolved timing information for one animation frame tick.
 */
export type FrameTiming = {
  /** Current high-resolution timestamp (performance.now). */
  nowMs: number;
  /** Clamped frame delta in milliseconds. */
  deltaTimeMs: number;
};

/**
 * Resolved elapsed-time state derived from wall-clock timestamps.
 */
export type ElapsedTime = {
  /** Stable run start timestamp in epoch milliseconds. */
  startTimeMs: number;
  /** Elapsed run time in seconds from `startTimeMs`. */
  elapsedSeconds: number;
};

/**
 * Input values used to resolve desktop pace scaling for large displays.
 */
export type DesktopGameplayPaceScaleParams = {
  /** Current browser viewport width in pixels. */
  viewportWidthPx: number;
  /** Current game viewport width in pixels. */
  gameWidthPx: number;
};

/**
 * Computes clamped frame timing based on current and previous frame timestamps.
 *
 * @param nowMs - Current `performance.now()` timestamp.
 * @param previousFrameAtMs - Previous frame timestamp, if available.
 * @returns Current frame timing with clamped delta value.
 */
export const getFrameTiming = (nowMs: number, previousFrameAtMs: number | null): FrameTiming => {
  const rawDeltaTimeMs =
    previousFrameAtMs === null ? BASE_FRAME_DURATION_MS : nowMs - previousFrameAtMs;
  const deltaTimeMs = Math.min(MAX_FRAME_DELTA_MS, Math.max(0, rawDeltaTimeMs));
  return { nowMs, deltaTimeMs };
};

/**
 * Resolves elapsed run seconds and initializes start timestamp when needed.
 *
 * @param startTimeMs - Previous run start timestamp in epoch milliseconds.
 * @param nowEpochMs - Current `Date.now()` timestamp.
 * @returns Start timestamp and elapsed seconds.
 */
export const getElapsedTime = (startTimeMs: number | null, nowEpochMs: number): ElapsedTime => {
  const resolvedStartTimeMs = startTimeMs ?? nowEpochMs;
  return {
    startTimeMs: resolvedStartTimeMs,
    elapsedSeconds: (nowEpochMs - resolvedStartTimeMs) / MS_PER_SECOND,
  };
};

/**
 * Returns true when elapsed seconds enter boss-mode activation window.
 *
 * @param elapsedSeconds - Elapsed run time in seconds.
 * @returns Whether boss mode should start this frame.
 */
export const shouldActivateBossMode = (elapsedSeconds: number) =>
  elapsedSeconds >= BOSS_MODE_DURATION &&
  elapsedSeconds < BOSS_MODE_DURATION + BOSS_MODE_TRIGGER_WINDOW_SECONDS;

/**
 * Returns true when clear threshold is reached.
 *
 * @param elapsedSeconds - Elapsed run time in seconds.
 * @returns Whether clear sequence should be requested.
 */
export const shouldRequestClear = (elapsedSeconds: number) => elapsedSeconds >= CLEAR_DURATION;

/**
 * Resolves desktop gameplay pace scale from the current desktop viewport size.
 *
 * Smaller/normal desktop widths keep the legacy MacBook Pro pace.
 * Larger desktop viewports speed up proportionally only after the large-screen cutoff.
 *
 * @param params - Current viewport and game viewport widths.
 * @param params.viewportWidthPx - Current browser viewport width in pixels.
 * @param params.gameWidthPx - Current game viewport width in pixels.
 * @returns Desktop pace multiplier relative to the MacBook Pro baseline viewport width.
 */
export const getDesktopGameplayPaceScale = ({
  viewportWidthPx,
  gameWidthPx,
}: DesktopGameplayPaceScaleParams) => {
  const desktopWidthPx = Math.max(0, viewportWidthPx, gameWidthPx);

  return desktopWidthPx <= DESKTOP_GAMEPLAY_LARGE_VIEWPORT_MIN_WIDTH_PX
    ? 1
    : desktopWidthPx / DESKTOP_GAMEPLAY_LARGE_VIEWPORT_MIN_WIDTH_PX;
};

/**
 * Resolves obstacle speed in px/sec for the current viewport mode.
 *
 * @param isMobileViewport - Whether current viewport uses mobile gameplay tuning.
 * @param desktopPaceScale - Desktop-only pace multiplier derived from the current desktop viewport.
 * @returns Obstacle movement speed in pixels per second.
 */
export const getObstacleSpeedPxPerSec = (isMobileViewport: boolean, desktopPaceScale = 1) =>
  isMobileViewport
    ? MOBILE_OBSTACLE_SPEED * MOBILE_OBSTACLE_SPEED_MULTIPLIER * BASE_FRAME_RATE
    : PC_OBSTACLE_SPEED * BASE_FRAME_RATE * desktopPaceScale;
