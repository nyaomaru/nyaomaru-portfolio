const preloadedBossSprites = new Set<string>();
const bossSpriteLoadPromises = new Map<string, Promise<void>>();

/**
 * Checks whether a boss sprite path has already been preloaded.
 *
 * @param spritePath - Sprite URL/path to check.
 * @returns `true` when sprite is already cached in preload registry.
 */
export const isBossSpritePreloaded = (spritePath: string) => preloadedBossSprites.has(spritePath);

/**
 * Preloads a boss sprite once and memoizes the in-flight load promise.
 *
 * @param spritePath - Sprite URL/path to preload.
 * @returns Promise resolved when image load succeeds or fails.
 */
export const ensureBossSpriteLoaded = (spritePath: string): Promise<void> => {
  if (preloadedBossSprites.has(spritePath)) {
    return Promise.resolve();
  }
  const existingLoadPromise = bossSpriteLoadPromises.get(spritePath);
  if (existingLoadPromise) {
    return existingLoadPromise;
  }

  const loadPromise = new Promise<void>((resolve) => {
    const spriteImage = new Image();
    let resolved = false;
    const finish = () => {
      if (resolved) return;
      resolved = true;
      preloadedBossSprites.add(spritePath);
      bossSpriteLoadPromises.delete(spritePath);
      resolve();
    };
    spriteImage.onload = finish;
    spriteImage.onerror = finish;
    spriteImage.src = spritePath;
    if (spriteImage.complete) {
      finish();
    }
  });
  bossSpriteLoadPromises.set(spritePath, loadPromise);
  return loadPromise;
};
