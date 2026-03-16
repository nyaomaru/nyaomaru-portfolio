import type { RefObject } from 'react';
import { PLAYER_RUN_SPRITES } from '@/features/jump-game/model/config/assets';
import { PLAYER_SPRITE_SWAP_MS } from '@/features/jump-game/model/config/timing';
import { applyPlayerMotion } from './helpers';
import {
  CLEAR_SEQUENCE_PHASES,
  SPECIAL_CLEAR_PHASES,
  type ClearSequencePhase,
  type SpecialClearPhase,
  type TimelineStep,
} from './types';

type SetClearSequencePhase = (phase: ClearSequencePhase) => void;
type SetSpecialClearPhase = (phase: SpecialClearPhase) => void;

/**
 * Interval-backed run-sprite controller for special ending player motion.
 */
export type PlayerRunLoopController = {
  /** Starts run-loop frame toggling. */
  start: () => void;
  /** Stops run-loop and resets sprite to frame-0. */
  stop: () => void;
};

/**
 * Inputs required to build special clear timeline steps.
 */
export type CreateSpecialTimelineStepsParams = {
  /** Delay when special clear switches to rocket-1 phase. */
  clearBossTotalExitMs: number;
  /** Absolute delay for player approach start. */
  specialApproachStartMs: number;
  /** Absolute delay for rocket-2 phase. */
  specialRocket2Ms: number;
  /** Absolute delay for bye stage. */
  specialByeMs: number;
  /** Absolute delay for bye-with-icon stage. */
  specialByeWithIconMs: number;
  /** Absolute delay for flyout stage. */
  specialFlyoutMs: number;
  /** Absolute delay for special end completion. */
  specialDoneMs: number;
  /** Computed approach move duration in milliseconds. */
  specialApproachMoveMs: number;
  /** Player element reference manipulated by timeline steps. */
  playerRef: RefObject<HTMLDivElement>;
  /** Phase setter for high-level clear sequence state. */
  setClearSequencePhase: SetClearSequencePhase;
  /** Phase setter for special clear internal state. */
  setSpecialClearPhase: SetSpecialClearPhase;
  /** Flyout origin resolver invoked when flyout starts. */
  resolveAndSetFlyoutOrigin: () => void;
  /** Callback that starts player run-loop sprite animation. */
  startPlayerRunLoop: () => void;
  /** Callback that stops player run-loop sprite animation. */
  stopPlayerRunLoop: () => void;
  /** Callback enabling FIN overlay stage. */
  markSpecialFinished: () => void;
  /** CSS transition expression for opacity updates. */
  playerOpacityTransition: string;
  /** Visible opacity string value. */
  playerVisibleOpacity: string;
  /** Hidden opacity string value. */
  playerHiddenOpacity: string;
  /** Visible visibility string value. */
  playerVisibleVisibility: string;
  /** Hidden visibility string value. */
  playerHiddenVisibility: string;
  /** CSS left value for centered player placement. */
  playerCenterLeft: string;
  /** CSS transform value for neutral placement. */
  playerTranslateNone: string;
  /** CSS transform value for rocket approach placement. */
  playerTranslateToRocket: string;
};

/**
 * Inputs required to build standard (non-special) clear timeline steps.
 */
export type CreateClearTimelineStepsParams = {
  /** Delay when standard clear starts player move. */
  clearBossTotalExitMs: number;
  /** Player move duration in milliseconds. */
  clearPlayerMoveMs: number;
  /** Player fade-out delay in milliseconds. */
  clearPlayerFadeMs: number;
  /** Player element reference manipulated by timeline steps. */
  playerRef: RefObject<HTMLDivElement>;
  /** Phase setter for high-level clear sequence state. */
  setClearSequencePhase: SetClearSequencePhase;
  /** CSS transition expression for opacity updates. */
  playerOpacityTransition: string;
  /** Visible opacity string value. */
  playerVisibleOpacity: string;
  /** Hidden opacity string value. */
  playerHiddenOpacity: string;
  /** Visible visibility string value. */
  playerVisibleVisibility: string;
  /** Hidden visibility string value. */
  playerHiddenVisibility: string;
  /** CSS left value for centered player placement. */
  playerCenterLeft: string;
  /** CSS transform value for centered placement. */
  playerTranslateCenter: string;
};

/**
 * Creates start/stop controls for toggling player run sprites during special clear.
 *
 * @param playerSpriteRef - Player sprite image reference.
 * @returns Run-loop controls for timeline integration.
 */
export const createPlayerRunLoopController = (
  playerSpriteRef: RefObject<HTMLImageElement>,
): PlayerRunLoopController => {
  let playerRunFrameIndex = 0;
  let playerRunIntervalId: number | null = null;

  const setPlayerRunSprite = (frameIndex: number) => {
    const playerSpriteElement = playerSpriteRef.current;
    if (!playerSpriteElement) return;
    playerSpriteElement.src = PLAYER_RUN_SPRITES[frameIndex];
  };

  const stop = () => {
    if (playerRunIntervalId !== null) {
      clearInterval(playerRunIntervalId);
      playerRunIntervalId = null;
    }
    playerRunFrameIndex = 0;
    setPlayerRunSprite(playerRunFrameIndex);
  };

  const start = () => {
    stop();
    playerRunIntervalId = window.setInterval(() => {
      playerRunFrameIndex = playerRunFrameIndex === 0 ? 1 : 0;
      setPlayerRunSprite(playerRunFrameIndex);
    }, PLAYER_SPRITE_SWAP_MS);
  };

  return { start, stop };
};

/**
 * Builds ordered timeline steps for the special clear branch.
 *
 * @param params - Special timeline dependencies and constants.
 * @returns Ordered timeline steps ready for scheduler registration.
 */
export const createSpecialTimelineSteps = ({
  clearBossTotalExitMs,
  specialApproachStartMs,
  specialRocket2Ms,
  specialByeMs,
  specialByeWithIconMs,
  specialFlyoutMs,
  specialDoneMs,
  specialApproachMoveMs,
  playerRef,
  setClearSequencePhase,
  setSpecialClearPhase,
  resolveAndSetFlyoutOrigin,
  startPlayerRunLoop,
  stopPlayerRunLoop,
  markSpecialFinished,
  playerOpacityTransition,
  playerVisibleOpacity,
  playerHiddenOpacity,
  playerVisibleVisibility,
  playerHiddenVisibility,
  playerCenterLeft,
  playerTranslateNone,
  playerTranslateToRocket,
}: CreateSpecialTimelineStepsParams): TimelineStep[] => [
  {
    atMs: clearBossTotalExitMs,
    run: () => {
      setClearSequencePhase(CLEAR_SEQUENCE_PHASES.PLAYER_MOVE);
      setSpecialClearPhase(SPECIAL_CLEAR_PHASES.ROCKET_1);
      applyPlayerMotion({
        playerRef,
        visibility: playerVisibleVisibility,
        opacity: playerVisibleOpacity,
        transition: 'none',
        left: '',
        transform: playerTranslateNone,
      });
      startPlayerRunLoop();
    },
  },
  {
    atMs: specialApproachStartMs,
    run: () => {
      setSpecialClearPhase(SPECIAL_CLEAR_PHASES.APPROACH);
      applyPlayerMotion({
        playerRef,
        transition: `left ${specialApproachMoveMs}ms linear, transform ${specialApproachMoveMs}ms linear, ${playerOpacityTransition}`,
        left: playerCenterLeft,
        transform: playerTranslateToRocket,
      });
    },
  },
  {
    atMs: specialRocket2Ms,
    run: () => {
      setSpecialClearPhase(SPECIAL_CLEAR_PHASES.ROCKET_2);
      stopPlayerRunLoop();
      applyPlayerMotion({
        playerRef,
        opacity: playerHiddenOpacity,
        visibility: playerHiddenVisibility,
      });
    },
  },
  {
    atMs: specialByeMs,
    run: () => {
      setSpecialClearPhase(SPECIAL_CLEAR_PHASES.BYE);
    },
  },
  {
    atMs: specialByeWithIconMs,
    run: () => {
      setSpecialClearPhase(SPECIAL_CLEAR_PHASES.BYE_WITH_ICON);
    },
  },
  {
    atMs: specialFlyoutMs,
    run: () => {
      resolveAndSetFlyoutOrigin();
      setSpecialClearPhase(SPECIAL_CLEAR_PHASES.FLYOUT);
    },
  },
  {
    atMs: specialDoneMs,
    run: () => {
      setSpecialClearPhase(SPECIAL_CLEAR_PHASES.IDLE);
      setClearSequencePhase(CLEAR_SEQUENCE_PHASES.HAPPY);
      markSpecialFinished();
    },
  },
];

/**
 * Builds ordered timeline steps for the standard clear branch.
 *
 * @param params - Standard timeline dependencies and constants.
 * @returns Ordered timeline steps ready for scheduler registration.
 */
export const createClearTimelineSteps = ({
  clearBossTotalExitMs,
  clearPlayerMoveMs,
  clearPlayerFadeMs,
  playerRef,
  setClearSequencePhase,
  playerOpacityTransition,
  playerVisibleOpacity,
  playerHiddenOpacity,
  playerVisibleVisibility,
  playerHiddenVisibility,
  playerCenterLeft,
  playerTranslateCenter,
}: CreateClearTimelineStepsParams): TimelineStep[] => [
  {
    atMs: clearBossTotalExitMs,
    run: () => {
      setClearSequencePhase(CLEAR_SEQUENCE_PHASES.PLAYER_MOVE);
      applyPlayerMotion({
        playerRef,
        visibility: playerVisibleVisibility,
        opacity: playerVisibleOpacity,
        transition: `left ${clearPlayerMoveMs}ms linear, transform ${clearPlayerMoveMs}ms linear, ${playerOpacityTransition}`,
        left: playerCenterLeft,
        transform: playerTranslateCenter,
      });
    },
  },
  {
    atMs: clearBossTotalExitMs + clearPlayerMoveMs,
    run: () => {
      applyPlayerMotion({
        playerRef,
        opacity: playerHiddenOpacity,
      });
    },
  },
  {
    atMs: clearBossTotalExitMs + clearPlayerMoveMs + clearPlayerFadeMs,
    run: () => {
      applyPlayerMotion({
        playerRef,
        visibility: playerHiddenVisibility,
      });
      setClearSequencePhase(CLEAR_SEQUENCE_PHASES.HAPPY);
    },
  },
];
