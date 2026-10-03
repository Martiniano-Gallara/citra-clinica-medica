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
  ExternalLink,
  UserCheck,
  Users,
  Award
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
    doctors,
    updateDoctorInsurances,
    addToast
  } = useClinic();

  // Tabs for Secretaría / Administrativo: 'doctor-insurances' | 'agreements' | 'authorizations' | 'nomenclator'
  const [activeTab, setActiveTab] = useState('doctor-insurances');
  const [selectedDoctorId, setSelectedDoctorId] = useState(() => (doctors && doctors[0]?.id ? doctors[0].id : 'doc-1'));
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('all'); // 'all', 'accepted', 'not-accepted'
  const [expandedFichaId, setExpandedFichaId] = useState(null);

  const selectedDoctor = (doctors && doctors.find((d) => d.id === selectedDoctorId)) || doctors?.[0] || null;
  const doctorAcceptedIds = selectedDoctor?.acceptedInsurances || [];

  // Toggle single insurance for the selected doctor
  const handleToggleInsurance = (insId, e) => {
    if (e) e.stopPropagation();
    if (!selectedDoctor?.id) return;
    const exists = doctorAcceptedIds.includes(insId);
    const nextList = exists
      ? doctorAcceptedIds.filter((id) => id !== insId)
      : [...doctorAcceptedIds, insId];
    if (typeof updateDoctorInsurances === 'function') {
      updateDoctorInsurances(selectedDoctor.id, nextList);
    }
    const target = healthInsurances.find((h) => h.id === insId);
    if (exists) {
      addToast('Cobertura Removida', `${selectedDoctor.name} ya no atiende por ${target?.name || 'esta cobertura'}.`, 'info');
    } else {
      addToast('Cobertura Habilitada', `${selectedDoctor.name} ahora atiende por ${target?.name || 'esta cobertura'}.`, 'success');
    }
  };

  // Toggle all insurances for the selected doctor
  const handleToggleAll = (enableAll) => {
    if (!selectedDoctor?.id) return;
    const nextList = enableAll ? healthInsurances.map((h) => h.id) : ['hi-7']; // Keep particular if disabling
    if (typeof updateDoctorInsurances === 'function') {
      updateDoctorInsurances(selectedDoctor.id, nextList);
    }
    if (enableAll) {
      addToast('Todas Habilitadas', `Se habilitaron todas las obras sociales para ${selectedDoctor.name}.`, 'success');
    } else {
      addToast('Modo Particular', `Se configuró a ${selectedDoctor.name} exclusivamente en atención privada / particular.`, 'info');
    }
  };

  // Toggle ficha expansion
  const toggleFicha = (insId) => {
    setExpandedFichaId((prev) => (prev === insId ? null : insId));
  };

  // Filtered insurances for selected doctor
  const filteredDoctorInsurances = useMemo(() => {
    return healthInsurances.filter((hi) => {
      const cleanSearch = searchTerm.toLowerCase().trim();
      const matchesSearch =
        cleanSearch === '' ||
        hi.name.toLowerCase().includes(cleanSearch) ||
        (hi.plans && hi.plans.some((p) => p.toLowerCase().includes(cleanSearch)));
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
  // DOCTOR ACCESS RESTRICTION: GESTIÓN EXCLUSIVA DE SECRETARÍA Y ADMINISTRACIÓN
  // =========================================================================
  if (isDoctor) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '65vh',
          textAlign: 'center',
          padding: '2.5rem',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0, 33, 130, 0.04)'
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: '#EFF6FF',
            color: '#002182',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem'
          }}
        >
          <Shield size={32} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
          Gestión Centralizada en Secretaría
        </h2>
        <p style={{ fontSize: '0.92rem', color: '#64748b', maxWidth: '540px', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
          La asignación y parametrización de obras sociales, convenios institucionales y coberturas aceptadas por cada profesional médico es administrada de forma centralizada y exclusiva por el equipo de Secretaría y Recepción.
        </p>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            background: '#F8FAFC',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            fontSize: '0.85rem',
            color: '#475569',
            fontWeight: 600
          }}
        >
          <Info size={16} color="#002182" />
          Para solicitar modificaciones en las obras sociales que atendés, comunicate con el equipo de Secretaría.
        </div>
      </div>
    );
  }

  // ====================================================
  // ADMINISTRATIVE VIEW: GESTIÓN INSTITUCIONAL COMPLETA
  // ====================================================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
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
            Obras Sociales & Prepagas
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            Administración de convenios institucionales, aranceles del Nomenclador Nacional, validación de tokens en tiempo real y débitos.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setIsOnlineAuthModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '0.65rem 1.15rem',
              borderRadius: '10px',
              fontSize: '0.86rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(7, 106, 188, 0.25)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(7, 106, 188, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(7, 106, 188, 0.25)';
            }}
          >
            <KeyRound size={17} />
            Validar / Autorizar Token Online
          </button>
        </div>
      </div>

      {/* KPI Stats Grid (Compactado) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '0.85rem'
        }}
      >
        {/* Card 1 */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #0284c7',
            padding: '0.7rem 1.1rem',
            boxShadow: '0 2px 6px rgba(0, 33, 130, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Convenios Vigentes
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem', marginTop: '2px' }}>
              <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                {totalAgreements}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 600 }}>
                OSDE, Apross, PAMI
              </span>
            </div>
          </div>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#eff6ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Shield size={16} />
          </div>
        </div>

        {/* Card 2 */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #16a34a',
            padding: '0.7rem 1.1rem',
            boxShadow: '0 2px 6px rgba(0, 33, 130, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Autorizaciones Aprobadas
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem', marginTop: '2px' }}>
              <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                {approvedAuths}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>
                92% aprobadas
              </span>
            </div>
          </div>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CheckCircle2 size={16} />
          </div>
        </div>

        {/* Card 3 */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #dc2626',
            padding: '0.7rem 1.1rem',
            boxShadow: '0 2px 6px rgba(0, 33, 130, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Débitos / Rechazos
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem', marginTop: '2px' }}>
              <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#dc2626', lineHeight: 1 }}>
                {rejectedAuths}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#b91c1c', fontWeight: 600 }}>
                en revisión
              </span>
            </div>
          </div>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertCircle size={16} />
          </div>
        </div>

        {/* Card 4 */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #9333ea',
            padding: '0.7rem 1.1rem',
            boxShadow: '0 2px 6px rgba(0, 33, 130, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Nomenclador Arancelado
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem', marginTop: '2px' }}>
              <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                {nomenclatorItems.length}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                códigos activos
              </span>
            </div>
          </div>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Percent size={16} />
          </div>
        </div>
      </div>

      {/* Navigation Filter Tabs & Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          background: '#ffffff',
          padding: '0.65rem 0.85rem',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0, 33, 130, 0.02)'
        }}
      >
        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('doctor-insurances')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 0.95rem',
              borderRadius: '10px',
              border: activeTab === 'doctor-insurances' ? '1px solid #002182' : '1px solid #e2e8f0',
              background: activeTab === 'doctor-insurances' ? '#002182' : '#ffffff',
              color: activeTab === 'doctor-insurances' ? '#ffffff' : '#475569',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <UserCheck size={15} />
            Asignación por Médico ({doctors.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('agreements')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 0.95rem',
              borderRadius: '10px',
              border: activeTab === 'agreements' ? '1px solid #002182' : '1px solid #e2e8f0',
              background: activeTab === 'agreements' ? '#002182' : '#ffffff',
              color: activeTab === 'agreements' ? '#ffffff' : '#475569',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Shield size={15} />
            Convenios & Prepagas ({insuranceAgreements.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('authorizations')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 0.95rem',
              borderRadius: '10px',
              border: activeTab === 'authorizations' ? '1px solid #002182' : '1px solid #e2e8f0',
              background: activeTab === 'authorizations' ? '#002182' : '#ffffff',
              color: activeTab === 'authorizations' ? '#ffffff' : '#475569',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <KeyRound size={15} />
            Autorizaciones Online ({authorizations.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('nomenclator')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 0.95rem',
              borderRadius: '10px',
              border: activeTab === 'nomenclator' ? '1px solid #002182' : '1px solid #e2e8f0',
              background: activeTab === 'nomenclator' ? '#002182' : '#ffffff',
              color: activeTab === 'nomenclator' ? '#ffffff' : '#475569',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <FileText size={15} />
            Nomenclador Nacional ({nomenclatorItems.length})
          </button>
        </div>

        {/* Search Input Box */}
        <div style={{ position: 'relative', minWidth: '260px', maxWidth: '380px', flex: '1 1 260px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8'
            }}
          />
          <input
            type="text"
            placeholder="Buscar convenio, CUIT, autorización..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '0.55rem 0.85rem 0.55rem 2.35rem',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '0.82rem',
              outline: 'none',
              background: '#f8fafc',
              color: '#0f172a',
              transition: 'all 0.15s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#002182';
              e.target.style.background = '#ffffff';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#cbd5e1';
              e.target.style.background = '#f8fafc';
            }}
          />
        </div>
      </div>

      {/* Content for Administrative Tabs */}
      {/* TAB 1: ASIGNACIÓN DE OBRAS SOCIALES POR MÉDICO (SECRETARÍA) */}
      {activeTab === 'doctor-insurances' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* A. SELECTOR DE PROFESIONALES */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '1.25rem',
              boxShadow: '0 2px 8px rgba(0, 33, 130, 0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={18} color="#002182" />
                  Paso 1: Seleccionar Médico de CITRA
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Haga clic en un profesional para ver y personalizar qué obras sociales atiende en consultorio.
                </p>
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '20px',
                  border: '1px solid #bfdbfe'
                }}
              >
                {doctors.length} Médicos en Nómina
              </span>
            </div>

            {/* Doctors Grid / Cards Strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '0.85rem'
              }}
            >
              {doctors.map((doc) => {
                const isSelected = (selectedDoctor?.id || selectedDoctorId) === doc.id;
                const acceptedCount = (doc.acceptedInsurances || []).length;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoctorId(doc.id)}
                    style={{
                      background: isSelected ? 'linear-gradient(135deg, #F0F6FF 0%, #FFFFFF 100%)' : '#ffffff',
                      border: isSelected ? '2px solid #002182' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(0, 33, 130, 0.08)' : 'none',
                      position: 'relative'
                    }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'rgba(7, 106, 188, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#002182',
                        flexShrink: 0,
                        border: isSelected ? '2px solid #002182' : '1.5px solid #cbd5e1'
                      }}
                      title="Médico"
                    >
                      <Stethoscope size={18} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: isSelected ? '#002182' : '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#076ABC', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.specialty?.toLowerCase().includes('traumatolog') ? 'Traumatólogo' : doc.specialty}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: acceptedCount > 0 ? '#166534' : '#991b1b',
                            background: acceptedCount > 0 ? '#dcfce7' : '#fee2e2',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '4px'
                          }}
                        >
                          {acceptedCount} {acceptedCount === 1 ? 'cobertura' : 'coberturas'}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: '#002182',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* B. FICHA DEL MÉDICO SELECCIONADO + CONTROLES DE SECRETARÍA */}
          {selectedDoctor && (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '1.25rem',
                boxShadow: '0 2px 8px rgba(0, 33, 130, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              {/* Doctor Details Bar & Bulk Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  borderBottom: '1px solid #f1f5f9',
                  paddingBottom: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: 'rgba(7, 106, 188, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#002182',
                      flexShrink: 0,
                      border: '2px solid #002182',
                      boxShadow: '0 2px 8px rgba(0,33,130,0.1)'
                    }}
                    title="Médico"
                  >
                    <Stethoscope size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
                        {selectedDoctor.name}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          background: '#EFF6FF',
                          color: '#1D4ED8',
                          border: '1px solid #BFDBFE',
                          padding: '0.15rem 0.55rem',
                          borderRadius: '6px'
                        }}
                      >
                        {selectedDoctor.specialty || 'Especialidad'}
                      </span>
                    </div>
                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                      Arancel Privado: <strong style={{ color: '#0f172a' }}>${(selectedDoctor.priceConsultation || 25000).toLocaleString('es-AR')}</strong> · 
                      Honorarios: <strong style={{ color: '#0f172a' }}>{selectedDoctor.feePercentage || 75}%</strong>
                    </p>
                  </div>
                </div>

                {/* Bulk Actions for this doctor */}
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleToggleAll(true)}
                    style={{
                      background: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      color: '#065F46',
                      padding: '0.5rem 0.9rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <CheckCircle2 size={16} color="#059669" />
                    Habilitar Todas
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleAll(false)}
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      color: '#475569',
                      padding: '0.5rem 0.9rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Ban size={15} color="#64748b" />
                    Solo Particular
                  </button>
                </div>
              </div>

              {/* Filters for this doctor's insurances */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setFilterState('all')}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '20px',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: filterState === 'all' ? '#002182' : '#f1f5f9',
                      color: filterState === 'all' ? '#ffffff' : '#475569'
                    }}
                  >
                    Todas ({healthInsurances.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterState('accepted')}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '20px',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: filterState === 'accepted' ? '#002182' : '#f1f5f9',
                      color: filterState === 'accepted' ? '#ffffff' : '#475569'
                    }}
                  >
                    Habilitadas para {selectedDoctor.name.split(' ')[0]} ({doctorAcceptedIds.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterState('not-accepted')}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '20px',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: filterState === 'not-accepted' ? '#002182' : '#f1f5f9',
                      color: filterState === 'not-accepted' ? '#ffffff' : '#475569'
                    }}
                  >
                    No Habilitadas ({healthInsurances.length - doctorAcceptedIds.length})
                  </button>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                  Personalizando nómina de: <strong style={{ color: '#002182' }}>{selectedDoctor.name}</strong>
                </div>
              </div>
            </div>
          )}

          {/* C. LISTA DE COBERTURAS CON SWITCH DE PERSONALIZACIÓN PARA SECRETARÍA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredDoctorInsurances.length === 0 ? (
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '3rem 1.5rem',
                  textAlign: 'center'
                }}
              >
                <Shield size={38} style={{ color: '#cbd5e1', marginBottom: '0.75rem' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.25rem' }}>
                  No se encontraron obras sociales
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1rem' }}>
                  No hay coberturas que coincidan con la búsqueda o el filtro aplicado para este médico.
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
                      border: isExpanded ? '1.5px solid #076ABC' : isAccepted ? '1px solid #BFDBFE' : '1px solid #e2e8f0',
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
                        background: isExpanded ? '#f8fafc' : isAccepted ? '#FAFCFF' : '#ffffff',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      {/* Bloque Izquierdo: Logo Oficial en Caja Blanca + Nombre + Categoría + Planes */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 300px' }}>
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

                      {/* Bloque Central: Copago en Consultorio */}
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
                                marginTop: '3px'
                              }}
                            >
                              <Check size={13} color="#059669" /> Sin Copago (100% Cubierto)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bloque Derecho: Control de Asignación por Secretaría + Botón Ficha */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {/* Toggle Button for Secretaria */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleInsurance(hi.id, e)}
                          title={isAccepted ? `Clic para deshabilitar esta cobertura para ${selectedDoctor?.name}` : `Clic para habilitar esta cobertura para ${selectedDoctor?.name}`}
                          style={{
                            background: isAccepted ? '#ECFDF5' : '#F8FAFC',
                            border: isAccepted ? '1.5px solid #10B981' : '1px solid #CBD5E1',
                            color: isAccepted ? '#065F46' : '#64748B',
                            padding: '0.45rem 0.95rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            boxShadow: isAccepted ? '0 2px 6px rgba(16, 185, 129, 0.15)' : 'none'
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
                          {isAccepted ? `Habilitada (${selectedDoctor?.name?.split(' ')[1] || selectedDoctor?.name || 'Médico'})` : 'No atiende (Clic para habilitar)'}
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

                    {/* FICHA INTERNA DESPLEGADA */}
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
                              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                                Ficha Técnica: {hi.name}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                CUIT: {agreement?.cuit || '30-50001234-9'} · Validador: {agreement?.validator || 'Web / API Online Directa'}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                background: isAccepted ? '#ECFDF5' : '#F1F5F9',
                                color: isAccepted ? '#047857' : '#64748B',
                                border: isAccepted ? '1px solid #A7F3D0' : '1px solid #CBD5E1',
                                padding: '0.25rem 0.65rem',
                                borderRadius: '20px'
                              }}
                            >
                              {isAccepted ? `● Habilitada para ${selectedDoctor?.name}` : '○ No Habilitada'}
                            </span>
                          </div>
                        </div>

                        {/* 3 Column Information Grid */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                            gap: '0.85rem'
                          }}
                        >
                          {/* Col 1 */}
                          <div
                            style={{
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '10px',
                              padding: '0.85rem 1rem'
                            }}
                          >
                            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                              Copago y Modalidad
                            </div>
                            <div style={{ fontSize: '1.05rem', fontWeight: 900, color: hi.copay > 0 ? '#B45309' : '#059669' }}>
                              {hi.copay > 0 ? `$${hi.copay.toLocaleString()} en consultorio` : 'Sin Copago (100% Cubierto)'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                              Arancel privado de referencia: ${(selectedDoctor?.priceConsultation || 25000).toLocaleString('es-AR')}
                            </div>
                          </div>

                          {/* Col 2 */}
                          <div
                            style={{
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '10px',
                              padding: '0.85rem 1rem'
                            }}
                          >
                            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                              Requisitos de Atención en Secretaría
                            </div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                              {hi.requirements || 'Credencial física o digital en app + Token / DNI'}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
                              Vigencia de bono o código de autorización: 30 días corridos.
                            </div>
                          </div>

                          {/* Col 3 */}
                          <div
                            style={{
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '10px',
                              padding: '0.85rem 1rem'
                            }}
                          >
                            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                              Validación Online en Mostrador
                            </div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                              {agreement?.validator || 'Plataforma Web Autorizadora en vivo'}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700, marginTop: '4px' }}>
                              ✓ Token en tiempo real habilitado
                            </div>
                          </div>
                        </div>

                        {/* Nomenclador y Prácticas Asociadas */}
                        <div
                          style={{
                            background: '#ffffff',
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0',
                            padding: '0.85rem 1rem'
                          }}
                        >
                          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#002182', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.65rem' }}>
                            Prácticas Frecuentes y Aranceles ({selectedDoctor?.specialty || 'General'})
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.5rem' }}>
                            {nomenclatorItems.slice(0, 4).map((item) => (
                              <div
                                key={item.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  background: '#f8fafc',
                                  padding: '0.5rem 0.75rem',
                                  borderRadius: '6px',
                                  border: '1px solid #e2e8f0',
                                  fontSize: '0.78rem'
                                }}
                              >
                                <div>
                                  <span style={{ fontWeight: 800, fontFamily: 'monospace', color: '#002182', marginRight: '6px' }}>
                                    {item.code}
                                  </span>
                                  <span style={{ fontWeight: 600, color: '#334155' }}>
                                    {item.name}
                                  </span>
                                </div>
                                <span style={{ fontWeight: 800, color: '#0f172a' }}>
                                  ${item.arancelBase?.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Content for Administrative Tabs */}
      {activeTab === 'agreements' && (
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
                  <th style={{ padding: '0.9rem 1.25rem' }}>Obra Social / Prepaga</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>CUIT & Convenio</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Validación Online</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Plazo de Pago</th>
                  <th style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredAgreements.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
                      <Shield size={36} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>No se encontraron convenios</div>
                      <div style={{ fontSize: '0.82rem' }}>Intente ajustar el término de búsqueda.</div>
                    </td>
                  </tr>
                ) : (
                  filteredAgreements.map((agr) => {
                    const statusColor = agr.status?.toLowerCase().includes('coseguro')
                      ? { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' }
                      : agr.status?.toLowerCase().includes('capitado')
                      ? { bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff' }
                      : { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' };

                    return (
                      <tr
                        key={agr.id}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; }}
                      >
                        <td style={{ padding: '0.95rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            {renderInsuranceLogo({ name: agr.insuranceName }, 38)}
                            <div>
                              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>{agr.insuranceName}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{agr.agreementType}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.95rem 1.25rem' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              color: '#334155',
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '6px',
                              fontSize: '0.82rem'
                            }}
                          >
                            {agr.cuit}
                          </span>
                        </td>
                        <td style={{ padding: '0.95rem 1.25rem' }}>
                          <span
                            style={{
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              color: '#0369a1',
                              background: '#f0f9ff',
                              border: '1px solid #bae6fd',
                              padding: '0.25rem 0.65rem',
                              borderRadius: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem'
                            }}
                          >
                            <KeyRound size={12} color="#0284c7" />
                            {agr.onlineValidation}
                          </span>
                        </td>
                        <td style={{ padding: '0.95rem 1.25rem' }}>
                          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>{agr.paymentTermDays}</span>{' '}
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>días</span>
                        </td>
                        <td style={{ padding: '0.95rem 1.25rem', textAlign: 'right' }}>
                          <span
                            style={{
                              background: statusColor.bg,
                              color: statusColor.color,
                              border: `1px solid ${statusColor.border}`,
                              borderRadius: '100px',
                              padding: '0.25rem 0.75rem',
                              fontWeight: 700,
                              fontSize: '0.76rem',
                              display: 'inline-block'
                            }}
                          >
                            ● {agr.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Autorizaciones Online Registradas */}
      {activeTab === 'authorizations' && (
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
                  <th style={{ padding: '0.9rem 1.25rem' }}>Paciente / DNI</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Obra Social</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Práctica Homologada</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Token Digital</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Fecha & Hora</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Copago</th>
                  <th style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>Estado</th>
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
                    <tr
                      key={auth.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; }}
                    >
                      <td style={{ padding: '0.95rem 1.25rem' }}>
                        <div style={{ fontWeight: 800, color: '#002182' }}>{auth.patientName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>DNI {auth.patientDni}</div>
                      </td>
                      <td style={{ padding: '0.95rem 1.25rem' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{auth.insuranceName}</span>
                      </td>
                      <td style={{ padding: '0.95rem 1.25rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#002182' }}>
                          {auth.nomenclatorCode} — {auth.description}
                        </div>
                      </td>
                      <td style={{ padding: '0.95rem 1.25rem' }}>
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
                          {auth.tokenProvided}
                        </span>
                      </td>
                      <td style={{ padding: '0.95rem 1.25rem', fontSize: '0.82rem', color: '#64748b' }}>
                        {auth.requestedAt || '2026-08-28 10:15'}
                      </td>
                      <td style={{ padding: '0.95rem 1.25rem' }}>
                        {auth.copayCharged > 0 ? (
                          <span style={{ fontWeight: 800, color: '#b45309' }}>
                            ${auth.copayCharged?.toLocaleString()}
                          </span>
                        ) : (
                          <span style={{ color: '#059669', fontWeight: 700 }}>$0 (Cubierto)</span>
                        )}
                      </td>
                      <td style={{ padding: '0.95rem 1.25rem', textAlign: 'right' }}>
                        <span
                          style={{
                            background:
                              auth.status === 'Aprobada Online'
                                ? '#f0fdf4'
                                : auth.status === 'Rechazada'
                                ? '#fef2f2'
                                : '#fffbeb',
                            color:
                              auth.status === 'Aprobada Online'
                                ? '#166534'
                                : auth.status === 'Rechazada'
                                ? '#991b1b'
                                : '#92400e',
                            border: `1px solid ${
                              auth.status === 'Aprobada Online'
                                ? '#bbf7d0'
                                : auth.status === 'Rechazada'
                                ? '#fecaca'
                                : '#fde68a'
                            }`,
                            padding: '0.25rem 0.65rem',
                            borderRadius: '100px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            display: 'inline-block'
                          }}
                        >
                          ● {auth.status}
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
                  <th style={{ padding: '0.9rem 1.25rem' }}>Código</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Práctica Médica</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Categoría</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Especialidad</th>
                  <th style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>Arancel Base</th>
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
                    <tr
                      key={item.code}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; }}
                    >
                      <td style={{ padding: '0.95rem 1.25rem' }}>
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
                      <td style={{ padding: '0.95rem 1.25rem' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                      </td>
                      <td style={{ padding: '0.95rem 1.25rem' }}>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            background: '#f1f5f9',
                            color: '#475569',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            display: 'inline-block'
                          }}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td style={{ padding: '0.95rem 1.25rem' }}>
                        <span style={{ fontSize: '0.82rem', color: '#475569' }}>
                          {item.specialty || 'General / Traumatología'}
                        </span>
                      </td>
                      <td style={{ padding: '0.95rem 1.25rem', textAlign: 'right' }}>
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
