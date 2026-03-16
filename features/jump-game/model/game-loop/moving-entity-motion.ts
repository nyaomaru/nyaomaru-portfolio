const ENTITY_SPAWN_LEFT_DATASET_KEY = 'spawnLeftPx';
const ENTITY_TRANSLATE_X_DATASET_KEY = 'translateXPx';
const ENTITY_INITIAL_TRANSLATE_X = 0;
const ENTITY_FALLBACK_LEFT_PX = 0;
const ENTITY_TRANSLATE_Y_PX = 0;
const ENTITY_3D_DEPTH_PX = 0;

/**
 * Snapshot of moving-entity horizontal motion state.
 */
export type MovingEntityMotion = {
  /** Absolute spawn-time left anchor in px. */
  spawnLeftPx: number;
  /** Current transform-based horizontal delta in px. */
  translateXPx: number;
  /** Derived effective left position in px. */
  currentLeftPx: number;
};

/**
 * Initializes dataset-backed horizontal motion state for a spawned moving entity.
 *
 * @param element - Spawned obstacle/fish element.
 * @param spawnLeftPx - Absolute spawn left anchor in pixels.
 * @returns Nothing. Mutates `element` style and dataset.
 */
export const initializeMovingEntityMotion = (element: HTMLElement, spawnLeftPx: number) => {
  element.style.left = `${spawnLeftPx}px`;
  element.dataset[ENTITY_SPAWN_LEFT_DATASET_KEY] = `${spawnLeftPx}`;
  element.dataset[ENTITY_TRANSLATE_X_DATASET_KEY] = `${ENTITY_INITIAL_TRANSLATE_X}`;
  element.style.transform = `translate3d(${ENTITY_INITIAL_TRANSLATE_X}px, ${ENTITY_TRANSLATE_Y_PX}px, ${ENTITY_3D_DEPTH_PX}px)`;
  element.style.willChange = 'transform';
};

/**
 * Advances entity transform-based horizontal motion and returns updated snapshot.
 *
 * @param element - Moving entity element to update.
 * @param frameDistancePx - Horizontal movement distance for current frame in pixels.
 * @returns Updated motion snapshot.
 */
export const advanceMovingEntityMotion = (
  element: HTMLElement,
  frameDistancePx: number,
): MovingEntityMotion => {
  const rawSpawnLeftPx = Number.parseFloat(
    element.dataset[ENTITY_SPAWN_LEFT_DATASET_KEY] ?? element.style.left,
  );
  const spawnLeftPx = Number.isFinite(rawSpawnLeftPx) ? rawSpawnLeftPx : ENTITY_FALLBACK_LEFT_PX;
  const rawTranslateXPx = Number.parseFloat(
    element.dataset[ENTITY_TRANSLATE_X_DATASET_KEY] ?? `${ENTITY_INITIAL_TRANSLATE_X}`,
  );
  const translateXPx = Number.isFinite(rawTranslateXPx)
    ? rawTranslateXPx
    : ENTITY_INITIAL_TRANSLATE_X;
  const nextTranslateXPx = translateXPx - frameDistancePx;
  const currentLeftPx = spawnLeftPx + nextTranslateXPx;
  element.dataset[ENTITY_TRANSLATE_X_DATASET_KEY] = `${nextTranslateXPx}`;
  element.style.transform = `translate3d(${nextTranslateXPx}px, ${ENTITY_TRANSLATE_Y_PX}px, ${ENTITY_3D_DEPTH_PX}px)`;
  return {
    spawnLeftPx,
    translateXPx: nextTranslateXPx,
    currentLeftPx,
  };
};
