import type { CSSProperties, RefObject } from 'react';

/**
 * Optional callbacks provided by the UI layer to observe scene state.
 */
export type JumpGameBindings = {
  /** Emits when game-over state changes. */
  onGameOverChange?: (value: boolean) => void;
  /** Supplies a reset callback to the parent. */
  onRegisterReset?: (resetFn: () => void) => void;
  /** Emits title/message text for external HUD rendering. */
  onGameMessageChange?: (value: string) => void;
  /** Emits when restart interaction becomes available after ending sequence. */
  onRestartReadyChange?: (value: boolean) => void;
};

/**
 * Refs exposed from scene-model to the UI component tree.
 */
export type JumpGameSceneRefs = {
  /** Player element ref used by jump and clear animations. */
  playerRef: RefObject<HTMLDivElement | null>;
  /** Player sprite image ref updated by sprite animator. */
  playerSpriteRef: RefObject<HTMLImageElement | null>;
  /** Root game viewport element ref. */
  gameRef: RefObject<HTMLDivElement | null>;
  /** Boss base element ref. */
  bossRef: RefObject<HTMLDivElement | null>;
  /** Boss sprite image ref rendered inside boss base container. */
  bossSpriteRef: RefObject<HTMLImageElement | null>;
  /** Boss arm element ref. */
  bossArmRef: RefObject<HTMLDivElement | null>;
};

/**
 * Fully-derived state and refs required to render the jump-game scene.
 */
export type JumpGameSceneView = {
  /** DOM refs required by UI nodes. */
  refs: JumpGameSceneRefs;
  /** Number of fish collected in the current run. */
  fishCount: number;
  /** HUD icon source for fish counter. */
  fishCounterIconSrc: string;
  /** Controls boss node rendering visibility. */
  shouldRenderBoss: boolean;
  /** Controls game-over/clear overlay visibility. */
  shouldShowGameOverIcon: boolean;
  /** Source for game-over/clear overlay image. */
  gameOverDisplayIcon: string | null;
  /** Controls special-clear overlay visibility. */
  shouldShowSpecialClearOverlay: boolean;
  /** Whether rocket should animate entering from right during special clear. */
  shouldAnimateRocketEntry: boolean;
  /** Current center/ground overlay icon for special sequence. */
  specialRocketIconSrc: string | null;
  /** Rocket right-edge entry animation duration in milliseconds. */
  specialRocketEntryDurationMs: number;
  /** Controls additional bye-bye icon overlay visibility. */
  shouldShowByeByeIcon: boolean;
  /** Source for additional bye-bye icon overlay. */
  specialByeByeIconSrc: string;
  /** Controls full-screen flyout layer visibility. */
  shouldShowSpecialFlyout: boolean;
  /** Viewport origin for flyout animation. */
  specialFlyoutOrigin: { x: number; y: number } | null;
  /** Flyout animation duration in ms. */
  specialFlyoutDurationMs: number;
  /** Source image used for flyout sprite. */
  specialFlyoutIconSrc: string;
  /** Controls FIN overlay visibility. */
  showSpecialFin: boolean;
  /** Source image for FIN overlay frame. */
  specialFinIconSrc: string;
  /** Inline style for player element baseline sizing/position. */
  playerStyle: CSSProperties;
  /** Inline style for boss base element baseline sizing/position. */
  bossStyle: CSSProperties;
  /** Inline style for boss arm element baseline sizing/position. */
  bossArmStyle: CSSProperties;
};
