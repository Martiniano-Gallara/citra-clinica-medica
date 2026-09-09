import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  User,
  Trash2,
  CalendarPlus,
  X
} from 'lucide-react';

export const AppointmentsManager = () => {
  const {
    appointments,
    updateAppointmentStatus,
    cancelAppointment,
    deleteAppointment,
    addAppointment,
    doctors,
    specialties,
    patients,
    addToast
  } = useClinic();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  // Manual appointment modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualPatientName, setManualPatientName] = useState('');
  const [manualPatientDni, setManualPatientDni] = useState('');
  const [manualPatientPhone, setManualPatientPhone] = useState('');
  const [manualDoctorId, setManualDoctorId] = useState(doctors[0]?.id || '');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualTime, setManualTime] = useState('09:00');
  const [manualReason, setManualReason] = useState('Consulta administrativa/recepción');

  // Filter logic
  const filteredAppointments = appointments.filter((app) => {
    const matchesSearch =
      (app.patientName && app.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.patientDni && app.patientDni.includes(searchTerm)) ||
      (app.doctorName && app.doctorName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDoctor = filterDoctor === 'all' || app.doctorId === filterDoctor;
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesDate = !filterDate || app.date === filterDate;

    return matchesSearch && matchesDoctor && matchesStatus && matchesDate;
  });

  const handleCreateManualAppointment = (e) => {
    e.preventDefault();
    if (!manualPatientName || !manualPatientDni) {
      addToast('Datos requeridos', 'Por favor ingresa nombre y DNI del paciente.', 'warning');
      return;
    }

    const doc = doctors.find((d) => d.id === manualDoctorId) || doctors[0];
    addAppointment({
      patientId: `pat-m-${Date.now()}`,
      patientName: manualPatientName.trim(),
      patientDni: manualPatientDni.trim(),
      patientPhone: manualPatientPhone.trim() || '+54 9 351 000-0000',
      doctorId: doc.id,
      doctorName: doc.name,
      doctorSpecialty: doc.specialty,
      specialtyName: doc.specialty,
      roomId: doc.roomId || 'room-101',
      roomName: doc.roomName || 'Consultorio 101',
      date: manualDate,
      time: manualTime,
      type: 'Consulta Presencial',
      status: 'confirmado',
      reason: manualReason,
      bookingCode: `CITRA-REC-${Math.floor(1000 + Math.random() * 9000)}`
    });

    setIsManualModalOpen(false);
    setManualPatientName('');
    setManualPatientDni('');
    setManualPatientPhone('');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmado':
        return { text: 'Confirmado', bg: '#EBF3FD', color: '#002182', border: '#257CE6' };
      case 'pendiente':
        return { text: 'Pendiente', bg: '#fef3c7', color: '#92400e', border: '#fcd34d' };
      case 'atendido':
        return { text: 'Atendido', bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' };
      case 'cancelado':
        return { text: 'Cancelado', bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' };
      case 'en-sala':
        return { text: 'En Sala', bg: '#e6f8f7', color: '#076ABC', border: '#257CE6' };
      default:
        return { text: status, bg: '#f3f4f6', color: '#4b5563', border: '#d1d5db' };
    }
  };

  return (
    <div>
      {/* Top Header & New Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#002182', margin: '0 0 0.25rem' }}>
            Gestión de Turnos y Agenda
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#496386' }}>
            Visualización, asignación, cambios de estado y cancelación de turnos de la clínica.
          </p>
        </div>

        <button
          onClick={() => setIsManualModalOpen(true)}
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
          Nuevo Turno Manual
        </button>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1.5px solid #D2E3FC',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          alignItems: 'center'
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#7994B8' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por paciente, DNI o médico..."
            style={{
              width: '100%',
              padding: '0.65rem 0.75rem 0.65rem 2.2rem',
              borderRadius: '9px',
              border: '1.5px solid #D2E3FC',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Doctor Filter */}
        <div>
          <select
            value={filterDoctor}
            onChange={(e) => setFilterDoctor(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.75rem',
              borderRadius: '9px',
              border: '1.5px solid #D2E3FC',
              fontSize: '0.85rem',
              outline: 'none',
              background: '#ffffff'
            }}
          >
            <option value="all">Todos los Médicos</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.specialty})
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.75rem',
              borderRadius: '9px',
              border: '1.5px solid #D2E3FC',
              fontSize: '0.85rem',
              outline: 'none',
              background: '#ffffff'
            }}
          >
            <option value="all">Todos los Estados</option>
            <option value="confirmado">Confirmado</option>
            <option value="pendiente">Pendiente</option>
            <option value="en-sala">En Sala</option>
            <option value="atendido">Atendido</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 0.75rem',
              borderRadius: '9px',
              border: '1.5px solid #D2E3FC',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Appointments Table */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1.5px solid #D2E3FC',
          overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(0, 33, 130, 0.04)'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: '#F5F8FE', borderBottom: '1.5px solid #D2E3FC', color: '#002182', fontWeight: 800 }}>
                <th style={{ padding: '0.9rem 1.25rem' }}>Fecha & Hora</th>
                <th style={{ padding: '0.9rem 1.25rem' }}>Paciente</th>
                <th style={{ padding: '0.9rem 1.25rem' }}>Profesional & Esp.</th>
                <th style={{ padding: '0.9rem 1.25rem' }}>Consultorio</th>
                <th style={{ padding: '0.9rem 1.25rem' }}>Estado</th>
                <th style={{ padding: '0.9rem 1.25rem', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#496386' }}>
                    No se encontraron turnos con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((app) => {
                  const badge = getStatusBadge(app.status);
                  return (
                    <tr
                      key={app.id}
                      style={{
                        borderBottom: '1px solid #EDF3FD',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F5F8FE')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '0.9rem 1.25rem', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 800, color: '#002182' }}>{app.date}</div>
                        <div style={{ fontSize: '0.78rem', color: '#076ABC', fontWeight: 700 }}>{app.time} hs</div>
                      </td>

                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <div style={{ fontWeight: 800, color: '#002182' }}>{app.patientName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#7994B8' }}>DNI: {app.patientDni} · {app.patientInsurance || 'Particular'}</div>
                      </td>

                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <div style={{ fontWeight: 700, color: '#172A4A' }}>{app.doctorName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#076ABC' }}>{app.doctorSpecialty || app.specialtyName}</div>
                      </td>

                      <td style={{ padding: '0.9rem 1.25rem', color: '#496386', fontSize: '0.8rem' }}>
                        {app.roomName || 'Consultorio Principal'}
                      </td>

                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <span
                          style={{
                            background: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                            padding: '0.2rem 0.6rem',
                            borderRadius: '100px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            display: 'inline-block'
                          }}
                        >
                          {badge.text}
                        </span>
                      </td>

                      <td style={{ padding: '0.9rem 1.25rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                          {app.status !== 'atendido' && (
                            <button
                              title="Marcar Atendido"
                              onClick={() => updateAppointmentStatus(app.id, 'atendido')}
                              style={{
                                background: '#d1fae5',
                                border: '1px solid #6ee7b7',
                                color: '#065f46',
                                borderRadius: '6px',
                                padding: '0.35rem 0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: 700
                              }}
                            >
                              Atender
                            </button>
                          )}

                          {app.status === 'pendiente' && (
                            <button
                              title="Confirmar Turno"
                              onClick={() => updateAppointmentStatus(app.id, 'confirmado')}
                              style={{
                                background: '#EBF3FD',
                                border: '1px solid #257CE6',
                                color: '#002182',
                                borderRadius: '6px',
                                padding: '0.35rem 0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: 700
                              }}
                            >
                              Confirmar
                            </button>
                          )}

                          {app.status !== 'cancelado' && (
                            <button
                              title="Cancelar Turno"
                              onClick={() => cancelAppointment(app.id, 'Cancelado por administración')}
                              style={{
                                background: '#fee2e2',
                                border: '1px solid #fca5a5',
                                color: '#991b1b',
                                borderRadius: '6px',
                                padding: '0.35rem 0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: 700
                              }}
                            >
                              Cancelar
                            </button>
                          )}

                          <button
                            title="Eliminar"
                            onClick={() => deleteAppointment(app.id)}
                            style={{
                              background: '#f3f4f6',
                              border: '1px solid #d1d5db',
                              color: '#6b7280',
                              borderRadius: '6px',
                              padding: '0.35rem',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Appointment Modal */}
      {isManualModalOpen && (
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
          onClick={() => setIsManualModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #002182 0%, #076ABC 100%)',
                color: '#ffffff',
                padding: '1.5rem 1.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                Agendar Turno Manual (Recepción)
              </h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateManualAppointment} style={{ padding: '1.75rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                  Nombre del Paciente *
                </label>
                <input
                  type="text"
                  required
                  value={manualPatientName}
                  onChange={(e) => setManualPatientName(e.target.value)}
                  placeholder="Ej: Claudia Morales"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    border: '1.5px solid #D2E3FC',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                    DNI *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualPatientDni}
                    onChange={(e) => setManualPatientDni(e.target.value)}
                    placeholder="32.110.450"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '8px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={manualPatientPhone}
                    onChange={(e) => setManualPatientPhone(e.target.value)}
                    placeholder="+54 9 351..."
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '8px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                  Profesional Asignado *
                </label>
                <select
                  value={manualDoctorId}
                  onChange={(e) => setManualDoctorId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    border: '1.5px solid #D2E3FC',
                    fontSize: '0.85rem',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.specialty}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                    Fecha *
                  </label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.3rem' }}>
                    Horario *
                  </label>
                  <input
                    type="time"
                    required
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>
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
                Crear y Confirmar Turno
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
