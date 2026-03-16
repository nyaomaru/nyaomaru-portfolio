import type { CSSProperties } from 'react';
import {
  PLAYER_BASE_HEIGHT_RATIO,
  PLAYER_MAX_HEIGHT_PX,
  PLAYER_MIN_HEIGHT_PX,
} from '../config/gameplay';
import {
  BOSS_BASE_HEIGHT_RATIO,
  ELEMENT_HIDDEN_OPACITY,
  ELEMENT_RESET_TRANSITION,
  ELEMENT_RESET_TRANSLATE,
  ELEMENT_VISIBLE_OPACITY,
  ELEMENT_VISIBLE_VISIBILITY,
  MOBILE_BOSS_SCALE,
  PLAYER_RESET_BOTTOM,
} from '../config/scene-visual';

/**
 * Preloads image assets into browser cache to reduce runtime flicker on sprite swaps.
 *
 * @param spriteSources - Asset source list to preload.
 * @returns Nothing. Side effect only.
 */
export const preloadSpriteAssets = (spriteSources: readonly string[]) => {
  spriteSources.forEach((spriteSource) => {
    const preloadImage = new Image();
    preloadImage.src = spriteSource;
  });
};

/**
 * Restores player DOM styles to the baseline visible state used at round start.
 *
 * @param playerElement - Player element to normalize before a new run.
 * @returns Nothing. Mutates DOM styles in place.
 */
export const resetPlayerVisualState = (playerElement: HTMLDivElement | null) => {
  if (!playerElement) return;
  playerElement.style.bottom = PLAYER_RESET_BOTTOM;
  playerElement.style.left = '';
  playerElement.style.transform = ELEMENT_RESET_TRANSLATE;
  playerElement.style.transition = ELEMENT_RESET_TRANSITION;
  playerElement.style.opacity = ELEMENT_VISIBLE_OPACITY;
  playerElement.style.visibility = ELEMENT_VISIBLE_VISIBILITY;
};

/**
 * Restores boss base DOM styles to the baseline visible state.
 *
 * @param bossElement - Boss base element to normalize.
 * @returns Nothing. Mutates DOM styles in place.
 */
export const resetBossVisualState = (bossElement: HTMLDivElement | null) => {
  if (!bossElement) return;
  bossElement.style.transform = ELEMENT_RESET_TRANSLATE;
  bossElement.style.opacity = ELEMENT_VISIBLE_OPACITY;
  bossElement.style.transition = ELEMENT_RESET_TRANSITION;
};

/**
 * Restores boss arm DOM styles to the hidden idle baseline state.
 *
 * @param bossArmElement - Boss arm element to normalize.
 * @returns Nothing. Mutates DOM styles in place.
 */
export const resetBossArmVisualState = (bossArmElement: HTMLDivElement | null) => {
  if (!bossArmElement) return;
  bossArmElement.style.transform = ELEMENT_RESET_TRANSLATE;
  bossArmElement.style.opacity = ELEMENT_HIDDEN_OPACITY;
  bossArmElement.style.transition = ELEMENT_RESET_TRANSITION;
};

/**
 * Creates the default inline style object for the player element.
 *
 * @returns Player inline style object used by scene render.
 */
export const createPlayerStyle = (): CSSProperties => ({
  height: `${PLAYER_BASE_HEIGHT_RATIO * 100}%`,
  minHeight: `${PLAYER_MIN_HEIGHT_PX}px`,
  maxHeight: `${PLAYER_MAX_HEIGHT_PX}px`,
});

/**
 * Creates the default inline style object for the boss base element.
 *
 * @param isMobileViewport - Whether mobile-specific boss scaling should be applied.
 * @returns Boss base inline style object.
 */
export const createBossStyle = (isMobileViewport: boolean): CSSProperties => ({
  height: `${(isMobileViewport ? BOSS_BASE_HEIGHT_RATIO * MOBILE_BOSS_SCALE : BOSS_BASE_HEIGHT_RATIO) * 100}%`,
  willChange: 'transform, width',
});

/**
 * Creates the default inline style object for the boss arm element.
 *
 * @returns Boss arm inline style object.
 */
export const createBossArmStyle = (): CSSProperties => ({
  willChange: 'transform, width',
  pointerEvents: 'none',
});
