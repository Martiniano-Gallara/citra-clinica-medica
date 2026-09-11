import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Shield,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  TrendingUp,
  KeyRound,
  Ban,
  Percent,
  Check,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ExternalLink
} from 'lucide-react';

export const InsurancesView = () => {
  const {
    healthInsurances,
    insuranceAgreements,
    nomenclatorItems,
    authorizations,
    setIsOnlineAuthModalOpen,
    isDoctor,
    currentDoctor,
    updateDoctorInsurances,
    addToast
  } = useClinic();

  // Tabs for Doctor
  const [activeTab, setActiveTab] = useState('my-insurances'); // 'my-insurances', 'my-nomenclator'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('all'); // 'all', 'accepted', 'not-accepted'

  // Interactive Fichas Internas: which insurance ficha is expanded
  const [expandedFichaId, setExpandedFichaId] = useState(null);

  // Clean doctor display name (avoiding "Dr. Dr.")
  const doctorDisplayName = useMemo(() => {
    if (!currentDoctor) return 'Dr. Alejandro Blanco';
    const name = currentDoctor.name || 'Alejandro Blanco';
    return name.startsWith('Dr.') ? name : `Dr. ${name}`;
  }, [currentDoctor]);

  const doctorSpecialty = currentDoctor?.specialty || 'Traumatología y Ortopedia';

  // Doctor accepted insurance IDs
  const doctorAcceptedIds = currentDoctor?.acceptedInsurances || ['hi-1', 'hi-2', 'hi-3', 'hi-7'];

  // Toggle single insurance
  const handleToggleInsurance = (insId, e) => {
    if (e) e.stopPropagation();
    if (!currentDoctor) return;
    const exists = doctorAcceptedIds.includes(insId);
    const nextList = exists
      ? doctorAcceptedIds.filter((id) => id !== insId)
      : [...doctorAcceptedIds, insId];
    updateDoctorInsurances(currentDoctor.id, nextList);
    const target = healthInsurances.find((h) => h.id === insId);
    if (exists) {
      addToast('Cobertura Pausada', `Ya no acepta ${target?.name || 'la cobertura'} en su consultorio.`, 'info');
    } else {
      addToast('Cobertura Habilitada', `Ahora acepta ${target?.name || 'la cobertura'} en su consultorio.`, 'success');
    }
  };

  // Toggle all insurances
  const handleToggleAll = (enableAll) => {
    if (!currentDoctor) return;
    const nextList = enableAll ? healthInsurances.map((h) => h.id) : ['hi-7']; // Keep particular if disabling
    updateDoctorInsurances(currentDoctor.id, nextList);
    if (enableAll) {
      addToast('Todas Aceptadas', 'Se habilitaron todas las obras sociales registradas.', 'success');
    } else {
      addToast('Modo Particular', 'Se configuró atención exclusivamente privada / particular.', 'info');
    }
  };

  // Toggle ficha expansion
  const toggleFicha = (insId) => {
    setExpandedFichaId((prev) => (prev === insId ? null : insId));
  };

  // Traumatology nomenclator filter for Doctor
  const doctorNomenclator = useMemo(() => {
    return nomenclatorItems.filter((item) => {
      const isTrauma =
        item.category?.toLowerCase().includes('trauma') ||
        item.category?.toLowerCase().includes('consulta') ||
        item.name?.toLowerCase().includes('trauma') ||
        item.name?.toLowerCase().includes('consulta') ||
        item.name?.toLowerCase().includes('artro') ||
        item.name?.toLowerCase().includes('infiltr') ||
        item.name?.toLowerCase().includes('yeso');
      return isTrauma;
    });
  }, [nomenclatorItems]);

  // Filtered insurances for doctor
  const filteredDoctorInsurances = useMemo(() => {
    return healthInsurances.filter((hi) => {
      const matchesSearch =
        hi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (hi.plans && hi.plans.some((p) => p.toLowerCase().includes(searchTerm.toLowerCase())));
      const isAccepted = doctorAcceptedIds.includes(hi.id);
      if (!matchesSearch) return false;
      if (filterState === 'accepted') return isAccepted;
      if (filterState === 'not-accepted') return !isAccepted;
      return true;
    });
  }, [healthInsurances, searchTerm, filterState, doctorAcceptedIds]);

  // Consultation price
  const consultationPrice = currentDoctor?.priceConsultation || currentDoctor?.consultationPrice || 25000;
  const feePercentage = currentDoctor?.feePercentage || 75;

  // Administrative variables
  const filteredAgreements = insuranceAgreements.filter(
    (agr) =>
      agr.insuranceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agr.cuit.includes(searchTerm)
  );
  const totalAgreements = insuranceAgreements.length;
  const approvedAuths = authorizations.filter((a) => a.status === 'Aprobada Online').length;
  const rejectedAuths = authorizations.filter((a) => a.status === 'Rechazada').length;

  // Distinct brand styling for coverage logos
  const getBrandBadge = (hi) => {
    const name = hi.name.toLowerCase();
    if (name.includes('osde')) {
      return { bg: '#002B49', color: '#ffffff', short: 'OSDE' };
    }
    if (name.includes('swiss')) {
      return { bg: '#E11D48', color: '#ffffff', short: 'SMG' };
    }
    if (name.includes('galeno')) {
      return { bg: '#0284C7', color: '#ffffff', short: 'GAL' };
    }
    if (name.includes('apross')) {
      return { bg: '#059669', color: '#ffffff', short: 'APR' };
    }
    if (name.includes('pami')) {
      return { bg: '#0891B2', color: '#ffffff', short: 'PAMI' };
    }
    if (name.includes('medicus')) {
      return { bg: '#6366F1', color: '#ffffff', short: 'MED' };
    }
    return { bg: '#334155', color: '#ffffff', short: 'PART' };
  };

  // =========================================================================
  // DOCTOR VIEW: REDISEÑO ULTRA LIMPIO, SIN RUIDO VISUAL Y CON FICHAS INTERNAS
  // =========================================================================
  if (isDoctor) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
        {/* 1. TOP HEADER: MEDICAL-GRADE, CLEAN, NO FILLER TEXT */}
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
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  background: '#ecfdf5',
                  color: '#065f46',
                  border: '1px solid #a7f3d0',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '100px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Stethoscope size={13} />
                {doctorDisplayName} · {doctorSpecialty}
              </span>
              <span
                style={{
                  background: '#eff6ff',
                  color: '#1e40af',
                  border: '1px solid #bfdbfe',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '100px',
                  fontSize: '0.72rem',
                  fontWeight: 800
                }}
              >
                CONVENIOS & ARANCELES DE CONSULTORIO
              </span>
            </div>

            <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>
              Mis Obras Sociales & Coberturas
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
              Seleccione qué coberturas atiende en su consultorio y consulte condiciones arancelarias ({doctorAcceptedIds.length} de {healthInsurances.length} habilitadas).
            </p>
          </div>

          {/* Quick Bulk Actions */}
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => handleToggleAll(true)}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#1e293b',
                padding: '0.5rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <CheckCircle2 size={15} color="#059669" />
              Aceptar Todas
            </button>

            <button
              type="button"
              onClick={() => handleToggleAll(false)}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#1e293b',
                padding: '0.5rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Ban size={14} color="#64748b" />
              Solo Particular
            </button>
          </div>
        </div>

        {/* 2. OPERATIONAL KPI SUMMARY STRIP (CLEAN, SPACIOUS, ZERO WRAPPING BUGS) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1rem'
          }}
        >
          {/* Card 1: Coberturas Aceptadas */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem 1.2rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Obras Sociales Aceptadas
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Shield size={16} />
              </div>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>
              {doctorAcceptedIds.length}{' '}
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#94a3b8' }}>/ {healthInsurances.length}</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 700 }}>
              {Math.round((doctorAcceptedIds.length / healthInsurances.length) * 100)}% de cartilla habilitada
            </div>
          </div>

          {/* Card 2: Consulta Particular */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem 1.2rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Consulta Particular
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <DollarSign size={16} />
              </div>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>
              ${consultationPrice.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
              Arancel base para pacientes privados
            </div>
          </div>

          {/* Card 3: Liquidación Médica */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem 1.2rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Honorarios Profesionales
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#fef3c7',
                  color: '#b45309',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <TrendingUp size={16} />
              </div>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>
              {feePercentage}%
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
              Retención administrativa clínica: {100 - feePercentage}%
            </div>
          </div>

          {/* Card 4: Nomenclador Traumatológico */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem 1.2rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Prácticas Frecuentes
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#ede9fe',
                  color: '#6d28d9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FileText size={16} />
              </div>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>
              {doctorNomenclator.length} Códigos
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
              Nomenclador de traumatología activo
            </div>
          </div>
        </div>

        {/* 3. TABS & FILTER TOOLBAR (MINIMALIST & FAST) */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '0.85rem 1.15rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          {/* Main Navigation Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setActiveTab('my-insurances')}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: activeTab === 'my-insurances' ? 800 : 600,
                border: activeTab === 'my-insurances' ? '1px solid #076ABC' : '1px solid #e2e8f0',
                background: activeTab === 'my-insurances' ? '#076ABC' : '#ffffff',
                color: activeTab === 'my-insurances' ? '#ffffff' : '#475569',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Shield size={14} />
              Mis Coberturas ({doctorAcceptedIds.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('my-nomenclator')}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: activeTab === 'my-nomenclator' ? 800 : 600,
                border: activeTab === 'my-nomenclator' ? '1px solid #076ABC' : '1px solid #e2e8f0',
                background: activeTab === 'my-nomenclator' ? '#076ABC' : '#ffffff',
                color: activeTab === 'my-nomenclator' ? '#ffffff' : '#475569',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <FileText size={14} />
              Nomenclador Traumatológico ({doctorNomenclator.length})
            </button>
          </div>

          {/* Search and Filter Pills */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {activeTab === 'my-insurances' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginRight: '3px' }}>
                  Mostrar:
                </span>
                {[
                  { key: 'all', label: `Todas (${healthInsurances.length})` },
                  { key: 'accepted', label: `Aceptadas (${doctorAcceptedIds.length})` },
                  { key: 'not-accepted', label: `No atiendo (${healthInsurances.length - doctorAcceptedIds.length})` }
                ].map((pill) => {
                  const isActive = filterState === pill.key;
                  return (
                    <button
                      key={pill.key}
                      type="button"
                      onClick={() => setFilterState(pill.key)}
                      style={{
                        padding: '0.3rem 0.65rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: isActive ? 800 : 600,
                        border: isActive ? '1px solid #002182' : '1px solid #e2e8f0',
                        background: isActive ? '#002182' : '#f8fafc',
                        color: isActive ? '#ffffff' : '#475569',
                        cursor: 'pointer',
                        transition: 'all 0.12s ease'
                      }}
                    >
                      {pill.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Search */}
            <div style={{ position: 'relative', width: '220px' }}>
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }}
              />
              <input
                type="text"
                placeholder={activeTab === 'my-insurances' ? 'Buscar obra social o plan...' : 'Buscar práctica o código...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.75rem 0.45rem 2rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  outline: 'none',
                  background: '#f8fafc',
                  color: '#0f172a'
                }}
              />
            </div>
          </div>
        </div>

        {/* 4. TAB 1: LISTADO DE OBRAS SOCIALES CON FICHAS INTERNAS DESPLEGABLES */}
        {activeTab === 'my-insurances' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredDoctorInsurances.length === 0 ? (
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '3rem 1.5rem',
                  textAlign: 'center'
                }}
              >
                <Shield size={38} style={{ color: '#cbd5e1', marginBottom: '0.75rem' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.25rem' }}>
                  No se encontraron obras sociales
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1rem' }}>
                  No hay coberturas que coincidan con la búsqueda o el filtro aplicado.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterState('all');
                  }}
                  style={{
                    background: '#f1f5f9',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    padding: '0.45rem 0.95rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Restablecer Filtros
                </button>
              </div>
            ) : (
              filteredDoctorInsurances.map((hi) => {
                const isAccepted = doctorAcceptedIds.includes(hi.id);
                const isExpanded = expandedFichaId === hi.id;
                const brand = getBrandBadge(hi);
                const agreement = insuranceAgreements.find(
                  (a) => a.insuranceId === hi.id || a.insuranceName.toLowerCase().includes(hi.name.toLowerCase())
                );

                return (
                  <div
                    key={hi.id}
                    style={{
                      background: '#ffffff',
                      border: isExpanded ? '1px solid #076ABC' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: isExpanded ? '0 4px 14px rgba(7, 106, 188, 0.08)' : '0 1px 3px rgba(0,0,0,0.02)',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                    }}
                  >
                    {/* CABECERA DE LA FICHA (LIMPIA, MODERNA, SIN TEXTO INÚTIL) */}
                    <div
                      onClick={() => toggleFicha(hi.id)}
                      style={{
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        cursor: 'pointer',
                        background: isExpanded ? '#f8fafc' : '#ffffff'
                      }}
                    >
                      {/* Bloque Izquierdo: Brand Badge + Nombre + Planes */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flex: '1 1 280px' }}>
                        {/* Brand Badge */}
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '10px',
                            background: brand.bg,
                            color: brand.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 900,
                            fontSize: '0.82rem',
                            letterSpacing: '0.04em',
                            flexShrink: 0,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                          }}
                        >
                          {brand.short}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                              {hi.name}
                            </span>
                            {hi.id === 'hi-7' && (
                              <span style={{ fontSize: '0.7rem', background: '#f1f5f9', color: '#475569', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                                Sin intermediario
                              </span>
                            )}
                          </div>

                          {/* Plan pills */}
                          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '4px', flexWrap: 'wrap' }}>
                            {hi.plans && hi.plans.length > 0 ? (
                              hi.plans.map((p, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    background: isAccepted ? '#eff6ff' : '#f1f5f9',
                                    color: isAccepted ? '#1e40af' : '#64748b',
                                    border: isAccepted ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                                    padding: '0.1rem 0.45rem',
                                    borderRadius: '4px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700
                                  }}
                                >
                                  {p}
                                </span>
                              ))
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Todos los planes</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bloque Central: Copago / Plus de Consulta */}
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: '150px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                          Copago en Consultorio
                        </span>
                        <div>
                          {hi.copay > 0 ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: '#fef3c7',
                                color: '#b45309',
                                border: '1px solid #fde68a',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                marginTop: '2px'
                              }}
                            >
                              Copago: ${hi.copay.toLocaleString()}
                            </span>
                          ) : (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: '#ecfdf5',
                                color: '#059669',
                                border: '1px solid #a7f3d0',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                marginTop: '2px'
                              }}
                            >
                              ✓ Sin Copago (100% Cubierto)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bloque Derecho: Switch de Atención Directo + Botón Ficha */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {/* Toggle Button */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleInsurance(hi.id, e)}
                          title={isAccepted ? 'Haga clic para pausar la atención de esta cobertura' : 'Haga clic para aceptar esta cobertura'}
                          style={{
                            background: isAccepted ? '#ecfdf5' : '#f1f5f9',
                            border: isAccepted ? '1px solid #a7f3d0' : '1px solid #cbd5e1',
                            color: isAccepted ? '#065f46' : '#64748b',
                            padding: '0.4rem 0.85rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: isAccepted ? '#10b981' : '#94a3b8',
                              display: 'inline-block'
                            }}
                          />
                          {isAccepted ? 'Atendida por mí' : 'No aceptada'}
                        </button>

                        {/* Expand Ficha Chevron */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFicha(hi.id);
                          }}
                          title={isExpanded ? 'Ocultar ficha interna' : 'Ver ficha interna completa'}
                          style={{
                            background: isExpanded ? '#e2e8f0' : '#f8fafc',
                            border: '1px solid #cbd5e1',
                            color: '#475569',
                            padding: '0.4rem 0.65rem',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          <span>Ficha</span>
                          {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>
                      </div>
                    </div>

                    {/* FICHA INTERNA DESPLEGADA (CLARA, ESTRUCTURADA, SIN RELLENO) */}
                    {isExpanded && (
                      <div
                        style={{
                          borderTop: '1px solid #e2e8f0',
                          background: '#f8fafc',
                          padding: '1.25rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1rem'
                        }}
                      >
                        {/* Subheader Ficha */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                            borderBottom: '1px solid #e2e8f0',
                            paddingBottom: '0.65rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FileText size={15} color="#076ABC" />
                            <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                              Ficha de Convenio Clínico: {hi.name}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            Estado actual para {getDoctorDisplayName()}:{' '}
                            <strong style={{ color: isAccepted ? '#059669' : '#64748b' }}>
                              {isAccepted ? 'Habilitada en consultorio' : 'Pausada'}
                            </strong>
                          </div>
                        </div>

                        {/* Grid de 3 columnas limpias */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                            gap: '1rem'
                          }}
                        >
                          {/* Columna 1: Condiciones de Atención */}
                          <div
                            style={{
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              padding: '0.95rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.5rem'
                            }}
                          >
                            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                              Condiciones de Recepción
                            </span>
                            <div style={{ fontSize: '0.84rem', color: '#1e293b' }}>
                              <strong>Validación:</strong> Credencial Digital con Token / App
                            </div>
                            <div style={{ fontSize: '0.84rem', color: '#1e293b' }}>
                              <strong>Copago / Plus:</strong>{' '}
                              {hi.copay > 0 ? `$${hi.copay.toLocaleString()} (Cobro en recepción)` : 'Sin cobro adicional'}
                            </div>
                            <div style={{ fontSize: '0.84rem', color: '#1e293b' }}>
                              <strong>Planes cubiertos:</strong>{' '}
                              {hi.plans && hi.plans.length > 0 ? hi.plans.join(', ') : 'Padrón general'}
                            </div>
                          </div>

                          {/* Columna 2: Aranceles Nomenclados Clave */}
                          <div
                            style={{
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              padding: '0.95rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.5rem'
                            }}
                          >
                            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                              Aranceles Traumatológicos Sugeridos
                            </span>
                            <div style={{ fontSize: '0.82rem', color: '#334155', display: 'flex', justifyContent: 'space-between' }}>
                              <span>Consulta Traumatología (42.01.01):</span>
                              <strong style={{ color: '#0f172a' }}>$25.000</strong>
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#334155', display: 'flex', justifyContent: 'space-between' }}>
                              <span>Infiltración Articular (42.03.01):</span>
                              <strong style={{ color: '#0f172a' }}>$32.000</strong>
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#334155', display: 'flex', justifyContent: 'space-between' }}>
                              <span>Yeso / Inmovilización (42.04.01):</span>
                              <strong style={{ color: '#0f172a' }}>$28.000</strong>
                            </div>
                          </div>

                          {/* Columna 3: Control Rápido de Estado */}
                          <div
                            style={{
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              padding: '0.95rem',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              gap: '0.65rem'
                            }}
                          >
                            <div>
                              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                                Control de Agenda Médica
                              </span>
                              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0' }}>
                                {isAccepted
                                  ? 'Los pacientes con esta cobertura pueden reservar turnos para su consultorio.'
                                  : 'Los turnos para esta obra social se encuentran pausados en su agenda.'}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => handleToggleInsurance(hi.id, e)}
                              style={{
                                width: '100%',
                                background: isAccepted ? '#fef2f2' : '#ecfdf5',
                                border: isAccepted ? '1px solid #fecaca' : '1px solid #a7f3d0',
                                color: isAccepted ? '#b91c1c' : '#047857',
                                padding: '0.5rem',
                                borderRadius: '6px',
                                fontSize: '0.82rem',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              {isAccepted ? (
                                <>
                                  <Ban size={14} /> Pausar Atención para {hi.name}
                                </>
                              ) : (
                                <>
                                  <Check size={14} /> Habilitar Atención para {hi.name}
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 5. TAB 2: NOMENCLADOR DE TRAUMATOLOGÍA (SIMPLE, LIMPIO, SIN RELLENO) */}
        {activeTab === 'my-nomenclator' && (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.2rem' }}>
                Nomenclador de Prestaciones de Traumatología
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                Códigos homologados del Nomenclador Nacional para consultas, prescripciones y procedimientos en consultorio.
              </p>
            </div>

            <div style={{ width: '100%', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr
                    style={{
                      background: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      color: '#64748b',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}
                  >
                    <th style={{ padding: '0.85rem 1.25rem', width: '15%' }}>Código</th>
                    <th style={{ padding: '0.85rem 1rem', width: '45%' }}>Práctica Médica</th>
                    <th style={{ padding: '0.85rem 1rem', width: '20%' }}>Categoría</th>
                    <th style={{ padding: '0.85rem 1.25rem', width: '20%', textAlign: 'right' }}>Arancel Convenio</th>
                  </tr>
                </thead>
                <tbody>
                  {doctorNomenclator.map((item) => (
                    <tr key={item.code} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 1.25rem', verticalAlign: 'middle' }}>
                        <span
                          style={{
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            fontFamily: 'monospace'
                          }}
                        >
                          {item.code}
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                          {item.name}
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                        <span
                          style={{
                            background: '#f1f5f9',
                            color: '#475569',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.74rem',
                            fontWeight: 700
                          }}
                        >
                          {item.category}
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem', verticalAlign: 'middle', textAlign: 'right' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#002182' }}>
                          ${item.arancelBase?.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ====================================================
  // ADMINISTRATIVE VIEW: GESTIÓN INSTITUCIONAL COMPLETA
  // ====================================================
  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header">
        <div>
          <div className="badge-wrapper" style={{ marginBottom: '0.4rem' }}>
            <span className="badge badge-teal">
              <Shield size={13} style={{ marginRight: '4px' }} />
              Convenios Prestadores, Nomenclador Traumatológico & Autorizaciones Online
            </span>
          </div>
          <h1 className="view-title">Obras Sociales & Prepagas</h1>
          <p className="view-subtitle">
            Administración de convenios institucionales, aranceles del Nomenclador Nacional, validación de tokens en tiempo real y débitos.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsOnlineAuthModalOpen(true)}
          >
            <KeyRound size={18} />
            Validar / Autorizar Token Online
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="dashboard-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-teal">
            <Shield size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Convenios Vigentes</span>
            <span className="kpi-value">{totalAgreements}</span>
            <span className="kpi-meta text-success">OSDE, Swiss, Apross, PAMI</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-mint">
            <CheckCircle2 size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Autorizaciones Aprobadas</span>
            <span className="kpi-value">{approvedAuths}</span>
            <span className="kpi-meta text-success">Tasa de aprobación 92%</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-warning">
            <AlertCircle size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Débitos / Rechazos</span>
            <span className="kpi-value">{rejectedAuths}</span>
            <span className="kpi-meta text-warning">En revisión para refacturar</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-teal">
            <Percent size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Nomenclador Arancelado</span>
            <span className="kpi-value">{nomenclatorItems.length} cód</span>
            <span className="kpi-meta text-muted">Trauma & Kinesiología</span>
          </div>
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="filter-bar" style={{ justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'agreements' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('agreements')}
          >
            <Shield size={15} />
            Convenios & Prepagas ({insuranceAgreements.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'authorizations' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('authorizations')}
          >
            <KeyRound size={15} />
            Autorizaciones Online ({authorizations.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'nomenclator' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('nomenclator')}
          >
            <FileText size={15} />
            Nomenclador Nacional ({nomenclatorItems.length})
          </button>
        </div>

        <div className="search-box-inline">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar convenio, CUIT, autorización..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Content for Administrative Tabs */}
      {activeTab === 'agreements' && (
        <div className="card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Obra Social / Prepaga</th>
                  <th>CUIT & Convenio</th>
                  <th>Validación Online</th>
                  <th>Plazo de Pago</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredAgreements.map((agr) => (
                  <tr key={agr.id}>
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{agr.insuranceName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{agr.agreementType}</div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{agr.cuit}</span>
                    </td>
                    <td>
                      <span className="badge badge-teal" style={{ fontSize: '0.78rem' }}>
                        {agr.onlineValidation}
                      </span>
                    </td>
                    <td>{agr.paymentTermDays} días</td>
                    <td>
                      <span className="badge badge-success">{agr.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
