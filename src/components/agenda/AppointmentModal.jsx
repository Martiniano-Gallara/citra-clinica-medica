import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Modal } from '../common/Modal';
import { Calendar, Clock, User, UserCheck, Building, AlertCircle, Trash2 } from 'lucide-react';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

export const AppointmentModal = () => {
  const {
    isAppointmentModalOpen,
    setIsAppointmentModalOpen,
    appointmentModalData,
    doctors,
    patients,
    specialties,
    rooms,
    appointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    isDoctor,
    currentDoctor,
    addToast
  } = useClinic();

  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    patientPhone: '',
    patientDni: '',
    patientInsurance: '',
    doctorId: '',
    doctorName: '',
    specialtyId: '',
    specialtyName: '',
    roomId: '',
    roomName: '',
    date: '2026-08-28',
    time: '09:00',
    duration: 30,
    status: 'confirmado',
    reason: '',
    copayAmount: 0,
    isPaid: false,
    paymentMethod: 'Pendiente',
    notes: ''
  });

  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientResults, setShowPatientResults] = useState(false);
  const [conflictWarning, setConflictWarning] = useState('');

  // Populate data when opening modal
  useEffect(() => {
    if (appointmentModalData) {
      setFormData(appointmentModalData);
      setPatientSearch(appointmentModalData.patientName);
    } else {
      const defaultDoc = (isDoctor && currentDoctor) ? currentDoctor : (doctors[0] || {});
      setFormData({
        patientId: '',
        patientName: '',
        patientPhone: '',
        patientDni: '',
        patientInsurance: '',
        doctorId: defaultDoc.id || '',
        doctorName: defaultDoc.name || '',
        specialtyId: defaultDoc.specialtyId || '',
        specialtyName: defaultDoc.specialtyName || '',
        roomId: defaultDoc.roomId || '',
        roomName: defaultDoc.roomName || '',
        date: '2026-08-28',
        time: '09:00',
        duration: defaultDoc.slotDuration || 30,
        status: 'confirmado',
        reason: 'Consulta de control de rutina',
        copayAmount: 0,
        isPaid: false,
        paymentMethod: 'Pendiente',
        notes: ''
      });
      setPatientSearch('');
    }
    setConflictWarning('');
  }, [appointmentModalData, isAppointmentModalOpen, doctors]);

  // Check collision / overlap when doctor, date or time changes
  useEffect(() => {
    if (!formData.doctorId || !formData.date || !formData.time) {
      setConflictWarning('');
      return;
    }
    const currentId = appointmentModalData?.id;
    const hasCollision = appointments.some(
      (app) =>
        app.id !== currentId &&
        app.doctorId === formData.doctorId &&
        app.date === formData.date &&
        app.time === formData.time &&
        app.status !== 'cancelado'
    );

    if (hasCollision) {
      setConflictWarning(
        `¡Atención! El ${formData.doctorName} ya posee otro turno agendado el ${formData.date} a las ${formData.time} hs.`
      );
    } else {
      setConflictWarning('');
    }
  }, [formData.doctorId, formData.date, formData.time, appointments, appointmentModalData, formData.doctorName]);

  const handleDoctorChange = (e) => {
    const docId = e.target.value;
    const doc = doctors.find((d) => d.id === docId);
    if (doc) {
      setFormData((prev) => ({
        ...prev,
        doctorId: doc.id,
        doctorName: doc.name,
        specialtyId: doc.specialtyId,
        specialtyName: doc.specialtyName,
        roomId: doc.roomId,
        roomName: doc.roomName,
        duration: doc.slotDuration || 30
      }));
    }
  };

  const handlePatientSelect = (pat) => {
    setFormData((prev) => ({
      ...prev,
      patientId: pat.id,
      patientName: pat.name,
      patientPhone: pat.phone,
      patientDni: pat.dni,
      patientInsurance: `${pat.insuranceName} (${pat.insurancePlan})`
    }));
    setPatientSearch(pat.name);
    setShowPatientResults(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.patientName) {
      addToast('Error', 'Por favor seleccione o ingrese un paciente.', 'error');
      return;
    }
    if (!formData.doctorId) {
      addToast('Error', 'Por favor seleccione un médico.', 'error');
      return;
    }

    if (appointmentModalData) {
      updateAppointment(appointmentModalData.id, formData);
    } else {
      addAppointment(formData);
    }
    setIsAppointmentModalOpen(false);
  };

  const handleSendReminderWhatsApp = () => {
    addToast(
      'Recordatorio Enviado',
      `Mensaje de WhatsApp enviado a ${formData.patientName} (${formData.patientPhone}) para el turno del ${formData.date} a las ${formData.time} hs.`,
      'success'
    );
  };

  const filteredPatients = patientSearch
    ? patients.filter(
        (p) =>
          p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
          p.dni.includes(patientSearch)
      )
    : [];

  return (
    <Modal
      isOpen={isAppointmentModalOpen}
      onClose={() => setIsAppointmentModalOpen(false)}
      title={appointmentModalData ? 'Editar / Reprogramar Turno' : 'Agendar Nuevo Turno'}
      size="lg"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div>
            {appointmentModalData && (
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => {
                  if (window.confirm('¿Está seguro de eliminar este turno?')) {
                    deleteAppointment(appointmentModalData.id);
                    setIsAppointmentModalOpen(false);
                  }
                }}
              >
                <Trash2 size={16} />
                <span>Eliminar Turno</span>
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAppointmentModalOpen(false)}
            >
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit}>
              {appointmentModalData ? 'Guardar Cambios' : 'Confirmar Turno'}
            </button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        {/* Conflict Alert */}
        {conflictWarning && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1.25rem'
            }}
          >
            <AlertCircle size={20} color="#dc2626" />
            <span>{conflictWarning}</span>
          </div>
        )}

        {/* Patient Selection & Search */}
        <div className="form-group" style={{ position: 'relative' }}>
          <label className="form-label">Paciente *</label>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por Nombre o DNI..."
            value={patientSearch}
            onChange={(e) => {
              setPatientSearch(e.target.value);
              setShowPatientResults(true);
              setFormData((prev) => ({ ...prev, patientName: e.target.value }));
            }}
            onFocus={() => setShowPatientResults(true)}
            required
          />

          {showPatientResults && filteredPatients.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 60,
                maxHeight: '180px',
                overflowY: 'auto',
                marginTop: '4px'
              }}
            >
              {filteredPatients.map((pat) => (
                <div
                  key={pat.id}
                  onClick={() => handlePatientSelect(pat)}
                  style={{
                    padding: '0.6rem 0.85rem',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: '0.86rem'
                  }}
                  className="hover-subtle"
                >
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{pat.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    DNI {pat.dni} · {pat.insuranceName} ({pat.insurancePlan}) · Tel: {pat.phone}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Doctor & Specialty Selection */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Profesional / Médico * {isDoctor && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>(Su agenda)</span>}
            </label>
            <select
              className="form-control"
              value={formData.doctorId}
              onChange={handleDoctorChange}
              disabled={isDoctor}
              required
            >
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} — {doc.specialtyName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Consultorio Asignado</label>
            <select
              className="form-control"
              value={formData.roomId}
              onChange={(e) => {
                const r = rooms.find((rm) => rm.id === e.target.value);
                setFormData((prev) => ({
                  ...prev,
                  roomId: e.target.value,
                  roomName: r ? r.name : prev.roomName
                }));
              }}
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} ({room.floor})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date, Time & Duration */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Fecha del Turno *</label>
            <input
              type="date"
              className="form-control"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Horario *</label>
            <select
              className="form-control"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
            >
              {['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'].map((h) => (
                <option key={h} value={h}>{h} hs</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Duración (min)</label>
            <select
              className="form-control"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
            >
              <option value={15}>15 min</option>
              <option value={20}>20 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>60 min</option>
            </select>
          </div>
        </div>

        {/* Status & Copay */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Estado del Turno</label>
            <select
              className="form-control"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="confirmado">Confirmado</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_sala">En Sala de Espera</option>
              <option value="atendido">Atendido</option>
              <option value="cancelado">Cancelado</option>
              <option value="ausente">Ausente</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Monto de Copago / Consulta ($)</label>
            <input
              type="number"
              className="form-control"
              value={formData.copayAmount}
              onChange={(e) => setFormData({ ...formData, copayAmount: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Reason & Notes */}
        <div className="form-group">
          <label className="form-label">Motivo de Consulta</label>
          <input
            type="text"
            className="form-control"
            placeholder="Ej: Chequeo anual, dolor lumbar, control de laboratorio..."
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Observaciones / Indicaciones Previas</label>
          <textarea
            className="form-control"
            rows={2}
            placeholder="Notas internas para recepción o el médico..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        {/* WhatsApp Reminder Action button */}
        {formData.patientPhone && (
          <div style={{ marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ color: '#15803d', borderColor: '#bbf7d0', background: '#f0fdf4' }}
              onClick={handleSendReminderWhatsApp}
            >
              <WhatsAppIcon size={16} color="#15803d" />
              <span>Enviar Recordatorio por WhatsApp ({formData.patientPhone})</span>
            </button>
          </div>
        )}
      </form>
    </Modal>
  );
};
