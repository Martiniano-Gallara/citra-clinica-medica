import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Modal } from '../common/Modal';
import { Calendar, Clock, User, UserCheck, Building, AlertCircle, Trash2, Search, Check } from 'lucide-react';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import { getTodayArgentina } from '../../utils/dateUtils';

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
    sendWhatsAppReminder,
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
    date: getTodayArgentina(),
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
        date: getTodayArgentina(),
        time: '09:00',
        duration: defaultDoc.slotDuration || 30,
        status: 'confirmado',
        reason: 'Consulta médica programada',
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
    const [h, m] = (formData.time || '00:00').split(':').map(Number);
    const startMins = h * 60 + m;
    const endMins = startMins + (Number(formData.duration) || 30);

    const conflictingApp = appointments.find((app) => {
      if (
        app.id === currentId ||
        app.doctorId !== formData.doctorId ||
        app.date !== formData.date ||
        app.status === 'cancelado'
      ) {
        return false;
      }
      const [ah, am] = (app.time || '00:00').split(':').map(Number);
      const aStart = ah * 60 + am;
      const aEnd = aStart + (Number(app.duration) || 30);
      return Math.max(startMins, aStart) < Math.min(endMins, aEnd);
    });

    if (conflictingApp) {
      setConflictWarning(
        `¡Atención! El ${formData.doctorName} ya posee un turno que se solapa el ${formData.date} a las ${conflictingApp.time} hs (${conflictingApp.duration || 30} min).`
      );
    } else {
      setConflictWarning('');
    }
  }, [formData.doctorId, formData.date, formData.time, formData.duration, appointments, appointmentModalData, formData.doctorName]);

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

    if (conflictWarning) {
      addToast('Conflicto de Horario', conflictWarning, 'error');
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
    if (sendWhatsAppReminder) {
      sendWhatsAppReminder(formData);
    } else {
      addToast(
        'Recordatorio Enviado',
        `Mensaje de WhatsApp enviado a ${formData.patientName} (${formData.patientPhone}) para el turno del ${formData.date} a las ${formData.time} hs.`,
        'success'
      );
    }
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
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div>
            {appointmentModalData && appointmentModalData.status !== 'cancelado' && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('¿Está seguro de cancelar este turno? Conforme a la Ley 26.529, el registro será archivado con estado cancelado manteniendo su trazabilidad legal.')) {
                    deleteAppointment(appointmentModalData.id);
                    setIsAppointmentModalOpen(false);
                  }
                }}
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  padding: '0.5rem 0.9rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Trash2 size={15} />
                <span>Cancelar y Archivar</span>
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={() => setIsAppointmentModalOpen(false)}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#475569',
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={Boolean(conflictWarning)}
              style={{
                background: conflictWarning ? '#cbd5e1' : 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.55rem 1.35rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: conflictWarning ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: conflictWarning ? 'none' : '0 4px 12px rgba(7, 106, 188, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <Check size={16} />
              <span>{appointmentModalData ? 'Guardar Cambios' : 'Confirmar Turno'}</span>
            </button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Conflict Alert */}
        {conflictWarning && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: '#fef2f2',
              border: '1.5px solid #fecaca',
              color: '#991b1b',
              padding: '0.65rem 0.95rem',
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: 600
            }}
          >
            <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
            <span>{conflictWarning}</span>
          </div>
        )}

        {/* Patient Selection & Search */}
        <div style={{ position: 'relative' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
            Paciente *
          </label>
          <div style={{ position: 'relative' }}>
            <Search size={14} color="#7994B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Buscar por Nombre o DNI..."
              value={patientSearch}
              onChange={(e) => {
                setPatientSearch(e.target.value);
                setShowPatientResults(true);
                setFormData((prev) => ({ ...prev, patientName: e.target.value }));
              }}
              onFocus={() => setShowPatientResults(true)}
              required
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem 0.6rem 2.1rem',
                borderRadius: '8px',
                border: '1.5px solid #D2E3FC',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {showPatientResults && filteredPatients.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: '#ffffff',
                border: '1.5px solid #D2E3FC',
                borderRadius: '10px',
                boxShadow: '0 10px 25px rgba(0, 33, 130, 0.15)',
                zIndex: 60,
                maxHeight: '190px',
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
                    fontSize: '0.84rem',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F5F8FE')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                >
                  <div style={{ fontWeight: 800, color: '#002182' }}>{pat.name}</div>
                  <div style={{ fontSize: '0.73rem', color: '#64748B' }}>
                    DNI: {pat.dni} · {pat.insuranceName || pat.insurance || 'Particular'} ({pat.insurancePlan}) · Tel: {pat.phone}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Doctor & Room Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
              Profesional / Médico * {isDoctor && <span style={{ fontSize: '0.72rem', color: '#64748b' }}>(Su agenda)</span>}
            </label>
            <div style={{ position: 'relative' }}>
              <UserCheck size={14} color="#7994B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <select
                value={formData.doctorId}
                onChange={handleDoctorChange}
                disabled={isDoctor}
                required
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem 0.55rem 2.1rem',
                  borderRadius: '8px',
                  border: '1.5px solid #D2E3FC',
                  fontSize: '0.84rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#ffffff',
                  fontWeight: 600,
                  color: '#002182'
                }}
              >
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} — {doc.specialtyName || doc.specialty}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
              Consultorio Asignado
            </label>
            <div style={{ position: 'relative' }}>
              <Building size={14} color="#7994B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <select
                value={formData.roomId}
                onChange={(e) => {
                  const r = rooms.find((rm) => rm.id === e.target.value);
                  setFormData((prev) => ({
                    ...prev,
                    roomId: e.target.value,
                    roomName: r ? r.name : prev.roomName
                  }));
                }}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem 0.55rem 2.1rem',
                  borderRadius: '8px',
                  border: '1.5px solid #D2E3FC',
                  fontSize: '0.84rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#ffffff'
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
        </div>

        {/* Date, Time & Duration */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
              Fecha *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '0.55rem 0.65rem',
                borderRadius: '8px',
                border: '1.5px solid #D2E3FC',
                fontSize: '0.84rem',
                outline: 'none',
                boxSizing: 'border-box',
                color: '#002182',
                fontWeight: 600
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
              Horario *
            </label>
            <select
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '0.55rem 0.65rem',
                borderRadius: '8px',
                border: '1.5px solid #D2E3FC',
                fontSize: '0.84rem',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#ffffff',
                color: '#002182',
                fontWeight: 700
              }}
            >
              {['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'].map((h) => (
                <option key={h} value={h}>{h} hs</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
              Duración
            </label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
              style={{
                width: '100%',
                padding: '0.55rem 0.65rem',
                borderRadius: '8px',
                border: '1.5px solid #D2E3FC',
                fontSize: '0.84rem',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#ffffff'
              }}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
              Estado del Turno
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                borderRadius: '8px',
                border: '1.5px solid #D2E3FC',
                fontSize: '0.84rem',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#ffffff'
              }}
            >
              <option value="confirmado">Confirmado</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_sala">En Sala de Espera</option>
              <option value="atendido">Atendido</option>
              <option value="cancelado">Cancelado</option>
              <option value="ausente">Ausente</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
              Copago / Consulta ($)
            </label>
            <input
              type="number"
              value={formData.copayAmount}
              onChange={(e) => setFormData({ ...formData, copayAmount: Number(e.target.value) })}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                borderRadius: '8px',
                border: '1.5px solid #D2E3FC',
                fontSize: '0.84rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Reason & Notes */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
            Motivo de Consulta
          </label>
          <input
            type="text"
            placeholder="Ej: Chequeo anual, dolor lumbar, control post-quirúrgico..."
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              borderRadius: '8px',
              border: '1.5px solid #D2E3FC',
              fontSize: '0.84rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
            Observaciones Internas
          </label>
          <textarea
            rows={2}
            placeholder="Notas para recepción o el profesional..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              borderRadius: '8px',
              border: '1.5px solid #D2E3FC',
              fontSize: '0.84rem',
              outline: 'none',
              boxSizing: 'border-box',
              resize: 'none'
            }}
          />
        </div>

        {/* WhatsApp Reminder Action button */}
        {formData.patientPhone && (
          <div>
            <button
              type="button"
              onClick={handleSendReminderWhatsApp}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#15803d',
                borderRadius: '8px',
                padding: '0.4rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#dcfce7')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#f0fdf4')}
            >
              <WhatsAppIcon size={15} color="#15803d" />
              <span>Enviar Recordatorio WhatsApp ({formData.patientPhone})</span>
            </button>
          </div>
        )}
      </form>
    </Modal>
  );
};
