import { RotateCcw, Trophy, Settings, Flame, Home, User, CalendarCheck } from 'lucide-react';
import { Theme } from '../types/theme';
import { sound } from '../utils/audio';
import { haptics } from '../utils/haptics';

import { GameModeConfig } from '../types/gameMode';

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  bestScore: number;
  isNewRecord: boolean;
  totalLinesCleared: number;
  maxCombo: number;
  theme: Theme;
  modeConfig?: GameModeConfig;
  isVictory?: boolean;
  reason?: string;
  dailyQuestsSummary?: {
    completedCount: number;
    totalCount: number;
  };
  onPlayAgain: () => void;
  onOpenSettings: () => void;
  onGoHome?: () => void;
  onOpenProfile?: () => void;
  onOpenDailyQuests?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  score,
  bestScore,
  isNewRecord,
  totalLinesCleared,
  maxCombo,
  theme,
  modeConfig,
  isVictory,
  reason,
  dailyQuestsSummary,
  onPlayAgain,
  onOpenSettings,
  onGoHome,
  onOpenProfile,
  onOpenDailyQuests,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm select-none">
      <div
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.cardBorder,
          color: theme.textPrimary,
          boxShadow: theme.cardShadow,
        }}
        className="w-full max-w-sm rounded-[30px] border p-6 flex flex-col items-center text-center shadow-2xl relative overflow-hidden"
      >
        {/* Soft top ambient tint */}
        <div
          style={{
            background: `radial-gradient(circle, ${theme.accentMuted} 0%, transparent 70%)`,
          }}
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 pointer-events-none"
        />

        {/* Title */}
        <div className="mb-2">
          {isVictory ? (
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                color: '#10b981',
                borderColor: 'rgba(16, 185, 129, 0.4)',
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black tracking-wider uppercase mb-2 border animate-bounce"
            >
              <Trophy size={14} className="fill-current" />
              <span>Цель достигнута!</span>
            </div>
          ) : isNewRecord ? (
            <div
              style={{
                backgroundColor: theme.accentMuted,
                color: theme.accent,
                borderColor: `${theme.accent}40`,
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black tracking-wider uppercase mb-2 border animate-bounce"
            >
              <Trophy size={14} className="fill-current" />
              <span>Новый Рекорд!</span>
            </div>
          ) : (
            <span
              style={{ color: theme.textSecondary }}
              className="text-[11px] font-bold uppercase tracking-widest opacity-80"
            >
              {reason || 'Конец раунда'}
            </span>
          )}
          <h2 className="text-2xl font-black tracking-tight mt-0.5">
            {isVictory
              ? 'Вызов пройден!'
              : isNewRecord
              ? 'Превосходно!'
              : reason === 'Время вышло'
              ? 'Время истекло!'
              : 'Хорошая игра!'}
          </h2>
        </div>

        {/* Main Score Display */}
        <div
          style={{
            backgroundColor: theme.bgBoard,
            borderColor: theme.boardBorder,
          }}
          className="my-3 py-3 px-6 rounded-2xl border w-full flex flex-col items-center"
        >
          <span
            style={{ color: theme.textSecondary }}
            className="text-[11px] font-bold uppercase tracking-widest opacity-75"
          >
            Итоговый счёт
          </span>
          <span
            style={{ color: theme.textPrimary }}
            className="text-4xl font-black tracking-tight mt-0.5 tabular-nums"
          >
            {score.toLocaleString()}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 w-full mb-5 text-left">
          <div
            style={{
              backgroundColor: theme.bgBoard,
              borderColor: theme.boardBorder,
            }}
            className="p-3 rounded-2xl border flex flex-col"
          >
            <span
              style={{ color: theme.textSecondary }}
              className="text-[10px] font-bold uppercase tracking-wider opacity-75"
            >
              Линий убрано
            </span>
            <span className="text-lg font-black">{totalLinesCleared}</span>
          </div>

          <div
            style={{
              backgroundColor: theme.bgBoard,
              borderColor: theme.boardBorder,
            }}
            className="p-3 rounded-2xl border flex flex-col"
          >
            <div className="flex items-center gap-1">
              <Flame size={12} className="text-amber-500 fill-amber-500" />
              <span
                style={{ color: theme.textSecondary }}
                className="text-[10px] font-bold uppercase tracking-wider opacity-75"
              >
                Макс. комбо
              </span>
            </div>
            <span className="text-lg font-black">x{Math.max(1, maxCombo)}</span>
          </div>

          <div
            style={{
              backgroundColor: theme.bgBoard,
              borderColor: theme.boardBorder,
            }}
            className="col-span-2 p-2.5 px-3 rounded-2xl border flex items-center justify-between"
          >
            <div className="flex items-center gap-1.5">
              <Trophy size={13} className="text-amber-500 fill-amber-500" />
              <span
                style={{ color: theme.textSecondary }}
                className="text-xs font-semibold"
              >
                Лучший результат:
              </span>
            </div>
            <span className="text-sm font-black text-amber-600 dark:text-amber-400">
              {bestScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Daily Quests Mini Banner */}
        {dailyQuestsSummary && onOpenDailyQuests && (
          <button
            onClick={() => {
              sound.playClick();
              haptics.tapLight();
              onOpenDailyQuests();
            }}
            style={{
              backgroundColor: theme.bgBoard,
              borderColor: theme.cardBorder,
            }}
            className="w-full mb-3 p-2.5 rounded-2xl border flex items-center justify-between active:scale-95 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <CalendarCheck size={16} style={{ color: theme.accent }} />
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold leading-tight">
                  Ежедневные задания
                </span>
                <span
                  style={{ color: theme.textSecondary }}
                  className="text-[10px] leading-tight"
                >
                  {dailyQuestsSummary.completedCount === dailyQuestsSummary.totalCount
                    ? 'Все задания выполнены! ✨'
                    : `Выполнено ${dailyQuestsSummary.completedCount} из ${dailyQuestsSummary.totalCount}`}
                </span>
              </div>
            </div>
            <span
              style={{
                backgroundColor:
                  dailyQuestsSummary.completedCount === dailyQuestsSummary.totalCount
                    ? 'rgba(16, 185, 129, 0.15)'
                    : theme.accentMuted,
                color:
                  dailyQuestsSummary.completedCount === dailyQuestsSummary.totalCount
                    ? '#10b981'
                    : theme.accent,
              }}
              className="text-[11px] font-black px-2 py-0.5 rounded-lg tabular-nums"
            >
              {dailyQuestsSummary.completedCount}/{dailyQuestsSummary.totalCount}
            </span>
          </button>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={() => {
              sound.playClick();
              haptics.tapPlace();
              onPlayAgain();
            }}
            style={{
              backgroundColor: theme.accent,
              color: '#ffffff',
            }}
            className="w-full py-3.5 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw size={18} strokeWidth={2.5} />
            <span>Играть снова</span>
          </button>

          <div className="grid grid-cols-3 gap-2 w-full">
            {onGoHome && (
              <button
                onClick={() => {
                  sound.playClick();
                  haptics.tapLight();
                  onGoHome();
                }}
                style={{
                  borderColor: theme.cardBorder,
                  color: theme.textSecondary,
                  backgroundColor: theme.bgBoard,
                }}
                className="w-full py-2.5 rounded-2xl border font-bold text-xs flex flex-col items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                title="Главное меню"
              >
                <Home size={15} />
                <span>В меню</span>
              </button>
            )}

            {onOpenProfile && (
              <button
                onClick={() => {
                  sound.playClick();
                  haptics.tapLight();
                  onOpenProfile();
                }}
                style={{
                  borderColor: theme.cardBorder,
                  color: theme.accent,
                  backgroundColor: theme.bgBoard,
                }}
                className="w-full py-2.5 rounded-2xl border font-bold text-xs flex flex-col items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                title="Профиль игрока"
              >
                <User size={15} />
                <span>Профиль</span>
              </button>
            )}

            <button
              onClick={() => {
                sound.playClick();
                onOpenSettings();
              }}
              style={{
                borderColor: theme.cardBorder,
                color: theme.textSecondary,
                backgroundColor: theme.bgBoard,
              }}
              className="w-full py-2.5 rounded-2xl border font-bold text-xs flex flex-col items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
              title="Настройки"
            >
              <Settings size={15} />
              <span>Настройки</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
