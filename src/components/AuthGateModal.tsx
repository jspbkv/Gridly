import React, { useState } from 'react';
import { Theme } from '../types/theme';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/audio';
import { haptics } from '../utils/haptics';
import {
  X,
  Lock,
  Sparkles,
  Trophy,
  Palette,
  Volume2,
  BarChart3,
  UserCheck,
  Settings2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface AuthGateModalProps {
  theme: Theme;
}

export const AuthGateModal: React.FC<AuthGateModalProps> = ({ theme }) => {
  const {
    authGateOpen,
    authGateReason,
    closeAuthGate,
    loginWithGoogle,
    openConfigModal,
    isConfigured,
  } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!authGateOpen) return null;

  const handleGoogleLogin = async () => {
    sound.playClick();
    haptics.tapLight();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await loginWithGoogle();
      if (res.error) {
        setErrorMessage(res.error.message);
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Ошибка входа через Google');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md select-none animate-fade-in">
      <div
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.cardBorder,
          color: theme.textPrimary,
          boxShadow: theme.cardShadow,
        }}
        className="w-full max-w-md rounded-t-[32px] sm:rounded-[32px] border p-6 max-h-[92vh] overflow-y-auto flex flex-col gap-5 transition-all shadow-2xl"
      >
        {/* Header with Close */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              style={{
                backgroundColor: `${theme.accent}18`,
                borderColor: `${theme.accent}33`,
              }}
              className="w-12 h-12 rounded-2xl border flex items-center justify-center text-amber-500"
            >
              <Lock size={24} style={{ color: theme.accent }} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                Полный доступ
              </span>
              <h2 className="text-xl font-black tracking-tight leading-tight">
                Вход через Google
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              closeAuthGate();
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 transition-all cursor-pointer opacity-70 hover:opacity-100"
            aria-label="Закрыть"
          >
            <X size={20} />
          </button>
        </div>

        {/* Reason pill if triggered by a specific action */}
        {authGateReason && (
          <div
            style={{
              backgroundColor: theme.bgBoard,
              borderColor: theme.boardBorder,
            }}
            className="p-3 rounded-2xl border text-xs font-semibold leading-relaxed flex items-center gap-2.5"
          >
            <Sparkles size={16} style={{ color: theme.accent }} className="shrink-0" />
            <span>{authGateReason}</span>
          </div>
        )}

        {/* Unlocked Benefits list */}
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider opacity-60">
            Что открывает регистрация:
          </span>

          <div className="grid grid-cols-1 gap-2">
            <div
              style={{ backgroundColor: theme.bgBoard }}
              className="p-3 rounded-2xl flex items-center gap-3 border border-black/5 dark:border-white/5"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-500 shrink-0">
                <Trophy size={16} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold leading-tight">
                  Глобальный топ игроков
                </span>
                <span className="text-[11px] opacity-70 leading-tight">
                  Ваши рекорды попадают в мировой рейтинг Supabase
                </span>
              </div>
            </div>

            <div
              style={{ backgroundColor: theme.bgBoard }}
              className="p-3 rounded-2xl flex items-center gap-3 border border-black/5 dark:border-white/5"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-500 shrink-0">
                <UserCheck size={16} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold leading-tight">
                  Смена ника и аватара
                </span>
                <span className="text-[11px] opacity-70 leading-tight">
                  Уникальное имя и крутые аватарки лисички, котика, панды
                </span>
              </div>
            </div>

            <div
              style={{ backgroundColor: theme.bgBoard }}
              className="p-3 rounded-2xl flex items-center gap-3 border border-black/5 dark:border-white/5"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-500 shrink-0">
                <Palette size={16} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold leading-tight">
                  Премиум-темы оформления
                </span>
                <span className="text-[11px] opacity-70 leading-tight">
                  Неон, Дерево, Тёмный режим, Пастель и Бумага
                </span>
              </div>
            </div>

            <div
              style={{ backgroundColor: theme.bgBoard }}
              className="p-3 rounded-2xl flex items-center gap-3 border border-black/5 dark:border-white/5"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-500 shrink-0">
                <Volume2 size={16} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold leading-tight">
                  Управление звуком и вибро
                </span>
                <span className="text-[11px] opacity-70 leading-tight">
                  Тонкая настройка тактильного отклика и эффектов
                </span>
              </div>
            </div>

            <div
              style={{ backgroundColor: theme.bgBoard }}
              className="p-3 rounded-2xl flex items-center gap-3 border border-black/5 dark:border-white/5"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-500 shrink-0">
                <BarChart3 size={16} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold leading-tight">
                  Подробная аналитика
                </span>
                <span className="text-[11px] opacity-70 leading-tight">
                  График роста очков, средний счёт и статистика по режимам
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-500 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-1">
          {/* Main Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            style={{
              backgroundColor: '#ffffff',
              color: '#1f2937',
              boxShadow: '0 8px 20px -4px rgba(0,0,0,0.2)',
            }}
            className="w-full h-14 rounded-2xl font-black text-base flex items-center justify-center gap-3 active:scale-95 transition-all cursor-pointer border border-gray-200"
          >
            {/* Google Icon SVG */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>
              {isSubmitting ? 'Авторизация...' : 'Продолжить через Google'}
            </span>
          </button>

          {/* Dismiss as guest */}
          <button
            onClick={() => {
              sound.playClick();
              closeAuthGate();
            }}
            style={{
              backgroundColor: theme.bgBoard,
              color: theme.textSecondary,
              borderColor: theme.cardBorder,
            }}
            className="w-full h-11 rounded-2xl border font-bold text-xs flex items-center justify-center active:scale-95 transition-all cursor-pointer"
          >
            Остаться гостем (без сохранения в топ)
          </button>

          {/* Supabase Connection Setup Link */}
          <div className="flex items-center justify-center pt-1">
            <button
              onClick={() => {
                sound.playClick();
                closeAuthGate();
                openConfigModal();
              }}
              className="text-[11px] font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1.5 underline cursor-pointer"
            >
              <Settings2 size={13} />
              <span>
                {isConfigured ? 'Параметры Supabase БД' : 'Подключить свой Supabase URL и Ключ'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
