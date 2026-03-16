import type { MutableRefObject, RefObject } from 'react';
import { BOSS_ATTACK_SPRITES, BOSS_BASE_SPRITES } from '@/features/jump-game/model/config/assets';
import { BOSS_ARM } from '@/features/jump-game/model/config/gameplay';
import {
  ARM_HITBOX_BASE_WIDTH_OFFSET_RATIO,
  ARM_HITBOX_FRONT_PADDING_MAX_PX,
  ARM_HITBOX_FRONT_PADDING_RATIO,
  BOSS_BASE_SPRITE_SWAP_MS,
  BOSS_ENTRY_DURATION_MS,
  BOSS_ENTRY_OFFSET_MULTIPLIER,
  BOSS_RESET_TRANSLATE_X,
  ZERO_WIDTH_PX,
} from '@/features/jump-game/model/config/game-loop';
import type { ArmFrameConfig, ArmPhaseView } from './arm-state-machine';
import type { ArmState, BossBaseAnimationState, BossVisualState } from './types';

const snapBossOffsetYPx = (value: number) => Math.round(value);

type BossDomRefs = {
  /** Boss base container reference. */
  bossRef: RefObject<HTMLDivElement>;
  /** Boss arm element reference. */
  bossArmRef: RefObject<HTMLDivElement>;
};

type BossSpriteRefs = {
  /** Current sprite assigned to DOM to avoid redundant writes. */
  currentBossSpriteRef: MutableRefObject<string | null>;
  /** Current mounted sprite host element reference. */
  bossSpriteHostRef: MutableRefObject<HTMLImageElement | null>;
  /** Last requested sprite path (async-load guard). */
  requestedBossSpriteRef: MutableRefObject<string>;
};

type BossVisualRefs = {
  /** Base-sprite animation cursor state. */
  bossBaseAnimRef: MutableRefObject<BossBaseAnimationState>;
  /** Boss visual mode/frame state used to reduce src churn. */
  bossVisualRef: MutableRefObject<BossVisualState>;
};

type BossSizingResolvers = {
  /** Resolves current boss base width in pixels. */
  getBossBaseWidthPx: () => number;
  /** Resolves current boss right offset in pixels. */
  getBossRightOffsetPx: () => number;
};

type ResetBossDomParams = BossDomRefs &
  BossSpriteRefs &
  BossVisualRefs &
  BossSizingResolvers & {
    /** Applies sprite path to boss sprite image with preload guard. */
    setBossSprite: (spritePath: string) => void;
  };

type ApplyBossCombatPoseParams = BossDomRefs &
  BossSpriteRefs &
  BossVisualRefs &
  BossSizingResolvers & {
    /** Arm runtime state machine object. */
    arm: ArmState;
    /** Timestamp for current simulation frame. */
    nowMs: number;
    /** Baseline scale derived from game height. */
    baselineScale: number;
    /** Boss entry transition X offset in pixels. */
    bossEntryOffset: number;
    /** Current boss right offset in pixels. */
    bossRightOffsetPx: number;
    /** Arm phase view projection for current frame. */
    phaseView: ArmPhaseView;
    /** Applies sprite path to boss sprite image with preload guard. */
    setBossSprite: (spritePath: string) => void;
  };

type RenderBossIdleParams = BossDomRefs &
  BossSpriteRefs &
  BossVisualRefs &
  BossSizingResolvers & {
    /** Timestamp for current simulation frame. */
    nowMs: number;
    /** Whether boss should currently be rendered. */
    showBoss: boolean;
    /** Elapsed milliseconds since boss mode started. */
    entryElapsedMs: number;
    /** Bob offset Y from wait animation. */
    waitBobOffsetY: number;
    /** Applies sprite path to boss sprite image with preload guard. */
    setBossSprite: (spritePath: string) => void;
  };

type BossArmCollisionParams = {
  /** Arm state machine snapshot. */
  arm: ArmState;
  /** Arm frame/collision config for current viewport mode. */
  config: ArmFrameConfig;
  /** Current boss base width used to align hitbox. */
  bossBaseWidthPx: number;
  /** Current boss right offset in pixels. */
  bossRightOffsetPx: number;
  /** Current boss entry translation on the X axis. */
  bossEntryOffset: number;
  /** Current grounded/bobbed Y translation applied to the arm. */
  waitOffsetY: number;
  /** Current baseline scale used to resolve arm thickness/bottom offset. */
  baselineScale: number;
  /** Current game viewport bounds in viewport coordinates. */
  gameRect: DOMRect | null;
  /** Player DOM reference. */
  playerRef: RefObject<HTMLDivElement>;
  /** Optional player bounds already measured for the current frame. */
  playerRect: DOMRect | null;
  /** Whether clear flow already stopped collisions. */
  clearRequested: boolean;
  /** Predicate that guards active collision phases. */
  isArmAttackCollisionPhase: (phase: ArmState['phase']) => boolean;
  /** Hitbox overlap helper. */
  isPlayerOverlappingHitbox: (
    playerBox: DOMRect,
    hitbox: { left: number; right: number; top: number; bottom: number },
  ) => boolean;
};

/**
 * Resets boss DOM to baseline idle visual state before/after combat sequence.
 *
 * @param params - Boss DOM refs and visual state dependencies.
 */
export const resetBossDomToBaseVisual = ({
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
}: ResetBossDomParams) => {
  if (bossArmRef.current) bossArmRef.current.style.width = ZERO_WIDTH_PX;
  currentBossSpriteRef.current = null;
  bossSpriteHostRef.current = null;
  requestedBossSpriteRef.current = BOSS_BASE_SPRITES[0];
  if (bossRef.current) {
    bossRef.current.style.width = `${getBossBaseWidthPx()}px`;
    bossRef.current.style.right = `${getBossRightOffsetPx()}px`;
    bossRef.current.style.transform = BOSS_RESET_TRANSLATE_X;
    setBossSprite(BOSS_BASE_SPRITES[0]);
  }
  bossBaseAnimRef.current.frameIndex = 0;
  bossBaseAnimRef.current.lastSwapMs = 0;
  bossVisualRef.current.mode = 'base';
  bossVisualRef.current.frameIndex = 0;
};

/**
 * Applies boss base/arm DOM styles for an active combat frame.
 *
 * @param params - Runtime frame state and DOM dependencies.
 */
export const applyBossPoseForCombatFrame = ({
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
  getBossBaseWidthPx,
  setBossSprite,
}: ApplyBossCombatPoseParams) => {
  const snappedWaitOffsetY = snapBossOffsetYPx(phaseView.waitOffsetY);

  if (bossArmRef.current) {
    bossArmRef.current.style.width = `${arm.width}px`;
    bossArmRef.current.style.right = `${bossRightOffsetPx}px`;
    bossArmRef.current.style.transform = `translate(${bossEntryOffset}px, ${snappedWaitOffsetY}px)`;
    bossArmRef.current.style.bottom = `${BOSS_ARM.Y * baselineScale}px`;
    bossArmRef.current.style.height = `${BOSS_ARM.THICKNESS * baselineScale}px`;
  }

  if (!bossRef.current) return;

  const bossBaseWidthPx = getBossBaseWidthPx();
  bossRef.current.style.right = `${bossRightOffsetPx}px`;
  bossRef.current.style.transform = `translate(${bossEntryOffset}px, ${snappedWaitOffsetY}px)`;
  if (phaseView.isAttackPhase) {
    const attackSprite = BOSS_ATTACK_SPRITES[phaseView.frameIndex];
    bossRef.current.style.width = `${bossBaseWidthPx + Math.max(0, arm.targetLen)}px`;
    if (
      bossVisualRef.current.mode !== 'attack' ||
      bossVisualRef.current.frameIndex !== phaseView.frameIndex ||
      currentBossSpriteRef.current !== attackSprite
    ) {
      setBossSprite(attackSprite);
      bossVisualRef.current.mode = 'attack';
      bossVisualRef.current.frameIndex = phaseView.frameIndex;
    }
    return;
  }

  const baseAnim = bossBaseAnimRef.current;
  if (baseAnim.lastSwapMs === 0) baseAnim.lastSwapMs = nowMs;
  if (nowMs - baseAnim.lastSwapMs >= BOSS_BASE_SPRITE_SWAP_MS) {
    baseAnim.frameIndex = (baseAnim.frameIndex + 1) % BOSS_BASE_SPRITES.length;
    baseAnim.lastSwapMs = nowMs;
  }
  bossRef.current.style.width = `${bossBaseWidthPx}px`;
  if (
    bossVisualRef.current.mode !== 'base' ||
    bossVisualRef.current.frameIndex !== baseAnim.frameIndex ||
    currentBossSpriteRef.current !== BOSS_BASE_SPRITES[baseAnim.frameIndex]
  ) {
    setBossSprite(BOSS_BASE_SPRITES[baseAnim.frameIndex]);
    bossVisualRef.current.mode = 'base';
    bossVisualRef.current.frameIndex = baseAnim.frameIndex;
  }
};

/**
 * Renders boss base/arm pose while combat has not started yet.
 *
 * @param params - Runtime state and DOM dependencies for idle pose updates.
 */
export const renderBossIdleFrame = ({
  nowMs,
  showBoss,
  entryElapsedMs,
  waitBobOffsetY,
  bossArmRef,
  bossRef,
  bossBaseAnimRef,
  bossVisualRef,
  currentBossSpriteRef,
  getBossBaseWidthPx,
  getBossRightOffsetPx,
  setBossSprite,
}: RenderBossIdleParams) => {
  const entryProgress = Math.min(1, entryElapsedMs / BOSS_ENTRY_DURATION_MS);
  const bossEntryOffset = getBossBaseWidthPx() * BOSS_ENTRY_OFFSET_MULTIPLIER * (1 - entryProgress);
  const bossRightOffsetPx = getBossRightOffsetPx();
  const resolvedWaitBobOffsetY = snapBossOffsetYPx(showBoss ? waitBobOffsetY : 0);

  if (bossArmRef.current) {
    bossArmRef.current.style.width = ZERO_WIDTH_PX;
    bossArmRef.current.style.right = `${bossRightOffsetPx}px`;
    bossArmRef.current.style.transform = `translate(${bossEntryOffset}px, ${resolvedWaitBobOffsetY}px)`;
  }
  if (!bossRef.current) return;

  const baseAnim = bossBaseAnimRef.current;
  if (baseAnim.lastSwapMs === 0) baseAnim.lastSwapMs = nowMs;
  if (nowMs - baseAnim.lastSwapMs >= BOSS_BASE_SPRITE_SWAP_MS) {
    baseAnim.frameIndex = (baseAnim.frameIndex + 1) % BOSS_BASE_SPRITES.length;
    baseAnim.lastSwapMs = nowMs;
  }
  bossRef.current.style.width = `${getBossBaseWidthPx()}px`;
  bossRef.current.style.right = `${bossRightOffsetPx}px`;
  bossRef.current.style.transform = `translate(${bossEntryOffset}px, ${resolvedWaitBobOffsetY}px)`;
  if (
    bossVisualRef.current.mode !== 'base' ||
    bossVisualRef.current.frameIndex !== baseAnim.frameIndex ||
    currentBossSpriteRef.current !== BOSS_BASE_SPRITES[baseAnim.frameIndex]
  ) {
    setBossSprite(BOSS_BASE_SPRITES[baseAnim.frameIndex]);
    bossVisualRef.current.mode = 'base';
    bossVisualRef.current.frameIndex = baseAnim.frameIndex;
  }
};

/**
 * Resolves whether boss arm currently overlaps with the player hitbox.
 *
 * @param arm - Arm state machine snapshot.
 * @param config - Arm frame/collision config for current viewport mode.
 * @param bossBaseWidthPx - Current boss base width used to align hitbox.
 * @param bossArmRef - Boss arm DOM reference.
 * @param playerRef - Player DOM reference.
 * @param isArmAttackCollisionPhase - Predicate that guards active collision phases.
 * @param isPlayerOverlappingHitbox - Hitbox overlap helper.
 */
export const hasBossArmCollision = ({
  arm,
  config,
  bossBaseWidthPx,
  bossRightOffsetPx,
  bossEntryOffset,
  waitOffsetY,
  baselineScale,
  gameRect,
  playerRef,
  playerRect,
  clearRequested,
  isArmAttackCollisionPhase,
  isPlayerOverlappingHitbox,
}: BossArmCollisionParams) => {
  if (
    !gameRect ||
    arm.width <= 0 ||
    clearRequested ||
    !isArmAttackCollisionPhase(arm.phase) ||
    arm.targetLen <= 0 ||
    arm.width / arm.targetLen < config.armHitStartProgressRatio
  ) {
    return false;
  }

  const armBottomPx = BOSS_ARM.Y * baselineScale;
  const armHeightPx = BOSS_ARM.THICKNESS * baselineScale;
  const armRight = gameRect.right - bossRightOffsetPx + bossEntryOffset;
  const armLeft = armRight - arm.width;
  const armTop = gameRect.bottom - armBottomPx - armHeightPx + waitOffsetY;
  const armBottom = armTop + armHeightPx;
  const baseOffsetPx = bossBaseWidthPx * ARM_HITBOX_BASE_WIDTH_OFFSET_RATIO;
  const shiftedArmLeft = armLeft - baseOffsetPx;
  const shiftedArmRight = armRight - baseOffsetPx;
  const shiftedArmWidth = Math.max(0, shiftedArmRight - shiftedArmLeft);
  const effectiveFrontPadding = Math.min(
    shiftedArmWidth * ARM_HITBOX_FRONT_PADDING_RATIO,
    ARM_HITBOX_FRONT_PADDING_MAX_PX,
  );
  const effectiveArmLeft = shiftedArmLeft + effectiveFrontPadding;
  const effectiveArmTop = armTop + armHeightPx * config.armHitboxVerticalOffsetRatio;
  const effectiveArmBottom = armBottom + armHeightPx * config.armHitboxVerticalOffsetRatio;
  const playerBox = playerRect ?? playerRef.current?.getBoundingClientRect();
  if (!playerBox) return false;

  return isPlayerOverlappingHitbox(playerBox, {
    left: effectiveArmLeft,
    right: shiftedArmRight,
    top: effectiveArmTop,
    bottom: effectiveArmBottom,
  });
};
