import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Stethoscope,
  Plus,
  Edit2,
  Trash2,
  Clock,
  MapPin,
  Award,
  Star,
  CheckCircle2,
  X,
  User,
  DollarSign,
  KeyRound,
  Lock
} from 'lucide-react';

export const DoctorsManager = () => {
  const {
    doctors,
    addDoctor,
    updateDoctor,
    deleteDoctor,
    specialties,
    users = [],
    setUsers,
    updateUser,
    addToast,
    logAudit
  } = useClinic();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  // Password reset modal states (Secretaría puede cambiar contraseñas si alguno se olvida)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordDoctor, setPasswordDoctor] = useState(null);
  const [newPasswordValue, setNewPasswordValue] = useState('citra2026');

  // Form states
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState(specialties[0]?.name || 'Traumatología');
  const [license, setLicense] = useState('');
  const [roomName, setRoomName] = useState('Consultorio 101');
  const [scheduleStart, setScheduleStart] = useState('08:30');
  const [scheduleEnd, setScheduleEnd] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState(30);
  const [priceConsultation, setPriceConsultation] = useState(25000);
  const [selectedDays, setSelectedDays] = useState(['Lunes', 'Miércoles', 'Viernes']);
  const [scheduleDisplay, setScheduleDisplay] = useState('');

  const allDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleChangeDoctorPassword = (e) => {
    e.preventDefault();
    if (!passwordDoctor) return;
    const newPwd = newPasswordValue.trim() || 'citra2026';

    const matchedUser = users.find(
      (u) =>
        u.doctorId === passwordDoctor.id ||
        (u.email && passwordDoctor.email && u.email.toLowerCase() === passwordDoctor.email.toLowerCase()) ||
        (u.name && passwordDoctor.name && u.name.toLowerCase() === passwordDoctor.name.toLowerCase())
    );

    if (matchedUser && typeof updateUser === 'function') {
      updateUser(matchedUser.id, { password: newPwd });
    } else if (setUsers) {
      setUsers((prev) =>
        prev.map((u) =>
          u.doctorId === passwordDoctor.id || (u.name && u.name.includes(passwordDoctor.name))
            ? { ...u, password: newPwd }
            : u
        )
      );
    }

    if (updateDoctor) {
      updateDoctor(passwordDoctor.id, { password: newPwd });
    }

    if (addToast) {
      addToast('Contraseña Actualizada', `Nueva clave asignada al ${passwordDoctor.name}.`, 'success');
    }
    if (logAudit) {
      logAudit('UPDATE_PASSWORD', 'Cuerpo Médico', passwordDoctor.email || passwordDoctor.name, `Secretaría actualizó la contraseña de acceso para ${passwordDoctor.name}.`);
    }

    setIsPasswordModalOpen(false);
    setPasswordDoctor(null);
    setNewPasswordValue('citra2026');
  };

  const handleOpenAdd = () => {
    setEditingDoctor(null);
    setName('');
    setSpecialty(specialties[0]?.name || 'Traumatología');
    setLicense('');
    setRoomName('Consultorio 101');
    setScheduleStart('08:30');
    setScheduleEnd('17:00');
    setSlotDuration(30);
    setPriceConsultation(25000);
    setSelectedDays(['Lunes', 'Miércoles', 'Viernes']);
    setScheduleDisplay('Consultar en secretaría');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doc) => {
    setEditingDoctor(doc);
    setName(doc.name);
    setSpecialty(doc.specialty);
    setLicense(doc.license || '');
    setRoomName(doc.roomName || 'Consultorio 101');
    setScheduleStart(doc.scheduleStart || '08:30');
    setScheduleEnd(doc.scheduleEnd || '17:00');
    setSlotDuration(doc.slotDuration || 30);
    setPriceConsultation(doc.priceConsultation || 25000);
    setSelectedDays(doc.workingDays || ['Lunes', 'Miércoles', 'Viernes']);
    setScheduleDisplay(doc.scheduleDisplay || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const matchedSpec = specialties.find((s) => s.name === specialty);

    if (editingDoctor) {
      updateDoctor(editingDoctor.id, {
        name: name.trim(),
        specialty,
        specialtyId: matchedSpec?.id || 'spec-1',
        license: license.trim(),
        roomName,
        scheduleStart,
        scheduleEnd,
        slotDuration: Number(slotDuration),
        priceConsultation: Number(priceConsultation),
        workingDays: selectedDays,
        scheduleDisplay: scheduleDisplay.trim() || undefined
      });
    } else {
      addDoctor({
        name: name.trim(),
        specialty,
        specialtyId: matchedSpec?.id || 'spec-1',
        license: license.trim() || 'MN 114829',
        roomName,
        scheduleStart,
        scheduleEnd,
        slotDuration: Number(slotDuration),
        priceConsultation: Number(priceConsultation),
        workingDays: selectedDays,
        scheduleDisplay: scheduleDisplay.trim() || undefined
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#002182', margin: '0 0 0.25rem' }}>
            Gestión de Profesionales Médicos
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#496386' }}>
            Alta de profesionales, asignación de consultorios, matrículas y disponibilidad horaria.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
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
            gap: '0.45rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(7, 106, 188, 0.25)'
          }}
        >
          <Plus size={18} />
          Nuevo Profesional
        </button>
      </div>

      {/* Grid of Doctors */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {doctors.map((doc) => (
          <div
            key={doc.id}
            style={{
              background: '#ffffff',
              borderRadius: '18px',
              border: '1.5px solid #D2E3FC',
              padding: '1.5rem',
              boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: 'rgba(7, 106, 188, 0.1)',
                      border: '1.5px solid #BFDBFE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#002182',
                      flexShrink: 0
                    }}
                    title="Profesional Médico CITRA"
                  >
                    <Stethoscope size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#002182' }}>
                        {doc.name}
                      </h3>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          background: '#EFF6FF',
                          color: '#076ABC',
                          border: '1px solid #BFDBFE',
                          padding: '0.12rem 0.55rem',
                          borderRadius: '6px'
                        }}
                      >
                        {doc.specialty?.toLowerCase().includes('traumatolog') ? 'Traumatólogo' : (doc.specialty || 'Especialista')}
                      </span>
                    </div>
                    {doc.license && (
                      <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                        {doc.license}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span
                    onClick={() => updateDoctor(doc.id, { active: !doc.active })}
                    style={{
                      cursor: 'pointer',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '100px',
                      background: doc.active !== false ? '#d1fae5' : '#fee2e2',
                      color: doc.active !== false ? '#065f46' : '#991b1b'
                    }}
                  >
                    {doc.active !== false ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.82rem', color: '#496386', background: '#F5F8FE', padding: '0.85rem', borderRadius: '12px', border: '1px solid #D2E3FC', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Award size={14} color="#076ABC" />
                  <span>Matrícula: <strong>{doc.license || 'MN 114829'}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={14} color="#076ABC" />
                  <span>{doc.roomName || 'Consultorio Principal'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={14} color="#076ABC" />
                  <span>{doc.scheduleStart || '08:30'} a {doc.scheduleEnd || '17:00'} hs ({doc.slotDuration || 30} min)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <DollarSign size={14} color="#076ABC" />
                  <span>Arancel Privado: <strong>${(doc.priceConsultation || 25000).toLocaleString('es-AR')}</strong></span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#076ABC', marginTop: '2px', fontWeight: 700 }}>
                  Horario Web: {doc.scheduleDisplay || (doc.workingDays ? doc.workingDays.join(', ') : 'Consultar en secretaría')}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #EDF3FD', paddingTop: '1rem' }}>
              <button
                onClick={() => handleOpenEdit(doc)}
                style={{
                  flex: 1,
                  background: '#F5F8FE',
                  border: '1px solid #D2E3FC',
                  color: '#002182',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer'
                }}
              >
                <Edit2 size={14} />
                Editar
              </button>

              <button
                onClick={() => {
                  setPasswordDoctor(doc);
                  setNewPasswordValue('citra2026');
                  setIsPasswordModalOpen(true);
                }}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer'
                }}
                title="Cambiar o blanquear contraseña del médico"
              >
                <KeyRound size={14} />
                Clave
              </button>

              <button
                onClick={() => deleteDoctor(doc.id)}
                style={{
                  background: '#fff1f2',
                  border: '1px solid #fecdd3',
                  color: '#e11d48',
                  padding: '0.5rem 0.8rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Doctor Add/Edit */}
      {isModalOpen && (
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
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ background: '#002182', color: '#ffffff', padding: '1.5rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                {editingDoctor ? 'Editar Profesional Médico' : 'Agregar Nuevo Profesional'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                    Nombre del Médico *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Fernando Peralta"
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                    Especialidad *
                  </label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.85rem', outline: 'none', background: '#ffffff' }}
                  >
                    {specialties.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                    Consultorio Asignado
                  </label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Consultorio 204"
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                    Arancel Consulta Privada ($)
                  </label>
                  <input
                    type="number"
                    value={priceConsultation}
                    onChange={(e) => setPriceConsultation(Number(e.target.value))}
                    placeholder="25000"
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                    Hora Inicio
                  </label>
                  <input
                    type="time"
                    value={scheduleStart}
                    onChange={(e) => setScheduleStart(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                    Hora Fin
                  </label>
                  <input
                    type="time"
                    value={scheduleEnd}
                    onChange={(e) => setScheduleEnd(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                    Intervalo (min)
                  </label>
                  <select
                    value={slotDuration}
                    onChange={(e) => setSlotDuration(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.85rem', background: '#ffffff' }}
                  >
                    <option value={15}>15 min</option>
                    <option value={20}>20 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                  </select>
                </div>
              </div>

              {/* Working Days selector */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.4rem' }}>
                  Días de Atención
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {allDays.map((d) => {
                    const isSelected = selectedDays.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDay(d)}
                        style={{
                          background: isSelected ? '#002182' : '#F5F8FE',
                          color: isSelected ? '#ffffff' : '#002182',
                          border: isSelected ? '1.5px solid #002182' : '1.5px solid #D2E3FC',
                          padding: '0.4rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
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

              {/* Texto de Días y Horarios para la Web */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                  Texto de Días y Horarios para la Web (Visible al paciente)
                </label>
                <input
                  type="text"
                  value={scheduleDisplay}
                  onChange={(e) => setScheduleDisplay(e.target.value)}
                  placeholder="ej: Consultar en secretaría / Martes y jueves por la tarde"
                  style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                />
                <span style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '3px', display: 'block' }}>
                  Texto que verán los pacientes en la página de CITRA. Podés cambiarlo cada mes si varían las fechas de atención.
                </span>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.85rem',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer'
                }}
              >
                {editingDoctor ? 'Guardar Cambios' : 'Registrar Profesional'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Modal Cambio de Contraseña por Secretaría */}
      {isPasswordModalOpen && passwordDoctor && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 33, 130, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            padding: '1rem'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '460px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              position: 'relative'
            }}
          >
            <button
              onClick={() => {
                setIsPasswordModalOpen(false);
                setPasswordDoctor(null);
              }}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748B'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#002182'
                }}
              >
                <KeyRound size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#002182' }}>
                  Blanquear / Cambiar Clave
                </h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>
                  {passwordDoctor.name} · {passwordDoctor.specialty}
                </p>
              </div>
            </div>

            <p style={{ fontSize: '0.83rem', color: '#475569', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Como secretaría podés resetear la contraseña del profesional si la olvidó. El médico podrá luego iniciar sesión y cambiarla desde su módulo de Configuración.
            </p>

            <form onSubmit={handleChangeDoctorPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1E293B', marginBottom: '0.35rem' }}>
                  Nueva Contraseña para el Profesional
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={newPasswordValue}
                    onChange={(e) => setNewPasswordValue(e.target.value)}
                    required
                    placeholder="ej: citra2026"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                      borderRadius: '8px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setNewPasswordValue('citra2026')}
                    style={{ fontSize: '0.72rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer', color: '#475569' }}
                  >
                    Usar por defecto: citra2026
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setPasswordDoctor(null);
                  }}
                  style={{
                    flex: 1,
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#475569',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  Guardar Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
