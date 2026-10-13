import React from 'react';
import {
  Settings,
  Maximize2,
  Minimize2,
  RotateCcw,
  Trophy,
  Flame,
  Home,
  Timer,
  Target,
  Sparkles,
} from 'lucide-react';
import { Theme } from '../types/theme';
import { GameModeConfig } from '../types/gameMode';

interface ScoreHeaderProps {
  score: number;
  bestScore: number;
  combo: number;
  theme: Theme;
  modeConfig: GameModeConfig;
  timeLeft?: number;
  movesLeft?: number;
  targetScore?: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenSettings: () => void;
  onRestart: () => void;
  onGoHome?: () => void;
}

export const ScoreHeader: React.FC<ScoreHeaderProps> = ({
  score,
  bestScore,
  combo,
  theme,
  modeConfig,
  timeLeft,
  movesLeft,
  targetScore,
  isFullscreen,
  onToggleFullscreen,
  onOpenSettings,
  onRestart,
  onGoHome,
}) => {
  // Format seconds to MM:SS
  const formatTime = (secs: number = 0) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = modeConfig.id === 'time_attack' && (timeLeft ?? 0) <= 15;

  return (
    <header className="w-full max-w-[420px] mx-auto px-4 pt-3 pb-2 flex flex-col gap-2 select-none">
      {/* Top action row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Brand & Mode tag */}
          <div className="flex items-center gap-1.5">
            <span
              style={{ color: theme.accent }}
              className="text-[14px] font-black tracking-widest uppercase"
            >
              GRIDLY
            </span>
            <span
              style={{
                backgroundColor: `${modeConfig.accentColor}22`,
                color: modeConfig.accentColor,
                borderColor: `${modeConfig.accentColor}40`,
              }}
              className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border"
            >
              {modeConfig.title}
            </span>
          </div>

          {combo > 1 && (
            <div
              style={{
                backgroundColor: theme.accentMuted,
                color: theme.accent,
                borderColor: `${theme.accent}40`,
              }}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-xl text-xs font-bold border transition-all animate-bounce"
            >
              <Flame size={13} className="fill-current text-amber-500" />
              <span>x{combo}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Home button */}
          {onGoHome && (
            <button
              onClick={onGoHome}
              title="В главное меню"
              style={{
                backgroundColor: theme.cardBg,
                color: theme.textSecondary,
                borderColor: theme.cardBorder,
                boxShadow: theme.cardShadow,
              }}
              className="w-10 h-10 rounded-2xl border flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
            >
              <Home size={17} strokeWidth={2.2} />
            </button>
          )}

          {/* Restart */}
          <button
            onClick={onRestart}
            title="Начать заново"
            style={{
              backgroundColor: theme.cardBg,
              color: theme.textSecondary,
              borderColor: theme.cardBorder,
              boxShadow: theme.cardShadow,
            }}
            className="w-10 h-10 rounded-2xl border flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
          >
            <RotateCcw size={17} strokeWidth={2.2} />
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Выйти из полноэкранного режима' : 'Во весь экран'}
            style={{
              backgroundColor: isFullscreen ? theme.accent : theme.cardBg,
              color: isFullscreen ? '#ffffff' : theme.textSecondary,
              borderColor: isFullscreen ? theme.accent : theme.cardBorder,
              boxShadow: theme.cardShadow,
            }}
            className="w-10 h-10 rounded-2xl border flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 size={17} strokeWidth={2.2} />
            ) : (
              <Maximize2 size={17} strokeWidth={2.2} />
            )}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            title="Настройки"
            style={{
              backgroundColor: theme.cardBg,
              color: theme.textSecondary,
              borderColor: theme.cardBorder,
              boxShadow: theme.cardShadow,
            }}
            className="w-10 h-10 rounded-2xl border flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
          >
            <Settings size={17} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Mode-specific Banner (Timer / Moves / Zen) */}
      {modeConfig.id === 'time_attack' && (
        <div
          style={{
            backgroundColor: isLowTime ? 'rgba(239, 68, 68, 0.15)' : theme.cardBg,
            borderColor: isLowTime ? '#ef4444' : theme.cardBorder,
            boxShadow: theme.cardShadow,
          }}
          className={`w-full py-2 px-4 rounded-2xl border flex items-center justify-between transition-all ${
            isLowTime ? 'animate-pulse' : ''
          }`}
        >
          <div className="flex items-center gap-2">
            <Timer
              size={18}
              className={isLowTime ? 'text-red-500 animate-spin' : 'text-amber-500'}
            />
            <span
              style={{ color: theme.textSecondary }}
              className="text-xs font-bold uppercase tracking-wider"
            >
              Осталось времени
            </span>
          </div>
          <span
            style={{ color: isLowTime ? '#ef4444' : theme.textPrimary }}
            className="text-xl font-black tabular-nums tracking-tight"
          >
            {formatTime(timeLeft)}
          </span>
        </div>
      )}

      {modeConfig.id === 'challenge' && (
        <div
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
            boxShadow: theme.cardShadow,
          }}
          className="w-full py-2 px-4 rounded-2xl border flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Target size={18} className="text-pink-500" />
            <span
              style={{ color: theme.textSecondary }}
              className="text-xs font-bold uppercase tracking-wider"
            >
              Ходы:
            </span>
            <span
              style={{ color: (movesLeft ?? 0) <= 5 ? '#ef4444' : theme.textPrimary }}
              className="text-base font-black tabular-nums"
            >
              {movesLeft} / {modeConfig.maxMoves}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              style={{ color: theme.textSecondary }}
              className="text-[11px] font-bold uppercase tracking-wider"
            >
              Цель:
            </span>
            <span
              style={{ color: score >= (targetScore ?? 1500) ? '#10b981' : theme.textPrimary }}
              className="text-sm font-black tabular-nums"
            >
              {score.toLocaleString()} / {(targetScore ?? 1500).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {modeConfig.id === 'zen' && (
        <div
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderColor: 'rgba(16, 185, 129, 0.25)',
          }}
          className="w-full py-1.5 px-3 rounded-2xl border flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider"
        >
          <Sparkles size={14} />
          <span>Дзен-режим · Игра без проигрыша и таймеров</span>
        </div>
      )}

      {/* Styled Modern Score Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Current Score Card */}
        <div
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
            boxShadow: theme.cardShadow,
          }}
          className="rounded-[22px] border px-4 py-2.5 flex flex-col items-center justify-center transition-all duration-200"
        >
          <span
            style={{ color: theme.textSecondary }}
            className="text-[11px] font-bold uppercase tracking-widest mb-0.5 opacity-80"
          >
            СЧЁТ
          </span>
          <span
            style={{ color: theme.textPrimary }}
            className="text-3xl font-black tracking-tight leading-none tabular-nums"
          >
            {score.toLocaleString()}
          </span>
        </div>

        {/* High Score Card */}
        <div
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
            boxShadow: theme.cardShadow,
          }}
          className="rounded-[22px] border px-4 py-2.5 flex flex-col items-center justify-center transition-all duration-200"
        >
          <div className="flex items-center gap-1.5 mb-0.5 opacity-80">
            <Trophy size={12} className="text-amber-500 fill-amber-500" />
            <span
              style={{ color: theme.textSecondary }}
              className="text-[11px] font-bold uppercase tracking-widest"
            >
              РЕКОРД РЕЖИМА
            </span>
          </div>
          <span
            style={{ color: '#d97706' }}
            className="text-3xl font-black tracking-tight leading-none tabular-nums"
          >
            {bestScore.toLocaleString()}
          </span>
        </div>
      </div>
    </header>
  );
};
