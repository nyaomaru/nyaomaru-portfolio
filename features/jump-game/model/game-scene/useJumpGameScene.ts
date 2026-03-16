import { type CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import { oneOfValues } from 'is-kit';
import { isMobile } from '@/shared/lib/window';
import { useJump } from '../useJump';
import { useObstacles } from '../useObstacles';
import { useGameLoop } from '../game-loop';
import {
  DEFAULT_MESSAGE,
  MOBILE_MODE_OBSTACLE_SPAWN_RATE,
  NORMAL_MODE_OBSTACLE_SPAWN_RATE,
  PC_OBSTACLE_SPAWN_INTERVAL,
  MOBILE_OBSTACLE_SPAWN_INTERVAL,
} from '../config/gameplay';
import { usePlayerSpriteAnimator } from '../usePlayerSpriteAnimator';
import { useJumpInputControls } from '../useJumpInputControls';
import { useBossClearSequence } from '../useBossClearSequence';
import { FISH_COUNTER_ICON, SCENE_PRELOAD_SPRITES } from '../config/assets';
import { FISH_MAX_TOTAL_SPAWN, FISH_MIN_TOTAL_SPAWN } from '../config/scene-spawn';
import {
  createBossArmStyle,
  createBossStyle,
  createPlayerStyle,
  preloadSpriteAssets,
  resetBossArmVisualState,
  resetBossVisualState,
  resetPlayerVisualState,
} from './constants';
import { useFishSpawnScheduler, useObstacleSpawnScheduler } from './spawn';
import type { JumpGameBindings, JumpGameSceneView } from './types';

/**
 * Scene orchestrator for jump-game UI.
 * Coordinates game-loop hooks, clear sequences, spawning, reset behavior and render-ready state.
 *
 * @param bindings - Parent-level callbacks used to sync game status and reset registration.
 * @param bindings.onGameOverChange - Receives game-over state transitions.
 * @param bindings.onRegisterReset - Receives restart handler registration.
 * @param bindings.onGameMessageChange - Receives HUD/title message updates.
 * @returns Render-facing scene state, refs, and computed styles for `JumpGame`.
 */
export function useJumpGameScene({
  onGameOverChange,
  onRegisterReset,
  onGameMessageChange,
  onRestartReadyChange,
}: JumpGameBindings): JumpGameSceneView {
  const isMobileViewport = isMobile();
  const isHappyClearPhase = oneOfValues('happy');
  const playerRef = useRef<HTMLDivElement>(null);
  const playerSpriteRef = useRef<HTMLImageElement>(null);
  const gameRef = useRef<HTMLDivElement>(null);
  const bossRef = useRef<HTMLDivElement>(null);
  const bossSpriteRef = useRef<HTMLImageElement>(null);
  const bossArmRef = useRef<HTMLDivElement>(null);

  const [gameOver, setGameOver] = useState(false);
  const [showBoss, setShowBoss] = useState(false);
  const [bossPatternTwoActive, setBossPatternTwoActive] = useState(false);
  const [gameTitle, setTitle] = useState<string>(DEFAULT_MESSAGE);
  const [gameOverIcon, setGameOverIcon] = useState<string | null>(null);
  const [fishCount, setFishCount] = useState(0);

  const startTimeRef = useRef<number | null>(null);
  const fishSpawnTargetRef = useRef(0);
  const fishSpawnedRef = useRef(0);
  const nextFishSpawnAtMsRef = useRef(0);
  const lastObstacleSpawnAtMsRef = useRef(0);
  const lastFishSpawnAtMsRef = useRef(0);

  const obstacleSpawnInterval = isMobileViewport
    ? MOBILE_OBSTACLE_SPAWN_INTERVAL
    : PC_OBSTACLE_SPAWN_INTERVAL;

  const { jump, isOnGroundRef, resetJumpState } = useJump(playerRef);

  const { obstaclesRef, spawnObstacle, spawnFish, clearObstacles } = useObstacles(gameRef);

  const { resetPlayerSpriteState } = usePlayerSpriteAnimator({
    playerSpriteRef,
    gameOver,
    isOnGroundRef,
  });

  const { resetJumpInput } = useJumpInputControls({
    gameRef,
    onJump: jump,
  });

  const handleFishCollected = useCallback(() => {
    setFishCount((prev) => prev + 1);
  }, []);

  const initializeFishSpawnPlan = useCallback(() => {
    fishSpawnTargetRef.current =
      Math.floor(Math.random() * (FISH_MAX_TOTAL_SPAWN - FISH_MIN_TOTAL_SPAWN + 1)) +
      FISH_MIN_TOTAL_SPAWN;
    fishSpawnedRef.current = 0;
    nextFishSpawnAtMsRef.current = 0;
    lastObstacleSpawnAtMsRef.current = 0;
    lastFishSpawnAtMsRef.current = 0;
  }, []);

  useGameLoop({
    gameOver,
    bossRef,
    playerRef,
    obstaclesRef,
    startTimeRef,
    gameRef,
    bossArmRef,
    bossSpriteRef,
    showBoss,
    onBossPatternTwoActiveChange: setBossPatternTwoActive,
    onFishCollected: handleFishCollected,
    setGameOver,
    setTitle: (value: string) => setTitle(value),
    setShowBoss,
    setGameOverIcon,
  });

  const bossClearSequence = useBossClearSequence({
    gameOverIcon,
    fishCount,
    playerRef,
    playerSpriteRef,
    gameRef,
    bossRef,
    bossSpriteRef,
    bossArmRef,
  });
  const { resetBossClearSequence } = bossClearSequence;

  const resetGame = useCallback(() => {
    resetPlayerVisualState(playerRef.current);
    resetBossVisualState(bossRef.current);
    resetBossArmVisualState(bossArmRef.current);
    resetPlayerSpriteState();
    resetJumpInput();
    resetBossClearSequence();

    clearObstacles();

    startTimeRef.current = null;
    resetJumpState();

    setGameOver(false);
    setShowBoss(false);
    setBossPatternTwoActive(false);
    setGameOverIcon(null);
    setTitle(DEFAULT_MESSAGE);
    setFishCount(0);
    initializeFishSpawnPlan();
  }, [
    clearObstacles,
    initializeFishSpawnPlan,
    resetJumpState,
    resetJumpInput,
    resetBossClearSequence,
    resetPlayerSpriteState,
  ]);

  useEffect(() => {
    onGameOverChange?.(gameOver);
  }, [gameOver, onGameOverChange]);

  useEffect(() => {
    onRegisterReset?.(resetGame);
  }, [onRegisterReset, resetGame]);

  useEffect(() => {
    onGameMessageChange?.(gameOverIcon ? '' : gameTitle);
  }, [gameOverIcon, gameTitle, onGameMessageChange]);

  useEffect(() => {
    const isRestartReady =
      gameOver &&
      (!bossClearSequence.isBossClearResult ||
        isHappyClearPhase(bossClearSequence.clearSequencePhase));
    onRestartReadyChange?.(isRestartReady);
  }, [
    bossClearSequence.clearSequencePhase,
    bossClearSequence.isBossClearResult,
    gameOver,
    isHappyClearPhase,
    onRestartReadyChange,
  ]);

  useEffect(() => {
    preloadSpriteAssets(SCENE_PRELOAD_SPRITES);
  }, []);

  useEffect(() => {
    initializeFishSpawnPlan();
  }, [initializeFishSpawnPlan]);

  const normalSpawnRate = isMobileViewport
    ? MOBILE_MODE_OBSTACLE_SPAWN_RATE
    : NORMAL_MODE_OBSTACLE_SPAWN_RATE;

  useObstacleSpawnScheduler({
    gameOver,
    showBoss,
    bossPatternTwoActive,
    obstacleSpawnInterval,
    normalSpawnRate,
    lastObstacleSpawnAtMsRef,
    lastFishSpawnAtMsRef,
    spawnObstacle,
  });
  useFishSpawnScheduler({
    gameOver,
    startTimeRef,
    fishSpawnTargetRef,
    fishSpawnedRef,
    nextFishSpawnAtMsRef,
    lastObstacleSpawnAtMsRef,
    lastFishSpawnAtMsRef,
    spawnFish,
  });

  const shouldRenderBoss =
    showBoss &&
    (!gameOver ||
      (bossClearSequence.isBossClearResult &&
        !isHappyClearPhase(bossClearSequence.clearSequencePhase)));
  const shouldShowGameOverIcon =
    !!gameOverIcon &&
    (!bossClearSequence.isBossClearResult || bossClearSequence.shouldShowHappyIcon);
  const gameOverDisplayIcon = shouldShowGameOverIcon
    ? bossClearSequence.shouldShowHappyIcon
      ? bossClearSequence.happyIconFrameSrc
      : gameOverIcon
    : null;

  const playerStyle: CSSProperties = createPlayerStyle();
  const bossStyle: CSSProperties = createBossStyle(isMobileViewport);
  const bossArmStyle: CSSProperties = createBossArmStyle();

  return {
    refs: {
      playerRef,
      playerSpriteRef,
      gameRef,
      bossRef,
      bossSpriteRef,
      bossArmRef,
    },
    fishCount,
    fishCounterIconSrc: FISH_COUNTER_ICON,
    shouldRenderBoss,
    shouldShowGameOverIcon,
    gameOverDisplayIcon,
    shouldShowSpecialClearOverlay: bossClearSequence.shouldShowSpecialClearOverlay,
    shouldAnimateRocketEntry: bossClearSequence.shouldAnimateRocketEntry,
    specialRocketIconSrc: bossClearSequence.specialRocketIconSrc,
    specialRocketEntryDurationMs: bossClearSequence.specialRocketEntryDurationMs,
    shouldShowByeByeIcon: bossClearSequence.shouldShowByeByeIcon,
    specialByeByeIconSrc: bossClearSequence.specialByeByeIconSrc,
    shouldShowSpecialFlyout: bossClearSequence.shouldShowSpecialFlyout,
    specialFlyoutOrigin: bossClearSequence.specialFlyoutOrigin,
    specialFlyoutDurationMs: bossClearSequence.specialFlyoutDurationMs,
    specialFlyoutIconSrc: bossClearSequence.specialFlyoutIconSrc,
    showSpecialFin: bossClearSequence.showSpecialFin,
    specialFinIconSrc: bossClearSequence.specialFinIconSrc,
    playerStyle,
    bossStyle,
    bossArmStyle,
  };
}
