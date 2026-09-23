import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  X
} from 'lucide-react';

const INSURANCE_LOGOS = {
  'OSDE': '/logos/logo-osde.png',
  'Swiss Medical': '/logos/logo-swiss-medical.png',
  'Galeno': '/logos/logo-galeno.png',
  'Apross': '/logos/logo-apross.png',
  'PAMI': '/logos/logo-pami.png'
};

export const InsurancesPage = () => {
  const { healthInsurances } = useClinic();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
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
    { id: 'todos', label: 'Todas' },
    { id: 'prepagas', label: 'Prepagas' },
    { id: 'sociales', label: 'Obras Sociales' },
    { id: 'particular', label: 'Particular' }
  ];

  const filteredInsurances = healthInsurances.filter((hi) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q || hi.name.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (selectedCategory === 'todos') return true;
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

  const toggleFaq = (index) => {
    setExpandedFaq((prev) => (prev === index ? null : index));
  };

  const faqs = [
    {
      q: '¿Qué necesito presentar el día de mi turno?',
      a: 'Tu DNI original y tu credencial médica (física o digital desde la app oficial de tu cobertura).'
    },
    {
      q: '¿Cómo coordino sesiones de Kinesiología y Fisioterapia?',
      a: 'Escribinos a secretaría vía WhatsApp con tu orden médica para verificar tu cobertura y coordinar tus días de atención.'
    },
    {
      q: '¿Puedo atenderme de manera particular?',
      a: 'Sí, podés atenderte de forma particular en todas nuestras especialidades médicas y de rehabilitación.'
    }
  ];

  return (
    <div style={{ background: '#F8FAFD', minHeight: '100vh' }}>
      {/* Header Banner */}
      <section className="services-hero-banner">
        <div aria-hidden="true" className="services-hero-grid-bg" />
        <div aria-hidden="true" className="services-hero-glow-cyan" />
        <div aria-hidden="true" className="services-hero-glow-blue" />

        <div style={{ maxWidth: '1020px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
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
            Convenios directos y atención médica sin vueltas en Arroyito.
          </p>
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
              placeholder="Buscar obra social o prepaga..."
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
                  onClick={() => setSelectedCategory(tab.id)}
                  style={{
                    background: isSelected ? 'linear-gradient(135deg, #076ABC 0%, #002182 100%)' : '#ffffff',
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', padding: '0 0.25rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#496386' }}>
            Mostrando {filteredInsurances.length} {filteredInsurances.length === 1 ? 'convenio' : 'convenios'}
          </span>
        </div>

        {/* Insurances List — Tarjetas Limpias, Resumidas y Sin Datos Falsos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '2.5rem' }}>
          {filteredInsurances.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#ffffff', borderRadius: '18px', border: '1.5px dashed #D2E3FC' }}>
              <ShieldCheck size={40} color="#7994B8" style={{ margin: '0 auto 0.85rem' }} />
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#002182', marginBottom: '0.3rem' }}>
                No encontramos convenios para "{searchTerm}"
              </div>
              <div style={{ fontSize: '0.84rem', color: '#496386', maxWidth: '420px', margin: '0 auto' }}>
                Probá buscando por otro nombre o consultá directamente a secretaría por WhatsApp.
              </div>
            </div>
          ) : (
            filteredInsurances.map((hi) => {
              const logoSrc = getResolvedLogo(hi);
              const category = getCategoryLabel(hi.name);

              return (
                <div
                  key={hi.id}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #E2EDFC',
                    borderRadius: '16px',
                    padding: '1.25rem 1.35rem',
                    boxShadow: '0 2px 10px rgba(0, 33, 130, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                  }}
                >
                  {/* Fila superior: Logo + Nombre + Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '12px',
                        background: '#ffffff',
                        border: '1.5px solid #D2E3FC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '5px',
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(0, 33, 130, 0.04)',
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
                          fontSize: '0.95rem',
                          fontWeight: 900,
                          color: hi.logoColor || '#076ABC'
                        }}
                      >
                        {hi.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#002182' }}>
                          {hi.name}
                        </h3>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            background: '#EBF3FD',
                            color: '#076ABC',
                            padding: '0.15rem 0.55rem',
                            borderRadius: '100px',
                            border: '1px solid #D2E3FC'
                          }}
                        >
                          {category}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle2 size={13} color="#16a34a" />
                        <span>Convenio activo en CITRA</span>
                      </div>
                    </div>
                  </div>

                  {/* Descripción simple de 1 renglón */}
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#496386', lineHeight: 1.45 }}>
                    Consultá con secretaría los alcances de cobertura y aranceles según tu plan para coordinar tu atención.
                  </p>

                  {/* Botón único directo a WhatsApp */}
                  <a
                    href={`https://wa.me/543576450214?text=${encodeURIComponent(`Hola CITRA, quisiera consultar por la cobertura de ${hi.name}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.8rem 1.1rem',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      boxShadow: '0 4px 14px rgba(37, 211, 102, 0.28)',
                      minHeight: '44px',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 18px rgba(37, 211, 102, 0.38)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(37, 211, 102, 0.28)';
                    }}
                  >
                    <WhatsAppIcon size={17} color="#ffffff" />
                    <span>Consultar Cobertura de {hi.name}</span>
                  </a>
                </div>
              );
            })
          )}
        </div>

        {/* Preguntas Frecuentes (FAQs) */}
        <div style={{ marginBottom: '2rem' }}>
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
                    background: '#ffffff',
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
