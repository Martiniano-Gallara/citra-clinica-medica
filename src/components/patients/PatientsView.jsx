import React, { useState, useMemo, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { sanitizeCsvCell, getTodayArgentina } from '../../utils/dateUtils';
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
  UserCheck,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { PatientFormModal } from './PatientFormModal';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

export const PatientsView = () => {
  const {
    patients,
    scopedPatients,
    isDoctor,
    currentDoctor,
    doctors,
    healthInsurances,
    rehabPlans,
    setSelectedPatientForDetail,
    setIsPatientFormModalOpen,
    setPatientFormModalData,
    setIsAppointmentModalOpen,
    setAppointmentModalData,
    setIsNewConsultationModalOpen,
    setConsultationPreloadData,
    addToast,
    logAudit,
    currentUser
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
      const today = new Date(getTodayArgentina());
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
        (pat.name && pat.name.toLowerCase().includes(cleanQ)) ||
        (pat.dni && pat.dni.toLowerCase().includes(cleanQ)) ||
        (pat.phone && pat.phone.includes(cleanQ)) ||
        (pat.email && pat.email.toLowerCase().includes(cleanQ)) ||
        (pat.insuranceName && pat.insuranceName.toLowerCase().includes(cleanQ)) ||
        (pat.antecedentes && pat.antecedentes.some((a) => a && a.toLowerCase().includes(cleanQ)));

      const matchInsurance = insuranceFilter === 'all' || pat.insuranceId === insuranceFilter;
      const matchAllergy = !allergyOnlyFilter || (pat.allergies && pat.allergies.length > 0);

      return matchSearch && matchInsurance && matchAllergy;
    });
  }, [effectivePatients, searchTerm, insuranceFilter, allergyOnlyFilter]);

  // Paginación de Pacientes (Auditoría Forense / R: Sin paginación)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, insuranceFilter, allergyOnlyFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / pageSize));
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPatients.slice(start, start + pageSize);
  }, [filteredPatients, currentPage, pageSize]);

  const patientsWithAllergiesCount = effectivePatients.filter((p) => p.allergies && p.allergies.length > 0).length;

  const getAssignedDoctors = (pat) => {
    if (!pat) return [];
    const assignedIds = Array.isArray(pat.assignedDoctorIds)
      ? pat.assignedDoctorIds
      : pat.assignedDoctorId
      ? [pat.assignedDoctorId]
      : [];
    const directMatches = (doctors || []).filter((d) => assignedIds.includes(d.id));
    if (directMatches.length > 0) return directMatches;

    if (pat.assignedDoctorNames) {
      const names = Array.isArray(pat.assignedDoctorNames)
        ? pat.assignedDoctorNames
        : [pat.assignedDoctorNames];
      const nameMatches = (doctors || []).filter((d) =>
        names.some((n) => n && d.name && d.name.toLowerCase().trim() === n.toLowerCase().trim())
      );
      if (nameMatches.length > 0) return nameMatches;
    }

    if (pat.primaryDoctor) {
      const primaryMatch = (doctors || []).filter(
        (d) => d.name && d.name.toLowerCase().trim() === pat.primaryDoctor.toLowerCase().trim()
      );
      if (primaryMatch.length > 0) return primaryMatch;
    }

    return [];
  };

  const canExportPatients = Boolean(
    currentUser &&
    (currentUser.adminType === 'administrative' ||
     currentUser.role === 'superadmin' ||
     currentUser.role === 'admin' ||
     currentUser.role?.toLowerCase().includes('administra'))
  );

  const exportPatientsCSV = () => {
    if (!canExportPatients) {
      addToast('Acceso Denegado', 'La exportación masiva de padrón de pacientes está reservada a personal administrativo auditado.', 'error');
      return;
    }
    const headers = 'ID,Nombre,DNI,FechaNacimiento,Edad,Genero,GrupoSanguineo,Telefono,Email,ObraSocial,Plan,NumeroAfiliado,Alergias\n';
    const rows = filteredPatients.map((p) => [
      sanitizeCsvCell(p.id),
      sanitizeCsvCell(p.name),
      sanitizeCsvCell(p.dni),
      sanitizeCsvCell(p.birthDate),
      sanitizeCsvCell(calculateAge(p.birthDate)),
      sanitizeCsvCell(p.gender),
      sanitizeCsvCell(p.bloodType || 'N/E'),
      sanitizeCsvCell(p.phone),
      sanitizeCsvCell(p.email),
      sanitizeCsvCell(p.insuranceName),
      sanitizeCsvCell(p.insurancePlan),
      sanitizeCsvCell(p.insuranceNumber || ''),
      sanitizeCsvCell((p.allergies && p.allergies.length > 0) ? p.allergies.join(';') : 'Sin registrar')
    ].join(',')).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CITRA_Pacientes_${getTodayArgentina()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (logAudit) {
      logAudit('EXPORT_HCE', 'Padrón de Pacientes', '-', `Exportación masiva auditada de padrón (${filteredPatients.length} pacientes) a CSV por ${currentUser?.name || 'Administración'}.`);
    }
    addToast('Padrón Exportado', `Se descargó el archivo CSV auditado (${filteredPatients.length} pacientes).`, 'success');
  };

  const handleStartConsultation = (pat) => {
    if (setIsNewConsultationModalOpen && setConsultationPreloadData) {
      setConsultationPreloadData({
        patientId: pat.id,
        patientName: pat.name,
        patientDni: pat.dni,
        doctorId: currentDoctor?.id || '',
        doctorName: currentDoctor?.name || '',
        doctorLicense: currentDoctor?.license || '',
        specialtyName: currentDoctor?.specialty || '',
        reason: 'Consulta médica programada'
      });
      setIsNewConsultationModalOpen(true);
    }
  };

  const handleBookAppointment = (pat) => {
    if (setIsAppointmentModalOpen && setAppointmentModalData) {
      const targetDoc = currentDoctor || (doctors && doctors[0]) || null;
      setAppointmentModalData({
        patientId: pat.id,
        patientName: pat.name,
        patientDni: pat.dni,
        patientPhone: pat.phone,
        patientInsurance: pat.insuranceName,
        doctorId: targetDoc?.id || '',
        doctorName: targetDoc?.name || '',
        specialtyName: targetDoc?.specialty || '',
        roomName: targetDoc?.roomName || 'Consultorio 101',
        date: getTodayArgentina(),
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
          {canExportPatients && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={exportPatientsCSV}
              style={{ fontSize: '0.84rem' }}
              title="Exportación auditada conforme a Ley 25.326"
            >
              <Download size={15} />
              <span>Exportar CSV</span>
            </button>
          )}

          {!isDoctor && (
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
          )}
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
        <div style={{ position: 'relative', flex: '1 1 280px', minWidth: '160px' }}>
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
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#0f172a', fontWeight: 800 }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>Paciente</th>
                <th style={{ padding: '0.85rem 1.25rem', width: '130px' }}>DNI</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Obra Social & Plan</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Contacto Directo</th>
                <th style={{ padding: '0.85rem 1.25rem', minWidth: '180px' }}>
                  {isDoctor ? 'Alertas Clínicas' : 'Médicos Asignados'}
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
                paginatedPatients.map((pat) => {
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

                        {/* Alertas Médicas (Médico) o Médicos Asignados (Recepción/Secretaría) */}
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
                            <div>
                              {getAssignedDoctors(pat).length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                  {getAssignedDoctors(pat).map((d) => (
                                    <span
                                      key={d.id}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '3px',
                                        background: '#f0f7ff',
                                        color: '#076ABC',
                                        border: '1px solid #bae0fd',
                                        padding: '2px 6px',
                                        borderRadius: '6px',
                                        fontSize: '0.72rem',
                                        fontWeight: 700
                                      }}
                                      title={`${d.name} (${d.specialtyName})`}
                                    >
                                      <Stethoscope size={10} color="#076ABC" />
                                      <span>{d.name.replace('Dr. ', '').replace('Dra. ', '')}</span>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                  Sin médico asignado
                                </span>
                              )}
                            </div>
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
                                      onClick={() => setSelectedPatientForDetail(pat)}
                                      style={{
                                        background: '#076ABC',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '0.45rem 0.85rem',
                                        fontSize: '0.8rem',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        boxShadow: '0 2px 8px rgba(7, 106, 188, 0.25)'
                                      }}
                                    >
                                      <FileText size={14} /> Ver Ficha / Historial Completo
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#076ABC', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Stethoscope size={14} /> Profesionales Médicos Asignados
                                  </div>
                                  <div style={{ marginBottom: '0.85rem' }}>
                                    {getAssignedDoctors(pat).length > 0 ? (
                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {getAssignedDoctors(pat).map((d) => (
                                          <div
                                            key={d.id}
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '8px',
                                              background: '#f8fafc',
                                              border: '1px solid #cbd5e1',
                                              borderRadius: '8px',
                                              padding: '5px 10px',
                                              fontSize: '0.8rem'
                                            }}
                                          >
                                            <div
                                              style={{
                                                width: '22px',
                                                height: '22px',
                                                borderRadius: '50%',
                                                background: '#076ABC',
                                                color: '#ffffff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.68rem',
                                                fontWeight: 800
                                              }}
                                            >
                                              {d.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                                            </div>
                                            <div>
                                              <div style={{ fontWeight: 700, color: '#0f172a', lineHeight: '1.2' }}>{d.name}</div>
                                              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{d.specialtyName}</div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                                        No tiene médicos asignados. Puede asignarle uno o más con el botón de abajo.
                                      </div>
                                    )}
                                  </div>

                                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                                    Datos de Recepción
                                  </div>
                                  <div style={{ fontSize: '0.82rem', color: '#334155', marginBottom: '0.85rem', lineHeight: '1.4' }}>
                                    <div><strong>Domicilio:</strong> {pat.address || 'Arroyito, Córdoba'}</div>
                                    <div><strong>Ciudad:</strong> {pat.city || 'Arroyito (Cba.)'}</div>
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
                                      <Edit2 size={13} /> Editar / Asignar Médicos
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

          {/* BARRA DE PAGINACIÓN PROFESIONAL (Auditoría Forense / R: Sin paginación) */}
          {filteredPatients.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1.25rem',
                background: '#ffffff',
                borderTop: '1px solid #e2e8f0',
                fontSize: '0.82rem',
                color: '#64748b',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}
            >
              {/* Info conteo */}
              <div>
                Mostrando <strong style={{ color: '#0f172a' }}>{(currentPage - 1) * pageSize + 1}</strong> a{' '}
                <strong style={{ color: '#0f172a' }}>{Math.min(currentPage * pageSize, filteredPatients.length)}</strong> de{' '}
                <strong style={{ color: '#0f172a' }}>{filteredPatients.length}</strong> pacientes
              </div>

              {/* Selector de tamaño y Controles de Página */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span>Por página:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.8rem',
                      color: '#0f172a',
                      background: '#f8fafc',
                      cursor: 'pointer'
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{
                      background: currentPage === 1 ? '#f8fafc' : '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: currentPage === 1 ? '#94a3b8' : '#0f172a',
                      borderRadius: '6px',
                      padding: '0.3rem 0.55rem',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      fontSize: '0.78rem',
                      fontWeight: 600
                    }}
                  >
                    <ChevronLeft size={14} /> Anterior
                  </button>

                  <span style={{ padding: '0 0.5rem', fontWeight: 700, color: '#0f172a', fontSize: '0.8rem' }}>
                    Página {currentPage} de {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      background: currentPage === totalPages ? '#f8fafc' : '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: currentPage === totalPages ? '#94a3b8' : '#0f172a',
                      borderRadius: '6px',
                      padding: '0.3rem 0.55rem',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      fontSize: '0.78rem',
                      fontWeight: 600
                    }}
                  >
                    Siguiente <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
