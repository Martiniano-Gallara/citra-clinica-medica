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
import { OnlineAuthModal } from '../insurances/OnlineAuthModal';

// Resilient Error Boundary to prevent any unhandled render crash from turning the page blank
class AdminTabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by AdminTabErrorBoundary:', error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.tab !== this.props.tab && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1.5px solid #FECACA',
            padding: '2.5rem',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(220, 38, 38, 0.08)',
            maxWidth: '640px',
            margin: '2rem auto'
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: '#FEE2E2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: '#DC2626'
            }}
          >
            <ShieldAlert size={28} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#991B1B', margin: '0 0 0.5rem' }}>
            No se pudo cargar este módulo
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748B', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
            Ocurrió un inconveniente temporal en la renderización de la sección. La seguridad y los datos de la clínica están a resguardo.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                background: '#076ABC',
                color: '#ffffff',
                border: 'none',
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.84rem',
                cursor: 'pointer'
              }}
            >
              Reintentar
            </button>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                if (this.props.onReset) this.props.onReset();
              }}
              style={{
                background: '#F1F5F9',
                color: '#334155',
                border: '1px solid #CBD5E1',
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.84rem',
                cursor: 'pointer'
              }}
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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

  // General KPIs
  const todayStr = new Date().toISOString().split('T')[0];
  const totalAppointments = appointments.length;
  const todayAppointments = appointments.filter((a) => a.date === todayStr);
  const activeDoctors = doctors.filter((d) => d.active !== false).length;
  const totalPatients = patients.length;
  const availableRooms = rooms ? rooms.filter((r) => (r.status || 'Disponible') === 'Disponible').length : 6;

  // Doctor Specific KPIs
  const doctorAppointments = scopedAppointments;
  const todayDoctorAppointments = doctorAppointments.filter((a) => a.date === todayStr);
  const doctorPatients = scopedPatients;

  // Sidebar Grouped Navigation Sections according to Role (Doctor vs Administrativo)
  const navSections = React.useMemo(() => {
    if (isDoctor) {
      return [
        {
          title: 'PANEL MÉDICO',
          items: [
            { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard, badge: null }
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
            { id: 'reports', label: 'Métricas & Rendimiento', icon: BarChart3, badge: null }
          ]
        },
        {
          title: 'MI CUENTA',
          items: [
            { id: 'settings', label: 'Mi Configuración', icon: Settings, badge: null }
          ]
        }
      ];
    }

    // Role: Administrativo (Recepción & Facturación de CITRA)
    const adminSections = [
      {
        title: 'RECEPCIÓN CITRA',
        items: [
          { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard, badge: null }
        ]
      },
      {
        title: 'GESTIÓN DE ATENCIÓN',
        items: [
          { id: 'appointments', label: 'Gestión de Turnos', icon: CalendarCheck, badge: appointments.length },
          { id: 'patients', label: 'Pacientes', icon: Users, badge: patients.length },
          { id: 'rooms', label: 'Consultorios en Vivo', icon: DoorClosed, badge: availableRooms }
        ]
      },
      {
        title: 'ADMINISTRACIÓN Y FACTURACIÓN',
        items: [
          { id: 'schedules', label: 'Horarios de Profesionales', icon: Clock, badge: null },
          { id: 'insurances', label: 'Obras Sociales', icon: Shield, badge: healthInsurances.length },
          { id: 'billing', label: 'Facturación / Caja', icon: CreditCard, badge: null },
          { id: 'reports', label: 'Métricas Operativas', icon: BarChart3, badge: null }
        ]
      }
    ];

    if (isSuperAdmin) {
      adminSections.push({
        title: 'DIRECCIÓN & AUDITORÍA',
        items: [
          { id: 'staff', label: 'Usuarios y Permisos', icon: UserCheck, badge: null },
          { id: 'audit', label: 'Auditoría', icon: ShieldAlert, badge: null }
        ]
      });
    }

    adminSections.push({
      title: 'MI CUENTA',
      items: [
        { id: 'settings', label: 'Mi Configuración', icon: Settings, badge: null }
      ]
    });

    return adminSections;
  }, [isDoctor, isSuperAdmin, doctorAppointments.length, doctorPatients.length, scopedConsultations.length, scopedElectronicPrescriptions.length, scopedImagingStudies.length, scopedHealthInsurances.length, appointments.length, patients.length, healthInsurances.length]);

  // RBAC Guard Effect: automatically redirect to dashboard if tab not permitted for current role
  React.useEffect(() => {
    if (authRole !== 'admin') return;
    const allowedTabIds = navSections.flatMap((s) => s.items).map((i) => i.id);
    if (!allowedTabIds.includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [isDoctor, activeTab, navSections, authRole]);

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

  const currentTabLabel =
    navSections.flatMap((s) => s.items).find((i) => i.id === activeTab)?.label || 'Inicio';

  const doctorAdminName = (() => {
    if (!isDoctor) return authAdmin?.name || 'Lic. Facundo Quiroga';
    const raw = currentDoctor?.name || authAdmin?.name || 'Dr. Alejandro Blanco';
    const clean = raw.includes('Morales') ? 'Dr. Alejandro Blanco' : raw;
    return clean;
  })();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F8FE', width: '100%' }}>
      {/* 0. BACKDROP OVERLAY PARA SIDEBAR MÓVIL */}
      {isMobileSidebarOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setIsMobileSidebarOpen(false)}
          title="Toca para cerrar menú de navegación"
          aria-label="Cerrar menú de navegación"
        />
      )}

      {/* 1. SIDEBAR LATERAL A LA IZQUIERDA */}
      <aside
        style={{
          width: '310px',
          minWidth: '310px',
          flexShrink: 0,
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
        {/* Top: Logo */}
        <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid rgba(210, 227, 252, 0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div
              style={{
                background: '#ffffff',
                padding: '0.45rem 0.85rem',
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
              }}
            >
              <img
                src="./citra-logo.png"
                alt="CITRA"
                style={{ height: '32px', maxWidth: '160px', objectFit: 'contain', display: 'block' }}
              />
            </div>

            {/* Close button for mobile */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="admin-mobile-close-btn"
              title="Cerrar navegación"
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px'
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
                <div style={{ fontSize: '0.68rem', color: isDoctor ? '#86efac' : '#93c5fd', fontWeight: 700, marginTop: '2px' }}>
                  {isDoctor ? (currentDoctor?.specialty || 'Médico Especialista') : (authAdmin?.role || 'Recepción & Facturación')}
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh', width: '100%' }}>
        {/* Topbar del Área de Contenido */}
        <header
          className="admin-topbar"
          style={{
            height: '64px',
            background: '#ffffff',
            borderBottom: '1.5px solid #D2E3FC',
            padding: '0 2.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 900
          }}
        >
          {/* Left: Mobile Menu Toggle & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="admin-mobile-open-btn"
              title="Abrir menú de navegación"
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

            <h1 className="admin-topbar-title" style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#002182', letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentTabLabel}
            </h1>
          </div>

          {/* Right: User Badge & Switcher & Logout */}
          <div className="admin-topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Quick Profile Switcher (Médico vs Administrativo) */}
            <div className="admin-profile-switcher" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <label className="admin-profile-label" style={{ fontSize: '0.74rem', fontWeight: 800, color: '#496386' }}>
                Perfil:
              </label>
              <select
                className="admin-profile-select"
                value={authAdmin?.id || ''}
                onChange={(e) => {
                  if (typeof switchAdminUser === 'function') {
                    switchAdminUser(e.target.value);
                  }
                }}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: '8px',
                  border: '1.5px solid #D2E3FC',
                  background: '#ffffff',
                  color: '#002182',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {(users || [])
                  .filter((u) => u.adminType === 'doctor' || u.adminType === 'administrative' || u.adminType === 'superadmin')
                  .map((u) => {
                    let roleLabel = '';
                    if (u.adminType === 'superadmin') roleLabel = 'Dirección / Superadmin';
                    else if (u.adminType === 'administrative') roleLabel = 'Mesa de Entrada / Recepción';
                    else roleLabel = u.specialty || 'Profesional';
                    return (
                      <option key={u.id} value={u.id}>
                        {u.name} ({roleLabel})
                      </option>
                    );
                  })}
              </select>
            </div>

            {/* Administrator / Doctor Badge */}
            <div
              className="admin-user-badge"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                background: '#F5F8FE',
                border: '1px solid #D2E3FC',
                borderRadius: '100px',
                padding: '0.35rem 0.85rem'
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isDoctor ? '#10b981' : '#2563eb',
                  flexShrink: 0
                }}
              />
              <span className="admin-user-name" style={{ fontSize: '0.82rem', fontWeight: 800, color: '#002182' }}>
                {doctorAdminName}
              </span>
              <span className="admin-user-role" style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                · {isDoctor ? (currentDoctor?.specialty || 'Médico') : (authAdmin?.role || 'Recepción & Facturación')}
              </span>
            </div>

            {/* Logout button */}
            <button
              onClick={logoutAdmin}
              className="admin-logout-btn"
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
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="admin-main-content" style={{ padding: '1.75rem 2.25rem 3rem', flex: 1, width: '100%', boxSizing: 'border-box' }}>
          <AdminTabErrorBoundary tab={activeTab} onReset={() => setActiveTab('dashboard')}>
          {/* TAB 1: DASHBOARD & MÉTRICAS PARA DOCTOR (Dr. Blanco) */}
          {activeTab === 'dashboard' && isDoctor && (
            <div>
              {/* Doctor Header Banner */}
              <div
                className="admin-hero-banner"
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

              {/* Atajos Rápidos del Doctor y Próximos Turnos */}
              <div className="admin-shortcuts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem', marginBottom: '2rem' }}>
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
                          CITRA Sede Arroyito · Av. Carlos Pontin 556
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
                className="admin-kpi-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                  gap: '1.25rem',
                  marginBottom: '2rem'
                }}
              >
                {/* Card 1: Turnos Totales */}
                <div
                  onClick={() => setActiveTab('appointments')}
                  title="Click para ver todos los turnos programados"
                  style={{
                    background: '#ffffff',
                    borderRadius: '18px',
                    border: '1.5px solid #D2E3FC',
                    padding: '1.5rem',
                    boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#076ABC';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#D2E3FC';
                    e.currentTarget.style.transform = 'translateY(0)';
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
                  onClick={() => setActiveTab('appointments')}
                  title="Click para ver la agenda del día"
                  style={{
                    background: '#ffffff',
                    borderRadius: '18px',
                    border: '1.5px solid #D2E3FC',
                    padding: '1.5rem',
                    boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#92400e';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#D2E3FC';
                    e.currentTarget.style.transform = 'translateY(0)';
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
                  onClick={() => setActiveTab('patients')}
                  title="Click para ver el padrón de pacientes"
                  style={{
                    background: '#ffffff',
                    borderRadius: '18px',
                    border: '1.5px solid #D2E3FC',
                    padding: '1.5rem',
                    boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#002182';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#D2E3FC';
                    e.currentTarget.style.transform = 'translateY(0)';
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
                  onClick={() => setActiveTab('schedules')}
                  title="Click para ver disponibilidad y horarios de profesionales"
                  style={{
                    background: '#ffffff',
                    borderRadius: '18px',
                    border: '1.5px solid #D2E3FC',
                    padding: '1.5rem',
                    boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#065f46';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#D2E3FC';
                    e.currentTarget.style.transform = 'translateY(0)';
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
                  onClick={() => setActiveTab('rooms')}
                  title="Click para ver y gestionar consultorios físicos"
                  style={{
                    background: '#ffffff',
                    borderRadius: '18px',
                    border: '1.5px solid #D2E3FC',
                    padding: '1.5rem',
                    boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#076ABC';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#D2E3FC';
                    e.currentTarget.style.transform = 'translateY(0)';
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
              <div className="admin-shortcuts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem', marginBottom: '2rem' }}>
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
                        Horarios y disponibilidad de médicos
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
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#076ABC')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#D2E3FC')}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <Shield size={17} color="#076ABC" />
                        Obras sociales y convenios
                      </span>
                      <ChevronRight size={16} color="#7994B8" />
                    </button>

                    <button
                      onClick={() => setActiveTab('billing')}
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
                        <CreditCard size={17} color="#076ABC" />
                        Facturación y cobranza en caja
                      </span>
                      <ChevronRight size={16} color="#7994B8" />
                    </button>

                    <button
                      onClick={() => setActiveTab('reports')}
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
                        <BarChart3 size={17} color="#076ABC" />
                        Métricas y reportes de atención
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
                          onClick={() => {
                            if (typeof setAppointmentModalData === 'function') {
                              setAppointmentModalData(a);
                            }
                            if (typeof setIsAppointmentModalOpen === 'function') {
                              setIsAppointmentModalOpen(true);
                            }
                          }}
                          title="Click para ver o editar turno"
                          style={{
                            background: '#F5F8FE',
                            padding: '0.85rem 1.1rem',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            border: '1px solid #EDF3FD',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#EBF3FD';
                            e.currentTarget.style.borderColor = '#076ABC';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#F5F8FE';
                            e.currentTarget.style.borderColor = '#EDF3FD';
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
              <div className="admin-panels-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem' }}>
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
                          onClick={() => setActiveTab('rooms')}
                          title={`Click para gestionar ${r.name}`}
                          style={{
                            background: '#F5F8FE',
                            border: '1px solid #D2E3FC',
                            borderRadius: '12px',
                            padding: '0.75rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.25rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#076ABC';
                            e.currentTarget.style.background = '#EBF3FD';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#D2E3FC';
                            e.currentTarget.style.background = '#F5F8FE';
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

          {/* TAB 4: HISTORIAL CLÍNICO (Exclusivo Médico) */}
          {activeTab === 'clinical' && isDoctor && <ClinicalRecordsView />}

          {/* TAB 5: PROFESIONALES (Solo Superadmin) */}
          {activeTab === 'doctors' && isSuperAdmin && <DoctorsManager />}

          {/* TAB 6: ESPECIALIDADES (Solo Superadmin) */}
          {activeTab === 'services' && isSuperAdmin && <ServicesManager />}

          {/* TAB 7: HORARIOS & DISPONIBILIDAD */}
          {activeTab === 'schedules' && <SchedulesManager />}

          {/* TAB 8: CONSULTORIOS (Administración y Superadmin) */}
          {activeTab === 'rooms' && (!isDoctor || isSuperAdmin) && <RoomsManager />}

          {/* TAB 9: OBRAS SOCIALES */}
          {activeTab === 'insurances' && <InsurancesView />}

          {/* TAB 10: ESTUDIOS & DOCUMENTACIÓN (Exclusivo Médico) */}
          {activeTab === 'imaging' && isDoctor && <ImagingView />}

          {/* TAB 11: RECETAS ELECTRÓNICAS (Exclusivo Médico) */}
          {activeTab === 'prescriptions' && isDoctor && <PrescriptionsManager />}

          {/* TAB 12: FACTURACIÓN / PAGOS / CAJA (Administración & Superadmin) */}
          {activeTab === 'billing' && !isDoctor && <BillingView />}

          {/* TAB 13: REPORTES & ESTADÍSTICAS */}
          {activeTab === 'reports' && <ReportsView />}

          {/* TAB 14: NOTIFICACIONES (Solo Superadmin) */}
          {activeTab === 'communications' && isSuperAdmin && <CommunicationsView />}

          {/* TAB 15: USUARIOS Y PERMISOS (Solo Superadmin) */}
          {activeTab === 'staff' && isSuperAdmin && <UsersManager />}

          {/* TAB 16: CONFIGURACIÓN DE LA CLÍNICA / MI PERFIL */}
          {activeTab === 'settings' && <SettingsView />}

          {/* TAB 17: AUDITORÍA Y SEGURIDAD (Solo Superadmin) */}
          {activeTab === 'audit' && isSuperAdmin && <AuditLogsView />}
          </AdminTabErrorBoundary>
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
      <OnlineAuthModal />

      {/* Responsive Styles for Mobile Audit (Doctor & Administrative) */}
      <style>{`
        /* 0. Mobile Drawer Backdrop */
        .admin-sidebar-backdrop {
          display: none;
        }

        /* 1. Tablet & Mobile Styles (<= 900px) */
        @media (max-width: 900px) {
          .admin-sidebar-backdrop {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 15, 60, 0.68);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            z-index: 998;
            animation: adminFadeIn 0.2s ease;
          }

          @keyframes adminFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .admin-sidebar {
            position: fixed !important;
            left: -330px;
            width: 295px !important;
            max-width: 86vw !important;
            transition: left 0.28s cubic-bezier(0.4, 0, 0.2, 1) !important;
            z-index: 999 !important;
            box-shadow: 12px 0 35px rgba(0, 0, 0, 0.38) !important;
          }

          .sidebar-mobile-open {
            left: 0 !important;
          }

          .admin-mobile-open-btn {
            display: flex !important;
            align-items: center;
            justify-content: center;
            width: 38px;
            height: 38px;
            border-radius: 8px;
            background: #F5F8FE !important;
            border: 1px solid #D2E3FC !important;
            color: #002182 !important;
          }

          .admin-mobile-close-btn {
            display: flex !important;
            align-items: center;
            justify-content: center;
            width: 38px;
            height: 38px;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.14) !important;
            color: #ffffff !important;
          }

          .admin-topbar {
            padding: 0 1.25rem !important;
            height: 60px !important;
          }

          .admin-main-content {
            padding: 1.25rem 1rem 3rem !important;
          }
        }

        /* 2. Small Mobile Screens (<= 640px) */
        @media (max-width: 640px) {
          .admin-topbar {
            padding: 0 0.75rem !important;
            height: 56px !important;
          }

          .admin-topbar-title {
            font-size: 1.12rem !important;
            max-width: 135px;
          }

          .admin-topbar-right {
            gap: 0.35rem !important;
          }

          .admin-profile-label {
            display: none !important;
          }

          .admin-profile-select {
            max-width: 105px !important;
            font-size: 0.72rem !important;
            padding: 0.28rem 0.4rem !important;
          }

          .admin-user-role {
            display: none !important;
          }

          .admin-user-badge {
            padding: 0.25rem 0.55rem !important;
            gap: 0.4rem !important;
          }

          .admin-user-name {
            font-size: 0.75rem !important;
            max-width: 100px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .admin-logout-btn {
            padding: 0.4rem 0.55rem !important;
          }

          .admin-main-content {
            padding: 0.85rem 0.65rem 2.5rem !important;
          }

          .admin-hero-banner {
            padding: 1.25rem 1rem !important;
            border-radius: 16px !important;
            margin-bottom: 1.25rem !important;
            gap: 1rem !important;
          }

          .admin-hero-banner h2 {
            font-size: 1.35rem !important;
            line-height: 1.25 !important;
          }

          .admin-hero-banner p {
            font-size: 0.82rem !important;
            line-height: 1.45 !important;
          }

          .admin-hero-banner button {
            flex: 1 1 calc(50% - 0.5rem);
            justify-content: center;
          }

          .admin-shortcuts-grid,
          .admin-panels-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
            margin-bottom: 1.25rem !important;
          }

          .admin-kpi-grid {
            grid-template-columns: 1fr !important;
            gap: 0.85rem !important;
            margin-bottom: 1.25rem !important;
          }
        }

        /* 3. Ultra-Compact Phones (<= 420px) */
        @media (max-width: 420px) {
          .admin-topbar-title {
            max-width: 110px;
            font-size: 1.05rem !important;
          }

          .admin-hero-banner button {
            flex: 1 1 100%;
          }

          .admin-user-badge {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
