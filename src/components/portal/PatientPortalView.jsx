import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  User,
  Calendar,
  Pill,
  FileText,
  Clock,
  Shield,
  Download,
  CalendarPlus,
  Eye,
  CheckCircle2,
  Lock,
  ArrowRight,
  LogOut,
  Check
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { PrescriptionDigitalModal } from '../clinical/PrescriptionDigitalModal';
import { AppointmentModal } from '../agenda/AppointmentModal';

export const PatientPortalView = () => {
  const {
    currentPortalPatient,
    setCurrentPortalPatient,
    patients,
    appointments,
    electronicPrescriptions,
    consultations,
    setIsPatientPortalMode,
    setSelectedPrescriptionForView,
    setIsAppointmentModalOpen,
    setAppointmentModalData,
    addToast,
    logAudit
  } = useClinic();

  const [portalTab, setPortalTab] = useState('appointments'); // 'appointments', 'prescriptions', 'files', 'hce_request'

  const patient = currentPortalPatient || patients[0];

  const myAppointments = appointments.filter((a) => a.patientId === patient.id);
  const myPrescriptions = electronicPrescriptions.filter((p) => p.patientId === patient.id || p.patientDni === patient.dni);
  const myConsultations = consultations.filter((c) => c.patientId === patient.id || c.patientDni === patient.dni);

  const handleRequestHceCopy = () => {
    logAudit('EXPORT_HCE', 'Portal Paciente', patient.dni, `Solicitud de copia fehaciente de historia clínica por el paciente según Ley 26.529 Art. 14.`);
    addToast('Solicitud Registrada (Ley 26.529)', 'Se ha generado la constancia formal de entrega de copia de Historia Clínica dentro de las 48 hs hábiles.', 'success');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      <PrescriptionDigitalModal />
      <AppointmentModal />

      {/* Top Welcome Banner for Patient */}
      <div
        style={{
          background: 'linear-gradient(135deg, #002182 0%, #076ABC 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-lg)',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <img
            src={patient.avatar}
            alt={patient.name}
            style={{ width: '68px', height: '68px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #257CE6' }}
          />
          <div>
            <div style={{ fontSize: '0.8rem', color: '#D2E3FC', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
              Portal Autogestión del Paciente
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 900, margin: '2px 0' }}>
              Hola, {patient.name}
            </h1>
            <div style={{ fontSize: '0.86rem', color: '#EBF3FD' }}>
              DNI: {patient.dni} · Cobertura: {patient.insuranceName} ({patient.insurancePlan})
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Switch patient demo selector */}
          <select
            className="form-control"
            style={{ width: '220px', background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.3)' }}
            value={patient.id}
            onChange={(e) => {
              const p = patients.find((pat) => pat.id === e.target.value);
              if (p) setCurrentPortalPatient(p);
            }}
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id} style={{ color: '#002182' }}>
                Simular como: {p.name}
              </option>
            ))}
          </select>

          <button
            className="btn btn-outline"
            style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(0,0,0,0.2)' }}
            onClick={() => setIsPatientPortalMode(false)}
          >
            <LogOut size={16} />
            <span>Volver a Modo Clínica</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs in Portal */}
      <div className="tabs-header" style={{ marginBottom: '1.5rem' }}>
        <button
          className={`tab-btn ${portalTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setPortalTab('appointments')}
        >
          <Calendar size={18} />
          <span>Mis Turnos ({myAppointments.length})</span>
        </button>

        <button
          className={`tab-btn ${portalTab === 'prescriptions' ? 'active' : ''}`}
          onClick={() => setPortalTab('prescriptions')}
        >
          <Pill size={18} />
          <span>Mis Recetas Electrónicas ReNaPDiS ({myPrescriptions.length})</span>
        </button>

        <button
          className={`tab-btn ${portalTab === 'files' ? 'active' : ''}`}
          onClick={() => setPortalTab('files')}
        >
          <FileText size={18} />
          <span>Mis Estudios & Informes ({patient.files?.length || 0})</span>
        </button>

        <button
          className={`tab-btn ${portalTab === 'hce_request' ? 'active' : ''}`}
          onClick={() => setPortalTab('hce_request')}
        >
          <Shield size={18} />
          <span>Copia de Historia Clínica (Ley 26.529)</span>
        </button>
      </div>

      {/* TAB 1: MIS TURNOS */}
      {portalTab === 'appointments' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#002182' }}>Mis Turnos Médicos</h2>
            <button
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
              <span>Solicitar Nuevo Turno</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {myAppointments.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#496386' }}>
                No tienes turnos agendados en este momento.
              </div>
            ) : (
              myAppointments.map((app) => (
                <div
                  key={app.id}
                  className="card"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ background: '#EBF3FD', color: '#076ABC', padding: '0.85rem', borderRadius: '12px', textAlign: 'center', minWidth: '75px' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{app.date.split('-')[2]}</div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Ago 2026</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#002182' }}>
                        {app.doctorName} — {app.specialtyName}
                      </div>
                      <div style={{ fontSize: '0.84rem', color: '#496386', marginTop: '2px' }}>
                        Horario: {app.time} hs · Consultorio: {app.roomName}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Motivo: {app.reason}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Badge status={app.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: RECETAS ELECTRÓNICAS ReNaPDiS */}
      {portalTab === 'prescriptions' && (
        <div>
          <div style={{ background: '#EBF3FD', padding: '0.85rem 1.15rem', borderRadius: '8px', border: '1px solid #257CE6', marginBottom: '1.5rem', fontSize: '0.86rem', color: '#002182' }}>
            <strong>Recetas Electrónicas Oficiales (Ley 27.553):</strong> Presenta el Código Único CUIR o el código QR directamente en cualquier farmacia adherida para la dispensa de tus medicamentos.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myPrescriptions.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#496386' }}>
                No registras recetas electrónicas emitidas recientemente.
              </div>
            ) : (
              myPrescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="card"
                  style={{
                    padding: '1.35rem',
                    borderLeft: '5px solid #076ABC'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{ fontWeight: 900, fontSize: '1.05rem', color: '#002182' }}>
                          CUIR: {rx.cuir}
                        </span>
                        <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Check size={12} />
                          <span>ReNaPDiS Habilitada</span>
                        </span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#496386', marginTop: '2px' }}>
                        Prescrito por <strong>{rx.doctorName}</strong> ({rx.doctorLicense}) · Emitida el {rx.issueDate} (Válida hasta {rx.expirationDate})
                      </div>
                    </div>

                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setSelectedPrescriptionForView(rx)}
                    >
                      <Eye size={15} />
                      <span>Ver Receta & QR Farmacia</span>
                    </button>
                  </div>

                  {/* Medications List */}
                  <div style={{ background: '#F5F8FE', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #D2E3FC' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '4px' }}>
                      Medicamentos Prescriptos (DCI / Genéricos):
                    </div>
                    <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#172A4A' }}>
                      {rx.medications.map((m, mIdx) => (
                        <li key={mIdx}>
                          <strong>{m.dci}</strong> ({m.concentration}) — {m.instructions}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ESTUDIOS Y DOCUMENTOS */}
      {portalTab === 'files' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {(patient.files || []).map((file) => (
            <div
              key={file.id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.15rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <FileText size={28} color="#076ABC" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#002182' }}>{file.name}</div>
                  <div style={{ fontSize: '0.76rem', color: '#496386' }}>
                    {file.type} · {file.size} · {file.date}
                  </div>
                </div>
              </div>
              <button
                className="btn btn-secondary btn-icon"
                title="Descargar archivo"
                onClick={() => alert(`Descargando copia segura de ${file.name}...`)}
              >
                <Download size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: SOLICITUD DE COPIA HCE (Ley 26.529) */}
      {portalTab === 'hce_request' && (
        <div className="card" style={{ maxWidth: '800px', padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#002182', marginBottom: '0.75rem' }}>
            Derecho a la Titularidad de la Historia Clínica (Ley 26.529 Art. 14)
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#172A4A', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            El paciente es el titular indiscutible de la historia clínica. A su simple requerimiento debe suministrársele copia autenticada de la misma, dentro del plazo de cuarenta y ocho (48) horas hábiles.
          </p>

          <div style={{ background: '#F5F8FE', padding: '1rem', borderRadius: '8px', border: '1px solid #D2E3FC', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            <div><strong>Titular:</strong> {patient.name}</div>
            <div><strong>DNI:</strong> {patient.dni}</div>
            <div><strong>Cantidad de Registros Clínicos Digitalizados:</strong> {myConsultations.length} actos médicos auditados</div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleRequestHceCopy}
          >
            <Shield size={16} />
            <span>Solicitar Copia Autenticada de Historia Clínica Completa</span>
          </button>
        </div>
      )}
    </div>
  );
};
