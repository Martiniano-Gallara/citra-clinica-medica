import { createClient } from '@supabase/supabase-js';

function sanitizeSupabaseUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();

  // If the URL was accidentally pasted multiple times (e.g. https://xxx.supabase.cohttps://xxx.supabase.co)
  const supabaseCoMatch = trimmed.match(/https?:\/\/[a-z0-9_-]+\.supabase\.co/i);
  if (supabaseCoMatch) {
    return supabaseCoMatch[0];
  }

  // Generic fallback: take the first valid http/https URL and strip trailing slashes
  const firstUrlMatch = trimmed.match(/^https?:\/\/[^\s"'<>;,]+/i);
  if (firstUrlMatch) {
    return firstUrlMatch[0].replace(/\/+$/, '');
  }

  return trimmed.replace(/\/+$/, '');
}

function sanitizeSupabaseKey(rawKey) {
  if (!rawKey || typeof rawKey !== 'string') return '';
  return rawKey.trim().replace(/^["']|["']$/g, '');
}

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabaseUrl = sanitizeSupabaseUrl(rawSupabaseUrl);
const supabaseAnonKey = sanitizeSupabaseKey(rawSupabaseAnonKey);

function isValidUrl(url) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  isValidUrl(supabaseUrl) &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

