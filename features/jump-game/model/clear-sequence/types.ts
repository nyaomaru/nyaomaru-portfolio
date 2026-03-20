import type { RefObject } from 'react';

/**
 * High-level clear progression used by scene rendering.
 */
export const CLEAR_SEQUENCE_PHASES = {
  IDLE: 'idle',
  BOSS_EXIT: 'boss_exit',
  PLAYER_MOVE: 'player_move',
  HAPPY: 'happy',
} as const;

export type ClearSequencePhase = (typeof CLEAR_SEQUENCE_PHASES)[keyof typeof CLEAR_SEQUENCE_PHASES];

/**
 * Fine-grained timeline stages used internally by special clear animation.
 */
export const SPECIAL_CLEAR_PHASES = {
  IDLE: 'idle',
  ROCKET_1: 'rocket1',
  APPROACH: 'approach',
  ROCKET_2: 'rocket2',
  BYE: 'bye',
  BYE_WITH_ICON: 'bye_with_icon',
  FLYOUT: 'flyout',
} as const;

export type SpecialClearPhase = (typeof SPECIAL_CLEAR_PHASES)[keyof typeof SPECIAL_CLEAR_PHASES];

/**
 * A fixed viewport coordinate used as flyout origin.
 */
export type FlyoutOrigin = {
  /** Viewport X coordinate in pixels. */
  x: number;
  /** Viewport Y coordinate in pixels. */
  y: number;
};

export type BossDomRefs = {
  /** Boss base element animated during exit phase. */
  bossRef: RefObject<HTMLDivElement | null>;
  /** Boss sprite image element whose `src` is controlled across clear sequence. */
  bossSpriteRef: RefObject<HTMLImageElement | null>;
  /** Boss arm element animated during exit phase. */
  bossArmRef: RefObject<HTMLDivElement | null>;
};

export type PlayerAndGameRefs = {
  /** Player element manipulated during clear sequence motion. */
  playerRef: RefObject<HTMLDivElement | null>;
  /** Game viewport element used for position calculations. */
  gameRef: RefObject<HTMLDivElement | null>;
};

export type RegisterTimeout = {
  /** Schedules callback after given delay and tracks its timer id. */
  register: (callback: () => void, delayMs: number) => number;
  /** Clears every timeout previously registered via `register`. */
  clearAll: () => void;
};

export type ApplyBossMotionParams = {
  /** Boss base element animated during exit phase. */
  bossRef: RefObject<HTMLDivElement | null>;
  /** Boss arm element animated during exit phase. */
  bossArmRef: RefObject<HTMLDivElement | null>;
  /** CSS transition expression applied to both boss nodes. */
  transition: string;
  /** CSS transform expression applied to both boss nodes. */
  transform: string;
  /** Optional opacity applied to both boss nodes. */
  opacity?: string;
};

export type ApplyPlayerMotionParams = {
  /** Player element manipulated during clear sequence motion. */
  playerRef: RefObject<HTMLDivElement | null>;
  /** Optional CSS transition expression applied to player element. */
  transition?: string;
  /** Optional CSS left expression applied to player element. */
  left?: string;
  /** Optional CSS transform expression applied to player element. */
  transform?: string;
  /** Optional CSS opacity applied to player element. */
  opacity?: string;
  /** Optional CSS visibility applied to player element. */
  visibility?: string;
};

export type TimelineStep = {
  /** Absolute delay from scheduling start in milliseconds. */
  atMs: number;
  /** Callback executed when timeline reaches `atMs`. */
  run: () => void;
};

export type SpecialTimelineMoments = {
  /** Delay for approach start after boss exit. */
  specialApproachStartMs: number;
  /** Delay for switching to rocket-2 stage. */
  specialRocket2Ms: number;
  /** Delay for starting bye stage. */
  specialByeMs: number;
  /** Delay for showing bye icon overlay stage. */
  specialByeWithIconMs: number;
  /** Delay for flyout launch stage. */
  specialFlyoutMs: number;
  /** Delay for finishing sequence and showing FIN. */
  specialDoneMs: number;
};

/**
 * Timing inputs required to resolve special clear timeline milestones.
 */
export type ResolveSpecialTimelineMomentsParams = {
  /** Rocket entry duration from right edge to center. */
  specialRocketEntryMoveMs: number;
  /** Player approach movement duration after rocket reaches center. */
  specialApproachMoveMs: number;
  /** Delay before player starts approaching after rocket entry. */
  specialApproachDelayMs: number;
};

export type DeriveBossClearViewStateParams = {
  /** Whether current game-over result equals boss-clear icon. */
  isBossClearResult: boolean;
  /** Whether special clear branch should run for current result. */
  shouldRunSpecialClear: boolean;
  /** Current high-level clear sequence phase. */
  clearSequencePhase: ClearSequencePhase;
  /** Current internal special clear phase. */
  specialClearPhase: SpecialClearPhase;
  /** Whether FIN overlay is currently displayed. */
  showSpecialFin: boolean;
  /** Flyout origin coordinates when flyout is active. */
  specialFlyoutOrigin: FlyoutOrigin | null;
  /** Current FIN sprite frame index. */
  specialFinFrameIndex: number;
  /** Current happy icon frame index. */
  clearFrameIndex: number;
};

export type BossClearViewState = {
  /** Whether happy icon animation should be visible. */
  shouldShowHappyIcon: boolean;
  /** Rocket/bye sprite selected for special overlay phase. */
  specialRocketIconSrc: string | null;
  /** Whether special overlay layer should be rendered. */
  shouldShowSpecialClearOverlay: boolean;
  /** Whether bye-bye icon overlay should be rendered. */
  shouldShowByeByeIcon: boolean;
  /** Whether flyout overlay should be rendered. */
  shouldShowSpecialFlyout: boolean;
  /** Selected FIN icon sprite source. */
  specialFinIconSrc: string;
  /** Selected happy icon sprite source for current frame. */
  happyIconFrameSrc: string;
};
