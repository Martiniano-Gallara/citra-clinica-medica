import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Bone,
  Brain,
  Activity,
  Apple,
  Dumbbell,
  Zap,
  Layers,
  Smile,
  Heart,
  ScanLine,
  Footprints,
  Sparkles,
  CheckCircle2,
  CalendarPlus,
  ChevronDown,
  Search,
  Stethoscope
} from 'lucide-react';

export const ServicesPage = () => {
  const { setCurrentView, setBookingPreselectedSpecialty } = useClinic();
  const [activeCategory, setActiveCategory] = useState('especialidades');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const handleBook = (specialtyId) => {
    if (setBookingPreselectedSpecialty) {
      setBookingPreselectedSpecialty(specialtyId);
    }
    setCurrentView('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const serviceCategories = [
    { id: 'especialidades', label: 'Especialidades' },
    { id: 'rehabilitacion', label: 'Rehabilitación' },
    { id: 'diagnostico', label: 'Diagnóstico' },
    { id: 'complementarios', label: 'Tratamientos' }
  ];

  const serviceCards = [
    // --- ESPECIALIDADES MÉDICAS ---
    {
      id: 'esp-1',
      category: 'especialidades',
      name: 'Traumatología',
      icon: Bone,
      badge: 'Médica',
      shortDesc: 'Huesos, fracturas y lesiones',
      description: 'Diagnóstico, tratamiento y seguimiento médico y quirúrgico de patologías óseas, articulares, fracturas, esguinces, artrosis y lesiones deportivas.',
      features: [
        'Traumatología general, articular y de columna',
        'Infiltraciones articulares y ecoguiadas',
        'Manejo agudo de fracturas, luxaciones y yesos',
        'Artroscopía y cirugías ortopédicas'
      ],
      equipment: 'Sala de yesos y quirófano ambulatorio'
    },
    {
      id: 'esp-2',
      category: 'especialidades',
      name: 'Neurología',
      icon: Brain,
      badge: 'Médica',
      shortDesc: 'Cefaleas, migrañas y nervios',
      description: 'Abordaje integral y diagnóstico de afecciones del sistema nervioso central y periférico, cefaleas crónicas, neuropatías y trastornos motores.',
      features: [
        'Evaluación clínica neurológica completa',
        'Manejo especializado de migrañas y cefaleas',
        'Tratamiento del dolor neuropático y radiculopatías',
        'Interconsulta directa con fisioterapia'
      ],
      equipment: 'Consultorio neurológico equipado'
    },
    {
      id: 'esp-3',
      category: 'especialidades',
      name: 'Reumatología',
      icon: Activity,
      badge: 'Médica',
      shortDesc: 'Artritis y dolor articular',
      description: 'Tratamiento especializado de patologías inflamatorias y autoinmunes que afectan articulaciones, tendones y músculos, preservando la movilidad.',
      features: [
        'Artritis reumatoidea, lúpica y espondiloartritis',
        'Artrosis severa y dolor articular crónico',
        'Fibromialgia y fatiga musculoesquelética',
        'Planes combinados con kinesiología'
      ],
      equipment: 'Consultorio de reumatología clínica'
    },
    {
      id: 'esp-4',
      category: 'especialidades',
      name: 'Nutrición',
      icon: Apple,
      badge: 'Médica',
      shortDesc: 'Planes a medida y nutrición',
      description: 'Planes alimentarios personalizados orientados a modular la inflamación sistémica, favorecer la recuperación de tejidos y optimizar el rendimiento físico.',
      features: [
        'Nutrición antiinflamatoria osteoarticular',
        'Composición corporal por bioimpedancia',
        'Nutrición deportiva y recuperación post-lesión',
        'Reeducación de hábitos metabólicos'
      ],
      equipment: 'Analizador de bioimpedancia'
    },

    // --- REHABILITACIÓN ---
    {
      id: 'esp-5',
      category: 'rehabilitacion',
      name: 'Kinesiología & Fisioterapia',
      icon: Dumbbell,
      badge: 'Rehabilitación',
      shortDesc: 'Rehabilitación motora y analgesia',
      description: 'Abordaje integral unificado: combinamos la rehabilitación motora activa en gimnasio terapéutico con fisioterapia analgésica e instrumental de avanzada para una recuperación óptima.',
      features: [
        'Rehabilitación pre y post-quirúrgica',
        'Magnetoterapia de alta potencia, ultrasonido y electroestimulación (TENS)',
        'Fortalecimiento muscular progresivo y reeducación biomecánica',
        'Supervisión personalizada por kinesiólogos y fisioterapeutas colegiados'
      ],
      equipment: 'Gimnasio terapéutico y módulos de fisioterapia'
    },
    {
      id: 'esp-rehab-func',
      category: 'rehabilitacion',
      name: 'Readaptación Funcional & RPG',
      icon: Activity,
      badge: 'Rehabilitación',
      shortDesc: 'Reeducación postural y reintegro activo',
      description: 'Programas de reeducación postural global, acondicionamiento neuromuscular y retorno progresivo y seguro a las actividades de la vida diaria y deportivas.',
      features: [
        'Reeducación Postural Global (RPG)',
        'Readaptación funcional post-alta kinésica',
        'Entrenamiento neuromuscular y propioceptivo',
        'Prevención de sobrecargas y recidivas de lesiones'
      ],
      equipment: 'Gimnasio de biomecánica y elementos funcionales'
    },
    {
      id: 'esp-7',
      category: 'rehabilitacion',
      name: 'Osteopatía',
      icon: Layers,
      badge: 'Rehabilitación',
      shortDesc: 'Terapia manual y desbloqueo',
      description: 'Terapia manual global orientada a restablecer el equilibrio biomecánico y la movilidad de todos los tejidos y estructuras corporales.',
      features: [
        'Técnicas manuales estructurales y viscerales',
        'Desbloqueo vertebral y articular',
        'Alivio de tensiones miofasciales crónicas',
        'Enfoque holístico e integrador del dolor'
      ],
      equipment: 'Camilla osteopática articulada'
    },
    {
      id: 'esp-8',
      category: 'rehabilitacion',
      name: 'ATM & Bruxismo',
      icon: Smile,
      badge: 'Rehabilitación',
      shortDesc: 'Bruxismo y dolor mandibular',
      description: 'Tratamiento kinésico específico de disfunciones temporomandibulares, bruxismo, dolor orofacial y contracturas cervicales asociadas.',
      features: [
        'Terapia manual intra y extraoral',
        'Descompresión de la articulación temporomandibular',
        'Reeducación de la dinámica masticatoria',
        'Interdisciplina con odontólogos'
      ],
      equipment: 'Gabinete especializado en ATM'
    },
    {
      id: 'esp-9',
      category: 'rehabilitacion',
      name: 'Piso Pélvico',
      icon: Heart,
      badge: 'Rehabilitación',
      shortDesc: 'Postparto e incontinencia',
      description: 'Fisioterapia uroginecológica y pelviperineal para la prevención y rehabilitación de disfunciones del suelo pélvico en mujeres.',
      features: [
        'Tratamiento de incontinencia urinaria',
        'Rehabilitación integral postparto y prolapsos',
        'Biofeedback perineal y ejercicios guiados',
        'Gimnasia abdominal hipopresiva (GAH)'
      ],
      equipment: 'Gabinete privado con biofeedback'
    },

    // --- DIAGNÓSTICO ---
    {
      id: 'esp-10',
      category: 'diagnostico',
      name: 'Radiología Digital',
      icon: ScanLine,
      badge: 'Diagnóstico',
      shortDesc: 'Rayos X y entrega inmediata',
      description: 'Radiología digital directa de alta definición con mínima dosis de exposición y revelado instantáneo para estudios osteoarticulares y de columna.',
      features: [
        'Radiografías digitales de todos los segmentos',
        'Estudios comparativos y dinámicos',
        'Entrega digital inmediata para tu médico',
        'Integración con Historia Clínica Electrónica'
      ],
      equipment: 'Equipo de Rayos X digital Siemens'
    },
    {
      id: 'esp-11',
      category: 'diagnostico',
      name: 'Estudio de la Pisada',
      icon: Footprints,
      badge: 'Diagnóstico',
      shortDesc: 'Baropodometría y plantillas',
      description: 'Baropodometría computarizada y análisis biomecánico estático y dinámico de presiones plantares durante la marcha y la carrera.',
      features: [
        'Análisis computarizado de marcha y apoyo',
        'Detección de pie plano, cavo y fascitis',
        'Diseño de plantillas ortopédicas a medida',
        'Evaluación deportiva y pediátrica'
      ],
      equipment: 'Plataforma baropodométrica computarizada'
    },

    // --- TRATAMIENTOS ---
    {
      id: 'esp-12',
      category: 'complementarios',
      name: 'Ozonoterapia',
      icon: Sparkles,
      badge: 'Tratamientos',
      shortDesc: 'Alivio del dolor y regeneración',
      description: 'Terapia biológica con ozono medicinal con potente efecto analgésico, antiinflamatorio, antioxidante y oxigenador tisular.',
      features: [
        'Infiltraciones articulares y paravertebrales',
        'Alivio significativo de artrosis y lumbalgias',
        'Regeneración biológica sin fármacos químicos',
        'Procedimiento ambulatorio rápido y seguro'
      ],
      equipment: 'Generador de ozono medicinal certificado'
    },
    {
      id: 'esp-13',
      category: 'complementarios',
      name: 'Medicina Estética',
      icon: Sparkles,
      badge: 'Tratamientos',
      shortDesc: 'Bioestimulación y colágeno',
      description: 'Procedimientos médicos no quirúrgicos orientados a la bioestimulación celular, revitalización dérmica, tonificación y bienestar integral.',
      features: [
        'Bioestimulación de colágeno y ácido hialurónico',
        'Tratamientos dérmicos regenerativos',
        'Asesoramiento médico personalizado',
        'Insumos aprobados por ANMAT'
      ],
      equipment: 'Gabinete médico en estricta asepsia'
    }
  ];

  const filteredCards = serviceCards.filter((c) => {
    const matchesCategory = c.category === activeCategory;
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.shortDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      {/* Header Banner — Rediseño Premium: Glassmorphism, atmósfera tech y métricas de alto impacto */}
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
            <span>SERVICIOS CITRA</span>
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
            Servicios{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #60A5FA 0%, #38BDF8 50%, #A5F3FC 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Médicos
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
            Atención especializada, diagnóstico por imágenes y rehabilitación en Arroyito.
          </p>

          {/* Quick Metrics Bar — 2 Tarjetas Glassmorphism */}
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
                <Layers size={20} color="#60A5FA" />
              </div>
              <div className="services-metric-content">
                <div className="services-metric-value">13 Áreas</div>
                <div className="services-metric-label">Especialidades</div>
                <div className="services-metric-sub">Atención integral</div>
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
                <ScanLine size={20} color="#C084FC" />
              </div>
              <div className="services-metric-content">
                <div className="services-metric-value">Digital</div>
                <div className="services-metric-label">Rayos X & Eco</div>
                <div className="services-metric-sub">Diagnóstico directo</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '1.75rem 1.25rem 3.5rem' }}>
        
        {/* Search Bar + Quick Helper */}
        <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
          <Search size={17} color="#076ABC" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Buscar servicio..."
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

        {/* Category Filters — Pills con scroll horizontal suave */}
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
          {serviceCategories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setExpandedId(null); }}
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
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Services Count Banner */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', padding: '0 0.25rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#496386' }}>
            Mostrando {filteredCards.length} {filteredCards.length === 1 ? 'servicio' : 'servicios'}
          </span>
          <button
            onClick={() => setExpandedId(expandedId ? null : (filteredCards[0]?.id || null))}
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

        {/* Services List — ACORDEONES COMPACTOS PARA MÓVILES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {filteredCards.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#F5F8FE', borderRadius: '16px', border: '1.5px dashed #D2E3FC' }}>
              <Stethoscope size={36} color="#7994B8" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#002182', marginBottom: '0.25rem' }}>
                No encontramos servicios para "{searchTerm}"
              </div>
              <div style={{ fontSize: '0.82rem', color: '#496386' }}>
                Probá con otra palabra o seleccioná otra categoría.
              </div>
            </div>
          ) : (
            filteredCards.map((service) => {
              const Icon = service.icon;
              const isExpanded = expandedId === service.id;

              return (
                <div
                  key={service.id}
                  style={{
                    background: isExpanded ? '#ffffff' : '#F5F8FE',
                    border: isExpanded ? '1.5px solid #076ABC' : '1.5px solid #D2E3FC',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    boxShadow: isExpanded ? '0 6px 20px rgba(7, 106, 188, 0.1)' : '0 1px 3px rgba(0, 33, 130, 0.02)'
                  }}
                >
                  {/* Fila principal colapsada (Tap Target de 64px) */}
                  <div
                    onClick={() => toggleExpand(service.id)}
                    style={{
                      padding: '0.8rem 0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    {/* Icono compacto */}
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: isExpanded ? 'linear-gradient(135deg, #076ABC 0%, #002182 100%)' : '#EBF3FD',
                        color: isExpanded ? '#ffffff' : '#076ABC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: isExpanded ? '0 3px 8px rgba(7, 106, 188, 0.25)' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Icon size={19} />
                    </div>

                    {/* Nombre y descripción corta de 1 renglón */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.1rem' }}>
                        <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#002182', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {service.name}
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
                          {service.badge}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#496386', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {service.shortDesc}
                      </div>
                    </div>

                    {/* Flecha indicadora de acordeón */}
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

                  {/* Cuerpo expandible del Acordeón */}
                  {isExpanded && (
                    <div
                      style={{
                        padding: '0 0.95rem 0.95rem',
                        borderTop: '1px solid #EDF3FD',
                        background: '#ffffff'
                      }}
                    >
                      {/* Descripción detallada concisa */}
                      <p style={{ fontSize: '0.84rem', color: '#496386', lineHeight: 1.45, margin: '0.75rem 0 0.75rem' }}>
                        {service.description}
                      </p>

                      {/* Chips compactos de prestaciones */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.4rem', marginBottom: '0.75rem' }}>
                        {service.features.map((feat, i) => (
                          <div
                            key={i}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              fontSize: '0.76rem',
                              color: '#172A4A',
                              background: '#F5F8FE',
                              padding: '0.35rem 0.6rem',
                              borderRadius: '8px',
                              border: '1px solid #E1EDFC'
                            }}
                          >
                            <CheckCircle2 size={13} color="#076ABC" style={{ flexShrink: 0 }} />
                            <span style={{ lineHeight: 1.2 }}>{feat}</span>
                          </div>
                        ))}
                      </div>

                      {/* Fila compacta de equipamiento */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          background: '#EBF3FD',
                          borderRadius: '10px',
                          padding: '0.5rem 0.75rem',
                          marginBottom: '0.85rem',
                          fontSize: '0.74rem',
                          color: '#002182'
                        }}
                      >
                        <Sparkles size={13} color="#076ABC" style={{ flexShrink: 0 }} />
                        <span style={{ fontWeight: 700 }}>{service.equipment}</span>
                      </div>

                      {/* Botón de Sacar Turno Directo */}
                      <button
                        onClick={() => handleBook(service.id)}
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
                        Sacar Turno en {service.name}
                      </button>
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
