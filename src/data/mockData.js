import { generateSHA256Hash } from '../utils/cryptoAudit';
import { generateCUIR, calculatePrescriptionExpiration } from '../utils/renapdisEngine';
import { generateCAE } from '../utils/arcaValidator';

export const INITIAL_CLINIC_INFO = {
  name: 'CITRA',
  tagline: 'Centro Integral de Traumatología & Rehabilitación Arroyito',
  logo: '/citra-logo.png',
  cuit: '30-71829340-8',
  address: 'Av. Bernardi 450, Arroyito, Córdoba',
  phone: '+54 (3576) 45-2200',
  whatsapp: '+54 9 3576 44-8899',
  email: 'contacto@citra.com.ar',
  web: 'www.citra.com.ar',
  sisaRefesCode: 'REFES-04-14289', // Registro Federal de Establecimientos de Salud
  renapdisPlatformId: 'RENAPDIS-ARG-2026-9941', // Registro Nacional de Plataformas Sanitarias
  arcaPtoVta: 1,
  currentBranchId: 'branch-1',
  branches: [
    { id: 'branch-1', name: 'Sede Central Arroyito', address: 'Av. Bernardi 450', consultorios: 8, phone: '+54 (3576) 45-2200' },
    { id: 'branch-2', name: 'Sede San Justo', address: 'San Martín 320', consultorios: 5, phone: '+54 (3564) 42-1200' },
    { id: 'branch-3', name: 'Sede Córdoba Capital', address: 'Av. Rafael Núñez 4200', consultorios: 6, phone: '+54 (351) 489-5500' }
  ]
};

export const INITIAL_SPECIALTIES = [
  { id: 'esp-1', name: 'Traumatología y Ortopedia', icon: 'Bone', defaultDuration: 30, color: '#1A9E9B' },
  { id: 'esp-2', name: 'Kinesiología & Fisiatría', icon: 'Activity', defaultDuration: 40, color: '#6FD0CC' },
  { id: 'esp-3', name: 'Rehabilitación y Deporte', icon: 'Activity', defaultDuration: 30, color: '#0d9488' },
  { id: 'esp-4', name: 'Clínica Médica', icon: 'Stethoscope', defaultDuration: 20, color: '#10b981' },
  { id: 'esp-5', name: 'Cardiología', icon: 'HeartPulse', defaultDuration: 30, color: '#ef4444' },
  { id: 'esp-6', name: 'Dermatología', icon: 'Sparkles', defaultDuration: 20, color: '#ec4899' },
  { id: 'esp-7', name: 'Neurología', icon: 'Brain', defaultDuration: 40, color: '#6366f1' },
  { id: 'esp-8', name: 'Diagnóstico por Imágenes', icon: 'Eye', defaultDuration: 20, color: '#14b8a6' }
];

export const INITIAL_ROOMS = [
  { id: 'room-101', name: 'Consultorio 101 — Traumatología', floor: 'Piso 1', branchId: 'branch-1', specialty: 'Traumatología' },
  { id: 'room-102', name: 'Consultorio 102 — Kinesiología / Gimnasio', floor: 'Piso 1', branchId: 'branch-1', specialty: 'Kinesiología' },
  { id: 'room-103', name: 'Consultorio 103 — Fisiatría y RPG', floor: 'Piso 1', branchId: 'branch-1', specialty: 'Rehabilitación' },
  { id: 'room-201', name: 'Consultorio 201 — Clínica Médica', floor: 'Piso 2', branchId: 'branch-1', specialty: 'Clínica Médica' },
  { id: 'room-202', name: 'Consultorio 202 — Cardiología & ECG', floor: 'Piso 2', branchId: 'branch-1', specialty: 'Cardiología' },
  { id: 'room-203', name: 'Sala de Procedimientos Menores', floor: 'Piso 2', branchId: 'branch-1', specialty: 'Cirugía Ambulatoria' }
];

export const INITIAL_HEALTH_INSURANCES = [
  { id: 'hi-1', name: 'OSDE', plans: ['210', '310', '410', '450', '510'], copay: 0, status: 'Activa', logoColor: '#00529b' },
  { id: 'hi-2', name: 'Swiss Medical', plans: ['SMG20', 'SMG30', 'SMG40', 'SMG50'], copay: 1500, status: 'Activa', logoColor: '#e11d48' },
  { id: 'hi-3', name: 'Galeno', plans: ['Plata', 'Oro', 'Azul'], copay: 2000, status: 'Activa', logoColor: '#2563eb' },
  { id: 'hi-4', name: 'Apross (Córdoba)', plans: ['Obligatorio', 'Voluntario'], copay: 1200, status: 'Activa', logoColor: '#0891b2' },
  { id: 'hi-5', name: 'PAMI', plans: ['General', 'Veteranos'], copay: 0, status: 'Activa', logoColor: '#16a34a' },
  { id: 'hi-6', name: 'Medicus', plans: ['Celeste', 'Azul'], copay: 1800, status: 'Activa', logoColor: '#7c3aed' },
  { id: 'hi-7', name: 'Particular / Privado', plans: ['Arancel Pleno'], copay: 22000, status: 'Activa', logoColor: '#475569' }
];

export const INITIAL_DOCTORS = [
  {
    id: 'doc-1',
    name: 'Dr. Alejandro Morales',
    specialtyId: 'esp-1',
    specialtyName: 'Traumatología y Ortopedia',
    license: 'MN 114.829 / MP 44.920',
    sisaRefeps: 'REFEPS-MN-114829', // Validación oficial SISA
    digitalSignatureStatus: 'Activo (Token PKI ONTI)',
    certExpiration: '2027-11-15',
    email: 'amorales@citra.com.ar',
    phone: '+54 3576 45-2201',
    roomId: 'room-101',
    roomName: 'Consultorio 101',
    color: '#1A9E9B',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    workingDays: ['Lunes', 'Miércoles', 'Viernes'],
    scheduleStart: '08:00',
    scheduleEnd: '14:00',
    slotDuration: 30,
    priceConsultation: 25000,
    feePercentage: 75,
    active: true,
    stats: { patientsAttended: 412, occupationRate: 94, rating: 4.9 }
  },
  {
    id: 'doc-2',
    name: 'Lic. Valentina Rossi',
    specialtyId: 'esp-2',
    specialtyName: 'Kinesiología & Fisiatría',
    license: 'MP 48.112 (Col. Kinesiólogos Cba)',
    sisaRefeps: 'REFEPS-MP-48112',
    digitalSignatureStatus: 'Activo (Firma Remota)',
    certExpiration: '2028-03-20',
    email: 'vrossi@citra.com.ar',
    phone: '+54 3576 45-2202',
    roomId: 'room-102',
    roomName: 'Consultorio 102',
    color: '#6FD0CC',
    avatar: 'https://images.unsplash.com/photo-1594824813584-3c817297e296?w=150&auto=format&fit=crop&q=80',
    workingDays: ['Lunes', 'Martes', 'Jueves', 'Viernes'],
    scheduleStart: '09:00',
    scheduleEnd: '17:00',
    slotDuration: 40,
    priceConsultation: 18000,
    feePercentage: 80,
    active: true,
    stats: { patientsAttended: 530, occupationRate: 98, rating: 5.0 }
  },
  {
    id: 'doc-3',
    name: 'Dr. Matías Benítez',
    specialtyId: 'esp-1',
    specialtyName: 'Traumatología y Artroscopia',
    license: 'MN 98.712 / MP 39.504',
    sisaRefeps: 'REFEPS-MN-98712',
    digitalSignatureStatus: 'Activo (Token FIDO2)',
    certExpiration: '2027-08-30',
    email: 'mbenitez@citra.com.ar',
    phone: '+54 3576 45-2203',
    roomId: 'room-103',
    roomName: 'Consultorio 103',
    color: '#0C4E4C',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
    workingDays: ['Martes', 'Miércoles', 'Jueves'],
    scheduleStart: '13:00',
    scheduleEnd: '19:00',
    slotDuration: 30,
    priceConsultation: 26000,
    feePercentage: 75,
    active: true,
    stats: { patientsAttended: 360, occupationRate: 90, rating: 4.8 }
  },
  {
    id: 'doc-4',
    name: 'Dr. Lucas Herrera',
    specialtyId: 'esp-4',
    specialtyName: 'Clínica Médica & Evaluación Deportiva',
    license: 'MN 105.334 / MP 41.220',
    sisaRefeps: 'REFEPS-MN-105334',
    digitalSignatureStatus: 'Activo (Token PKI)',
    certExpiration: '2027-05-12',
    email: 'lherrera@citra.com.ar',
    phone: '+54 3576 45-2204',
    roomId: 'room-201',
    roomName: 'Consultorio 201',
    color: '#0d9488',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80',
    workingDays: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
    scheduleStart: '08:00',
    scheduleEnd: '16:00',
    slotDuration: 20,
    priceConsultation: 20000,
    feePercentage: 70,
    active: true,
    stats: { patientsAttended: 640, occupationRate: 96, rating: 4.9 }
  }
];

export const INITIAL_PATIENTS = [
  {
    id: 'pat-1',
    name: 'Juan Ignacio Pérez',
    dni: '34.892.110',
    birthDate: '1989-11-14',
    gender: 'Masculino',
    bloodType: 'A+',
    phone: '+54 3576 44-5588',
    email: 'juan.perez@gmail.com',
    address: 'Belgrano 340, Arroyito, Córdoba',
    emergencyContact: 'Luciana Morales (Esposa) · +54 3576 44-5589',
    insuranceId: 'hi-1',
    insuranceName: 'OSDE',
    insurancePlan: '310',
    insuranceNumber: '310-892110-01',
    allergies: ['Penicilina', 'Diclofenac'],
    antecedentes: ['Ruptura de Ligamento Cruzado Anterior (LCA) Rodilla Derecha (2023)', 'Hipertensión arterial controlada'],
    chronicConditions: ['Hipertensión arterial'],
    surgicalHistory: ['Plastia LCA rodilla derecha con semitendinoso (Nov 2023)'],
    observations: 'Paciente deportista amateur (fútbol). En plan de fortalecimiento muscular post-quirúrgico y retorno deportivo.',
    registeredAt: '2022-03-15',
    lastVisit: '2026-08-28',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    patientPortalAccess: true,
    files: [
      { id: 'f-1', name: 'RMN_Rodilla_Derecha_2026.pdf', type: 'Resonancia Magnética', size: '4.8 MB', date: '2026-08-10', hashSha256: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b' },
      { id: 'f-2', name: 'Informe_Kinesico_Evolutivo.pdf', type: 'Informe Médico', size: '1.2 MB', date: '2026-08-15', hashSha256: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b' },
      { id: 'f-3', name: 'Consentimiento_Informado_LCA.pdf', type: 'Consentimiento', size: '0.8 MB', date: '2023-11-02', hashSha256: '7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c' }
    ]
  },
  {
    id: 'pat-2',
    name: 'María Florencia Gómez',
    dni: '38.450.920',
    birthDate: '1994-06-22',
    gender: 'Femenino',
    bloodType: '0+',
    phone: '+54 3576 48-9911',
    email: 'mflorgomez@hotmail.com',
    address: 'San Martín 820, Arroyito, Córdoba',
    emergencyContact: 'Roberto Gómez (Padre) · +54 3576 48-9900',
    insuranceId: 'hi-2',
    insuranceName: 'Swiss Medical',
    insurancePlan: 'SMG20',
    insuranceNumber: 'SMG-450920-00',
    allergies: ['Ácaros del polvo', 'Ibuprofeno'],
    antecedentes: ['Tendinopatía de manguito rotador hombro izquierdo', 'Cervicobraquialgia'],
    chronicConditions: ['Cervicalgia postural'],
    surgicalHistory: ['Sin antecedentes quirúrgicos'],
    observations: 'Trabaja en oficina (computadora 8 hs/día). En tratamiento kinesiológico con punción seca y RPG.',
    registeredAt: '2023-01-10',
    lastVisit: '2026-08-28',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    patientPortalAccess: true,
    files: [
      { id: 'f-4', name: 'Ecografia_Hombro_Izquierdo.pdf', type: 'Ecografía', size: '2.4 MB', date: '2026-06-18', hashSha256: '8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e' }
    ]
  },
  {
    id: 'pat-3',
    name: 'Carlos Alberto Fernández',
    dni: '27.310.840',
    birthDate: '1979-04-03',
    gender: 'Masculino',
    bloodType: 'B+',
    phone: '+54 3576 43-2277',
    email: 'ca.fernandez@techcorp.com',
    address: 'Av. Dalle Mura 140, Arroyito',
    emergencyContact: 'Silvia Rossi (Cónyuge) · +54 3576 43-2278',
    insuranceId: 'hi-4',
    insuranceName: 'Apross (Córdoba)',
    insurancePlan: 'Obligatorio',
    insuranceNumber: 'APR-310840-02',
    allergies: [],
    antecedentes: ['Hernia discal L4-L5 diagnosticada por RMN', 'Lumbalgia mecánica crónica'],
    chronicConditions: ['Lumbalgia crónica', 'Dislipemia'],
    surgicalHistory: ['Apendicectomía (1998)'],
    observations: 'Plan de 10 sesiones de Fisioterapia y RPG aprobadas por Apross. Cinesioterapia lumbar activa.',
    registeredAt: '2021-08-19',
    lastVisit: '2026-08-28',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    patientPortalAccess: true,
    files: [
      { id: 'f-5', name: 'RMN_Columna_Lumbosacra_2026.pdf', type: 'Resonancia Magnética', size: '5.2 MB', date: '2026-05-14', hashSha256: '3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d' }
    ]
  },
  {
    id: 'pat-4',
    name: 'Lucía Belén Domínguez',
    dni: '40.192.485',
    birthDate: '1997-08-19',
    gender: 'Femenino',
    bloodType: 'A-',
    phone: '+54 3576 49-3322',
    email: 'lucia.dominguez@gmail.com',
    address: 'Caseros 512, Arroyito',
    emergencyContact: 'Matías Domínguez (Hermano) · +54 3576 49-3323',
    insuranceId: 'hi-3',
    insuranceName: 'Galeno',
    insurancePlan: 'Oro',
    insuranceNumber: 'GAL-192485-01',
    allergies: ['Sulfamidas'],
    antecedentes: ['Esguince recidivante de tobillo derecho', 'Inestabilidad ligamentaria lateral'],
    chronicConditions: [],
    surgicalHistory: ['Sin cirugías previas'],
    observations: 'Jugadora de hockey sobre césped. En plan de propiocepción y magnetoterapia.',
    registeredAt: '2024-02-11',
    lastVisit: '2026-08-28',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    patientPortalAccess: true,
    files: []
  },
  {
    id: 'pat-5',
    name: 'Martín Eduardo Cabrera',
    dni: '31.502.940',
    birthDate: '1985-03-12',
    gender: 'Masculino',
    bloodType: '0-',
    phone: '+54 3576 41-7788',
    email: 'm.cabrera@agropecuariacba.com',
    address: 'Ruta 19 Km 220, Arroyito',
    emergencyContact: 'Carolina Ferreyra · +54 3576 41-7789',
    insuranceId: 'hi-5',
    insuranceName: 'PAMI (INSSJP)',
    insurancePlan: 'Veteranos',
    insuranceNumber: 'PAMI-502940-00',
    allergies: [],
    antecedentes: ['Lesión compleja de menisco interno rodilla izquierda', 'Gonartrosis incipiente'],
    chronicConditions: ['Gastritis medicamentosa'],
    surgicalHistory: ['Meniscectomía parcial artroscópica (programada)'],
    observations: 'Trabajador rural. Derivado para evaluación de artroscopia diagnóstica y terapéutica.',
    registeredAt: '2023-09-04',
    lastVisit: '2026-08-28',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    patientPortalAccess: true,
    files: [
      { id: 'f-6', name: 'RX_Rodillas_Comparativas.pdf', type: 'Radiografía', size: '3.1 MB', date: '2026-07-22', hashSha256: '5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f' }
    ]
  }
];

const TODAY_STR = '2026-08-28';

export const INITIAL_APPOINTMENTS = [
  {
    id: 'app-1',
    patientId: 'pat-1',
    patientName: 'Juan Ignacio Pérez',
    patientPhone: '+54 3576 44-5588',
    patientDni: '34.892.110',
    patientInsurance: 'OSDE 310',
    doctorId: 'doc-1',
    doctorName: 'Dr. Alejandro Morales',
    specialtyId: 'esp-1',
    specialtyName: 'Traumatología y Ortopedia',
    roomId: 'room-101',
    roomName: 'Consultorio 101',
    date: TODAY_STR,
    time: '08:30',
    duration: 30,
    status: 'atendido',
    reason: 'Control post-rehabilitación de rodilla y evaluación funcional de LCA',
    copayAmount: 0,
    isPaid: true,
    paymentMethod: 'Obra Social OSDE',
    notes: 'Trajo informe de kinesiología y resonancia.'
  },
  {
    id: 'app-2',
    patientId: 'pat-2',
    patientName: 'María Florencia Gómez',
    patientPhone: '+54 3576 48-9911',
    patientDni: '38.450.920',
    patientInsurance: 'Swiss Medical SMG20',
    doctorId: 'doc-2',
    doctorName: 'Lic. Valentina Rossi',
    specialtyId: 'esp-2',
    specialtyName: 'Kinesiología & Fisiatría',
    roomId: 'room-102',
    roomName: 'Consultorio 102',
    date: TODAY_STR,
    time: '09:00',
    duration: 40,
    status: 'atendido',
    reason: 'Sesión N° 6 de kinesiología para hombro y punción seca',
    copayAmount: 1500,
    isPaid: true,
    paymentMethod: 'Tarjeta Débito',
    notes: 'Excelente respuesta a ejercicios de movilidad activa.'
  },
  {
    id: 'app-3',
    patientId: 'pat-3',
    patientName: 'Carlos Alberto Fernández',
    patientPhone: '+54 3576 43-2277',
    patientDni: '27.310.840',
    patientInsurance: 'Apross (Córdoba)',
    doctorId: 'doc-1',
    doctorName: 'Dr. Alejandro Morales',
    specialtyId: 'esp-1',
    specialtyName: 'Traumatología y Ortopedia',
    roomId: 'room-101',
    roomName: 'Consultorio 101',
    date: TODAY_STR,
    time: '09:30',
    duration: 30,
    status: 'en_sala',
    reason: 'Reagudización de dolor lumbar irradiado a miembro inferior derecho',
    copayAmount: 1200,
    isPaid: true,
    paymentMethod: 'MercadoPago QR',
    notes: 'Esperando en recepción Piso 1.'
  },
  {
    id: 'app-4',
    patientId: 'pat-1',
    patientName: 'Lucía Belén Domínguez',
    patientPhone: '+54 3576 49-3322',
    patientDni: '40.192.485',
    patientInsurance: 'Galeno Oro',
    doctorId: 'doc-2',
    doctorName: 'Lic. Valentina Rossi',
    specialtyId: 'esp-2',
    specialtyName: 'Kinesiología & Fisiatría',
    roomId: 'room-102',
    roomName: 'Consultorio 102',
    date: TODAY_STR,
    time: '10:00',
    duration: 30,
    status: 'en_sala',
    reason: 'Esguince de tobillo grado II - Cinesioterapia y magnetoterapia',
    copayAmount: 2000,
    isPaid: true,
    paymentMethod: 'MercadoPago QR',
    notes: 'Requiere bota walker.'
  },
  {
    id: 'app-5',
    patientId: 'pat-2',
    patientName: 'Martín Eduardo Cabrera',
    patientPhone: '+54 3576 41-7788',
    patientDni: '31.502.940',
    patientInsurance: 'PAMI (INSSJP)',
    doctorId: 'doc-3',
    doctorName: 'Dr. Matías Benítez',
    specialtyId: 'esp-1',
    specialtyName: 'Traumatología y Artroscopia',
    roomId: 'room-103',
    roomName: 'Consultorio 103',
    date: TODAY_STR,
    time: '10:30',
    duration: 30,
    status: 'confirmado',
    reason: 'Evaluación quirúrgica artroscópica de menisco medial',
    copayAmount: 0,
    isPaid: true,
    paymentMethod: 'PAMI Nomenclador',
    notes: 'Confirmado por WhatsApp bot.'
  },
  {
    id: 'app-6',
    patientId: 'pat-3',
    patientName: 'Sofía Valentina Romero',
    patientPhone: '+54 3576 46-1144',
    patientDni: '42.883.190',
    patientInsurance: 'Swiss Medical SMG30',
    doctorId: 'doc-4',
    doctorName: 'Dr. Lucas Herrera',
    specialtyId: 'esp-4',
    specialtyName: 'Clínica Médica & Evaluación Deportiva',
    roomId: 'room-201',
    roomName: 'Consultorio 201',
    date: TODAY_STR,
    time: '11:00',
    duration: 20,
    status: 'confirmado',
    reason: 'Apto médico deportivo y electrocardiograma de esfuerzo',
    copayAmount: 1500,
    isPaid: true,
    paymentMethod: 'Tarjeta Débito',
    notes: 'Viene de club de básquetbol.'
  },
  {
    id: 'app-7',
    patientId: 'pat-1',
    patientName: 'Esteban Darío Morales',
    patientPhone: '+54 3576 47-8822',
    patientDni: '29.418.005',
    patientInsurance: 'OSDE 210',
    doctorId: 'doc-1',
    doctorName: 'Dr. Alejandro Morales',
    specialtyId: 'esp-1',
    specialtyName: 'Traumatología y Ortopedia',
    roomId: 'room-101',
    roomName: 'Consultorio 101',
    date: TODAY_STR,
    time: '11:30',
    duration: 30,
    status: 'pendiente',
    reason: 'Control post-infiltración de ácido hialurónico en cadera',
    copayAmount: 0,
    isPaid: false,
    paymentMethod: 'Pendiente',
    notes: 'Recordatorio enviado.'
  },
  {
    id: 'app-8',
    patientId: 'pat-2',
    patientName: 'Gonzalo Andrés Vaca',
    patientPhone: '+54 3576 43-6655',
    patientDni: '36.721.900',
    patientInsurance: 'Particular',
    doctorId: 'doc-2',
    doctorName: 'Lic. Valentina Rossi',
    specialtyId: 'esp-2',
    specialtyName: 'Kinesiología & Fisiatría',
    roomId: 'room-102',
    roomName: 'Consultorio 102',
    date: TODAY_STR,
    time: '12:00',
    duration: 40,
    status: 'pendiente',
    reason: 'Reeducación Postural Global (RPG) - Columna dorsal',
    copayAmount: 18000,
    isPaid: false,
    paymentMethod: 'Pendiente en Mostrador',
    notes: 'Primera sesión de RPG.'
  },
  {
    id: 'app-9',
    patientId: 'pat-3',
    patientName: 'Valeria Inés Quiroga',
    patientPhone: '+54 3576 45-9988',
    patientDni: '33.204.611',
    patientInsurance: 'Apross (Córdoba)',
    doctorId: 'doc-3',
    doctorName: 'Dr. Matías Benítez',
    specialtyId: 'esp-1',
    specialtyName: 'Traumatología y Artroscopia',
    roomId: 'room-103',
    roomName: 'Consultorio 103',
    date: TODAY_STR,
    time: '13:30',
    duration: 30,
    status: 'confirmado',
    reason: 'Control de artroscopia de hombro - Retiro de puntos',
    copayAmount: 1200,
    isPaid: true,
    paymentMethod: 'Transferencia Bancaria',
    notes: 'Evolución favorable.'
  },
  {
    id: 'app-10',
    patientId: 'pat-1',
    patientName: 'Julián Federico Rossi',
    patientPhone: '+54 3576 42-3344',
    patientDni: '39.601.782',
    patientInsurance: 'Medicus',
    doctorId: 'doc-4',
    doctorName: 'Dr. Lucas Herrera',
    specialtyId: 'esp-4',
    specialtyName: 'Clínica Médica & Evaluación Deportiva',
    roomId: 'room-201',
    roomName: 'Consultorio 201',
    date: TODAY_STR,
    time: '14:00',
    duration: 20,
    status: 'confirmado',
    reason: 'Chequeo traumatológico y cardiológico pre-competitivo',
    copayAmount: 2500,
    isPaid: true,
    paymentMethod: 'Tarjeta Crédito',
    notes: 'Trae laboratorio completo.'
  },
  {
    id: 'app-11',
    patientId: 'pat-2',
    patientName: 'Agustina Micaela Peralta',
    patientPhone: '+54 3576 48-1199',
    patientDni: '44.110.829',
    patientInsurance: 'OSDE 410',
    doctorId: 'doc-1',
    doctorName: 'Dr. Alejandro Morales',
    specialtyId: 'esp-1',
    specialtyName: 'Traumatología y Ortopedia',
    roomId: 'room-101',
    roomName: 'Consultorio 101',
    date: TODAY_STR,
    time: '14:30',
    duration: 30,
    status: 'pendiente',
    reason: 'Gonalgia post-traumática tras caída en entrenamiento',
    copayAmount: 0,
    isPaid: false,
    paymentMethod: 'Obra Social',
    notes: 'Solicitar RX frente y perfil.'
  }
];

export const INITIAL_CONSULTATIONS = [
  {
    id: 'cons-101',
    appointmentId: 'app-1',
    patientId: 'pat-1',
    patientName: 'Juan Ignacio Pérez',
    patientDni: '34.892.110',
    doctorId: 'doc-1',
    doctorName: 'Dr. Alejandro Morales',
    doctorLicense: 'MN 114.829 / MP 44.920',
    sisaRefeps: 'REFEPS-MN-114829',
    specialtyName: 'Traumatología y Ortopedia',
    date: TODAY_STR,
    time: '08:40',
    reason: 'Control evolutivo de rodilla derecha operada de LCA hace 8 meses.',
    symptoms: 'Leve molestia retro-patelar tras trote de 30 min. Sin bloqueos articulares ni episodios de inestabilidad.',
    vitals: {
      bpSystolic: 120,
      bpDiastolic: 80,
      heartRate: 70,
      respiratoryRate: 16,
      temperature: 36.4,
      weight: 78.0,
      height: 1.76,
      bmi: 25.2,
      bmiCategory: 'Sobrepeso leve'
    },
    diagnosis: 'S83.5 - Traumatismo / Reconstrucción de ligamento cruzado anterior de rodilla',
    secondaryDiagnosis: 'M25.5 - Artralgia de rodilla leve por sobrecarga',
    physicalExam: 'Cicatrices quirúrgicas eutróficas. Prueba de Lachman negativa, Pivot Shift negativo. Buena masa muscular de cuádriceps (diferencia de 1.5 cm vs contralateral). Rango articular completo: Flexión 135°, Extensión 0°. Se autoriza retorno paulatino a deportes sin contacto.',
    evolution: 'Evolución muy favorable con adecuado tono muscular y estabilidad articular.',
    prescriptions: [
      {
        drugName: 'Glucosamina Sulfato + Condroitín Sulfato',
        presentation: '1500 mg / 1200 mg',
        dosage: '1 sobre diario diluido en agua con desayuno',
        duration: 'Por 60 días'
      },
      {
        drugName: 'Paracetamol',
        presentation: '500 mg comprimidos',
        dosage: '1 comprimido cada 8 hs en caso de dolor moderado',
        duration: 'Por 5 días'
      }
    ],
    indications: 'Continuar fortalecimiento en gimnasio. Trote suave en superficies llanas. Próximo control en 60 días.',
    studiesRequested: ['Test Isocinético de Fuerza Cuádriceps / Isquiotibiales'],
    signed: true,
    signatureType: 'Firma Digital X.509',
    signatureTimestamp: '2026-08-28 09:05:12',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    adendas: []
  },
  {
    id: 'cons-102',
    appointmentId: 'app-2',
    patientId: 'pat-2',
    patientName: 'María Florencia Gómez',
    patientDni: '38.450.920',
    doctorId: 'doc-2',
    doctorName: 'Lic. Valentina Rossi',
    doctorLicense: 'MP 12.840 (Kinesiología)',
    sisaRefeps: 'REFEPS-MP-12840',
    specialtyName: 'Kinesiología & Fisiatría',
    date: TODAY_STR,
    time: '09:40',
    reason: 'Sesión N° 6 de kinesiología y fisioterapia para hombro izquierdo.',
    symptoms: 'Disminución notable del dolor en abducción. Persiste leve contractura en trapecio superior.',
    vitals: {
      bpSystolic: 115,
      bpDiastolic: 75,
      heartRate: 68,
      respiratoryRate: 15,
      temperature: 36.2,
      weight: 62.0,
      height: 1.65,
      bmi: 22.8,
      bmiCategory: 'Normal'
    },
    diagnosis: 'M75.1 - Síndrome del manguito rotador / Tendinopatía supraespinoso',
    secondaryDiagnosis: 'M54.2 - Cervicobraquialgia postural',
    physicalExam: 'Maniobra de Neer y Hawkins con dolor leve (EVA 3/10 vs 8/10 inicial). ROM abducción activa 160°. Se realizó punción seca en punto gatillo miofascial de trapecio superior y magneto 20 min.',
    evolution: 'Excelente adherencia terapéutica. Mejoría del 70% en escala funcional.',
    prescriptions: [],
    indications: 'Ejercicios de estiramiento domiciliarios 2 veces al día. Ergonomía en puesto de trabajo.',
    studiesRequested: [],
    signed: true,
    signatureType: 'Firma Digital X.509',
    signatureTimestamp: '2026-08-28 10:15:00',
    sha256Hash: '7c8b9a0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b',
    adendas: []
  },
  {
    id: 'cons-103',
    appointmentId: 'app-3',
    patientId: 'pat-3',
    patientName: 'Carlos Alberto Fernández',
    patientDni: '27.310.840',
    doctorId: 'doc-1',
    doctorName: 'Dr. Alejandro Morales',
    doctorLicense: 'MN 114.829 / MP 44.920',
    sisaRefeps: 'REFEPS-MN-114829',
    specialtyName: 'Traumatología y Ortopedia',
    date: TODAY_STR,
    time: '10:15',
    reason: 'Evaluación de lumbociatalgia derecha de 3 semanas de evolución.',
    symptoms: 'Dolor punzante lumbar con irradiación por cara posterior de muslo derecho hasta rodilla.',
    vitals: {
      bpSystolic: 130,
      bpDiastolic: 85,
      heartRate: 74,
      respiratoryRate: 16,
      temperature: 36.5,
      weight: 84.0,
      height: 1.78,
      bmi: 26.5,
      bmiCategory: 'Sobrepeso leve'
    },
    diagnosis: 'M51.1 - Trastorno de disco lumbar con radiculopatía (L4-L5)',
    secondaryDiagnosis: 'M54.5 - Lumbago no especificado',
    physicalExam: 'Maniobra de Lasègue positiva derecha a 45°. Reflejo rotuliano y aquiliano conservados. Fuerza muscular 5/5 conservada sin déficit motor distal. Espasmo paravertebral lumbar bilateral.',
    evolution: 'Cuadro compatible con radiculopatía mecánica L5 sin signos de alarma.',
    prescriptions: [
      {
        drugName: 'Etoricoxib',
        presentation: '90 mg comprimidos',
        dosage: '1 comprimido diario tras almuerzo',
        duration: 'Por 7 días'
      },
      {
        drugName: 'Pregabalina',
        presentation: '75 mg cápsulas',
        dosage: '1 cápsula por la noche antes de dormir',
        duration: 'Por 14 días'
      }
    ],
    indications: 'Reposo relativo sin sobrecargas de flexión lumbar. Iniciar 10 sesiones de Fisioterapia y RPG.',
    studiesRequested: ['Resonancia Magnética de Columna Lumbosacra'],
    signed: true,
    signatureType: 'Firma Digital X.509',
    signatureTimestamp: '2026-08-28 10:42:15',
    sha256Hash: '4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c',
    adendas: []
  }
];

export const INITIAL_ELECTRONIC_PRESCRIPTIONS = [
  {
    id: 'rx-2026-001',
    cuir: 'ARG-CBA-001-2110-260828-X7K9', // Código Único de Identificación de Receta (ReNaPDiS)
    patientId: 'pat-1',
    patientName: 'Juan Ignacio Pérez',
    patientDni: '34.892.110',
    patientInsurance: 'OSDE 310 (N° 310-892110-01)',
    doctorId: 'doc-1',
    doctorName: 'Dr. Alejandro Morales',
    doctorLicense: 'MN 114.829 / MP 44.920',
    sisaRefeps: 'REFEPS-MN-114829',
    issueDate: TODAY_STR,
    expirationDate: '2026-09-27', // 30 días reglamentarios
    diagnosisPresuntivo: 'S83.5 - Traumatismo y reconstrucción LCA rodilla',
    medications: [
      {
        dci: 'Glucosamina Sulfato + Condroitín',
        form: 'Sobres monodosis',
        concentration: '1500 / 1200 mg',
        quantityUnits: '60 (sesenta) sobres',
        instructions: '1 sobre al día con el desayuno disuelto en agua'
      },
      {
        dci: 'Paracetamol',
        form: 'Comprimidos',
        concentration: '500 mg',
        quantityUnits: '20 (veinte) comprimidos',
        instructions: '1 comprimido cada 8 hs en caso de dolor'
      }
    ],
    dispensationStatus: 'Habilitada para Dispensa', // Habilitada, Dispensada, Vencida, Anulada
    dispensedPharmacy: null,
    renapdisVerified: true,
    digitalSignatureHash: '8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a'
  }
];

export const INITIAL_CONSENT_FORMS = [
  {
    id: 'cons-f-1',
    patientId: 'pat-1',
    patientName: 'Juan Ignacio Pérez',
    patientDni: '34.892.110',
    title: 'Consentimiento Informado para Artrocentesis e Infiltración Articular',
    procedureType: 'Infiltración Intraarticular de Rodilla con Ácido Hialurónico / Corticoide',
    legalFramework: 'Ley Nacional 26.529 Art. 5 a 10 y Ley 26.742',
    date: '2026-08-20',
    doctorName: 'Dr. Alejandro Morales',
    risksExplained: 'Infección articular (artritis séptica < 0.05%), dolor local transitorio, reacción alérgica o sinovitis reactiva.',
    benefitsExpected: 'Alivio del dolor, mejora de la lubricación articular y viscosuplementación.',
    status: 'Otorgado y Firmado', // 'Otorgado y Firmado', 'Revocado', 'Pendiente'
    patientSignatureType: 'Firma Biométrica / Electrónica con DNI',
    witnessName: 'Romina Maidana (DNI 32.105.880)',
    revoked: false
  },
  {
    id: 'cons-f-2',
    patientId: 'pat-2',
    patientName: 'María Florencia Gómez',
    patientDni: '38.450.920',
    title: 'Consentimiento Informado para Procedimiento de Punción Seca Miofascial',
    procedureType: 'Punción Seca en Puntos Gatillo Miofasciales de Músculo Trapecio',
    legalFramework: 'Ley 26.529 Derechos del Paciente',
    date: '2026-08-25',
    doctorName: 'Lic. Valentina Rossi',
    risksExplained: 'Dolor post-punción durante 24-48 hs, hematoma cutáneo superficial, reacción vasovagal.',
    benefitsExpected: 'Desactivación de puntos gatillo y liberación de contractura miofascial.',
    status: 'Otorgado y Firmado',
    patientSignatureType: 'Firma Electrónica Validada',
    witnessName: 'Lic. Facundo Quiroga',
    revoked: false
  }
];

export const INITIAL_INVOICES = [
  {
    id: 'inv-101',
    invoiceNumber: 'FC-B 0001-00004821',
    cae: '74291823901248',
    caeVto: '2026-09-07',
    cuitEmisor: '30-71829340-8',
    ptoVta: 1,
    tipoCmp: 6, // Factura B
    patientId: 'pat-2',
    patientName: 'María Florencia Gómez',
    dni: '38.450.920',
    date: TODAY_STR,
    concept: 'Copago Kinesiología y Rehabilitación (Swiss Medical)',
    doctorName: 'Lic. Valentina Rossi',
    doctorHonorario: 1200,
    amount: 1500,
    paymentMethod: 'Tarjeta Débito',
    status: 'Cobrado',
    receiptNumber: 'REC-00892',
    arcaValidated: true
  },
  {
    id: 'inv-102',
    invoiceNumber: 'FC-B 0001-00004822',
    cae: '74291823901249',
    caeVto: '2026-09-07',
    cuitEmisor: '30-71829340-8',
    ptoVta: 1,
    tipoCmp: 6,
    patientId: 'pat-3',
    patientName: 'Carlos Alberto Fernández',
    dni: '27.310.840',
    date: TODAY_STR,
    concept: 'Coseguro Consulta Traumatología (Apross)',
    doctorName: 'Dr. Alejandro Morales',
    doctorHonorario: 900,
    amount: 1200,
    paymentMethod: 'MercadoPago QR',
    status: 'Cobrado',
    receiptNumber: 'REC-00893',
    arcaValidated: true
  }
];

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'aud-1',
    timestamp: '2026-08-28T08:35:10.000Z',
    userName: 'Dr. Alejandro Morales',
    userRole: 'Director Médico',
    userId: 'usr-1',
    action: 'READ',
    resource: 'Historia Clínica',
    targetDni: '34.892.110',
    details: 'Acceso a ficha clínica y estudios de Juan Ignacio Pérez para consulta de traumatología.',
    ipAddress: '192.168.120.16',
    eventHash: 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8'
  },
  {
    id: 'aud-2',
    timestamp: '2026-08-28T09:05:12.000Z',
    userName: 'Dr. Alejandro Morales',
    userRole: 'Director Médico',
    userId: 'usr-1',
    action: 'SIGN_DIGITAL',
    resource: 'Historia Clínica & Receta ReNaPDiS',
    targetDni: '34.892.110',
    details: 'Firma digital con certificado X.509 de consulta ID cons-101 y emisión de receta CUIR ARG-CBA-001-2110-260828-X7K9.',
    ipAddress: '192.168.120.16',
    eventHash: 'b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2'
  },
  {
    id: 'aud-3',
    timestamp: '2026-08-28T09:12:45.000Z',
    userName: 'Romina Maidana',
    userRole: 'Recepcionista Principal',
    userId: 'usr-2',
    action: 'ARCA_INVOICE',
    resource: 'Comprobante Fiscal',
    targetDni: '38.450.920',
    details: 'Emisión de Factura B FC-B 0001-00004821 con CAE 74291823901248 por $1.500.',
    ipAddress: '192.168.120.16',
    eventHash: 'c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3'
  },
  {
    id: 'aud-4',
    timestamp: '2026-08-28T09:30:00.000Z',
    userName: 'Lic. Facundo Quiroga',
    userRole: 'Administrador General',
    userId: 'usr-3',
    action: 'MFA_AUTH',
    resource: 'Seguridad del Sistema',
    targetDni: '-',
    details: 'Autenticación en 2 pasos (MFA TOTP) exitosa para sesión administrativa.',
    ipAddress: '192.168.120.16',
    eventHash: 'd3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4'
  }
];

export const INITIAL_TASKS_AND_ALERTS = [
  {
    id: 'tsk-1',
    title: 'Validación de Matrículas SISA / REFEPS',
    description: 'Verificar renovación semestral de certificados digitales de los 4 profesionales habilitados.',
    type: 'critical',
    category: 'Legal / SISA',
    status: 'pending',
    time: 'Hoy'
  },
  {
    id: 'tsk-2',
    title: 'Auditoría mensual de recetas ReNaPDiS',
    description: 'Revisión del libro digital de prescripciones farmacéuticas de traumatología y fisiatría.',
    type: 'warning',
    category: 'Auditoría Médica',
    status: 'pending',
    time: '14:00 hs'
  },
  {
    id: 'tsk-3',
    title: 'Copia de Respaldo Cifrada (Ley 25.326)',
    description: 'Generación de snapshot cifrado AES-256 de base de datos e historias clínicas con hash SHA-256.',
    type: 'info',
    category: 'Seguridad IT',
    status: 'scheduled',
    time: '20:00 hs'
  }
];

export const INITIAL_USERS = [
  {
    id: 'usr-1',
    name: 'Dr. Alejandro Morales',
    email: 'amorales@citra.com.ar',
    role: 'Director Médico',
    sisaLicense: 'REFEPS-MN-114829',
    mfaEnabled: true,
    status: 'Activo',
    lastAccess: 'En línea',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-2',
    name: 'Romina Maidana',
    email: 'recepcion@citra.com.ar',
    role: 'Recepcionista Principal',
    sisaLicense: '-',
    mfaEnabled: true,
    status: 'Activo',
    lastAccess: 'En línea',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-3',
    name: 'Lic. Facundo Quiroga',
    email: 'admin@citra.com.ar',
    role: 'Administración & Facturación',
    sisaLicense: '-',
    mfaEnabled: true,
    status: 'Activo',
    lastAccess: 'Hace 10 min',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-4',
    name: 'Lic. Valentina Rossi',
    email: 'vrossi@citra.com.ar',
    role: 'Kinesiólogo / Fisiatra',
    sisaLicense: 'REFEPS-MP-48112',
    mfaEnabled: true,
    status: 'Activo',
    lastAccess: 'En línea',
    avatar: 'https://images.unsplash.com/photo-1594824813584-3c817297e296?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-5',
    name: 'Dra. Silvina Arrieta',
    email: 'auditoria@citra.com.ar',
    role: 'Auditor Médico Externo',
    sisaLicense: 'REFEPS-MN-89210',
    mfaEnabled: true,
    status: 'Activo',
    lastAccess: 'Ayer',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-6',
    name: 'Admin Root CITRA',
    email: 'superadmin@citra.com.ar',
    role: 'Superadministrador',
    sisaLicense: 'SYS-SEC-01',
    mfaEnabled: true,
    status: 'Activo',
    lastAccess: 'En línea',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  }
];

export const CIE10_COMMON_DIAGNOSES = [
  { code: 'S83.5', label: 'S83.5 - Traumatismo y esguince de ligamento cruzado de la rodilla' },
  { code: 'M54.5', label: 'M54.5 - Lumbalgia no especificada / Ciatalgia' },
  { code: 'M75.1', label: 'M75.1 - Síndrome del manguito rotatorio del hombro' },
  { code: 'M17.0', label: 'M17.0 - Gonartrosis primaria bilateral de rodilla' },
  { code: 'S93.4', label: 'S93.4 - Esguince y torcedura del tobillo' },
  { code: 'M51.2', label: 'M51.2 - Hernia del núcleo pulposo / Trastorno discal lumbar' },
  { code: 'M79.7', label: 'M79.7 - Fibromialgia y síndrome de dolor miofascial' },
  { code: 'I10', label: 'I10 - Hipertensión esencial (primaria)' },
  { code: 'E11', label: 'E11 - Diabetes mellitus tipo 2' },
  { code: 'Z00.0', label: 'Z00.0 - Examen médico de rutina / Apto físico traumatológico' }
];

// ==========================================
// 1. REHABILITACIÓN & KINESIOLOGÍA
// ==========================================
export const INITIAL_REHAB_PLANS = [
  {
    id: 'rhb-101',
    patientId: 'pat-1',
    patientName: 'Juan Ignacio Pérez',
    patientDni: '34.892.110',
    diagnosis: 'Post-Quirúrgico Reconstrucción LCA Rodilla Derecha (Injerto HTH)',
    therapistId: 'doc-2',
    therapistName: 'Lic. Valentina Rossi',
    referringDoctor: 'Dr. Alejandro Morales',
    insuranceName: 'OSDE 310',
    authorizationCode: 'AUT-OSDE-89210-A',
    startDate: '2026-07-01',
    prescribedSessions: 20,
    completedSessions: 14,
    currentEvaScore: 2, // Escala de dolor 0-10
    initialEvaScore: 8,
    status: 'En curso', // 'En curso', 'Finalizado', 'Pausado'
    objective: 'Reentrenamiento neuromuscular, fortalecimiento de cuádriceps 5/5 e isquiotibiales, test de salto simétrico >90%.',
    techniques: ['Cinesioterapia activa resistida', 'Electroestimulación Compex', 'Propiocepción en bosu', 'Crioterapia compresión GameReady'],
    currentRom: { flexion: '135°', extension: '0°' },
    homeExercisesCount: 4,
    notes: 'Excelente adherencia. Fase de reentrenamiento de gestos deportivos y pliometría controlada.'
  },
  {
    id: 'rhb-102',
    patientId: 'pat-2',
    patientName: 'María Florencia Gómez',
    patientDni: '38.450.920',
    diagnosis: 'Tendinopatía Supraespinoso Hombro Izquierdo & Síndrome de Fricción Subacromial',
    therapistId: 'doc-2',
    therapistName: 'Lic. Valentina Rossi',
    referringDoctor: 'Dr. Matías Benítez',
    insuranceName: 'Swiss Medical SMG20',
    authorizationCode: 'AUT-SMG-44120-X',
    startDate: '2026-08-05',
    prescribedSessions: 10,
    completedSessions: 6,
    currentEvaScore: 3,
    initialEvaScore: 7,
    status: 'En curso',
    objective: 'Centrado de cabeza humeral, elongación de pectoral menor y fortalecimiento de rotadores externos y serrato anterior.',
    techniques: ['Punción Seca en trapecio superior', 'Magnetoterapia', 'Terapia manual articular', 'Kinesiotaping escapular'],
    currentRom: { abduction: '160°', flexion: '170°', rotExterna: '65°' },
    homeExercisesCount: 3,
    notes: 'Refiere notable mejoría del dolor nocturno. Continúa con ejercicios de estabilización escapular.'
  },
  {
    id: 'rhb-103',
    patientId: 'pat-3',
    patientName: 'Carlos Alberto Fernández',
    patientDni: '27.310.840',
    diagnosis: 'Hernia Discal L4-L5 con Radiculopatía L5 Derecha & Lumbalgia Mecánica',
    therapistId: 'doc-2',
    therapistName: 'Lic. Valentina Rossi',
    referringDoctor: 'Dr. Alejandro Morales',
    insuranceName: 'Apross (Córdoba)',
    authorizationCode: 'AUT-APR-10840-L',
    startDate: '2026-08-10',
    prescribedSessions: 15,
    completedSessions: 4,
    currentEvaScore: 5,
    initialEvaScore: 9,
    status: 'En curso',
    objective: 'Descompresión neural, reeducación postural global (RPG), fortalecimiento del CORE y flexibilización de cadena posterior.',
    techniques: ['RPG (Reeducación Postural Global)', 'Ultrasonido terapéutico 1 MHz', 'TENS analgésico', 'Tracción lumbosacra suave'],
    currentRom: { schoberTest: '14 cm (normal)', lassegue: 'Negativo a 70°' },
    homeExercisesCount: 3,
    notes: 'Disminuyó la irradiación al glúteo. Evitar cargas axiales en gimnasio durante las primeras 8 semanas.'
  }
];

export const INITIAL_REHAB_SESSIONS = [
  {
    id: 'ses-1',
    planId: 'rhb-101',
    patientId: 'pat-1',
    patientName: 'Juan Ignacio Pérez',
    therapistName: 'Lic. Valentina Rossi',
    sessionNumber: 14,
    date: '2026-08-28',
    time: '09:00',
    evaScore: 2,
    performedTechniques: ['Calentamiento en bicicleta 10 min', 'Sentadilla búlgara 4x10 con mancuernas de 8kg', 'Salto unipodal con recepción estable', 'Game Ready frío 15 min'],
    romMeasured: 'Flexión 135° / Extensión 0°',
    strengthScore: '5-/5 en cuádriceps',
    patientFeedback: 'Sintió el cuádriceps con excelente tono, sin dolor articular post ejercicio.',
    therapistNotes: 'Fase final de protocolo de retorno deportivo. Se programa test de salto triple para próxima semana.',
    signed: true,
    signatureHash: 'e7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8'
  },
  {
    id: 'ses-2',
    planId: 'rhb-102',
    patientId: 'pat-2',
    patientName: 'María Florencia Gómez',
    therapistName: 'Lic. Valentina Rossi',
    sessionNumber: 6,
    date: '2026-08-28',
    time: '09:45',
    evaScore: 3,
    performedTechniques: ['Punción seca en punto gatillo trapecio superior', 'Rotación externa con banda elástica roja 3x15', 'Y-T-W escapulares en camilla', 'Crioterapia 10 min'],
    romMeasured: 'Abducción 160° sin dolor en arco medio',
    strengthScore: '4+/5 rotadores externos',
    patientFeedback: 'Poco dolor tras la punción, sensación de hombro mucho más liviano.',
    therapistNotes: 'El test de Neer es levemente positivo, pero Hawkins es negativo.',
    signed: true,
    signatureHash: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0'
  }
];

export const INITIAL_HOME_EXERCISES = [
  {
    id: 'ex-1',
    name: 'Isométrico de Cuádriceps en Extensión Completa',
    category: 'Rodilla / LCA',
    targetArea: 'Músculo Cuádriceps',
    sets: 3,
    reps: '15 repeticiones (sostener 6 seg)',
    rest: '45 seg',
    equipment: 'Toalla o rodillo bajo la rodilla',
    instructions: 'Sentado en el suelo con la pierna estirada, apretar fuertemente la rodilla contra el suelo contrayendo el muslo durante 6 segundos. Relajar y repetir.',
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  {
    id: 'ex-2',
    name: 'Rotación Externa de Hombro con Banda Elástica',
    category: 'Hombro / Manguito Rotador',
    targetArea: 'Infraespinoso y Redondo Menor',
    sets: 3,
    reps: '12 a 15 repeticiones lentas',
    rest: '60 seg',
    equipment: 'Banda elástica (Theraband)',
    instructions: 'Codo pegado al cuerpo a 90°. Tirar de la banda hacia afuera sin separar el codo de las costillas. Mantener 2 segundos y volver en 3 segundos.',
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  {
    id: 'ex-3',
    name: 'Bird-Dog / Puente Cruzado Estabilizador',
    category: 'Columna / CORE Lumbar',
    targetArea: 'Multífidos, Transverso y Glúteos',
    sets: 3,
    reps: '10 por lado alternado (sostén 4 seg)',
    rest: '45 seg',
    equipment: 'Colchoneta',
    instructions: 'En cuatro apoyos, extender brazo derecho y pierna izquierda al unísono manteniendo la columna neutra sin arquear la cintura. Volver y cambiar.',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  }
];

// ==========================================
// 2. ESTUDIOS E IMÁGENES / PACS RADIOLÓGICO
// ==========================================
export const INITIAL_IMAGING_STUDIES = [
  {
    id: 'img-101',
    patientId: 'pat-1',
    patientName: 'Juan Ignacio Pérez',
    patientDni: '34.892.110',
    modality: 'Resonancia Magnética Nuclear (RMN)',
    bodyPart: 'Rodilla Derecha',
    date: '2026-08-10',
    center: 'Centro de Diagnóstico Por Imágenes Arroyito',
    referringDoctor: 'Dr. Alejandro Morales',
    radiologist: 'Dra. Patricia Solari (MN 92.401)',
    status: 'Informado', // 'Informado', 'Pendiente de Informe', 'Urgente'
    findings: 'Plastia de ligamento cruzado anterior normoposicionada, con señal homogénea sin signos de desgarro ni pinzamiento intercondíleo. Meniscos interno y externo sin solución de continuidad. Sin derrame articular significativo.',
    conclusion: 'Evolución satisfactoria post-plastia de LCA. Articulación fémoro-tibial y fémoro-patelar conservadas.',
    measurements: { lcaThickness: '8.4 mm', patellaIndex: '1.02 (Insall-Salvati Normal)' },
    thumbnailUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80',
    seriesCount: 4,
    dicomAvailable: true,
    fileSize: '48.2 MB',
    hashSha256: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b5c6d7e8f9a0b1c2d3e4f5a6b'
  },
  {
    id: 'img-102',
    patientId: 'pat-2',
    patientName: 'María Florencia Gómez',
    patientDni: '38.450.920',
    modality: 'Radiografía Digital (RX)',
    bodyPart: 'Hombro Izquierdo (Frente y Perfil Outlet)',
    date: '2026-08-04',
    center: 'Servicio Radiología CITRA Sede Central',
    referringDoctor: 'Dr. Matías Benítez',
    radiologist: 'Dr. Gonzalo Méndez (MP 33.109)',
    status: 'Informado',
    findings: 'Acromion Tipo II de Bigliani con leve espolón anteroinferior subacromial. Espacio subacromial preservado (9.5 mm). Relaciones articulares gleno-humeral y acromio-clavicular normales sin signos de luxación ni calcificaciones.',
    conclusion: 'Signos radiológicos compatibles con impingement subacromial incipiente. Sin fracturas ni lisis óseas.',
    measurements: { subacromialSpace: '9.5 mm', acromialType: 'Tipo II Curvo' },
    thumbnailUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=600&auto=format&fit=crop&q=80',
    seriesCount: 2,
    dicomAvailable: true,
    fileSize: '18.6 MB',
    hashSha256: '8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e'
  },
  {
    id: 'img-103',
    patientId: 'pat-3',
    patientName: 'Carlos Alberto Fernández',
    patientDni: '27.310.840',
    modality: 'Tomografía Computada Multislice (TAC)',
    bodyPart: 'Columna Lumbo-Sacra',
    date: '2026-08-12',
    center: 'Diagnóstico Médico San Justo',
    referringDoctor: 'Dr. Alejandro Morales',
    radiologist: 'Dra. Patricia Solari (MN 92.401)',
    status: 'Informado',
    findings: 'Protusión discal posterolateral derecha L4-L5 que contacta y desplaza el receso lateral y la raíz L5 homolateral. Espondilosis lumbar L5-S1 con pinzamiento discal leve y osteofitos marginales anteriores.',
    conclusion: 'Hernia discal foraminal L4-L5 derecha. Cambios degenerativos discales lumbares.',
    measurements: { discBulgeSize: '4.8 mm', spinalCanalDiameter: '14.2 mm' },
    thumbnailUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80',
    seriesCount: 3,
    dicomAvailable: true,
    fileSize: '62.1 MB',
    hashSha256: '3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d'
  }
];

// ==========================================
// 3. OBRAS SOCIALES, NOMENCLADOR & CONVENIOS
// ==========================================
export const INITIAL_NOMENCLATOR_ITEMS = [
  { code: '42.01.01', name: 'Consulta Médica Especializada en Traumatología', category: 'Consultas', arancelBase: 25000, copaySuggested: 0 },
  { code: '42.01.02', name: 'Consulta Médica de Urgencia / Guardia Traumatológica', category: 'Consultas', arancelBase: 32000, copaySuggested: 2000 },
  { code: '25.01.01', name: 'Sesión de Fisiokinesioterapia Motora (por sesión)', category: 'Kinesiología', arancelBase: 18000, copaySuggested: 1500 },
  { code: '25.01.02', name: 'Reeducación Postural Global (RPG) / Sesión 1 hora', category: 'Kinesiología', arancelBase: 28000, copaySuggested: 3500 },
  { code: '42.03.02', name: 'Infiltración Intraarticular / Artrocentesis evacuadora', category: 'Procedimientos', arancelBase: 35000, copaySuggested: 5000 },
  { code: '42.05.01', name: 'Colocación de Yeso / Bota / Férula Inmovilizadora', category: 'Ortopedia', arancelBase: 29000, copaySuggested: 2500 },
  { code: '34.01.01', name: 'Radiografía de Rodilla / Hombro / Tobillo (Frente y Perfil)', category: 'Imágenes', arancelBase: 16000, copaySuggested: 1000 },
  { code: '34.05.01', name: 'Resonancia Magnética Articular de Alto Campo', category: 'Imágenes', arancelBase: 78000, copaySuggested: 0 }
];

export const INITIAL_INSURANCE_AGREEMENTS = [
  {
    id: 'agr-1',
    insuranceId: 'hi-1',
    insuranceName: 'OSDE Binario',
    cuit: '30-54674125-3',
    agreementType: 'Directo con Federación Médica',
    status: 'Vigente al día',
    paymentTermDays: 30,
    onlineValidation: 'WebService Directo (Token/Credencial Digital)',
    coveredPercentage: 100,
    requiresPriorAuthForKinesio: false, // OSDE autoriza directo hasta 20 sesiones
    maxKinesioSessionsWithoutOrder: 10,
    currentMonthDebitsCount: 0,
    contactAudit: 'auditoria.cba@osde.com.ar'
  },
  {
    id: 'agr-2',
    insuranceId: 'hi-2',
    insuranceName: 'Swiss Medical Group',
    cuit: '30-67891234-9',
    agreementType: 'Convenio Institucional Prestador',
    status: 'Vigente al día',
    paymentTermDays: 45,
    onlineValidation: 'Portal Prestadores SMG + Token WhatsApp',
    coveredPercentage: 85,
    requiresPriorAuthForKinesio: true,
    maxKinesioSessionsWithoutOrder: 5,
    currentMonthDebitsCount: 1,
    contactAudit: 'convenios.interior@swissmedical.com.ar'
  },
  {
    id: 'agr-3',
    insuranceId: 'hi-4',
    insuranceName: 'Apross (Provincia de Córdoba)',
    cuit: '30-99901456-1',
    agreementType: 'Colegio Médico Departamental',
    status: 'Vigente con Coseguro',
    paymentTermDays: 60,
    onlineValidation: 'Validador Web Apross / Carnet con Token',
    coveredPercentage: 80,
    requiresPriorAuthForKinesio: true,
    maxKinesioSessionsWithoutOrder: 0,
    currentMonthDebitsCount: 2,
    contactAudit: 'prestaciones@apross.gov.ar'
  },
  {
    id: 'agr-4',
    insuranceId: 'hi-5',
    insuranceName: 'PAMI (INSSJP)',
    cuit: '33-53714571-9',
    agreementType: 'Módulo Asignado Traumatología',
    status: 'Vigente por Capitado',
    paymentTermDays: 90,
    onlineValidation: 'Sistema Integrado PAMI OME',
    coveredPercentage: 100,
    requiresPriorAuthForKinesio: true,
    maxKinesioSessionsWithoutOrder: 0,
    currentMonthDebitsCount: 0,
    contactAudit: 'udl.sanfrancisco@pami.org.ar'
  }
];

export const INITIAL_AUTHORIZATIONS = [
  {
    id: 'auth-901',
    date: '2026-08-28',
    patientDni: '34.892.110',
    patientName: 'Juan Ignacio Pérez',
    insuranceName: 'OSDE 310',
    nomenclatorCode: '25.01.01',
    description: '10 Sesiones Kinesioterapia Motora Rodilla',
    tokenProvided: 'OSDE-8921-TK',
    status: 'Aprobada Online', // 'Aprobada Online', 'Rechazada', 'Auditoría Previa Requerida'
    authNumber: 'AUT-OSDE-89210-A',
    copayCharged: 0,
    rejectionReason: null
  },
  {
    id: 'auth-902',
    date: '2026-08-27',
    patientDni: '38.450.920',
    patientName: 'María Florencia Gómez',
    insuranceName: 'Swiss Medical SMG20',
    nomenclatorCode: '25.01.01',
    description: '10 Sesiones Kinesioterapia Hombro',
    tokenProvided: 'SMG-4412-88',
    status: 'Aprobada Online',
    authNumber: 'AUT-SMG-44120-X',
    copayCharged: 1500,
    rejectionReason: null
  },
  {
    id: 'auth-903',
    date: '2026-08-26',
    patientDni: '29.118.490',
    patientName: 'Roberto Gómez',
    insuranceName: 'Apross',
    nomenclatorCode: '34.05.01',
    description: 'RMN Articular Hombro Izquierdo',
    tokenProvided: 'APR-9921',
    status: 'Rechazada',
    authNumber: null,
    copayCharged: 0,
    rejectionReason: 'Falta adjuntar orden médica con diagnóstico presuntivo legible y resumen de historia clínica.'
  }
];

// ==========================================
// 4. INVENTARIO, COMPRAS & PROVEEDORES
// ==========================================
export const INITIAL_INVENTORY_ITEMS = [
  {
    id: 'inv-itm-1',
    sku: 'TRAUM-TIT-01',
    name: 'Tornillo de Interferencia Titanio 8x25mm (Cirugía LCA)',
    category: 'Implantes & Prótesis',
    stock: 12,
    minStock: 5,
    unitPrice: 145000,
    location: 'Quirófano / Depósito Central',
    lotNumber: 'LT-2026-A89',
    expirationDate: '2030-05-15',
    supplierId: 'sup-1',
    supplierName: 'Ortopedia Biomédica Córdoba S.A.',
    status: 'En stock óptimo'
  },
  {
    id: 'inv-itm-2',
    sku: 'KIN-TAPE-05',
    name: 'Cinta Kinesiotaping Neuromuscular 5cm x 5m (Azul/Piel)',
    category: 'Insumos Kinesiología',
    stock: 45,
    minStock: 20,
    unitPrice: 7500,
    location: 'Gimnasio Kinesiología Box 1 a 4',
    lotNumber: 'KT-99210',
    expirationDate: '2028-12-31',
    supplierId: 'sup-2',
    supplierName: 'Droguería & Material Médico San Justo',
    status: 'En stock óptimo'
  },
  {
    id: 'inv-itm-3',
    sku: 'ORT-FER-02',
    name: 'Férula Inmovilizadora de Rodilla Larga Graduable',
    category: 'Ortopedia & Soporte',
    stock: 3,
    minStock: 6,
    unitPrice: 62000,
    location: 'Consultorio 101 Traumatología',
    lotNumber: 'FR-8812',
    expirationDate: 'N/A',
    supplierId: 'sup-1',
    supplierName: 'Ortopedia Biomédica Córdoba S.A.',
    status: 'Alerta: Stock Bajo'
  },
  {
    id: 'inv-itm-4',
    sku: 'KIN-AGU-01',
    name: 'Agujas de Punción Seca Esterilizadas 0.30 x 40mm (Caja x 100)',
    category: 'Insumos Kinesiología',
    stock: 8,
    minStock: 4,
    unitPrice: 18900,
    location: 'Box 2 Fisiatría',
    lotNumber: 'PS-3410',
    expirationDate: '2029-08-20',
    supplierId: 'sup-2',
    supplierName: 'Droguería & Material Médico San Justo',
    status: 'En stock óptimo'
  },
  {
    id: 'inv-itm-5',
    sku: 'TRAUM-YES-03',
    name: 'Venda de Fibra de Vidrio / Yeso Sintético 10cm x 3.6m',
    category: 'Insumos Traumatología',
    stock: 2,
    minStock: 10,
    unitPrice: 12400,
    location: 'Sala de Yesos y Procedimientos',
    lotNumber: 'YS-7789',
    expirationDate: '2027-10-15',
    supplierId: 'sup-2',
    supplierName: 'Droguería & Material Médico San Justo',
    status: 'Crítico: Reorden Inmediato'
  }
];

export const INITIAL_SUPPLIERS = [
  {
    id: 'sup-1',
    name: 'Ortopedia Biomédica Córdoba S.A.',
    cuit: '30-70891234-5',
    contactPerson: 'Ing. Marcelo Rossi',
    phone: '+54 351 472-8800',
    email: 'ventas@ortopediabiomedica.com.ar',
    address: 'Av. Colón 1890, Córdoba Capital',
    category: 'Prótesis, Implantes y Ortesis',
    rating: 4.9,
    deliveryTimeDays: 2
  },
  {
    id: 'sup-2',
    name: 'Droguería & Material Médico San Justo',
    cuit: '30-68192340-2',
    contactPerson: 'Lic. Carla Benavídez',
    phone: '+54 3564 43-9900',
    email: 'pedidos@drogueriasanjusto.com.ar',
    address: '9 de Julio 450, San Francisco, Córdoba',
    category: 'Descartables, Farmacia e Insumos Kinesiología',
    rating: 4.7,
    deliveryTimeDays: 1
  }
];

export const INITIAL_PURCHASE_ORDERS = [
  {
    id: 'oc-2026-044',
    supplierId: 'sup-2',
    supplierName: 'Droguería & Material Médico San Justo',
    date: '2026-08-27',
    totalAmount: 186400,
    status: 'Enviada al Proveedor', // 'Borrador', 'Enviada al Proveedor', 'Recibida en Depósito'
    itemsCount: 3,
    expectedDelivery: '2026-08-30',
    items: [
      { name: 'Venda de Fibra de Vidrio 10cm x 3.6m', qty: 10, unitPrice: 12400 },
      { name: 'Cinta Kinesiotaping 5cm x 5m', qty: 8, unitPrice: 7500 },
      { name: 'Gel Conductor Ultrasonido 5 Kg', qty: 2, unitPrice: 11000 }
    ]
  }
];

// ==========================================
// 5. COMUNICACIONES & RECORDATORIOS WHATSAPP
// ==========================================
export const INITIAL_COMMUNICATION_LOGS = [
  {
    id: 'wsp-101',
    appointmentId: 'app-1',
    patientName: 'Juan Ignacio Pérez',
    phone: '+54 9 3576 44-5588',
    type: 'WhatsApp Automatizado',
    template: 'recordatorio_turno_citra',
    message: 'Hola Juan Ignacio, te recordamos tu turno en CITRA para hoy 08:30 con Dr. Alejandro Morales (Consultorio 101). Respondé 1 para Confirmar o 2 para Reprogramar.',
    sentAt: '2026-08-27 18:00',
    status: 'Confirmado por Paciente', // 'Enviado', 'Entregado', 'Leído', 'Confirmado por Paciente', 'Cancelado por Paciente'
    responseReceived: '1 - Confirmado, muchas gracias!'
  },
  {
    id: 'wsp-102',
    appointmentId: 'app-2',
    patientName: 'María Florencia Gómez',
    phone: '+54 9 3576 48-9911',
    type: 'WhatsApp Automatizado',
    template: 'recordatorio_turno_kinesio',
    message: 'Hola María Florencia, te recordamos tu sesión de Kinesiología hoy a las 09:00 hs con Lic. Valentina Rossi. Recordá traer ropa deportiva cómoda.',
    sentAt: '2026-08-27 18:05',
    status: 'Confirmado por Paciente',
    responseReceived: '1 - Ahí estaré puntual'
  },
  {
    id: 'wsp-103',
    appointmentId: 'app-3',
    patientName: 'Carlos Alberto Fernández',
    phone: '+54 9 3576 43-2277',
    type: 'WhatsApp Automatizado',
    template: 'recordatorio_turno_citra',
    message: 'Hola Carlos Alberto, te recordamos tu turno hoy a las 10:00 hs en CITRA con Dr. Alejandro Morales. Por favor presentarse 10 min antes en Recepción con carnet de Apross.',
    sentAt: '2026-08-27 18:10',
    status: 'Leído',
    responseReceived: null
  }
];

// ==========================================
// 6. CAJA DIARIA, ARQUEOS & MOVIMIENTOS
// ==========================================
export const INITIAL_CASH_CLOSURES = [
  {
    id: 'caja-2026-08-28-M',
    shift: 'Turno Mañana (07:30 a 14:00)',
    date: TODAY_STR,
    cashierName: 'Romina Maidana',
    openingBalance: 25000,
    totalCash: 48500,
    totalCards: 112000,
    totalQrTransfer: 86400,
    totalExpenses: 4500, // egresos menores de caja
    netTotal: 267400,
    status: 'Abierta en Curso',
    observations: 'Caja operativa sin diferencias registradas al momento.'
  }
];

// ==========================================
// 7. ÓRDENES MÉDICAS & CERTIFICADOS DIGITALES
// ==========================================
export const INITIAL_MEDICAL_ORDERS = [
  {
    id: 'ord-2026-001',
    patientId: 'pat-1',
    patientName: 'Juan Ignacio Pérez',
    patientDni: '34.892.110',
    doctorId: 'doc-1',
    doctorName: 'Dr. Alejandro Morales',
    doctorLicense: 'MN 114.829 / MP 44.920',
    date: TODAY_STR,
    orderType: 'Derivación / Orden de Kinesiología',
    diagnosis: 'S83.5 - Reconstrucción LCA Rodilla Derecha',
    studiesRequested: [
      'Cinesioterapia activa resistida x 10 sesiones',
      'Reentrenamiento propioceptivo y pliometría',
      'Test Isocinético de fuerza cuádriceps'
    ],
    justification: 'Continuidad de plan de retorno al deporte sin impacto patelar.',
    signed: true,
    signatureHash: 'f1e2d3c4b5a69870123456789abcdef012345678'
  }
];

export const INITIAL_MEDICAL_CERTIFICATES = [
  {
    id: 'cert-2026-001',
    patientId: 'pat-3',
    patientName: 'Carlos Alberto Fernández',
    patientDni: '27.310.840',
    doctorId: 'doc-1',
    doctorName: 'Dr. Alejandro Morales',
    doctorLicense: 'MN 114.829 / MP 44.920',
    date: TODAY_STR,
    certificateType: 'Certificado de Reposo Laboral / Licencia Médica',
    diagnosis: 'M54.5 - Lumbalgia Aguda Severa con Radiculopatía L5 Derecha',
    restDays: 7,
    restStartDate: TODAY_STR,
    restEndDate: '2026-09-04',
    content: 'Se certifica que el paciente Carlos Alberto Fernández debe guardar reposo psicofísico laboral por 7 (siete) días corridos a partir de la fecha por cuadro de lumbociatalgia aguda incapacitante.',
    signed: true,
    qrVerificationUrl: 'https://citra.com.ar/validar/cert-2026-001',
    signatureHash: '4a5b6c7d8e9f0123456789abcdef0123456789ab'
  }
];

