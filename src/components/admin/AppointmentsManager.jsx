import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
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
    setIsNewConsultationModalOpen,
    setConsultationPreloadData,
    sendWhatsAppReminder,
    addToast
  } = useClinic();

  // Selected date (defaults to 2026-08-28 to show demo data, with full navigation)
  const [selectedDate, setSelectedDate] = useState('2026-08-28');
  // Status filter pill: 'all', 'en_sala', 'pendientes', 'atendidos'
  const [statusFilter, setStatusFilter] = useState('all');
  // Instant search input
  const [searchQuery, setSearchQuery] = useState('');
  // Expanded appointment ID for accordion details
  const [expandedAppointmentId, setExpandedAppointmentId] = useState(null);

  // Manual appointment modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualPatientName, setManualPatientName] = useState('');
  const [manualPatientDni, setManualPatientDni] = useState('');
  const [manualPatientPhone, setManualPatientPhone] = useState('');
  const [manualPatientInsurance, setManualPatientInsurance] = useState('Particular');
  const [manualTime, setManualTime] = useState('09:00');
  const [manualReason, setManualReason] = useState('Consulta traumatológica');

  // Strict data scoping: Doctor ONLY sees their own appointments
  const effectiveAppointments = useMemo(() => {
    if (isDoctor && currentDoctor) {
      return scopedAppointments.filter((a) => a.doctorId === currentDoctor.id);
    }
    return appointments;
  }, [isDoctor, currentDoctor, scopedAppointments, appointments]);

  // Appointments on selected date
  const dateAppointments = useMemo(() => {
    return effectiveAppointments.filter((a) => a.date === selectedDate);
  }, [effectiveAppointments, selectedDate]);

  // Operational KPIs for the selected date
  const totalCount = dateAppointments.length;
  const inWaitingRoomCount = dateAppointments.filter((a) => a.status === 'en_sala').length;
  const attendedCount = dateAppointments.filter((a) => a.status === 'atendido').length;
  const pendingCount = dateAppointments.filter((a) => a.status === 'pendiente' || a.status === 'confirmado').length;
  const totalCopayCollected = dateAppointments.reduce((acc, curr) => acc + (curr.isPaid ? curr.copayAmount || 0 : 0), 0);

  // Filtered appointments based on search and status pill
  const filteredAppointments = useMemo(() => {
    return dateAppointments.filter((app) => {
      // Status pill match
      if (statusFilter === 'en_sala' && app.status !== 'en_sala') return false;
      if (statusFilter === 'pendientes' && app.status !== 'pendiente' && app.status !== 'confirmado') return false;
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
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate('2026-08-28');
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

  // Call / Start Consultation Action
  const handleStartConsultation = (app) => {
    if (setIsNewConsultationModalOpen && setConsultationPreloadData) {
      setConsultationPreloadData(app);
      setIsNewConsultationModalOpen(true);
      addToast('Consulta Médica Iniciada', `Atendiendo a ${app.patientName} en ${currentDoctor?.roomName || 'Consultorio 102'}.`, 'info');
    } else {
      updateAppointmentStatus(app.id, 'atendido');
      addToast('Paciente Atendido', `${app.patientName} marcado como atendido.`, 'success');
    }
  };

  // Call patient to room
  const handleCallToRoom = (app) => {
    updateAppointmentStatus(app.id, 'en_sala');
    addToast('Llamado a Consultorio', `Notificación enviada a pantalla de recepción: ${app.patientName} pase a ${currentDoctor?.roomName || 'Consultorio 102'}.`, 'success');
  };

  // Create manual appointment
  const handleCreateManualAppointment = (e) => {
    e.preventDefault();
    if (!manualPatientName.trim() || !manualPatientDni.trim()) {
      addToast('Datos incompletos', 'Ingrese nombre y DNI del paciente.', 'warning');
      return;
    }

    const assignedDoc = isDoctor && currentDoctor ? currentDoctor : doctors[0];

    addAppointment({
      patientId: `pat-${Date.now()}`,
      patientName: manualPatientName.trim(),
      patientDni: manualPatientDni.trim(),
      patientPhone: manualPatientPhone.trim() || '+54 9 351 000-0000',
      patientInsurance: manualPatientInsurance,
      doctorId: assignedDoc.id,
      doctorName: assignedDoc.name,
      specialtyName: assignedDoc.specialty,
      roomName: assignedDoc.roomName || 'Consultorio 102',
      date: selectedDate,
      time: manualTime,
      duration: assignedDoc.slotDuration || 30,
      type: 'Consulta Presencial',
      status: 'confirmado',
      reason: manualReason,
      copayAmount: 0,
      isPaid: true
    });

    setIsManualModalOpen(false);
    setManualPatientName('');
    setManualPatientDni('');
    setManualPatientPhone('');
    addToast('Turno Agendado', `Turno registrado exitosamente para el ${selectedDate} a las ${manualTime} hs.`, 'success');
  };

  const getStatusBadgeElement = (status) => {
    switch (status) {
      case 'en_sala':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0',
              padding: '0.25rem 0.65rem',
              borderRadius: '100px',
              fontSize: '0.74rem',
              fontWeight: 800
            }}
          >
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            En Sala de Espera
          </span>
        );
      case 'confirmado':
        return (
          <span
            style={{
              background: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              padding: '0.25rem 0.65rem',
              borderRadius: '100px',
              fontSize: '0.74rem',
              fontWeight: 800
            }}
          >
            Confirmado
          </span>
        );
      case 'pendiente':
        return (
          <span
            style={{
              background: '#fefce8',
              color: '#a16207',
              border: '1px solid #fde047',
              padding: '0.25rem 0.65rem',
              borderRadius: '100px',
              fontSize: '0.74rem',
              fontWeight: 800
            }}
          >
            Por Llegar
          </span>
        );
      case 'atendido':
        return (
          <span
            style={{
              background: '#f8fafc',
              color: '#475569',
              border: '1px solid #cbd5e1',
              padding: '0.25rem 0.65rem',
              borderRadius: '100px',
              fontSize: '0.74rem',
              fontWeight: 700
            }}
          >
            ✓ Atendido
          </span>
        );
      case 'cancelado':
        return (
          <span
            style={{
              background: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fecaca',
              padding: '0.25rem 0.65rem',
              borderRadius: '100px',
              fontSize: '0.74rem',
              fontWeight: 700
            }}
          >
            Cancelado
          </span>
        );
      default:
        return (
          <span style={{ background: '#f1f5f9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem' }}>
            {status}
          </span>
        );
    }
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '0.35rem' }}>
            <span
              style={{
                background: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                padding: '0.2rem 0.65rem',
                borderRadius: '100px',
                fontSize: '0.74rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Stethoscope size={13} />
              {isDoctor ? (currentDoctor?.name?.startsWith('Dr.') ? currentDoctor.name : `Dr. ${currentDoctor?.name || 'Alejandro Blanco'}`) : 'Gestión Central'}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              • {currentDoctor?.roomName || 'Consultorio 101 — Traumatología'}
            </span>
          </div>

          <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>
            {isDoctor ? 'Mis Turnos Programados' : 'Gestión de Turnos'}
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            {isDoctor
              ? `Agenda médica y flujo de pacientes en tiempo real para su consultorio de ${currentDoctor?.specialty || 'Traumatología'}.`
              : 'Control y programación de citas médicas de la clínica.'}
          </p>
        </div>

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
          Nuevo Turno Manual
        </button>
      </div>

      {/* 2. OPERATIONAL KPI STRIP (FROM AGENDA VIEW, CLEAN & SCOPED) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}
      >
        {/* KPI 1: Turnos del Día */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '1.15rem 1.25rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Turnos del Día
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarIcon size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>{totalCount}</span>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
              {attendedCount} atendidos
            </span>
          </div>
          <div style={{ width: '100%', height: '5px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${totalCount > 0 ? (attendedCount / totalCount) * 100 : 0}%`,
                height: '100%',
                background: '#2563eb',
                borderRadius: '10px'
              }}
            />
          </div>
        </div>

        {/* KPI 2: En Sala de Espera */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #10b981',
            padding: '1.15rem 1.25rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                En Sala de Espera
              </span>
            </div>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>{inWaitingRoomCount}</span>
            <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700 }}>
              Demora prom: 8 min
            </span>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
            Listos para llamar a consultorio
          </div>
        </div>

        {/* KPI 3: Por Llegar / Pendientes */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '1.15rem 1.25rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Por Llegar / Pendientes
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#f8fafc', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>{pendingCount}</span>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
              próximos en agenda
            </span>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
            Pendientes de check-in en recepción
          </div>
        </div>

        {/* KPI 4: Copagos / Recaudación */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '1.15rem 1.25rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Copagos en Recepción
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#16a34a' }}>
              ${totalCopayCollected.toLocaleString()}
            </span>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
            Cobranzas con CAE ARCA / MP QR
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
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '220px' }}>
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

          {/* Status Pills Group */}
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
              onClick={() => setStatusFilter('en_sala')}
              style={{
                background: statusFilter === 'en_sala' ? '#002182' : 'transparent',
                color: statusFilter === 'en_sala' ? '#ffffff' : '#475569',
                border: 'none',
                borderRadius: '7px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🟢 En Sala ({inWaitingRoomCount})
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
              Pendientes ({pendingCount})
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
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#0f172a', fontWeight: 800 }}>
                <th style={{ padding: '0.85rem 1.25rem', width: '110px' }}>Horario</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Paciente</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Motivo de Consulta</th>
                <th style={{ padding: '0.85rem 1.25rem', width: '160px' }}>Estado</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right', width: '180px' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <CalendarIcon size={36} style={{ color: '#cbd5e1' }} />
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>No hay turnos registrados para este día o filtro</div>
                      <div style={{ fontSize: '0.82rem' }}>Utilice el navegador de fechas o haga clic en "Nuevo Turno Manual".</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((app) => {
                  const isExpanded = expandedAppointmentId === app.id;
                  const isEnSala = app.status === 'en_sala';
                  const isAtendido = app.status === 'atendido';

                  return (
                    <React.Fragment key={app.id}>
                      {/* Main compact row */}
                      <tr
                        onClick={() => toggleExpand(app.id)}
                        style={{
                          borderBottom: isExpanded ? 'none' : '1px solid #f1f5f9',
                          background: isExpanded ? '#f0fdf4' : isEnSala ? '#f0fdf4' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isExpanded && !isEnSala) e.currentTarget.style.background = '#f8fafc';
                        }}
                        onMouseLeave={(e) => {
                          if (!isExpanded && !isEnSala) e.currentTarget.style.background = '#ffffff';
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                background: isEnSala ? '#dcfce7' : '#eff6ff',
                                color: isEnSala ? '#15803d' : '#2563eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '0.85rem',
                                flexShrink: 0
                              }}
                            >
                              {getInitials(app.patientName)}
                            </div>
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
                          </div>
                        </td>

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
                            {/* Primary Action Button */}
                            {isEnSala ? (
                              <button
                                type="button"
                                onClick={() => handleStartConsultation(app)}
                                style={{
                                  background: '#059669',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '8px',
                                  padding: '0.45rem 0.85rem',
                                  fontSize: '0.82rem',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)'
                                }}
                              >
                                <Stethoscope size={15} />
                                Atender
                              </button>
                            ) : isAtendido ? (
                              <button
                                type="button"
                                onClick={() => handleStartConsultation(app)}
                                style={{
                                  background: '#f1f5f9',
                                  color: '#475569',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '8px',
                                  padding: '0.35rem 0.65rem',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                Ver Consulta
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleCallToRoom(app)}
                                style={{
                                  background: '#076ABC',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '8px',
                                  padding: '0.4rem 0.75rem',
                                  fontSize: '0.8rem',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <Bell size={13} />
                                Llamar
                              </button>
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

                      {/* 5. EXPANDED PATIENT DETAIL ROW (SMOOTH ACCORDION) */}
                      {isExpanded && (
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                          <td colSpan={5} style={{ padding: '1.25rem 1.5rem' }}>
                            <div
                              style={{
                                background: '#ffffff',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                padding: '1.25rem',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                                gap: '1.25rem'
                              }}
                            >
                              {/* Column 1: Patient Data */}
                              <div>
                                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#076ABC', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <User size={14} /> Ficha del Paciente
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#0f172a', lineHeight: '1.6' }}>
                                  <div><strong>Nombre:</strong> {app.patientName}</div>
                                  <div><strong>DNI:</strong> {app.patientDni}</div>
                                  <div><strong>Teléfono:</strong> {app.patientPhone || '+54 3576 44-5588'}</div>
                                  <div><strong>Email:</strong> {app.patientEmail || `${app.patientName?.toLowerCase().replace(/\s+/g, '.')}@email.com`}</div>
                                </div>
                              </div>

                              {/* Column 2: Insurance & Billing */}
                              <div>
                                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <Shield size={14} /> Cobertura & Pagos
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#0f172a', lineHeight: '1.6' }}>
                                  <div><strong>Obra Social:</strong> {app.patientInsurance || app.healthInsurance || 'Particular'}</div>
                                  <div><strong>N° Carnet / Afiliado:</strong> {app.insuranceCardNumber || '9481029381'}</div>
                                  <div><strong>Copago Consulta:</strong> {app.copayAmount > 0 ? `$${app.copayAmount.toLocaleString()}` : '$0 (Sin Coseguro)'}</div>
                                  <div><strong>Estado de Cobro:</strong> {app.isPaid ? '✓ Liquidado / Abonado' : '⏳ Pendiente en caja'}</div>
                                </div>
                              </div>

                              {/* Column 3: Clinical Reason & Quick Actions */}
                              <div>
                                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <FileText size={14} /> Consulta en {currentDoctor?.roomName || 'Consultorio 102'}
                                </div>
                                <p style={{ fontSize: '0.82rem', color: '#334155', margin: '0 0 0.75rem', lineHeight: '1.4' }}>
                                  {app.reason || 'Sin motivo detallado'}
                                  {app.notes && ` · Nota: ${app.notes}`}
                                </p>

                                {/* Quick action buttons */}
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleStartConsultation(app)}
                                    style={{
                                      background: '#059669',
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
                                    <Stethoscope size={13} /> Iniciar Historia Clínica
                                  </button>

                                  {app.patientPhone && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (sendWhatsAppReminder) sendWhatsAppReminder(app);
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
                                      <MessageSquare size={13} /> WhatsApp
                                    </button>
                                  )}

                                  {app.status !== 'cancelado' && (
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
                  Nuevo Turno para {isDoctor ? (currentDoctor?.name?.startsWith('Dr.') ? currentDoctor.name : `Dr. ${currentDoctor?.name || 'Alejandro Blanco'}`) : 'Consultorio'}
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#D2E3FC', marginTop: '2px' }}>
                  {currentDoctor?.roomName || 'Consultorio 101'} · {selectedDate}
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
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
