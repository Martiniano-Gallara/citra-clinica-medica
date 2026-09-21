import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  CalendarPlus,
  ChevronDown,
  Sparkles,
  HelpCircle,
  Check,
  X,
  ExternalLink,
  Stethoscope,
  Activity,
  Zap
} from 'lucide-react';

const INSURANCE_LOGOS = {
  'OSDE': '/logos/logo-osde.png',
  'Swiss Medical': '/logos/logo-swiss-medical.png',
  'Galeno': '/logos/logo-galeno.png',
  'Apross': '/logos/logo-apross.png',
  'PAMI': '/logos/logo-pami.png'
};

export const InsurancesPage = () => {
  const { healthInsurances, setCurrentView } = useClinic();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('prepagas');
  const [expandedId, setExpandedId] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const getResolvedLogo = (hi) => {
    if (hi.logo && typeof hi.logo === 'string' && hi.logo.trim() !== '') return hi.logo;
    for (const [key, path] of Object.entries(INSURANCE_LOGOS)) {
      if (hi.name.toLowerCase().includes(key.toLowerCase())) return path;
    }
    return null;
  };

  const getCategoryLabel = (name) => {
    const n = name.toLowerCase();
    if (n.includes('particular')) return 'Particular';
    if (n.includes('apross') || n.includes('pami')) return 'Obra Social';
    return 'Prepaga Nacional';
  };

  const filterTabs = [
    { id: 'prepagas', label: 'Prepagas' },
    { id: 'sociales', label: 'Obras Sociales' },
    { id: 'particular', label: 'Particular' }
  ];

  const filteredInsurances = healthInsurances.filter((hi) => {
    const matchesSearch =
      hi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (hi.plans && hi.plans.some((p) => p.toLowerCase().includes(searchTerm.toLowerCase())));

    if (!matchesSearch) return false;

    if (selectedCategory === 'prepagas') {
      return ['OSDE', 'Swiss Medical', 'Galeno', 'Medicus'].some((n) => hi.name.includes(n));
    }
    if (selectedCategory === 'sociales') {
      return ['Apross', 'PAMI'].some((n) => hi.name.includes(n));
    }
    if (selectedCategory === 'particular') {
      return hi.name.toLowerCase().includes('particular');
    }
    return true;
  });

  const handleBook = () => {
    setCurrentView('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const toggleFaq = (index) => {
    setExpandedFaq((prev) => (prev === index ? null : index));
  };

  const faqs = [
    {
      q: '¿Qué necesito presentar el día de mi turno?',
      a: 'Tu DNI original y tu credencial médica (física o desde la app oficial en el celular). Si tu cobertura requiere Token o código de validación, tenelo listo al momento del ingreso en recepción.'
    },
    {
      q: '¿Cómo se autorizan las sesiones de Kinesiología y Fisioterapia?',
      a: 'En CITRA gestionamos la autorización de forma electrónica directa con las obras sociales y prepagas para que no tengas que desplazarte ni hacer trámites adicionales.'
    },
    {
      q: '¿Puedo atenderme en CITRA de manera particular?',
      a: 'Sí. Disponemos de aranceles institucionales preferenciales para consultas médicas, sesiones de rehabilitación motora y radiología digital. Emitimos factura oficial para reintegro.'
    }
  ];

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      {/* Header Banner — Rediseño Premium: Atmósfera Tech, Glassmorphism y Métricas */}
      <section className="services-hero-banner">
        {/* Fondo con microretícula y halos de iluminación ambiental */}
        <div aria-hidden="true" className="services-hero-grid-bg" />
        <div aria-hidden="true" className="services-hero-glow-cyan" />
        <div aria-hidden="true" className="services-hero-glow-blue" />

        <div style={{ maxWidth: '1020px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Badge institucional superior */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'rgba(37, 124, 230, 0.16)',
              border: '1px solid rgba(142, 190, 245, 0.32)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              color: '#E0F2FE',
              padding: '0.35rem 0.85rem',
              borderRadius: '100px',
              fontSize: '0.74rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
              marginBottom: '0.85rem',
              boxShadow: '0 2px 10px rgba(0, 19, 72, 0.25)'
            }}
          >
            <ShieldCheck size={13} color="#00F0FF" />
            <span>COBERTURAS CITRA</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.85rem, 4.5vw, 2.85rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              margin: '0 0 0.65rem',
              lineHeight: 1.15,
              color: '#ffffff'
            }}
          >
            Obras Sociales &{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #60A5FA 0%, #38BDF8 50%, #A5F3FC 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Prepagas
            </span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(0.88rem, 2.2vw, 0.96rem)',
              color: '#BFDBFE',
              maxWidth: '680px',
              lineHeight: 1.5,
              margin: '0 0 1.25rem',
              fontWeight: 500,
              opacity: 0.95
            }}
          >
            Convenios directos y atención médica sin trámites innecesarios en Arroyito.
          </p>

          {/* Quick Selectors Bar — Botones Glassmorphic de Marcas Populares */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              overflowX: 'auto',
              paddingTop: '0.85rem',
              borderTop: '1px solid rgba(210, 227, 252, 0.18)',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <span style={{ fontSize: '0.74rem', color: '#93C5FD', fontWeight: 700, whiteSpace: 'nowrap', marginRight: '0.2rem' }}>
              Populares:
            </span>
            {[
              { name: 'OSDE', color: '#00529b' },
              { name: 'Swiss Medical', color: '#e11d48' },
              { name: 'Galeno', color: '#2563eb' },
              { name: 'Apross', color: '#00A896' },
              { name: 'PAMI', color: '#002B49' },
              { name: 'Medicus', color: '#7c3aed' }
            ].map((brand, i) => {
              const isActive = searchTerm.toLowerCase() === brand.name.toLowerCase();
              return (
                <button
                  key={i}
                  onClick={() => setSearchTerm(isActive ? '' : brand.name)}
                  style={{
                    background: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
                    color: isActive ? '#002182' : '#ffffff',
                    border: isActive ? '1px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    padding: '0.32rem 0.75rem',
                    borderRadius: '100px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.15s ease',
                    boxShadow: isActive ? '0 3px 10px rgba(0, 0, 0, 0.25)' : 'none'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isActive ? brand.color : '#38BDF8' }} />
                  <span>{brand.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section style={{ maxWidth: '880px', margin: '0 auto', padding: '2rem 1.25rem 3.5rem' }}>
        
        {/* Search Bar & Category Filters */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', marginBottom: '0.85rem' }}>
            <Search size={18} color="#076ABC" style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Buscar cobertura..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                background: '#ffffff',
                border: '1.5px solid #D2E3FC',
                borderRadius: '14px',
                padding: '0.78rem 2.6rem 0.78rem 2.75rem',
                fontSize: '0.9rem',
                color: '#002182',
                fontWeight: 600,
                outline: 'none',
                boxSizing: 'border-box',
                boxShadow: '0 2px 8px rgba(0, 33, 130, 0.03)',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#076ABC';
                e.target.style.boxShadow = '0 4px 14px rgba(7, 106, 188, 0.12)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#D2E3FC';
                e.target.style.boxShadow = '0 2px 8px rgba(0, 33, 130, 0.03)';
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#EBF3FD',
                  border: 'none',
                  color: '#076ABC',
                  borderRadius: '50%',
                  width: '26px',
                  height: '26px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.35rem',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none'
            }}
          >
            {filterTabs.map((tab) => {
              const isSelected = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setSelectedCategory(tab.id); setExpandedId(null); }}
                  style={{
                    background: isSelected ? 'linear-gradient(135deg, #076ABC 0%, #002182 100%)' : '#F5F8FE',
                    color: isSelected ? '#ffffff' : '#002182',
                    border: isSelected ? '1.5px solid #076ABC' : '1.5px solid #D2E3FC',
                    padding: '0.45rem 0.95rem',
                    borderRadius: '100px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 3px 10px rgba(7, 106, 188, 0.25)' : 'none'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Header Summary */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem', padding: '0 0.25rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#496386' }}>
            Mostrando {filteredInsurances.length} {filteredInsurances.length === 1 ? 'convenio habilitado' : 'convenios habilitados'}
          </span>
          <button
            onClick={() => setExpandedId(expandedId ? null : (filteredInsurances[0]?.id || null))}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#076ABC',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: 'pointer',
              padding: 0
            }}
          >
            {expandedId ? 'Colapsar detalles' : 'Ver detalle'}
          </button>
        </div>

        {/* Insurances List — Acordeones Rediseñados con Logos Reales y Tarjetas Elevadas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
          {filteredInsurances.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#F8FAFD', borderRadius: '18px', border: '1.5px dashed #D2E3FC' }}>
              <ShieldCheck size={40} color="#7994B8" style={{ margin: '0 auto 0.85rem' }} />
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#002182', marginBottom: '0.3rem' }}>
                No encontramos convenios para "{searchTerm}"
              </div>
              <div style={{ fontSize: '0.84rem', color: '#496386', maxWidth: '420px', margin: '0 auto' }}>
                Probá buscando por otro nombre o contactá a nuestra mesa de entrada para verificar tu plan particular.
              </div>
            </div>
          ) : (
            filteredInsurances.map((hi) => {
              const isExpanded = expandedId === hi.id;
              const logoSrc = getResolvedLogo(hi);
              const category = getCategoryLabel(hi.name);

              return (
                <div
                  key={hi.id}
                  style={{
                    background: isExpanded ? '#ffffff' : '#F9FBFE',
                    border: isExpanded ? '1.5px solid #076ABC' : '1.5px solid #DCE7F7',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: isExpanded ? '0 8px 24px rgba(7, 106, 188, 0.12)' : '0 2px 6px rgba(0, 33, 130, 0.02)'
                  }}
                >
                  {/* Fila Principal */}
                  <div
                    onClick={() => toggleExpand(hi.id)}
                    style={{
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    {/* Contenedor de Logo Oficial en Caja Blanca */}
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: '#ffffff',
                        border: '1.5px solid #D2E3FC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px',
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(0, 33, 130, 0.05)',
                        overflow: 'hidden'
                      }}
                    >
                      {logoSrc ? (
                        <img
                          src={logoSrc}
                          alt={hi.name}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextSibling) {
                              e.currentTarget.nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <span
                        style={{
                          display: logoSrc ? 'none' : 'flex',
                          fontSize: '0.92rem',
                          fontWeight: 900,
                          color: hi.logoColor || '#076ABC'
                        }}
                      >
                        {hi.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>

                    {/* Información y Datos de Cobertura */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '0.98rem', fontWeight: 900, color: '#002182' }}>
                          {hi.name}
                        </span>
                        
                        <span
                          style={{
                            fontSize: '0.66rem',
                            fontWeight: 800,
                            background: '#EBF3FD',
                            color: '#076ABC',
                            padding: '0.12rem 0.45rem',
                            borderRadius: '6px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {category}
                        </span>

                        <span
                          style={{
                            fontSize: '0.66rem',
                            fontWeight: 800,
                            background: hi.copay === 0 ? 'rgba(22, 163, 74, 0.12)' : '#EFF6FF',
                            color: hi.copay === 0 ? '#15803d' : '#2563EB',
                            border: `1px solid ${hi.copay === 0 ? 'rgba(22, 163, 74, 0.25)' : '#BFDBFE'}`,
                            padding: '0.12rem 0.45rem',
                            borderRadius: '100px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {hi.copay === 0 ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <Check size={11} /> Sin Copago
                            </span>
                          ) : (
                            `Copago $${hi.copay?.toLocaleString('es-AR')}`
                          )}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.76rem', color: '#496386', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {hi.plans ? `Planes: ${hi.plans.join(', ')}` : 'Convenio activo con validación digital'}
                      </div>
                    </div>

                    {/* Botón Circular Flecha */}
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: isExpanded ? '#EBF3FD' : '#ffffff',
                        border: '1px solid #D2E3FC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#076ABC',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease',
                        flexShrink: 0
                      }}
                    >
                      <ChevronDown size={16} />
                    </div>
                  </div>

                  {/* Cuerpo Expandido con Prestaciones y CTA */}
                  {isExpanded && (
                    <div
                      style={{
                        padding: '0.75rem 1rem 1rem',
                        borderTop: '1px solid #EDF3FD',
                        background: '#ffffff'
                      }}
                    >
                      {/* Chips de Prestaciones Cubiertas */}
                      <div style={{ marginBottom: '0.85rem' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#7994B8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
                          Prestaciones Habilitadas en Sede:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.74rem', fontWeight: 700, background: '#EFF6FF', color: '#1E40AF', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid #DBEAFE', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <Stethoscope size={13} color="#1E40AF" /> Consultas Traumatología & Esp.
                          </span>
                          <span style={{ fontSize: '0.74rem', fontWeight: 700, background: '#ECFDF5', color: '#065F46', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid #A7F3D0', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <Activity size={13} color="#065F46" /> Kinesiología & Fisioterapia
                          </span>
                          <span style={{ fontSize: '0.74rem', fontWeight: 700, background: '#F5F3FF', color: '#5B21B6', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid #DDD6FE', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <Zap size={13} color="#5B21B6" /> Radiología Digital & Ecografía
                          </span>
                        </div>
                      </div>

                      {/* Planes Habilitados */}
                      {hi.plans && (
                        <div style={{ marginBottom: '0.85rem' }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#7994B8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                            Planes con Cobertura:
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {hi.plans.map((p, pIdx) => (
                              <span
                                key={pIdx}
                                style={{
                                  fontSize: '0.74rem',
                                  fontWeight: 800,
                                  background: '#F8FAFD',
                                  color: '#002182',
                                  border: '1px solid #D2E3FC',
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: '6px'
                                }}
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Nota de Admisión Rápida */}
                      <div
                        style={{
                          background: '#F8FAFD',
                          borderRadius: '10px',
                          padding: '0.65rem 0.85rem',
                          border: '1px solid #D2E3FC',
                          marginBottom: '0.95rem',
                          fontSize: '0.78rem',
                          color: '#496386',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <CheckCircle2 size={16} color="#076ABC" style={{ flexShrink: 0 }} />
                        <span>Presentá tu DNI y credencial médica (o app digital con Token) en la mesa de recepción.</span>
                      </div>

                      {/* Botón Directo para Sacar Turno */}
                      <button
                        onClick={handleBook}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, #257CE6 0%, #076ABC 100%)',
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.85rem 1.2rem',
                          borderRadius: '12px',
                          fontWeight: 800,
                          fontSize: '0.92rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          cursor: 'pointer',
                          boxShadow: '0 4px 14px rgba(7, 106, 188, 0.3)',
                          minHeight: '46px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <CalendarPlus size={18} />
                        Sacar Turno con {hi.name}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>



        {/* Preguntas Frecuentes (FAQs) */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 900, color: '#076ABC', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>
            PREGUNTAS FRECUENTES
          </div>
          <h2 style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.55rem)', fontWeight: 900, color: '#002182', margin: '0 0 1rem', letterSpacing: '-0.02em' }}>
            Dudas Habituales sobre Coberturas
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {faqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  style={{
                    background: '#F8FAFD',
                    border: '1.5px solid #E2EDFC',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      padding: '0.9rem 1.1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      color: '#002182'
                    }}
                  >
                    <span>{faq.q}</span>
                    <div
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        flexShrink: 0,
                        color: '#076ABC'
                      }}
                    >
                      <ChevronDown size={16} />
                    </div>
                  </button>

                  {isOpen && (
                    <div style={{ padding: '0 1.1rem 1rem', fontSize: '0.82rem', color: '#496386', lineHeight: 1.5, borderTop: '1px solid #EDF3FD' }}>
                      <p style={{ margin: '0.6rem 0 0' }}>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>



      </section>
    </div>
  );
};
