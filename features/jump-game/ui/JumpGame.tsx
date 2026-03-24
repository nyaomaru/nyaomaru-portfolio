import {
  useJumpGameScene,
  useSpecialRocketIconTransition,
  type JumpGameBindings,
} from '../model/game-scene';
import {
  BossLayer,
  FishCounterOverlay,
  GameOverOverlay,
  PlayerLayer,
  SpecialClearOverlay,
  SpecialFinOverlay,
  SpecialFlyoutOverlay,
} from './JumpGameLayers';

const FISH_COUNTER_BONE_ICON = '/assets/icons/nyaomaru_web_icon_sakana_bone.svg';
const GAME_AREA_CLASS_NAME =
  'relative w-full h-[min(24rem,62vh)] sm:h-auto sm:aspect-[67/20] overflow-hidden';
const ROOT_CLASS_NAME = 'relative';

/**
 * Primary jump-game scene component that binds model hooks to layered UI rendering.
 *
 * @param bindings - Bridge callbacks provided by the parent game page.
 * @param bindings.onGameOverChange - Receives game-over state changes.
 * @param bindings.onRegisterReset - Receives restart callback registration.
 * @param bindings.onGameMessageChange - Receives current game message updates.
 * @param bindings.onRestartReadyChange - Receives restart-ready availability after ending sequence.
 * @returns Rendered jump-game scene with overlays, player, and boss layers.
 */
export default function JumpGame({
  onGameOverChange,
  onRegisterReset,
  onGameMessageChange,
  onRestartReadyChange,
}: JumpGameBindings) {
  const {
    refs,
    fishCount,
    fishCounterIconSrc,
    shouldRenderBoss,
    shouldShowGameOverIcon,
    gameOverDisplayIcon,
    shouldShowSpecialClearOverlay,
    shouldAnimateRocketEntry,
    specialRocketIconSrc,
    specialRocketEntryDurationMs,
    shouldShowByeByeIcon,
    specialByeByeIconSrc,
    shouldShowSpecialFlyout,
    specialFlyoutOrigin,
    specialFlyoutDurationMs,
    specialFlyoutIconSrc,
    showSpecialFin,
    specialFinIconSrc,
    playerStyle,
    bossStyle,
    bossArmStyle,
  } = useJumpGameScene({
    onGameOverChange,
    onRegisterReset,
    onGameMessageChange,
    onRestartReadyChange,
  });

  const { displayedSpecialRocketIconSrc, fadingSpecialRocketIconSrc } =
    useSpecialRocketIconTransition(specialRocketIconSrc);
  const fishCounterDisplayIconSrc = showSpecialFin ? FISH_COUNTER_BONE_ICON : fishCounterIconSrc;

  return (
    <section className={ROOT_CLASS_NAME} aria-label='Jump game'>
      <section ref={refs.gameRef} className={GAME_AREA_CLASS_NAME} aria-label='Jump game scene'>
        <FishCounterOverlay fishCount={fishCount} fishCounterIconSrc={fishCounterDisplayIconSrc} />

        <GameOverOverlay
          shouldShowGameOverIcon={shouldShowGameOverIcon}
          gameOverDisplayIcon={gameOverDisplayIcon}
        />

        <SpecialClearOverlay
          shouldShowSpecialClearOverlay={shouldShowSpecialClearOverlay}
          shouldAnimateRocketEntry={shouldAnimateRocketEntry}
          fadingSpecialRocketIconSrc={fadingSpecialRocketIconSrc}
          displayedSpecialRocketIconSrc={displayedSpecialRocketIconSrc}
          specialRocketEntryDurationMs={specialRocketEntryDurationMs}
          shouldShowByeByeIcon={shouldShowByeByeIcon}
          specialByeByeIconSrc={specialByeByeIconSrc}
        />

        <SpecialFlyoutOverlay
          shouldShowSpecialFlyout={shouldShowSpecialFlyout}
          specialFlyoutOrigin={specialFlyoutOrigin}
          specialFlyoutDurationMs={specialFlyoutDurationMs}
          specialFlyoutIconSrc={specialFlyoutIconSrc}
        />

        <SpecialFinOverlay showSpecialFin={showSpecialFin} specialFinIconSrc={specialFinIconSrc} />

        <PlayerLayer
          playerRef={refs.playerRef}
          playerSpriteRef={refs.playerSpriteRef}
          playerStyle={playerStyle}
        />

        <BossLayer
          shouldRenderBoss={shouldRenderBoss}
          bossRef={refs.bossRef}
          bossSpriteRef={refs.bossSpriteRef}
          bossArmRef={refs.bossArmRef}
          bossStyle={bossStyle}
          bossArmStyle={bossArmStyle}
        />
      </section>
    </section>
  );
}
