import { GameModeId } from './gameMode';

export interface ModeStats {
  gamesPlayed: number;
  bestScore: number;
  totalScore: number;
  averageScore: number;
  linesCleared: number;
  maxCombo: number;
  wins?: number;
  playTimeSeconds?: number;
}

export interface ScoreHistoryPoint {
  id: string;
  timestamp: number;
  score: number;
  mode: GameModeId;
  lines: number;
  dateStr: string;
  isRecord?: boolean;
}

export interface PlayerProfile {
  name: string;
  avatarIcon: string;
  firstPlayedDate: string;
  firstPlayedTimestamp: number;
  totalGamesPlayed: number;
  totalLinesCleared: number;
  overallMaxCombo: number;
  overallBestScore: number;
  favoriteMode: GameModeId;
  modeStats: Record<GameModeId, ModeStats>;
  recentScores: ScoreHistoryPoint[];
  challengeWins: number;
  zenPlayTimeSeconds?: number;
  totalPlayTimeSeconds?: number;
  maxLinesSingleMove?: number;
  unlockedAchievements?: Record<string, number>;
}
