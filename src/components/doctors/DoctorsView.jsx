import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  UserCheck,
  Search,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Star,
  Edit2,
  CalendarPlus,
  Activity,
  Phone,
  Mail
} from 'lucide-react';
import { DoctorModal } from './DoctorModal';

export const DoctorsView = () => {
  const {
    doctors,
    specialties,
    setFilterDoctor,
    setActiveTab,
    setIsDoctorModalOpen,
    setDoctorModalData,
    setIsAppointmentModalOpen,
    setAppointmentModalData,
    appointments
  } = useClinic();

  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');

  const filteredDoctors = doctors.filter((doc) => {
    const cleanQ = searchTerm.toLowerCase();
    const matchSearch =
      doc.name.toLowerCase().includes(cleanQ) ||
      doc.specialtyName.toLowerCase().includes(cleanQ) ||
      doc.license.toLowerCase().includes(cleanQ);

    const matchSpecialty = specialtyFilter === 'all' || doc.specialtyId === specialtyFilter;
    return matchSearch && matchSpecialty;
  });

  return (
    <div className="doctors-container">
      {/* Modals */}
      <DoctorModal />

      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <UserCheck size={28} color="#2563eb" />
            <span>Cuerpo Médico & Profesionales</span>
          </h1>
          <p>Directorio de especialistas, matrículas, asignación de consultorios y disponibilidad horaria</p>
        </div>

        <div className="page-actions-group">
          <button
            className="btn btn-primary"
            onClick={() => {
              setDoctorModalData(null);
              setIsDoctorModalOpen(true);
            }}
          >
            <Plus size={18} />
            <span>Nuevo Profesional</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="#64748b" />
          <input
            type="text"
            className="form-control"
            placeholder="Buscar profesional por nombre, matrícula o especialidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ minWidth: '220px' }}>
          <select
            className="form-control"
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
          >
            <option value="all">Todas las Especialidades</option>
            {specialties.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctors Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.25rem' }}>
        {filteredDoctors.map((doc) => {
          // Count appointments today for this doctor
          const todayCount = appointments.filter(
            (a) => a.doctorId === doc.id && a.date === '2026-08-28' && a.status !== 'cancelado'
          ).length;

          return (
            <div
              key={doc.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.25rem',
                borderTop: `4px solid ${doc.color || '#2563eb'}`
              }}
            >
              <div>
                {/* Doctor Top Box */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', marginBottom: '1rem' }}>
                  <img
                    src={doc.avatar}
                    alt={doc.name}
                    style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{doc.name}</h3>
                      <button
                        className="btn btn-secondary btn-icon"
                        style={{ width: '28px', height: '28px' }}
                        title="Editar Profesional"
                        onClick={() => {
                          setDoctorModalData(doc);
                          setIsDoctorModalOpen(true);
                        }}
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2563eb' }}>
                        {doc.specialtyName}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                      {doc.license}
                    </div>
                  </div>
                </div>

                {/* Info List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem', color: '#334155', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={15} color="#64748b" />
                    <span>{doc.roomName || 'Consultorio 101'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={15} color="#64748b" />
                    <span>{doc.workingDays?.join(', ')} ({doc.scheduleStart} - {doc.scheduleEnd} hs)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={15} color="#64748b" />
                    <span>{doc.phone}</span>
                  </div>
                </div>

                {/* Performance Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center', marginBottom: '1rem' }}>
                  <div style={{ background: '#eff6ff', padding: '0.5rem', borderRadius: '6px' }}>
                    <div style={{ fontWeight: 800, color: '#2563eb', fontSize: '1.05rem' }}>
                      {doc.stats?.patientsAttended || 320}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Atendidos</div>
                  </div>

                  <div style={{ background: '#f0fdf4', padding: '0.5rem', borderRadius: '6px' }}>
                    <div style={{ fontWeight: 800, color: '#16a34a', fontSize: '1.05rem' }}>
                      {doc.stats?.occupationRate || 92}%
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Ocupación</div>
                  </div>

                  <div style={{ background: '#fefce8', padding: '0.5rem', borderRadius: '6px' }}>
                    <div style={{ fontWeight: 800, color: '#ca8a04', fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                      <Star size={14} fill="#ca8a04" />
                      <span>{doc.stats?.rating || 4.9}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Calificación</div>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                <button
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setFilterDoctor(doc.id);
                    setActiveTab('agenda');
                  }}
                >
                  <Calendar size={14} />
                  <span>Ver Agenda</span>
                </button>

                <button
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setAppointmentModalData({
                      doctorId: doc.id,
                      doctorName: doc.name,
                      specialtyId: doc.specialtyId,
                      specialtyName: doc.specialtyName,
                      roomId: doc.roomId,
                      roomName: doc.roomName,
                      duration: doc.slotDuration || 30
                    });
                    setIsAppointmentModalOpen(true);
                  }}
                >
                  <CalendarPlus size={14} />
                  <span>Dar Turno</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
