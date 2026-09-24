import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import { LegalHceCertificateModal } from '../clinical/LegalHceCertificateModal';
import {
  User,
  Calendar,
  Shield,
  FileText,
  AlertTriangle,
  Upload,
  Edit2,
  CalendarPlus,
  Stethoscope,
  Printer,
  Trash2,
  Download,
  Activity,
  FileCheck2,
  Pill,
  Check,
  CheckCircle2
} from 'lucide-react';

export const PatientDetailModal = () => {
  const {
    selectedPatientForDetail,
    setSelectedPatientForDetail,
    appointments,
    consultations,
    rehabPlans,
    isDoctor,
    setIsPatientFormModalOpen,
    setPatientFormModalData,
    setIsAppointmentModalOpen,
    setAppointmentModalData,
    setIsNewConsultationModalOpen,
    setConsultationPreloadData,
    setSelectedConsultationForPrint,
    addPatientFile,
    deletePatient,
    addToast
  } = useClinic();

  const [activeTab, setActiveTab] = useState('general'); // 'general', 'hce', 'rehab', 'appointments', 'files', 'antecedentes'
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState('Resonancia Magnética (RMN)');
  const [isLegalHceModalOpen, setIsLegalHceModalOpen] = useState(false);

  useEffect(() => {
    if (!isDoctor && activeTab !== 'general' && activeTab !== 'appointments') {
      setActiveTab('general');
    }
  }, [isDoctor, activeTab]);

  if (!selectedPatientForDetail) return null;

  const patient = selectedPatientForDetail;

  // Calculate age
  const calculateAge = (bDate) => {
    if (!bDate) return '-';
    try {
      const birth = new Date(bDate);
      const today = new Date('2026-08-28');
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return `${age} años`;
    } catch {
      return '-';
    }
  };

  // Filter patient records
  const patientAppointments = appointments.filter((a) => a.patientId === patient.id);
  const patientConsultations = consultations.filter((c) => c.patientId === patient.id);
  const patientRehabPlans = rehabPlans.filter((r) => r.patientId === patient.id);

  // File upload handler
  const handleUploadFile = (e) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    const fileObj = {
      id: `f-${Date.now()}`,
      name: newFileName.endsWith('.pdf') ? newFileName : `${newFileName}.pdf`,
      type: newFileType,
      size: `${(Math.random() * 2 + 0.8).toFixed(1)} MB`,
      date: '2026-08-28',
      hashSha256: `sha256_${Math.random().toString(36).substring(2, 15)}`
    };
    addPatientFile(patient.id, fileObj);
    setNewFileName('');
    addToast('Estudio Adjuntado', 'El archivo fue incorporado a la Historia Clínica con Hash SHA-256.', 'success');
  };

  return (
    <Modal
      isOpen={!!selectedPatientForDetail}
      onClose={() => setSelectedPatientForDetail(null)}
      title={isDoctor ? `Ficha Clínica Integral — ${patient.name}` : `Ficha de Afiliado — ${patient.name}`}
      size="xl"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => {
                if (window.confirm(`¿Está seguro de eliminar permanentemente al paciente ${patient.name}?`)) {
                  deletePatient(patient.id);
                  setSelectedPatientForDetail(null);
                }
              }}
            >
              <Trash2 size={15} />
              <span>Eliminar Paciente</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            {isDoctor && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsLegalHceModalOpen(true)}
                style={{
                  borderColor: '#076ABC',
                  color: '#076ABC',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FileCheck2 size={16} color="#076ABC" />
                <span>Exportar Historial (PDF Firmado)</span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setAppointmentModalData({
                  patientId: patient.id,
                  patientName: patient.name,
                  patientPhone: patient.phone,
                  patientDni: patient.dni,
                  patientInsurance: `${patient.insuranceName} (${patient.insurancePlan})`
                });
                setIsAppointmentModalOpen(true);
              }}
            >
              <CalendarPlus size={16} />
              <span>+ Agendar Turno</span>
            </button>

            {isDoctor && (
              <button
                type="button"
                className="btn btn-outline"
                style={{ borderColor: '#059669', color: '#059669', fontWeight: 800 }}
                onClick={() => {
                  setConsultationPreloadData({
                    patientId: patient.id,
                    patientName: patient.name,
                    patientDni: patient.dni,
                    patientInsurance: patient.insuranceName
                  });
                  setIsNewConsultationModalOpen(true);
                }}
              >
                <Stethoscope size={16} />
                <span>+ Nueva Consulta HCE</span>
              </button>
            )}
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* 1. TOP PATIENT HEADER BANNER (NO FOTO, NO FACTOR SANGUINEO, ULTRA LIMPIO) */}
        <div
          style={{
            background: 'linear-gradient(135deg, #001f66 0%, #076ABC 100%)',
            borderRadius: '16px',
            padding: '1.35rem 1.75rem',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 8px 24px rgba(0, 33, 130, 0.18)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
                {patient.name}
              </h2>
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.22)',
                  color: '#ffffff',
                  padding: '3px 10px',
                  borderRadius: '100px',
                  fontSize: '0.78rem',
                  fontWeight: 800
                }}
              >
                DNI {patient.dni}
              </span>
              <span
                style={{
                  background: '#EBF3FD',
                  color: '#002182',
                  padding: '3px 12px',
                  borderRadius: '100px',
                  fontSize: '0.78rem',
                  fontWeight: 900
                }}
              >
                {patient.insuranceName} ({patient.insurancePlan})
              </span>
            </div>

            <div style={{ fontSize: '0.86rem', color: '#D2E3FC', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span>{calculateAge(patient.birthDate)} ({patient.birthDate})</span>
              <span>•</span>
              <span>Género: {patient.gender}</span>
              <span>•</span>
              <span>Tel: {patient.phone}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <a
              href={`https://wa.me/${patient.phone?.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#25D366',
                color: '#ffffff',
                fontWeight: 800,
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '8px',
                padding: '0.45rem 0.95rem',
                fontSize: '0.84rem',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(37, 211, 102, 0.35)',
                transition: 'transform 0.15s ease'
              }}
              title="Abrir chat oficial de WhatsApp"
            >
              <WhatsAppIcon size={16} color="#ffffff" />
              <span>WhatsApp</span>
            </a>

            {isDoctor && (
              <button
                type="button"
                onClick={() => setIsLegalHceModalOpen(true)}
                style={{
                  background: '#ffffff',
                  color: '#002182',
                  fontWeight: 800,
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '8px',
                  padding: '0.45rem 0.95rem',
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 33, 130, 0.15)'
                }}
              >
                <FileCheck2 size={16} color="#002182" />
                <span>Exportar PDF</span>
              </button>
            )}

            <button
              type="button"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontWeight: 700,
                border: '1px solid rgba(255, 255, 255, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                borderRadius: '8px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.84rem',
                cursor: 'pointer'
              }}
              onClick={() => {
                setPatientFormModalData(patient);
                setIsPatientFormModalOpen(true);
              }}
            >
              <Edit2 size={14} />
              <span>Editar</span>
            </button>
          </div>
        </div>

        {/* 2. CLINICAL ALERTS & SURGICAL WARNINGS (SOLO MÉDICO) */}
        {isDoctor && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {patient.allergies && patient.allergies.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '0.65rem 1rem',
                  color: '#991b1b',
                  fontSize: '0.86rem'
                }}
              >
                <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
                <div>
                  <strong>ALERGIAS MEDICAMENTOSAS / ALIMENTARIAS:</strong> {patient.allergies.join(' · ')}
                </div>
              </div>
            )}

            {patient.antecedentes && patient.antecedentes.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '0.65rem 1rem',
                  color: '#166534',
                  fontSize: '0.84rem'
                }}
              >
                <Activity size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                <div>
                  <strong>ANTECEDENTE QUIRÚRGICO / TRAUMATOLÓGICO:</strong> {patient.antecedentes.join(' | ')}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. TABS NAVIGATION */}
        <div className="tabs-header" style={{ marginBottom: 0 }}>
          <button
            className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <User size={16} />
            <span>Datos & Cobertura</span>
          </button>

          {isDoctor && (
            <>
              <button
                className={`tab-btn ${activeTab === 'hce' ? 'active' : ''}`}
                onClick={() => setActiveTab('hce')}
              >
                <Stethoscope size={16} />
                <span>Historia Clínica ({patientConsultations.length})</span>
              </button>

              <button
                className={`tab-btn ${activeTab === 'rehab' ? 'active' : ''}`}
                onClick={() => setActiveTab('rehab')}
              >
                <Activity size={16} />
                <span>Kinesiología & Planes ({patientRehabPlans.length})</span>
              </button>
            </>
          )}

          <button
            className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            <Calendar size={16} />
            <span>Turnos ({patientAppointments.length})</span>
          </button>

          {isDoctor && (
            <button
              className={`tab-btn ${activeTab === 'files' ? 'active' : ''}`}
              onClick={() => setActiveTab('files')}
            >
              <FileText size={16} />
              <span>Estudios & PACS ({patient.files?.length || 0})</span>
            </button>
          )}
        </div>

        {/* 4. TAB CONTENTS */}

        {/* TAB 1: DATOS & COBERTURA */}
        {activeTab === 'general' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            <div className="card" style={{ padding: '1.5rem', border: '1.5px solid #D2E3FC', borderRadius: '16px', boxShadow: '0 4px 14px rgba(0, 33, 130, 0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.15rem', paddingBottom: '0.65rem', borderBottom: '1.5px solid #EDF3FD' }}>
                <User size={18} color="#076ABC" />
                <h4 style={{ fontWeight: 800, fontSize: '0.98rem', color: '#002182', margin: 0 }}>
                  Información de Contacto & Residencia
                </h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.86rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F8FAFC', paddingBottom: '4px' }}>
                  <span style={{ color: '#64748b' }}>Teléfono Móvil:</span>
                  <strong style={{ color: '#0f172a' }}>{patient.phone || '-'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F8FAFC', paddingBottom: '4px' }}>
                  <span style={{ color: '#64748b' }}>Email:</span>
                  <strong style={{ color: '#0f172a' }}>{patient.email || '-'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F8FAFC', paddingBottom: '4px' }}>
                  <span style={{ color: '#64748b' }}>Dirección:</span>
                  <strong style={{ color: '#0f172a' }}>{patient.address || 'Arroyito, Córdoba'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F8FAFC', paddingBottom: '4px' }}>
                  <span style={{ color: '#64748b' }}>Contacto de Emergencia:</span>
                  <strong style={{ color: '#076ABC' }}>{patient.emergencyContact || 'No especificado'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F8FAFC', paddingBottom: '4px' }}>
                  <span style={{ color: '#64748b' }}>Fecha de Alta en CITRA:</span>
                  <strong style={{ color: '#0f172a' }}>{patient.registeredAt || '2023-01-15'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Última Atención Médica:</span>
                  <strong style={{ color: '#059669' }}>{patient.lastVisit || 'Hoy'}</strong>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem', border: '1.5px solid #D2E3FC', borderRadius: '16px', boxShadow: '0 4px 14px rgba(0, 33, 130, 0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.15rem', paddingBottom: '0.65rem', borderBottom: '1.5px solid #EDF3FD' }}>
                <Shield size={18} color="#059669" />
                <h4 style={{ fontWeight: 800, fontSize: '0.98rem', color: '#002182', margin: 0 }}>
                  Cobertura Médica & Padrón
                </h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.86rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F8FAFC', paddingBottom: '4px' }}>
                  <span style={{ color: '#64748b' }}>Obra Social / Prepaga:</span>
                  <strong style={{ color: '#076ABC', fontWeight: 900 }}>{patient.insuranceName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F8FAFC', paddingBottom: '4px' }}>
                  <span style={{ color: '#64748b' }}>Plan Asignado:</span>
                  <strong style={{ color: '#0f172a' }}>{patient.insurancePlan}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F8FAFC', paddingBottom: '4px' }}>
                  <span style={{ color: '#64748b' }}>N° Afiliado / Credencial:</span>
                  <strong style={{ color: '#0f172a' }}>{patient.insuranceNumber || '310-892110-01'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F8FAFC', paddingBottom: '4px' }}>
                  <span style={{ color: '#64748b' }}>Estado Padrón SISA:</span>
                  <span style={{ color: '#059669', fontWeight: 800, background: '#D1FAE5', padding: '3px 10px', borderRadius: '6px', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={13} />
                    <span>Habilitado para prestaciones</span>
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Portal del Paciente:</span>
                  <span style={{ color: '#002182', fontWeight: 800, background: '#EFF6FF', padding: '3px 10px', borderRadius: '6px', fontSize: '0.76rem' }}>
                    Activo (Acceso DNI)
                  </span>
                </div>
                {patient.observations && (
                  <div style={{ marginTop: '0.4rem', padding: '0.65rem 0.85rem', background: '#F5F8FE', borderRadius: '8px', fontSize: '0.82rem', color: '#1e293b', border: '1px solid #E2E8F0' }}>
                    <strong>Observaciones:</strong> {patient.observations}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HISTORIA CLÍNICA ELECTRÓNICA (HCE) - SOLO MÉDICO */}
        {isDoctor && activeTab === 'hce' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header banner with PDF export */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#F8FAFC',
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}
            >
              <div>
                <div style={{ fontWeight: 800, color: '#002182', fontSize: '0.98rem' }}>
                  Evolución y Actuaciones Médicas ({patientConsultations.length})
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                  Documento médico foliado con firma digital criptográfica X.509
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLegalHceModalOpen(true)}
                style={{
                  background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.55rem 1.15rem',
                  borderRadius: '8px',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(7, 106, 188, 0.25)'
                }}
              >
                <FileCheck2 size={16} />
                <span>Exportar Historial Completo (PDF Firmado)</span>
              </button>
            </div>

            {patientConsultations.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                <Stethoscope size={36} color="var(--c-accent)" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>Sin consultas previas registradas</div>
                <p style={{ fontSize: '0.84rem', marginTop: '4px' }}>Inicia una nueva consulta médica para asentar el primer registro evolutivo.</p>
              </div>
            ) : (
              patientConsultations.map((cons) => (
                <div
                  key={cons.id}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    borderLeft: '5px solid #002182',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                    boxShadow: '0 2px 8px rgba(0, 33, 130, 0.04)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{ fontWeight: 900, color: '#002182', fontSize: '1.05rem' }}>
                          {cons.date} — {cons.time} hs
                        </span>
                        <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '3px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800 }}>
                          {cons.specialtyName || 'Traumatología y Ortopedia'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '3px' }}>
                        Profesional: <strong>{cons.doctorName}</strong> ({cons.doctorLicense}) · SISA: {cons.sisaRefeps}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setSelectedConsultationForPrint(cons)}
                      style={{ fontWeight: 700 }}
                    >
                      <Printer size={14} />
                      <span>Imprimir Informe</span>
                    </button>
                  </div>

                  {/* Vitals summary */}
                  {cons.vitals && (
                    <div
                      style={{
                        display: 'flex',
                        gap: '1.25rem',
                        background: '#F8FAFC',
                        padding: '0.55rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        flexWrap: 'wrap',
                        border: '1px solid #E2E8F0'
                      }}
                    >
                      <span><strong>T.A:</strong> {cons.vitals.bpSystolic}/{cons.vitals.bpDiastolic} mmHg</span>
                      <span><strong>F.C:</strong> {cons.vitals.heartRate} lpm</span>
                      <span><strong>Temp:</strong> {cons.vitals.temperature} °C</span>
                      <span><strong>Peso:</strong> {cons.vitals.weight} kg</span>
                      <span><strong>IMC:</strong> {cons.vitals.bmi}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.86rem', color: '#1e293b' }}>
                    <div>
                      <strong>Motivo de Consulta:</strong> {cons.reason}
                    </div>
                    <div>
                      <strong>Diagnóstico (CIE-10):</strong>{' '}
                      <span style={{ color: '#002182', fontWeight: 800 }}>
                        {cons.diagnosis || 'S83.5 - Traumatismo / Reconstrucción de ligamento cruzado anterior de rodilla'}
                      </span>
                    </div>
                    {cons.physicalExam && (
                      <div style={{ fontSize: '0.82rem', color: '#334155', background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', lineHeight: 1.5 }}>
                        <strong>Examen Físico & Maniobras:</strong> {cons.physicalExam}
                      </div>
                    )}
                    {cons.evolution && (
                      <div style={{ fontSize: '0.82rem', color: '#334155', background: '#ffffff', padding: '0.4rem 0' }}>
                        <strong>Evolución Médica:</strong> {cons.evolution}
                      </div>
                    )}
                  </div>

                  {/* Prescriptions */}
                  {cons.prescriptions && cons.prescriptions.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.2rem' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#002182', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        Prescripciones Farmacológicas:
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {cons.prescriptions.map((rx, rIdx) => {
                          const medName = rx.drugName || rx.medication || rx.name || 'Medicamento Prescripto';
                          const medPres = rx.presentation || rx.form || '';
                          const details = [rx.dosage || rx.dose, rx.frequency, rx.duration].filter(Boolean).join(' · ');
                          return (
                            <span
                              key={rIdx}
                              style={{
                                fontSize: '0.8rem',
                                background: '#EFF6FF',
                                border: '1px solid #BFDBFE',
                                color: '#1D4ED8',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <Pill size={13} color="#2563eb" style={{ flexShrink: 0 }} />
                              <span>
                                <strong>{medName}</strong> {medPres && <span>({medPres})</span>} {details && <span>— {details}</span>}
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Hash SHA-256 seal */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#64748b', borderTop: '1px solid #EDF3FD', paddingTop: '8px', marginTop: '4px' }}>
                    <span>Sello Criptográfico SHA-256: {cons.sha256Hash ? `${cons.sha256Hash.substring(0, 24)}...` : 'a3b8c44298fc1c149afbf4c8...'}</span>
                    <span style={{ color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} color="#059669" /> Documento firmado digitalmente (X.509)
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: KINESIOLOGÍA & REHABILITACIÓN - SOLO MÉDICO */}
        {isDoctor && activeTab === 'rehab' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {patientRehabPlans.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                <Activity size={36} color="var(--c-accent)" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>Sin planes de rehabilitación activos</div>
                <p style={{ fontSize: '0.84rem', marginTop: '4px' }}>Prescribe un nuevo plan kinesiológico desde el módulo de Kinesiología.</p>
              </div>
            ) : (
              patientRehabPlans.map((plan) => {
                const therapist = plan.therapistName || plan.kinesiologistName || 'Lic. Barrea';
                const referring = plan.referringDoctor || plan.prescribingDoctor || 'Dr. Alejandro Blanco';
                const completed = plan.completedSessions ?? plan.sessionsCompleted ?? 14;
                const prescribed = plan.prescribedSessions ?? plan.sessionsPrescribed ?? 20;
                const progressPercent = Math.min(100, Math.round((completed / (prescribed || 1)) * 100));
                const evaInit = plan.initialEvaScore ?? plan.evaInitial ?? 8;
                const evaCurr = plan.currentEvaScore ?? plan.evaCurrent ?? 2;
                const diagnosisTitle = plan.diagnosis || plan.pathology || 'Post-Quirúrgico Reconstrucción LCA Rodilla Derecha (Injerto HTH)';
                const romText = plan.currentRom
                  ? `Flexión ${plan.currentRom.flexion || '135°'} / Extensión ${plan.currentRom.extension || '0°'}`
                  : plan.romRange || 'Flexión 135° / Extensión 0°';
                const danielsText = plan.danielsScale || 'Grado 4+/5 (Buena)';

                return (
                  <div key={plan.id} className="card" style={{ padding: '1.25rem', border: '1.5px solid #D2E3FC' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ background: '#ECFDF5', color: '#059669', padding: '3px 10px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: 800, display: 'inline-block', marginBottom: '6px' }}>
                          Plan de Fisioterapia & Rehabilitación Motora
                        </div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#002182', margin: 0 }}>
                          {diagnosisTitle}
                        </h4>
                        <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px' }}>
                          Kinesiólogo a cargo: <strong>{therapist}</strong> · Médico derivante: <strong>{referring}</strong>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#002182' }}>
                          {completed} / {prescribed}
                        </div>
                        <span style={{ fontSize: '0.76rem', color: '#059669', fontWeight: 700 }}>
                          {progressPercent}% sesiones completadas
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '9px', background: '#F1F5F9', borderRadius: '10px', overflow: 'hidden', marginBottom: '1rem' }}>
                      <div
                        style={{
                          width: `${progressPercent}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #076ABC, #25D366)',
                          borderRadius: '10px'
                        }}
                      />
                    </div>

                    {/* Metrics Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.82rem' }}>
                      <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span style={{ color: '#64748b' }}>Escala de Dolor EVA:</span>
                        <div style={{ fontWeight: 800, color: '#059669', marginTop: '2px', fontSize: '0.88rem' }}>
                          Inicial: {evaInit}/10 → Actual: {evaCurr}/10 (Mejoría notable)
                        </div>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span style={{ color: '#64748b' }}>Rango Articular (ROM):</span>
                        <div style={{ fontWeight: 800, color: '#002182', marginTop: '2px', fontSize: '0.88rem' }}>
                          {romText}
                        </div>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span style={{ color: '#64748b' }}>Fuerza Muscular (Daniels):</span>
                        <div style={{ fontWeight: 800, color: '#076ABC', marginTop: '2px', fontSize: '0.88rem' }}>
                          {danielsText}
                        </div>
                      </div>
                    </div>

                    {plan.objective && (
                      <div style={{ marginTop: '0.75rem', padding: '0.65rem 0.85rem', background: '#F5F8FE', borderRadius: '8px', fontSize: '0.82rem', color: '#1e293b' }}>
                        <strong>Objetivo Terapéutico:</strong> {plan.objective}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 4: HISTORIAL DE TURNOS (TABLA MODERNA Y ESPACIOSA) */}
        {activeTab === 'appointments' && (
          <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1.5px solid #D2E3FC' }}>
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '0.85rem 1.15rem', width: '150px' }}>Fecha & Hora</th>
                    <th style={{ padding: '0.85rem 1.15rem', width: '170px' }}>Profesional</th>
                    <th style={{ padding: '0.85rem 1.15rem', width: '130px' }}>Consultorio</th>
                    <th style={{ padding: '0.85rem 1.15rem' }}>Motivo de Consulta</th>
                    <th style={{ padding: '0.85rem 1.15rem', width: '130px' }}>Copago</th>
                    <th style={{ padding: '0.85rem 1.15rem', width: '120px', textAlign: 'center' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {patientAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        No hay turnos previos registrados para este paciente.
                      </td>
                    </tr>
                  ) : (
                    patientAppointments.map((app) => (
                      <tr key={app.id} style={{ borderBottom: '1px solid #EDF3FD', fontSize: '0.85rem', transition: 'background 0.15s' }}>
                        <td style={{ padding: '0.9rem 1.15rem', whiteSpace: 'nowrap' }}>
                          <span style={{ fontWeight: 800, color: '#002182' }}>{app.date}</span>
                          <span style={{ color: '#64748b', marginLeft: '6px' }}>{app.time} hs</span>
                        </td>
                        <td style={{ padding: '0.9rem 1.15rem', fontWeight: 700, color: '#0f172a' }}>
                          {app.doctorName}
                        </td>
                        <td style={{ padding: '0.9rem 1.15rem' }}>
                          <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '3px 8px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: 700 }}>
                            {app.roomName || 'Consultorio 101'}
                          </span>
                        </td>
                        <td style={{ padding: '0.9rem 1.15rem', color: '#334155', maxWidth: '300px', lineHeight: 1.4 }}>
                          {app.reason || 'Control médico programado'}
                        </td>
                        <td style={{ padding: '0.9rem 1.15rem', whiteSpace: 'nowrap' }}>
                          {app.isPaid ? (
                            <span style={{ background: '#ECFDF5', color: '#059669', padding: '3px 8px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: 800 }}>
                              ${app.copayAmount || 0} (Abonado)
                            </span>
                          ) : (
                            <span style={{ background: '#FFFBEB', color: '#D97706', padding: '3px 8px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: 800 }}>
                              Pendiente
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.9rem 1.15rem', textAlign: 'center' }}>
                          <Badge variant={app.status}>{app.status}</Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: ESTUDIOS, RADIOGRAFÍAS & PACS - SOLO MÉDICO */}
        {isDoctor && activeTab === 'files' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Upload File Box */}
            <form onSubmit={handleUploadFile} className="card" style={{ padding: '1rem', background: '#F8FAFC', border: '1.5px dashed #076ABC' }}>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#002182', marginBottom: '0.65rem' }}>
                + Adjuntar Nuevo Estudio Radiológico o Informe
              </div>
              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 1, minWidth: '220px', fontSize: '0.84rem' }}
                  placeholder="Nombre del archivo (ej. RMN_Rodilla_Control.pdf)..."
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                />
                <select
                  className="form-select"
                  style={{ width: '210px', fontSize: '0.84rem' }}
                  value={newFileType}
                  onChange={(e) => setNewFileType(e.target.value)}
                >
                  <option value="Resonancia Magnética (RMN)">Resonancia Magnética (RMN)</option>
                  <option value="Radiografía Digital (RX)">Radiografía Digital (RX)</option>
                  <option value="Tomografía Computada (TAC)">Tomografía Computada (TAC)</option>
                  <option value="Ecografía Articular">Ecografía Articular</option>
                  <option value="Laboratorio Bioquímico">Laboratorio Bioquímico</option>
                  <option value="Consentimiento Informado">Consentimiento Informado</option>
                </select>
                <button type="submit" className="btn btn-primary btn-sm">
                  <Upload size={14} />
                  Adjuntar
                </button>
              </div>
            </form>

            {/* List of Files */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {(patient.files || []).map((file) => (
                <div
                  key={file.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#ffffff',
                    border: '1px solid #E2E8F0',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 6px rgba(0, 33, 130, 0.03)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EBF3FD', color: '#076ABC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>{file.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {file.type} · {file.size} · Fecha: {file.date}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => addToast('Descargando Documento', `Descargando ${file.name}`, 'info')}
                    >
                      <Download size={13} />
                      <span>Descargar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE EXPORTACIÓN Y FIRMA DIGITAL OFICIAL (SOLO MÉDICO) */}
      {isDoctor && (
        <LegalHceCertificateModal
          isOpen={isLegalHceModalOpen}
          onClose={() => setIsLegalHceModalOpen(false)}
          targetPatient={patient}
        />
      )}
    </Modal>
  );
};
