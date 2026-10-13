import React, { useState } from 'react';
import { Theme } from '../types/theme';
import { useAuth } from '../context/AuthContext';
import {
  saveCustomSupabaseConfig,
  clearCustomSupabaseConfig,
  getActiveSupabaseConfig,
  SUPABASE_SETUP_SQL,
} from '../services/supabase';
import { sound } from '../utils/audio';
import { haptics } from '../utils/haptics';
import {
  X,
  Database,
  Check,
  Copy,
  ExternalLink,
  Key,
  Globe,
  AlertCircle,
  Trash2,
} from 'lucide-react';

interface SupabaseConfigModalProps {
  theme: Theme;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ theme }) => {
  const { configModalOpen, closeConfigModal, refreshConfig } = useAuth();
  const currentConfig = getActiveSupabaseConfig();

  const [urlInput, setUrlInput] = useState(currentConfig.url);
  const [anonKeyInput, setAnonKeyInput] = useState(currentConfig.anonKey);
  const [copiedSql, setCopiedSql] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!configModalOpen) return null;

  const handleSave = () => {
    sound.playClick();
    haptics.tapLight();
    saveCustomSupabaseConfig(urlInput, anonKeyInput);
    refreshConfig();
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      closeConfigModal();
    }, 800);
  };

  const handleClear = () => {
    sound.playClick();
    haptics.tapLight();
    clearCustomSupabaseConfig();
    setUrlInput('');
    setAnonKeyInput('');
    refreshConfig();
  };

  const handleCopySql = () => {
    sound.playClick();
    haptics.tapLight();
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md select-none">
      <div
        style={{
          backgroundColor: theme.cardBg,
          borderColor: theme.cardBorder,
          color: theme.textPrimary,
          boxShadow: theme.cardShadow,
        }}
        className="w-full max-w-lg rounded-t-[30px] sm:rounded-[30px] border p-5 max-h-[92vh] overflow-y-auto flex flex-col gap-4.5 transition-all shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div
              style={{ backgroundColor: `${theme.accent}18` }}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
            >
              <Database size={18} style={{ color: theme.accent }} />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">
                Настройки Supabase (Облачная БД)
              </h2>
              <p
                style={{ color: theme.textSecondary }}
                className="text-[11px] leading-tight"
              >
                Глобальный рейтинг игроков и Google OAuth
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              closeConfigModal();
            }}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-black/5 active:scale-95 transition-all cursor-pointer opacity-70"
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>
        </div>

        {/* Status banner */}
        <div
          style={{
            backgroundColor: currentConfig.isConfigured ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            borderColor: currentConfig.isConfigured ? '#10b981' : '#f59e0b',
          }}
          className="p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-semibold"
        >
          {currentConfig.isConfigured ? (
            <>
              <Check size={16} className="text-emerald-500 shrink-0" />
              <span className="text-emerald-600 dark:text-emerald-400">
                Supabase подключен! Рекорды и авторизация активны.
              </span>
            </>
          ) : (
            <>
              <AlertCircle size={16} className="text-amber-500 shrink-0" />
              <span className="text-amber-600 dark:text-amber-400">
                Сейчас работает демонстрационный режим мирового топа. Введите свои ключи для синхронизации с реальным проектом Supabase.
              </span>
            </>
          )}
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider opacity-70 mb-1 flex items-center gap-1.5">
              <Globe size={13} />
              <span>Project URL (VITE_SUPABASE_URL)</span>
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              style={{
                backgroundColor: theme.bgBoard,
                borderColor: theme.boardBorder,
                color: theme.textPrimary,
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider opacity-70 mb-1 flex items-center gap-1.5">
              <Key size={13} />
              <span>Anon Public Key (VITE_SUPABASE_ANON_KEY)</span>
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKeyInput}
              onChange={(e) => setAnonKeyInput(e.target.value)}
              style={{
                backgroundColor: theme.bgBoard,
                borderColor: theme.boardBorder,
                color: theme.textPrimary,
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
        </div>

        {/* Quick SQL schema copy helper */}
        <div
          style={{ backgroundColor: theme.bgBoard, borderColor: theme.boardBorder }}
          className="p-3.5 rounded-2xl border flex flex-col gap-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold leading-tight">
              Скрипт создания таблиц (SQL)
            </span>
            <button
              onClick={handleCopySql}
              style={{
                backgroundColor: theme.accentMuted,
                color: theme.accent,
              }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
            >
              {copiedSql ? (
                <>
                  <Check size={13} />
                  <span>Скопировано!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Копировать SQL</span>
                </>
              )}
            </button>
          </div>
          <p
            style={{ color: theme.textSecondary }}
            className="text-[11px] leading-relaxed"
          >
            Вставьте данный SQL в Supabase Dashboard → SQL Editor для создания таблиц <code>profiles</code> и <code>leaderboard_scores</code> с нужными политиками RLS.
          </p>
        </div>

        {/* OAuth URLs Helper & Guide */}
        <div
          style={{ backgroundColor: theme.bgBoard, borderColor: theme.boardBorder }}
          className="p-3.5 rounded-2xl border flex flex-col gap-2.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold leading-tight flex items-center gap-1.5">
              <Globe size={13} style={{ color: theme.accent }} />
              <span>Адреса для Google Cloud OAuth</span>
            </span>
          </div>

          <div className="flex flex-col gap-2 text-[11px]">
            <div>
              <span className="opacity-70 block mb-0.5 font-medium">1. Callback URL для Google Cloud Console (Authorized redirect URIs):</span>
              <div className="flex items-center gap-1.5">
                <code className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/10 dark:bg-white/10 text-[10px] font-mono truncate select-all">
                  {urlInput && urlInput.startsWith('http')
                    ? `${urlInput.replace(/\/+$/, '')}/auth/v1/callback`
                    : 'https://<PROJECT-REF>.supabase.co/auth/v1/callback'}
                </code>
                <button
                  onClick={() => {
                    sound.playClick();
                    haptics.tapLight();
                    const cb = urlInput && urlInput.startsWith('http')
                      ? `${urlInput.replace(/\/+$/, '')}/auth/v1/callback`
                      : 'https://<PROJECT-REF>.supabase.co/auth/v1/callback';
                    navigator.clipboard.writeText(cb);
                  }}
                  className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
                >
                  <Copy size={12} />
                  <span>Копия</span>
                </button>
              </div>
            </div>

            <div>
              <span className="opacity-70 block mb-0.5 font-medium">2. Site URL для Supabase Dashboard (URL Configuration):</span>
              <div className="flex items-center gap-1.5">
                <code className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/10 dark:bg-white/10 text-[10px] font-mono truncate select-all">
                  {window.location.origin}
                </code>
                <button
                  onClick={() => {
                    sound.playClick();
                    haptics.tapLight();
                    navigator.clipboard.writeText(window.location.origin);
                  }}
                  className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
                >
                  <Copy size={12} />
                  <span>Копия</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-1 gap-2">
          {currentConfig.url && (
            <button
              onClick={handleClear}
              className="px-3 py-2 rounded-xl text-red-500 hover:bg-red-500/10 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Очистить</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => closeConfigModal()}
              style={{ backgroundColor: theme.bgBoard, color: theme.textSecondary }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer"
            >
              Отмена
            </button>

            <button
              onClick={handleSave}
              style={{
                backgroundColor: theme.accent,
                color: '#ffffff',
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer shadow-md flex items-center gap-1.5"
            >
              {saveSuccess ? (
                <>
                  <Check size={14} />
                  <span>Сохранено!</span>
                </>
              ) : (
                <span>Сохранить параметры</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
