// Shared asset paths used across jump-game model and UI.

// Player sprites.
export const PLAYER_RUN_SPRITES = [
  '/assets/icons/nyaomaru_game_graphic_game_nyaomaru_icon_run1.svg',
  '/assets/icons/nyaomaru_game_graphic_game_nyaomaru_icon_run2.svg',
] as const;
export const PLAYER_STAND_SPRITE = '/assets/icons/nyaomaru_game_graphic_game_nyaomaru_icon.svg';
export const PLAYER_JUMP_SPRITE = '/assets/icons/nyaomaru_game_graphic_game_nyaomaru_icon_jump.svg';

// Boss sprites and result overlays.
export const BOSS_BASE_SPRITES = [
  '/assets/icons/boss_base1.svg',
  '/assets/icons/boss_base2.svg',
] as const;
export const BOSS_ATTACK_SPRITES = [
  '/assets/icons/boss_attack1.svg',
  '/assets/icons/boss_attack2.svg',
  '/assets/icons/boss_attack3.svg',
  '/assets/icons/boss_attack4.svg',
  '/assets/icons/boss_attack5.svg',
  '/assets/icons/boss_attack6.svg',
  '/assets/icons/boss_attack7.svg',
  '/assets/icons/boss_attack8.svg',
  '/assets/icons/boss_attack9.svg',
  '/assets/icons/boss_attack10.svg',
  '/assets/icons/boss_attack11.svg',
  '/assets/icons/boss_attack12.svg',
  '/assets/icons/boss_attack13.svg',
  '/assets/icons/boss_attack14.svg',
  '/assets/icons/boss_attack15.svg',
  '/assets/icons/boss_attack16.svg',
  '/assets/icons/boss_attack17.svg',
  '/assets/icons/boss_attack18.svg',
  '/assets/icons/boss_attack19.svg',
  '/assets/icons/boss_attack20.svg',
] as const;
export const BOSS_GAME_OVER_ICON = '/assets/icons/nyaomaru_game_graphic_you_must_work_boss.svg';
export const BOSS_CLEAR_ICONS = [
  '/assets/icons/nyaomaru_game_graphic_happy1.svg',
  '/assets/icons/nyaomaru_game_graphic_happy2.svg',
] as const;
export const BOSS_CLEAR_ICON = BOSS_CLEAR_ICONS[0];

// Obstacle and fish assets.
export const OBSTACLE_ICON_SOURCES = [
  '/assets/icons/nyaomaru_game_graphic_game_object_short_desk.svg',
  '/assets/icons/nyaomaru_game_graphic_game_object_tall_desk.svg',
  '/assets/icons/nyaomaru_game_graphic_game_object_work1.svg',
  '/assets/icons/nyaomaru_game_graphic_game_object_work2.svg',
] as const;
export const OBSTACLE_GAME_OVER_ICON_SOURCES = [
  '/assets/icons/nyaomaru_game_graphic_you_must_work_short_desk.svg',
  '/assets/icons/nyaomaru_game_graphic_you_must_work_tall_desk.svg',
  '/assets/icons/nyaomaru_game_graphic_you_must_work_sweat1.svg',
  '/assets/icons/nyaomaru_game_graphic_you_must_work_sweat2.svg',
] as const;
export const FISH_ICON = '/assets/icons/nyaomaru_web_icon_sakana.svg';
export const FISH_COUNTER_ICON = FISH_ICON;

// Special clear sequence assets.
export const SPECIAL_ROCKET_ICON_1 = '/assets/icons/nyaomaru_game_graphic_rocket_icon1.svg';
export const SPECIAL_ROCKET_ICON_2 = '/assets/icons/nyaomaru_game_graphic_rocket_icon2.svg';
export const SPECIAL_ROCKET_ICON_3 = '/assets/icons/nyaomaru_game_graphic_rocket_icon3.svg';
export const SPECIAL_BYE_BYE_1 = '/assets/icons/nyaomaru_game_graphic_bye_bye_1.svg';
export const SPECIAL_BYE_BYE_ICON = '/assets/icons/nyaomaru_game_graphic_bye_bye_icon.svg';
export const SPECIAL_FIN_1 = '/assets/icons/nyaomaru_game_graphic_fin1.svg';
export const SPECIAL_FIN_2 = '/assets/icons/nyaomaru_game_graphic_fin2.svg';

// Scene preload asset sequence.
export const SCENE_PRELOAD_SPRITES = [
  ...PLAYER_RUN_SPRITES,
  PLAYER_STAND_SPRITE,
  PLAYER_JUMP_SPRITE,
  ...BOSS_BASE_SPRITES,
  ...BOSS_ATTACK_SPRITES,
  ...BOSS_CLEAR_ICONS,
  SPECIAL_ROCKET_ICON_1,
  SPECIAL_ROCKET_ICON_2,
  SPECIAL_ROCKET_ICON_3,
  SPECIAL_BYE_BYE_1,
  SPECIAL_BYE_BYE_ICON,
  SPECIAL_FIN_1,
  SPECIAL_FIN_2,
] as const;
