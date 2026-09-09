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
      {/* Header Banner — Compacto y Mobile-First */}
      <section
        style={{
          background: 'linear-gradient(135deg, #001556 0%, #002182 100%)',
          color: '#ffffff',
          padding: '2.5rem 1.25rem 1.75rem',
          position: 'relative'
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
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
            <UserCheck size={12} color="#8EBEF5" />
            PLANTEL PROFESIONAL CITRA
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
            Cuerpo Médico & Especialistas
          </h1>

          <p
            style={{
              fontSize: '0.92rem',
              color: '#D2E3FC',
              maxWidth: '620px',
              lineHeight: 1.45,
              margin: '0 0 1.25rem',
              opacity: 0.9
            }}
          >
            Médicos traumatólogos, especialistas clínicos y kinesiólogos comprometidos con tu recuperación en Arroyito.
          </p>

          {/* Quick Metrics Chips Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(210, 227, 252, 0.15)'
            }}
          >
            <div style={{ background: 'rgba(255, 255, 255, 0.07)', padding: '0.5rem 0.35rem', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#257CE6' }}>{activeDoctors.length}+</div>
              <div style={{ fontSize: '0.68rem', color: '#D2E3FC', fontWeight: 700 }}>Especialistas</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.07)', padding: '0.5rem 0.35rem', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#257CE6' }}>8</div>
              <div style={{ fontSize: '0.68rem', color: '#D2E3FC', fontWeight: 700 }}>Consultorios</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.07)', padding: '0.5rem 0.35rem', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#257CE6' }}>+25</div>
              <div style={{ fontSize: '0.68rem', color: '#D2E3FC', fontWeight: 700 }}>Años Exp.</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.07)', padding: '0.5rem 0.35rem', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#257CE6' }}>Integral</div>
              <div style={{ fontSize: '0.68rem', color: '#D2E3FC', fontWeight: 700 }}>Atención</div>
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

        {/* Doctors List — ACORDEONES COMPACTOS PARA MÓVILES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
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
              const avatarImg = doc.avatar || doc.photo || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200';
              const daysText = Array.isArray(doc.workingDays) ? doc.workingDays.slice(0, 3).join(', ') : doc.workingDays;

              return (
                <div
                  key={doc.id}
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
                    onClick={() => toggleExpand(doc.id)}
                    style={{
                      padding: '0.75rem 0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    {/* Avatar compacto redondo */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img
                        src={avatarImg}
                        alt={doc.name}
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: isExpanded ? '2px solid #076ABC' : '1.5px solid #D2E3FC',
                          display: 'block'
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '0',
                          right: '0',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: '#10B981',
                          border: '2px solid #ffffff'
                        }}
                      />
                    </div>

                    {/* Nombre y Especialidad */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.12rem' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#002182', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {doc.name}
                        </span>
                        <span
                          style={{
                            fontSize: '0.66rem',
                            fontWeight: 800,
                            background: isExpanded ? '#076ABC' : '#EBF3FD',
                            color: isExpanded ? '#ffffff' : '#002182',
                            padding: '0.12rem 0.45rem',
                            borderRadius: '100px',
                            whiteSpace: 'nowrap',
                            flexShrink: 0
                          }}
                        >
                          {doc.specialty || doc.specialtyName}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#496386', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.roomName ? `${doc.roomName} · ` : ''}{daysText}
                      </div>
                    </div>

                    {/* Flecha de acordeón */}
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

                  {/* Cuerpo expandido con detalles del profesional */}
                  {isExpanded && (
                    <div
                      style={{
                        padding: '0 0.95rem 0.95rem',
                        borderTop: '1px solid #EDF3FD',
                        background: '#ffffff'
                      }}
                    >
                      {/* Especialidad completa y matrícula */}
                      <div style={{ marginTop: '0.75rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.35rem' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#076ABC' }}>
                          {doc.specialtyName || doc.specialty}
                        </span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7994B8', background: '#F5F8FE', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                          {doc.license || 'MP Oficial'}
                        </span>
                      </div>

                      {/* Bio breve */}
                      <p style={{ fontSize: '0.84rem', color: '#496386', lineHeight: 1.45, margin: '0 0 0.75rem' }}>
                        {doc.bio || 'Atención personalizada, diagnóstico de precisión y seguimiento integral del paciente.'}
                      </p>

                      {/* Días y consultorio en caja compacta */}
                      <div
                        style={{
                          background: '#F5F8FE',
                          borderRadius: '10px',
                          padding: '0.6rem 0.8rem',
                          border: '1px solid #D2E3FC',
                          marginBottom: '0.85rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.35rem'
                        }}
                      >
                        <div style={{ fontSize: '0.76rem', color: '#002182', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Clock size={14} color="#076ABC" />
                          <span>Atención: {Array.isArray(doc.workingDays) ? doc.workingDays.join(', ') : doc.workingDays} ({doc.scheduleStart} a {doc.scheduleEnd} hs)</span>
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#002182', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <MapPin size={14} color="#076ABC" />
                          <span>{doc.roomName || 'CITRA Sede Arroyito'}</span>
                        </div>
                        {doc.experience && (
                          <div style={{ fontSize: '0.74rem', color: '#076ABC', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Award size={14} color="#076ABC" />
                            <span>{doc.experience}</span>
                          </div>
                        )}
                      </div>

                      {/* Botón de acción */}
                      {doc.isUpcoming ? (
                        <button
                          onClick={() => handleBook(doc)}
                          style={{
                            width: '100%',
                            background: '#001556',
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
                            minHeight: '44px'
                          }}
                        >
                          <PhoneCall size={16} />
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

      </section>
    </div>
  );
};
