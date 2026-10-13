import { PlayerProfile } from '../types/profile';
import {
  AchievementDef,
  AchievementMedal,
  AchievementCategory,
  ComputedAchievement,
} from '../types/achievement';

export interface MedalConfig {
  label: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  gradient: string;
  glow: string;
}

export const MEDAL_CONFIGS: Record<AchievementMedal, MedalConfig> = {
  bronze: {
    label: 'Бронза',
    badgeBg: '#fef3c7',
    badgeBorder: '#d97706',
    badgeText: '#92400e',
    gradient: 'from-amber-600 to-amber-800',
    glow: 'rgba(217, 119, 6, 0.35)',
  },
  silver: {
    label: 'Серебро',
    badgeBg: '#f1f5f9',
    badgeBorder: '#94a3b8',
    badgeText: '#475569',
    gradient: 'from-slate-400 to-slate-600',
    glow: 'rgba(148, 163, 184, 0.35)',
  },
  gold: {
    label: 'Золото',
    badgeBg: '#fef9c3',
    badgeBorder: '#f59e0b',
    badgeText: '#b45309',
    gradient: 'from-amber-400 to-yellow-500',
    glow: 'rgba(245, 158, 11, 0.45)',
  },
  platinum: {
    label: 'Платина',
    badgeBg: '#ecfdf5',
    badgeBorder: '#10b981',
    badgeText: '#047857',
    gradient: 'from-emerald-400 to-teal-600',
    glow: 'rgba(16, 185, 129, 0.4)',
  },
  diamond: {
    label: 'Алмаз',
    badgeBg: '#f5f3ff',
    badgeBorder: '#8b5cf6',
    badgeText: '#6d28d9',
    gradient: 'from-violet-500 to-purple-600',
    glow: 'rgba(139, 92, 246, 0.45)',
  },
};

export const ACHIEVEMENT_DEFINITIONS: AchievementDef[] = [
  // 1. Lines cleared milestones
  {
    id: 'lines_100',
    title: 'Первые 100 линий',
    description: 'Очистить суммарно 100 горизонтальных или вертикальных линий',
    category: 'lines',
    medal: 'silver',
    iconName: 'Grid',
    target: 100,
    unit: 'линий',
    badgeColor: '#10b981',
  },
  {
    id: 'lines_500',
    title: 'Мастер линий',
    description: 'Очистить 500 линий во всех режимах игры',
    category: 'lines',
    medal: 'gold',
    iconName: 'Layers',
    target: 500,
    unit: 'линий',
    badgeColor: '#059669',
  },
  {
    id: 'lines_1000',
    title: 'Повелитель сетки',
    description: 'Очистить 1000 линий за всё время',
    category: 'lines',
    medal: 'platinum',
    iconName: 'Sparkles',
    target: 1000,
    unit: 'линий',
    badgeColor: '#0d9488',
  },

  // 2. Combo milestones
  {
    id: 'combo_5',
    title: 'Мастер комбо (x5)',
    description: 'Сделать непрерывную серию комбо x5 в любой игре',
    category: 'combo',
    medal: 'gold',
    iconName: 'Flame',
    target: 5,
    unit: 'комбо',
    badgeColor: '#ea580c',
    formatProgress: (curr, target) => `x${curr} / x${target}`,
  },
  {
    id: 'combo_7',
    title: 'Легенда комбо (x7)',
    description: 'Совершить невероятную цепочку комбо x7 подряд',
    category: 'combo',
    medal: 'diamond',
    iconName: 'Zap',
    target: 7,
    unit: 'комбо',
    badgeColor: '#7c3aed',
    formatProgress: (curr, target) => `x${curr} / x${target}`,
  },

  // 3. Zen mode milestones
  {
    id: 'zen_1hour',
    title: 'Играл в дзен-режиме 1 час',
    description: 'Провести суммарно 1 час (60 мин) в спокойном дзен-режиме без спешки',
    category: 'zen',
    medal: 'gold',
    iconName: 'Heart',
    target: 3600, // 3600 seconds = 1 hour
    unit: 'мин',
    badgeColor: '#ec4899',
    formatProgress: (curr, target) => {
      const currMin = Math.floor(curr / 60);
      const targetMin = Math.floor(target / 60);
      return `${currMin} / ${targetMin} мин`;
    },
  },
  {
    id: 'zen_15min',
    title: 'Гармония дзена',
    description: 'Играть в расслабляющем дзен-режиме 15 минут',
    category: 'zen',
    medal: 'silver',
    iconName: 'Clock',
    target: 900, // 900 seconds = 15 minutes
    unit: 'мин',
    badgeColor: '#f43f5e',
    formatProgress: (curr, target) => {
      const currMin = Math.floor(curr / 60);
      const targetMin = Math.floor(target / 60);
      return `${currMin} / ${targetMin} мин`;
    },
  },

  // 4. Score milestones
  {
    id: 'score_1500',
    title: 'Первый рекорд',
    description: 'Набрать 1500 очков в одной игре',
    category: 'score',
    medal: 'bronze',
    iconName: 'Target',
    target: 1500,
    unit: 'очков',
    badgeColor: '#f59e0b',
  },
  {
    id: 'score_3000',
    title: 'Охотник за рекордами',
    description: 'Преодолеть планку в 3000 очков в любой игре',
    category: 'score',
    medal: 'silver',
    iconName: 'Trophy',
    target: 3000,
    unit: 'очков',
    badgeColor: '#d97706',
  },
  {
    id: 'score_5000',
    title: 'Гроссмейстер 5000',
    description: 'Набрать 5000+ очков в классическом режиме',
    category: 'score',
    medal: 'platinum',
    iconName: 'Crown',
    target: 5000,
    unit: 'очков',
    badgeColor: '#10b981',
  },

  // 5. Quad clear move
  {
    id: 'quad_clear',
    title: 'Квадро-очистка',
    description: 'Очистить 4 или более линий установкой одного блока',
    category: 'lines',
    medal: 'silver',
    iconName: 'Sparkles',
    target: 4,
    unit: 'линии за раз',
    badgeColor: '#06b6d4',
    formatProgress: (curr, target) => `${curr} / ${target} за ход`,
  },

  // 6. Time Attack milestone
  {
    id: 'time_attack_1000',
    title: 'Молниеносный',
    description: 'Набрать 1000 очков в динамичном режиме «На время»',
    category: 'score',
    medal: 'gold',
    iconName: 'Clock',
    target: 1000,
    unit: 'очков',
    badgeColor: '#f97316',
  },

  // 7. Challenge wins
  {
    id: 'challenge_wins_5',
    title: 'Триумфатор испытаний',
    description: 'Одержать 5 побед в режиме испытаний с препятствиями',
    category: 'games',
    medal: 'gold',
    iconName: 'Award',
    target: 5,
    unit: 'побед',
    badgeColor: '#8b5cf6',
  },

  // 8. Games played milestones
  {
    id: 'first_game',
    title: 'Первый шаг',
    description: 'Сыграть свою самую первую партию',
    category: 'games',
    medal: 'bronze',
    iconName: 'Gamepad2',
    target: 1,
    unit: 'игра',
    badgeColor: '#b45309',
  },
  {
    id: 'games_25',
    title: 'Завсегдатай',
    description: 'Сыграть 25 полноценных игр',
    category: 'games',
    medal: 'silver',
    iconName: 'Gamepad2',
    target: 25,
    unit: 'игр',
    badgeColor: '#64748b',
  },
  {
    id: 'games_50',
    title: 'Истинный ветеран',
    description: 'Сыграть 50 игр во всех игровых режимах',
    category: 'games',
    medal: 'diamond',
    iconName: 'Medal',
    target: 50,
    unit: 'игр',
    badgeColor: '#6366f1',
  },
];

export function getAchievementValue(
  def: AchievementDef,
  profile: PlayerProfile
): number {
  switch (def.id) {
    case 'lines_100':
    case 'lines_500':
    case 'lines_1000':
      return profile.totalLinesCleared || 0;

    case 'combo_5':
    case 'combo_7':
      return profile.overallMaxCombo || 0;

    case 'zen_1hour':
    case 'zen_15min':
      return profile.zenPlayTimeSeconds || profile.modeStats.zen.playTimeSeconds || 0;

    case 'score_1500':
    case 'score_3000':
      return profile.overallBestScore || 0;

    case 'score_5000':
      return profile.modeStats.classic.bestScore || 0;

    case 'quad_clear':
      return profile.maxLinesSingleMove || 0;

    case 'time_attack_1000':
      return profile.modeStats.time_attack.bestScore || 0;

    case 'challenge_wins_5':
      return profile.challengeWins || profile.modeStats.challenge.wins || 0;

    case 'first_game':
    case 'games_25':
    case 'games_50':
      return profile.totalGamesPlayed || 0;

    default:
      return 0;
  }
}

export function calculateAchievements(profile: PlayerProfile): ComputedAchievement[] {
  return ACHIEVEMENT_DEFINITIONS.map((def) => {
    const rawVal = getAchievementValue(def, profile);
    const previouslyUnlockedTimestamp = profile.unlockedAchievements?.[def.id];
    const isUnlocked = rawVal >= def.target || Boolean(previouslyUnlockedTimestamp);

    const clampedVal = Math.min(rawVal, def.target);
    const progressPercent = isUnlocked
      ? 100
      : Math.min(99, Math.round((clampedVal / def.target) * 100));

    const progressText = isUnlocked
      ? 'Открыто!'
      : def.formatProgress
      ? def.formatProgress(clampedVal, def.target)
      : `${clampedVal.toLocaleString()} / ${def.target.toLocaleString()} ${def.unit}`;

    return {
      ...def,
      currentValue: rawVal,
      isUnlocked,
      unlockedAt: previouslyUnlockedTimestamp,
      progressPercent,
      progressText,
    };
  });
}

export function findNewlyUnlockedAchievements(
  profile: PlayerProfile,
  computedList: ComputedAchievement[]
): ComputedAchievement[] {
  const previouslyUnlocked = profile.unlockedAchievements || {};
  return computedList.filter(
    (item) => item.isUnlocked && !previouslyUnlocked[item.id]
  );
}
