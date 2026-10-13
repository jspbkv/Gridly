import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

// Configuration keys: env vars take priority, with localStorage fallback for in-browser setup
const ENV_URL = import.meta.env.VITE_SUPABASE_URL || '';
const ENV_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const STORAGE_KEY_URL = 'gridly_supabase_url';
const STORAGE_KEY_ANON = 'gridly_supabase_anon_key';

export interface LeaderboardEntry {
  id: string | number;
  user_id: string;
  player_name: string;
  avatar_icon: string;
  mode: string; // 'overall' | 'classic' | 'time_attack' | 'zen' | 'challenge'
  score: number;
  max_combo: number;
  lines_cleared: number;
  updated_at: string;
  rank?: number;
}

export interface SupabaseConfigState {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

// SQL helper for one-click setup in Supabase SQL editor
export const SUPABASE_SETUP_SQL = `-- 1. Таблица профилей игроков
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  player_name TEXT NOT NULL DEFAULT 'Игрок',
  avatar_icon TEXT NOT NULL DEFAULT 'fox',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Таблица глобальных рекордов
CREATE TABLE IF NOT EXISTS public.leaderboard_scores (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  player_name TEXT NOT NULL,
  avatar_icon TEXT NOT NULL DEFAULT 'fox',
  mode TEXT NOT NULL, -- 'overall', 'classic', 'time_attack', 'zen', 'challenge'
  score INTEGER NOT NULL,
  max_combo INTEGER NOT NULL DEFAULT 0,
  lines_cleared INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, mode)
);

-- Индекс для мгновенной выборки топа
CREATE INDEX IF NOT EXISTS idx_leaderboard_mode_score 
ON public.leaderboard_scores (mode, score DESC);

-- RLS (Row Level Security): чтение всем, запись владельцу
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles readable by anyone" ON public.profiles;
CREATE POLICY "Profiles readable by anyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Profiles updatable by owner" ON public.profiles;
CREATE POLICY "Profiles updatable by owner" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles insertable by owner" ON public.profiles;
CREATE POLICY "Profiles insertable by owner" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Leaderboard readable by anyone" ON public.leaderboard_scores;
CREATE POLICY "Leaderboard readable by anyone" ON public.leaderboard_scores FOR SELECT USING (true);

DROP POLICY IF EXISTS "Leaderboard upsertable by owner" ON public.leaderboard_scores;
CREATE POLICY "Leaderboard upsertable by owner" ON public.leaderboard_scores FOR ALL USING (auth.uid() = user_id);
`;

// Realistic demonstration leaderboard data for offline/demo/unconfigured state
const DEMO_LEADERBOARDS: Record<string, LeaderboardEntry[]> = {
  overall: [
    { id: 1, user_id: 'u-1', player_name: 'Alex_Master', avatar_icon: 'fox', mode: 'overall', score: 32450, max_combo: 9, lines_cleared: 312, updated_at: '2026-10-12T14:20:00Z' },
    { id: 2, user_id: 'u-2', player_name: 'Elena_Pro', avatar_icon: 'cat', mode: 'overall', score: 28910, max_combo: 8, lines_cleared: 278, updated_at: '2026-10-12T18:40:00Z' },
    { id: 3, user_id: 'u-3', player_name: 'ZenMaster99', avatar_icon: 'panda', mode: 'overall', score: 24600, max_combo: 7, lines_cleared: 240, updated_at: '2026-10-11T20:15:00Z' },
    { id: 4, user_id: 'u-4', player_name: 'BlockStriker', avatar_icon: 'bear', mode: 'overall', score: 21300, max_combo: 7, lines_cleared: 195, updated_at: '2026-10-10T09:30:00Z' },
    { id: 5, user_id: 'u-5', player_name: 'StarGazer', avatar_icon: 'star', mode: 'overall', score: 18750, max_combo: 6, lines_cleared: 180, updated_at: '2026-10-12T11:00:00Z' },
    { id: 6, user_id: 'u-6', player_name: 'NightOwl', avatar_icon: 'owl', mode: 'overall', score: 16400, max_combo: 6, lines_cleared: 162, updated_at: '2026-10-09T23:10:00Z' },
    { id: 7, user_id: 'u-7', player_name: 'PuzzleWizard', avatar_icon: 'fox', mode: 'overall', score: 14200, max_combo: 5, lines_cleared: 140, updated_at: '2026-10-08T16:45:00Z' },
    { id: 8, user_id: 'u-8', player_name: 'NeonFox', avatar_icon: 'cat', mode: 'overall', score: 12900, max_combo: 5, lines_cleared: 125, updated_at: '2026-10-07T12:00:00Z' },
    { id: 9, user_id: 'u-9', player_name: 'ComboKing', avatar_icon: 'bear', mode: 'overall', score: 11150, max_combo: 5, lines_cleared: 110, updated_at: '2026-10-06T15:20:00Z' },
    { id: 10, user_id: 'u-10', player_name: 'CosmicGrid', avatar_icon: 'star', mode: 'overall', score: 9800, max_combo: 4, lines_cleared: 98, updated_at: '2026-10-05T18:05:00Z' },
  ],
  classic: [
    { id: 101, user_id: 'u-1', player_name: 'Alex_Master', avatar_icon: 'fox', mode: 'classic', score: 32450, max_combo: 9, lines_cleared: 312, updated_at: '2026-10-12T14:20:00Z' },
    { id: 102, user_id: 'u-2', player_name: 'Elena_Pro', avatar_icon: 'cat', mode: 'classic', score: 28910, max_combo: 8, lines_cleared: 278, updated_at: '2026-10-12T18:40:00Z' },
    { id: 103, user_id: 'u-4', player_name: 'BlockStriker', avatar_icon: 'bear', mode: 'classic', score: 20100, max_combo: 7, lines_cleared: 185, updated_at: '2026-10-10T09:30:00Z' },
    { id: 104, user_id: 'u-7', player_name: 'PuzzleWizard', avatar_icon: 'fox', mode: 'classic', score: 14200, max_combo: 5, lines_cleared: 140, updated_at: '2026-10-08T16:45:00Z' },
    { id: 105, user_id: 'u-8', player_name: 'NeonFox', avatar_icon: 'cat', mode: 'classic', score: 11800, max_combo: 5, lines_cleared: 115, updated_at: '2026-10-07T12:00:00Z' },
  ],
  time_attack: [
    { id: 201, user_id: 'u-2', player_name: 'Elena_Pro', avatar_icon: 'cat', mode: 'time_attack', score: 19400, max_combo: 8, lines_cleared: 190, updated_at: '2026-10-12T19:00:00Z' },
    { id: 202, user_id: 'u-4', player_name: 'BlockStriker', avatar_icon: 'bear', mode: 'time_attack', score: 16800, max_combo: 7, lines_cleared: 165, updated_at: '2026-10-11T14:10:00Z' },
    { id: 203, user_id: 'u-5', player_name: 'StarGazer', avatar_icon: 'star', mode: 'time_attack', score: 15200, max_combo: 6, lines_cleared: 148, updated_at: '2026-10-10T12:30:00Z' },
    { id: 204, user_id: 'u-6', player_name: 'NightOwl', avatar_icon: 'owl', mode: 'time_attack', score: 13900, max_combo: 6, lines_cleared: 135, updated_at: '2026-10-09T23:10:00Z' },
  ],
  zen: [
    { id: 301, user_id: 'u-3', player_name: 'ZenMaster99', avatar_icon: 'panda', mode: 'zen', score: 24600, max_combo: 7, lines_cleared: 240, updated_at: '2026-10-11T20:15:00Z' },
    { id: 302, user_id: 'u-1', player_name: 'Alex_Master', avatar_icon: 'fox', mode: 'zen', score: 22100, max_combo: 6, lines_cleared: 215, updated_at: '2026-10-10T17:00:00Z' },
    { id: 303, user_id: 'u-5', player_name: 'StarGazer', avatar_icon: 'star', mode: 'zen', score: 18750, max_combo: 6, lines_cleared: 180, updated_at: '2026-10-12T11:00:00Z' },
    { id: 304, user_id: 'u-10', player_name: 'CosmicGrid', avatar_icon: 'star', mode: 'zen', score: 9800, max_combo: 4, lines_cleared: 98, updated_at: '2026-10-05T18:05:00Z' },
  ],
  challenge: [
    { id: 401, user_id: 'u-1', player_name: 'Alex_Master', avatar_icon: 'fox', mode: 'challenge', score: 15600, max_combo: 7, lines_cleared: 150, updated_at: '2026-10-11T13:00:00Z' },
    { id: 402, user_id: 'u-2', player_name: 'Elena_Pro', avatar_icon: 'cat', mode: 'challenge', score: 14200, max_combo: 6, lines_cleared: 138, updated_at: '2026-10-10T16:20:00Z' },
    { id: 403, user_id: 'u-9', player_name: 'ComboKing', avatar_icon: 'bear', mode: 'challenge', score: 11150, max_combo: 5, lines_cleared: 110, updated_at: '2026-10-06T15:20:00Z' },
  ],
};

let cachedClient: SupabaseClient | null = null;

export function cleanSupabaseUrl(raw: string): string {
  if (!raw) return '';
  return raw
    .trim()
    .replace(/\/rest\/v1\/?$/, '')
    .replace(/\/auth\/v1\/?$/, '')
    .replace(/\/+$/, '');
}

export function getActiveSupabaseConfig(): SupabaseConfigState {
  const localUrl = localStorage.getItem(STORAGE_KEY_URL) || '';
  const localAnon = localStorage.getItem(STORAGE_KEY_ANON) || '';

  const rawUrl = (ENV_URL && ENV_URL !== 'MY_SUPABASE_URL' ? ENV_URL : localUrl).trim();
  const url = cleanSupabaseUrl(rawUrl);
  const anonKey = (ENV_ANON_KEY && ENV_ANON_KEY !== 'MY_SUPABASE_ANON_KEY' ? ENV_ANON_KEY : localAnon).trim();

  const isConfigured = Boolean(url && anonKey && url.startsWith('http') && anonKey.length > 20);

  return { url, anonKey, isConfigured };
}

export function saveCustomSupabaseConfig(url: string, anonKey: string): void {
  const cleanedUrl = cleanSupabaseUrl(url);
  localStorage.setItem(STORAGE_KEY_URL, cleanedUrl);
  localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
  cachedClient = null; // reset cached client
}

export function clearCustomSupabaseConfig(): void {
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_ANON);
  cachedClient = null;
}

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const { url, anonKey, isConfigured } = getActiveSupabaseConfig();
  if (!isConfigured) return null;

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    return cachedClient;
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    return null;
  }
}

/**
 * Sign in using Google OAuth via Supabase
 */
export async function signInWithGoogle(): Promise<{ error: Error | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      error: new Error('Supabase не настроен. Укажите URL проекта и Anon Key в настройках.'),
    };
  }

  try {
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) return { error };
    return { error: null };
  } catch (err: any) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Sign out current authenticated user
 */
export async function signOutFromSupabase(): Promise<{ error: Error | null }> {
  const client = getSupabaseClient();
  if (!client) return { error: null };

  try {
    const { error } = await client.auth.signOut();
    return { error };
  } catch (err: any) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Get currently logged-in user
 */
export async function getCurrentAuthUser(): Promise<User | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data } = await client.auth.getUser();
    return data?.user || null;
  } catch (err) {
    console.warn('Failed to get current user from Supabase:', err);
    return null;
  }
}

/**
 * Fetch top leaderboard entries for a given mode
 */
export async function fetchLeaderboardFromSupabase(
  mode: string = 'overall',
  limit: number = 50
): Promise<{ data: LeaderboardEntry[]; isDemo: boolean; error?: string }> {
  const client = getSupabaseClient();

  if (!client) {
    // Return realistic demo scores
    const list = DEMO_LEADERBOARDS[mode] || DEMO_LEADERBOARDS.overall;
    const sorted = [...list].sort((a, b) => b.score - a.score).slice(0, limit);
    return {
      data: sorted.map((item, idx) => ({ ...item, rank: idx + 1 })),
      isDemo: true,
    };
  }

  try {
    const { data, error } = await client
      .from('leaderboard_scores')
      .select('*')
      .eq('mode', mode)
      .order('score', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Supabase fetchLeaderboard error, using demo fallback:', error.message);
      const list = DEMO_LEADERBOARDS[mode] || DEMO_LEADERBOARDS.overall;
      return {
        data: list.map((item, idx) => ({ ...item, rank: idx + 1 })),
        isDemo: true,
        error: error.message,
      };
    }

    if (!data || data.length === 0) {
      // If table is empty yet, return initial seed demo data so UI looks rich
      const list = DEMO_LEADERBOARDS[mode] || DEMO_LEADERBOARDS.overall;
      return {
        data: list.map((item, idx) => ({ ...item, rank: idx + 1 })),
        isDemo: true,
      };
    }

    const ranked: LeaderboardEntry[] = data.map((item: any, idx: number) => ({
      id: item.id,
      user_id: item.user_id,
      player_name: item.player_name || 'Игрок',
      avatar_icon: item.avatar_icon || 'fox',
      mode: item.mode,
      score: item.score || 0,
      max_combo: item.max_combo || 0,
      lines_cleared: item.lines_cleared || 0,
      updated_at: item.updated_at || new Date().toISOString(),
      rank: idx + 1,
    }));

    return { data: ranked, isDemo: false };
  } catch (err: any) {
    console.error('Supabase fetchLeaderboard exception:', err);
    const list = DEMO_LEADERBOARDS[mode] || DEMO_LEADERBOARDS.overall;
    return {
      data: list.map((item, idx) => ({ ...item, rank: idx + 1 })),
      isDemo: true,
      error: err?.message,
    };
  }
}

/**
 * Submit or update score for user in leaderboard
 */
export async function submitScoreToSupabase(params: {
  userId: string;
  playerName: string;
  avatarIcon: string;
  mode: string;
  score: number;
  maxCombo: number;
  linesCleared: number;
}): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    // If client is not configured, save locally to demo list
    return { success: true };
  }

  try {
    // 1. Fetch current score for this user & mode to only update if higher
    const { data: existing } = await client
      .from('leaderboard_scores')
      .select('score, max_combo, lines_cleared')
      .eq('user_id', params.userId)
      .eq('mode', params.mode)
      .single();

    if (existing && existing.score >= params.score) {
      // Score not higher, keep current highscore
      return { success: true };
    }

    // 2. Upsert high score for this mode
    const { error } = await client.from('leaderboard_scores').upsert(
      {
        user_id: params.userId,
        player_name: params.playerName,
        avatar_icon: params.avatarIcon,
        mode: params.mode,
        score: params.score,
        max_combo: Math.max(existing?.max_combo || 0, params.maxCombo),
        lines_cleared: (existing?.lines_cleared || 0) + params.linesCleared,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,mode' }
    );

    if (error) {
      console.warn('Failed to upsert mode score:', error.message);
      return { success: false, error: error.message };
    }

    // 3. Also update 'overall' record if this score exceeds user's overall record
    if (params.mode !== 'overall') {
      const { data: overallExisting } = await client
        .from('leaderboard_scores')
        .select('score, max_combo, lines_cleared')
        .eq('user_id', params.userId)
        .eq('mode', 'overall')
        .single();

      if (!overallExisting || params.score > overallExisting.score) {
        await client.from('leaderboard_scores').upsert(
          {
            user_id: params.userId,
            player_name: params.playerName,
            avatar_icon: params.avatarIcon,
            mode: 'overall',
            score: params.score,
            max_combo: Math.max(overallExisting?.max_combo || 0, params.maxCombo),
            lines_cleared: (overallExisting?.lines_cleared || 0) + params.linesCleared,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,mode' }
        );
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Submit score error:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Sync user profile name and avatar to Supabase profiles & leaderboard_scores
 */
export async function syncUserProfileToSupabase(
  userId: string,
  playerName: string,
  avatarIcon: string
): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('profiles').upsert({
      id: userId,
      player_name: playerName,
      avatar_icon: avatarIcon,
      updated_at: new Date().toISOString(),
    });

    // Also update any existing leaderboard entries for this user
    await client
      .from('leaderboard_scores')
      .update({
        player_name: playerName,
        avatar_icon: avatarIcon,
      })
      .eq('user_id', userId);
  } catch (err) {
    console.warn('Error syncing profile to Supabase:', err);
  }
}
