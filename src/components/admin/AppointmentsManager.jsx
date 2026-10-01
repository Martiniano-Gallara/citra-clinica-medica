import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { getTodayArgentina, addDays } from '../../utils/dateUtils';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertCircle,
  Eye,
  Building2,
  Phone,
  MessageSquare,
  Stethoscope,
  X,
  Trash2,
  Send,
  User,
  ChevronDown,
  ChevronUp,
  FileText,
  CreditCard,
  Shield,
  Bell
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

export const AppointmentsManager = () => {
  const {
    appointments,
    scopedAppointments,
    isDoctor,
    currentDoctor,
    updateAppointmentStatus,
    cancelAppointment,
    deleteAppointment,
    addAppointment,
    doctors,
    consultations,
    patients,
    setSelectedConsultationForPrint,
    setSelectedPatientForDetail,
    setIsNewConsultationModalOpen,
    setConsultationPreloadData,
    sendWhatsAppReminder,
    addToast
  } = useClinic();

  // Selected date (defaults to today's date dynamically, with full navigation)
  const todayIso = getTodayArgentina();
  const [selectedDate, setSelectedDate] = useState(todayIso);
  // Status filter pill: 'all', 'en_sala', 'pendientes', 'atendidos'
  const [statusFilter, setStatusFilter] = useState('all');
  // Instant search input
  const [searchQuery, setSearchQuery] = useState('');
  // Expanded appointment ID for accordion details
  const [expandedAppointmentId, setExpandedAppointmentId] = useState(null);

  // Doctor filter for administrative reception
  const [doctorFilter, setDoctorFilter] = useState('all');

  // Manual appointment modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualDoctorId, setManualDoctorId] = useState(doctors[0]?.id || '');
  const [manualPatientName, setManualPatientName] = useState('');
  const [manualPatientDni, setManualPatientDni] = useState('');
  const [manualPatientPhone, setManualPatientPhone] = useState('');
  const [manualPatientInsurance, setManualPatientInsurance] = useState('Particular');
  const [manualTime, setManualTime] = useState('09:00');
  const [manualReason, setManualReason] = useState('Consulta traumatológica');

  // Strict data scoping: Doctor ONLY sees their own appointments, Administrative sees all or filtered by doctor
  const effectiveAppointments = useMemo(() => {
    if (isDoctor && currentDoctor) {
      return scopedAppointments.filter((a) => a.doctorId === currentDoctor.id);
    }
    if (doctorFilter !== 'all') {
      const targetDoc = doctors.find((d) => d.id === doctorFilter);
      return appointments.filter(
        (a) =>
          a.doctorId === doctorFilter ||
          (a.doctorName && targetDoc?.name && a.doctorName.toLowerCase().includes(targetDoc.name.toLowerCase()))
      );
    }
    return appointments;
  }, [isDoctor, currentDoctor, scopedAppointments, appointments, doctorFilter, doctors]);

  // Appointments on selected date
  const dateAppointments = useMemo(() => {
    return effectiveAppointments.filter((a) => a.date === selectedDate);
  }, [effectiveAppointments, selectedDate]);

  // Operational KPIs for the selected date
  const totalCount = dateAppointments.length;
  const attendedCount = dateAppointments.filter((a) => a.status === 'atendido').length;
  const pendingCount = dateAppointments.filter((a) => a.status !== 'atendido' && a.status !== 'cancelado').length;

  // Filtered appointments based on search and status pill
  const filteredAppointments = useMemo(() => {
    return dateAppointments.filter((app) => {
      // Status pill match
      if (statusFilter === 'pendientes' && (app.status === 'atendido' || app.status === 'cancelado')) return false;
      if (statusFilter === 'atendidos' && app.status !== 'atendido') return false;

      // Search query match
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchesPatient = app.patientName?.toLowerCase().includes(q);
        const matchesDni = app.patientDni?.includes(q);
        const matchesInsurance = (app.patientInsurance || app.healthInsurance)?.toLowerCase().includes(q);
        const matchesReason = app.reason?.toLowerCase().includes(q);
        if (!matchesPatient && !matchesDni && !matchesInsurance && !matchesReason) {
          return false;
        }
      }

      return true;
    });
  }, [dateAppointments, statusFilter, searchQuery]);

  // Date Navigation handlers
  const handlePrevDay = () => {
    setSelectedDate(addDays(selectedDate, -1));
  };

  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const handleToday = () => {
    setSelectedDate(todayIso);
  };

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

  const getInitials = (name) => {
    if (!name) return 'PT';
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Toggle patient detail accordion
  const toggleExpand = (appId) => {
    setExpandedAppointmentId((prev) => (prev === appId ? null : appId));
  };

  // View Existing Consultation / Medical Record strictly for this appointment
  const handleViewConsultation = (app) => {
    const exactCons = (consultations || []).find(
      (c) => c.appointmentId === app.id
    );
    if (exactCons && setSelectedConsultationForPrint) {
      setSelectedConsultationForPrint(exactCons);
      addToast('Historia Clínica', `Abriendo registro de consulta de ${app.patientName} vinculado a este turno.`, 'info');
      return;
    }

    // Fallback strictly for the same patient and same doctor on the exact same date if created without appointmentId
    const sameDateCons = (consultations || []).find(
      (c) =>
        (c.patientId === app.patientId || c.patientDni === app.patientDni) &&
        c.date === app.date &&
        (c.doctorId === app.doctorId || !app.doctorId)
    );
    if (sameDateCons && setSelectedConsultationForPrint) {
      setSelectedConsultationForPrint(sameDateCons);
      addToast('Historia Clínica', `Abriendo consulta de ${app.patientName} correspondiente a la fecha del turno.`, 'info');
      return;
    }

    addToast(
      'Sin Consulta Registrada',
      `Este turno de ${app.patientName} no tiene una consulta asentada aún. Puede registrar la consulta correspondiente presionando "Atender".`,
      'warning'
    );
  };

  // Call / Start Consultation Action (Only for pending / in room appointments)
  const handleStartConsultation = (app) => {
    // If appointment is already attended, view existing record instead of creating a duplicate
    if (app.status === 'atendido') {
      handleViewConsultation(app);
      return;
    }

    if (setIsNewConsultationModalOpen && setConsultationPreloadData) {
      setConsultationPreloadData({
        appointmentId: app.id,
        patientId: app.patientId,
        patientName: app.patientName,
        patientDni: app.patientDni,
        doctorId: app.doctorId,
        doctorName: app.doctorName,
        reason: app.reason || 'Consulta programada'
      });
      setIsNewConsultationModalOpen(true);
      const hasExistingHC = (consultations || []).some(
        (c) => c.patientId === app.patientId || c.patientDni === app.patientDni
      );
      addToast(
        hasExistingHC ? 'Evolución Médica' : 'Consulta Médica',
        hasExistingHC
          ? `Atendiendo a ${app.patientName} — Registrando nueva evolución en su Historia Clínica.`
          : `Iniciando consulta para ${app.patientName}.`,
        'info'
      );
    } else {
      updateAppointmentStatus(app.id, 'atendido');
      addToast('Paciente Atendido', `${app.patientName} marcado como atendido.`, 'success');
    }
  };

  // Call patient to room
  const handleCallToRoom = (app) => {
    updateAppointmentStatus(app.id, 'en_sala');
    addToast('Llamado a Paciente', `Notificación enviada a recepción: ${app.patientName} pase a atención.`, 'success');
  };

  // Create manual appointment
  const handleCreateManualAppointment = (e) => {
    e.preventDefault();
    if (!manualPatientName.trim() || !manualPatientDni.trim()) {
      addToast('Datos incompletos', 'Ingrese nombre y DNI del paciente.', 'warning');
      return;
    }

    const assignedDoc = isDoctor && currentDoctor
      ? currentDoctor
      : (doctors.find((d) => d.id === manualDoctorId) || doctors[0]);

    if (!assignedDoc) {
      addToast('Profesional requerido', 'Debe seleccionar un profesional médico.', 'warning');
      return;
    }

    const duration = assignedDoc.slotDuration || 30;
    const [h, m] = (manualTime || '10:00').split(':').map(Number);
    const startMins = h * 60 + m;
    const endMins = startMins + duration;

    const hasCollision = appointments.some((a) => {
      if (a.doctorId !== assignedDoc.id || a.date !== selectedDate || a.status === 'cancelado') return false;
      const [ah, am] = (a.time || '00:00').split(':').map(Number);
      const aStart = ah * 60 + am;
      const aEnd = aStart + (a.duration || 30);
      return Math.max(startMins, aStart) < Math.min(endMins, aEnd);
    });

    if (hasCollision) {
      addToast('Conflicto de Horario', `El profesional ya posee un turno agendado en ese rango de horario el ${selectedDate}.`, 'warning');
      return;
    }

    addAppointment({
      patientId: `pat-${Date.now()}`,
      patientName: manualPatientName.trim(),
      patientDni: manualPatientDni.trim(),
      patientPhone: manualPatientPhone.trim(),
      patientInsurance: manualPatientInsurance,
      doctorId: assignedDoc.id,
      doctorName: assignedDoc.name,
      specialtyName: assignedDoc.specialty,
      roomName: assignedDoc.roomName || 'Consultorio 101',
      date: selectedDate,
      time: manualTime,
      duration,
      type: 'Consulta Presencial',
      status: 'confirmado',
      reason: manualReason,
      copayAmount: 0,
      isPaid: false
    });

    setIsManualModalOpen(false);
    setManualPatientName('');
    setManualPatientDni('');
    setManualPatientPhone('');
    addToast('Turno Agendado', `Turno registrado con ${assignedDoc.name} para el ${selectedDate} a las ${manualTime} hs.`, 'success');
  };

  const getStatusBadgeElement = (status) => {
    if (status === 'atendido') {
      return (
        <span
          style={{
            background: '#f8fafc',
            color: '#334155',
            border: '1px solid #cbd5e1',
            padding: '0.25rem 0.65rem',
            borderRadius: '100px',
            fontSize: '0.74rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <CheckCircle2 size={12} color="#059669" /> Atendido
        </span>
      );
    }
    return (
      <span
        style={{
          background: '#fef3c7',
          color: '#92400e',
          border: '1px solid #fde68a',
          padding: '0.25rem 0.65rem',
          borderRadius: '100px',
          fontSize: '0.74rem',
          fontWeight: 800,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px'
        }}
      >
        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#d97706', display: 'inline-block' }} />
        Por Atender
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. TOP HEADER: CLEAN, UNSATURATED, SCOPED TO DOCTOR */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>
            {isDoctor ? 'Mis Turnos Programados' : 'Gestión de Turnos'}
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            {isDoctor
              ? `Agenda médica y flujo de pacientes en tiempo real para su consultorio de ${currentDoctor?.specialty || 'Traumatología'}.`
              : 'Control y programación de citas médicas de la clínica.'}
          </p>
        </div>

        {!isDoctor && (
          <button
            type="button"
            onClick={() => setIsManualModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(7, 106, 188, 0.25)'
            }}
          >
            <Plus size={18} />
            <span>Asignar Turno a Profesional</span>
          </button>
        )}
      </div>

      {/* 2. OPERATIONAL KPI STRIP: SOLO PENDIENTES DE HOY Y ATENDIDOS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem'
        }}
      >
        {/* KPI 1: Pendientes de Hoy */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1.5px solid #D2E3FC',
            borderLeft: '4px solid #076ABC',
            padding: '1.25rem 1.5rem',
            boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#076ABC', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Por Atender Hoy
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EBF3FD', color: '#076ABC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#002182', lineHeight: 1 }}>
            {pendingCount}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.45rem', fontWeight: 600 }}>
            Pacientes por atender en la jornada
          </div>
        </div>

        {/* KPI 2: Atendidos */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1.5px solid #D2E3FC',
            borderLeft: '4px solid #10b981',
            padding: '1.25rem 1.5rem',
            boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Atendidos
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
            {attendedCount}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.45rem', fontWeight: 600 }}>
            Consultas completadas con éxito
          </div>
        </div>
      </div>

      {/* 3. DATE NAVIGATOR & FILTERS (REMOVED MEDICOS & SALAS) */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        {/* Date Navigator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '2px'
            }}
          >
            <button
              type="button"
              onClick={handlePrevDay}
              title="Día anterior"
              style={{
                background: 'none',
                border: 'none',
                padding: '0.4rem 0.6rem',
                cursor: 'pointer',
                color: '#334155',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ChevronLeft size={16} />
            </button>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontWeight: 800,
                fontSize: '0.86rem',
                color: '#0f172a',
                padding: '0.35rem 0.5rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            />

            <button
              type="button"
              onClick={handleNextDay}
              title="Día siguiente"
              style={{
                background: 'none',
                border: 'none',
                padding: '0.4rem 0.6rem',
                cursor: 'pointer',
                color: '#334155',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleToday}
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
              borderRadius: '8px',
              padding: '0.45rem 0.85rem',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Hoy
          </button>

          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#002182' }}>
            {formatDateHeader(selectedDate)}
          </span>
        </div>

        {/* Search & Status Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Doctor filter for Reception */}
          {!isDoctor && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <select
                value={doctorFilter}
                onChange={(e) => setDoctorFilter(e.target.value)}
                style={{
                  padding: '0.48rem 0.75rem',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#002182',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">Todos los profesionales ({doctors.length})</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialty})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '160px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Buscar paciente o DNI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2.1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Status Pills Group: Solo Pendientes y Atendidos */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '10px', gap: '2px' }}>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              style={{
                background: statusFilter === 'all' ? '#002182' : 'transparent',
                color: statusFilter === 'all' ? '#ffffff' : '#475569',
                border: 'none',
                borderRadius: '7px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Todos ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pendientes')}
              style={{
                background: statusFilter === 'pendientes' ? '#002182' : 'transparent',
                color: statusFilter === 'pendientes' ? '#ffffff' : '#475569',
                border: 'none',
                borderRadius: '7px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Por Atender ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('atendidos')}
              style={{
                background: statusFilter === 'atendidos' ? '#002182' : 'transparent',
                color: statusFilter === 'atendidos' ? '#ffffff' : '#475569',
                border: 'none',
                borderRadius: '7px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Atendidos ({attendedCount})
            </button>
          </div>
        </div>
      </div>

      {/* 4. CLEAN TABLE VIEW (AIRY, SIMPLIFIED, ACCORDION DETAILS ON CLICK) */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(0, 33, 130, 0.03)'
        }}
      >
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#0f172a', fontWeight: 800 }}>
                <th style={{ padding: '0.85rem 1.25rem', width: '110px' }}>Horario</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Paciente</th>
                {!isDoctor && <th style={{ padding: '0.85rem 1.25rem' }}>Profesional</th>}
                <th style={{ padding: '0.85rem 1.25rem' }}>Motivo de Consulta</th>
                <th style={{ padding: '0.85rem 1.25rem', width: '160px' }}>Estado</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right', width: '180px' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={isDoctor ? 5 : 6} style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <CalendarIcon size={36} style={{ color: '#cbd5e1' }} />
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>No hay turnos registrados para este día o filtro</div>
                      <div style={{ fontSize: '0.82rem' }}>
                        {isDoctor ? 'Utilice el navegador de fechas para revisar su agenda de turnos.' : 'Utilice el navegador de fechas o haga clic en "Asignar Turno a Profesional".'}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((app) => {
                  const isExpanded = expandedAppointmentId === app.id;
                  const isAtendido = app.status === 'atendido';

                  return (
                    <React.Fragment key={app.id}>
                      {/* Main compact row */}
                      <tr
                        onClick={() => toggleExpand(app.id)}
                        style={{
                          borderBottom: isExpanded ? 'none' : '1px solid #f1f5f9',
                          background: isExpanded ? '#f0fdf4' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isExpanded) e.currentTarget.style.background = '#f8fafc';
                        }}
                        onMouseLeave={(e) => {
                          if (!isExpanded) e.currentTarget.style.background = '#ffffff';
                        }}
                      >
                        {/* Horario */}
                        <td style={{ padding: '0.9rem 1.25rem', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 900, color: '#002182', fontSize: '1.02rem' }}>
                            {app.time} hs
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            {app.duration || 30} min
                          </div>
                        </td>

                        {/* Paciente */}
                        <td style={{ padding: '0.9rem 1.25rem' }}>
                          <div>
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                              {app.patientName}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>DNI {app.patientDni}</span>
                              <span>•</span>
                              <span style={{ fontWeight: 700, color: '#0369a1' }}>
                                {app.patientInsurance || app.healthInsurance || 'Particular'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Profesional (solo visible para Administrativo) */}
                        {!isDoctor && (
                          <td style={{ padding: '0.9rem 1.25rem' }}>
                            <div style={{ fontWeight: 800, color: '#002182', fontSize: '0.88rem' }}>
                              {app.doctorName || 'Dr. Asignado'}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                              {app.specialtyName || app.doctorSpecialty || 'Consultorio'}
                            </div>
                          </td>
                        )}

                        {/* Motivo de Consulta */}
                        <td style={{ padding: '0.9rem 1.25rem' }}>
                          <div style={{ color: '#334155', fontWeight: 600, fontSize: '0.88rem' }}>
                            {app.reason || 'Consulta Médica'}
                          </div>
                          {app.notes && (
                            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px', fontStyle: 'italic' }}>
                              Nota: {app.notes}
                            </div>
                          )}
                        </td>

                        {/* Estado */}
                        <td style={{ padding: '0.9rem 1.25rem' }}>
                          {getStatusBadgeElement(app.status)}
                        </td>

                        {/* Acciones */}
                        <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
                          <div
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Actions for Administrative vs Doctor */}
                            {!isDoctor ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                {isAtendido ? (
                                  <span
                                    style={{
                                      fontSize: '0.74rem',
                                      fontWeight: 700,
                                      color: '#64748b',
                                      background: '#f1f5f9',
                                      padding: '0.35rem 0.65rem',
                                      borderRadius: '8px'
                                    }}
                                  >
                                    Atendido
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      fontSize: '0.74rem',
                                      fontWeight: 800,
                                      color: '#b45309',
                                      background: '#fef3c7',
                                      border: '1px solid #fde68a',
                                      padding: '0.35rem 0.65rem',
                                      borderRadius: '8px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    Por Atender
                                  </span>
                                )}
                              </div>
                            ) : (
                              // Doctor Actions: Only 2 states (Atendido -> Ver Consulta, Por Atender -> Atender)
                              isAtendido ? (
                                <button
                                  type="button"
                                  onClick={() => handleViewConsultation(app)}
                                  style={{
                                    background: '#eff6ff',
                                    color: '#002182',
                                    border: '1px solid #bfdbfe',
                                    borderRadius: '8px',
                                    padding: '0.42rem 0.85rem',
                                    fontSize: '0.8rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                  }}
                                  title="Ver registro de Historia Clínica de esta consulta"
                                >
                                  <FileText size={14} />
                                  <span>Ver Consulta</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleStartConsultation(app)}
                                  style={{
                                    background: '#059669',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '0.45rem 0.95rem',
                                    fontSize: '0.82rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)'
                                  }}
                                >
                                  <Stethoscope size={15} />
                                  <span>Atender</span>
                                </button>
                              )
                            )}

                            {/* Accordion detail expand toggle */}
                            <button
                              type="button"
                              onClick={() => toggleExpand(app.id)}
                              title={isExpanded ? 'Ocultar detalles' : 'Ver ficha completa'}
                              style={{
                                background: isExpanded ? '#002182' : '#f8fafc',
                                color: isExpanded ? '#ffffff' : '#64748b',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* ACCORDION EXPANDABLE DETAIL ROW */}
                      {isExpanded && (
                        <tr style={{ background: '#f8fafc' }}>
                          <td colSpan={isDoctor ? 5 : 6} style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #cbd5e1' }}>
                            <div
                              style={{
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                padding: '1.25rem',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                                gap: '1.25rem',
                                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)'
                              }}
                            >
                              {/* Column 1: Patient Details */}
                              <div>
                                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#002182', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <User size={14} /> Ficha del Paciente
                                </div>
                                <div style={{ fontSize: '0.82rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                  <div><strong>Nombre:</strong> {app.patientName}</div>
                                  <div><strong>DNI:</strong> {app.patientDni || 'Sin registrar'}</div>
                                  <div><strong>Teléfono:</strong> {app.patientPhone || 'No informado'}</div>
                                  <div><strong>Email:</strong> {app.patientEmail || `${app.patientName.toLowerCase().replace(/\s+/g, '.')}@email.com`}</div>
                                </div>
                              </div>

                              {/* Column 2: Insurance & Billing */}
                              <div>
                                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <Shield size={14} /> Cobertura & Pagos
                                </div>
                                <div style={{ fontSize: '0.82rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                  <div><strong>Obra Social:</strong> {app.patientInsurance || app.healthInsurance || 'Particular'}</div>
                                  <div><strong>Nº Carnet / Afiliado:</strong> {app.insuranceNumber || '9481029381'}</div>
                                  <div><strong>Copago Consulta:</strong> ${app.copayAmount || 0} {app.copayAmount > 0 ? '(Abonado)' : '(Sin Coseguro)'}</div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <strong>Estado de Cobro:</strong>
                                    <span style={{ color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                      <CheckCircle2 size={12} /> Liquidado / Abonado
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Column 3: Clinical Reason & Quick Actions */}
                              <div>
                                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <FileText size={14} /> Motivo de Consulta
                                </div>
                                <p style={{ fontSize: '0.82rem', color: '#334155', margin: '0 0 0.75rem', lineHeight: '1.4' }}>
                                  {app.reason || 'Sin motivo detallado'}
                                  {app.notes && ` · Nota: ${app.notes}`}
                                </p>

                                {/* Quick action buttons */}
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                  {isDoctor && (
                                    <>
                                      {isAtendido ? (
                                        <button
                                          type="button"
                                          onClick={() => handleViewConsultation(app)}
                                          style={{
                                            background: '#002182',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '0.35rem 0.75rem',
                                            fontSize: '0.76rem',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            boxShadow: '0 2px 6px rgba(0, 33, 130, 0.2)'
                                          }}
                                          title="Ver la Historia Clínica registrada de este paciente"
                                        >
                                          <FileText size={13} /> Ver Historia Clínica
                                        </button>
                                      ) : (consultations || []).some((c) => c.patientId === app.patientId || c.patientDni === app.patientDni) ? (
                                        <button
                                          type="button"
                                          onClick={() => handleStartConsultation(app)}
                                          style={{
                                            background: '#059669',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '0.35rem 0.75rem',
                                            fontSize: '0.76rem',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            boxShadow: '0 2px 6px rgba(5, 150, 105, 0.2)'
                                          }}
                                          title="El paciente ya tiene Historia Clínica. Registrar nueva evolución para este turno."
                                        >
                                          <Stethoscope size={13} /> Registrar Evolución
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => handleStartConsultation(app)}
                                          style={{
                                            background: '#059669',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '0.35rem 0.75rem',
                                            fontSize: '0.76rem',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            boxShadow: '0 2px 6px rgba(5, 150, 105, 0.2)'
                                          }}
                                          title="Apertura de Historia Clínica para paciente nuevo"
                                        >
                                          <Stethoscope size={13} /> Iniciar Historia Clínica
                                        </button>
                                      )}
                                    </>
                                  )}

                                  {app.patientPhone && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (sendWhatsAppReminder) sendWhatsAppReminder(app.id);
                                        else addToast('WhatsApp', `Mensaje enviado a ${app.patientPhone}`, 'info');
                                      }}
                                      style={{
                                        background: '#25d366',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '0.35rem 0.65rem',
                                        fontSize: '0.76rem',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      <WhatsAppIcon size={14} color="#ffffff" /> WhatsApp
                                    </button>
                                  )}

                                  {app.status !== 'cancelado' && app.status !== 'atendido' && (
                                    <button
                                      type="button"
                                      onClick={() => cancelAppointment(app.id, 'Cancelado por el médico')}
                                      style={{
                                        background: '#fee2e2',
                                        color: '#991b1b',
                                        border: '1px solid #fca5a5',
                                        borderRadius: '6px',
                                        padding: '0.35rem 0.65rem',
                                        fontSize: '0.76rem',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                      }}
                                    >
                                      Cancelar Turno
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. MANUAL APPOINTMENT MODAL (PRE-SCOPED TO DR. BLANCO) */}
      {isManualModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 33, 130, 0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem'
          }}
          onClick={() => setIsManualModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '500px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #002182 0%, #076ABC 100%)',
                color: '#ffffff',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                  {isDoctor ? 'Nuevo Turno Médico' : 'Asignar Turno a Profesional'}
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#D2E3FC', marginTop: '2px' }}>
                  {isDoctor ? (currentDoctor?.roomName || 'Consultorio') : 'Recepción CITRA'} · {selectedDate}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateManualAppointment} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {/* Doctor Selector for Receptionist */}
                {!isDoctor && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                      Profesional / Médico Asignado *
                    </label>
                    <select
                      value={manualDoctorId}
                      onChange={(e) => setManualDoctorId(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.75rem',
                        borderRadius: '8px',
                        border: '1.5px solid #D2E3FC',
                        fontSize: '0.85rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        background: '#ffffff',
                        fontWeight: 700,
                        color: '#002182'
                      }}
                    >
                      {doctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} — {d.specialty} ({d.roomName || 'Consultorio'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                    Nombre y Apellido del Paciente *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualPatientName}
                    onChange={(e) => setManualPatientName(e.target.value)}
                    placeholder="Ej: Marcelo Delgado"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '8px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.85rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                      DNI *
                    </label>
                    <input
                      type="text"
                      required
                      value={manualPatientDni}
                      onChange={(e) => setManualPatientDni(e.target.value)}
                      placeholder="Ej: 36.190.283"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.75rem',
                        borderRadius: '8px',
                        border: '1.5px solid #D2E3FC',
                        fontSize: '0.85rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                      Teléfono / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={manualPatientPhone}
                      onChange={(e) => setManualPatientPhone(e.target.value)}
                      placeholder="+54 9 351..."
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.75rem',
                        borderRadius: '8px',
                        border: '1.5px solid #D2E3FC',
                        fontSize: '0.85rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                      Obra Social / Prepaga
                    </label>
                    <input
                      type="text"
                      value={manualPatientInsurance}
                      onChange={(e) => setManualPatientInsurance(e.target.value)}
                      placeholder="OSDE, Swiss, Particular"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.75rem',
                        borderRadius: '8px',
                        border: '1.5px solid #D2E3FC',
                        fontSize: '0.85rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                      Horario
                    </label>
                    <input
                      type="time"
                      value={manualTime}
                      onChange={(e) => setManualTime(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.75rem',
                        borderRadius: '8px',
                        border: '1.5px solid #D2E3FC',
                        fontSize: '0.85rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                    Motivo de Consulta
                  </label>
                  <input
                    type="text"
                    value={manualReason}
                    onChange={(e) => setManualReason(e.target.value)}
                    placeholder="Ej: Dolor articular en hombro derecho"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '8px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.85rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    color: '#475569',
                    borderRadius: '8px',
                    padding: '0.6rem 1rem',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#076ABC',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.6rem 1.2rem',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Confirmar y Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
