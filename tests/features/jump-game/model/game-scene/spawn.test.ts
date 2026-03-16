import { act, renderHook } from '@testing-library/react';
import {
  useFishSpawnScheduler,
  useObstacleSpawnScheduler,
} from '@/features/jump-game/model/game-scene/spawn';
import {
  CROSS_ENTITY_SPAWN_SEPARATION_MS,
  FISH_SPAWN_TICK_MS,
} from '@/features/jump-game/model/config/scene-spawn';

describe('game-scene spawn schedulers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('prevents obstacle spawn within configured separation after fish spawn', () => {
    const spawnObstacle = vi.fn();
    const lastObstacleSpawnAtMsRef = { current: 0 };
    const lastFishSpawnAtMsRef = { current: Date.now() };

    renderHook(() =>
      useObstacleSpawnScheduler({
        gameOver: false,
        showBoss: false,
        bossPatternTwoActive: false,
        obstacleSpawnInterval: 100,
        normalSpawnRate: 1,
        lastObstacleSpawnAtMsRef,
        lastFishSpawnAtMsRef,
        spawnObstacle,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(CROSS_ENTITY_SPAWN_SEPARATION_MS - 100);
    });
    expect(spawnObstacle).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(spawnObstacle).toHaveBeenCalledTimes(1);
    expect(lastObstacleSpawnAtMsRef.current).toBeGreaterThan(0);
  });

  it('delays fish spawn while an obstacle was spawned within configured separation', () => {
    const spawnFish = vi.fn();
    const startNow = Date.now();
    const scheduledFishAt = startNow + FISH_SPAWN_TICK_MS * 2;
    const blockOffsetMs = Math.max(1, Math.floor(CROSS_ENTITY_SPAWN_SEPARATION_MS / 2));
    const startTimeRef = { current: startNow - 1000 };
    const fishSpawnTargetRef = { current: 1 };
    const fishSpawnedRef = { current: 0 };
    const nextFishSpawnAtMsRef = { current: scheduledFishAt };
    const lastObstacleSpawnAtMsRef = { current: scheduledFishAt - blockOffsetMs };
    const lastFishSpawnAtMsRef = { current: 0 };

    renderHook(() =>
      useFishSpawnScheduler({
        gameOver: false,
        startTimeRef,
        fishSpawnTargetRef,
        fishSpawnedRef,
        nextFishSpawnAtMsRef,
        lastObstacleSpawnAtMsRef,
        lastFishSpawnAtMsRef,
        spawnFish,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(FISH_SPAWN_TICK_MS);
    });
    expect(spawnFish).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(FISH_SPAWN_TICK_MS);
    });
    expect(spawnFish).not.toHaveBeenCalled();
    expect(nextFishSpawnAtMsRef.current).toBe(
      lastObstacleSpawnAtMsRef.current + CROSS_ENTITY_SPAWN_SEPARATION_MS,
    );

    act(() => {
      vi.setSystemTime(lastObstacleSpawnAtMsRef.current + CROSS_ENTITY_SPAWN_SEPARATION_MS + 1);
      vi.advanceTimersByTime(FISH_SPAWN_TICK_MS);
    });
    expect(spawnFish).toHaveBeenCalledTimes(1);
    expect(lastFishSpawnAtMsRef.current).toBeGreaterThanOrEqual(
      lastObstacleSpawnAtMsRef.current + CROSS_ENTITY_SPAWN_SEPARATION_MS,
    );
  });
});
