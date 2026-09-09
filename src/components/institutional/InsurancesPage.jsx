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
  FileCheck,
  CreditCard,
  Building2
} from 'lucide-react';

export const InsurancesPage = () => {
  const { healthInsurances, setCurrentView } = useClinic();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const filterTabs = [
    { id: 'all', label: 'Todas las Coberturas' },
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
      q: '¿Qué necesito presentar el día del turno?',
      a: 'Tu DNI original y tu credencial médica (física o desde la app oficial en el celular). Si tu obra social requiere Token de seguridad, tenelo listo al registrarte en recepción.'
    },
    {
      q: '¿Cómo se autoriza Kinesiología y Fisioterapia?',
      a: 'Nuestro equipo administrativo transmite los pedidos médicos electrónicamente a OSDE, Swiss Medical, Apross, PAMI y demás entidades para que no tengas que hacer trámites externos.'
    },
    {
      q: '¿Se atienden consultas y tratamientos de forma particular?',
      a: 'Sí. Contamos con aranceles institucionales accesibles tanto para consultas médicas como para sesiones kinésicas y radiología. Emitimos factura oficial para reintegro.'
    }
  ];

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      {/* Header Banner — Compacto y Mobile-First */}
      <section
        style={{
          background: 'linear-gradient(135deg, #001556 0%, #002182 100%)',
          color: '#ffffff',
          padding: '2.5rem 1.25rem 1.75rem',
          position: 'relative'
        }}
      >
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(37, 124, 230, 0.18)',
              border: '1px solid rgba(142, 190, 245, 0.35)',
              color: '#D2E3FC',
              padding: '0.3rem 0.8rem',
              borderRadius: '100px',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              marginBottom: '0.65rem'
            }}
          >
            <ShieldCheck size={12} color="#8EBEF5" />
            CONVENIOS SANITARIOS & OBRAS SOCIALES
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.6rem)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              margin: '0 0 0.45rem',
              lineHeight: 1.15
            }}
          >
            Obras Sociales & Prepagas
          </h1>

          <p
            style={{
              fontSize: '0.92rem',
              color: '#D2E3FC',
              maxWidth: '600px',
              lineHeight: 1.45,
              margin: '0 0 1.25rem',
              opacity: 0.92
            }}
          >
            Convenios directos para consultas médicas, kinesiología, radiología y tratamientos en Arroyito.
          </p>

          {/* Quick Logos Chips Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingTop: '0.85rem',
              borderTop: '1px solid rgba(210, 227, 252, 0.15)',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {['OSDE', 'Swiss Medical', 'Galeno', 'Apross', 'PAMI'].map((name, i) => (
              <span
                key={i}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  border: '1px solid rgba(255, 255, 255, 0.15)'
                }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section style={{ maxWidth: '850px', margin: '0 auto', padding: '1.75rem 1.25rem 3.5rem' }}>
        
        {/* Search Bar */}
        <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
          <Search size={17} color="#076ABC" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Buscar por obra social, prepaga o plan (ej. OSDE, 210, Apross)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: '#F5F8FE',
              border: '1.5px solid #D2E3FC',
              borderRadius: '12px',
              padding: '0.7rem 1rem 0.7rem 2.6rem',
              fontSize: '0.88rem',
              color: '#002182',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => (e.target.style.borderColor = '#076ABC')}
            onBlur={(e) => (e.target.style.borderColor = '#D2E3FC')}
          />
        </div>

        {/* Category Filters Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.75rem',
            marginBottom: '1.5rem',
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
                  background: isSelected ? '#076ABC' : '#F5F8FE',
                  color: isSelected ? '#ffffff' : '#002182',
                  border: isSelected ? '1.5px solid #076ABC' : '1.5px solid #D2E3FC',
                  padding: '0.5rem 1rem',
                  borderRadius: '100px',
                  fontSize: '0.84rem',
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

        {/* Header Summary */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', padding: '0 0.25rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#496386' }}>
            Mostrando {filteredInsurances.length} {filteredInsurances.length === 1 ? 'convenio' : 'convenios'}
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

        {/* Insurances List — ACORDEONES COMPACTOS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '2.5rem' }}>
          {filteredInsurances.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#F5F8FE', borderRadius: '16px', border: '1.5px dashed #D2E3FC' }}>
              <ShieldCheck size={36} color="#7994B8" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#002182', marginBottom: '0.25rem' }}>
                No encontramos coberturas para "{searchTerm}"
              </div>
              <div style={{ fontSize: '0.82rem', color: '#496386' }}>
                Probá buscando por otro nombre o comunicate con nuestra mesa de entrada.
              </div>
            </div>
          ) : (
            filteredInsurances.map((hi) => {
              const isExpanded = expandedId === hi.id;

              return (
                <div
                  key={hi.id}
                  style={{
                    background: isExpanded ? '#ffffff' : '#F5F8FE',
                    border: isExpanded ? '1.5px solid #076ABC' : '1.5px solid #D2E3FC',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    boxShadow: isExpanded ? '0 6px 20px rgba(7, 106, 188, 0.1)' : '0 1px 3px rgba(0, 33, 130, 0.02)'
                  }}
                >
                  {/* Fila colapsada (~68px de alto) */}
                  <div
                    onClick={() => toggleExpand(hi.id)}
                    style={{
                      padding: '0.75rem 0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    {/* Logo en caja blanca de 42px */}
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: '#ffffff',
                        border: '1px solid #D2E3FC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '3px',
                        flexShrink: 0,
                        boxShadow: '0 1px 4px rgba(0, 33, 130, 0.05)'
                      }}
                    >
                      {hi.logo ? (
                        <img
                          src={hi.logo}
                          alt={hi.name}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <span style={{ fontSize: '0.9rem', fontWeight: 900, color: hi.logoColor || '#076ABC' }}>
                          {hi.name.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Nombre y datos */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.12rem' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#002182', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {hi.name}
                        </span>
                        <span
                          style={{
                            fontSize: '0.66rem',
                            fontWeight: 800,
                            background: hi.copay === 0 ? 'rgba(22, 163, 74, 0.12)' : '#EBF3FD',
                            color: hi.copay === 0 ? '#15803d' : '#002182',
                            padding: '0.12rem 0.45rem',
                            borderRadius: '100px',
                            whiteSpace: 'nowrap',
                            flexShrink: 0
                          }}
                        >
                          {hi.copay === 0 ? 'Sin Copago' : `Copago $${hi.copay?.toLocaleString('es-AR')}`}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#496386', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {hi.plans ? `Planes: ${hi.plans.join(', ')}` : 'Convenio activo y validación directa'}
                      </div>
                    </div>

                    {/* Flecha indicadora */}
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
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
                      <ChevronDown size={15} />
                    </div>
                  </div>

                  {/* Cuerpo expandido */}
                  {isExpanded && (
                    <div
                      style={{
                        padding: '0 0.95rem 0.95rem',
                        borderTop: '1px solid #EDF3FD',
                        background: '#ffffff'
                      }}
                    >
                      {/* Planes detallados */}
                      {hi.plans && (
                        <div style={{ marginTop: '0.75rem', marginBottom: '0.65rem' }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#7994B8', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                            Planes Habilitados en CITRA:
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {hi.plans.map((p, pIdx) => (
                              <span
                                key={pIdx}
                                style={{
                                  fontSize: '0.74rem',
                                  fontWeight: 800,
                                  background: '#F5F8FE',
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

                      {/* Nota de validación */}
                      <div
                        style={{
                          background: '#F5F8FE',
                          borderRadius: '10px',
                          padding: '0.55rem 0.75rem',
                          border: '1px solid #D2E3FC',
                          marginBottom: '0.85rem',
                          fontSize: '0.76rem',
                          color: '#496386',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}
                      >
                        <CheckCircle2 size={14} color="#076ABC" style={{ flexShrink: 0 }} />
                        <span>Presentá tu DNI y credencial médica (o app digital con Token) en recepción.</span>
                      </div>

                      {/* Botón de turno */}
                      <button
                        onClick={handleBook}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.75rem 1rem',
                          borderRadius: '10px',
                          fontWeight: 800,
                          fontSize: '0.88rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(7, 106, 188, 0.25)',
                          minHeight: '44px'
                        }}
                      >
                        <CalendarPlus size={16} />
                        Sacar Turno con {hi.name}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* FAQs en Acordeones Compactos */}
        <div style={{ marginTop: '2rem' }}>
          <div style={{ fontSize: '0.86rem', fontWeight: 900, color: '#002182', marginBottom: '0.75rem', paddingLeft: '0.25rem' }}>
            Preguntas Frecuentes sobre Coberturas
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {faqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  style={{
                    background: '#F5F8FE',
                    border: '1px solid #D2E3FC',
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      padding: '0.75rem 0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.82rem',
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
                      <ChevronDown size={15} />
                    </div>
                  </button>

                  {isOpen && (
                    <div style={{ padding: '0 0.9rem 0.8rem', fontSize: '0.78rem', color: '#496386', lineHeight: 1.45, borderTop: '1px solid #EDF3FD' }}>
                      <p style={{ margin: '0.5rem 0 0' }}>{faq.a}</p>
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
