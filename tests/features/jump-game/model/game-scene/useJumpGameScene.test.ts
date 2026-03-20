import { act, renderHook } from '@testing-library/react';
import { resetJumpGameAudioForTesting } from '@/features/jump-game/model/audio';
import { BOSS_CLEAR_ICON } from '@/features/jump-game/model/config/assets';
import { useJumpGameScene } from '@/features/jump-game/model/game-scene/useJumpGameScene';

const jumpMock = vi.fn();
const resetJumpStateMock = vi.fn();
const updateJumpFrameMock = vi.fn();
const spawnObstacleMock = vi.fn();
const spawnFishMock = vi.fn();
const clearObstaclesMock = vi.fn();
const resetPlayerSpriteStateMock = vi.fn();
const resetJumpInputMock = vi.fn();
const resetBossClearSequenceMock = vi.fn();
let latestGameLoopParams: Record<string, unknown> | null = null;

const createBossClearSequenceResult = (gameOverIcon: string | null) => ({
  isBossClearResult: gameOverIcon === BOSS_CLEAR_ICON,
  clearSequencePhase: 'idle',
  resetBossClearSequence: resetBossClearSequenceMock,
  shouldShowHappyIcon: false,
  happyIconFrameSrc: null,
  shouldShowSpecialClearOverlay: false,
  shouldAnimateRocketEntry: false,
  specialRocketIconSrc: null,
  specialRocketEntryDurationMs: 0,
  shouldShowByeByeIcon: false,
  specialByeByeIconSrc: null,
  shouldShowSpecialFlyout: false,
  specialFlyoutOrigin: null,
  specialFlyoutDurationMs: 0,
  specialFlyoutIconSrc: null,
  showSpecialFin: false,
  specialFinIconSrc: null,
});

const audioInstances: MockAudio[] = [];

class MockAudio {
  currentTime = 0;
  preload = '';
  src: string;
  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn();

  constructor(src: string) {
    this.src = src;
    audioInstances.push(this);
  }
}

vi.mock('@/shared/lib/window', () => ({
  isMobile: () => false,
}));

vi.mock('@/features/jump-game/model/useJump', () => ({
  useJump: () => ({
    jump: jumpMock,
    isOnGroundRef: { current: true },
    resetJumpState: resetJumpStateMock,
    updateJumpFrame: updateJumpFrameMock,
  }),
}));

vi.mock('@/features/jump-game/model/useObstacles', () => ({
  useObstacles: () => ({
    obstaclesRef: { current: [] },
    spawnObstacle: spawnObstacleMock,
    spawnFish: spawnFishMock,
    clearObstacles: clearObstaclesMock,
  }),
}));

vi.mock('@/features/jump-game/model/usePlayerSpriteAnimator', () => ({
  usePlayerSpriteAnimator: () => ({
    resetPlayerSpriteState: resetPlayerSpriteStateMock,
  }),
}));

vi.mock('@/features/jump-game/model/useJumpInputControls', () => ({
  useJumpInputControls: () => ({
    resetJumpInput: resetJumpInputMock,
  }),
}));

vi.mock('@/features/jump-game/model/useBossClearSequence', () => ({
  useBossClearSequence: ({ gameOverIcon }: { gameOverIcon: string | null }) =>
    createBossClearSequenceResult(gameOverIcon),
}));

vi.mock('@/features/jump-game/model/game-loop', () => ({
  useGameLoop: (params: Record<string, unknown>) => {
    latestGameLoopParams = params;
  },
}));

vi.mock('@/features/jump-game/model/game-scene/spawn', () => ({
  useObstacleSpawnScheduler: vi.fn(),
  useFishSpawnScheduler: vi.fn(),
}));

vi.mock('@/features/jump-game/model/game-scene/constants', () => ({
  createBossArmStyle: () => ({}),
  createBossStyle: () => ({}),
  createPlayerStyle: () => ({}),
  preloadSpriteAssets: vi.fn(),
  resetBossArmVisualState: vi.fn(),
  resetBossVisualState: vi.fn(),
  resetPlayerVisualState: vi.fn(),
}));

describe('useJumpGameScene sound effects', () => {
  const originalAudio = globalThis.Audio;

  beforeEach(() => {
    latestGameLoopParams = null;
    audioInstances.length = 0;
    globalThis.Audio = MockAudio as unknown as typeof Audio;
    resetJumpGameAudioForTesting();
  });

  afterEach(() => {
    globalThis.Audio = originalAudio;
    vi.clearAllMocks();
  });

  it('plays the fish sound when a fish is collected', () => {
    renderHook(() => useJumpGameScene({}));

    expect(latestGameLoopParams).not.toBeNull();
    expect(audioInstances).toHaveLength(0);

    act(() => {
      const onFishCollected = latestGameLoopParams?.onFishCollected as (() => void) | undefined;
      onFishCollected?.();
    });

    expect(audioInstances).toHaveLength(1);
    const fishSound = audioInstances.find((audio) => audio.src.endsWith('/fish.wav'));
    expect(fishSound?.play).toHaveBeenCalledTimes(1);
  });

  it('plays the end sound once when the run enters a non-clear game over', () => {
    const { rerender } = renderHook(() => useJumpGameScene({}));

    expect(latestGameLoopParams).not.toBeNull();

    act(() => {
      const setGameOverIcon = latestGameLoopParams?.setGameOverIcon as
        | ((icon: string | null) => void)
        | undefined;
      const setGameOver = latestGameLoopParams?.setGameOver as
        | ((value: boolean) => void)
        | undefined;
      setGameOverIcon?.('/assets/icons/fault.svg');
      setGameOver?.(true);
    });

    rerender();

    const endSound = audioInstances.find((audio) => audio.src.endsWith('/end.wav'));
    expect(endSound).toBeDefined();
    expect(endSound?.play).toHaveBeenCalledTimes(1);

    act(() => {
      const setGameOverIcon = latestGameLoopParams?.setGameOverIcon as
        | ((icon: string | null) => void)
        | undefined;
      setGameOverIcon?.('/assets/icons/fault-2.svg');
    });

    rerender();

    expect(endSound?.play).toHaveBeenCalledTimes(1);
  });

  it('does not play the end sound for clear results', () => {
    const { rerender } = renderHook(() => useJumpGameScene({}));

    expect(latestGameLoopParams).not.toBeNull();

    act(() => {
      const setGameOverIcon = latestGameLoopParams?.setGameOverIcon as
        | ((icon: string | null) => void)
        | undefined;
      const setGameOver = latestGameLoopParams?.setGameOver as
        | ((value: boolean) => void)
        | undefined;
      setGameOverIcon?.(BOSS_CLEAR_ICON);
      setGameOver?.(true);
    });

    rerender();

    const endSound = audioInstances.find((audio) => audio.src.endsWith('/end.wav'));
    expect(endSound).toBeUndefined();
  });
});
