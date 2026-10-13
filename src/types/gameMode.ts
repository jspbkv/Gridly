export type GameModeId = 'classic' | 'time_attack' | 'zen' | 'challenge';

export interface GameModeConfig {
  id: GameModeId;
  title: string;
  badge: string;
  tagline: string;
  description: string;
  iconName: 'infinity' | 'timer' | 'sparkles' | 'target';
  accentColor: string;
  defaultTime?: number; // in seconds
  maxMoves?: number;
  targetScore?: number;
}

export const GAME_MODES: GameModeConfig[] = [
  {
    id: 'classic',
    title: 'Классический',
    badge: 'Бесконечный',
    tagline: 'Традиционный Block Blast',
    description: 'Обычная бесконечная игра. Размещайте блоки и очищайте ряды. Игра длится, пока на поле есть место.',
    iconName: 'infinity',
    accentColor: '#d97354',
  },
  {
    id: 'time_attack',
    title: 'На время',
    badge: '2 минуты',
    tagline: 'Быстрый блиц-раунд',
    description: 'У вас есть ровно 2 минуты. Заработайте как можно больше очков до того, как истечет таймер!',
    iconName: 'timer',
    accentColor: '#f59e0b',
    defaultTime: 120,
  },
  {
    id: 'zen',
    title: 'Дзен',
    badge: 'Без проигрыша',
    tagline: 'Медитация и релакс',
    description: 'Полный покой без стресса. Если ходы закончатся, поле мягко обновится. Играйте сколько угодно!',
    iconName: 'sparkles',
    accentColor: '#10b981',
  },
  {
    id: 'challenge',
    title: 'Вызов',
    badge: '30 ходов',
    tagline: 'Тактическая головоломка',
    description: 'Ограничение в 30 ходов. Ваша цель — набрать 1,500 очков до исчерпания ходов.',
    iconName: 'target',
    accentColor: '#ec4899',
    maxMoves: 30,
    targetScore: 1500,
  },
];
