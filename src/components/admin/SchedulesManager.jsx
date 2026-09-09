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
  ShieldCheck
} from 'lucide-react';

export const SchedulesManager = () => {
  const { clinicSchedule, updateClinicSchedule, addToast } = useClinic();

  const [openingTime, setOpeningTime] = useState(clinicSchedule?.openingTime || '08:00');
  const [closingTime, setClosingTime] = useState(clinicSchedule?.closingTime || '20:00');
  const [saturdayClosing, setSaturdayClosing] = useState(clinicSchedule?.saturdayClosingTime || '13:00');
  const [slotDuration, setSlotDuration] = useState(clinicSchedule?.slotDuration || 30);
  const [blockedDates, setBlockedDates] = useState(clinicSchedule?.blockedDates || ['2026-12-25', '2026-01-01']);
  const [newBlockedDate, setNewBlockedDate] = useState('');

  const allWorkingDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const [workingDays, setWorkingDays] = useState(clinicSchedule?.workingDays || allWorkingDays);

  const toggleWorkingDay = (day) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter((d) => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  const handleAddBlockedDate = () => {
    if (!newBlockedDate) return;
    if (blockedDates.includes(newBlockedDate)) {
      addToast('Fecha ya bloqueada', 'Esta fecha ya figura en el calendario de excepciones.', 'info');
      return;
    }
    setBlockedDates([...blockedDates, newBlockedDate]);
    setNewBlockedDate('');
    addToast('Día Bloqueado', 'Se añadió el día no laborable / feriado.', 'success');
  };

  const handleRemoveBlockedDate = (d) => {
    setBlockedDates(blockedDates.filter((item) => item !== d));
  };

  const handleSave = (e) => {
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

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#002182', margin: '0 0 0.25rem' }}>
            Gestión de Horarios y Disponibilidad
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#496386' }}>
            Configuración global de apertura, turnos estándar, días hábiles y bloqueo de feriados.
          </p>
        </div>

        <button
          onClick={handleSave}
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
                Duración Turno Base
              </label>
              <select
                value={slotDuration}
                onChange={(e) => setSlotDuration(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.88rem', outline: 'none', background: '#ffffff' }}
              >
                <option value={15}>15 minutos</option>
                <option value={20}>20 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={45}>45 minutos</option>
              </select>
            </div>
          </div>

          {/* Working Days */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.5rem' }}>
              Días de Funcionamiento Clínico
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {allWorkingDays.map((d) => {
                const isSelected = workingDays.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleWorkingDay(d)}
                    style={{
                      background: isSelected ? '#002182' : '#F5F8FE',
                      color: isSelected ? '#ffffff' : '#002182',
                      border: isSelected ? '1.5px solid #002182' : '1.5px solid #D2E3FC',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Blocked Dates & Holidays */}
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
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#991b1b' }}>
              <Calendar size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#002182' }}>
                Feriados y Fechas Bloqueadas
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#496386' }}>Días sin disponibilidad de turnos online</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <input
              type="date"
              value={newBlockedDate}
              onChange={(e) => setNewBlockedDate(e.target.value)}
              style={{ flex: 1, padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.85rem', outline: 'none' }}
            />
            <button
              type="button"
              onClick={handleAddBlockedDate}
              style={{
                background: '#076ABC',
                color: '#ffffff',
                border: 'none',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Plus size={16} />
              Bloquear
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto' }}>
            {blockedDates.length === 0 ? (
              <div style={{ fontSize: '0.82rem', color: '#7994B8', fontStyle: 'italic', padding: '1rem', textAlign: 'center' }}>
                No hay fechas bloqueadas actualmente.
              </div>
            ) : (
              blockedDates.map((d) => (
                <div
                  key={d}
                  style={{
                    background: '#F5F8FE',
                    border: '1px solid #D2E3FC',
                    borderRadius: '8px',
                    padding: '0.6rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.84rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#002182', fontWeight: 700 }}>
                    <Calendar size={14} color="#e11d48" />
                    <span>{d} (Feriado / Receso)</span>
                  </div>

                  <button
                    onClick={() => handleRemoveBlockedDate(d)}
                    style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer', padding: '0.2rem' }}
                    title="Desbloquear fecha"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
