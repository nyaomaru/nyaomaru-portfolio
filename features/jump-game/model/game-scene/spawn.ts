import { useEffect, type MutableRefObject } from 'react';
import {
  BOSS_PATTERN_TWO_ALLOWED_OBSTACLE_INDICES,
  BOSS_PATTERN_TWO_MIN_SPAWN_INTERVAL_MS,
  BOSS_PATTERN_TWO_OBSTACLE_RATE,
  BOSS_PATTERN_TWO_SPAWN_INTERVAL_FACTOR,
  CLEAR_DURATION_MS,
  CROSS_ENTITY_SPAWN_SEPARATION_MS,
  FISH_FIRST_SPAWN_MAX_DELAY_MS,
  FISH_FIRST_SPAWN_MIN_DELAY_MS,
  FISH_SPAWN_JITTER_RATIO,
  FISH_SPAWN_MIN_GAP_MS,
  FISH_SPAWN_TICK_MS,
} from '../config/scene-spawn';

type UseObstacleSpawnSchedulerParams = {
  /** True when gameplay has ended and scheduler should stop. */
  gameOver: boolean;
  /** True while boss mode is active. */
  showBoss: boolean;
  /** True while pattern-2 boss attack is active. */
  bossPatternTwoActive: boolean;
  /** Baseline obstacle spawn interval in milliseconds. */
  obstacleSpawnInterval: number;
  /** Spawn probability used during normal mode ticks. */
  normalSpawnRate: number;
  /** Last timestamp when an obstacle was actually spawned. */
  lastObstacleSpawnAtMsRef: MutableRefObject<number>;
  /** Last timestamp when a fish was actually spawned. */
  lastFishSpawnAtMsRef: MutableRefObject<number>;
  /** Callback that appends a new obstacle node to the scene. */
  spawnObstacle: (options?: { allowedIconIndices?: number[]; isBossMode?: boolean }) => void;
};

/**
 * Runs obstacle spawn scheduling for normal mode and boss pattern-2 mode.
 *
 * @param params - Obstacle spawn scheduler inputs.
 * @param params.gameOver - Stops scheduling when true.
 * @param params.showBoss - Indicates boss-mode rendering state.
 * @param params.bossPatternTwoActive - Indicates pattern-2 attack window state.
 * @param params.obstacleSpawnInterval - Base obstacle spawn tick interval.
 * @param params.normalSpawnRate - Probability threshold for normal obstacle spawns.
 * @param params.lastObstacleSpawnAtMsRef - Mutable timestamp of last obstacle spawn.
 * @param params.lastFishSpawnAtMsRef - Mutable timestamp of last fish spawn.
 * @param params.spawnObstacle - Obstacle spawn callback used by scheduler ticks.
 * @returns Nothing. Registers and cleans up interval side effects.
 */
export const useObstacleSpawnScheduler = ({
  gameOver,
  showBoss,
  bossPatternTwoActive,
  obstacleSpawnInterval,
  normalSpawnRate,
  lastObstacleSpawnAtMsRef,
  lastFishSpawnAtMsRef,
  spawnObstacle,
}: UseObstacleSpawnSchedulerParams) => {
  useEffect(() => {
    if (gameOver) return;

    const patternTwoSpawnInterval = Math.max(
      BOSS_PATTERN_TWO_MIN_SPAWN_INTERVAL_MS,
      Math.floor(obstacleSpawnInterval * BOSS_PATTERN_TWO_SPAWN_INTERVAL_FACTOR),
    );
    const currentSpawnInterval = bossPatternTwoActive
      ? patternTwoSpawnInterval
      : obstacleSpawnInterval;
    const spawnObstacleWithTimingGuard = (options?: {
      allowedIconIndices?: number[];
      isBossMode?: boolean;
    }) => {
      const nowMs = Date.now();
      const elapsedSinceFishSpawnMs = nowMs - lastFishSpawnAtMsRef.current;
      if (elapsedSinceFishSpawnMs < CROSS_ENTITY_SPAWN_SEPARATION_MS) return;
      spawnObstacle(options);
      lastObstacleSpawnAtMsRef.current = nowMs;
    };

    const intervalId = window.setInterval(() => {
      if (showBoss) {
        if (bossPatternTwoActive && Math.random() < BOSS_PATTERN_TWO_OBSTACLE_RATE) {
          spawnObstacleWithTimingGuard({
            allowedIconIndices: [...BOSS_PATTERN_TWO_ALLOWED_OBSTACLE_INDICES],
          });
        }
        return;
      }

      if (Math.random() < normalSpawnRate) {
        spawnObstacleWithTimingGuard();
      }
    }, currentSpawnInterval);

    return () => clearInterval(intervalId);
  }, [
    gameOver,
    showBoss,
    bossPatternTwoActive,
    obstacleSpawnInterval,
    normalSpawnRate,
    lastObstacleSpawnAtMsRef,
    lastFishSpawnAtMsRef,
    spawnObstacle,
  ]);
};

type UseFishSpawnSchedulerParams = {
  /** True when gameplay has ended and scheduler should stop. */
  gameOver: boolean;
  /** Match start timestamp shared by scene state. */
  startTimeRef: MutableRefObject<number | null>;
  /** Total number of fish to spawn in this run. */
  fishSpawnTargetRef: MutableRefObject<number>;
  /** Number of fish already spawned in this run. */
  fishSpawnedRef: MutableRefObject<number>;
  /** Absolute next spawn time in milliseconds. */
  nextFishSpawnAtMsRef: MutableRefObject<number>;
  /** Last timestamp when an obstacle was actually spawned. */
  lastObstacleSpawnAtMsRef: MutableRefObject<number>;
  /** Last timestamp when a fish was actually spawned. */
  lastFishSpawnAtMsRef: MutableRefObject<number>;
  /** Callback that appends a fish node to the scene. */
  spawnFish: () => void;
};

/**
 * Schedules fish spawns with jittered timing until the clear deadline.
 *
 * @param params - Fish spawn scheduler inputs.
 * @param params.gameOver - Stops scheduling when true.
 * @param params.startTimeRef - Match start timestamp reference.
 * @param params.fishSpawnTargetRef - Total fish spawn target reference.
 * @param params.fishSpawnedRef - Spawned fish count reference.
 * @param params.nextFishSpawnAtMsRef - Absolute next fish spawn timestamp reference.
 * @param params.lastObstacleSpawnAtMsRef - Mutable timestamp of last obstacle spawn.
 * @param params.lastFishSpawnAtMsRef - Mutable timestamp of last fish spawn.
 * @param params.spawnFish - Fish spawn callback used by scheduler ticks.
 * @returns Nothing. Registers and cleans up interval side effects.
 */
export const useFishSpawnScheduler = ({
  gameOver,
  startTimeRef,
  fishSpawnTargetRef,
  fishSpawnedRef,
  nextFishSpawnAtMsRef,
  lastObstacleSpawnAtMsRef,
  lastFishSpawnAtMsRef,
  spawnFish,
}: UseFishSpawnSchedulerParams) => {
  useEffect(() => {
    if (gameOver) return;

    const spawnTickId = window.setInterval(() => {
      if (!startTimeRef.current) return;
      if (fishSpawnedRef.current >= fishSpawnTargetRef.current) return;

      const nowMs = Date.now();
      const elapsedMs = nowMs - startTimeRef.current;
      if (elapsedMs >= CLEAR_DURATION_MS) return;

      if (nextFishSpawnAtMsRef.current === 0) {
        const initialDelay =
          FISH_FIRST_SPAWN_MIN_DELAY_MS +
          Math.random() * (FISH_FIRST_SPAWN_MAX_DELAY_MS - FISH_FIRST_SPAWN_MIN_DELAY_MS);
        nextFishSpawnAtMsRef.current = nowMs + initialDelay;
        return;
      }

      if (nowMs < nextFishSpawnAtMsRef.current) return;

      const elapsedSinceObstacleSpawnMs = nowMs - lastObstacleSpawnAtMsRef.current;
      if (elapsedSinceObstacleSpawnMs < CROSS_ENTITY_SPAWN_SEPARATION_MS) {
        nextFishSpawnAtMsRef.current = Math.max(
          nextFishSpawnAtMsRef.current,
          lastObstacleSpawnAtMsRef.current + CROSS_ENTITY_SPAWN_SEPARATION_MS,
        );
        return;
      }

      spawnFish();
      fishSpawnedRef.current += 1;
      lastFishSpawnAtMsRef.current = nowMs;

      const remainingCount = fishSpawnTargetRef.current - fishSpawnedRef.current;
      if (remainingCount <= 0) return;

      const remainingMs = Math.max(FISH_SPAWN_MIN_GAP_MS, CLEAR_DURATION_MS - elapsedMs);
      const baseGap = remainingMs / remainingCount;
      const jitter = baseGap * FISH_SPAWN_JITTER_RATIO;
      const nextGap = Math.max(FISH_SPAWN_MIN_GAP_MS, baseGap + (Math.random() * 2 - 1) * jitter);
      nextFishSpawnAtMsRef.current = nowMs + nextGap;
    }, FISH_SPAWN_TICK_MS);

    return () => clearInterval(spawnTickId);
  }, [
    gameOver,
    spawnFish,
    fishSpawnTargetRef,
    fishSpawnedRef,
    nextFishSpawnAtMsRef,
    startTimeRef,
    lastObstacleSpawnAtMsRef,
    lastFishSpawnAtMsRef,
  ]);
};
