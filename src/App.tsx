import React, { useState, useEffect, useRef, useCallback } from 'react';
import { THEMES, Theme } from './types/theme';
import { GamePiece, spawnPieces } from './utils/shapes';
import {
  BoardGrid,
  BOARD_SIZE,
  createEmptyGrid,
  canPlacePiece,
  canPlaceAnywhere,
  hasAnyValidMove,
  simulateLinesCleared,
  applyPiecePlacement,
} from './utils/gameLogic';
import { sound } from './utils/audio';
import { haptics } from './utils/haptics';
import {
  isFullscreen,
  requestFullscreenImmersive,
  exitFullscreenImmersive,
} from './utils/fullscreen';
import { GameBoard } from './components/GameBoard';
import { PieceTray } from './components/PieceTray';
import { DragOverlay } from './components/DragOverlay';
import { ScoreHeader } from './components/ScoreHeader';
import { SettingsModal } from './components/SettingsModal';
import { GameOverModal } from './components/GameOverModal';
import { ComboToast, ToastInfo } from './components/ComboToast';
import { SplashScreen } from './components/SplashScreen';
import { OnboardingModal } from './components/OnboardingModal';
import { MainMenu } from './components/MainMenu';
import { ModesScreen } from './components/ModesScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { StatsScreen } from './components/StatsScreen';
import { DailyQuestsScreen } from './components/DailyQuestsScreen';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import { AuthGateModal } from './components/AuthGateModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { submitScoreToSupabase } from './services/supabase';
import { GameModeId, GAME_MODES } from './types/gameMode';
import { PlayerProfile } from './types/profile';
import { DailyQuestsState } from './types/dailyQuest';
import {
  loadProfile,
  saveProfile,
  recordGameSession,
  getDefaultProfile,
  recordPlayTime,
  recordSingleMoveLines,
  markAchievementUnlocked,
} from './utils/profileStorage';
import {
  calculateAchievements,
  findNewlyUnlockedAchievements,
  MEDAL_CONFIGS,
} from './utils/achievements';
import {
  loadDailyQuests,
  updateDailyQuestsProgress,
  QuestProgressEvent,
  getTodayDateKey,
} from './utils/dailyQuestStorage';

interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  alpha: number;
}

const AVATAR_EMOJIS: Record<string, string> = {
  fox: '🦊',
  cat: '🐱',
  bear: '🐻',
  panda: '🐼',
  owl: '🦉',
  star: '⭐',
};

function AppContent() {
  const { user } = useAuth();

  // 1. Settings & Persistence
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('bb_theme_id');
    const found = THEMES.find((t) => t.id === saved);
    return found || THEMES[0];
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('bb_sound_enabled') !== 'false';
  });

  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(() => {
    return localStorage.getItem('bb_vibe_enabled') !== 'false';
  });

  // Track high scores per mode
  const [bestScores, setBestScores] = useState<Record<GameModeId, number>>(() => {
    return {
      classic: parseInt(
        localStorage.getItem('bb_best_classic') ||
          localStorage.getItem('bb_best_score') ||
          '0',
        10
      ),
      time_attack: parseInt(localStorage.getItem('bb_best_time_attack') || '0', 10),
      zen: parseInt(localStorage.getItem('bb_best_zen') || '0', 10),
      challenge: parseInt(localStorage.getItem('bb_best_challenge') || '0', 10),
    };
  });

  // Profile & Statistics state
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(loadProfile);
  const hasRecordedRoundRef = useRef<boolean>(false);

  // Auto-sync profile name from Google Account if currently default 'Игрок'
  useEffect(() => {
    if (user) {
      const googleName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0];
      if (googleName && (playerProfile.name === 'Игрок' || !playerProfile.name)) {
        const trimmed = googleName.slice(0, 16);
        setPlayerProfile((prev) => {
          const updated = { ...prev, name: trimmed };
          saveProfile(updated);
          return updated;
        });
      }
    }
  }, [user]);

  // Daily Quests state
  const [dailyQuestsState, setDailyQuestsState] = useState<DailyQuestsState>(loadDailyQuests);

  // 2. Navigation & Mode State
  const [currentScreen, setCurrentScreen] = useState<
    'menu' | 'modes' | 'profile' | 'stats' | 'daily_quests' | 'leaderboard' | 'game'
  >('menu');
  const [selectedModeId, setSelectedModeId] = useState<GameModeId>(() => {
    const saved = localStorage.getItem('gridly_mode') as GameModeId;
    return saved || 'classic';
  });

  // Mode rules state
  const [timeLeft, setTimeLeft] = useState<number>(120);
  const [movesLeft, setMovesLeft] = useState<number>(30);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [gameOverReason, setGameOverReason] = useState<string>('');

  // 3. Game Core State
  const [grid, setGrid] = useState<BoardGrid>(createEmptyGrid);
  const [trayPieces, setTrayPieces] = useState<(GamePiece | null)[]>(() =>
    spawnPieces(THEMES[0].blockColors.length)
  );
  const [spawnKey, setSpawnKey] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [totalLinesCleared, setTotalLinesCleared] = useState<number>(0);

  // 4. UI Modals
  const [isSplashVisible, setIsSplashVisible] = useState<boolean>(true);
  const [isOnboardingVisible, setIsOnboardingVisible] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isFullscreenState, setIsFullscreenState] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastInfo | null>(null);

  // 5. Board & Drag State
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [activePiece, setActivePiece] = useState<GamePiece | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [hoverPos, setHoverPos] = useState<{ r: number; c: number } | null>(null);
  const [isValidHover, setIsValidHover] = useState<boolean>(false);
  const [highlightLines, setHighlightLines] = useState<{ rows: number[]; cols: number[] }>({
    rows: [],
    cols: [],
  });
  const [clearingCells, setClearingCells] = useState<Map<string, number>>(new Map());
  const [isPunching, setIsPunching] = useState<boolean>(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [boardCellSize, setBoardCellSize] = useState<number>(40);

  // Sync settings with audio/haptics engines
  useEffect(() => {
    sound.enabled = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    haptics.enabled = vibrationEnabled;
  }, [vibrationEnabled]);

  // Sync document body background & theme-color meta tag
  useEffect(() => {
    document.body.style.backgroundColor = theme.bgMain;
    document.body.style.background = theme.bgGradient;
    const metaTheme = document.getElementById('meta-theme-color');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme.bgMain);
    }
  }, [theme]);

  // Track Fullscreen state and Auto-request immersive fullscreen on load / first touch
  useEffect(() => {
    const updateFs = () => {
      setIsFullscreenState(isFullscreen());
    };
    updateFs();
    document.addEventListener('fullscreenchange', updateFs);
    document.addEventListener('webkitfullscreenchange', updateFs);

    // Auto-enter fullscreen immediately on app launch
    requestFullscreenImmersive().catch(() => {});

    // Reliable fallback: enter fullscreen on first user touch anywhere
    const handleFirstGesture = () => {
      if (!isFullscreen()) {
        requestFullscreenImmersive().catch(() => {});
      }
    };
    window.addEventListener('pointerdown', handleFirstGesture, { once: true, passive: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true, passive: true });

    return () => {
      document.removeEventListener('fullscreenchange', updateFs);
      document.removeEventListener('webkitfullscreenchange', updateFs);
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };
  }, []);

  // Recalculate board cell size dynamically for drag alignment
  useEffect(() => {
    const measureBoard = () => {
      if (boardRef.current) {
        const rect = boardRef.current.getBoundingClientRect();
        setBoardCellSize(rect.width / BOARD_SIZE);
      }
    };
    measureBoard();
    window.addEventListener('resize', measureBoard);
    return () => window.removeEventListener('resize', measureBoard);
  }, []);

  // Time Attack Mode Countdown Timer
  useEffect(() => {
    if (
      currentScreen !== 'game' ||
      selectedModeId !== 'time_attack' ||
      isGameOver ||
      isSettingsOpen ||
      isOnboardingVisible ||
      isSplashVisible
    ) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsGameOver(true);
          setGameOverReason('Время вышло');
          sound.playGameOver();
          haptics.gameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    currentScreen,
    selectedModeId,
    isGameOver,
    isSettingsOpen,
    isOnboardingVisible,
    isSplashVisible,
  ]);

  // Live Play Time Tracking for Profile & Achievements (including Zen Mode 1 hour)
  useEffect(() => {
    if (
      currentScreen !== 'game' ||
      isGameOver ||
      isSettingsOpen ||
      isOnboardingVisible ||
      isSplashVisible
    ) {
      return;
    }

    const interval = setInterval(() => {
      setPlayerProfile((prev) => recordPlayTime(prev, selectedModeId, 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [
    currentScreen,
    isGameOver,
    isSettingsOpen,
    isOnboardingVisible,
    isSplashVisible,
    selectedModeId,
  ]);

  // Midnight check for Daily Quests
  useEffect(() => {
    const checkMidnight = () => {
      const todayKey = getTodayDateKey();
      if (dailyQuestsState.dateKey !== todayKey) {
        setDailyQuestsState(loadDailyQuests());
      }
    };
    const interval = setInterval(checkMidnight, 10000);
    return () => clearInterval(interval);
  }, [dailyQuestsState.dateKey]);

  // Current mode config
  const currentMode =
    GAME_MODES.find((m) => m.id === selectedModeId) || GAME_MODES[0];

  // Show Toast / Combo Banner
  const showToast = useCallback(
    (
      title: string,
      subtitle: string,
      color?: string,
      isCombo?: boolean,
      comboMultiplier?: number
    ) => {
      const id = Date.now().toString();
      setToast({ id, title, subtitle, color, isCombo, comboMultiplier });
      setTimeout(() => {
        setToast((curr) => (curr?.id === id ? null : curr));
      }, 1400);
    },
    []
  );

  // Daily Quests Progress Tracker
  const handleQuestProgress = useCallback(
    (event: QuestProgressEvent) => {
      setDailyQuestsState((prev) => {
        const { nextState, newlyCompleted } = updateDailyQuestsProgress(prev, event);
        if (newlyCompleted.length > 0) {
          newlyCompleted.forEach((quest) => {
            sound.playComboFanfare(3);
            haptics.combo();
            showToast('Задание выполнено! 🎉', quest.title, quest.accentColor || '#10b981');
          });
        }
        return nextState;
      });
    },
    [showToast]
  );

  // Watch for newly unlocked achievements and celebrate with toast & fanfare
  useEffect(() => {
    const computed = calculateAchievements(playerProfile);
    const newlyUnlocked = findNewlyUnlockedAchievements(playerProfile, computed);

    if (newlyUnlocked.length > 0) {
      newlyUnlocked.forEach((ach) => {
        setPlayerProfile((prev) => markAchievementUnlocked(prev, ach.id));
        sound.playComboFanfare(3);
        haptics.combo();
        showToast(
          'Достижение! 🏆',
          `«${ach.title}» (${MEDAL_CONFIGS[ach.medal].label})`,
          MEDAL_CONFIGS[ach.medal].badgeBorder
        );
      });
    }
  }, [playerProfile, showToast]);

  // Helper to record a completed game session into Profile and Statistics
  const recordCurrentSession = useCallback(
    (victory: boolean = false) => {
      if (hasRecordedRoundRef.current) return;
      if (score === 0 && totalLinesCleared === 0) return;
      hasRecordedRoundRef.current = true;
      handleQuestProgress({
        type: 'game_finished',
        mode: selectedModeId,
        score,
        lines: totalLinesCleared,
        maxCombo,
      });
      setPlayerProfile((prev) =>
        recordGameSession(prev, {
          score,
          lines: totalLinesCleared,
          maxCombo,
          mode: selectedModeId,
          isVictory: victory,
        })
      );

      // Automatically sync score to Supabase global leaderboard for Google authenticated players
      if (user && score > 0) {
        submitScoreToSupabase({
          userId: user.id,
          playerName: playerProfile.name,
          avatarIcon: playerProfile.avatarIcon,
          mode: selectedModeId,
          score,
          maxCombo,
          linesCleared: totalLinesCleared,
        }).catch((err) => console.warn('Supabase submit score warning:', err));
      }
    },
    [
      score,
      totalLinesCleared,
      maxCombo,
      selectedModeId,
      handleQuestProgress,
      user,
      playerProfile.name,
      playerProfile.avatarIcon,
    ]
  );

  // Auto-record session on game over
  useEffect(() => {
    if (isGameOver && !hasRecordedRoundRef.current) {
      recordCurrentSession(isVictory);
    }
  }, [isGameOver, isVictory, recordCurrentSession]);

  // Start / Restart game with specific mode rules
  const handleStartGameWithMode = useCallback(
    (modeId: GameModeId) => {
      requestFullscreenImmersive();
      setSelectedModeId(modeId);
      localStorage.setItem('gridly_mode', modeId);

      hasRecordedRoundRef.current = false;
      setGrid(createEmptyGrid());
      setTrayPieces(spawnPieces(theme.blockColors.length));
      setSpawnKey((k) => k + 1);
      setScore(0);
      setCombo(0);
      setMaxCombo(0);
      setTotalLinesCleared(0);
      setIsGameOver(false);
      setIsNewRecord(false);
      setIsVictory(false);
      setGameOverReason('');
      setHighlightLines({ rows: [], cols: [] });
      setHoverPos(null);
      setClearingCells(new Map());
      setIsPunching(false);

      const cfg = GAME_MODES.find((m) => m.id === modeId) || GAME_MODES[0];
      setTimeLeft(cfg.defaultTime ?? 120);
      setMovesLeft(cfg.maxMoves ?? 30);

      setCurrentScreen('game');
    },
    [theme.blockColors.length]
  );

  const handleRestart = useCallback(() => {
    sound.playClick();
    haptics.tapLight();
    // Record unfinished round if score was earned
    if (!hasRecordedRoundRef.current && (score > 0 || totalLinesCleared > 0)) {
      recordCurrentSession(isVictory);
    }
    handleStartGameWithMode(selectedModeId);
  }, [
    handleStartGameWithMode,
    selectedModeId,
    score,
    totalLinesCleared,
    isVictory,
    recordCurrentSession,
  ]);

  // Compute which pieces in tray can currently be placed
  const canPlaceFlags = trayPieces.map((piece) => {
    if (!piece) return false;
    return canPlaceAnywhere(grid, piece);
  });

  // Handle Score update & Best Score sync per mode
  const updateScore = useCallback(
    (gained: number) => {
      setScore((prev) => {
        const next = prev + gained;
        handleQuestProgress({
          type: 'score_reached',
          mode: selectedModeId,
          score: next,
        });
        setBestScores((bScores) => {
          const curBest = bScores[selectedModeId] || 0;
          if (next > curBest) {
            const updated = { ...bScores, [selectedModeId]: next };
            localStorage.setItem(`bb_best_${selectedModeId}`, next.toString());
            if (selectedModeId === 'classic') {
              localStorage.setItem('bb_best_score', next.toString());
            }
            setIsNewRecord(true);

            // Also update player profile's best score in real-time
            setPlayerProfile((p) => {
              const overallBest = Math.max(p.overallBestScore, next);
              const mStat = p.modeStats[selectedModeId];
              const updatedP = {
                ...p,
                overallBestScore: overallBest,
                modeStats: {
                  ...p.modeStats,
                  [selectedModeId]: {
                    ...mStat,
                    bestScore: Math.max(mStat.bestScore, next),
                  },
                },
              };
              saveProfile(updatedP);
              return updatedP;
            });

            return updated;
          }
          return bScores;
        });
        return next;
      });
    },
    [selectedModeId, handleQuestProgress]
  );

  // Animate explosion of tumbling square shards with reinforced combo bursts
  const spawnExplosionParticles = useCallback(
    (cells: Array<{ r: number; c: number }>, color: string, isCombo: boolean = false) => {
      if (!boardRef.current) return;
      const rect = boardRef.current.getBoundingClientRect();
      const cellW = rect.width / BOARD_SIZE;
      const cellH = rect.height / BOARD_SIZE;

      const newParticles: Particle[] = [];
      const countPerCell = isCombo ? 9 : 5;
      const speedBase = isCombo ? 2.8 : 1.8;

      cells.forEach(({ r, c }) => {
        const centerX = c * cellW + cellW / 2;
        const centerY = r * cellH + cellH / 2;

        for (let i = 0; i < countPerCell; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = speedBase + Math.random() * (isCombo ? 6.2 : 4.2);
          newParticles.push({
            id: `p-${Date.now()}-${r}-${c}-${i}-${Math.random()}`,
            x: centerX,
            y: centerY,
            color,
            size: 4 + Math.random() * (isCombo ? 6 : 4.5),
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - (isCombo ? 2.2 : 1.2),
            rotation: Math.random() * 360,
            vRot: (Math.random() - 0.5) * (isCombo ? 26 : 16),
            alpha: 1,
          });
        }
      });

      setParticles((prev) => [...prev, ...newParticles]);
    },
    []
  );

  // Particle physics tick
  useEffect(() => {
    if (particles.length === 0) return;
    const interval = requestAnimationFrame(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.16,
            rotation: p.rotation + p.vRot,
            alpha: p.alpha - 0.024,
          }))
          .filter((p) => p.alpha > 0)
      );
    });
    return () => cancelAnimationFrame(interval);
  }, [particles]);

  // Pointer drag handling: Tray piece selection
  const handlePiecePointerDown = (
    piece: GamePiece,
    index: number,
    clientX: number,
    clientY: number
  ) => {
    if (isGameOver || isSplashVisible || isOnboardingVisible) return;

    sound.playPick();
    haptics.tapLight();
    setDraggingIndex(index);
    setActivePiece(piece);
    setDragPos({ x: clientX, y: clientY });
  };

  // Global Pointer Events for Smooth Touch Dragging
  useEffect(() => {
    if (draggingIndex === null || !activePiece) return;

    const handlePointerMove = (e: PointerEvent) => {
      e.preventDefault();
      setDragPos({ x: e.clientX, y: e.clientY });

      if (!boardRef.current) return;
      const rect = boardRef.current.getBoundingClientRect();
      const cellW = rect.width / BOARD_SIZE;
      const cellH = rect.height / BOARD_SIZE;

      // Finger offset: Place center of the piece ~64px above finger tip
      const pieceCenterX = (activePiece.cols * cellW) / 2;
      const pieceCenterY = (activePiece.rows * cellH) / 2;
      const targetX = e.clientX - pieceCenterX;
      const targetY = e.clientY - 64 - pieceCenterY;

      const c = Math.round((targetX - rect.left) / cellW);
      const r = Math.round((targetY - rect.top) / cellH);

      const isValid = canPlacePiece(grid, activePiece, r, c);
      setHoverPos({ r, c });
      setIsValidHover(isValid);

      if (isValid) {
        // Compute predicted line clears and highlight them
        const sim = simulateLinesCleared(grid, activePiece, r, c);
        setHighlightLines(sim);
      } else {
        setHighlightLines({ rows: [], cols: [] });
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      e.preventDefault();

      if (isValidHover && hoverPos && activePiece) {
        // Place piece onto grid
        const pieceColor = theme.blockColors[activePiece.colorIndex % theme.blockColors.length];
        const result = applyPiecePlacement(
          grid,
          activePiece,
          hoverPos.r,
          hoverPos.c,
          pieceColor,
          combo
        );

        // 1. Update score
        const newScore = score + result.scoreGained;
        updateScore(result.scoreGained);

        // Update moves in Challenge mode
        let nextMoves = movesLeft;
        if (selectedModeId === 'challenge') {
          nextMoves = Math.max(0, movesLeft - 1);
          setMovesLeft(nextMoves);
        }

        // 2. Update grid
        setGrid(result.newGrid);

        // Track block placement in daily quests
        handleQuestProgress({ type: 'block_placed' });

        // 3. Update tray (clear placed slot)
        const nextTray = [...trayPieces];
        nextTray[draggingIndex] = null;

        if (result.clearResult && result.clearResult.totalLines > 0) {
          const lines = result.clearResult.totalLines;
          const newComboVal = result.newCombo;

          setCombo(newComboVal);
          setMaxCombo((prev) => Math.max(prev, newComboVal));
          setTotalLinesCleared((prev) => prev + lines);
          setPlayerProfile((prev) => recordSingleMoveLines(prev, lines));

          // Mark clearing cells for pop animation with ripple stagger
          const clearingMap = new Map<string, number>();
          result.clearResult.clearedCells.forEach((c) => {
            const delay = Math.min((c.r + c.c) * 18, 220);
            clearingMap.set(`${c.r},${c.c}`, delay);
          });
          setClearingCells(clearingMap);
          setIsPunching(true);
          setTimeout(() => setIsPunching(false), 240);
          setTimeout(() => setClearingCells(new Map()), 420);

          const isMultiLineClear = lines >= 2;
          const isStreakCombo = newComboVal >= 2;
          const comboMultiplier = Math.max(lines, newComboVal);

          // Track lines cleared and combo in daily quests
          handleQuestProgress({
            type: 'lines_cleared',
            lines,
            singlePlacementLines: lines,
            comboMultiplier,
          });
          if (newComboVal >= 2) {
            handleQuestProgress({
              type: 'combo_reached',
              combo: newComboVal,
            });
          }

          // Audio & Haptics: Amplified fanfare on 2+ lines or streak
          if (isMultiLineClear || isStreakCombo) {
            sound.playComboFanfare(comboMultiplier);
            haptics.combo();
          } else {
            sound.playClear(lines, newComboVal);
            haptics.lineClear(lines);
          }

          // Particles with reinforced combo burst
          spawnExplosionParticles(result.clearResult.clearedCells, pieceColor, comboMultiplier >= 2);

          // Celebratory Combo Toast (Shows "Combo x2", "Combo x3", etc. on 2+ lines or combos)
          if (comboMultiplier >= 2) {
            showToast(
              `Combo x${comboMultiplier}`,
              `+${result.scoreGained} очков`,
              undefined,
              true,
              comboMultiplier
            );
          }
        } else {
          setCombo(0);
          sound.playPlace();
          haptics.tapPlace();
        }

        // 4. Check if tray is completely empty -> spawn fresh deal
        let finalTray = nextTray;
        if (nextTray.every((p) => p === null)) {
          finalTray = spawnPieces(theme.blockColors.length);
          setTrayPieces(finalTray);
          setSpawnKey((k) => k + 1);
        } else {
          setTrayPieces(nextTray);
        }

        // 5. Check Challenge Mode Victory or Out of Moves
        if (selectedModeId === 'challenge') {
          if (newScore >= 1500) {
            setTimeout(() => {
              setIsVictory(true);
              setIsGameOver(true);
              setGameOverReason('Вызов пройден!');
              sound.playComboFanfare(4);
              haptics.combo();
              showToast('ПОБЕДА!', 'Цель 1,500 очков достигнута! 🎉', '#10b981');
            }, 350);
            return;
          } else if (nextMoves <= 0) {
            setTimeout(() => {
              setIsGameOver(true);
              setGameOverReason('Ходы исчерпаны');
              sound.playGameOver();
              haptics.gameOver();
            }, 350);
            return;
          }
        }

        // 6. Check Board Valid Move Condition
        const canMoveAny = hasAnyValidMove(result.newGrid, finalTray);
        if (!canMoveAny) {
          if (selectedModeId === 'zen') {
            // Zen mode: infinite relaxing play, never ends!
            setTimeout(() => {
              setGrid(createEmptyGrid());
              setTrayPieces(spawnPieces(theme.blockColors.length));
              setSpawnKey((k) => k + 1);
              sound.playClear(3, 1);
              haptics.lineClear(3);
              showToast('ДЗЕН-ГАРМОНИЯ', 'Поле обновлено ✨', '#10b981');
            }, 450);
          } else {
            setTimeout(() => {
              setIsGameOver(true);
              setGameOverReason('Нет места для блоков');
              sound.playGameOver();
              haptics.gameOver();
            }, 450);
          }
        }
      }

      // Cleanup drag state
      setDraggingIndex(null);
      setActivePiece(null);
      setDragPos(null);
      setHoverPos(null);
      setIsValidHover(false);
      setHighlightLines({ rows: [], cols: [] });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp, { passive: false });
    window.addEventListener('pointercancel', handlePointerUp, { passive: false });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [
    draggingIndex,
    activePiece,
    grid,
    hoverPos,
    isValidHover,
    theme,
    combo,
    trayPieces,
    score,
    movesLeft,
    selectedModeId,
    updateScore,
    showToast,
    spawnExplosionParticles,
    handleQuestProgress,
  ]);

  // Toggle Fullscreen
  const handleToggleFullscreen = async () => {
    if (isFullscreenState) {
      await exitFullscreenImmersive();
    } else {
      await requestFullscreenImmersive();
    }
  };

  // Reset High Score for Current Mode
  const handleResetHighScore = () => {
    setBestScores((prev) => {
      const updated = { ...prev, [selectedModeId]: 0 };
      localStorage.removeItem(`bb_best_${selectedModeId}`);
      if (selectedModeId === 'classic') {
        localStorage.removeItem('bb_best_score');
      }
      return updated;
    });
    setIsNewRecord(false);
    showToast('СБРОШЕНО', 'Рекорд режима очищен', '#ef4444');
  };

  // Reset All Stats and Scores
  const handleResetStats = useCallback(() => {
    const def = getDefaultProfile();
    const resetProf: PlayerProfile = {
      ...def,
      name: playerProfile.name,
      avatarIcon: playerProfile.avatarIcon,
      firstPlayedDate: playerProfile.firstPlayedDate,
      firstPlayedTimestamp: playerProfile.firstPlayedTimestamp,
    };
    setPlayerProfile(resetProf);
    saveProfile(resetProf);

    setBestScores({
      classic: 0,
      time_attack: 0,
      zen: 0,
      challenge: 0,
    });
    localStorage.removeItem('bb_best_classic');
    localStorage.removeItem('bb_best_time_attack');
    localStorage.removeItem('bb_best_zen');
    localStorage.removeItem('bb_best_challenge');
    localStorage.removeItem('bb_best_score');

    showToast('СБРОШЕНО', 'Статистика и рекорды очищены', '#ef4444');
  }, [
    playerProfile.name,
    playerProfile.avatarIcon,
    playerProfile.firstPlayedDate,
    playerProfile.firstPlayedTimestamp,
    showToast,
  ]);

  // Splash & Onboarding Handlers
  const handleSplashFinish = useCallback(() => {
    requestFullscreenImmersive().catch(() => {});
    localStorage.setItem('gridly_visited', 'true');
    setIsSplashVisible(false);
    const hasCompletedOnboarding =
      localStorage.getItem('gridly_onboarding_completed') === 'true';
    if (!hasCompletedOnboarding) {
      setIsOnboardingVisible(true);
    }
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    localStorage.setItem('gridly_onboarding_completed', 'true');
    setIsOnboardingVisible(false);
    sound.playClick();
    haptics.tapPlace();
  }, []);

  const handleGoHome = useCallback(() => {
    sound.playClick();
    haptics.tapLight();
    // Record current game if played
    if (!hasRecordedRoundRef.current && (score > 0 || totalLinesCleared > 0)) {
      recordCurrentSession(isVictory);
    }
    setCurrentScreen('menu');
  }, [score, totalLinesCleared, isVictory, recordCurrentSession]);

  const playerAvatarEmoji = AVATAR_EMOJIS[playerProfile.avatarIcon] || '🦊';
  const allAchievements = calculateAchievements(playerProfile);
  const achievementsSummary = {
    unlockedCount: allAchievements.filter((a) => a.isUnlocked).length,
    totalCount: allAchievements.length,
  };

  return (
    <div
      style={{
        backgroundColor: theme.bgMain,
        background: theme.bgGradient,
        color: theme.textPrimary,
        paddingTop: 'var(--sat, 0px)',
        paddingBottom: 'var(--sab, 0px)',
      }}
      className="w-full h-full min-h-[100dvh] flex flex-col justify-between items-center overflow-hidden select-none touch-none transition-all duration-300 font-sans"
    >
      {currentScreen === 'menu' ? (
        /* MAIN MENU SCREEN */
        <MainMenu
          theme={theme}
          bestScore={bestScores[selectedModeId] || 0}
          currentMode={currentMode}
          isFullscreen={isFullscreenState}
          playerName={playerProfile.name}
          playerAvatarEmoji={playerAvatarEmoji}
          dailyQuestsSummary={{
            completedCount: dailyQuestsState.quests.filter((q) => q.isCompleted).length,
            totalCount: dailyQuestsState.quests.length,
          }}
          achievementsSummary={achievementsSummary}
          onPlay={() => handleStartGameWithMode(selectedModeId)}
          onOpenModes={() => setCurrentScreen('modes')}
          onOpenProfile={() => setCurrentScreen('profile')}
          onOpenDailyQuests={() => setCurrentScreen('daily_quests')}
          onOpenLeaderboard={() => setCurrentScreen('leaderboard')}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenOnboarding={() => setIsOnboardingVisible(true)}
          onToggleFullscreen={handleToggleFullscreen}
        />
      ) : currentScreen === 'modes' ? (
        /* DEDICATED MODES SELECTION SCREEN */
        <ModesScreen
          theme={theme}
          selectedModeId={selectedModeId}
          bestScores={bestScores}
          onBack={() => setCurrentScreen('menu')}
          onSelectAndPlay={handleStartGameWithMode}
        />
      ) : currentScreen === 'leaderboard' ? (
        /* GLOBAL LEADERBOARD SCREEN */
        <LeaderboardScreen
          theme={theme}
          profile={playerProfile}
          onBack={() => setCurrentScreen('menu')}
        />
      ) : currentScreen === 'profile' ? (
        /* PLAYER PROFILE SCREEN */
        <ProfileScreen
          theme={theme}
          profile={playerProfile}
          onUpdateProfile={(updated) => {
            setPlayerProfile(updated);
            saveProfile(updated);
          }}
          onOpenStats={() => setCurrentScreen('stats')}
          onBack={() => setCurrentScreen('menu')}
        />
      ) : currentScreen === 'stats' ? (
        /* DETAILED STATISTICS SCREEN */
        <StatsScreen
          theme={theme}
          profile={playerProfile}
          onBack={() => setCurrentScreen('profile')}
          onResetStats={handleResetStats}
        />
      ) : currentScreen === 'daily_quests' ? (
        /* DAILY QUESTS SCREEN */
        <DailyQuestsScreen
          theme={theme}
          questsState={dailyQuestsState}
          onBack={() => setCurrentScreen('menu')}
          onPlayMode={handleStartGameWithMode}
        />
      ) : (
        /* IN-GAME PLAYING SCREEN */
        <>
          {/* 1. Header with Mode HUD & Navigation */}
          <ScoreHeader
            score={score}
            bestScore={bestScores[selectedModeId] || 0}
            combo={combo}
            theme={theme}
            modeConfig={currentMode}
            timeLeft={timeLeft}
            movesLeft={movesLeft}
            targetScore={currentMode.targetScore}
            isFullscreen={isFullscreenState}
            onToggleFullscreen={handleToggleFullscreen}
            onOpenSettings={() => {
              sound.playClick();
              setIsSettingsOpen(true);
            }}
            onRestart={handleRestart}
            onGoHome={handleGoHome}
          />

          {/* 2. Main 8x8 Board & Combo Toast */}
          <div className="relative w-full flex-1 flex items-center justify-center my-auto">
            <GameBoard
              grid={grid}
              theme={theme}
              hoverPos={hoverPos}
              activePiece={activePiece}
              isValidHover={isValidHover}
              highlightLines={highlightLines}
              clearingCells={clearingCells}
              boardRef={boardRef}
              particles={particles}
              isPunching={isPunching}
            />
            <ComboToast toast={toast} />
          </div>

          {/* 3. Bottom Tray with 3 Pieces */}
          <div className="w-full pb-3 pt-1">
            <PieceTray
              pieces={trayPieces}
              theme={theme}
              onPiecePointerDown={handlePiecePointerDown}
              draggingIndex={draggingIndex}
              canPlaceFlags={canPlaceFlags}
              spawnKey={spawnKey}
            />
          </div>

          {/* 4. Floating Drag Overlay (Elevated above finger tip) */}
          <DragOverlay
            activePiece={activePiece}
            dragPos={dragPos}
            theme={theme}
            boardCellSize={boardCellSize}
          />
        </>
      )}

      {/* 5. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentTheme={theme}
        onSelectTheme={(t) => {
          setTheme(t);
          localStorage.setItem('bb_theme_id', t.id);
        }}
        soundEnabled={soundEnabled}
        onToggleSound={(en) => {
          setSoundEnabled(en);
          localStorage.setItem('bb_sound_enabled', String(en));
        }}
        vibrationEnabled={vibrationEnabled}
        onToggleVibration={(en) => {
          setVibrationEnabled(en);
          localStorage.setItem('bb_vibe_enabled', String(en));
        }}
        onResetHighScore={handleResetHighScore}
        onTriggerFullscreen={requestFullscreenImmersive}
        onOpenOnboarding={() => {
          setIsSettingsOpen(false);
          setIsOnboardingVisible(true);
        }}
      />

      {/* 6. Game Over Modal with Mode Context */}
      <GameOverModal
        isOpen={isGameOver}
        score={score}
        bestScore={bestScores[selectedModeId] || 0}
        isNewRecord={isNewRecord}
        totalLinesCleared={totalLinesCleared}
        maxCombo={maxCombo}
        theme={theme}
        modeConfig={currentMode}
        isVictory={isVictory}
        reason={gameOverReason}
        dailyQuestsSummary={{
          completedCount: dailyQuestsState.quests.filter((q) => q.isCompleted).length,
          totalCount: dailyQuestsState.quests.length,
        }}
        onPlayAgain={handleRestart}
        onOpenProfile={() => {
          setIsGameOver(false);
          setCurrentScreen('profile');
        }}
        onOpenDailyQuests={() => {
          setIsGameOver(false);
          setCurrentScreen('daily_quests');
        }}
        onOpenSettings={() => {
          setIsSettingsOpen(true);
        }}
        onGoHome={() => {
          setIsGameOver(false);
          handleGoHome();
        }}
      />

      {/* 7. Onboarding Modal for First Time or Manual Help */}
      <OnboardingModal
        isOpen={isOnboardingVisible}
        theme={theme}
        onComplete={handleOnboardingComplete}
      />

      {/* 8. Fullscreen Splash Screen on Launch */}
      {isSplashVisible && (
        <SplashScreen
          theme={theme}
          onFinish={handleSplashFinish}
        />
      )}

      {/* 9. Google Auth Gate Modal */}
      <AuthGateModal theme={theme} />

      {/* 10. Supabase Credentials Configuration Modal */}
      <SupabaseConfigModal theme={theme} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
