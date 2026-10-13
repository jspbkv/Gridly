import React, { useState } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Vibrate,
  VibrateOff,
  RotateCcw,
  Check,
  Maximize,
  Sliders,
  HelpCircle,
  Lock,
  Database,
  UserCheck,
} from 'lucide-react';
import { Theme, THEMES } from '../types/theme';
import { sound } from '../utils/audio';
import { haptics } from '../utils/haptics';
import { useAuth } from '../context/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: Theme;
  onSelectTheme: (theme: Theme) => void;
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  vibrationEnabled: boolean;
  onToggleVibration: (enabled: boolean) => void;
  onResetHighScore: () => void;
  onTriggerFullscreen: () => void;
  onOpenOnboarding?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  soundEnabled,
  onToggleSound,
  vibrationEnabled,
  onToggleVibration,
  onResetHighScore,
  onTriggerFullscreen,
  onOpenOnboarding,
}) => {
  const { user, isAuthenticated, openAuthGate, openConfigModal, isConfigured } = useAuth();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/45 backdrop-blur-sm select-none">
      <div
        style={{
          backgroundColor: currentTheme.cardBg,
          borderColor: currentTheme.cardBorder,
          color: currentTheme.textPrimary,
          boxShadow: currentTheme.cardShadow,
        }}
        className="w-full max-w-md rounded-t-[28px] sm:rounded-[28px] border p-5 max-h-[92vh] overflow-y-auto flex flex-col gap-4.5 transition-colors duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Sliders size={18} style={{ color: currentTheme.accent }} />
            <h2 className="text-lg font-black tracking-tight">Настройки</h2>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-black/5 active:scale-95 transition-all cursor-pointer"
            aria-label="Назад"
          >
            <X size={20} />
          </button>
        </div>

        {/* Google Account Status Banner */}
        {isAuthenticated ? (
          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              borderColor: 'rgba(16, 185, 129, 0.3)',
            }}
            className="p-3 rounded-2xl border flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5 truncate">
              <UserCheck size={16} className="text-emerald-500 shrink-0" />
              <div className="flex flex-col truncate">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Google Аккаунт активен
                </span>
                <span className="text-xs font-bold truncate">
                  {user?.email || 'Авторизован'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              borderColor: 'rgba(245, 158, 11, 0.3)',
            }}
            className="p-3 rounded-2xl border flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <Lock size={15} className="text-amber-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 leading-tight">
                  Гостевой режим
                </span>
                <span className="text-[10px] opacity-75 leading-tight">
                  Темы, звук и вибро заблокированы
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                haptics.tapLight();
                openAuthGate('Войдите через Google для снятия всех ограничений');
              }}
              style={{
                backgroundColor: currentTheme.accent,
                color: '#ffffff',
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-black active:scale-95 transition-all cursor-pointer shrink-0 shadow-xs"
            >
              Войти
            </button>
          </div>
        )}

        {/* 1. Themes */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-widest opacity-60">
              Тема оформления
            </label>
            {!isAuthenticated && (
              <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                <Lock size={10} />
                <span>Требуется Google</span>
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 gap-2">
            {THEMES.map((t) => {
              const isSelected = t.id === currentTheme.id;
              const isLockedForGuest = !isAuthenticated && !isSelected;

              return (
                <button
                  key={t.id}
                  onClick={() => {
                    if (isLockedForGuest) {
                      sound.playClick();
                      openAuthGate('Выбор тем оформления доступен после входа через Google!');
                      return;
                    }
                    sound.playClick();
                    haptics.tapLight();
                    onSelectTheme(t);
                  }}
                  style={{
                    backgroundColor: t.bgBoard,
                    borderColor: isSelected ? t.accent : t.boardBorder,
                  }}
                  className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all active:scale-[0.98] cursor-pointer ${
                    isSelected ? 'ring-2 ring-offset-2 ring-offset-transparent' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Square tile color preview */}
                    <div className="flex items-center gap-1">
                      {t.blockColors.slice(0, 4).map((c, i) => (
                        <div
                          key={i}
                          style={{ backgroundColor: c }}
                          className="w-5 h-5 rounded-[5px] border border-black/15 shadow-xs tactile-block"
                        />
                      ))}
                    </div>
                    <div className="text-left">
                      <div
                        style={{ color: t.textPrimary }}
                        className="font-bold text-sm leading-tight flex items-center gap-1.5"
                      >
                        <span>{t.name}</span>
                        {isLockedForGuest && (
                          <Lock size={12} className="text-amber-500" />
                        )}
                      </div>
                      <div
                        style={{ color: t.textSecondary }}
                        className="text-[11px] leading-tight"
                      >
                        {t.description}
                      </div>
                    </div>
                  </div>

                  {isSelected ? (
                    <div
                      style={{ backgroundColor: t.accent }}
                      className="w-5 h-5 rounded-[6px] flex items-center justify-center text-white shadow-xs"
                    >
                      <Check size={12} strokeWidth={3} />
                    </div>
                  ) : isLockedForGuest ? (
                    <div className="w-5 h-5 rounded-[6px] flex items-center justify-center text-amber-500 bg-amber-500/10">
                      <Lock size={12} />
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Sound & Haptics */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-widest opacity-60">
              Звук и вибрация
            </label>
            {!isAuthenticated && (
              <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                <Lock size={10} />
                <span>Требуется Google</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Sound Toggle */}
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  sound.playClick();
                  openAuthGate('Настройка звука доступна после входа через Google!');
                  return;
                }
                const next = !soundEnabled;
                onToggleSound(next);
                if (next) sound.playClick();
              }}
              style={{
                backgroundColor: currentTheme.bgBoard,
                borderColor: soundEnabled ? currentTheme.accent : currentTheme.cardBorder,
              }}
              className="flex items-center justify-between p-3 rounded-2xl border transition-all active:scale-95 cursor-pointer relative"
            >
              <div className="flex items-center gap-2">
                {soundEnabled ? (
                  <Volume2 size={18} style={{ color: currentTheme.accent }} />
                ) : (
                  <VolumeX size={18} className="opacity-40" />
                )}
                <span className="font-bold text-xs">Звуки</span>
              </div>
              <div className="flex items-center gap-1">
                {!isAuthenticated && <Lock size={11} className="text-amber-500" />}
                <span
                  style={{
                    backgroundColor: soundEnabled ? currentTheme.accentMuted : 'transparent',
                    color: soundEnabled ? currentTheme.accent : currentTheme.textSecondary,
                  }}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                >
                  {soundEnabled ? 'ВКЛ' : 'ВЫКЛ'}
                </span>
              </div>
            </button>

            {/* Vibration Toggle */}
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  sound.playClick();
                  openAuthGate('Настройка вибрации доступна после входа через Google!');
                  return;
                }
                const next = !vibrationEnabled;
                onToggleVibration(next);
                if (next) haptics.tapLight();
              }}
              style={{
                backgroundColor: currentTheme.bgBoard,
                borderColor: vibrationEnabled ? currentTheme.accent : currentTheme.cardBorder,
              }}
              className="flex items-center justify-between p-3 rounded-2xl border transition-all active:scale-95 cursor-pointer relative"
            >
              <div className="flex items-center gap-2">
                {vibrationEnabled ? (
                  <Vibrate size={18} style={{ color: currentTheme.accent }} />
                ) : (
                  <VibrateOff size={18} className="opacity-40" />
                )}
                <span className="font-bold text-xs">Вибро</span>
              </div>
              <div className="flex items-center gap-1">
                {!isAuthenticated && <Lock size={11} className="text-amber-500" />}
                <span
                  style={{
                    backgroundColor: vibrationEnabled ? currentTheme.accentMuted : 'transparent',
                    color: vibrationEnabled ? currentTheme.accent : currentTheme.textSecondary,
                  }}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                >
                  {vibrationEnabled ? 'ВКЛ' : 'ВЫКЛ'}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* 3. Android & Offline Tools */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold uppercase tracking-widest opacity-60">
            Опции Android и БД
          </label>

          {/* Supabase Config Shortcut */}
          <button
            onClick={() => {
              sound.playClick();
              haptics.tapLight();
              openConfigModal();
            }}
            style={{
              backgroundColor: currentTheme.bgBoard,
              borderColor: currentTheme.cardBorder,
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl border active:scale-98 transition-all text-xs font-bold cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Database size={15} style={{ color: currentTheme.accent }} />
              <span>Параметры базы данных Supabase</span>
            </div>
            <span
              style={{
                color: isConfigured ? '#10b981' : '#f59e0b',
                backgroundColor: isConfigured ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              }}
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            >
              {isConfigured ? 'Подключен' : 'Демо-режим'}
            </span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              haptics.tapLight();
              onTriggerFullscreen();
            }}
            style={{
              backgroundColor: currentTheme.bgBoard,
              borderColor: currentTheme.cardBorder,
            }}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border active:scale-98 transition-all text-xs font-bold cursor-pointer"
          >
            <Maximize size={15} />
            <span>Скрыть статус-бар (Полноэкранный режим)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenOnboarding?.();
            }}
            style={{
              backgroundColor: currentTheme.bgBoard,
              borderColor: currentTheme.cardBorder,
            }}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border active:scale-98 transition-all text-xs font-bold cursor-pointer"
          >
            <HelpCircle size={15} />
            <span>Обучение: Как играть в Gridly</span>
          </button>
        </div>

        {/* 4. Reset record */}
        <div className="pt-2 border-t border-black/10 dark:border-white/10 flex flex-col gap-2">
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-2xl text-red-500 bg-red-500/10 border border-red-500/15 active:scale-95 transition-all text-xs font-bold cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Сбросить рекорд</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  haptics.tapPlace();
                  onResetHighScore();
                  setShowResetConfirm(false);
                }}
                className="flex-1 p-2.5 rounded-2xl bg-red-500 text-white font-bold text-xs active:scale-95 transition-transform cursor-pointer"
              >
                Да, сбросить
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                style={{ backgroundColor: currentTheme.bgBoard }}
                className="flex-1 p-2.5 rounded-2xl font-bold text-xs active:scale-95 transition-transform cursor-pointer"
              >
                Отмена
              </button>
            </div>
          )}
        </div>

        {/* Close */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          style={{
            backgroundColor: currentTheme.accent,
            color: '#ffffff',
          }}
          className="w-full py-3.5 rounded-2xl font-black text-sm shadow-md active:scale-98 transition-transform cursor-pointer"
        >
          Вернуться в игру
        </button>
      </div>
    </div>
  );
};
