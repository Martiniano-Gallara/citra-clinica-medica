import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { QRCodeSVG } from 'qrcode.react';
import {
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
  Calendar,
  History,
  AlertCircle,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const MyTurnosView = () => {
  const {
    authRole,
    authPatient,
    appointments,
    cancelAppointment,
    setCurrentView,
    setIsAuthModalOpen,
    setAuthModalTab
  } = useClinic();

  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past'
  const [selectedAppointmentForTicket, setSelectedAppointmentForTicket] = useState(null);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('Imposibilidad horaria / Laboral');

  // Helper date formatters
  const formatMonth = (dateStr) => {
    try {
      const d = new Date(dateStr + 'T12:00:00');
      return d.toLocaleDateString('es-AR', { month: 'short' }).replace('.', '').toUpperCase();
    } catch {
      return 'TURNO';
    }
  };

  const formatDayNumber = (dateStr) => {
    try {
      return dateStr.split('-')[2] || dateStr;
    } catch {
      return '';
    }
  };

  const formatFullDate = (dateStr) => {
    try {
      const d = new Date(dateStr + 'T12:00:00');
      return d.toLocaleDateString('es-AR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // If user is not authenticated as patient
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
            borderRadius: '20px',
            border: '1.5px solid #D2E3FC',
            padding: '2.25rem 1.75rem',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0, 33, 130, 0.08)'
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: '#EBF3FD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#076ABC',
              margin: '0 auto 1.25rem'
            }}
          >
            <User size={30} />
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#002182', margin: '0 0 0.5rem' }}>
            Acceso a Mis Turnos
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#496386', margin: '0 0 1.75rem', lineHeight: 1.5 }}>
            Para consultar tus citas médicas, descargar comprobantes oficiales o gestionar cancelaciones, iniciá sesión en el Portal del Paciente CITRA.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={() => { setAuthModalTab('login'); setIsAuthModalOpen(true); }}
              style={{
                background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.8rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(7, 106, 188, 0.25)'
              }}
            >
              <LogIn size={18} />
              Iniciar Sesión
            </button>

            <button
              onClick={() => setCurrentView('home')}
              style={{
                background: '#ffffff',
                border: '1.5px solid #D2E3FC',
                color: '#002182',
                padding: '0.75rem',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter patient's appointments
  const myAppointments = appointments.filter(
    (a) => a.patientId === authPatient.id || a.patientDni === authPatient.dni
  );

  const upcomingAppointments = myAppointments.filter(
    (a) => a.status === 'confirmado' || a.status === 'pendiente' || a.status === 'en-sala'
  );

  const pastAppointments = myAppointments.filter(
    (a) => a.status === 'atendido' || a.status === 'cancelado' || a.status === 'ausente'
  );

  const handleConfirmCancel = () => {
    if (appointmentToCancel) {
      cancelAppointment(appointmentToCancel.id, cancelReason);
      setAppointmentToCancel(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmado':
        return { text: 'Confirmado', bg: '#EBF8F2', color: '#065F46', border: '#A7F3D0', dot: '#10B981' };
      case 'pendiente':
        return { text: 'Pendiente', bg: '#FEF3C7', color: '#92400E', border: '#FCD34D', dot: '#F59E0B' };
      case 'en-sala':
        return { text: 'En Espera', bg: '#EBF3FD', color: '#002182', border: '#93C5FD', dot: '#2563EB' };
      case 'atendido':
        return { text: 'Atendido', bg: '#F0FDF4', color: '#166534', border: '#BBF7D0', dot: '#22C55E' };
      case 'cancelado':
        return { text: 'Cancelado', bg: '#FFF1F2', color: '#991B1B', border: '#FECDD3', dot: '#EF4444' };
      default:
        return { text: status, bg: '#F1F5F9', color: '#475569', border: '#CBD5E1', dot: '#64748B' };
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F5F8FE',
        padding: '1.25rem 1rem 3.5rem'
      }}
    >
      <style>{`
        .portal-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.6rem;
          margin-bottom: 1.25rem;
        }
        .portal-back-btn {
          background: #ffffff;
          border: 1px solid #D2E3FC;
          color: #002182;
          padding: 0.48rem 0.85rem;
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .portal-back-btn:hover {
          background: #EBF3FD;
          border-color: #257CE6;
        }
        .portal-new-btn {
          background: linear-gradient(135deg, #076ABC 0%, #002182 100%);
          color: #ffffff;
          border: none;
          padding: 0.5rem 0.95rem;
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          cursor: pointer;
          box-shadow: 0 3px 10px rgba(7, 106, 188, 0.22);
          transition: all 0.2s;
        }
        .portal-new-btn:hover {
          box-shadow: 0 5px 14px rgba(7, 106, 188, 0.35);
          transform: translateY(-1px);
        }
        .appointment-card {
          background: #ffffff;
          border-radius: 16px;
          border: 1.5px solid #E2ECF8;
          padding: 1.15rem;
          box-shadow: 0 4px 14px rgba(0, 33, 130, 0.04);
          transition: all 0.2s;
        }
        .appointment-card:hover {
          border-color: #BFDBFE;
          box-shadow: 0 6px 18px rgba(0, 33, 130, 0.08);
        }
        .appointment-actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.6rem;
          margin-top: 0.9rem;
          padding-top: 0.85rem;
          border-top: 1px solid #EDF3FD;
        }
        @media (max-width: 480px) {
          .back-btn-text-full { display: none; }
          .back-btn-text-short { display: inline; }
        }
        @media (min-width: 481px) {
          .back-btn-text-full { display: inline; }
          .back-btn-text-short { display: none; }
        }
      `}</style>

      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        {/* Navigation & Action Bar: Compact, 1 Single Row */}
        <div className="portal-top-bar">
          <button onClick={() => setCurrentView('home')} className="portal-back-btn">
            <ArrowLeft size={15} />
            <span className="back-btn-text-full">Web Institucional</span>
            <span className="back-btn-text-short">Inicio</span>
          </button>

          <button onClick={() => setCurrentView('booking')} className="portal-new-btn">
            <CalendarPlus size={15} />
            Sacar Turno
          </button>
        </div>

        {/* Patient Profile Header Card: Compact & Refined */}
        <div
          style={{
            background: 'linear-gradient(135deg, #001B5E 0%, #0756A5 100%)',
            color: '#ffffff',
            borderRadius: '18px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            boxShadow: '0 8px 24px rgba(0, 27, 94, 0.16)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle decorative glow */}
          <div
            style={{
              position: 'absolute',
              top: '-30%',
              right: '-10%',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(96,165,250,0.2) 0%, rgba(255,255,255,0) 70%)',
              pointerEvents: 'none'
            }}
          />

          {/* Profile Details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <img
              src={authPatient.avatar || 'https://images.unsplash.com/photo-1534528741775?w=120'}
              alt={authPatient.name}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid rgba(255,255,255,0.85)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                flexShrink: 0
              }}
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  color: '#93C5FD',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '2px'
                }}
              >
                <Sparkles size={11} />
                Portal del Paciente
              </div>
              <h1
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  margin: '0 0 4px',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {authPatient.name}
              </h1>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  fontSize: '0.76rem',
                  color: '#DCEBFF'
                }}
              >
                <span>DNI: <strong>{authPatient.dni}</strong></span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ShieldCheck size={13} color="#93C5FD" />
                  {authPatient.insuranceName} {authPatient.insurancePlan ? `(${authPatient.insurancePlan})` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Compact Integrated Stats Ribbon */}
          <div
            style={{
              marginTop: '1rem',
              background: 'rgba(0, 15, 50, 0.28)',
              backdropFilter: 'blur(4px)',
              borderRadius: '12px',
              padding: '0.65rem 0.9rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              alignItems: 'center',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#60A5FA', lineHeight: 1 }}>
                {upcomingAppointments.length}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#BFDBFE', marginTop: '2px' }}>
                Próximos
              </div>
            </div>

            <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.15)', borderRight: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#FFFFFF', lineHeight: 1 }}>
                {pastAppointments.length}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#BFDBFE', marginTop: '2px' }}>
                Historial
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#34D399', display: 'inline-block' }} />
                Activa
              </div>
              <div style={{ fontSize: '0.68rem', color: '#BFDBFE', marginTop: '2px' }}>
                Cuenta
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher: Modern Segmented Control */}
        <div
          style={{
            display: 'flex',
            background: '#EAEFF8',
            borderRadius: '12px',
            border: '1px solid #D2E3FC',
            padding: '3px',
            marginBottom: '1.25rem',
            width: '100%',
            maxWidth: '420px',
            margin: '0 auto 1.25rem'
          }}
        >
          <button
            onClick={() => setActiveTab('upcoming')}
            style={{
              flex: 1,
              padding: '0.55rem 0.75rem',
              borderRadius: '9px',
              border: 'none',
              background: activeTab === 'upcoming' ? '#002182' : 'transparent',
              color: activeTab === 'upcoming' ? '#ffffff' : '#334E68',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              boxShadow: activeTab === 'upcoming' ? '0 2px 8px rgba(0, 33, 130, 0.2)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <Calendar size={14} />
            Próximos Turnos ({upcomingAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            style={{
              flex: 1,
              padding: '0.55rem 0.75rem',
              borderRadius: '9px',
              border: 'none',
              background: activeTab === 'past' ? '#002182' : 'transparent',
              color: activeTab === 'past' ? '#ffffff' : '#334E68',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              boxShadow: activeTab === 'past' ? '0 2px 8px rgba(0, 33, 130, 0.2)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <History size={14} />
            Historial ({pastAppointments.length})
          </button>
        </div>

        {/* Tab 1: Upcoming Appointments */}
        {activeTab === 'upcoming' && (
          <div>
            {upcomingAppointments.length === 0 ? (
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '18px',
                  border: '1.5px solid #D2E3FC',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)'
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: '#EBF3FD',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#076ABC',
                    margin: '0 auto 1rem'
                  }}
                >
                  <CalendarCheck size={28} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#002182', margin: '0 0 0.35rem' }}>
                  No tenés turnos programados
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#496386', margin: '0 0 1.25rem', lineHeight: 1.4 }}>
                  Podés solicitar un turno online de forma inmediata para cualquiera de nuestros consultorios y especialistas.
                </p>
                <button
                  onClick={() => setCurrentView('booking')}
                  className="portal-new-btn"
                  style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}
                >
                  <CalendarPlus size={16} />
                  Sacar Turno Ahora
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {upcomingAppointments.map((app) => {
                  const badge = getStatusBadge(app.status);
                  const month = formatMonth(app.date);
                  const dayNum = formatDayNumber(app.date);

                  return (
                    <div key={app.id} className="appointment-card">
                      {/* Card Top: Date Badge + Specialty & Doctor */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                        {/* Compact Date Box */}
                        <div
                          style={{
                            width: '50px',
                            height: '52px',
                            borderRadius: '12px',
                            background: '#F0F6FE',
                            border: '1px solid #D2E3FC',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#076ABC', textTransform: 'uppercase', lineHeight: 1 }}>
                            {month}
                          </div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#002182', lineHeight: 1.1, marginTop: '2px' }}>
                            {dayNum}
                          </div>
                        </div>

                        {/* Specialty, Status Badge & Doctor */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '3px' }}>
                            <h3
                              style={{
                                margin: 0,
                                fontSize: '1rem',
                                fontWeight: 800,
                                color: '#002182',
                                lineHeight: 1.25,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {app.doctorSpecialty || app.specialtyName || 'Traumatología'}
                            </h3>
                            <span
                              style={{
                                background: badge.bg,
                                color: badge.color,
                                border: `1px solid ${badge.border}`,
                                padding: '0.2rem 0.5rem',
                                borderRadius: '100px',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                flexShrink: 0
                              }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: badge.dot }} />
                              {badge.text}
                            </span>
                          </div>

                          <div
                            style={{
                              fontSize: '0.84rem',
                              color: '#1E3A5F',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem'
                            }}
                          >
                            <Stethoscope size={13} color="#076ABC" />
                            Dr./a: {app.doctorName}
                          </div>
                        </div>
                      </div>

                      {/* Middle row: Time, Room & Insurance chips */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          flexWrap: 'wrap',
                          marginTop: '0.65rem'
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            background: '#F5F8FE',
                            border: '1px solid #E2ECF8',
                            padding: '0.25rem 0.55rem',
                            borderRadius: '8px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            color: '#002182'
                          }}
                        >
                          <Clock size={12} color="#076ABC" />
                          {app.time} hs
                        </span>

                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            background: '#F5F8FE',
                            border: '1px solid #E2ECF8',
                            padding: '0.25rem 0.55rem',
                            borderRadius: '8px',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            color: '#496386'
                          }}
                        >
                          <MapPin size={12} color="#076ABC" />
                          {app.roomName || 'Consultorio CITRA'}
                        </span>
                      </div>

                      {/* Action Buttons: 2 Equal-Width Columns for Balanced Mobile Layout */}
                      <div className="appointment-actions-grid">
                        <button
                          onClick={() => setSelectedAppointmentForTicket(app)}
                          style={{
                            background: '#F0F6FE',
                            border: '1px solid #BFDBFE',
                            color: '#002182',
                            padding: '0.55rem 0.65rem',
                            borderRadius: '10px',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          <Eye size={15} color="#076ABC" />
                          Comprobante
                        </button>

                        <button
                          onClick={() => setAppointmentToCancel(app)}
                          style={{
                            background: '#FFF1F2',
                            border: '1px solid #FECDD3',
                            color: '#E11D48',
                            padding: '0.55rem 0.65rem',
                            borderRadius: '10px',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          <XCircle size={15} />
                          Cancelar Turno
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Past Appointments (Historial) */}
        {activeTab === 'past' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {pastAppointments.length === 0 ? (
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '18px',
                  border: '1.5px solid #D2E3FC',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center'
                }}
              >
                <p style={{ color: '#496386', margin: 0, fontSize: '0.88rem' }}>
                  No tenés turnos en tu historial médico previo.
                </p>
              </div>
            ) : (
              pastAppointments.map((app) => {
                const badge = getStatusBadge(app.status);
                const month = formatMonth(app.date);
                const dayNum = formatDayNumber(app.date);

                return (
                  <div
                    key={app.id}
                    className="appointment-card"
                    style={{
                      opacity: app.status === 'cancelado' ? 0.8 : 1,
                      background: app.status === 'cancelado' ? '#FAFBFE' : '#ffffff'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                      {/* Compact Date Box */}
                      <div
                        style={{
                          width: '48px',
                          height: '50px',
                          borderRadius: '10px',
                          background: '#F1F5F9',
                          border: '1px solid #E2E8F0',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                          {month}
                        </div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#334155', lineHeight: 1.1 }}>
                          {dayNum}
                        </div>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '3px' }}>
                          <span style={{ fontWeight: 800, color: '#002182', fontSize: '0.96rem' }}>
                            {app.doctorSpecialty || app.specialtyName}
                          </span>
                          <span
                            style={{
                              background: badge.bg,
                              color: badge.color,
                              border: `1px solid ${badge.border}`,
                              padding: '0.15rem 0.5rem',
                              borderRadius: '100px',
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: badge.dot }} />
                            {badge.text}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.82rem', color: '#496386' }}>
                          Dr./a: <strong>{app.doctorName}</strong> · {app.time} hs
                        </div>

                        {app.cancelReason && (
                          <div
                            style={{
                              fontSize: '0.74rem',
                              color: '#e11d48',
                              marginTop: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            <AlertCircle size={12} />
                            Cancelación: {app.cancelReason}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px solid #EDF3FD', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedAppointmentForTicket(app)}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #D2E3FC',
                          color: '#002182',
                          padding: '0.4rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <Eye size={13} color="#076ABC" />
                        Ver Detalle / Comprobante
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Modal: Confirm Cancellation */}
        {appointmentToCancel && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 27, 94, 0.7)',
              backdropFilter: 'blur(5px)',
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
                background: '#ffffff',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '440px',
                padding: '1.75rem 1.5rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: '#FFF1F2',
                  color: '#E11D48',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}
              >
                <AlertTriangle size={26} />
              </div>

              <h3 style={{ margin: '0 0 0.35rem', textAlign: 'center', fontSize: '1.2rem', fontWeight: 900, color: '#002182' }}>
                ¿Confirmás la cancelación?
              </h3>
              <p style={{ margin: '0 0 1.25rem', textAlign: 'center', fontSize: '0.84rem', color: '#496386', lineHeight: 1.4 }}>
                Turno con <strong>{appointmentToCancel.doctorName}</strong> para el <strong>{formatFullDate(appointmentToCancel.date)} a las {appointmentToCancel.time} hs</strong>.
              </p>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                  Motivo de cancelación:
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: '10px',
                    border: '1.5px solid #D2E3FC',
                    fontSize: '0.85rem',
                    outline: 'none',
                    background: '#ffffff',
                    color: '#002182',
                    fontWeight: 600
                  }}
                >
                  <option value="Imposibilidad horaria / Laboral">Imposibilidad horaria / Laboral</option>
                  <option value="Mejoría del síntoma">Mejoría del síntoma</option>
                  <option value="Reprogramaré para otra fecha">Reprogramaré para otra fecha</option>
                  <option value="Atención en otro centro">Atención en otro centro</option>
                  <option value="Otro motivo">Otro motivo</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => setAppointmentToCancel(null)}
                  style={{
                    background: '#F5F8FE',
                    border: '1px solid #D2E3FC',
                    color: '#002182',
                    padding: '0.7rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer'
                  }}
                >
                  Conservar Turno
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  style={{
                    background: '#E11D48',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.7rem',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    boxShadow: '0 3px 10px rgba(225, 29, 72, 0.25)'
                  }}
                >
                  Sí, Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Ticket & Comprobante Digital */}
        {selectedAppointmentForTicket && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 27, 94, 0.7)',
              backdropFilter: 'blur(5px)',
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
                background: '#ffffff',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '480px',
                padding: '1.5rem',
                boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedAppointmentForTicket(null)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: '#F5F8FE',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#002182',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>

              {/* Modal Header */}
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#002182', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <Sparkles size={16} color="#076ABC" />
                  CITRA Clínica Médica
                </div>
                <div style={{ fontSize: '0.76rem', color: '#076ABC', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Comprobante Oficial de Turno
                </div>
              </div>

              {/* Ticket Card */}
              <div
                className="printable-area"
                style={{
                  background: '#F8FAFE',
                  border: '1.5px dashed #076ABC',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  marginBottom: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', borderBottom: '1px solid #D2E3FC', paddingBottom: '0.65rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#496386' }}>CÓDIGO DE RESERVA:</span>
                  <strong style={{ fontSize: '0.9rem', color: '#002182', fontFamily: 'monospace' }}>
                    {selectedAppointmentForTicket.bookingCode || `#CTR-${selectedAppointmentForTicket.id}`}
                  </strong>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: '0.85rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem' }}>
                    <div>
                      <span style={{ color: '#64748B' }}>Paciente: </span>
                      <strong style={{ color: '#002182' }}>{selectedAppointmentForTicket.patientName || authPatient.name}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>DNI: </span>
                      <span>{selectedAppointmentForTicket.patientDni || authPatient.dni}</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>Especialidad: </span>
                      <strong style={{ color: '#076ABC' }}>
                        {selectedAppointmentForTicket.doctorSpecialty || selectedAppointmentForTicket.specialtyName}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>Profesional: </span>
                      <span>{selectedAppointmentForTicket.doctorName}</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>Fecha y Hora: </span>
                      <strong style={{ color: '#002182' }}>
                        {selectedAppointmentForTicket.date} · {selectedAppointmentForTicket.time} hs
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>Ubicación: </span>
                      <span>{selectedAppointmentForTicket.roomName || 'Consultorio CITRA'}</span>
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign: 'center',
                      background: '#ffffff',
                      padding: '0.65rem',
                      borderRadius: '10px',
                      border: '1px solid #D2E3FC',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                    }}
                  >
                    <QRCodeSVG
                      value={`https://citra.com.ar/ticket/${selectedAppointmentForTicket.id}`}
                      size={88}
                      level="M"
                    />
                    <div style={{ fontSize: '0.62rem', color: '#64748B', marginTop: '4px', fontWeight: 600 }}>
                      Check-in Tótem
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    background: '#076ABC',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.65rem',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.84rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer'
                  }}
                >
                  <Printer size={15} />
                  Imprimir / PDF
                </button>
                <button
                  onClick={() => setSelectedAppointmentForTicket(null)}
                  style={{
                    background: '#F5F8FE',
                    border: '1px solid #D2E3FC',
                    color: '#002182',
                    padding: '0.65rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer'
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
