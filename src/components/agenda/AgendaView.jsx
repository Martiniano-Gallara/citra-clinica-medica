import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { getTodayArgentina, addDays } from '../../utils/dateUtils';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Lock,
  Search,
  Filter,
  User,
  Users,
  Clock,
  MapPin,
  CheckCircle2,
  Stethoscope,
  Grid,
  Columns,
  CalendarDays,
  List,
  PlayCircle,
  MessageSquare,
  Sparkles,
  DollarSign,
  AlertCircle,
  Eye,
  CheckCheck,
  Building2,
  Activity,
  Phone,
  Layers,
  ArrowUpDown,
  Send,
  Printer,
  Check
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { AppointmentModal } from './AppointmentModal';
import { BlockTimeModal } from './BlockTimeModal';

export const AgendaView = () => {
  const {
    appointments,
    doctors,
    specialties,
    rooms,
    filterDoctor,
    setFilterDoctor,
    filterSpecialty,
    setFilterSpecialty,
    filterDate,
    setFilterDate,
    updateAppointmentStatus,
    setIsAppointmentModalOpen,
    setAppointmentModalData,
    setIsBlockTimeModalOpen,
    setIsNewConsultationModalOpen,
    setConsultationPreloadData,
    setSelectedPatientForDetail,
    sendWhatsAppReminder,
    patients,
    addToast
  } = useClinic();

  const [viewMode, setViewMode] = useState('list'); // 'list', 'grid', 'rooms', 'week', 'month'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'en_sala', 'confirmado', 'pendiente', 'atendido'
  const [searchQuery, setSearchQuery] = useState('');

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00'
  ];

  // Filtered doctors
  const visibleDoctors = doctors
    .filter((d) => (filterSpecialty === 'all' ? true : d.specialtyId === filterSpecialty))
    .filter((d) => (filterDoctor === 'all' ? true : d.id === filterDoctor));

  // Date Navigation
  const handlePrevDay = () => {
    setFilterDate(addDays(filterDate, -1));
  };

  const handleNextDay = () => {
    setFilterDate(addDays(filterDate, 1));
  };

  const handleToday = () => {
    setFilterDate(getTodayArgentina());
  };

  // Date label in Spanish
  const formatDateHeader = (dateStr) => {
    try {
      const parts = dateStr.split('-');
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      const formatted = d.toLocaleDateString('es-AR', options);
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    } catch {
      return dateStr;
    }
  };

  // High-volume filtered appointments for the current date & search query
  const todayAppointments = appointments.filter((a) => a.date === filterDate);

  const filteredAppointments = todayAppointments.filter((app) => {
    const matchDoctor = filterDoctor === 'all' ? true : app.doctorId === filterDoctor;
    const matchSpecialty = filterSpecialty === 'all' ? true : app.specialtyId === filterSpecialty;
    const matchStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'pendiente'
        ? app.status === 'pendiente' || app.status === 'confirmado'
        : app.status === statusFilter;

    const cleanQ = searchQuery.toLowerCase().trim();
    const matchSearch =
      cleanQ === '' ||
      app.patientName.toLowerCase().includes(cleanQ) ||
      (app.patientDni && app.patientDni.includes(cleanQ)) ||
      app.doctorName.toLowerCase().includes(cleanQ) ||
      app.patientInsurance.toLowerCase().includes(cleanQ) ||
      (app.reason && app.reason.toLowerCase().includes(cleanQ));

    return matchDoctor && matchSpecialty && matchStatus && matchSearch;
  });

  // KPIs
  const totalCount = todayAppointments.length;
  const inWaitingRoomCount = todayAppointments.filter((a) => a.status === 'en_sala').length;
  const attendedCount = todayAppointments.filter((a) => a.status === 'atendido').length;
  const confirmedCount = todayAppointments.filter((a) => a.status === 'confirmado').length;
  const pendingCount = todayAppointments.filter((a) => a.status === 'pendiente').length;
  const totalCopayCollected = todayAppointments.reduce((acc, curr) => acc + (curr.isPaid ? curr.copayAmount || 0 : 0), 0);

  const getInitials = (name) => {
    if (!name) return 'PT';
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleSlotClick = (doctor, time) => {
    setAppointmentModalData({
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialtyId: doctor.specialtyId,
      specialtyName: doctor.specialtyName,
      roomId: doctor.roomId,
      roomName: doctor.roomName,
      date: filterDate,
      time: time,
      duration: doctor.slotDuration || 30,
      status: 'confirmado',
      reason: '',
      copayAmount: 0,
      isPaid: false,
      paymentMethod: 'Pendiente',
      notes: ''
    });
    setIsAppointmentModalOpen(true);
  };

  const handleCallToConsultation = (app) => {
    setConsultationPreloadData(app);
    setIsNewConsultationModalOpen(true);
  };

  return (
    <div className="view-container">
      {/* Global Modals */}
      <AppointmentModal />
      <BlockTimeModal />

      {/* 1. TOP HEADER WITH MEDICAL CONTEXT */}
      <div className="view-header" style={{ marginBottom: '1.25rem' }}>
        <div>
          <div className="badge-wrapper" style={{ marginBottom: '0.35rem' }}>
            <span className="badge badge-teal">
              <Sparkles size={13} style={{ marginRight: '4px' }} />
              Turnero de Alta Demanda & Gestión de Flujo de Pacientes
            </span>
          </div>
          <h1 className="view-title">Agenda Médica & Turnos</h1>
          <p className="view-subtitle">
            Planificación diaria multiconsultorio, recepción de pacientes en tiempo real y confirmaciones automáticas.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setIsBlockTimeModalOpen(true)}
          >
            <Lock size={16} />
            Bloquear Franja
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setAppointmentModalData(null);
              setIsAppointmentModalOpen(true);
            }}
          >
            <Plus size={18} />
            + Nuevo Turno
          </button>
        </div>
      </div>

      {/* 2. OPERATIONAL KPI BENTO STRIP (High-Volume Metrics) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}
      >
        {/* KPI 1: Total Today */}
        <div className="stat-card-premium" style={{ padding: '1.15rem 1.25rem' }}>
          <div className="stat-card-top">
            <span className="stat-card-label">Turnos del Día</span>
            <div className="stat-icon-box" style={{ width: '38px', height: '38px' }}>
              <CalendarIcon size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <div className="stat-card-value">{totalCount}</div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {attendedCount} atendidos
            </span>
          </div>
          <div style={{ width: '100%', height: '5px', background: 'var(--bg-subtle)', borderRadius: '10px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${totalCount > 0 ? (attendedCount / totalCount) * 100 : 0}%`,
                height: '100%',
                background: 'var(--c-primary)',
                borderRadius: '10px'
              }}
            />
          </div>
        </div>

        {/* KPI 2: Waiting Room */}
        <div className="stat-card-premium" style={{ borderLeft: '4px solid var(--c-primary)', padding: '1.15rem 1.25rem' }}>
          <div className="stat-card-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="pulse-dot" />
              <span className="stat-card-label" style={{ color: 'var(--c-primary)' }}>En Sala de Espera</span>
            </div>
            <div className="stat-icon-box" style={{ width: '38px', height: '38px', background: '#EBF3FD', color: 'var(--c-primary)' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <div className="stat-card-value" style={{ color: 'var(--c-dark)' }}>{inWaitingRoomCount}</div>
            <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700 }}>
              Demora prom: 8 min
            </span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Listos para llamar a consultorio
          </div>
        </div>

        {/* KPI 3: Pendientes y Confirmados */}
        <div className="stat-card-premium" style={{ padding: '1.15rem 1.25rem' }}>
          <div className="stat-card-top">
            <span className="stat-card-label">Por Llegar / Pendientes</span>
            <div className="stat-icon-box" style={{ width: '38px', height: '38px' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <div className="stat-card-value">{confirmedCount + pendingCount}</div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {confirmedCount} confirmados WhatsApp
            </span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            {pendingCount} pendientes de check-in
          </div>
        </div>

        {/* KPI 4: Recaudación de Copagos en Recepción */}
        <div className="stat-card-premium" style={{ padding: '1.15rem 1.25rem' }}>
          <div className="stat-card-top">
            <span className="stat-card-label">Copagos en Recepción</span>
            <div className="stat-icon-box" style={{ width: '38px', height: '38px', background: '#d1fae5', color: '#065f46' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <div className="stat-card-value" style={{ color: '#065f46' }}>
              ${totalCopayCollected.toLocaleString()}
            </div>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Cobranzas con CAE ARCA / MP QR
          </div>
        </div>
      </div>

      {/* 3. MULTI-CONTROL TOOLBAR (Date, Instant Search, View Switcher & Filters) */}
      <div
        className="card"
        style={{
          padding: '0.85rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          border: '1px solid var(--border-color)'
        }}
      >
        {/* Left: Date Navigator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '2px', border: '1px solid var(--border-color)' }}>
            <button
              type="button"
              className="btn btn-sm"
              style={{ padding: '0.35rem 0.55rem', border: 'none', color: 'var(--c-dark)' }}
              onClick={handlePrevDay}
              title="Día anterior"
            >
              <ChevronLeft size={17} />
            </button>
            <input
              type="date"
              className="form-input"
              style={{
                width: '140px',
                border: 'none',
                background: 'transparent',
                fontWeight: 800,
                color: 'var(--c-dark)',
                fontSize: '0.85rem',
                textAlign: 'center',
                padding: '0.2rem'
              }}
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-sm"
              style={{ padding: '0.35rem 0.55rem', border: 'none', color: 'var(--c-dark)' }}
              onClick={handleNextDay}
              title="Día siguiente"
            >
              <ChevronRight size={17} />
            </button>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ fontWeight: 800, borderColor: 'var(--c-primary)', color: 'var(--c-primary)' }}
            onClick={handleToday}
          >
            Hoy
          </button>

          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', marginLeft: '4px' }}>
            {formatDateHeader(filterDate)}
          </span>
        </div>

        {/* Center: Instant Search for High Volume */}
        <div style={{ flex: 1, maxWidth: '340px', position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '32px', fontSize: '0.84rem', width: '100%', height: '36px' }}
            placeholder="Buscar por paciente, DNI, médico u obra social..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Right: View Mode Selector */}
        <div
          style={{
            display: 'inline-flex',
            background: 'var(--bg-subtle)',
            padding: '3px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)'
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode('list')}
            style={{
              padding: '6px 11px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: viewMode === 'list' ? 800 : 600,
              background: viewMode === 'list' ? '#ffffff' : 'transparent',
              color: viewMode === 'list' ? 'var(--c-primary)' : 'var(--text-muted)',
              boxShadow: viewMode === 'list' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <List size={15} />
            <span>Lista Rápida</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('grid')}
            style={{
              padding: '6px 11px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: viewMode === 'grid' ? 800 : 600,
              background: viewMode === 'grid' ? '#ffffff' : 'transparent',
              color: viewMode === 'grid' ? 'var(--c-primary)' : 'var(--text-muted)',
              boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Columns size={15} />
            <span>Por Médico</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('rooms')}
            style={{
              padding: '6px 11px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: viewMode === 'rooms' ? 800 : 600,
              background: viewMode === 'rooms' ? '#ffffff' : 'transparent',
              color: viewMode === 'rooms' ? 'var(--c-primary)' : 'var(--text-muted)',
              boxShadow: viewMode === 'rooms' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Building2 size={15} />
            <span>Salas & Boxes</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('week')}
            style={{
              padding: '6px 11px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: viewMode === 'week' ? 800 : 600,
              background: viewMode === 'week' ? '#ffffff' : 'transparent',
              color: viewMode === 'week' ? 'var(--c-primary)' : 'var(--text-muted)',
              boxShadow: viewMode === 'week' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Grid size={15} />
            <span>Semana</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('month')}
            style={{
              padding: '6px 11px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: viewMode === 'month' ? 800 : 600,
              background: viewMode === 'month' ? '#ffffff' : 'transparent',
              color: viewMode === 'month' ? 'var(--c-primary)' : 'var(--text-muted)',
              boxShadow: viewMode === 'month' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <CalendarDays size={15} />
            <span>Mes</span>
          </button>
        </div>
      </div>

      {/* 4. VIEW MODE 1: HIGH-VOLUME OPERATIONAL LIST (Flujo Rápido de Recepción & Consultorios) */}
      {viewMode === 'list' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          {/* Sub Filter Chips Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--border-subtle)',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: `Todos los Turnos (${todayAppointments.length})` },
                { id: 'en_sala', label: `En Sala de Espera (${inWaitingRoomCount})`, badge: true },
                { id: 'pendiente', label: `Pendientes / Por Llegar (${confirmedCount + pendingCount})` },
                { id: 'atendido', label: `Atendidos (${attendedCount})` }
              ].map((tab) => {
                const isActive = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '20px',
                      border: isActive ? '1px solid var(--c-primary)' : '1px solid var(--border-color)',
                      background: isActive ? 'var(--c-primary)' : '#ffffff',
                      color: isActive ? '#ffffff' : 'var(--text-main)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'var(--transition)'
                    }}
                  >
                    {tab.badge && <span className="pulse-dot" style={{ width: '7px', height: '7px' }} />}
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select
                className="form-select"
                style={{ width: '170px', fontSize: '0.78rem', padding: '0.35rem 0.6rem' }}
                value={filterDoctor}
                onChange={(e) => setFilterDoctor(e.target.value)}
              >
                <option value="all">Todos los Médicos</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              <select
                className="form-select"
                style={{ width: '160px', fontSize: '0.78rem', padding: '0.35rem 0.6rem' }}
                value={filterSpecialty}
                onChange={(e) => setFilterSpecialty(e.target.value)}
              >
                <option value="all">Especialidades</option>
                {specialties.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* High-Volume Table */}
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>Horario</th>
                  <th>Paciente / Identificación</th>
                  <th>Profesional & Consultorio</th>
                  <th>Motivo / Diagnóstico</th>
                  <th>Cobertura & Pago</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones Rápidas</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      <Clock size={32} color="var(--c-accent)" style={{ marginBottom: '0.5rem' }} />
                      <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>No se encontraron turnos con los filtros actuales</div>
                      <p style={{ fontSize: '0.82rem', marginTop: '2px' }}>Prueba cambiando la fecha o limpiando la búsqueda.</p>
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
                          background: isEnSala ? 'rgba(230, 248, 247, 0.45)' : '#ffffff',
                          borderLeft: isEnSala ? '4px solid var(--c-primary)' : '4px solid transparent'
                        }}
                      >
                        {/* Time Column */}
                        <td>
                          <div style={{ fontWeight: 900, fontSize: '0.96rem', color: 'var(--c-dark)' }}>
                            {app.time} hs
                          </div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            {app.duration || 30} min
                          </span>
                        </td>

                        {/* Patient Column */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: isEnSala ? 'var(--c-primary)' : 'var(--bg-subtle)',
                                color: isEnSala ? '#ffffff' : 'var(--c-primary)',
                                fontWeight: 800,
                                fontSize: '0.8rem',
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
                                DNI: <strong>{app.patientDni || '-'}</strong> · Tel: {app.patientPhone || '-'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Professional & Room */}
                        <td>
                          <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-main)' }}>
                            {app.doctorName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--c-primary)', fontWeight: 700 }}>
                            {app.roomName} · {app.specialtyName?.split(' ')[0]}
                          </div>
                        </td>

                        {/* Reason / Diagnosis */}
                        <td>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-body)', maxWidth: '210px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {app.reason || 'Consulta médica programada'}
                          </div>
                          {app.notes && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              Nota: {app.notes}
                            </div>
                          )}
                        </td>

                        {/* Coverage & Copay */}
                        <td>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--c-dark)' }}>
                            {app.patientInsurance}
                          </span>
                          <div style={{ fontSize: '0.72rem', color: app.isPaid ? '#059669' : '#d97706', fontWeight: 700 }}>
                            {app.isPaid ? `Copago $${app.copayAmount || 0}` : 'Pendiente cobro'}
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td>
                          <Badge variant={app.status}>{app.status}</Badge>
                        </td>

                        {/* Action Buttons */}
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '5px', alignItems: 'center' }}>
                            {isEnSala ? (
                              <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                onClick={() => handleCallToConsultation(app)}
                                title="Llamar al consultorio e iniciar Historia Clínica"
                                style={{ padding: '4px 9px', fontSize: '0.76rem' }}
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
                                  addToast('Paciente en Sala', `${app.patientName} registrado en recepción.`, 'info');
                                }}
                                style={{ padding: '4px 9px', fontSize: '0.76rem', borderColor: 'var(--c-primary)', color: 'var(--c-primary)' }}
                                title="Registrar llegada en recepción"
                              >
                                En Sala
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.76rem', color: '#059669', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <Check size={13} />
                                <span>Atendido</span>
                              </span>
                            )}

                            {/* WhatsApp Reminder Quick Button */}
                            <button
                              type="button"
                              className="btn btn-sm btn-outline"
                              style={{ padding: '4px 6px', color: '#059669', borderColor: '#a7f3d0' }}
                              onClick={() => {
                                sendWhatsAppReminder(app.id);
                                addToast('WhatsApp Enviado', `Recordatorio enviado a ${app.patientName}`, 'success');
                              }}
                              title="Enviar recordatorio WhatsApp"
                            >
                              <Send size={13} />
                            </button>

                            {/* Edit / View Details */}
                            <button
                              type="button"
                              className="btn btn-sm btn-outline"
                              style={{ padding: '4px 6px' }}
                              onClick={() => {
                                setAppointmentModalData(app);
                                setIsAppointmentModalOpen(true);
                              }}
                              title="Editar / Ver ficha del turno"
                            >
                              <Eye size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. VIEW MODE 2: MULTI-DOCTOR MATRIX (Compact Time Columns) */}
      {viewMode === 'grid' && (
        <div
          className="card"
          style={{
            padding: '1.25rem',
            overflowX: 'auto',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <div style={{ minWidth: `${Math.max(880, visibleDoctors.length * 270 + 80)}px` }}>
            {/* Header: Doctors Column Badges */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `85px repeat(${visibleDoctors.length}, minmax(260px, 1fr))`,
                borderBottom: '2px solid var(--border-color)',
                paddingBottom: '0.85rem',
                gap: '12px',
                position: 'sticky',
                top: 0,
                background: '#ffffff',
                zIndex: 10
              }}
            >
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                Franja
              </div>

              {visibleDoctors.map((doc) => {
                const docTodayApps = appointments.filter(
                  (a) => a.doctorId === doc.id && a.date === filterDate && a.status !== 'cancelado'
                );
                return (
                  <div
                    key={doc.id}
                    style={{
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-color)',
                      borderTop: `4px solid ${doc.color || 'var(--c-primary)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '0.65rem 0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
                      <img
                        src={doc.avatar}
                        alt={doc.name}
                        style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ffffff' }}
                      />
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                          {doc.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--c-primary)', fontWeight: 600 }}>
                          {doc.specialtyName}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span className="badge badge-teal" style={{ fontSize: '0.72rem' }}>
                        {docTodayApps.length} turnos
                      </span>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {doc.roomName}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Time Grid Matrix */}
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: '0.5rem' }}>
              {timeSlots.map((time, tIdx) => {
                const isHalfHour = time.endsWith(':30');
                return (
                  <div
                    key={time}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `85px repeat(${visibleDoctors.length}, minmax(260px, 1fr))`,
                      borderBottom: isHalfHour ? '1px dashed var(--border-subtle)' : '1px solid var(--border-color)',
                      minHeight: '74px',
                      gap: '12px',
                      padding: '4px 0',
                      background: tIdx % 4 === 0 ? 'rgba(245, 248, 254, 0.4)' : 'transparent'
                    }}
                  >
                    {/* Time Label */}
                    <div
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        color: 'var(--text-muted)',
                        paddingTop: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start'
                      }}
                    >
                      <span style={{ color: 'var(--c-dark)' }}>{time} hs</span>
                    </div>

                    {/* Doctor Slot Cells */}
                    {visibleDoctors.map((doc) => {
                      const app = appointments.find(
                        (a) =>
                          a.doctorId === doc.id &&
                          a.date === filterDate &&
                          a.time === time &&
                          a.status !== 'cancelado'
                      );

                      const isBlocked = app?.patientId === 'block';

                      if (app) {
                        const isEnSala = app.status === 'en_sala';
                        const isAtendido = app.status === 'atendido';
                        const isConfirmado = app.status === 'confirmado';

                        return (
                          <div
                            key={doc.id}
                            onClick={() => {
                              setAppointmentModalData(app);
                              setIsAppointmentModalOpen(true);
                            }}
                            style={{
                              background: isBlocked
                                ? '#f8fafc'
                                : isEnSala
                                ? 'linear-gradient(135deg, #e6f8f7 0%, #ffffff 100%)'
                                : isAtendido
                                ? '#f0fdf4'
                                : '#ffffff',
                              border: `1px solid ${
                                isEnSala
                                  ? 'var(--c-primary)'
                                  : isAtendido
                                  ? '#86efac'
                                  : 'var(--border-color)'
                              }`,
                              borderLeft: `5px solid ${
                                isEnSala
                                  ? 'var(--c-primary)'
                                  : isAtendido
                                  ? '#16a34a'
                                  : isConfirmado
                                  ? 'var(--c-accent)'
                                  : '#f59e0b'
                              }`,
                              borderRadius: 'var(--radius-sm)',
                              padding: '0.6rem 0.75rem',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              boxShadow: isEnSala ? '0 4px 12px rgba(7, 106, 188, 0.15)' : 'var(--shadow-sm)',
                              transition: 'var(--transition)'
                            }}
                            className="hover-subtle"
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                                  {app.patientName}
                                </span>
                                <Badge variant={app.status}>{app.status}</Badge>
                              </div>

                              <div style={{ fontSize: '0.76rem', color: 'var(--text-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {app.reason || 'Consulta traumatológica'}
                              </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.72rem', color: 'var(--text-muted)', paddingTop: '4px', borderTop: '1px solid rgba(210, 227, 252, 0.5)' }}>
                              <span style={{ fontWeight: 600 }}>{app.patientInsurance}</span>
                              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                {isEnSala && (
                                  <button
                                    type="button"
                                    className="btn btn-primary"
                                    style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCallToConsultation(app);
                                    }}
                                    title="Llamar a consultorio"
                                  >
                                    <PlayCircle size={12} />
                                    Llamar
                                  </button>
                                )}
                                {app.status === 'pendiente' && (
                                  <button
                                    type="button"
                                    className="btn btn-outline"
                                    style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateAppointmentStatus(app.id, 'en_sala');
                                      addToast('Paciente en Sala', `${app.patientName} registrado en recepción.`, 'info');
                                    }}
                                  >
                                    En Sala
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // Empty Slot (Clean & Clickable)
                      return (
                        <div
                          key={doc.id}
                          onClick={() => handleSlotClick(doc, time)}
                          style={{
                            borderRadius: '6px',
                            border: '1px dashed var(--border-color)',
                            background: 'rgba(255, 255, 255, 0.6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--text-subtle)',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            transition: 'var(--transition)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--c-primary)';
                            e.currentTarget.style.background = 'var(--primary-light)';
                            e.currentTarget.style.color = 'var(--c-primary)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                            e.currentTarget.style.color = 'var(--text-subtle)';
                          }}
                        >
                          <span>+ Agendar</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 6. VIEW MODE 3: SALAS & BOXES DE REHABILITACIÓN */}
      {viewMode === 'rooms' && (
        <div
          className="card"
          style={{
            padding: '1.25rem',
            overflowX: 'auto',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <div style={{ minWidth: `${rooms.length * 260 + 80}px` }}>
            {/* Rooms Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `85px repeat(${rooms.length}, minmax(240px, 1fr))`,
                borderBottom: '2px solid var(--border-color)',
                paddingBottom: '0.85rem',
                gap: '12px'
              }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Hora
              </div>
              {rooms.map((room) => (
                <div
                  key={room.id}
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    borderTop: '4px solid var(--c-primary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.65rem 0.85rem'
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                    {room.name.split('—')[0]}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--c-primary)', fontWeight: 600 }}>
                    {room.specialty} • {room.floor}
                  </div>
                </div>
              ))}
            </div>

            {/* Matrix by Room */}
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: '0.5rem' }}>
              {timeSlots.map((time) => (
                <div
                  key={time}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `85px repeat(${rooms.length}, minmax(240px, 1fr))`,
                    borderBottom: '1px solid var(--border-subtle)',
                    minHeight: '68px',
                    gap: '12px',
                    padding: '4px 0'
                  }}
                >
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--c-dark)', paddingTop: '8px' }}>
                    {time} hs
                  </div>

                  {rooms.map((room) => {
                    const app = appointments.find(
                      (a) => a.roomId === room.id && a.date === filterDate && a.time === time && a.status !== 'cancelado'
                    );

                    if (app) {
                      return (
                        <div
                          key={room.id}
                          onClick={() => {
                            setAppointmentModalData(app);
                            setIsAppointmentModalOpen(true);
                          }}
                          style={{
                            background: '#ffffff',
                            border: '1px solid var(--border-color)',
                            borderLeft: '4px solid var(--c-primary)',
                            borderRadius: '6px',
                            padding: '0.5rem 0.65rem',
                            cursor: 'pointer',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                        >
                          <div style={{ fontWeight: 800, fontSize: '0.84rem', color: 'var(--text-main)' }}>
                            {app.patientName}
                          </div>
                          <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                            {app.doctorName}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={room.id}
                        style={{
                          borderRadius: '6px',
                          border: '1px dashed var(--border-subtle)',
                          background: 'rgba(255, 255, 255, 0.4)'
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. VIEW MODE 4: WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.75rem', minWidth: '850px', overflowX: 'auto' }}>
            {[
              { label: 'Lun 24', dateKey: '2026-08-24' },
              { label: 'Mar 25', dateKey: '2026-08-25' },
              { label: 'Mié 26', dateKey: '2026-08-26' },
              { label: 'Jue 27', dateKey: '2026-08-27' },
              { label: 'Vie 28 (Hoy)', dateKey: '2026-08-28' },
              { label: 'Sáb 29', dateKey: '2026-08-29' },
              { label: 'Dom 30', dateKey: '2026-08-30' }
            ].map(({ label, dateKey }, idx) => {
              const dayApps = appointments.filter((a) => a.date === dateKey);
              const isToday = dateKey === '2026-08-28';

              return (
                <div
                  key={idx}
                  style={{
                    background: isToday ? 'var(--primary-light)' : 'var(--bg-subtle)',
                    border: isToday ? '2px solid var(--c-primary)' : '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem',
                    minHeight: '400px'
                  }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      color: isToday ? 'var(--c-primary)' : 'var(--text-main)',
                      marginBottom: '0.75rem',
                      textAlign: 'center',
                      paddingBottom: '0.4rem',
                      borderBottom: '1px solid var(--border-color)'
                    }}
                  >
                    {label}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {dayApps.map((app) => (
                      <div
                        key={app.id}
                        onClick={() => {
                          setAppointmentModalData(app);
                          setIsAppointmentModalOpen(true);
                        }}
                        style={{
                          background: '#ffffff',
                          padding: '0.55rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          borderLeft: '3px solid var(--c-primary)',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        <div style={{ fontWeight: 800, color: 'var(--c-primary)' }}>{app.time} hs</div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{app.patientName}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{app.doctorName}</div>
                      </div>
                    ))}

                    {dayApps.length === 0 && (
                      <div style={{ textAlign: 'center', color: 'var(--text-subtle)', fontSize: '0.76rem', paddingTop: '2rem' }}>
                        Sin turnos
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 8. VIEW MODE 5: MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.25rem', fontWeight: 900, fontSize: '1.2rem', color: 'var(--text-main)' }}>
            Agosto 2026
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((d) => (
              <div key={d} style={{ textAlign: 'center', fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.5rem', textTransform: 'uppercase' }}>
                {d}
              </div>
            ))}

            {Array.from({ length: 31 }, (_, i) => {
              const dayNum = i + 1;
              const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
              const dateKey = `2026-08-${formattedDay}`;
              const count = appointments.filter((a) => a.date === dateKey).length;
              const isToday = dayNum === 28;

              return (
                <div
                  key={dayNum}
                  onClick={() => {
                    setFilterDate(dateKey);
                    setViewMode('list');
                  }}
                  style={{
                    height: '85px',
                    border: isToday ? '2px solid var(--c-primary)' : '1px solid var(--border-color)',
                    background: isToday ? 'var(--primary-light)' : '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'var(--transition)'
                  }}
                  className="hover-subtle"
                >
                  <span style={{ fontWeight: isToday ? 900 : 700, fontSize: '0.9rem', color: isToday ? 'var(--c-primary)' : 'var(--text-main)' }}>
                    {dayNum}
                  </span>

                  {count > 0 ? (
                    <span
                      style={{
                        fontSize: '0.74rem',
                        background: 'var(--c-primary)',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 800,
                        alignSelf: 'flex-start'
                      }}
                    >
                      {count} turnos
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Disponible</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
