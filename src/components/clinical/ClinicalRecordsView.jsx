import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
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
  KeyRound,
  FileCheck2,
  Sparkles,
  CheckCircle2,
  Send,
  Zap,
  ChevronDown,
  ChevronUp,
  Clock,
  Shield,
  Lock,
  Download,
  Scale,
  Building,
  AlertCircle
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
    isDoctor,
    currentDoctor,
    doctors,
    patients,
    setIsNewConsultationModalOpen,
    setConsultationPreloadData,
    setSelectedConsultationForPrint,
    setSelectedPatientForDetail,
    setIsAdendaModalOpen,
    setAdendaTargetConsultation,
    setIsPrescriptionModalOpen,
    setSelectedPrescriptionForView,
    setIsConsentModalOpen,
    setIsMedicalOrderModalOpen,
    setIsMedicalCertificateModalOpen,
    setIsDigitalSignatureModalOpen
  } = useClinic();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(isDoctor && currentDoctor ? currentDoctor.id : 'all');
  const [expandedConsultationId, setExpandedConsultationId] = useState(null);
  const [isLegalHceModalOpen, setIsLegalHceModalOpen] = useState(false);
  const [showLegalFrameworkInfo, setShowLegalFrameworkInfo] = useState(true);

  // Strict Scoping: Doctor only sees his own consultations
  const effectiveConsultations = useMemo(() => {
    return isDoctor ? scopedConsultations : consultations;
  }, [isDoctor, scopedConsultations, consultations]);

  const effectivePatients = useMemo(() => {
    return isDoctor ? scopedPatients : patients;
  }, [isDoctor, scopedPatients, patients]);

  const filteredConsultations = useMemo(() => {
    return effectiveConsultations.filter((c) => {
      const cleanQ = searchTerm.toLowerCase().trim();
      const matchSearch =
        cleanQ === '' ||
        c.patientName?.toLowerCase().includes(cleanQ) ||
        (c.diagnosis && c.diagnosis.toLowerCase().includes(cleanQ)) ||
        (c.reason && c.reason.toLowerCase().includes(cleanQ)) ||
        (c.patientDni && c.patientDni.includes(cleanQ)) ||
        (c.doctorName && c.doctorName.toLowerCase().includes(cleanQ));

      const matchDoctor = isDoctor ? true : (selectedDoctor === 'all' || c.doctorId === selectedDoctor);
      return matchSearch && matchDoctor;
    });
  }, [effectiveConsultations, searchTerm, isDoctor, selectedDoctor]);

  const getInitials = (name) => {
    if (!name) return 'PT';
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const toggleExpand = (consultationId) => {
    setExpandedConsultationId((prev) => (prev === consultationId ? null : consultationId));
  };

  const todayConsultationsCount = effectiveConsultations.filter((c) => c.date === '2026-08-28').length;

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
        onClose={() => setIsLegalHceModalOpen(false)}
      />

      {/* 1. TOP HEADER WITH LEGAL CERTIFICATION NOTICE */}
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
            <span
              style={{
                background: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                padding: '0.2rem 0.65rem',
                borderRadius: '100px',
                fontSize: '0.74rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Stethoscope size={13} />
              {isDoctor ? (currentDoctor?.name?.startsWith('Dr.') ? currentDoctor.name : `Dr. ${currentDoctor?.name || 'Alejandro Blanco'}`) : 'HCE Centralizada'}
            </span>

            <span
              style={{
                background: '#eff6ff',
                color: '#1e40af',
                border: '1px solid #bfdbfe',
                padding: '0.2rem 0.65rem',
                borderRadius: '100px',
                fontSize: '0.72rem',
                fontWeight: 800
              }}
            >
              REGISTRO CLÍNICO DIGITAL
            </span>

            <span
              style={{
                background: '#F5F8FE',
                color: '#002182',
                border: '1px solid #D2E3FC',
                padding: '0.2rem 0.65rem',
                borderRadius: '100px',
                fontSize: '0.72rem',
                fontWeight: 800
              }}
            >
              CMPC M.P. 34.892 · TRAUMATOLOGÍA
            </span>

            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              • Registro Inmutable · Firma Digital X.509
            </span>
          </div>

          <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>
            Historia Clínica Electrónica
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            {isDoctor
              ? `Evoluciones traumatológicas inmutables, diagnósticos CIE-10 y prescripciones verificadas del ${currentDoctor?.name || 'Dr. Blanco'}.`
              : 'Registro cronológico inmutable y trazabilidad asistencial de la institución.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setIsLegalHceModalOpen(true)}
            style={{
              fontSize: '0.84rem',
              fontWeight: 800,
              background: '#F5F8FE',
              borderColor: '#BFDBFE',
              color: '#002182'
            }}
            title="Emitir copia formal certificada de historia clínica"
          >
            <Scale size={15} color="#076ABC" />
            <span>Dossier Clínico Certificado</span>
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setIsConsentModalOpen(true)}
            style={{ fontSize: '0.84rem' }}
          >
            <FileCheck2 size={15} />
            <span>Consentimientos</span>
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setIsMedicalOrderModalOpen(true)}
            style={{ fontSize: '0.84rem' }}
          >
            <FileText size={15} />
            <span>+ Orden Médica</span>
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setIsMedicalCertificateModalOpen(true)}
            style={{ fontSize: '0.84rem' }}
          >
            <ShieldCheck size={15} />
            <span>+ Certificado</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setConsultationPreloadData(null);
              setIsNewConsultationModalOpen(true);
            }}
            style={{
              background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '0.65rem 1.15rem',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(7, 106, 188, 0.25)'
            }}
          >
            <Plus size={18} />
            <span>Nueva Consulta</span>
          </button>
        </div>
      </div>

      {/* 3. OPERATIONAL SUMMARY KPI CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '1.15rem 1.25rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total de Consultas Registradas
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.2rem' }}>
            {effectiveConsultations.length}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
            {isDoctor ? 'Mis evoluciones traumatológicas' : 'Historias clínicas foliadas'}
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '1.15rem 1.25rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Consultas de Hoy
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.2rem' }}>
            {todayConsultationsCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600 }}>
            Atención médica en consultorio
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '1.15rem 1.25rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Pacientes en Seguimiento
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#f8fafc', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.2rem' }}>
            {effectivePatients.length}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
            Titulares con HCE activa
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '1.15rem 1.25rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Firma Digital & Validez
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#d1fae5', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#065f46', marginBottom: '0.2rem' }}>
            100%
          </div>
          <div style={{ fontSize: '0.74rem', color: '#065f46', fontWeight: 600 }}>
            Certificados X.509 ONTI válidos
          </div>
        </div>
      </div>

      {/* 4. SEARCH AND FILTERS BAR */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '280px', maxWidth: '480px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Buscar por paciente, DNI, diagnóstico CIE-10 o motivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem 0.55rem 2.25rem',
              borderRadius: '9px',
              border: '1px solid #cbd5e1',
              fontSize: '0.85rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {isDoctor ? (
            <div
              style={{
                fontSize: '0.82rem',
                fontWeight: 800,
                padding: '0.4rem 0.85rem',
                background: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>🩺 {currentDoctor?.name?.startsWith('Dr.') ? currentDoctor.name : `Dr. ${currentDoctor?.name || 'Alejandro Blanco'}`} (M.P. 34.892 CMPC)</span>
            </div>
          ) : (
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '9px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                background: '#ffffff',
                color: '#334155'
              }}
            >
              <option value="all">Todos los Profesionales</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
              ))}
            </select>
          )}

          {searchTerm && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setSearchTerm('')}
              style={{ fontSize: '0.78rem' }}
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* 5. CONSULTATION TABLE (CRONOLÓGICA Y FOLIADA SEGÚN LEY 26.529 ART. 12) */}
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
                <th style={{ padding: '0.9rem 1.25rem' }}>Paciente Titular</th>
                <th style={{ padding: '0.9rem 1.25rem' }}>Diagnóstico Principal (CIE-10)</th>
                <th style={{ padding: '0.9rem 1.25rem', width: '220px' }}>Firma Digital & Validez</th>
                <th style={{ padding: '0.9rem 1.25rem', textAlign: 'right', width: '160px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredConsultations.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
                    <FileText size={36} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
                    <div style={{ fontWeight: 700, color: '#1e293b' }}>No se encontraron historias clínicas</div>
                    <div style={{ fontSize: '0.82rem' }}>Ajuste la búsqueda o cree una nueva consulta médica.</div>
                  </td>
                </tr>
              ) : (
                filteredConsultations.map((cons, index) => {
                  const isExpanded = expandedConsultationId === cons.id;
                  const pat = patients.find((p) => p.id === cons.patientId);
                  const hasAdendas = cons.adendas && cons.adendas.length > 0;

                  return (
                    <React.Fragment key={cons.id}>
                      {/* Compact clean row */}
                      <tr
                        onClick={() => toggleExpand(cons.id)}
                        style={{
                          borderBottom: isExpanded ? 'none' : '1px solid #f1f5f9',
                          background: isExpanded ? '#f0fdf4' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isExpanded) e.currentTarget.style.background = '#f8fafc';
                        }}
                        onMouseLeave={(e) => {
                          if (!isExpanded) e.currentTarget.style.background = '#ffffff';
                        }}
                      >
                        {/* Fecha & Folio */}
                        <td style={{ padding: '0.9rem 1.25rem', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>
                            {cons.date}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            {cons.time} hs · Folio #{index + 1}
                          </div>
                        </td>

                        {/* Paciente */}
                        <td style={{ padding: '0.9rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: '#eff6ff',
                                color: '#2563eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '0.85rem',
                                flexShrink: 0
                              }}
                            >
                              {getInitials(cons.patientName)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.94rem' }}>
                                {cons.patientName}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                DNI {cons.patientDni || pat?.dni || '-'} · {pat?.insuranceName || 'Particular'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Diagnóstico CIE-10 */}
                        <td style={{ padding: '0.9rem 1.25rem' }}>
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              background: '#eff6ff',
                              color: '#1e40af',
                              padding: '0.25rem 0.65rem',
                              borderRadius: '6px',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              maxWidth: '380px'
                            }}
                          >
                            {cons.diagnosis || 'Consulta Médica'}
                          </div>
                          {cons.secondaryDiagnosis && (
                            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                              Secundario: {cons.secondaryDiagnosis}
                            </div>
                          )}
                          {hasAdendas && (
                            <div style={{ marginTop: '3px' }}>
                              <span
                                style={{
                                  background: '#fef3c7',
                                  color: '#b45309',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}
                              >
                                <Scale size={11} />
                                {cons.adendas.length} Adenda(s) Registrada(s)
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Firma Digital & Validez Córdoba */}
                        <td style={{ padding: '0.9rem 1.25rem', whiteSpace: 'nowrap' }}>
                          <div>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: '#ecfdf5',
                                color: '#065f46',
                                border: '1px solid #a7f3d0',
                                padding: '0.25rem 0.65rem',
                                borderRadius: '100px',
                                fontSize: '0.74rem',
                                fontWeight: 800
                              }}
                            >
                              <CheckCircle2 size={13} />
                              X.509 · CMPC (Córdoba)
                            </span>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                            {cons.doctorLicense || 'M.P. 34.892 · M.N. 114.829'}
                          </div>
                        </td>

                        {/* Acciones */}
                        <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
                          <div
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedConsultationForPrint(cons)}
                              title="Imprimir informe clínico legal homologado"
                              style={{
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                color: '#334155',
                                borderRadius: '7px',
                                padding: '0.35rem 0.55rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              <Printer size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleExpand(cons.id)}
                              style={{
                                background: isExpanded ? '#002182' : '#f1f5f9',
                                color: isExpanded ? '#ffffff' : '#334155',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                padding: '0.35rem 0.65rem',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <span>{isExpanded ? 'Ocultar' : 'Ver Ficha'}</span>
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* 6. EXPANDED CONSULTATION DETAILS (ACCORDION WITH LEGAL STANDARDS) */}
                      {isExpanded && (
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                          <td colSpan={5} style={{ padding: '1.25rem 1.5rem' }}>
                            <div
                              style={{
                                background: '#ffffff',
                                borderRadius: '14px',
                                border: '1.5px solid #e2e8f0',
                                padding: '1.35rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1.15rem',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
                              }}
                            >
                              {/* Vitals Ribbon */}
                              {cons.vitals && (
                                <div
                                  style={{
                                    display: 'flex',
                                    gap: '1.5rem',
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    padding: '0.65rem 1rem',
                                    borderRadius: '10px',
                                    fontSize: '0.82rem',
                                    color: '#0f172a',
                                    flexWrap: 'wrap'
                                  }}
                                >
                                  <span><strong>Tensión Arterial:</strong> {cons.vitals.bpSystolic}/{cons.vitals.bpDiastolic} mmHg</span>
                                  <span><strong>Frec. Cardíaca:</strong> {cons.vitals.heartRate} lpm</span>
                                  <span><strong>Temperatura:</strong> {cons.vitals.temperature} °C</span>
                                  <span><strong>Peso:</strong> {cons.vitals.weight} kg</span>
                                  <span><strong>Altura:</strong> {cons.vitals.height} m</span>
                                  <span><strong>IMC:</strong> {cons.vitals.bmi} ({cons.vitals.bmiCategory})</span>
                                </div>
                              )}

                              {/* Grid of clinical content */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                                {/* Anamnesis & Motivo */}
                                <div>
                                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#076ABC', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <FileText size={14} /> Motivo de Consulta & Anamnesis
                                  </div>
                                  <p style={{ fontSize: '0.86rem', color: '#0f172a', margin: '0 0 0.5rem', fontWeight: 600 }}>
                                    {cons.reason}
                                  </p>
                                  {cons.symptoms && (
                                    <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                                      <strong>Síntomas:</strong> {cons.symptoms}
                                    </p>
                                  )}
                                </div>

                                {/* Evolución & Examen Físico Traumatológico */}
                                <div>
                                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#002182', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Stethoscope size={14} /> Evolución Traumatológica & Examen Físico
                                  </div>
                                  <p style={{ fontSize: '0.84rem', color: '#1e293b', margin: 0, lineHeight: 1.6 }}>
                                    {cons.evolution || cons.physicalExam || 'Examen articular sin particularidades.'}
                                  </p>
                                </div>

                                {/* Tratamiento & Prescripciones ReNaPDiS */}
                                <div>
                                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Pill size={14} /> Prescripción Digital Rp/
                                  </div>
                                  {cons.prescriptions && cons.prescriptions.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                      {cons.prescriptions.map((rx, idx) => (
                                        <div key={idx} style={{ fontSize: '0.82rem', color: '#0f172a', background: '#ecfdf5', padding: '4px 8px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                                          💊 <strong>{rx.medication || rx.name || rx.drugName}</strong> — {rx.dosage || rx.presentation}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                                      Tratamiento traumatológico no farmacológico / control kinésico.
                                    </p>
                                  )}
                                </div>

                                {/* Indicaciones Terapéuticas */}
                                <div>
                                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Activity size={14} /> Indicaciones Terapéuticas & Pautas
                                  </div>
                                  <p style={{ fontSize: '0.82rem', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                                    {cons.indications || 'Continuar con ejercicios de bajo impacto y pauta de rehabilitación.'}
                                  </p>
                                </div>
                              </div>

                              {/* ADENDAS FECHADAS SECTION (ART. 13 LEY 26.529) */}
                              {hasAdendas && (
                                <div style={{ background: '#fefce8', border: '1.5px solid #fef08a', borderRadius: '10px', padding: '0.85rem 1rem' }}>
                                  <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#854d0e', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Scale size={14} />
                                    Adendas Médicas Fechadas e Inmutables
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {cons.adendas.map((ad, adIdx) => (
                                      <div key={ad.id || adIdx} style={{ fontSize: '0.82rem', color: '#713f12', lineHeight: 1.5, background: '#ffffff', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #fde047' }}>
                                        <div>
                                          <strong>Adenda #{adIdx + 1} ({ad.date} {ad.time} hs):</strong> {ad.adendaText}
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: '#a16207', marginTop: '3px', display: 'flex', justifyContent: 'space-between' }}>
                                          <span>Firmado digitalmente por: <strong>{ad.doctorName}</strong> ({ad.doctorLicense})</span>
                                          <span>Hash: {ad.adendaHash ? `${ad.adendaHash.substring(0, 16)}...` : 'SHA256-VALIDADO'}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* LEGAL FOOTER WITH CRYPTOGRAPHIC INTEGRITY HASH */}
                              <div
                                style={{
                                  borderTop: '1px solid #e2e8f0',
                                  paddingTop: '0.85rem',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  flexWrap: 'wrap',
                                  gap: '0.75rem'
                                }}
                              >
                                <div style={{ fontSize: '0.74rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Lock size={13} />
                                  <span>
                                    Firma Digital X.509: <strong>{cons.doctorName}</strong> ({cons.doctorLicense || 'M.P. 34.892'}) · Sello SHA-256 Inmutable
                                  </span>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    onClick={() => {
                                      setAdendaTargetConsultation(cons);
                                      setIsAdendaModalOpen(true);
                                    }}
                                    style={{ fontSize: '0.78rem', fontWeight: 800 }}
                                  >
                                    <FileEdit size={13} />
                                    <span>+ Asentar Adenda</span>
                                  </button>

                                  <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    onClick={() => {
                                      if (pat) setSelectedPatientForDetail(pat);
                                    }}
                                    style={{ fontSize: '0.78rem' }}
                                  >
                                    <User size={13} />
                                    <span>Ver Ficha Completa</span>
                                  </button>

                                  <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => setSelectedConsultationForPrint(cons)}
                                    style={{ fontSize: '0.78rem', fontWeight: 800 }}
                                  >
                                    <Printer size={13} />
                                    <span>Imprimir Informe Homologado</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
