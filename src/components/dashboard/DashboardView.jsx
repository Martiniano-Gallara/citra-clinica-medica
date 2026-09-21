import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import {
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  DollarSign,
  UserX,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Activity,
  UserCheck,
  Stethoscope,
  Filter,
  Plus,
  PlayCircle,
  Eye,
  MessageSquare,
  Shield,
  Zap,
  KeyRound,
  FileCheck,
  Check,
  Building2,
  Sparkles,
  ChevronRight,
  FileText,
  CreditCard,
  QrCode
} from 'lucide-react';
import { Badge } from '../common/Badge';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export const DashboardView = () => {
  const {
    appointments,
    patients,
    doctors,
    specialties,
    invoices,
    tasks,
    rehabPlans,
    imagingStudies,
    communications,
    currentUser,
    switchUserRole,
    filterDoctor,
    setFilterDoctor,
    filterSpecialty,
    setFilterSpecialty,
    filterDate,
    setFilterDate,
    updateAppointmentStatus,
    setIsAppointmentModalOpen,
    setAppointmentModalData,
    setIsNewConsultationModalOpen,
    setConsultationPreloadData,
    setSelectedPatientForDetail,
    setIsRehabSessionModalOpen,
    setRehabSessionPreloadPlan,
    setIsOnlineAuthModalOpen,
    setActiveTab,
    addToast,
    currentBranch
  } = useClinic();

  const [tableFilter, setTableFilter] = useState('all'); // 'all', 'en_sala', 'pendiente', 'atendido'

  // Filter appointments
  const filteredAppointments = appointments.filter((app) => {
    const matchDate = filterDate ? app.date === filterDate : true;
    const matchDoctor = filterDoctor === 'all' ? true : app.doctorId === filterDoctor;
    const matchSpecialty = filterSpecialty === 'all' ? true : app.specialtyId === filterSpecialty;
    const matchTableTab =
      tableFilter === 'all'
        ? true
        : tableFilter === 'en_sala'
        ? app.status === 'en_sala'
        : tableFilter === 'pendiente'
        ? app.status === 'pendiente' || app.status === 'confirmado'
        : app.status === tableFilter;

    return matchDate && matchDoctor && matchSpecialty && matchTableTab;
  });

  // Calculate KPIs
  const totalAppointmentsToday = appointments.filter((a) => a.date === filterDate).length;
  const attendedCount = appointments.filter((a) => a.date === filterDate && a.status === 'atendido').length;
  const inWaitingRoomCount = appointments.filter((a) => a.date === filterDate && a.status === 'en_sala').length;
  const pendingCount = appointments.filter((a) => a.date === filterDate && (a.status === 'pendiente' || a.status === 'confirmado')).length;

  const progressPercentage = totalAppointmentsToday > 0 ? Math.round((attendedCount / totalAppointmentsToday) * 100) : 0;

  // Chart data
  const specialtyDistributionData = {
    labels: ['Traumatología LCA', 'Kinesiología & Rehab', 'Manguito Rotador', 'Columna & Lumbalgia', 'Imágenes RMN'],
    datasets: [
      {
        data: [38, 28, 16, 12, 6],
        backgroundColor: ['#076ABC', '#257CE6', '#002182', '#2dd4bf', '#f59e0b'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  const getInitials = (name) => {
    if (!name) return 'PT';
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="view-container">
      {/* 1. HERO BANNER DE CONTROL CLÍNICO */}
      <div
        style={{
          background: 'linear-gradient(135deg, #001556 0%, #002182 50%, #076ABC 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem 1.75rem',
          color: '#ffffff',
          marginBottom: '1.5rem',
          boxShadow: '0 10px 25px -5px rgba(0, 33, 130, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  background: 'rgba(37, 124, 230, 0.2)',
                  border: '1px solid rgba(37, 124, 230, 0.4)',
                  color: '#D2E3FC',
                  padding: '3px 12px',
                  borderRadius: '20px',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span className="pulse-dot" />
                SISTEMA OPERATIVO ACTIVO
              </span>

              <span style={{ fontSize: '0.82rem', color: '#D2E3FC', fontWeight: 600 }}>
                {currentBranch?.name || 'Sede Central Arroyito'} · Turno Mañana
              </span>
            </div>

            <h1 style={{ fontSize: '1.65rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#ffffff', margin: 0 }}>
              Centro Integral de Traumatología & Rehabilitación
            </h1>
            <p style={{ fontSize: '0.86rem', color: '#D2E3FC', margin: 0, opacity: 0.95 }}>
              Panel de control médico centralizado · Gestión de consultas, rehabilitación y flujo asistencial
            </p>
          </div>

          {/* Role Persona Switcher Pills */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.25)',
              padding: '6px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(210, 227, 252, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#D2E3FC', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Simular Rol de Usuario:
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {[
                { id: 'Director Médico', label: 'Director' },
                { id: 'Médico Traumatólogo', label: 'Traumatólogo' },
                { id: 'Kinesiólogo / Fisiatra', label: 'Kinesiólogo' },
                { id: 'Recepcionista Principal', label: 'Recepción' },
                { id: 'Administración & Facturación', label: 'Facturación' },
                { id: 'Superadministrador', label: 'Admin' }
              ].map((r) => {
                const isCurr = currentUser.role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      switchUserRole(r.id);
                      addToast('Rol de Usuario Cambiado', `Ahora visualizando como ${r.id}`, 'info');
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.76rem',
                      fontWeight: isCurr ? 800 : 600,
                      background: isCurr ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
                      color: isCurr ? '#002182' : '#ffffff',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. FILTERS & QUICK ACTION TRIGGER BAR */}
      <div
        className="card"
        style={{
          padding: '0.85rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          border: '1px solid var(--border-color)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)' }}>Fecha:</span>
            <input
              type="date"
              className="form-input"
              style={{ width: '145px', padding: '0.35rem 0.6rem', fontSize: '0.85rem', fontWeight: 700 }}
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)' }}>Especialidad:</span>
            <select
              className="form-select"
              style={{ width: '180px', padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
            >
              <option value="all">Todas las Especialidades</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)' }}>Profesional:</span>
            <select
              className="form-select"
              style={{ width: '180px', padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}
              value={filterDoctor}
              onChange={(e) => setFilterDoctor(e.target.value)}
            >
              <option value="all">Todos los Profesionales</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setAppointmentModalData(null);
              setIsAppointmentModalOpen(true);
            }}
          >
            <Plus size={16} />
            + Nuevo Turno
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setConsultationPreloadData(null);
              setIsNewConsultationModalOpen(true);
            }}
          >
            <Stethoscope size={16} />
            + Nueva Consulta HCE
          </button>
        </div>
      </div>

      {/* 3. ULTRA-POLISHED 4 KPI BENTO CARDS */}
      <div className="dashboard-stats-grid">
        {/* KPI 1: Turnos Agendados */}
        <div className="stat-card-premium">
          <div className="stat-card-top">
            <span className="stat-card-label">Turnos del Día</span>
            <div className="stat-icon-box">
              <Calendar size={22} />
            </div>
          </div>
          <div>
            <div className="stat-card-value">{totalAppointmentsToday}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
              {attendedCount} atendidos · {pendingCount} pendientes
            </div>
          </div>
          {/* Progress Bar */}
          <div style={{ width: '100%', height: '6px', background: 'var(--bg-subtle)', borderRadius: '10px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progressPercentage}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #076ABC, #257CE6)',
                borderRadius: '10px',
                transition: 'width 0.5s ease'
              }}
            />
          </div>
        </div>

        {/* KPI 2: Sala de Espera Activa */}
        <div className="stat-card-premium" style={{ borderLeft: '4px solid var(--c-primary)' }}>
          <div className="stat-card-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="pulse-dot" />
              <span className="stat-card-label" style={{ color: 'var(--c-primary)' }}>En Sala de Espera</span>
            </div>
            <div className="stat-icon-box" style={{ background: '#EBF3FD', color: 'var(--c-primary)' }}>
              <Clock size={22} />
            </div>
          </div>
          <div>
            <div className="stat-card-value" style={{ color: 'var(--c-dark)' }}>
              {inWaitingRoomCount} <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)' }}>pacientes</span>
            </div>
            <div className="stat-card-meta" style={{ color: '#059669', marginTop: '4px' }}>
              <Check size={14} />
              <span>Tiempo de espera prom: 8 min</span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ width: '100%', fontSize: '0.76rem', padding: '4px' }}
            onClick={() => setTableFilter('en_sala')}
          >
            Ver cola de espera
          </button>
        </div>

        {/* KPI 3: Kinesiología & Gimnasio */}
        <div className="stat-card-premium">
          <div className="stat-card-top">
            <span className="stat-card-label">Kinesiología & Rehab</span>
            <div className="stat-icon-box" style={{ background: '#e6f8f7', color: 'var(--c-primary)' }}>
              <Activity size={22} />
            </div>
          </div>
          <div>
            <div className="stat-card-value">{rehabPlans.length}</div>
            <div className="stat-card-meta" style={{ color: 'var(--c-primary)', marginTop: '4px' }}>
              <Zap size={14} />
              <span>3 boxes en tratamiento activo</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <span className="badge badge-teal" style={{ fontSize: '0.72rem' }}>Crioterapia</span>
            <span className="badge badge-teal" style={{ fontSize: '0.72rem' }}>Magneto</span>
            <span className="badge badge-teal" style={{ fontSize: '0.72rem' }}>RPG</span>
          </div>
        </div>

        {/* KPI 4: Validez & Firma Digital */}
        <div className="stat-card-premium">
          <div className="stat-card-top">
            <span className="stat-card-label">Validez & Firma Digital</span>
            <div className="stat-icon-box" style={{ background: '#d1fae5', color: '#065f46' }}>
              <Shield size={22} />
            </div>
          </div>
          <div>
            <div className="stat-card-value" style={{ color: '#065f46' }}>100%</div>
            <div className="stat-card-meta" style={{ color: '#065f46', marginTop: '4px' }}>
              <CheckCircle2 size={14} />
              <span>Consultas firmadas digitalmente</span>
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Certificados X.509 activos
          </div>
        </div>
      </div>

      {/* 4. MAIN OPERATIONAL WORKSPACE (Left: Agenda & Waiting Room / Right: Quick Actions & BI) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.65fr 1fr', gap: '1.5rem' }}>
        {/* LEFT COLUMN: OPERATIONAL AGENDA & WAITING ROOM */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 className="card-title">
                <Users size={20} color="#076ABC" />
                <span>Atención Clínica de Hoy</span>
              </h3>
              <p className="card-subtitle">Consultas programadas y pacientes en sala de espera</p>
            </div>

            {/* Quick Table Sub-Tabs */}
            <div style={{ display: 'flex', background: 'var(--bg-subtle)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <button
                type="button"
                className={`btn btn-sm ${tableFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                style={{ border: 'none', padding: '4px 10px', fontSize: '0.76rem' }}
                onClick={() => setTableFilter('all')}
              >
                Todos ({totalAppointmentsToday})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${tableFilter === 'en_sala' ? 'btn-primary' : 'btn-outline'}`}
                style={{ border: 'none', padding: '4px 10px', fontSize: '0.76rem' }}
                onClick={() => setTableFilter('en_sala')}
              >
                En Sala ({inWaitingRoomCount})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${tableFilter === 'atendido' ? 'btn-primary' : 'btn-outline'}`}
                style={{ border: 'none', padding: '4px 10px', fontSize: '0.76rem' }}
                onClick={() => setTableFilter('atendido')}
              >
                Atendidos ({attendedCount})
              </button>
            </div>
          </div>

          {/* Appointments Table */}
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Horario</th>
                  <th>Paciente & Cobertura</th>
                  <th>Profesional / Sala</th>
                  <th>Motivo / Diagnóstico</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No hay pacientes en este filtro para la fecha seleccionada.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((app) => {
                    const isEnSala = app.status === 'en_sala';
                    const isAtendido = app.status === 'atendido';

                    return (
                      <tr
                        key={app.id}
                        style={{
                          background: isEnSala ? 'rgba(230, 248, 247, 0.4)' : '#ffffff',
                          transition: 'var(--transition)'
                        }}
                      >
                        {/* Time Column */}
                        <td>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--c-dark)' }}>
                            {app.time} hs
                          </div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {app.duration || 30} min
                          </span>
                        </td>

                        {/* Patient Column */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div
                              style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '50%',
                                background: isEnSala ? 'var(--c-primary)' : 'var(--bg-subtle)',
                                color: isEnSala ? '#ffffff' : 'var(--c-primary)',
                                fontWeight: 800,
                                fontSize: '0.78rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              {getInitials(app.patientName)}
                            </div>
                            <div>
                              <div
                                style={{ fontWeight: 800, color: 'var(--text-main)', cursor: 'pointer', fontSize: '0.9rem' }}
                                onClick={() => {
                                  const p = patients.find((pat) => pat.id === app.patientId);
                                  if (p) setSelectedPatientForDetail(p);
                                }}
                              >
                                {app.patientName}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                DNI {app.patientDni || '-'} • <strong style={{ color: 'var(--c-primary)' }}>{app.patientInsurance}</strong>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Doctor Column */}
                        <td>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                            {app.doctorName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--c-primary)', fontWeight: 600 }}>
                            {app.roomName}
                          </div>
                        </td>

                        {/* Reason / Diagnosis */}
                        <td>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-body)', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {app.reason || 'Consulta médica'}
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td>
                          <Badge variant={app.status}>{app.status}</Badge>
                        </td>

                        {/* Quick Action Button */}
                        <td style={{ textAlign: 'right' }}>
                          {isEnSala ? (
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              onClick={() => {
                                setConsultationPreloadData(app);
                                setIsNewConsultationModalOpen(true);
                              }}
                              title="Llamar al consultorio e iniciar Historia Clínica"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                            >
                              <PlayCircle size={14} />
                              Atender
                            </button>
                          ) : app.status === 'pendiente' || app.status === 'confirmado' ? (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline"
                              onClick={() => {
                                updateAppointmentStatus(app.id, 'en_sala');
                                addToast('Paciente en Sala', `${app.patientName} pasó a sala de espera.`, 'info');
                              }}
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                            >
                              En Sala
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <Check size={13} />
                              <span>Atendido</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: EXECUTIVE BI & PRODUCTIVITY SHORTCUTS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Quick Access Action Tiles */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Sparkles size={18} color="#076ABC" />
                <span>Atajos Clínicos & Módulos</span>
              </h3>
              <p className="card-subtitle">Acceso directo para agilizar la atención</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div
                className="quick-action-tile"
                onClick={() => setActiveTab('kinesio')}
              >
                <div className="stat-icon-box" style={{ width: '38px', height: '38px', flexShrink: 0 }}>
                  <Activity size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.84rem', color: 'var(--text-main)' }}>Kinesiología</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Planes & Boxes</div>
                </div>
              </div>

              <div
                className="quick-action-tile"
                onClick={() => setActiveTab('imaging')}
              >
                <div className="stat-icon-box" style={{ width: '38px', height: '38px', flexShrink: 0 }}>
                  <Eye size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.84rem', color: 'var(--text-main)' }}>Visor PACS</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>RX, TAC y RMN</div>
                </div>
              </div>

              <div
                className="quick-action-tile"
                onClick={() => setActiveTab('insurances')}
              >
                <div className="stat-icon-box" style={{ width: '38px', height: '38px', flexShrink: 0 }}>
                  <Shield size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.84rem', color: 'var(--text-main)' }}>Obras Sociales</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Autorizaciones</div>
                </div>
              </div>

              <div
                className="quick-action-tile"
                onClick={() => setActiveTab('communications')}
              >
                <div className="stat-icon-box" style={{ width: '38px', height: '38px', flexShrink: 0 }}>
                  <WhatsAppIcon size={18} color="#25D366" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.84rem', color: 'var(--text-main)' }}>WhatsApp API</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Recordatorios</div>
                </div>
              </div>

              <div
                className="quick-action-tile"
                onClick={() => setActiveTab('billing')}
              >
                <div className="stat-icon-box" style={{ width: '38px', height: '38px', flexShrink: 0 }}>
                  <CreditCard size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.84rem', color: 'var(--text-main)' }}>Facturación</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ARCA & Caja</div>
                </div>
              </div>

              <div
                className="quick-action-tile"
                onClick={() => setActiveTab('agenda')}
              >
                <div className="stat-icon-box" style={{ width: '38px', height: '38px', flexShrink: 0 }}>
                  <Calendar size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.84rem', color: 'var(--text-main)' }}>Turnero</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Agenda Médica</div>
                </div>
              </div>
            </div>
          </div>

          {/* Specialty Traumatology Distribution Chart */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Distribución por Especialidad</h3>
              <p className="card-subtitle">Volumen de demanda traumatológica semanal</p>
            </div>
            <div style={{ height: '175px', display: 'flex', justifyContent: 'center' }}>
              <Doughnut
                data={specialtyDistributionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        boxWidth: 12,
                        font: { size: 10, weight: 700 }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
