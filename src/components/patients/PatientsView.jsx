import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Users,
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  CalendarPlus,
  FileText,
  AlertTriangle,
  Download,
  Phone,
  Shield,
  Stethoscope,
  Activity,
  Send,
  Sparkles,
  Heart,
  Droplet,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { PatientFormModal } from './PatientFormModal';
import { PatientDetailModal } from './PatientDetailModal';

export const PatientsView = () => {
  const {
    patients,
    healthInsurances,
    rehabPlans,
    appointments,
    setSelectedPatientForDetail,
    setIsPatientFormModalOpen,
    setPatientFormModalData,
    setIsAppointmentModalOpen,
    setAppointmentModalData,
    setIsNewConsultationModalOpen,
    setConsultationPreloadData,
    addToast
  } = useClinic();

  const [searchTerm, setSearchTerm] = useState('');
  const [insuranceFilter, setInsuranceFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [allergyOnlyFilter, setAllergyOnlyFilter] = useState(false);

  const calculateAge = (bDate) => {
    if (!bDate) return '-';
    try {
      const birth = new Date(bDate);
      const today = new Date('2026-08-28');
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return `${age} años`;
    } catch {
      return '-';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'PT';
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const filteredPatients = patients.filter((pat) => {
    const cleanQ = searchTerm.toLowerCase().trim();
    const matchSearch =
      cleanQ === '' ||
      pat.name.toLowerCase().includes(cleanQ) ||
      pat.dni.toLowerCase().includes(cleanQ) ||
      pat.phone.includes(cleanQ) ||
      pat.email.toLowerCase().includes(cleanQ) ||
      pat.insuranceName.toLowerCase().includes(cleanQ) ||
      (pat.antecedentes && pat.antecedentes.some((a) => a.toLowerCase().includes(cleanQ)));

    const matchInsurance = insuranceFilter === 'all' || pat.insuranceId === insuranceFilter;
    const matchGender = genderFilter === 'all' || pat.gender === genderFilter;
    const matchAllergy = !allergyOnlyFilter || (pat.allergies && pat.allergies.length > 0);

    return matchSearch && matchInsurance && matchGender && matchAllergy;
  });

  const exportPatientsCSV = () => {
    const headers = 'ID,Nombre,DNI,FechaNacimiento,Edad,Genero,GrupoSanguineo,Telefono,Email,ObraSocial,Plan,NumeroAfiliado,Alergias,UltimaVisita\n';
    const rows = filteredPatients.map((p) =>
      `"${p.id}","${p.name}","${p.dni}","${p.birthDate}","${calculateAge(p.birthDate)}","${p.gender}","${p.bloodType || 'A+'}","${p.phone}","${p.email}","${p.insuranceName}","${p.insurancePlan}","${p.insuranceNumber || ''}","${(p.allergies || []).join(';') || 'Ninguna'}","${p.lastVisit || ''}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CITRA_Padron_Pacientes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Padrón Exportado', 'Se descargó el archivo CSV con los datos de pacientes.', 'success');
  };

  const patientsWithAllergiesCount = patients.filter((p) => p.allergies && p.allergies.length > 0).length;

  return (
    <div className="view-container">
      {/* Modals */}
      <PatientFormModal />
      <PatientDetailModal />

      {/* 1. HERO HEADER */}
      <div className="view-header" style={{ marginBottom: '1.25rem' }}>
        <div>
          <div className="badge-wrapper" style={{ marginBottom: '0.35rem' }}>
            <span className="badge badge-teal">
              <Users size={13} style={{ marginRight: '4px' }} />
              Padrón Maestro de Pacientes & Historias Clínicas (Ley 26.529)
            </span>
          </div>
          <h1 className="view-title">Padrón de Pacientes</h1>
          <p className="view-subtitle">
            Base integral de historias clínicas, coberturas médicas, antecedentes patológicos y trazabilidad asistencial.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button type="button" className="btn btn-outline" onClick={exportPatientsCSV}>
            <Download size={16} />
            <span>Exportar CSV</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setPatientFormModalData(null);
              setIsPatientFormModalOpen(true);
            }}
          >
            <Plus size={18} />
            <span>+ Nuevo Paciente</span>
          </button>
        </div>
      </div>

      {/* 2. OPERATIONAL KPI BENTO STRIP */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}
      >
        <div className="stat-card-premium" style={{ padding: '1.15rem 1.25rem' }}>
          <div className="stat-card-top">
            <span className="stat-card-label">Total en Padrón</span>
            <div className="stat-icon-box" style={{ width: '38px', height: '38px' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <div className="stat-card-value">{patients.length}</div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              pacientes activos
            </span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            100% con HCE digitalizada
          </div>
        </div>

        <div className="stat-card-premium" style={{ padding: '1.15rem 1.25rem' }}>
          <div className="stat-card-top">
            <span className="stat-card-label">En Rehabilitación</span>
            <div className="stat-icon-box" style={{ width: '38px', height: '38px', background: '#e0f6f5', color: 'var(--c-primary)' }}>
              <Activity size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <div className="stat-card-value" style={{ color: 'var(--c-dark)' }}>{rehabPlans.length}</div>
            <span style={{ fontSize: '0.8rem', color: 'var(--c-primary)', fontWeight: 700 }}>
              planes activos
            </span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Seguimiento kinesiológico
          </div>
        </div>

        <div className="stat-card-premium" style={{ padding: '1.15rem 1.25rem', borderLeft: '4px solid #ef4444' }}>
          <div className="stat-card-top">
            <span className="stat-card-label" style={{ color: '#b91c1c' }}>Alertas Clínicas</span>
            <div className="stat-icon-box" style={{ width: '38px', height: '38px', background: '#fee2e2', color: '#dc2626' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <div className="stat-card-value" style={{ color: '#dc2626' }}>{patientsWithAllergiesCount}</div>
            <span style={{ fontSize: '0.8rem', color: '#b91c1c', fontWeight: 700 }}>
              con alergias declaradas
            </span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Penicilina, AINEs, Diclofenac
          </div>
        </div>

        <div className="stat-card-premium" style={{ padding: '1.15rem 1.25rem' }}>
          <div className="stat-card-top">
            <span className="stat-card-label">Obras Sociales</span>
            <div className="stat-icon-box" style={{ width: '38px', height: '38px', background: '#d1fae5', color: '#065f46' }}>
              <Shield size={18} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <div className="stat-card-value" style={{ color: '#065f46' }}>{healthInsurances.length}</div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              convenios activos
            </span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            OSDE, Swiss, Apross, PAMI, Galeno
          </div>
        </div>
      </div>

      {/* 3. ADVANCED SEARCH & MULTI-FILTER TOOLBAR */}
      <div
        className="card"
        style={{
          padding: '0.85rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          border: '1px solid var(--border-color)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px', maxWidth: '420px', position: 'relative' }}>
          <Search size={17} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '34px', fontSize: '0.86rem', width: '100%' }}
            placeholder="Buscar por nombre, DNI, teléfono, email o patología..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            style={{ width: '190px', fontSize: '0.82rem', padding: '0.4rem 0.65rem' }}
            value={insuranceFilter}
            onChange={(e) => setInsuranceFilter(e.target.value)}
          >
            <option value="all">Todas las Obras Sociales</option>
            {healthInsurances.map((hi) => (
              <option key={hi.id} value={hi.id}>{hi.name}</option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ width: '145px', fontSize: '0.82rem', padding: '0.4rem 0.65rem' }}
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            <option value="all">Todos los géneros</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
          </select>

          <button
            type="button"
            onClick={() => setAllergyOnlyFilter(!allergyOnlyFilter)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: allergyOnlyFilter ? '1px solid #ef4444' : '1px solid var(--border-color)',
              background: allergyOnlyFilter ? '#fee2e2' : '#ffffff',
              color: allergyOnlyFilter ? '#b91c1c' : 'var(--text-main)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <AlertTriangle size={14} color={allergyOnlyFilter ? '#dc2626' : '#64748b'} />
            <span>Solo con Alergias ({patientsWithAllergiesCount})</span>
          </button>

          {(searchTerm || insuranceFilter !== 'all' || genderFilter !== 'all' || allergyOnlyFilter) && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.78rem' }}
              onClick={() => {
                setSearchTerm('');
                setInsuranceFilter('all');
                setGenderFilter('all');
                setAllergyOnlyFilter(false);
              }}
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* 4. HIGH-PERFORMANCE PATIENT TABLE */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Paciente & Filiación</th>
                <th>DNI / Identificación</th>
                <th>Obra Social / Prepaga</th>
                <th>Contacto & WhatsApp</th>
                <th>Alertas Médicas</th>
                <th>Última Atención</th>
                <th style={{ textAlign: 'right' }}>Acciones Clínicas</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <Users size={36} color="var(--c-accent)" style={{ marginBottom: '0.5rem' }} />
                    <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem' }}>No se encontraron pacientes</div>
                    <p style={{ fontSize: '0.84rem', marginTop: '2px' }}>Intenta ajustar los términos de búsqueda o filtros.</p>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((pat) => {
                  const hasAllergies = pat.allergies && pat.allergies.length > 0;
                  return (
                    <tr key={pat.id} style={{ transition: 'var(--transition)' }}>
                      {/* Patient Avatar & Name */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={pat.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                            alt={pat.name}
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '2px solid var(--c-accent)',
                              flexShrink: 0
                            }}
                          />
                          <div>
                            <div
                              style={{
                                fontWeight: 800,
                                fontSize: '0.92rem',
                                color: 'var(--text-main)',
                                cursor: 'pointer'
                              }}
                              onClick={() => setSelectedPatientForDetail(pat)}
                              className="hover-underline"
                            >
                              {pat.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                              <span>{calculateAge(pat.birthDate)}</span>
                              <span>•</span>
                              <span>{pat.gender}</span>
                              <span>•</span>
                              <span style={{ fontWeight: 800, color: 'var(--c-dark)' }}>Grupo {pat.bloodType || 'A+'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* DNI Column */}
                      <td>
                        <div style={{ fontWeight: 800, color: 'var(--c-dark)', fontSize: '0.9rem' }}>
                          {pat.dni}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Alta: {pat.registeredAt || '2023'}
                        </span>
                      </td>

                      {/* Health Insurance & Plan */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.86rem' }}>
                            {pat.insuranceName}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--c-primary)', fontWeight: 700 }}>
                            Plan {pat.insurancePlan || 'Base'} · N° {pat.insuranceNumber?.slice(-6) || 'Activo'}
                          </span>
                        </div>
                      </td>

                      {/* Contact & WhatsApp */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-main)' }}>
                              {pat.phone}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                              {pat.email}
                            </div>
                          </div>
                          <a
                            href={`https://wa.me/${pat.phone?.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background: '#dcfce7',
                              color: '#15803d',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textDecoration: 'none',
                              flexShrink: 0
                            }}
                            title="Enviar WhatsApp"
                          >
                            <Send size={13} />
                          </a>
                        </div>
                      </td>

                      {/* Medical Alerts / Allergies */}
                      <td>
                        {hasAllergies ? (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#fee2e2',
                              color: '#991b1b',
                              border: '1px solid #fecaca',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                            title={pat.allergies.join(', ')}
                          >
                            <AlertTriangle size={12} color="#dc2626" />
                            <span>{pat.allergies[0]} {pat.allergies.length > 1 ? `(+${pat.allergies.length - 1})` : ''}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Sin alergias</span>
                        )}
                      </td>

                      {/* Last Visit */}
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-main)' }}>
                          {pat.lastVisit || 'Hoy'}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Consulta evolutiva
                        </span>
                      </td>

                      {/* Fast Action Buttons */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '5px', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                            onClick={() => setSelectedPatientForDetail(pat)}
                            title="Abrir Ficha Clínica Integral"
                          >
                            <Eye size={13} />
                            <span>Ver Ficha</span>
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline"
                            style={{ padding: '4px 7px' }}
                            onClick={() => {
                              setAppointmentModalData({
                                patientId: pat.id,
                                patientName: pat.name,
                                patientPhone: pat.phone,
                                patientDni: pat.dni,
                                patientInsurance: `${pat.insuranceName} (${pat.insurancePlan})`
                              });
                              setIsAppointmentModalOpen(true);
                            }}
                            title="Agendar Turno"
                          >
                            <CalendarPlus size={14} color="var(--c-primary)" />
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline"
                            style={{ padding: '4px 7px' }}
                            onClick={() => {
                              setConsultationPreloadData({
                                patientId: pat.id,
                                patientName: pat.name
                              });
                              setIsNewConsultationModalOpen(true);
                            }}
                            title="Nueva Consulta HCE"
                          >
                            <Stethoscope size={14} color="var(--c-primary)" />
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline"
                            style={{ padding: '4px 7px' }}
                            onClick={() => {
                              setPatientFormModalData(pat);
                              setIsPatientFormModalOpen(true);
                            }}
                            title="Editar Datos"
                          >
                            <Edit2 size={13} />
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
    </div>
  );
};
