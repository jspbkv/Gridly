export type AchievementMedal = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export type AchievementCategory = 'all' | 'lines' | 'combo' | 'zen' | 'score' | 'games';

export type AchievementIconName =
  | 'Grid'
  | 'Flame'
  | 'Clock'
  | 'Trophy'
  | 'Crown'
  | 'Zap'
  | 'Target'
  | 'Award'
  | 'Sparkles'
  | 'Layers'
  | 'Heart'
  | 'Gamepad2'
  | 'CalendarCheck'
  | 'CheckCircle2'
  | 'Medal';

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  medal: AchievementMedal;
  iconName: AchievementIconName;
  target: number;
  unit: string;
  badgeColor: string;
  formatProgress?: (current: number, target: number) => string;
}

export interface ComputedAchievement extends AchievementDef {
  currentValue: number;
  isUnlocked: boolean;
  unlockedAt?: number;
  progressPercent: number;
  progressText: string;
}
