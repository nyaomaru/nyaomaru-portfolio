import type { RefObject } from 'react';
import { isMobile } from '@/shared/lib/window';
import {
  BOSS_BASE_SPRITES,
  BOSS_CLEAR_ICONS,
  SPECIAL_BYE_BYE_1,
  SPECIAL_FIN_1,
  SPECIAL_FIN_2,
  SPECIAL_ROCKET_ICON_1,
  SPECIAL_ROCKET_ICON_2,
} from '@/features/jump-game/model/config/assets';
import {
  CLEAR_BOSS_GROUND_PAUSE_MS,
  CLEAR_BOSS_GROUND_SETTLE_MS,
  CLEAR_BOSS_PRE_EXIT_JUMP_COUNT,
  CLEAR_BOSS_PRE_EXIT_JUMP_CYCLE_MS,
  CLEAR_BOSS_PRE_EXIT_JUMP_DOWN_MS,
  CLEAR_BOSS_PRE_EXIT_JUMP_HEIGHT_PX,
  CLEAR_BOSS_PRE_EXIT_JUMP_UP_MS,
  CLEAR_BOSS_TOTAL_EXIT_MS,
  DESKTOP_SPECIAL_APPROACH_MOVE_DURATION_MULTIPLIER,
  FALLBACK_APPROACH_DISTANCE_RATIO,
  FALLBACK_GAME_WIDTH_PX,
  FRAME_RATE,
  MIN_SPECIAL_APPROACH_MOVE_MS,
  MOBILE_SPECIAL_APPROACH_MOVE_DURATION_MULTIPLIER,
  MS_PER_SECOND,
  MIN_SPECIAL_ROCKET_ENTRY_MOVE_MS,
  PLAYER_APPROACH_ALIGNMENT_WIDTH_RATIO,
  ROCKET_ENTRY_DISTANCE_RATIO,
  ROCKET_TARGET_CENTER_X_RATIO,
  SPECIAL_APPROACH_HOLD_MS,
  SPECIAL_APPROACH_MOVE_MS,
  SPECIAL_BYE_DISPLAY_MS,
  SPECIAL_FIN_DELAY_MS,
  SPECIAL_FLYOUT_MS,
  SPECIAL_FLY_PREP_MS,
  SPECIAL_ROCKET_ENTRY_MOVE_MS,
  SPECIAL_ROCKET_ENTRY_MOVE_DURATION_MULTIPLIER,
  SPECIAL_STEP_MS,
} from '@/features/jump-game/model/config/clear-sequence';
import {
  MOBILE_OBSTACLE_SPEED,
  MOBILE_OBSTACLE_SPEED_MULTIPLIER,
  PC_OBSTACLE_SPEED,
} from '@/features/jump-game/model/config/gameplay';
import { getDesktopGameplayPaceScale } from '@/features/jump-game/model/game-loop/runtime';
import {
  CLEAR_SEQUENCE_PHASES,
  SPECIAL_CLEAR_PHASES,
  type ApplyBossMotionParams,
  type ApplyPlayerMotionParams,
  type BossClearViewState,
  type BossDomRefs,
  type DeriveBossClearViewStateParams,
  type FlyoutOrigin,
  type PlayerAndGameRefs,
  type RegisterTimeout,
  type ResolveSpecialTimelineMomentsParams,
  type SpecialTimelineMoments,
  type TimelineStep,
} from './types';

const ZERO_WIDTH_PX = '0px';
const BOSS_RESET_TRANSLATE_X = 'translateX(0)';
const BOSS_RESET_TRANSLATE = 'translate(0px, 0px)';
const BOSS_VISIBLE_OPACITY = '1';
const VIEWPORT_CENTER_DIVISOR = 2;

export const BOSS_HIDDEN_OPACITY = '0';

const resolveObstacleSpeedPxPerSecond = (isMobileViewport: boolean, gameWidthPx: number) =>
  (isMobileViewport
    ? MOBILE_OBSTACLE_SPEED * MOBILE_OBSTACLE_SPEED_MULTIPLIER
    : PC_OBSTACLE_SPEED *
      getDesktopGameplayPaceScale({
        viewportWidthPx: window.innerWidth,
        gameWidthPx,
      })) * FRAME_RATE;

/**
 * Creates a local timeout registry that can schedule and clear a timeline batch.
 *
 * @returns Timeout register/cleanup helpers bound to one sequence run.
 */
export const createTimeoutRegistry = (): RegisterTimeout => {
  const timeoutIds: number[] = [];
  return {
    register: (callback, delayMs) => {
      const timeoutId = window.setTimeout(callback, delayMs);
      timeoutIds.push(timeoutId);
      return timeoutId;
    },
    clearAll: () => {
      timeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
      timeoutIds.length = 0;
    },
  };
};

/**
 * Applies transition/transform/opacity changes to boss base and arm elements together.
 *
 * @param params - Boss motion style payload and target refs.
 */
export const applyBossMotion = ({
  bossRef,
  bossArmRef,
  transition,
  transform,
  opacity,
}: ApplyBossMotionParams) => {
  if (bossArmRef.current) {
    bossArmRef.current.style.transition = transition;
    bossArmRef.current.style.transform = transform;
    if (opacity !== undefined) {
      bossArmRef.current.style.opacity = opacity;
    }
  }
  if (bossRef.current) {
    bossRef.current.style.transition = transition;
    bossRef.current.style.transform = transform;
    if (opacity !== undefined) {
      bossRef.current.style.opacity = opacity;
    }
  }
};

/**
 * Applies transition and visibility styles to the player element for clear-sequence motion.
 *
 * @param params - Optional style mutations and target player ref.
 */
export const applyPlayerMotion = ({
  playerRef,
  transition,
  left,
  transform,
  opacity,
  visibility,
}: ApplyPlayerMotionParams) => {
  if (!playerRef.current) {
    return;
  }
  if (transition !== undefined) {
    playerRef.current.style.transition = transition;
  }
  if (left !== undefined) {
    playerRef.current.style.left = left;
  }
  if (transform !== undefined) {
    playerRef.current.style.transform = transform;
  }
  if (opacity !== undefined) {
    playerRef.current.style.opacity = opacity;
  }
  if (visibility !== undefined) {
    playerRef.current.style.visibility = visibility;
  }
};

/**
 * Normalizes boss pose to base sprite + grounded transform before exit animation starts.
 *
 * @param refs - Boss DOM refs used for initial clear-sequence normalization.
 */
export const initializeBossExitPose = ({ bossRef, bossSpriteRef, bossArmRef }: BossDomRefs) => {
  if (bossArmRef.current) {
    bossArmRef.current.style.width = ZERO_WIDTH_PX;
  }
  const bossSpriteElement = bossSpriteRef.current;
  if (bossSpriteElement && bossSpriteElement.src !== BOSS_BASE_SPRITES[0]) {
    bossSpriteElement.src = BOSS_BASE_SPRITES[0];
  }
  applyBossMotion({
    bossRef,
    bossArmRef,
    transition: `transform ${CLEAR_BOSS_GROUND_SETTLE_MS}ms ease-out`,
    transform: BOSS_RESET_TRANSLATE_X,
    opacity: BOSS_VISIBLE_OPACITY,
  });
};

/**
 * Schedules boss pre-exit hops (up/down pairs) on the provided timeout registry.
 *
 * @param refs - Boss DOM refs animated during hop timeline.
 * @param timers - Timeout registry that owns scheduled callbacks.
 */
export const scheduleBossPreExitJumps = (
  { bossRef, bossArmRef }: BossDomRefs,
  timers: RegisterTimeout,
) => {
  for (let jumpIndex = 0; jumpIndex < CLEAR_BOSS_PRE_EXIT_JUMP_COUNT; jumpIndex += 1) {
    const jumpStartMs =
      CLEAR_BOSS_GROUND_SETTLE_MS +
      CLEAR_BOSS_GROUND_PAUSE_MS +
      CLEAR_BOSS_PRE_EXIT_JUMP_CYCLE_MS * jumpIndex;
    const jumpDownMs = jumpStartMs + CLEAR_BOSS_PRE_EXIT_JUMP_UP_MS;

    timers.register(() => {
      applyBossMotion({
        bossRef,
        bossArmRef,
        transition: `transform ${CLEAR_BOSS_PRE_EXIT_JUMP_UP_MS}ms ease-out`,
        transform: `translate(0px, -${CLEAR_BOSS_PRE_EXIT_JUMP_HEIGHT_PX}px)`,
      });
    }, jumpStartMs);
    timers.register(() => {
      applyBossMotion({
        bossRef,
        bossArmRef,
        transition: `transform ${CLEAR_BOSS_PRE_EXIT_JUMP_DOWN_MS}ms ease-in`,
        transform: BOSS_RESET_TRANSLATE,
      });
    }, jumpDownMs);
  }
};

/**
 * Schedules all timeline steps using absolute delays from sequence start.
 *
 * @param steps - Ordered timeline steps with absolute execution timestamps.
 * @param timers - Timeout registry used to register all steps.
 */
export const scheduleTimelineSteps = (steps: TimelineStep[], timers: RegisterTimeout) => {
  steps.forEach((step) => {
    timers.register(step.run, step.atMs);
  });
};

/**
 * Calculates player approach duration so rocket alignment pace stays coherent across viewport sizes.
 *
 * @param refs - Player/game refs used to derive travel distance.
 * @returns Approach move duration in milliseconds.
 */
export const resolveSpecialApproachMoveMs = ({ playerRef, gameRef }: PlayerAndGameRefs) => {
  const isMobileViewport = isMobile();
  const playerRect = playerRef.current?.getBoundingClientRect();
  const gameRect = gameRef.current?.getBoundingClientRect();
  const obstacleSpeedPxPerSec = resolveObstacleSpeedPxPerSecond(
    isMobileViewport,
    gameRect?.width ?? 0,
  );
  const fallbackApproachDistancePx =
    (gameRect?.width ?? FALLBACK_GAME_WIDTH_PX) * FALLBACK_APPROACH_DISTANCE_RATIO;
  const approachDistancePx =
    playerRect && gameRect
      ? Math.abs(
          gameRect.width * ROCKET_TARGET_CENTER_X_RATIO -
            playerRect.width * PLAYER_APPROACH_ALIGNMENT_WIDTH_RATIO -
            (playerRect.left - gameRect.left),
        )
      : fallbackApproachDistancePx;
  const baseApproachMoveMs =
    obstacleSpeedPxPerSec > 0
      ? Math.max(
          MIN_SPECIAL_APPROACH_MOVE_MS,
          Math.round((approachDistancePx / obstacleSpeedPxPerSec) * MS_PER_SECOND),
        )
      : SPECIAL_APPROACH_MOVE_MS;

  return isMobileViewport
    ? Math.round(baseApproachMoveMs * MOBILE_SPECIAL_APPROACH_MOVE_DURATION_MULTIPLIER)
    : Math.round(baseApproachMoveMs * DESKTOP_SPECIAL_APPROACH_MOVE_DURATION_MULTIPLIER);
};

/**
 * Calculates rocket entry duration so right-edge to center motion matches obstacle pace.
 *
 * @param gameRef - Game viewport reference used to derive horizontal travel distance.
 * @returns Rocket entry movement duration in milliseconds.
 */
export const resolveSpecialRocketEntryMoveMs = (gameRef: RefObject<HTMLDivElement | null>) => {
  const isMobileViewport = isMobile();
  const gameRect = gameRef.current?.getBoundingClientRect();
  const obstacleSpeedPxPerSec = resolveObstacleSpeedPxPerSecond(
    isMobileViewport,
    gameRect?.width ?? 0,
  );
  const entryDistancePx = (gameRect?.width ?? FALLBACK_GAME_WIDTH_PX) * ROCKET_ENTRY_DISTANCE_RATIO;
  return obstacleSpeedPxPerSec > 0
    ? Math.max(
        MIN_SPECIAL_ROCKET_ENTRY_MOVE_MS,
        Math.round(
          (entryDistancePx / obstacleSpeedPxPerSec) *
            MS_PER_SECOND *
            SPECIAL_ROCKET_ENTRY_MOVE_DURATION_MULTIPLIER,
        ),
      )
    : SPECIAL_ROCKET_ENTRY_MOVE_MS;
};

/**
 * Resolves all absolute timestamps for special clear timeline phases.
 *
 * @param params - Approach timings used as base for subsequent phase offsets.
 * @returns Absolute timeline moments for each special phase.
 */
export const resolveSpecialTimelineMoments = ({
  specialRocketEntryMoveMs,
  specialApproachMoveMs,
  specialApproachDelayMs,
}: ResolveSpecialTimelineMomentsParams): SpecialTimelineMoments => {
  const specialApproachStartMs =
    CLEAR_BOSS_TOTAL_EXIT_MS + specialRocketEntryMoveMs + specialApproachDelayMs;
  const specialRocket2Ms =
    specialApproachStartMs + specialApproachMoveMs + SPECIAL_APPROACH_HOLD_MS;
  const specialByeMs = specialRocket2Ms + SPECIAL_STEP_MS;
  const specialByeWithIconMs = specialByeMs + SPECIAL_BYE_DISPLAY_MS;
  const specialFlyoutMs = specialByeWithIconMs + SPECIAL_FLY_PREP_MS;
  const specialDoneMs = specialFlyoutMs + SPECIAL_FLYOUT_MS + SPECIAL_FIN_DELAY_MS;
  return {
    specialApproachStartMs,
    specialRocket2Ms,
    specialByeMs,
    specialByeWithIconMs,
    specialFlyoutMs,
    specialDoneMs,
  };
};

/**
 * Resolves flyout origin from game viewport center, with viewport fallback when ref is unavailable.
 *
 * @param gameRef - Game viewport reference used for center point extraction.
 * @returns Viewport coordinates used as flyout origin.
 */
export const resolveFlyoutOrigin = (gameRef: RefObject<HTMLDivElement | null>): FlyoutOrigin => {
  const gameRect = gameRef.current?.getBoundingClientRect();
  if (gameRect) {
    return {
      x: gameRect.left + gameRect.width / VIEWPORT_CENTER_DIVISOR,
      y: gameRect.top + gameRect.height / VIEWPORT_CENTER_DIVISOR,
    };
  }
  return {
    x: window.innerWidth / VIEWPORT_CENTER_DIVISOR,
    y: window.innerHeight / VIEWPORT_CENTER_DIVISOR,
  };
};

/**
 * Derives render-facing clear-sequence flags and icon sources from timeline state.
 *
 * @param params - Current clear/special phase state and counters.
 * @returns View model consumed by jump-game scene rendering.
 */
export const deriveBossClearViewState = ({
  isBossClearResult,
  shouldRunSpecialClear,
  clearSequencePhase,
  specialClearPhase,
  showSpecialFin,
  specialFlyoutOrigin,
  specialFinFrameIndex,
  clearFrameIndex,
}: DeriveBossClearViewStateParams): BossClearViewState => {
  const shouldShowHappyIcon =
    isBossClearResult &&
    clearSequencePhase === CLEAR_SEQUENCE_PHASES.HAPPY &&
    !shouldRunSpecialClear;
  const specialRocketIconSrc =
    specialClearPhase === SPECIAL_CLEAR_PHASES.ROCKET_2
      ? SPECIAL_ROCKET_ICON_2
      : specialClearPhase === SPECIAL_CLEAR_PHASES.BYE
        ? SPECIAL_BYE_BYE_1
        : specialClearPhase === SPECIAL_CLEAR_PHASES.ROCKET_1 ||
            specialClearPhase === SPECIAL_CLEAR_PHASES.APPROACH
          ? SPECIAL_ROCKET_ICON_1
          : null;
  const shouldShowSpecialClearOverlay =
    shouldRunSpecialClear &&
    specialClearPhase !== SPECIAL_CLEAR_PHASES.IDLE &&
    specialClearPhase !== SPECIAL_CLEAR_PHASES.FLYOUT &&
    !showSpecialFin;
  const shouldShowByeByeIcon =
    shouldRunSpecialClear && specialClearPhase === SPECIAL_CLEAR_PHASES.BYE_WITH_ICON;
  const shouldShowSpecialFlyout =
    shouldRunSpecialClear &&
    specialClearPhase === SPECIAL_CLEAR_PHASES.FLYOUT &&
    !!specialFlyoutOrigin;
  const specialFinIconSrc = specialFinFrameIndex === 0 ? SPECIAL_FIN_1 : SPECIAL_FIN_2;
  const happyIconFrameSrc = BOSS_CLEAR_ICONS[clearFrameIndex];
  return {
    shouldShowHappyIcon,
    specialRocketIconSrc,
    shouldShowSpecialClearOverlay,
    shouldShowByeByeIcon,
    shouldShowSpecialFlyout,
    specialFinIconSrc,
    happyIconFrameSrc,
  };
};
