import React, { useState } from 'react';
import { Theme } from '../types/theme';
import { PlayerProfile } from '../types/profile';
import { GAME_MODES, GameModeId } from '../types/gameMode';
import { sound } from '../utils/audio';
import { haptics } from '../utils/haptics';
import {
  ArrowLeft,
  Trophy,
  Target,
  Clock,
  Sparkles,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Award,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface StatsScreenProps {
  theme: Theme;
  profile: PlayerProfile;
  onBack: () => void;
  onResetStats: () => void;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({
  theme,
  profile,
  onBack,
  onResetStats,
}) => {
  const { isAuthenticated, openAuthGate } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'all' | GameModeId>('all');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Overall calculations
  const totalGames = profile.totalGamesPlayed;
  let totalScoreSum = 0;
  (Object.values(profile.modeStats) as Array<{ totalScore: number }>).forEach((st) => {
    totalScoreSum += st.totalScore || 0;
  });
  const overallAvgScore =
    totalGames > 0 ? Math.round(totalScoreSum / totalGames) : 0;

  const challengeStats = profile.modeStats.challenge;
  const challengeWins = profile.challengeWins || 0;
  const challengeGames = challengeStats?.gamesPlayed || 0;
  const challengeWinRate =
    challengeGames > 0 ? Math.round((challengeWins / challengeGames) * 100) : 0;

  // Chart data: reverse recentScores so oldest is on left and newest is on right
  const chartPoints = [...profile.recentScores].reverse().slice(-10);
  const maxChartScore = Math.max(
    ...chartPoints.map((p) => p.score),
    profile.overallBestScore,
    100
  );

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
            Статистика
          </h2>
          <span
            style={{ color: theme.textSecondary }}
            className="text-[10px] font-bold tracking-wider uppercase opacity-75"
          >
            Прогресс и режимы
          </span>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            haptics.tapLight();
            setShowResetConfirm(true);
          }}
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
            color: '#ef4444',
            boxShadow: theme.cardShadow,
          }}
          className="w-11 h-11 rounded-2xl border flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
          title="Сбросить статистику"
        >
          <RotateCcw size={18} strokeWidth={2.2} />
        </button>
      </div>

      {/* Main Scrollable View */}
      <div className="w-full flex-1 flex flex-col gap-3.5 my-auto overflow-y-auto no-scrollbar py-1">
        {/* Top Summary Banner: Average & Challenge Wins */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Average Score */}
          <div
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
              boxShadow: theme.cardShadow,
            }}
            className="rounded-2xl border p-3.5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1">
              <span
                style={{ color: theme.textSecondary }}
                className="text-[11px] font-bold uppercase tracking-wider"
              >
                Средний счёт
              </span>
              <TrendingUp size={16} style={{ color: theme.accent }} />
            </div>
            <span
              style={{ color: theme.accent }}
              className="text-2xl font-black tabular-nums tracking-tight"
            >
              {overallAvgScore.toLocaleString()}
            </span>
            <span
              style={{ color: theme.textSecondary }}
              className="text-[10px] opacity-75 mt-0.5"
            >
              По всем играм
            </span>
          </div>

          {/* Challenge Wins */}
          <div
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
              boxShadow: theme.cardShadow,
            }}
            className="rounded-2xl border p-3.5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1">
              <span
                style={{ color: theme.textSecondary }}
                className="text-[11px] font-bold uppercase tracking-wider"
              >
                Побед в вызове
              </span>
              <Award size={16} className="text-amber-500 fill-amber-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black tabular-nums text-amber-600">
                {challengeWins}
              </span>
              <span
                style={{ color: theme.textSecondary }}
                className="text-xs font-bold"
              >
                ({challengeWinRate}%)
              </span>
            </div>
            <span
              style={{ color: theme.textSecondary }}
              className="text-[10px] opacity-75 mt-0.5"
            >
              Из {challengeGames} попыток
            </span>
          </div>
        </div>

        {/* If Guest: Show Locked Analytical Card */}
        {!isAuthenticated ? (
          <div
            style={{
              backgroundColor: theme.cardBg,
              borderColor: '#f59e0b',
              boxShadow: theme.cardShadow,
            }}
            className="w-full rounded-[26px] border-2 p-6 flex flex-col items-center text-center gap-3.5 my-auto animate-fade-in shadow-lg"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-500 shadow-inner">
              <Lock size={28} />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Ограниченный доступ
              </span>
              <h3
                style={{ color: theme.textPrimary }}
                className="text-base font-black tracking-tight leading-tight"
              >
                Подробная статистика заблокирована
              </h3>
              <p
                style={{ color: theme.textSecondary }}
                className="text-xs leading-relaxed max-w-xs opacity-80"
              >
                График прогресса очков, разбивка по каждому из 4 режимов игры, средний счёт и синхронизация в мировой рейтинг Supabase доступны после входа через Google.
              </p>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                haptics.tapLight();
                openAuthGate('Для разблокировки детальной аналитики, графиков и мирового рейтинга');
              }}
              style={{
                backgroundColor: theme.accent,
                color: '#ffffff',
                boxShadow: `0 8px 20px -4px ${theme.accent}66`,
              }}
              className="w-full h-12 rounded-xl font-black text-xs uppercase tracking-wider active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles size={16} />
              <span>Войти через Google</span>
            </button>
          </div>
        ) : (
          <>
            {/* Score Progress Chart Card */}
            <div
              style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.cardBorder,
                boxShadow: theme.cardShadow,
              }}
              className="w-full rounded-[24px] border-2 p-4 flex flex-col gap-2.5"
            >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                style={{ backgroundColor: theme.accentMuted, color: theme.accent }}
                className="w-7 h-7 rounded-xl flex items-center justify-center"
              >
                <TrendingUp size={15} strokeWidth={2.5} />
              </div>
              <span
                style={{ color: theme.textPrimary }}
                className="text-sm font-black tracking-tight"
              >
                График прогресса очков
              </span>
            </div>
            <span
              style={{ color: theme.textSecondary }}
              className="text-[10px] font-bold uppercase opacity-75"
            >
              Последние игры
            </span>
          </div>

          {/* Visual Tactile Chart Bars */}
          {chartPoints.length > 0 ? (
            <div className="w-full flex flex-col gap-1.5 pt-2">
              <div className="h-28 w-full flex items-end justify-between gap-1.5 px-1 pb-1 border-b border-black/5 dark:border-white/5 relative">
                {/* Average Reference Line */}
                {overallAvgScore > 0 && maxChartScore > 0 && (
                  <div
                    style={{
                      bottom: `${Math.min(92, Math.max(8, (overallAvgScore / maxChartScore) * 100))}%`,
                    }}
                    className="absolute left-0 right-0 border-b border-dashed border-amber-500/40 pointer-events-none z-0"
                    title={`Средний: ${overallAvgScore}`}
                  />
                )}

                {chartPoints.map((pt, idx) => {
                  const heightPercent = Math.max(
                    12,
                    Math.round((pt.score / maxChartScore) * 100)
                  );
                  const isRecord = pt.isRecord || pt.score === profile.overallBestScore;
                  const modeCfg = GAME_MODES.find((m) => m.id === pt.mode);

                  return (
                    <div
                      key={pt.id || idx}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative"
                    >
                      {/* Bar Pillar */}
                      <div
                        style={{
                          height: `${heightPercent}%`,
                          backgroundColor: isRecord
                            ? '#d97706'
                            : modeCfg?.accentColor || theme.accent,
                          boxShadow: isRecord
                            ? '0 4px 12px rgba(217, 119, 6, 0.35)'
                            : undefined,
                        }}
                        className="w-full max-w-[20px] rounded-t-lg transition-all duration-300 relative"
                      >
                        {isRecord && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <Trophy size={11} className="text-amber-500 fill-amber-500" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chart Date & Score Labels */}
              <div className="w-full flex items-center justify-between text-[10px] px-0.5">
                <span style={{ color: theme.textSecondary }} className="font-semibold">
                  {chartPoints[0]?.dateStr || ''}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  <span style={{ color: theme.textSecondary }} className="font-bold text-[10px]">
                    Рекорд: {profile.overallBestScore.toLocaleString()}
                  </span>
                </div>
                <span style={{ color: theme.textSecondary }} className="font-semibold">
                  {chartPoints[chartPoints.length - 1]?.dateStr || ''}
                </span>
              </div>
            </div>
          ) : (
            <div
              style={{ backgroundColor: theme.bgBoard }}
              className="w-full py-8 rounded-2xl flex flex-col items-center justify-center text-center px-4"
            >
              <Sparkles size={24} style={{ color: theme.accent }} className="mb-2 opacity-60" />
              <p style={{ color: theme.textPrimary }} className="text-xs font-bold">
                Сыграйте первую партию!
              </p>
              <p style={{ color: theme.textSecondary }} className="text-[11px] opacity-75 mt-0.5">
                Здесь появится динамика ваших побед и очков
              </p>
            </div>
          )}
        </div>

        {/* Mode-by-Mode Statistics Segment */}
        <div className="w-full flex flex-col gap-2">
          {/* Mode Switcher Tabs */}
          <div
            style={{ backgroundColor: theme.bgBoard }}
            className="w-full p-1 rounded-2xl flex items-center gap-1"
          >
            <button
              onClick={() => {
                sound.playClick();
                setSelectedTab('all');
              }}
              style={{
                backgroundColor: selectedTab === 'all' ? theme.cardBg : 'transparent',
                color: selectedTab === 'all' ? theme.textPrimary : theme.textSecondary,
                boxShadow: selectedTab === 'all' ? theme.cardShadow : undefined,
              }}
              className="flex-1 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer text-center"
            >
              Все
            </button>
            {GAME_MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedTab(m.id);
                }}
                style={{
                  backgroundColor: selectedTab === m.id ? theme.cardBg : 'transparent',
                  color: selectedTab === m.id ? theme.textPrimary : theme.textSecondary,
                  boxShadow: selectedTab === m.id ? theme.cardShadow : undefined,
                }}
                className="flex-1 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer text-center truncate px-1"
              >
                {m.title.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Cards for each mode */}
          <div className="flex flex-col gap-2.5">
            {GAME_MODES.filter(
              (mode) => selectedTab === 'all' || selectedTab === mode.id
            ).map((mode) => {
              const st = profile.modeStats[mode.id] || {
                gamesPlayed: 0,
                bestScore: 0,
                totalScore: 0,
                averageScore: 0,
                linesCleared: 0,
                maxCombo: 0,
                wins: 0,
              };

              return (
                <div
                  key={mode.id}
                  style={{
                    backgroundColor: theme.cardBg,
                    borderColor: theme.cardBorder,
                    boxShadow: theme.cardShadow,
                  }}
                  className="rounded-2xl border p-3.5 flex flex-col gap-2.5 transition-all"
                >
                  {/* Mode Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        style={{
                          backgroundColor: `${mode.accentColor}20`,
                          color: mode.accentColor,
                        }}
                        className="w-8 h-8 rounded-xl flex items-center justify-center font-bold"
                      >
                        {mode.id === 'classic' && <Trophy size={16} />}
                        {mode.id === 'time_attack' && <Clock size={16} />}
                        {mode.id === 'zen' && <Sparkles size={16} />}
                        {mode.id === 'challenge' && <Target size={16} />}
                      </div>
                      <div className="flex flex-col">
                        <span
                          style={{ color: theme.textPrimary }}
                          className="text-sm font-black leading-tight"
                        >
                          {mode.title}
                        </span>
                        <span
                          style={{ color: mode.accentColor }}
                          className="text-[10px] font-extrabold uppercase leading-tight"
                        >
                          {mode.badge}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span
                        style={{ color: theme.textSecondary }}
                        className="text-[10px] font-bold uppercase"
                      >
                        Рекорд
                      </span>
                      <span
                        style={{ color: mode.accentColor }}
                        className="text-base font-black tabular-nums"
                      >
                        {st.bestScore.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Mode Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-black/5 dark:border-white/5">
                    <div className="flex flex-col">
                      <span
                        style={{ color: theme.textSecondary }}
                        className="text-[10px] font-semibold"
                      >
                        Партий
                      </span>
                      <span
                        style={{ color: theme.textPrimary }}
                        className="text-xs font-black tabular-nums"
                      >
                        {st.gamesPlayed}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span
                        style={{ color: theme.textSecondary }}
                        className="text-[10px] font-semibold"
                      >
                        {mode.id === 'challenge' ? 'Побед' : 'Ср. счёт'}
                      </span>
                      <span
                        style={{ color: theme.textPrimary }}
                        className="text-xs font-black tabular-nums"
                      >
                        {mode.id === 'challenge'
                          ? `${st.wins || 0} (${st.gamesPlayed > 0 ? Math.round(((st.wins || 0) / st.gamesPlayed) * 100) : 0}%)`
                          : st.averageScore.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span
                        style={{ color: theme.textSecondary }}
                        className="text-[10px] font-semibold"
                      >
                        {mode.id === 'zen' ? 'Линий' : 'Макс. комбо'}
                      </span>
                      <span
                        style={{ color: theme.textPrimary }}
                        className="text-xs font-black tabular-nums"
                      >
                        {mode.id === 'zen'
                          ? st.linesCleared
                          : st.maxCombo > 0
                          ? `x${st.maxCombo}`
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </>
        )}
      </div>

      {/* Bottom Back Button */}
      <div className="w-full pt-2">
        <button
          onClick={() => {
            sound.playClick();
            haptics.tapLight();
            onBack();
          }}
          style={{
            backgroundColor: theme.accent,
            color: '#ffffff',
            boxShadow: `0 10px 24px -6px ${theme.accent}66`,
          }}
          className="w-full h-13 rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer shadow-md"
        >
          <span>Назад в профиль</span>
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
              boxShadow: theme.boardShadow,
            }}
            className="w-full max-w-[340px] rounded-[28px] border-2 p-5 flex flex-col items-center text-center animate-pop-in"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-500 flex items-center justify-center mb-3">
              <AlertTriangle size={24} strokeWidth={2.4} />
            </div>

            <h3
              style={{ color: theme.textPrimary }}
              className="text-lg font-black tracking-tight mb-1"
            >
              Сбросить статистику?
            </h3>
            <p
              style={{ color: theme.textSecondary }}
              className="text-xs leading-relaxed mb-5"
            >
              Все рекорды по режимам, сыгранные игры и история очков будут обнулены. Имя игрока сохранится.
            </p>

            <div className="w-full grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  sound.playClick();
                  setShowResetConfirm(false);
                }}
                style={{
                  backgroundColor: theme.bgBoard,
                  color: theme.textPrimary,
                }}
                className="h-12 rounded-xl font-bold text-xs active:scale-95 transition-all cursor-pointer"
              >
                Отмена
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  haptics.tapPlace();
                  onResetStats();
                  setShowResetConfirm(false);
                }}
                className="h-12 rounded-xl font-black text-xs bg-red-500 text-white active:scale-95 transition-all cursor-pointer shadow-md"
              >
                Сбросить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
