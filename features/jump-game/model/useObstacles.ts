import { useCallback, useRef } from 'react';
import { oneOfValues } from 'is-kit';
import { isMobile } from '@/shared/lib/window';
import {
  PLAYER_BASE_HEIGHT_RATIO,
  PLAYER_EXPORT_BASE_HEIGHT,
  PLAYER_MAX_HEIGHT_PX,
  PLAYER_MIN_HEIGHT_PX,
} from './config/gameplay';
import { FALLBACK_GAME_HEIGHT } from './config/metrics';
import {
  BOSS_EXCLUDED_OBSTACLE_ICON_INDICES,
  DEFAULT_OBSTACLE_HITBOX_SCALE,
  FISH_BASE_GAME_HEIGHT,
  FISH_BOTTOM_POSITIONS,
  FISH_ICON_SIZE,
  FISH_MIN_CLEARANCE_LANES,
  HIGH_OBSTACLE_HEIGHT_LANE,
  HIGH_OBSTACLE_ICON_INDICES,
  LOW_OBSTACLE_HEIGHT_LANE,
  LOW_OBSTACLE_ICON_INDICES,
  MOBILE_HIGH_OBSTACLE_HITBOX_SCALE_MULTIPLIER,
  MOBILE_OBSTACLE_VISUAL_SCALE_MULTIPLIER,
  MOBILE_LOW_OBSTACLE_HITBOX_SCALE_MULTIPLIER,
  OBSTACLE_ICON_FALLBACK_EXPORT_SIZES,
  OBSTACLE_HITBOX_SCALE_BY_ICON_INDEX,
  OBSTACLE_ICON_SPAWN_WEIGHTS,
  OBSTACLE_WEIGHT_FALLBACK_INDEX,
  PC_HIGH_OBSTACLE_HITBOX_SCALE_MULTIPLIER,
  PC_LOW_OBSTACLE_HITBOX_SCALE_MULTIPLIER,
  SPAWN_OUTSIDE_OFFSET_PX,
} from './config/obstacles';
import { FISH_ICON, OBSTACLE_GAME_OVER_ICON_SOURCES, OBSTACLE_ICON_SOURCES } from './config/assets';
import { initializeMovingEntityMotion } from './game-loop/moving-entity-motion';
const isLowObstacleIconIndex = oneOfValues(...LOW_OBSTACLE_ICON_INDICES);
const isHighObstacleIconIndex = oneOfValues(...HIGH_OBSTACLE_ICON_INDICES);
const bossExcludedObstacleIconIndices = new Set<number>(BOSS_EXCLUDED_OBSTACLE_ICON_INDICES);
const ENTITY_WIDTH_PX_DATASET_KEY = 'entityWidthPx';
const ENTITY_HEIGHT_PX_DATASET_KEY = 'entityHeightPx';
const ENTITY_BOTTOM_PX_DATASET_KEY = 'entityBottomPx';

type ObstacleIconIndex = number;
type SpawnableObstacleIndicesParams = {
  /** Candidate obstacle indices supplied by caller or full default list. */
  candidateIndices: ObstacleIconIndex[];
  /** Whether current spawn should apply boss-mode exclusions. */
  isBossMode: boolean;
};

const getAllObstacleIndices = () =>
  OBSTACLE_ICON_SOURCES.map((_, index) => index) as ObstacleIconIndex[];

const getSpawnableObstacleIndices = ({
  candidateIndices,
  isBossMode,
}: SpawnableObstacleIndicesParams) =>
  candidateIndices.filter((index) => {
    if (index < 0 || index >= OBSTACLE_ICON_SOURCES.length) return false;
    if (isBossMode && bossExcludedObstacleIconIndices.has(index)) return false;
    return true;
  });

const pickWeightedObstacleIndex = (indices: ObstacleIconIndex[]) => {
  const totalWeight = indices.reduce(
    (sum, index) => sum + (OBSTACLE_ICON_SPAWN_WEIGHTS[index] ?? 1),
    0,
  );
  let weightedRoll = Math.random() * totalWeight;
  let iconIndex = indices[OBSTACLE_WEIGHT_FALLBACK_INDEX];
  for (const index of indices) {
    weightedRoll -= OBSTACLE_ICON_SPAWN_WEIGHTS[index] ?? 1;
    if (weightedRoll <= 0) {
      iconIndex = index;
      break;
    }
  }
  return iconIndex;
};

const applyObstacleHitboxScale = (
  obstacleElement: HTMLImageElement,
  iconIndex: ObstacleIconIndex,
) => {
  const isMobileViewport = isMobile();
  const baseHitboxScale =
    OBSTACLE_HITBOX_SCALE_BY_ICON_INDEX[iconIndex] ?? DEFAULT_OBSTACLE_HITBOX_SCALE;
  const resolvedHitboxScale =
    isMobileViewport && isLowObstacleIconIndex(iconIndex)
      ? baseHitboxScale * MOBILE_LOW_OBSTACLE_HITBOX_SCALE_MULTIPLIER
      : isMobileViewport && isHighObstacleIconIndex(iconIndex)
        ? baseHitboxScale * MOBILE_HIGH_OBSTACLE_HITBOX_SCALE_MULTIPLIER
        : !isMobileViewport && isLowObstacleIconIndex(iconIndex)
          ? baseHitboxScale * PC_LOW_OBSTACLE_HITBOX_SCALE_MULTIPLIER
          : !isMobileViewport && isHighObstacleIconIndex(iconIndex)
            ? baseHitboxScale * PC_HIGH_OBSTACLE_HITBOX_SCALE_MULTIPLIER
            : baseHitboxScale;
  obstacleElement.dataset.hitboxScale = `${resolvedHitboxScale}`;
};

const getObstacleHeightLane = (iconIndex: ObstacleIconIndex) =>
  isHighObstacleIconIndex(iconIndex) ? HIGH_OBSTACLE_HEIGHT_LANE : LOW_OBSTACLE_HEIGHT_LANE;

const setEntityLayoutMetrics = (
  element: HTMLElement,
  metrics: { widthPx: number; heightPx: number; bottomPx: number },
) => {
  element.dataset[ENTITY_WIDTH_PX_DATASET_KEY] = `${metrics.widthPx}`;
  element.dataset[ENTITY_HEIGHT_PX_DATASET_KEY] = `${metrics.heightPx}`;
  element.dataset[ENTITY_BOTTOM_PX_DATASET_KEY] = `${metrics.bottomPx}`;
};

/**
 * Optional flags controlling one-off obstacle spawns.
 */
type SpawnObstacleOptions = {
  /** Restricts random obstacle choices to boss-mode compatible icons. */
  isBossMode?: boolean;
  /** Restricts random obstacle choices to the provided icon indices. */
  allowedIconIndices?: number[];
};

/**
 * Obstacle and collectible spawner.
 * Owns DOM node creation/removal for jump-game entities under `gameRef`.
 *
 * @param gameRef - Game viewport element used as parent for spawned obstacle/fish nodes.
 * @returns Spawn and cleanup helpers with the mutable active-entity list.
 */
export function useObstacles(gameRef: React.RefObject<HTMLDivElement | null>) {
  const obstaclesRef = useRef<HTMLElement[]>([]);
  const lastSpawnedObstacleIndexRef = useRef<ObstacleIconIndex | null>(null);

  const getGameWidth = useCallback(
    () => gameRef.current?.clientWidth || window.innerWidth,
    [gameRef],
  );
  const getGameHeight = useCallback(
    () => gameRef.current?.clientHeight || FALLBACK_GAME_HEIGHT,
    [gameRef],
  );
  const getSpawnLeft = useCallback(() => getGameWidth() + SPAWN_OUTSIDE_OFFSET_PX, [getGameWidth]);
  const getPlayerHeightPx = useCallback(() => {
    const rawPlayerHeight = getGameHeight() * PLAYER_BASE_HEIGHT_RATIO;
    return Math.min(PLAYER_MAX_HEIGHT_PX, Math.max(PLAYER_MIN_HEIGHT_PX, rawPlayerHeight));
  }, [getGameHeight]);

  const spawnObstacle = useCallback(
    ({ isBossMode = false, allowedIconIndices }: SpawnObstacleOptions = {}) => {
      const isMobileViewport = isMobile();
      const obs = document.createElement('img');
      const candidateIndices =
        allowedIconIndices && allowedIconIndices.length > 0
          ? allowedIconIndices
          : getAllObstacleIndices();
      const spawnableIndices = getSpawnableObstacleIndices({
        candidateIndices,
        isBossMode,
      });
      if (spawnableIndices.length === 0) return;
      const isPreviousObstacleHigh =
        lastSpawnedObstacleIndexRef.current !== null &&
        isHighObstacleIconIndex(lastSpawnedObstacleIndexRef.current);
      const nonHighSpawnableIndices = spawnableIndices.filter(
        (index) => !isHighObstacleIconIndex(index),
      );
      const iconIndex =
        isMobileViewport && isPreviousObstacleHigh && nonHighSpawnableIndices.length > 0
          ? pickWeightedObstacleIndex(nonHighSpawnableIndices)
          : pickWeightedObstacleIndex(spawnableIndices);
      lastSpawnedObstacleIndexRef.current = iconIndex;
      const playerHeightPx = getPlayerHeightPx();
      const iconFallbackSize = OBSTACLE_ICON_FALLBACK_EXPORT_SIZES[iconIndex];
      const mobileVisualScale = isMobileViewport ? MOBILE_OBSTACLE_VISUAL_SCALE_MULTIPLIER : 1;
      const applyObstacleSize = (exportWidth: number, exportHeight: number) => {
        const obstacleHeightPx =
          playerHeightPx * (exportHeight / PLAYER_EXPORT_BASE_HEIGHT) * mobileVisualScale;
        const obstacleWidthPx =
          playerHeightPx * (exportWidth / PLAYER_EXPORT_BASE_HEIGHT) * mobileVisualScale;
        obs.style.height = `${obstacleHeightPx}px`;
        obs.style.width = `${obstacleWidthPx}px`;
        setEntityLayoutMetrics(obs, {
          widthPx: obstacleWidthPx,
          heightPx: obstacleHeightPx,
          bottomPx: 0,
        });
      };
      obs.className = 'select-none pointer-events-none';
      obs.src = OBSTACLE_ICON_SOURCES[iconIndex];
      obs.dataset.gameOverIcon = OBSTACLE_GAME_OVER_ICON_SOURCES[iconIndex];
      applyObstacleHitboxScale(obs, iconIndex);
      obs.alt = '';
      obs.draggable = false;
      obs.setAttribute('aria-hidden', 'true');
      obs.style.position = 'absolute';
      obs.style.bottom = '0px';
      initializeMovingEntityMotion(obs, getSpawnLeft());
      applyObstacleSize(iconFallbackSize.width, iconFallbackSize.height);
      obs.style.objectFit = 'contain';
      obs.style.objectPosition = 'bottom';
      gameRef.current?.appendChild(obs);
      obstaclesRef.current.push(obs);
    },
    [gameRef, getPlayerHeightPx, getSpawnLeft],
  );

  const spawnFish = useCallback(() => {
    const fish = document.createElement('img');
    const minimumFishLane =
      (lastSpawnedObstacleIndexRef.current === null
        ? 0
        : getObstacleHeightLane(lastSpawnedObstacleIndexRef.current)) + FISH_MIN_CLEARANCE_LANES;
    const minimumFishPositionIndex = Math.min(
      FISH_BOTTOM_POSITIONS.length - 1,
      Math.max(0, minimumFishLane - 1),
    );
    const availableFishBottomPositions = FISH_BOTTOM_POSITIONS.slice(minimumFishPositionIndex);
    const fishBottom =
      availableFishBottomPositions[Math.floor(Math.random() * availableFishBottomPositions.length)];
    const gameHeight = getGameHeight();
    const fishScale = gameHeight / FISH_BASE_GAME_HEIGHT;

    fish.className = 'select-none pointer-events-none';
    fish.src = FISH_ICON;
    fish.alt = '';
    fish.draggable = false;
    fish.setAttribute('aria-hidden', 'true');
    fish.dataset.entityType = 'fish';
    fish.style.position = 'absolute';
    initializeMovingEntityMotion(fish, getSpawnLeft());
    fish.style.bottom = `${fishBottom * fishScale}px`;
    fish.style.width = `${FISH_ICON_SIZE * fishScale}px`;
    fish.style.height = `${FISH_ICON_SIZE * fishScale}px`;
    setEntityLayoutMetrics(fish, {
      widthPx: FISH_ICON_SIZE * fishScale,
      heightPx: FISH_ICON_SIZE * fishScale,
      bottomPx: fishBottom * fishScale,
    });
    fish.style.objectFit = 'contain';
    fish.style.objectPosition = 'center';

    gameRef.current?.appendChild(fish);
    obstaclesRef.current.push(fish);
  }, [gameRef, getGameHeight, getSpawnLeft]);

  const clearObstacles = useCallback(() => {
    obstaclesRef.current.forEach((obs) => {
      try {
        obs.remove();
      } catch (error) {
        console.warn('Failed to remove obstacle:', error);
      }
    });
    obstaclesRef.current = [];
    lastSpawnedObstacleIndexRef.current = null;
  }, []);

  return {
    obstaclesRef,
    spawnObstacle,
    spawnFish,
    clearObstacles,
  };
}
