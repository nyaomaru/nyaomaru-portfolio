import type { RefObject } from 'react';
import {
  resolveSpecialApproachMoveMs,
  resolveSpecialRocketEntryMoveMs,
} from '@/features/jump-game/model/clear-sequence/helpers';
import {
  DESKTOP_SPECIAL_APPROACH_MOVE_DURATION_MULTIPLIER,
  FRAME_RATE,
  MIN_SPECIAL_APPROACH_MOVE_MS,
  MIN_SPECIAL_ROCKET_ENTRY_MOVE_MS,
  MS_PER_SECOND,
  PLAYER_APPROACH_ALIGNMENT_WIDTH_RATIO,
  ROCKET_ENTRY_DISTANCE_RATIO,
  ROCKET_TARGET_CENTER_X_RATIO,
  SPECIAL_ROCKET_ENTRY_MOVE_DURATION_MULTIPLIER,
} from '@/features/jump-game/model/config/clear-sequence';
import { PC_OBSTACLE_SPEED } from '@/features/jump-game/model/config/gameplay';

vi.mock('@/shared/lib/window', () => ({
  isMobile: () => false,
}));

describe('resolveSpecialApproachMoveMs', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1668,
    });
  });

  it('slows desktop special approach pace with the configured duration multiplier', () => {
    const player = document.createElement('div');
    const game = document.createElement('div');

    vi.spyOn(player, 'getBoundingClientRect').mockReturnValue({
      left: 120,
      right: 180,
      top: 0,
      bottom: 60,
      width: 60,
      height: 60,
      x: 120,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
    vi.spyOn(game, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      right: 1200,
      top: 0,
      bottom: 360,
      width: 1200,
      height: 360,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);

    const resolvedMoveMs = resolveSpecialApproachMoveMs({
      playerRef: { current: player } as RefObject<HTMLDivElement>,
      gameRef: { current: game } as RefObject<HTMLDivElement>,
    });

    const approachDistancePx = Math.abs(
      1200 * ROCKET_TARGET_CENTER_X_RATIO - 60 * PLAYER_APPROACH_ALIGNMENT_WIDTH_RATIO - 120,
    );
    const baseApproachMoveMs = Math.max(
      MIN_SPECIAL_APPROACH_MOVE_MS,
      Math.round((approachDistancePx / (PC_OBSTACLE_SPEED * FRAME_RATE)) * MS_PER_SECOND),
    );

    expect(resolvedMoveMs).toBe(
      Math.round(baseApproachMoveMs * DESKTOP_SPECIAL_APPROACH_MOVE_DURATION_MULTIPLIER),
    );
  });

  it('slows rocket entry pace with the configured duration multiplier', () => {
    const game = document.createElement('div');

    vi.spyOn(game, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      right: 1200,
      top: 0,
      bottom: 360,
      width: 1200,
      height: 360,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);

    const resolvedMoveMs = resolveSpecialRocketEntryMoveMs({
      current: game,
    } as RefObject<HTMLDivElement>);

    const entryDistancePx = 1200 * ROCKET_ENTRY_DISTANCE_RATIO;
    const baseEntryMoveMs = Math.max(
      MIN_SPECIAL_ROCKET_ENTRY_MOVE_MS,
      Math.round((entryDistancePx / (PC_OBSTACLE_SPEED * FRAME_RATE)) * MS_PER_SECOND),
    );

    expect(resolvedMoveMs).toBe(
      Math.round(baseEntryMoveMs * SPECIAL_ROCKET_ENTRY_MOVE_DURATION_MULTIPLIER),
    );
  });
});
