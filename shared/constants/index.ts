/**
 * Application-wide constants
 */

// UI Constants
export const UI = {
  MOBILE_BREAKPOINT: 640,
  ANIMATION: {
    DEFAULT_DELAY: 0,
    DEFAULT_DURATION: 1000,
  },
  THINKING_DOTS: {
    MAX_DOTS: 3,
    DEFAULT_INTERVAL: 500,
  },
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  METHOD_NOT_ALLOWED: 405,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Server Constants
export const SERVER = {
  ABORT_DELAY: 5_000,
} as const;

// Game Constants
export const GAME = {
  JUMP: {
    MAX_COUNT: 2,
    VELOCITY: 4,
    UP_INTERVAL: 16,
    DOWN_INTERVAL: 16,
    LOCK_INTERVAL: 100,
    CLICK_INTERVAL: 50,
  },
  OBSTACLES: {
    NORMAL_SPAWN_RATE: 0.98,
    MOBILE_NORMAL_SPAWN_RATE: 0.95,
    PC_SPAWN_INTERVAL: 1500,
    MOBILE_SPAWN_INTERVAL: 1600,
    PC_SPEED: 6,
    BOSS_SPEED: 5,
    MOBILE_SPEED: 2,
    DEADLINE: -30,
  },
  BOSS: {
    ARM: {
      Y: 32,
      THICKNESS: 20,
      SPEED: 5,
      RETRACT_SPEED: 9,
      PULSE_INTERVAL: 3000,
      MAX_LENGTH_RATIO: 1.0,
      DELAY: 3000,
    },
  },
  SETTINGS: {
    BOSS_MODE_DURATION: 30,
    CLEAR_DURATION: 60,
    TUTORIAL_OBSTACLE_COUNT: 3,
    PC_SPAWN_OFFSET_RATIO: 0.6,
    MOBILE_SPAWN_OFFSET_RATIO: 1.0,
  },
  KEYBOARD: {
    SPACE: 'Space',
  },
  MESSAGES: {
    DEFAULT: 'Space or Click(Tap) to Jump',
  },
  SCENERY: {
    PC_BG_SPEED: 100,
    MOBILE_BG_SPEED: 50,
  },
} as const;

// Contact Information
export const CONTACT = {
  EMAIL: 'nyaonyao0725@gmail.com',
} as const;
