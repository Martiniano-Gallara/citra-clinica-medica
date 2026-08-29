import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Search,
  Plus,
  Building2,
  Bell,
  CalendarDays,
  UserPlus,
  CalendarPlus,
  Stethoscope,
  Receipt,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileCheck2,
  Pill,
  UserSquare2
} from 'lucide-react';

export const Topbar = () => {
  const {
    clinicInfo,
    currentBranchId,
    setCurrentBranchId,
    currentBranch,
    setGlobalSearchOpen,
    setIsAppointmentModalOpen,
    setAppointmentModalData,
    setIsPatientFormModalOpen,
    setPatientFormModalData,
    setIsNewConsultationModalOpen,
    setConsultationPreloadData,
    setIsArcaInvoiceModalOpen,
    setArcaInvoicePreloadData,
    setIsConsentModalOpen,
    setIsPatientPortalMode,
    isPatientPortalMode,
    tasks,
    toggleTaskStatus
  } = useClinic();

  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const pendingTasks = tasks.filter((t) => t.status === 'pending');

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="global-search-trigger"
          onClick={() => setGlobalSearchOpen(true)}
          type="button"
        >
          <Search size={18} color="#1A9E9B" />
          <span>Buscar pacientes, DNI, consultas, turnos, CUIR o facturas...</span>
          <span className="search-shortcut">⌘K / Ctrl+K</span>
        </button>
      </div>

      <div className="topbar-right">
        {/* Compliance Badges Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: '#F3FBFB',
            border: '1px solid #CDEEEE',
            padding: '0.35rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.74rem',
            fontWeight: 700,
            color: '#0C4E4C'
          }}
          title="Cumplimiento normativo vigente: ReNaPDiS, ARCA WSFE y SISA Argentina"
        >
          <ShieldCheck size={14} color="#047857" />
          <span>ReNaPDiS · ARCA · SISA</span>
        </div>

        {/* Branch Selector */}
        <div style={{ position: 'relative' }}>
          <div
            className="branch-select-badge"
            onClick={() => setShowBranchMenu(!showBranchMenu)}
          >
            <Building2 size={16} color="#1A9E9B" />
            <span>{currentBranch?.name || 'Sede Central'}</span>
          </div>

          {showBranchMenu && (
            <div
              style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                width: '260px',
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                padding: '0.5rem',
                zIndex: 50
              }}
            >
              <div style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', fontWeight: 800, color: '#4e7a78', textTransform: 'uppercase' }}>
                Seleccionar Sede
              </div>
              {clinicInfo.branches.map((b) => (
                <div
                  key={b.id}
                  style={{
                    padding: '0.6rem 0.8rem',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    fontWeight: b.id === currentBranchId ? 700 : 500,
                    background: b.id === currentBranchId ? '#e0f6f5' : 'transparent',
                    color: b.id === currentBranchId ? '#0C4E4C' : 'var(--text-main)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onClick={() => {
                    setCurrentBranchId(b.id);
                    setShowBranchMenu(false);
                  }}
                >
                  <div>
                    <div>{b.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#4e7a78' }}>{b.address}</div>
                  </div>
                  {b.id === currentBranchId && <CheckCircle2 size={16} color="#1A9E9B" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications & Tasks Drawer */}
        <div style={{ position: 'relative' }}>
          <button
            className="topbar-icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Alertas y tareas de auditoría"
            type="button"
          >
            <Bell size={20} />
            {pendingTasks.length > 0 && <span className="notification-dot" />}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                width: '340px',
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                padding: '1rem',
                zIndex: 50
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0C4E4C' }}>
                  Alertas Sanitarias & Tareas ({pendingTasks.length})
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '280px', overflowY: 'auto' }}>
                {tasks.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      padding: '0.65rem',
                      background: t.status === 'completed' ? '#f8fafc' : '#F3FBFB',
                      border: `1px solid ${t.status === 'completed' ? '#e2e8f0' : '#CDEEEE'}`,
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.84rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 700, color: t.status === 'completed' ? '#94a3b8' : '#0C4E4C' }}>
                        {t.title}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{t.time}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#4e7a78', marginTop: '2px' }}>
                      {t.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* "+ Nueva Acción" Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            className="quick-action-btn"
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            type="button"
          >
            <Plus size={18} />
            <span>+ Nueva Acción</span>
          </button>

          {showQuickMenu && (
            <div
              style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                width: '260px',
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                padding: '0.5rem',
                zIndex: 50
              }}
            >
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
                className="dropdown-item"
                onClick={() => {
                  setAppointmentModalData(null);
                  setIsAppointmentModalOpen(true);
                  setShowQuickMenu(false);
                }}
              >
                <CalendarPlus size={18} color="#1A9E9B" />
                <span>Nuevo Turno Médico</span>
              </div>

              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
                className="dropdown-item"
                onClick={() => {
                  setConsultationPreloadData(null);
                  setIsNewConsultationModalOpen(true);
                  setShowQuickMenu(false);
                }}
              >
                <Stethoscope size={18} color="#0C4E4C" />
                <span>Nueva Consulta (HCE)</span>
              </div>

              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
                className="dropdown-item"
                onClick={() => {
                  setArcaInvoicePreloadData(null);
                  setIsArcaInvoiceModalOpen(true);
                  setShowQuickMenu(false);
                }}
              >
                <Receipt size={18} color="#0d9488" />
                <span>Factura Electrónica ARCA</span>
              </div>

              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
                className="dropdown-item"
                onClick={() => {
                  setIsConsentModalOpen(true);
                  setShowQuickMenu(false);
                }}
              >
                <FileCheck2 size={18} color="#6FD0CC" />
                <span>Consentimiento Informado</span>
              </div>

              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
                className="dropdown-item"
                onClick={() => {
                  setIsPatientFormModalOpen(true);
                  setShowQuickMenu(false);
                }}
              >
                <UserPlus size={18} color="#1A9E9B" />
                <span>Alta Nuevo Paciente</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
