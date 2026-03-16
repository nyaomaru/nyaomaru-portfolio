import {
  getDesktopGameplayPaceScale,
  getObstacleSpeedPxPerSec,
} from '@/features/jump-game/model/game-loop/runtime';
import { PC_OBSTACLE_SPEED } from '@/features/jump-game/model/config/gameplay';

describe('getObstacleSpeedPxPerSec', () => {
  it('keeps legacy desktop pace through the MacBook Pro range and below the large-screen cutoff', () => {
    expect(getDesktopGameplayPaceScale({ viewportWidthPx: 1700, gameWidthPx: 1056 })).toBe(1);
    expect(getDesktopGameplayPaceScale({ viewportWidthPx: 1899, gameWidthPx: 1056 })).toBe(1);
    expect(getDesktopGameplayPaceScale({ viewportWidthPx: 2560, gameWidthPx: 1340 })).toBeCloseTo(
      2560 / 1900,
      5,
    );
  });

  it('scales desktop obstacle speed only for large desktop viewport widths', () => {
    const baselineSpeed = getObstacleSpeedPxPerSec(false, 1);
    const wideViewportSpeed = getObstacleSpeedPxPerSec(false, 2560 / 1900);

    expect(baselineSpeed).toBe(PC_OBSTACLE_SPEED * 60);
    expect(wideViewportSpeed).toBeCloseTo(baselineSpeed * (2560 / 1900), 5);
  });

  it('keeps mobile obstacle speed independent from desktop baseline pace', () => {
    const baselineSpeed = getObstacleSpeedPxPerSec(true, 1);
    const repeatedSpeed = getObstacleSpeedPxPerSec(true, 1.5);

    expect(repeatedSpeed).toBe(baselineSpeed);
  });
});
