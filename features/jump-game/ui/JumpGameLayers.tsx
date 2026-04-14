import { equals, oneOf } from 'is-kit';
import type { CSSProperties, RefObject } from 'react';
import {
  BOSS_BASE_SPRITES,
  OBSTACLE_GAME_OVER_ICON_SOURCES,
  PLAYER_RUN_SPRITES,
  SPECIAL_BYE_BYE_1,
  SPECIAL_ROCKET_ICON_1,
  SPECIAL_ROCKET_ICON_2,
} from '../model/config/assets';
import {
  BOSS_ARM_CLASS_NAME,
  BOSS_BASE_CLASS_NAME,
  FISH_COUNTER_CLASS_NAME,
  FISH_COUNTER_ICON_CLASS_NAME,
  FLYOUT_DURATION_CSS_VAR,
  FLYOUT_ORIGIN_X_CSS_VAR,
  FLYOUT_ORIGIN_Y_CSS_VAR,
  GAME_OVER_ICON_DEFAULT_CLASS_NAME,
  GAME_OVER_ICON_TALL_DESK_CLASS_NAME,
  GAME_OVER_OVERLAY_CLASS_NAME,
  ROCKET_ENTRY_DURATION_CSS_VAR,
  SPECIAL_CLEAR_OVERLAY_CLASS_NAME,
  SPECIAL_FIN_IMAGE_CLASS_NAME,
  SPECIAL_FIN_OVERLAY_CLASS_NAME,
  SPECIAL_FLYOUT_ITEM_BASE_CLASS_NAME,
  SPECIAL_FLYOUT_SCREEN_CLASS_NAME,
  TALL_DESK_GAME_OVER_ICON_INDEX,
} from './jump-game-layers.constants';
import styles from './JumpGame.module.css';

const SPECIAL_BYE_IMAGE_CLASS_NAME = `absolute left-1/2 top-1/2 object-contain ${styles.rocketScaleUpByeBye1} ${styles.byeByeOverlayIcon}`;
const SPECIAL_FLYOUT_ITEM_CLASS_NAME = `${SPECIAL_FLYOUT_ITEM_BASE_CLASS_NAME} ${styles.flyoutMotion}`;
const PLAYER_WRAP_CLASS_NAME = `absolute bottom-0 aspect-square ${styles.player}`;

const isRocketIcon1 = equals(SPECIAL_ROCKET_ICON_1);
const isRocketIcon2 = equals(SPECIAL_ROCKET_ICON_2);
const isGroundedRocketIcon = oneOf(isRocketIcon1, isRocketIcon2);
const isByeBye1Icon = equals(SPECIAL_BYE_BYE_1);
const isTallDeskGameOverIcon = equals(
  OBSTACLE_GAME_OVER_ICON_SOURCES[TALL_DESK_GAME_OVER_ICON_INDEX],
);

type FlyoutCSSVariables = {
  /** CSS custom property holding flyout animation duration in ms (e.g. `4000ms`). */
  [FLYOUT_DURATION_CSS_VAR]: string;
  /** CSS custom property holding flyout start X position in viewport pixels. */
  [FLYOUT_ORIGIN_X_CSS_VAR]: string;
  /** CSS custom property holding flyout start Y position in viewport pixels. */
  [FLYOUT_ORIGIN_Y_CSS_VAR]: string;
};

type RocketEntryCSSVariables = {
  /** CSS custom property controlling rocket entry animation duration in ms. */
  [ROCKET_ENTRY_DURATION_CSS_VAR]: string;
};

type FlyoutOrigin = {
  /** Flyout launch X coordinate in viewport pixels. */
  x: number;
  /** Flyout launch Y coordinate in viewport pixels. */
  y: number;
};

type FishCounterOverlayProps = {
  /** Current number of collected fish shown in the HUD. */
  fishCount: number;
  /** Icon source rendered next to the fish counter value. */
  fishCounterIconSrc: string;
};

type GameOverOverlayProps = {
  /** Whether the game-over/clear image layer should be visible. */
  shouldShowGameOverIcon: boolean;
  /** Final icon source to render when game-over/clear is active. */
  gameOverDisplayIcon: string | null;
};

type SpecialClearOverlayProps = {
  /** Whether the special clear overlay layer is active. */
  shouldShowSpecialClearOverlay: boolean;
  /** Whether the current rocket icon should animate entering from the right edge. */
  shouldAnimateRocketEntry: boolean;
  /** Optional icon source fading out from the previous special phase. */
  fadingSpecialRocketIconSrc: string | null;
  /** Current icon source shown for the active special phase. */
  displayedSpecialRocketIconSrc: string | null;
  /** Rocket entry animation duration in milliseconds. */
  specialRocketEntryDurationMs: number;
  /** Whether the bye-bye icon should be shown on top of the rocket overlay. */
  shouldShowByeByeIcon: boolean;
  /** Icon source for the bye-bye overlay image. */
  specialByeByeIconSrc: string;
};

type SpecialFlyoutOverlayProps = {
  /** Whether the full-screen flyout layer should be rendered. */
  shouldShowSpecialFlyout: boolean;
  /** Flyout launch origin captured from the current viewport. */
  specialFlyoutOrigin: FlyoutOrigin | null;
  /** Flyout animation duration in milliseconds. */
  specialFlyoutDurationMs: number;
  /** Icon source rendered during the flyout sequence. */
  specialFlyoutIconSrc: string;
};

type SpecialFinOverlayProps = {
  /** Whether the FIN overlay should be displayed. */
  showSpecialFin: boolean;
  /** Icon source for the FIN frame currently displayed. */
  specialFinIconSrc: string;
};

type BossLayerProps = {
  /** Whether boss base/arm nodes should be rendered. */
  shouldRenderBoss: boolean;
  /** Boss base container reference driven by game-loop transforms. */
  bossRef: RefObject<HTMLDivElement | null>;
  /** Boss sprite image reference whose `src` is swapped during animation. */
  bossSpriteRef: RefObject<HTMLImageElement | null>;
  /** Boss arm hitbox/pose element reference. */
  bossArmRef: RefObject<HTMLDivElement | null>;
  /** Static baseline style for boss container sizing/placement. */
  bossStyle: CSSProperties;
  /** Static baseline style for boss arm element. */
  bossArmStyle: CSSProperties;
};

type PlayerLayerProps = {
  /** Player container reference driven by jump/game-loop transforms. */
  playerRef: RefObject<HTMLDivElement | null>;
  /** Player sprite image reference whose `src` is swapped during animation. */
  playerSpriteRef: RefObject<HTMLImageElement | null>;
  /** Static baseline style for player container sizing/placement. */
  playerStyle: CSSProperties;
};

const getSpecialRocketClassName = (
  iconSrc: string | null,
  transitionClass?: string,
  motionClass?: string,
) => {
  const shouldGroundRocketIcon = isGroundedRocketIcon(iconSrc);
  const isByeBye1 = isByeBye1Icon(iconSrc);

  return [
    styles.rocketBase,
    shouldGroundRocketIcon
      ? styles.rocketScaleDown
      : isByeBye1
        ? styles.rocketScaleByeBye1Main
        : styles.rocketDefaultScale,
    shouldGroundRocketIcon
      ? styles.rocketGrounded
      : isByeBye1
        ? styles.rocketGrounded
        : styles.rocketCentered,
    transitionClass,
    motionClass,
  ]
    .filter(Boolean)
    .join(' ');
};

export const FishCounterOverlay = ({ fishCount, fishCounterIconSrc }: FishCounterOverlayProps) => (
  <output className={FISH_COUNTER_CLASS_NAME} aria-live='polite' aria-label='Fish count'>
    <img src={fishCounterIconSrc} alt='' className={FISH_COUNTER_ICON_CLASS_NAME} aria-hidden />
    <span aria-hidden>×</span>
    <span className='tabular-nums'>{fishCount}</span>
  </output>
);

export const GameOverOverlay = ({
  shouldShowGameOverIcon,
  gameOverDisplayIcon,
}: GameOverOverlayProps) => {
  if (!shouldShowGameOverIcon || !gameOverDisplayIcon) {
    return null;
  }
  const shouldAdjustTallDeskMobile = isTallDeskGameOverIcon(gameOverDisplayIcon);
  const gameOverIconClassName = shouldAdjustTallDeskMobile
    ? GAME_OVER_ICON_TALL_DESK_CLASS_NAME
    : GAME_OVER_ICON_DEFAULT_CLASS_NAME;

  return (
    <div className={GAME_OVER_OVERLAY_CLASS_NAME}>
      <img
        src={gameOverDisplayIcon}
        alt='game over'
        className={gameOverIconClassName}
        aria-hidden
      />
    </div>
  );
};

export const SpecialClearOverlay = ({
  shouldShowSpecialClearOverlay,
  shouldAnimateRocketEntry,
  fadingSpecialRocketIconSrc,
  displayedSpecialRocketIconSrc,
  specialRocketEntryDurationMs,
  shouldShowByeByeIcon,
  specialByeByeIconSrc,
}: SpecialClearOverlayProps) => {
  if (!shouldShowSpecialClearOverlay) {
    return null;
  }

  const displayedRocketClassName = getSpecialRocketClassName(
    displayedSpecialRocketIconSrc,
    fadingSpecialRocketIconSrc ? styles.rocketFadeIn : undefined,
    shouldAnimateRocketEntry ? styles.rocketEnterFromRight : undefined,
  );
  const fadingRocketClassName = getSpecialRocketClassName(
    fadingSpecialRocketIconSrc,
    styles.rocketFadeOut,
  );
  const rocketEntryStyle = shouldAnimateRocketEntry
    ? ({
        [ROCKET_ENTRY_DURATION_CSS_VAR]: `${specialRocketEntryDurationMs}ms`,
      } as CSSProperties & RocketEntryCSSVariables)
    : undefined;

  return (
    <div className={SPECIAL_CLEAR_OVERLAY_CLASS_NAME} style={rocketEntryStyle}>
      {fadingSpecialRocketIconSrc && (
        <img
          src={fadingSpecialRocketIconSrc}
          alt='fading rocket'
          className={fadingRocketClassName}
          aria-hidden
        />
      )}
      {displayedSpecialRocketIconSrc && (
        <img
          src={displayedSpecialRocketIconSrc}
          alt='displayed rocket'
          className={displayedRocketClassName}
          aria-hidden
        />
      )}
      {shouldShowByeByeIcon && (
        <img
          src={specialByeByeIconSrc}
          alt='bye bye'
          className={SPECIAL_BYE_IMAGE_CLASS_NAME}
          aria-hidden
        />
      )}
    </div>
  );
};

export const SpecialFlyoutOverlay = ({
  shouldShowSpecialFlyout,
  specialFlyoutOrigin,
  specialFlyoutDurationMs,
  specialFlyoutIconSrc,
}: SpecialFlyoutOverlayProps) => {
  if (!shouldShowSpecialFlyout || !specialFlyoutOrigin) {
    return null;
  }

  return (
    <div className={SPECIAL_FLYOUT_SCREEN_CLASS_NAME}>
      <div
        className={SPECIAL_FLYOUT_ITEM_CLASS_NAME}
        style={
          {
            [FLYOUT_ORIGIN_X_CSS_VAR]: `${specialFlyoutOrigin.x}px`,
            [FLYOUT_ORIGIN_Y_CSS_VAR]: `${specialFlyoutOrigin.y}px`,
            [FLYOUT_DURATION_CSS_VAR]: `${specialFlyoutDurationMs}ms`,
          } as CSSProperties & FlyoutCSSVariables
        }
      >
        <div className={styles.flyoutOrient}>
          <img
            src={specialFlyoutIconSrc}
            alt='special flyout'
            className='w-full h-auto object-contain'
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
};

export const SpecialFinOverlay = ({
  showSpecialFin,
  specialFinIconSrc,
}: SpecialFinOverlayProps) => {
  if (!showSpecialFin) {
    return null;
  }

  return (
    <div className={SPECIAL_FIN_OVERLAY_CLASS_NAME}>
      <img
        src={specialFinIconSrc}
        alt='special fin'
        className={SPECIAL_FIN_IMAGE_CLASS_NAME}
        aria-hidden
      />
    </div>
  );
};

export const PlayerLayer = ({ playerRef, playerSpriteRef, playerStyle }: PlayerLayerProps) => (
  <div ref={playerRef} className={PLAYER_WRAP_CLASS_NAME} style={playerStyle} aria-hidden>
    <img
      ref={playerSpriteRef}
      src={PLAYER_RUN_SPRITES[0]}
      alt='player'
      className={styles.playerSprite}
      draggable={false}
      aria-hidden
    />
  </div>
);

export const BossLayer = ({
  shouldRenderBoss,
  bossRef,
  bossSpriteRef,
  bossArmRef,
  bossStyle,
  bossArmStyle,
}: BossLayerProps) => {
  if (!shouldRenderBoss) {
    return null;
  }

  return (
    <>
      <div ref={bossRef} className={BOSS_BASE_CLASS_NAME} style={bossStyle} aria-hidden>
        <img
          ref={bossSpriteRef}
          src={BOSS_BASE_SPRITES[0]}
          alt='boss'
          className={styles.bossSprite}
          draggable={false}
          aria-hidden
        />
      </div>
      <div ref={bossArmRef} className={BOSS_ARM_CLASS_NAME} style={bossArmStyle} aria-hidden />
    </>
  );
};
