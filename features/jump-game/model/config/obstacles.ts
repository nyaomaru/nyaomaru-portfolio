// Obstacle and fish spawn tuning values.

export const OBSTACLE_ICON_INDEX = {
  SHORT_DESK: 0,
  TALL_DESK: 1,
  WORK1: 2,
  WORK2: 3,
} as const;
export const OBSTACLE_WEIGHT_FALLBACK_INDEX = OBSTACLE_ICON_INDEX.SHORT_DESK;

export const DESK_HITBOX_SCALE = 0.8;
export const SHORT_DESK_HITBOX_SCALE = 0.85;
export const WORK1_HITBOX_SCALE = 0.9;
export const DEFAULT_OBSTACLE_HITBOX_SCALE = 1;
export const PC_LOW_OBSTACLE_HITBOX_SCALE_MULTIPLIER = 0.75;
export const PC_HIGH_OBSTACLE_HITBOX_SCALE_MULTIPLIER = 0.9;
export const MOBILE_LOW_OBSTACLE_HITBOX_SCALE_MULTIPLIER = 0.7;
export const MOBILE_HIGH_OBSTACLE_HITBOX_SCALE_MULTIPLIER = 0.9;
export const MOBILE_OBSTACLE_VISUAL_SCALE_MULTIPLIER = 1.0;

export const SPAWN_OUTSIDE_OFFSET_PX = 24;

// Spawn weights (index-aligned): short desk 7, tall desk 7, work1 3, work2 3.
export const OBSTACLE_ICON_SPAWN_WEIGHTS = [7, 7, 3, 3] as const;

// Exported SVG dimensions used until natural image size is loaded.
export const OBSTACLE_ICON_FALLBACK_EXPORT_SIZES = [
  { width: 453, height: 405 }, // short desk
  { width: 457, height: 863 }, // tall desk
  { width: 327, height: 405 }, // work1
  { width: 327, height: 860 }, // work2
] as const;

export const BOSS_EXCLUDED_OBSTACLE_ICON_INDICES = [
  OBSTACLE_ICON_INDEX.TALL_DESK,
  OBSTACLE_ICON_INDEX.WORK2,
] as const;

export const LOW_OBSTACLE_ICON_INDICES = [
  OBSTACLE_ICON_INDEX.SHORT_DESK,
  OBSTACLE_ICON_INDEX.WORK1,
] as const;
export const HIGH_OBSTACLE_ICON_INDICES = [
  OBSTACLE_ICON_INDEX.TALL_DESK,
  OBSTACLE_ICON_INDEX.WORK2,
] as const;

export const FISH_ICON_SIZE = 34;
export const FISH_BASE_GAME_HEIGHT = 300;
export const FISH_BOTTOM_POSITIONS = [12, 28, 44, 60, 76, 92, 110, 128, 146] as const;
export const FISH_MIN_CLEARANCE_LANES = 1;
export const LOW_OBSTACLE_HEIGHT_LANE = 1;
export const HIGH_OBSTACLE_HEIGHT_LANE = 2;

export const OBSTACLE_HITBOX_SCALE_BY_ICON_INDEX: Partial<Record<number, number>> = {
  [OBSTACLE_ICON_INDEX.SHORT_DESK]: SHORT_DESK_HITBOX_SCALE,
  [OBSTACLE_ICON_INDEX.TALL_DESK]: DESK_HITBOX_SCALE,
  [OBSTACLE_ICON_INDEX.WORK1]: WORK1_HITBOX_SCALE,
};
