import { ARM_PHASE, ATTACK_PATTERN } from './constants';
import type { ArmPhase, ArmState, BossBaseAnimationState, BossVisualState, Hitbox } from './types';
import { oneOfValues } from 'is-kit';
import {
  BOSS_WAIT_BOB_AMPLITUDE,
  BOSS_WAIT_BOB_CYCLE_MS,
  BOSS_WAIT_BOB_EXTRA_UP_PX,
  BOSS_WAIT_GROUND_THRESHOLD,
} from '../config/game-loop';
const isIdleOrPatternTwoLiftPhase = oneOfValues(ARM_PHASE.IDLE, ARM_PHASE.PATTERN_TWO_LIFT);
const isHoldPhase = oneOfValues(ARM_PHASE.HOLD);
const isExtendingPhase = oneOfValues(ARM_PHASE.EXTENDING);
const isRetractPhase = oneOfValues(ARM_PHASE.RETRACT);

/**
 * Creates a fresh arm FSM state used at loop startup/reset.
 *
 * @returns Initial arm finite-state-machine snapshot.
 */
export const createInitialArmState = (): ArmState => ({
  width: 0,
  phase: ARM_PHASE.IDLE,
  lastPulseMs: 0,
  holdUntilMs: 0,
  targetLen: 0,
  phaseStartMs: 0,
  groundChargeStartMs: 0,
  nextAttackAllowedMs: 0,
  attackPattern: ATTACK_PATTERN.ONE,
  patternOneCountSincePatternTwo: 0,
  initialPatternSequenceCompleted: false,
});

/**
 * Creates initial boss base animation cursor state.
 *
 * @returns Initial boss base animation state.
 */
export const createInitialBossBaseAnimationState = (): BossBaseAnimationState => ({
  frameIndex: 0,
  lastSwapMs: 0,
});

/**
 * Creates initial rendered boss visual snapshot.
 *
 * @returns Initial boss visual state.
 */
export const createInitialBossVisualState = (): BossVisualState => ({
  mode: 'base',
  frameIndex: 0,
});

/**
 * Returns true when player bounds and obstacle hitbox intersect.
 *
 * @param playerBox - Player DOMRect in viewport coordinates.
 * @param hitbox - Scaled obstacle hitbox in viewport coordinates.
 * @returns True when the two axis-aligned boxes overlap.
 */
export const isPlayerOverlappingHitbox = (playerBox: DOMRect, hitbox: Hitbox) =>
  playerBox.left < hitbox.right &&
  playerBox.right > hitbox.left &&
  playerBox.bottom > hitbox.top &&
  playerBox.top < hitbox.bottom;

/**
 * Shrinks a DOMRect around its center by the given scale and returns hitbox edges.
 *
 * @param rect - Source DOMRect to scale around center.
 * @param scale - Scale ratio applied to width/height.
 * @returns Hitbox edges for collision checks.
 */
export const getScaledHitboxFromRect = (rect: DOMRect, scale: number): Hitbox => {
  const insetX = (rect.width * (1 - scale)) / 2;
  const insetY = (rect.height * (1 - scale)) / 2;
  return {
    left: rect.left + insetX,
    right: rect.right - insetX,
    top: rect.top + insetY,
    bottom: rect.bottom - insetY,
  };
};

/**
 * Calculates idle bob offset and whether boss is near the ground contact point.
 *
 * @param elapsedMs - Elapsed time since boss idle wait started.
 * @param baselineScale - Height-based scale ratio for responsive movement.
 * @returns Vertical offset and ground-contact flag for idle bob animation.
 */
export const getBossWaitBob = (elapsedMs: number, baselineScale: number) => {
  const cycleProgress = (elapsedMs % BOSS_WAIT_BOB_CYCLE_MS) / BOSS_WAIT_BOB_CYCLE_MS;
  const wave = cycleProgress < 0.5 ? cycleProgress * 2 : (1 - cycleProgress) * 2;
  const amplitudePx = BOSS_WAIT_BOB_AMPLITUDE * baselineScale + BOSS_WAIT_BOB_EXTRA_UP_PX;
  return {
    offsetY: -wave * amplitudePx,
    atGround: wave <= BOSS_WAIT_GROUND_THRESHOLD,
  };
};

/**
 * Resolves attack sprite frame index from arm phase and extension progress.
 *
 * @param phase - Current arm FSM phase.
 * @param width - Current arm extension width in pixels.
 * @param targetLen - Target extension length in pixels.
 * @param maxFrameIndex - Highest allowed attack frame index.
 * @returns Frame index for boss attack sprite rendering.
 */
export const getAttackFrameIndex = (
  phase: ArmPhase,
  width: number,
  targetLen: number,
  maxFrameIndex: number,
) => {
  if (isIdleOrPatternTwoLiftPhase(phase) || targetLen <= 0 || maxFrameIndex <= 0) return 0;
  if (isHoldPhase(phase)) return maxFrameIndex;
  const progress = Math.min(1, Math.max(0, width / targetLen));

  if (isExtendingPhase(phase)) {
    return Math.max(1, Math.min(maxFrameIndex, Math.ceil(progress * maxFrameIndex)));
  }

  if (isRetractPhase(phase)) {
    if (width <= 0) return 0;
    return Math.max(1, Math.min(maxFrameIndex, Math.ceil(progress * maxFrameIndex)));
  }

  return 0;
};
