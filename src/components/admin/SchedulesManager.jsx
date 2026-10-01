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
  UserCheck,
  Users,
  Check,
  Info,
  DoorClosed,
  Percent
} from 'lucide-react';

export const SchedulesManager = () => {
  const {
    clinicSchedule,
    updateClinicSchedule,
    currentDoctor,
    isDoctor,
    updateDoctorSchedule,
    doctors,
    rooms,
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

  // Administrative State: Tab & Selected Doctor for Reception Management (Default to 'doctors')
  const [adminTab, setAdminTab] = useState('doctors'); // 'doctors' | 'global'
  const [selectedAdminDoctorId, setSelectedAdminDoctorId] = useState(() => (doctors && doctors[0]?.id ? doctors[0].id : 'doc-1'));
  const selectedDocObj = (doctors && doctors.find((d) => d.id === selectedAdminDoctorId)) || doctors?.[0] || null;

  const [adminDocWorkingDays, setAdminDocWorkingDays] = useState(selectedDocObj?.workingDays || ['Lunes', 'Miércoles', 'Viernes']);
  const [adminDocStart, setAdminDocStart] = useState(selectedDocObj?.scheduleStart || '08:00');
  const [adminDocEnd, setAdminDocEnd] = useState(selectedDocObj?.scheduleEnd || '14:00');
  const [adminDocSlot, setAdminDocSlot] = useState(selectedDocObj?.slotDuration || 30);
  const [adminDocPrice, setAdminDocPrice] = useState(selectedDocObj?.priceConsultation || 25000);
  const [adminDocFee, setAdminDocFee] = useState(selectedDocObj?.feePercentage || 75);
  const [adminDocRoomId, setAdminDocRoomId] = useState(selectedDocObj?.roomId || selectedDocObj?.room || (rooms && rooms[0]?.id) || 'room-1');
  const [adminDocBlocked, setAdminDocBlocked] = useState(selectedDocObj?.blockedDates || []);
  const [adminDocScheduleDisplay, setAdminDocScheduleDisplay] = useState(selectedDocObj?.scheduleDisplay || '');
  const [adminNewBlockedDate, setAdminNewBlockedDate] = useState('');

  React.useEffect(() => {
    if (selectedDocObj) {
      setAdminDocWorkingDays(selectedDocObj.workingDays || ['Lunes', 'Miércoles', 'Viernes']);
      setAdminDocStart(selectedDocObj.scheduleStart || '08:00');
      setAdminDocEnd(selectedDocObj.scheduleEnd || '14:00');
      setAdminDocSlot(selectedDocObj.slotDuration || 30);
      setAdminDocPrice(selectedDocObj.priceConsultation || 25000);
      setAdminDocFee(selectedDocObj.feePercentage || 75);
      setAdminDocRoomId(selectedDocObj.roomId || selectedDocObj.room || (rooms && rooms[0]?.id) || 'room-1');
      setAdminDocBlocked(selectedDocObj.blockedDates || []);
      setAdminDocScheduleDisplay(selectedDocObj.scheduleDisplay || '');
    }
  }, [selectedAdminDoctorId, selectedDocObj, rooms]);

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
    if (e) e.preventDefault();
    if (!selectedDocObj) return;
    const targetRoom = rooms ? rooms.find((r) => r.id === adminDocRoomId || r.name === adminDocRoomId) : null;
    const roomName = targetRoom?.name || (typeof selectedDocObj.roomName === 'string' ? selectedDocObj.roomName : 'Consultorio 101');
    updateDoctorSchedule(selectedDocObj.id, {
      workingDays: adminDocWorkingDays,
      scheduleStart: adminDocStart,
      scheduleEnd: adminDocEnd,
      slotDuration: Number(adminDocSlot),
      priceConsultation: Number(adminDocPrice),
      feePercentage: Number(adminDocFee),
      roomId: adminDocRoomId,
      roomName: roomName,
      room: targetRoom?.name || selectedDocObj.room,
      blockedDates: adminDocBlocked,
      scheduleDisplay: adminDocScheduleDisplay.trim() || undefined
    });
    addToast('Agenda de Profesional Actualizada', `Se guardó la disponibilidad, aranceles y consultorio de ${selectedDocObj.name}.`, 'success');
  };

  const toggleGlobalWorkingDay = (day) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter((d) => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
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

  // =========================================================================
  // DOCTOR ACCESS RESTRICTION: GESTIÓN EXCLUSIVA DE SECRETARÍA Y ADMINISTRACIÓN
  // =========================================================================
  if (isDoctor) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '65vh',
          textAlign: 'center',
          padding: '2.5rem',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0, 33, 130, 0.04)'
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: '#EFF6FF',
            color: '#002182',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem'
          }}
        >
          <Clock size={32} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
          Gestión de Horarios Centralizada en Secretaría
        </h2>
        <p style={{ fontSize: '0.92rem', color: '#64748b', maxWidth: '540px', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
          La configuración de franjas horarias de consulta, días laborables, aranceles particulares y bloqueos por vacaciones o congresos de cada profesional es administrada de forma centralizada y exclusiva por el equipo de Secretaría y Recepción.
        </p>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            background: '#F8FAFC',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            fontSize: '0.85rem',
            color: '#475569',
            fontWeight: 600
          }}
        >
          <Info size={16} color="#002182" />
          Para solicitar modificaciones en tus días u horarios de atención o registrar ausencias, comunicate con el equipo de Secretaría.
        </div>
      </div>
    );
  }

  // ====================================================
  // VISTA GENERAL PARA PERSONAL ADMINISTRATIVO / SECRETARÍA
  // ====================================================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#002182', margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>
            Gestión Central de Horarios & Disponibilidad
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#496386' }}>
            Administración de días laborables, franjas horarias, aranceles y ausencias por profesional médico.
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
              boxShadow: '0 4px 12px rgba(7, 106, 188, 0.25)',
              transition: 'all 0.15s ease'
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
              boxShadow: '0 4px 12px rgba(7, 106, 188, 0.25)',
              transition: 'all 0.15s ease'
            }}
          >
            <Save size={18} />
            Guardar Horarios de {selectedDocObj?.name?.split(' ')[1] || selectedDocObj?.name || 'Profesional'}
          </button>
        )}
      </div>

      {/* Admin Tabs */}
      <div style={{ display: 'flex', gap: '0.65rem' }}>
        <button
          type="button"
          onClick={() => setAdminTab('doctors')}
          style={{
            padding: '0.55rem 1.15rem',
            borderRadius: '10px',
            border: adminTab === 'doctors' ? '1.5px solid #002182' : '1px solid #D2E3FC',
            background: adminTab === 'doctors' ? '#002182' : '#ffffff',
            color: adminTab === 'doctors' ? '#ffffff' : '#496386',
            fontWeight: 800,
            fontSize: '0.86rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <UserCheck size={16} />
          Horarios por Profesional ({doctors.length})
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('global')}
          style={{
            padding: '0.55rem 1.15rem',
            borderRadius: '10px',
            border: adminTab === 'global' ? '1.5px solid #002182' : '1px solid #D2E3FC',
            background: adminTab === 'global' ? '#002182' : '#ffffff',
            color: adminTab === 'global' ? '#ffffff' : '#496386',
            fontWeight: 800,
            fontSize: '0.86rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Building2 size={16} />
          Horarios Generales de la Clínica
        </button>
      </div>

      {adminTab === 'doctors' ? (
        /* VISTA: GESTIÓN DE HORARIOS DE MÉDICOS POR RECEPCIÓN / SECRETARÍA */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* 1. SELECTOR INTERACTIVO DE PROFESIONALES */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '1.25rem',
              boxShadow: '0 2px 8px rgba(0, 33, 130, 0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={18} color="#002182" />
                  Paso 1: Seleccionar Médico de CITRA
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Haga clic en un profesional para personalizar sus días de atención, horarios, consultorio y aranceles.
                </p>
              </div>

              <div style={{ minWidth: '220px' }}>
                <select
                  value={selectedAdminDoctorId}
                  onChange={(e) => setSelectedAdminDoctorId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.75rem',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#002182',
                    outline: 'none',
                    background: '#f8fafc'
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

            {/* Doctors Grid / Cards Strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '0.85rem'
              }}
            >
              {doctors.map((doc) => {
                const isSelected = (selectedDocObj?.id || selectedAdminDoctorId) === doc.id;
                const daysCount = (doc.workingDays || []).length;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedAdminDoctorId(doc.id)}
                    style={{
                      background: isSelected ? 'linear-gradient(135deg, #F0F6FF 0%, #FFFFFF 100%)' : '#ffffff',
                      border: isSelected ? '2px solid #002182' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(0, 33, 130, 0.08)' : 'none',
                      position: 'relative'
                    }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'rgba(7, 106, 188, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#002182',
                        flexShrink: 0,
                        border: isSelected ? '2px solid #002182' : '1px solid #BFDBFE'
                      }}
                      title="Médico"
                    >
                      <Stethoscope size={18} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: isSelected ? '#002182' : '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#076ABC', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.specialty?.toLowerCase().includes('traumatolog') ? 'Traumatólogo' : doc.specialty}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: daysCount > 0 ? '#166534' : '#991b1b',
                            background: daysCount > 0 ? '#dcfce7' : '#fee2e2',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '4px'
                          }}
                        >
                          {daysCount > 0 ? `${daysCount} días de atención` : 'Sin días asignados'}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: '#002182',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. PANEL DE EDICIÓN DEL MÉDICO SELECCIONADO */}
          {selectedDocObj && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Doctor Header Banner */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  padding: '1.15rem 1.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  boxShadow: '0 2px 8px rgba(0, 33, 130, 0.03)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: 'rgba(7, 106, 188, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#002182',
                      flexShrink: 0,
                      border: '2px solid #002182',
                      boxShadow: '0 2px 8px rgba(0,33,130,0.1)'
                    }}
                    title="Médico"
                  >
                    <Stethoscope size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
                        {selectedDocObj.name}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          background: '#EFF6FF',
                          color: '#1D4ED8',
                          border: '1px solid #BFDBFE',
                          padding: '0.15rem 0.55rem',
                          borderRadius: '6px'
                        }}
                      >
                        {selectedDocObj.specialty?.toLowerCase().includes('traumatolog') ? 'Traumatólogo' : selectedDocObj.specialty}
                      </span>
                    </div>
                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                      Configurando horarios y condiciones para Secretaría · Sede Central CITRA
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveAdminDoctor}
                  style={{
                    background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(7, 106, 188, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Save size={16} />
                  Guardar Cambios
                </button>
              </div>

              {/* 3. ROW DE CONFIGURACIÓN PRINCIPAL: FRANJA HORARIA (IZQ) Y DÍAS LABORABLES (DER) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
                {/* Left Card: Franja Horaria de Consultas & Aranceles */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    padding: '1.5rem',
                    boxShadow: '0 2px 8px rgba(0, 33, 130, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#002182' }}>
                      <Clock size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                        Franja Horaria de Consultas
                      </h3>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Horario de inicio, fin y aranceles por paciente</div>
                    </div>
                  </div>

                  {/* Horas Inicio y Fin */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '0.35rem' }}>
                        Hora de Inicio
                      </label>
                      <input
                        type="time"
                        value={adminDocStart}
                        onChange={(e) => setAdminDocStart(e.target.value)}
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          color: '#0f172a',
                          outline: 'none',
                          background: '#f8fafc'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '0.35rem' }}>
                        Hora de Finalización
                      </label>
                      <input
                        type="time"
                        value={adminDocEnd}
                        onChange={(e) => setAdminDocEnd(e.target.value)}
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          color: '#0f172a',
                          outline: 'none',
                          background: '#f8fafc'
                        }}
                      />
                    </div>
                  </div>

                  {/* Duración del Turno / Consulta */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '0.35rem' }}>
                      Duración del Turno / Consulta (minutos)
                    </label>
                    <select
                      value={adminDocSlot}
                      onChange={(e) => setAdminDocSlot(Number(e.target.value))}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        outline: 'none',
                        background: '#f8fafc'
                      }}
                    >
                      <option value={15}>15 minutos (Control rápido)</option>
                      <option value={20}>20 minutos (Consulta ágil)</option>
                      <option value={30}>30 minutos (Consulta estándar recomendada)</option>
                      <option value={40}>40 minutos (Evaluación traumatológica)</option>
                      <option value={45}>45 minutos (Kinesiología / Evaluación completa)</option>
                      <option value={60}>60 minutos (Procedimiento / Cirugía menor)</option>
                    </select>
                  </div>

                  {/* Arancel Particular y % Honorario */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '0.35rem' }}>
                        Arancel Particular ($)
                      </label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: '#64748b' }}>
                          $
                        </span>
                        <input
                          type="number"
                          value={adminDocPrice}
                          onChange={(e) => setAdminDocPrice(Number(e.target.value))}
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '0.65rem 0.85rem 0.65rem 1.85rem',
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.9rem',
                            fontWeight: 800,
                            color: '#0f172a',
                            outline: 'none',
                            background: '#f8fafc'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '0.35rem' }}>
                        % Honorario Profesional
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={adminDocFee}
                          onChange={(e) => setAdminDocFee(Number(e.target.value))}
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '0.65rem 1.85rem 0.65rem 0.85rem',
                            borderRadius: '8px',
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.9rem',
                            fontWeight: 800,
                            color: '#0f172a',
                            outline: 'none',
                            background: '#f8fafc'
                          }}
                        />
                        <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: '#64748b' }}>
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Card: Días Laborables & Consultorio Físico */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    padding: '1.5rem',
                    boxShadow: '0 2px 8px rgba(0, 33, 130, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#002182' }}>
                      <Calendar size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                        Días Laborables
                      </h3>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Selecciona los días en que abre agenda en consultorio</div>
                    </div>
                  </div>

                  {/* 6 Day Pills Grid Matching the Screenshot */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                    {allWorkingDays.map((day) => {
                      const isSelected = adminDocWorkingDays.includes(day);
                      return (
                        <div
                          key={day}
                          onClick={() => toggleAdminDocWorkingDay(day)}
                          style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            border: isSelected ? '1.5px solid #002182' : '1px solid #e2e8f0',
                            background: isSelected ? '#ffffff' : '#f8fafc',
                            color: isSelected ? '#002182' : '#64748b',
                            fontWeight: isSelected ? 800 : 600,
                            fontSize: '0.88rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            boxShadow: isSelected ? '0 2px 6px rgba(0, 33, 130, 0.06)' : 'none',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>{day}</span>
                          <div
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              border: isSelected ? '2px solid #002182' : '1.5px solid #cbd5e1',
                              background: isSelected ? '#002182' : '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff'
                            }}
                          >
                            {isSelected && <Check size={11} strokeWidth={3} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Consultorio Físico Asignado Selector */}
                  <div
                    style={{
                      background: '#F8FAFC',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <DoorClosed size={18} color="#002182" />
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>
                        Consultorio Físico Asignado
                      </span>
                    </div>

                    <select
                      value={adminDocRoomId}
                      onChange={(e) => setAdminDocRoomId(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        outline: 'none',
                        background: '#ffffff'
                      }}
                    >
                      {rooms && rooms.length > 0 ? (
                        rooms.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} — {r.specialty || 'General'}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="room-1">Consultorio 101 — Traumatología</option>
                          <option value="room-2">Consultorio 102 — Fisiatría & Kinesio</option>
                          <option value="room-3">Consultorio 103 — Kinesiología & Rehab</option>
                          <option value="room-4">Consultorio 104 — Ecografía & RX</option>
                        </>
                      )}
                    </select>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Asignación física en sede central CITRA para recepción y direccionamiento de pacientes.
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. TEXTO PÚBLICO PARA LA WEB */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  padding: '1.25rem 1.5rem',
                  boxShadow: '0 2px 8px rgba(0, 33, 130, 0.03)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#002182' }}>
                    <Clock size={18} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                      Texto de Días y Horarios para la Web (Visible a Pacientes)
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Información pública que se muestra en la cartilla médica de la web (ej: "Lunes, Miércoles y Viernes de 08:00 a 14:00 hs")
                    </div>
                  </div>
                </div>

                <input
                  type="text"
                  value={adminDocScheduleDisplay}
                  onChange={(e) => setAdminDocScheduleDisplay(e.target.value)}
                  placeholder="ej: Consultar en secretaría / Lunes, Miércoles y Viernes de 08:00 a 14:00 hs"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '0.7rem 0.95rem',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    fontWeight: 700,
                    color: '#0f172a',
                    background: '#f8fafc'
                  }}
                />
              </div>

              {/* 5. DÍAS BLOQUEADOS / VACACIONES / CONGRESOS */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  padding: '1.5rem',
                  boxShadow: '0 2px 8px rgba(0, 33, 130, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#991B1B' }}>
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                        Días Bloqueados / Vacaciones / Congresos
                      </h3>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        En estas fechas los pacientes no podrán reservar turnos con {selectedDocObj.name}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <input
                      type="date"
                      value={adminNewBlockedDate}
                      onChange={(e) => setAdminNewBlockedDate(e.target.value)}
                      style={{
                        padding: '0.55rem 0.85rem',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.85rem',
                        outline: 'none',
                        background: '#f8fafc'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddAdminDocBlockedDate}
                      style={{
                        background: '#002182',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.55rem 1.1rem',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Plus size={16} /> Bloquear Fecha
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginTop: '0.25rem' }}>
                  {adminDocBlocked.length === 0 ? (
                    <div style={{ color: '#64748b', fontSize: '0.85rem', padding: '0.5rem 0' }}>
                      No tiene fechas bloqueadas actualmente. La agenda de {selectedDocObj.name} está 100% disponible en sus días habituales.
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
                          title="Desbloquear fecha"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom Sticky Action Bar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.85rem',
                  padding: '1rem 0'
                }}
              >
                <button
                  type="button"
                  onClick={handleSaveAdminDoctor}
                  style={{
                    background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.75rem 1.6rem',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0, 33, 130, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Save size={18} />
                  Guardar Horarios y Condiciones de {selectedDocObj.name}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* VISTA: HORARIOS GLOBALES DE LA CLÍNICA */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {/* Left: General Operating Hours */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1.5px solid #D2E3FC',
                padding: '1.5rem',
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
                borderRadius: '16px',
                border: '1.5px solid #D2E3FC',
                padding: '1.5rem',
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
              borderRadius: '16px',
              border: '1.5px solid #D2E3FC',
              padding: '1.5rem',
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
