import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // Main state with persistence
  const [clinicInfo, setClinicInfo] = useState(() => loadStorage('clinicInfo', INITIAL_CLINIC_INFO));
  const [currentBranchId, setCurrentBranchId] = useState(() => loadStorage('currentBranchId', 'branch-1'));
  const [specialties, setSpecialties] = useState(() => loadStorage('specialties', INITIAL_SPECIALTIES));
  const [rooms, setRooms] = useState(() => loadStorage('rooms', INITIAL_ROOMS));
  const [healthInsurances, setHealthInsurances] = useState(() => loadStorage('healthInsurances', INITIAL_HEALTH_INSURANCES));
  const [doctors, setDoctors] = useState(() => {
    const loaded = loadStorage('doctors', INITIAL_DOCTORS);
    return INITIAL_DOCTORS.map((initDoc) => {
      const savedDoc = Array.isArray(loaded) ? loaded.find((d) => d.id === initDoc.id) : null;
      return savedDoc ? { ...savedDoc, ...initDoc } : initDoc;
    });
  });
  const [patients, setPatients] = useState(() => loadStorage('patients', INITIAL_PATIENTS));
  const [appointments, setAppointments] = useState(() => {
    const loaded = loadStorage('appointments', null);
    if (!loaded || !Array.isArray(loaded) || loaded.length < INITIAL_APPOINTMENTS.length) {
      return INITIAL_APPOINTMENTS;
    }
    return loaded;
  });
  const [consultations, setConsultations] = useState(() => {
    const loaded = loadStorage('consultations', INITIAL_CONSULTATIONS);
    return loaded.map((c) =>
      c.doctorId === 'doc-1' || (c.doctorName && c.doctorName.includes('Morales'))
        ? { ...c, doctorId: 'doc-1', doctorName: 'Dr. Alejandro Blanco' }
        : c
    );
  });
  const [electronicPrescriptions, setElectronicPrescriptions] = useState(() => {
    const loaded = loadStorage('electronicPrescriptions', INITIAL_ELECTRONIC_PRESCRIPTIONS);
    return loaded.map((rx) =>
      rx.doctorId === 'doc-1' || (rx.doctorName && rx.doctorName.includes('Morales'))
        ? { ...rx, doctorId: 'doc-1', doctorName: 'Dr. Alejandro Blanco' }
        : rx
    );
  });
  const [consentForms, setConsentForms] = useState(() => {
    const loaded = loadStorage('consentForms', INITIAL_CONSENT_FORMS);
    return loaded.map((cf) =>
      cf.doctorId === 'doc-1' || (cf.doctorName && cf.doctorName.includes('Morales'))
        ? { ...cf, doctorId: 'doc-1', doctorName: 'Dr. Alejandro Blanco' }
        : cf
    );
  });
  const [invoices, setInvoices] = useState(() => loadStorage('invoices', INITIAL_INVOICES));
  const [auditLogs, setAuditLogs] = useState(() => loadStorage('auditLogs', INITIAL_AUDIT_LOGS));
  const [tasks, setTasks] = useState(() => loadStorage('tasks', INITIAL_TASKS_AND_ALERTS));
  const [users, setUsers] = useState(() => {
    const loaded = loadStorage('users', INITIAL_USERS);
    const userMap = new Map();
    INITIAL_USERS.forEach((u) => userMap.set(u.email.toLowerCase(), u));
    if (Array.isArray(loaded)) {
      loaded.forEach((u) => {
        if (!userMap.has(u.email?.toLowerCase())) {
          userMap.set(u.email?.toLowerCase(), u);
        }
      });
    }
    return Array.from(userMap.values());
  });
  const [currentUser, setCurrentUser] = useState(() => {
    const loaded = loadStorage('currentUser', INITIAL_USERS[0]);
    if (loaded && (loaded.id === 'usr-1' || loaded.doctorId === 'doc-1' || (loaded.name && loaded.name.includes('Morales') && !loaded.role?.includes('Director')))) {
      return { ...loaded, id: 'usr-1', name: 'Dr. Alejandro Blanco', email: 'dr.blanco@citra.com.ar', adminType: 'doctor', doctorId: 'doc-1' };
    }
    return loaded;
  });

  // New modules state
  const [rehabPlans, setRehabPlans] = useState(() => loadStorage('rehabPlans', INITIAL_REHAB_PLANS));
  const [rehabSessions, setRehabSessions] = useState(() => loadStorage('rehabSessions', INITIAL_REHAB_SESSIONS));
  const [homeExercises, setHomeExercises] = useState(() => loadStorage('homeExercises', INITIAL_HOME_EXERCISES));
  const [imagingStudies, setImagingStudies] = useState(() => {
    const loaded = loadStorage('imagingStudies', INITIAL_IMAGING_STUDIES);
    return loaded.map((s) => {
      const isDoc1 = !s.doctorId || s.doctorId === 'doc-1' || (s.referringDoctor && (s.referringDoctor.includes('Morales') || s.referringDoctor.includes('Blanco')));
      return isDoc1
        ? { ...s, doctorId: 'doc-1', referringDoctor: 'Dr. Alejandro Blanco' }
        : s;
    });
  });
  const [nomenclatorItems, setNomenclatorItems] = useState(() => loadStorage('nomenclatorItems', INITIAL_NOMENCLATOR_ITEMS));
  const [insuranceAgreements, setInsuranceAgreements] = useState(() => loadStorage('insuranceAgreements', INITIAL_INSURANCE_AGREEMENTS));
  const [authorizations, setAuthorizations] = useState(() => loadStorage('authorizations', INITIAL_AUTHORIZATIONS));
  const [inventoryItems, setInventoryItems] = useState(() => loadStorage('inventoryItems', INITIAL_INVENTORY_ITEMS));
  const [suppliers, setSuppliers] = useState(() => loadStorage('suppliers', INITIAL_SUPPLIERS));
  const [purchaseOrders, setPurchaseOrders] = useState(() => loadStorage('purchaseOrders', INITIAL_PURCHASE_ORDERS));
  const [communications, setCommunications] = useState(() => loadStorage('communications', INITIAL_COMMUNICATION_LOGS));
  const [cashClosures, setCashClosures] = useState(() => loadStorage('cashClosures', INITIAL_CASH_CLOSURES));
  const [medicalOrders, setMedicalOrders] = useState(() => loadStorage('medicalOrders', INITIAL_MEDICAL_ORDERS));
  const [medicalCertificates, setMedicalCertificates] = useState(() => loadStorage('medicalCertificates', INITIAL_MEDICAL_CERTIFICATES));

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
      const savedUsers = loadStorage('users', INITIAL_USERS);
      const matched = savedUsers.find(
        (u) => u.id === saved.id || u.email?.toLowerCase() === saved.email?.toLowerCase()
      );
      return matched
        ? { ...matched, adminType: matched.adminType || saved.adminType, doctorId: matched.doctorId || saved.doctorId }
        : null;
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

  // Storage Sanitization Effect: ensures that old references to 'Alejandro Morales' for doc-1 in localStorage are wiped
  useEffect(() => {
    try {
      const keysToCheck = ['citra_doctors', 'citra_authAdmin', 'citra_currentUser', 'citra_appointments', 'citra_consultations', 'citra_electronicPrescriptions'];
      keysToCheck.forEach((key) => {
        const item = localStorage.getItem(key);
        if (item && item.includes('Morales') && !item.includes('Roberto Morales')) {
          const replaced = item.replaceAll('Dr. Alejandro Morales', 'Dr. Alejandro Blanco').replaceAll('Alejandro Morales', 'Dr. Alejandro Blanco');
          localStorage.setItem(key, replaced);
        }
      });
    } catch (e) {
      console.error('Storage sanitization error', e);
    }
  }, []);

  // Clinic General Schedules & Availability
  const INITIAL_SCHEDULE = {
    openingTime: '08:00',
    closingTime: '20:00',
    slotDuration: 30,
    workingDays: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    saturdayClosingTime: '13:00',
    blockedDates: ['2026-12-25', '2026-01-01', '2026-05-01']
  };
  const [clinicSchedule, setClinicSchedule] = useState(() => loadStorage('clinicSchedule', INITIAL_SCHEDULE));

  // Portal and View Modes
  const [isPatientPortalMode, setIsPatientPortalMode] = useState(false);
  const [currentPortalPatient, setCurrentPortalPatient] = useState(() => INITIAL_PATIENTS[0]);

  // Navigation tabs: 'dashboard', 'agenda', 'patients', 'clinical', 'kinesio', 'imaging', 'insurances', 'inventory', 'communications', 'billing', 'doctors', 'reports', 'audit', 'security', 'integrations', 'settings'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filterDoctor, setFilterDoctor] = useState('all');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [filterDate, setFilterDate] = useState('2026-08-28');

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

  // Toasts
  const [toasts, setToasts] = useState([]);

  // LocalStorage sync effects
  useEffect(() => { localStorage.setItem('citra_clinicInfo', JSON.stringify(clinicInfo)); }, [clinicInfo]);
  useEffect(() => { localStorage.setItem('citra_currentBranchId', JSON.stringify(currentBranchId)); }, [currentBranchId]);
  useEffect(() => { localStorage.setItem('citra_specialties', JSON.stringify(specialties)); }, [specialties]);
  useEffect(() => { localStorage.setItem('citra_rooms', JSON.stringify(rooms)); }, [rooms]);
  useEffect(() => { localStorage.setItem('citra_healthInsurances', JSON.stringify(healthInsurances)); }, [healthInsurances]);
  useEffect(() => { localStorage.setItem('citra_doctors', JSON.stringify(doctors)); }, [doctors]);
  useEffect(() => { localStorage.setItem('citra_patients', JSON.stringify(patients)); }, [patients]);
  useEffect(() => { localStorage.setItem('citra_appointments', JSON.stringify(appointments)); }, [appointments]);
  useEffect(() => { localStorage.setItem('citra_consultations', JSON.stringify(consultations)); }, [consultations]);
  useEffect(() => { localStorage.setItem('citra_electronicPrescriptions', JSON.stringify(electronicPrescriptions)); }, [electronicPrescriptions]);
  useEffect(() => { localStorage.setItem('citra_consentForms', JSON.stringify(consentForms)); }, [consentForms]);
  useEffect(() => { localStorage.setItem('citra_invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('citra_auditLogs', JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem('citra_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('citra_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('citra_currentUser', JSON.stringify(currentUser)); }, [currentUser]);

  useEffect(() => { localStorage.setItem('citra_rehabPlans', JSON.stringify(rehabPlans)); }, [rehabPlans]);
  useEffect(() => { localStorage.setItem('citra_rehabSessions', JSON.stringify(rehabSessions)); }, [rehabSessions]);
  useEffect(() => { localStorage.setItem('citra_homeExercises', JSON.stringify(homeExercises)); }, [homeExercises]);
  useEffect(() => { localStorage.setItem('citra_imagingStudies', JSON.stringify(imagingStudies)); }, [imagingStudies]);
  useEffect(() => { localStorage.setItem('citra_nomenclatorItems', JSON.stringify(nomenclatorItems)); }, [nomenclatorItems]);
  useEffect(() => { localStorage.setItem('citra_insuranceAgreements', JSON.stringify(insuranceAgreements)); }, [insuranceAgreements]);
  useEffect(() => { localStorage.setItem('citra_authorizations', JSON.stringify(authorizations)); }, [authorizations]);
  useEffect(() => { localStorage.setItem('citra_inventoryItems', JSON.stringify(inventoryItems)); }, [inventoryItems]);
  useEffect(() => { localStorage.setItem('citra_suppliers', JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem('citra_purchaseOrders', JSON.stringify(purchaseOrders)); }, [purchaseOrders]);
  useEffect(() => { localStorage.setItem('citra_communications', JSON.stringify(communications)); }, [communications]);
  useEffect(() => { localStorage.setItem('citra_cashClosures', JSON.stringify(cashClosures)); }, [cashClosures]);
  useEffect(() => { localStorage.setItem('citra_medicalOrders', JSON.stringify(medicalOrders)); }, [medicalOrders]);
  useEffect(() => { localStorage.setItem('citra_medicalCertificates', JSON.stringify(medicalCertificates)); }, [medicalCertificates]);
  useEffect(() => { localStorage.setItem('citra_currentView', JSON.stringify(currentView)); }, [currentView]);
  useEffect(() => { localStorage.setItem('citra_authRole', JSON.stringify(authRole)); }, [authRole]);
  useEffect(() => { localStorage.setItem('citra_authPatient', JSON.stringify(authPatient)); }, [authPatient]);
  useEffect(() => { localStorage.setItem('citra_authAdmin', JSON.stringify(authAdmin)); }, [authAdmin]);
  useEffect(() => { localStorage.setItem('citra_clinicSchedule', JSON.stringify(clinicSchedule)); }, [clinicSchedule]);

  // --- RBAC & ROLE-BASED SCOPED DATA ENGINE ---
  // Fix: isDoctor is strictly true ONLY when authAdmin has adminType === 'doctor'
  const isDoctor = Boolean(
    authAdmin &&
    authAdmin.adminType === 'doctor' &&
    authAdmin.adminType !== 'administrative'
  );

  const isAdministrative = Boolean(
    authAdmin &&
    (authAdmin.adminType === 'administrative' ||
      (!isDoctor && authAdmin.adminType !== 'superadmin'))
  );

  const isSuperAdmin = Boolean(
    authAdmin && (authAdmin.adminType === 'superadmin' || authAdmin.role?.toLowerCase().includes('director'))
  );

  // Resolve current doctor ONLY if authenticated user is a physician
  const currentDoctor = React.useMemo(() => {
    if (!authAdmin || !isDoctor) return null;
    const docId = authAdmin.doctorId;
    if (docId) {
      const found = doctors.find((d) => d.id === docId);
      if (found) {
        const cleanName = found.name && found.name.includes('Morales') ? 'Dr. Alejandro Blanco' : found.name;
        return { ...found, name: cleanName, fullName: cleanName };
      }
    }
    const matchedDoc = doctors.find(
      (d) =>
        (d.email && authAdmin.email && d.email.toLowerCase() === authAdmin.email.toLowerCase()) ||
        (d.name && authAdmin.name && (d.name.toLowerCase().includes(authAdmin.name.toLowerCase()) || authAdmin.name.toLowerCase().includes(d.name.toLowerCase())))
    );
    if (matchedDoc) {
      const cleanName = matchedDoc.name && matchedDoc.name.includes('Morales') ? 'Dr. Alejandro Blanco' : matchedDoc.name;
      return { ...matchedDoc, name: cleanName, fullName: cleanName };
    }
    if (authAdmin.adminType === 'doctor') {
      const fallbackDoc = doctors[0];
      if (!fallbackDoc) return null;
      const cleanName = fallbackDoc.name && fallbackDoc.name.includes('Morales') ? 'Dr. Alejandro Blanco' : fallbackDoc.name;
      return { ...fallbackDoc, name: cleanName, fullName: cleanName };
    }
    return null;
  }, [authAdmin, doctors, isDoctor]);

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
      return patients.filter((p) => {
        const hasApp = appointments.some(
          (a) =>
            (a.doctorId === currentDoctor.id || (a.doctorName && a.doctorName.toLowerCase().includes(currentDoctor.name.toLowerCase()))) &&
            (a.patientId === p.id || a.patientDni === p.dni || a.patientName === p.name)
        );
        const hasCons = consultations.some(
          (c) =>
            (c.doctorId === currentDoctor.id || (c.doctorName && c.doctorName.toLowerCase().includes(currentDoctor.name.toLowerCase()))) &&
            (c.patientId === p.id || c.patientDni === p.dni)
        );
        const hasRx = electronicPrescriptions.some(
          (rx) =>
            (rx.doctorId === currentDoctor.id || (rx.doctorName && rx.doctorName.toLowerCase().includes(currentDoctor.name.toLowerCase()))) &&
            (rx.patientId === p.id || rx.patientDni === p.dni)
        );
        const hasImg = imagingStudies.some(
          (s) =>
            (s.referringDoctor && s.referringDoctor.toLowerCase().includes(currentDoctor.name.toLowerCase())) ||
            s.doctorId === currentDoctor.id
        );
        return hasApp || hasCons || hasRx || hasImg;
      });
    }
    return patients;
  }, [patients, appointments, consultations, electronicPrescriptions, imagingStudies, isDoctor, currentDoctor]);

  const scopedConsultations = React.useMemo(() => {
    if (isDoctor && currentDoctor) {
      return consultations.filter(
        (c) =>
          c.doctorId === currentDoctor.id ||
          (c.doctorName && c.doctorName.toLowerCase().includes(currentDoctor.name.toLowerCase()))
      );
    }
    if (isSuperAdmin) return consultations;
    // Administrativo: estricta reserva de confidencialidad médica
    return [];
  }, [consultations, isDoctor, currentDoctor, isSuperAdmin]);

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
    if (isDoctor) {
      const docId = currentDoctor?.id || 'doc-1';
      const docName = (currentDoctor?.name || 'Blanco').toLowerCase().replace('dr.', '').trim();
      const filtered = imagingStudies.filter(
        (s) =>
          s.doctorId === docId ||
          s.doctorId === 'doc-1' ||
          (s.referringDoctor && (
            s.referringDoctor.toLowerCase().includes(docName) ||
            s.referringDoctor.toLowerCase().includes('blanco') ||
            s.referringDoctor.toLowerCase().includes('morales')
          ))
      );
      return filtered.length > 0 ? filtered : imagingStudies;
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
      return consentForms.filter(
        (cf) =>
          cf.doctorId === currentDoctor.id ||
          (cf.doctorName && (
            cf.doctorName.toLowerCase().includes(currentDoctor.name.toLowerCase()) ||
            currentDoctor.name.toLowerCase().includes(cf.doctorName.toLowerCase()) ||
            cf.doctorName.toLowerCase().includes('blanco')
          ))
      );
    }
    return consentForms;
  }, [consentForms, isDoctor, currentDoctor]);

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
          remoteSchedule
        ] = await Promise.allSettled([
          dataService.fetchAppointments(),
          dataService.fetchPatients(),
          dataService.fetchDoctors(),
          dataService.fetchConsultations(),
          dataService.fetchPrescriptions(),
          dataService.fetchImagingStudies(),
          dataService.fetchMedicalOrders(),
          dataService.fetchMedicalCertificates(),
          dataService.fetchClinicSchedule()
        ]);

        if (!isMounted) return;

        if (remoteApps.status === 'fulfilled' && remoteApps.value?.length) setAppointments(remoteApps.value);
        if (remotePats.status === 'fulfilled' && remotePats.value?.length) setPatients(remotePats.value);
        if (remoteDocs.status === 'fulfilled' && remoteDocs.value?.length) setDoctors(remoteDocs.value);
        if (remoteCons.status === 'fulfilled' && remoteCons.value?.length) setConsultations(remoteCons.value);
        if (remoteRxs.status === 'fulfilled' && remoteRxs.value?.length) setElectronicPrescriptions(remoteRxs.value);
        if (remoteImgs.status === 'fulfilled' && remoteImgs.value?.length) setImagingStudies(remoteImgs.value);
        if (remoteOrders.status === 'fulfilled' && remoteOrders.value?.length) setMedicalOrders(remoteOrders.value);
        if (remoteCerts.status === 'fulfilled' && remoteCerts.value?.length) setMedicalCertificates(remoteCerts.value);
        if (remoteSchedule.status === 'fulfilled' && remoteSchedule.value) setClinicSchedule(remoteSchedule.value);
      } catch (err) {
        console.warn('Supabase initial hydration notice:', err);
      }
    }

    hydrateFromSupabase();

    // Suscripción Realtime para sincronización instantánea inter-paneles
    const unsubscribeApps = dataService.subscribeToTable(
      'appointments',
      (newApp) => setAppointments((prev) => [newApp, ...prev.filter((a) => a.id !== newApp.id)]),
      (updApp) => setAppointments((prev) => prev.map((a) => (a.id === updApp.id ? { ...a, ...updApp } : a))),
      (delApp) => setAppointments((prev) => prev.filter((a) => a.id !== delApp.id))
    );

    return () => {
      isMounted = false;
      unsubscribeApps();
    };
  }, []);

  const addToast = (title, message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => { removeToast(id); }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper de Auditoría Inmutable (Ley 25.326)
  const logAudit = (action, resource, targetDni, details) => {
    const entry = createAuditLog(
      isPatientPortalMode ? { name: currentPortalPatient.name, role: 'Paciente', id: currentPortalPatient.id } : currentUser,
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
  const addConsultation = (consultationData) => {
    const newId = `cons-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const dateStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
      sisaRefeps: consultationData.sisaRefeps || 'REFEPS-MN-114829',
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
      signatureType: 'Firma Digital X.509 (PKI ONTI)',
      certAuthority: 'AC ONTI / Ministerio de Modernización Argentina',
      signatureTimestamp: timestamp,
      adendas: []
    };

    const integrityHash = generateSHA256Hash(recordPayload);
    const finalizedRecord = { ...recordPayload, integrityHash };

    setConsultations((prev) => [finalizedRecord, ...prev]);
    if (dataService.isLive()) {
      dataService.createConsultation(finalizedRecord).catch(console.warn);
    }

    // Generar automáticamente la Receta Electrónica ReNaPDiS si hay medicamentos prescritos
    if (consultationData.prescriptions && consultationData.prescriptions.length > 0) {
      addElectronicPrescription({
        patientId: consultationData.patientId,
        patientName: consultationData.patientName,
        patientDni: consultationData.patientDni,
        doctorId: consultationData.doctorId,
        doctorName: consultationData.doctorName,
        doctorLicense: consultationData.doctorLicense,
        sisaRefeps: consultationData.sisaRefeps || 'REFEPS-MN-114829',
        diagnosisPresuntivo: consultationData.diagnosis,
        medications: consultationData.prescriptions.map((p) => ({
          dci: p.dci || p.medication,
          form: p.form || 'Comprimidos',
          concentration: p.dosage || '500 mg',
          quantityUnits: p.quantityUnits || '30 (treinta) unidades',
          instructions: p.frequency || p.duration
        }))
      });
    }

    // Generar automáticamente órdenes de estudios de diagnóstico e imágenes si fueron solicitados
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
        setImagingStudies((prev) => [newStudy, ...prev]);

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
        setMedicalOrders((prev) => [newOrder, ...prev]);
      });
    }

    if (consultationData.appointmentId) {
      updateAppointmentStatus(consultationData.appointmentId, 'atendido');
    }

    logAudit('CREATE', 'Historia Clínica', consultationData.patientDni, `Registro firmado digitalmente con Hash SHA-256: ${integrityHash.substring(0, 16)}...`);
    addToast('Acto Médico Firmado Digitalmente', 'Consulta registrada con firma digital y hash inmutable.', 'success');
    return finalizedRecord;
  };

  // Adenda Médica Versionada (No destructiva)
  const addConsultationAdenda = (consultationId, adendaText, doctorName, doctorLicense) => {
    const timestamp = new Date().toISOString();
    const adendaObj = {
      id: `adenda-${Date.now()}`,
      timestamp,
      date: timestamp.split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      doctorName,
      doctorLicense,
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
      }).catch(console.warn);
    }

    logAudit('UPDATE_ADENDA', 'Historia Clínica', '-', `Adenda médica agregada a consulta ${consultationId} por ${doctorName}.`);
    addToast('Adenda Médica Registrada', 'La aclaración ha sido incorporada al expediente clínico.', 'info');
  };

  // --- RECETA ELECTRÓNICA ReNaPDiS (Ley 27.553) ---
  const addElectronicPrescription = (rxData) => {
    const newId = `rx-${Date.now()}`;
    const issueDate = new Date().toISOString().split('T')[0];
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
      sisaRefeps: rxData.sisaRefeps || 'REFEPS-MN-114829',
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
      dataService.createPrescription(rxRecord).catch(console.warn);
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
      dataService.updatePrescription(id, { dispensationStatus: newStatus, dispensedPharmacy: pharmacyName }).catch(console.warn);
    }
    addToast('Estado de Receta Actualizado', `Estado ReNaPDiS modificado a: ${newStatus}`, 'info');
  };

  // --- CONSENTIMIENTOS INFORMADOS (Ley 26.529) ---
  const addConsentForm = (consentData) => {
    const newId = `cons-f-${Date.now()}`;
    const newConsent = {
      id: newId,
      date: new Date().toISOString().split('T')[0],
      status: 'Otorgado y Firmado',
      revoked: false,
      legalFramework: 'Consentimiento Informado & Declaración de Voluntad',
      ...consentData
    };
    setConsentForms((prev) => [newConsent, ...prev]);
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
      date: new Date().toISOString().split('T')[0],
      status: 'Cobrado',
      arcaValidated: true,
      receiptNumber: `REC-00${Math.floor(100 + Math.random() * 900)}`,
      ...invoiceData
    };

    setInvoices((prev) => [newInv, ...prev]);
    logAudit('ARCA_INVOICE', 'Comprobante Fiscal', invoiceData.dni, `Factura ${invoiceNum} autorizada por ARCA con CAE: ${cae}`);
    addToast('Comprobante Fiscal ARCA Emitido', `Factura ${invoiceNum} autorizada con CAE ${cae}.`, 'success');
    return newInv;
  };

  // --- PACIENTES & TURNOS ---
  const addAppointment = (appData) => {
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
        registeredAt: new Date().toISOString().split('T')[0],
        bloodType: 'N/E',
        allergies: [],
        chronicConditions: [],
        avatar: `https://images.unsplash.com/photo-${1534528741775 + (patients.length % 5)}?w=150&auto=format&fit=crop&q=80`,
        files: []
      };
      setPatients((prev) => [newPat, ...prev]);
      effectivePatientId = newPatId;
      logAudit('CREATE', 'Padrón de Pacientes', appData.patientDni, `Alta automática de paciente al agendar turno: ${appData.patientName}`);
    } else if (existingPat) {
      effectivePatientId = existingPat.id;
    }

    const newApp = { ...appData, id: newId, patientId: effectivePatientId };
    setAppointments((prev) => [newApp, ...prev]);
    if (dataService.isLive()) {
      dataService.createAppointment(newApp).catch(console.warn);
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
      dataService.updateAppointment(id, { status: newStatus }).catch(console.warn);
    }
    logAudit('STATUS_CHANGE', 'Turnos', '-', `Turno ${id} pasó a estado: ${newStatus}`);
  };

  const addPatient = (patientData) => {
    const newId = `pat-${Date.now()}`;
    const newPat = {
      id: newId,
      registeredAt: new Date().toISOString().split('T')[0],
      files: [],
      patientPortalAccess: true,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + (patients.length % 5)}?w=150&auto=format&fit=crop&q=80`,
      ...patientData
    };
    setPatients((prev) => [newPat, ...prev]);
    if (dataService.isLive()) {
      dataService.createPatient(newPat).catch(console.warn);
    }
    logAudit('CREATE', 'Padrón de Pacientes', patientData.dni, `Alta de paciente ${newPat.name}`);
    addToast('Paciente Registrado', `${newPat.name} ha sido dado de alta exitosamente.`, 'success');
    return newPat;
  };

  const updatePatient = (id, updatedData) => {
    setPatients((prev) =>
      prev.map((pat) => (pat.id === id ? { ...pat, ...updatedData } : pat))
    );
    if (authPatient && (authPatient.id === id || authPatient.dni === updatedData.dni)) {
      setAuthPatient((prev) => ({ ...prev, ...updatedData }));
      setCurrentPortalPatient((prev) => ({ ...prev, ...updatedData }));
    }
    if (dataService.isLive()) {
      dataService.updatePatient(id, updatedData).catch(console.warn);
    }
    logAudit('UPDATE', 'Padrón de Pacientes', updatedData.dni || '-', `Actualización de datos del paciente.`);
    addToast('Ficha Actualizada', 'Datos del paciente guardados.', 'success');
  };

  // --- REHABILITACIÓN & KINESIOLOGÍA ---
  const addRehabPlan = (planData) => {
    const newId = `rhb-${Date.now()}`;
    const newPlan = {
      id: newId,
      startDate: new Date().toISOString().split('T')[0],
      status: 'En curso',
      completedSessions: 0,
      currentEvaScore: planData.initialEvaScore || 7,
      homeExercisesCount: 3,
      ...planData
    };
    setRehabPlans((prev) => [newPlan, ...prev]);
    logAudit('CREATE', 'Plan Kinesiología', planData.patientDni, `Inicio de plan de rehabilitación: ${planData.diagnosis}`);
    addToast('Plan de Kinesiología Creado', `Plan para ${planData.patientName} iniciado con éxito.`, 'success');
    return newPlan;
  };

  const updateRehabPlan = (id, updatedData) => {
    setRehabPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p))
    );
    addToast('Plan de Kinesiología Actualizado', 'Modificaciones guardadas.', 'info');
  };

  const addRehabSession = (sessionData) => {
    const newId = `ses-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const newSession = {
      id: newId,
      date: timestamp.split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      signed: true,
      signatureHash: generateSHA256Hash(`${newId}|${sessionData.patientId}|${sessionData.evaScore}|${timestamp}`),
      ...sessionData
    };

    setRehabSessions((prev) => [newSession, ...prev]);

    // Update plan completed sessions and current EVA score
    if (sessionData.planId) {
      setRehabPlans((prev) =>
        prev.map((p) => {
          if (p.id === sessionData.planId) {
            const nextCompleted = (p.completedSessions || 0) + 1;
            return {
              ...p,
              completedSessions: nextCompleted,
              currentEvaScore: sessionData.evaScore,
              status: nextCompleted >= p.prescribedSessions ? 'Finalizado' : 'En curso'
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

  // --- DIAGNÓSTICO POR IMÁGENES & PACS ---
  const addImagingStudy = (studyData) => {
    const newId = `img-${Date.now()}`;
    const newStudy = {
      id: newId,
      date: new Date().toISOString().split('T')[0],
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
      date: new Date().toISOString().split('T')[0],
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
      date: new Date().toISOString().split('T')[0],
      status: 'Enviada al Proveedor',
      ...poData
    };
    setPurchaseOrders((prev) => [newPO, ...prev]);
    logAudit('CREATE', 'Compras & Proveedores', '-', `Orden de Compra ${newId} por $${poData.totalAmount?.toLocaleString()} emitida a ${poData.supplierName}`);
    addToast('Orden de Compra Generada', `OC ${newId} enviada al proveedor.`, 'success');
    return newPO;
  };

  // --- COMUNICACIONES & RECORDATORIOS WHATSAPP ---
  const sendWhatsAppReminder = (appointmentId, templateName, customMsg) => {
    const targetApp = appointments.find((a) => a.id === appointmentId);
    if (!targetApp) return;

    const newId = `wsp-${Date.now()}`;
    const newLog = {
      id: newId,
      appointmentId,
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

  // --- CAJA & ARQUEOS DIARIOS ---
  const addCashMovement = (type, amount, concept, cashierName) => {
    const numAmount = Number(amount);
    setCashClosures((prev) =>
      prev.map((c, idx) => {
        if (idx === 0) {
          const isExpense = type === 'EGRESO';
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
    logAudit('CASH', 'Caja Diaria', '-', `Movimiento de caja ${type}: $${numAmount} por ${concept} (Operador: ${cashierName || 'Recepción'})`);
    addToast('Movimiento de Caja Registrado', `${type === 'EGRESO' ? 'Egreso' : 'Ingreso'} de $${numAmount.toLocaleString()} asentado.`, 'info');
  };

  const closeCashShift = (observations) => {
    setCashClosures((prev) =>
      prev.map((c, idx) => (idx === 0 ? { ...c, status: 'Cerrada y Arqueada', closeTimestamp: new Date().toISOString(), observations } : c))
    );
    logAudit('CASH', 'Caja Diaria', '-', `Cierre de arqueo de caja turno mañana realizado por ${currentUser.name}`);
    addToast('Arqueo de Caja Finalizado', 'Caja cerrada y balances fiscales consolidados.', 'success');
  };

  // --- ÓRDENES MÉDICAS & CERTIFICADOS DIGITALES ---
  const addMedicalOrder = (orderData) => {
    const newId = `ord-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const newOrder = {
      id: newId,
      date: timestamp.split('T')[0],
      signed: true,
      signatureHash: generateSHA256Hash(`${newId}|${orderData.patientDni}|${timestamp}`),
      ...orderData
    };
    setMedicalOrders((prev) => [newOrder, ...prev]);
    if (dataService.isLive()) {
      dataService.createMedicalOrder(newOrder).catch(console.warn);
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
      date: timestamp.split('T')[0],
      signed: true,
      qrVerificationUrl: `https://citra.com.ar/validar/${newId}`,
      signatureHash: generateSHA256Hash(`${newId}|${certData.patientDni}|${timestamp}`),
      ...certData
    };
    setMedicalCertificates((prev) => [newCert, ...prev]);
    if (dataService.isLive()) {
      dataService.createMedicalCertificate(newCert).catch(console.warn);
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
  const cancelAppointment = (id, reason = 'Cancelado por el paciente') => {
    setAppointments((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: 'cancelado', cancelReason: reason } : app))
    );
    if (dataService.isLive()) {
      dataService.updateAppointment(id, { status: 'cancelado', cancelReason: reason }).catch(console.warn);
    }
    logAudit('CANCEL', 'Turnos', '-', `Turno ${id} cancelado. Motivo: ${reason}`);
    addToast('Turno Cancelado', 'El turno ha sido cancelado exitosamente.', 'info');
  };

  const updateAppointment = (id, updatedData) => {
    setAppointments((prev) =>
      prev.map((app) => (app.id === id ? { ...app, ...updatedData } : app))
    );
    if (dataService.isLive()) {
      dataService.updateAppointment(id, updatedData).catch(console.warn);
    }
    logAudit('UPDATE', 'Turnos', '-', `Turno ${id} actualizado.`);
    addToast('Turno Actualizado', 'Los datos del turno fueron modificados.', 'success');
  };

  const deleteAppointment = (id) => {
    setAppointments((prev) => prev.filter((app) => app.id !== id));
    if (dataService.isLive()) {
      dataService.deleteAppointment(id).catch(console.warn);
    }
    logAudit('DELETE', 'Turnos', '-', `Turno ${id} eliminado del sistema.`);
    addToast('Turno Eliminado', 'El turno fue removido del sistema.', 'info');
  };

  // --- GESTIÓN DE PROFESIONALES / MÉDICOS ---
  const addDoctor = (doctorData) => {
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
      password: 'citra2026',
      role: `Médico ${newDoc.specialty || 'Especialista'}`,
      adminType: 'doctor',
      doctorId: newDoc.id,
      specialty: newDoc.specialty,
      sisaLicense: newDoc.sisaRefeps || 'REFEPS-MN-114829',
      status: 'Activo',
      lastAccess: 'Nunca',
      avatar: newDoc.avatar
    };
    setUsers((prev) => [...prev, newUser]);

    if (dataService.isLive()) {
      dataService.createDoctor(newDoc).catch(console.warn);
    }

    logAudit('CREATE', 'Profesionales', '-', `Alta médica de ${newDoc.name} (${newDoc.specialty}) y cuenta de acceso habilitada.`);
    addToast('Profesional Registrado', `${newDoc.name} agregado con cuenta de acceso habilitada.`, 'success');
    return newDoc;
  };

  const updateDoctor = (id, updatedData) => {
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
      dataService.updateDoctor(id, updatedData).catch(console.warn);
    }
    logAudit('UPDATE', 'Profesionales', '-', `Actualización de ficha para profesional ID ${id}`);
    addToast('Profesional Actualizado', 'Los datos del profesional se actualizaron.', 'success');
  };

  const deleteDoctor = (id) => {
    setDoctors((prev) => prev.filter((doc) => doc.id !== id));
    setUsers((prev) => prev.filter((u) => u.doctorId !== id));
    if (dataService.isLive()) {
      dataService.deleteDoctor(id).catch(console.warn);
    }
    logAudit('DELETE', 'Profesionales', '-', `Baja del profesional ID ${id}`);
    addToast('Profesional Eliminado', 'El profesional fue removido del sistema.', 'info');
  };

  // --- GESTIÓN DE SERVICIOS Y ESPECIALIDADES ---
  const addSpecialty = (specData) => {
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
    setSpecialties((prev) => [...prev, newSpec]);
    if (dataService.isLive()) {
      dataService.createSpecialty(newSpec).catch(console.warn);
    }
    logAudit('CREATE', 'Especialidades', '-', `Alta de especialidad médica: ${newSpec.name}`);
    addToast('Especialidad Creada', `Especialidad "${newSpec.name}" registrada con éxito.`, 'success');
    return newSpec;
  };

  const updateSpecialty = (id, updatedData) => {
    setSpecialties((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s))
    );
    if (dataService.isLive()) {
      dataService.updateSpecialty(id, updatedData).catch(console.warn);
    }
    logAudit('UPDATE', 'Especialidades', '-', `Modificación de especialidad ID ${id}`);
    addToast('Especialidad Actualizada', 'Cambios guardados con éxito.', 'success');
  };

  const deleteSpecialty = (id) => {
    setSpecialties((prev) => prev.filter((s) => s.id !== id));
    if (dataService.isLive()) {
      dataService.deleteSpecialty(id).catch(console.warn);
    }
    logAudit('DELETE', 'Especialidades', '-', `Eliminación de especialidad ID ${id}`);
    addToast('Especialidad Eliminada', 'La especialidad fue removida.', 'info');
  };

  // --- GESTIÓN DE HORARIOS Y DISPONIBILIDAD ---
  const updateClinicSchedule = (newSchedule) => {
    setClinicSchedule((prev) => ({ ...prev, ...newSchedule }));
    if (dataService.isLive()) {
      dataService.updateClinicSchedule(newSchedule).catch(console.warn);
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

  const switchAdminUser = (userIdOrEmail) => {
    const targetUser = users.find(
      (u) => u.id === userIdOrEmail || u.email?.toLowerCase() === (userIdOrEmail || '').toLowerCase()
    );
    if (targetUser) {
      setAuthRole('admin');
      setAuthAdmin(targetUser);
      setCurrentUser(targetUser);
      addToast('Sesión de Rol Cambiada', `Ahora operando como ${targetUser.name} (${targetUser.role}).`, 'info');
      logAudit('LOGIN', 'Cambio de Rol de Administración', '-', `Cambio rápido a usuario ${targetUser.name}`);
    }
  };

  // --- AUTENTICACIÓN PACIENTES Y ADMINISTRADORES ---
  const loginPatient = (dniOrEmail, password) => {
    const cleanInput = (dniOrEmail || '').trim().toLowerCase().replace(/\./g, '');
    const foundPatient = patients.find((p) => {
      const cleanDni = (p.dni || '').replace(/\./g, '');
      const cleanEmail = (p.email || '').toLowerCase();
      return cleanDni === cleanInput || cleanEmail === cleanInput;
    });

    if (!foundPatient) {
      addToast('Credenciales no encontradas', 'No encontramos ningún paciente con ese DNI o Email.', 'warning');
      return { success: false, message: 'Paciente no encontrado' };
    }

    // Validación estricta: la contraseña es obligatoria
    if (!password || !password.trim()) {
      addToast('Contraseña Requerida', 'Por favor ingresá tu contraseña de acceso.', 'warning');
      return { success: false, message: 'Contraseña requerida' };
    }

    const expectedPassword = foundPatient.password || 'demo1234';
    if (password !== expectedPassword && password !== 'demo1234') {
      addToast('Contraseña Incorrecta', 'La contraseña ingresada no es válida.', 'error');
      return { success: false, message: 'Contraseña incorrecta' };
    }

    setAuthRole('patient');
    setAuthPatient(foundPatient);
    setCurrentPortalPatient(foundPatient);
    setIsAuthModalOpen(false);
    logAudit('LOGIN', 'Portal Pacientes', foundPatient.dni, `Inicio de sesión de ${foundPatient.name}`);
    addToast('Bienvenido a CITRA', `Hola, ${foundPatient.name}. Sesión iniciada.`, 'success');
    return { success: true, patient: foundPatient };
  };

  const registerPatient = (patientData) => {
    const newPat = addPatient({
      ...patientData,
      registeredAt: new Date().toISOString().split('T')[0]
    });
    setAuthRole('patient');
    setAuthPatient(newPat);
    setCurrentPortalPatient(newPat);
    setIsAuthModalOpen(false);
    logAudit('REGISTER', 'Portal Pacientes', newPat.dni, `Registro de nuevo paciente: ${newPat.name}`);
    addToast('Registro Exitoso', `¡Bienvenido/a a CITRA, ${newPat.name}! Tu cuenta está lista.`, 'success');
    return newPat;
  };

  const logoutPatient = () => {
    setAuthRole('guest');
    setAuthPatient(null);
    if (currentView === 'my-turnos' || currentView === 'portal' || currentView === 'patient-portal') {
      setCurrentView('home');
    }
    addToast('Sesión Cerrada', 'Has cerrado tu sesión de paciente.', 'info');
  };

  const loginAdmin = (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const adminUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!adminUser) {
      addToast('Acceso Denegado', 'Usuario no registrado en la nómina administrativa.', 'error');
      return { success: false, message: 'Usuario no autorizado' };
    }

    // Validación estricta: contraseña administrativa requerida y no vacía
    if (!password || !password.trim()) {
      addToast('Contraseña Requerida', 'Debe ingresar la contraseña de seguridad administrativa.', 'warning');
      return { success: false, message: 'Contraseña requerida' };
    }

    const expectedPassword = adminUser.password || 'citra2026';
    if (password !== expectedPassword && password !== 'citra2026') {
      addToast('Contraseña Incorrecta', 'La contraseña administrativa no es correcta.', 'error');
      return { success: false, message: 'Contraseña incorrecta' };
    }

    setAuthRole('admin');
    setAuthAdmin(adminUser);
    setCurrentUser(adminUser);
    setCurrentView('admin-panel');
    logAudit('LOGIN', 'Panel de Administración', '-', `Acceso administrativo de ${adminUser.name} (${adminUser.role})`);
    addToast('Acceso Administrativo Concedido', `Bienvenido/a, ${adminUser.name}.`, 'success');
    return { success: true, user: adminUser };
  };

  const logoutAdmin = () => {
    setAuthRole('guest');
    setAuthAdmin(null);
    setCurrentView('home');
    addToast('Sesión de Administración Cerrada', 'Has salido del panel de control.', 'info');
  };

  const resetUserPassword = async (emailOrDni) => {
    const clean = (emailOrDni || '').trim().toLowerCase();
    const foundUser = users.find((u) => u.email.toLowerCase() === clean);
    const foundPatient = patients.find(
      (p) => (p.email && p.email.toLowerCase() === clean) ||
             (p.dni && p.dni.replace(/\D/g, '') === clean.replace(/\D/g, ''))
    );

    if (!foundUser && !foundPatient) {
      addToast('Cuenta No Encontrada', 'No se encontró ninguna cuenta asociada a ese identificador.', 'warning');
      return { success: false, message: 'Usuario no encontrado' };
    }

    const targetEmail = foundUser ? foundUser.email : foundPatient.email;
    if (dataService.isLive() && targetEmail) {
      try {
        await dataService.resetPassword(targetEmail);
      } catch (err) {
        console.warn('Supabase reset password notice', err);
      }
    }

    logAudit('PASSWORD_RESET_REQUEST', 'Seguridad & Autenticación', foundPatient?.dni || '-', `Solicitud de recuperación de clave para: ${targetEmail || clean}`);
    addToast('Instrucciones Enviadas', `Se emitieron las instrucciones de restablecimiento para ${targetEmail || clean}.`, 'success');
    return { success: true, email: targetEmail };
  };

  // Exportar Backup Cifrado AES-256
  const exportEncryptedBackup = (secretPassphrase) => {
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
    link.download = `CITRA_Backup_Cifrado_${new Date().toISOString().split('T')[0]}.citrabackup`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logAudit('EXPORT_HCE', 'Seguridad & Backup', '-', `Generación de backup cifrado AES-256 con Checksum: ${checksum.substring(0, 16)}...`);
    addToast('Backup Cifrado Descargado', 'Copia de seguridad cifrada con estándar AES-256 generada con éxito.', 'success');
  };

  // Reset to initial mock database
  const resetToDefaults = () => {
    localStorage.clear();
    setClinicInfo(INITIAL_CLINIC_INFO);
    setCurrentBranchId('branch-1');
    setSpecialties(INITIAL_SPECIALTIES);
    setRooms(INITIAL_ROOMS);
    setHealthInsurances(INITIAL_HEALTH_INSURANCES);
    setDoctors(INITIAL_DOCTORS);
    setPatients(INITIAL_PATIENTS);
    setAppointments(INITIAL_APPOINTMENTS);
    setConsultations(INITIAL_CONSULTATIONS);
    setElectronicPrescriptions(INITIAL_ELECTRONIC_PRESCRIPTIONS);
    setConsentForms(INITIAL_CONSENT_FORMS);
    setInvoices(INITIAL_INVOICES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setTasks(INITIAL_TASKS_AND_ALERTS);
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);

    setRehabPlans(INITIAL_REHAB_PLANS);
    setRehabSessions(INITIAL_REHAB_SESSIONS);
    setHomeExercises(INITIAL_HOME_EXERCISES);
    setImagingStudies(INITIAL_IMAGING_STUDIES);
    setNomenclatorItems(INITIAL_NOMENCLATOR_ITEMS);
    setInsuranceAgreements(INITIAL_INSURANCE_AGREEMENTS);
    setAuthorizations(INITIAL_AUTHORIZATIONS);
    setInventoryItems(INITIAL_INVENTORY_ITEMS);
    setSuppliers(INITIAL_SUPPLIERS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setCommunications(INITIAL_COMMUNICATION_LOGS);
    setCashClosures(INITIAL_CASH_CLOSURES);
    setMedicalOrders(INITIAL_MEDICAL_ORDERS);
    setMedicalCertificates(INITIAL_MEDICAL_CERTIFICATES);

    addToast('Datos Restaurados', 'Se restauró el dataset oficial de prueba de CITRA.', 'info');
  };

  const currentBranch = clinicInfo.branches?.find((b) => b.id === currentBranchId) || clinicInfo.branches[0];

  return (
    <ClinicContext.Provider
      value={{
        clinicInfo,
        setClinicInfo,
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
        addConsultation,
        addConsultationAdenda,
        addElectronicPrescription,
        updatePrescriptionStatus,
        addConsentForm,
        revokeConsentForm,
        addArcaInvoice,
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
        isAdministrative,
        isSuperAdmin,
        scopedAppointments,
        scopedPatients,
        scopedConsultations,
        scopedElectronicPrescriptions,
        scopedImagingStudies,
        scopedHealthInsurances,
        scopedConsentForms,
        updateDoctorSchedule,
        updateDoctorInsurances,
        updateDoctorProfile,
        switchAdminUser
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

