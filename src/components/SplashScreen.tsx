import React, { useEffect, useState } from 'react';
import { Theme } from '../types/theme';
import { requestFullscreenImmersive } from '../utils/fullscreen';

interface SplashScreenProps {
  theme: Theme;
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ theme, onFinish }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Check if player has visited before to adjust duration
    const hasVisited = localStorage.getItem('gridly_visited');
    const duration = hasVisited ? 1400 : 2200;

    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        onFinish();
      }, 400); // 400ms fade transition
    }, duration);

    return () => clearTimeout(timer);
  }, [onFinish]);

  const handleSkip = () => {
    requestFullscreenImmersive();
    if (!isFadingOut) {
      setIsFadingOut(true);
      setTimeout(() => {
        onFinish();
      }, 250);
    }
  };

  return (
    <div
      onClick={handleSkip}
      style={{
        backgroundColor: theme.bgMain,
        background: theme.bgGradient,
        color: theme.textPrimary,
      }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-8 select-none touch-none transition-opacity duration-400 cursor-pointer ${
        isFadingOut ? 'opacity-0 scale-102 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Top spacing */}
      <div className="h-6" />

      {/* Center Brand Identity */}
      <div className="flex flex-col items-center gap-5 my-auto">
        {/* Tactile 2x2 Logo Blocks with gentle spring pulse */}
        <div
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
            boxShadow: theme.boardShadow,
          }}
          className="p-4 rounded-3xl border-2 grid grid-cols-2 gap-2.5 animate-pop-in"
        >
          <div
            style={{ backgroundColor: theme.blockColors[0] }}
            className="w-9 h-9 tactile-block rounded-[8px]"
          />
          <div
            style={{ backgroundColor: theme.blockColors[1] }}
            className="w-9 h-9 tactile-block rounded-[8px]"
          />
          <div
            style={{ backgroundColor: theme.blockColors[2] }}
            className="w-9 h-9 tactile-block rounded-[8px]"
          />
          <div
            style={{ backgroundColor: theme.blockColors[4] || theme.blockColors[3] }}
            className="w-9 h-9 tactile-block rounded-[8px]"
          />
        </div>

        {/* Title */}
        <div className="flex flex-col items-center text-center">
          <h1
            style={{ color: theme.textPrimary }}
            className="text-4xl sm:text-5xl font-black tracking-tight tracking-wider"
          >
            GRIDLY
          </h1>
          <p
            style={{ color: theme.textSecondary }}
            className="text-xs sm:text-sm font-bold uppercase tracking-widest mt-1 opacity-80"
          >
            Блочная головоломка
          </p>
        </div>

        {/* Subtle decorative dot shimmer */}
        <div className="flex items-center gap-1.5 mt-2">
          <div
            style={{ backgroundColor: theme.accent }}
            className="w-1.5 h-1.5 rounded-sm animate-pulse"
          />
          <div
            style={{ backgroundColor: theme.accent }}
            className="w-1.5 h-1.5 rounded-sm animate-pulse [animation-delay:150ms]"
          />
          <div
            style={{ backgroundColor: theme.accent }}
            className="w-1.5 h-1.5 rounded-sm animate-pulse [animation-delay:300ms]"
          />
        </div>
      </div>

      {/* Bottom info */}
      <div className="flex flex-col items-center gap-1 opacity-60">
        <span
          style={{ color: theme.textSecondary }}
          className="text-[11px] font-semibold tracking-wider uppercase"
        >
          Нажмите, чтобы продолжить
        </span>
      </div>
    </div>
  );
};
