import React from 'react';
import { Flame, Sparkles } from 'lucide-react';

export interface ToastInfo {
  id: string;
  title: string;
  subtitle: string;
  color?: string;
  isCombo?: boolean;
  comboMultiplier?: number;
}

interface ComboToastProps {
  toast: ToastInfo | null;
}

export const ComboToast: React.FC<ComboToastProps> = ({ toast }) => {
  if (!toast) return null;

  const isCombo = toast.isCombo || (toast.comboMultiplier && toast.comboMultiplier >= 2);
  const multiplier = toast.comboMultiplier || 2;

  return (
    <div
      key={toast.id}
      className="absolute top-1/2 left-1/2 pointer-events-none z-40 select-none flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2"
    >
      {isCombo ? (
        <div className="relative flex flex-col items-center justify-center animate-combo-pop">
          {/* Radiant Shockwave Blast Ring */}
          <div className="absolute w-44 h-44 rounded-full border-4 border-amber-400/60 animate-combo-ring pointer-events-none" />
          <div className="absolute w-36 h-36 rounded-full bg-radial from-amber-400/35 via-orange-500/20 to-transparent blur-md pointer-events-none" />

          {/* 3D Tactile Combo Plaque */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #e11d48 100%)',
              boxShadow: '0 18px 36px -6px rgba(234, 88, 12, 0.55), inset 0 2px 3px rgba(255, 255, 255, 0.65), inset 0 -3px 4px rgba(0, 0, 0, 0.25)',
            }}
            className="px-6 py-2.5 rounded-[22px] border-2 border-white/50 flex items-center gap-2.5 text-white"
          >
            <div className="w-8 h-8 rounded-xl bg-white/25 flex items-center justify-center shadow-inner">
              <Flame size={20} className="fill-amber-200 text-amber-100 animate-bounce" />
            </div>

            <div className="flex flex-col items-start leading-none">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                COMBO x{multiplier}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-100 opacity-90 mt-0.5">
                {multiplier >= 4 ? 'ЛЕГЕНДАРНО!' : multiplier === 3 ? 'НЕВЕРОЯТНО!' : 'ОТЛИЧНЫЙ УДАР!'}
              </span>
            </div>

            <Sparkles size={18} className="text-amber-200 animate-pulse ml-1" />
          </div>

          {/* Subtitle bonus pill */}
          {toast.subtitle && (
            <div
              style={{
                backgroundColor: 'rgba(28, 25, 23, 0.88)',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.25)',
              }}
              className="mt-2 px-3.5 py-1 rounded-full border border-white/20 text-amber-200 font-extrabold text-xs tracking-wider backdrop-blur-md"
            >
              {toast.subtitle}
            </div>
          )}
        </div>
      ) : (
        /* Regular toast (e.g. single line / zen message) */
        <div className="animate-combo-pop flex flex-col items-center">
          <div
            style={{
              color: toast.color || '#d97706',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
            }}
            className="text-2xl sm:text-3xl font-black uppercase tracking-wider whitespace-nowrap"
          >
            {toast.title}
          </div>
          {toast.subtitle && (
            <div className="text-white text-xs sm:text-sm font-bold tracking-wide bg-stone-900/80 backdrop-blur-md px-3.5 py-1 rounded-xl mt-1.5 border border-white/10 shadow-sm">
              {toast.subtitle}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
