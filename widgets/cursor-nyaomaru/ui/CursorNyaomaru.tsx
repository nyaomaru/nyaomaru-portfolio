import { useEffect, useRef } from 'react';

const SPEED_THRESHOLD = 0.5; // px/ms
const MIN_DISTANCE = 8;
const COOLDOWN_MS = 160;
const FLIPS_TO_TRIGGER = 7;
const FLIP_WINDOW_MS = 1400;
const ACTIVE_HOLD_MS = 320;
const BASE_SCALE = 1;
const MAX_SCALE = 5;
const BOOST_WINDOW_MS = 1400;
const BOOST_STEP = 1.0;
const SCALE_IN_FACTOR = 0.6;
const SCALE_OUT_FACTOR = 0.55;

export const CursorNyaomaru = () => {
  const iconRef = useRef<HTMLImageElement>(null);
  const lastRef = useRef({ x: 0, y: 0, t: 0 });
  const lastDirRef = useRef<{ axis: 'x' | 'y'; sign: 1 | -1 } | null>(null);
  const flipCountRef = useRef(0);
  const lastFlipTimeRef = useRef(0);
  const lastTriggerRef = useRef(0);
  const lastActivateRef = useRef(0);
  const boostRef = useRef(0);
  const activeRef = useRef(false);
  const scaleRef = useRef(BASE_SCALE);
  const hideTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isPc = window.matchMedia('(pointer: fine)').matches;
    if (!isPc) return;

    const icon = iconRef.current;
    if (!icon) return;

    const setPosition = (x: number, y: number, scale: number) => {
      icon.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
    };

    const scheduleHide = (x: number, y: number) => {
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
      }
      hideTimeoutRef.current = window.setTimeout(() => {
        activeRef.current = false;
        icon.style.opacity = '0';
        setPosition(x, y, scaleRef.current * SCALE_OUT_FACTOR);
      }, ACTIVE_HOLD_MS);
    };

    const activate = (x: number, y: number) => {
      const now = performance.now();
      if (now - lastTriggerRef.current < COOLDOWN_MS) return;
      lastTriggerRef.current = now;
      flipCountRef.current = 0;
      activeRef.current = true;

      if (now - lastActivateRef.current <= BOOST_WINDOW_MS) {
        boostRef.current += 1;
      } else {
        boostRef.current = 0;
      }
      lastActivateRef.current = now;

      const targetScale = Math.min(MAX_SCALE, BASE_SCALE + boostRef.current * BOOST_STEP);
      scaleRef.current = targetScale;

      icon.style.opacity = '1';
      setPosition(x, y, targetScale * SCALE_IN_FACTOR);
      requestAnimationFrame(() => {
        setPosition(x, y, targetScale);
      });
      scheduleHide(x, y);
    };

    const onMove = (event: PointerEvent) => {
      const now = performance.now();
      const { x: lastX, y: lastY, t: lastT } = lastRef.current;
      lastRef.current = { x: event.clientX, y: event.clientY, t: now };

      if (activeRef.current) {
        setPosition(event.clientX, event.clientY, scaleRef.current);
        scheduleHide(event.clientX, event.clientY);
      }

      if (!lastT) return;

      const dt = Math.max(16, now - lastT);
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      const distance = Math.hypot(dx, dy);
      const speed = distance / dt;
      if (distance < MIN_DISTANCE || speed < SPEED_THRESHOLD) return;

      const axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
      const sign = (axis === 'x' ? dx : dy) >= 0 ? 1 : -1;
      const lastDir = lastDirRef.current;
      const nowFlip = performance.now();

      if (lastDir && lastDir.axis === axis && lastDir.sign !== sign) {
        if (nowFlip - lastFlipTimeRef.current <= FLIP_WINDOW_MS) {
          flipCountRef.current += 1;
        } else {
          flipCountRef.current = 1;
        }
        lastFlipTimeRef.current = nowFlip;
      }

      if (nowFlip - lastFlipTimeRef.current > FLIP_WINDOW_MS) {
        flipCountRef.current = 0;
      }

      lastDirRef.current = { axis, sign };

      if (flipCountRef.current >= FLIPS_TO_TRIGGER) {
        activate(event.clientX, event.clientY);
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  return (
    <img
      ref={iconRef}
      src='/assets/nyaomaru_icon.svg'
      alt=''
      className='pointer-events-none fixed left-0 top-0 z-[70] opacity-0 transition-[opacity,transform] duration-200 ease-out will-change-transform'
      style={{
        width: '14rem',
        height: '14rem',
        transform: 'translate3d(-9999px, -9999px, 0)',
      }}
    />
  );
};
