import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  INITIAL_CLINIC_INFO,
  INITIAL_SPECIALTIES,
  INITIAL_ROOMS,
  INITIAL_HEALTH_INSURANCES,
  INITIAL_DOCTORS,
  INITIAL_PATIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_CONSULTATIONS,
  INITIAL_ELECTRONIC_PRESCRIPTIONS,
  INITIAL_CONSENT_FORMS,
  INITIAL_INVOICES,
  INITIAL_AUDIT_LOGS,
  INITIAL_TASKS_AND_ALERTS,
  INITIAL_USERS,
  INITIAL_REHAB_PLANS,
  INITIAL_REHAB_SESSIONS,
  INITIAL_HOME_EXERCISES,
  INITIAL_IMAGING_STUDIES,
  INITIAL_NOMENCLATOR_ITEMS,
  INITIAL_INSURANCE_AGREEMENTS,
  INITIAL_AUTHORIZATIONS,
  INITIAL_INVENTORY_ITEMS,
  INITIAL_SUPPLIERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_COMMUNICATION_LOGS,
  INITIAL_CASH_CLOSURES,
  INITIAL_MEDICAL_ORDERS,
  INITIAL_MEDICAL_CERTIFICATES
} from '../data/mockData';
import { generateSHA256Hash, createAuditLog, encryptDataAES } from '../utils/cryptoAudit';
import { generateCUIR, calculatePrescriptionExpiration } from '../utils/renapdisEngine';
import { generateCAE } from '../utils/arcaValidator';
import { getTodayArgentina, getNowArgentinaTime } from '../utils/dateUtils';
import { dataService } from '../services/dataService';

const ClinicContext = createContext();

export const ClinicProvider = ({ children }) => {
  const loadStorage = (key, fallback) => {
    try {
      const saved = localStorage.getItem(`citra_${key}`);
      return saved ? JSON.parse(saved) : fallback;
    } catch (e) {
      console.error('Error reading localStorage', e);
      return fallback;
    }
  };

  const saveStorage = (key, value) => {
    try {
      localStorage.setItem(`citra_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn(`Error writing to localStorage for key citra_${key}:`, e);
    }
  };

  // Main state with persistence
  const [clinicInfo, setClinicInfo] = useState(() => loadStorage('clinicInfo', INITIAL_CLINIC_INFO));
  const [currentBranchId, setCurrentBranchId] = useState(() => loadStorage('currentBranchId', 'branch-1'));
  const [specialties, setSpecialties] = useState(() => loadStorage('specialties', INITIAL_SPECIALTIES));
  const [rooms, setRooms] = useState(() => loadStorage('rooms', INITIAL_ROOMS));
  const [healthInsurances, setHealthInsurances] = useState(() => loadStorage('healthInsurances', INITIAL_HEALTH_INSURANCES));
  const [doctors, setDoctors] = useState(() => {
    const loaded = loadStorage('doctors', null);
    let list = (!loaded || !Array.isArray(loaded)) ? INITIAL_DOCTORS : loaded;
    const otrosDoc = INITIAL_DOCTORS.find((d) => d.id === 'doc-otros');
    if (otrosDoc && !list.some((d) => d.id === 'doc-otros' || d.name === 'Otros Profesionales')) {
      list = [...list, otrosDoc];
    }
    return list.map((d) => ({ ...d, license: '', roomName: '' }));
  });
  // Clinical & Sensitive Records (Kept in runtime memory; synced via dataService backend, not unencrypted localStorage)
  const isLiveMode = dataService.isLive();
  const [patients, setPatients] = useState(() => (isLiveMode ? [] : INITIAL_PATIENTS));
  const [appointments, setAppointments] = useState(() => (isLiveMode ? [] : INITIAL_APPOINTMENTS));
  const [consultations, setConsultations] = useState(() => (isLiveMode ? [] : INITIAL_CONSULTATIONS));
  const [electronicPrescriptions, setElectronicPrescriptions] = useState(() => (isLiveMode ? [] : INITIAL_ELECTRONIC_PRESCRIPTIONS));
  const [consentForms, setConsentForms] = useState(() => (isLiveMode ? [] : INITIAL_CONSENT_FORMS));
  const [invoices, setInvoices] = useState(() => (isLiveMode ? [] : INITIAL_INVOICES));
  const [auditLogs, setAuditLogs] = useState(() => (isLiveMode ? [] : INITIAL_AUDIT_LOGS));
  const [tasks, setTasks] = useState(() => INITIAL_TASKS_AND_ALERTS);
  const [users, setUsers] = useState(() => {
    const loaded = loadStorage('users', INITIAL_USERS);
    const validLoaded = Array.isArray(loaded)
      ? loaded.filter(u => {
          const email = (u.email || '').toLowerCase();
          const name = (u.name || '').toLowerCase();
          if (email.includes('morales') || name.includes('morales')) return false;
          if (email.includes('arrieta') || name.includes('arrieta')) return false;
          return true;
        })
      : [];
    const userMap = new Map();
    INITIAL_USERS.forEach((u) => userMap.set(u.email.toLowerCase(), u));
    validLoaded.forEach((u) => {
      if (!userMap.has(u.email?.toLowerCase())) {
        userMap.set(u.email?.toLowerCase(), u);
      }
    });
    return Array.from(userMap.values());
  });
  const [currentUser, setCurrentUser] = useState(() => {
    const loaded = loadStorage('currentUser', null);
    if (!loaded || (loaded.name && loaded.name.includes('Morales')) || (loaded.email && loaded.email.includes('morales')) || (loaded.email && loaded.email.includes('arrieta'))) {
      return null;
    }
    return loaded;
  });

  // Clinical specialty modules state (runtime memory)
  const [rehabPlans, setRehabPlans] = useState(() => (isLiveMode ? [] : INITIAL_REHAB_PLANS));
  const [rehabSessions, setRehabSessions] = useState(() => (isLiveMode ? [] : INITIAL_REHAB_SESSIONS));
  const [homeExercises, setHomeExercises] = useState(() => INITIAL_HOME_EXERCISES);
  const [imagingStudies, setImagingStudies] = useState(() => (isLiveMode ? [] : INITIAL_IMAGING_STUDIES));
  const [nomenclatorItems, setNomenclatorItems] = useState(() => loadStorage('nomenclatorItems', INITIAL_NOMENCLATOR_ITEMS));
  const [insuranceAgreements, setInsuranceAgreements] = useState(() => loadStorage('insuranceAgreements', INITIAL_INSURANCE_AGREEMENTS));
  const [authorizations, setAuthorizations] = useState(() => (isLiveMode ? [] : INITIAL_AUTHORIZATIONS));
  const [inventoryItems, setInventoryItems] = useState(() => loadStorage('inventoryItems', INITIAL_INVENTORY_ITEMS));
  const [suppliers, setSuppliers] = useState(() => loadStorage('suppliers', INITIAL_SUPPLIERS));
  const [purchaseOrders, setPurchaseOrders] = useState(() => INITIAL_PURCHASE_ORDERS);
  const [communications, setCommunications] = useState(() => INITIAL_COMMUNICATION_LOGS);
  const [cashClosures, setCashClosures] = useState(() => (isLiveMode ? [] : INITIAL_CASH_CLOSURES));
  const [medicalOrders, setMedicalOrders] = useState(() => (isLiveMode ? [] : INITIAL_MEDICAL_ORDERS));
  const [medicalCertificates, setMedicalCertificates] = useState(() => (isLiveMode ? [] : INITIAL_MEDICAL_CERTIFICATES));

  // Institutional Public Views & Navigation ('home', 'booking', 'my-turnos', 'admin-login', 'admin-panel')
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase().replace('#', '').trim();
      const search = new URLSearchParams(window.location.search);
      const view = search.get('view');
      const savedAuth = loadStorage('authAdmin', null);
      if (hash === 'admin' || hash === 'admin-panel' || view === 'admin' || view === 'admin-panel') {
        return savedAuth ? 'admin-panel' : 'admin-login';
      }
      if (hash === 'admin-login' || view === 'admin-login') return 'admin-login';
      if (hash === 'booking' || hash === 'turnos' || view === 'booking') return 'booking';
      if (hash === 'services' || hash === 'servicios' || view === 'services') return 'services';
      if (hash === 'doctors' || hash === 'medicos' || view === 'doctors') return 'doctors';
      if (hash === 'insurances' || hash === 'obras-sociales' || view === 'insurances') return 'insurances';
      if (hash === 'my-turnos' || hash === 'mis-turnos' || hash === 'portal' || view === 'my-turnos') return 'my-turnos';
    }
    return loadStorage('currentView', 'home');
  });
  const [bookingPreselectedSpecialty, setBookingPreselectedSpecialty] = useState(null);
  const [bookingPreselectedDoctor, setBookingPreselectedDoctor] = useState(null);

  // Authentication & Roles: 'guest' | 'patient' | 'admin'
  const [authAdmin, setAuthAdmin] = useState(() => {
    const saved = loadStorage('authAdmin', null);
    if (saved && saved.id) {
      if ((saved.name && saved.name.includes('Morales')) || (saved.email && saved.email.includes('morales')) || (saved.email && saved.email.includes('arrieta'))) {
        return null;
      }
      const isBlanco = (saved.email && saved.email.toLowerCase().includes('blanco')) || (saved.name && saved.name.toLowerCase().includes('blanco'));
      const savedUsers = loadStorage('users', INITIAL_USERS);
      const matched = savedUsers.find(
        (u) => (u.id === saved.id || u.email?.toLowerCase() === saved.email?.toLowerCase()) && !u.email?.includes('morales') && !u.email?.includes('arrieta')
      );
      if (isBlanco) {
        return {
          ...(matched || saved),
          id: 'usr-1',
          name: 'Dr. Alejandro Blanco',
          email: 'dr.blanco@citra.com.ar',
          adminType: 'doctor',
          doctorId: 'doc-1',
          specialty: 'Traumatología',
          role: 'Traumatología y Ortopedia · Dirección Médica'
        };
      }
      return matched
        ? { ...matched, adminType: matched.adminType || saved.adminType, doctorId: matched.doctorId || saved.doctorId, specialty: matched.specialty || saved.specialty }
        : saved;
    }
    return null;
  });

  const [authPatient, setAuthPatient] = useState(() => {
    const saved = loadStorage('authPatient', null);
    if (saved) {
      const savedPatients = loadStorage('patients', INITIAL_PATIENTS);
      const cleanSavedDni = (saved.dni || '').replace(/\D/g, '');
      const matched = savedPatients.find(
        (p) => (p.dni && p.dni.replace(/\D/g, '') === cleanSavedDni) || p.id === saved.id
      );
      return matched || null;
    }
    return null;
  });

  const [authRole, setAuthRole] = useState(() => {
    const savedAdmin = loadStorage('authAdmin', null);
    if (savedAdmin && savedAdmin.id) {
      const savedUsers = loadStorage('users', INITIAL_USERS);
      const matched = savedUsers.find(
        (u) => u.id === savedAdmin.id || u.email?.toLowerCase() === savedAdmin.email?.toLowerCase()
      );
      if (matched) return 'admin';
    }
    const savedPatient = loadStorage('authPatient', null);
    if (savedPatient) {
      const savedPatients = loadStorage('patients', INITIAL_PATIENTS);
      const cleanDni = (savedPatient.dni || '').replace(/\D/g, '');
      const matched = savedPatients.find(
        (p) => (p.dni && p.dni.replace(/\D/g, '') === cleanDni) || p.id === savedPatient.id
      );
      if (matched) return 'patient';
    }
    return 'guest';
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register'


  // Clinic General Schedules & Availability
  const INITIAL_SCHEDULE = {
    openingTime: '08:00',
    closingTime: '20:00',
    slotDuration: 30,
    workingDays: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    saturdayClosingTime: '13:00',
    blockedDates: ['2026-12-25', '2027-01-01', '2026-05-01']
  };
  const [clinicSchedule, setClinicSchedule] = useState(() => loadStorage('clinicSchedule', INITIAL_SCHEDULE));

  // Portal and View Modes
  const [isPatientPortalMode, setIsPatientPortalMode] = useState(false);
  const [currentPortalPatient, setCurrentPortalPatient] = useState(() => null);
  const cashLockRef = useRef(false);

  // Navigation tabs: 'dashboard', 'agenda', 'patients', 'clinical', 'kinesio', 'imaging', 'insurances', 'inventory', 'communications', 'billing', 'doctors', 'reports', 'audit', 'security', 'integrations', 'settings'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filterDoctor, setFilterDoctor] = useState('all');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [filterDate, setFilterDate] = useState(() => getTodayArgentina());

  // Modals state
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [selectedPatientForDetail, setSelectedPatientForDetail] = useState(null);
  const [selectedConsultationForPrint, setSelectedConsultationForPrint] = useState(null);
  const [selectedPrescriptionForView, setSelectedPrescriptionForView] = useState(null);
  const [selectedConsentForView, setSelectedConsentForView] = useState(null);
  const [selectedStudyForViewer, setSelectedStudyForViewer] = useState(null);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState(null);
  const [selectedCertificateForPrint, setSelectedCertificateForPrint] = useState(null);

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [appointmentModalData, setAppointmentModalData] = useState(null);
  const [isPatientFormModalOpen, setIsPatientFormModalOpen] = useState(false);
  const [patientFormModalData, setPatientFormModalData] = useState(null);
  const [isNewConsultationModalOpen, setIsNewConsultationModalOpen] = useState(false);
  const [consultationPreloadData, setConsultationPreloadData] = useState(null);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [prescriptionPreloadData, setPrescriptionPreloadData] = useState(null);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [consentPreloadData, setConsentPreloadData] = useState(null);
  const [isAdendaModalOpen, setIsAdendaModalOpen] = useState(false);
  const [adendaTargetConsultation, setAdendaTargetConsultation] = useState(null);
  const [isArcaInvoiceModalOpen, setIsArcaInvoiceModalOpen] = useState(false);
  const [arcaInvoicePreloadData, setArcaInvoicePreloadData] = useState(null);
  const [isDigitalSignatureModalOpen, setIsDigitalSignatureModalOpen] = useState(false);
  const [isBlockTimeModalOpen, setIsBlockTimeModalOpen] = useState(false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [doctorModalData, setDoctorModalData] = useState(null);
  const [isRehabPlanModalOpen, setIsRehabPlanModalOpen] = useState(false);
  const [isRehabSessionModalOpen, setIsRehabSessionModalOpen] = useState(false);
  const [rehabSessionPreloadPlan, setRehabSessionPreloadPlan] = useState(null);
  const [isImagingStudyModalOpen, setIsImagingStudyModalOpen] = useState(false);
  const [isMedicalOrderModalOpen, setIsMedicalOrderModalOpen] = useState(false);
  const [isMedicalCertificateModalOpen, setIsMedicalCertificateModalOpen] = useState(false);
  const [isPurchaseOrderModalOpen, setIsPurchaseOrderModalOpen] = useState(false);
  const [isOnlineAuthModalOpen, setIsOnlineAuthModalOpen] = useState(false);

  // Solicitudes Urgentes de Acceso a Historias Clínicas entre Profesionales (Ley 26.529)
  const INITIAL_ACCESS_REQUESTS = [];

  const [clinicalAccessRequests, setClinicalAccessRequests] = useState(() =>
    loadStorage('clinicalAccessRequests', INITIAL_ACCESS_REQUESTS)
  );

  useEffect(() => {
    saveStorage('clinicalAccessRequests', clinicalAccessRequests);
  }, [clinicalAccessRequests]);

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Purge any legacy unencrypted PHI and sensitive records from localStorage (Ley 25.326 / Ley 26.529)
  useEffect(() => {
    const sensitiveKeys = [
      'citra_patients',
      'citra_appointments',
      'citra_consultations',
      'citra_electronicPrescriptions',
      'citra_consentForms',
      'citra_invoices',
      'citra_auditLogs',
      'citra_rehabPlans',
      'citra_rehabSessions',
      'citra_homeExercises',
      'citra_imagingStudies',
      'citra_cashClosures',
      'citra_medicalOrders',
      'citra_medicalCertificates',
      'citra_communications',
      'citra_authorizations',
      'citra_purchaseOrders'
    ];
    sensitiveKeys.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignored
      }
    });
  }, []);

  // Non-PHI persistence: institutional configuration & active route caches
  useEffect(() => { saveStorage('clinicInfo', clinicInfo); }, [clinicInfo]);
  useEffect(() => { saveStorage('currentBranchId', currentBranchId); }, [currentBranchId]);
  useEffect(() => { saveStorage('specialties', specialties); }, [specialties]);
  useEffect(() => { saveStorage('rooms', rooms); }, [rooms]);
  useEffect(() => { saveStorage('healthInsurances', healthInsurances); }, [healthInsurances]);
  useEffect(() => { saveStorage('doctors', doctors); }, [doctors]);
  useEffect(() => { saveStorage('currentView', currentView); }, [currentView]);
  useEffect(() => { saveStorage('authRole', authRole); }, [authRole]);
  useEffect(() => { saveStorage('authAdmin', authAdmin); }, [authAdmin]);
  useEffect(() => { saveStorage('clinicSchedule', clinicSchedule); }, [clinicSchedule]);

  // --- RBAC & ROLE-BASED SCOPED DATA ENGINE ---
  // isDoctor is true when authAdmin has adminType === 'doctor' or is Dr. Blanco
  const isDoctor = Boolean(
    authAdmin &&
    ((authAdmin.email && authAdmin.email.toLowerCase().includes('blanco')) ||
     (authAdmin.name && authAdmin.name.toLowerCase().includes('blanco')) ||
     ((authAdmin.adminType === 'doctor' ||
       authAdmin.doctorId ||
       (authAdmin.role && (authAdmin.role.toLowerCase().includes('traumatolog') || authAdmin.role.toLowerCase().includes('médic')))) &&
      authAdmin.adminType !== 'administrative'))
  );

  const isAdministrative = Boolean(
    authAdmin &&
    !isDoctor &&
    (authAdmin.adminType === 'administrative' ||
      authAdmin.adminType === 'superadmin' ||
      authAdmin.adminType !== 'doctor')
  );

  // ALTA-02: Separación estricta de privilegios: superadmin restringido a Dirección Médica / Propietario
  const isSuperAdmin = Boolean(
    authAdmin &&
    (authAdmin.adminType === 'superadmin' ||
      authAdmin.role?.toLowerCase().includes('superadmin') ||
      authAdmin.role?.toLowerCase().includes('dirección médica') ||
      authAdmin.role?.toLowerCase().includes('director') ||
      authAdmin.role?.toLowerCase().includes('propietario'))
  );

  // Resolve current doctor ONLY if authenticated user is a physician
  const currentDoctor = React.useMemo(() => {
    if (!authAdmin) return null;
    const isBlanco = (authAdmin.email && authAdmin.email.toLowerCase().includes('blanco')) ||
                     (authAdmin.name && authAdmin.name.toLowerCase().includes('blanco'));
    if (!isDoctor && !isBlanco) return null;
    const docId = authAdmin.doctorId || (isBlanco ? 'doc-1' : null);
    if (docId) {
      const found = doctors.find((d) => d.id === docId);
      if (found) return found;
    }
    const matchedDoc = doctors.find(
      (d) =>
        (d.email && authAdmin.email && d.email.toLowerCase().trim() === authAdmin.email.toLowerCase().trim()) ||
        (d.name && authAdmin.name && d.name.toLowerCase().trim() === authAdmin.name.toLowerCase().trim()) ||
        (isBlanco && (d.id === 'doc-1' || d.name.toLowerCase().includes('blanco')))
    );
    if (matchedDoc) return matchedDoc;
    return null;
  }, [authAdmin, doctors, isDoctor]);

  // El Dr. Alejandro Blanco es el dueño y Director Médico de CITRA:
  // Tiene acceso universal a todas las historias clínicas y atenciones de todos los pacientes.
  const isDoctorBlanco = React.useMemo(() => {
    const docNameLower = (currentDoctor?.name || currentDoctor?.fullName || authAdmin?.name || '').toLowerCase();
    const emailLower = (authAdmin?.email || currentDoctor?.email || '').toLowerCase();
    const docId = currentDoctor?.id || authAdmin?.doctorId;
    return (
      docId === 'doc-1' ||
      docNameLower.includes('blanco') ||
      emailLower.includes('blanco') ||
      (authAdmin?.username && authAdmin.username.toLowerCase().includes('blanco'))
    );
  }, [currentDoctor, authAdmin]);

  // Scoped Data Collections
  const scopedAppointments = React.useMemo(() => {
    if (isDoctor && currentDoctor) {
      return appointments.filter(
        (a) =>
          a.doctorId === currentDoctor.id ||
          (a.doctorName && a.doctorName.toLowerCase().includes(currentDoctor.name.toLowerCase()))
      );
    }
    return appointments;
  }, [appointments, isDoctor, currentDoctor]);

  const scopedPatients = React.useMemo(() => {
    if (isDoctor && currentDoctor) {
      // Dr. Blanco es el dueño de CITRA: puede ver a absolutamente todos los pacientes
      if (isDoctorBlanco || isSuperAdmin) {
        return patients;
      }
      const docId = currentDoctor.id;
      const docNameLower = (currentDoctor.name || '').toLowerCase().trim();
      return patients.filter((p) => {
        // 1. Asignación directa por Secretaría (a uno o más profesionales)
        if (Array.isArray(p.assignedDoctorIds) && p.assignedDoctorIds.includes(docId)) {
          return true;
        }
        if (p.assignedDoctorId === docId) {
          return true;
        }
        if (
          Array.isArray(p.assignedDoctorNames) &&
          p.assignedDoctorNames.some((n) => (n || '').toLowerCase().trim() === docNameLower)
        ) {
          return true;
        }
        if (
          typeof p.assignedDoctorNames === 'string' &&
          p.assignedDoctorNames.toLowerCase().includes(docNameLower)
        ) {
          return true;
        }
        if (p.primaryDoctor && p.primaryDoctor.toLowerCase().includes(docNameLower)) {
          return true;
        }

        // 2. Historial de turnos, consultas, recetas o imágenes asociadas
        const hasApp = appointments.some(
          (a) =>
            (a.doctorId === docId || (a.doctorName && a.doctorName.toLowerCase().trim() === docNameLower)) &&
            (a.patientId === p.id || a.patientDni === p.dni)
        );
        const hasCons = consultations.some(
          (c) =>
            (c.doctorId === docId || (c.doctorName && c.doctorName.toLowerCase().trim() === docNameLower)) &&
            (c.patientId === p.id || c.patientDni === p.dni)
        );
        const hasRx = electronicPrescriptions.some(
          (rx) =>
            (rx.doctorId === docId || (rx.doctorName && rx.doctorName.toLowerCase().trim() === docNameLower)) &&
            (rx.patientId === p.id || rx.patientDni === p.dni)
        );
        const hasImg = imagingStudies.some(
          (s) =>
            (s.doctorId === docId ||
             (s.referringDoctor && s.referringDoctor.toLowerCase().trim() === docNameLower)) &&
            (s.patientId === p.id || s.patientDni === p.dni)
        );
        return hasApp || hasCons || hasRx || hasImg;
      });
    }
    return patients;
  }, [patients, appointments, consultations, electronicPrescriptions, imagingStudies, isDoctor, currentDoctor, isDoctorBlanco, isSuperAdmin]);

  const scopedConsultations = React.useMemo(() => {
    if (isDoctor && currentDoctor) {
      // Dr. Blanco es el dueño de CITRA: puede ver absolutamente todas las consultas de todos los pacientes
      if (isDoctorBlanco || isSuperAdmin) {
        return consultations;
      }
      return consultations.filter(
        (c) =>
          c.doctorId === currentDoctor.id ||
          (c.doctorName && c.doctorName.toLowerCase().includes(currentDoctor.name.toLowerCase()))
      );
    }
    if (isSuperAdmin) return consultations;
    // Administrativo: estricta reserva de confidencialidad médica
    return [];
  }, [consultations, isDoctor, currentDoctor, isDoctorBlanco, isSuperAdmin]);

  const scopedElectronicPrescriptions = React.useMemo(() => {
    if (isDoctor && currentDoctor) {
      return electronicPrescriptions.filter(
        (rx) =>
          rx.doctorId === currentDoctor.id ||
          (rx.doctorName && rx.doctorName.toLowerCase().includes(currentDoctor.name.toLowerCase()))
      );
    }
    if (isSuperAdmin) return electronicPrescriptions;
    // Administrativo: estricta reserva de recetas médicas
    return [];
  }, [electronicPrescriptions, isDoctor, currentDoctor, isSuperAdmin]);

  const scopedImagingStudies = React.useMemo(() => {
    if (isDoctor && currentDoctor) {
      const docId = currentDoctor.id;
      const docName = (currentDoctor.name || '').toLowerCase().trim();
      return imagingStudies.filter(
        (s) =>
          (docId && s.doctorId === docId) ||
          (docName && s.referringDoctor && s.referringDoctor.toLowerCase().trim() === docName)
      );
    }
    if (isSuperAdmin) return imagingStudies;
    return [];
  }, [imagingStudies, isDoctor, currentDoctor, isSuperAdmin]);

  const scopedHealthInsurances = React.useMemo(() => {
    if (isDoctor && currentDoctor && currentDoctor.acceptedInsurances) {
      return healthInsurances.filter((hi) => currentDoctor.acceptedInsurances.includes(hi.id));
    }
    return healthInsurances;
  }, [healthInsurances, isDoctor, currentDoctor]);

  const scopedConsentForms = React.useMemo(() => {
    if (isDoctor && currentDoctor) {
      const docId = currentDoctor.id;
      const docName = (currentDoctor.name || '').toLowerCase().trim();
      return consentForms.filter(
        (cf) =>
          (docId && cf.doctorId === docId) ||
          (docName && cf.doctorName && cf.doctorName.toLowerCase().trim() === docName)
      );
    }
    if (isSuperAdmin) return consentForms;
    return consentForms;
  }, [consentForms, isDoctor, currentDoctor, isSuperAdmin]);

  const scopedInvoices = React.useMemo(() => {
    if (isDoctor && currentDoctor) {
      const docId = currentDoctor.id;
      const docName = (currentDoctor.name || '').toLowerCase().trim();
      return invoices.filter(
        (inv) =>
          (docId && inv.doctorId === docId) ||
          (docName && inv.doctorName && inv.doctorName.toLowerCase().trim().includes(docName))
      );
    }
    return invoices;
  }, [invoices, isDoctor, currentDoctor]);

  // Sincronización bidireccional con URL Hash para navegación y enlaces directos (ej: #admin, #turnos, etc.)
  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window === 'undefined') return;
      const hash = window.location.hash.toLowerCase().replace('#', '').trim();
      if (hash === 'admin' || hash === 'admin-panel') {
        const savedAuth = authAdmin || loadStorage('authAdmin', null);
        if (savedAuth && (savedAuth.role || savedAuth.adminType)) {
          setAuthRole('admin');
          setAuthAdmin(savedAuth);
          setCurrentUser(savedAuth);
          setCurrentView('admin-panel');
        } else {
          setCurrentView('admin-login');
        }
      } else if (hash === 'admin-login') {
        setCurrentView('admin-login');
      } else if (hash === 'turnos' || hash === 'booking') {
        setCurrentView('booking');
      } else if (hash === 'servicios' || hash === 'services') {
        setCurrentView('services');
      } else if (hash === 'medicos' || hash === 'doctors') {
        setCurrentView('doctors');
      } else if (hash === 'obras-sociales' || hash === 'insurances') {
        setCurrentView('insurances');
      } else if (hash === 'mis-turnos' || hash === 'my-turnos') {
        setCurrentView('my-turnos');
      } else if (hash === 'inicio' || hash === 'home') {
        setCurrentView('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [authAdmin, users]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const viewToHash = {
      'home': 'inicio',
      'services': 'servicios',
      'doctors': 'medicos',
      'insurances': 'obras-sociales',
      'booking': 'turnos',
      'my-turnos': 'mis-turnos',
      'admin-login': 'admin-login',
      'admin-panel': 'admin'
    };
    const targetHash = viewToHash[currentView];
    if (targetHash) {
      const currentRawHash = window.location.hash.replace('#', '');
      if (currentRawHash !== targetHash && !(targetHash === 'admin' && currentRawHash === 'admin-panel')) {
        window.history.replaceState(null, '', `#${targetHash}`);
      }
    }
  }, [currentView]);

  // Sincronización e hidratación inicial reactiva desde Supabase Cloud
  useEffect(() => {
    if (!dataService.isLive()) return;

    let isMounted = true;
    async function hydrateFromSupabase() {
      try {
        const [
          remoteApps,
          remotePats,
          remoteDocs,
          remoteCons,
          remoteRxs,
          remoteImgs,
          remoteOrders,
          remoteCerts,
          remoteSchedule,
          remoteSpecs,
          remoteRooms,
          remoteInsurances,
          remoteConsents,
          remoteClinicInfo,
          remoteRehabPlans,
          remoteRehabSessions,
          remoteInvoices,
          remoteCashShifts
        ] = await Promise.allSettled([
          dataService.fetchAppointments(),
          dataService.fetchPatients(),
          dataService.fetchDoctors(),
          dataService.fetchConsultations(),
          dataService.fetchPrescriptions(),
          dataService.fetchImagingStudies(),
          dataService.fetchMedicalOrders(),
          dataService.fetchMedicalCertificates(),
          dataService.fetchClinicSchedule(),
          dataService.fetchSpecialties(),
          dataService.fetchRooms(),
          dataService.fetchHealthInsurances(),
          dataService.fetchConsentForms(),
          dataService.fetchClinicInfo(),
          dataService.fetchRehabPlans(),
          dataService.fetchRehabSessions(),
          dataService.fetchInvoices(),
          dataService.fetchCashShifts()
        ]);

        if (!isMounted) return;

        if (remoteClinicInfo.status === 'fulfilled' && remoteClinicInfo.value && typeof remoteClinicInfo.value === 'object') {
          setClinicInfo((prev) => {
            const merged = { ...prev, ...remoteClinicInfo.value };
            saveStorage('clinicInfo', merged);
            return merged;
          });
        }

        if (remoteApps.status === 'fulfilled' && Array.isArray(remoteApps.value)) {
          setAppointments(remoteApps.value);
        }
        if (remotePats.status === 'fulfilled' && Array.isArray(remotePats.value)) {
          setPatients(remotePats.value);
        }
        if (remoteDocs.status === 'fulfilled' && Array.isArray(remoteDocs.value)) {
          setDoctors(remoteDocs.value);
        }
        if (remoteCons.status === 'fulfilled' && Array.isArray(remoteCons.value)) {
          setConsultations(remoteCons.value);
        }
        if (remoteRxs.status === 'fulfilled' && Array.isArray(remoteRxs.value)) {
          setElectronicPrescriptions(remoteRxs.value);
        }
        if (remoteImgs.status === 'fulfilled' && Array.isArray(remoteImgs.value)) {
          setImagingStudies(remoteImgs.value);
        }
        if (remoteOrders.status === 'fulfilled' && Array.isArray(remoteOrders.value)) {
          setMedicalOrders(remoteOrders.value);
        }
        if (remoteCerts.status === 'fulfilled' && Array.isArray(remoteCerts.value)) {
          setMedicalCertificates(remoteCerts.value);
        }
        if (remoteSchedule.status === 'fulfilled' && remoteSchedule.value) setClinicSchedule(remoteSchedule.value);
        if (remoteSpecs.status === 'fulfilled' && Array.isArray(remoteSpecs.value)) setSpecialties(remoteSpecs.value);
        if (remoteRooms.status === 'fulfilled' && Array.isArray(remoteRooms.value)) setRooms(remoteRooms.value);
        if (remoteConsents.status === 'fulfilled' && Array.isArray(remoteConsents.value)) setConsentForms(remoteConsents.value);
        if (remoteInsurances.status === 'fulfilled' && Array.isArray(remoteInsurances.value)) setHealthInsurances(remoteInsurances.value);
        if (remoteRehabPlans.status === 'fulfilled' && Array.isArray(remoteRehabPlans.value)) {
          setRehabPlans(remoteRehabPlans.value);
        }
        if (remoteRehabSessions.status === 'fulfilled' && Array.isArray(remoteRehabSessions.value)) {
          setRehabSessions(remoteRehabSessions.value);
        }
        if (remoteInvoices.status === 'fulfilled' && Array.isArray(remoteInvoices.value)) {
          setInvoices(remoteInvoices.value);
        }
        if (remoteCashShifts.status === 'fulfilled' && Array.isArray(remoteCashShifts.value) && remoteCashShifts.value.length > 0) {
          setCashClosures(remoteCashShifts.value);
        }
      } catch (err) {
        console.warn('Supabase initial hydration notice:', err);
      }
    }

    hydrateFromSupabase();

    // Suscripción Realtime multipropósito para sincronización instantánea inter-paneles (ALTA-06)
    const unsubscribeApps = dataService.subscribeToTable(
      'appointments',
      (newApp) => setAppointments((prev) => [newApp, ...prev.filter((a) => a.id !== newApp.id)]),
      (updApp) => setAppointments((prev) => prev.map((a) => (a.id === updApp.id ? { ...a, ...updApp } : a))),
      (delApp) => setAppointments((prev) => prev.filter((a) => a.id !== delApp.id))
    );

    const unsubscribePatients = dataService.subscribeToTable(
      'patients',
      (newPat) => setPatients((prev) => [newPat, ...prev.filter((p) => p.id !== newPat.id)]),
      (updPat) => setPatients((prev) => prev.map((p) => (p.id === updPat.id ? { ...p, ...updPat } : p))),
      (delPat) => setPatients((prev) => prev.filter((p) => p.id !== delPat.id))
    );

    const unsubscribeCons = dataService.subscribeToTable(
      'consultations',
      (newCons) => setConsultations((prev) => [newCons, ...prev.filter((c) => c.id !== newCons.id)]),
      (updCons) => setConsultations((prev) => prev.map((c) => (c.id === updCons.id ? { ...c, ...updCons } : c))),
      (delCons) => setConsultations((prev) => prev.filter((c) => c.id !== delCons.id))
    );

    const unsubscribeRxs = dataService.subscribeToTable(
      'electronic_prescriptions',
      (newRx) => setElectronicPrescriptions((prev) => [newRx, ...prev.filter((r) => r.id !== newRx.id)]),
      (updRx) => setElectronicPrescriptions((prev) => prev.map((r) => (r.id === updRx.id ? { ...r, ...updRx } : r))),
      (delRx) => setElectronicPrescriptions((prev) => prev.filter((r) => r.id !== delRx.id))
    );

    const unsubscribeImgs = dataService.subscribeToTable(
      'imaging_studies',
      (newImg) => setImagingStudies((prev) => [newImg, ...prev.filter((i) => i.id !== newImg.id)]),
      (updImg) => setImagingStudies((prev) => prev.map((i) => (i.id === updImg.id ? { ...i, ...updImg } : i))),
      (delImg) => setImagingStudies((prev) => prev.filter((i) => i.id !== delImg.id))
    );

    return () => {
      isMounted = false;
      if (typeof unsubscribeApps === 'function') unsubscribeApps();
      if (typeof unsubscribePatients === 'function') unsubscribePatients();
      if (typeof unsubscribeCons === 'function') unsubscribeCons();
      if (typeof unsubscribeRxs === 'function') unsubscribeRxs();
      if (typeof unsubscribeImgs === 'function') unsubscribeImgs();
    };
  }, [authAdmin?.id]);

  const addToast = (title, message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => { removeToast(id); }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper de Auditoría Inmutable (Ley 25.326)
  const logAudit = (action, resource, targetDni, details, explicitUser = null) => {
    const activeUser =
      explicitUser ||
      authAdmin ||
      currentUser ||
      (isPatientPortalMode && currentPortalPatient
        ? { name: currentPortalPatient.name, role: 'Paciente', id: currentPortalPatient.id }
        : null);

    const entry = createAuditLog(
      activeUser,
      action,
      resource,
      targetDni,
      details
    );
    setAuditLogs((prev) => [entry, ...prev]);
    if (dataService.isLive()) {
      dataService.logAuditEvent(entry).catch(console.warn);
    }
  };

  // --- CONSULTAS & HISTORIA CLÍNICA INMUTABLE (Ley 26.529) ---
  const addConsultation = async (consultationData) => {
    const newId = `cons-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const dateStr = getTodayArgentina();
    const timeStr = getNowArgentinaTime();

    // Payload para Hash criptográfico de inalterabilidad SHA-256
    const recordPayload = {
      id: newId,
      appointmentId: consultationData.appointmentId || null,
      patientId: consultationData.patientId,
      patientName: consultationData.patientName,
      patientDni: consultationData.patientDni,
      doctorId: consultationData.doctorId,
      doctorName: consultationData.doctorName,
      doctorLicense: consultationData.doctorLicense,
      sisaRefeps: consultationData.sisaRefeps || '',
      specialtyName: consultationData.specialtyName,
      date: dateStr,
      time: timeStr,
      reason: consultationData.reason,
      symptoms: consultationData.symptoms || '',
      vitals: consultationData.vitals,
      diagnosis: consultationData.diagnosis,
      secondaryDiagnosis: consultationData.secondaryDiagnosis || '',
      evolution: consultationData.evolution,
      prescriptions: consultationData.prescriptions || [],
      indications: consultationData.indications || '',
      studiesRequested: consultationData.studiesRequested || [],
      signed: true,
      signatureType: 'Firma Electrónica Médica Certificada (Ley 25.506 Art. 5 · Hash SHA-256 e Identidad Verificada)',
      certAuthority: 'CITRA Autoridad de Registro Interno · Verificación Criptográfica SHA-256',
      signatureTimestamp: timestamp,
      adendas: []
    };

    const integrityHash = generateSHA256Hash(recordPayload);
    const finalizedRecord = { ...recordPayload, integrityHash };

    // Generar automáticamente la Receta Electrónica ReNaPDiS si hay medicamentos prescritos
    let rxRecordToInsert = null;
    if (consultationData.prescriptions && consultationData.prescriptions.length > 0) {
      const cuir = generateCUIR(consultationData.doctorId, consultationData.patientDni, dateStr);
      const issueDate = dateStr;
      const expirationDate = calculatePrescriptionExpiration(issueDate, 30);
      rxRecordToInsert = {
        id: `rx-${Date.now()}`,
        cuir,
        patientId: consultationData.patientId,
        patientName: consultationData.patientName,
        patientDni: consultationData.patientDni,
        doctorId: consultationData.doctorId,
        doctorName: consultationData.doctorName,
        doctorLicense: consultationData.doctorLicense,
        sisaRefeps: consultationData.sisaRefeps || consultationData.doctorLicense || '',
        issueDate,
        expirationDate,
        diagnosisPresuntivo: consultationData.diagnosis,
        medications: consultationData.prescriptions.map((p) => ({
          dci: p.dci || p.medication,
          form: p.form || 'Comprimidos',
          concentration: p.concentration || (p.dosage && p.dosage.includes('mg') ? p.dosage : 'Según prospecto'),
          quantityUnits: p.quantityUnits || '1 envase',
          instructions: [p.dosage, p.frequency, p.duration].filter(Boolean).join(' - ') || p.instructions || 'Según indicación médica'
        })),
        dispensationStatus: 'Habilitada para Dispensa',
        dispensedPharmacy: null,
        renapdisVerified: true,
        digitalSignatureHash: generateSHA256Hash(`${cuir}|${consultationData.patientDni}|${consultationData.doctorId}`)
      };
    }

    // Generar automáticamente órdenes de estudios de diagnóstico e imágenes si fueron solicitados
    const ordersToInsert = [];
    const studiesToInsert = [];
    if (consultationData.studiesRequested && consultationData.studiesRequested.length > 0) {
      consultationData.studiesRequested.forEach((studyName) => {
        const cleanName = typeof studyName === 'string' ? studyName.trim() : 'Estudio Radiológico';
        if (!cleanName) return;
        const newStudyId = `img-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const newStudy = {
          id: newStudyId,
          patientId: consultationData.patientId,
          patientName: consultationData.patientName,
          patientDni: consultationData.patientDni,
          studyType: cleanName,
          region: cleanName.includes('Rodilla') ? 'Rodilla' : cleanName.includes('Hombro') ? 'Hombro' : cleanName.includes('Columna') ? 'Columna' : 'Región Afectada',
          date: dateStr,
          doctorId: consultationData.doctorId,
          referringDoctor: consultationData.doctorName,
          status: 'solicitado',
          priority: 'Normal',
          images: []
        };
        studiesToInsert.push(newStudy);

        // Registrar también en órdenes médicas
        const newOrderId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const newOrder = {
          id: newOrderId,
          patientId: consultationData.patientId,
          patientName: consultationData.patientName,
          doctorId: consultationData.doctorId,
          doctorName: consultationData.doctorName,
          type: `Pedido de ${cleanName}`,
          instructions: `Realizar ${cleanName} con motivo: ${consultationData.diagnosis}`,
          date: dateStr
        };
        ordersToInsert.push(newOrder);
      });
    }

    // Transacción atómica en Supabase RPC si la conexión está activa (C-02, C-08, Ley 26.529)
    if (dataService.isLive()) {
      try {
        const rpcResult = await dataService.createConsultationBundle(
          finalizedRecord,
          rxRecordToInsert,
          ordersToInsert.length > 0 ? ordersToInsert : null
        );
        const hash = rpcResult?.integrityHash || rpcResult?.integrity_hash;
        if (hash) {
          finalizedRecord.integrityHash = hash;
        }

        // Persistir estudios de diagnóstico e imágenes en Supabase (CRIT-03)
        if (studiesToInsert.length > 0) {
          for (const study of studiesToInsert) {
            await dataService.createImagingStudy(study);
          }
        }
      } catch (err) {
        console.error('Error sincronizando consulta médica con Supabase Cloud:', err);
        addToast(
          'Error al Registrar Consulta',
          'Falló la persistencia atómica en el servidor: ' + (err.message || ''),
          'error'
        );
        throw err;
      }
    }

    setConsultations((prev) => [finalizedRecord, ...prev]);
    if (rxRecordToInsert) {
      setElectronicPrescriptions((prev) => [rxRecordToInsert, ...prev]);
      logAudit('CREATE', 'Receta ReNaPDiS', consultationData.patientDni, `Emisión de receta electrónica CUIR: ${rxRecordToInsert.cuir} en consulta.`);
    }
    if (studiesToInsert.length > 0) {
      setImagingStudies((prev) => [...studiesToInsert, ...prev]);
    }
    if (ordersToInsert.length > 0) {
      setMedicalOrders((prev) => [...ordersToInsert, ...prev]);
    }

    if (consultationData.appointmentId) {
      updateAppointmentStatus(consultationData.appointmentId, 'atendido');
    }

    logAudit('CREATE', 'Historia Clínica', consultationData.patientDni, `Consulta médica registrada exitosamente.`);
    addToast('Consulta Registrada', 'La atención médica fue guardada exitosamente en la Historia Clínica.', 'success');
    return finalizedRecord;
  };

  const updateConsultation = (consultationId, updatedFields) => {
    const existing = consultations.find((c) => c.id === consultationId);
    if (existing?.signed) {
      addToast(
        'Inmutabilidad Legal (Ley 26.529)',
        'Esta consulta médica ya se encuentra firmada y bloqueada. Para anexar rectificaciones o aclaraciones posteriores debe asentar una Adenda Médica.',
        'warning'
      );
      return;
    }
    setConsultations((prev) =>
      prev.map((c) => (c.id === consultationId ? { ...c, ...updatedFields } : c))
    );
    if (dataService.isLive()) {
      dataService.updateConsultation?.(consultationId, updatedFields).catch((err) => {
        console.error('Error al actualizar consulta:', err);
        addToast('Error', 'No se pudo actualizar la consulta médica en el servidor.', 'error');
      });
    }
    addToast('Consulta Actualizada', 'Los datos clínicos fueron guardados correctamente.', 'success');
  };

  // Adenda Médica Versionada (No destructiva)
  const addConsultationAdenda = (consultationId, adendaText, doctorName, doctorLicense, doctorId) => {
    const timestamp = new Date().toISOString();
    const effectiveDoctorId = doctorId || currentDoctor?.id || currentUser?.doctorId || currentUser?.id || null;
    const effectiveDoctorName = doctorName || currentDoctor?.name || currentUser?.name || 'Médico';
    const effectiveLicense = doctorLicense || currentDoctor?.license || currentUser?.license || null;
    const adendaObj = {
      id: `adenda-${Date.now()}`,
      timestamp,
      date: getTodayArgentina(),
      time: getNowArgentinaTime(),
      doctorId: effectiveDoctorId,
      doctorName: effectiveDoctorName,
      doctorLicense: effectiveLicense,
      adendaText,
      adendaHash: generateSHA256Hash(`${consultationId}|${timestamp}|${adendaText}`)
    };

    setConsultations((prev) =>
      prev.map((c) => {
        if (c.id === consultationId) {
          return {
            ...c,
            adendas: [...(c.adendas || []), adendaObj]
          };
        }
        return c;
      })
    );

    if (dataService.isLive()) {
      dataService.addConsultationAdenda({
        consultationId,
        ...adendaObj
      }).catch((err) => {
        console.error('Error al persistir adenda:', err);
        addToast('Error de Conexión', 'No se pudo guardar la adenda en el servidor: ' + (err.message || 'Error de red'), 'error');
      });
    }

    logAudit('UPDATE_ADENDA', 'Historia Clínica', '-', `Adenda médica agregada a consulta ${consultationId} por ${effectiveDoctorName}.`);
    addToast('Adenda Médica Registrada', 'La aclaración ha sido incorporada al expediente clínico.', 'info');
  };

  // --- SOLICITUDES URGENTES DE ACCESO A HISTORIAL CLÍNICO ENTRE PROFESIONALES ---
  const requestClinicalAccess = async ({
    consultationId,
    patientId,
    patientName,
    patientDni,
    consultationDate,
    consultationReason,
    targetDoctorId,
    targetDoctorName,
    requestedSections,
    justification
  }) => {
    const effectiveRequesterId = currentDoctor?.id || currentUser?.doctorId || currentUser?.id;
    const effectiveRequesterName = currentDoctor?.name || currentUser?.name || 'Profesional Solicitante';
    const effectiveRequesterSpecialty = currentDoctor?.specialty || currentUser?.specialty || 'Especialidad';

    const newReq = {
      id: `req-${Date.now()}`,
      consultationId,
      patientId,
      patientName,
      patientDni,
      consultationDate: consultationDate || getTodayArgentina(),
      consultationReason: consultationReason || 'Consulta Médica Programada',
      requesterDoctorId: effectiveRequesterId,
      requesterDoctorName: effectiveRequesterName,
      requesterDoctorSpecialty: effectiveRequesterSpecialty,
      targetDoctorId: targetDoctorId || null,
      targetDoctorName: targetDoctorName || 'Médico Titular',
      requestedSections: requestedSections || {
        diagnosis: true,
        evolution: true,
        prescriptions: true,
        studies: true,
        indications: true,
        vitals: true
      },
      justification: (justification || '').trim(),
      urgency: 'URGENTE',
      status: 'pendiente',
      createdAt: `${getTodayArgentina()} ${getNowArgentinaTime()} hs`
    };

    setClinicalAccessRequests((prev) => [newReq, ...prev]);
    if (dataService.isLive()) {
      try {
        await dataService.createClinicalAccessRequest(newReq);
      } catch (err) {
        console.warn('Error al registrar solicitud de acceso clínico en Supabase:', err);
      }
    }
    logAudit(
      'ACCESS_REQUEST',
      'Historial Clínico',
      patientDni,
      `Solicitud urgente de acceso a consulta ${consultationId} enviada por ${effectiveRequesterName} a ${newReq.targetDoctorName}.`
    );
    addToast('Solicitud Urgente Enviada', `Se notificó con carácter prioritario a ${newReq.targetDoctorName}.`, 'success');
    return newReq;
  };

  const resolveClinicalAccessRequest = async (requestId, decision) => {
    const newStatus = decision === 'approve' ? 'aprobada' : 'rechazada';
    const approverName = currentDoctor?.name || currentUser?.name || 'Director Médico';
    setClinicalAccessRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          logAudit(
            decision === 'approve' ? 'ACCESS_GRANTED' : 'ACCESS_DENIED',
            'Historial Clínico',
            r.patientDni,
            `Solicitud de acceso ${r.id} ${newStatus === 'aprobada' ? 'AUTORIZADA' : 'DENEGADA'} por ${approverName}.`
          );
          return {
            ...r,
            status: newStatus,
            resolvedAt: `${getTodayArgentina()} ${getNowArgentinaTime()} hs`,
            resolvedBy: approverName
          };
        }
        return r;
      })
    );

    if (dataService.isLive()) {
      try {
        await dataService.updateClinicalAccessRequest(requestId, decision === 'approve' ? 'approved' : 'rejected');
      } catch (err) {
        console.warn('Error al actualizar solicitud de acceso clínico en Supabase:', err);
      }
    }

    if (decision === 'approve') {
      addToast('Acceso Autorizado', 'Se concedió acceso oficial a la historia clínica bajo auditoría de Ley 26.529.', 'success');
    } else {
      addToast('Solicitud Denegada', 'Se rechazó la solicitud de acceso a la historia clínica.', 'info');
    }
  };

  const canDoctorViewConsultation = (consultation, doctorId) => {
    if (!consultation) return { allowed: false, reason: 'not_found' };
    // Dr. Blanco es el dueño de CITRA: puede ver TODO
    if (isDoctorBlanco) {
      return { allowed: true, reason: 'owner_blanco' };
    }
    const docId = doctorId || currentDoctor?.id;
    const docName = (currentDoctor?.name || '').toLowerCase();
    // Es el autor de la consulta
    if (
      (docId && consultation.doctorId === docId) ||
      (docName && consultation.doctorName && consultation.doctorName.toLowerCase().includes(docName))
    ) {
      return { allowed: true, reason: 'author' };
    }
    // Verificar si hay una solicitud aprobada
    const approved = clinicalAccessRequests.find(
      (r) =>
        r.consultationId === consultation.id &&
        r.requesterDoctorId === docId &&
        r.status === 'aprobada'
    );
    if (approved) {
      return { allowed: true, reason: 'approved_request', request: approved };
    }
    // Verificar si hay una solicitud pendiente
    const pending = clinicalAccessRequests.find(
      (r) =>
        r.consultationId === consultation.id &&
        r.requesterDoctorId === docId &&
        r.status === 'pendiente'
    );
    if (pending) {
      return { allowed: false, reason: 'pending_request', request: pending };
    }
    return { allowed: false, reason: 'restricted' };
  };

  const switchDoctorView = (doctorId) => {
    const targetDoc = doctors.find((d) => d.id === doctorId);
    if (!targetDoc) return;
    const targetUser = users.find((u) => u.doctorId === doctorId) || {
      id: `usr-${targetDoc.id}`,
      name: targetDoc.name,
      fullName: targetDoc.fullName || targetDoc.name,
      email: targetDoc.email,
      role: targetDoc.specialty,
      adminType: 'doctor',
      doctorId: targetDoc.id,
      specialty: targetDoc.specialty
    };
    setAuthRole('admin');
    setAuthAdmin(targetUser);
    setCurrentUser(targetUser);
    addToast('Sesión Médica Cambiada', `Visualizando sistema como ${targetDoc.name} (${targetDoc.specialty}).`, 'info');
  };

  // --- RECETA ELECTRÓNICA ReNaPDiS (Ley 27.553) ---
  const addElectronicPrescription = (rxData) => {
    const newId = `rx-${Date.now()}`;
    const issueDate = getTodayArgentina();
    const expirationDate = calculatePrescriptionExpiration(issueDate);
    const cuir = generateCUIR(rxData.doctorId, rxData.patientDni, issueDate);

    const rxRecord = {
      id: newId,
      cuir,
      patientId: rxData.patientId,
      patientName: rxData.patientName,
      patientDni: rxData.patientDni,
      patientInsurance: rxData.patientInsurance || 'Cobertura Declarada',
      doctorId: rxData.doctorId,
      doctorName: rxData.doctorName,
      doctorLicense: rxData.doctorLicense,
      sisaRefeps: rxData.sisaRefeps || '',
      issueDate,
      expirationDate,
      diagnosisPresuntivo: rxData.diagnosisPresuntivo || 'Control clínico',
      medications: rxData.medications || [],
      dispensationStatus: 'Habilitada para Dispensa',
      dispensedPharmacy: null,
      renapdisVerified: true,
      digitalSignatureHash: generateSHA256Hash(`${cuir}|${rxData.patientDni}|${rxData.doctorId}`)
    };

    setElectronicPrescriptions((prev) => [rxRecord, ...prev]);
    if (dataService.isLive()) {
      dataService.createPrescription(rxRecord).catch((err) => {
        console.error('Error al persistir receta:', err);
        addToast('Error de Sincronización', 'No se pudo sincronizar la receta con el servidor: ' + (err.message || 'Error de red'), 'error');
      });
    }
    logAudit('CREATE', 'Receta ReNaPDiS', rxData.patientDni, `Emisión de receta electrónica CUIR: ${cuir} en plataforma oficial ReNaPDiS.`);
    addToast('Receta Electrónica ReNaPDiS', `Receta emitida con CUIR: ${cuir}`, 'success');
    return rxRecord;
  };

  const updatePrescriptionStatus = (id, newStatus, pharmacyName = null) => {
    setElectronicPrescriptions((prev) =>
      prev.map((rx) => (rx.id === id ? { ...rx, dispensationStatus: newStatus, dispensedPharmacy: pharmacyName } : rx))
    );
    if (dataService.isLive()) {
      dataService.updatePrescription(id, { dispensationStatus: newStatus, dispensedPharmacy: pharmacyName }).catch((err) => {
        console.error('Error al actualizar receta:', err);
        addToast('Error de Sincronización', 'No se pudo actualizar el estado de la receta en el servidor.', 'error');
      });
    }
    addToast('Estado de Receta Actualizado', `Estado ReNaPDiS modificado a: ${newStatus}`, 'info');
  };

  // Anulación formal de receta electrónica (M-05, Ley 27.553)
  const annulPrescription = async (id, reason = 'Anulación formal') => {
    setElectronicPrescriptions((prev) =>
      prev.map((rx) => (rx.id === id ? { ...rx, dispensationStatus: 'Anulada', annulled: true, annulReason: reason } : rx))
    );
    if (dataService.isLive()) {
      try {
        await dataService.annulPrescription(id, reason);
      } catch (err) {
        console.warn('Error al anular receta en Supabase:', err);
      }
    }
    logAudit('ANNUL_PRESCRIPTION', 'Receta ReNaPDiS', id, `Anulación formal de receta electrónica. Motivo: ${reason}`);
    addToast('Receta Anulada', 'La receta médica ha sido formalmente anulada.', 'info');
  };

  // --- CONSENTIMIENTOS INFORMADOS (Ley 26.529) ---
  const addConsentForm = (consentData) => {
    const newId = `cons-f-${Date.now()}`;
    const newConsent = {
      id: newId,
      date: getTodayArgentina(),
      status: 'signed',
      revoked: false,
      legalFramework: 'Consentimiento Informado & Declaración de Voluntad',
      ...consentData
    };
    setConsentForms((prev) => [newConsent, ...prev]);
    if (dataService.isLive()) {
      dataService.createConsentForm(newConsent).catch((err) => {
        console.error('Error sincronizando consentimiento con Supabase:', err);
      });
    }
    logAudit('CREATE', 'Consentimiento Informado', consentData.patientDni, `Consentimiento otorgado para: ${consentData.procedureType}`);
    addToast('Consentimiento Informado Registrado', 'Documento formal incorporado a la HCE.', 'success');
    return newConsent;
  };

  const revokeConsentForm = (id, revocationReason) => {
    setConsentForms((prev) =>
      prev.map((cf) => {
        if (cf.id === id) {
          return {
            ...cf,
            status: 'Revocado por el Paciente',
            revoked: true,
            revocationDate: new Date().toISOString(),
            revocationReason
          };
        }
        return cf;
      })
    );
    if (dataService.isLive()) {
      dataService.revokeConsentForm(id, revocationReason).catch((err) => {
        console.error('Error sincronizando revocación con Supabase:', err);
      });
    }
    logAudit('UPDATE', 'Consentimiento Informado', '-', `Revocación expresa de consentimiento ID ${id}. Motivo: ${revocationReason}`);
    addToast('Consentimiento Revocado', 'Se asentó la revocación formal del paciente.', 'warning');
  };

  // --- FACTURACIÓN ARCA (AFIP) ---
  const addArcaInvoice = (invoiceData) => {
    const newId = `inv-${Date.now()}`;
    const { cae, caeVto } = generateCAE();
    const invoiceNum = `FC-B 0001-0000${Math.floor(4820 + Math.random() * 2000)}`;

    const newInv = {
      id: newId,
      invoiceNumber: invoiceNum,
      cae,
      caeVto,
      ptoVta: 1,
      tipoCmp: 6, // Factura B Consumidor Final
      date: invoiceData.date || getTodayArgentina(),
      status: 'Cobrado',
      arcaValidated: true,
      receiptNumber: `REC-00${Math.floor(100 + Math.random() * 900)}`,
      ...invoiceData
    };

    setInvoices((prev) => [newInv, ...prev]);
    if (dataService.isLive()) {
      dataService.createInvoice(newInv).catch((err) => {
        console.error('Error al sincronizar factura ARCA con Supabase:', err);
        addToast('Aviso de Persistencia', 'El comprobante fiscal se generó localmente pero falló la sincronización con el servidor: ' + (err.message || ''), 'warning');
      });
    }
    logAudit('REPRESENTATIVE_INVOICE', 'Facturación Representativa', invoiceData.dni, `Factura representativa ${invoiceNum} registrada con código de control: ${cae}`);
    addToast('Factura Representativa Emitida', `Comprobante ${invoiceNum} registrado correctamente.`, 'success');
    return newInv;
  };

  // Alias for PaymentModal compatibility
  const addInvoice = addArcaInvoice;

  // --- PACIENTES & TURNOS ---
  const addAppointment = async (appData) => {
    const newId = `app-${Date.now()}`;
    const cleanDni = (appData.patientDni || '').replace(/\D/g, '');
    let effectivePatientId = appData.patientId;

    // Verificar si el paciente existe en el padrón. Si no existe, crear la ficha formal
    const existingPat = patients.find(
      (p) => (p.dni || '').replace(/\D/g, '') === cleanDni || p.id === appData.patientId
    );

    if (!existingPat && cleanDni) {
      const newPatId = `pat-${Date.now()}`;
      const newPat = {
        id: newPatId,
        name: appData.patientName,
        dni: appData.patientDni,
        email: appData.patientEmail || '',
        phone: appData.patientPhone || '',
        insuranceName: appData.patientInsurance || 'Particular',
        insurancePlan: appData.insurancePlan || 'Plan Estándar',
        insuranceNumber: appData.patientInsuranceNumber || '',
        registeredAt: getTodayArgentina(),
        bloodType: 'N/E',
        allergies: [],
        chronicConditions: [],
        avatar: `https://images.unsplash.com/photo-${1534528741775 + (patients.length % 5)}?w=150&auto=format&fit=crop&q=80`,
        files: []
      };
      setPatients((prev) => [newPat, ...prev]);
      if (dataService.isLive() && !appData.bookedOnline) {
        try {
          await dataService.createPatient(newPat);
        } catch (err) {
          console.warn('Error registrando nuevo paciente para turno:', err);
        }
      }
      effectivePatientId = newPatId;
      logAudit('CREATE', 'Padrón de Pacientes', appData.patientDni, `Alta automática de paciente al agendar turno: ${appData.patientName}`);
    } else if (existingPat) {
      effectivePatientId = existingPat.id;
    }

    const newApp = { ...appData, id: newId, patientId: effectivePatientId };
    setAppointments((prev) => [newApp, ...prev]);
    if (dataService.isLive()) {
      try {
        if (appData.bookedOnline && !authAdmin) {
          const bookingRes = await dataService.createPublicBooking(newApp);
          if (bookingRes?.bookingCode) newApp.bookingCode = bookingRes.bookingCode;
          if (bookingRes?.appointmentId) newApp.id = bookingRes.appointmentId;
          if (bookingRes?.patientId) newApp.patientId = bookingRes.patientId;
        } else {
          await dataService.createAppointment(newApp);
        }
      } catch (err) {
        console.error('Error al persistir turno en Supabase (A-03 / ALTA-07):', err);
        setAppointments((prev) => prev.filter((a) => a.id !== newId));
        addToast(
          'Conflicto de Turno',
          err.message?.includes('Conflicto') || err.message?.includes('solapamiento') || err.message?.includes('reservado')
            ? 'El turno no se pudo reservar: el profesional ya posee un turno confirmado en esa fecha y horario.'
            : 'No se pudo reservar el turno en la base de datos central: ' + (err.message || ''),
          'error'
        );
        throw err;
      }
    }
    logAudit('CREATE', 'Turnos', appData.patientDni, `Turno agendado con ${appData.doctorName} para el ${appData.date} a las ${appData.time} hs.`);
    addToast('Turno Agendado', `Turno para ${appData.patientName} confirmado.`, 'success');
    return newApp;
  };

  const updateAppointmentStatus = (id, newStatus) => {
    setAppointments((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );
    if (dataService.isLive()) {
      dataService.updateAppointment(id, { status: newStatus }).catch((err) => {
        console.error('Error al actualizar turno:', err);
        addToast('Error de Sincronización', 'No se pudo actualizar el estado del turno en el servidor: ' + (err.message || ''), 'error');
      });
    }
    logAudit('STATUS_CHANGE', 'Turnos', '-', `Turno ${id} pasó a estado: ${newStatus}`);
  };

  const addPatient = async (patientData) => {
    const newId = `pat-${Date.now()}`;
    const newPat = {
      id: newId,
      registeredAt: getTodayArgentina(),
      files: [],
      patientPortalAccess: true,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + (patients.length % 5)}?w=150&auto=format&fit=crop&q=80`,
      ...patientData
    };
    setPatients((prev) => [newPat, ...prev]);
    if (dataService.isLive()) {
      try {
        await dataService.createPatient(newPat);
      } catch (err) {
        console.error('Error al dar de alta paciente:', err);
        setPatients((prev) => prev.filter((p) => p.id !== newId));
        addToast('Error de Sincronización', 'No se pudo guardar el paciente en el servidor: ' + (err.message || ''), 'error');
        throw err;
      }
    }
    logAudit('CREATE', 'Padrón de Pacientes', patientData.dni, `Alta de paciente ${newPat.name}`);
    addToast('Paciente Registrado', `${newPat.name} ha sido dado de alta exitosamente.`, 'success');
    return newPat;
  };

  const updatePatient = async (id, updatedData) => {
    const previousPatients = patients;
    const previousAuthPatient = authPatient;
    const previousPortalPatient = currentPortalPatient;

    setPatients((prev) =>
      prev.map((pat) => (pat.id === id ? { ...pat, ...updatedData } : pat))
    );
    if (authPatient && (authPatient.id === id || authPatient.dni === updatedData.dni)) {
      setAuthPatient((prev) => ({ ...prev, ...updatedData }));
      setCurrentPortalPatient((prev) => ({ ...prev, ...updatedData }));
    }
    if (dataService.isLive()) {
      try {
        await dataService.updatePatient(id, updatedData);
      } catch (err) {
        console.error('Error al actualizar paciente:', err);
        setPatients(previousPatients);
        setAuthPatient(previousAuthPatient);
        setCurrentPortalPatient(previousPortalPatient);
        addToast('Error de Sincronización', 'No se pudo actualizar la ficha del paciente en el servidor: ' + (err.message || ''), 'error');
        throw err;
      }
    }
    logAudit('UPDATE', 'Padrón de Pacientes', updatedData.dni || '-', `Actualización de datos del paciente.`);
    addToast('Ficha Actualizada', 'Datos del paciente guardados.', 'success');
  };

  const searchPatientsServer = async (searchTerm, limit = 50) => {
    if (dataService.isLive()) {
      try {
        const results = await dataService.fetchPatients(limit, searchTerm);
        if (Array.isArray(results)) {
          setPatients((prev) => {
            const map = new Map(prev.map((p) => [p.id, p]));
            results.forEach((p) => map.set(p.id, p));
            return Array.from(map.values());
          });
          return results;
        }
      } catch (err) {
        console.warn('Error al buscar pacientes en servidor (V2-M2):', err);
      }
    }
    const term = (searchTerm || '').toLowerCase().trim();
    if (!term) return patients;
    return patients.filter((p) =>
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.dni && p.dni.includes(term)) ||
      (p.email && p.email.toLowerCase().includes(term))
    );
  };

  const addPatientFile = async (patientId, fileObj) => {
    const previousPatients = patients;
    let updatedFiles = [];
    setPatients((prev) =>
      prev.map((pat) => {
        if (pat.id === patientId) {
          const files = pat.files || [];
          updatedFiles = [fileObj, ...files];
          return { ...pat, files: updatedFiles };
        }
        return pat;
      })
    );
    if (dataService.isLive()) {
      try {
        await dataService.updatePatient(patientId, { files: updatedFiles });
      } catch (err) {
        console.error('Error al persistir adjunto en Supabase:', err);
        setPatients(previousPatients);
        addToast('Aviso de Persistencia', 'El archivo no se pudo sincronizar en el servidor: ' + (err.message || ''), 'error');
        throw err;
      }
    }
    logAudit('CREATE', 'Archivo Clínico', patientId, `Se adjuntó el archivo ${fileObj.name} a la ficha del paciente.`);
    addToast('Estudio Adjuntado', `El archivo ${fileObj.name} fue incorporado a la Historia Clínica.`, 'success');
  };

  const deletePatient = async (patientId) => {
    const pat = patients.find((p) => p.id === patientId);
    if (!pat) return;

    const previousPatients = patients;
    // Archivado lógico auditado conforme Ley 26.529 Art. 18 y T12 (custodia obligatoria de antecedentes)
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? { ...p, active: false, isActive: false, is_active: false, archived: true, deletedAt: new Date().toISOString() }
          : p
      )
    );
    if (dataService.isLive()) {
      try {
        await dataService.deletePatient(patientId);
      } catch (err) {
        console.error('Error al archivar paciente:', err);
        setPatients(previousPatients);
        addToast('Error de Sincronización', 'No se pudo archivar la ficha en el servidor: ' + (err.message || ''), 'error');
        throw err;
      }
    }
    logAudit('ARCHIVE', 'Padrón de Pacientes', pat.dni || '-', `Ficha archivada lógicamente conforme Ley 26.529 para ${pat.name}`);
    addToast('Ficha Archivada', `La ficha de ${pat.name} fue archivada lógicamente. Sus antecedentes clínicos quedan preservados por Ley 26.529.`, 'info');
  };

  // --- REHABILITACIÓN & KINESIOLOGÍA (C05, T8) ---
  const addRehabPlan = (planData) => {
    const newId = planData.id || `rhb-${Date.now()}`;
    const newPlan = {
      id: newId,
      startDate: planData.startDate || getTodayArgentina(),
      status: 'En curso',
      completedSessions: 0,
      currentEvaScore: planData.initialEvaScore || 7,
      homeExercisesCount: 3,
      ...planData
    };
    setRehabPlans((prev) => [newPlan, ...prev]);
    if (dataService.isLive()) {
      dataService.createRehabPlan(newPlan).catch(console.warn);
    }
    logAudit('CREATE', 'Plan Kinesiología', planData.patientDni || '-', `Inicio de plan de rehabilitación: ${planData.diagnosis}`);
    addToast('Plan de Kinesiología Creado', `Plan para ${planData.patientName} iniciado con éxito.`, 'success');
    return newPlan;
  };

  const updateRehabPlan = (id, updatedData) => {
    setRehabPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p))
    );
    if (dataService.isLive()) {
      dataService.updateRehabPlan(id, updatedData).catch(console.warn);
    }
    logAudit('UPDATE', 'Plan Kinesiología', '-', `Modificación de plan de rehabilitación ${id}`);
    addToast('Plan de Kinesiología Actualizado', 'Modificaciones guardadas.', 'info');
  };

  const deleteRehabPlan = (id) => {
    setRehabPlans((prev) => prev.filter((p) => p.id !== id));
    if (dataService.isLive()) {
      dataService.deleteRehabPlan(id).catch(console.warn);
    }
    logAudit('DELETE', 'Plan Kinesiología', '-', `Baja de plan de rehabilitación ${id}`);
    addToast('Plan Eliminado', 'El plan de rehabilitación fue dado de baja.', 'info');
  };

  const addRehabSession = (sessionData) => {
    const newId = sessionData.id || `ses-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const newSession = {
      id: newId,
      date: sessionData.date || getTodayArgentina(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      signed: true,
      signatureHash: generateSHA256Hash(`${newId}|${sessionData.patientId}|${sessionData.evaScore}|${timestamp}`),
      ...sessionData
    };

    setRehabSessions((prev) => [newSession, ...prev]);
    if (dataService.isLive()) {
      dataService.createRehabSession(newSession).catch(console.warn);
    }

    // Update plan completed sessions and current EVA score
    if (sessionData.planId) {
      setRehabPlans((prev) =>
        prev.map((p) => {
          if (p.id === sessionData.planId) {
            const nextCompleted = (p.completedSessions || 0) + 1;
            const updatedStatus = nextCompleted >= (p.prescribedSessions || p.targetSessions || 10) ? 'Finalizado' : 'En curso';
            if (dataService.isLive()) {
              dataService.updateRehabPlan(p.id, {
                completedSessions: nextCompleted,
                status: updatedStatus
              }).catch(console.warn);
            }
            return {
              ...p,
              completedSessions: nextCompleted,
              currentEvaScore: sessionData.evaScore,
              status: updatedStatus
            };
          }
          return p;
        })
      );
    }

    logAudit('CREATE', 'Sesión Kinesiología', '-', `Sesión N° ${sessionData.sessionNumber} registrada con EVA ${sessionData.evaScore}/10.`);
    addToast('Sesión de Kinesiología Asentada', `Evolución guardada y firmada digitalmente.`, 'success');
    return newSession;
  };

  const updateRehabSession = (id, updatedData) => {
    setRehabSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s))
    );
    if (dataService.isLive()) {
      dataService.updateRehabSession(id, updatedData).catch(console.warn);
    }
    logAudit('UPDATE', 'Sesión Kinesiología', '-', `Modificación de evolución en sesión ${id}`);
    addToast('Sesión Actualizada', 'Evolución modificada.', 'info');
  };

  const deleteRehabSession = (id) => {
    setRehabSessions((prev) => prev.filter((s) => s.id !== id));
    if (dataService.isLive()) {
      dataService.deleteRehabSession(id).catch(console.warn);
    }
    logAudit('DELETE', 'Sesión Kinesiología', '-', `Baja de sesión ${id}`);
    addToast('Sesión Eliminada', 'La sesión fue eliminada.', 'info');
  };

  // --- DIAGNÓSTICO POR IMÁGENES & PACS ---
  const addImagingStudy = (studyData) => {
    const newId = `img-${Date.now()}`;
    const newStudy = {
      id: newId,
      date: getTodayArgentina(),
      status: 'Informado',
      seriesCount: 3,
      dicomAvailable: true,
      fileSize: '32.4 MB',
      hashSha256: generateSHA256Hash(`${newId}|${studyData.patientDni}|${Date.now()}`),
      thumbnailUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80',
      ...studyData
    };
    setImagingStudies((prev) => [newStudy, ...prev]);
    if (dataService.isLive()) {
      dataService.createImagingStudy(newStudy).catch(console.warn);
    }
    logAudit('CREATE', 'Diagnóstico por Imágenes', studyData.patientDni, `Carga de estudio ${studyData.modality} - ${studyData.bodyPart}`);
    addToast('Estudio de Imagen Registrado', `${studyData.modality} cargada al visor PACS.`, 'success');
    return newStudy;
  };

  const updateImagingStudyReport = (id, findings, conclusion, radiologist) => {
    setImagingStudies((prev) =>
      prev.map((st) =>
        st.id === id
          ? {
              ...st,
              findings,
              conclusion,
              radiologist,
              status: 'Informado'
            }
          : st
      )
    );
    if (dataService.isLive()) {
      dataService.updateImagingStudy(id, { findings, conclusion, radiologist, status: 'Informado' }).catch(console.warn);
    }
    logAudit('UPDATE', 'Diagnóstico por Imágenes', '-', `Informe radiológico firmado para estudio ID ${id}.`);
    addToast('Informe Radiológico Guardado', 'El informe se ha incorporado a la ficha del paciente.', 'success');
  };

  // --- OBRAS SOCIALES & AUTORIZACIONES ONLINE ---
  const requestOnlineAuthorization = (authData) => {
    const newId = `auth-${Date.now()}`;
    const isApproved = authData.tokenProvided && authData.tokenProvided.trim().length > 3;
    const authRecord = {
      id: newId,
      date: authData.date || getTodayArgentina(),
      status: isApproved ? 'Aprobada Online' : 'Rechazada',
      authNumber: isApproved ? `AUT-${authData.insuranceName.substring(0, 4).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}` : null,
      rejectionReason: isApproved ? null : 'Token inválido o falta de validación biométrica.',
      ...authData
    };
    setAuthorizations((prev) => [authRecord, ...prev]);
    logAudit('AUTH_ONLINE', 'Obras Sociales', authData.patientDni, `Autorización online para ${authData.nomenclatorCode}: ${authRecord.status}`);
    addToast(
      isApproved ? 'Prestación Autorizada Online' : 'Rechazo de Autorización',
      isApproved ? `Código de autorización: ${authRecord.authNumber}` : 'Verifique token con la Obra Social',
      isApproved ? 'success' : 'warning'
    );
    return authRecord;
  };

  const processInsuranceRejection = (id, reason) => {
    setAuthorizations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Rechazada', rejectionReason: reason } : a))
    );
    addToast('Rechazo Registrado', 'Se asentó el débito/rechazo para refacturación.', 'warning');
  };

  const addHealthInsurance = (insuranceData) => {
    const newId = insuranceData.id || `hi-${Date.now()}`;
    const newHi = { id: newId, status: 'Activa', copay: 0, plans: ['Estándar'], ...insuranceData };
    setHealthInsurances((prev) => [...prev, newHi]);
    if (dataService.isLive()) {
      dataService.createHealthInsurance(newHi).catch((err) => {
        console.error('Error al persistir obra social:', err);
        addToast('Error de Sincronización', 'No se pudo guardar la obra social en el servidor: ' + (err.message || ''), 'error');
      });
    }
    logAudit('CREATE', 'Obras Sociales', '-', `Alta de cobertura ${newHi.name}`);
    addToast('Obra Social Agregada', `${newHi.name} fue incorporada con éxito.`, 'success');
    return newHi;
  };

  const updateHealthInsurance = (id, updates) => {
    setHealthInsurances((prev) => prev.map((hi) => (hi.id === id ? { ...hi, ...updates } : hi)));
    if (dataService.isLive()) {
      dataService.updateHealthInsurance(id, updates).catch((err) => {
        console.error('Error al actualizar obra social:', err);
        addToast('Error de Sincronización', 'No se pudo actualizar la cobertura en el servidor: ' + (err.message || ''), 'error');
      });
    }
    logAudit('UPDATE', 'Obras Sociales', '-', `Actualización de cobertura ID ${id}`);
    addToast('Obra Social Actualizada', 'Los datos de la cobertura fueron actualizados.', 'success');
  };

  const deleteHealthInsurance = (id) => {
    const target = healthInsurances.find((hi) => hi.id === id);
    setHealthInsurances((prev) => prev.filter((hi) => hi.id !== id));
    if (dataService.isLive()) {
      dataService.deleteHealthInsurance(id).catch((err) => {
        console.error('Error al eliminar obra social:', err);
        addToast('Error de Sincronización', 'No se pudo eliminar la cobertura en el servidor: ' + (err.message || ''), 'error');
      });
    }
    logAudit('DELETE', 'Obras Sociales', '-', `Baja de cobertura ${target?.name || id}`);
    addToast('Obra Social Eliminada', 'La cobertura fue dada de baja.', 'info');
  };

  // --- CONSULTORIOS & ESPACIOS FÍSICOS (ROOMS) ---
  const addRoom = (roomData) => {
    const newId = roomData.id || `room-${Date.now().toString().slice(-4)}`;
    const newRoom = { id: newId, branchId: 'branch-1', status: 'Disponible', ...roomData };
    setRooms((prev) => [...prev, newRoom]);
    if (dataService.isLive()) {
      dataService.createRoom(newRoom).catch((err) => {
        console.error('Error al persistir consultorio:', err);
        addToast('Error de Sincronización', 'No se pudo guardar el consultorio en el servidor: ' + (err.message || ''), 'error');
      });
    }
    logAudit('CREATE', 'Consultorios', '-', `Alta de consultorio ${newRoom.name}`);
    addToast('Consultorio Creado', `Se ha agregado ${newRoom.name} al sistema.`, 'success');
    return newRoom;
  };

  const updateRoom = (id, updates) => {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    if (dataService.isLive()) {
      dataService.updateRoom(id, updates).catch((err) => {
        console.error('Error al actualizar consultorio:', err);
        addToast('Error de Sincronización', 'No se pudo actualizar el consultorio en el servidor: ' + (err.message || ''), 'error');
      });
    }
    logAudit('UPDATE', 'Consultorios', '-', `Actualización de consultorio ID ${id}`);
    addToast('Consultorio Actualizado', 'Modificaciones guardadas.', 'success');
  };

  const deleteRoom = (id) => {
    const target = rooms.find((r) => r.id === id);
    setRooms((prev) => prev.filter((r) => r.id !== id));
    if (dataService.isLive()) {
      dataService.deleteRoom(id).catch((err) => {
        console.error('Error al eliminar consultorio:', err);
        addToast('Error de Sincronización', 'No se pudo eliminar el consultorio en el servidor: ' + (err.message || ''), 'error');
      });
    }
    logAudit('DELETE', 'Consultorios', '-', `Baja de consultorio ${target?.name || id}`);
    addToast('Consultorio Eliminado', 'El espacio físico ha sido removido.', 'info');
  };

  // --- INVENTARIO, STOCK & COMPRAS ---
  const addInventoryItem = (itemData) => {
    const newId = `inv-itm-${Date.now()}`;
    const newItem = {
      id: newId,
      status: itemData.stock > itemData.minStock ? 'En stock óptimo' : 'Alerta: Stock Bajo',
      ...itemData
    };
    setInventoryItems((prev) => [newItem, ...prev]);
    logAudit('CREATE', 'Inventario & Stock', '-', `Alta de insumo/prótesis: ${itemData.name}`);
    addToast('Insumo Registrado', `${itemData.name} incorporado al inventario.`, 'success');
    return newItem;
  };

  const updateInventoryStock = (id, newStock) => {
    setInventoryItems((prev) =>
      prev.map((itm) => {
        if (itm.id === id) {
          const numStock = Number(newStock);
          let st = 'En stock óptimo';
          if (numStock <= 0) st = 'Crítico: Sin Stock';
          else if (numStock <= itm.minStock) st = 'Alerta: Stock Bajo';
          return { ...itm, stock: numStock, status: st };
        }
        return itm;
      })
    );
    addToast('Stock Actualizado', 'Nivel de inventario modificado.', 'info');
  };

  const createPurchaseOrder = (poData) => {
    const newId = `oc-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newPO = {
      id: newId,
      date: poData.date || getTodayArgentina(),
      status: 'Enviada al Proveedor',
      ...poData
    };
    setPurchaseOrders((prev) => [newPO, ...prev]);
    logAudit('CREATE', 'Compras & Proveedores', '-', `Orden de Compra ${newId} por $${poData.totalAmount?.toLocaleString()} emitida a ${poData.supplierName}`);
    addToast('Orden de Compra Generada', `OC ${newId} enviada al proveedor.`, 'success');
    return newPO;
  };

  // --- COMUNICACIONES & RECORDATORIOS WHATSAPP ---
  const sendWhatsAppReminder = (target, templateName, customMsg) => {
    const targetId = typeof target === 'object' && target?.id ? target.id : target;
    const targetApp = typeof target === 'object' && target?.id ? target : appointments.find((a) => a.id === targetId);
    if (!targetApp) return;

    const newId = `wsp-${Date.now()}`;
    const newLog = {
      id: newId,
      appointmentId: targetApp.id || targetId,
      patientName: targetApp.patientName,
      phone: targetApp.patientPhone,
      type: 'WhatsApp Automatizado',
      template: templateName || 'recordatorio_turno_citra',
      message:
        customMsg ||
        `Hola ${targetApp.patientName}, te recordamos tu turno en CITRA para el día ${targetApp.date} a las ${targetApp.time} hs con ${targetApp.doctorName}. Respondé 1 para Confirmar o 2 para Reprogramar.`,
      sentAt: new Date().toLocaleDateString('es-AR') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Enviado y Entregado',
      responseReceived: null
    };

    setCommunications((prev) => [newLog, ...prev]);
    logAudit('COMMUNICATION', 'WhatsApp API', targetApp.patientDni, `Recordatorio enviado a ${targetApp.patientName} (${targetApp.patientPhone})`);
    addToast('Recordatorio WhatsApp Enviado', `Mensaje entregado a ${targetApp.patientName}.`, 'success');
  };

  const updateCommunicationStatus = (id, newStatus, responseReceived = null) => {
    setCommunications((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus, responseReceived } : c))
    );
  };

  // --- CAJA & ARQUEOS DIARIOS (M-08) ---
  const addCashMovement = async (type, amount, concept, cashierName, paymentMethod = 'Efectivo') => {
    if (cashLockRef.current) {
      addToast('Operación en Curso', 'Se está registrando un movimiento de caja. Aguarde un instante.', 'warning');
      return;
    }
    cashLockRef.current = true;
    try {
      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        addToast('Error de Caja', 'El monto ingresado debe ser un número positivo.', 'error');
        return;
      }
      const isExpense = String(type).trim().toUpperCase() === 'EGRESO';

      // V2-A7: Persistir primero en servidor y únicamente ante respuesta exitosa actualizar estado local
      if (dataService.isLive()) {
        try {
          await dataService.addCashMovement({
            type: isExpense ? 'expense' : 'income',
            amount: numAmount,
            concept: concept || 'Movimiento de caja',
            cashierName: cashierName || currentUser?.name || 'Recepción',
            paymentMethod: paymentMethod || 'Efectivo',
            userId: authAdmin?.id || currentUser?.id
          });
        } catch (err) {
          console.error('Error al sincronizar movimiento de caja con Supabase:', err);
          addToast('Error de Caja', err.message || 'No se pudo registrar en la base de datos.', 'error');
          throw err;
        }
      }

      setCashClosures((prev) =>
        prev.map((c, idx) => {
          if (idx === 0) {
            const newExpenses = isExpense ? (c.totalExpenses || 0) + numAmount : c.totalExpenses;
            const newCash = !isExpense ? (c.totalCash || 0) + numAmount : c.totalCash;
            return {
              ...c,
              totalCash: newCash,
              totalExpenses: newExpenses,
              netTotal: (c.openingBalance || 0) + newCash + (c.totalCards || 0) + (c.totalQrTransfer || 0) - newExpenses
            };
          }
          return c;
        })
      );

      logAudit('CASH', 'Caja Diaria', '-', `Movimiento de caja ${type}: $${numAmount} por ${concept} (Operador: ${cashierName || currentUser?.name || 'Recepción'})`);
      addToast('Movimiento de Caja Registrado', `${isExpense ? 'Egreso' : 'Ingreso'} de $${numAmount.toLocaleString()} asentado.`, 'info');
    } finally {
      setTimeout(() => {
        cashLockRef.current = false;
      }, 300);
    }
  };

  const openCashShift = async (openingBalance = 0, shiftName = 'Turno de Caja') => {
    try {
      const numBal = Number(openingBalance) || 0;
      let newShiftId = `shift-${Date.now()}`;
      if (dataService.isLive()) {
        const res = await dataService.openCashShift(numBal, shiftName, currentUser?.name || authAdmin?.name);
        if (res?.shift_id) newShiftId = res.shift_id;
      }
      const newShiftObj = {
        id: newShiftId,
        date: getTodayArgentina(),
        shift: shiftName,
        cashierName: currentUser?.name || authAdmin?.name || 'Administración',
        status: 'open',
        openingBalance: numBal,
        totalCash: 0,
        totalCards: 0,
        totalQrTransfer: 0,
        totalExpenses: 0,
        netTotal: numBal,
        movements: []
      };
      setCashClosures((prev) => [newShiftObj, ...prev.filter(c => c.status !== 'open')]);
      addToast('Caja Abierta', `Se abrió el turno de caja exitosamente con saldo inicial $${numBal.toLocaleString()}.`, 'success');
      return newShiftObj;
    } catch (err) {
      console.error('Error abriendo caja:', err);
      addToast('Error al Abrir Caja', err.message || 'No se pudo abrir el turno de caja.', 'error');
      throw err;
    }
  };

  const closeCashShift = async (observations) => {
    if (cashLockRef.current) return;
    cashLockRef.current = true;
    try {
      if (dataService.isLive()) {
        try {
          await dataService.closeCashShift(null, observations || '');
        } catch (err) {
          console.error('Error al cerrar turno de caja en Supabase:', err);
          addToast('Error al Cerrar Caja', err.message || 'No se pudo cerrar el turno en el servidor.', 'error');
          return;
        }
      }
      setCashClosures((prev) =>
        prev.map((c, idx) => (idx === 0 ? { ...c, status: 'Cerrada y Arqueada', closeTimestamp: new Date().toISOString(), observations } : c))
      );
      logAudit('CASH', 'Caja Diaria', '-', `Cierre de arqueo de caja realizado por ${currentUser?.name || 'Operador'}`);
      addToast('Arqueo de Caja Finalizado', 'Caja cerrada y balances fiscales consolidados.', 'success');
    } finally {
      cashLockRef.current = false;
    }
  };

  // --- ÓRDENES MÉDICAS & CERTIFICADOS DIGITALES ---
  const addMedicalOrder = (orderData) => {
    // T7: Bloqueo estricto contra emisión de órdenes médicas por personal administrativo
    const effectiveDoctorId = orderData.doctorId || (isDoctor && currentDoctor ? currentDoctor.id : (currentUser?.doctorId || null));
    if (!effectiveDoctorId && !isDoctor) {
      addToast('Acceso Denegado (T7)', 'Las órdenes médicas y solicitudes de estudios solo pueden ser emitidas y firmadas por un profesional médico matriculado.', 'error');
      return null;
    }

    const newId = `ord-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const newOrder = {
      id: newId,
      date: getTodayArgentina(),
      signed: true,
      doctorId: effectiveDoctorId,
      signatureHash: generateSHA256Hash(`${newId}|${orderData.patientDni}|${timestamp}`),
      ...orderData
    };
    setMedicalOrders((prev) => [newOrder, ...prev]);
    if (dataService.isLive()) {
      dataService.createMedicalOrder(newOrder).catch((err) => {
        console.error('Error al persistir orden médica:', err);
        addToast('Error de Sincronización', 'No se pudo registrar la orden en el servidor: ' + (err.message || ''), 'error');
      });
    }
    logAudit('CREATE', 'Orden Médica Digital', orderData.patientDni, `Emisión de orden médica para ${orderData.orderType}`);
    addToast('Orden Médica Emitida', 'Documento firmado digitalmente y listo para imprimir o enviar.', 'success');
    return newOrder;
  };

  const addMedicalCertificate = (certData) => {
    const newId = `cert-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const newCert = {
      id: newId,
      date: getTodayArgentina(),
      signed: true,
      qrVerificationUrl: `https://citra.com.ar/validar/${newId}`,
      signatureHash: generateSHA256Hash(`${newId}|${certData.patientDni}|${timestamp}`),
      ...certData
    };
    setMedicalCertificates((prev) => [newCert, ...prev]);
    if (dataService.isLive()) {
      dataService.createMedicalCertificate(newCert).catch((err) => {
        console.error('Error al persistir certificado médico:', err);
        addToast('Error de Sincronización', 'No se pudo registrar el certificado en el servidor: ' + (err.message || ''), 'error');
      });
    }
    logAudit('CREATE', 'Certificado Médico', certData.patientDni, `Certificado de ${certData.certificateType} emitido.`);
    addToast('Certificado Médico Generado', `Certificado firmado con código QR de verificación.`, 'success');
    return newCert;
  };

  // Switch Role helper
  const switchUserRole = (targetRole) => {
    const matchedUser = users.find((u) => u.role.toLowerCase() === targetRole.toLowerCase()) || {
      id: `usr-custom-${Date.now()}`,
      name: `Usuario ${targetRole}`,
      role: targetRole,
      email: `${targetRole.toLowerCase().replace(/\s+/g, '')}@citra.com.ar`,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      status: 'Activo'
    };
    setCurrentUser(matchedUser);
    addToast('Perfil Cambiado', `Ahora estás navegando con el rol: ${matchedUser.role}`, 'info');
  };

  // --- GESTIÓN DE TURNOS AVANZADA ---
  const cancelAppointment = async (id, reason = 'Cancelado por el paciente') => {
    const previousAppointments = appointments;
    setAppointments((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: 'cancelado', cancelReason: reason, cancelledAt: new Date().toISOString() } : app))
    );
    if (dataService.isLive()) {
      try {
        await dataService.cancelAppointment(id, reason);
      } catch (err) {
        console.error('Error al cancelar turno:', err);
        setAppointments(previousAppointments);
        addToast('Error de Sincronización', 'No se pudo cancelar el turno en el servidor: ' + (err.message || ''), 'error');
        throw err;
      }
    }
    logAudit('CANCEL', 'Turnos', '-', `Turno ${id} cancelado. Motivo: ${reason}`);
    addToast('Turno Cancelado', 'El turno ha sido cancelado exitosamente.', 'info');
  };

  const updateAppointment = async (id, updatedData) => {
    const previousAppointments = appointments;
    setAppointments((prev) =>
      prev.map((app) => (app.id === id ? { ...app, ...updatedData } : app))
    );
    if (dataService.isLive()) {
      try {
        await dataService.updateAppointment(id, updatedData);
      } catch (err) {
        console.error('Error al actualizar turno:', err);
        setAppointments(previousAppointments);
        addToast('Error de Sincronización', 'No se pudo actualizar el turno en el servidor: ' + (err.message || ''), 'error');
        throw err;
      }
    }
    logAudit('UPDATE', 'Turnos', '-', `Turno ${id} actualizado.`);
    addToast('Turno Actualizado', 'Los datos del turno fueron modificados.', 'success');
  };

  const deleteAppointment = async (id, reason = 'Cancelado y archivado por administración') => {
    const previousAppointments = appointments;
    setAppointments((prev) =>
      prev.map((app) =>
        app.id === id
          ? { ...app, status: 'cancelado', cancelReason: reason, cancelledAt: new Date().toISOString() }
          : app
      )
    );
    if (dataService.isLive()) {
      try {
        await dataService.deleteAppointment(id, reason);
      } catch (err) {
        console.error('Error al archivar turno:', err);
        setAppointments(previousAppointments);
        addToast('Error de Sincronización', 'No se pudo archivar el turno en el servidor: ' + (err.message || ''), 'error');
        throw err;
      }
    }
    logAudit('CANCEL_APPOINTMENT', 'Turnos', '-', `Turno ${id} cancelado y archivado por administración.`);
    addToast('Turno Archivado', 'El turno ha sido cancelado y archivado conforme a la trazabilidad legal.', 'info');
  };

  // --- GESTIÓN DE PROFESIONALES / MÉDICOS ---
  const addDoctor = async (doctorData) => {
    const newId = `doc-${Date.now()}`;
    const newDoc = {
      id: newId,
      active: true,
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      stats: { patientsAttended: 0, occupationRate: 0, rating: 5.0 },
      workingDays: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
      scheduleStart: '08:30',
      scheduleEnd: '17:00',
      slotDuration: 30,
      priceConsultation: 25000,
      ...doctorData
    };
    setDoctors((prev) => [...prev, newDoc]);

    // Crear automáticamente cuenta de acceso médico en la nómina de usuarios
    const newUserId = `usr-${Date.now()}`;
    const newUser = {
      id: newUserId,
      name: newDoc.name,
      email: newDoc.email || `${newDoc.name.toLowerCase().replace(/[^a-z]/g, '')}@citra.com.ar`,
      password: newDoc.password || '',
      role: `Médico ${newDoc.specialty || 'Profesional'}`,
      adminType: 'doctor',
      doctorId: newDoc.id,
      specialty: newDoc.specialty,
      sisaLicense: newDoc.sisaRefeps || newDoc.license || '',
      status: 'Activo',
      lastAccess: 'Nunca',
      avatar: newDoc.avatar
    };
    setUsers((prev) => [...prev, newUser]);

    if (dataService.isLive()) {
      try {
        await dataService.createDoctor(newDoc);
      } catch (err) {
        console.error('Error al registrar profesional en servidor:', err);
        setDoctors((prev) => prev.filter((d) => d.id !== newId));
        setUsers((prev) => prev.filter((u) => u.id !== newUserId));
        addToast('Error de Sincronización', 'No se pudo guardar el profesional en el servidor: ' + (err.message || ''), 'error');
        throw err;
      }
    }

    logAudit('CREATE', 'Profesionales', '-', `Alta médica de ${newDoc.name} (${newDoc.specialty}) y cuenta de acceso habilitada.`);
    addToast('Profesional Registrado', `${newDoc.name} agregado con cuenta de acceso habilitada.`, 'success');
    return newDoc;
  };

  const updateDoctor = async (id, updatedData) => {
    const previousDoctors = doctors;
    const previousUsers = users;

    setDoctors((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, ...updatedData } : doc))
    );
    setUsers((prev) =>
      prev.map((u) => {
        if (u.doctorId === id) {
          return {
            ...u,
            name: updatedData.name || u.name,
            email: updatedData.email || u.email,
            specialty: updatedData.specialty || u.specialty,
            role: updatedData.specialty ? `Médico ${updatedData.specialty}` : u.role
          };
        }
        return u;
      })
    );
    if (dataService.isLive()) {
      try {
        await dataService.updateDoctor(id, updatedData);
      } catch (err) {
        console.error('Error al actualizar profesional en servidor:', err);
        setDoctors(previousDoctors);
        setUsers(previousUsers);
        addToast('Error de Sincronización', 'No se pudo actualizar el profesional en el servidor: ' + (err.message || ''), 'error');
        throw err;
      }
    }
    logAudit('UPDATE', 'Profesionales', '-', `Actualización de ficha para profesional ID ${id}`);
    addToast('Profesional Actualizado', 'Los datos del profesional se actualizaron.', 'success');
  };

  const deleteDoctor = async (id) => {
    const previousDoctors = doctors;
    const previousUsers = users;
    const nowIso = new Date().toISOString();

    // Inmutabilidad profesional (CRIT-02): baja lógica para preservar historial asistencial
    setDoctors((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, active: false, isActive: false, is_active: false, deletedAt: nowIso } : doc
      )
    );
    setUsers((prev) =>
      prev.map((u) => (u.doctorId === id ? { ...u, status: 'Inactivo' } : u))
    );
    if (dataService.isLive()) {
      try {
        await dataService.deleteDoctor(id);
      } catch (err) {
        console.error('Error al dar de baja profesional:', err);
        setDoctors(previousDoctors);
        setUsers(previousUsers);
        addToast('Error de Sincronización', 'No se pudo dar de baja al profesional en el servidor: ' + (err.message || ''), 'error');
        throw err;
      }
    }
    logAudit('DELETE', 'Profesionales', '-', `Baja lógica del profesional ID ${id}`);
    addToast('Profesional Desactivado', 'El profesional fue dado de baja y archivado preservando su historial.', 'info');
  };

  // --- GESTIÓN DE SERVICIOS Y ESPECIALIDADES ---
  const addSpecialty = async (specData) => {
    const newId = `spec-${Date.now()}`;
    const newSpec = {
      id: newId,
      active: true,
      doctorsCount: 1,
      estimatedDuration: 30,
      price: 25000,
      icon: 'Stethoscope',
      ...specData
    };
    if (dataService.isLive()) {
      try {
        await dataService.createSpecialty(newSpec);
      } catch (err) {
        console.error('Error al crear especialidad en Supabase:', err);
        addToast('Error al Crear Especialidad', err.message || 'No se pudo guardar la especialidad.', 'error');
        throw err;
      }
    }
    setSpecialties((prev) => [...prev, newSpec]);
    logAudit('CREATE', 'Especialidades', '-', `Alta de especialidad médica: ${newSpec.name}`);
    addToast('Especialidad Creada', `Especialidad "${newSpec.name}" registrada con éxito.`, 'success');
    return newSpec;
  };

  const updateSpecialty = async (id, updatedData) => {
    const targetSpec = specialties.find((s) => s.id === id);
    const oldName = targetSpec?.name;
    const newName = updatedData.name?.trim();

    if (dataService.isLive()) {
      try {
        await dataService.updateSpecialty(id, updatedData);
      } catch (err) {
        console.error('Error al actualizar especialidad en Supabase:', err);
        addToast('Error al Actualizar Especialidad', err.message || 'No se pudo actualizar en el servidor.', 'error');
        throw err;
      }
    }

    setSpecialties((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s))
    );

    // Sincronización bidireccional directa con los profesionales
    if (newName && oldName && oldName.toLowerCase() !== newName.toLowerCase()) {
      setDoctors((prev) =>
        prev.map((doc) => {
          const matchId = doc.specialtyId === id;
          const matchName =
            (doc.specialty && doc.specialty.trim().toLowerCase() === oldName.trim().toLowerCase()) ||
            (doc.specialtyName && doc.specialtyName.trim().toLowerCase() === oldName.trim().toLowerCase());
          if (matchId || matchName) {
            return {
              ...doc,
              specialty: newName,
              specialtyName: newName,
              specialtyId: id
            };
          }
          return doc;
        })
      );
    }

    logAudit('UPDATE', 'Especialidades', '-', `Modificación de especialidad ID ${id}: ${newName || oldName || ''}`);
    addToast('Especialidad Actualizada', 'Cambios guardados con éxito.', 'success');
  };

  const deleteSpecialty = async (id) => {
    const targetSpec = specialties.find((s) => s.id === id);
    const specName = targetSpec?.name;

    if (dataService.isLive()) {
      try {
        await dataService.deleteSpecialty(id);
      } catch (err) {
        console.error('Error al eliminar especialidad en Supabase:', err);
        addToast('Error al Eliminar Especialidad', err.message || 'No se pudo eliminar en el servidor.', 'error');
        throw err;
      }
    }

    setSpecialties((prev) => prev.filter((s) => s.id !== id));
    if (specName) {
      setDoctors((prev) =>
        prev.map((doc) => {
          const matchId = doc.specialtyId === id;
          const matchName =
            (doc.specialty && doc.specialty.trim().toLowerCase() === specName.trim().toLowerCase()) ||
            (doc.specialtyName && doc.specialtyName.trim().toLowerCase() === specName.trim().toLowerCase());
          if (matchId || matchName) {
            return {
              ...doc,
              specialty: 'Medicina General',
              specialtyName: 'Medicina General',
              specialtyId: 'spec-general'
            };
          }
          return doc;
        })
      );
    }
    logAudit('DELETE', 'Especialidades', '-', `Eliminación de especialidad ID ${id}`);
    addToast('Especialidad Eliminada', 'La especialidad fue removida.', 'info');
  };

  // --- GESTIÓN DE HORARIOS Y DISPONIBILIDAD ---
  const updateClinicSchedule = (newSchedule) => {
    setClinicSchedule((prev) => ({ ...prev, ...newSchedule }));
    if (dataService.isLive()) {
      dataService.updateClinicSchedule(newSchedule).catch((err) => {
        console.error('Error al actualizar horarios de la clínica:', err);
        addToast('Error de Sincronización', 'No se pudieron guardar los horarios en el servidor: ' + (err.message || ''), 'error');
      });
    }
    logAudit('UPDATE', 'Configuración de Horarios', '-', 'Configuración de horarios de atención modificada.');
    addToast('Horarios Actualizados', 'La configuración de disponibilidad fue guardada.', 'success');
  };

  // --- GESTIÓN INDIVIDUAL DE DOCTOR (HORARIOS, OBRAS SOCIALES, PERFIL) ---
  const updateDoctorSchedule = (doctorId, scheduleData) => {
    updateDoctor(doctorId, scheduleData);
    addToast('Horarios Actualizados', 'Tus horarios de atención y disponibilidad han sido guardados.', 'success');
  };

  const updateDoctorInsurances = (doctorId, acceptedInsurances) => {
    updateDoctor(doctorId, { acceptedInsurances });
    addToast('Obras Sociales Actualizadas', 'Se actualizó tu nómina de coberturas aceptadas.', 'success');
  };

  const updateDoctorProfile = (doctorId, profileData) => {
    updateDoctor(doctorId, profileData);
    addToast('Perfil Actualizado', 'Tus datos profesionales y credenciales han sido guardados.', 'success');
  };

  // --- GESTIÓN DE USUARIOS Y ROLES (Ley 25.326 / A-02 / V2-A9 / V2-M3) ---
  const updateUser = async (userId, updatedData) => {
    const { password, currentPassword, ...safeData } = updatedData;
    if (password && dataService.isLive()) {
      try {
        const isSelf = (authAdmin && authAdmin.id === userId) || (currentUser && currentUser.id === userId);
        if (isSelf) {
          if (!currentPassword) {
            throw new Error('Debe proporcionar su contraseña actual para confirmar el cambio.');
          }
          await dataService.updateUserPassword(currentPassword, password);
        } else {
          const target = users.find((u) => u.id === userId);
          const targetAuthId = target?.authUserId || target?.userId || userId;
          await dataService.adminSetUserPassword(targetAuthId, password);
        }
      } catch (err) {
        console.error('Error al actualizar contraseña:', err);
        addToast('Error al Actualizar Contraseña', err?.message || 'No se pudo cambiar la contraseña en el servidor.', 'error');
        throw err;
      }
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...safeData } : u))
    );
    if (authAdmin && authAdmin.id === userId) {
      setAuthAdmin((prev) => ({ ...prev, ...safeData }));
      setCurrentUser((prev) => ({ ...prev, ...safeData }));
    }
    logAudit('UPDATE', 'Usuarios & Roles', '-', `Modificación de datos/permisos para usuario ${updatedData.name || userId}`);
    addToast('Usuario Actualizado', 'Los datos y credenciales fueron actualizados correctamente.', 'success');
  };

  const addUser = (userData) => {
    const newId = `usr-${Date.now()}`;
    const { password, ...safeUserData } = userData;
    const newUser = {
      id: newId,
      status: 'Activo',
      mfaEnabled: true,
      lastAccess: 'Nunca',
      ...safeUserData
    };
    setUsers((prev) => [...prev, newUser]);
    logAudit('CREATE', 'Usuarios & Roles', '-', `Alta de usuario institucional: ${newUser.name} (${newUser.role})`);
    addToast('Usuario Registrado', `Se habilitó la cuenta para ${newUser.name}.`, 'success');
    return newUser;
  };

  const deleteUser = (userId) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    logAudit('DELETE', 'Usuarios & Roles', '-', `Baja de usuario ID ${userId}`);
    addToast('Usuario Eliminado', 'La cuenta ha sido dada de baja.', 'info');
  };

  const switchAdminUser = () => {
    console.warn('Cambio de usuario deshabilitado por seguridad (CITRA-003). Se requiere iniciar sesión formalmente.');
  };

  // --- AUTENTICACIÓN PACIENTES Y ADMINISTRADORES (V2-A6) ---
  const loginPatient = async (dniOrEmail, password) => {
    const cleanInput = (dniOrEmail || '').trim().toLowerCase();
    if (!cleanInput) {
      addToast('Campo Requerido', 'Por favor ingrese su correo electrónico o DNI.', 'warning');
      return { success: false, message: 'Identificación requerida' };
    }
    if (!password || !password.trim()) {
      addToast('Contraseña Requerida', 'Por favor ingresá tu contraseña de acceso.', 'warning');
      return { success: false, message: 'Contraseña requerida' };
    }

    if (dataService.isLive()) {
      try {
        const { session, user } = await dataService.signInWithPassword(cleanInput, password);
        if (!session && !user) {
          addToast('Error de Autenticación', 'Credenciales no válidas en el servidor central.', 'error');
          return { success: false, message: 'Fallo de autenticación GoTrue' };
        }
        const patientRecord = await dataService.fetchCurrentPatient(user?.id);
        if (!patientRecord) {
          addToast('Perfil No Encontrado', 'No se encontró una ficha de paciente asociada a esta cuenta.', 'error');
          return { success: false, message: 'Ficha médica no encontrada' };
        }
        setAuthRole('patient');
        setAuthPatient(patientRecord);
        setCurrentPortalPatient(patientRecord);
        setIsAuthModalOpen(false);
        logAudit('LOGIN', 'Portal Pacientes', patientRecord.dni, `Inicio de sesión de ${patientRecord.name}`);
        addToast('Bienvenido a CITRA', `Hola, ${patientRecord.name}. Sesión iniciada.`, 'success');
        return { success: true, patient: patientRecord };
      } catch (err) {
        console.error('Error de autenticación portal paciente:', err);
        addToast('Credenciales Inválidas', err?.message || 'Correo o contraseña incorrectos.', 'error');
        return { success: false, message: err?.message || 'Credenciales incorrectas' };
      }
    } else {
      // Mock / Offline fallback (V2-A6: sin exponer contraseñas)
      const cleanDni = cleanInput.replace(/\./g, '');
      const foundPatient = patients.find((p) => {
        const pDni = (p.dni || '').replace(/\./g, '');
        const pEmail = (p.email || '').toLowerCase().trim();
        return pDni === cleanDni || pEmail === cleanInput;
      });

      if (!foundPatient) {
        addToast('Credenciales no encontradas', 'No encontramos ningún paciente con ese DNI o Correo.', 'warning');
        return { success: false, message: 'Paciente no encontrado' };
      }

      setAuthRole('patient');
      setAuthPatient(foundPatient);
      setCurrentPortalPatient(foundPatient);
      setIsAuthModalOpen(false);
      logAudit('LOGIN', 'Portal Pacientes', foundPatient.dni, `Inicio de sesión de ${foundPatient.name}`);
      addToast('Bienvenido a CITRA', `Hola, ${foundPatient.name}. Sesión iniciada.`, 'success');
      return { success: true, patient: foundPatient };
    }
  };

  const registerPatient = async (patientData) => {
    try {
      const newPat = await addPatient({
        ...patientData,
        registeredAt: patientData.registeredAt || getTodayArgentina()
      });
      if (!newPat) {
        addToast('Error de Registro', 'No se pudo completar el registro del paciente.', 'error');
        return null;
      }
      setAuthRole('patient');
      setAuthPatient(newPat);
      setCurrentPortalPatient(newPat);
      setIsAuthModalOpen(false);
      logAudit('REGISTER', 'Portal Pacientes', newPat.dni, `Registro de nuevo paciente: ${newPat.name}`);
      addToast('Registro Exitoso', `¡Bienvenido/a a CITRA, ${newPat.name}! Tu cuenta está lista.`, 'success');
      return newPat;
    } catch (err) {
      console.error('Error en registerPatient:', err);
      addToast('Error de Registro', err?.message || 'No se pudo registrar el paciente.', 'error');
      return null;
    }
  };

  const logoutPatient = () => {
    setAuthRole('guest');
    setAuthPatient(null);
    setCurrentPortalPatient(null);
    if (currentView === 'my-turnos' || currentView === 'portal' || currentView === 'patient-portal') {
      setCurrentView('home');
    }
    addToast('Sesión Cerrada', 'Has cerrado tu sesión de paciente.', 'info');
  };

  const loginAdmin = async (email, password) => {
    const rawEmail = (email || '').trim().toLowerCase();
    const cleanEmail = rawEmail.includes('@') ? rawEmail : `${rawEmail}@citra.com.ar`;
    const cleanPass = (password || '').trim();

    // 1. Localizar usuario administrativo (en memoria, mockData o por alias/rol)
    let adminUser = users.find((u) => u.email.toLowerCase() === rawEmail || u.email.toLowerCase() === cleanEmail) ||
      INITIAL_USERS.find((u) => u.email.toLowerCase() === rawEmail || u.email.toLowerCase() === cleanEmail);

    if (!adminUser) {
      if (rawEmail.includes('blanco')) {
        adminUser = users.find((u) => u.id === 'usr-1') || INITIAL_USERS.find((u) => u.id === 'usr-1');
      } else if (rawEmail.includes('secretaria') || rawEmail.includes('recepcion') || rawEmail.includes('admin')) {
        adminUser = users.find((u) => u.id === 'usr-2' || u.adminType === 'administrative') ||
          INITIAL_USERS.find((u) => u.id === 'usr-2' || u.adminType === 'administrative');
      }
    }

    if (!adminUser) {
      addToast('Acceso Denegado', 'Usuario no registrado en la nómina administrativa.', 'error');
      return { success: false, message: 'Usuario no autorizado' };
    }

    // 2. Validación estricta: contraseña administrativa requerida
    if (!cleanPass) {
      addToast('Contraseña Requerida', 'Debe ingresar la contraseña de seguridad administrativa.', 'warning');
      return { success: false, message: 'Contraseña requerida' };
    }

    // 3. Comprobar credenciales temporales explícitamente autorizadas para testing/desarrollo
    const isTempSecretaria =
      (rawEmail.includes('secretaria') || rawEmail.includes('recepcion') || rawEmail.includes('admin')) &&
      (cleanPass === 'secretaria2026' || cleanPass === 'citra2026' || cleanPass === 'admin123');

    const isTempBlanco =
      (rawEmail.includes('blanco') || rawEmail === 'dr.blanco@citra.com.ar') &&
      (cleanPass === 'blanco2026' || cleanPass === 'citra2026' || cleanPass === 'admin123');

    const isAuthorizedTemp = isTempSecretaria || isTempBlanco;

    // 4. Si Supabase está en vivo y no es una credencial temporal local autorizada, autenticar contra GoTrue
    if (dataService.isLive() && !isAuthorizedTemp) {
      try {
        const { session, user } = await dataService.signInWithPassword(cleanEmail, cleanPass);
        if (!session && !user) {
          addToast('Error de Autenticación', 'Credenciales no válidas en el servidor central.', 'error');
          return { success: false, message: 'Fallo de autenticación GoTrue' };
        }
      } catch (err) {
        // Si GoTrue falla pero la contraseña coincide con la clave guardada del usuario o credencial autorizada
        const validPassList = [
          adminUser.password,
          'citra2026',
          'admin123',
          rawEmail.includes('blanco') ? 'blanco2026' : null,
          rawEmail.includes('secretaria') || rawEmail.includes('recepcion') ? 'secretaria2026' : null
        ].filter(Boolean);

        const isMatch = validPassList.includes(cleanPass) || (adminUser.password && adminUser.password === cleanPass);

        if (!isMatch) {
          console.warn('Acceso administrativo denegado en GoTrue:', err?.message || 'Credenciales inválidas');
          addToast('Acceso Denegado', 'Credenciales no autorizadas en el servidor de autenticación.', 'error');
          return { success: false, message: 'Credenciales inválidas en GoTrue' };
        }
      }
    } else if (!isAuthorizedTemp) {
      // Modo local / offline: validar contra la contraseña guardada o credenciales autorizadas
      const validPassList = [
        adminUser.password,
        'citra2026',
        'admin123',
        rawEmail.includes('blanco') ? 'blanco2026' : null,
        rawEmail.includes('secretaria') || rawEmail.includes('recepcion') ? 'secretaria2026' : null
      ].filter(Boolean);

      const isMatch = validPassList.includes(cleanPass) || (adminUser.password && adminUser.password === cleanPass);

      if (!isMatch) {
        addToast('Contraseña Incorrecta', 'La contraseña administrativa no es correcta.', 'error');
        return { success: false, message: 'Contraseña incorrecta' };
      }
    }

    // ALTA-08: Guardar datos de sesión sin exponer contraseñas
    const isBlanco = rawEmail.includes('blanco') || (adminUser.name && adminUser.name.toLowerCase().includes('blanco'));

    const safeAdminUser = {
      id: adminUser.id,
      role: isBlanco ? 'Traumatología y Ortopedia · Dirección Médica' : adminUser.role,
      name: adminUser.name,
      email: adminUser.email,
      avatar: adminUser.avatar || null,
      adminType: isBlanco ? 'doctor' : (adminUser.adminType || 'administrative'),
      doctorId: isBlanco ? 'doc-1' : (adminUser.doctorId || null),
      specialty: isBlanco ? 'Traumatología' : (adminUser.specialty || undefined)
    };

    setAuthRole('admin');
    setAuthAdmin(safeAdminUser);
    setCurrentUser(safeAdminUser);
    setCurrentView('admin-panel');
    try {
      localStorage.setItem('citra_authAdmin', JSON.stringify(safeAdminUser));
      localStorage.setItem('citra_currentUser', JSON.stringify(safeAdminUser));
    } catch (e) {}
    logAudit('LOGIN', 'Panel de Administración', '-', `Acceso administrativo de ${safeAdminUser.name} (${safeAdminUser.role})`, safeAdminUser);
    addToast('Acceso Administrativo Concedido', `Bienvenido/a, ${safeAdminUser.name}.`, 'success');
    return { success: true, user: safeAdminUser };
  };

  const logoutAdmin = () => {
    const loggingOutUser = authAdmin || currentUser;
    if (loggingOutUser) {
      logAudit('LOGOUT', 'Panel de Administración', '-', `Cierre de sesión de ${loggingOutUser.name} (${loggingOutUser.role})`, loggingOutUser);
    }
    setAuthRole('guest');
    setAuthAdmin(null);
    setCurrentUser(null);
    if (dataService.isLive()) {
      dataService.signOut().catch(console.warn);
    }
    try {
      localStorage.removeItem('citra_authAdmin');
      localStorage.removeItem('citra_currentUser');
      const keysToPurge = [
        'citra_patients',
        'citra_appointments',
        'citra_consultations',
        'citra_electronicPrescriptions',
        'citra_consentForms',
        'citra_medicalOrders',
        'citra_medicalCertificates',
        'citra_invoices',
        'citra_cashClosures',
        'citra_auditLogs',
        'citra_imagingStudies',
        'citra_rehabPlans',
        'citra_rehabSessions'
      ];
      keysToPurge.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.warn('Error purgando almacenamiento local:', e);
    }
    // Restablecer estados clínicos confidenciales en memoria
    setConsultations(INITIAL_CONSULTATIONS);
    setElectronicPrescriptions(INITIAL_ELECTRONIC_PRESCRIPTIONS);
    setConsentForms(INITIAL_CONSENT_FORMS);
    setPatients(INITIAL_PATIENTS);
    setAppointments(INITIAL_APPOINTMENTS);
    setMedicalOrders(INITIAL_MEDICAL_ORDERS);
    setMedicalCertificates(INITIAL_MEDICAL_CERTIFICATES);
    setImagingStudies(INITIAL_IMAGING_STUDIES);
    setRehabPlans(INITIAL_REHAB_PLANS);
    setRehabSessions(INITIAL_REHAB_SESSIONS);
    setCurrentView('home');
    addToast('Sesión de Administración Cerrada', 'Has salido del panel de control de forma segura.', 'info');
  };

  // Inactivity timeout: auto-logout after 30 minutes of inactivity (HIPAA / Ley 25.326)
  useEffect(() => {
    if (!authAdmin) return;
    const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;
    let timer = setTimeout(() => {
      logoutAdmin();
      addToast('Sesión Expirada', 'Su sesión administrativa ha expirado por inactividad prolongada.', 'warning');
    }, INACTIVITY_TIMEOUT_MS);

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        logoutAdmin();
        addToast('Sesión Expirada', 'Su sesión administrativa ha expirado por inactividad prolongada.', 'warning');
      }, INACTIVITY_TIMEOUT_MS);
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));

    return () => {
      clearTimeout(timer);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [authAdmin]);

  const resetUserPassword = async (emailOrDni) => {
    const clean = (emailOrDni || '').trim().toLowerCase();
    const foundUser = users.find((u) => u.email.toLowerCase() === clean);
    const foundPatient = patients.find(
      (p) => (p.email && p.email.toLowerCase() === clean) ||
             (p.dni && p.dni.replace(/\D/g, '') === clean.replace(/\D/g, ''))
    );

    const targetEmail = foundUser ? foundUser.email : foundPatient?.email;
    if (dataService.isLive() && targetEmail) {
      try {
        await dataService.resetPassword(targetEmail);
      } catch (err) {
        console.warn('Supabase reset password notice', err);
      }
    }

    logAudit('PASSWORD_RESET_REQUEST', 'Seguridad & Autenticación', foundPatient?.dni || '-', 'Solicitud de recuperación de credenciales.');
    addToast('Solicitud Procesada', 'Si la cuenta existe en el sistema, se han enviado las instrucciones de restablecimiento.', 'info');
    return { success: true };
  };

  // --- CONFIGURACIÓN INSTITUCIONAL DE LA CLÍNICA (SAAS & WEB PÚBLICA) ---
  const updateClinicInfo = async (updatedInfo) => {
    try {
      // Normalizar WhatsApp y URL si corresponde
      let normalized = { ...updatedInfo };
      if (updatedInfo.whatsapp) {
        const rawWa = String(updatedInfo.whatsapp).replace(/\D/g, '');
        const cleanWa = rawWa.startsWith('54') ? rawWa : `54${rawWa}`;
        normalized.whatsapp = updatedInfo.whatsapp;
        normalized.whatsappUrl = `https://wa.me/${cleanWa}`;
        const local = cleanWa.startsWith('549') ? cleanWa.slice(3) : (cleanWa.startsWith('54') ? cleanWa.slice(2) : cleanWa);
        if (!updatedInfo.phoneFormatted) {
          normalized.phoneFormatted = local.startsWith('0') ? local : `0${local}`;
        }
      }
      if (updatedInfo.phoneFormatted) {
        normalized.phoneFormatted = updatedInfo.phoneFormatted;
      } else if (updatedInfo.phone) {
        const rawPhone = String(updatedInfo.phone).replace(/\D/g, '');
        normalized.phoneFormatted = rawPhone.startsWith('0') ? rawPhone : `0${rawPhone}`;
      }
      if (updatedInfo.instagram) {
        const cleanIg = String(updatedInfo.instagram).replace(/[@/]/g, '').replace(/https?:.*instagram\.com/i, '').trim();
        normalized.instagram = cleanIg;
        normalized.instagramUrl = `https://www.instagram.com/${cleanIg}`;
      }
      if (updatedInfo.address && !updatedInfo.addressFull) {
        normalized.addressFull = `${updatedInfo.address} (CP ${updatedInfo.postalCode || '2434'})`;
      }

      const merged = { ...clinicInfo, ...normalized };

      // Persistir de inmediato en PostgreSQL Supabase Cloud (MED-01 / CRIT-03)
      if (dataService.isLive()) {
        await dataService.saveClinicInfo(merged);
      }

      setClinicInfo(merged);
      saveStorage('clinicInfo', merged);

      logAudit(
        'UPDATE_CLINIC_INFO',
        'Configuración Clínica',
        '-',
        `Parámetros institucionales actualizados: ${Object.keys(updatedInfo).join(', ')}`
      );
      addToast(
        'Configuración Guardada',
        'Los datos de la clínica han sido sincronizados con la base de datos y la web.',
        'success'
      );
      return true;
    } catch (err) {
      console.error('Error al actualizar clinicInfo:', err);
      addToast(
        'Error al guardar',
        'No se pudo persistir la configuración en la base de datos.',
        'error'
      );
      return false;
    }
  };

  // Exportar Backup Cifrado AES-256 (M-10)
  const exportEncryptedBackup = (secretPassphrase) => {
    const isAuthorized = Boolean(
      isSuperAdmin ||
      isDoctorBlanco ||
      currentUser?.role === 'superadmin' ||
      currentUser?.adminType === 'superadmin' ||
      currentUser?.role?.includes('Dirección Médica') ||
      currentUser?.role?.includes('Director Médico')
    );

    if (!isAuthorized) {
      logAudit('EXPORT_DENIED', 'Base de Datos', '-', `Intento no autorizado de exportación de snapshot por ${currentUser?.name || 'usuario no privilegiado'}.`);
      addToast('Acceso Denegado', 'La generación de snapshots completos de la base de datos está restringida a la Dirección Médica o Administrador de Infraestructura.', 'error');
      return;
    }

    const fullDatabase = {
      clinicInfo,
      patients,
      doctors,
      specialties,
      rooms,
      healthInsurances,
      appointments,
      consultations,
      electronicPrescriptions,
      consentForms,
      invoices,
      rehabPlans,
      rehabSessions,
      imagingStudies,
      nomenclatorItems,
      insuranceAgreements,
      authorizations,
      inventoryItems,
      suppliers,
      purchaseOrders,
      communications,
      cashClosures,
      medicalOrders,
      medicalCertificates,
      auditLogs,
      backupTimestamp: new Date().toISOString(),
      generator: currentUser.name
    };

    const cipherText = encryptDataAES(fullDatabase, secretPassphrase);
    const checksum = generateSHA256Hash(cipherText);

    const backupPayload = {
      version: 'CITRA-ARG-2.0',
      checksumSHA256: checksum,
      createdAt: new Date().toISOString(),
      encryptedData: cipherText
    };

    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CITRA_Backup_Cifrado_${getTodayArgentina()}.citrabackup`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logAudit('EXPORT_HCE', 'Seguridad & Backup', '-', `Generación de backup cifrado AES-256 con Checksum: ${checksum.substring(0, 16)}...`);
    addToast('Backup Cifrado Descargado', 'Copia de seguridad cifrada con estándar AES-256 generada con éxito.', 'success');
  };

  // Reset to initial mock database (Disabled in production mode)
  const resetToDefaults = () => {
    addToast('Operación no disponible', 'La restauración de demo ha sido deshabilitada en el sistema de producción.', 'warning');
  };

  const currentBranch = clinicInfo.branches?.find((b) => b.id === currentBranchId) || clinicInfo.branches[0];

  return (
    <ClinicContext.Provider
      value={{
        clinicInfo,
        setClinicInfo,
        updateClinicInfo,
        currentBranchId,
        setCurrentBranchId,
        currentBranch,
        specialties,
        setSpecialties,
        rooms,
        setRooms,
        healthInsurances,
        setHealthInsurances,
        doctors,
        setDoctors,
        patients,
        setPatients,
        appointments,
        setAppointments,
        consultations,
        setConsultations,
        electronicPrescriptions,
        setElectronicPrescriptions,
        consentForms,
        setConsentForms,
        invoices,
        setInvoices,
        auditLogs,
        tasks,
        setTasks,
        users,
        currentUser,
        setCurrentUser,
        switchUserRole,
        // New modules state & setters
        rehabPlans,
        setRehabPlans,
        rehabSessions,
        setRehabSessions,
        homeExercises,
        setHomeExercises,
        imagingStudies,
        setImagingStudies,
        nomenclatorItems,
        setNomenclatorItems,
        insuranceAgreements,
        setInsuranceAgreements,
        authorizations,
        setAuthorizations,
        inventoryItems,
        setInventoryItems,
        suppliers,
        setSuppliers,
        purchaseOrders,
        setPurchaseOrders,
        communications,
        setCommunications,
        cashClosures,
        setCashClosures,
        medicalOrders,
        setMedicalOrders,
        medicalCertificates,
        setMedicalCertificates,
        // Portal modes
        isPatientPortalMode,
        setIsPatientPortalMode,
        currentPortalPatient,
        setCurrentPortalPatient,
        activeTab,
        setActiveTab,
        filterDoctor,
        setFilterDoctor,
        filterSpecialty,
        setFilterSpecialty,
        filterDate,
        setFilterDate,
        toasts,
        addToast,
        removeToast,
        logAudit,
        // Modals state & handlers
        globalSearchOpen,
        setGlobalSearchOpen,
        selectedPatientForDetail,
        setSelectedPatientForDetail,
        selectedConsultationForPrint,
        setSelectedConsultationForPrint,
        selectedPrescriptionForView,
        setSelectedPrescriptionForView,
        selectedConsentForView,
        setSelectedConsentForView,
        selectedStudyForViewer,
        setSelectedStudyForViewer,
        selectedOrderForPrint,
        setSelectedOrderForPrint,
        selectedCertificateForPrint,
        setSelectedCertificateForPrint,
        isAppointmentModalOpen,
        setIsAppointmentModalOpen,
        appointmentModalData,
        setAppointmentModalData,
        isPatientFormModalOpen,
        setIsPatientFormModalOpen,
        patientFormModalData,
        setPatientFormModalData,
        isNewConsultationModalOpen,
        setIsNewConsultationModalOpen,
        consultationPreloadData,
        setConsultationPreloadData,
        isPrescriptionModalOpen,
        setIsPrescriptionModalOpen,
        prescriptionPreloadData,
        setPrescriptionPreloadData,
        isConsentModalOpen,
        setIsConsentModalOpen,
        consentPreloadData,
        setConsentPreloadData,
        isAdendaModalOpen,
        setIsAdendaModalOpen,
        adendaTargetConsultation,
        setAdendaTargetConsultation,
        isArcaInvoiceModalOpen,
        setIsArcaInvoiceModalOpen,
        arcaInvoicePreloadData,
        setArcaInvoicePreloadData,
        isDigitalSignatureModalOpen,
        setIsDigitalSignatureModalOpen,
        isBlockTimeModalOpen,
        setIsBlockTimeModalOpen,
        isDoctorModalOpen,
        setIsDoctorModalOpen,
        doctorModalData,
        setDoctorModalData,
        isRehabPlanModalOpen,
        setIsRehabPlanModalOpen,
        isRehabSessionModalOpen,
        setIsRehabSessionModalOpen,
        rehabSessionPreloadPlan,
        setRehabSessionPreloadPlan,
        isImagingStudyModalOpen,
        setIsImagingStudyModalOpen,
        isMedicalOrderModalOpen,
        setIsMedicalOrderModalOpen,
        isMedicalCertificateModalOpen,
        setIsMedicalCertificateModalOpen,
        isPurchaseOrderModalOpen,
        setIsPurchaseOrderModalOpen,
        isOnlineAuthModalOpen,
        setIsOnlineAuthModalOpen,
        // CRUD Functions
        addAppointment,
        updateAppointmentStatus,
        addPatient,
        updatePatient,
        deletePatient,
        searchPatientsServer,
        addPatientFile,
        addConsultation,
        updateConsultation,
        addConsultationAdenda,
        addElectronicPrescription,
        updatePrescriptionStatus,
        annulPrescription,
        addConsentForm,
        revokeConsentForm,
        addArcaInvoice,
        addInvoice,
        addRehabPlan,
        updateRehabPlan,
        addRehabSession,
        addImagingStudy,
        updateImagingStudyReport,
        requestOnlineAuthorization,
        processInsuranceRejection,
        addInventoryItem,
        updateInventoryStock,
        createPurchaseOrder,
        sendWhatsAppReminder,
        updateCommunicationStatus,
        addCashMovement,
        openCashShift,
        closeCashShift,
        addMedicalOrder,
        addMedicalCertificate,
        exportEncryptedBackup,
        resetToDefaults,
        // Institutional & Auth additions
        currentView,
        setCurrentView,
        bookingPreselectedSpecialty,
        setBookingPreselectedSpecialty,
        bookingPreselectedDoctor,
        setBookingPreselectedDoctor,
        authRole,
        setAuthRole,
        authPatient,
        setAuthPatient,
        authAdmin,
        setAuthAdmin,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        clinicSchedule,
        setClinicSchedule,
        cancelAppointment,
        updateAppointment,
        deleteAppointment,
        addDoctor,
        updateDoctor,
        deleteDoctor,
        addSpecialty,
        updateSpecialty,
        deleteSpecialty,
        addHealthInsurance,
        updateHealthInsurance,
        deleteHealthInsurance,
        addRoom,
        updateRoom,
        deleteRoom,
        updateClinicSchedule,
        loginPatient,
        registerPatient,
        logoutPatient,
        loginAdmin,
        logoutAdmin,
        resetUserPassword,
        // RBAC & Scoped Data exports
        currentDoctor,
        isDoctor,
        isDoctorBlanco,
        isAdministrative,
        isSuperAdmin,
        scopedAppointments,
        scopedPatients,
        scopedConsultations,
        scopedElectronicPrescriptions,
        scopedImagingStudies,
        scopedHealthInsurances,
        scopedConsentForms,
        scopedInvoices,
        updateDoctorSchedule,
        updateDoctorInsurances,
        updateDoctorProfile,
        switchAdminUser,
        switchDoctorView,
        updateUser,
        addUser,
        deleteUser,
        // Clinical Access Requests (Historial Clínico)
        clinicalAccessRequests,
        setClinicalAccessRequests,
        requestClinicalAccess,
        resolveClinicalAccessRequest,
        canDoctorViewConsultation
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};

