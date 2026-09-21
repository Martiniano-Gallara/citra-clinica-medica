import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { QRCodeSVG } from 'qrcode.react';
import {
  Calendar,
  CalendarCheck,
  CalendarPlus,
  Clock,
  MapPin,
  AlertTriangle,
  Printer,
  LogIn,
  X,
  ShieldCheck,
  LogOut,
  User
} from 'lucide-react';

export const PatientUnifiedPortal = () => {
  const {
    authRole,
    authPatient,
    logoutPatient,
    appointments,
    cancelAppointment,
    setCurrentView,
    setIsAuthModalOpen,
    setAuthModalTab,
    addToast
  } = useClinic();

  const [appointmentSubTab, setAppointmentSubTab] = useState('upcoming'); // 'upcoming' | 'past'
  const [selectedAppointmentForTicket, setSelectedAppointmentForTicket] = useState(null);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('Imposibilidad horaria / Laboral');

  // Bloquear scroll de fondo cuando hay un modal abierto en el portal
  useEffect(() => {
    if (selectedAppointmentForTicket || appointmentToCancel) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [selectedAppointmentForTicket, appointmentToCancel]);

  // Si el paciente no está autenticado, pantalla de bienvenida
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
            maxWidth: '440px',
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
            <User size={30} />
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#002182', margin: '0 0 0.5rem' }}>
            Portal del Paciente CITRA
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#496386', margin: '0 0 1.75rem', lineHeight: 1.5 }}>
            Accedé a tus turnos, consultas programadas y gestioná tus citas médicas en Arroyito.
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
                fontSize: '0.92rem',
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
                fontSize: '0.88rem',
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

  // Filtrar turnos del paciente
  const cleanPatientDni = (authPatient.dni || '').replace(/\D/g, '');
  const patientAppointments = appointments.filter((a) => {
    const appDni = (a.patientDni || '').replace(/\D/g, '');
    return a.patientId === authPatient.id || (cleanPatientDni && appDni === cleanPatientDni);
  });

  const upcomingAppointments = patientAppointments.filter(
    (a) => a.status === 'confirmado' || a.status === 'pendiente' || a.status === 'en_sala'
  );

  const pastAppointments = patientAppointments.filter(
    (a) => a.status === 'atendido' || a.status === 'cancelado'
  );

  const handleConfirmCancel = () => {
    if (appointmentToCancel) {
      cancelAppointment(appointmentToCancel.id, cancelReason);
      setAppointmentToCancel(null);
      addToast('Turno Cancelado', 'El turno ha sido cancelado en el sistema.', 'info');
    }
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
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        
        {/* TOP WELCOME BANNER (SIN IMAGEN DE PERFIL) */}
        <div
          style={{
            background: 'linear-gradient(135deg, #002182 0%, #076ABC 100%)',
            color: '#ffffff',
            borderRadius: '20px',
            padding: '1.75rem 2rem',
            marginBottom: '1.75rem',
            boxShadow: '0 10px 30px rgba(0, 33, 130, 0.15)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.25rem'
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(255, 255, 255, 0.18)',
                padding: '0.25rem 0.65rem',
                borderRadius: '100px',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                marginBottom: '0.4rem'
              }}
            >
              <ShieldCheck size={14} />
              PORTAL DEL PACIENTE · CITRA
            </div>
            <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
              Hola, {authPatient.name}
            </h1>
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.86rem', color: '#D2E3FC' }}>
              DNI: {authPatient.dni} · Cobertura: {authPatient.insuranceName || 'Particular'} ({authPatient.insurancePlan || 'Estándar'})
            </p>
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

        {/* SECCIÓN ÚNICA: GESTIÓN DE TURNOS */}
        <div style={{ marginBottom: '1.5rem' }}>
          {/* Sub-tabs: Próximos vs Pasados */}
          <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <button
              onClick={() => setAppointmentSubTab('upcoming')}
              style={{
                padding: '0.6rem 1.15rem',
                borderRadius: '12px',
                border: appointmentSubTab === 'upcoming' ? '1.5px solid #076ABC' : '1.5px solid #D2E3FC',
                background: appointmentSubTab === 'upcoming' ? '#076ABC' : '#ffffff',
                color: appointmentSubTab === 'upcoming' ? '#ffffff' : '#002182',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer',
                boxShadow: appointmentSubTab === 'upcoming' ? '0 3px 10px rgba(7, 106, 188, 0.25)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Turnos Activos ({upcomingAppointments.length})
            </button>

            <button
              onClick={() => setAppointmentSubTab('past')}
              style={{
                padding: '0.6rem 1.15rem',
                borderRadius: '12px',
                border: appointmentSubTab === 'past' ? '1.5px solid #076ABC' : '1.5px solid #D2E3FC',
                background: appointmentSubTab === 'past' ? '#076ABC' : '#ffffff',
                color: appointmentSubTab === 'past' ? '#ffffff' : '#002182',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer',
                boxShadow: appointmentSubTab === 'past' ? '0 3px 10px rgba(7, 106, 188, 0.25)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Historial de Turnos ({pastAppointments.length})
            </button>
          </div>

          {/* Lista de Turnos Activos */}
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
                <h3 style={{ fontSize: '1.2rem', color: '#002182', margin: '0 0 0.4rem', fontWeight: 800 }}>
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
                    padding: '0.7rem 1.4rem',
                    borderRadius: '10px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Agendar un Turno Ahora
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.1rem' }}>
                {upcomingAppointments.map((app) => {
                  const badge = getStatusBadge(app.status);
                  return (
                    <div
                      key={app.id}
                      style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        border: '1.5px solid #D2E3FC',
                        padding: '1.35rem',
                        boxShadow: '0 4px 15px rgba(0, 33, 130, 0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '1rem'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                          <span
                            style={{
                              background: badge.bg,
                              color: badge.color,
                              border: `1px solid ${badge.border}`,
                              padding: '0.2rem 0.6rem',
                              borderRadius: '8px',
                              fontSize: '0.74rem',
                              fontWeight: 800
                            }}
                          >
                            {badge.text}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#7994B8', fontWeight: 700 }}>
                            Cód: {app.bookingCode || app.id}
                          </span>
                        </div>

                        <h4 style={{ margin: '0 0 0.3rem', fontSize: '1.1rem', color: '#002182', fontWeight: 900 }}>
                          {app.doctorName}
                        </h4>
                        <div style={{ fontSize: '0.84rem', color: '#076ABC', fontWeight: 700, marginBottom: '0.85rem' }}>
                          {app.doctorSpecialty || 'Especialidad Médica'}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.84rem', color: '#334155' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <Calendar size={15} color="#076ABC" />
                            <span><strong>Fecha:</strong> {app.date}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <Clock size={15} color="#076ABC" />
                            <span><strong>Horario:</strong> {app.time} hs</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <MapPin size={15} color="#076ABC" />
                            <span><strong>Lugar:</strong> {app.roomName || 'Consultorios CITRA'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div style={{ borderTop: '1px solid #EDF3FD', paddingTop: '0.85rem', display: 'flex', gap: '0.5rem' }}>
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
                          <Printer size={14} />
                          Comprobante / QR
                        </button>
                        <button
                          onClick={() => setAppointmentToCancel(app)}
                          style={{
                            background: '#FFF1F2',
                            border: '1px solid #FECDD3',
                            color: '#991B1B',
                            padding: '0.55rem 0.9rem',
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
            /* Lista de Historial de Turnos */
            pastAppointments.length === 0 ? (
              <div style={{ background: '#ffffff', borderRadius: '16px', padding: '2.5rem', textAlign: 'center', border: '1.5px solid #D2E3FC' }}>
                <p style={{ color: '#496386', margin: 0 }}>No hay turnos pasados en tu historial.</p>
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
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                        {app.date} a las {app.time} hs · {app.roomName || 'Consultorios CITRA'}
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
      </div>

      {/* MODAL: COMPROBANTE / TICKET CON QR */}
      {selectedAppointmentForTicket && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 21, 86, 0.72)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
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
              maxWidth: '420px',
              width: '100%',
              background: '#ffffff',
              borderRadius: '24px',
              padding: '2rem',
              textAlign: 'center',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedAppointmentForTicket(null)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#EBF3FD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#076ABC', margin: '0 auto 0.75rem' }}>
              <Printer size={24} />
            </div>

            <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.25rem', fontWeight: 900, color: '#002182' }}>
              Comprobante de Turno
            </h3>
            <div style={{ fontSize: '0.84rem', color: '#076ABC', fontWeight: 800, marginBottom: '1.25rem' }}>
              CITRA · Arroyito
            </div>

            {/* QR Code */}
            <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '16px', border: '1.5px dashed #076ABC', display: 'inline-block', marginBottom: '0.75rem' }}>
              <QRCodeSVG
                value={`CITRA-TURNO-${selectedAppointmentForTicket.id}-${selectedAppointmentForTicket.patientDni}`}
                size={140}
                level="M"
              />
            </div>

            <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: '1rem' }}>
              Presentá este código QR en la recepción al ingresar
            </div>

            <div style={{ textAlign: 'left', background: '#F5F8FE', padding: '1rem', borderRadius: '12px', border: '1px solid #D2E3FC', fontSize: '0.86rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem' }}>
              <div><strong>Profesional:</strong> {selectedAppointmentForTicket.doctorName}</div>
              <div><strong>Especialidad:</strong> {selectedAppointmentForTicket.doctorSpecialty}</div>
              <div><strong>Fecha:</strong> {selectedAppointmentForTicket.date} a las {selectedAppointmentForTicket.time} hs</div>
              <div><strong>Consultorio:</strong> {selectedAppointmentForTicket.roomName || 'Consultorio CITRA'}</div>
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
      )}

      {/* MODAL: CONFIRMACIÓN DE CANCELACIÓN */}
      {appointmentToCancel && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 21, 86, 0.72)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
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
              maxWidth: '420px',
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
                <h3 style={{ margin: 0, color: '#991B1B', fontSize: '1.15rem', fontWeight: 900 }}>
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
