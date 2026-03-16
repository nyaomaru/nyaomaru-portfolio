import type { ArmPhase, BossAttackPattern } from './types';

// Internal state identifiers used by game-loop FSM logic.
export const ARM_PHASE = {
  IDLE: 'idle',
  PATTERN_TWO_LIFT: 'pattern2-lift',
  EXTENDING: 'extending',
  HOLD: 'hold',
  RETRACT: 'retract',
} as const satisfies Record<string, ArmPhase>;

export const ATTACK_PATTERN = {
  ONE: 'pattern1',
  TWO: 'pattern2',
} as const satisfies Record<string, BossAttackPattern>;
