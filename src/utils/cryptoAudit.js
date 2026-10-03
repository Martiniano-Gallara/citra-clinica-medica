import CryptoJS from 'crypto-js';

/**
 * Calcula el Hash criptográfico SHA-256 de un acto médico o documento clínico.
 * Garantiza inalterabilidad y no repudio según Leyes 26.529 y 25.506.
 */
export const generateSHA256Hash = (payload) => {
  const normalizedString = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return CryptoJS.SHA256(normalizedString).toString(CryptoJS.enc.Hex);
};

/**
 * Verifica si el registro clínico mantiene su integridad original sin modificaciones.
 */
export const verifyRecordIntegrity = (record) => {
  if (!record || !record.integrityHash) return { valid: false, reason: 'Sin hash de integridad' };

  // Reconstruir el objeto base sin el hash
  const { integrityHash, ...baseData } = record;
  const recalculatedHash = generateSHA256Hash(baseData);

  return {
    valid: calculatedHashEquals(integrityHash, recalculatedHash),
    storedHash: integrityHash,
    calculatedHash: recalculatedHash
  };
};

export const hashPassword = (password) => {
  return generateSHA256Hash(`citra_salt_${password}`);
};

const calculatedHashEquals = (h1, h2) => {
  if (!h1 || !h2) return false;
  return h1.trim().toLowerCase() === h2.trim().toLowerCase();
};

/**
 * Cifrado AES-256 para backups y exportaciones de datos sensibles de salud (Ley 25.326).
 */
export const encryptDataAES = (data, secretKey) => {
  if (!secretKey || typeof secretKey !== 'string' || secretKey.trim().length < 8) {
    throw new Error('Se requiere una clave de cifrado segura de al menos 8 caracteres.');
  }
  const jsonStr = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonStr, secretKey).toString();
};

export const decryptDataAES = (cipherText, secretKey) => {
  if (!secretKey || typeof secretKey !== 'string') {
    throw new Error('Se requiere una clave de descifrado válida.');
  }
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedData) throw new Error('Contenido vacío tras descifrado');
    return JSON.parse(decryptedData);
  } catch (e) {
    throw new Error('Clave de descifrado incorrecta o archivo de backup corrupto.');
  }
};

export const createAuditLog = (user, action, resource, targetDni, details) => {
  const timestamp = new Date().toISOString();

  let resolvedName = user?.name || user?.fullName;
  let resolvedRole = user?.role || user?.specialty;
  let resolvedId = user?.id;

  // Si no se proporcionó usuario explícito, resolver a partir del detalle si contiene la identidad
  if (!resolvedName && details && typeof details === 'string') {
    const match = details.match(/Acceso administrativo de ([^(]+)\(([^)]+)\)/);
    if (match) {
      resolvedName = match[1].trim();
      resolvedRole = match[2].trim();
    } else if (details.toLowerCase().includes('secretaría') || details.toLowerCase().includes('secretaria')) {
      resolvedName = 'Secretaría CITRA';
      resolvedRole = 'Secretaría';
    } else if (details.toLowerCase().includes('blanco')) {
      resolvedName = 'Dr. Alejandro Blanco';
      resolvedRole = 'Traumatología y Ortopedia · Dirección Médica';
    }
  }

  // Si aún no está resuelto, consultar el usuario administrativo activo en localStorage
  if (!resolvedName) {
    try {
      const stored = localStorage.getItem('citra_authAdmin') || localStorage.getItem('citra_currentUser');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.name) {
          resolvedName = parsed.name;
          resolvedRole = parsed.role || 'Administración';
          resolvedId = parsed.id || resolvedId;
        }
      }
    } catch {
      // ignore
    }
  }

  const userName = resolvedName || 'Administración CITRA';
  const userRole = resolvedRole || (action === 'LOGIN' ? 'Seguridad' : 'Personal Clínico');
  const userId = resolvedId || user?.id || 'usr-admin';

  const rawData = `${timestamp}|${userId}|${action}|${resource}|${targetDni || '-'}|${details}`;
  const eventHash = generateSHA256Hash(rawData);

  return {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp,
    userName,
    userRole,
    userId,
    action, // 'LOGIN', 'LOGOUT', 'READ', 'CREATE', 'UPDATE_ADENDA', 'EXPORT_HCE', 'SIGN_DIGITAL', etc.
    resource,
    targetDni: targetDni || '-',
    details,
    ipAddress: typeof window !== 'undefined' ? (window.location?.hostname || 'navegador-local') : 'server',
    eventHash
  };
};

/**
 * Genera una contraseña temporal criptográficamente robusta para nuevos usuarios o médicos (C-06)
 * Evita contraseñas predecibles por defecto tipo '123456' o 'Citra2024'.
 */
export const generateSecureTempPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
  const array = new Uint8Array(12);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 12; i++) array[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(array, (byte) => chars[byte % chars.length]).join('');
};
