import React, { useState } from 'react';
import { Theme } from '../types/theme';
import { PlayerProfile } from '../types/profile';
import { GAME_MODES, GameModeId } from '../types/gameMode';
import { sound } from '../utils/audio';
import { haptics } from '../utils/haptics';
import {
  ArrowLeft,
  Trophy,
  Flame,
  Grid,
  Gamepad2,
  Calendar,
  BarChart3,
  Edit2,
  Check,
  X,
  Sparkles,
  Heart,
  Award,
  Lock,
} from 'lucide-react';
import { AchievementCard } from './AchievementCard';
import { calculateAchievements, MEDAL_CONFIGS } from '../utils/achievements';
import { ComputedAchievement } from '../types/achievement';
import { useAuth } from '../context/AuthContext';
import { syncUserProfileToSupabase } from '../services/supabase';

interface ProfileScreenProps {
  theme: Theme;
  profile: PlayerProfile;
  onUpdateProfile: (updated: PlayerProfile) => void;
  onOpenStats: () => void;
  onBack: () => void;
}

const AVATAR_OPTIONS = [
  { id: 'fox', emoji: '🦊', label: 'Лисичка' },
  { id: 'cat', emoji: '🐱', label: 'Котик' },
  { id: 'bear', emoji: '🐻', label: 'Мишка' },
  { id: 'panda', emoji: '🐼', label: 'Панда' },
  { id: 'owl', emoji: '🦉', label: 'Сова' },
  { id: 'star', emoji: '⭐', label: 'Звезда' },
];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  theme,
  profile,
  onUpdateProfile,
  onOpenStats,
  onBack,
}) => {
  const { user, isAuthenticated, openAuthGate, logout } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const [isSelectingAvatar, setIsSelectingAvatar] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'unlocked' | 'locked' | 'lines' | 'combo' | 'zen'
  >('all');
  const [selectedAchievement, setSelectedAchievement] =
    useState<ComputedAchievement | null>(null);

  const allAchievements = calculateAchievements(profile);
  const totalAchievements = allAchievements.length;
  const unlockedCount = allAchievements.filter((a) => a.isUnlocked).length;
  const overallPercentage =
    totalAchievements > 0 ? Math.round((unlockedCount / totalAchievements) * 100) : 0;

  const filteredAchievements = allAchievements.filter((a) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unlocked') return a.isUnlocked;
    if (activeFilter === 'locked') return !a.isUnlocked;
    return a.category === activeFilter;
  });

  const handleSaveName = () => {
    if (!isAuthenticated) {
      openAuthGate('Смена ника доступна после регистрации через Google!');
      setIsEditingName(false);
      return;
    }
    const trimmed = nameInput.trim();
    if (trimmed.length > 0) {
      sound.playClick();
      haptics.tapLight();
      const updated = { ...profile, name: trimmed.slice(0, 16) };
      onUpdateProfile(updated);
      if (user) {
        syncUserProfileToSupabase(user.id, updated.name, updated.avatarIcon);
      }
    }
    setIsEditingName(false);
  };

  const handleSelectAvatar = (avatarId: string) => {
    if (!isAuthenticated) {
      openAuthGate('Смена аватара доступна после регистрации через Google!');
      setIsSelectingAvatar(false);
      return;
    }
    sound.playClick();
    haptics.tapLight();
    const updated = { ...profile, avatarIcon: avatarId };
    onUpdateProfile(updated);
    if (user) {
      syncUserProfileToSupabase(user.id, updated.name, updated.avatarIcon);
    }
    setIsSelectingAvatar(false);
  };

  const currentAvatar =
    AVATAR_OPTIONS.find((a) => a.id === profile.avatarIcon) || AVATAR_OPTIONS[0];

  const favModeConfig =
    GAME_MODES.find((m) => m.id === profile.favoriteMode) || GAME_MODES[0];

  return (
    <div className="w-full h-full max-w-[430px] mx-auto flex flex-col justify-between px-5 py-5 select-none touch-none overflow-hidden">
      {/* Top Navigation */}
      <div className="w-full flex items-center justify-between mb-3">
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
          <h2
            style={{ color: theme.textPrimary }}
            className="text-lg font-black tracking-tight uppercase"
          >
            Профиль игрока
          </h2>
          <span
            style={{ color: theme.textSecondary }}
            className="text-[10px] font-bold tracking-wider uppercase opacity-75"
          >
            Личные рекорды и статистика
          </span>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            haptics.tapLight();
            onOpenStats();
          }}
          style={{
            backgroundColor: theme.accentMuted,
            borderColor: theme.accent,
            color: theme.accent,
          }}
          className="w-11 h-11 rounded-2xl border flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
          title="Подробная статистика"
        >
          <BarChart3 size={20} strokeWidth={2.4} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="w-full flex-1 flex flex-col gap-3.5 my-auto overflow-y-auto no-scrollbar py-1">
        {/* Profile Card Header with Avatar & Name */}
        <div
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
            boxShadow: theme.boardShadow,
          }}
          className="w-full rounded-[26px] border-2 p-4 flex flex-col items-center relative shadow-sm"
        >
          {/* Avatar Button */}
          <div className="relative mb-2">
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  sound.playClick();
                  haptics.tapLight();
                  openAuthGate('Смена аватара доступна после регистрации через Google!');
                  return;
                }
                sound.playClick();
                haptics.tapLight();
                setIsSelectingAvatar(!isSelectingAvatar);
              }}
              style={{
                backgroundColor: theme.bgBoard,
                borderColor: theme.accent,
                boxShadow: `0 8px 18px -4px ${theme.accent}44`,
              }}
              className="w-20 h-20 rounded-2xl border-2 flex items-center justify-center text-4xl active:scale-95 transition-transform cursor-pointer shadow-md"
              title={isAuthenticated ? 'Сменить аватар' : 'Смена аватара (Требуется Google)'}
            >
              <span>{currentAvatar.emoji}</span>
            </button>
            {isAuthenticated ? (
              <div
                style={{ backgroundColor: theme.accent, color: '#ffffff' }}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-sm pointer-events-none"
              >
                <Edit2 size={11} strokeWidth={2.5} />
              </div>
            ) : (
              <div
                style={{ backgroundColor: '#f59e0b', color: '#ffffff' }}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-sm pointer-events-none"
                title="Заблокировано для гостей"
              >
                <Lock size={11} strokeWidth={2.5} />
              </div>
            )}
          </div>

          {/* Avatar Picker Drawer */}
          {isSelectingAvatar && isAuthenticated && (
            <div
              style={{
                backgroundColor: theme.bgBoard,
                borderColor: theme.cardBorder,
              }}
              className="w-full mb-3 p-2.5 rounded-2xl border flex items-center justify-around gap-1 animate-pop-in"
            >
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av.id}
                  onClick={() => handleSelectAvatar(av.id)}
                  style={{
                    backgroundColor:
                      profile.avatarIcon === av.id ? theme.cardBg : 'transparent',
                    borderColor:
                      profile.avatarIcon === av.id ? theme.accent : 'transparent',
                  }}
                  className="w-10 h-10 rounded-xl border flex items-center justify-center text-2xl active:scale-90 transition-transform cursor-pointer"
                  title={av.label}
                >
                  {av.emoji}
                </button>
              ))}
            </div>
          )}

          {/* Editable Name */}
          <div className="flex items-center gap-2 mb-1">
            {isEditingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  maxLength={16}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') setIsEditingName(false);
                  }}
                  style={{
                    backgroundColor: theme.bgBoard,
                    borderColor: theme.accent,
                    color: theme.textPrimary,
                  }}
                  className="px-3 py-1 text-lg font-black rounded-xl border-2 text-center outline-none w-40"
                />
                <button
                  onClick={handleSaveName}
                  style={{ backgroundColor: theme.accent, color: '#ffffff' }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
                  title="Сохранить"
                >
                  <Check size={16} strokeWidth={3} />
                </button>
                <button
                  onClick={() => {
                    setNameInput(profile.name);
                    setIsEditingName(false);
                  }}
                  style={{
                    backgroundColor: theme.bgBoard,
                    color: theme.textSecondary,
                  }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
                  title="Отмена"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3
                  style={{ color: theme.textPrimary }}
                  className="text-2xl font-black tracking-tight"
                >
                  {profile.name}
                </h3>
                <button
                  onClick={() => {
                    sound.playClick();
                    haptics.tapLight();
                    if (!isAuthenticated) {
                      openAuthGate('Смена ника доступна после регистрации через Google!');
                      return;
                    }
                    setNameInput(profile.name);
                    setIsEditingName(true);
                  }}
                  style={{
                    color: isAuthenticated ? theme.textSecondary : '#f59e0b',
                    backgroundColor: theme.bgBoard,
                  }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
                  title={isAuthenticated ? 'Изменить имя' : 'Смена ника (Требуется Google)'}
                >
                  {isAuthenticated ? (
                    <Edit2 size={13} strokeWidth={2.2} />
                  ) : (
                    <Lock size={13} strokeWidth={2.2} />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* First Played Date Badge */}
          <div className="flex items-center gap-1.5 opacity-70 mt-0.5">
            <Calendar size={13} style={{ color: theme.textSecondary }} />
            <span
              style={{ color: theme.textSecondary }}
              className="text-xs font-semibold"
            >
              В игре с {profile.firstPlayedDate}
            </span>
          </div>

          {/* Google Account Status Badge */}
          {isAuthenticated ? (
            <div className="w-full mt-3 pt-2.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-emerald-500 font-bold truncate max-w-[220px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">{user?.email || 'Google Аккаунт'}</span>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  haptics.tapLight();
                  logout();
                }}
                className="text-[11px] text-red-500 hover:underline font-black cursor-pointer ml-2 shrink-0"
              >
                Выйти
              </button>
            </div>
          ) : (
            <div className="w-full mt-3 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-500">
                <Lock size={12} />
                <span className="text-[11px] font-bold">Гость (Ограниченный доступ)</span>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  haptics.tapLight();
                  openAuthGate('Войдите через Google для смены ника, аватара и топа игроков');
                }}
                style={{
                  backgroundColor: theme.accent,
                  color: '#ffffff',
                }}
                className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                Войти через Google
              </button>
            </div>
          )}
        </div>

        {/* Hero Best Score Card */}
        <div
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
            boxShadow: theme.cardShadow,
          }}
          className="w-full rounded-2xl border p-3.5 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                backgroundColor: '#fef3c7',
                color: '#d97706',
              }}
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
            >
              <Trophy size={24} className="fill-amber-500 text-amber-600" />
            </div>
            <div className="flex flex-col">
              <span
                style={{ color: theme.textSecondary }}
                className="text-[11px] font-bold uppercase tracking-wider"
              >
                Общий рекорд
              </span>
              <span
                style={{ color: '#d97706' }}
                className="text-2xl font-black tabular-nums tracking-tight leading-none mt-0.5"
              >
                {profile.overallBestScore.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-80">
            <Sparkles size={16} className="text-amber-500" />
            <span
              style={{ color: theme.textSecondary }}
              className="text-[11px] font-bold"
            >
              Все режимы
            </span>
          </div>
        </div>

        {/* 2x2 Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Total Games */}
          <div
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
              boxShadow: theme.cardShadow,
            }}
            className="rounded-2xl border p-3 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span
                style={{ color: theme.textSecondary }}
                className="text-[11px] font-bold uppercase tracking-wider"
              >
                Игр сыграно
              </span>
              <Gamepad2 size={16} style={{ color: theme.accent }} />
            </div>
            <span
              style={{ color: theme.textPrimary }}
              className="text-2xl font-black tabular-nums"
            >
              {profile.totalGamesPlayed.toLocaleString()}
            </span>
            <span
              style={{ color: theme.textSecondary }}
              className="text-[10px] opacity-70 mt-0.5"
            >
              Всего запусков
            </span>
          </div>

          {/* Total Lines Cleared */}
          <div
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
              boxShadow: theme.cardShadow,
            }}
            className="rounded-2xl border p-3 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span
                style={{ color: theme.textSecondary }}
                className="text-[11px] font-bold uppercase tracking-wider"
              >
                Очищено линий
              </span>
              <Grid size={16} style={{ color: '#10b981' }} />
            </div>
            <span
              style={{ color: '#059669' }}
              className="text-2xl font-black tabular-nums"
            >
              {profile.totalLinesCleared.toLocaleString()}
            </span>
            <span
              style={{ color: theme.textSecondary }}
              className="text-[10px] opacity-70 mt-0.5"
            >
              Рядов и столбцов
            </span>
          </div>

          {/* Max Combo */}
          <div
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
              boxShadow: theme.cardShadow,
            }}
            className="rounded-2xl border p-3 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span
                style={{ color: theme.textSecondary }}
                className="text-[11px] font-bold uppercase tracking-wider"
              >
                Макс. комбо
              </span>
              <Flame size={16} className="text-orange-500 fill-orange-500" />
            </div>
            <span className="text-2xl font-black tabular-nums text-orange-600">
              {profile.overallMaxCombo > 0 ? `x${profile.overallMaxCombo}` : '—'}
            </span>
            <span
              style={{ color: theme.textSecondary }}
              className="text-[10px] opacity-70 mt-0.5"
            >
              Лучшая серия
            </span>
          </div>

          {/* Favorite Mode */}
          <div
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
              boxShadow: theme.cardShadow,
            }}
            className="rounded-2xl border p-3 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span
                style={{ color: theme.textSecondary }}
                className="text-[11px] font-bold uppercase tracking-wider"
              >
                Любимый режим
              </span>
              <Heart size={16} className="text-rose-500 fill-rose-500" />
            </div>
            <span
              style={{ color: theme.textPrimary }}
              className="text-base font-black truncate leading-tight"
            >
              {favModeConfig.title}
            </span>
            <span
              style={{ color: favModeConfig.accentColor }}
              className="text-[10px] font-extrabold uppercase mt-0.5"
            >
              {favModeConfig.badge}
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* Achievements Section */}
        {/* ======================================================== */}
        <div
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
            boxShadow: theme.cardShadow,
          }}
          className="w-full rounded-[26px] border-2 p-4 flex flex-col gap-3.5 shadow-sm"
        >
          {/* Header & Overall Counter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                style={{
                  backgroundColor: '#fef3c7',
                  color: '#d97706',
                }}
                className="w-8 h-8 rounded-xl flex items-center justify-center shadow-xs"
              >
                <Award size={18} strokeWidth={2.4} />
              </div>
              <div className="flex flex-col">
                <h3
                  style={{ color: theme.textPrimary }}
                  className="text-sm font-black uppercase tracking-tight"
                >
                  Достижения и медали
                </h3>
                <span
                  style={{ color: theme.textSecondary }}
                  className="text-[10.5px] font-bold opacity-75"
                >
                  Разблокируй значки за рекорды и мастерство
                </span>
              </div>
            </div>

            <div
              style={{
                backgroundColor: theme.bgBoard,
                borderColor: theme.cardBorder,
                color: theme.accent,
              }}
              className="px-2.5 py-1 rounded-xl border text-xs font-black tabular-nums"
            >
              {unlockedCount} / {totalAchievements}
            </div>
          </div>

          {/* Overall Completion Bar */}
          <div className="w-full flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span style={{ color: theme.textSecondary }}>Прогресс коллекции</span>
              <span style={{ color: theme.accent }} className="tabular-nums">
                {overallPercentage}%
              </span>
            </div>
            <div
              style={{ backgroundColor: theme.bgBoard }}
              className="w-full h-2 rounded-full overflow-hidden p-0.5 border"
              style-border={theme.cardBorder}
            >
              <div
                style={{
                  width: `${overallPercentage}%`,
                  backgroundColor: theme.accent,
                }}
                className="h-full rounded-full transition-all duration-700 ease-out shadow-xs"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
            {[
              { id: 'all', label: `Все (${totalAchievements})` },
              { id: 'unlocked', label: `Открыто (${unlockedCount})` },
              { id: 'locked', label: `В процессе (${totalAchievements - unlockedCount})` },
              { id: 'lines', label: 'Линии' },
              { id: 'combo', label: 'Комбо' },
              { id: 'zen', label: 'Дзен' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  haptics.tapLight();
                  setActiveFilter(tab.id as typeof activeFilter);
                }}
                style={{
                  backgroundColor:
                    activeFilter === tab.id ? theme.accent : theme.bgBoard,
                  color: activeFilter === tab.id ? '#ffffff' : theme.textSecondary,
                  borderColor:
                    activeFilter === tab.id ? theme.accent : theme.cardBorder,
                }}
                className="px-2.5 py-1 rounded-xl border text-[10.5px] font-extrabold whitespace-nowrap active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Grid of Achievement Badge Cards */}
          <div className="grid grid-cols-2 gap-2.5 pt-0.5">
            {filteredAchievements.map((ach) => (
              <AchievementCard
                key={ach.id}
                theme={theme}
                achievement={ach}
                onClick={() => setSelectedAchievement(ach)}
              />
            ))}
          </div>

          {filteredAchievements.length === 0 && (
            <div
              style={{ color: theme.textSecondary }}
              className="py-6 text-center text-xs font-semibold opacity-70"
            >
              Нет значков в этой категории
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="w-full flex flex-col gap-2.5 pt-2">
        {/* Open Detailed Statistics */}
        <button
          onClick={() => {
            sound.playClick();
            haptics.tapLight();
            onOpenStats();
          }}
          style={{
            backgroundColor: theme.accent,
            color: '#ffffff',
            boxShadow: `0 10px 24px -6px ${theme.accent}66`,
          }}
          className="w-full h-14 rounded-2xl font-black text-base flex items-center justify-center gap-2.5 active:scale-98 transition-all cursor-pointer shadow-md"
        >
          <BarChart3 size={20} strokeWidth={2.4} />
          <span>Подробная статистика</span>
        </button>

        {/* Back to Menu */}
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
          className="w-full h-12 rounded-2xl border font-bold text-sm flex items-center justify-center active:scale-98 transition-all cursor-pointer"
        >
          Вернуться в меню
        </button>
      </div>

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setSelectedAchievement(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
              boxShadow: theme.boardShadow,
            }}
            className="w-full max-w-sm rounded-3xl border-2 p-5 flex flex-col items-center text-center relative animate-pop-in"
          >
            {/* Close button */}
            <button
              onClick={() => {
                sound.playClick();
                haptics.tapLight();
                setSelectedAchievement(null);
              }}
              style={{
                backgroundColor: theme.bgBoard,
                color: theme.textSecondary,
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
              title="Закрыть"
            >
              <X size={16} strokeWidth={2.5} />
            </button>

            {/* Medal Category Tag */}
            <span
              style={{
                backgroundColor: MEDAL_CONFIGS[selectedAchievement.medal].badgeBg,
                color: MEDAL_CONFIGS[selectedAchievement.medal].badgeText,
                borderColor: MEDAL_CONFIGS[selectedAchievement.medal].badgeBorder,
              }}
              className="px-3 py-1 rounded-full border text-[11px] font-black uppercase tracking-wider mb-3"
            >
              Медаль: {MEDAL_CONFIGS[selectedAchievement.medal].label}
            </span>

            {/* Big Badge Icon */}
            <div
              style={{
                backgroundColor: selectedAchievement.isUnlocked
                  ? MEDAL_CONFIGS[selectedAchievement.medal].badgeBg
                  : theme.bgBoard,
                borderColor: selectedAchievement.isUnlocked
                  ? MEDAL_CONFIGS[selectedAchievement.medal].badgeBorder
                  : theme.cardBorder,
                color: selectedAchievement.isUnlocked
                  ? MEDAL_CONFIGS[selectedAchievement.medal].badgeText
                  : theme.textSecondary,
                boxShadow: selectedAchievement.isUnlocked
                  ? `0 12px 28px -6px ${MEDAL_CONFIGS[selectedAchievement.medal].glow}`
                  : theme.cardShadow,
              }}
              className="w-20 h-20 rounded-2xl border-2 flex items-center justify-center mb-3 shadow-md relative"
            >
              {selectedAchievement.isUnlocked ? (
                <Award size={40} strokeWidth={2.2} />
              ) : (
                <Lock size={34} strokeWidth={2.2} />
              )}
            </div>

            {/* Title */}
            <h3
              style={{ color: theme.textPrimary }}
              className="text-xl font-black tracking-tight mb-1"
            >
              {selectedAchievement.title}
            </h3>

            {/* Description */}
            <p
              style={{ color: theme.textSecondary }}
              className="text-xs font-semibold leading-relaxed mb-4 max-w-[260px]"
            >
              {selectedAchievement.description}
            </p>

            {/* Progress Box */}
            <div
              style={{
                backgroundColor: theme.bgBoard,
                borderColor: theme.cardBorder,
              }}
              className="w-full rounded-2xl border p-3 flex flex-col gap-2 mb-4"
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span style={{ color: theme.textSecondary }}>Текущий прогресс</span>
                <span
                  style={{
                    color: selectedAchievement.isUnlocked ? '#10b981' : theme.accent,
                  }}
                  className="font-black"
                >
                  {selectedAchievement.progressText}
                </span>
              </div>

              {/* Progress Bar */}
              <div
                style={{ backgroundColor: theme.cardBg }}
                className="w-full h-2 rounded-full overflow-hidden p-0.5 border"
                style-border={theme.cardBorder}
              >
                <div
                  style={{
                    width: `${selectedAchievement.progressPercent}%`,
                    backgroundColor: selectedAchievement.isUnlocked
                      ? '#10b981'
                      : theme.accent,
                  }}
                  className="h-full rounded-full transition-all duration-500 ease-out"
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-semibold opacity-75">
                <span style={{ color: theme.textSecondary }}>
                  {selectedAchievement.isUnlocked ? 'Веха достигнута' : 'Требуется для открытия'}
                </span>
                <span
                  style={{
                    color: selectedAchievement.isUnlocked ? '#10b981' : theme.textPrimary,
                  }}
                  className="font-bold"
                >
                  {selectedAchievement.progressPercent}%
                </span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                sound.playClick();
                haptics.tapLight();
                setSelectedAchievement(null);
              }}
              style={{
                backgroundColor: theme.accent,
                color: '#ffffff',
              }}
              className="w-full h-11 rounded-xl font-black text-sm active:scale-98 transition-transform cursor-pointer shadow-md"
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
