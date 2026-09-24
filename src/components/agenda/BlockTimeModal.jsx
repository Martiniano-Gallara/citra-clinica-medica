import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Modal } from '../common/Modal';
import { Lock, AlertCircle } from 'lucide-react';

import { getTodayArgentina } from '../../utils/dateUtils';

export const BlockTimeModal = () => {
  const {
    isBlockTimeModalOpen,
    setIsBlockTimeModalOpen,
    doctors,
    patients,
    addAppointment,
    addToast
  } = useClinic();

  const [formData, setFormData] = useState({
    doctorId: doctors[0]?.id || '',
    date: getTodayArgentina(),
    time: '14:00',
    duration: 60,
    reason: 'Bloqueo por Reunión Clínica / Congreso'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const doc = doctors.find((d) => d.id === formData.doctorId);
    const validPatientId = patients.find((p) => p.id === 'pat-block')?.id || patients[0]?.id || 'pat-1';

    addAppointment({
      patientId: validPatientId,
      patientName: `[BLOQUEO INSTITUCIONAL] — ${formData.reason}`,
      patientPhone: '-',
      patientDni: '00000000',
      patientInsurance: 'Institucional / Clínica',
      doctorId: formData.doctorId,
      doctorName: doc ? doc.name : 'Médico',
      specialtyId: doc?.specialtyId || '',
      specialtyName: doc?.specialtyName || '',
      roomId: doc?.roomId || 'room-101',
      roomName: doc?.roomName || 'Consultorio',
      date: formData.date,
      time: formData.time,
      duration: formData.duration,
      status: 'confirmado',
      reason: `[BLOQUEO DE HORARIO] ${formData.reason}`,
      copayAmount: 0,
      isPaid: true,
      paymentMethod: '-',
      notes: 'Franja bloqueada institucionalmente en agenda'
    });
    addToast('Horario Bloqueado', `Franja horaria reservada para ${doc?.name || 'el profesional'}.`, 'warning');
    setIsBlockTimeModalOpen(false);
  };

  return (
    <Modal
      isOpen={isBlockTimeModalOpen}
      onClose={() => setIsBlockTimeModalOpen(false)}
      title="Bloquear Franja Horaria de Agenda"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsBlockTimeModalOpen(false)}
          >
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
            Confirmar Bloqueo
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Profesional / Médico *</label>
          <select
            className="form-control"
            value={formData.doctorId}
            onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
            required
          >
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} ({doc.specialtyName})
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Fecha del Bloqueo *</label>
            <input
              type="date"
              className="form-control"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hora de Inicio *</label>
            <select
              className="form-control"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
            >
              {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map((h) => (
                <option key={h} value={h}>{h} hs</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Duración</label>
            <select
              className="form-control"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
            >
              <option value={30}>30 min</option>
              <option value={60}>1 hora</option>
              <option value={120}>2 horas</option>
              <option value={240}>Media Jornada (4 hs)</option>
              <option value={480}>Jornada Completa (8 hs)</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Motivo del Bloqueo</label>
          <input
            type="text"
            className="form-control"
            placeholder="Ej: Congreso médico, Vacaciones, Licencia, Mantenimiento..."
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            required
          />
        </div>
      </form>
    </Modal>
  );
};
