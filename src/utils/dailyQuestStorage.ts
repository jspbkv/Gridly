import { GameModeId } from '../types/gameMode';
import { DailyQuest, DailyQuestsState } from '../types/dailyQuest';

const STORAGE_KEY = 'gridly_daily_quests';

export function getTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTimeUntilMidnight(): {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
} {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0); // Next midnight (00:00)
  const diffMs = Math.max(0, midnight.getTime() - now.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
    2,
    '0'
  )}:${String(seconds).padStart(2, '0')}`;

  return { hours, minutes, seconds, formatted };
}

// Simple deterministic hash based on date string
function hashDateKey(dateKey: string, salt: number = 0): number {
  let hash = salt;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash << 5) - hash + dateKey.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

interface QuestTemplate {
  type: DailyQuest['type'];
  title: string;
  description: string;
  iconName: DailyQuest['iconName'];
  targetValue: number;
  targetMode?: GameModeId;
  accentColor: string;
}

// Category 1: Lines clearing & precision clears
const POOL_LINES: QuestTemplate[] = [
  {
    type: 'clear_lines',
    title: 'Очистить 20 линий',
    description: 'Очистите 20 рядов или столбцов за сегодня в любых режимах',
    iconName: 'Layers',
    targetValue: 20,
    accentColor: '#10b981', // emerald
  },
  {
    type: 'clear_lines',
    title: 'Очистить 30 линий',
    description: 'Очистите 30 линий за день в любых партиях',
    iconName: 'Layers',
    targetValue: 30,
    accentColor: '#14b8a6', // teal
  },
  {
    type: 'clear_multi_lines',
    title: 'Очистить 5 линий одним блоком',
    description: 'Очистите 5 линий одновременно одной удачной установкой',
    iconName: 'Zap',
    targetValue: 5,
    accentColor: '#f59e0b', // amber
  },
  {
    type: 'clear_multi_lines',
    title: 'Очистить 3 линии одним блоком',
    description: 'Очистите 3 линии одновременно за один ход',
    iconName: 'Zap',
    targetValue: 3,
    accentColor: '#f97316', // orange
  },
];

// Category 2: Scores & combos
const POOL_SCORE_COMBO: QuestTemplate[] = [
  {
    type: 'score_classic',
    title: 'Набрать 1500 очков в классике',
    description: 'Наберите не менее 1 500 очков в классическом режиме за партию',
    iconName: 'Trophy',
    targetValue: 1500,
    targetMode: 'classic',
    accentColor: '#f59e0b', // amber
  },
  {
    type: 'make_combo',
    title: 'Сделать комбо x3',
    description: 'Сделайте серию комбо x3 или очистите 3 линии за раз',
    iconName: 'Flame',
    targetValue: 3,
    accentColor: '#f97316', // orange
  },
  {
    type: 'make_combo',
    title: 'Сделать комбо x4',
    description: 'Проявите мастерство и достигните комбо x4',
    iconName: 'Flame',
    targetValue: 4,
    accentColor: '#ec4899', // rose / pink
  },
  {
    type: 'score_any',
    title: 'Набрать 1800 очков',
    description: 'Наберите 1 800 очков за одну партию в любом режиме',
    iconName: 'Award',
    targetValue: 1800,
    accentColor: '#8b5cf6', // purple
  },
];

// Category 3: Activity & game modes
const POOL_ACTIVITY: QuestTemplate[] = [
  {
    type: 'play_games',
    title: 'Сыграть 3 игры',
    description: 'Сыграйте 3 партии в любых режимах игры за сегодня',
    iconName: 'Gamepad2',
    targetValue: 3,
    accentColor: '#8b5cf6', // purple
  },
  {
    type: 'place_blocks',
    title: 'Разместить 35 фигур',
    description: 'Успешно разместите 35 блоков на поле',
    iconName: 'Grid',
    targetValue: 35,
    accentColor: '#10b981', // emerald
  },
  {
    type: 'play_mode',
    title: 'Сыграть в режиме «На время»',
    description: 'Завершите 1 партию в динамичном режиме «На время»',
    iconName: 'Clock',
    targetValue: 1,
    targetMode: 'time_attack',
    accentColor: '#f59e0b', // amber
  },
  {
    type: 'play_mode',
    title: 'Сыграть в режиме «Дзен»',
    description: 'Сыграйте партию в медитативном режиме «Дзен»',
    iconName: 'Sparkles',
    targetValue: 1,
    targetMode: 'zen',
    accentColor: '#14b8a6', // teal
  },
];

export function generateDailyQuests(dateKey: string): DailyQuest[] {
  const h1 = hashDateKey(dateKey, 11);
  const h2 = hashDateKey(dateKey, 47);
  const h3 = hashDateKey(dateKey, 89);

  const t1 = POOL_LINES[h1 % POOL_LINES.length];
  const t2 = POOL_SCORE_COMBO[h2 % POOL_SCORE_COMBO.length];
  const t3 = POOL_ACTIVITY[h3 % POOL_ACTIVITY.length];

  return [
    {
      id: `daily_${dateKey}_${t1.type}_${t1.targetValue}`,
      ...t1,
      currentValue: 0,
      isCompleted: false,
    },
    {
      id: `daily_${dateKey}_${t2.type}_${t2.targetValue}`,
      ...t2,
      currentValue: 0,
      isCompleted: false,
    },
    {
      id: `daily_${dateKey}_${t3.type}_${t3.targetValue}`,
      ...t3,
      currentValue: 0,
      isCompleted: false,
    },
  ];
}

export function loadDailyQuests(): DailyQuestsState {
  const todayKey = getTodayDateKey();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: DailyQuestsState = JSON.parse(raw);
      if (parsed.dateKey === todayKey && Array.isArray(parsed.quests) && parsed.quests.length === 3) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load daily quests:', e);
  }

  // Create fresh state for today
  const freshQuests = generateDailyQuests(todayKey);
  const newState: DailyQuestsState = {
    dateKey: todayKey,
    quests: freshQuests,
  };
  saveDailyQuests(newState);
  return newState;
}

export function saveDailyQuests(state: DailyQuestsState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save daily quests:', e);
  }
}

export type QuestProgressEvent =
  | {
      type: 'lines_cleared';
      lines: number;
      singlePlacementLines: number;
      comboMultiplier: number;
    }
  | {
      type: 'block_placed';
    }
  | {
      type: 'score_reached';
      mode: GameModeId;
      score: number;
    }
  | {
      type: 'combo_reached';
      combo: number;
    }
  | {
      type: 'game_finished';
      mode: GameModeId;
      score: number;
      lines: number;
      maxCombo: number;
    };

export function updateDailyQuestsProgress(
  currentState: DailyQuestsState,
  event: QuestProgressEvent
): {
  nextState: DailyQuestsState;
  newlyCompleted: DailyQuest[];
} {
  const todayKey = getTodayDateKey();
  // If the day changed, regenerate fresh state first
  let workingState = currentState;
  if (currentState.dateKey !== todayKey) {
    workingState = {
      dateKey: todayKey,
      quests: generateDailyQuests(todayKey),
    };
  }

  const newlyCompleted: DailyQuest[] = [];

  const updatedQuests = workingState.quests.map((quest) => {
    if (quest.isCompleted) return quest;

    let nextValue = quest.currentValue;

    switch (event.type) {
      case 'lines_cleared':
        if (quest.type === 'clear_lines') {
          nextValue = Math.min(quest.targetValue, quest.currentValue + event.lines);
        } else if (quest.type === 'clear_multi_lines') {
          if (event.singlePlacementLines >= quest.targetValue) {
            nextValue = quest.targetValue;
          } else {
            nextValue = Math.max(quest.currentValue, event.singlePlacementLines);
          }
        }
        break;

      case 'block_placed':
        if (quest.type === 'place_blocks') {
          nextValue = Math.min(quest.targetValue, quest.currentValue + 1);
        }
        break;

      case 'score_reached':
        if (quest.type === 'score_classic' && event.mode === 'classic') {
          nextValue = Math.min(quest.targetValue, Math.max(quest.currentValue, event.score));
        } else if (quest.type === 'score_any') {
          nextValue = Math.min(quest.targetValue, Math.max(quest.currentValue, event.score));
        }
        break;

      case 'combo_reached':
        if (quest.type === 'make_combo') {
          nextValue = Math.min(quest.targetValue, Math.max(quest.currentValue, event.combo));
        }
        break;

      case 'game_finished':
        if (quest.type === 'play_games') {
          nextValue = Math.min(quest.targetValue, quest.currentValue + 1);
        } else if (quest.type === 'play_mode' && quest.targetMode === event.mode) {
          nextValue = Math.min(quest.targetValue, quest.currentValue + 1);
        } else if (quest.type === 'score_classic' && event.mode === 'classic') {
          nextValue = Math.min(quest.targetValue, Math.max(quest.currentValue, event.score));
        } else if (quest.type === 'score_any') {
          nextValue = Math.min(quest.targetValue, Math.max(quest.currentValue, event.score));
        } else if (quest.type === 'make_combo') {
          nextValue = Math.min(quest.targetValue, Math.max(quest.currentValue, event.maxCombo));
        }
        break;
    }

    if (nextValue !== quest.currentValue) {
      const isNowCompleted = nextValue >= quest.targetValue;
      const updated: DailyQuest = {
        ...quest,
        currentValue: nextValue,
        isCompleted: isNowCompleted,
        completedAt: isNowCompleted ? Date.now() : quest.completedAt,
      };

      if (isNowCompleted && !quest.isCompleted) {
        newlyCompleted.push(updated);
      }
      return updated;
    }

    return quest;
  });

  const nextState: DailyQuestsState = {
    ...workingState,
    quests: updatedQuests,
  };

  saveDailyQuests(nextState);

  return { nextState, newlyCompleted };
}
