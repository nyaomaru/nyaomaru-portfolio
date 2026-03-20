import { type MutableRefObject, type RefObject, useCallback, useEffect, useRef } from 'react';
import { PLAYER_JUMP_SPRITE, PLAYER_RUN_SPRITES } from './config/assets';
import { LANDING_SPRITE_HOLD_MS, PLAYER_SPRITE_SWAP_MS } from './config/timing';

const preloadedPlayerSprites = new Set<string>();
const spriteLoadPromises = new Map<string, Promise<void>>();

const decodeSpritePath = (spritePath: string) => {
  try {
    return decodeURIComponent(spritePath);
  } catch {
    return spritePath;
  }
};

const resolveSpritePathname = (spritePath: string) => {
  if (typeof window === 'undefined') {
    return decodeSpritePath(spritePath);
  }
  try {
    const spriteURL = new URL(spritePath, window.location.href);
    return decodeSpritePath(spriteURL.pathname);
  } catch {
    return decodeSpritePath(spritePath);
  }
};

const isSameSpriteSource = (currentSource: string, spritePath: string) => {
  if (!currentSource) return false;
  const currentPathname = resolveSpritePathname(currentSource);
  const requestedPathname = resolveSpritePathname(spritePath);
  return currentPathname.length > 0 && currentPathname === requestedPathname;
};

const ensureSpriteLoaded = (spritePath: string): Promise<void> => {
  if (preloadedPlayerSprites.has(spritePath)) {
    return Promise.resolve();
  }
  const existingLoadPromise = spriteLoadPromises.get(spritePath);
  if (existingLoadPromise) {
    return existingLoadPromise;
  }

  const loadPromise = new Promise<void>((resolve) => {
    const spriteImage = new Image();
    let isResolved = false;
    const finish = () => {
      if (isResolved) return;
      isResolved = true;
      preloadedPlayerSprites.add(spritePath);
      spriteLoadPromises.delete(spritePath);
      resolve();
    };
    spriteImage.onload = finish;
    spriteImage.onerror = finish;
    spriteImage.src = spritePath;
    if (spriteImage.complete) {
      finish();
    }
  });
  spriteLoadPromises.set(spritePath, loadPromise);
  return loadPromise;
};

/**
 * Inputs required to animate player run/jump sprite swapping.
 */
type UsePlayerSpriteAnimatorOptions = {
  /** Player sprite image node whose `src` is swapped per frame. */
  playerSpriteRef: RefObject<HTMLImageElement | null>;
  /** Stops animation updates when game is over. */
  gameOver: boolean;
  /** Ground state produced by jump controller. */
  isOnGroundRef: MutableRefObject<boolean>;
};

/**
 * Per-frame player sprite update inputs.
 */
type UpdatePlayerSpriteFrameParams = {
  /** Current high-resolution frame timestamp from the shared game loop. */
  nowMs: number;
};

/**
 * Controls frame-based player sprite changes for running, jumping and landing hold.
 *
 * @param options - Sprite animation inputs derived from scene and jump state.
 * @param options.playerSpriteRef - Player sprite image element whose `src` is swapped.
 * @param options.gameOver - Stops sprite-loop updates when the run has ended.
 * @param options.isOnGroundRef - Ground-state ref from jump logic for run/jump switching.
 * @returns Reset handler that normalizes sprite loop state and first run frame.
 */
export function usePlayerSpriteAnimator({
  playerSpriteRef,
  gameOver,
  isOnGroundRef,
}: UsePlayerSpriteAnimatorOptions) {
  const runFrameIndexRef = useRef(0);
  const wasOnGroundRef = useRef(true);
  const currentPlayerSpriteRef = useRef<string>(PLAYER_RUN_SPRITES[0]);
  const requestedPlayerSpriteRef = useRef<string>(PLAYER_RUN_SPRITES[0]);
  const landingHoldUntilRef = useRef(0);
  const lastRunFrameSwapAtMsRef = useRef(0);

  const setPlayerSprite = useCallback(
    (spritePath: string) => {
      requestedPlayerSpriteRef.current = spritePath;
      if (!playerSpriteRef.current) return;
      const applySprite = () => {
        if (!playerSpriteRef.current) return;
        if (requestedPlayerSpriteRef.current !== spritePath) return;
        const hasAppliedSprite =
          currentPlayerSpriteRef.current === spritePath &&
          isSameSpriteSource(playerSpriteRef.current.src, spritePath);
        if (hasAppliedSprite) return;
        currentPlayerSpriteRef.current = spritePath;
        playerSpriteRef.current.src = spritePath;
      };

      if (preloadedPlayerSprites.has(spritePath)) {
        applySprite();
        return;
      }

      void ensureSpriteLoaded(spritePath).then(applySprite);
    },
    [playerSpriteRef],
  );

  const resetPlayerSpriteState = useCallback(() => {
    runFrameIndexRef.current = 0;
    wasOnGroundRef.current = true;
    currentPlayerSpriteRef.current = PLAYER_RUN_SPRITES[0];
    requestedPlayerSpriteRef.current = PLAYER_RUN_SPRITES[0];
    landingHoldUntilRef.current = 0;
    lastRunFrameSwapAtMsRef.current = 0;
    setPlayerSprite(PLAYER_RUN_SPRITES[0]);
  }, [setPlayerSprite]);

  const updatePlayerSpriteFrame = useCallback(
    ({ nowMs }: UpdatePlayerSpriteFrameParams) => {
      if (gameOver) return;

      const isOnGround = isOnGroundRef.current;
      if (!isOnGround) {
        wasOnGroundRef.current = false;
        lastRunFrameSwapAtMsRef.current = 0;
        setPlayerSprite(PLAYER_JUMP_SPRITE);
        return;
      }

      if (!wasOnGroundRef.current) {
        wasOnGroundRef.current = true;
        runFrameIndexRef.current = 0;
        landingHoldUntilRef.current = nowMs + LANDING_SPRITE_HOLD_MS;
        lastRunFrameSwapAtMsRef.current = landingHoldUntilRef.current;
        setPlayerSprite(PLAYER_RUN_SPRITES[0]);
        return;
      }

      if (nowMs < landingHoldUntilRef.current) {
        return;
      }

      if (lastRunFrameSwapAtMsRef.current === 0) {
        lastRunFrameSwapAtMsRef.current = nowMs;
        setPlayerSprite(PLAYER_RUN_SPRITES[runFrameIndexRef.current]);
        return;
      }

      const elapsedSinceSwapMs = nowMs - lastRunFrameSwapAtMsRef.current;
      const frameAdvanceCount = Math.floor(elapsedSinceSwapMs / PLAYER_SPRITE_SWAP_MS);
      if (frameAdvanceCount <= 0) return;

      runFrameIndexRef.current =
        (runFrameIndexRef.current + frameAdvanceCount) % PLAYER_RUN_SPRITES.length;
      lastRunFrameSwapAtMsRef.current += frameAdvanceCount * PLAYER_SPRITE_SWAP_MS;
      setPlayerSprite(PLAYER_RUN_SPRITES[runFrameIndexRef.current]);
    },
    [gameOver, isOnGroundRef, setPlayerSprite],
  );

  useEffect(() => {
    void Promise.all(
      [...PLAYER_RUN_SPRITES, PLAYER_JUMP_SPRITE].map((spritePath) =>
        ensureSpriteLoaded(spritePath),
      ),
    );
    setPlayerSprite(PLAYER_RUN_SPRITES[runFrameIndexRef.current]);
    wasOnGroundRef.current = isOnGroundRef.current;
  }, [gameOver, isOnGroundRef, setPlayerSprite]);

  return {
    resetPlayerSpriteState,
    updatePlayerSpriteFrame,
  };
}
