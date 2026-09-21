import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { QRCodeSVG } from 'qrcode.react';
import {
  Calendar,
  CalendarCheck,
  CalendarPlus,
  Clock,
  MapPin,
  Stethoscope,
  XCircle,
  AlertTriangle,
  Printer,
  ArrowLeft,
  CheckCircle2,
  User,
  ShieldCheck,
  CreditCard,
  LogIn,
  Eye,
  X,
  FileText,
  Pill,
  Download,
  AlertCircle,
  FileCheck2,
  Activity,
  HeartPulse,
  Send,
  Sparkles,
  Phone,
  Mail,
  Scale,
  LogOut,
  ChevronRight,
  Shield
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { PrescriptionDigitalModal } from '../clinical/PrescriptionDigitalModal';
import { ConsultationPrintView } from '../clinical/ConsultationPrintView';

export const PatientUnifiedPortal = () => {
  const {
    authRole,
    authPatient,
    logoutPatient,
    appointments,
    cancelAppointment,
    consultations,
    electronicPrescriptions,
    imagingStudies,
    medicalOrders,
    medicalCertificates,
    setCurrentView,
    setIsAuthModalOpen,
    setAuthModalTab,
    setSelectedPrescriptionForView,
    setSelectedConsultationForPrint,
    addToast,
    logAudit,
    updatePatient
  } = useClinic();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('turnos'); // 'turnos' | 'hce' | 'recetas' | 'estudios' | 'certificados' | 'perfil' | 'hce_copy'
  const [appointmentSubTab, setAppointmentSubTab] = useState('upcoming'); // 'upcoming' | 'past'

  // Modals state
  const [selectedAppointmentForTicket, setSelectedAppointmentForTicket] = useState(null);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('Imposibilidad horaria / Laboral');
  const [selectedStudyForView, setSelectedStudyForView] = useState(null);
  const [hceRequestSent, setHceRequestSent] = useState(false);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profilePhone, setProfilePhone] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileInsuranceNumber, setProfileInsuranceNumber] = useState('');

  // If patient is not logged in, prompt authentication
  if (authRole !== 'patient' || !authPatient) {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1.25rem',
          background: '#F5F8FE'
        }}
      >
        <div
          style={{
            maxWidth: '460px',
            width: '100%',
            background: '#ffffff',
            borderRadius: '24px',
            border: '1.5px solid #D2E3FC',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            boxShadow: '0 15px 35px rgba(0, 33, 130, 0.08)'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              margin: '0 auto 1.25rem',
              boxShadow: '0 8px 20px rgba(7, 106, 188, 0.3)'
            }}
          >
            <User size={32} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#002182', margin: '0 0 0.5rem' }}>
            Portal del Paciente CITRA
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#496386', margin: '0 0 1.75rem', lineHeight: 1.5 }}>
            Accedé a tus turnos, consultas médicas, recetas electrónicas oficiales (ReNaPDiS), estudios e historia clínica segura.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={() => {
                setAuthModalTab('login');
                setIsAuthModalOpen(true);
              }}
              style={{
                background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.85rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(7, 106, 188, 0.25)'
              }}
            >
              <LogIn size={18} />
              Ingresar con mi DNI
            </button>

            <button
              onClick={() => {
                setAuthModalTab('register');
                setIsAuthModalOpen(true);
              }}
              style={{
                background: '#ffffff',
                border: '1.5px solid #D2E3FC',
                color: '#002182',
                padding: '0.8rem',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Crear mi Cuenta de Paciente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Strictly Scoped Data for Current Patient (ID and DNI matching)
  const cleanPatientDni = (authPatient.dni || '').replace(/\D/g, '');
  const myAppointments = appointments.filter(
    (a) =>
      a.patientId === authPatient.id ||
      (a.patientDni && a.patientDni.replace(/\D/g, '') === cleanPatientDni)
  );

  const upcomingAppointments = myAppointments.filter(
    (a) => a.status === 'confirmado' || a.status === 'pendiente' || a.status === 'en_sala'
  );

  const pastAppointments = myAppointments.filter(
    (a) => a.status === 'atendido' || a.status === 'cancelado' || a.status === 'ausente'
  );

  const myConsultations = consultations.filter(
    (c) =>
      c.patientId === authPatient.id ||
      (c.patientDni && c.patientDni.replace(/\D/g, '') === cleanPatientDni)
  );

  const myPrescriptions = electronicPrescriptions.filter(
    (p) =>
      p.patientId === authPatient.id ||
      (p.patientDni && p.patientDni.replace(/\D/g, '') === cleanPatientDni)
  );

  const myStudies = imagingStudies.filter(
    (s) =>
      s.patientId === authPatient.id ||
      (s.patientDni && s.patientDni.replace(/\D/g, '') === cleanPatientDni)
  );

  const myOrders = medicalOrders.filter(
    (o) =>
      o.patientId === authPatient.id ||
      (o.patientDni && o.patientDni.replace(/\D/g, '') === cleanPatientDni)
  );

  const myCertificates = medicalCertificates.filter(
    (c) =>
      c.patientId === authPatient.id ||
      (c.patientDni && c.patientDni.replace(/\D/g, '') === cleanPatientDni)
  );

  // Cancellation handler
  const handleConfirmCancel = () => {
    if (appointmentToCancel) {
      cancelAppointment(appointmentToCancel.id, cancelReason);
      setAppointmentToCancel(null);
      addToast('Turno Cancelado', 'El turno ha sido cancelado en el sistema.', 'info');
    }
  };

  // HCE Formal Copy Request Handler (Ley 26.529)
  const handleRequestHceCopy = () => {
    logAudit(
      'EXPORT_HCE',
      'Portal Pacientes',
      authPatient.dni,
      `Solicitud fehaciente de copia de Historia Clínica formalizada por el paciente.`
    );
    setHceRequestSent(true);
    addToast(
      'Solicitud de HCE Ingresada',
      'Constancia formal registrada conforme a la Ley 26.529. Retiro en 48 hs hábiles.',
      'success'
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmado':
        return { text: 'Confirmado', bg: '#EBF8F2', color: '#065F46', border: '#A7F3D0' };
      case 'pendiente':
        return { text: 'Pendiente', bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' };
      case 'en_sala':
        return { text: 'En Espera', bg: '#EBF3FD', color: '#002182', border: '#93C5FD' };
      case 'atendido':
        return { text: 'Atendido', bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' };
      case 'cancelado':
        return { text: 'Cancelado', bg: '#FFF1F2', color: '#991B1B', border: '#FECDD3' };
      default:
        return { text: status, bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' };
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F8FE', padding: '1.5rem 1rem 4rem' }}>
      {/* Modals */}
      <PrescriptionDigitalModal />
      <ConsultationPrintView />

      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        {/* 1. TOP WELCOME BANNER */}
        <div
          style={{
            background: 'linear-gradient(135deg, #002182 0%, #076ABC 100%)',
            color: '#ffffff',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '1.75rem',
            boxShadow: '0 10px 30px rgba(0, 33, 130, 0.15)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.25rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 900,
                color: '#002182',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}
            >
              {authPatient.name
                ? authPatient.name.split(' ').map((n) => n[0]).slice(0, 2).join('')
                : 'PT'}
            </div>
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '100px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  marginBottom: '0.35rem'
                }}
              >
                <ShieldCheck size={14} />
                PORTAL DEL PACIENTE · AUTENTICADO
              </div>
              <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
                Hola, {authPatient.name}
              </h1>
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.86rem', color: '#D2E3FC' }}>
                DNI: {authPatient.dni} · Cobertura: {authPatient.insuranceName || 'Particular'} ({authPatient.insurancePlan || 'Estándar'})
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setCurrentView('booking')}
              style={{
                background: '#ffffff',
                color: '#002182',
                border: 'none',
                padding: '0.7rem 1.25rem',
                borderRadius: '12px',
                fontSize: '0.88rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              <CalendarPlus size={16} color="#076ABC" />
              Sacar Nuevo Turno
            </button>

            <button
              onClick={logoutPatient}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#ffffff',
                padding: '0.7rem 1.1rem',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                cursor: 'pointer'
              }}
            >
              <LogOut size={16} />
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* 2. PORTAL NAVIGATION TABS */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '0.5rem',
            marginBottom: '1.75rem',
            boxShadow: '0 2px 10px rgba(0, 33, 130, 0.05)',
            border: '1px solid #D2E3FC',
            display: 'flex',
            gap: '0.35rem',
            overflowX: 'auto'
          }}
        >
          {[
            { id: 'turnos', label: 'Mis Turnos', icon: CalendarCheck, count: upcomingAppointments.length },
            { id: 'hce', label: 'Historia Clínica', icon: FileText, count: myConsultations.length },
            { id: 'recetas', label: 'Recetas Médicas (CUIR)', icon: Pill, count: myPrescriptions.length },
            { id: 'estudios', label: 'Estudios & Radiología', icon: Eye, count: myStudies.length },
            { id: 'certificados', label: 'Órdenes & Certificados', icon: FileCheck2, count: myOrders.length + myCertificates.length },
            { id: 'perfil', label: 'Mi Ficha & Cobertura', icon: User, count: null },
            { id: 'hce_copy', label: 'Copia HCE (Ley 26.529)', icon: Scale, count: null }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.1rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: isActive ? '#002182' : 'transparent',
                  color: isActive ? '#ffffff' : '#496386',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    style={{
                      background: isActive ? 'rgba(255, 255, 255, 0.25)' : '#EDF3FD',
                      color: isActive ? '#ffffff' : '#002182',
                      padding: '1px 7px',
                      borderRadius: '100px',
                      fontSize: '0.72rem',
                      fontWeight: 800
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 3. TAB PANELS CONTENT */}
        {/* TAB 1: MIS TURNOS */}
        {activeTab === 'turnos' && (
          <div>
            {/* Sub-tabs: Próximos vs Pasados */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <button
                onClick={() => setAppointmentSubTab('upcoming')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: appointmentSubTab === 'upcoming' ? '#076ABC' : '#ffffff',
                  color: appointmentSubTab === 'upcoming' ? '#ffffff' : '#496386',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                }}
              >
                Turnos Programados ({upcomingAppointments.length})
              </button>
              <button
                onClick={() => setAppointmentSubTab('past')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: appointmentSubTab === 'past' ? '#076ABC' : '#ffffff',
                  color: appointmentSubTab === 'past' ? '#ffffff' : '#496386',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                }}
              >
                Historial de Turnos ({pastAppointments.length})
              </button>
            </div>

            {/* List */}
            {appointmentSubTab === 'upcoming' ? (
              upcomingAppointments.length === 0 ? (
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '3rem 2rem',
                    textAlign: 'center',
                    border: '1.5px solid #D2E3FC'
                  }}
                >
                  <CalendarCheck size={44} color="#7994B8" style={{ margin: '0 auto 1rem' }} />
                  <h3 style={{ fontSize: '1.2rem', color: '#002182', margin: '0 0 0.4rem' }}>
                    No tenés turnos programados próximos
                  </h3>
                  <p style={{ color: '#496386', fontSize: '0.88rem', margin: '0 0 1.25rem' }}>
                    Podés solicitar un turno online de forma ágil eligiendo especialidad, profesional y fecha disponible.
                  </p>
                  <button
                    onClick={() => setCurrentView('booking')}
                    style={{
                      background: '#076ABC',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.65rem 1.25rem',
                      borderRadius: '10px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Agendar un Turno Ahora
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
                  {upcomingAppointments.map((app) => {
                    const badge = getStatusBadge(app.status);
                    return (
                      <div
                        key={app.id}
                        style={{
                          background: '#ffffff',
                          borderRadius: '16px',
                          border: '1.5px solid #D2E3FC',
                          padding: '1.5rem',
                          boxShadow: '0 4px 15px rgba(0, 33, 130, 0.05)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '1rem'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                            <span
                              style={{
                                background: badge.bg,
                                color: badge.color,
                                border: `1px solid ${badge.border}`,
                                padding: '0.25rem 0.65rem',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                fontWeight: 800
                              }}
                            >
                              {badge.text}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#7994B8', fontWeight: 700 }}>
                              Cód: {app.bookingCode || app.id}
                            </span>
                          </div>

                          <h4 style={{ margin: '0 0 0.35rem', fontSize: '1.15rem', color: '#002182', fontWeight: 900 }}>
                            {app.doctorName}
                          </h4>
                          <div style={{ fontSize: '0.85rem', color: '#076ABC', fontWeight: 700, marginBottom: '0.85rem' }}>
                            {app.doctorSpecialty || 'Especialidad Traumatológica'}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.84rem', color: '#334155' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <Calendar size={15} color="#076ABC" />
                              <strong>Fecha:</strong> {app.date}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <Clock size={15} color="#076ABC" />
                              <strong>Horario:</strong> {app.time} hs
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <MapPin size={15} color="#076ABC" />
                              <strong>Lugar:</strong> {app.roomName || 'Consultorio Central CITRA'}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ borderTop: '1px solid #EDF3FD', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => setSelectedAppointmentForTicket(app)}
                            style={{
                              flex: 1,
                              background: '#EBF3FD',
                              border: '1px solid #D2E3FC',
                              color: '#002182',
                              padding: '0.55rem',
                              borderRadius: '10px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.35rem',
                              cursor: 'pointer'
                            }}
                          >
                            <Printer size={15} />
                            Comprobante / QR
                          </button>

                          <button
                            onClick={() => setAppointmentToCancel(app)}
                            style={{
                              background: '#FFF1F2',
                              border: '1px solid #FECDD3',
                              color: '#991B1B',
                              padding: '0.55rem 0.85rem',
                              borderRadius: '10px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              // Past Appointments
              pastAppointments.length === 0 ? (
                <div style={{ background: '#ffffff', borderRadius: '16px', padding: '2.5rem', textAlign: 'center', border: '1.5px solid #D2E3FC' }}>
                  <p style={{ color: '#496386' }}>No hay turnos pasados en tu historial.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {pastAppointments.map((app) => (
                    <div
                      key={app.id}
                      style={{
                        background: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #D2E3FC',
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.75rem'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#002182' }}>
                          {app.doctorName} · {app.doctorSpecialty}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {app.date} a las {app.time} hs · {app.roomName || 'Consultorio CITRA'}
                        </div>
                      </div>
                      <span
                        style={{
                          background: app.status === 'atendido' ? '#F0FDF4' : '#FFF1F2',
                          color: app.status === 'atendido' ? '#166534' : '#991B1B',
                          padding: '0.3rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.76rem',
                          fontWeight: 800
                        }}
                      >
                        {app.status === 'atendido' ? 'Atendido' : 'Cancelado'}
                      </span>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}

        {/* TAB 2: MI HISTORIA CLÍNICA */}
        {activeTab === 'hce' && (
          <div>
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1.5px solid #D2E3FC', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: '0 0 0.25rem', color: '#002182', fontSize: '1.2rem', fontWeight: 900 }}>
                Evoluciones y Consultas Médicas
              </h3>
              <p style={{ margin: 0, color: '#496386', fontSize: '0.86rem' }}>
                Conforme a la Ley 26.529, tenés acceso garantizado a los asientos de tu Historia Clínica firmados digitalmente.
              </p>
            </div>

            {myConsultations.length === 0 ? (
              <div style={{ background: '#ffffff', borderRadius: '16px', padding: '3rem', textAlign: 'center', border: '1.5px solid #D2E3FC' }}>
                <FileText size={40} color="#7994B8" style={{ margin: '0 auto 0.75rem' }} />
                <h4 style={{ color: '#002182', margin: '0 0 0.35rem' }}>Sin consultas registradas aún</h4>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
                  Cuando el profesional registre tu atención, tus diagnósticos y evolución médica figurarán aquí.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {myConsultations.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      border: '1.5px solid #D2E3FC',
                      padding: '1.5rem',
                      boxShadow: '0 4px 15px rgba(0, 33, 130, 0.04)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', background: '#EBF3FD', color: '#002182', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 800 }}>
                          CONSULTA MÉDICA · {c.specialtyName || 'Traumatología'}
                        </span>
                        <h4 style={{ margin: '0.4rem 0 0.2rem', fontSize: '1.15rem', color: '#002182', fontWeight: 900 }}>
                          {c.doctorName}
                        </h4>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          Matrícula: {c.doctorLicense} · Fecha: {c.date} ({c.time} hs)
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedConsultationForPrint(c)}
                        style={{
                          background: '#F5F8FE',
                          border: '1px solid #D2E3FC',
                          color: '#002182',
                          padding: '0.5rem 0.85rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          cursor: 'pointer'
                        }}
                      >
                        <Printer size={15} />
                        Descargar / Imprimir
                      </button>
                    </div>

                    <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1rem', marginBottom: '0.85rem', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.78rem', color: '#076ABC', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                        Diagnóstico Principal (CIE-10)
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                        {c.diagnosis}
                      </div>
                    </div>

                    <div style={{ marginBottom: '0.85rem' }}>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        Evolución Clínica & Motivo
                      </div>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
                        {c.evolution || c.reason}
                      </p>
                    </div>

                    {c.indications && (
                      <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '0.85rem' }}>
                        <div style={{ fontSize: '0.76rem', color: '#166534', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                          Indicaciones Médicas
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#14532d' }}>
                          {c.indications}
                        </div>
                      </div>
                    )}

                    <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #EDF3FD', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#7994B8' }}>
                      <span>Firma Digital: PKI ONTI Homologada</span>
                      <span>Hash SHA-256: {c.integrityHash ? c.integrityHash.substring(0, 16) + '...' : 'Inalterable'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MIS RECETAS MÉDICAS (CUIR) */}
        {activeTab === 'recetas' && (
          <div>
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1.5px solid #D2E3FC', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: '0 0 0.25rem', color: '#002182', fontSize: '1.2rem', fontWeight: 900 }}>
                Recetas Médicas Electrónicas Oficiales (ReNaPDiS)
              </h3>
              <p style={{ margin: 0, color: '#496386', fontSize: '0.86rem' }}>
                Emitidas bajo Ley Nacional 27.553 con Código Único de Identificación de Receta (CUIR) y validez nacional en farmacias.
              </p>
            </div>

            {myPrescriptions.length === 0 ? (
              <div style={{ background: '#ffffff', borderRadius: '16px', padding: '3rem', textAlign: 'center', border: '1.5px solid #D2E3FC' }}>
                <Pill size={40} color="#7994B8" style={{ margin: '0 auto 0.75rem' }} />
                <h4 style={{ color: '#002182', margin: '0 0 0.35rem' }}>Sin recetas electrónicas registradas</h4>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
                  Las prescripciones emitidas por tus médicos tratantes estarán disponibles aquí con su respectivo código QR.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
                {myPrescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      border: '1.5px solid #D2E3FC',
                      padding: '1.5rem',
                      boxShadow: '0 4px 15px rgba(0, 33, 130, 0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '1rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ background: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 800 }}>
                          CUIR OFICIAL
                        </span>
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          Vence: {rx.expirationDate || '30 días'}
                        </span>
                      </div>

                      <div style={{ fontFamily: 'monospace', fontSize: '0.88rem', fontWeight: 800, color: '#002182', background: '#F5F8FE', padding: '0.45rem 0.6rem', borderRadius: '8px', marginBottom: '0.75rem' }}>
                        {rx.cuir}
                      </div>

                      <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>
                        {rx.doctorName}
                      </h4>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.85rem' }}>
                        Matrícula: {rx.doctorLicense} · Diagnóstico: {rx.diagnosisPresuntivo}
                      </div>

                      <div style={{ borderTop: '1px dashed #D2E3FC', paddingTop: '0.75rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#076ABC', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                          Medicamentos Prescritos
                        </div>
                        {Array.isArray(rx.medications) && rx.medications.map((m, mIdx) => (
                          <div key={mIdx} style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem' }}>
                            • <strong>{m.dci || m.medication}</strong> ({m.concentration || 'Dosis'}) — {m.instructions}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #EDF3FD', paddingTop: '0.85rem' }}>
                      <button
                        onClick={() => setSelectedPrescriptionForView(rx)}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.65rem',
                          borderRadius: '10px',
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.45rem',
                          cursor: 'pointer'
                        }}
                      >
                        <Eye size={16} />
                        Ver Receta & QR Farmacia
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ESTUDIOS & RADIOLOGÍA */}
        {activeTab === 'estudios' && (
          <div>
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1.5px solid #D2E3FC', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: '0 0 0.25rem', color: '#002182', fontSize: '1.2rem', fontWeight: 900 }}>
                Estudios de Diagnóstico por Imágenes & Radiología
              </h3>
              <p style={{ margin: 0, color: '#496386', fontSize: '0.86rem' }}>
                Consultá los pedidos médicos de radiografías, ecografías y estudios de diagnóstico realizados en CITRA.
              </p>
            </div>

            {myStudies.length === 0 ? (
              <div style={{ background: '#ffffff', borderRadius: '16px', padding: '3rem', textAlign: 'center', border: '1.5px solid #D2E3FC' }}>
                <Eye size={40} color="#7994B8" style={{ margin: '0 auto 0.75rem' }} />
                <h4 style={{ color: '#002182', margin: '0 0 0.35rem' }}>Sin estudios solicitados</h4>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
                  Cuando el médico solicite una radiografía o ecografía, la orden y el resultado aparecerán en esta sección.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
                {myStudies.map((st) => (
                  <div
                    key={st.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      border: '1.5px solid #D2E3FC',
                      padding: '1.5rem',
                      boxShadow: '0 4px 15px rgba(0, 33, 130, 0.04)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ background: '#EBF3FD', color: '#002182', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                        {st.studyType}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Fecha: {st.date}
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 0.35rem', fontSize: '1.1rem', color: '#002182', fontWeight: 900 }}>
                      Región: {st.region}
                    </h4>
                    <div style={{ fontSize: '0.82rem', color: '#496386', marginBottom: '0.75rem' }}>
                      Solicitado por: {st.referringDoctor || 'Dr. Alejandro Blanco'}
                    </div>

                    {st.report && (
                      <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '0.85rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#076ABC', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                          Informe Radiológico
                        </div>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155' }}>
                          {st.report}
                        </p>
                      </div>
                    )}

                    <div style={{ borderTop: '1px solid #EDF3FD', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.76rem', color: '#166534', fontWeight: 800 }}>
                        Estado: {st.status || 'Completado'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: ÓRDENES & CERTIFICADOS */}
        {activeTab === 'certificados' && (
          <div>
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1.5px solid #D2E3FC', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: '0 0 0.25rem', color: '#002182', fontSize: '1.2rem', fontWeight: 900 }}>
                Certificados Médicos & Órdenes Oficiales
              </h3>
              <p style={{ margin: 0, color: '#496386', fontSize: '0.86rem' }}>
                Constancias de atención, certificados de reposo laboral/deportivo y derivaciones emitidas por CITRA.
              </p>
            </div>

            {myCertificates.length === 0 && myOrders.length === 0 ? (
              <div style={{ background: '#ffffff', borderRadius: '16px', padding: '3rem', textAlign: 'center', border: '1.5px solid #D2E3FC' }}>
                <FileCheck2 size={40} color="#7994B8" style={{ margin: '0 auto 0.75rem' }} />
                <h4 style={{ color: '#002182', margin: '0 0 0.35rem' }}>Sin certificados u órdenes emitidas</h4>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
                  Los certificados oficiales expedidos en tus consultas estarán disponibles aquí.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
                {myCertificates.map((cert) => (
                  <div key={cert.id} style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #D2E3FC', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ background: '#FEF3C7', color: '#92400E', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 800 }}>
                        CERTIFICADO MÉDICO
                      </span>
                      <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{cert.date}</span>
                    </div>
                    <h4 style={{ margin: '0 0 0.25rem', color: '#002182', fontWeight: 800 }}>{cert.doctorName}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0 0 0.5rem' }}>
                      <strong>Diagnóstico:</strong> {cert.diagnosis}
                    </p>
                    {cert.restDays > 0 && (
                      <div style={{ fontSize: '0.82rem', color: '#b45309', fontWeight: 700 }}>
                        Reposo indicado: {cert.restDays} días corridos.
                      </div>
                    )}
                  </div>
                ))}

                {myOrders.map((ord) => (
                  <div key={ord.id} style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #D2E3FC', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ background: '#EBF3FD', color: '#002182', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 800 }}>
                        ORDEN MÉDICA
                      </span>
                      <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{ord.date}</span>
                    </div>
                    <h4 style={{ margin: '0 0 0.25rem', color: '#002182', fontWeight: 800 }}>{ord.type}</h4>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.5rem' }}>
                      Profesional: {ord.doctorName}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#334155', margin: 0 }}>
                      {ord.instructions}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: MI FICHA & COBERTURA */}
        {activeTab === 'perfil' && (
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1.5px solid #D2E3FC', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.25rem', color: '#002182', fontSize: '1.3rem', fontWeight: 900 }}>
                  Filiación Personal & Cobertura Médica
                </h3>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
                  Consultá y mantené actualizados tus datos de contacto y credenciales de salud.
                </p>
              </div>

              {!isEditingProfile ? (
                <button
                  onClick={() => {
                    setProfilePhone(authPatient.phone || '');
                    setProfileEmail(authPatient.email || '');
                    setProfileInsuranceNumber(authPatient.insuranceNumber || '');
                    setIsEditingProfile(true);
                  }}
                  style={{
                    background: '#EBF3FD',
                    color: '#002182',
                    border: '1.5px solid #8EBEF5',
                    padding: '0.65rem 1.25rem',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  Editar Datos de Contacto
                </button>
              ) : (
                <button
                  onClick={() => setIsEditingProfile(false)}
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    padding: '0.65rem 1rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar Edición
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updatePatient(authPatient.id, {
                    phone: profilePhone.trim(),
                    email: profileEmail.trim(),
                    insuranceNumber: profileInsuranceNumber.trim()
                  });
                  setIsEditingProfile(false);
                  addToast('Datos Actualizados', 'Tus datos de contacto han sido guardados.', 'success');
                }}
                style={{ background: '#F8FAFC', border: '1.5px solid #D2E3FC', borderRadius: '16px', padding: '1.75rem', marginBottom: '1.5rem' }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                      Teléfono de Contacto (WhatsApp)
                    </label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="Ej: +54 9 3576 445566"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #D2E3FC', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      placeholder="paciente@correo.com"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #D2E3FC', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                      Número de Afiliado / Credencial
                    </label>
                    <input
                      type="text"
                      value={profileInsuranceNumber}
                      onChange={(e) => setProfileInsuranceNumber(e.target.value)}
                      placeholder="Ej: 988421004"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #D2E3FC', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="submit"
                    style={{
                      background: 'linear-gradient(135deg, #002182 0%, #076ABC 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.75rem 1.75rem',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      cursor: 'pointer'
                    }}
                  >
                    Guardar Cambios
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid #D2E3FC',
                      color: '#002182',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#7994B8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Nombre y Apellido
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                    {authPatient.name}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', color: '#7994B8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Documento Nacional de Identidad (DNI)
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                    {authPatient.dni}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', color: '#7994B8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Obra Social / Cobertura
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#076ABC' }}>
                    {authPatient.insuranceName || 'Particular'} ({authPatient.insurancePlan || 'Plan Estándar'})
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', color: '#7994B8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Número de Afiliado
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                    {authPatient.insuranceNumber || 'Particular / Directo'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', color: '#7994B8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Teléfono de Contacto
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                    {authPatient.phone || 'No registrado'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', color: '#7994B8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Correo Electrónico
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                    {authPatient.email || 'No registrado'}
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #EDF3FD', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
              <ShieldCheck size={18} color="#16a34a" />
              Tus datos de salud están protegidos bajo las Leyes Nacionales 25.326 y 26.529 de Confidencialidad Sanitaria.
            </div>
          </div>
        )}

        {/* TAB 7: SOLICITUD DE COPIA HCE (LEY 26.529) */}
        {activeTab === 'hce_copy' && (
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1.5px solid #D2E3FC', padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Scale size={28} color="#002182" />
              <div>
                <h3 style={{ margin: 0, color: '#002182', fontSize: '1.3rem', fontWeight: 900 }}>
                  Solicitud de Copia Auténtica de Historia Clínica
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Trámite oficial amparado en el Art. 14 de la Ley Nacional 26.529
                </div>
              </div>
            </div>

            <p style={{ color: '#334155', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              El paciente es el titular legítimo de su Historia Clínica y tiene el derecho inalienable a requerir en cualquier momento copia auténtica y fehaciente de la misma, la cual será entregada dentro de las 48 horas hábiles contadas a partir de la presentación formal.
            </p>

            {hceRequestSent ? (
              <div style={{ background: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
                <CheckCircle2 size={40} color="#16a34a" style={{ margin: '0 auto 0.75rem' }} />
                <h4 style={{ color: '#166534', margin: '0 0 0.35rem', fontSize: '1.15rem' }}>
                  Solicitud Formal Registrada con Éxito
                </h4>
                <p style={{ color: '#14532d', fontSize: '0.88rem', margin: 0 }}>
                  Número de expediente: <strong>CITRA-HCE-{cleanPatientDni}-2026</strong>. Nuestro departamento médico emitirá el legajo autenticado con firma digital dentro de las 48 hs hábiles.
                </p>
              </div>
            ) : (
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.75rem' }}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#002182', marginBottom: '0.4rem' }}>
                    Motivo de la solicitud (Opcional)
                  </label>
                  <input
                    type="text"
                    defaultValue="Uso personal / Continuidad de tratamiento"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #D2E3FC', fontSize: '0.9rem' }}
                  />
                </div>

                <button
                  onClick={handleRequestHceCopy}
                  style={{
                    background: 'linear-gradient(135deg, #002182 0%, #076ABC 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.85rem 1.75rem',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 15px rgba(0, 33, 130, 0.25)'
                  }}
                >
                  <Send size={16} />
                  Ingresar Solicitud Formal Fehadiente
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: TICKET / COMPROBANTE CON QR DEL TURNO */}
      {selectedAppointmentForTicket && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 21, 86, 0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setSelectedAppointmentForTicket(null)}
        >
          <div
            style={{
              maxWidth: '440px',
              width: '100%',
              background: '#ffffff',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ background: '#002182', color: '#ffffff', padding: '1.5rem', textAlign: 'center', position: 'relative' }}>
              <button
                onClick={() => setSelectedAppointmentForTicket(null)}
                style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
              <div style={{ fontSize: '0.78rem', color: '#D2E3FC', fontWeight: 800, letterSpacing: '0.05em' }}>
                CITRA CLÍNICA MÉDICA
              </div>
              <h3 style={{ margin: '0.35rem 0 0', fontSize: '1.3rem', fontWeight: 900 }}>
                Comprobante Oficial de Turno
              </h3>
            </div>

            <div style={{ padding: '1.75rem', textAlign: 'center' }}>
              <div style={{ display: 'inline-block', padding: '0.85rem', background: '#F8FAFC', borderRadius: '16px', border: '1.5px solid #E2E8F0', marginBottom: '1.25rem' }}>
                <QRCodeSVG
                  value={`CITRA-TURNO|${selectedAppointmentForTicket.id}|${selectedAppointmentForTicket.patientDni}|${selectedAppointmentForTicket.date}|${selectedAppointmentForTicket.time}`}
                  size={140}
                  level="H"
                />
              </div>

              <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: '1rem' }}>
                Presentá este código QR en la recepción al ingresar
              </div>

              <div style={{ textAlign: 'left', background: '#F5F8FE', padding: '1rem', borderRadius: '12px', border: '1px solid #D2E3FC', fontSize: '0.86rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem' }}>
                <div><strong>Profesional:</strong> {selectedAppointmentForTicket.doctorName}</div>
                <div><strong>Especialidad:</strong> {selectedAppointmentForTicket.doctorSpecialty}</div>
                <div><strong>Fecha:</strong> {selectedAppointmentForTicket.date} a las {selectedAppointmentForTicket.time} hs</div>
                <div><strong>Consultorio:</strong> {selectedAppointmentForTicket.roomName || 'Consultorio 101'}</div>
                <div><strong>Paciente:</strong> {selectedAppointmentForTicket.patientName} (DNI: {selectedAppointmentForTicket.patientDni})</div>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    flex: 1,
                    background: '#076ABC',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  Imprimir Comprobante
                </button>
                <button
                  onClick={() => setSelectedAppointmentForTicket(null)}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #D2E3FC',
                    color: '#002182',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMACIÓN DE CANCELACIÓN */}
      {appointmentToCancel && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 21, 86, 0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setAppointmentToCancel(null)}
        >
          <div
            style={{
              maxWidth: '440px',
              width: '100%',
              background: '#ffffff',
              borderRadius: '24px',
              padding: '2rem',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#991B1B', fontSize: '1.2rem', fontWeight: 900 }}>
                  ¿Cancelar este turno?
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  {appointmentToCancel.date} a las {appointmentToCancel.time} hs
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '1rem', lineHeight: 1.5 }}>
              El turno con el <strong>{appointmentToCancel.doctorName}</strong> quedará liberado en la agenda de la clínica.
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#002182', marginBottom: '0.35rem' }}>
                Motivo de cancelación:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1.5px solid #D2E3FC', fontSize: '0.88rem' }}
              >
                <option value="Imposibilidad horaria / Laboral">Imposibilidad horaria / Laboral</option>
                <option value="Problema de salud / Reposo">Problema de salud / Reposo</option>
                <option value="Reprogramación para otra fecha">Reprogramación para otra fecha</option>
                <option value="Causas personales">Causas personales</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                onClick={handleConfirmCancel}
                style={{
                  flex: 1,
                  background: '#DC2626',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Confirmar Cancelación
              </button>
              <button
                onClick={() => setAppointmentToCancel(null)}
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #D2E3FC',
                  color: '#002182',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
