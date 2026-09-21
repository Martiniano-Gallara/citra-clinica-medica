import React, { useState, useMemo } from 'react';
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
  UserCheck,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Mail
} from 'lucide-react';
import { PatientFormModal } from './PatientFormModal';
import { PatientDetailModal } from './PatientDetailModal';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

export const PatientsView = () => {
  const {
    patients,
    scopedPatients,
    isDoctor,
    currentDoctor,
    healthInsurances,
    rehabPlans,
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
  const [allergyOnlyFilter, setAllergyOnlyFilter] = useState(false);
  const [expandedPatientId, setExpandedPatientId] = useState(null);

  // Strict Scoping: Doctor only sees patients attended by them
  const effectivePatients = useMemo(() => {
    return isDoctor ? scopedPatients : patients;
  }, [isDoctor, scopedPatients, patients]);

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

  const toggleExpand = (patientId) => {
    setExpandedPatientId((prev) => (prev === patientId ? null : patientId));
  };

  const filteredPatients = useMemo(() => {
    return effectivePatients.filter((pat) => {
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
      const matchAllergy = !allergyOnlyFilter || (pat.allergies && pat.allergies.length > 0);

      return matchSearch && matchInsurance && matchAllergy;
    });
  }, [effectivePatients, searchTerm, insuranceFilter, allergyOnlyFilter]);

  const patientsWithAllergiesCount = effectivePatients.filter((p) => p.allergies && p.allergies.length > 0).length;

  const exportPatientsCSV = () => {
    const headers = 'ID,Nombre,DNI,FechaNacimiento,Edad,Genero,GrupoSanguineo,Telefono,Email,ObraSocial,Plan,NumeroAfiliado,Alergias\n';
    const rows = filteredPatients.map((p) =>
      `"${p.id}","${p.name}","${p.dni}","${p.birthDate}","${calculateAge(p.birthDate)}","${p.gender}","${p.bloodType || 'A+'}","${p.phone}","${p.email}","${p.insuranceName}","${p.insurancePlan}","${p.insuranceNumber || ''}","${(p.allergies || []).join(';') || 'Ninguna'}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CITRA_Pacientes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Padrón Exportado', 'Se descargó el archivo CSV de pacientes.', 'success');
  };

  const handleStartConsultation = (pat) => {
    if (setIsNewConsultationModalOpen && setConsultationPreloadData) {
      setConsultationPreloadData({
        patientId: pat.id,
        patientName: pat.name,
        patientDni: pat.dni,
        doctorId: currentDoctor?.id || 'doc-1',
        doctorName: currentDoctor?.name || 'Dr. Alejandro Blanco',
        specialtyName: currentDoctor?.specialty || 'Traumatología',
        reason: 'Consulta médica programada'
      });
      setIsNewConsultationModalOpen(true);
    }
  };

  const handleBookAppointment = (pat) => {
    if (setIsAppointmentModalOpen && setAppointmentModalData) {
      setAppointmentModalData({
        patientId: pat.id,
        patientName: pat.name,
        patientDni: pat.dni,
        patientPhone: pat.phone,
        patientInsurance: pat.insuranceName,
        doctorId: currentDoctor?.id || 'doc-1',
        doctorName: currentDoctor?.name || 'Dr. Alejandro Blanco',
        specialtyName: currentDoctor?.specialty || 'Traumatología',
        roomName: currentDoctor?.roomName || 'Consultorio 102',
        date: '2026-08-28',
        time: '10:00',
        duration: 30
      });
      setIsAppointmentModalOpen(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Global Modals */}
      <PatientFormModal />
      <PatientDetailModal />

      {/* 1. TOP HEADER (CLEAN & NON-SATURATED) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>
            {isDoctor ? 'Mis Pacientes' : 'Pacientes'}
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            {isDoctor
              ? 'Listado y seguimiento médico de pacientes asignados a su consultorio.'
              : 'Directorio general de pacientes registrados y asignación de turnos.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={exportPatientsCSV}
            style={{ fontSize: '0.84rem' }}
          >
            <Download size={15} />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPatientFormModalData(null);
              setIsPatientFormModalOpen(true);
            }}
            style={{
              background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '0.65rem 1.15rem',
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
            <span>Nuevo Paciente</span>
          </button>
        </div>
      </div>

      {/* 2. OPERATIONAL SUMMARY KPI CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '1.15rem 1.25rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isDoctor ? 'Total en Mi Padrón' : 'Total Pacientes'}
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.2rem' }}>
            {effectivePatients.length}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 600 }}>
            {isDoctor ? 'Pacientes bajo seguimiento médico' : 'Padrón de afiliados activo en CITRA'}
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '1.15rem 1.25rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              En Rehabilitación
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.2rem' }}>
            {rehabPlans.length}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600 }}>
            Planes kinesiológicos activos
          </div>
        </div>

        {isDoctor ? (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              borderLeft: '4px solid #ef4444',
              padding: '1.15rem 1.25rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Alertas Clínicas
              </span>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#dc2626', marginBottom: '0.2rem' }}>
              {patientsWithAllergiesCount}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
              Pacientes con alergias declaradas
            </div>
          </div>
        ) : (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              padding: '1.15rem 1.25rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#076ABC', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Atención Diaria
              </span>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#eff6ff', color: '#076ABC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserCheck size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#002182', marginBottom: '0.2rem' }}>
              {effectivePatients.length}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
              Pacientes empadronados para recepción
            </div>
          </div>
        )}

        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '1.15rem 1.25rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Obras Sociales
            </span>
            <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#16a34a', marginBottom: '0.2rem' }}>
            {healthInsurances.length}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
            Convenios y prepagas aceptadas
          </div>
        </div>
      </div>

      {/* 3. SIMPLIFIED SEARCH & FILTER BAR */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '1rem 1.25rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 280px', minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Buscar por Nombre, DNI, Teléfono o Cobertura..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem 0.55rem 2.35rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.88rem',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={insuranceFilter}
            onChange={(e) => setInsuranceFilter(e.target.value)}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '0.84rem',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <option value="all">Todas las Obras Sociales</option>
            {healthInsurances.map((hi) => (
              <option key={hi.id} value={hi.id}>{hi.name}</option>
            ))}
          </select>

          {isDoctor && (
            <button
              type="button"
              onClick={() => setAllergyOnlyFilter(!allergyOnlyFilter)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: allergyOnlyFilter ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                background: allergyOnlyFilter ? '#fef2f2' : '#ffffff',
                color: allergyOnlyFilter ? '#dc2626' : '#475569',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <AlertTriangle size={14} color={allergyOnlyFilter ? '#dc2626' : '#94a3b8'} />
              <span>Solo con Alergias ({patientsWithAllergiesCount})</span>
            </button>
          )}

          {(searchTerm || insuranceFilter !== 'all' || allergyOnlyFilter) && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setSearchTerm('');
                setInsuranceFilter('all');
                setAllergyOnlyFilter(false);
              }}
              style={{ fontSize: '0.78rem' }}
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* 4. CLEAN, NON-SATURATED PATIENT LIST (ACCORDION DETAILS ON ROW CLICK) */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(0, 33, 130, 0.03)'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#0f172a', fontWeight: 800 }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>Paciente</th>
                <th style={{ padding: '0.85rem 1.25rem', width: '130px' }}>DNI</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Obra Social & Plan</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Contacto Directo</th>
                <th style={{ padding: '0.85rem 1.25rem', width: '160px' }}>
                  {isDoctor ? 'Alertas Clínicas' : 'Domicilio / Ciudad'}
                </th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right', width: '140px' }}>Ficha</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
                    <Users size={36} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
                    <div style={{ fontWeight: 700, color: '#1e293b' }}>No se encontraron pacientes</div>
                    <div style={{ fontSize: '0.82rem' }}>Intente ajustar el término de búsqueda o filtros.</div>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((pat) => {
                  const isExpanded = expandedPatientId === pat.id;
                  const hasAllergies = pat.allergies && pat.allergies.length > 0;

                  return (
                    <React.Fragment key={pat.id}>
                      {/* Compact clean row */}
                      <tr
                        onClick={() => toggleExpand(pat.id)}
                        style={{
                          borderBottom: isExpanded ? 'none' : '1px solid #f1f5f9',
                          background: isExpanded ? '#f0fdf4' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isExpanded) e.currentTarget.style.background = '#f8fafc';
                        }}
                        onMouseLeave={(e) => {
                          if (!isExpanded) e.currentTarget.style.background = '#ffffff';
                        }}
                      >
                        {/* Paciente */}
                        <td style={{ padding: '0.9rem 1.25rem' }}>
                          <div>
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.94rem' }}>
                              {pat.name}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <span>{calculateAge(pat.birthDate)}</span>
                              <span>•</span>
                              <span>{pat.gender}</span>
                            </div>
                          </div>
                        </td>

                        {/* DNI */}
                        <td style={{ padding: '0.9rem 1.25rem', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>
                            {pat.dni}
                          </div>
                        </td>

                        {/* Cobertura */}
                        <td style={{ padding: '0.9rem 1.25rem' }}>
                          <span
                            style={{
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              padding: '0.25rem 0.65rem',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 700
                            }}
                          >
                            {pat.insuranceName || 'Particular'}
                          </span>
                        </td>

                        {/* Contacto Directo */}
                        <td style={{ padding: '0.9rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <span style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 600 }}>
                              {pat.phone}
                            </span>
                            {pat.phone && (
                              <a
                                href={`https://wa.me/${pat.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '50%',
                                  background: '#25D366',
                                  color: '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  textDecoration: 'none',
                                  boxShadow: '0 2px 6px rgba(37, 211, 102, 0.35)',
                                  transition: 'transform 0.15s ease'
                                }}
                                title="Abrir WhatsApp oficial"
                              >
                                <WhatsAppIcon size={14} color="#ffffff" />
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Alertas Médicas (Médico) o Domicilio (Recepción) */}
                        <td style={{ padding: '0.9rem 1.25rem' }}>
                          {isDoctor ? (
                            hasAllergies ? (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  background: '#fee2e2',
                                  color: '#991b1b',
                                  border: '1px solid #fecaca',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.74rem',
                                  fontWeight: 800
                                }}
                              >
                                <AlertTriangle size={12} color="#dc2626" />
                                {pat.allergies[0]} {pat.allergies.length > 1 ? `(+${pat.allergies.length - 1})` : ''}
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Sin alergias</span>
                            )
                          ) : (
                            <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 500 }}>
                              {pat.address || 'Arroyito, Cba.'}
                            </span>
                          )}
                        </td>

                        {/* Acciones & Toggle */}
                        <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
                          <div
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => toggleExpand(pat.id)}
                              style={{
                                background: isExpanded ? '#002182' : '#f1f5f9',
                                color: isExpanded ? '#ffffff' : '#334155',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                padding: '0.35rem 0.65rem',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <span>{isExpanded ? 'Ocultar' : 'Ficha'}</span>
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* 5. EXPANDED PATIENT DETAIL ROW (SMOOTH ACCORDION) */}
                      {isExpanded && (
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                          <td colSpan={6} style={{ padding: '1.25rem 1.5rem' }}>
                            <div
                              style={{
                                background: '#ffffff',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                padding: '1.25rem',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                                gap: '1.25rem'
                              }}
                            >
                              {/* Filiación & Datos personales */}
                              <div>
                                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#076ABC', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <UserCheck size={14} /> Filiación & Identificación
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#0f172a', lineHeight: '1.6' }}>
                                  <div><strong>Nombre:</strong> {pat.name}</div>
                                  <div><strong>DNI:</strong> {pat.dni}</div>
                                  <div><strong>Fecha de Nacimiento:</strong> {pat.birthDate} ({calculateAge(pat.birthDate)})</div>
                                  <div><strong>Género:</strong> {pat.gender}</div>
                                  <div><strong>Fecha de Alta:</strong> {pat.registeredAt || '2023-01-15'}</div>
                                </div>
                              </div>

                              {/* Cobertura & Contacto */}
                              <div>
                                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <Shield size={14} /> Cobertura & Contacto
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#0f172a', lineHeight: '1.6' }}>
                                  <div><strong>Obra Social:</strong> {pat.insuranceName}</div>
                                  <div><strong>Plan:</strong> {pat.insurancePlan || 'Plan Base'}</div>
                                  <div><strong>N° Carnet / Afiliado:</strong> {pat.insuranceNumber || '9381029381'}</div>
                                  <div><strong>Teléfono:</strong> {pat.phone}</div>
                                  <div><strong>Email:</strong> {pat.email}</div>
                                </div>
                              </div>

                              {/* Médico: Antecedentes Clínicos & Acciones Médicas || Recepción: Gestión & Asignación */}
                              {isDoctor ? (
                                <div>
                                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Stethoscope size={14} /> Antecedentes & Acciones
                                  </div>
                                  <div style={{ fontSize: '0.82rem', color: '#334155', marginBottom: '0.85rem', lineHeight: '1.4' }}>
                                    <div><strong>Alergias:</strong> {pat.allergies && pat.allergies.length > 0 ? pat.allergies.join(', ') : 'Ninguna declarada'}</div>
                                    <div><strong>Antecedentes:</strong> {pat.antecedentes && pat.antecedentes.length > 0 ? pat.antecedentes.join(', ') : 'Sin antecedentes de riesgo'}</div>
                                    <div><strong>Última Visita:</strong> {pat.lastVisit || '2026-08-28'}</div>
                                  </div>

                                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <button
                                      type="button"
                                      onClick={() => handleStartConsultation(pat)}
                                      style={{
                                        background: '#059669',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '0.35rem 0.65rem',
                                        fontSize: '0.76rem',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      <Stethoscope size={13} /> Iniciar Consulta
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleBookAppointment(pat)}
                                      style={{
                                        background: '#076ABC',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '0.35rem 0.65rem',
                                        fontSize: '0.76rem',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      <CalendarPlus size={13} /> Agendar Turno
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setSelectedPatientForDetail(pat)}
                                      style={{
                                        background: '#f1f5f9',
                                        color: '#334155',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '6px',
                                        padding: '0.35rem 0.65rem',
                                        fontSize: '0.76rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      <FileText size={13} /> Historial Completo
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#076ABC', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <CalendarPlus size={14} /> Recepción & Asignación
                                  </div>
                                  <div style={{ fontSize: '0.82rem', color: '#334155', marginBottom: '0.85rem', lineHeight: '1.4' }}>
                                    <div><strong>Domicilio:</strong> {pat.address || 'Arroyito, Córdoba'}</div>
                                    <div><strong>Ciudad / Localidad:</strong> {pat.city || 'Arroyito (Cba.)'}</div>
                                    <div><strong>Estado Administrativo:</strong> <span style={{ color: '#16a34a', fontWeight: 700 }}>Habilitado</span></div>
                                  </div>

                                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <button
                                      type="button"
                                      onClick={() => handleBookAppointment(pat)}
                                      style={{
                                        background: '#076ABC',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '0.35rem 0.75rem',
                                        fontSize: '0.76rem',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      <CalendarPlus size={13} /> + Asignar Turno
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setPatientFormModalData(pat);
                                        setIsPatientFormModalOpen(true);
                                      }}
                                      style={{
                                        background: '#f8fafc',
                                        color: '#334155',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '6px',
                                        padding: '0.35rem 0.65rem',
                                        fontSize: '0.76rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      <Edit2 size={13} /> Editar Datos
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setSelectedPatientForDetail(pat)}
                                      style={{
                                        background: '#eff6ff',
                                        color: '#1d4ed8',
                                        border: '1px solid #bfdbfe',
                                        borderRadius: '6px',
                                        padding: '0.35rem 0.65rem',
                                        fontSize: '0.76rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      <UserCheck size={13} /> Ficha de Afiliado
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
