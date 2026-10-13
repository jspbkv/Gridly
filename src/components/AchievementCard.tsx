import React from 'react';
import {
  Grid,
  Flame,
  Clock,
  Trophy,
  Crown,
  Zap,
  Target,
  Award,
  Sparkles,
  Layers,
  Heart,
  Gamepad2,
  Medal,
  Check,
  Lock,
} from 'lucide-react';
import { Theme } from '../types/theme';
import { ComputedAchievement } from '../types/achievement';
import { MEDAL_CONFIGS } from '../utils/achievements';
import { sound } from '../utils/audio';
import { haptics } from '../utils/haptics';

interface AchievementCardProps {
  theme: Theme;
  achievement: ComputedAchievement;
  onClick?: () => void;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  theme,
  achievement,
  onClick,
}) => {
  const medalCfg = MEDAL_CONFIGS[achievement.medal];

  const renderIcon = (size: number = 22) => {
    const props = { size, strokeWidth: 2.3 };
    switch (achievement.iconName) {
      case 'Grid':
        return <Grid {...props} />;
      case 'Flame':
        return <Flame {...props} className={achievement.isUnlocked ? 'fill-orange-400' : ''} />;
      case 'Clock':
        return <Clock {...props} />;
      case 'Trophy':
        return <Trophy {...props} className={achievement.isUnlocked ? 'fill-amber-400' : ''} />;
      case 'Crown':
        return <Crown {...props} className={achievement.isUnlocked ? 'fill-yellow-400' : ''} />;
      case 'Zap':
        return <Zap {...props} className={achievement.isUnlocked ? 'fill-purple-400' : ''} />;
      case 'Target':
        return <Target {...props} />;
      case 'Award':
        return <Award {...props} />;
      case 'Sparkles':
        return <Sparkles {...props} />;
      case 'Layers':
        return <Layers {...props} />;
      case 'Heart':
        return <Heart {...props} className={achievement.isUnlocked ? 'fill-rose-400' : ''} />;
      case 'Gamepad2':
        return <Gamepad2 {...props} />;
      case 'Medal':
      default:
        return <Medal {...props} />;
    }
  };

  const handleClick = () => {
    sound.playClick();
    haptics.tapLight();
    if (onClick) onClick();
  };

  return (
    <div
      onClick={handleClick}
      style={{
        backgroundColor: theme.cardBg,
        borderColor: achievement.isUnlocked ? medalCfg.badgeBorder : theme.cardBorder,
        boxShadow: achievement.isUnlocked
          ? `0 6px 18px -4px ${medalCfg.glow}`
          : theme.cardShadow,
      }}
      className={`relative rounded-2xl border-2 p-3 flex flex-col justify-between transition-all duration-200 cursor-pointer select-none active:scale-[0.98] ${
        achievement.isUnlocked ? 'ring-1' : 'opacity-90'
      }`}
      style-ring={achievement.isUnlocked ? medalCfg.badgeBorder : undefined}
    >
      {/* Top row: Medal Icon Badge & Status Chip */}
      <div className="flex items-start justify-between gap-2 mb-2">
        {/* Medal Badge Icon */}
        <div
          style={{
            backgroundColor: achievement.isUnlocked ? medalCfg.badgeBg : theme.bgBoard,
            borderColor: achievement.isUnlocked ? medalCfg.badgeBorder : theme.cardBorder,
            color: achievement.isUnlocked ? medalCfg.badgeText : theme.textSecondary,
          }}
          className="w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 relative shadow-sm"
        >
          {renderIcon(20)}
          {achievement.isUnlocked && (
            <div
              style={{ backgroundColor: medalCfg.badgeBorder }}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white shadow-xs"
            >
              <Check size={10} strokeWidth={3.5} />
            </div>
          )}
        </div>

        {/* Medal Tag & Status */}
        <div className="flex flex-col items-end">
          <span
            style={{
              backgroundColor: achievement.isUnlocked ? medalCfg.badgeBg : theme.bgBoard,
              color: achievement.isUnlocked ? medalCfg.badgeText : theme.textSecondary,
              borderColor: achievement.isUnlocked ? medalCfg.badgeBorder : theme.cardBorder,
            }}
            className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border"
          >
            {medalCfg.label}
          </span>
          <span
            style={{ color: achievement.isUnlocked ? '#10b981' : theme.textSecondary }}
            className="text-[10px] font-bold mt-1 flex items-center gap-0.5"
          >
            {achievement.isUnlocked ? (
              <span className="flex items-center gap-0.5 font-extrabold text-emerald-600">
                <Check size={11} strokeWidth={3} />
                Открыто
              </span>
            ) : (
              <span className="flex items-center gap-0.5 opacity-75">
                <Lock size={10} strokeWidth={2.4} />
                {achievement.progressPercent}%
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Middle: Title & Description */}
      <div className="flex flex-col mb-2.5">
        <h4
          style={{ color: theme.textPrimary }}
          className="text-xs font-black tracking-tight leading-snug line-clamp-1"
          title={achievement.title}
        >
          {achievement.title}
        </h4>
        <p
          style={{ color: theme.textSecondary }}
          className="text-[10.5px] leading-tight line-clamp-2 mt-0.5 opacity-80"
          title={achievement.description}
        >
          {achievement.description}
        </p>
      </div>

      {/* Bottom: Progress Bar & Progress Label */}
      <div className="w-full mt-auto">
        <div className="flex items-center justify-between text-[10px] font-semibold mb-1">
          <span
            style={{ color: achievement.isUnlocked ? '#059669' : theme.textSecondary }}
            className="truncate font-bold"
          >
            {achievement.progressText}
          </span>
          <span
            style={{ color: achievement.isUnlocked ? '#059669' : theme.textSecondary }}
            className="tabular-nums opacity-90 ml-1"
          >
            {achievement.progressPercent}%
          </span>
        </div>

        {/* Bar */}
        <div
          style={{ backgroundColor: theme.bgBoard }}
          className="w-full h-1.5 rounded-full overflow-hidden p-0.5 border"
          style-border={theme.cardBorder}
        >
          <div
            style={{
              width: `${achievement.progressPercent}%`,
              backgroundColor: achievement.isUnlocked ? '#10b981' : theme.accent,
            }}
            className="h-full rounded-full transition-all duration-500 ease-out"
          />
        </div>
      </div>
    </div>
  );
};
