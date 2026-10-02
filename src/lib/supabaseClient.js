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
  supabaseUrl !== 'https://tu-proyecto.supabase.co' &&
  !supabaseUrl.includes('placeholder') &&
  supabaseAnonKey !== 'tu-anon-public-key-aqui' &&
  !supabaseAnonKey.includes('placeholder')
);

export const supabaseConfigDiagnostics = {
  isConfigured: isSupabaseConfigured,
  missingUrl: !supabaseUrl || !isValidUrl(supabaseUrl) || supabaseUrl.includes('placeholder') || supabaseUrl === 'https://your-project.supabase.co' || supabaseUrl === 'https://tu-proyecto.supabase.co',
  missingKey: !supabaseAnonKey || supabaseAnonKey.includes('placeholder') || supabaseAnonKey === 'tu-anon-public-key-aqui',
  isProd: Boolean(import.meta.env.PROD || import.meta.env.VITE_APP_ENV === 'production'),
  errorReason: !isSupabaseConfigured
    ? (!supabaseUrl || !isValidUrl(supabaseUrl) || supabaseUrl.includes('placeholder')
        ? 'VITE_SUPABASE_URL ausente o inválida en el archivo .env'
        : !supabaseAnonKey || supabaseAnonKey.includes('placeholder')
          ? 'VITE_SUPABASE_ANON_KEY ausente o inválida en el archivo .env'
          : 'Configuración de Supabase incompleta')
    : null
};

if (!isSupabaseConfigured) {
  const errMsg = '[CITRA PERSISTENCIA ADVERTENCIA (B-04)] Variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY ausentes o inválidas. El sistema requiere configuración en .env para persistencia en base de datos central.';
  if (import.meta.env.PROD) {
    console.error(errMsg);
  } else {
    console.warn(errMsg);
  }
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

