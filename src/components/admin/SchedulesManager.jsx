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
  const [blockedDates, setBlockedDates] = useState(clinicSchedule?.blockedDates || ['2026-12-25', '2026-01-01']);
  const [newBlockedDate, setNewBlockedDate] = useState('');

  const allWorkingDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const [workingDays, setWorkingDays] = useState(clinicSchedule?.workingDays || allWorkingDays);

  // Doctor Specific Schedule State
  const [docWorkingDays, setDocWorkingDays] = useState(currentDoctor?.workingDays || ['Lunes', 'Miércoles', 'Viernes']);
  const [docScheduleStart, setDocScheduleStart] = useState(currentDoctor?.scheduleStart || '08:00');
  const [docScheduleEnd, setDocScheduleEnd] = useState(currentDoctor?.scheduleEnd || '14:00');
  const [docSlotDuration, setDocSlotDuration] = useState(currentDoctor?.slotDuration || 30);
  const [docPriceConsultation, setDocPriceConsultation] = useState(currentDoctor?.priceConsultation || 25000);
  const [docFeePercentage, setDocFeePercentage] = useState(currentDoctor?.feePercentage || 75);
  const [docBlockedDates, setDocBlockedDates] = useState(currentDoctor?.blockedDates || ['2026-09-20', '2026-10-12']);
  const [newDocBlockedDate, setNewDocBlockedDate] = useState('');

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

            <div style={{ display: 'flex', gap: '0.6rem' }}>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#002182', margin: '0 0 0.25rem' }}>
            Gestión Central de Horarios de la Clínica
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#496386' }}>
            Configuración global de apertura, turnos estándar, días hábiles y bloqueo de feriados institucionales.
          </p>
        </div>

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
          Guardar Configuración
        </button>
      </div>

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

          <div style={{ display: 'flex', gap: '0.6rem' }}>
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
  );
};
