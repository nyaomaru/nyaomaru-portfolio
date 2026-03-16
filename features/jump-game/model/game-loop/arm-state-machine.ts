import { BOSS_ATTACK_SPRITES } from '../config/assets';
import { BOSS_ARM } from '../config/gameplay';
import {
  ARM_FRAME_BASE_DURATION_MS,
  ARM_FRAME_DELTA_MAX_SCALE,
  ARM_FRAME_DELTA_MIN_SCALE,
  ARM_EXTEND_FAST_FROM_FRAME_NUMBER,
  ARM_EXTEND_FAST_SPEED_MULTIPLIER,
  ARM_EXTEND_FAST_TO_FRAME_NUMBER,
  ARM_HITBOX_VERTICAL_OFFSET_RATIO,
  ARM_HIT_START_PROGRESS_RATIO,
  ARM_HOLD_MS,
  ARM_RETRACT_FAST_FROM_FRAME_NUMBER,
  ARM_RETRACT_FAST_SPEED_MULTIPLIER,
  ARM_RETRACT_FAST_TO_FRAME_NUMBER,
  ARM_RETRACT_SPEED_MULTIPLIER,
  BOSS_PATTERN_ONE_REPEAT_BEFORE_PATTERN_TWO,
  BOSS_PATTERN_TWO_FLOAT_OFFSET_PX,
  BOSS_PATTERN_TWO_POST_ATTACK_SETTLE_MS,
  BOSS_PATTERN_TWO_HOLD_MS,
  BOSS_PATTERN_TWO_LIFT_DURATION_MS,
  BOSS_PATTERN_TWO_RANDOM_RATE,
  BOSS_WAIT_ATTACK_CHARGE_MS,
  MOBILE_ARM_EXTEND_FAST_FROM_FRAME_NUMBER,
  MOBILE_ARM_EXTEND_FAST_TO_FRAME_NUMBER,
  MOBILE_ARM_HITBOX_VERTICAL_OFFSET_RATIO,
  MOBILE_ARM_HIT_START_PROGRESS_RATIO,
  MOBILE_ARM_RETRACT_FAST_FROM_FRAME_NUMBER,
  MOBILE_ARM_RETRACT_FAST_TO_FRAME_NUMBER,
  MOBILE_BOSS_ATTACK_LENGTH_RATIO,
  MOBILE_BOSS_ATTACK_MAX_FRAME_INDEX,
  MOBILE_BOSS_ARM_SPEED_BOOST_MULTIPLIER,
  MOBILE_BOSS_ATTACK_SPEED_MULTIPLIER,
  MOBILE_BOSS_WAIT_ATTACK_CHARGE_MS,
  PATTERN_ONE_POST_ATTACK_WAIT_MS,
  PC_BOSS_ATTACK_SPEED_MULTIPLIER,
  PC_BOSS_RETRACT_SPEED_MULTIPLIER,
} from '../config/game-loop';
import { ARM_PHASE, ATTACK_PATTERN } from './constants';
import { equals } from 'is-kit';
import type { ArmPhase, ArmState } from './types';
import { getAttackFrameIndex } from './helpers';

export type ArmFrameConfig = {
  /** Max sprite frame index allowed for current viewport mode. */
  attackFrameMaxIndex: number;
  /** Speed multiplier applied to extend/retract movement. */
  armSpeedMultiplier: number;
  /** Progress threshold after which arm collision becomes active. */
  armHitStartProgressRatio: number;
  /** Vertical hitbox shift ratio against arm height. */
  armHitboxVerticalOffsetRatio: number;
  /** Frame number where fast-extend segment starts. */
  extendFastFromFrameNumber: number;
  /** Frame number where fast-extend segment ends. */
  extendFastToFrameNumber: number;
  /** Frame number where fast-retract segment starts. */
  retractFastFromFrameNumber: number;
  /** Frame number where fast-retract segment ends. */
  retractFastToFrameNumber: number;
  /** Charge duration required before initiating next attack. */
  attackChargeMs: number;
};

export type ArmPhaseView = {
  /** Selected attack sprite frame index for current phase. */
  frameIndex: number;
  /** Whether arm is in active attack phases (extend/hold/retract). */
  isAttackPhase: boolean;
  /** Whether pattern-2 obstacle spawn window should stay enabled. */
  isPatternTwoObstacleWindow: boolean;
  /** Vertical translation offset applied to boss/arm visual pose. */
  waitOffsetY: number;
};

type AdvanceArmStateMachineParams = {
  /** Mutable arm finite-state machine state. */
  arm: ArmState;
  /** Current high-resolution timestamp. */
  nowMs: number;
  /** Elapsed frame time in milliseconds used for frame-rate compensation. */
  deltaTimeMs: number;
  /** Computed extension target length in pixels. */
  targetLen: number;
  /** Whether clear flow is active and new attacks should stop. */
  clearRequested: boolean;
  /** Whether boss idle bob is currently near ground contact. */
  waitAtGround: boolean;
  /** Viewport-specific frame/speed tuning configuration. */
  config: ArmFrameConfig;
  /** Whether current viewport uses mobile gameplay tuning. */
  isMobileViewport: boolean;
};

type GetArmPhaseViewParams = {
  /** Mutable arm finite-state machine state. */
  arm: ArmState;
  /** Current high-resolution timestamp. */
  nowMs: number;
  /** Viewport-specific frame/speed tuning configuration. */
  config: ArmFrameConfig;
  /** Idle bob vertical offset when not overridden by attack states. */
  waitBobOffsetY: number;
};

const ATTACK_PHASES: ReadonlySet<ArmPhase> = new Set([
  ARM_PHASE.EXTENDING,
  ARM_PHASE.HOLD,
  ARM_PHASE.RETRACT,
]);
const isPatternTwoAttackPattern = equals(ATTACK_PATTERN.TWO);
const isIdleArmPhase = equals(ARM_PHASE.IDLE);
const isPatternTwoLiftArmPhase = equals(ARM_PHASE.PATTERN_TWO_LIFT);
const isRetractArmPhase = equals(ARM_PHASE.RETRACT);

/**
 * Resolves mobile/desktop-specific arm animation tuning for the current frame.
 *
 * @param isMobileViewport - Whether mobile-specific tuning should be returned.
 * @param desktopPaceScale - Desktop-only pace multiplier derived from game viewport width.
 * @returns Arm frame configuration for the current viewport mode.
 */
export const getArmFrameConfig = (
  isMobileViewport: boolean,
  desktopPaceScale = 1,
): ArmFrameConfig => ({
  attackFrameMaxIndex: isMobileViewport
    ? Math.min(MOBILE_BOSS_ATTACK_MAX_FRAME_INDEX, BOSS_ATTACK_SPRITES.length - 1)
    : BOSS_ATTACK_SPRITES.length - 1,
  armSpeedMultiplier: isMobileViewport
    ? MOBILE_BOSS_ATTACK_SPEED_MULTIPLIER * MOBILE_BOSS_ARM_SPEED_BOOST_MULTIPLIER
    : desktopPaceScale * PC_BOSS_ATTACK_SPEED_MULTIPLIER,
  armHitStartProgressRatio: isMobileViewport
    ? MOBILE_ARM_HIT_START_PROGRESS_RATIO
    : ARM_HIT_START_PROGRESS_RATIO,
  armHitboxVerticalOffsetRatio: isMobileViewport
    ? MOBILE_ARM_HITBOX_VERTICAL_OFFSET_RATIO
    : ARM_HITBOX_VERTICAL_OFFSET_RATIO,
  extendFastFromFrameNumber: isMobileViewport
    ? MOBILE_ARM_EXTEND_FAST_FROM_FRAME_NUMBER
    : ARM_EXTEND_FAST_FROM_FRAME_NUMBER,
  extendFastToFrameNumber: isMobileViewport
    ? MOBILE_ARM_EXTEND_FAST_TO_FRAME_NUMBER
    : ARM_EXTEND_FAST_TO_FRAME_NUMBER,
  retractFastFromFrameNumber: isMobileViewport
    ? MOBILE_ARM_RETRACT_FAST_FROM_FRAME_NUMBER
    : ARM_RETRACT_FAST_FROM_FRAME_NUMBER,
  retractFastToFrameNumber: isMobileViewport
    ? MOBILE_ARM_RETRACT_FAST_TO_FRAME_NUMBER
    : ARM_RETRACT_FAST_TO_FRAME_NUMBER,
  attackChargeMs: isMobileViewport ? MOBILE_BOSS_WAIT_ATTACK_CHARGE_MS : BOSS_WAIT_ATTACK_CHARGE_MS,
});

/**
 * Computes arm target extension length from current viewport width and baseline scaling.
 *
 * @param containerWidth - Current game viewport width in pixels.
 * @param armRightOffsetPx - Current right offset applied to boss/arm anchors in pixels.
 * @param isMobileViewport - Whether mobile-specific length ratio should be applied.
 * @returns Target arm extension length in pixels.
 */
export const getArmTargetLength = (
  containerWidth: number,
  armRightOffsetPx: number,
  isMobileViewport: boolean,
) => {
  const needLen = Math.max(0, containerWidth - armRightOffsetPx);
  const maxLen = Math.floor(containerWidth * BOSS_ARM.MAX_LENGTH_RATIO);
  const baseTargetLen = Math.min(maxLen, needLen);
  return isMobileViewport
    ? Math.floor(baseTargetLen * MOBILE_BOSS_ATTACK_LENGTH_RATIO)
    : baseTargetLen;
};

const resolveNextAttackPattern = (arm: ArmState) => {
  if (arm.initialPatternSequenceCompleted) {
    return Math.random() < BOSS_PATTERN_TWO_RANDOM_RATE ? ATTACK_PATTERN.TWO : ATTACK_PATTERN.ONE;
  }
  const shouldRunPatternTwo =
    arm.patternOneCountSincePatternTwo >= BOSS_PATTERN_ONE_REPEAT_BEFORE_PATTERN_TWO;
  arm.patternOneCountSincePatternTwo = shouldRunPatternTwo
    ? 0
    : arm.patternOneCountSincePatternTwo + 1;
  if (shouldRunPatternTwo) {
    arm.initialPatternSequenceCompleted = true;
  }
  return shouldRunPatternTwo ? ATTACK_PATTERN.TWO : ATTACK_PATTERN.ONE;
};

type AdvanceIdleArmStateParams = {
  /** Mutable arm finite-state machine state. */
  arm: ArmState;
  /** Current high-resolution timestamp. */
  nowMs: number;
  /** Computed extension target length in pixels. */
  targetLen: number;
  /** Whether a new attack can be started this frame. */
  canStartNewAttack: boolean;
  /** Whether boss idle bob is currently near ground contact. */
  waitAtGround: boolean;
  /** Viewport-specific frame/speed tuning configuration. */
  config: ArmFrameConfig;
};

const advanceIdleArmState = ({
  arm,
  nowMs,
  targetLen,
  canStartNewAttack,
  waitAtGround,
  config,
}: AdvanceIdleArmStateParams) => {
  if (!canStartNewAttack) {
    arm.groundChargeStartMs = 0;
    return;
  }

  if (arm.groundChargeStartMs === 0) {
    if (waitAtGround) {
      arm.groundChargeStartMs = nowMs;
    }
    return;
  }

  if (nowMs - arm.groundChargeStartMs < config.attackChargeMs) {
    return;
  }

  arm.attackPattern = resolveNextAttackPattern(arm);
  arm.phase =
    arm.attackPattern === ATTACK_PATTERN.TWO ? ARM_PHASE.PATTERN_TWO_LIFT : ARM_PHASE.EXTENDING;
  arm.targetLen = targetLen;
  arm.phaseStartMs = nowMs;
  arm.groundChargeStartMs = 0;
};

/**
 * Advances arm finite-state machine and width values by one frame.
 *
 * @param params - Arm FSM frame inputs.
 * @param params.arm - Mutable arm state object to update.
 * @param params.nowMs - Current high-resolution timestamp.
 * @param params.targetLen - Target extension length in pixels.
 * @param params.clearRequested - Whether clear state is active.
 * @param params.waitAtGround - Whether idle bob is at ground-contact window.
 * @param params.config - Viewport-specific arm configuration.
 * @param params.isMobileViewport - Whether mobile-specific retract tuning applies.
 * @returns Nothing. Mutates `arm` in place.
 */
export const advanceArmStateMachine = ({
  arm,
  nowMs,
  deltaTimeMs,
  targetLen,
  clearRequested,
  waitAtGround,
  config,
  isMobileViewport,
}: AdvanceArmStateMachineParams) => {
  const frameDeltaScale = Math.min(
    ARM_FRAME_DELTA_MAX_SCALE,
    Math.max(ARM_FRAME_DELTA_MIN_SCALE, deltaTimeMs / ARM_FRAME_BASE_DURATION_MS),
  );
  const movementDeltaScale = frameDeltaScale;
  const pulseElapsed = nowMs - arm.lastPulseMs;
  const canStartNewAttack =
    !clearRequested && pulseElapsed >= BOSS_ARM.PULSE_INTERVAL && nowMs >= arm.nextAttackAllowedMs;

  if (arm.phase === ARM_PHASE.IDLE) {
    advanceIdleArmState({
      arm,
      nowMs,
      targetLen,
      canStartNewAttack,
      waitAtGround,
      config,
    });
  } else {
    arm.groundChargeStartMs = 0;
  }

  if (arm.phase === ARM_PHASE.PATTERN_TWO_LIFT) {
    const liftElapsedMs = nowMs - arm.phaseStartMs;
    if (liftElapsedMs >= BOSS_PATTERN_TWO_LIFT_DURATION_MS) {
      arm.phase = ARM_PHASE.EXTENDING;
      arm.targetLen = targetLen;
      arm.phaseStartMs = nowMs;
    }
    return;
  }

  if (arm.phase === ARM_PHASE.EXTENDING) {
    const extendFrameNumber =
      getAttackFrameIndex(arm.phase, arm.width, arm.targetLen, config.attackFrameMaxIndex) + 1;
    const extendSpeed =
      extendFrameNumber >= config.extendFastFromFrameNumber &&
      extendFrameNumber <= config.extendFastToFrameNumber
        ? BOSS_ARM.SPEED *
          ARM_EXTEND_FAST_SPEED_MULTIPLIER *
          config.armSpeedMultiplier *
          movementDeltaScale
        : BOSS_ARM.SPEED * config.armSpeedMultiplier * movementDeltaScale;
    arm.width = Math.min(arm.targetLen, arm.width + extendSpeed);

    if (arm.width >= arm.targetLen) {
      arm.phase = ARM_PHASE.HOLD;
      arm.holdUntilMs =
        nowMs + (arm.attackPattern === ATTACK_PATTERN.TWO ? BOSS_PATTERN_TWO_HOLD_MS : ARM_HOLD_MS);
      arm.phaseStartMs = nowMs;
    }
    return;
  }

  if (arm.phase === ARM_PHASE.HOLD) {
    if (nowMs >= arm.holdUntilMs) {
      arm.phase = ARM_PHASE.RETRACT;
      arm.lastPulseMs = nowMs;
      arm.phaseStartMs = nowMs;
    }
    return;
  }

  if (arm.phase === ARM_PHASE.RETRACT) {
    const retractFrameNumber =
      getAttackFrameIndex(arm.phase, arm.width, arm.targetLen, config.attackFrameMaxIndex) + 1;
    const retractSpeedMultiplier = isMobileViewport ? 1 : PC_BOSS_RETRACT_SPEED_MULTIPLIER;
    const retractBaseSpeed =
      BOSS_ARM.RETRACT_SPEED * ARM_RETRACT_SPEED_MULTIPLIER * config.armSpeedMultiplier;
    const retractSpeed =
      retractFrameNumber >= config.retractFastFromFrameNumber &&
      retractFrameNumber <= config.retractFastToFrameNumber
        ? retractBaseSpeed *
          ARM_RETRACT_FAST_SPEED_MULTIPLIER *
          retractSpeedMultiplier *
          movementDeltaScale
        : retractBaseSpeed * retractSpeedMultiplier * movementDeltaScale;
    arm.width = Math.max(0, arm.width - retractSpeed);
    if (arm.width <= 0) {
      const finishedPattern = arm.attackPattern;
      arm.phase = ARM_PHASE.IDLE;
      arm.phaseStartMs = nowMs;
      arm.attackPattern = ATTACK_PATTERN.ONE;
      arm.nextAttackAllowedMs =
        finishedPattern === ATTACK_PATTERN.ONE ? nowMs + PATTERN_ONE_POST_ATTACK_WAIT_MS : nowMs;
    }
  }
};

/**
 * Derives visual state (frame index and vertical offset) from current arm FSM state.
 *
 * @param params - Arm phase-view derivation inputs.
 * @param params.arm - Mutable arm FSM state.
 * @param params.nowMs - Current high-resolution timestamp.
 * @param params.config - Viewport-specific arm configuration.
 * @param params.waitBobOffsetY - Current idle bob vertical offset.
 * @returns Render-facing arm phase view for boss visuals and spawn gating.
 */
export const getArmPhaseView = ({
  arm,
  nowMs,
  config,
  waitBobOffsetY,
}: GetArmPhaseViewParams): ArmPhaseView => {
  const isIdlePhase = isIdleArmPhase(arm.phase);
  const isAttackPhase = ATTACK_PHASES.has(arm.phase);
  const isPatternTwoLift =
    isPatternTwoLiftArmPhase(arm.phase) && isPatternTwoAttackPattern(arm.attackPattern);
  const isPatternTwoAttack = isAttackPhase && isPatternTwoAttackPattern(arm.attackPattern);
  const isPatternTwoRetract =
    isRetractArmPhase(arm.phase) && isPatternTwoAttackPattern(arm.attackPattern);
  const isPatternTwoObstacleWindow =
    isPatternTwoAttackPattern(arm.attackPattern) && ATTACK_PHASES.has(arm.phase);
  const isGroundCharging =
    isIdlePhase &&
    arm.groundChargeStartMs > 0 &&
    nowMs - arm.groundChargeStartMs < config.attackChargeMs;
  const isPatternTwoPostAttackSettle =
    isIdlePhase &&
    arm.phaseStartMs > 0 &&
    arm.nextAttackAllowedMs === arm.phaseStartMs &&
    nowMs - arm.phaseStartMs < BOSS_PATTERN_TWO_POST_ATTACK_SETTLE_MS;
  const patternTwoLiftProgress = isPatternTwoLift
    ? Math.min(1, (nowMs - arm.phaseStartMs) / BOSS_PATTERN_TWO_LIFT_DURATION_MS)
    : 0;
  const patternTwoPostAttackSettleProgress = isPatternTwoPostAttackSettle
    ? Math.min(1, (nowMs - arm.phaseStartMs) / BOSS_PATTERN_TWO_POST_ATTACK_SETTLE_MS)
    : 1;
  const waitOffsetY = isPatternTwoLift
    ? -BOSS_PATTERN_TWO_FLOAT_OFFSET_PX * patternTwoLiftProgress
    : isPatternTwoRetract
      ? -BOSS_PATTERN_TWO_FLOAT_OFFSET_PX
      : isPatternTwoAttack
        ? -BOSS_PATTERN_TWO_FLOAT_OFFSET_PX
        : isPatternTwoPostAttackSettle
          ? -BOSS_PATTERN_TWO_FLOAT_OFFSET_PX * (1 - patternTwoPostAttackSettleProgress)
          : isAttackPhase || isGroundCharging
            ? 0
            : waitBobOffsetY;

  return {
    frameIndex: getAttackFrameIndex(
      arm.phase,
      arm.width,
      arm.targetLen,
      config.attackFrameMaxIndex,
    ),
    isAttackPhase,
    isPatternTwoObstacleWindow,
    waitOffsetY,
  };
};
