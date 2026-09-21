import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  UserCheck,
  CalendarPlus,
  Award,
  Clock,
  MapPin,
  ChevronDown,
  Search,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Stethoscope,
  ShieldCheck
} from 'lucide-react';

export const DoctorsPage = () => {
  const { doctors, setCurrentView, setBookingPreselectedDoctor, setBookingPreselectedSpecialty } = useClinic();
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const activeDoctors = doctors.filter((d) => d.active !== false);

  const filterTabs = [
    { id: 'all', label: `Todos (${activeDoctors.length})` },
    { id: 'trauma', label: 'Traumatología' },
    { id: 'kinesio', label: 'Kinesiología' },
    { id: 'medicas', label: 'Médicas' },
    { id: 'diagnostico', label: 'Diagnóstico & Terapias' }
  ];

  const filteredDoctors = activeDoctors.filter((d) => {
    const spec = (d.specialty || d.specialtyName || '').toLowerCase();
    let matchesCategory = true;
    if (selectedSpecialty === 'trauma') matchesCategory = spec.includes('trauma');
    else if (selectedSpecialty === 'kinesio') matchesCategory = spec.includes('kinesio') || spec.includes('osteo') || spec.includes('pélvico') || spec.includes('atm');
    else if (selectedSpecialty === 'medicas') matchesCategory = spec.includes('neuro') || spec.includes('reuma') || spec.includes('pami') || spec.includes('ozono');
    else if (selectedSpecialty === 'diagnostico') matchesCategory = spec.includes('nutri') || spec.includes('pisada') || spec.includes('radio') || spec.includes('estética');

    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.fullName && d.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      spec.includes(searchTerm.toLowerCase()) ||
      (d.bio && d.bio.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleBook = (doc) => {
    if (doc.isUpcoming) {
      window.location.href = 'tel:03576450214';
      return;
    }
    setBookingPreselectedDoctor(doc.id);
    if (doc.specialtyId) {
      setBookingPreselectedSpecialty(doc.specialtyId);
    }
    setCurrentView('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      {/* Header Banner — Rediseño Premium con Glassmorphism y Métricas de Alto Impacto */}
      <section className="services-hero-banner">
        {/* Fondo interactivo con microretícula y halos de iluminación ambiental */}
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
            <span>CITRA · CUERPO MÉDICO Y PROFESIONALES</span>
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
            Cuerpo Médico &{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #60A5FA 0%, #38BDF8 50%, #A5F3FC 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Especialistas
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
            Médicos traumatólogos, especialistas clínicos, radiología y kinesiólogos altamente formados, comprometidos con tu salud y bienestar en Arroyito.
          </p>

          {/* Quick Metrics Bar — Tarjetas Glassmorphism con Íconos y Estilo Cohesivo */}
          <div className="services-metrics-grid">
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
                <div className="services-metric-value">{activeDoctors.length}+ Médicos</div>
                <div className="services-metric-label">Especialistas</div>
                <div className="services-metric-sub">Atención activa</div>
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
                <div className="services-metric-value">+25 Años</div>
                <div className="services-metric-label">Trayectoria</div>
                <div className="services-metric-sub">Liderazgo en salud</div>
              </div>
            </div>

            <div className="services-metric-card">
              <div
                className="services-metric-icon-wrap"
                style={{
                  background: 'radial-gradient(circle, rgba(168, 85, 247, 0.26) 0%, rgba(126, 34, 206, 0.1) 100%)',
                  borderColor: 'rgba(192, 132, 252, 0.3)'
                }}
              >
                <Clock size={20} color="#C084FC" />
              </div>
              <div className="services-metric-content">
                <div className="services-metric-value">8 Módulos</div>
                <div className="services-metric-label">Consultorios</div>
                <div className="services-metric-sub">Infraestructura propia</div>
              </div>
            </div>

            <div className="services-metric-card">
              <div
                className="services-metric-icon-wrap"
                style={{
                  background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(180, 83, 9, 0.1) 100%)',
                  borderColor: 'rgba(251, 191, 36, 0.3)'
                }}
              >
                <ShieldCheck size={20} color="#FBBF24" />
              </div>
              <div className="services-metric-content">
                <div className="services-metric-value">Integral</div>
                <div className="services-metric-label">Atención Médica</div>
                <div className="services-metric-sub">Equipo multidisciplinario</div>
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
            placeholder="Buscar por médico o especialidad (ej. Blanco, rodilla, kinesiología)..."
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
                onClick={() => { setSelectedSpecialty(tab.id); setExpandedId(null); }}
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

        {/* Header summary count */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', padding: '0 0.25rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#496386' }}>
            Mostrando {filteredDoctors.length} {filteredDoctors.length === 1 ? 'profesional' : 'profesionales'}
          </span>
          <button
            onClick={() => setExpandedId(expandedId ? null : (filteredDoctors[0]?.id || null))}
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

        {/* Doctors List — Tarjetas de Profesionales Rediseñadas (Mobile-First, Nombres Completos Sin Cortes) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredDoctors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#F5F8FE', borderRadius: '16px', border: '1.5px dashed #D2E3FC' }}>
              <Stethoscope size={36} color="#7994B8" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#002182', marginBottom: '0.25rem' }}>
                No encontramos profesionales para "{searchTerm}"
              </div>
              <div style={{ fontSize: '0.82rem', color: '#496386' }}>
                Probá buscando por nombre o seleccionando otra pestaña.
              </div>
            </div>
          ) : (
            filteredDoctors.map((doc) => {
              const isExpanded = expandedId === doc.id;

              // Resolución robusta de imagen médica con fallback de alta calidad
              const isFemale = doc.name?.toLowerCase().includes('valentina') || doc.name?.toLowerCase().includes('dra.') || doc.name?.toLowerCase().includes('lic.');
              const fallbackAvatar = isFemale
                ? 'https://images.unsplash.com/photo-1594824813584-3c817297e296?w=400&auto=format&fit=crop&q=80'
                : 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80';

              const avatarImg = (doc.avatar && typeof doc.avatar === 'string' && doc.avatar.startsWith('http'))
                ? doc.avatar
                : (doc.photo && typeof doc.photo === 'string' && doc.photo.startsWith('http') ? doc.photo : fallbackAvatar);

              const daysText = Array.isArray(doc.workingDays)
                ? doc.workingDays.slice(0, 3).join(', ')
                : (doc.workingDays || 'Días hábiles');

              return (
                <div
                  key={doc.id}
                  style={{
                    background: '#ffffff',
                    border: isExpanded ? '1.5px solid #076ABC' : '1.5px solid #E2EDFC',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: isExpanded
                      ? '0 8px 24px rgba(7, 106, 188, 0.12)'
                      : '0 2px 10px rgba(0, 33, 130, 0.03)'
                  }}
                >
                  {/* Fila colapsada — Espaciosa, nombre sin cortes, especialidad destacada */}
                  <div
                    onClick={() => toggleExpand(doc.id)}
                    style={{
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    {/* Avatar con borde y status online */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img
                        src={avatarImg}
                        alt={doc.name}
                        onError={(e) => {
                          e.currentTarget.src = fallbackAvatar;
                        }}
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: isExpanded ? '2px solid #076ABC' : '2px solid #D2E3FC',
                          boxShadow: '0 2px 8px rgba(0, 33, 130, 0.08)',
                          display: 'block'
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '-1px',
                          right: '-1px',
                          width: '13px',
                          height: '13px',
                          borderRadius: '50%',
                          background: '#10B981',
                          border: '2px solid #ffffff',
                          boxShadow: '0 0 4px rgba(16, 185, 129, 0.6)'
                        }}
                      />
                    </div>

                    {/* Información del profesional: Nombre completo arriba (sin cortes), especialidad y consultorio abajo */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.98rem',
                          fontWeight: 900,
                          color: '#002182',
                          lineHeight: 1.25,
                          marginBottom: '0.25rem',
                          wordBreak: 'break-word'
                        }}
                      >
                        {doc.name}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          flexWrap: 'wrap'
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            background: isExpanded ? '#076ABC' : '#EBF3FD',
                            color: isExpanded ? '#ffffff' : '#076ABC',
                            padding: '0.12rem 0.55rem',
                            borderRadius: '6px',
                            border: isExpanded ? '1px solid #076ABC' : '1px solid #D2E3FC',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {doc.specialty || doc.specialtyName}
                        </span>

                        <span
                          style={{
                            fontSize: '0.74rem',
                            color: '#496386',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {doc.roomName ? `${doc.roomName.split('—')[0].trim()} · ` : ''}{daysText}
                        </span>
                      </div>
                    </div>

                    {/* Botón circular con flecha de acordeón */}
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: isExpanded ? '#EBF3FD' : '#F5F8FE',
                        border: '1.5px solid #D2E3FC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#076ABC',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                        flexShrink: 0
                      }}
                    >
                      <ChevronDown size={16} />
                    </div>
                  </div>

                  {/* Cuerpo expandido con detalles completos del profesional */}
                  {isExpanded && (
                    <div
                      style={{
                        padding: '0.25rem 1rem 1.1rem',
                        borderTop: '1px solid #EDF3FD',
                        background: '#ffffff'
                      }}
                    >
                      {/* Especialidad completa y matrícula */}
                      <div style={{ marginTop: '0.75rem', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.45rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Stethoscope size={15} color="#076ABC" />
                          <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#076ABC' }}>
                            {doc.specialtyName || doc.specialty}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#496386', background: '#F5F8FE', border: '1px solid #D2E3FC', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                          {doc.license || 'MP Oficial CMPC'}
                        </span>
                      </div>

                      {/* Bio profesional */}
                      <p style={{ fontSize: '0.85rem', color: '#496386', lineHeight: 1.5, margin: '0 0 0.85rem' }}>
                        {doc.bio || 'Atención personalizada, diagnóstico de precisión y seguimiento clínico adaptado a cada paciente.'}
                      </p>

                      {/* Info de días, consultorio y experiencia */}
                      <div
                        style={{
                          background: '#F8FAFE',
                          borderRadius: '12px',
                          padding: '0.75rem 0.85rem',
                          border: '1px solid #E2EDFC',
                          marginBottom: '0.95rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.45rem'
                        }}
                      >
                        <div style={{ fontSize: '0.78rem', color: '#002182', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <Clock size={15} color="#076ABC" />
                          <span>Atención: {Array.isArray(doc.workingDays) ? doc.workingDays.join(', ') : doc.workingDays} ({doc.scheduleStart} a {doc.scheduleEnd} hs)</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#002182', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <MapPin size={15} color="#076ABC" />
                          <span>{doc.roomName || 'Consultorios CITRA Arroyito'}</span>
                        </div>
                        {doc.experience && (
                          <div style={{ fontSize: '0.76rem', color: '#076ABC', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <Award size={15} color="#076ABC" />
                            <span>{doc.experience}</span>
                          </div>
                        )}
                      </div>

                      {/* Botón de acción directo a Turnos */}
                      {doc.isUpcoming ? (
                        <button
                          onClick={() => handleBook(doc)}
                          style={{
                            width: '100%',
                            background: '#001556',
                            color: '#ffffff',
                            border: 'none',
                            padding: '0.85rem 1rem',
                            borderRadius: '12px',
                            fontWeight: 800,
                            fontSize: '0.92rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            minHeight: '46px',
                            boxShadow: '0 4px 14px rgba(0, 21, 86, 0.25)'
                          }}
                        >
                          <PhoneCall size={17} />
                          Consultar Disponibilidad
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBook(doc)}
                          style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                            color: '#ffffff',
                            border: 'none',
                            padding: '0.85rem 1rem',
                            borderRadius: '12px',
                            fontWeight: 800,
                            fontSize: '0.92rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            boxShadow: '0 6px 18px rgba(7, 106, 188, 0.3)',
                            minHeight: '46px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <CalendarPlus size={18} />
                          Sacar Turno con {doc.name}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Compromiso Médico CITRA al pie de página */}
        <div className="trust-commitment-card" style={{ marginTop: '2.5rem' }}>
          <div className="trust-commitment-badge">
            <ShieldCheck size={15} color="#076ABC" />
            <span>Compromiso Médico CITRA</span>
          </div>

          <div className="trust-grid">
            <div className="trust-item">
              <div
                className="trust-icon-box"
                style={{
                  background: '#EBF3FD',
                  color: '#076ABC',
                  border: '1px solid #D2E3FC'
                }}
              >
                <Stethoscope size={18} />
              </div>
              <div className="trust-content">
                <div className="trust-title">Atención Personalizada</div>
                <div className="trust-desc">Plan y seguimiento a tu medida</div>
              </div>
            </div>

            <div className="trust-item">
              <div
                className="trust-icon-box"
                style={{
                  background: '#ECFDF5',
                  color: '#059669',
                  border: '1px solid #A7F3D0'
                }}
              >
                <Award size={18} />
              </div>
              <div className="trust-content">
                <div className="trust-title">Equipo Certificado</div>
                <div className="trust-desc">Especialistas con matrícula provincial</div>
              </div>
            </div>

            <div className="trust-item">
              <div
                className="trust-icon-box"
                style={{
                  background: '#F5F3FF',
                  color: '#7C3AED',
                  border: '1px solid #DDD6FE'
                }}
              >
                <Clock size={18} />
              </div>
              <div className="trust-content">
                <div className="trust-title">Puntualidad y Confort</div>
                <div className="trust-desc">8 consultorios y turnos online</div>
              </div>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
};
