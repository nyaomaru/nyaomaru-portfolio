import { renderHook } from '@testing-library/react';
import { useObstacles } from '@/features/jump-game/model/useObstacles';

describe('useObstacles', () => {
  let gameRef: React.RefObject<HTMLDivElement>;
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    gameRef = { current: document.createElement('div') };
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });
  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  describe('spawnObstacle', () => {
    const obstacleIcons = [
      '/assets/icons/nyaomaru_game_graphic_game_object_short_desk.svg',
      '/assets/icons/nyaomaru_game_graphic_game_object_tall_desk.svg',
      '/assets/icons/nyaomaru_game_graphic_game_object_work1.svg',
      '/assets/icons/nyaomaru_game_graphic_game_object_work2.svg',
    ];

    it('creates an obstacle with correct properties', () => {
      const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
      const { result } = renderHook(() => useObstacles(gameRef));
      result.current.spawnObstacle();
      expect(result.current.obstaclesRef.current).toHaveLength(1);

      const obstacle = result.current.obstaclesRef.current[0];

      expect(obstacle.tagName).toBe('IMG');
      expect(obstacle.className).toBe('select-none pointer-events-none');
      expect(obstacle.getAttribute('src')).toBe(obstacleIcons[0]);
      expect(obstacle.style.left).toBe('1048px');
      randomSpy.mockRestore();
    });

    it('selects a random icon for each obstacle', () => {
      const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.99);
      const { result } = renderHook(() => useObstacles(gameRef));
      result.current.spawnObstacle();
      const obstacle = result.current.obstaclesRef.current[0];
      expect(obstacle.getAttribute('src')).toBe(obstacleIcons[3]);
      randomSpy.mockRestore();
    });

    it('scales obstacle size from player height and exported svg dimensions', () => {
      const randomSpy = vi.spyOn(Math, 'random');
      const imageCompleteSpy = vi
        .spyOn(HTMLImageElement.prototype, 'complete', 'get')
        .mockReturnValue(false);
      const { result } = renderHook(() => useObstacles(gameRef));

      randomSpy.mockReturnValueOnce(0);
      result.current.spawnObstacle();
      expect(parseFloat(result.current.obstaclesRef.current[0].style.height)).toBeCloseTo(
        65.8078,
        3,
      );
      expect(parseFloat(result.current.obstaclesRef.current[0].style.width)).toBeCloseTo(
        73.6072,
        3,
      );

      randomSpy.mockReturnValueOnce(0.8);
      result.current.spawnObstacle();
      expect(parseFloat(result.current.obstaclesRef.current[1].style.height)).toBeCloseTo(
        65.8078,
        3,
      );
      expect(parseFloat(result.current.obstaclesRef.current[1].style.width)).toBeCloseTo(
        53.1337,
        3,
      );

      imageCompleteSpy.mockRestore();
      randomSpy.mockRestore();
    });

    it('excludes tall desk and work2 while boss mode is active', () => {
      const randomSpy = vi.spyOn(Math, 'random');
      const { result } = renderHook(() => useObstacles(gameRef));

      randomSpy.mockReturnValueOnce(0);
      result.current.spawnObstacle({ isBossMode: true });
      expect(result.current.obstaclesRef.current[0].getAttribute('src')).toBe(obstacleIcons[0]);

      randomSpy.mockReturnValueOnce(0.99);
      result.current.spawnObstacle({ isBossMode: true });
      expect(result.current.obstaclesRef.current[1].getAttribute('src')).toBe(obstacleIcons[2]);

      randomSpy.mockRestore();
    });
  });

  describe('clearObstacles', () => {
    it('removes all obstacles', () => {
      const { result } = renderHook(() => useObstacles(gameRef));

      result.current.spawnObstacle();
      result.current.spawnObstacle();

      expect(result.current.obstaclesRef.current).toHaveLength(2);
      result.current.clearObstacles();
      expect(result.current.obstaclesRef.current).toHaveLength(0);
    });
  });

  describe('spawnFish', () => {
    it('creates a fish collectible element', () => {
      const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
      const { result } = renderHook(() => useObstacles(gameRef));

      result.current.spawnFish();

      expect(result.current.obstaclesRef.current).toHaveLength(1);
      const fish = result.current.obstaclesRef.current[0];
      expect(fish.tagName).toBe('IMG');
      expect(fish.getAttribute('src')).toBe('/assets/icons/nyaomaru_web_icon_sakana.svg');
      expect(fish.dataset.entityType).toBe('fish');
      expect(fish.style.left).toBe('1048px');
      expect(fish.style.bottom).toBe('16px');
      randomSpy.mockRestore();
    });

    it('spawns fish from lane 2+ after a lane-1 obstacle', () => {
      const randomSpy = vi.spyOn(Math, 'random');
      const { result } = renderHook(() => useObstacles(gameRef));

      randomSpy.mockReturnValueOnce(0);
      result.current.spawnObstacle();
      randomSpy.mockReturnValueOnce(0);
      result.current.spawnFish();

      const fish = result.current.obstaclesRef.current[1];
      expect(parseFloat(fish.style.bottom)).toBeCloseTo((28 * 400) / 300, 3);
      randomSpy.mockRestore();
    });
  });
});
