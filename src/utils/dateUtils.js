/**
 * Centralized Date & Time Utilities for Argentina (ART / UTC-3)
 * Prevents UTC offset rollover bugs past 21:00 ART.
 * Includes CSV formula injection sanitization.
 */

export const formatDateArgentina = (date = new Date()) => {
  try {
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(d);
  } catch {
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
};

export const getTodayArgentina = () => formatDateArgentina(new Date());

export const getCurrentMonthArgentina = (date = new Date()) => {
  return formatDateArgentina(date).substring(0, 7);
};

export const getCurrentYearArgentina = (date = new Date()) => {
  return formatDateArgentina(date).substring(0, 4);
};

export const getDaysAgoArgentina = (days = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return formatDateArgentina(d);
};

export const getNowArgentinaTime = () => {
  try {
    const formatter = new Intl.DateTimeFormat('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    return formatter.format(new Date());
  } catch {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
};

export const formatDateTimeArgentina = (dateInput) => {
  if (!dateInput) return { dateStr: '-', timeStr: '-' };
  try {
    let raw = dateInput;
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      // Si viene en formato ISO o SQL sin zona horaria explícita (almacenado como UTC en PostgreSQL), interpretarlo en UTC
      if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?(\.\d+)?$/.test(trimmed)) {
        raw = trimmed.replace(' ', 'T') + 'Z';
      }
    }
    const d = typeof raw === 'string' || typeof raw === 'number' ? new Date(raw) : raw;
    if (isNaN(d.getTime())) {
      return { dateStr: String(dateInput), timeStr: '' };
    }
    const dateFormatted = new Intl.DateTimeFormat('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(d);

    const timeFormatted = new Intl.DateTimeFormat('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(d);

    return {
      dateStr: dateFormatted,
      timeStr: `${timeFormatted} hs`
    };
  } catch {
    return { dateStr: String(dateInput), timeStr: '' };
  }
};

export const addDays = (dateStr, days) => {
  if (!dateStr) return getTodayArgentina();
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateHeaderEs = (dateStr) => {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const formatted = date.toLocaleDateString('es-AR', options);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch {
    return dateStr;
  }
};

/**
 * Sanitizes values for CSV export to prevent Formula Injection (CSV Injection)
 * Escapes leading =, +, -, @, tab, and newline characters and wraps in escaped quotes.
 */
export const sanitizeCsvCell = (val) => {
  if (val === null || val === undefined) return '""';
  let str = String(val).trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
};
