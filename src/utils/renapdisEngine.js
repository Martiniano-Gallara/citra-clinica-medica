/**
 * Motor de Receta Electrónica conforme Ley 27.553, Decreto 98/2023 y ReNaPDiS
 * (Registro Nacional de Plataformas Digitales Sanitarias - Ministerio de Salud de la Nación)
 */

export const generateCUIR = (doctorId, patientDni, dateStr = new Date().toISOString()) => {
  const cleanDni = (patientDni || '00000000').replace(/\D/g, '');
  const cleanDoc = (doctorId || 'DOC').replace(/\D/g, '').padStart(3, '0');
  const d = new Date(dateStr);
  const yearStr = d.getFullYear().toString().slice(-2);
  const monthStr = String(d.getMonth() + 1).padStart(2, '0');
  const dayStr = String(d.getDate()).padStart(2, '0');
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();

  // Estructura oficial CUIR: [PAIS]-[PROV]-[DOC]-[DNI_PARCIAL]-[AAMMDD]-[RAND]
  return `ARG-CBA-${cleanDoc}-${cleanDni.slice(-4)}-${yearStr}${monthStr}${dayStr}-${randomSuffix}`;
};

export const calculatePrescriptionExpiration = (issueDateStr) => {
  const date = new Date(issueDateStr || new Date());
  date.setDate(date.getDate() + 30); // 30 días corridos según normativa sanitaria
  return date.toISOString().split('T')[0];
};

export const generateReNaPDiSVerificationUrl = (cuir, sisaRefepsLicense, patientDni) => {
  const encodedCuir = encodeURIComponent(cuir);
  return `https://sisa.msal.gov.ar/renapdis/receta/verificar?cuir=${encodedCuir}&refeps=${sisaRefepsLicense}&dni=${patientDni}`;
};

export const COMMON_DCI_MEDICATIONS = [
  { dci: 'Ibuprofeno', form: 'Comprimidos', concentration: '400 mg / 600 mg', defaultUsage: 'Cada 8 horas con las comidas' },
  { dci: 'Paracetamol', form: 'Comprimidos', concentration: '500 mg / 1 g', defaultUsage: 'Cada 8 horas si hay dolor o fiebre' },
  { dci: 'Amoxicilina + Ácido Clavulánico', form: 'Comprimidos recubiertos', concentration: '875/125 mg', defaultUsage: '1 comprimido cada 12 horas por 7 a 10 días' },
  { dci: 'Losartán Potásico', form: 'Comprimidos', concentration: '50 mg', defaultUsage: '1 comprimido por la mañana en ayunas' },
  { dci: 'Enalapril Maleato', form: 'Comprimidos', concentration: '10 mg / 20 mg', defaultUsage: '1 comprimido cada 24 horas' },
  { dci: 'Atorvastatina Cálcica', form: 'Comprimidos', concentration: '10 mg / 20 mg / 40 mg', defaultUsage: '1 comprimido por la noche' },
  { dci: 'Metformina Clorhidrato', form: 'Comprimidos de liberación prolongada', concentration: '850 mg / 1000 mg', defaultUsage: '1 comprimido con la cena' },
  { dci: 'Levotiroxina Sódica', form: 'Comprimidos', concentration: '50 mcg / 75 mcg / 100 mcg', defaultUsage: '1 comprimido al despertar 30 min antes del desayuno' },
  { dci: 'Salbutamol Sulfato', form: 'Aerosol para inhalación', concentration: '100 mcg/dosis', defaultUsage: '2 disparos en caso de disnea o broncoespasmo' },
  { dci: 'Budesonida', form: 'Aerosol / Suspensión para nebulizar', concentration: '200 mcg / 0.5 mg/ml', defaultUsage: '1 disparo cada 12 horas' },
  { dci: 'Clonazepam', form: 'Comprimidos ranurados (Lista IV)', concentration: '0.5 mg / 2 mg', defaultUsage: 'Bajo estricta prescripción archivada' },
  { dci: 'Ketorolac Trometamina', form: 'Comprimidos sublinguales', concentration: '10 mg', defaultUsage: '1 comprimido sublingual cada 8 hs por máximo 5 días' }
];
