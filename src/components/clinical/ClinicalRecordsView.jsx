import React, { useState } from 'react';
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
  Zap
} from 'lucide-react';
import { NewConsultationModal } from './NewConsultationModal';
import { ConsultationPrintView } from './ConsultationPrintView';
import { PatientDetailModal } from '../patients/PatientDetailModal';
import { ClinicalAdendaModal } from './ClinicalAdendaModal';
import { PrescriptionDigitalModal } from './PrescriptionDigitalModal';
import { ConsentFormsModal } from './ConsentFormsModal';
import { MedicalOrderModal } from './MedicalOrderModal';
import { MedicalCertificateModal } from './MedicalCertificateModal';
import { DigitalSignatureModal } from '../pki/DigitalSignatureModal';

export const ClinicalRecordsView = () => {
  const {
    consultations,
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
  const [selectedDoctor, setSelectedDoctor] = useState('all');

  const filteredConsultations = consultations.filter((c) => {
    const cleanQ = searchTerm.toLowerCase().trim();
    const matchSearch =
      cleanQ === '' ||
      c.patientName.toLowerCase().includes(cleanQ) ||
      (c.diagnosis && c.diagnosis.toLowerCase().includes(cleanQ)) ||
      (c.reason && c.reason.toLowerCase().includes(cleanQ)) ||
      (c.patientDni && c.patientDni.includes(cleanQ)) ||
      (c.doctorName && c.doctorName.toLowerCase().includes(cleanQ));

    const matchDoctor = selectedDoctor === 'all' || c.doctorId === selectedDoctor;
    return matchSearch && matchDoctor;
  });

  const getInitials = (name) => {
    if (!name) return 'PT';
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const todayConsultationsCount = consultations.filter((c) => c.date === '2026-08-28').length;

  return (
    <div className="view-container">
      {/* Global Modals */}
      <NewConsultationModal />
      <ConsultationPrintView />
      <PatientDetailModal />
      <ClinicalAdendaModal />
      <PrescriptionDigitalModal />
      <ConsentFormsModal />
      <MedicalOrderModal />
      <MedicalCertificateModal />
      <DigitalSignatureModal />

      {/* 1. HERO HEADER */}
      <div className="view-header" style={{ marginBottom: '1.25rem' }}>
        <div>
          <div className="badge-wrapper" style={{ marginBottom: '0.35rem' }}>
            <span className="badge badge-teal">
              <Stethoscope size={13} style={{ marginRight: '4px' }} />
              Historia Clínica Electrónica (HCE) & Registros Médicos
            </span>
          </div>
          <h1 className="view-title">Historia Clínica Electrónica</h1>
          <p className="view-subtitle">
            Registro cronológico de consultas, evoluciones traumatológicas, exámenes físicos, recetas y derivaciones.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setIsConsentModalOpen(true)}
          >
            <FileCheck2 size={16} />
            <span>Consentimientos</span>
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setIsMedicalOrderModalOpen(true)}
          >
            <FileText size={16} />
            <span>+ Orden Médica</span>
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setIsMedicalCertificateModalOpen(true)}
          >
            <ShieldCheck size={16} />
            <span>+ Certificado</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setConsultationPreloadData(null);
              setIsNewConsultationModalOpen(true);
            }}
          >
            <Plus size={18} />
            <span>+ Nueva Consulta</span>
          </button>
        </div>
      </div>

      {/* 2. OPERATIONAL KPI BENTO STRIP */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}
      >
        <div className="stat-card-premium" style={{ padding: '1.15rem 1.25rem' }}>
          <div className="stat-card-top">
            <span className="stat-card-label">Total de Consultas</span>
            <div className="stat-icon-box" style={{ width: '38px', height: '38px' }}>
              <FileText size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <div className="stat-card-value">{consultations.length}</div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              registros clínicos
            </span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Evoluciones cronológicas
          </div>
        </div>

        <div className="stat-card-premium" style={{ padding: '1.15rem 1.25rem' }}>
          <div className="stat-card-top">
            <span className="stat-card-label">Consultas de Hoy</span>
            <div className="stat-icon-box" style={{ width: '38px', height: '38px', background: '#EBF3FD', color: 'var(--c-primary)' }}>
              <Calendar size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <div className="stat-card-value" style={{ color: 'var(--c-dark)' }}>{todayConsultationsCount}</div>
            <span style={{ fontSize: '0.8rem', color: 'var(--c-primary)', fontWeight: 700 }}>
              atendidas hoy
            </span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Con firma digital asentada
          </div>
        </div>

        <div className="stat-card-premium" style={{ padding: '1.15rem 1.25rem' }}>
          <div className="stat-card-top">
            <span className="stat-card-label">Pacientes en Seguimiento</span>
            <div className="stat-icon-box" style={{ width: '38px', height: '38px' }}>
              <User size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <div className="stat-card-value">{patients.length}</div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              con historia abierta
            </span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Traumatología & Kinesiología
          </div>
        </div>

        <div className="stat-card-premium" style={{ padding: '1.15rem 1.25rem' }}>
          <div className="stat-card-top">
            <span className="stat-card-label">Firma Digital & Validez</span>
            <div className="stat-icon-box" style={{ width: '38px', height: '38px', background: '#d1fae5', color: '#065f46' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <div className="stat-card-value" style={{ color: '#065f46' }}>100%</div>
            <span style={{ fontSize: '0.8rem', color: '#065f46', fontWeight: 700 }}>
              selladas
            </span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Certificados X.509 activos
          </div>
        </div>
      </div>

      {/* 3. ADVANCED SEARCH & FILTER BAR */}
      <div
        className="card"
        style={{
          padding: '0.85rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          border: '1px solid var(--border-color)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px', maxWidth: '480px', position: 'relative' }}>
          <Search size={17} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '34px', fontSize: '0.86rem', width: '100%' }}
            placeholder="Buscar por paciente, DNI, diagnóstico CIE-10 o motivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select
            className="form-select"
            style={{ width: '220px', fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
          >
            <option value="all">Todos los Médicos</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.name} ({d.specialtyName.split(' ')[0]})</option>
            ))}
          </select>

          {searchTerm && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.78rem' }}
              onClick={() => setSearchTerm('')}
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* 4. CHRONOLOGICAL LIST OF MEDICAL CONSULTATIONS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filteredConsultations.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <Stethoscope size={40} color="var(--c-accent)" style={{ marginBottom: '0.75rem' }} />
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
              No se encontraron registros clínicos con los filtros actuales.
            </div>
            <p style={{ fontSize: '0.84rem', marginTop: '4px' }}>Prueba cambiando los términos de búsqueda o el médico seleccionado.</p>
          </div>
        ) : (
          filteredConsultations.map((cons) => {
            const pat = patients.find((p) => p.id === cons.patientId);

            return (
              <div
                key={cons.id}
                className="card"
                style={{
                  borderLeft: '5px solid var(--c-primary)',
                  padding: '1.35rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {/* Top Info Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: 'var(--primary-light)',
                        color: 'var(--c-primary)',
                        fontWeight: 900,
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {getInitials(cons.patientName)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                        <span
                          style={{ fontWeight: 900, fontSize: '1.15rem', color: 'var(--text-main)', cursor: 'pointer' }}
                          onClick={() => {
                            if (pat) setSelectedPatientForDetail(pat);
                          }}
                          className="hover-underline"
                        >
                          {cons.patientName}
                        </span>
                        <span
                          style={{
                            fontSize: '0.76rem',
                            background: 'var(--bg-subtle)',
                            color: 'var(--c-dark)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 800
                          }}
                        >
                          DNI {cons.patientDni || pat?.dni || '-'}
                        </span>
                        <span
                          style={{
                            fontSize: '0.76rem',
                            background: '#f1f5f9',
                            color: '#475569',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 700
                          }}
                        >
                          {cons.date} — {cons.time} hs
                        </span>
                      </div>

                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                        Profesional: <strong>{cons.doctorName}</strong> ({cons.specialtyName}) · Matrícula: {cons.doctorLicense}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setAdendaTargetConsultation(cons);
                        setIsAdendaModalOpen(true);
                      }}
                      title="Asentar adenda médica evolutiva"
                    >
                      <FileEdit size={14} />
                      <span>+ Adenda Médica</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        if (pat) setSelectedPatientForDetail(pat);
                      }}
                    >
                      <User size={14} />
                      <span>Ficha</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => setSelectedConsultationForPrint(cons)}
                    >
                      <Printer size={14} />
                      <span>Imprimir Informe</span>
                    </button>
                  </div>
                </div>

                {/* Vitals Summary Pill */}
                {cons.vitals && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '1.25rem',
                      background: 'var(--bg-subtle)',
                      padding: '0.55rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      color: 'var(--text-main)',
                      flexWrap: 'wrap',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <span><strong>T.A:</strong> {cons.vitals.bpSystolic}/{cons.vitals.bpDiastolic} mmHg</span>
                    <span><strong>F.C:</strong> {cons.vitals.heartRate} lpm</span>
                    <span><strong>Temp:</strong> {cons.vitals.temperature} °C</span>
                    <span><strong>Peso:</strong> {cons.vitals.weight} kg</span>
                    <span><strong>IMC:</strong> {cons.vitals.bmi} ({cons.vitals.bmiCategory})</span>
                  </div>
                )}

                {/* Clinical Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
                  <div>
                    <strong style={{ color: 'var(--text-main)' }}>Motivo de Consulta:</strong>{' '}
                    <span style={{ color: 'var(--text-body)' }}>{cons.reason}</span>
                  </div>

                  {cons.symptoms && (
                    <div style={{ color: 'var(--text-body)' }}>
                      <strong>Síntomas & Anamnesis:</strong> {cons.symptoms}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <strong>Diagnóstico (CIE-10):</strong>
                    <span
                      style={{
                        background: '#EBF3FD',
                        color: '#002182',
                        padding: '3px 10px',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '0.84rem'
                      }}
                    >
                      {cons.diagnosis}
                    </span>
                    {cons.secondaryDiagnosis && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Secundario: {cons.secondaryDiagnosis}
                      </span>
                    )}
                  </div>

                  {cons.physicalExam && (
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '0.75rem 1rem',
                        fontSize: '0.84rem',
                        color: 'var(--text-body)'
                      }}
                    >
                      <strong style={{ color: 'var(--text-main)' }}>Examen Físico Traumatológico / Articular:</strong>
                      <p style={{ marginTop: '3px', lineHeight: 1.5 }}>{cons.physicalExam}</p>
                    </div>
                  )}

                  {/* Prescribed Medications */}
                  {cons.prescriptions && cons.prescriptions.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '2px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-muted)' }}>Tratamiento Farmacológico:</span>
                      {cons.prescriptions.map((rx, rIdx) => (
                        <span
                          key={rIdx}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: '#EBF3FD',
                            border: '1px solid #257CE6',
                            color: '#002182',
                            padding: '3px 10px',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 700
                          }}
                        >
                          <Pill size={13} style={{ flexShrink: 0 }} />
                          <span>{rx.drugName} ({rx.presentation}) — {rx.dosage}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Clinical Indications */}
                  {cons.indications && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-body)', marginTop: '2px' }}>
                      <strong>Indicaciones Terapéuticas:</strong> {cons.indications}
                    </div>
                  )}
                </div>

                {/* Footer Security Badge */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '0.65rem',
                    fontSize: '0.76rem',
                    color: 'var(--text-muted)',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: 700 }}>
                    <CheckCircle2 size={14} color="#10b981" />
                    <span>Documento clínico firmado digitalmente</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Firma Digital: <strong>{cons.doctorName}</strong> ({cons.signatureTimestamp})</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
