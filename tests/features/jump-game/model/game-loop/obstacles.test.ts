import { updateObstaclesFrame } from '@/features/jump-game/model/game-loop/obstacles';

describe('updateObstaclesFrame', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not read layout boxes when obstacles are far from the player', () => {
    const obstacle = document.createElement('img');
    obstacle.style.left = '1400px';
    obstacle.dataset.entityWidthPx = '40';
    obstacle.dataset.entityHeightPx = '40';
    obstacle.dataset.entityBottomPx = '0';
    obstacle.remove = vi.fn();

    const playerElement = document.createElement('div');
    const playerRectGetter = vi.fn(() => playerElement.getBoundingClientRect());
    const gameRectGetter = vi.fn(
      () =>
        ({
          left: 0,
          right: 1200,
          top: 0,
          bottom: 300,
          width: 1200,
          height: 300,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        }) as DOMRect,
    );

    const result = updateObstaclesFrame({
      clearRequested: false,
      obstacleSpeedPxPerSec: 0,
      deltaTimeMs: 16,
      obstaclesRef: {
        current: [obstacle],
      } as React.MutableRefObject<HTMLElement[]>,
      playerRef: {
        current: playerElement,
      } as React.RefObject<HTMLDivElement | null>,
      getGameWidth: () => 1200,
      getPlayerRect: playerRectGetter,
      getGameRect: gameRectGetter,
      isBossVisible: false,
    });

    expect(result).toBeUndefined();
    expect(playerRectGetter).not.toHaveBeenCalled();
    expect(gameRectGetter).not.toHaveBeenCalled();
  });
});
