import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';

// Admin Core Managers
import { AppointmentsManager } from './AppointmentsManager';
import { UsersManager } from './UsersManager';
import { DoctorsManager } from './DoctorsManager';
import { ServicesManager } from './ServicesManager';
import { SchedulesManager } from './SchedulesManager';
import { RoomsManager } from './RoomsManager';
import { PrescriptionsManager } from './PrescriptionsManager';

// Clinical & Integral Views
import { PatientsView } from '../patients/PatientsView';
import { ClinicalRecordsView } from '../clinical/ClinicalRecordsView';
import { InsurancesView } from '../insurances/InsurancesView';
import { ImagingView } from '../imaging/ImagingView';
import { BillingView } from '../billing/BillingView';
import { ReportsView } from '../reports/ReportsView';
import { CommunicationsView } from '../communications/CommunicationsView';
import { SettingsView } from '../settings/SettingsView';
import { AuditLogsView } from '../audit/AuditLogsView';
import { AgendaView } from '../agenda/AgendaView';

// Global Clinical Modals
import { PatientDetailModal } from '../patients/PatientDetailModal';
import { AppointmentModal } from '../agenda/AppointmentModal';
import { PatientFormModal } from '../patients/PatientFormModal';
import { DoctorModal } from '../doctors/DoctorModal';
import { NewConsultationModal } from '../clinical/NewConsultationModal';
import { ConsultationPrintView } from '../clinical/ConsultationPrintView';
import { ConsentFormsModal } from '../clinical/ConsentFormsModal';

// Icons
import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  Users,
  FileText,
  Stethoscope,
  Layers,
  Clock,
  DoorClosed,
  Shield,
  Eye,
  Pill,
  CreditCard,
  BarChart3,
  MessageSquare,
  UserCheck,
  Settings,
  ShieldAlert,
  LogOut,
  ExternalLink,
  Lock,
  ChevronRight,
  Menu,
  X,
  MapPin,
  CheckCircle2
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
    specialties,
    rooms,
    electronicPrescriptions,
    healthInsurances,
    consultations,
    imagingStudies,
    setSelectedPatientForDetail,
    // RBAC & Scoping
    currentDoctor,
    isDoctor,
    isAdministrative,
    isSuperAdmin,
    scopedAppointments,
    scopedPatients,
    scopedConsultations,
    scopedElectronicPrescriptions,
    scopedImagingStudies,
    scopedHealthInsurances,
    switchAdminUser,
    users
  } = useClinic();

  // Active module tab
  const [activeTab, setActiveTab] = useState('dashboard');
  // Mobile sidebar open state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
            Acceso Administrativo
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#496386', margin: '0 0 2rem', lineHeight: 1.5 }}>
            Esta sección requiere rol de Administrador. Por favor inicia sesión con tus credenciales médicas autorizadas.
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
              Iniciar Sesión como Administrador
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

  // General KPIs
  const todayStr = new Date().toISOString().split('T')[0];
  const totalAppointments = appointments.length;
  const todayAppointments = appointments.filter((a) => a.date === todayStr || a.date === '2026-08-28');
  const activeDoctors = doctors.filter((d) => d.active !== false).length;
  const totalPatients = patients.length;
  const availableRooms = rooms ? rooms.filter((r) => (r.status || 'Disponible') === 'Disponible').length : 6;

  // Doctor Specific KPIs
  const doctorAppointments = scopedAppointments;
  const todayDoctorAppointments = doctorAppointments.filter((a) => a.date === todayStr || a.date === '2026-08-28');
  const doctorPatients = scopedPatients;

  // Sidebar Grouped Navigation Sections according to Role (Doctor vs Administrativo)
  const navSections = isDoctor
    ? [
      {
        title: 'PANEL PRINCIPAL',
        items: [
          { id: 'dashboard', label: 'Dashboard & Mis Métricas', icon: LayoutDashboard, badge: null }
        ]
      },
      {
        title: 'MI ATENCIÓN Y PACIENTES',
        items: [
          { id: 'appointments', label: 'Mis Turnos', icon: CalendarCheck, badge: doctorAppointments.length },
          { id: 'patients', label: 'Mis Pacientes', icon: Users, badge: doctorPatients.length },
          { id: 'clinical', label: 'Historia Clínica', icon: FileText, badge: scopedConsultations.length },
          { id: 'prescriptions', label: 'Mis Recetas (CUIR)', icon: Pill, badge: scopedElectronicPrescriptions.length },
          { id: 'imaging', label: 'Estudios & Radiología', icon: Eye, badge: scopedImagingStudies.length }
        ]
      },
      {
        title: 'MI GESTIÓN PROFESIONAL',
        items: [
          { id: 'schedules', label: 'Gestión y Horarios', icon: Clock, badge: null },
          { id: 'insurances', label: 'Mis Obras Sociales', icon: Shield, badge: scopedHealthInsurances.length },
          { id: 'reports', label: 'Mis Estadísticas', icon: BarChart3, badge: null }
        ]
      },
      {
        title: 'MI CUENTA',
        items: [
          { id: 'settings', label: 'Mi Configuración', icon: Settings, badge: null }
        ]
      }
    ]
    : [
      {
        title: 'PRINCIPAL',
        items: [
          { id: 'dashboard', label: 'Dashboard & Métricas', icon: LayoutDashboard, badge: null }
        ]
      },
      {
        title: 'ATENCIÓN Y PACIENTES',
        items: [
          { id: 'appointments', label: 'Turnos Generales', icon: CalendarCheck, badge: appointments.length },
          { id: 'patients', label: 'Padrón de Pacientes', icon: Users, badge: patients.length },
          { id: 'clinical', label: 'Historial Clínico', icon: FileText, badge: null },
          { id: 'prescriptions', label: 'Recetas Médicas', icon: Pill, badge: electronicPrescriptions ? electronicPrescriptions.length : null },
          { id: 'imaging', label: 'Estudios & Docs', icon: Eye, badge: null }
        ]
      },
      {
        title: 'CUERPO MÉDICO Y RECURSOS',
        items: [
          { id: 'doctors', label: 'Profesionales', icon: Stethoscope, badge: doctors.length },
          { id: 'services', label: 'Especialidades', icon: Layers, badge: specialties.length },
          { id: 'rooms', label: 'Consultorios', icon: DoorClosed, badge: rooms ? rooms.length : 8 },
          { id: 'schedules', label: 'Horarios de Atención', icon: Clock, badge: null }
        ]
      },
      {
        title: 'ADMINISTRACIÓN Y FINANZAS',
        items: [
          { id: 'insurances', label: 'Obras Sociales', icon: Shield, badge: healthInsurances.length },
          { id: 'billing', label: 'Facturación / Pagos', icon: CreditCard, badge: null },
          { id: 'reports', label: 'Reportes & Estadísticas', icon: BarChart3, badge: null },
          { id: 'communications', label: 'Notificaciones', icon: MessageSquare, badge: null }
        ]
      },
      {
        title: 'SISTEMA Y SEGURIDAD',
        items: [
          { id: 'staff', label: 'Usuarios y Permisos', icon: UserCheck, badge: null },
          { id: 'settings', label: 'Configuración', icon: Settings, badge: null },
          { id: 'audit', label: 'Auditoría', icon: ShieldAlert, badge: null }
        ]
      }
    ];

  // RBAC Guard Effect: automatically redirect to dashboard if tab not permitted for current role
  React.useEffect(() => {
    const allowedTabIds = navSections.flatMap((s) => s.items).map((i) => i.id);
    if (!allowedTabIds.includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [isDoctor, activeTab, navSections]);

  const currentTabLabel =
    navSections.flatMap((s) => s.items).find((i) => i.id === activeTab)?.label || 'Dashboard & Métricas';

  const doctorAdminName = (() => {
    if (!isDoctor) return authAdmin?.name || 'Lic. Facundo Quiroga';
    const raw = currentDoctor?.name || authAdmin?.name || 'Dr. Alejandro Blanco';
    const clean = raw.includes('Morales') ? 'Dr. Alejandro Blanco' : raw;
    return clean.startsWith('Dr.') ? clean : `Dr. ${clean}`;
  })();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F8FE' }}>
      {/* 1. SIDEBAR LATERAL A LA IZQUIERDA */}
      <aside
        style={{
          width: '270px',
          background: '#001556',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1.5px solid #076ABC',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 1000,
          boxSizing: 'border-box'
        }}
        className={`admin-sidebar ${isMobileSidebarOpen ? 'sidebar-mobile-open' : ''}`}
      >
        {/* Top: Logo & Clinic Name */}
        <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid rgba(210, 227, 252, 0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  background: '#ffffff',
                  padding: '0.3rem 0.55rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
              >
                <img
                  src="./citra-logo.png"
                  alt="CITRA"
                  style={{ height: '28px', maxWidth: '110px', objectFit: 'contain' }}
                />
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  CITRA <span style={{ color: '#257CE6', fontSize: '0.78rem' }}>CLÍNICA</span>
                </div>
                <div style={{ fontSize: '0.62rem', color: '#D2E3FC', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '2px' }}>
                  Panel Administrativo
                </div>
              </div>
            </div>

            {/* Close button for mobile */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="admin-mobile-close-btn"
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Middle: Categorized Navigation List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem 0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          {navSections.map((sec, sIdx) => (
            <div key={sIdx}>
              <div
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: '#7994B8',
                  letterSpacing: '0.06em',
                  padding: '0 0.5rem 0.4rem',
                  textTransform: 'uppercase'
                }}
              >
                {sec.title}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileSidebarOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.6rem 0.75rem',
                        borderRadius: '10px',
                        background: isActive ? 'linear-gradient(135deg, #076ABC 0%, #257CE6 100%)' : 'transparent',
                        color: isActive ? '#ffffff' : '#D2E3FC',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontWeight: isActive ? 800 : 600,
                        fontSize: '0.84rem',
                        transition: 'all 0.15s ease',
                        boxShadow: isActive ? '0 4px 12px rgba(7, 106, 188, 0.35)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                          e.currentTarget.style.color = '#ffffff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#D2E3FC';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <Icon size={16} strokeWidth={isActive ? 2.5 : 2} color={isActive ? '#ffffff' : '#8EBEF5'} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge !== null && item.badge !== undefined && (
                        <span
                          style={{
                            background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(210, 227, 252, 0.15)',
                            color: isActive ? '#ffffff' : '#D2E3FC',
                            padding: '0.1rem 0.45rem',
                            borderRadius: '100px',
                            fontSize: '0.68rem',
                            fontWeight: 800
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom: Doctor Profile Chip (Médico Administrador) & Logout */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid rgba(210, 227, 252, 0.12)',
            background: 'rgba(0, 19, 72, 0.6)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <img
                src={authAdmin?.avatar || 'https://images.unsplash.com/photo-1622253692010?w=100'}
                alt={doctorAdminName}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1.5px solid #257CE6'
                }}
              />
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff' }}>
                  {doctorAdminName}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#257CE6', fontWeight: 700, marginTop: '2px' }}>
                  Administrador
                </div>
              </div>
            </div>

            <button
              onClick={logoutAdmin}
              title="Cerrar Sesión Administrativa"
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#fca5a5',
                padding: '0.45rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. ÁREA DE CONTENIDO PRINCIPAL A LA DERECHA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>
        {/* Topbar del Área de Contenido */}
        <header
          style={{
            height: '64px',
            background: '#ffffff',
            borderBottom: '1.5px solid #D2E3FC',
            padding: '0 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 900
          }}
        >
          {/* Left: Mobile Menu Toggle & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="admin-mobile-open-btn"
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                color: '#002182',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <Menu size={22} />
            </button>

            <div>
              <div style={{ fontSize: '0.74rem', color: '#7994B8', fontWeight: 700 }}>
                CITRA Centro Médico · Sede Arroyito
              </div>
              <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#002182', letterSpacing: '-0.02em' }}>
                {currentTabLabel}
              </h1>
            </div>
          </div>

          {/* Right: Role Switcher Demo, User Badge & Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            {/* Quick 1-Click Role Switcher Demo Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', border: '1.5px solid #257CE6', padding: '0.25rem 0.5rem', borderRadius: '12px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#002182' }}>
                Probar Rol:
              </span>
              <button
                type="button"
                onClick={() => switchAdminUser('usr-1')}
                style={{
                  background: isDoctor ? 'linear-gradient(135deg, #002182 0%, #076ABC 100%)' : '#F5F8FE',
                  color: isDoctor ? '#ffffff' : '#002182',
                  border: isDoctor ? 'none' : '1px solid #D2E3FC',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                🩺 Dr. Blanco (Médico)
              </button>
              <button
                type="button"
                onClick={() => switchAdminUser('usr-3')}
                style={{
                  background: !isDoctor ? 'linear-gradient(135deg, #055294 0%, #257CE6 100%)' : '#F5F8FE',
                  color: !isDoctor ? '#ffffff' : '#002182',
                  border: !isDoctor ? 'none' : '1px solid #D2E3FC',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                💼 Lic. Quiroga (Administrativo)
              </button>
            </div>

            <button
              onClick={() => setCurrentView('home')}
              style={{
                background: '#F5F8FE',
                border: '1.5px solid #D2E3FC',
                color: '#002182',
                padding: '0.45rem 0.85rem',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                cursor: 'pointer',
                transition: 'all 0.18s ease'
              }}
            >
              <ExternalLink size={14} color="#076ABC" />
              <span>Web</span>
            </button>

            {/* Administrator Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: isDoctor ? '#EBF3FD' : '#FEF3C7',
                border: isDoctor ? '1px solid #8EBEF5' : '1px solid #FCD34D',
                borderRadius: '100px',
                padding: '0.35rem 0.85rem'
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isDoctor ? '#10b981' : '#d97706'
                }}
              />
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#002182' }}>
                {doctorAdminName}
              </span>
              <span style={{ fontSize: '0.72rem', color: isDoctor ? '#076ABC' : '#92400e', fontWeight: 700 }}>
                · {isDoctor ? 'Médico Especialista' : 'Administrativo'}
              </span>
            </div>

            {/* Logout button */}
            <button
              onClick={logoutAdmin}
              title="Cerrar Sesión"
              style={{
                background: '#FEE2E2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                padding: '0.45rem 0.65rem',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main style={{ padding: '1.75rem 2rem', flex: 1, maxWidth: '1400px', width: '100%', boxSizing: 'border-box' }}>
          {/* TAB 1: DASHBOARD & MÉTRICAS PARA DOCTOR (Dr. Blanco) */}
          {activeTab === 'dashboard' && isDoctor && (
            <div>
              {/* Doctor Header Banner */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #002182 0%, #076ABC 100%)',
                  borderRadius: '20px',
                  padding: '1.75rem 2rem',
                  color: '#ffffff',
                  marginBottom: '2rem',
                  boxShadow: '0 10px 25px rgba(0, 33, 130, 0.15)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1.25rem'
                }}
              >
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.15)', padding: '0.35rem 0.85rem', borderRadius: '100px', fontSize: '0.78rem', fontWeight: 800, marginBottom: '0.6rem' }}>
                    <Stethoscope size={15} color="#93C5FD" />
                    <span>Panel Profesional Médico Exclusivo · {currentDoctor?.specialty || 'Traumatología y Ortopedia'}</span>
                  </div>
                  <h2 style={{ margin: '0 0 0.4rem', fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
                    Bienvenido, {doctorAdminName}
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#D2E3FC', maxWidth: '650px', lineHeight: 1.5 }}>
                    Tu panel muestra exclusivamente tus citas, tus pacientes, tus evoluciones médicas y la gestión personalizada de tus días y horarios de atención.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setActiveTab('schedules')}
                    style={{
                      background: '#ffffff',
                      color: '#002182',
                      border: 'none',
                      padding: '0.75rem 1.15rem',
                      borderRadius: '12px',
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  >
                    <Clock size={16} color="#076ABC" />
                    <span>Mis Horarios</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('prescriptions')}
                    style={{
                      background: 'rgba(255, 255, 255, 0.18)',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      color: '#ffffff',
                      padding: '0.75rem 1.15rem',
                      borderRadius: '12px',
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Pill size={16} color="#93C5FD" />
                    <span>Emitir Receta</span>
                  </button>
                </div>
              </div>

              {/* 5 Doctor KPI Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1.25rem',
                  marginBottom: '2rem'
                }}
              >
                {/* Card 1: Mis Turnos Totales */}
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
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#7994B8', textTransform: 'uppercase' }}>
                      MIS TURNOS TOTALES
                    </div>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EBF3FD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#076ABC' }}>
                      <CalendarCheck size={20} />
                    </div>
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#002182', lineHeight: 1 }}>
                    {doctorAppointments.length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#076ABC', fontWeight: 700, marginTop: '0.5rem' }}>
                    En mi agenda profesional
                  </div>
                </div>

                {/* Card 2: Mis Turnos Hoy */}
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
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#7994B8', textTransform: 'uppercase' }}>
                      MIS TURNOS HOY
                    </div>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#92400E' }}>
                      <Clock size={20} />
                    </div>
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#002182', lineHeight: 1 }}>
                    {todayDoctorAppointments.length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#92400E', fontWeight: 700, marginTop: '0.5rem' }}>
                    Consultas programadas hoy
                  </div>
                </div>

                {/* Card 3: Mis Pacientes Asignados */}
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
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#7994B8', textTransform: 'uppercase' }}>
                      MIS PACIENTES
                    </div>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EBF3FD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#002182' }}>
                      <Users size={20} />
                    </div>
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#002182', lineHeight: 1 }}>
                    {doctorPatients.length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#076ABC', fontWeight: 700, marginTop: '0.5rem' }}>
                    Bajo mi seguimiento clínico
                  </div>
                </div>

                {/* Card 4: Mi Consultorio Asignado */}
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
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#7994B8', textTransform: 'uppercase' }}>
                      MI CONSULTORIO
                    </div>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#065F46' }}>
                      <DoorClosed size={20} />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#002182', lineHeight: 1.2, marginTop: '0.2rem' }}>
                    {currentDoctor?.roomName?.split('—')[0] || 'Consultorio 101'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#065F46', fontWeight: 700, marginTop: '0.65rem' }}>
                    {currentDoctor?.roomName?.split('—')[1] || 'Traumatología'}
                  </div>
                </div>

                {/* Card 5: Mi Calificación y Ocupación */}
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
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#7994B8', textTransform: 'uppercase' }}>
                      CALIFICACIÓN CLÍNICA
                    </div>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B45309' }}>
                      <CheckCircle2 size={20} />
                    </div>
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#002182', lineHeight: 1 }}>
                    {currentDoctor?.stats?.rating || 4.9} ★
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#076ABC', fontWeight: 700, marginTop: '0.5rem' }}>
                    {currentDoctor?.stats?.patientsAttended || 620} pacientes atendidos ({currentDoctor?.stats?.occupationRate || 96}% ocupación)
                  </div>
                </div>
              </div>

              {/* Atajos Rápidos del Doctor y Próximos Turnos */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem', marginBottom: '2rem' }}>
                {/* Left: Mis Atajos Clínicos */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '18px',
                    border: '1.5px solid #D2E3FC',
                    padding: '1.75rem',
                    boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)'
                  }}
                >
                  <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.15rem', fontWeight: 800, color: '#002182' }}>
                    Mis Atajos Rápidos de Atención
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
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <CalendarCheck size={17} color="#076ABC" />
                        Ver mis turnos asignados ({doctorAppointments.length})
                      </span>
                      <ChevronRight size={16} color="#7994B8" />
                    </button>

                    <button
                      onClick={() => setActiveTab('patients')}
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
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <Users size={17} color="#076ABC" />
                        Padrón de mis pacientes ({doctorPatients.length})
                      </span>
                      <ChevronRight size={16} color="#7994B8" />
                    </button>

                    <button
                      onClick={() => setActiveTab('clinical')}
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
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <FileText size={17} color="#076ABC" />
                        Historia Clínica (Mis consultas y diagnósticos)
                      </span>
                      <ChevronRight size={16} color="#7994B8" />
                    </button>

                    <button
                      onClick={() => setActiveTab('prescriptions')}
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
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <Pill size={17} color="#076ABC" />
                        Mis Recetas Médicas Electrónicas (CUIR)
                      </span>
                      <ChevronRight size={16} color="#7994B8" />
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
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <Clock size={17} color="#076ABC" />
                        Gestión de mis horarios de atención
                      </span>
                      <ChevronRight size={16} color="#7994B8" />
                    </button>

                    <button
                      onClick={() => setActiveTab('insurances')}
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
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <Shield size={17} color="#076ABC" />
                        Obras Sociales que atiendo ({scopedHealthInsurances.length})
                      </span>
                      <ChevronRight size={16} color="#7994B8" />
                    </button>
                  </div>
                </div>

                {/* Right: Próximos Turnos Exclusivos del Doctor */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '18px',
                    border: '1.5px solid #D2E3FC',
                    padding: '1.75rem',
                    boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#002182' }}>
                      Mis Próximos Turnos
                    </h3>
                    <button
                      onClick={() => setActiveTab('appointments')}
                      style={{ background: 'none', border: 'none', color: '#076ABC', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                    >
                      Ver mi agenda completa
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {doctorAppointments.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#7994B8', fontSize: '0.88rem' }}>
                        No tienes turnos programados en este momento.
                      </div>
                    ) : (
                      doctorAppointments.slice(0, 5).map((a) => {
                        const isConfirmado = a.status === 'confirmado';
                        const isAtendido = a.status === 'atendido';
                        const isEnSala = a.status === 'en_sala';

                        return (
                          <div
                            key={a.id}
                            style={{
                              background: '#F5F8FE',
                              padding: '0.85rem 1.1rem',
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              border: '1px solid #EDF3FD',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 800, color: '#002182', fontSize: '0.92rem' }}>
                                {a.patientName}
                              </div>
                              <div style={{ fontSize: '0.76rem', color: '#496386', marginTop: '2px' }}>
                                {a.reason || 'Consulta médica'} · {a.patientInsurance || 'Particular'}
                              </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 800, color: '#002182', fontSize: '0.84rem' }}>
                                {a.date} - {a.time} hs
                              </div>
                              <span
                                style={{
                                  display: 'inline-block',
                                  marginTop: '3px',
                                  padding: '0.15rem 0.6rem',
                                  borderRadius: '100px',
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  background: isAtendido ? '#d1fae5' : isEnSala ? '#fef3c7' : isConfirmado ? '#dbeafe' : '#f1f5f9',
                                  color: isAtendido ? '#065f46' : isEnSala ? '#92400e' : isConfirmado ? '#1e40af' : '#475569'
                                }}
                              >
                                {isAtendido ? 'Atendido' : isEnSala ? 'En Espera' : isConfirmado ? 'Confirmado' : a.status || 'Pendiente'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Mis Pacientes Recientes & Mi Disponibilidad Actual */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem' }}>
                {/* Mis Pacientes Recientes */}
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
                      Mis Pacientes en Seguimiento
                    </h3>
                    <button
                      onClick={() => setActiveTab('patients')}
                      style={{ background: 'none', border: 'none', color: '#076ABC', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                    >
                      Ver todos
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {doctorPatients.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#7994B8', fontSize: '0.88rem' }}>
                        No hay pacientes registrados en tu historial.
                      </div>
                    ) : (
                      doctorPatients.slice(0, 4).map((p) => (
                        <div
                          key={p.id}
                          style={{
                            background: '#F5F8FE',
                            padding: '0.8rem 1rem',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            border: '1px solid #EDF3FD'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 800, color: '#002182', fontSize: '0.88rem' }}>{p.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#496386' }}>
                              DNI {p.dni} • {p.insuranceName || p.insurance || 'Particular'}
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedPatientForDetail(p);
                            }}
                            style={{
                              background: '#ffffff',
                              border: '1px solid #D2E3FC',
                              color: '#076ABC',
                              padding: '0.35rem 0.75rem',
                              borderRadius: '8px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Ver Ficha
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Mi Disponibilidad y Consultorio */}
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
                      Mi Disponibilidad y Consultorio
                    </h3>
                    <button
                      onClick={() => setActiveTab('schedules')}
                      style={{ background: 'none', border: 'none', color: '#076ABC', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                    >
                      Configurar
                    </button>
                  </div>

                  <div style={{ background: '#F5F8FE', borderRadius: '14px', border: '1px solid #D2E3FC', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#002182', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Clock size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#002182' }}>
                          Días de Atención: {(currentDoctor?.workingDays || ['Lunes', 'Miércoles', 'Viernes']).join(', ')}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#496386' }}>
                          Horario: {currentDoctor?.scheduleStart || '08:00'} a {currentDoctor?.scheduleEnd || '14:00'} hs ({currentDoctor?.slotDuration || 30} min/turno)
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#076ABC', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <DoorClosed size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#002182' }}>
                          Lugar: {currentDoctor?.roomName || 'Consultorio 101 — Traumatología'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#496386' }}>
                          CITRA Sede Arroyito · Av. Carlos Pontin Nº556
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#055294', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Shield size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#002182' }}>
                          Arancel Particular: ${currentDoctor?.priceConsultation?.toLocaleString('es-AR') || '25.000'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#496386' }}>
                          Honorarios: {currentDoctor?.feePercentage || 75}% · Obras Sociales: {scopedHealthInsurances.length} activas
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: DASHBOARD GENERAL (PERSONAL ADMINISTRATIVO) */}
          {activeTab === 'dashboard' && !isDoctor && (
            <div>
              {/* KPI Cards Grid (4 Identical Cards to reference image + Consultorios) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                  gap: '1.25rem',
                  marginBottom: '2rem'
                }}
              >
                {/* Card 1: Turnos Totales */}
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
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#7994B8', textTransform: 'uppercase' }}>
                      TURNOS TOTALES
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

                {/* Card 2: Turnos Hoy */}
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
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#7994B8', textTransform: 'uppercase' }}>
                      TURNOS HOY
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

                {/* Card 3: Pacientes Registrados */}
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
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#7994B8', textTransform: 'uppercase' }}>
                      PACIENTES REGISTRADOS
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

                {/* Card 4: Cuerpo Médico Activo */}
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
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#7994B8', textTransform: 'uppercase' }}>
                      CUERPO MÉDICO ACTIVO
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

                {/* Card 5: Consultorios Físicos */}
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
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#7994B8', textTransform: 'uppercase' }}>
                      CONSULTORIOS ACTIVOS
                    </div>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EBF3FD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#076ABC' }}>
                      <DoorClosed size={20} />
                    </div>
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#002182', lineHeight: 1 }}>
                    {availableRooms} / {rooms ? rooms.length : 8}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#076ABC', fontWeight: 700, marginTop: '0.5rem' }}>
                    Disponibles en Arroyito
                  </div>
                </div>
              </div>

              {/* Quick Actions & Recent Turnos */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem', marginBottom: '2rem' }}>
                {/* Left: Atajos Rápidos de Administración */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '18px',
                    border: '1.5px solid #D2E3FC',
                    padding: '1.75rem',
                    boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)'
                  }}
                >
                  <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.15rem', fontWeight: 800, color: '#002182' }}>
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
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#076ABC')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#D2E3FC')}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <CalendarCheck size={17} color="#076ABC" />
                        Ver todos los turnos programados
                      </span>
                      <ChevronRight size={16} color="#7994B8" />
                    </button>

                    <button
                      onClick={() => setActiveTab('patients')}
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
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#076ABC')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#D2E3FC')}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <Users size={17} color="#076ABC" />
                        Padrón completo de pacientes
                      </span>
                      <ChevronRight size={16} color="#7994B8" />
                    </button>

                    <button
                      onClick={() => setActiveTab('clinical')}
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
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#076ABC')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#D2E3FC')}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <FileText size={17} color="#076ABC" />
                        Fichas e Historias Clínicas Integrales
                      </span>
                      <ChevronRight size={16} color="#7994B8" />
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
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#076ABC')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#D2E3FC')}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <Stethoscope size={17} color="#076ABC" />
                        Gestionar profesionales y consultorios
                      </span>
                      <ChevronRight size={16} color="#7994B8" />
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
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#076ABC')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#D2E3FC')}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <Clock size={17} color="#076ABC" />
                        Configurar horarios y días de atención
                      </span>
                      <ChevronRight size={16} color="#7994B8" />
                    </button>

                    <button
                      onClick={() => setActiveTab('prescriptions')}
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
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#076ABC')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#D2E3FC')}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <Pill size={17} color="#076ABC" />
                        Recetas médicas electrónicas (CUIR)
                      </span>
                      <ChevronRight size={16} color="#7994B8" />
                    </button>
                  </div>
                </div>

                {/* Right: Últimos Turnos Registrados */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '18px',
                    border: '1.5px solid #D2E3FC',
                    padding: '1.75rem',
                    boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#002182' }}>
                      Últimos Turnos Registrados
                    </h3>
                    <button
                      onClick={() => setActiveTab('appointments')}
                      style={{ background: 'none', border: 'none', color: '#076ABC', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                    >
                      Ver todos
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {appointments.slice(0, 5).map((a) => {
                      const isConfirmado = a.status === 'confirmado';
                      const isAtendido = a.status === 'atendido';
                      const isEnSala = a.status === 'en_sala';

                      return (
                        <div
                          key={a.id}
                          style={{
                            background: '#F5F8FE',
                            padding: '0.85rem 1.1rem',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            border: '1px solid #EDF3FD',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 800, color: '#002182', fontSize: '0.92rem' }}>
                              {a.patientName}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: '#496386', marginTop: '2px' }}>
                              {a.doctorSpecialty || a.specialtyName} · {a.doctorName}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, color: '#002182', fontSize: '0.84rem' }}>
                              {a.date} - {a.time} hs
                            </div>
                            <span
                              style={{
                                display: 'inline-block',
                                marginTop: '3px',
                                padding: '0.15rem 0.6rem',
                                borderRadius: '100px',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                textTransform: 'capitalize',
                                background: isConfirmado ? '#d1fae5' : isAtendido ? '#fee2e2' : isEnSala ? '#fef3c7' : '#EBF3FD',
                                color: isConfirmado ? '#065f46' : isAtendido ? '#991b1b' : isEnSala ? '#92400e' : '#002182'
                              }}
                            >
                              {a.status === 'en_sala' ? 'En sala' : a.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Pacientes Recientes & Consultorios Activos */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem' }}>
                {/* Pacientes Recientes */}
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
                      Últimos Pacientes Registrados
                    </h3>
                    <button
                      onClick={() => setActiveTab('patients')}
                      style={{ background: 'none', border: 'none', color: '#076ABC', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                    >
                      Ver Padrón
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {patients.slice(0, 4).map((p) => (
                      <div
                        key={p.id}
                        style={{
                          background: '#F5F8FE',
                          padding: '0.8rem 1rem',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          border: '1px solid #EDF3FD'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 800, color: '#002182', fontSize: '0.88rem' }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#496386' }}>
                            DNI {p.dni} • {p.insurance || 'Particular'}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedPatientForDetail(p);
                          }}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #D2E3FC',
                            color: '#076ABC',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Ver Ficha
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Consultorios en Vivo */}
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
                      Ocupación de Consultorios en Vivo
                    </h3>
                    <button
                      onClick={() => setActiveTab('rooms')}
                      style={{ background: 'none', border: 'none', color: '#076ABC', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                    >
                      Gestionar
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.65rem' }}>
                    {(rooms || []).slice(0, 6).map((r) => {
                      const isDisp = (r.status || 'Disponible') === 'Disponible';
                      return (
                        <div
                          key={r.id}
                          style={{
                            background: '#F5F8FE',
                            border: '1px solid #D2E3FC',
                            borderRadius: '12px',
                            padding: '0.75rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.25rem'
                          }}
                        >
                          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#002182' }}>
                            {r.name.split('—')[0]}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#496386' }}>{r.floor || 'Piso 1'}</div>
                          <div
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              color: isDisp ? '#065f46' : '#002182',
                              marginTop: '0.2rem'
                            }}
                          >
                            ● {r.status || 'Disponible'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TURNOS */}
          {activeTab === 'appointments' && <AppointmentsManager />}

          {/* TAB 3: PACIENTES */}
          {activeTab === 'patients' && <PatientsView />}

          {/* TAB 4: HISTORIAL CLÍNICO */}
          {activeTab === 'clinical' && <ClinicalRecordsView />}

          {/* TAB 5: PROFESIONALES (Solo Administrativo) */}
          {activeTab === 'doctors' && !isDoctor && <DoctorsManager />}

          {/* TAB 6: ESPECIALIDADES (Solo Administrativo) */}
          {activeTab === 'services' && !isDoctor && <ServicesManager />}

          {/* TAB 7: HORARIOS & DISPONIBILIDAD */}
          {activeTab === 'schedules' && <SchedulesManager />}

          {/* TAB 8: CONSULTORIOS (Solo Administrativo) */}
          {activeTab === 'rooms' && !isDoctor && <RoomsManager />}

          {/* TAB 9: OBRAS SOCIALES */}
          {activeTab === 'insurances' && <InsurancesView />}

          {/* TAB 10: ESTUDIOS & DOCUMENTACIÓN */}
          {activeTab === 'imaging' && <ImagingView />}

          {/* TAB 11: RECETAS ELECTRÓNICAS (CUIR) */}
          {activeTab === 'prescriptions' && <PrescriptionsManager />}

          {/* TAB 12: FACTURACIÓN / PAGOS / ARCA (Solo Administrativo) */}
          {activeTab === 'billing' && !isDoctor && <BillingView />}

          {/* TAB 13: REPORTES & ESTADÍSTICAS */}
          {activeTab === 'reports' && <ReportsView />}

          {/* TAB 14: NOTIFICACIONES & RECORDATORIOS (Solo Administrativo) */}
          {activeTab === 'communications' && !isDoctor && <CommunicationsView />}

          {/* TAB 15: USUARIOS Y PERMISOS (Solo Administrativo) */}
          {activeTab === 'staff' && !isDoctor && <UsersManager />}

          {/* TAB 16: CONFIGURACIÓN DE LA CLÍNICA / MI PERFIL */}
          {activeTab === 'settings' && <SettingsView />}

          {/* TAB 17: AUDITORÍA Y SEGURIDAD (Solo Administrativo) */}
          {activeTab === 'audit' && !isDoctor && <AuditLogsView />}
        </main>
      </div>

      {/* Global Modals */}
      <PatientDetailModal />
      <AppointmentModal />
      <PatientFormModal />
      <DoctorModal />
      <NewConsultationModal />
      <ConsultationPrintView />
      <ConsentFormsModal />

      {/* Responsive Styles for Sidebar */}
      <style>{`
        @media (max-width: 900px) {
          .admin-sidebar {
            position: fixed !important;
            left: -290px;
            transition: left 0.25s ease-in-out;
          }
          .sidebar-mobile-open {
            left: 0 !important;
          }
          .admin-mobile-open-btn {
            display: block !important;
          }
          .admin-mobile-close-btn {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};
