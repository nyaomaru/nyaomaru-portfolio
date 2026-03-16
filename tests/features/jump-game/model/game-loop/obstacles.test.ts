import { updateObstaclesFrame } from '@/features/jump-game/model/game-loop/obstacles';

describe('updateObstaclesFrame', () => {
  it('uses cached obstacle layout metrics instead of reading obstacle DOM rects', () => {
    const obstacle = document.createElement('img');
    obstacle.style.left = '900px';
    obstacle.dataset.entityWidthPx = '40';
    obstacle.dataset.entityHeightPx = '50';
    obstacle.dataset.entityBottomPx = '0';
    obstacle.dataset.hitboxScale = '1';

    const obstacleRectSpy = vi.spyOn(obstacle, 'getBoundingClientRect');
    const player = document.createElement('div');
    const playerRectSpy = vi.spyOn(player, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      right: 10,
      top: 0,
      bottom: 10,
      width: 10,
      height: 10,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);

    updateObstaclesFrame({
      clearRequested: false,
      obstacleSpeedPxPerSec: 180,
      deltaTimeMs: 16.6667,
      obstaclesRef: { current: [obstacle] },
      playerRef: { current: player },
      playerRect: null,
      getGameWidth: () => 1000,
      getGameRect: () =>
        ({
          left: 0,
          right: 1000,
          top: 0,
          bottom: 400,
          width: 1000,
          height: 400,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        }) as DOMRect,
      isBossVisible: false,
    });

    expect(obstacleRectSpy).not.toHaveBeenCalled();
    expect(playerRectSpy).toHaveBeenCalledOnce();
  });
});
