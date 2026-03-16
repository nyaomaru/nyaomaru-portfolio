import { act, renderHook } from '@testing-library/react';
import { useGameLoop } from '@/features/jump-game/model/game-loop/useGameLoop';
import { ARM_APPEAR_DELAY_MS } from '@/features/jump-game/model/config/gameplay';
import { BOSS_CLEAR_ICON, BOSS_GAME_OVER_ICON } from '@/features/jump-game/model/config/assets';

vi.mock('@/shared/lib/window', () => ({
  isMobile: () => false,
}));

const updateObstaclesFrameMock = vi.fn();
const clearMovingEntitiesMock = vi.fn();
const advanceArmStateMachineMock = vi.fn();
const getArmFrameConfigMock = vi.fn();
const getArmPhaseViewMock = vi.fn();
const getArmTargetLengthMock = vi.fn();
const isPlayerOverlappingHitboxMock = vi.fn();
const getBossWaitBobMock = vi.fn();

vi.mock('@/features/jump-game/model/game-loop/obstacles', () => ({
  updateObstaclesFrame: (...args: Parameters<typeof updateObstaclesFrameMock>) =>
    updateObstaclesFrameMock(...args),
  clearMovingEntities: (...args: Parameters<typeof clearMovingEntitiesMock>) =>
    clearMovingEntitiesMock(...args),
}));

vi.mock('@/features/jump-game/model/game-loop/arm-state-machine', () => ({
  advanceArmStateMachine: (...args: Parameters<typeof advanceArmStateMachineMock>) =>
    advanceArmStateMachineMock(...args),
  getArmFrameConfig: (...args: Parameters<typeof getArmFrameConfigMock>) =>
    getArmFrameConfigMock(...args),
  getArmPhaseView: (...args: Parameters<typeof getArmPhaseViewMock>) =>
    getArmPhaseViewMock(...args),
  getArmTargetLength: (...args: Parameters<typeof getArmTargetLengthMock>) =>
    getArmTargetLengthMock(...args),
}));

vi.mock('@/features/jump-game/model/game-loop/helpers', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/features/jump-game/model/game-loop/helpers')>();
  return {
    ...actual,
    isPlayerOverlappingHitbox: (...args: Parameters<typeof isPlayerOverlappingHitboxMock>) =>
      isPlayerOverlappingHitboxMock(...args),
    getBossWaitBob: (...args: Parameters<typeof getBossWaitBobMock>) => getBossWaitBobMock(...args),
  };
});

describe('useGameLoop end-state transitions', () => {
  const createDivRef = (): React.RefObject<HTMLDivElement> => ({
    current: document.createElement('div'),
  });
  const createImageRef = (): React.RefObject<HTMLImageElement> => ({
    current: document.createElement('img'),
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    updateObstaclesFrameMock.mockReset();
    clearMovingEntitiesMock.mockReset();
    advanceArmStateMachineMock.mockReset();
    getArmFrameConfigMock.mockReset();
    getArmPhaseViewMock.mockReset();
    getArmTargetLengthMock.mockReset();
    isPlayerOverlappingHitboxMock.mockReset();
    getBossWaitBobMock.mockReset();
  });

  it('enters fault state on fatal obstacle collision and applies fault side effects', () => {
    const fatalIcon = '/assets/icons/custom-fault.svg';
    updateObstaclesFrameMock.mockReturnValue(fatalIcon);

    const bossRef = createDivRef();
    const bossSpriteRef = createImageRef();
    const bossArmRef = createDivRef();
    const gameRef = createDivRef();
    const playerRef = createDivRef();
    const obstaclesRef = {
      current: [document.createElement('img') as HTMLElement],
    } as React.MutableRefObject<HTMLElement[]>;
    const startTimeRef = {
      current: Date.now(),
    } as React.MutableRefObject<number | null>;

    const setGameOver = vi.fn();
    const setTitle = vi.fn();
    const setShowBoss = vi.fn();
    const setGameOverIcon = vi.fn();

    renderHook(() =>
      useGameLoop({
        gameOver: false,
        showBoss: false,
        bossRef,
        bossSpriteRef,
        playerRef,
        obstaclesRef,
        startTimeRef,
        gameRef,
        bossArmRef,
        setGameOver,
        setTitle,
        setShowBoss,
        setGameOverIcon,
      }),
    );

    expect(updateObstaclesFrameMock).toHaveBeenCalledOnce();
    expect(clearMovingEntitiesMock).toHaveBeenCalledOnce();
    expect(clearMovingEntitiesMock).toHaveBeenCalledWith(obstaclesRef);
    expect(playerRef.current?.style.opacity).toBe('0');
    expect(playerRef.current?.style.visibility).toBe('hidden');
    expect(setTitle).toHaveBeenCalledWith('');
    expect(setGameOverIcon).toHaveBeenCalledWith(fatalIcon);
    expect(setGameOver).toHaveBeenCalledWith(true);
  });

  it('enters clear state after clear duration and applies clear side effects', () => {
    updateObstaclesFrameMock.mockReturnValue(undefined);

    const bossRef = createDivRef();
    const bossSpriteRef = createImageRef();
    const bossArmRef = createDivRef();
    const gameRef = createDivRef();
    const playerRef = createDivRef();
    const obstaclesRef = {
      current: [document.createElement('img') as HTMLElement],
    } as React.MutableRefObject<HTMLElement[]>;
    const startTimeRef = {
      current: Date.now() - 61_000,
    } as React.MutableRefObject<number | null>;

    const setGameOver = vi.fn();
    const setTitle = vi.fn();
    const setShowBoss = vi.fn();
    const setGameOverIcon = vi.fn();

    renderHook(() =>
      useGameLoop({
        gameOver: false,
        showBoss: false,
        bossRef,
        bossSpriteRef,
        playerRef,
        obstaclesRef,
        startTimeRef,
        gameRef,
        bossArmRef,
        setGameOver,
        setTitle,
        setShowBoss,
        setGameOverIcon,
      }),
    );

    expect(updateObstaclesFrameMock).toHaveBeenCalledOnce();
    expect(clearMovingEntitiesMock).toHaveBeenCalledOnce();
    expect(clearMovingEntitiesMock).toHaveBeenCalledWith(obstaclesRef);
    expect(setTitle).toHaveBeenCalledWith('');
    expect(setGameOverIcon).toHaveBeenCalledWith(BOSS_CLEAR_ICON);
    expect(setGameOver).toHaveBeenCalledWith(true);
  });

  it('enters boss fault state on boss-arm collision and sets boss game-over icon', () => {
    updateObstaclesFrameMock.mockReturnValue(undefined);
    getArmFrameConfigMock.mockReturnValue({
      armHitStartProgressRatio: 0,
      armHitboxVerticalOffsetRatio: 0,
    });
    getArmPhaseViewMock.mockReturnValue({
      isPatternTwoObstacleWindow: false,
      isAttackPhase: true,
      frameIndex: 0,
      waitOffsetY: 0,
    });
    getArmTargetLengthMock.mockReturnValue(120);
    getBossWaitBobMock.mockReturnValue({ atGround: true, offsetY: 0 });
    advanceArmStateMachineMock.mockImplementation(({ arm }) => {
      arm.width = 120;
      arm.targetLen = 120;
      arm.phase = 'extending';
    });
    isPlayerOverlappingHitboxMock.mockReturnValue(true);

    const rafCallbacks: FrameRequestCallback[] = [];
    const requestAnimationFrameSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback: FrameRequestCallback) => {
        rafCallbacks.push(callback);
        return 1;
      });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
    const performanceNowSpy = vi.spyOn(performance, 'now').mockReturnValue(0);

    const bossRef = createDivRef();
    const bossSpriteRef = createImageRef();
    const bossArmRef = createDivRef();
    const gameRef = createDivRef();
    const playerRef = createDivRef();
    const obstaclesRef = {
      current: [document.createElement('img') as HTMLElement],
    } as React.MutableRefObject<HTMLElement[]>;
    const startTimeRef = {
      current: Date.now(),
    } as React.MutableRefObject<number | null>;

    bossArmRef.current!.getBoundingClientRect = vi.fn(
      () =>
        ({
          left: 100,
          right: 200,
          top: 100,
          bottom: 120,
          width: 100,
          height: 20,
        }) as DOMRect,
    );
    playerRef.current!.getBoundingClientRect = vi.fn(
      () =>
        ({
          left: 120,
          right: 180,
          top: 95,
          bottom: 130,
          width: 60,
          height: 35,
        }) as DOMRect,
    );

    const setGameOver = vi.fn();
    const setTitle = vi.fn();
    const setShowBoss = vi.fn();
    const setGameOverIcon = vi.fn();

    renderHook(() =>
      useGameLoop({
        gameOver: false,
        showBoss: true,
        bossRef,
        bossSpriteRef,
        playerRef,
        obstaclesRef,
        startTimeRef,
        gameRef,
        bossArmRef,
        setGameOver,
        setTitle,
        setShowBoss,
        setGameOverIcon,
      }),
    );

    expect(rafCallbacks).toHaveLength(1);
    performanceNowSpy.mockReturnValue(ARM_APPEAR_DELAY_MS + 1);
    act(() => {
      rafCallbacks[0](0);
    });

    expect(clearMovingEntitiesMock).toHaveBeenCalledOnce();
    expect(playerRef.current?.style.opacity).toBe('0');
    expect(playerRef.current?.style.visibility).toBe('hidden');
    expect(setGameOverIcon).toHaveBeenCalledWith(BOSS_GAME_OVER_ICON);
    expect(setGameOver).toHaveBeenCalledWith(true);
    requestAnimationFrameSpy.mockRestore();
    performanceNowSpy.mockRestore();
  });

  it('uses post-advance boss wait-bob offset when deriving phase view', () => {
    updateObstaclesFrameMock.mockReturnValue(undefined);
    getArmFrameConfigMock.mockReturnValue({
      attackFrameMaxIndex: 4,
      armSpeedMultiplier: 1,
      armHitStartProgressRatio: 1,
      armHitboxVerticalOffsetRatio: 0,
      extendFastFromFrameNumber: 0,
      extendFastToFrameNumber: 0,
      retractFastFromFrameNumber: 0,
      retractFastToFrameNumber: 0,
      attackChargeMs: 0,
    });
    getArmTargetLengthMock.mockReturnValue(120);
    let bossWaitBobCallCount = 0;
    getBossWaitBobMock.mockImplementation(() => {
      bossWaitBobCallCount += 1;
      if (bossWaitBobCallCount === 1) return { atGround: true, offsetY: 9 };
      if (bossWaitBobCallCount % 2 === 0) return { atGround: false, offsetY: -6 };
      return { atGround: true, offsetY: 0 };
    });
    getArmPhaseViewMock.mockReturnValue({
      isPatternTwoObstacleWindow: false,
      isAttackPhase: false,
      frameIndex: 0,
      waitOffsetY: 0,
    });
    advanceArmStateMachineMock.mockImplementation(({ arm, nowMs }) => {
      arm.phase = 'idle';
      arm.phaseStartMs = nowMs;
    });
    isPlayerOverlappingHitboxMock.mockReturnValue(false);

    const rafCallbacks: FrameRequestCallback[] = [];
    const requestAnimationFrameSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback: FrameRequestCallback) => {
        rafCallbacks.push(callback);
        return 1;
      });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
    const performanceNowSpy = vi.spyOn(performance, 'now').mockReturnValue(0);

    const bossRef = createDivRef();
    const bossSpriteRef = createImageRef();
    const bossArmRef = createDivRef();
    const gameRef = createDivRef();
    const playerRef = createDivRef();
    const obstaclesRef = {
      current: [document.createElement('img') as HTMLElement],
    } as React.MutableRefObject<HTMLElement[]>;
    const startTimeRef = {
      current: Date.now(),
    } as React.MutableRefObject<number | null>;

    renderHook(() =>
      useGameLoop({
        gameOver: false,
        showBoss: true,
        bossRef,
        bossSpriteRef,
        playerRef,
        obstaclesRef,
        startTimeRef,
        gameRef,
        bossArmRef,
        setGameOver: vi.fn(),
        setTitle: vi.fn(),
        setShowBoss: vi.fn(),
        setGameOverIcon: vi.fn(),
      }),
    );

    expect(rafCallbacks).toHaveLength(1);
    performanceNowSpy.mockReturnValue(ARM_APPEAR_DELAY_MS + 1);
    act(() => {
      rafCallbacks[0](0);
    });

    const advanceInput = advanceArmStateMachineMock.mock.calls.at(-1)?.[0] as
      | { waitAtGround: boolean }
      | undefined;
    expect(advanceInput?.waitAtGround).toBe(false);
    const phaseViewInput = getArmPhaseViewMock.mock.calls.at(-1)?.[0] as
      | { waitBobOffsetY: number }
      | undefined;
    expect(phaseViewInput?.waitBobOffsetY).toBe(0);

    requestAnimationFrameSpy.mockRestore();
    performanceNowSpy.mockRestore();
  });
});
