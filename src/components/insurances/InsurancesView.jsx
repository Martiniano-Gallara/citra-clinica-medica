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
import { OnlineAuthModal } from './OnlineAuthModal';

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

  // Tabs for Doctor vs Administrative
  const [activeTab, setActiveTab] = useState(isDoctor ? 'my-insurances' : 'agreements');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('all'); // 'all', 'accepted', 'not-accepted'

  React.useEffect(() => {
    if (isDoctor && !['my-insurances', 'my-nomenclator'].includes(activeTab)) {
      setActiveTab('my-insurances');
    } else if (!isDoctor && !['agreements', 'authorizations', 'nomenclator'].includes(activeTab)) {
      setActiveTab('agreements');
    }
  }, [isDoctor]);

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
    if (!currentDoctor?.id) return;
    const exists = doctorAcceptedIds.includes(insId);
    const nextList = exists
      ? doctorAcceptedIds.filter((id) => id !== insId)
      : [...doctorAcceptedIds, insId];
    if (typeof updateDoctorInsurances === 'function') {
      updateDoctorInsurances(currentDoctor.id, nextList);
    }
    const target = healthInsurances.find((h) => h.id === insId);
    if (exists) {
      addToast('Cobertura Pausada', `Ya no acepta ${target?.name || 'la cobertura'} en su consultorio.`, 'info');
    } else {
      addToast('Cobertura Habilitada', `Ahora acepta ${target?.name || 'la cobertura'} en su consultorio.`, 'success');
    }
  };

  // Toggle all insurances
  const handleToggleAll = (enableAll) => {
    if (!currentDoctor?.id) return;
    const nextList = enableAll ? healthInsurances.map((h) => h.id) : ['hi-7']; // Keep particular if disabling
    if (typeof updateDoctorInsurances === 'function') {
      updateDoctorInsurances(currentDoctor.id, nextList);
    }
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

  // Official logos mapping matching Inicio / InsurancesSection
  const INSURANCE_LOGOS = {
    'OSDE': '/logos/logo-osde.png',
    'Swiss Medical': '/logos/logo-swiss-medical.png',
    'Galeno': '/logos/logo-galeno.png',
    'Apross': '/logos/logo-apross.png',
    'PAMI': '/logos/logo-pami.png',
    'Medicus': '/logos/logo-medicus.svg'
  };

  const getResolvedLogo = (hi) => {
    if (!hi) return null;
    if (hi.logo && typeof hi.logo === 'string' && hi.logo.trim() !== '') return hi.logo;
    const name = (hi.name || hi.insuranceName || '').toLowerCase();
    for (const [key, path] of Object.entries(INSURANCE_LOGOS)) {
      if (name.includes(key.toLowerCase())) return path;
    }
    return null;
  };

  const getCoverageType = (hi) => {
    const name = (hi?.name || hi?.insuranceName || '').toLowerCase();
    if (name.includes('particular') || hi?.id === 'hi-7') {
      return { label: 'Atención Privada', bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' };
    }
    if (name.includes('apross') || name.includes('pami')) {
      return { label: 'Obra Social', bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' };
    }
    return { label: 'Prepaga Nacional', bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' };
  };

  const renderInsuranceLogo = (hi, size = 48) => {
    const logoSrc = getResolvedLogo(hi);
    const isParticular = hi?.id === 'hi-7' || ((hi?.name || hi?.insuranceName || '').toLowerCase().includes('particular'));
    const displayName = hi?.name || hi?.insuranceName || 'OS';

    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: size >= 44 ? '12px' : '8px',
          background: '#ffffff',
          border: '1.5px solid #EDF3FD',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: size >= 44 ? '4px' : '2px',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0, 33, 130, 0.05)',
          overflow: 'hidden'
        }}
      >
        {logoSrc ? (
          <img
            src={logoSrc}
            alt={displayName}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextSibling) {
                e.currentTarget.nextSibling.style.display = 'flex';
              }
            }}
          />
        ) : null}
        <div
          style={{
            display: logoSrc ? 'none' : 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            background: isParticular ? '#F8FAFC' : '#EFF6FF',
            borderRadius: size >= 44 ? '8px' : '6px',
            color: isParticular ? '#475569' : '#002182'
          }}
        >
          {isParticular ? (
            <DollarSign size={size >= 44 ? 20 : 16} color="#002182" />
          ) : (
            <span style={{ fontSize: size >= 44 ? '0.85rem' : '0.72rem', fontWeight: 900 }}>
              {displayName.substring(0, 2).toUpperCase()}
            </span>
          )}
        </div>
      </div>
    );
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
            <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>
              Mis Obras Sociales & Coberturas
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
              Gestión de coberturas médicas y condiciones de atención en consultorio.
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
                const coverageType = getCoverageType(hi);
                const agreement = insuranceAgreements.find(
                  (a) => a.insuranceId === hi.id || a.insuranceName.toLowerCase().includes(hi.name.toLowerCase())
                );

                return (
                  <div
                    key={hi.id}
                    style={{
                      background: '#ffffff',
                      border: isExpanded ? '1.5px solid #076ABC' : '1px solid #e2e8f0',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      boxShadow: isExpanded ? '0 6px 20px rgba(7, 106, 188, 0.09)' : '0 2px 6px rgba(0, 33, 130, 0.03)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* CABECERA DE LA FICHA CON LOGOS OFICIALES Y ESTILIZACIÓN PREMIUM */}
                    <div
                      onClick={() => toggleFicha(hi.id)}
                      style={{
                        padding: '1.1rem 1.35rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        cursor: 'pointer',
                        background: isExpanded ? '#f8fafc' : '#ffffff',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      {/* Bloque Izquierdo: Logo Oficial en Caja Blanca + Nombre + Categoría + Planes */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 300px' }}>
                        {/* Logo Oficial Caja Blanca */}
                        {renderInsuranceLogo(hi, 50)}

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                              {hi.name}
                            </span>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                background: coverageType.bg,
                                color: coverageType.color,
                                border: `1px solid ${coverageType.border}`,
                                padding: '0.12rem 0.5rem',
                                borderRadius: '6px'
                              }}
                            >
                              {coverageType.label}
                            </span>
                          </div>

                          {/* Plan pills */}
                          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '5px', flexWrap: 'wrap' }}>
                            {hi.plans && hi.plans.length > 0 ? (
                              hi.plans.map((p, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    background: isAccepted ? '#eff6ff' : '#f8fafc',
                                    color: isAccepted ? '#1e40af' : '#64748b',
                                    border: isAccepted ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                                    padding: '0.12rem 0.45rem',
                                    borderRadius: '5px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700
                                  }}
                                >
                                  {p}
                                </span>
                              ))
                            ) : (
                              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Todos los planes</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bloque Central: Copago / Plus de Consulta */}
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: '160px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Copago en Consultorio
                        </span>
                        <div>
                          {hi.copay > 0 ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                background: '#FFFBEB',
                                color: '#B45309',
                                border: '1px solid #FDE68A',
                                padding: '0.25rem 0.65rem',
                                borderRadius: '8px',
                                fontSize: '0.82rem',
                                fontWeight: 800,
                                marginTop: '3px'
                              }}
                            >
                              Copago: ${hi.copay.toLocaleString()}
                            </span>
                          ) : (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                background: '#ECFDF5',
                                color: '#059669',
                                border: '1px solid #A7F3D0',
                                padding: '0.25rem 0.65rem',
                                borderRadius: '8px',
                                fontSize: '0.82rem',
                                fontWeight: 800,
                                marginTop: '3px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              <Check size={13} color="#059669" /> Sin Copago (100% Cubierto)
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
                            background: isAccepted ? '#ECFDF5' : '#F8FAFC',
                            border: isAccepted ? '1px solid #A7F3D0' : '1px solid #CBD5E1',
                            color: isAccepted ? '#065F46' : '#64748B',
                            padding: '0.45rem 0.9rem',
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
                              background: isAccepted ? '#10B981' : '#94A3B8',
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
                            background: isExpanded ? '#E2E8F0' : '#F8FAFC',
                            border: '1px solid #CBD5E1',
                            color: '#334155',
                            padding: '0.45rem 0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>Ficha</span>
                          {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>
                      </div>
                    </div>

                    {/* FICHA INTERNA DESPLEGADA (CLARA, ESTRUCTURADA, CON LOGO) */}
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
                        {/* Subheader Ficha con Logo Real */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '0.75rem',
                            borderBottom: '1px solid #e2e8f0',
                            paddingBottom: '0.75rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {renderInsuranceLogo(hi, 36)}
                            <div>
                              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                                Convenio Clínico: {hi.name}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                {coverageType.label} · Planes habilitados: {hi.plans?.join(', ') || 'General'}
                              </div>
                            </div>
                          </div>

                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            Estado en consultorio:{' '}
                            <strong style={{ color: isAccepted ? '#059669' : '#dc2626' }}>
                              {isAccepted ? '● Habilitada para turnos' : '○ Pausada'}
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        {renderInsuranceLogo({ name: agr.insuranceName }, 38)}
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{agr.insuranceName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{agr.agreementType}</div>
                        </div>
                      </div>
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

      {/* Tab 2: Autorizaciones Online Registradas */}
      {activeTab === 'authorizations' && (
        <div className="card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Paciente / DNI</th>
                  <th>Obra Social</th>
                  <th>Práctica Homologada</th>
                  <th>Token Digital</th>
                  <th>Fecha & Hora</th>
                  <th>Copago</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {authorizations
                  .filter((a) =>
                    (a.patientName && a.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (a.insuranceName && a.insuranceName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (a.tokenProvided && a.tokenProvided.toLowerCase().includes(searchTerm.toLowerCase()))
                  )
                  .map((auth) => (
                    <tr key={auth.id}>
                      <td>
                        <div style={{ fontWeight: 800, color: '#002182' }}>{auth.patientName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>DNI {auth.patientDni}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{auth.insuranceName}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#002182' }}>
                          {auth.nomenclatorCode} — {auth.description}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            background: '#EFF6FF',
                            color: '#1D4ED8',
                            border: '1px solid #BFDBFE',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            fontSize: '0.82rem'
                          }}
                        >
                          {auth.tokenProvided}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        {auth.requestedAt || '2026-08-28 10:15'}
                      </td>
                      <td>
                        {auth.copayCharged > 0 ? (
                          <span style={{ fontWeight: 800, color: '#b45309' }}>
                            ${auth.copayCharged?.toLocaleString()}
                          </span>
                        ) : (
                          <span style={{ color: '#059669', fontWeight: 700 }}>$0 (Cubierto)</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            auth.status === 'Aprobada Online'
                              ? 'badge-success'
                              : auth.status === 'Rechazada'
                              ? 'badge-danger'
                              : 'badge-warning'
                          }`}
                        >
                          {auth.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Nomenclador Nacional Completo Institucional */}
      {activeTab === 'nomenclator' && (
        <div className="card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Práctica Médica</th>
                  <th>Categoría</th>
                  <th>Especialidad</th>
                  <th style={{ textAlign: 'right' }}>Arancel Base</th>
                </tr>
              </thead>
              <tbody>
                {nomenclatorItems
                  .filter((item) =>
                    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.code?.includes(searchTerm) ||
                    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((item) => (
                    <tr key={item.code}>
                      <td>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            fontSize: '0.82rem'
                          }}
                        >
                          {item.code}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                      </td>
                      <td>
                        <span className="badge badge-outline" style={{ fontSize: '0.78rem' }}>
                          {item.category}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', color: '#475569' }}>
                          {item.specialty || 'General / Traumatología'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 800, color: '#002182', fontSize: '0.94rem' }}>
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

      {/* Modal de Validación Online */}
      <OnlineAuthModal />
    </div>
  );
};
