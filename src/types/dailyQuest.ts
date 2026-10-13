import { GameModeId } from './gameMode';

export type QuestType =
  | 'clear_lines'
  | 'score_classic'
  | 'make_combo'
  | 'play_games'
  | 'clear_multi_lines'
  | 'score_any'
  | 'place_blocks'
  | 'play_mode';

export interface DailyQuest {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  iconName: 'Layers' | 'Trophy' | 'Flame' | 'Gamepad2' | 'Zap' | 'Award' | 'Grid' | 'Clock' | 'Sparkles';
  targetValue: number;
  currentValue: number;
  isCompleted: boolean;
  completedAt?: number;
  targetMode?: GameModeId;
  accentColor: string;
}

export interface DailyQuestsState {
  dateKey: string; // 'YYYY-MM-DD'
  quests: DailyQuest[];
}
