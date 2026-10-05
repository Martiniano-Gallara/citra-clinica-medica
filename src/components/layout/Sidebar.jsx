import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Activity,
  Eye,
  Shield,
  CreditCard,
  MessageSquare,
  UserCheck,
  BarChart3,
  Settings,
  UserSquare2,
  Stethoscope
} from 'lucide-react';

export const Sidebar = () => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    authAdmin,
    isDoctor: clinicIsDoctor,
    currentDoctor,
    appointments,
    setIsPatientPortalMode
  } = useClinic();

  const userObj = authAdmin || currentUser || {};
  const isDoctorUser =
    clinicIsDoctor ||
    userObj.adminType === 'doctor' ||
    userObj.doctorId ||
    (userObj.name && userObj.name.toLowerCase().includes('blanco')) ||
    (userObj.email && userObj.email.toLowerCase().includes('blanco'));

  const isDoctor = isDoctorUser;

  const navSections = [
    {
      title: 'Atención Médica',
      items: [
        { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard, badge: null },
        { id: 'agenda', label: 'Turnos', icon: Calendar, badge: pendingAppointmentsCount > 0 ? pendingAppointmentsCount : null },
        { id: 'patients', label: 'Pacientes', icon: Users, badge: null },
        { id: 'clinical', label: 'Historial Clínico', icon: FileText, badge: null },
        { id: 'kinesio', label: 'Kinesiología & Rehab', icon: Activity, badge: null }
      ]
    },
    {
      title: 'Gestión Integral',
      items: [
        ...(!isDoctor ? [{ id: 'insurances', label: 'Obras Sociales', icon: Shield, badge: null }] : []),
        { id: 'billing', label: 'Facturación', icon: CreditCard, badge: null },
        { id: 'communications', label: 'Comunicación', icon: MessageSquare, badge: null },
        { id: 'doctors', label: 'Profesionales', icon: UserCheck, badge: null },
        { id: 'reports', label: 'Estadísticas', icon: BarChart3, badge: null },
        { id: 'settings', label: 'Configuración', icon: Settings, badge: null }
      ]
    }
  ];

  return (
    <aside className="sidebar">
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3px',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
              flexShrink: 0
            }}
          >
            <img
              src="/citra-icon.png"
              alt="CITRA Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-title">CITRA</span>
            <span className="sidebar-brand-subtitle">
              Traumatología & Rehab
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="sidebar-nav">
        {navSections.map((sec, sIdx) => (
          <div key={sIdx}>
            <div className="nav-section-title">{sec.title}</div>
            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <div
                  key={item.id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="nav-item-badge">{item.badge}</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Portal del Paciente Switch Button */}
        <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(210, 227, 252, 0.15)' }}>
          <button
            type="button"
            className="btn btn-outline"
            style={{
              width: '100%',
              color: '#ffffff',
              borderColor: 'var(--c-accent)',
              background: 'rgba(37, 124, 230, 0.15)',
              fontSize: '0.85rem',
              padding: '0.65rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '0.6rem'
            }}
            onClick={() => setIsPatientPortalMode(true)}
            title="Ingresar a la vista de autogestión del paciente"
          >
            <UserSquare2 size={18} color="#257CE6" />
            <span style={{ fontWeight: 800 }}>Portal del Paciente</span>
          </button>
        </div>
      </div>

      {/* Footer User Info */}
      <div className="sidebar-footer">
        <div className="user-profile-widget" onClick={() => setActiveTab('settings')}>
          {isDoctor ? (
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(37, 124, 230, 0.25)',
                border: '1.5px solid #257CE6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#93c5fd',
                flexShrink: 0
              }}
            >
              <Stethoscope size={18} />
            </div>
          ) : userObj.avatar ? (
            <img
              src={userObj.avatar}
              alt={userObj.name || 'Usuario'}
              className="user-avatar"
            />
          ) : (
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(37, 124, 230, 0.25)',
                border: '1.5px solid #257CE6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#93c5fd',
                flexShrink: 0
              }}
            >
              <UserSquare2 size={18} />
            </div>
          )}
          <div className="user-info">
            <span className="user-name">{userObj.name || (isDoctor ? 'Dr. Alejandro Blanco' : 'Secretaría CITRA')}</span>
            <span className="user-role">
              {isDoctor
                ? ((userObj.specialty || currentDoctor?.specialty || '').toLowerCase().includes('traumatolog') || (userObj.name || '').toLowerCase().includes('blanco') ? 'Traumatólogo' : (userObj.specialty || currentDoctor?.specialty || 'Traumatólogo'))
                : (userObj.role || 'Secretaría')}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
