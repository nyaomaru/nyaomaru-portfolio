import { renderHook } from '@testing-library/react';
import { useFishSpawnScheduler } from '@/features/jump-game/model/game-scene/spawn';

describe('useFishSpawnScheduler', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses timeout scheduling instead of interval polling', () => {
    const setIntervalSpy = vi.spyOn(window, 'setInterval');
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout');

    renderHook(() =>
      useFishSpawnScheduler({
        gameOver: false,
        startTimeRef: {
          current: Date.now(),
        } as React.MutableRefObject<number | null>,
        fishSpawnTargetRef: {
          current: 1,
        } as React.MutableRefObject<number>,
        fishSpawnedRef: {
          current: 0,
        } as React.MutableRefObject<number>,
        nextFishSpawnAtMsRef: {
          current: Date.now() + 500,
        } as React.MutableRefObject<number>,
        lastObstacleSpawnAtMsRef: {
          current: 0,
        } as React.MutableRefObject<number>,
        lastFishSpawnAtMsRef: {
          current: 0,
        } as React.MutableRefObject<number>,
        spawnFish: vi.fn(),
      }),
    );

    expect(setIntervalSpy).not.toHaveBeenCalled();
    expect(setTimeoutSpy).toHaveBeenCalled();
  });
});
