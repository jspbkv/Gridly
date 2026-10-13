import { GameModeId, GAME_MODES } from '../types/gameMode';
import { PlayerProfile, ScoreHistoryPoint } from '../types/profile';

const STORAGE_KEY = 'gridly_player_profile';

export function formatRussianDate(timestamp: number): string {
  try {
    const d = new Date(timestamp);
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return 'Сегодня';
  }
}

export function formatShortDate(timestamp: number): string {
  try {
    const d = new Date(timestamp);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}.${month}`;
  } catch {
    return '01.01';
  }
}

export function getDefaultProfile(): PlayerProfile {
  const now = Date.now();
  const classicBest = parseInt(
    localStorage.getItem('bb_best_classic') ||
      localStorage.getItem('bb_best_score') ||
      '0',
    10
  );
  const timeAttackBest = parseInt(localStorage.getItem('bb_best_time_attack') || '0', 10);
  const zenBest = parseInt(localStorage.getItem('bb_best_zen') || '0', 10);
  const challengeBest = parseInt(localStorage.getItem('bb_best_challenge') || '0', 10);

  const initialMax = Math.max(classicBest, timeAttackBest, zenBest, challengeBest);

  return {
    name: 'Игрок',
    avatarIcon: 'fox',
    firstPlayedDate: formatRussianDate(now),
    firstPlayedTimestamp: now,
    totalGamesPlayed: classicBest > 0 ? 1 : 0,
    totalLinesCleared: 0,
    overallMaxCombo: 0,
    overallBestScore: initialMax,
    favoriteMode: 'classic',
    challengeWins: 0,
    zenPlayTimeSeconds: 0,
    totalPlayTimeSeconds: 0,
    maxLinesSingleMove: 0,
    unlockedAchievements: {},
    modeStats: {
      classic: {
        gamesPlayed: classicBest > 0 ? 1 : 0,
        bestScore: classicBest,
        totalScore: classicBest,
        averageScore: classicBest,
        linesCleared: 0,
        maxCombo: 0,
        playTimeSeconds: 0,
      },
      time_attack: {
        gamesPlayed: timeAttackBest > 0 ? 1 : 0,
        bestScore: timeAttackBest,
        totalScore: timeAttackBest,
        averageScore: timeAttackBest,
        linesCleared: 0,
        maxCombo: 0,
        playTimeSeconds: 0,
      },
      zen: {
        gamesPlayed: zenBest > 0 ? 1 : 0,
        bestScore: zenBest,
        totalScore: zenBest,
        averageScore: zenBest,
        linesCleared: 0,
        maxCombo: 0,
        playTimeSeconds: 0,
      },
      challenge: {
        gamesPlayed: challengeBest > 0 ? 1 : 0,
        bestScore: challengeBest,
        totalScore: challengeBest,
        averageScore: challengeBest,
        linesCleared: 0,
        maxCombo: 0,
        wins: 0,
        playTimeSeconds: 0,
      },
    },
    recentScores:
      initialMax > 0
        ? [
            {
              id: `rec-seed-${now}`,
              timestamp: now,
              score: initialMax,
              mode: 'classic',
              lines: 4,
              dateStr: formatShortDate(now),
              isRecord: true,
            },
          ]
        : [],
  };
}

export function loadProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaultProf = getDefaultProfile();
      saveProfile(defaultProf);
      return defaultProf;
    }
    const parsed = JSON.parse(raw) as Partial<PlayerProfile>;

    // Ensure all required fields exist
    const defaultProf = getDefaultProfile();
    const merged: PlayerProfile = {
      ...defaultProf,
      ...parsed,
      zenPlayTimeSeconds: parsed.zenPlayTimeSeconds || 0,
      totalPlayTimeSeconds: parsed.totalPlayTimeSeconds || 0,
      maxLinesSingleMove: parsed.maxLinesSingleMove || 0,
      unlockedAchievements: parsed.unlockedAchievements || {},
      modeStats: {
        classic: { ...defaultProf.modeStats.classic, ...(parsed.modeStats?.classic || {}) },
        time_attack: {
          ...defaultProf.modeStats.time_attack,
          ...(parsed.modeStats?.time_attack || {}),
        },
        zen: { ...defaultProf.modeStats.zen, ...(parsed.modeStats?.zen || {}) },
        challenge: {
          ...defaultProf.modeStats.challenge,
          ...(parsed.modeStats?.challenge || {}),
        },
      },
      recentScores: parsed.recentScores || [],
    };
    return merged;
  } catch {
    return getDefaultProfile();
  }
}

export function saveProfile(profile: PlayerProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile to localStorage', e);
  }
}

export function recordGameSession(
  prevProfile: PlayerProfile,
  params: {
    score: number;
    lines: number;
    maxCombo: number;
    mode: GameModeId;
    isVictory?: boolean;
  }
): PlayerProfile {
  const { score, lines, maxCombo, mode, isVictory = false } = params;
  const now = Date.now();

  const currentModeStat = prevProfile.modeStats[mode] || {
    gamesPlayed: 0,
    bestScore: 0,
    totalScore: 0,
    averageScore: 0,
    linesCleared: 0,
    maxCombo: 0,
    wins: 0,
  };

  const newGamesPlayed = currentModeStat.gamesPlayed + 1;
  const newBestScore = Math.max(currentModeStat.bestScore, score);
  const newTotalScore = currentModeStat.totalScore + score;
  const newAvgScore = Math.round(newTotalScore / newGamesPlayed);
  const newLinesCleared = currentModeStat.linesCleared + lines;
  const newMaxCombo = Math.max(currentModeStat.maxCombo, maxCombo);
  const newWins = (currentModeStat.wins || 0) + (isVictory && mode === 'challenge' ? 1 : 0);

  const updatedModeStats = {
    ...prevProfile.modeStats,
    [mode]: {
      ...currentModeStat,
      gamesPlayed: newGamesPlayed,
      bestScore: newBestScore,
      totalScore: newTotalScore,
      averageScore: newAvgScore,
      linesCleared: newLinesCleared,
      maxCombo: newMaxCombo,
      wins: newWins,
    },
  };

  // Determine favorite mode (mode with the highest played count)
  let favoriteMode: GameModeId = 'classic';
  let maxPlayed = -1;
  (Object.keys(updatedModeStats) as GameModeId[]).forEach((m) => {
    if (updatedModeStats[m].gamesPlayed > maxPlayed) {
      maxPlayed = updatedModeStats[m].gamesPlayed;
      favoriteMode = m;
    }
  });

  const overallMaxCombo = Math.max(prevProfile.overallMaxCombo, maxCombo);
  const overallBestScore = Math.max(prevProfile.overallBestScore, score);
  const totalGamesPlayed = prevProfile.totalGamesPlayed + 1;
  const totalLinesCleared = prevProfile.totalLinesCleared + lines;
  const challengeWins = prevProfile.challengeWins + (isVictory && mode === 'challenge' ? 1 : 0);

  // Add to recent scores (limit to 12)
  const isNewRecord = score > 0 && score >= overallBestScore;
  const newHistoryPoint: ScoreHistoryPoint = {
    id: `game-${now}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now,
    score,
    mode,
    lines,
    dateStr: formatShortDate(now),
    isRecord: isNewRecord,
  };

  const updatedRecentScores = [newHistoryPoint, ...prevProfile.recentScores].slice(0, 12);

  const nextProfile: PlayerProfile = {
    ...prevProfile,
    totalGamesPlayed,
    totalLinesCleared,
    overallMaxCombo,
    overallBestScore,
    favoriteMode,
    challengeWins,
    modeStats: updatedModeStats,
    recentScores: updatedRecentScores,
  };

  saveProfile(nextProfile);
  return nextProfile;
}

export function recordPlayTime(
  prevProfile: PlayerProfile,
  mode: GameModeId,
  additionalSeconds: number
): PlayerProfile {
  if (additionalSeconds <= 0) return prevProfile;

  const currentModeStat = prevProfile.modeStats[mode] || {
    gamesPlayed: 0,
    bestScore: 0,
    totalScore: 0,
    averageScore: 0,
    linesCleared: 0,
    maxCombo: 0,
    playTimeSeconds: 0,
  };

  const newModePlayTime = (currentModeStat.playTimeSeconds || 0) + additionalSeconds;
  const newZenTime =
    (prevProfile.zenPlayTimeSeconds || 0) + (mode === 'zen' ? additionalSeconds : 0);
  const newTotalTime = (prevProfile.totalPlayTimeSeconds || 0) + additionalSeconds;

  const updated: PlayerProfile = {
    ...prevProfile,
    zenPlayTimeSeconds: newZenTime,
    totalPlayTimeSeconds: newTotalTime,
    modeStats: {
      ...prevProfile.modeStats,
      [mode]: {
        ...currentModeStat,
        playTimeSeconds: newModePlayTime,
      },
    },
  };

  saveProfile(updated);
  return updated;
}

export function recordSingleMoveLines(
  prevProfile: PlayerProfile,
  clearedLines: number
): PlayerProfile {
  const currentMax = prevProfile.maxLinesSingleMove || 0;
  if (clearedLines <= currentMax) return prevProfile;

  const updated: PlayerProfile = {
    ...prevProfile,
    maxLinesSingleMove: clearedLines,
  };

  saveProfile(updated);
  return updated;
}

export function markAchievementUnlocked(
  prevProfile: PlayerProfile,
  achievementId: string,
  timestamp: number = Date.now()
): PlayerProfile {
  if (prevProfile.unlockedAchievements?.[achievementId]) return prevProfile;

  const updated: PlayerProfile = {
    ...prevProfile,
    unlockedAchievements: {
      ...(prevProfile.unlockedAchievements || {}),
      [achievementId]: timestamp,
    },
  };

  saveProfile(updated);
  return updated;
}
