import React, { useState, useEffect } from 'react';
import { Theme } from '../types/theme';
import { PlayerProfile } from '../types/profile';
import { useAuth } from '../context/AuthContext';
import {
  fetchLeaderboardFromSupabase,
  LeaderboardEntry,
} from '../services/supabase';
import { sound } from '../utils/audio';
import { haptics } from '../utils/haptics';
import {
  ArrowLeft,
  Trophy,
  Medal,
  RefreshCw,
  Sparkles,
  Flame,
  Grid,
  Lock,
  UserCheck,
  Globe,
  Settings2,
} from 'lucide-react';

interface LeaderboardScreenProps {
  theme: Theme;
  profile: PlayerProfile;
  onBack: () => void;
}

const AVATAR_MAP: Record<string, string> = {
  fox: '🦊',
  cat: '🐱',
  bear: '🐻',
  panda: '🐼',
  owl: '🦉',
  star: '⭐',
};

type ModeTab = 'overall' | 'classic' | 'time_attack' | 'challenge' | 'zen';

interface TabConfig {
  id: ModeTab;
  label: string;
  icon: string;
}

const TABS: TabConfig[] = [
  { id: 'overall', label: 'Общий зачёт', icon: '🏆' },
  { id: 'classic', label: 'Классика', icon: '🎮' },
  { id: 'time_attack', label: 'На время', icon: '⏱️' },
  { id: 'challenge', label: 'Бласт', icon: '💥' },
  { id: 'zen', label: 'Дзен', icon: '🧘' },
];

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  theme,
  profile,
  onBack,
}) => {
  const { user, isAuthenticated, openAuthGate, openConfigModal, isConfigured } = useAuth();
  const [activeTab, setActiveTab] = useState<ModeTab>('overall');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemo, setIsDemo] = useState<boolean>(false);

  const loadLeaderboard = async (tab: ModeTab) => {
    setIsLoading(true);
    try {
      const res = await fetchLeaderboardFromSupabase(tab);
      setEntries(res.data);
      setIsDemo(res.isDemo);
    } catch (e) {
      console.error('Failed to load leaderboard', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard(activeTab);
  }, [activeTab]);

  const handleTabChange = (tab: ModeTab) => {
    if (tab === activeTab) return;
    sound.playClick();
    haptics.tapLight();
    setActiveTab(tab);
  };

  const handleRefresh = () => {
    sound.playClick();
    haptics.tapLight();
    loadLeaderboard(activeTab);
  };

  // Find user's position in current tab
  const currentUserEntry = entries.find(
    (e) => (user && e.user_id === user.id) || e.player_name === profile.name
  );

  return (
    <div className="w-full h-full max-w-[430px] mx-auto flex flex-col justify-between px-5 py-5 select-none touch-none overflow-hidden">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-2">
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
            <Trophy size={18} className="text-amber-500 fill-amber-500" />
            <h2
              style={{ color: theme.textPrimary }}
              className="text-lg font-black tracking-tight uppercase"
            >
              Топ игроков
            </h2>
          </div>
          <span
            style={{ color: theme.textSecondary }}
            className="text-[10px] font-bold tracking-wider uppercase opacity-75"
          >
            Глобальный рейтинг Supabase
          </span>
        </div>

        <button
          onClick={handleRefresh}
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
            color: theme.textPrimary,
            boxShadow: theme.cardShadow,
          }}
          className={`w-11 h-11 rounded-2xl border flex items-center justify-center active:scale-90 transition-transform cursor-pointer ${
            isLoading ? 'animate-spin opacity-50' : ''
          }`}
          title="Обновить"
        >
          <RefreshCw size={18} strokeWidth={2.2} />
        </button>
      </div>

      {/* Mode Tabs */}
      <div className="w-full flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              style={{
                backgroundColor: isActive ? theme.accent : theme.cardBg,
                color: isActive ? '#ffffff' : theme.textSecondary,
                borderColor: isActive ? theme.accent : theme.cardBorder,
                boxShadow: isActive ? `0 4px 12px ${theme.accent}44` : theme.cardShadow,
              }}
              className="px-3 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Leaderboard List */}
      <div className="w-full flex-1 flex flex-col gap-2 my-2 overflow-y-auto no-scrollbar py-1">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 opacity-60">
            <RefreshCw size={28} className="animate-spin" style={{ color: theme.accent }} />
            <span className="text-xs font-bold">Загрузка рекордов...</span>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 opacity-60 text-center p-6">
            <Trophy size={36} className="text-gray-400" />
            <span className="text-sm font-bold">Пока нет рекордов в этом режиме</span>
            <span className="text-xs">Сыграйте партию и станьте первым!</span>
          </div>
        ) : (
          entries.map((entry, index) => {
            const rank = entry.rank || index + 1;
            const isTop1 = rank === 1;
            const isTop2 = rank === 2;
            const isTop3 = rank === 3;
            const isCurrentPlayer =
              (user && entry.user_id === user.id) ||
              (!user && entry.player_name === profile.name);

            // Special badge colors for top 3
            let badgeBg = theme.bgBoard;
            let rankColor = theme.textSecondary;
            let borderStyle = theme.cardBorder;

            if (isTop1) {
              badgeBg = 'rgba(245, 158, 11, 0.16)';
              rankColor = '#d97706';
              borderStyle = '#f59e0b';
            } else if (isTop2) {
              badgeBg = 'rgba(148, 163, 184, 0.2)';
              rankColor = '#64748b';
              borderStyle = '#94a3b8';
            } else if (isTop3) {
              badgeBg = 'rgba(217, 119, 6, 0.16)';
              rankColor = '#b45309';
              borderStyle = '#d97706';
            }

            return (
              <div
                key={`${entry.user_id}-${entry.id}-${index}`}
                style={{
                  backgroundColor: isCurrentPlayer
                    ? `${theme.accent}12`
                    : theme.cardBg,
                  borderColor: isCurrentPlayer ? theme.accent : borderStyle,
                  boxShadow: theme.cardShadow,
                }}
                className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all ${
                  isTop1 ? 'ring-1 ring-amber-400/30' : ''
                }`}
              >
                {/* Left: Rank & Avatar & Name */}
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <div
                    style={{ backgroundColor: badgeBg }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 tabular-nums"
                  >
                    {isTop1 ? (
                      <span className="text-base">🥇</span>
                    ) : isTop2 ? (
                      <span className="text-base">🥈</span>
                    ) : isTop3 ? (
                      <span className="text-base">🥉</span>
                    ) : (
                      <span style={{ color: rankColor }} className="text-xs font-mono font-bold">
                        #{rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar Icon */}
                  <div
                    style={{ backgroundColor: theme.bgBoard }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg border border-black/5 dark:border-white/5 shrink-0"
                  >
                    <span>{AVATAR_MAP[entry.avatar_icon] || '🦊'}</span>
                  </div>

                  {/* Name & Details */}
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black tracking-tight leading-tight truncate max-w-[130px]">
                        {entry.player_name}
                      </span>
                      {isCurrentPlayer && (
                        <span
                          style={{
                            backgroundColor: theme.accentMuted,
                            color: theme.accent,
                          }}
                          className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded"
                        >
                          Вы
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] opacity-65 leading-tight">
                      <span className="flex items-center gap-0.5">
                        <Flame size={11} className="text-amber-500" />
                        <span>x{entry.max_combo}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <Grid size={11} style={{ color: theme.accent }} />
                        <span>{entry.lines_cleared} лин.</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Score */}
                <div className="flex flex-col items-end">
                  <span
                    style={{
                      color: isTop1 ? '#d97706' : theme.textPrimary,
                    }}
                    className="text-base font-black tabular-nums font-mono tracking-tight"
                  >
                    {entry.score.toLocaleString()}
                  </span>
                  <span
                    style={{ color: theme.textSecondary }}
                    className="text-[9px] font-bold uppercase tracking-wider opacity-60"
                  >
                    очков
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Sticky Player Status Banner */}
      <div className="w-full pt-1.5">
        {isAuthenticated ? (
          /* Logged In Status */
          <div
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
              boxShadow: theme.cardShadow,
            }}
            className="w-full p-3 rounded-2xl border flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5">
              <div
                style={{ backgroundColor: `${theme.accent}15` }}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-emerald-500 shrink-0"
              >
                <UserCheck size={16} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold leading-tight flex items-center gap-1.5">
                  <span>{profile.name}</span>
                  <span className="text-[10px] text-emerald-500 font-bold">✓ Google</span>
                </span>
                <span
                  style={{ color: theme.textSecondary }}
                  className="text-[10px] leading-tight"
                >
                  {currentUserEntry
                    ? `Ваше место в топе: #${currentUserEntry.rank}`
                    : 'Сыграйте раунд для обновления места'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span
                style={{ color: theme.accent }}
                className="text-sm font-black tabular-nums font-mono"
              >
                {profile.overallBestScore.toLocaleString()}
              </span>
              <span className="block text-[9px] uppercase tracking-wider opacity-60">
                ваш рекорд
              </span>
            </div>
          </div>
        ) : (
          /* Guest Access Callout */
          <div
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
              boxShadow: theme.cardShadow,
            }}
            className="w-full p-3 rounded-2xl border flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-500 shrink-0">
                <Lock size={15} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-black leading-tight">
                  Гостевой режим
                </span>
                <span
                  style={{ color: theme.textSecondary }}
                  className="text-[10px] leading-tight"
                >
                  Войдите через Google для места в топе
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                haptics.tapLight();
                openAuthGate('Для сохранения рекордов в мировой таблице лидеров');
              }}
              style={{
                backgroundColor: theme.accent,
                color: '#ffffff',
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              Войти
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
