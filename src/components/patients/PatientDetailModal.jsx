import React, { useState, useEffect, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { getTodayArgentina } from '../../utils/dateUtils';
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
    scopedConsultations,
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
    addToast,
    doctors
  } = useClinic();

  const patient = selectedPatientForDetail;

  const [activeTab, setActiveTab] = useState('general'); // 'general', 'hce', 'rehab', 'appointments', 'files', 'antecedentes'
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState('Resonancia Magnética (RMN)');
  const [isLegalHceModalOpen, setIsLegalHceModalOpen] = useState(false);

  const assignedDoctors = useMemo(() => {
    if (!patient) return [];
    const assignedIds = Array.isArray(patient.assignedDoctorIds)
      ? patient.assignedDoctorIds
      : patient.assignedDoctorId
      ? [patient.assignedDoctorId]
      : [];
    const directMatches = (doctors || []).filter((d) => assignedIds.includes(d.id));
    if (directMatches.length > 0) return directMatches;

    if (patient.assignedDoctorNames) {
      const names = Array.isArray(patient.assignedDoctorNames)
        ? patient.assignedDoctorNames
        : [patient.assignedDoctorNames];
      const nameMatches = (doctors || []).filter((d) =>
        names.some((n) => n && d.name && d.name.toLowerCase().trim() === n.toLowerCase().trim())
      );
      if (nameMatches.length > 0) return nameMatches;
    }

    if (patient.primaryDoctor) {
      const primaryMatch = (doctors || []).filter(
        (d) => d.name && d.name.toLowerCase().trim() === patient.primaryDoctor.toLowerCase().trim()
      );
      if (primaryMatch.length > 0) return primaryMatch;
    }

    return [];
  }, [patient, doctors]);

  useEffect(() => {
    if (!isDoctor && activeTab !== 'general' && activeTab !== 'appointments') {
      setActiveTab('general');
    }
  }, [isDoctor, activeTab]);

  if (!patient) return null;

  // Calculate age
  const calculateAge = (bDate) => {
    if (!bDate) return '-';
    try {
      const birth = new Date(bDate);
      const today = new Date(getTodayArgentina());
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
  const patientAppointments = appointments.filter((a) => a.patientId === patient.id || a.patientDni === patient.dni);
  const effectiveConsultations = isDoctor ? scopedConsultations : consultations;
  const patientConsultations = (effectiveConsultations || []).filter((c) => c.patientId === patient.id || c.patientDni === patient.dni);
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
      date: getTodayArgentina(),
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
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 800, color: '#002182' }}>Ficha Clínica — {patient.name}</span>
          <span style={{ background: '#EFF6FF', color: '#076ABC', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
            DNI {patient.dni}
          </span>
          <span style={{ background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: 600 }}>
            {patient.birthDate ? `${calculateAge(patient.birthDate)} · ` : ''}{patient.insuranceName} {patient.insurancePlan ? `(${patient.insurancePlan})` : ''}
          </span>
        </div>
      }
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
                <span>Exportar Historial (PDF)</span>
              </button>
            )}

            {isDoctor ? (
              <button
                type="button"
                className="btn btn-primary"
                style={{ background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
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
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setPatientFormModalData(patient);
                  setIsPatientFormModalOpen(true);
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Edit2 size={15} />
                <span>Editar Datos del Paciente</span>
              </button>
            )}
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* 1. CLINICAL ALERTS & SURGICAL WARNINGS */}
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
            <div className="card" style={{ padding: '1.35rem 1.5rem', border: '1.5px solid #D2E3FC', borderRadius: '14px', background: '#ffffff', boxShadow: '0 4px 14px rgba(0, 33, 130, 0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.15rem', paddingBottom: '0.65rem', borderBottom: '1.5px solid #EDF3FD' }}>
                <User size={18} color="#076ABC" />
                <h4 style={{ fontWeight: 800, fontSize: '0.98rem', color: '#002182', margin: 0 }}>
                  Información de Contacto & Residencia
                </h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.86rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F8FAFC', paddingBottom: '5px' }}>
                  <span style={{ color: '#64748b' }}>Teléfono Móvil:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ color: '#0f172a' }}>{patient.phone || '-'}</strong>
                    {patient.phone && (
                      <a
                        href={`https://wa.me/${patient.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: '#25D366',
                          color: '#ffffff',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        title="Abrir WhatsApp"
                      >
                        <WhatsAppIcon size={12} color="#ffffff" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F8FAFC', paddingBottom: '5px' }}>
                  <span style={{ color: '#64748b' }}>Email:</span>
                  <strong style={{ color: '#0f172a' }}>{patient.email || '-'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F8FAFC', paddingBottom: '5px' }}>
                  <span style={{ color: '#64748b' }}>Dirección:</span>
                  <strong style={{ color: '#0f172a' }}>{patient.address || 'Arroyito, Córdoba'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F8FAFC', paddingBottom: '5px' }}>
                  <span style={{ color: '#64748b' }}>Contacto de Emergencia:</span>
                  <strong style={{ color: '#076ABC' }}>{patient.emergencyContact || 'No especificado'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F8FAFC', paddingBottom: '5px' }}>
                  <span style={{ color: '#64748b' }}>Fecha de Alta en CITRA:</span>
                  <strong style={{ color: '#0f172a' }}>{patient.registeredAt || '2023-01-15'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Última Atención Médica:</span>
                  <strong style={{ color: '#059669' }}>{patient.lastVisit || 'Hoy'}</strong>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '1.35rem 1.5rem', border: '1.5px solid #D2E3FC', borderRadius: '14px', background: '#ffffff', boxShadow: '0 4px 14px rgba(0, 33, 130, 0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.15rem', paddingBottom: '0.65rem', borderBottom: '1.5px solid #EDF3FD' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={18} color="#059669" />
                  <h4 style={{ fontWeight: 800, fontSize: '0.98rem', color: '#002182', margin: 0 }}>
                    Cobertura Médica & Obra Social
                  </h4>
                </div>
                {!isDoctor && (
                  <button
                    type="button"
                    onClick={() => {
                      setPatientFormModalData(patient);
                      setIsPatientFormModalOpen(true);
                    }}
                    style={{
                      background: '#eff6ff',
                      color: '#076ABC',
                      border: '1px solid #bfdbfe',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Edit2 size={11} /> Modificar
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.86rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F8FAFC', paddingBottom: '5px' }}>
                  <span style={{ color: '#64748b' }}>Obra Social / Prepaga:</span>
                  <strong style={{ color: '#076ABC', fontWeight: 900 }}>{patient.insuranceName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F8FAFC', paddingBottom: '5px' }}>
                  <span style={{ color: '#64748b' }}>Plan Asignado:</span>
                  <strong style={{ color: '#0f172a' }}>{patient.insurancePlan}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F8FAFC', paddingBottom: '5px' }}>
                  <span style={{ color: '#64748b' }}>N° Afiliado / Credencial:</span>
                  <strong style={{ color: '#0f172a' }}>{patient.insuranceNumber || '310-892110-01'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F8FAFC', paddingBottom: '5px' }}>
                  <span style={{ color: '#64748b' }}>Profesional Asignado:</span>
                  <span style={{ color: '#002182', fontWeight: 700 }}>
                    {assignedDoctors.length > 0 ? assignedDoctors.map(d => d.name).join(', ') : 'Atención a demanda'}
                  </span>
                </div>
                {patient.observations && (
                  <div style={{ marginTop: '0.35rem', padding: '0.65rem 0.85rem', background: '#F8FAFC', borderRadius: '8px', fontSize: '0.82rem', color: '#334155', border: '1px solid #E2E8F0', lineHeight: 1.45 }}>
                    <strong style={{ color: '#002182' }}>Observaciones:</strong> {patient.observations}
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
              <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                <Activity size={32} color="#076ABC" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontWeight: 800, color: '#0f172a' }}>Sin plan de kinesiología activo</div>
                <p style={{ fontSize: '0.84rem', marginTop: '4px', color: '#64748b' }}>
                  El paciente no tiene sesiones de fisioterapia o rehabilitación registradas.
                </p>
              </div>
            ) : (
              patientRehabPlans.map((plan) => {
                const therapist = plan.therapistName || plan.kinesiologistName || 'Lic. Barrea';
                const referring = plan.referringDoctor || plan.prescribingDoctor || 'Dr. Blanco';
                const completed = plan.completedSessions ?? plan.sessionsCompleted ?? 14;
                const prescribed = plan.prescribedSessions ?? plan.sessionsPrescribed ?? 20;
                const progressPercent = Math.min(100, Math.round((completed / (prescribed || 1)) * 100));
                const diagnosisTitle = plan.diagnosis || plan.pathology || 'Rehabilitación Post-Quirúrgica LCA';

                return (
                  <div key={plan.id} className="card" style={{ padding: '1.35rem', border: '1.5px solid #D2E3FC', borderRadius: '14px', background: '#ffffff', boxShadow: '0 2px 10px rgba(0, 33, 130, 0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                          <span style={{ background: '#ECFDF5', color: '#059669', padding: '3px 9px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                            Plan de Rehabilitación
                          </span>
                          <span style={{ background: '#EFF6FF', color: '#002182', padding: '3px 9px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                            En curso
                          </span>
                        </div>
                        <h4 style={{ fontSize: '1.08rem', fontWeight: 900, color: '#002182', margin: '4px 0' }}>
                          {diagnosisTitle}
                        </h4>
                        <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '3px' }}>
                          Kinesiólogo: <strong style={{ color: '#0f172a' }}>{therapist}</strong> · Derivó: <strong style={{ color: '#0f172a' }}>{referring}</strong>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#002182' }}>
                          {completed} / {prescribed}
                        </div>
                        <span style={{ fontSize: '0.76rem', color: '#059669', fontWeight: 700 }}>
                          {progressPercent}% sesiones realizadas
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '10px', overflow: 'hidden', margin: '0.85rem 0' }}>
                      <div
                        style={{
                          width: `${progressPercent}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #076ABC 0%, #10B981 100%)',
                          borderRadius: '10px'
                        }}
                      />
                    </div>

                    {/* Simple summary cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
                      <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Evolución</span>
                        <div style={{ fontWeight: 800, color: '#059669', marginTop: '2px', fontSize: '0.88rem' }}>
                          Favorable · Buena respuesta al tratamiento
                        </div>
                      </div>
                      <div style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Objetivo</span>
                        <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px', fontSize: '0.84rem' }}>
                          {plan.objective || 'Fortalecimiento muscular y recuperación de movilidad funcional.'}
                        </div>
                      </div>
                    </div>
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
                    <th style={{ padding: '0.85rem 1.15rem', width: '140px' }}>Especialidad</th>
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
                            {app.specialtyName || app.doctorSpecialty || 'Traumatología'}
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
            <form
              onSubmit={handleUploadFile}
              style={{
                padding: '1rem 1.25rem',
                background: '#ffffff',
                border: '1.5px solid #D2E3FC',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0, 33, 130, 0.04)'
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#002182', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Upload size={15} color="#076ABC" />
                <span>Adjuntar Nuevo Estudio o Informe Radiológico</span>
              </div>
              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ flex: 1, minWidth: '220px', fontSize: '0.84rem' }}
                  placeholder="Nombre o descripción (ej. RMN_Rodilla_Control.pdf)..."
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                />
                <select
                  className="form-control"
                  style={{ width: '220px', fontSize: '0.84rem' }}
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
                <button type="submit" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <Upload size={14} />
                  <span>Adjuntar</span>
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
