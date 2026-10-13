import React, { useState, useEffect } from 'react';
import { Theme } from '../types/theme';
import { DailyQuest, DailyQuestsState } from '../types/dailyQuest';
import { GameModeId } from '../types/gameMode';
import { getTimeUntilMidnight } from '../utils/dailyQuestStorage';
import { sound } from '../utils/audio';
import { haptics } from '../utils/haptics';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Trophy,
  Flame,
  Gamepad2,
  Zap,
  Award,
  Grid,
  Layers,
  Sparkles,
  Play,
  CalendarCheck,
} from 'lucide-react';

interface DailyQuestsScreenProps {
  theme: Theme;
  questsState: DailyQuestsState;
  onBack: () => void;
  onPlayMode?: (modeId: GameModeId) => void;
}

export const DailyQuestsScreen: React.FC<DailyQuestsScreenProps> = ({
  theme,
  questsState,
  onBack,
  onPlayMode,
}) => {
  // Real-time countdown timer to 00:00 local midnight
  const [countdown, setCountdown] = useState(() => getTimeUntilMidnight().formatted);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeUntilMidnight().formatted);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const quests = questsState.quests || [];
  const completedCount = quests.filter((q) => q.isCompleted).length;
  const totalCount = quests.length || 3;
  const isAllCompleted = completedCount === totalCount && totalCount > 0;
  const overallPercentage = Math.round((completedCount / totalCount) * 100);

  const renderQuestIcon = (iconName: DailyQuest['iconName'], color: string) => {
    const props = { size: 20, style: { color }, strokeWidth: 2.3 };
    switch (iconName) {
      case 'Layers':
        return <Layers {...props} />;
      case 'Trophy':
        return <Trophy {...props} />;
      case 'Flame':
        return <Flame {...props} />;
      case 'Gamepad2':
        return <Gamepad2 {...props} />;
      case 'Zap':
        return <Zap {...props} />;
      case 'Award':
        return <Award {...props} />;
      case 'Grid':
        return <Grid {...props} />;
      case 'Clock':
        return <Clock {...props} />;
      case 'Sparkles':
      default:
        return <Sparkles {...props} />;
    }
  };

  return (
    <div className="w-full h-full max-w-[440px] mx-auto flex flex-col justify-between px-5 py-4 select-none touch-none overflow-hidden">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-3 shrink-0">
        <button
          onClick={() => {
            sound.playClick();
            haptics.tapLight();
            onBack();
          }}
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
            color: theme.textPrimary,
            boxShadow: theme.cardShadow,
          }}
          className="w-11 h-11 rounded-2xl border flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
          title="Назад"
        >
          <ArrowLeft size={20} strokeWidth={2.4} />
        </button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <CalendarCheck size={16} style={{ color: theme.accent }} />
            <h2
              style={{ color: theme.textPrimary }}
              className="text-base font-black tracking-tight uppercase"
            >
              Ежедневные задания
            </h2>
          </div>
          <span
            style={{ color: theme.textSecondary }}
            className="text-[11px] font-semibold"
          >
            Обновление каждый день в 00:00
          </span>
        </div>

        {/* Live Countdown Badge */}
        <div
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
            boxShadow: theme.cardShadow,
          }}
          className="px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 text-[11px] font-mono font-bold"
          title="Время до сброса заданий"
        >
          <Clock size={12} className="text-amber-500 animate-pulse" />
          <span style={{ color: theme.textPrimary }}>{countdown}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full flex-1 flex flex-col gap-3 min-h-0 overflow-y-auto no-scrollbar py-1">
        {/* Overall Daily Progress Banner */}
        <div
          style={{
            backgroundColor: theme.cardBg,
            borderColor: isAllCompleted ? '#10b981' : theme.cardBorder,
            boxShadow: theme.cardShadow,
          }}
          className={`p-4 rounded-[24px] border-2 flex flex-col gap-2.5 transition-all relative overflow-hidden ${
            isAllCompleted ? 'ring-2 ring-emerald-500/20' : ''
          }`}
        >
          {/* Ambient Glow */}
          <div
            style={{
              background: isAllCompleted
                ? 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)'
                : `radial-gradient(circle, ${theme.accentMuted} 0%, transparent 70%)`,
            }}
            className="absolute -top-10 -right-10 w-36 h-36 pointer-events-none"
          />

          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {isAllCompleted ? '🏆' : completedCount > 0 ? '⚡' : '🎯'}
              </span>
              <div>
                <h3
                  style={{ color: theme.textPrimary }}
                  className="text-sm font-black tracking-tight"
                >
                  {isAllCompleted
                    ? 'Все задания выполнены!'
                    : `Прогресс дня: ${completedCount} из ${totalCount}`}
                </h3>
                <p
                  style={{ color: theme.textSecondary }}
                  className="text-[11px] font-medium leading-tight"
                >
                  {isAllCompleted
                    ? 'Отличная работа! Возвращайтесь завтра за новыми.'
                    : 'Выполняйте задания для тренировки мастерства'}
                </p>
              </div>
            </div>

            <span
              style={{
                backgroundColor: isAllCompleted ? 'rgba(16,185,129,0.15)' : theme.accentMuted,
                color: isAllCompleted ? '#10b981' : theme.accent,
              }}
              className="px-2.5 py-1 rounded-xl text-xs font-black"
            >
              {overallPercentage}%
            </span>
          </div>

          {/* Overall Progress Bar */}
          <div className="w-full h-2.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden p-0.5">
            <div
              style={{
                width: `${overallPercentage}%`,
                backgroundColor: isAllCompleted ? '#10b981' : theme.accent,
              }}
              className="h-full rounded-full transition-all duration-500 ease-out shadow-sm"
            />
          </div>
        </div>

        {/* 3 Quest Cards */}
        <div className="flex flex-col gap-2.5">
          {quests.map((quest, index) => {
            const percent = Math.min(
              100,
              Math.round((quest.currentValue / quest.targetValue) * 100)
            );

            return (
              <div
                key={quest.id || index}
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: quest.isCompleted
                    ? `${quest.accentColor}66`
                    : theme.cardBorder,
                  boxShadow: theme.cardShadow,
                }}
                className={`p-3.5 rounded-[22px] border-2 flex flex-col gap-2.5 transition-all ${
                  quest.isCompleted ? 'bg-opacity-95' : ''
                }`}
              >
                {/* Header: Icon, Titles & Status Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Icon container */}
                    <div
                      style={{
                        backgroundColor: `${quest.accentColor}18`,
                        borderColor: `${quest.accentColor}33`,
                      }}
                      className="w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm"
                    >
                      {renderQuestIcon(quest.iconName, quest.accentColor)}
                    </div>

                    <div className="flex flex-col">
                      <h4
                        style={{ color: theme.textPrimary }}
                        className="text-xs font-black tracking-tight leading-snug"
                      >
                        {quest.title}
                      </h4>
                      <p
                        style={{ color: theme.textSecondary }}
                        className="text-[10px] font-medium leading-tight mt-0.5"
                      >
                        {quest.description}
                      </p>
                    </div>
                  </div>

                  {/* Status badge */}
                  {quest.isCompleted ? (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-black shrink-0 animate-pop-in">
                      <CheckCircle2 size={13} className="stroke-[2.5]" />
                      <span>Готово</span>
                    </div>
                  ) : (
                    <span
                      style={{
                        backgroundColor: `${quest.accentColor}14`,
                        color: quest.accentColor,
                      }}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-bold shrink-0 tabular-nums"
                    >
                      {percent}%
                    </span>
                  )}
                </div>

                {/* Progress Bar & Numeric Indicator */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span style={{ color: theme.textSecondary }}>
                      Прогресс задания
                    </span>
                    <span
                      style={{
                        color: quest.isCompleted ? '#10b981' : theme.textPrimary,
                      }}
                      className="tabular-nums font-extrabold"
                    >
                      {quest.currentValue.toLocaleString()} /{' '}
                      {quest.targetValue.toLocaleString()}
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                    <div
                      style={{
                        width: `${percent}%`,
                        backgroundColor: quest.accentColor,
                      }}
                      className="h-full rounded-full transition-all duration-500 ease-out"
                    />
                  </div>
                </div>

                {/* Quick Action Button for incomplete quest */}
                {!quest.isCompleted && onPlayMode && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      haptics.tapLight();
                      onPlayMode(quest.targetMode || 'classic');
                    }}
                    style={{
                      backgroundColor: theme.bgBoard,
                      borderColor: theme.cardBorder,
                      color: theme.textPrimary,
                    }}
                    className="w-full py-1.5 rounded-xl border flex items-center justify-center gap-1.5 text-[11px] font-extrabold active:scale-[0.98] transition-transform cursor-pointer hover:opacity-90"
                  >
                    <Play size={12} style={{ color: quest.accentColor }} className="fill-current" />
                    <span>
                      {quest.targetMode
                        ? `Играть в «${
                            quest.targetMode === 'classic'
                              ? 'Классику'
                              : quest.targetMode === 'time_attack'
                              ? 'На время'
                              : quest.targetMode === 'zen'
                              ? 'Дзен'
                              : 'Вызов'
                          }»`
                        : 'Перейти к игре'}
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Info note */}
      <div className="w-full pt-3 shrink-0 text-center">
        <p
          style={{ color: theme.textSecondary }}
          className="text-[10px] font-medium leading-relaxed opacity-75"
        >
          Задания обновляются каждый день в 00:00 по местному времени.
          <br />
          Прогресс сохраняется автоматически.
        </p>
      </div>
    </div>
  );
};
