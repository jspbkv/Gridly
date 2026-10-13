import React from 'react';
import { Theme } from '../types/theme';
import { sound } from '../utils/audio';
import { haptics } from '../utils/haptics';
import {
  Play,
  Trophy,
  Settings,
  HelpCircle,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  User,
  CalendarCheck,
} from 'lucide-react';
import { GameModeConfig } from '../types/gameMode';
import { useAuth } from '../context/AuthContext';

interface MainMenuProps {
  theme: Theme;
  bestScore: number;
  currentMode: GameModeConfig;
  isFullscreen: boolean;
  playerName?: string;
  playerAvatarEmoji?: string;
  dailyQuestsSummary?: {
    completedCount: number;
    totalCount: number;
  };
  achievementsSummary?: {
    unlockedCount: number;
    totalCount: number;
  };
  onPlay: () => void;
  onOpenModes: () => void;
  onOpenProfile: () => void;
  onOpenDailyQuests?: () => void;
  onOpenLeaderboard?: () => void;
  onOpenSettings: () => void;
  onOpenOnboarding: () => void;
  onToggleFullscreen: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  theme,
  bestScore,
  currentMode,
  isFullscreen,
  playerName = 'Игрок',
  playerAvatarEmoji = '🦊',
  dailyQuestsSummary,
  achievementsSummary,
  onPlay,
  onOpenModes,
  onOpenProfile,
  onOpenDailyQuests,
  onOpenLeaderboard,
  onOpenSettings,
  onOpenOnboarding,
  onToggleFullscreen,
}) => {
  const { isAuthenticated, openAuthGate } = useAuth();

  return (
    <div className="w-full h-full max-w-[420px] mx-auto flex flex-col justify-between items-center px-5 py-5 select-none touch-none">
      {/* Top Bar with Mini Controls */}
      <div className="w-full flex items-center justify-between">
        {/* Left: Guest / Google Status Badge */}
        {isAuthenticated ? (
          <div className="flex items-center gap-1.5 opacity-90">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span
              style={{ color: theme.accent }}
              className="text-xs font-black uppercase tracking-wider"
            >
              Google Профиль
            </span>
          </div>
        ) : (
          <button
            onClick={() => {
              sound.playClick();
              haptics.tapLight();
              openAuthGate('Войдите через Google, чтобы открыть кастомизацию и сохранять рекорды');
            }}
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
            }}
            className="px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span
              style={{ color: theme.textSecondary }}
              className="text-[11px] font-bold"
            >
              Гость · <span className="text-amber-500 underline">Войти</span>
            </span>
          </button>
        )}

        <div className="flex items-center gap-2">
          {/* Leaderboard shortcut */}
          {onOpenLeaderboard && (
            <button
              onClick={() => {
                sound.playClick();
                haptics.tapLight();
                onOpenLeaderboard();
              }}
              title="Топ игроков"
              style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.cardBorder,
                boxShadow: theme.cardShadow,
              }}
              className="w-10 h-10 rounded-2xl border flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
            >
              <Trophy size={17} className="text-amber-500 fill-amber-500" />
            </button>
          )}

          {/* Daily Quests shortcut */}
          {onOpenDailyQuests && (
            <button
              onClick={() => {
                sound.playClick();
                haptics.tapLight();
                onOpenDailyQuests();
              }}
              title="Ежедневные задания"
              style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.cardBorder,
                boxShadow: theme.cardShadow,
              }}
              className="h-10 px-2.5 rounded-2xl border flex items-center gap-1.5 active:scale-90 transition-transform cursor-pointer"
            >
              <CalendarCheck size={16} style={{ color: theme.accent }} />
              {dailyQuestsSummary && (
                <span
                  style={{
                    color:
                      dailyQuestsSummary.completedCount === dailyQuestsSummary.totalCount
                        ? '#10b981'
                        : theme.accent,
                  }}
                  className="text-[11px] font-black tabular-nums"
                >
                  {dailyQuestsSummary.completedCount}/{dailyQuestsSummary.totalCount}
                </span>
              )}
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              haptics.tapLight();
              onToggleFullscreen();
            }}
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
            onClick={() => {
              sound.playClick();
              haptics.tapLight();
              onOpenSettings();
            }}
            title="Настройки"
            style={{
              backgroundColor: theme.cardBg,
              color: theme.textSecondary,
              borderColor: theme.cardBorder,
              boxShadow: theme.cardShadow,
            }}
            className="w-10 h-10 rounded-2xl border flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
          >
            <Settings size={18} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Center Brand & Best Score */}
      <div className="flex flex-col items-center gap-3.5 my-auto">
        {/* Tactile Ceramic Logo Icon */}
        <div
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
            boxShadow: theme.boardShadow,
          }}
          className="p-3.5 rounded-[26px] border-2 grid grid-cols-2 gap-2.5 animate-pop-in shadow-xl"
        >
          <div
            style={{ backgroundColor: theme.blockColors[0] }}
            className="w-9 h-9 rounded-[8px] tactile-block"
          />
          <div
            style={{ backgroundColor: theme.blockColors[1] }}
            className="w-9 h-9 rounded-[8px] tactile-block"
          />
          <div
            style={{ backgroundColor: theme.blockColors[2] }}
            className="w-9 h-9 rounded-[8px] tactile-block"
          />
          <div
            style={{ backgroundColor: theme.blockColors[4] || theme.blockColors[3] }}
            className="w-9 h-9 rounded-[8px] tactile-block"
          />
        </div>

        {/* Big Game Title */}
        <div className="flex flex-col items-center text-center">
          <h1
            style={{ color: theme.textPrimary }}
            className="text-5xl font-black tracking-tight"
          >
            GRIDLY
          </h1>
          <p
            style={{ color: theme.textSecondary }}
            className="text-xs font-bold uppercase tracking-widest mt-0.5 opacity-75"
          >
            Блочная головоломка
          </p>
        </div>

        {/* High Score Card - Clicking opens Profile / Stats */}
        <button
          onClick={() => {
            sound.playClick();
            haptics.tapLight();
            onOpenProfile();
          }}
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
            boxShadow: theme.cardShadow,
          }}
          className="px-5 py-2 rounded-2xl border flex items-center gap-2.5 active:scale-95 transition-all cursor-pointer"
          title="Открыть профиль и статистику"
        >
          <Trophy size={16} className="text-amber-500 fill-amber-500" />
          <div className="flex items-center gap-1.5">
            <span
              style={{ color: theme.textSecondary }}
              className="text-[11px] font-bold uppercase tracking-wider"
            >
              РЕКОРД:
            </span>
            <span
              style={{ color: '#d97706' }}
              className="text-xl font-black tabular-nums"
            >
              {bestScore.toLocaleString()}
            </span>
          </div>
        </button>
      </div>

      {/* Main Actions Bottom Area */}
      <div className="w-full flex flex-col gap-2.5">
        {/* BIG HERO PLAY BUTTON */}
        <button
          onClick={() => {
            sound.playClick();
            haptics.tapPlace();
            onPlay();
          }}
          style={{
            backgroundColor: theme.accent,
            color: '#ffffff',
            boxShadow: `0 12px 28px -6px ${theme.accent}66, 0 4px 12px rgba(0,0,0,0.12)`,
          }}
          className="w-full h-15 rounded-[22px] font-black text-xl flex items-center justify-center gap-3 active:scale-95 transition-all cursor-pointer shadow-lg"
        >
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Play size={20} className="fill-white translate-x-0.5" />
          </div>
          <span>Играть</span>
        </button>

        {/* Mode Selector Button */}
        <button
          onClick={() => {
            sound.playClick();
            haptics.tapLight();
            onOpenModes();
          }}
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
            boxShadow: theme.cardShadow,
          }}
          className="w-full h-12 rounded-2xl border px-4 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Layers size={18} style={{ color: theme.accent }} />
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold leading-tight">
                Режим: {currentMode.title}
              </span>
              <span
                style={{ color: theme.textSecondary }}
                className="text-[10px] leading-tight"
              >
                {currentMode.badge}
              </span>
            </div>
          </div>
          <span
            style={{
              backgroundColor: theme.accentMuted,
              color: theme.accent,
            }}
            className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg"
          >
            Сменить
          </span>
        </button>

        {/* Global Leaderboard Button */}
        {onOpenLeaderboard && (
          <button
            onClick={() => {
              sound.playClick();
              haptics.tapLight();
              onOpenLeaderboard();
            }}
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
              boxShadow: theme.cardShadow,
            }}
            className="w-full h-12 rounded-2xl border px-4 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div
                style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }}
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              >
                <Trophy size={17} className="text-amber-500 fill-amber-500" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold leading-tight">
                  Топ игроков (Мировой рейтинг)
                </span>
                <span
                  style={{ color: theme.textSecondary }}
                  className="text-[10px] leading-tight"
                >
                  Supabase таблица лидеров
                </span>
              </div>
            </div>
            <span
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: '#d97706',
              }}
              className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg"
            >
              Топ 🏆
            </span>
          </button>
        )}

        {/* Daily Quests Button */}
        {onOpenDailyQuests && (
          <button
            onClick={() => {
              sound.playClick();
              haptics.tapLight();
              onOpenDailyQuests();
            }}
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
              boxShadow: theme.cardShadow,
            }}
            className="w-full h-12 rounded-2xl border px-4 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div
                style={{ backgroundColor: `${theme.accent}18` }}
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              >
                <CalendarCheck size={17} style={{ color: theme.accent }} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold leading-tight">
                  Ежедневные задания
                </span>
                <span
                  style={{ color: theme.textSecondary }}
                  className="text-[10px] leading-tight"
                >
                  {dailyQuestsSummary
                    ? dailyQuestsSummary.completedCount === dailyQuestsSummary.totalCount
                      ? 'Все задания выполнены! ✨'
                      : `Выполнено ${dailyQuestsSummary.completedCount} из ${dailyQuestsSummary.totalCount}`
                    : '3 задания на сегодня'}
                </span>
              </div>
            </div>
            <span
              style={{
                backgroundColor:
                  dailyQuestsSummary?.completedCount === dailyQuestsSummary?.totalCount
                    ? 'rgba(16, 185, 129, 0.15)'
                    : theme.accentMuted,
                color:
                  dailyQuestsSummary?.completedCount === dailyQuestsSummary?.totalCount
                    ? '#10b981'
                    : theme.accent,
              }}
              className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg tabular-nums"
            >
              {dailyQuestsSummary
                ? `${dailyQuestsSummary.completedCount}/${dailyQuestsSummary.totalCount}`
                : '3'}
            </span>
          </button>
        )}

        {/* Profile Button with Player Name & Avatar */}
        <button
          onClick={() => {
            sound.playClick();
            haptics.tapLight();
            onOpenProfile();
          }}
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
            boxShadow: theme.cardShadow,
          }}
          className="w-full h-12 rounded-2xl border px-4 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div
              style={{ backgroundColor: theme.bgBoard }}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-lg border border-black/5 dark:border-white/5"
            >
              <span>{playerAvatarEmoji}</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold leading-tight">
                Профиль: {playerName}
              </span>
              <span
                style={{ color: theme.textSecondary }}
                className="text-[10px] leading-tight"
              >
                Достижения, медали и рекорды
              </span>
            </div>
          </div>
          <span
            style={{
              backgroundColor: theme.accentMuted,
              color: theme.accent,
            }}
            className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1 tabular-nums"
          >
            {achievementsSummary ? (
              <>
                <span>🏆</span>
                <span>
                  {achievementsSummary.unlockedCount}/{achievementsSummary.totalCount}
                </span>
              </>
            ) : (
              'Профиль'
            )}
          </span>
        </button>

        {/* Secondary Action Row: "Как играть" & Settings */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => {
              sound.playClick();
              haptics.tapLight();
              onOpenOnboarding();
            }}
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
              color: theme.textPrimary,
              boxShadow: theme.cardShadow,
            }}
            className="h-11 rounded-2xl border flex items-center justify-center gap-2 font-bold text-xs active:scale-95 transition-all cursor-pointer"
          >
            <HelpCircle size={15} style={{ color: theme.accent }} />
            <span>Как играть</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              haptics.tapLight();
              onOpenSettings();
            }}
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
              color: theme.textPrimary,
              boxShadow: theme.cardShadow,
            }}
            className="h-11 rounded-2xl border flex items-center justify-center gap-2 font-bold text-xs active:scale-95 transition-all cursor-pointer"
          >
            <Settings size={15} style={{ color: theme.accent }} />
            <span>Настройки</span>
          </button>
        </div>
      </div>
    </div>
  );
};
