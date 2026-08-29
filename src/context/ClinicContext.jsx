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
import { generateSHA256Hash, createAuditLog, encryptDataAES, decryptDataAES } from '../utils/cryptoAudit';
import { generateCUIR, calculatePrescriptionExpiration } from '../utils/renapdisEngine';
import { generateCAE } from '../utils/arcaValidator';

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
  const [doctors, setDoctors] = useState(() => loadStorage('doctors', INITIAL_DOCTORS));
  const [patients, setPatients] = useState(() => loadStorage('patients', INITIAL_PATIENTS));
  const [appointments, setAppointments] = useState(() => loadStorage('appointments', INITIAL_APPOINTMENTS));
  const [consultations, setConsultations] = useState(() => loadStorage('consultations', INITIAL_CONSULTATIONS));
  const [electronicPrescriptions, setElectronicPrescriptions] = useState(() => loadStorage('electronicPrescriptions', INITIAL_ELECTRONIC_PRESCRIPTIONS));
  const [consentForms, setConsentForms] = useState(() => loadStorage('consentForms', INITIAL_CONSENT_FORMS));
  const [invoices, setInvoices] = useState(() => loadStorage('invoices', INITIAL_INVOICES));
  const [auditLogs, setAuditLogs] = useState(() => loadStorage('auditLogs', INITIAL_AUDIT_LOGS));
  const [tasks, setTasks] = useState(() => loadStorage('tasks', INITIAL_TASKS_AND_ALERTS));
  const [users, setUsers] = useState(() => loadStorage('users', INITIAL_USERS));
  const [currentUser, setCurrentUser] = useState(() => loadStorage('currentUser', INITIAL_USERS[0]));

  // New modules state
  const [rehabPlans, setRehabPlans] = useState(() => loadStorage('rehabPlans', INITIAL_REHAB_PLANS));
  const [rehabSessions, setRehabSessions] = useState(() => loadStorage('rehabSessions', INITIAL_REHAB_SESSIONS));
  const [homeExercises, setHomeExercises] = useState(() => loadStorage('homeExercises', INITIAL_HOME_EXERCISES));
  const [imagingStudies, setImagingStudies] = useState(() => loadStorage('imagingStudies', INITIAL_IMAGING_STUDIES));
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
  useEffect(() => { localStorage.setItem('citra_imagingStudies', JSON.stringify(imagingStudies)); }, [imagingStudies]);
  useEffect(() => { localStorage.setItem('citra_authorizations', JSON.stringify(authorizations)); }, [authorizations]);
  useEffect(() => { localStorage.setItem('citra_inventoryItems', JSON.stringify(inventoryItems)); }, [inventoryItems]);
  useEffect(() => { localStorage.setItem('citra_purchaseOrders', JSON.stringify(purchaseOrders)); }, [purchaseOrders]);
  useEffect(() => { localStorage.setItem('citra_communications', JSON.stringify(communications)); }, [communications]);
  useEffect(() => { localStorage.setItem('citra_cashClosures', JSON.stringify(cashClosures)); }, [cashClosures]);
  useEffect(() => { localStorage.setItem('citra_medicalOrders', JSON.stringify(medicalOrders)); }, [medicalOrders]);
  useEffect(() => { localStorage.setItem('citra_medicalCertificates', JSON.stringify(medicalCertificates)); }, [medicalCertificates]);

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
      signatureType: 'Firma Digital X.509 (Ley 25.506 / PKI ONTI)',
      certAuthority: 'AC ONTI / Ministerio de Modernización Argentina',
      signatureTimestamp: timestamp,
      adendas: []
    };

    const integrityHash = generateSHA256Hash(recordPayload);
    const finalizedRecord = { ...recordPayload, integrityHash };

    setConsultations((prev) => [finalizedRecord, ...prev]);

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

    if (consultationData.appointmentId) {
      updateAppointmentStatus(consultationData.appointmentId, 'atendido');
    }

    logAudit('CREATE', 'Historia Clínica', consultationData.patientDni, `Registro firmado digitalmente con Hash SHA-256: ${integrityHash.substring(0, 16)}...`);
    addToast('Acto Médico Firmado Digitalmente', `Consulta registrada e inmutable según Ley 26.529.`, 'success');
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
    logAudit('CREATE', 'Receta ReNaPDiS', rxData.patientDni, `Emisión de receta electrónica CUIR: ${cuir} conforme Ley 27.553.`);
    addToast('Receta Electrónica ReNaPDiS', `Receta emitida con CUIR: ${cuir}`, 'success');
    return rxRecord;
  };

  const updatePrescriptionStatus = (id, newStatus, pharmacyName = null) => {
    setElectronicPrescriptions((prev) =>
      prev.map((rx) => (rx.id === id ? { ...rx, dispensationStatus: newStatus, dispensedPharmacy: pharmacyName } : rx))
    );
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
      legalFramework: 'Ley Nacional 26.529 Art. 5 a 10 y Ley 26.742',
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
    const newApp = { id: newId, ...appData };
    setAppointments((prev) => [newApp, ...prev]);
    logAudit('CREATE', 'Turnos', appData.patientDni, `Turno agendado con ${appData.doctorName} para el ${appData.date} a las ${appData.time} hs.`);
    addToast('Turno Agendado', `Turno para ${appData.patientName} confirmado.`, 'success');
    return newApp;
  };

  const updateAppointmentStatus = (id, newStatus) => {
    setAppointments((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );
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
    logAudit('CREATE', 'Padrón de Pacientes', patientData.dni, `Alta de paciente ${newPat.name}`);
    addToast('Paciente Registrado', `${newPat.name} ha sido dado de alta exitosamente.`, 'success');
    return newPat;
  };

  const updatePatient = (id, updatedData) => {
    setPatients((prev) =>
      prev.map((pat) => (pat.id === id ? { ...pat, ...updatedData } : pat))
    );
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
    logAudit('CASH', 'Caja Diaria', '-', `Movimiento de caja ${type}: $${numAmount} por ${concept}`);
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
    link.download = `CITRA_Backup_Cifrado_Ley25326_${new Date().toISOString().split('T')[0]}.citrabackup`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logAudit('EXPORT_HCE', 'Seguridad & Backup', '-', `Generación de backup cifrado AES-256 con Checksum: ${checksum.substring(0, 16)}...`);
    addToast('Backup Cifrado Descargado', 'Copia de seguridad cifrada según Ley 25.326 generada con éxito.', 'success');
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
        resetToDefaults
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

