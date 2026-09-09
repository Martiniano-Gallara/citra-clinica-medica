import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Shield,
  FileText,
  AlertTriangle,
  Upload,
  Plus,
  Edit2,
  CalendarPlus,
  Stethoscope,
  Printer,
  Trash2,
  FileSpreadsheet,
  Download,
  Activity,
  Heart,
  Droplet,
  CheckCircle2,
  Send,
  Sparkles,
  Zap,
  Check,
  Eye,
  KeyRound,
  FileCheck2,
  Pill
} from 'lucide-react';

export const PatientDetailModal = () => {
  const {
    selectedPatientForDetail,
    setSelectedPatientForDetail,
    appointments,
    consultations,
    rehabPlans,
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
      title={`Ficha Clínica Integral — ${patient.name}`}
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

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              type="button"
              className="btn btn-outline"
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
              <CalendarPlus size={16} color="var(--c-primary)" />
              <span>+ Agendar Turno</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
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
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* 1. TOP PATIENT HEADER BANNER */}
        <div
          style={{
            background: 'linear-gradient(135deg, #002182 0%, #076ABC 100%)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 4px 14px rgba(0, 33, 130, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.15rem' }}>
            <img
              src={patient.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt={patient.name}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #257CE6',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                  {patient.name}
                </h2>
                <span
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '0.78rem',
                    fontWeight: 800
                  }}
                >
                  DNI {patient.dni}
                </span>
                <span
                  style={{
                    background: '#257CE6',
                    color: '#002182',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '0.78rem',
                    fontWeight: 900
                  }}
                >
                  {patient.insuranceName} ({patient.insurancePlan})
                </span>
              </div>

              <div style={{ fontSize: '0.84rem', color: '#D2E3FC', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span>{calculateAge(patient.birthDate)} ({patient.birthDate})</span>
                <span>•</span>
                <span>Género: {patient.gender}</span>
                <span>•</span>
                <span>Factor: <strong>{patient.bloodType || 'A+'}</strong></span>
                <span>•</span>
                <span>Tel: {patient.phone}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <a
              href={`https://wa.me/${patient.phone?.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm"
              style={{ background: '#dcfce7', color: '#15803d', fontWeight: 700, border: 'none' }}
              title="Abrir chat de WhatsApp"
            >
              <Send size={14} />
              WhatsApp
            </a>

            <button
              type="button"
              className="btn btn-sm"
              style={{ background: '#ffffff', color: '#002182', fontWeight: 800, border: 'none' }}
              onClick={() => {
                setPatientFormModalData(patient);
                setIsPatientFormModalOpen(true);
              }}
            >
              <Edit2 size={14} />
              Editar Ficha
            </button>
          </div>
        </div>

        {/* 2. CLINICAL ALERTS & SURGICAL WARNINGS */}
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

        {/* 3. TABS NAVIGATION */}
        <div className="tabs-header" style={{ marginBottom: 0 }}>
          <button
            className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <User size={16} />
            <span>Datos & Cobertura</span>
          </button>

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

          <button
            className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            <Calendar size={16} />
            <span>Turnos ({patientAppointments.length})</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'files' ? 'active' : ''}`}
            onClick={() => setActiveTab('files')}
          >
            <FileText size={16} />
            <span>Estudios & PACS ({patient.files?.length || 0})</span>
          </button>
        </div>

        {/* 4. TAB CONTENTS */}

        {/* TAB 1: DATOS & COBERTURA */}
        {activeTab === 'general' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="card" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.85rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                Información de Contacto & Residencia
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Teléfono Móvil:</span> <strong>{patient.phone || '-'}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> <strong>{patient.email || '-'}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Dirección:</span> <strong>{patient.address || '-'}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Contacto de Emergencia:</span> <strong style={{ color: 'var(--c-dark)' }}>{patient.emergencyContact || 'No especificado'}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Fecha de Alta en CITRA:</span> <strong>{patient.registeredAt || '-'}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Última Atención Médica:</span> <strong>{patient.lastVisit || 'Hoy'}</strong></div>
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.85rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                Cobertura Médica & Nomenclador
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Obra Social / Prepaga:</span> <strong style={{ color: 'var(--c-primary)' }}>{patient.insuranceName}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Plan Asignado:</span> <strong>{patient.insurancePlan}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>N° Afiliado / Credencial:</span> <strong>{patient.insuranceNumber || '310-892110-01'}</strong></div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Estado Padrón SISA:</span>{' '}
                  <span style={{ color: '#059669', fontWeight: 800, background: '#d1fae5', padding: '2px 8px', borderRadius: '4px', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <Check size={12} />
                    <span>Habilitado para prestaciones</span>
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Portal del Paciente:</span>{' '}
                  <span style={{ color: 'var(--c-dark)', fontWeight: 700 }}>Activo (Acceso con DNI)</span>
                </div>
                {patient.observations && (
                  <div style={{ marginTop: '0.4rem', padding: '0.6rem', background: 'var(--bg-subtle)', borderRadius: '6px', fontSize: '0.82rem' }}>
                    <strong>Observaciones:</strong> {patient.observations}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HISTORIA CLÍNICA ELECTRÓNICA (HCE) */}
        {activeTab === 'hce' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                    borderLeft: '5px solid var(--c-primary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{ fontWeight: 900, color: 'var(--text-main)', fontSize: '1.05rem' }}>
                          {cons.date} — {cons.time} hs
                        </span>
                        <span className="badge badge-teal">{cons.specialtyName}</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Profesional: <strong>{cons.doctorName}</strong> ({cons.doctorLicense}) · SISA: {cons.sisaRefeps}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setSelectedConsultationForPrint(cons)}
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
                        gap: '1rem',
                        background: 'var(--bg-subtle)',
                        padding: '0.5rem 0.85rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        flexWrap: 'wrap',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <span><strong>T.A:</strong> {cons.vitals.bpSystolic}/{cons.vitals.bpDiastolic} mmHg</span>
                      <span><strong>F.C:</strong> {cons.vitals.heartRate} lpm</span>
                      <span><strong>Temp:</strong> {cons.vitals.temperature} °C</span>
                      <span><strong>Peso:</strong> {cons.vitals.weight} kg</span>
                      <span><strong>IMC:</strong> {cons.vitals.bmi}</span>
                    </div>
                  )}

                  <div>
                    <div style={{ fontSize: '0.85rem' }}>
                      <strong>Motivo de Consulta:</strong> {cons.reason}
                    </div>
                    <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                      <strong>Diagnóstico (CIE-10):</strong> <span style={{ color: 'var(--c-primary)', fontWeight: 800 }}>{cons.diagnosis || 'S83.5 Traumatismo LCA'}</span>
                    </div>
                    {cons.physicalExam && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-body)', marginTop: '4px', background: '#f8fafc', padding: '0.5rem', borderRadius: '6px' }}>
                        <strong>Examen Físico:</strong> {cons.physicalExam}
                      </div>
                    )}
                  </div>

                  {/* Prescriptions */}
                  {cons.prescriptions && cons.prescriptions.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {cons.prescriptions.map((rx, rIdx) => (
                        <span key={rIdx} style={{ fontSize: '0.78rem', background: '#EBF3FD', color: '#002182', padding: '3px 8px', borderRadius: '4px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Pill size={12} style={{ flexShrink: 0 }} />
                          <span>{rx.drugName} ({rx.presentation}) — {rx.dosage}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Hash SHA-256 seal */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-subtle)', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                    <span>Sello Criptográfico SHA-256: {cons.sha256Hash?.slice(0, 24) || 'a3b8c44298fc1c14...'}</span>
                    <span>Documento firmado digitalmente (X.509)</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: KINESIOLOGÍA & REHABILITACIÓN */}
        {activeTab === 'rehab' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {patientRehabPlans.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                <Activity size={36} color="var(--c-accent)" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>Sin planes de rehabilitación activos</div>
                <p style={{ fontSize: '0.84rem', marginTop: '4px' }}>Prescribe un nuevo plan kinesiológico desde el módulo de Kinesiología.</p>
              </div>
            ) : (
              patientRehabPlans.map((plan) => (
                <div key={plan.id} className="card" style={{ padding: '1.25rem', border: '1px solid var(--c-accent)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                    <div>
                      <div className="badge badge-teal" style={{ marginBottom: '4px' }}>{plan.diagnosis}</div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                        {plan.pathology}
                      </h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Kinesiólogo a cargo: <strong>{plan.kinesiologistName}</strong> · Médico derivante: {plan.prescribingDoctor}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--c-primary)' }}>
                        {plan.sessionsCompleted} / {plan.sessionsPrescribed}
                      </div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>sesiones completadas</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '8px', background: 'var(--bg-subtle)', borderRadius: '10px', overflow: 'hidden', marginBottom: '1rem' }}>
                    <div
                      style={{
                        width: `${(plan.sessionsCompleted / plan.sessionsPrescribed) * 100}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #076ABC, #257CE6)',
                        borderRadius: '10px'
                      }}
                    />
                  </div>

                  {/* Metrics Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', fontSize: '0.82rem' }}>
                    <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Escala de Dolor EVA:</span>
                      <div style={{ fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                        Inicial: {plan.evaInitial}/10 → Actual: {plan.evaCurrent}/10
                      </div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Rango Articular (ROM):</span>
                      <div style={{ fontWeight: 800, color: 'var(--c-dark)', marginTop: '2px' }}>
                        {plan.romRange || 'Flexión 135° / Extensión 0°'}
                      </div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Fuerza Muscular (Daniels):</span>
                      <div style={{ fontWeight: 800, color: 'var(--c-primary)', marginTop: '2px' }}>
                        Grado {plan.danielsScale || '4+/5 (Buena)'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: HISTORIAL DE TURNOS */}
        {activeTab === 'appointments' && (
          <div className="card" style={{ padding: '1.25rem' }}>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha & Hora</th>
                    <th>Profesional</th>
                    <th>Consultorio</th>
                    <th>Motivo</th>
                    <th>Copago</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {patientAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No hay turnos previos registrados para este paciente.
                      </td>
                    </tr>
                  ) : (
                    patientAppointments.map((app) => (
                      <tr key={app.id}>
                        <td>
                          <strong style={{ color: 'var(--c-dark)' }}>{app.date}</strong> — {app.time} hs
                        </td>
                        <td>{app.doctorName}</td>
                        <td>{app.roomName}</td>
                        <td>{app.reason}</td>
                        <td>{app.isPaid ? `$${app.copayAmount} (Abonado)` : 'Pendiente'}</td>
                        <td><Badge variant={app.status}>{app.status}</Badge></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: ESTUDIOS, RADIOGRAFÍAS & PACS */}
        {activeTab === 'files' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Upload File Box */}
            <form onSubmit={handleUploadFile} className="card" style={{ padding: '1rem', background: 'var(--bg-subtle)', border: '1px dashed var(--c-primary)' }}>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--c-dark)', marginBottom: '0.65rem' }}>
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
                    border: '1px solid var(--border-color)',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EBF3FD', color: 'var(--c-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-main)' }}>{file.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
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
    </Modal>
  );
};
