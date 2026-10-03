import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { getTodayArgentina } from '../../utils/dateUtils';
import {
  FileText,
  Search,
  Plus,
  Printer,
  Eye,
  Stethoscope,
  Filter,
  Activity,
  Calendar,
  User,
  HeartPulse,
  ShieldCheck,
  FileEdit,
  Pill,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Shield,
  Lock,
  Download,
  Scale,
  Building,
  AlertCircle,
  AlertTriangle,
  Send,
  Check,
  X,
  UserCheck,
  Info,
  FolderOpen,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { ClinicalAdendaModal } from './ClinicalAdendaModal';
import { PrescriptionDigitalModal } from './PrescriptionDigitalModal';
import { MedicalOrderModal } from './MedicalOrderModal';
import { MedicalCertificateModal } from './MedicalCertificateModal';
import { DigitalSignatureModal } from '../pki/DigitalSignatureModal';
import { LegalHceCertificateModal } from './LegalHceCertificateModal';

export const ClinicalRecordsView = () => {
  const {
    consultations,
    scopedConsultations,
    scopedPatients,
    patients,
    doctors,
    isDoctor,
    isDoctorBlanco,
    isSuperAdmin,
    currentDoctor,
    clinicalAccessRequests,
    requestClinicalAccess,
    resolveClinicalAccessRequest,
    canDoctorViewConsultation,
    setIsNewConsultationModalOpen,
    setConsultationPreloadData,
    setSelectedConsultationForPrint,
    setSelectedPatientForDetail,
    setIsAdendaModalOpen,
    setAdendaTargetConsultation,
    setIsMedicalOrderModalOpen,
    setIsMedicalCertificateModalOpen,
    setIsConsentModalOpen,
    addToast
  } = useClinic();

  // Search, Filters & View modes
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState('all');
  const [activeSubTab, setActiveSubTab] = useState('patients'); // 'patients' | 'timeline' | 'requests'
  const [expandedPatientId, setExpandedPatientId] = useState(null);
  const [expandedConsultationId, setExpandedConsultationId] = useState(null);
  const [isLegalHceModalOpen, setIsLegalHceModalOpen] = useState(false);
  const [targetPatientForExport, setTargetPatientForExport] = useState(null);

  // Modal: Solicitud de acceso (requester)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestTargetConsultation, setRequestTargetConsultation] = useState(null);
  const [requestedSections, setRequestedSections] = useState({
    diagnosis: true,
    evolution: true,
    prescriptions: true,
    studies: true,
    indications: true,
    vitals: true
  });
  const [requestJustification, setRequestJustification] = useState('');
  const [requestError, setRequestError] = useState('');

  // Modal: Revisión y Doble Autorización / Negación (approver)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedRequestForReview, setSelectedRequestForReview] = useState(null);
  const [confirmationStep, setConfirmationStep] = useState(null); // null | 'accept_first' | 'accept_second' | 'deny_first' | 'deny_second'

  // Effective patients according to permissions
  // Dr. Blanco is CITRA owner -> views ALL patients
  // Other doctors -> view their assigned patients
  const effectivePatients = useMemo(() => {
    return isDoctorBlanco || isSuperAdmin ? patients : scopedPatients;
  }, [isDoctorBlanco, isSuperAdmin, patients, scopedPatients]);

  // Effective consultations
  // Dr. Blanco -> sees ALL consultations
  // Other doctors -> can query consultations of their patients (guarded with access checks)
  const allAvailableConsultations = useMemo(() => {
    if (isDoctorBlanco || isSuperAdmin) return consultations;
    // For other doctors: allow them to see the records associated with their patients
    const patientIds = new Set(effectivePatients.map((p) => p.id));
    return consultations.filter((c) => patientIds.has(c.patientId) || c.doctorId === currentDoctor?.id);
  }, [isDoctorBlanco, isSuperAdmin, consultations, effectivePatients, currentDoctor]);

  // Urgent pending requests targeted to current doctor
  const pendingRequestsForMe = useMemo(() => {
    if (!currentDoctor) return [];
    return (clinicalAccessRequests || []).filter(
      (r) =>
        (r.targetDoctorId === currentDoctor.id ||
         (isDoctorBlanco && (r.targetDoctorName?.includes('Blanco') || r.targetDoctorId === 'doc-1'))) &&
        r.status === 'pendiente'
    );
  }, [clinicalAccessRequests, currentDoctor, isDoctorBlanco]);

  // Urgent requests sent by current doctor
  const requestsSentByMe = useMemo(() => {
    if (!currentDoctor) return [];
    return (clinicalAccessRequests || []).filter(
      (r) => r.requesterDoctorId === currentDoctor.id
    );
  }, [clinicalAccessRequests, currentDoctor]);

  // Filter patients by search
  const filteredPatients = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return effectivePatients.filter((p) => {
      if (!q) return true;
      const matchName = p.name?.toLowerCase().includes(q);
      const matchDni = p.dni?.includes(q);
      const matchInsurance = p.insuranceName?.toLowerCase().includes(q);
      // Also match if any of the patient's consultations match diagnosis
      const patientCons = allAvailableConsultations.filter((c) => c.patientId === p.id);
      const matchDiag = patientCons.some(
        (c) =>
          c.diagnosis?.toLowerCase().includes(q) ||
          c.reason?.toLowerCase().includes(q)
      );
      return matchName || matchDni || matchInsurance || matchDiag;
    });
  }, [effectivePatients, searchTerm, allAvailableConsultations]);

  // Filter consultations for timeline view
  const filteredConsultations = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return allAvailableConsultations.filter((c) => {
      const matchSearch =
        q === '' ||
        c.patientName?.toLowerCase().includes(q) ||
        (c.diagnosis && c.diagnosis.toLowerCase().includes(q)) ||
        (c.reason && c.reason.toLowerCase().includes(q)) ||
        (c.patientDni && c.patientDni.includes(q)) ||
        (c.doctorName && c.doctorName.toLowerCase().includes(q));

      const matchDoctor =
        selectedDoctorFilter === 'all' || c.doctorId === selectedDoctorFilter;
      return matchSearch && matchDoctor;
    });
  }, [allAvailableConsultations, searchTerm, selectedDoctorFilter]);

  // KPIs
  const todayStr = getTodayArgentina();
  const todayConsultationsCount = allAvailableConsultations.filter((c) => c.date === todayStr).length;

  const toggleExpandPatient = (patientId) => {
    setExpandedPatientId((prev) => (prev === patientId ? null : patientId));
  };

  const toggleExpandConsultation = (consultationId) => {
    setExpandedConsultationId((prev) => (prev === consultationId ? null : consultationId));
  };

  // Open Request Modal
  const handleOpenRequestAccess = (cons, pat) => {
    setRequestTargetConsultation({ ...cons, patientInfo: pat });
    setRequestedSections({
      diagnosis: true,
      evolution: true,
      prescriptions: true,
      studies: true,
      indications: true,
      vitals: true
    });
    setRequestJustification('');
    setRequestError('');
    setIsRequestModalOpen(true);
  };

  // Submit Request
  const handleSubmitAccessRequest = (e) => {
    e.preventDefault();
    if (!requestJustification.trim() || requestJustification.trim().length < 8) {
      setRequestError('La justificación médica es obligatoria por ley y debe tener al menos 8 caracteres.');
      return;
    }

    const hasAnySection = Object.values(requestedSections).some(Boolean);
    if (!hasAnySection) {
      setRequestError('Debe marcar con un tilde al menos una sección de la historia clínica requerida.');
      return;
    }

    requestClinicalAccess({
      consultationId: requestTargetConsultation.id,
      patientId: requestTargetConsultation.patientId,
      patientName: requestTargetConsultation.patientName,
      patientDni: requestTargetConsultation.patientDni,
      consultationDate: requestTargetConsultation.date,
      consultationReason: requestTargetConsultation.reason,
      targetDoctorId: requestTargetConsultation.doctorId,
      targetDoctorName: requestTargetConsultation.doctorName,
      requestedSections,
      justification: requestJustification.trim()
    });

    setIsRequestModalOpen(false);
    setRequestTargetConsultation(null);
  };

  // Open Review Modal
  const handleOpenReviewModal = (req) => {
    setSelectedRequestForReview(req);
    setConfirmationStep(null);
    setIsReviewModalOpen(true);
  };

  // Execute double confirmation
  const handleExecuteDecision = (decision) => {
    if (!selectedRequestForReview) return;
    resolveClinicalAccessRequest(selectedRequestForReview.id, decision);
    setIsReviewModalOpen(false);
    setSelectedRequestForReview(null);
    setConfirmationStep(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Clinical Sub-Modals */}
      <ClinicalAdendaModal />
      <PrescriptionDigitalModal />
      <MedicalOrderModal />
      <MedicalCertificateModal />
      <DigitalSignatureModal />
      <LegalHceCertificateModal
        isOpen={isLegalHceModalOpen}
        onClose={() => {
          setIsLegalHceModalOpen(false);
          setTargetPatientForExport(null);
        }}
        targetPatient={targetPatientForExport}
      />

      {/* 1. TOP HEADER: TITLE & PRIVILEGE BADGE */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.2rem', letterSpacing: '-0.02em' }}>
              Historial Clínico
            </h1>
          </div>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>
            Expediente único de pacientes y registro integral de todas las atenciones médicas en CITRA.
          </p>
        </div>


      </div>

      {/* 2. URGENT ALERT BANNER IF PENDING ACCESS REQUESTS EXIST FOR CURRENT DOCTOR */}
      {pendingRequestsForMe.length > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            border: '2px solid #ef4444',
            borderRadius: '14px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#ef4444',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <AlertTriangle size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 900, color: '#991b1b', fontSize: '0.98rem' }}>
                SOLICITUD URGENTE DE ACCESO A HISTORIA CLÍNICA ({pendingRequestsForMe.length} PENDIENTE{pendingRequestsForMe.length > 1 ? 'S' : ''})
              </div>
              <div style={{ fontSize: '0.82rem', color: '#7f1d1d', marginTop: '2px' }}>
                Un colega ha requerido acceso prioritario y fundamentado a una historia clínica bajo su custodia.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveSubTab('requests')}
            style={{
              background: '#991b1b',
              color: '#ffffff',
              border: 'none',
              padding: '0.6rem 1.1rem',
              borderRadius: '9px',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(153, 27, 27, 0.3)'
            }}
          >
            <span>Revisar y Autorizar / Denegar</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* 3. OPERATIONAL KPI METRICS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '0.85rem'
        }}
      >
        {/* KPI 1: Historias Clínicas (Pacientes) */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '13px',
            border: '1.5px solid #D2E3FC',
            borderLeft: '3.5px solid #076ABC',
            padding: '0.75rem 1.1rem',
            boxShadow: '0 2px 8px rgba(0, 33, 130, 0.03)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#076ABC', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Historias Clínicas
            </span>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#EBF3FD', color: '#076ABC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FolderOpen size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#002182', marginBottom: '0.1rem', lineHeight: 1 }}>
            {effectivePatients.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
            {isDoctorBlanco ? 'Todos los pacientes de CITRA' : 'Pacientes vinculados a su atención'}
          </div>
        </div>

        {/* KPI 2: Atenciones en CITRA */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '13px',
            border: '1.5px solid #D2E3FC',
            borderLeft: '3.5px solid #059669',
            padding: '0.75rem 1.1rem',
            boxShadow: '0 2px 8px rgba(0, 33, 130, 0.03)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Atenciones en CITRA
            </span>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Stethoscope size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.1rem', lineHeight: 1 }}>
            {allAvailableConsultations.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
            {todayConsultationsCount} registradas hoy
          </div>
        </div>

        {/* KPI 3: Solicitudes de Acceso Urgentes */}
        <div
          onClick={() => setActiveSubTab('requests')}
          style={{
            background: pendingRequestsForMe.length > 0 ? '#fff1f2' : '#ffffff',
            borderRadius: '13px',
            border: pendingRequestsForMe.length > 0 ? '1.5px solid #fecdd3' : '1.5px solid #D2E3FC',
            borderLeft: pendingRequestsForMe.length > 0 ? '3.5px solid #e11d48' : '3.5px solid #7c3aed',
            padding: '0.75rem 1.1rem',
            boxShadow: '0 2px 8px rgba(0, 33, 130, 0.03)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: pendingRequestsForMe.length > 0 ? '#be123c' : '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Solicitudes de Acceso
            </span>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: pendingRequestsForMe.length > 0 ? '#ffe4e6' : '#f5f3ff', color: pendingRequestsForMe.length > 0 ? '#e11d48' : '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: pendingRequestsForMe.length > 0 ? '#9f1239' : '#0f172a', marginBottom: '0.1rem', lineHeight: 1 }}>
            {pendingRequestsForMe.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: pendingRequestsForMe.length > 0 ? '#be123c' : '#64748b', fontWeight: 700 }}>
            {pendingRequestsForMe.length > 0
              ? 'Requieren doble autorización urgente'
              : isDoctorBlanco
              ? 'Sin solicitudes pendientes de colegas'
              : `${requestsSentByMe.length} solicitud(es) enviada(s)`}
          </div>
        </div>
      </div>

      {/* 4. SUB-NAVIGATION TABS & SEARCH BAR */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1.5px solid #D2E3FC',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 2px 10px rgba(0, 33, 130, 0.03)'
        }}
      >
        {/* Tabs: Historias Clínicas por Paciente / Cronología / Solicitudes */}
        <div
          style={{
            display: 'flex',
            background: '#F1F5F9',
            padding: '3px',
            borderRadius: '11px',
            gap: '3px',
            border: '1px solid #E2E8F0',
            flexShrink: 0
          }}
        >
          <button
            type="button"
            onClick={() => setActiveSubTab('patients')}
            style={{
              background: activeSubTab === 'patients' ? 'linear-gradient(135deg, #002182 0%, #076ABC 100%)' : '#ffffff',
              color: activeSubTab === 'patients' ? '#ffffff' : '#334155',
              border: activeSubTab === 'patients' ? '1px solid #002182' : '1px solid #CBD5E1',
              borderRadius: '8px',
              padding: '0.45rem 0.85rem',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeSubTab === 'patients' ? '0 2px 8px rgba(0, 33, 130, 0.28)' : '0 1px 2px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.15s ease'
            }}
          >
            <FolderOpen size={15} color={activeSubTab === 'patients' ? '#ffffff' : '#076ABC'} />
            <span>Historias Clínicas ({effectivePatients.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('timeline')}
            style={{
              background: activeSubTab === 'timeline' ? 'linear-gradient(135deg, #002182 0%, #076ABC 100%)' : '#ffffff',
              color: activeSubTab === 'timeline' ? '#ffffff' : '#334155',
              border: activeSubTab === 'timeline' ? '1px solid #002182' : '1px solid #CBD5E1',
              borderRadius: '8px',
              padding: '0.45rem 0.85rem',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeSubTab === 'timeline' ? '0 2px 8px rgba(0, 33, 130, 0.28)' : '0 1px 2px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.15s ease'
            }}
          >
            <FileText size={15} color={activeSubTab === 'timeline' ? '#ffffff' : '#076ABC'} />
            <span>Todas las Atenciones ({allAvailableConsultations.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('requests')}
            style={{
              background: activeSubTab === 'requests' ? 'linear-gradient(135deg, #002182 0%, #076ABC 100%)' : '#ffffff',
              color: activeSubTab === 'requests' ? '#ffffff' : '#334155',
              border: activeSubTab === 'requests' ? '1px solid #002182' : '1px solid #CBD5E1',
              borderRadius: '8px',
              padding: '0.45rem 0.85rem',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              position: 'relative',
              boxShadow: activeSubTab === 'requests' ? '0 2px 8px rgba(0, 33, 130, 0.28)' : '0 1px 2px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.15s ease'
            }}
          >
            <ShieldCheck size={15} color={activeSubTab === 'requests' ? '#ffffff' : '#7c3aed'} />
            <span>Solicitudes de Acceso</span>
            {pendingRequestsForMe.length > 0 && (
              <span
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  borderRadius: '100px',
                  fontSize: '0.68rem',
                  padding: '1px 6px',
                  fontWeight: 900,
                  boxShadow: '0 1px 4px rgba(239, 68, 68, 0.4)'
                }}
              >
                {pendingRequestsForMe.length}
              </span>
            )}
          </button>
        </div>

        {/* Búsqueda de pacientes alargada y botón resaltado */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flex: 1,
            minWidth: '280px',
            maxWidth: '780px'
          }}
        >
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#076ABC',
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              placeholder="Buscar por paciente, DNI o diagnóstico CIE-10..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.58rem 2.2rem 0.58rem 2.45rem',
                borderRadius: '10px',
                border: '1.5px solid #4B92E8',
                fontSize: '0.86rem',
                outline: 'none',
                background: '#ffffff',
                color: '#0f172a',
                boxSizing: 'border-box',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 3px rgba(7, 106, 188, 0.08)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#002182';
                e.target.style.boxShadow = '0 0 0 3px rgba(7, 106, 188, 0.22)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#4B92E8';
                e.target.style.boxShadow = '0 1px 3px rgba(7, 106, 188, 0.08)';
              }}
              onMouseEnter={(e) => {
                if (document.activeElement !== e.target) {
                  e.target.style.borderColor = '#076ABC';
                }
              }}
              onMouseLeave={(e) => {
                if (document.activeElement !== e.target) {
                  e.target.style.borderColor = '#4B92E8';
                }
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                title="Limpiar búsqueda"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#e2e8f0',
                  border: 'none',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#475569',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <X size={11} />
              </button>
            )}
          </div>

          <button
            type="button"
            title="Buscar en historias clínicas"
            style={{
              background: 'linear-gradient(135deg, #002182 0%, #076ABC 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '0.58rem 1.25rem',
              fontSize: '0.84rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 33, 130, 0.22)',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 33, 130, 0.32)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 33, 130, 0.22)';
            }}
          >
            <Search size={15} />
            <span>Buscar</span>
          </button>
        </div>
      </div>

      {/* 5. MAIN CONTENT TAB 1: HISTORIAS CLÍNICAS POR PACIENTE */}
      {activeSubTab === 'patients' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredPatients.length === 0 ? (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '3.5rem 1.5rem',
                textAlign: 'center',
                color: '#64748b'
              }}
            >
              <FolderOpen size={40} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.05rem' }}>No se encontraron historias clínicas</div>
              <div style={{ fontSize: '0.84rem' }}>Ajuste la búsqueda por nombre o DNI del paciente.</div>
            </div>
          ) : (
            filteredPatients.map((patient) => {
              const isExpanded = expandedPatientId === patient.id;
              // Consultations for this patient
              const patientConsultations = allAvailableConsultations.filter(
                (c) => c.patientId === patient.id || (c.patientDni && c.patientDni === patient.dni)
              );
              // Doctors that attended this patient in CITRA
              const attendedDoctorNames = Array.from(new Set(patientConsultations.map((c) => c.doctorName).filter(Boolean)));

              return (
                <div
                  key={patient.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: isExpanded ? '2px solid #002182' : '1px solid #e2e8f0',
                    boxShadow: isExpanded ? '0 8px 24px rgba(0, 33, 130, 0.08)' : '0 2px 8px rgba(0, 33, 130, 0.02)',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Patient Header Card */}
                  <div
                    onClick={() => toggleExpandPatient(patient.id)}
                    style={{
                      padding: '1.15rem 1.4rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      cursor: 'pointer',
                      background: isExpanded ? '#f8fafc' : '#ffffff'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '14px',
                          background: isExpanded ? '#002182' : '#EBF3FD',
                          color: isExpanded ? '#ffffff' : '#076ABC',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: '1.05rem'
                        }}
                      >
                        {patient.name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>
                            {patient.name}
                          </span>
                          <span
                            style={{
                              background: '#eff6ff',
                              color: '#1e40af',
                              border: '1px solid #bfdbfe',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 800
                            }}
                          >
                            HC-{patient.dni || patient.id}
                          </span>
                          <span
                            style={{
                              background: '#ecfdf5',
                              color: '#065f46',
                              border: '1px solid #a7f3d0',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 700
                            }}
                          >
                            {patient.insuranceName || patient.healthInsurance || 'Particular'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '3px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          <span><strong>DNI:</strong> {patient.dni}</span>
                          <span><strong>Tel:</strong> {patient.phone || '-'}</span>
                          <span>
                            <strong>Atenciones en CITRA:</strong> {patientConsultations.length} {patientConsultations.length === 1 ? 'visita' : 'visitas registradas'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTargetPatientForExport(patient);
                          setIsLegalHceModalOpen(true);
                        }}
                        style={{
                          background: '#F5F8FE',
                          color: '#002182',
                          border: '1.5px solid #BFDBFE',
                          padding: '0.5rem 0.95rem',
                          borderRadius: '9px',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease'
                        }}
                        title={`Exportar historia clínica oficial de ${patient.name}`}
                      >
                        <Download size={15} color="#076ABC" />
                        <span>Exportar Historia Clínica</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpandPatient(patient.id);
                        }}
                        style={{
                          background: isExpanded ? '#002182' : '#ffffff',
                          color: isExpanded ? '#ffffff' : '#334155',
                          border: '1.5px solid ' + (isExpanded ? '#002182' : '#cbd5e1'),
                          padding: '0.5rem 0.95rem',
                          borderRadius: '9px',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <FolderOpen size={15} />
                        <span>{isExpanded ? 'Ocultar Historia Clínica' : `Ver Historia Clínica (${patientConsultations.length})`}</span>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Accordion Body: Historial de Atenciones */}
                  {isExpanded && (
                    <div style={{ borderTop: '1px solid #e2e8f0', background: '#f8fafc', padding: '0.85rem 1.15rem' }}>
                      {patientConsultations.length === 0 ? (
                        <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '10px', textAlign: 'center', color: '#64748b', border: '1px solid #e2e8f0' }}>
                          <FileText size={28} style={{ color: '#cbd5e1', marginBottom: '0.4rem' }} />
                          <div style={{ fontWeight: 700, color: '#334155', fontSize: '0.88rem' }}>Sin atenciones registradas aún</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>Las atenciones se registran automáticamente desde la agenda al finalizar una consulta.</div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                          {patientConsultations.map((cons) => {
                            const isConsExpanded = expandedConsultationId === cons.id;
                            const permission = canDoctorViewConsultation(cons);
                            const hasAdendas = cons.adendas && cons.adendas.length > 0;
                            const hasVitals = cons.vitals && (
                              cons.vitals.bpSystolic || 
                              cons.vitals.heartRate || 
                              cons.vitals.temperature || 
                              cons.vitals.weight || 
                              cons.vitals.height
                            );

                            return (
                              <div
                                key={cons.id}
                                style={{
                                  background: '#ffffff',
                                  borderRadius: '10px',
                                  border: '1px solid ' + (permission.allowed ? (isConsExpanded ? '#93c5fd' : '#e2e8f0') : '#fed7aa'),
                                  overflow: 'hidden',
                                  transition: 'all 0.15s ease',
                                  boxShadow: isConsExpanded ? '0 3px 10px rgba(0,0,0,0.04)' : '0 1px 2px rgba(0,0,0,0.02)'
                                }}
                              >
                                {/* Compact Consultation Bar */}
                                <div
                                  onClick={() => permission.allowed && toggleExpandConsultation(cons.id)}
                                  style={{
                                    padding: '0.65rem 0.95rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '0.75rem',
                                    background: isConsExpanded ? '#eff6ff' : '#ffffff',
                                    cursor: permission.allowed ? 'pointer' : 'default',
                                    userSelect: 'none'
                                  }}
                                >
                                  {/* Left: Date, Doctor, Diagnosis, Motivo */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                                    {/* Date & Time */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
                                      <Calendar size={13} color="#076ABC" />
                                      <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.84rem' }}>
                                        {cons.date}
                                      </span>
                                      <span style={{ color: '#64748b', fontSize: '0.78rem' }}>
                                        {cons.time} hs
                                      </span>
                                    </div>

                                    <span style={{ color: '#cbd5e1' }}>•</span>

                                    {/* Doctor */}
                                    <span style={{ fontSize: '0.82rem', color: '#1e293b', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                      {cons.doctorName || 'Dr. Asignado'}
                                    </span>

                                    <span style={{ color: '#cbd5e1' }}>•</span>

                                    {/* Diagnosis Pill */}
                                    {cons.diagnosis && (
                                      <span
                                        style={{
                                          background: '#ecfdf5',
                                          color: '#065f46',
                                          border: '1px solid #a7f3d0',
                                          padding: '2px 8px',
                                          borderRadius: '6px',
                                          fontSize: '0.75rem',
                                          fontWeight: 700,
                                          maxWidth: '260px',
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                        }}
                                        title={cons.diagnosis}
                                      >
                                        {cons.diagnosis}
                                      </span>
                                    )}

                                    {/* Reason (Motivo) preview */}
                                    {cons.reason && (
                                      <span
                                        style={{
                                          fontSize: '0.8rem',
                                          color: '#64748b',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                          flex: '1 1 180px',
                                          minWidth: 0
                                        }}
                                        title={cons.reason}
                                      >
                                        — {cons.reason}
                                      </span>
                                    )}

                                    {/* Restricted access label */}
                                    {!permission.allowed && (
                                      <span
                                        style={{
                                          background: '#fef2f2',
                                          color: '#991b1b',
                                          border: '1px solid #fecaca',
                                          padding: '2px 7px',
                                          borderRadius: '6px',
                                          fontSize: '0.72rem',
                                          fontWeight: 700
                                        }}
                                      >
                                        {permission.reason === 'pending_request' ? 'Solicitud pendiente' : 'Acceso restringido'}
                                      </span>
                                    )}
                                  </div>

                                  {/* Right: Actions */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                                    {permission.allowed ? (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => setSelectedConsultationForPrint(cons)}
                                          title="Imprimir informe de consulta"
                                          style={{
                                            background: '#ffffff',
                                            border: '1px solid #cbd5e1',
                                            color: '#475569',
                                            borderRadius: '7px',
                                            padding: '0.3rem 0.55rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center'
                                          }}
                                        >
                                          <Printer size={13} />
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => toggleExpandConsultation(cons.id)}
                                          style={{
                                            background: isConsExpanded ? '#002182' : '#ffffff',
                                            color: isConsExpanded ? '#ffffff' : '#002182',
                                            border: '1px solid ' + (isConsExpanded ? '#002182' : '#cbd5e1'),
                                            borderRadius: '7px',
                                            padding: '0.3rem 0.65rem',
                                            fontSize: '0.76rem',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                          }}
                                        >
                                          <span>{isConsExpanded ? 'Ocultar' : 'Ver Detalle'}</span>
                                          {isConsExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenRequestAccess(cons, patient)}
                                        style={{
                                          background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                                          color: '#ffffff',
                                          border: 'none',
                                          borderRadius: '7px',
                                          padding: '0.35rem 0.75rem',
                                          fontSize: '0.76rem',
                                          fontWeight: 700,
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '5px'
                                        }}
                                      >
                                        <Lock size={13} />
                                        <span>Solicitar Acceso</span>
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Expanded Details Drawer */}
                                {isConsExpanded && permission.allowed && (
                                  <div
                                    style={{
                                      borderTop: '1px solid #e2e8f0',
                                      background: '#fafbfc',
                                      padding: '0.85rem 1rem 1rem',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '0.85rem'
                                    }}
                                  >
                                    {/* Detailed Reason & Diagnosis */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                                      <div>
                                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                          Motivo de Consulta
                                        </div>
                                        <div style={{ fontSize: '0.84rem', color: '#1e293b', fontWeight: 600, marginTop: '2px' }}>
                                          {cons.reason || 'Consulta médica programada'}
                                        </div>
                                      </div>
                                      <div>
                                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                          Diagnóstico
                                        </div>
                                        <div style={{ fontSize: '0.84rem', color: '#0f172a', fontWeight: 700, marginTop: '2px' }}>
                                          {cons.diagnosis || 'Consulta ambulatoria'}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Vitals Bar (only if filled) */}
                                    {hasVitals && (
                                      <div
                                        style={{
                                          display: 'flex',
                                          gap: '1rem',
                                          background: '#ffffff',
                                          border: '1px solid #e2e8f0',
                                          padding: '0.45rem 0.75rem',
                                          borderRadius: '7px',
                                          fontSize: '0.78rem',
                                          color: '#334155',
                                          flexWrap: 'wrap',
                                          alignItems: 'center'
                                        }}
                                      >
                                        <span style={{ fontWeight: 700, color: '#002182', fontSize: '0.72rem', textTransform: 'uppercase' }}>Signos Vitales:</span>
                                        {cons.vitals.bpSystolic && <span><strong>TA:</strong> {cons.vitals.bpSystolic}/{cons.vitals.bpDiastolic} mmHg</span>}
                                        {cons.vitals.heartRate && <span><strong>FC:</strong> {cons.vitals.heartRate} lpm</span>}
                                        {cons.vitals.temperature && <span><strong>Temp:</strong> {cons.vitals.temperature} °C</span>}
                                        {cons.vitals.weight && <span><strong>Peso:</strong> {cons.vitals.weight} kg</span>}
                                        {cons.vitals.height && <span><strong>Talla:</strong> {cons.vitals.height} m</span>}
                                      </div>
                                    )}

                                    {/* Clinical Evolution */}
                                    <div>
                                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '0.25rem' }}>
                                        Evolución Médica & Examen Físico
                                      </div>
                                      <div
                                        style={{
                                          fontSize: '0.84rem',
                                          color: '#1e293b',
                                          lineHeight: 1.5,
                                          background: '#ffffff',
                                          padding: '0.65rem 0.85rem',
                                          borderRadius: '7px',
                                          border: '1px solid #e2e8f0',
                                          whiteSpace: 'pre-wrap'
                                        }}
                                      >
                                        {cons.evolution || cons.physicalExam || 'Evolución clínica sin particularidades.'}
                                      </div>
                                    </div>

                                    {/* Prescriptions */}
                                    {cons.prescriptions && cons.prescriptions.length > 0 && (
                                      <div>
                                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '0.25rem' }}>
                                          Prescripción Rp/
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                          {cons.prescriptions.map((rx, rIdx) => (
                                            <div
                                              key={rIdx}
                                              style={{
                                                fontSize: '0.78rem',
                                                background: '#ecfdf5',
                                                color: '#065f46',
                                                padding: '4px 9px',
                                                borderRadius: '6px',
                                                border: '1px solid #a7f3d0'
                                              }}
                                            >
                                              <strong>{rx.medication || rx.name || rx.drugName}</strong> {rx.dosage || rx.presentation ? `— ${rx.dosage || rx.presentation}` : ''}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Indications */}
                                    {cons.indications && (
                                      <div>
                                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '0.25rem' }}>
                                          Indicaciones
                                        </div>
                                        <div
                                          style={{
                                            fontSize: '0.82rem',
                                            color: '#334155',
                                            background: '#ffffff',
                                            padding: '0.5rem 0.75rem',
                                            borderRadius: '7px',
                                            border: '1px solid #e2e8f0'
                                          }}
                                        >
                                          {cons.indications}
                                        </div>
                                      </div>
                                    )}

                                    {/* Adendas */}
                                    {hasAdendas && (
                                      <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '7px', padding: '0.65rem 0.85rem' }}>
                                        <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#854d0e', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                                          Adendas Médicas Fechadas (Ley 26.529)
                                        </div>
                                        {cons.adendas.map((ad, aIdx) => (
                                          <div key={aIdx} style={{ fontSize: '0.78rem', color: '#713f12', marginTop: aIdx > 0 ? '4px' : '0' }}>
                                            <strong>Adenda #{aIdx + 1} ({ad.date} {ad.time}):</strong> {ad.adendaText}
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Action Footer */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.3rem', gap: '0.5rem' }}>
                                      {isDoctor && (
                                        <button
                                          type="button"
                                          className="btn btn-outline btn-sm"
                                          onClick={() => setIsMedicalOrderModalOpen(true)}
                                          style={{ fontSize: '0.76rem', fontWeight: 700, padding: '0.3rem 0.7rem' }}
                                        >
                                          <FileText size={13} />
                                          <span>+ Solicitar Estudio / Orden</span>
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        className="btn btn-outline btn-sm"
                                        onClick={() => {
                                          setAdendaTargetConsultation(cons);
                                          setIsAdendaModalOpen(true);
                                        }}
                                        style={{ fontSize: '0.76rem', fontWeight: 700, padding: '0.3rem 0.7rem' }}
                                      >
                                        <FileEdit size={13} />
                                        <span>+ Asentar Adenda</span>
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Restricted Access View */}
                                {!permission.allowed && (
                                  <div
                                    style={{
                                      padding: '0.75rem 1rem',
                                      background: '#fffbeb',
                                      borderTop: '1px solid #fde68a',
                                      fontSize: '0.78rem',
                                      color: '#92400e',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      gap: '0.75rem',
                                      flexWrap: 'wrap'
                                    }}
                                  >
                                    <span>Registro reservado del profesional tratante ({cons.doctorName}). Requiere solicitud de acceso bajo secreto médico.</span>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenRequestAccess(cons, patient)}
                                      style={{
                                        background: '#92400e',
                                        color: '#ffffff',
                                        border: 'none',
                                        padding: '0.3rem 0.7rem',
                                        borderRadius: '6px',
                                        fontSize: '0.74rem',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                      }}
                                    >
                                      Solicitar Acceso
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 6. MAIN CONTENT TAB 2: CRONOLOGÍA GENERAL DE ATENCIONES */}
      {activeSubTab === 'timeline' && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0, 33, 130, 0.03)'
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#0f172a', fontWeight: 800 }}>
                  <th style={{ padding: '0.9rem 1.25rem', width: '140px' }}>Fecha & Folio</th>
                  <th style={{ padding: '0.9rem 1.25rem', width: '220px' }}>Paciente</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Profesional Tratante</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Motivo de Consulta</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Diagnóstico / Estado</th>
                  <th style={{ padding: '0.9rem 1.25rem', textAlign: 'right', width: '160px' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredConsultations.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
                      <FileText size={36} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>No se encontraron atenciones registradas</div>
                    </td>
                  </tr>
                ) : (
                  filteredConsultations.map((cons, index) => {
                    const permission = canDoctorViewConsultation(cons);
                    const pat = patients.find((p) => p.id === cons.patientId);

                    return (
                      <tr
                        key={cons.id}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: permission.allowed ? '#ffffff' : '#fffdfa'
                        }}
                      >
                        <td style={{ padding: '0.9rem 1.25rem', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>
                            {cons.date}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            {cons.time} hs · Folio #{index + 1}
                          </div>
                        </td>

                        <td style={{ padding: '0.9rem 1.25rem' }}>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.94rem' }}>
                            {cons.patientName}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            DNI {cons.patientDni || '-'}
                          </div>
                        </td>

                        <td style={{ padding: '0.9rem 1.25rem' }}>
                          <div style={{ fontWeight: 800, color: '#002182', fontSize: '0.88rem' }}>
                            {cons.doctorName}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            {cons.specialtyName || 'Traumatología'}
                          </div>
                        </td>

                        <td style={{ padding: '0.9rem 1.25rem' }}>
                          <div style={{ fontSize: '0.86rem', color: '#1e293b', fontWeight: 600 }}>
                            {permission.allowed ? (cons.reason || 'Consulta médica') : 'Información bajo secreto profesional'}
                          </div>
                        </td>

                        <td style={{ padding: '0.9rem 1.25rem' }}>
                          {permission.allowed ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                background: '#eff6ff',
                                color: '#1e40af',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '6px',
                                fontSize: '0.78rem',
                                fontWeight: 700
                              }}
                            >
                              {cons.diagnosis || 'Consulta Médica'}
                            </span>
                          ) : (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: '#fee2e2',
                                color: '#991b1b',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '6px',
                                fontSize: '0.74rem',
                                fontWeight: 800
                              }}
                            >
                              <Lock size={12} /> Acceso Restringido
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
                          {permission.allowed ? (
                            <button
                              type="button"
                              onClick={() => {
                                if (pat) {
                                  setSelectedPatientForDetail(pat);
                                } else {
                                  setSelectedConsultationForPrint(cons);
                                }
                              }}
                              style={{
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                color: '#002182',
                                borderRadius: '7px',
                                padding: '0.35rem 0.75rem',
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                cursor: 'pointer'
                              }}
                            >
                              Ver Detalle
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenRequestAccess(cons, pat)}
                              style={{
                                background: '#076ABC',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '7px',
                                padding: '0.35rem 0.75rem',
                                fontSize: '0.76rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Lock size={12} /> Solicitar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. MAIN CONTENT TAB 3: BANDEJA DE SOLICITUDES DE ACCESO CLÍNICO */}
      {activeSubTab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Section: Solicitudes Recibidas (Pendientes de mi autorización) */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1.5px solid #D2E3FC',
              padding: '1.5rem',
              boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#002182' }}>
                  Solicitudes Urgentes Recibidas (Para su Autorización)
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Colegas que solicitaron formalmente acceso a historias clínicas bajo su custodia médica.
                </p>
              </div>

              {pendingRequestsForMe.length > 0 && (
                <span
                  style={{
                    background: '#ef4444',
                    color: '#ffffff',
                    padding: '0.3rem 0.85rem',
                    borderRadius: '100px',
                    fontSize: '0.78rem',
                    fontWeight: 900
                  }}
                >
                  {pendingRequestsForMe.length} URGENTE(S) PENDIENTE(S)
                </span>
              )}
            </div>

            {pendingRequestsForMe.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px' }}>
                <CheckCircle2 size={32} style={{ color: '#10b981', marginBottom: '0.4rem' }} />
                <div style={{ fontWeight: 800, color: '#0f172a' }}>No tiene solicitudes urgentes pendientes</div>
                <div style={{ fontSize: '0.8rem' }}>Todas las solicitudes de interconsulta han sido respondidas.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {pendingRequestsForMe.map((req) => (
                  <div
                    key={req.id}
                    style={{
                      background: '#fff5f5',
                      border: '1.5px solid #fecaca',
                      borderRadius: '12px',
                      padding: '1.15rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{ fontWeight: 900, color: '#991b1b', fontSize: '0.96rem' }}>
                          {req.requesterDoctorName}
                        </span>
                        <span style={{ fontSize: '0.76rem', color: '#7f1d1d', background: '#fee2e2', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                          {req.requesterDoctorSpecialty || 'Médico'}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: '#dc2626', fontWeight: 900 }}>
                          URGENTE
                        </span>
                      </div>

                      <div style={{ fontSize: '0.84rem', color: '#1e293b', marginTop: '4px' }}>
                        <strong>Paciente:</strong> {req.patientName} (DNI {req.patientDni}) · <strong>Fecha de atención:</strong> {req.consultationDate}
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px', fontStyle: 'italic', background: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #fde2e2' }}>
                        <strong>Justificación médica:</strong> "{req.justification}"
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenReviewModal(req)}
                      style={{
                        background: '#991b1b',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.65rem 1.15rem',
                        borderRadius: '9px',
                        fontSize: '0.84rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(153, 27, 27, 0.25)'
                      }}
                    >
                      <ShieldCheck size={16} />
                      <span>Revisar y Resolver Solicitud</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Solicitudes Enviadas por mí (Oculto para el Dr. Blanco, ya que posee acceso universal a todas las historias) */}
          {!isDoctorBlanco && (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                boxShadow: '0 4px 14px rgba(0, 33, 130, 0.03)'
              }}
            >
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Mis Solicitudes Enviadas a Otros Colegas
              </h3>
              <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: '#64748b' }}>
                Seguimiento del estado de las solicitudes de interconsulta tramitadas a otros especialistas.
              </p>

              {requestsSentByMe.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.84rem' }}>No ha realizado solicitudes de acceso a historias clínicas de otros colegas aún.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {requestsSentByMe.map((req) => (
                    <div
                      key={req.id}
                      style={{
                        background: '#f8fafc',
                        borderRadius: '10px',
                        padding: '0.85rem 1rem',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.75rem'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, color: '#002182', fontSize: '0.9rem' }}>
                          Paciente: {req.patientName} (DNI {req.patientDni})
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                          Destinatario: <strong>{req.targetDoctorName}</strong> · Solicitado el {req.createdAt}
                        </div>
                      </div>

                      <div>
                        {req.status === 'aprobada' ? (
                          <span style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: '100px', fontSize: '0.78rem', fontWeight: 900 }}>
                            AUTORIZADA
                          </span>
                        ) : req.status === 'rechazada' ? (
                          <span style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', padding: '4px 10px', borderRadius: '100px', fontSize: '0.78rem', fontWeight: 900 }}>
                            DENEGADA
                          </span>
                        ) : (
                          <span style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '4px 10px', borderRadius: '100px', fontSize: '0.78rem', fontWeight: 900 }}>
                            PENDIENTE DE REVISIÓN
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 8. MODAL: SOLICITUD URGENTE DE ACCESO (REQUESTER FLOW) */}
      {isRequestModalOpen && requestTargetConsultation && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 33, 130, 0.75)',
            backdropFilter: 'blur(5px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem'
          }}
          onClick={() => setIsRequestModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                color: '#ffffff',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Lock size={20} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900 }}>
                    Solicitud Urgente de Acceso a Historia Clínica
                  </h3>
                  <div style={{ fontSize: '0.76rem', color: '#D2E3FC', marginTop: '2px' }}>
                    Requerimiento formal de interconsulta médica (Ley 26.529)
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitAccessRequest} style={{ padding: '1.5rem' }}>
              {/* Context Summary */}
              <div style={{ background: '#F5F8FE', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #D2E3FC', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.84rem', color: '#002182', fontWeight: 800 }}>
                  Destinatario: {requestTargetConsultation.doctorName} ({requestTargetConsultation.specialtyName || 'Consultorio'})
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '3px' }}>
                  <strong>Paciente:</strong> {requestTargetConsultation.patientName} · DNI {requestTargetConsultation.patientDni}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                  <strong>Consulta del día:</strong> {requestTargetConsultation.date} - {requestTargetConsultation.time} hs
                </div>
              </div>

              {/* Checkboxes: Qué es lo que necesita ver */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#002182', marginBottom: '0.5rem' }}>
                  Marque con un tilde lo que necesita de la historia clínica: *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {[
                    { key: 'diagnosis', label: 'Diagnóstico CIE-10 y Motivo' },
                    { key: 'evolution', label: 'Evolución y Examen Físico' },
                    { key: 'prescriptions', label: 'Prescripciones Rp/ y Fármacos' },
                    { key: 'studies', label: 'Estudios e Imágenes' },
                    { key: 'indications', label: 'Indicaciones Terapéuticas' },
                    { key: 'vitals', label: 'Signos Vitales y Antecedentes' }
                  ].map((item) => (
                    <label
                      key={item.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '7px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#334155',
                        background: requestedSections[item.key] ? '#eff6ff' : '#f8fafc',
                        padding: '0.45rem 0.65rem',
                        borderRadius: '8px',
                        border: requestedSections[item.key] ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={requestedSections[item.key]}
                        onChange={(e) =>
                          setRequestedSections({
                            ...requestedSections,
                            [item.key]: e.target.checked
                          })
                        }
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Justificación obligatoria */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                  Justificación médica del requerimiento (OBLIGATORIO): *
                </label>
                <textarea
                  required
                  rows={3}
                  value={requestJustification}
                  onChange={(e) => {
                    setRequestJustification(e.target.value);
                    if (requestError) setRequestError('');
                  }}
                  placeholder="Explique el motivo clínico o asistencial para acceder a este registro (ej: paciente en interconsulta por dolor refractario post-operatorio, cotejo de imágenes)..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.82rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px' }}>
                  Esta justificación será notificada de urgencia al profesional titular y quedará auditada por Ley 26.529.
                </div>
              </div>

              {requestError && (
                <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.55rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '1rem' }}>
                  {requestError}
                </div>
              )}

              {/* Submit Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    color: '#475569',
                    padding: '0.6rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Send size={15} />
                  <span>Enviar Solicitud Urgente</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. MODAL: DOBLE AUTORIZACIÓN O NEGACIÓN (APPROVER FLOW) */}
      {isReviewModalOpen && selectedRequestForReview && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 33, 130, 0.8)',
            backdropFilter: 'blur(5px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem'
          }}
          onClick={() => setIsReviewModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '640px',
              width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #991b1b 0%, #b91c1c 100%)',
                color: '#ffffff',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <AlertTriangle size={22} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900 }}>
                    Revisión de Solicitud Urgente de Acceso
                  </h3>
                  <div style={{ fontSize: '0.76rem', color: '#fecaca', marginTop: '2px' }}>
                    Resolución clínica con doble confirmación de seguridad
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              {/* Request Data Card */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#002182', marginBottom: '0.4rem' }}>
                  Profesional Solicitante: {selectedRequestForReview.requesterDoctorName}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.25rem' }}>
                  <strong>Especialidad:</strong> {selectedRequestForReview.requesterDoctorSpecialty || 'Médico'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.25rem' }}>
                  <strong>Paciente:</strong> {selectedRequestForReview.patientName} (DNI {selectedRequestForReview.patientDni})
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.25rem' }}>
                  <strong>Fecha de atención solicitada:</strong> {selectedRequestForReview.consultationDate}
                </div>

                {/* Justificación */}
                <div style={{ marginTop: '0.65rem', background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1.5px solid #D2E3FC' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#076ABC', textTransform: 'uppercase', marginBottom: '3px' }}>
                    Justificación Médica Asentada:
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#0f172a', fontStyle: 'italic', lineHeight: 1.4 }}>
                    "{selectedRequestForReview.justification}"
                  </div>
                </div>

                {/* Items solicitados */}
                {selectedRequestForReview.requestedSections && (
                  <div style={{ marginTop: '0.65rem' }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '3px' }}>
                      Secciones requeridas:
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {Object.entries(selectedRequestForReview.requestedSections).map(([k, v]) =>
                        v ? (
                          <span key={k} style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.72rem', padding: '2px 7px', borderRadius: '4px', fontWeight: 700 }}>
                            ✓ {k === 'diagnosis' ? 'Diagnóstico' : k === 'evolution' ? 'Evolución' : k === 'prescriptions' ? 'Prescripciones' : k === 'studies' ? 'Estudios' : k === 'indications' ? 'Indicaciones' : 'Signos Vitales'}
                          </span>
                        ) : null
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* INTERACTIVE DOUBLE CONFIRMATION FLOW (EXACT USER REQUIREMENT) */}
              {/* Step 0: Initial Decision Buttons */}
              {confirmationStep === null && (
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    Seleccione la resolución para esta solicitud. Se requerirá doble confirmación según protocolo legal.
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <button
                      type="button"
                      onClick={() => setConfirmationStep('deny_first')}
                      style={{
                        background: '#fef2f2',
                        border: '1.5px solid #fecaca',
                        color: '#991b1b',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        fontSize: '0.88rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <X size={16} />
                      <span>Denegar Acceso</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmationStep('accept_first')}
                      style={{
                        background: '#059669',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        fontSize: '0.88rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
                      }}
                    >
                      <Check size={16} />
                      <span>Autorizar Acceso</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Flow A: Accept Step 1 ("Aceptar: si/no") */}
              {confirmationStep === 'accept_first' && (
                <div style={{ background: '#ecfdf5', border: '1.5px solid #a7f3d0', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.96rem', fontWeight: 900, color: '#065f46', marginBottom: '0.5rem' }}>
                    ¿Aceptar la solicitud de acceso a esta historia clínica?
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#047857', margin: '0 0 1rem' }}>
                    Otorgará acceso al Dr. {selectedRequestForReview.requesterDoctorName} para visualizar las secciones solicitadas.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => setConfirmationStep(null)}
                      style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', padding: '0.55rem 1.25rem', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmationStep('accept_second')}
                      style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '0.55rem 1.4rem', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 900, cursor: 'pointer' }}
                    >
                      Sí, continuar
                    </button>
                  </div>
                </div>
              )}

              {/* Flow A: Accept Step 2 ("seguro? si/no") */}
              {confirmationStep === 'accept_second' && (
                <div style={{ background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                  <AlertTriangle size={28} color="#d97706" style={{ marginBottom: '0.4rem' }} />
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#92400e', marginBottom: '0.4rem' }}>
                    ¿Está seguro?
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#78350f', margin: '0 0 1rem', lineHeight: 1.4 }}>
                    Esta acción desbloqueará formalmente los registros médicos de {selectedRequestForReview.patientName} para el colega. La autorización quedará registrada con hash inmutable bajo la Ley 26.529.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => setConfirmationStep(null)}
                      style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', padding: '0.55rem 1.25rem', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      No, cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExecuteDecision('approve')}
                      style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '0.55rem 1.4rem', borderRadius: '8px', fontSize: '0.86rem', fontWeight: 900, cursor: 'pointer', boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)' }}
                    >
                      Sí, autorizar definitivamente
                    </button>
                  </div>
                </div>
              )}

              {/* Flow B: Deny Step 1 ("Denegar: si/no") */}
              {confirmationStep === 'deny_first' && (
                <div style={{ background: '#fee2e2', border: '1.5px solid #fca5a5', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.96rem', fontWeight: 900, color: '#991b1b', marginBottom: '0.5rem' }}>
                    ¿Denegar la solicitud de acceso a este profesional?
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#7f1d1d', margin: '0 0 1rem' }}>
                    El registro clínico continuará bloqueado para el Dr. {selectedRequestForReview.requesterDoctorName}.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => setConfirmationStep(null)}
                      style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', padding: '0.55rem 1.25rem', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmationStep('deny_second')}
                      style={{ background: '#dc2626', color: '#ffffff', border: 'none', padding: '0.55rem 1.4rem', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 900, cursor: 'pointer' }}
                    >
                      Sí, continuar
                    </button>
                  </div>
                </div>
              )}

              {/* Flow B: Deny Step 2 ("seguro? si/no") */}
              {confirmationStep === 'deny_second' && (
                <div style={{ background: '#fef2f2', border: '2px solid #ef4444', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                  <AlertCircle size={28} color="#dc2626" style={{ marginBottom: '0.4rem' }} />
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#991b1b', marginBottom: '0.4rem' }}>
                    ¿Está completamente seguro?
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#7f1d1d', margin: '0 0 1rem', lineHeight: 1.4 }}>
                    Se denegará el requerimiento de interconsulta. El colega será notificado del rechazo bajo constancia del secreto profesional.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => setConfirmationStep(null)}
                      style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', padding: '0.55rem 1.25rem', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      No, cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExecuteDecision('deny')}
                      style={{ background: '#b91c1c', color: '#ffffff', border: 'none', padding: '0.55rem 1.4rem', borderRadius: '8px', fontSize: '0.86rem', fontWeight: 900, cursor: 'pointer' }}
                    >
                      Sí, denegar definitivamente
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
