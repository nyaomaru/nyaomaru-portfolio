import { type RefObject, useCallback, useEffect, useState } from 'react';
import { equals } from 'is-kit';
import { isMobile } from '@/shared/lib/window';
import {
  BOSS_CLEAR_ICON,
  PLAYER_STAND_SPRITE,
  SPECIAL_BYE_BYE_ICON,
  SPECIAL_ROCKET_ICON_3,
} from './config/assets';
import {
  CLEAR_BOSS_EXIT_MS,
  CLEAR_BOSS_EXIT_START_DELAY_MS,
  CLEAR_BOSS_EXIT_TRANSLATE_X,
  CLEAR_BOSS_TOTAL_EXIT_MS,
  CLEAR_ICON_SWAP_MS,
  CLEAR_PLAYER_FADE_MS,
  CLEAR_PLAYER_MOVE_MS,
  MOBILE_SPECIAL_APPROACH_EXTRA_DELAY_MS,
  PLAYER_CENTER_LEFT,
  PLAYER_HIDDEN_OPACITY,
  PLAYER_HIDDEN_VISIBILITY,
  PLAYER_OPACITY_TRANSITION,
  PLAYER_TRANSLATE_CENTER,
  PLAYER_TRANSLATE_NONE,
  PLAYER_TRANSLATE_TO_ROCKET,
  PLAYER_VISIBLE_OPACITY,
  PLAYER_VISIBLE_VISIBILITY,
  SPECIAL_ROCKET_ENTRY_PLAYER_DELAY_MS,
  SPECIAL_CLEAR_FISH_THRESHOLD,
  SPECIAL_FIN_SWAP_MS,
  SPECIAL_FLYOUT_MS,
  SPECIAL_ROCKET_ENTRY_MOVE_MS,
} from './config/clear-sequence';
import {
  BOSS_HIDDEN_OPACITY,
  applyBossMotion,
  createTimeoutRegistry,
  deriveBossClearViewState,
  initializeBossExitPose,
  resolveFlyoutOrigin,
  resolveSpecialApproachMoveMs,
  resolveSpecialRocketEntryMoveMs,
  resolveSpecialTimelineMoments,
  scheduleBossPreExitJumps,
  scheduleTimelineSteps,
} from './clear-sequence/helpers';
import {
  createClearTimelineSteps,
  createPlayerRunLoopController,
  createSpecialTimelineSteps,
} from './clear-sequence/timeline';
import {
  CLEAR_SEQUENCE_PHASES,
  SPECIAL_CLEAR_PHASES,
  type ClearSequencePhase,
  type FlyoutOrigin,
  type SpecialClearPhase,
  type TimelineStep,
} from './clear-sequence/types';

/**
 * Inputs required to compute and drive boss clear animation sequence.
 */
type UseBossClearSequenceOptions = {
  /** Final icon selected by game loop when game ends. */
  gameOverIcon: string | null;
  /** Number of collected fish used to branch special clear sequence. */
  fishCount: number;
  /** Player element manipulated during clear sequence motion. */
  playerRef: RefObject<HTMLDivElement | null>;
  /** Player sprite image element used to play run loop during ending sequence. */
  playerSpriteRef: RefObject<HTMLImageElement | null>;
  /** Game viewport element used for position calculations. */
  gameRef: RefObject<HTMLDivElement | null>;
  /** Boss base element animated during exit phase. */
  bossRef: RefObject<HTMLDivElement | null>;
  /** Boss sprite image element whose `src` is controlled across clear sequence. */
  bossSpriteRef: RefObject<HTMLImageElement | null>;
  /** Boss arm element animated during exit phase. */
  bossArmRef: RefObject<HTMLDivElement | null>;
};

/**
 * Controls post-clear boss animation, special rocket sequence and FIN reveal timing.
 *
 * @param options - Inputs required to drive clear-result animation state.
 * @param options.gameOverIcon - Final result icon emitted by game loop.
 * @param options.fishCount - Collected fish count used for special-clear branching.
 * @param options.playerRef - Player element reference for clear-sequence motion updates.
 * @param options.playerSpriteRef - Player sprite image reference used for run-loop swaps.
 * @param options.gameRef - Game viewport reference used for timing and positioning.
 * @param options.bossRef - Boss base element reference.
 * @param options.bossSpriteRef - Boss sprite image reference for base-frame normalization.
 * @param options.bossArmRef - Boss arm element reference.
 * @returns Clear-sequence flags, icon sources, and reset handler for scene rendering.
 */
export function useBossClearSequence({
  gameOverIcon,
  fishCount,
  playerRef,
  playerSpriteRef,
  gameRef,
  bossRef,
  bossSpriteRef,
  bossArmRef,
}: UseBossClearSequenceOptions) {
  const [clearFrameIndex, setClearFrameIndex] = useState(0);
  const [clearSequencePhase, setClearSequencePhase] = useState<ClearSequencePhase>(
    CLEAR_SEQUENCE_PHASES.IDLE,
  );
  const [specialClearPhase, setSpecialClearPhase] = useState<SpecialClearPhase>(
    SPECIAL_CLEAR_PHASES.IDLE,
  );
  const [specialFinFrameIndex, setSpecialFinFrameIndex] = useState(0);
  const [showSpecialFin, setShowSpecialFin] = useState(false);
  const [specialFlyoutOrigin, setSpecialFlyoutOrigin] = useState<FlyoutOrigin | null>(null);
  const [specialRocketEntryDurationMs, setSpecialRocketEntryDurationMs] = useState(
    SPECIAL_ROCKET_ENTRY_MOVE_MS,
  );

  const isBossClearResult = equals(BOSS_CLEAR_ICON)(gameOverIcon);
  const shouldRunSpecialClear = isBossClearResult && fishCount >= SPECIAL_CLEAR_FISH_THRESHOLD;
  const {
    shouldShowHappyIcon,
    specialRocketIconSrc,
    shouldShowSpecialClearOverlay,
    shouldShowByeByeIcon,
    shouldShowSpecialFlyout,
    specialFinIconSrc,
    happyIconFrameSrc,
  } = deriveBossClearViewState({
    isBossClearResult,
    shouldRunSpecialClear,
    clearSequencePhase,
    specialClearPhase,
    showSpecialFin,
    specialFlyoutOrigin,
    specialFinFrameIndex,
    clearFrameIndex,
  });
  const shouldAnimateRocketEntry =
    shouldRunSpecialClear && specialClearPhase === SPECIAL_CLEAR_PHASES.ROCKET_1;

  const resetBossClearSequence = useCallback(() => {
    setClearFrameIndex(0);
    setClearSequencePhase(CLEAR_SEQUENCE_PHASES.IDLE);
    setSpecialClearPhase(SPECIAL_CLEAR_PHASES.IDLE);
    setSpecialFinFrameIndex(0);
    setShowSpecialFin(false);
    setSpecialFlyoutOrigin(null);
    setSpecialRocketEntryDurationMs(SPECIAL_ROCKET_ENTRY_MOVE_MS);
  }, []);

  useEffect(() => {
    if (!shouldShowHappyIcon) {
      setClearFrameIndex(0);
      return;
    }

    const clearIconIntervalId = window.setInterval(() => {
      setClearFrameIndex((prev) => (prev === 0 ? 1 : 0));
    }, CLEAR_ICON_SWAP_MS);

    return () => clearInterval(clearIconIntervalId);
  }, [shouldShowHappyIcon]);

  useEffect(() => {
    if (!showSpecialFin) {
      setSpecialFinFrameIndex(0);
      return;
    }

    const specialFinIntervalId = window.setInterval(() => {
      setSpecialFinFrameIndex((prev) => (prev === 0 ? 1 : 0));
    }, SPECIAL_FIN_SWAP_MS);

    return () => clearInterval(specialFinIntervalId);
  }, [showSpecialFin]);

  useEffect(() => {
    if (!isBossClearResult) {
      resetBossClearSequence();
    }
  }, [isBossClearResult, resetBossClearSequence]);

  useEffect(() => {
    if (!isBossClearResult) {
      return;
    }

    setClearSequencePhase(CLEAR_SEQUENCE_PHASES.BOSS_EXIT);
    setSpecialClearPhase(SPECIAL_CLEAR_PHASES.IDLE);
    setShowSpecialFin(false);
    setSpecialFlyoutOrigin(null);
    if (playerSpriteRef.current) {
      playerSpriteRef.current.src = PLAYER_STAND_SPRITE;
    }
    const timers = createTimeoutRegistry();

    initializeBossExitPose({ bossRef, bossSpriteRef, bossArmRef });
    scheduleBossPreExitJumps({ bossRef, bossSpriteRef, bossArmRef }, timers);
    timers.register(() => {
      applyBossMotion({
        bossRef,
        bossArmRef,
        transition: `transform ${CLEAR_BOSS_EXIT_MS}ms ease, opacity ${CLEAR_BOSS_EXIT_MS}ms ease`,
        transform: `translateX(${CLEAR_BOSS_EXIT_TRANSLATE_X})`,
        opacity: BOSS_HIDDEN_OPACITY,
      });
    }, CLEAR_BOSS_EXIT_START_DELAY_MS);

    if (shouldRunSpecialClear) {
      const specialRocketEntryMoveMs = resolveSpecialRocketEntryMoveMs(gameRef);
      setSpecialRocketEntryDurationMs(specialRocketEntryMoveMs);
      const specialApproachMoveMs = resolveSpecialApproachMoveMs({ playerRef, gameRef });
      const specialApproachDelayMs = isMobile()
        ? SPECIAL_ROCKET_ENTRY_PLAYER_DELAY_MS + MOBILE_SPECIAL_APPROACH_EXTRA_DELAY_MS
        : SPECIAL_ROCKET_ENTRY_PLAYER_DELAY_MS;
      const {
        specialApproachStartMs,
        specialRocket2Ms,
        specialByeMs,
        specialByeWithIconMs,
        specialFlyoutMs,
        specialDoneMs,
      } = resolveSpecialTimelineMoments({
        specialRocketEntryMoveMs,
        specialApproachMoveMs,
        specialApproachDelayMs,
      });
      const playerRunLoopController = createPlayerRunLoopController(playerSpriteRef);
      const specialTimelineSteps: TimelineStep[] = createSpecialTimelineSteps({
        clearBossTotalExitMs: CLEAR_BOSS_TOTAL_EXIT_MS,
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
        resolveAndSetFlyoutOrigin: () => {
          setSpecialFlyoutOrigin(resolveFlyoutOrigin(gameRef));
        },
        startPlayerRunLoop: playerRunLoopController.start,
        stopPlayerRunLoop: playerRunLoopController.stop,
        markSpecialFinished: () => {
          setSpecialFinFrameIndex(0);
          setSpecialFlyoutOrigin(null);
          setShowSpecialFin(true);
        },
        playerOpacityTransition: PLAYER_OPACITY_TRANSITION,
        playerVisibleOpacity: PLAYER_VISIBLE_OPACITY,
        playerHiddenOpacity: PLAYER_HIDDEN_OPACITY,
        playerVisibleVisibility: PLAYER_VISIBLE_VISIBILITY,
        playerHiddenVisibility: PLAYER_HIDDEN_VISIBILITY,
        playerCenterLeft: PLAYER_CENTER_LEFT,
        playerTranslateNone: PLAYER_TRANSLATE_NONE,
        playerTranslateToRocket: PLAYER_TRANSLATE_TO_ROCKET,
      });

      scheduleTimelineSteps(specialTimelineSteps, timers);

      return () => {
        timers.clearAll();
        playerRunLoopController.stop();
      };
    }

    const clearTimelineSteps: TimelineStep[] = createClearTimelineSteps({
      clearBossTotalExitMs: CLEAR_BOSS_TOTAL_EXIT_MS,
      clearPlayerMoveMs: CLEAR_PLAYER_MOVE_MS,
      clearPlayerFadeMs: CLEAR_PLAYER_FADE_MS,
      playerRef,
      setClearSequencePhase,
      playerOpacityTransition: PLAYER_OPACITY_TRANSITION,
      playerVisibleOpacity: PLAYER_VISIBLE_OPACITY,
      playerHiddenOpacity: PLAYER_HIDDEN_OPACITY,
      playerVisibleVisibility: PLAYER_VISIBLE_VISIBILITY,
      playerHiddenVisibility: PLAYER_HIDDEN_VISIBILITY,
      playerCenterLeft: PLAYER_CENTER_LEFT,
      playerTranslateCenter: PLAYER_TRANSLATE_CENTER,
    });

    scheduleTimelineSteps(clearTimelineSteps, timers);

    return () => timers.clearAll();
  }, [
    bossArmRef,
    bossRef,
    bossSpriteRef,
    gameRef,
    isBossClearResult,
    playerRef,
    playerSpriteRef,
    shouldRunSpecialClear,
  ]);

  return {
    clearSequencePhase,
    isBossClearResult,
    shouldShowHappyIcon,
    shouldShowSpecialClearOverlay,
    shouldShowByeByeIcon,
    shouldShowSpecialFlyout,
    shouldAnimateRocketEntry,
    showSpecialFin,
    specialRocketIconSrc,
    specialFlyoutOrigin,
    specialFinIconSrc,
    happyIconFrameSrc,
    specialFlyoutIconSrc: SPECIAL_ROCKET_ICON_3,
    specialByeByeIconSrc: SPECIAL_BYE_BYE_ICON,
    specialFlyoutDurationMs: SPECIAL_FLYOUT_MS,
    specialRocketEntryDurationMs,
    resetBossClearSequence,
  };
}
