import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Clock,
  Calendar,
  Save,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Building2,
  ShieldCheck,
  Stethoscope,
  DollarSign,
  UserCheck
} from 'lucide-react';

export const SchedulesManager = () => {
  const {
    clinicSchedule,
    updateClinicSchedule,
    currentDoctor,
    isDoctor,
    updateDoctorSchedule,
    doctors,
    addToast
  } = useClinic();

  // Global Clinic Schedule State (for Administrative)
  const [openingTime, setOpeningTime] = useState(clinicSchedule?.openingTime || '08:00');
  const [closingTime, setClosingTime] = useState(clinicSchedule?.closingTime || '20:00');
  const [saturdayClosing, setSaturdayClosing] = useState(clinicSchedule?.saturdayClosingTime || '13:00');
  const [slotDuration, setSlotDuration] = useState(clinicSchedule?.slotDuration || 30);
  const [blockedDates, setBlockedDates] = useState(clinicSchedule?.blockedDates || ['2026-12-25', '2027-01-01']);
  const [newBlockedDate, setNewBlockedDate] = useState('');

  const allWorkingDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const [workingDays, setWorkingDays] = useState(clinicSchedule?.workingDays || allWorkingDays);

  // Doctor Specific Schedule State (Personal for doctor)
  const [docWorkingDays, setDocWorkingDays] = useState(currentDoctor?.workingDays || ['Lunes', 'Miércoles', 'Viernes']);
  const [docScheduleStart, setDocScheduleStart] = useState(currentDoctor?.scheduleStart || '08:00');
  const [docScheduleEnd, setDocScheduleEnd] = useState(currentDoctor?.scheduleEnd || '14:00');
  const [docSlotDuration, setDocSlotDuration] = useState(currentDoctor?.slotDuration || 30);
  const [docPriceConsultation, setDocPriceConsultation] = useState(currentDoctor?.priceConsultation || 25000);
  const [docFeePercentage, setDocFeePercentage] = useState(currentDoctor?.feePercentage || 75);
  const [docBlockedDates, setDocBlockedDates] = useState(currentDoctor?.blockedDates || ['2026-09-20', '2026-10-12']);
  const [newDocBlockedDate, setNewDocBlockedDate] = useState('');

  // Administrative State: Tab & Selected Doctor for Reception Management
  const [adminTab, setAdminTab] = useState('global'); // 'global' | 'doctors'
  const [selectedAdminDoctorId, setSelectedAdminDoctorId] = useState(doctors[0]?.id || 'doc-1');
  const selectedDocObj = doctors.find((d) => d.id === selectedAdminDoctorId) || doctors[0];

  const [adminDocWorkingDays, setAdminDocWorkingDays] = useState(selectedDocObj?.workingDays || ['Lunes', 'Miércoles', 'Viernes']);
  const [adminDocStart, setAdminDocStart] = useState(selectedDocObj?.scheduleStart || '08:00');
  const [adminDocEnd, setAdminDocEnd] = useState(selectedDocObj?.scheduleEnd || '14:00');
  const [adminDocSlot, setAdminDocSlot] = useState(selectedDocObj?.slotDuration || 30);
  const [adminDocBlocked, setAdminDocBlocked] = useState(selectedDocObj?.blockedDates || []);
  const [adminDocScheduleDisplay, setAdminDocScheduleDisplay] = useState(selectedDocObj?.scheduleDisplay || '');
  const [adminNewBlockedDate, setAdminNewBlockedDate] = useState('');

  React.useEffect(() => {
    if (selectedDocObj) {
      setAdminDocWorkingDays(selectedDocObj.workingDays || ['Lunes', 'Miércoles', 'Viernes']);
      setAdminDocStart(selectedDocObj.scheduleStart || '08:00');
      setAdminDocEnd(selectedDocObj.scheduleEnd || '14:00');
      setAdminDocSlot(selectedDocObj.slotDuration || 30);
      setAdminDocBlocked(selectedDocObj.blockedDates || []);
      setAdminDocScheduleDisplay(selectedDocObj.scheduleDisplay || '');
    }
  }, [selectedAdminDoctorId, selectedDocObj]);

  const toggleAdminDocWorkingDay = (day) => {
    if (adminDocWorkingDays.includes(day)) {
      setAdminDocWorkingDays(adminDocWorkingDays.filter((d) => d !== day));
    } else {
      setAdminDocWorkingDays([...adminDocWorkingDays, day]);
    }
  };

  const handleAddAdminDocBlockedDate = () => {
    if (!adminNewBlockedDate) return;
    if (adminDocBlocked.includes(adminNewBlockedDate)) {
      addToast('Fecha ya bloqueada', 'Esta fecha ya figura en los días bloqueados del profesional.', 'info');
      return;
    }
    setAdminDocBlocked([...adminDocBlocked, adminNewBlockedDate]);
    setAdminNewBlockedDate('');
    addToast('Día no laborable añadido', `Se bloqueó la fecha en la agenda de ${selectedDocObj?.name}.`, 'success');
  };

  const handleSaveAdminDoctor = (e) => {
    e.preventDefault();
    if (!selectedDocObj) return;
    updateDoctorSchedule(selectedDocObj.id, {
      workingDays: adminDocWorkingDays,
      scheduleStart: adminDocStart,
      scheduleEnd: adminDocEnd,
      slotDuration: Number(adminDocSlot),
      blockedDates: adminDocBlocked,
      scheduleDisplay: adminDocScheduleDisplay.trim() || undefined
    });
    addToast('Agenda de Profesional Actualizada', `Se guardó la disponibilidad de ${selectedDocObj.name}.`, 'success');
  };

  const toggleGlobalWorkingDay = (day) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter((d) => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  const toggleDocWorkingDay = (day) => {
    if (docWorkingDays.includes(day)) {
      setDocWorkingDays(docWorkingDays.filter((d) => d !== day));
    } else {
      setDocWorkingDays([...docWorkingDays, day]);
    }
  };

  const handleAddGlobalBlockedDate = () => {
    if (!newBlockedDate) return;
    if (blockedDates.includes(newBlockedDate)) {
      addToast('Fecha ya bloqueada', 'Esta fecha ya figura en el calendario de excepciones.', 'info');
      return;
    }
    setBlockedDates([...blockedDates, newBlockedDate]);
    setNewBlockedDate('');
    addToast('Día Bloqueado', 'Se añadió el feriado o excepción general.', 'success');
  };

  const handleAddDocBlockedDate = () => {
    if (!newDocBlockedDate) return;
    if (docBlockedDates.includes(newDocBlockedDate)) {
      addToast('Fecha ya bloqueada', 'Esta fecha ya figura en tus días bloqueados.', 'info');
      return;
    }
    setDocBlockedDates([...docBlockedDates, newDocBlockedDate]);
    setNewDocBlockedDate('');
    addToast('Día no laborable añadido', 'Se bloqueó la fecha en tu agenda profesional.', 'success');
  };

  const handleSaveGlobal = (e) => {
    e.preventDefault();
    updateClinicSchedule({
      openingTime,
      closingTime,
      saturdayClosingTime: saturdayClosing,
      slotDuration: Number(slotDuration),
      workingDays,
      blockedDates
    });
  };

  const handleSaveDoctor = (e) => {
    e.preventDefault();
    if (!currentDoctor) {
      addToast('Error', 'No se encontró el perfil médico asociado.', 'error');
      return;
    }
    updateDoctorSchedule(currentDoctor.id, {
      workingDays: docWorkingDays,
      scheduleStart: docScheduleStart,
      scheduleEnd: docScheduleEnd,
      slotDuration: Number(docSlotDuration),
      priceConsultation: Number(docPriceConsultation),
      feePercentage: Number(docFeePercentage),
      blockedDates: docBlockedDates
    });
  };

  // --- VISTA EXCLUSIVA PARA EL DOCTOR ---
  if (isDoctor) {
    return (
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#EBF3FD', border: '1px solid #8EBEF5', padding: '0.25rem 0.65rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 800, color: '#002182', marginBottom: '0.4rem' }}>
              <Stethoscope size={13} color="#076ABC" />
              Gestión Personal de Disponibilidad Médica
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#002182', margin: '0 0 0.25rem' }}>
              Mis Horarios y Días de Atención
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#496386' }}>
              {currentDoctor?.name || 'Dr. Blanco'} · Especialidad: {currentDoctor?.specialty || 'Traumatología y Ortopedia'} · Consultorio asignado: {currentDoctor?.roomName || 'Consultorio 101'}
            </p>
          </div>

          <button
            onClick={handleSaveDoctor}
            style={{
              background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '0.65rem 1.4rem',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(7, 106, 188, 0.25)'
            }}
          >
            <Save size={18} />
            Guardar Mis Horarios
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
          {/* Card 1: Franja Horaria y Duración de Turno */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '18px',
              border: '1.5px solid #D2E3FC',
              padding: '1.75rem',
              boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EBF3FD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#076ABC' }}>
                <Clock size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#002182' }}>
                  Mi Franja Horaria de Consultas
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#496386' }}>Horario de inicio, fin y tiempo por paciente</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.35rem' }}>
                  Hora de Inicio
                </label>
                <input
                  type="time"
                  value={docScheduleStart}
                  onChange={(e) => setDocScheduleStart(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.88rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.35rem' }}>
                  Hora de Finalización
                </label>
                <input
                  type="time"
                  value={docScheduleEnd}
                  onChange={(e) => setDocScheduleEnd(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.88rem', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.35rem' }}>
                Duración del Turno / Consulta (minutos)
              </label>
              <select
                value={docSlotDuration}
                onChange={(e) => setDocSlotDuration(Number(e.target.value))}
                style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.88rem', outline: 'none', background: '#ffffff' }}
              >
                <option value={15}>15 minutos (Control rápido)</option>
                <option value={20}>20 minutos (Curación / Control)</option>
                <option value={30}>30 minutos (Consulta estándar recomendada)</option>
                <option value={40}>40 minutos (Evaluación profunda / Infiltraciones)</option>
                <option value={45}>45 minutos (Primera vez / Biomecánica)</option>
                <option value={60}>60 minutos (Procedimientos extendidos)</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.35rem' }}>
                  Arancel Particular ($)
                </label>
                <input
                  type="number"
                  value={docPriceConsultation}
                  onChange={(e) => setDocPriceConsultation(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.88rem', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.35rem' }}>
                  % Honorario Profesional
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={docFeePercentage}
                  onChange={(e) => setDocFeePercentage(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.88rem', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Días de Atención Semanal */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '18px',
              border: '1.5px solid #D2E3FC',
              padding: '1.75rem',
              boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EBF3FD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#076ABC' }}>
                <Calendar size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#002182' }}>
                  Mis Días Laborables
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#496386' }}>Selecciona los días en que abres agenda</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1.5rem' }}>
              {allWorkingDays.map((day) => {
                const isSelected = docWorkingDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDocWorkingDay(day)}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: isSelected ? '1.5px solid #076ABC' : '1px solid #D2E3FC',
                      background: isSelected ? '#EBF3FD' : '#ffffff',
                      color: isSelected ? '#002182' : '#496386',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{day}</span>
                    {isSelected && <CheckCircle2 size={16} color="#076ABC" />}
                  </button>
                );
              })}
            </div>

            <div style={{ background: '#F5F8FE', padding: '1rem', borderRadius: '12px', border: '1px solid #D2E3FC', fontSize: '0.8rem', color: '#002182', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Building2 size={20} color="#076ABC" style={{ flexShrink: 0 }} />
              <div>
                Consultorio Físico: <strong>{currentDoctor?.roomName || 'Consultorio 101 — Traumatología'}</strong>
                <div style={{ fontSize: '0.74rem', color: '#496386' }}>Asignación fija en sede central CITRA Arroyito</div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Días No Laborables / Vacaciones del Doctor */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            border: '1.5px solid #D2E3FC',
            padding: '1.75rem',
            marginTop: '1.75rem',
            boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#991B1B' }}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#002182' }}>
                  Mis Días Bloqueados / Vacaciones / Congresos
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#496386' }}>
                  En estas fechas los pacientes no podrán reservar turnos contigo
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <input
                type="date"
                value={newDocBlockedDate}
                onChange={(e) => setNewDocBlockedDate(e.target.value)}
                style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.85rem', outline: 'none' }}
              />
              <button
                type="button"
                onClick={handleAddDocBlockedDate}
                style={{
                  background: '#076ABC',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.55rem 1rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer'
                }}
              >
                <Plus size={16} /> Bloquear Fecha
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
            {docBlockedDates.length === 0 ? (
              <div style={{ color: '#7994B8', fontSize: '0.85rem', padding: '0.5rem 0' }}>
                No tienes fechas bloqueadas actualmente. Tu agenda está 100% disponible en tus días habituales.
              </div>
            ) : (
              docBlockedDates.map((dateStr) => (
                <div
                  key={dateStr}
                  style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#991B1B',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Calendar size={14} />
                  <span>{dateStr} (No atiende)</span>
                  <button
                    type="button"
                    onClick={() => setDocBlockedDates(docBlockedDates.filter((d) => d !== dateStr))}
                    style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', padding: 0 }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- VISTA GENERAL PARA PERSONAL ADMINISTRATIVO ---
  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#002182', margin: '0 0 0.25rem' }}>
            Gestión Central de Horarios & Disponibilidad
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#496386' }}>
            Configuración global de la clínica y administración de horarios de cada profesional médico.
          </p>
        </div>

        {adminTab === 'global' ? (
          <button
            onClick={handleSaveGlobal}
            style={{
              background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '0.65rem 1.4rem',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(7, 106, 188, 0.25)'
            }}
          >
            <Save size={18} />
            Guardar Configuración Global
          </button>
        ) : (
          <button
            onClick={handleSaveAdminDoctor}
            style={{
              background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '0.65rem 1.4rem',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(7, 106, 188, 0.25)'
            }}
          >
            <Save size={18} />
            Guardar Horarios de {selectedDocObj?.name?.split(' ')[1] || 'Profesional'}
          </button>
        )}
      </div>

      {/* Admin Tabs */}
      <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => setAdminTab('global')}
          style={{
            padding: '0.55rem 1.1rem',
            borderRadius: '10px',
            border: adminTab === 'global' ? '1.5px solid #076ABC' : '1px solid #D2E3FC',
            background: adminTab === 'global' ? '#EBF3FD' : '#ffffff',
            color: adminTab === 'global' ? '#002182' : '#496386',
            fontWeight: 800,
            fontSize: '0.86rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            cursor: 'pointer'
          }}
        >
          <Building2 size={16} color={adminTab === 'global' ? '#076ABC' : '#496386'} />
          Horarios Generales de la Clínica
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('doctors')}
          style={{
            padding: '0.55rem 1.1rem',
            borderRadius: '10px',
            border: adminTab === 'doctors' ? '1.5px solid #076ABC' : '1px solid #D2E3FC',
            background: adminTab === 'doctors' ? '#EBF3FD' : '#ffffff',
            color: adminTab === 'doctors' ? '#002182' : '#496386',
            fontWeight: 800,
            fontSize: '0.86rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            cursor: 'pointer'
          }}
        >
          <Stethoscope size={16} color={adminTab === 'doctors' ? '#076ABC' : '#496386'} />
          Horarios por Profesional ({doctors.length})
        </button>
      </div>

      {adminTab === 'doctors' ? (
        /* VISTA: GESTIÓN DE HORARIOS DE MÉDICOS POR RECEPCIÓN */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Selector de Médico */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1.5px solid #D2E3FC',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#EBF3FD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#076ABC' }}>
                <Stethoscope size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7994B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Seleccionar Profesional Médico
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#002182' }}>
                  {selectedDocObj?.name}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#496386' }}>
                  {selectedDocObj?.specialty} · {selectedDocObj?.roomName || 'Consultorio Asignado'}
                </div>
              </div>
            </div>

            <div style={{ minWidth: '260px' }}>
              <select
                value={selectedAdminDoctorId}
                onChange={(e) => setSelectedAdminDoctorId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1.5px solid #076ABC',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: '#002182',
                  outline: 'none',
                  background: '#F5F8FE'
                }}
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.specialty}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
            {/* Franja de Atención del Médico */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '18px',
                border: '1.5px solid #D2E3FC',
                padding: '1.75rem',
                boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EBF3FD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#076ABC' }}>
                  <Clock size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#002182' }}>
                    Horario de Atención en Consultorio
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#496386' }}>Horario de inicio y fin de turnos</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.35rem' }}>
                    Hora de Inicio
                  </label>
                  <input
                    type="time"
                    value={adminDocStart}
                    onChange={(e) => setAdminDocStart(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.35rem' }}>
                    Hora de Finalización
                  </label>
                  <input
                    type="time"
                    value={adminDocEnd}
                    onChange={(e) => setAdminDocEnd(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.35rem' }}>
                  Duración por Consulta
                </label>
                <select
                  value={adminDocSlot}
                  onChange={(e) => setAdminDocSlot(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.88rem', outline: 'none', background: '#ffffff' }}
                >
                  <option value={15}>15 minutos</option>
                  <option value={20}>20 minutos</option>
                  <option value={30}>30 minutos (Estándar)</option>
                  <option value={40}>40 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>60 minutos</option>
                </select>
              </div>
            </div>

            {/* Días de Atención del Médico */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '18px',
                border: '1.5px solid #D2E3FC',
                padding: '1.75rem',
                boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EBF3FD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#076ABC' }}>
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#002182' }}>
                    Días Habilitados de Consultorio
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#496386' }}>Días en que atiende {selectedDocObj?.name}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                {allWorkingDays.map((day) => {
                  const isSelected = adminDocWorkingDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleAdminDocWorkingDay(day)}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: isSelected ? '1.5px solid #076ABC' : '1px solid #D2E3FC',
                        background: isSelected ? '#EBF3FD' : '#ffffff',
                        color: isSelected ? '#002182' : '#496386',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{day}</span>
                      {isSelected && <CheckCircle2 size={16} color="#076ABC" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Texto Público de Días y Horarios para la Web */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '18px',
              border: '1.5px solid #D2E3FC',
              padding: '1.75rem',
              boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EBF3FD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#076ABC' }}>
                <Clock size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#002182' }}>
                  Texto de Días y Horarios para la Web (Visible a Pacientes)
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#496386' }}>
                  Texto visible en la web para {selectedDocObj?.name} (ej: "Consultar en secretaría" o fechas del mes)
                </div>
              </div>
            </div>
            <input
              type="text"
              value={adminDocScheduleDisplay}
              onChange={(e) => setAdminDocScheduleDisplay(e.target.value)}
              placeholder="ej: Consultar en secretaría / Martes, miércoles y jueves por la tarde"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: '1.5px solid #D2E3FC',
                fontSize: '0.9rem',
                outline: 'none',
                fontWeight: 700,
                color: '#002182',
                boxSizing: 'border-box',
                background: '#F8FAFE'
              }}
            />
            <span style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '6px', display: 'block' }}>
              Podés modificar este texto mensualmente cuando cambien las fechas de atención del profesional. Al presionar "Guardar Horarios", se reflejará en la web.
            </span>
          </div>

          {/* Días Bloqueados del Médico */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '18px',
              border: '1.5px solid #D2E3FC',
              padding: '1.75rem',
              boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#991B1B' }}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#002182' }}>
                    Días No Laborables / Ausencias de {selectedDocObj?.name}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#496386' }}>
                    Fechas específicas donde no habrá turnos para este profesional
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <input
                  type="date"
                  value={adminNewBlockedDate}
                  onChange={(e) => setAdminNewBlockedDate(e.target.value)}
                  style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.85rem', outline: 'none' }}
                />
                <button
                  type="button"
                  onClick={handleAddAdminDocBlockedDate}
                  style={{
                    background: '#076ABC',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={16} /> Bloquear Fecha
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
              {adminDocBlocked.length === 0 ? (
                <div style={{ color: '#7994B8', fontSize: '0.85rem', padding: '0.5rem 0' }}>
                  No hay ausencias registradas para este profesional.
                </div>
              ) : (
                adminDocBlocked.map((dateStr) => (
                  <div
                    key={dateStr}
                    style={{
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      color: '#991B1B',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Calendar size={14} />
                    <span>{dateStr}</span>
                    <button
                      type="button"
                      onClick={() => setAdminDocBlocked(adminDocBlocked.filter((d) => d !== dateStr))}
                      style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', padding: 0 }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* VISTA: HORARIOS GLOBALES DE LA CLÍNICA */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
            {/* Left: General Operating Hours */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '18px',
                border: '1.5px solid #D2E3FC',
                padding: '1.75rem',
                boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)'
              }}
            >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EBF3FD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#076ABC' }}>
              <Clock size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#002182' }}>
                Franjas Horarias de Atención
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#496386' }}>Horario general de consultorios y turnero</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.35rem' }}>
                Apertura (Lun a Vie)
              </label>
              <input
                type="time"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.88rem', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.35rem' }}>
                Cierre (Lun a Vie)
              </label>
              <input
                type="time"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.88rem', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.35rem' }}>
                Cierre Sábados
              </label>
              <input
                type="time"
                value={saturdayClosing}
                onChange={(e) => setSaturdayClosing(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.88rem', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.35rem' }}>
                Duración del Turno
              </label>
              <select
                value={slotDuration}
                onChange={(e) => setSlotDuration(Number(e.target.value))}
                style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.88rem', outline: 'none', background: '#ffffff' }}
              >
                <option value={15}>15 minutos</option>
                <option value={20}>20 minutos</option>
                <option value={30}>30 minutos (Estándar)</option>
                <option value={40}>40 minutos</option>
                <option value={45}>45 minutos</option>
                <option value={60}>60 minutos</option>
              </select>
            </div>
          </div>

          <div style={{ background: '#F5F8FE', padding: '1rem', borderRadius: '12px', border: '1px solid #D2E3FC', fontSize: '0.8rem', color: '#496386', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Building2 size={20} color="#076ABC" style={{ flexShrink: 0 }} />
            <div>
              Los cambios impactarán en los turnos asignados desde el wizard de reservas de la web pública de CITRA.
            </div>
          </div>
        </div>

        {/* Right: Operating Days */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            border: '1.5px solid #D2E3FC',
            padding: '1.75rem',
            boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EBF3FD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#076ABC' }}>
              <Calendar size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#002182' }}>
                Días Hábiles Institucionales
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#496386' }}>Días habilitados para atención al público</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1.5rem' }}>
            {allWorkingDays.map((day) => {
              const isSelected = workingDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleGlobalWorkingDay(day)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: isSelected ? '1.5px solid #076ABC' : '1px solid #D2E3FC',
                    background: isSelected ? '#EBF3FD' : '#ffffff',
                    color: isSelected ? '#002182' : '#496386',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{day}</span>
                  {isSelected && <CheckCircle2 size={16} color="#076ABC" />}
                </button>
              );
            })}
          </div>

          <div style={{ background: '#F5F8FE', padding: '1rem', borderRadius: '12px', border: '1px solid #D2E3FC', fontSize: '0.8rem', color: '#002182', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={20} color="#076ABC" style={{ flexShrink: 0 }} />
            <div>
              Estado del Centro: <strong>Abierto Lunes a Sábados</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Blocked Dates Section */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '18px',
          border: '1.5px solid #D2E3FC',
          padding: '1.75rem',
          marginTop: '1.75rem',
          boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#991B1B' }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#002182' }}>
                Feriados y Días No Laborables de la Clínica
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#496386' }}>
                El turnero online bloqueará automáticamente las citas en estas fechas
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <input
              type="date"
              value={newBlockedDate}
              onChange={(e) => setNewBlockedDate(e.target.value)}
              style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.85rem', outline: 'none' }}
            />
            <button
              type="button"
              onClick={handleAddGlobalBlockedDate}
              style={{
                background: '#076ABC',
                color: '#ffffff',
                border: 'none',
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} /> Bloquear Día
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
          {blockedDates.map((dateStr) => (
            <div
              key={dateStr}
              style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#991B1B',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Calendar size={14} />
              <span>{dateStr} (Feriado)</span>
              <button
                type="button"
                onClick={() => setBlockedDates(blockedDates.filter((d) => d !== dateStr))}
                style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', padding: 0 }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )}
</div>
);
};
