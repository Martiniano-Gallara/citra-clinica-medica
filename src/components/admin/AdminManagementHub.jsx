import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { AppointmentsManager } from './AppointmentsManager';
import { UsersManager } from './UsersManager';
import { DoctorsManager } from './DoctorsManager';
import { ServicesManager } from './ServicesManager';
import { SchedulesManager } from './SchedulesManager';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Stethoscope,
  Layers,
  Clock,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Lock,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const AdminManagementHub = () => {
  const {
    authRole,
    authAdmin,
    logoutAdmin,
    setCurrentView,
    appointments,
    patients,
    doctors,
    specialties
  } = useClinic();

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'appointments', 'users', 'doctors', 'services', 'schedules'

  // Strict Role Protection Check
  if (authRole !== 'admin') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at center, #002182 0%, #052625 100%)',
          padding: '1.5rem'
        }}
      >
        <div
          style={{
            maxWidth: '460px',
            background: '#ffffff',
            borderRadius: '24px',
            padding: '2.5rem',
            textAlign: 'center',
            boxShadow: '0 25px 50px rgba(0,0,0,0.35)'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: '#fee2e2',
              color: '#991b1b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}
          >
            <Lock size={32} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#002182', margin: '0 0 0.5rem' }}>
            Acceso Restringido
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#496386', margin: '0 0 2rem', lineHeight: 1.5 }}>
            Esta sección requiere privilegios de Administrador o Dirección Médica. Por favor inicia sesión con tus credenciales institucionales.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={() => setCurrentView('admin-login')}
              style={{
                background: 'linear-gradient(135deg, #002182 0%, #076ABC 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.85rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              Ir al Login de Administradores
            </button>
            <button
              onClick={() => setCurrentView('home')}
              style={{
                background: '#F5F8FE',
                border: '1.5px solid #D2E3FC',
                color: '#002182',
                padding: '0.8rem',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Volver a la Web Institucional
            </button>
          </div>
        </div>
      </div>
    );
  }

  // KPIs
  const todayStr = new Date().toISOString().split('T')[0];
  const totalAppointments = appointments.length;
  const todayAppointments = appointments.filter((a) => a.date === todayStr);
  const activeDoctors = doctors.filter((d) => d.active !== false).length;
  const totalPatients = patients.length;

  return (
    <div style={{ minHeight: '100vh', background: '#F5F8FE', display: 'flex', flexDirection: 'column' }}>
      {/* Admin Executive Topbar */}
      <header
        style={{
          background: '#001556',
          color: '#ffffff',
          padding: '0.85rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #076ABC',
          position: 'sticky',
          top: 0,
          zIndex: 900
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                background: '#ffffff',
                padding: '0.25rem 0.6rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <img
                src="./citra-logo.png"
                alt="CITRA"
                style={{ height: '32px', maxWidth: '140px', objectFit: 'contain' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>
                PANEL <span style={{ color: '#257CE6', fontSize: '0.85rem', fontWeight: 700 }}>ADMIN</span>
              </div>
              <div style={{ fontSize: '0.66rem', color: '#D2E3FC', letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '2px' }}>
                Gestión Médica & Turnos
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'none',
              background: 'rgba(255, 255, 255, 0.12)',
              borderRadius: '100px',
              padding: '0.3rem 0.8rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#257CE6'
            }}
            className="admin-badge-desktop"
          >
            Modo Superadministrador
          </div>
        </div>

        {/* Right Admin Profile & Quick Switch to Institutional Web */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Direct Return to Institutional Web button */}
          <button
            onClick={() => setCurrentView('home')}
            style={{
              background: 'rgba(37, 124, 230, 0.15)',
              border: '1.5px solid #257CE6',
              color: '#ffffff',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#076ABC')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(37, 124, 230, 0.15)')}
          >
            <ExternalLink size={14} color="#257CE6" />
            <span>Ver Web Institucional</span>
          </button>

          {/* Admin user info chip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '1rem' }}>
            <img
              src={authAdmin?.avatar || 'https://images.unsplash.com/photo-1622253692010?w=100'}
              alt={authAdmin?.name || 'Admin'}
              style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #257CE6' }}
            />
            <div style={{ display: 'none', lineHeight: 1.2 }} className="admin-name-desktop">
              <div style={{ fontSize: '0.82rem', fontWeight: 800 }}>{authAdmin?.name || 'Administrador'}</div>
              <div style={{ fontSize: '0.7rem', color: '#257CE6' }}>{authAdmin?.role || 'Director Médico'}</div>
            </div>
          </div>

          <button
            onClick={logoutAdmin}
            title="Cerrar Sesión de Administración"
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '0.45rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Admin Body with Navigation tabs */}
      <div style={{ maxWidth: '1360px', width: '100%', margin: '0 auto', padding: '1.75rem 1.5rem', flex: 1 }}>
        {/* Navigation Tabs Bar */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
            marginBottom: '2rem',
            borderBottom: '2px solid #D2E3FC'
          }}
        >
          {[
            { id: 'dashboard', label: 'Dashboard & Métricas', icon: <LayoutDashboard size={17} /> },
            { id: 'appointments', label: `Turnos (${appointments.length})`, icon: <CalendarCheck size={17} /> },
            { id: 'users', label: `Pacientes (${patients.length})`, icon: <Users size={17} /> },
            { id: 'doctors', label: `Profesionales (${doctors.length})`, icon: <Stethoscope size={17} /> },
            { id: 'services', label: `Especialidades (${specialties.length})`, icon: <Layers size={17} /> },
            { id: 'schedules', label: 'Horarios & Disponibilidad', icon: <Clock size={17} /> }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: isActive ? '#002182' : '#ffffff',
                  color: isActive ? '#ffffff' : '#002182',
                  border: isActive ? '1.5px solid #002182' : '1.5px solid #D2E3FC',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isActive ? '0 4px 12px rgba(0, 33, 130, 0.18)' : 'none',
                  transition: 'all 0.18s ease'
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div>
            {/* KPI Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2.5rem'
              }}
            >
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '18px',
                  border: '1.5px solid #D2E3FC',
                  padding: '1.5rem',
                  boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#7994B8', textTransform: 'uppercase' }}>
                    Turnos Totales
                  </div>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EBF3FD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#076ABC' }}>
                    <CalendarCheck size={20} />
                  </div>
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#002182', lineHeight: 1 }}>
                  {totalAppointments}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#076ABC', fontWeight: 700, marginTop: '0.5rem' }}>
                  En sistema general
                </div>
              </div>

              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '18px',
                  border: '1.5px solid #D2E3FC',
                  padding: '1.5rem',
                  boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#7994B8', textTransform: 'uppercase' }}>
                    Turnos Hoy
                  </div>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#92400e' }}>
                    <Clock size={20} />
                  </div>
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#002182', lineHeight: 1 }}>
                  {todayAppointments.length}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#496386', marginTop: '0.5rem' }}>
                  Agenda del día activa
                </div>
              </div>

              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '18px',
                  border: '1.5px solid #D2E3FC',
                  padding: '1.5rem',
                  boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#7994B8', textTransform: 'uppercase' }}>
                    Pacientes Registrados
                  </div>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EBF3FD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#002182' }}>
                    <Users size={20} />
                  </div>
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#002182', lineHeight: 1 }}>
                  {totalPatients}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#076ABC', fontWeight: 700, marginTop: '0.5rem' }}>
                  Padrón de afiliados activo
                </div>
              </div>

              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '18px',
                  border: '1.5px solid #D2E3FC',
                  padding: '1.5rem',
                  boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#7994B8', textTransform: 'uppercase' }}>
                    Cuerpo Médico Activo
                  </div>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#065f46' }}>
                    <Stethoscope size={20} />
                  </div>
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#002182', lineHeight: 1 }}>
                  {activeDoctors}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: 700, marginTop: '0.5rem' }}>
                  En {specialties.length} especialidades
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '18px',
                  border: '1.5px solid #D2E3FC',
                  padding: '1.75rem',
                  boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)'
                }}
              >
                <h3 style={{ margin: '0 0 1rem', fontSize: '1.15rem', fontWeight: 800, color: '#002182' }}>
                  Atajos Rápidos de Administración
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button
                    onClick={() => setActiveTab('appointments')}
                    style={{
                      background: '#F5F8FE',
                      border: '1px solid #D2E3FC',
                      padding: '0.85rem 1rem',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontWeight: 700,
                      color: '#002182',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CalendarCheck size={16} color="#076ABC" />
                      Ver todos los turnos programados
                    </span>
                    <ChevronRight size={16} />
                  </button>

                  <button
                    onClick={() => setActiveTab('doctors')}
                    style={{
                      background: '#F5F8FE',
                      border: '1px solid #D2E3FC',
                      padding: '0.85rem 1rem',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontWeight: 700,
                      color: '#002182',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Stethoscope size={16} color="#076ABC" />
                      Gestionar profesionales y consultorios
                    </span>
                    <ChevronRight size={16} />
                  </button>

                  <button
                    onClick={() => setActiveTab('schedules')}
                    style={{
                      background: '#F5F8FE',
                      border: '1px solid #D2E3FC',
                      padding: '0.85rem 1rem',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontWeight: 700,
                      color: '#002182',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={16} color="#076ABC" />
                      Configurar horarios y días de atención
                    </span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Latest Appointments list */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '18px',
                  border: '1.5px solid #D2E3FC',
                  padding: '1.75rem',
                  boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#002182' }}>
                    Últimos Turnos Registrados
                  </h3>
                  <button
                    onClick={() => setActiveTab('appointments')}
                    style={{ background: 'none', border: 'none', color: '#076ABC', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Ver todos
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {appointments.slice(0, 5).map((a) => (
                    <div
                      key={a.id}
                      style={{
                        background: '#F5F8FE',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.84rem'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, color: '#002182' }}>{a.patientName}</div>
                        <div style={{ fontSize: '0.74rem', color: '#496386' }}>
                          {a.doctorSpecialty || a.specialtyName} · {a.doctorName}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: '#076ABC' }}>{a.date} - {a.time} hs</div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'capitalize', color: a.status === 'confirmado' ? '#065f46' : '#991b1b' }}>
                          {a.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Appointments Manager */}
        {activeTab === 'appointments' && <AppointmentsManager />}

        {/* Tab 3: Users / Patients Manager */}
        {activeTab === 'users' && <UsersManager />}

        {/* Tab 4: Doctors Manager */}
        {activeTab === 'doctors' && <DoctorsManager />}

        {/* Tab 5: Services Manager */}
        {activeTab === 'services' && <ServicesManager />}

        {/* Tab 6: Schedules Manager */}
        {activeTab === 'schedules' && <SchedulesManager />}
      </div>

      <style>{`
        @media (min-width: 768px) {
          .admin-badge-desktop {
            display: inline-block !important;
          }
          .admin-name-desktop {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};
