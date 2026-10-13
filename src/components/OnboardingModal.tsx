import React, { useState, useRef } from 'react';
import { Theme } from '../types/theme';
import { sound } from '../utils/audio';
import { haptics } from '../utils/haptics';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Move,
  Layers,
  Flame,
  Palette,
  Sparkles,
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  theme: Theme;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  theme,
  onComplete,
}) => {
  const [step, setStep] = useState(0);

  // Touch swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  if (!isOpen) return null;

  const totalSteps = 5;

  const handleNext = () => {
    sound.playClick();
    haptics.tapLight();
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    sound.playClick();
    haptics.tapLight();
    if (step > 0) {
      setStep((s) => s - 1);
    }
  };

  const handleSkip = () => {
    sound.playClick();
    haptics.tapLight();
    onComplete();
  };

  // Touch gesture listeners for Android swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    // Detect horizontal swipe if delta X is greater than delta Y and threshold > 45px
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 45) {
      if (diffX < 0) {
        // Swiped left -> next card
        if (step < totalSteps - 1) {
          handleNext();
        }
      } else {
        // Swiped right -> previous card
        if (step > 0) {
          handlePrev();
        }
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const cards = [
    // 1. Welcome Card
    {
      badge: 'Приветствие',
      title: 'Добро пожаловать в Gridly!',
      desc: 'Уютная, тактильная блочная головоломка. Играйте в своём темпе — без таймеров, спешки и ограничений по времени.',
      visual: (
        <div className="flex flex-col items-center justify-center p-4">
          <div
            style={{
              backgroundColor: theme.bgBoard,
              borderColor: theme.boardBorder,
              boxShadow: theme.boardShadow,
            }}
            className="p-3.5 rounded-[22px] border-2 grid grid-cols-2 gap-2 animate-pop-in"
          >
            <div style={{ backgroundColor: theme.blockColors[0] }} className="w-8 h-8 rounded-[7px] tactile-block" />
            <div style={{ backgroundColor: theme.blockColors[1] }} className="w-8 h-8 rounded-[7px] tactile-block" />
            <div style={{ backgroundColor: theme.blockColors[2] }} className="w-8 h-8 rounded-[7px] tactile-block" />
            <div style={{ backgroundColor: theme.blockColors[4] || theme.blockColors[3] }} className="w-8 h-8 rounded-[7px] tactile-block" />
          </div>
          <div
            style={{
              backgroundColor: theme.accentMuted,
              color: theme.accent,
              borderColor: `${theme.accent}30`,
            }}
            className="mt-3.5 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-xl border flex items-center gap-1.5"
          >
            <Sparkles size={12} />
            <span>Чистый дзен и тренировка логики</span>
          </div>
        </div>
      ),
    },

    // 2. Drag & Drop Placement
    {
      badge: 'Управление',
      title: 'Как ставить блоки',
      desc: 'Берите фигурки из нижнего лотка и переносите на поле 8×8. Блок приподнимается над пальцем, поэтому обзор всегда свободен.',
      visual: (
        <div className="flex flex-col items-center justify-center p-3">
          <div
            style={{
              backgroundColor: theme.bgBoard,
              borderColor: theme.boardBorder,
            }}
            className="p-3 rounded-2xl border-2 flex flex-col items-center gap-2"
          >
            {/* Target mini grid outline */}
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-dashed border-black/20 dark:border-white/20">
              <div style={{ backgroundColor: theme.cellEmpty }} className="w-5 h-5 rounded-[4px] border border-black/10" />
              <div style={{ backgroundColor: theme.blockColors[0] }} className="w-5 h-5 rounded-[4px] tactile-block" />
              <div style={{ backgroundColor: theme.blockColors[0] }} className="w-5 h-5 rounded-[4px] tactile-block" />
              <div style={{ backgroundColor: theme.cellEmpty }} className="w-5 h-5 rounded-[4px] border border-black/10" />
              <div style={{ backgroundColor: theme.blockColors[0] }} className="w-5 h-5 rounded-[4px] tactile-block" />
              <div style={{ backgroundColor: theme.cellEmpty }} className="w-5 h-5 rounded-[4px] border border-black/10" />
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider opacity-65">
              <Move size={12} style={{ color: theme.accent }} />
              <span>Смещение +75px над пальцем</span>
            </div>
          </div>
        </div>
      ),
    },

    // 3. Line Clear Mechanics
    {
      badge: 'Очистка',
      title: 'Очищайте ряды и столбцы',
      desc: 'Собирайте полные горизонтальные строки или вертикальные столбцы. Они исчезают с приятной вспышкой, освобождая место для новых фигур.',
      visual: (
        <div className="flex flex-col items-center justify-center p-3">
          <div
            style={{
              backgroundColor: theme.bgBoard,
              borderColor: theme.boardBorder,
            }}
            className="p-3 rounded-2xl border-2 flex flex-col items-center gap-2"
          >
            {/* Horizontal line clearing */}
            <div className="flex gap-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  style={{ backgroundColor: theme.blockColors[i % theme.blockColors.length] }}
                  className="w-5 h-5 rounded-[4px] tactile-block animate-pulse"
                />
              ))}
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider opacity-65">
              <Layers size={12} style={{ color: theme.accent }} />
              <span>Очистка сразу в обе стороны</span>
            </div>
          </div>
        </div>
      ),
    },

    // 4. Combos & Endless Score
    {
      badge: 'Множители',
      title: 'Система очков и комбо',
      desc: 'Очищайте линии каждый ход подряд, чтобы запускать комбо-множители (x2, x3, x4)! Чем выше комбо, тем больше очков вы заработаете.',
      visual: (
        <div className="flex flex-col items-center justify-center p-3 gap-2">
          <div
            style={{
              backgroundColor: theme.accentMuted,
              color: theme.accent,
              borderColor: `${theme.accent}40`,
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm font-black animate-bounce shadow-xs"
          >
            <Flame size={18} className="fill-current text-amber-500" />
            <span>КОМБО x3 (+300 ОЧКОВ)</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
            Игра длится, пока есть место под блоки
          </span>
        </div>
      ),
    },

    // 5. Themes & Customization
    {
      badge: 'Персонализация',
      title: 'Настройки и уютные темы',
      desc: 'Выбирайте из 5 мягких природных тем (Скандинавия, Графит, Капучино, Дзен, Шалфей & Олива), управляйте звуками, виброоткликом и играйте во весь экран.',
      visual: (
        <div className="flex flex-col items-center justify-center p-3 gap-2.5">
          <div
            style={{
              backgroundColor: theme.bgBoard,
              borderColor: theme.boardBorder,
            }}
            className="p-3 rounded-2xl border-2 flex items-center gap-2"
          >
            {theme.blockColors.slice(0, 5).map((color, i) => (
              <div
                key={i}
                style={{ backgroundColor: color }}
                className="w-6 h-6 rounded-[5px] tactile-block"
              />
            ))}
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider opacity-65">
            <Palette size={12} style={{ color: theme.accent }} />
            <span>5 тем оформления без неонового свечения</span>
          </div>
        </div>
      ),
    },
  ];

  const current = cards[step];

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none"
    >
      <div
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.cardBorder,
          color: theme.textPrimary,
          boxShadow: theme.cardShadow,
        }}
        className="w-full max-w-sm rounded-[32px] border p-6 flex flex-col items-center text-center shadow-2xl relative transition-all duration-200"
      >
        {/* Top Header Row with Step Indicator & Skip */}
        <div className="w-full flex items-center justify-between mb-4">
          {/* Progress Segment Bars */}
          <div className="flex items-center gap-1.5 flex-1">
            {cards.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  sound.playClick();
                  haptics.tapLight();
                  setStep(i);
                }}
                style={{
                  backgroundColor: i === step ? theme.accent : theme.cellEmptyBorder,
                  width: i === step ? '28px' : '10px',
                }}
                className="h-1.5 rounded-full transition-all duration-200 cursor-pointer"
                aria-label={`Шаг ${i + 1}`}
              />
            ))}
          </div>

          {/* Skip button */}
          {step < totalSteps - 1 && (
            <button
              onClick={handleSkip}
              style={{ color: theme.textSecondary }}
              className="text-xs font-bold px-2 py-1 active:opacity-70 transition-opacity cursor-pointer ml-2"
            >
              Пропустить
            </button>
          )}
        </div>

        {/* Badge */}
        <span
          style={{
            backgroundColor: theme.accentMuted,
            color: theme.accent,
          }}
          className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-lg mb-2"
        >
          {current.badge} · {step + 1} из {totalSteps}
        </span>

        {/* Visual Illustration */}
        <div className="w-full min-h-[120px] flex items-center justify-center">
          {current.visual}
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-black tracking-tight mt-1 mb-2">
          {current.title}
        </h3>

        {/* Description */}
        <p
          style={{ color: theme.textSecondary }}
          className="text-xs sm:text-sm font-medium leading-relaxed mb-6 px-1 min-h-[54px] flex items-center justify-center"
        >
          {current.desc}
        </p>

        {/* Bottom Navigation Buttons */}
        <div className="w-full flex items-center gap-2">
          {/* Back button if past step 0 */}
          {step > 0 && (
            <button
              onClick={handlePrev}
              style={{
                backgroundColor: theme.bgBoard,
                borderColor: theme.boardBorder,
                color: theme.textSecondary,
              }}
              className="h-13 px-4 rounded-2xl border font-bold text-sm flex items-center justify-center active:scale-95 transition-all cursor-pointer"
              aria-label="Назад"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          {/* Next or Start Playing button */}
          <button
            onClick={handleNext}
            style={{
              backgroundColor: theme.accent,
              color: '#ffffff',
            }}
            className="flex-1 h-13 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
          >
            {step < totalSteps - 1 ? (
              <>
                <span>Далее</span>
                <ArrowRight size={18} />
              </>
            ) : (
              <>
                <span>Начать играть!</span>
                <Check size={19} strokeWidth={2.8} />
              </>
            )}
          </button>
        </div>

        {/* Swipe hint */}
        <span
          style={{ color: theme.textSecondary }}
          className="text-[10px] font-semibold opacity-50 mt-3"
        >
          Свайпайте влево/вправо для переключения
        </span>
      </div>
    </div>
  );
};
