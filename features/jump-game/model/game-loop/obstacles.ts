import type { MutableRefObject, RefObject } from 'react';
import { oneOfValues } from 'is-kit';
import { BOSS_GAME_OVER_ICON } from '../config/assets';
import { OBSTACLES_DEADLINE } from '../config/gameplay';
import {
  DEFAULT_OBSTACLE_HITBOX_SCALE,
  MS_PER_SECOND,
  OBSTACLE_PLAYER_PROXIMITY_CHECK_PX,
} from '../config/game-loop';
import { advanceMovingEntityMotion } from './moving-entity-motion';
import { isPlayerOverlappingHitbox } from './helpers';

const ENTITY_WIDTH_PX_DATASET_KEY = 'entityWidthPx';
const ENTITY_HEIGHT_PX_DATASET_KEY = 'entityHeightPx';
const ENTITY_BOTTOM_PX_DATASET_KEY = 'entityBottomPx';
const HITBOX_SYMMETRIC_INSET_DIVISOR = 2;

type UpdateObstaclesFrameParams = {
  /** Whether clear sequence has started and moving entities should be removed. */
  clearRequested: boolean;
  /** Horizontal movement speed in pixels per second. */
  obstacleSpeedPxPerSec: number;
  /** Elapsed frame time in milliseconds used for frame-rate independent movement. */
  deltaTimeMs: number;
  /** Mutable list of currently active obstacle/fish DOM nodes. */
  obstaclesRef: MutableRefObject<HTMLElement[]>;
  /** Player element ref used for collision checks. */
  playerRef: RefObject<HTMLDivElement | null>;
  /** Optional player bounds already measured for the current frame. */
  playerRect: DOMRect | null;
  /** Returns current game viewport width in pixels. */
  getGameWidth: () => number;
  /** Returns current game viewport bounds in viewport coordinates when available. */
  getGameRect: () => DOMRect | null;
  /** Whether boss mode is active to select fail icon source. */
  isBossVisible: boolean;
  /** Callback fired when fish collectible is collided and consumed. */
  onFishCollected?: () => void;
};

type RectLike = {
  /** Left edge in viewport pixels. */
  left: number;
  /** Right edge in viewport pixels. */
  right: number;
  /** Top edge in viewport pixels. */
  top: number;
  /** Bottom edge in viewport pixels. */
  bottom: number;
  /** Width in pixels. */
  width: number;
  /** Height in pixels. */
  height: number;
};

/**
 * Reads a numeric dataset field from an entity element.
 *
 * @param element - Moving entity element holding cached layout data.
 * @param datasetKey - Dataset property name to parse.
 * @returns Parsed numeric value or `null` when the dataset field is missing/invalid.
 */
const getNumericDatasetValue = (element: HTMLElement, datasetKey: string) => {
  const rawValue = Number.parseFloat(element.dataset[datasetKey] ?? '');
  return Number.isFinite(rawValue) ? rawValue : null;
};

/**
 * Shrinks a rectangle around its center using the provided hitbox scale.
 *
 * @param rect - Source rectangle in viewport coordinates.
 * @param scale - Collision scale applied symmetrically on both axes.
 * @returns Scaled hitbox bounds derived from the original rectangle.
 */
const getScaledHitboxFromRectLike = (rect: RectLike, scale: number) => {
  const insetX = (rect.width * (1 - scale)) / HITBOX_SYMMETRIC_INSET_DIVISOR;
  const insetY = (rect.height * (1 - scale)) / HITBOX_SYMMETRIC_INSET_DIVISOR;
  return {
    left: rect.left + insetX,
    right: rect.right - insetX,
    top: rect.top + insetY,
    bottom: rect.bottom - insetY,
  };
};

/**
 * Reconstructs obstacle bounds from cached layout metrics instead of live DOM reads.
 *
 * @param obstacle - Obstacle element containing cached width/height/bottom dataset values.
 * @param currentLeftPx - Current horizontal position within the game viewport.
 * @param gameRect - Current game viewport bounds in viewport coordinates.
 * @returns Cached obstacle bounds or `null` when required metrics are unavailable.
 */
const getObstacleRectFromCachedLayout = (
  obstacle: HTMLElement,
  currentLeftPx: number,
  gameRect: DOMRect,
): RectLike | null => {
  const widthPx = getNumericDatasetValue(obstacle, ENTITY_WIDTH_PX_DATASET_KEY);
  const heightPx = getNumericDatasetValue(obstacle, ENTITY_HEIGHT_PX_DATASET_KEY);
  const bottomPx = getNumericDatasetValue(obstacle, ENTITY_BOTTOM_PX_DATASET_KEY);
  if (widthPx === null || heightPx === null || bottomPx === null) return null;
  const left = gameRect.left + currentLeftPx;
  const top = gameRect.bottom - bottomPx - heightPx;
  return {
    left,
    right: left + widthPx,
    top,
    bottom: top + heightPx,
    width: widthPx,
    height: heightPx,
  };
};

/**
 * Removes all active obstacle/fish nodes and clears the mutable list.
 *
 * @param obstaclesRef - Mutable list of active obstacle/fish DOM nodes.
 * @returns Nothing. Removes DOM nodes and empties the list.
 */
export const clearMovingEntities = (obstaclesRef: MutableRefObject<HTMLElement[]>) => {
  if (obstaclesRef.current.length === 0) return;
  obstaclesRef.current.forEach((obs) => obs.remove());
  obstaclesRef.current = [];
};

/**
 * Advances obstacle/fish positions by one frame and resolves collisions.
 *
 * @param params - Per-frame obstacle update inputs.
 * @param params.clearRequested - Whether clear sequence has started.
 * @param params.obstacleSpeedPxPerSec - Horizontal speed applied in pixels per second.
 * @param params.deltaTimeMs - Elapsed frame time in milliseconds.
 * @param params.obstaclesRef - Mutable list of active obstacle/fish nodes.
 * @param params.playerRef - Player element ref used for collision checks.
 * @param params.playerRect - Optional player bounds already measured this frame.
 * @param params.getGameWidth - Callback resolving current game viewport width.
 * @param params.getGameRect - Callback resolving current game viewport bounds.
 * @param params.isBossVisible - Whether boss mode is active.
 * @param params.onFishCollected - Optional callback for fish pickup events.
 * @returns Fatal collision icon, `null`, or `undefined` when clear-mode short-circuit occurs.
 */
export const updateObstaclesFrame = ({
  clearRequested,
  obstacleSpeedPxPerSec,
  deltaTimeMs,
  obstaclesRef,
  playerRef,
  playerRect,
  getGameWidth,
  getGameRect,
  isBossVisible,
  onFishCollected,
}: UpdateObstaclesFrameParams): string | null | undefined => {
  const isFishEntityType = oneOfValues('fish');
  const frameDistancePx = (obstacleSpeedPxPerSec * deltaTimeMs) / MS_PER_SECOND;
  const gameWidth = getGameWidth();
  const gameRect = getGameRect();
  let resolvedPlayerBox: DOMRect | null = playerRect;

  if (clearRequested) {
    clearMovingEntities(obstaclesRef);
    return undefined;
  }

  let fatalCollisionIcon: string | null | undefined;

  obstaclesRef.current = obstaclesRef.current.filter((obs) => {
    const { currentLeftPx } = advanceMovingEntityMotion(obs, frameDistancePx);

    if (currentLeftPx < OBSTACLES_DEADLINE) {
      obs.remove();
      return false;
    }

    if (currentLeftPx < gameWidth - OBSTACLE_PLAYER_PROXIMITY_CHECK_PX) {
      resolvedPlayerBox ??= playerRef.current?.getBoundingClientRect() ?? null;
      const obstacleBox =
        gameRect === null
          ? obs.getBoundingClientRect()
          : (getObstacleRectFromCachedLayout(obs, currentLeftPx, gameRect) ??
            obs.getBoundingClientRect());
      const hitboxScale = Number(obs.dataset.hitboxScale ?? `${DEFAULT_OBSTACLE_HITBOX_SCALE}`);
      const obstacleHitbox = getScaledHitboxFromRectLike(obstacleBox, hitboxScale);
      const isCollision =
        !!resolvedPlayerBox && isPlayerOverlappingHitbox(resolvedPlayerBox, obstacleHitbox);

      if (isCollision) {
        obs.remove();
        if (isFishEntityType(obs.dataset.entityType)) {
          onFishCollected?.();
          return false;
        }
        fatalCollisionIcon = isBossVisible
          ? BOSS_GAME_OVER_ICON
          : (obs.dataset.gameOverIcon ?? null);
        return false;
      }
    }

    return true;
  });

  return fatalCollisionIcon;
};
