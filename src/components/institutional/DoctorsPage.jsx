import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Search,
  Clock,
  Stethoscope,
  Sparkles,
  Award
} from 'lucide-react';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

export const DoctorsPage = () => {
  const { doctors } = useClinic();
  const [selectedSpecialty, setSelectedSpecialty] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const activeDoctors = doctors.filter((d) => d.active !== false);

  const filterTabs = [
    { id: 'todos', label: 'Todos' },
    { id: 'trauma', label: 'Traumatología' },
    { id: 'kinesio', label: 'Kinesiología' },
    { id: 'medicas', label: 'Especialidades Médicas' },
    { id: 'diagnostico', label: 'Diagnóstico & Terapias' }
  ];

  const filteredDoctors = activeDoctors.filter((d) => {
    const spec = (d.specialty || d.specialtyName || '').toLowerCase();
    let matchesCategory = true;
    if (selectedSpecialty === 'todos') {
      matchesCategory = true;
    } else if (selectedSpecialty === 'trauma') {
      matchesCategory = spec.includes('trauma');
    } else if (selectedSpecialty === 'kinesio') {
      matchesCategory = spec.includes('kinesio') || spec.includes('osteo') || spec.includes('pélvico') || spec.includes('atm');
    } else if (selectedSpecialty === 'medicas') {
      matchesCategory = spec.includes('neuro') || spec.includes('reuma') || spec.includes('pami') || spec.includes('ozono') || spec.includes('médic');
    } else if (selectedSpecialty === 'diagnostico') {
      matchesCategory = spec.includes('nutri') || spec.includes('pisada') || spec.includes('radio') || spec.includes('yoga') || spec.includes('estética');
    }

    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      d.name.toLowerCase().includes(q) ||
      (d.fullName && d.fullName.toLowerCase().includes(q)) ||
      spec.includes(q) ||
      (d.scheduleDisplay && d.scheduleDisplay.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  const handleBook = (doc) => {
    const text = `Hola CITRA, quisiera solicitar un turno con ${doc.name} (${doc.specialty || 'Especialista'}).`;
    window.open(`https://wa.me/543576450214?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ background: '#F8FAFD', minHeight: '100vh' }}>
      {/* Header Banner — CITRA +5 Años */}
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
            <Sparkles size={13} color="#00F0FF" />
            <span>PROFESIONALES CITRA</span>
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
            Cuerpo{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #60A5FA 0%, #38BDF8 50%, #A5F3FC 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Médico
            </span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(0.88rem, 2.2vw, 0.96rem)',
              color: '#BFDBFE',
              maxWidth: '680px',
              lineHeight: 1.5,
              margin: '0 0 1.5rem',
              fontWeight: 500,
              opacity: 0.95
            }}
          >
            Especialistas comprometidos con tu salud y bienestar en Arroyito.
          </p>

          {/* Quick Metrics Bar — +5 Años */}
          <div
            className="services-metrics-grid"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              maxWidth: '640px'
            }}
          >
            <div className="services-metric-card">
              <div
                className="services-metric-icon-wrap"
                style={{
                  background: 'radial-gradient(circle, rgba(37, 124, 230, 0.28) 0%, rgba(7, 106, 188, 0.12) 100%)',
                  borderColor: 'rgba(96, 165, 250, 0.3)'
                }}
              >
                <Stethoscope size={20} color="#60A5FA" />
              </div>
              <div className="services-metric-content">
                <div className="services-metric-value">{activeDoctors.length} Profesionales</div>
                <div className="services-metric-label">Equipo Activo</div>
                <div className="services-metric-sub">Atención en CITRA</div>
              </div>
            </div>

            <div className="services-metric-card">
              <div
                className="services-metric-icon-wrap"
                style={{
                  background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.1) 100%)',
                  borderColor: 'rgba(52, 211, 153, 0.3)'
                }}
              >
                <Award size={20} color="#34D399" />
              </div>
              <div className="services-metric-content">
                <div className="services-metric-value">+5 Años</div>
                <div className="services-metric-label">Trayectoria</div>
                <div className="services-metric-sub">Construyendo salud</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '1.75rem 1.25rem 3.5rem' }}>
        
        {/* Search Bar */}
        <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
          <Search size={17} color="#076ABC" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Buscar por profesional o área..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: '#ffffff',
              border: '1.5px solid #D2E3FC',
              borderRadius: '12px',
              padding: '0.75rem 1rem 0.75rem 2.6rem',
              fontSize: '0.88rem',
              color: '#002182',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(0, 33, 130, 0.03)'
            }}
            onFocus={(e) => (e.target.style.borderColor = '#076ABC')}
            onBlur={(e) => (e.target.style.borderColor = '#D2E3FC')}
          />
        </div>

        {/* Category Filter Pills */}
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
            const isSelected = selectedSpecialty === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedSpecialty(tab.id)}
                style={{
                  background: isSelected ? '#076ABC' : '#ffffff',
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

        {/* Header summary count */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', padding: '0 0.25rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#496386' }}>
            Mostrando {filteredDoctors.length} {filteredDoctors.length === 1 ? 'profesional' : 'profesionales'}
          </span>
        </div>

        {/* Doctors Cards — Sin Fotos, Sin Consultorio, Sin MP, Sin Años de Experiencia. SOLO Área, Nombre, Días y Horarios, y Botón Sacar Turno con [Nombre] */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredDoctors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#ffffff', borderRadius: '16px', border: '1.5px dashed #D2E3FC' }}>
              <Stethoscope size={36} color="#7994B8" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#002182', marginBottom: '0.25rem' }}>
                No encontramos profesionales para "{searchTerm}"
              </div>
              <div style={{ fontSize: '0.82rem', color: '#496386' }}>
                Probá buscando por otro término o seleccionando otra pestaña.
              </div>
            </div>
          ) : (
            filteredDoctors.map((doc) => {
              const scheduleText =
                doc.scheduleDisplay ||
                (Array.isArray(doc.workingDays) ? doc.workingDays.join(', ') : doc.workingDays) ||
                'Consultar días y horarios en secretaría';

              return (
                <div
                  key={doc.id}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #E2EDFC',
                    borderRadius: '16px',
                    padding: '1.25rem 1.35rem',
                    boxShadow: '0 2px 10px rgba(0, 33, 130, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.8rem',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                  }}
                >
                  {/* Área (Especialidad) */}
                  <div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        background: '#EBF3FD',
                        color: '#076ABC',
                        padding: '0.28rem 0.75rem',
                        borderRadius: '100px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        border: '1px solid #D2E3FC'
                      }}
                    >
                      <Stethoscope size={13} color="#076ABC" />
                      <span>{doc.specialty || doc.specialtyName}</span>
                    </span>
                  </div>

                  {/* Nombre */}
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '1.18rem',
                      fontWeight: 900,
                      color: '#002182',
                      letterSpacing: '-0.01em',
                      lineHeight: 1.25
                    }}
                  >
                    {doc.name}
                  </h3>

                  {/* Días y Horarios */}
                  <div
                    style={{
                      background: '#F8FAFE',
                      borderRadius: '12px',
                      padding: '0.75rem 0.95rem',
                      border: '1px solid #E2EDFC',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.55rem'
                    }}
                  >
                    <Clock size={16} color="#076ABC" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '0.84rem', color: '#002182', fontWeight: 700, lineHeight: 1.45 }}>
                      <span
                        style={{
                          color: '#496386',
                          fontWeight: 700,
                          display: 'block',
                          fontSize: '0.7rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          marginBottom: '2px'
                        }}
                      >
                        Días y Horarios
                      </span>
                      {scheduleText}
                    </div>
                  </div>

                  {/* Botón Sacar Turno con [Nombre] */}
                  <button
                    onClick={() => handleBook(doc)}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.85rem 1.15rem',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.55rem',
                      cursor: 'pointer',
                      boxShadow: '0 6px 18px rgba(37, 211, 102, 0.28)',
                      minHeight: '46px',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 211, 102, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 6px 18px rgba(37, 211, 102, 0.28)';
                    }}
                  >
                    <WhatsAppIcon size={18} color="#ffffff" />
                    <span>Sacar Turno con {doc.name}</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

      </section>
    </div>
  );
};
