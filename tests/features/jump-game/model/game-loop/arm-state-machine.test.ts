import { BOSS_PATTERN_TWO_FLOAT_OFFSET_PX } from '@/features/jump-game/model/config/game-loop';
import {
  advanceArmStateMachine,
  getArmFrameConfig,
  getArmPhaseView,
} from '@/features/jump-game/model/game-loop/arm-state-machine';
import type { ArmState } from '@/features/jump-game/model/game-loop/types';

describe('getArmPhaseView', () => {
  const baseArmState: ArmState = {
    width: 0,
    phase: 'idle',
    lastPulseMs: 0,
    holdUntilMs: 0,
    targetLen: 120,
    phaseStartMs: 0,
    groundChargeStartMs: 0,
    nextAttackAllowedMs: 0,
    attackPattern: 'pattern1',
    patternOneCountSincePatternTwo: 0,
    initialPatternSequenceCompleted: true,
  };

  it('keeps pattern2 retract floating until arm fully returns', () => {
    const arm: ArmState = {
      ...baseArmState,
      phase: 'retract',
      phaseStartMs: 3_000,
      width: 60,
      attackPattern: 'pattern2',
    };

    const view = getArmPhaseView({
      arm,
      nowMs: 3_100,
      config: getArmFrameConfig(false),
      waitBobOffsetY: -7,
    });

    expect(view.waitOffsetY).toBe(-BOSS_PATTERN_TWO_FLOAT_OFFSET_PX);
  });

  it('scales desktop arm speed multiplier with the gameplay pace scale', () => {
    expect(getArmFrameConfig(false).armSpeedMultiplier).toBeCloseTo(2, 5);

    const config = getArmFrameConfig(false, 1.6);

    expect(config.armSpeedMultiplier).toBeCloseTo(1.6 * 2, 5);
  });

  it('keeps desktop arm movement progressing with larger frame deltas', () => {
    const baselineArm: ArmState = {
      ...baseArmState,
      phase: 'extending',
      targetLen: 120,
    };
    const droppedFrameArm: ArmState = {
      ...baseArmState,
      phase: 'extending',
      targetLen: 120,
    };

    advanceArmStateMachine({
      arm: baselineArm,
      nowMs: 1_000,
      deltaTimeMs: 16.6667,
      targetLen: 120,
      clearRequested: false,
      waitAtGround: false,
      config: getArmFrameConfig(false),
      isMobileViewport: false,
    });
    advanceArmStateMachine({
      arm: droppedFrameArm,
      nowMs: 1_000,
      deltaTimeMs: 33.3333,
      targetLen: 120,
      clearRequested: false,
      waitAtGround: false,
      config: getArmFrameConfig(false),
      isMobileViewport: false,
    });

    expect(droppedFrameArm.width).toBeGreaterThan(baselineArm.width);
  });
});
