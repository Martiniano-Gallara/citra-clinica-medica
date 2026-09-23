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
  User
} from 'lucide-react';

export const DoctorsManager = () => {
  const { doctors, addDoctor, updateDoctor, deleteDoctor, specialties } = useClinic();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

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
                  <img
                    src={doc.avatar || 'https://images.unsplash.com/photo-1622253692010?w=120'}
                    alt={doc.name}
                    style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#002182' }}>
                      {doc.name}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: '#076ABC', fontWeight: 700 }}>
                      {doc.specialty}
                    </div>
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
                <div style={{ fontSize: '0.75rem', color: '#076ABC', marginTop: '2px', fontWeight: 700 }}>
                  Horario Web: {doc.scheduleDisplay || (doc.workingDays ? doc.workingDays.join(', ') : 'Consultar en secretaría')}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', borderTop: '1px solid #EDF3FD', paddingTop: '1rem' }}>
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
                    Matrícula (MN / MP)
                  </label>
                  <input
                    type="text"
                    value={license}
                    onChange={(e) => setLicense(e.target.value)}
                    placeholder="MN 124991 / MP 39810"
                    style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '8px', border: '1.5px solid #D2E3FC', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>

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
    </div>
  );
};
