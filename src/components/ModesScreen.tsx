import React from 'react';
import { Theme } from '../types/theme';
import { GameModeConfig, GAME_MODES, GameModeId } from '../types/gameMode';
import { sound } from '../utils/audio';
import { haptics } from '../utils/haptics';
import {
  ArrowLeft,
  Infinity,
  Timer,
  Sparkles,
  Target,
  Trophy,
  Play,
  CheckCircle2,
} from 'lucide-react';

interface ModesScreenProps {
  theme: Theme;
  selectedModeId: GameModeId;
  bestScores: Record<GameModeId, number>;
  onBack: () => void;
  onSelectAndPlay: (modeId: GameModeId) => void;
}

export const ModesScreen: React.FC<ModesScreenProps> = ({
  theme,
  selectedModeId,
  bestScores,
  onBack,
  onSelectAndPlay,
}) => {
  const renderIcon = (iconName: GameModeConfig['iconName'], color: string) => {
    switch (iconName) {
      case 'infinity':
        return <Infinity size={24} style={{ color }} />;
      case 'timer':
        return <Timer size={24} style={{ color }} />;
      case 'sparkles':
        return <Sparkles size={24} style={{ color }} />;
      case 'target':
        return <Target size={24} style={{ color }} />;
    }
  };

  return (
    <div className="w-full h-full max-w-[420px] mx-auto flex flex-col justify-between p-4 sm:p-5 select-none touch-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3">
        <button
          onClick={() => {
            sound.playClick();
            haptics.tapLight();
            onBack();
          }}
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
            color: theme.textSecondary,
            boxShadow: theme.cardShadow,
          }}
          className="w-11 h-11 rounded-2xl border flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
          aria-label="Назад в меню"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex flex-col items-center">
          <h2
            style={{ color: theme.textPrimary }}
            className="text-lg font-black tracking-tight uppercase"
          >
            Режимы игры
          </h2>
          <span
            style={{ color: theme.textSecondary }}
            className="text-[10px] font-bold tracking-widest uppercase opacity-75"
          >
            Выберите стиль игры
          </span>
        </div>

        <div className="w-11 h-11" /> {/* Spacer */}
      </div>

      {/* Modes Grid / Cards List */}
      <div className="flex-1 flex flex-col gap-3 py-2 overflow-y-auto">
        {GAME_MODES.map((mode) => {
          const isCurrent = mode.id === selectedModeId;
          const best = bestScores[mode.id] || 0;

          return (
            <div
              key={mode.id}
              onClick={() => {
                sound.playClick();
                haptics.tapPlace();
                onSelectAndPlay(mode.id);
              }}
              style={{
                backgroundColor: theme.cardBg,
                borderColor: isCurrent ? theme.accent : theme.cardBorder,
                boxShadow: theme.cardShadow,
              }}
              className={`rounded-[24px] border-2 p-4 flex flex-col gap-2.5 transition-all active:scale-[0.98] cursor-pointer relative overflow-hidden group ${
                isCurrent ? 'ring-2 ring-offset-2 ring-offset-transparent' : ''
              }`}
            >
              {/* Top Row: Icon + Title + Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      backgroundColor: theme.bgBoard,
                      borderColor: theme.boardBorder,
                    }}
                    className="w-12 h-12 rounded-2xl border-2 flex items-center justify-center shadow-xs"
                  >
                    {renderIcon(mode.iconName, mode.accentColor)}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span
                        style={{ color: theme.textPrimary }}
                        className="text-base font-black tracking-tight"
                      >
                        {mode.title}
                      </span>
                      <span
                        style={{
                          backgroundColor: `${mode.accentColor}22`,
                          color: mode.accentColor,
                          borderColor: `${mode.accentColor}40`,
                        }}
                        className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border"
                      >
                        {mode.badge}
                      </span>
                    </div>
                    <span
                      style={{ color: theme.textSecondary }}
                      className="text-[11px] font-medium"
                    >
                      {mode.tagline}
                    </span>
                  </div>
                </div>

                {/* Play Button Icon */}
                <div
                  style={{
                    backgroundColor: mode.accentColor,
                    color: '#ffffff',
                  }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 active:scale-95 transition-transform"
                >
                  <Play size={16} className="fill-current translate-x-0.5" />
                </div>
              </div>

              {/* Description */}
              <p
                style={{ color: theme.textSecondary }}
                className="text-xs leading-relaxed opacity-90 pl-1"
              >
                {mode.description}
              </p>

              {/* Bottom stats row */}
              <div
                style={{
                  backgroundColor: theme.bgBoard,
                  borderColor: theme.boardBorder,
                }}
                className="flex items-center justify-between px-3 py-1.5 rounded-xl border mt-0.5"
              >
                <div className="flex items-center gap-1.5">
                  <Trophy size={13} className="text-amber-500 fill-amber-500" />
                  <span
                    style={{ color: theme.textSecondary }}
                    className="text-[11px] font-bold uppercase tracking-wider"
                  >
                    Рекорд:
                  </span>
                  <span
                    style={{ color: theme.textPrimary }}
                    className="text-xs font-black tabular-nums"
                  >
                    {best.toLocaleString()}
                  </span>
                </div>

                {isCurrent && (
                  <div
                    style={{ color: theme.accent }}
                    className="flex items-center gap-1 text-[11px] font-bold"
                  >
                    <CheckCircle2 size={13} />
                    <span>Выбран</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="pt-2 text-center">
        <span
          style={{ color: theme.textSecondary }}
          className="text-[11px] font-semibold opacity-70"
        >
          Нажмите на карточку, чтобы сразу начать игру
        </span>
      </div>
    </div>
  );
};
