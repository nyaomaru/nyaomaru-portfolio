/**
 * Boss arm finite-state machine phases.
 */
export type ArmPhase = 'idle' | 'pattern2-lift' | 'extending' | 'hold' | 'retract';

/**
 * Boss attack pattern identifiers.
 */
export type BossAttackPattern = 'pattern1' | 'pattern2';

/**
 * Mutable arm state persisted across animation frames.
 */
export type ArmState = {
  /** Current arm width in pixels. */
  width: number;
  /** Active finite-state phase. */
  phase: ArmPhase;
  /** Timestamp of the last completed attack pulse. */
  lastPulseMs: number;
  /** Timestamp when hold phase should end. */
  holdUntilMs: number;
  /** Target extension length for the current pulse. */
  targetLen: number;
  /** Phase entry timestamp for diagnostics/timing. */
  phaseStartMs: number;
  /** Timestamp when idle-at-ground charge started. */
  groundChargeStartMs: number;
  /** Earliest timestamp when next attack is allowed to start. */
  nextAttackAllowedMs: number;
  /** Current attack pattern for the active arm cycle. */
  attackPattern: BossAttackPattern;
  /** Number of completed/queued pattern1 attacks since last pattern2 selection. */
  patternOneCountSincePatternTwo: number;
  /** Whether the initial fixed sequence (pattern1 x2 -> pattern2) has finished. */
  initialPatternSequenceCompleted: boolean;
};

/**
 * Base-sprite animation cursor state.
 */
export type BossBaseAnimationState = {
  /** Current frame index in `BOSS_BASE_SPRITES`. */
  frameIndex: number;
  /** Timestamp when base frame was last swapped. */
  lastSwapMs: number;
};

/**
 * Tracks which sprite family/frame is currently rendered on the boss element.
 */
export type BossVisualState = {
  /** Active sprite family to avoid redundant style writes. */
  mode: 'base' | 'attack';
  /** Last-applied frame index in the active family. */
  frameIndex: number;
};

/**
 * Axis-aligned hitbox in viewport coordinates.
 */
export type Hitbox = {
  /** Left edge of hitbox in viewport pixels. */
  left: number;
  /** Right edge of hitbox in viewport pixels. */
  right: number;
  /** Top edge of hitbox in viewport pixels. */
  top: number;
  /** Bottom edge of hitbox in viewport pixels. */
  bottom: number;
};
