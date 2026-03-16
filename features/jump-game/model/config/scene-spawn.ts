import { CLEAR_DURATION } from './gameplay';
import { OBSTACLE_ICON_INDEX } from './obstacles';

// Fish spawn planning and tick cadence.
export const FISH_MIN_TOTAL_SPAWN = 20;
export const FISH_MAX_TOTAL_SPAWN = 30;
export const FISH_SPAWN_TICK_MS = 200;
export const FISH_FIRST_SPAWN_MIN_DELAY_MS = 800;
export const FISH_FIRST_SPAWN_MAX_DELAY_MS = 1800;
export const FISH_SPAWN_MIN_GAP_MS = 700;
export const FISH_SPAWN_JITTER_RATIO = 0.35;
export const CROSS_ENTITY_SPAWN_SEPARATION_MS = 200;

// Boss-pattern obstacle spawn tuning.
export const BOSS_PATTERN_TWO_OBSTACLE_RATE = 0.95;
export const BOSS_PATTERN_TWO_SPAWN_INTERVAL_FACTOR = 0.72;
export const BOSS_PATTERN_TWO_MIN_SPAWN_INTERVAL_MS = 560;
export const BOSS_PATTERN_TWO_ALLOWED_OBSTACLE_INDICES = [
  OBSTACLE_ICON_INDEX.SHORT_DESK,
  OBSTACLE_ICON_INDEX.WORK1,
] as const;

// Milliseconds representation of clear duration.
export const CLEAR_DURATION_MS = CLEAR_DURATION * 1000;
