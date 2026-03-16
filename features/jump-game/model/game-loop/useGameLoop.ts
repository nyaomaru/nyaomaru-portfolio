import { type MutableRefObject, type RefObject, useEffect, useRef } from 'react';
import { oneOfValues } from 'is-kit';
import { isMobile } from '@/shared/lib/window';
import { ARM_APPEAR_DELAY_MS } from '../config/gameplay';
import {
  BOSS_ATTACK_SPRITES,
  BOSS_BASE_SPRITES,
  BOSS_CLEAR_ICON,
  BOSS_GAME_OVER_ICON,
} from '../config/assets';
import {
  BOSS_ENTRY_DURATION_MS,
  BOSS_ENTRY_OFFSET_MULTIPLIER,
  PLAYER_HIDDEN_OPACITY,
  PLAYER_HIDDEN_VISIBILITY,
} from '../config/game-loop';
import { ARM_PHASE, ATTACK_PATTERN } from './constants';
import type { ArmState, BossBaseAnimationState, BossVisualState } from './types';
import {
  advanceArmStateMachine,
  getArmFrameConfig,
  getArmPhaseView,
  getArmTargetLength,
} from './arm-state-machine';
import {
  applyBossPoseForCombatFrame,
  hasBossArmCollision,
  renderBossIdleFrame,
  resetBossDomToBaseVisual,
} from './boss-dom';
import {
  createInitialArmState,
  createInitialBossBaseAnimationState,
  createInitialBossVisualState,
  getBossWaitBob,
  isPlayerOverlappingHitbox,
} from './helpers';
import { clearMovingEntities, updateObstaclesFrame } from './obstacles';
import { ensureBossSpriteLoaded, isBossSpritePreloaded } from './sprite-loader';
import {
  getDesktopGameplayPaceScale,
  getElapsedTime,
  getFrameTiming,
  getObstacleSpeedPxPerSec,
  shouldActivateBossMode,
  shouldRequestClear,
} from './runtime';
import { createGameViewportMetrics } from './viewport';

/**
 * External dependencies and setters consumed by the game-loop engine.
 */
type UseGameLoopParams = {
  /** Halts loop updates when true. */
  gameOver: boolean;
  /** Boss base element reference. */
  bossRef: RefObject<HTMLDivElement>;
  /** Boss sprite image reference rendered inside the boss base container. */
  bossSpriteRef: RefObject<HTMLImageElement>;
  /** Player element reference used for collision checks. */
  playerRef: RefObject<HTMLDivElement>;
  /** Mutable list of active obstacle/fish nodes. */
  obstaclesRef: MutableRefObject<HTMLElement[]>;
  /** Match start timestamp used for elapsed-time flow transitions. */
  startTimeRef: MutableRefObject<number | null>;
  /** Game viewport element reference. */
  gameRef: RefObject<HTMLDivElement>;
  /** Boss arm element reference. */
  bossArmRef: RefObject<HTMLDivElement>;
  /** Current boss visibility flag from scene state. */
  showBoss: boolean;
  /** Emits whether special pattern-2 attack window is active. */
  onBossPatternTwoActiveChange?: (value: boolean) => void;
  /** Called when fish obstacle collides with player. */
  onFishCollected?: () => void;
  /** Updates game-over state. */
  setGameOver: (value: boolean) => void;
  /** Updates top-level game title/message. */
  setTitle: (value: string) => void;
  /** Toggles boss rendering mode. */
  setShowBoss: (value: boolean) => void;
  /** Sets final overlay icon when run ends. */
  setGameOverIcon: (value: string | null) => void;
};

/**
 * Runs the per-frame simulation loop for obstacles, boss state machine, and collisions.
 *
 * @param params - Game-loop runtime dependencies and state mutators.
 * @param params.gameOver - Halts loop updates when true.
 * @param params.bossRef - Boss base element reference.
 * @param params.bossSpriteRef - Boss sprite image reference rendered inside boss base.
 * @param params.playerRef - Player element reference used for collisions.
 * @param params.obstaclesRef - Mutable obstacle/fish list reference.
 * @param params.startTimeRef - Match start timestamp reference.
 * @param params.gameRef - Game viewport element reference.
 * @param params.bossArmRef - Boss arm element reference.
 * @param params.showBoss - Current boss visibility state.
 * @param params.onBossPatternTwoActiveChange - Callback for pattern-2 window changes.
 * @param params.onFishCollected - Callback for fish pickup collisions.
 * @param params.setGameOver - Setter for game-over state.
 * @param params.setTitle - Setter for top-level game title text.
 * @param params.setShowBoss - Setter for boss visibility state.
 * @param params.setGameOverIcon - Setter for game-over icon source.
 * @returns Nothing. Runs simulation as side-effect via animation frame and timers.
 */
export function useGameLoop({
  bossArmRef,
  bossRef,
  bossSpriteRef,
  gameRef,
  obstaclesRef,
  playerRef,
  startTimeRef,
  gameOver,
  showBoss,
  onBossPatternTwoActiveChange,
  onFishCollected,
  setGameOver,
  setTitle,
  setShowBoss,
  setGameOverIcon,
}: UseGameLoopParams) {
  const isArmAttackCollisionPhase = oneOfValues(ARM_PHASE.EXTENDING, ARM_PHASE.HOLD);
  const isIdleArmPhase = oneOfValues(ARM_PHASE.IDLE);
  const armStateRef = useRef<ArmState>(createInitialArmState());
  const showBossRef = useRef(showBoss);
  const bossStartMsRef = useRef<number | null>(null);
  const bossBaseAnimRef = useRef<BossBaseAnimationState>(createInitialBossBaseAnimationState());
  const bossVisualRef = useRef<BossVisualState>(createInitialBossVisualState());
  const requestedBossSpriteRef = useRef<string>(BOSS_BASE_SPRITES[0]);
  const currentBossSpriteRef = useRef<string | null>(null);
  const bossSpriteHostRef = useRef<HTMLImageElement | null>(null);
  const bossPatternTwoActiveRef = useRef(false);
  const clearRequestedRef = useRef(false);
  const lastFrameAtMsRef = useRef<number | null>(null);
  showBossRef.current = showBoss;

  const setBossSprite = (spritePath: string) => {
    requestedBossSpriteRef.current = spritePath;
    const applySprite = () => {
      const bossSpriteElement = bossSpriteRef.current;
      if (!bossSpriteElement) return;
      if (requestedBossSpriteRef.current !== spritePath) return;
      if (bossSpriteHostRef.current !== bossSpriteElement) {
        bossSpriteHostRef.current = bossSpriteElement;
        currentBossSpriteRef.current = null;
      }
      if (currentBossSpriteRef.current === spritePath) return;
      currentBossSpriteRef.current = spritePath;
      bossSpriteElement.src = spritePath;
    };

    if (isBossSpritePreloaded(spritePath)) {
      applySprite();
      return;
    }

    void ensureBossSpriteLoaded(spritePath).then(applySprite);
  };

  const syncBossPatternTwoActive = (isActive: boolean) => {
    if (bossPatternTwoActiveRef.current === isActive) return;
    bossPatternTwoActiveRef.current = isActive;
    onBossPatternTwoActiveChange?.(isActive);
  };

  const hidePlayer = () => {
    if (playerRef.current) {
      playerRef.current.style.opacity = PLAYER_HIDDEN_OPACITY;
      playerRef.current.style.visibility = PLAYER_HIDDEN_VISIBILITY;
    }
  };

  const { getGameWidth, getBaselineScale, getBossBaseWidthPx, getBossRightOffsetPx } =
    createGameViewportMetrics(gameRef);

  const resetArmCoreState = () => {
    const arm = armStateRef.current;
    arm.width = 0;
    arm.phase = ARM_PHASE.IDLE;
    arm.phaseStartMs = 0;
    arm.groundChargeStartMs = 0;
    arm.nextAttackAllowedMs = 0;
    arm.attackPattern = ATTACK_PATTERN.ONE;
    arm.patternOneCountSincePatternTwo = 0;
    arm.initialPatternSequenceCompleted = false;
  };

  const resetArmPulseState = () => {
    const arm = armStateRef.current;
    arm.lastPulseMs = 0;
    arm.holdUntilMs = 0;
    arm.targetLen = 0;
  };

  const resetBossDom = () => {
    resetBossDomToBaseVisual({
      bossArmRef,
      bossRef,
      bossBaseAnimRef,
      bossVisualRef,
      currentBossSpriteRef,
      bossSpriteHostRef,
      requestedBossSpriteRef,
      getBossBaseWidthPx,
      getBossRightOffsetPx,
      setBossSprite,
    });
  };

  const triggerFault = (icon: string | null) => {
    clearMovingEntities(obstaclesRef);
    hidePlayer();
    syncBossPatternTwoActive(false);
    setTitle('');
    setGameOverIcon(icon);
    setGameOver(true);
  };
  const triggerClearSuccess = () => {
    clearMovingEntities(obstaclesRef);
    syncBossPatternTwoActive(false);
    setTitle('');
    setGameOverIcon(BOSS_CLEAR_ICON);
    setGameOver(true);
  };

  const updateBossCombatFrame = (nowMs: number, deltaTimeMs: number, isMobileViewport: boolean) => {
    const arm = armStateRef.current;
    const gameWidth = getGameWidth();
    const gameRect = gameRef.current?.getBoundingClientRect() ?? null;
    const playerRect = playerRef.current?.getBoundingClientRect() ?? null;
    const desktopPaceScale = isMobileViewport
      ? 1
      : getDesktopGameplayPaceScale({
          viewportWidthPx: window.innerWidth,
          gameWidthPx: gameWidth,
        });
    const config = getArmFrameConfig(isMobileViewport, desktopPaceScale);
    const baselineScale = getBaselineScale();
    const entryElapsedMs = bossStartMsRef.current === null ? 0 : nowMs - bossStartMsRef.current;
    const entryProgress = Math.min(1, entryElapsedMs / BOSS_ENTRY_DURATION_MS);
    const bossBaseWidthPx = getBossBaseWidthPx();
    const bossEntryOffset = bossBaseWidthPx * BOSS_ENTRY_OFFSET_MULTIPLIER * (1 - entryProgress);
    const bossRightOffsetPx = getBossRightOffsetPx(isMobileViewport);
    const preAdvanceWaitBobElapsedMs =
      isIdleArmPhase(arm.phase) && arm.phaseStartMs > 0 ? nowMs - arm.phaseStartMs : entryElapsedMs;
    const preAdvanceWaitBobState = getBossWaitBob(preAdvanceWaitBobElapsedMs, baselineScale);
    const targetLen = getArmTargetLength(gameWidth, bossRightOffsetPx, isMobileViewport);

    advanceArmStateMachine({
      arm,
      nowMs,
      deltaTimeMs,
      targetLen,
      clearRequested: clearRequestedRef.current,
      waitAtGround: preAdvanceWaitBobState.atGround,
      config,
      isMobileViewport,
    });

    // Recompute bob state after FSM advance so retract->idle transition frame
    // uses grounded idle offset instead of stale pre-transition offset.
    const postAdvanceWaitBobElapsedMs =
      isIdleArmPhase(arm.phase) && arm.phaseStartMs > 0 ? nowMs - arm.phaseStartMs : entryElapsedMs;
    const postAdvanceWaitBobState = getBossWaitBob(postAdvanceWaitBobElapsedMs, baselineScale);

    const phaseView = getArmPhaseView({
      arm,
      nowMs,
      config,
      waitBobOffsetY: postAdvanceWaitBobState.offsetY,
    });
    syncBossPatternTwoActive(!clearRequestedRef.current && phaseView.isPatternTwoObstacleWindow);

    applyBossPoseForCombatFrame({
      arm,
      nowMs,
      baselineScale,
      bossEntryOffset,
      bossRightOffsetPx,
      phaseView,
      bossArmRef,
      bossRef,
      bossBaseAnimRef,
      bossVisualRef,
      currentBossSpriteRef,
      bossSpriteHostRef,
      requestedBossSpriteRef,
      getBossBaseWidthPx,
      getBossRightOffsetPx: () => getBossRightOffsetPx(isMobileViewport),
      setBossSprite,
    });

    if (
      hasBossArmCollision({
        arm,
        config,
        bossBaseWidthPx,
        bossRightOffsetPx,
        bossEntryOffset,
        waitOffsetY: phaseView.waitOffsetY,
        baselineScale,
        gameRect,
        playerRef,
        playerRect,
        clearRequested: clearRequestedRef.current,
        isArmAttackCollisionPhase,
        isPlayerOverlappingHitbox,
      })
    ) {
      triggerFault(BOSS_GAME_OVER_ICON);
      return true;
    }
    return false;
  };

  useEffect(() => {
    void Promise.all([...BOSS_BASE_SPRITES, ...BOSS_ATTACK_SPRITES].map(ensureBossSpriteLoaded));
  }, []);

  useEffect(() => {
    if (!gameOver) {
      clearRequestedRef.current = false;
      bossStartMsRef.current = null;
      lastFrameAtMsRef.current = null;
      resetArmCoreState();
      resetArmPulseState();
      resetBossDom();
      syncBossPatternTwoActive(false);
    }
  }, [gameOver]);

  useEffect(() => {
    if (!showBoss) {
      bossStartMsRef.current = null;
      resetArmCoreState();
      resetBossDom();
      syncBossPatternTwoActive(false);
    }
  }, [showBoss]);

  useEffect(() => {
    if (gameOver) return;

    let animationId: number;

    const loop = () => {
      if (gameOver) return;
      const nowMs = performance.now();
      const timing = getFrameTiming(nowMs, lastFrameAtMsRef.current);
      lastFrameAtMsRef.current = timing.nowMs;

      const elapsedTime = getElapsedTime(startTimeRef.current, Date.now());
      startTimeRef.current = elapsedTime.startTimeMs;
      const isMobileViewport = isMobile();

      // Trigger boss mode once elapsed time reaches the configured entry timing.
      if (shouldActivateBossMode(elapsedTime.elapsedSeconds)) {
        setShowBoss(true);
      }

      if (shouldRequestClear(elapsedTime.elapsedSeconds)) {
        clearRequestedRef.current = true;
      }

      const desktopPaceScale = isMobileViewport
        ? 1
        : getDesktopGameplayPaceScale({
            viewportWidthPx: window.innerWidth,
            gameWidthPx: getGameWidth(),
          });
      const obstacleSpeedPxPerSec = getObstacleSpeedPxPerSec(isMobileViewport, desktopPaceScale);
      const playerRect = playerRef.current?.getBoundingClientRect() ?? null;
      const gameRect = gameRef.current?.getBoundingClientRect() ?? null;
      const fatalCollisionIcon = updateObstaclesFrame({
        clearRequested: clearRequestedRef.current,
        obstacleSpeedPxPerSec,
        deltaTimeMs: timing.deltaTimeMs,
        obstaclesRef,
        playerRef,
        playerRect,
        getGameWidth,
        getGameRect: () => gameRect,
        isBossVisible: showBossRef.current,
        onFishCollected,
      });

      if (fatalCollisionIcon !== undefined) {
        triggerFault(fatalCollisionIcon);
        return;
      }

      if (showBossRef.current && bossStartMsRef.current === null) {
        bossStartMsRef.current = nowMs;
      }

      const armDelayOk =
        showBossRef.current &&
        bossArmRef.current &&
        bossStartMsRef.current !== null &&
        nowMs - bossStartMsRef.current >= ARM_APPEAR_DELAY_MS;

      if (armDelayOk) {
        if (updateBossCombatFrame(nowMs, timing.deltaTimeMs, isMobileViewport)) return;
      } else {
        syncBossPatternTwoActive(false);
        const baselineScale = getBaselineScale();
        const entryElapsedMs = bossStartMsRef.current === null ? 0 : nowMs - bossStartMsRef.current;
        const arm = armStateRef.current;
        const waitBobElapsedMs =
          isIdleArmPhase(arm.phase) && arm.phaseStartMs > 0
            ? nowMs - arm.phaseStartMs
            : entryElapsedMs;
        const waitBobOffsetY = showBossRef.current
          ? getBossWaitBob(waitBobElapsedMs, baselineScale).offsetY
          : 0;
        renderBossIdleFrame({
          nowMs,
          showBoss: showBossRef.current,
          entryElapsedMs,
          waitBobOffsetY,
          bossArmRef,
          bossRef,
          bossBaseAnimRef,
          bossVisualRef,
          currentBossSpriteRef,
          bossSpriteHostRef,
          requestedBossSpriteRef,
          getBossBaseWidthPx,
          getBossRightOffsetPx: () => getBossRightOffsetPx(isMobileViewport),
          setBossSprite,
        });
      }

      if (clearRequestedRef.current) {
        const shouldWaitForBossAttackFinish =
          showBossRef.current && !isIdleArmPhase(armStateRef.current.phase);
        if (!shouldWaitForBossAttackFinish) {
          triggerClearSuccess();
          return;
        }
      }

      animationId = requestAnimationFrame(loop);
    };

    loop();
    return () => {
      syncBossPatternTwoActive(false);
      lastFrameAtMsRef.current = null;
      cancelAnimationFrame(animationId);
    };
  }, [gameOver]);
}
