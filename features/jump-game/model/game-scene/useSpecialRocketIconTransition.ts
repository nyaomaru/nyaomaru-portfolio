import { useEffect, useRef, useState } from 'react';
import { equals, isFunction } from 'is-kit';
import { SPECIAL_ROCKET_ICON_1, SPECIAL_ROCKET_ICON_2 } from '../config/assets';
import { ROCKET_ICON_CROSSFADE_MS } from '../config/timing';
const isRocketIcon1 = equals(SPECIAL_ROCKET_ICON_1);
const isRocketIcon2 = equals(SPECIAL_ROCKET_ICON_2);

/**
 * Rocket overlay crossfade state managed in the scene model.
 */
type UseSpecialRocketIconTransitionResult = {
  /** Currently displayed rocket icon source. */
  displayedSpecialRocketIconSrc: string | null;
  /** Previous rocket icon source kept temporarily for fade-out. */
  fadingSpecialRocketIconSrc: string | null;
};

/**
 * Keeps rocket icon transitions smooth by preloading next asset and crossfading frames.
 *
 * @param specialRocketIconSrc - Next rocket icon source requested by clear-sequence state.
 * @returns Crossfade-ready icon sources for rendering active and fading layers.
 */
export function useSpecialRocketIconTransition(
  specialRocketIconSrc: string | null,
): UseSpecialRocketIconTransitionResult {
  const [displayedSpecialRocketIconSrc, setDisplayedSpecialRocketIconSrc] = useState<string | null>(
    specialRocketIconSrc,
  );
  const [fadingSpecialRocketIconSrc, setFadingSpecialRocketIconSrc] = useState<string | null>(null);
  const rocketFadeTimerIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!specialRocketIconSrc) {
      if (rocketFadeTimerIdRef.current !== null) {
        clearTimeout(rocketFadeTimerIdRef.current);
        rocketFadeTimerIdRef.current = null;
      }
      setFadingSpecialRocketIconSrc(null);
      setDisplayedSpecialRocketIconSrc(null);
      return;
    }
    if (specialRocketIconSrc === displayedSpecialRocketIconSrc) return;

    let cancelled = false;
    const nextSrc = specialRocketIconSrc;
    const preloadImage = new Image();
    preloadImage.src = nextSrc;

    const applyNextIcon = () => {
      if (cancelled || displayedSpecialRocketIconSrc === nextSrc) {
        return;
      }

      const shouldSkipCrossfadeForIcon1To2 =
        isRocketIcon1(displayedSpecialRocketIconSrc) && isRocketIcon2(nextSrc);

      if (displayedSpecialRocketIconSrc && !shouldSkipCrossfadeForIcon1To2) {
        setFadingSpecialRocketIconSrc(displayedSpecialRocketIconSrc);
        if (rocketFadeTimerIdRef.current !== null) {
          clearTimeout(rocketFadeTimerIdRef.current);
        }
        rocketFadeTimerIdRef.current = window.setTimeout(() => {
          setFadingSpecialRocketIconSrc(null);
          rocketFadeTimerIdRef.current = null;
        }, ROCKET_ICON_CROSSFADE_MS);
      } else {
        setFadingSpecialRocketIconSrc(null);
        if (rocketFadeTimerIdRef.current !== null) {
          clearTimeout(rocketFadeTimerIdRef.current);
          rocketFadeTimerIdRef.current = null;
        }
      }

      setDisplayedSpecialRocketIconSrc(nextSrc);
    };

    if (preloadImage.complete) {
      applyNextIcon();
      return () => {
        cancelled = true;
      };
    }

    if (isFunction(preloadImage.decode)) {
      preloadImage
        .decode()
        .then(applyNextIcon)
        .catch(() => undefined);
    }

    preloadImage.onload = applyNextIcon;
    preloadImage.onerror = applyNextIcon;

    return () => {
      cancelled = true;
      preloadImage.onload = null;
      preloadImage.onerror = null;
    };
  }, [displayedSpecialRocketIconSrc, specialRocketIconSrc]);

  useEffect(() => {
    return () => {
      if (rocketFadeTimerIdRef.current !== null) {
        clearTimeout(rocketFadeTimerIdRef.current);
      }
    };
  }, []);

  return {
    displayedSpecialRocketIconSrc,
    fadingSpecialRocketIconSrc,
  };
}
