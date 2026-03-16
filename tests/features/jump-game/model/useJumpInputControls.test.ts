import { act, renderHook } from '@testing-library/react';
import { CLICK_INTERVAL } from '@/features/jump-game/model/config/gameplay';
import { useJumpInputControls } from '@/features/jump-game/model/useJumpInputControls';

describe('useJumpInputControls', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('removes pointerdown listener from the previous game element when ref object changes', () => {
    const oldElement = document.createElement('div');
    const newElement = document.createElement('div');

    const oldAddEventListenerSpy = vi.spyOn(oldElement, 'addEventListener');
    const oldRemoveEventListenerSpy = vi.spyOn(oldElement, 'removeEventListener');
    const newAddEventListenerSpy = vi.spyOn(newElement, 'addEventListener');

    const onJump = vi.fn();

    const { rerender } = renderHook(
      ({ gameRef }) =>
        useJumpInputControls({
          gameRef,
          onJump,
        }),
      {
        initialProps: {
          gameRef: {
            current: oldElement,
          } as React.RefObject<HTMLDivElement>,
        },
      },
    );

    const oldPointerDownHandler = oldAddEventListenerSpy.mock.calls.find(
      ([type]) => type === 'pointerdown',
    )?.[1] as EventListener;

    rerender({
      gameRef: {
        current: newElement,
      } as React.RefObject<HTMLDivElement>,
    });

    expect(oldRemoveEventListenerSpy).toHaveBeenCalledWith('pointerdown', oldPointerDownHandler);
    expect(newAddEventListenerSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function));

    act(() => {
      oldElement.dispatchEvent(new Event('pointerdown'));
      newElement.dispatchEvent(new Event('pointerdown'));
    });

    expect(onJump).toHaveBeenCalledTimes(1);
  });

  it('clears click throttle timeout on unmount to prevent post-unmount callback', () => {
    vi.useFakeTimers();

    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
    const gameElement = document.createElement('div');
    const onJump = vi.fn();

    const { unmount } = renderHook(() =>
      useJumpInputControls({
        gameRef: {
          current: gameElement,
        } as React.RefObject<HTMLDivElement>,
        onJump,
      }),
    );

    act(() => {
      gameElement.dispatchEvent(new Event('pointerdown'));
    });

    expect(onJump).toHaveBeenCalledTimes(1);

    unmount();

    act(() => {
      vi.advanceTimersByTime(CLICK_INTERVAL + 1);
    });

    expect(clearTimeoutSpy).toHaveBeenCalled();
    expect(onJump).toHaveBeenCalledTimes(1);
  });
});
