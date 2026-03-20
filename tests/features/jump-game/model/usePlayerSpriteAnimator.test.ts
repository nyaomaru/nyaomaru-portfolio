import { act, renderHook } from '@testing-library/react';
import { PLAYER_JUMP_SPRITE, PLAYER_RUN_SPRITES } from '@/features/jump-game/model/config/assets';
import {
  LANDING_SPRITE_HOLD_MS,
  PLAYER_SPRITE_SWAP_MS,
} from '@/features/jump-game/model/config/timing';
import { usePlayerSpriteAnimator } from '@/features/jump-game/model/usePlayerSpriteAnimator';

class MockImage {
  complete = true;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  private _src = '';

  set src(value: string) {
    this._src = value;
    this.onload?.();
  }

  get src() {
    return this._src;
  }
}

describe('usePlayerSpriteAnimator', () => {
  const originalImage = globalThis.Image;

  beforeEach(() => {
    globalThis.Image = MockImage as unknown as typeof Image;
  });

  afterEach(() => {
    globalThis.Image = originalImage;
    vi.restoreAllMocks();
  });

  it('updates sprites from the shared frame loop without registering intervals', () => {
    const setIntervalSpy = vi.spyOn(window, 'setInterval');
    const playerSpriteElement = document.createElement('img');
    const isOnGroundRef = { current: true } as React.MutableRefObject<boolean>;

    const { result } = renderHook(() =>
      usePlayerSpriteAnimator({
        playerSpriteRef: {
          current: playerSpriteElement,
        } as React.RefObject<HTMLImageElement | null>,
        gameOver: false,
        isOnGroundRef,
      }),
    );

    act(() => {
      result.current.updatePlayerSpriteFrame({ nowMs: 1 });
      result.current.updatePlayerSpriteFrame({ nowMs: PLAYER_SPRITE_SWAP_MS + 1 });
    });

    expect(setIntervalSpy).not.toHaveBeenCalled();
    expect(playerSpriteElement.src).toContain(PLAYER_RUN_SPRITES[1]);
  });

  it('switches to jump sprite in air and holds landing frame before resuming run swap', () => {
    const playerSpriteElement = document.createElement('img');
    const isOnGroundRef = { current: false } as React.MutableRefObject<boolean>;

    const { result } = renderHook(() =>
      usePlayerSpriteAnimator({
        playerSpriteRef: {
          current: playerSpriteElement,
        } as React.RefObject<HTMLImageElement | null>,
        gameOver: false,
        isOnGroundRef,
      }),
    );

    act(() => {
      result.current.updatePlayerSpriteFrame({ nowMs: 1 });
    });

    expect(playerSpriteElement.src).toContain(PLAYER_JUMP_SPRITE);

    act(() => {
      isOnGroundRef.current = true;
      result.current.updatePlayerSpriteFrame({ nowMs: 10 });
      result.current.updatePlayerSpriteFrame({ nowMs: 10 + LANDING_SPRITE_HOLD_MS - 1 });
    });

    expect(playerSpriteElement.src).toContain(PLAYER_RUN_SPRITES[0]);

    act(() => {
      result.current.updatePlayerSpriteFrame({
        nowMs: 10 + LANDING_SPRITE_HOLD_MS + PLAYER_SPRITE_SWAP_MS + 1,
      });
    });

    expect(playerSpriteElement.src).toContain(PLAYER_RUN_SPRITES[1]);
  });
});
