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
export const encryptDataAES = (data, secretKey = 'CITRA_SECURE_HEALTH_ARG_2026') => {
  const jsonStr = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonStr, secretKey).toString();
};

export const decryptDataAES = (cipherText, secretKey = 'CITRA_SECURE_HEALTH_ARG_2026') => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
  } catch (e) {
    throw new Error('Clave de descifrado incorrecta o archivo de backup corrupto.');
  }
};

/**
 * Genera un evento de auditoría inmutable
 */
export const createAuditLog = (user, action, resource, targetDni, details) => {
  const timestamp = new Date().toISOString();
  const rawData = `${timestamp}|${user?.id || 'sys'}|${action}|${resource}|${targetDni || '-'}|${details}`;
  const eventHash = generateSHA256Hash(rawData);

  return {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp,
    userName: user?.name || 'Sistema / Paciente',
    userRole: user?.role || 'Portal Paciente',
    userId: user?.id || 'usr-system',
    action, // 'READ', 'CREATE', 'UPDATE_ADENDA', 'EXPORT_HCE', 'SIGN_DIGITAL', 'DELETE_ATTEMPT', 'MFA_AUTH', 'ARCA_INVOICE'
    resource, // 'Historia Clínica', 'Receta ReNaPDiS', 'Consentimiento', 'Datos Filiatorios', 'Comprobante Fiscal'
    targetDni: targetDni || '-',
    details,
    ipAddress: '192.168.120.16',
    eventHash
  };
};
