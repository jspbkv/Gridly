import React from 'react';
import { Theme } from '../types/theme';
import { sound } from '../utils/audio';
import { haptics } from '../utils/haptics';
import { X, Check, Infinity, Sparkles, Zap } from 'lucide-react';

export interface GameMode {
  id: string;
  name: string;
  badge: string;
  description: string;
  icon: 'infinity' | 'sparkles' | 'zap';
}

export const GAME_MODES: GameMode[] = [
  {
    id: 'classic',
    name: 'Классический',
    badge: 'Основной',
    description: 'Бесконечная игра. Размещайте блоки и очищайте ряды, пока есть место на поле.',
    icon: 'infinity',
  },
  {
    id: 'zen',
    name: 'Дзен-режим',
    badge: 'Релакс',
    description: 'Спокойная медитативная игра без лишнего напряжения для отдыха и уюта.',
    icon: 'sparkles',
  },
  {
    id: 'blitz',
    name: 'Мастер комбо',
    badge: 'Динамика',
    description: 'Фокус на максимальных цепочках комбо и умножении очков за каждый ход.',
    icon: 'zap',
  },
];

interface ModesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModeId: string;
  onSelectMode: (modeId: string) => void;
  theme: Theme;
}

export const ModesModal: React.FC<ModesModalProps> = ({
  isOpen,
  onClose,
  selectedModeId,
  onSelectMode,
  theme,
}) => {
  if (!isOpen) return null;

  const renderIcon = (type: GameMode['icon']) => {
    switch (type) {
      case 'infinity':
        return <Infinity size={20} style={{ color: theme.accent }} />;
      case 'sparkles':
        return <Sparkles size={20} className="text-amber-500" />;
      case 'zap':
        return <Zap size={20} className="text-emerald-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm select-none">
      <div
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.cardBorder,
          color: theme.textPrimary,
          boxShadow: theme.cardShadow,
        }}
        className="w-full max-w-sm rounded-t-[30px] sm:rounded-[30px] border p-5 flex flex-col gap-4 shadow-2xl transition-all duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Infinity size={20} style={{ color: theme.accent }} />
            <h2 className="text-lg font-black tracking-tight">Режимы игры</h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-black/5 active:scale-95 transition-all cursor-pointer"
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modes list */}
        <div className="flex flex-col gap-2.5">
          {GAME_MODES.map((mode) => {
            const isSelected = mode.id === selectedModeId;
            return (
              <button
                key={mode.id}
                onClick={() => {
                  sound.playClick();
                  haptics.tapLight();
                  onSelectMode(mode.id);
                  onClose();
                }}
                style={{
                  backgroundColor: theme.bgBoard,
                  borderColor: isSelected ? theme.accent : theme.boardBorder,
                }}
                className={`p-3.5 rounded-2xl border-2 flex items-center justify-between text-left active:scale-[0.98] transition-all cursor-pointer ${
                  isSelected ? 'ring-2 ring-offset-2 ring-offset-transparent' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      backgroundColor: theme.cardBg,
                      borderColor: theme.cardBorder,
                    }}
                    className="w-10 h-10 rounded-xl border flex items-center justify-center shadow-xs"
                  >
                    {renderIcon(mode.icon)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm">{mode.name}</span>
                      <span
                        style={{
                          backgroundColor: theme.accentMuted,
                          color: theme.accent,
                        }}
                        className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md"
                      >
                        {mode.badge}
                      </span>
                    </div>
                    <p
                      style={{ color: theme.textSecondary }}
                      className="text-[11px] leading-tight mt-0.5 max-w-[210px]"
                    >
                      {mode.description}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div
                    style={{ backgroundColor: theme.accent }}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-xs ml-2"
                  >
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          style={{ backgroundColor: theme.accent, color: '#ffffff' }}
          className="w-full py-3.5 rounded-2xl font-black text-sm shadow-md active:scale-98 transition-transform cursor-pointer mt-1"
        >
          Готово
        </button>
      </div>
    </div>
  );
};
