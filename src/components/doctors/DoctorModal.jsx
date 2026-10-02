import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Modal } from '../common/Modal';
import { UserCheck, Shield, Clock, Building, DollarSign } from 'lucide-react';

export const DoctorModal = () => {
  const {
    isDoctorModalOpen,
    setIsDoctorModalOpen,
    doctorModalData,
    specialties,
    addSpecialty,
    rooms,
    addDoctor,
    updateDoctor,
    addToast
  } = useClinic();

  const [isCustomSpecialty, setIsCustomSpecialty] = useState(false);
  const [customSpecialty, setCustomSpecialty] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    specialtyId: specialties[0]?.id || '',
    specialtyName: specialties[0]?.name || '',
    license: '',
    email: '',
    phone: '',
    roomId: rooms[0]?.id || '',
    roomName: rooms[0]?.name || '',
    color: '#2563eb',
    workingDays: ['Lunes', 'Miércoles', 'Viernes'],
    scheduleStart: '08:00',
    scheduleEnd: '14:00',
    slotDuration: 30,
    priceConsultation: 20000,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
  });

  const daysList = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  useEffect(() => {
    if (doctorModalData) {
      setFormData(doctorModalData);
    } else {
      const defaultEsp = specialties[0] || {};
      const defaultRoom = rooms[0] || {};
      setFormData({
        name: '',
        specialtyId: defaultEsp.id || '',
        specialtyName: defaultEsp.name || '',
        license: '',
        email: '',
        phone: '',
        roomId: defaultRoom.id || '',
        roomName: defaultRoom.name || '',
        color: '#2563eb',
        workingDays: ['Lunes', 'Miércoles', 'Viernes'],
        scheduleStart: '08:00',
        scheduleEnd: '14:00',
        slotDuration: 30,
        priceConsultation: 20000,
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
      });
    }
  }, [doctorModalData, isDoctorModalOpen, specialties, rooms]);

  const handleSpecialtyChange = (e) => {
    const sId = e.target.value;
    const s = specialties.find((sp) => sp.id === sId);
    if (s) {
      setFormData((prev) => ({
        ...prev,
        specialtyId: s.id,
        specialtyName: s.name,
        slotDuration: s.defaultDuration || prev.slotDuration
      }));
    }
  };

  const toggleDay = (day) => {
    setFormData((prev) => {
      const days = prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day];
      return { ...prev, workingDays: days };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      addToast('Error', 'El nombre es obligatorio.', 'error');
      return;
    }

    let finalSpecialtyName = isCustomSpecialty ? customSpecialty.trim() : formData.specialtyName;
    if (!finalSpecialtyName) {
      finalSpecialtyName = specialties[0]?.name || 'Traumatología';
    }

    let matchedSpec = specialties.find(
      (s) => s.name.toLowerCase() === finalSpecialtyName.toLowerCase()
    );

    if (!matchedSpec) {
      const newSpecId = `esp-${Date.now()}`;
      matchedSpec = {
        id: newSpecId,
        name: finalSpecialtyName,
        color: '#076ABC',
        category: 'Especialidades',
        defaultDuration: Number(formData.slotDuration) || 30
      };
      if (typeof addSpecialty === 'function') {
        addSpecialty(matchedSpec);
      }
    }

    const payload = {
      ...formData,
      specialty: finalSpecialtyName,
      specialtyName: finalSpecialtyName,
      specialtyId: matchedSpec?.id || 'spec-1',
      license: '',
      roomName: ''
    };

    if (doctorModalData) {
      updateDoctor(doctorModalData.id, payload);
    } else {
      addDoctor(payload);
    }
    setIsDoctorModalOpen(false);
  };

  return (
    <Modal
      isOpen={isDoctorModalOpen}
      onClose={() => setIsDoctorModalOpen(false)}
      title={doctorModalData ? 'Editar Profesional' : 'Alta de Nuevo Profesional'}
      size="lg"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsDoctorModalOpen(false)}
          >
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
            {doctorModalData ? 'Guardar Cambios' : 'Registrar Profesional'}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Nombre y Apellido *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ej: Dra. Gabriela Suárez"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Especialidad Principal *</label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomSpecialty(!isCustomSpecialty);
                  if (!isCustomSpecialty) setCustomSpecialty('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#076ABC',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline'
                }}
              >
                {isCustomSpecialty ? '← Elegir de la lista' : '+ Nueva especialidad'}
              </button>
            </div>

            {isCustomSpecialty ? (
              <input
                type="text"
                className="form-control"
                placeholder="Escriba nueva especialidad (ej: Flebología)"
                value={customSpecialty}
                onChange={(e) => setCustomSpecialty(e.target.value)}
                required
              />
            ) : (
              <select
                className="form-control"
                value={formData.specialtyId}
                onChange={(e) => {
                  if (e.target.value === '__NEW__') {
                    setIsCustomSpecialty(true);
                    setCustomSpecialty('');
                  } else {
                    handleSpecialtyChange(e);
                  }
                }}
              >
                {specialties.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
                <option value="__NEW__">+ Agregar otra especialidad...</option>
              </select>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Teléfono de Contacto</label>
            <input
              type="text"
              className="form-control"
              placeholder="+54 11 5500-1122"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Profesional</label>
            <input
              type="email"
              className="form-control"
              placeholder="doctor@citramed.com.ar"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Valor Consulta Particular ($)</label>
            <input
              type="number"
              className="form-control"
              value={formData.priceConsultation}
              onChange={(e) => setFormData({ ...formData, priceConsultation: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Disponibilidad y Días */}
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2563eb', margin: '1rem 0 0.5rem' }}>
          Días y Horarios de Atención
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {daysList.map((day) => {
            const isSelected = formData.workingDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => toggleDay(day)}
              >
                {day}
              </button>
            );
          })}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Horario Inicio</label>
            <select
              className="form-control"
              value={formData.scheduleStart}
              onChange={(e) => setFormData({ ...formData, scheduleStart: e.target.value })}
            >
              {['07:00', '08:00', '08:30', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'].map((h) => (
                <option key={h} value={h}>{h} hs</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Horario Fin</label>
            <select
              className="form-control"
              value={formData.scheduleEnd}
              onChange={(e) => setFormData({ ...formData, scheduleEnd: e.target.value })}
            >
              {['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'].map((h) => (
                <option key={h} value={h}>{h} hs</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Duración por Turno (min)</label>
            <select
              className="form-control"
              value={formData.slotDuration}
              onChange={(e) => setFormData({ ...formData, slotDuration: Number(e.target.value) })}
            >
              <option value={15}>15 minutos</option>
              <option value={20}>20 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={60}>60 minutos</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
};
