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
  ShieldCheck,
  Clock,
  ChevronDown,
  Search,
  Stethoscope,
  ArrowRight
} from 'lucide-react';

export const ServicesPage = () => {
  const { setCurrentView, setBookingPreselectedSpecialty } = useClinic();
  const [activeCategory, setActiveCategory] = useState('all');
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
    { id: 'all', label: 'Todos (13)' },
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
      shortDesc: 'Huesos, articulaciones, fracturas y lesiones deportivas.',
      description: 'Diagnóstico, tratamiento y seguimiento médico y quirúrgico de patologías óseas, articulares, fracturas, esguinces, artrosis y lesiones deportivas.',
      features: [
        'Traumatología general, articular y de columna',
        'Infiltraciones articulares y ecoguiadas',
        'Manejo agudo de fracturas, luxaciones y yesos',
        'Artroscopía y cirugías ortopédicas'
      ],
      equipment: 'Sala de yesos y quirófano ambulatorio',
      duration: '30 min'
    },
    {
      id: 'esp-2',
      category: 'especialidades',
      name: 'Neurología',
      icon: Brain,
      badge: 'Médica',
      shortDesc: 'Cefaleas crónicas, migrañas y sistema nervioso.',
      description: 'Abordaje integral y diagnóstico de afecciones del sistema nervioso central y periférico, cefaleas crónicas, neuropatías y trastornos motores.',
      features: [
        'Evaluación clínica neurológica completa',
        'Manejo especializado de migrañas y cefaleas',
        'Tratamiento del dolor neuropático y radiculopatías',
        'Interconsulta directa con fisioterapia'
      ],
      equipment: 'Consultorio neurológico equipado',
      duration: '40 min'
    },
    {
      id: 'esp-3',
      category: 'especialidades',
      name: 'Reumatología',
      icon: Activity,
      badge: 'Médica',
      shortDesc: 'Artritis, artrosis severa y patologías autoinmunes.',
      description: 'Tratamiento especializado de patologías inflamatorias y autoinmunes que afectan articulaciones, tendones y músculos, preservando la movilidad.',
      features: [
        'Artritis reumatoidea, lúpica y espondiloartritis',
        'Artrosis severa y dolor articular crónico',
        'Fibromialgia y fatiga musculoesquelética',
        'Planes combinados con kinesiología'
      ],
      equipment: 'Consultorio de reumatología clínica',
      duration: '30-40 min'
    },
    {
      id: 'esp-4',
      category: 'especialidades',
      name: 'Nutrición',
      icon: Apple,
      badge: 'Médica',
      shortDesc: 'Planes antiinflamatorios, masa muscular y bioimpedancia.',
      description: 'Planes alimentarios personalizados orientados a modular la inflamación sistémica, favorecer la recuperación de tejidos y optimizar el rendimiento físico.',
      features: [
        'Nutrición antiinflamatoria osteoarticular',
        'Composición corporal por bioimpedancia',
        'Nutrición deportiva y recuperación post-lesión',
        'Reeducación de hábitos metabólicos'
      ],
      equipment: 'Analizador de bioimpedancia',
      duration: '30-45 min'
    },

    // --- REHABILITACIÓN ---
    {
      id: 'esp-5',
      category: 'rehabilitacion',
      name: 'Kinesiología',
      icon: Dumbbell,
      badge: 'Rehabilitación',
      shortDesc: 'Recuperación motora activa en gimnasio biomecánico.',
      description: 'Recuperación funcional y motora activa con planes individualizados para restablecer la movilidad, fuerza muscular y estabilidad articular.',
      features: [
        'Rehabilitación pre y post-quirúrgica',
        'Reeducación biomecánica y postural',
        'Fortalecimiento muscular progresivo',
        'Supervisión personalizada por kinesiólogo'
      ],
      equipment: 'Gimnasio biomecánico de 180 m²',
      duration: '45 min'
    },
    {
      id: 'esp-6',
      category: 'rehabilitacion',
      name: 'Fisioterapia',
      icon: Zap,
      badge: 'Rehabilitación',
      shortDesc: 'Magnetoterapia, ultrasonido y electroanalgesia TENS.',
      description: 'Terapia instrumental de avanzada para analgesia, desinflamación profunda y aceleración biológica de cicatrización tisular.',
      features: [
        'Magnetoterapia de alta potencia',
        'Ultrasonido terapéutico y electroestimulación (TENS)',
        'Corrientes rusas e interferenciales',
        'Termoterapia y relajación muscular profunda'
      ],
      equipment: 'Módulos fisioterapéuticos de última generación',
      duration: '40 min'
    },
    {
      id: 'esp-7',
      category: 'rehabilitacion',
      name: 'Osteopatía',
      icon: Layers,
      badge: 'Rehabilitación',
      shortDesc: 'Terapia manual biomecánica y desbloqueo articular.',
      description: 'Terapia manual global orientada a restablecer el equilibrio biomecánico y la movilidad de todos los tejidos y estructuras corporales.',
      features: [
        'Técnicas manuales estructurales y viscerales',
        'Desbloqueo vertebral y articular',
        'Alivio de tensiones miofasciales crónicas',
        'Enfoque holístico e integrador del dolor'
      ],
      equipment: 'Camilla osteopática articulada',
      duration: '45 min'
    },
    {
      id: 'esp-8',
      category: 'rehabilitacion',
      name: 'ATM (Mandíbula & Bruxismo)',
      icon: Smile,
      badge: 'Rehabilitación',
      shortDesc: 'Bruxismo, dolor mandibular y contracturas cervicales.',
      description: 'Tratamiento kinésico específico de disfunciones temporomandibulares, bruxismo, dolor orofacial y contracturas cervicales asociadas.',
      features: [
        'Terapia manual intra y extraoral',
        'Descompresión de la articulación temporomandibular',
        'Reeducación de la dinámica masticatoria',
        'Interdisciplina con odontólogos'
      ],
      equipment: 'Gabinete especializado en ATM',
      duration: '40 min'
    },
    {
      id: 'esp-9',
      category: 'rehabilitacion',
      name: 'Piso Pélvico Femenino',
      icon: Heart,
      badge: 'Rehabilitación',
      shortDesc: 'Biofeedback, recuperación postparto e incontinencia.',
      description: 'Fisioterapia uroginecológica y pelviperineal para la prevención y rehabilitación de disfunciones del suelo pélvico en mujeres.',
      features: [
        'Tratamiento de incontinencia urinaria',
        'Rehabilitación integral postparto y prolapsos',
        'Biofeedback perineal y ejercicios guiados',
        'Gimnasia abdominal hipopresiva (GAH)'
      ],
      equipment: 'Gabinete privado con biofeedback',
      duration: '45 min'
    },

    // --- DIAGNÓSTICO ---
    {
      id: 'esp-10',
      category: 'diagnostico',
      name: 'Radiología Digital',
      icon: ScanLine,
      badge: 'Diagnóstico',
      shortDesc: 'Rayos X directos de alta resolución con entrega inmediata.',
      description: 'Radiología digital directa de alta definición con mínima dosis de exposición y revelado instantáneo para estudios osteoarticulares y de columna.',
      features: [
        'Radiografías digitales de todos los segmentos',
        'Estudios comparativos y dinámicos',
        'Entrega digital inmediata para tu médico',
        'Integración con Historia Clínica Electrónica'
      ],
      equipment: 'Equipo de Rayos X digital Siemens',
      duration: '15-20 min'
    },
    {
      id: 'esp-11',
      category: 'diagnostico',
      name: 'Estudio de la Pisada',
      icon: Footprints,
      badge: 'Diagnóstico',
      shortDesc: 'Baropodometría computarizada y plantillas ortopédicas.',
      description: 'Baropodometría computarizada y análisis biomecánico estático y dinámico de presiones plantares durante la marcha y la carrera.',
      features: [
        'Análisis computarizado de marcha y apoyo',
        'Detección de pie plano, cavo y fascitis',
        'Diseño de plantillas ortopédicas a medida',
        'Evaluación deportiva y pediátrica'
      ],
      equipment: 'Plataforma baropodométrica computarizada',
      duration: '30 min'
    },

    // --- TRATAMIENTOS ---
    {
      id: 'esp-12',
      category: 'complementarios',
      name: 'Ozonoterapia',
      icon: Sparkles,
      badge: 'Tratamientos',
      shortDesc: 'Terapias biológicas regenerativas y alivio articular.',
      description: 'Terapia biológica con ozono medicinal con potente efecto analgésico, antiinflamatorio, antioxidante y oxigenador tisular.',
      features: [
        'Infiltraciones articulares y paravertebrales',
        'Alivio significativo de artrosis y lumbalgias',
        'Regeneración biológica sin fármacos químicos',
        'Procedimiento ambulatorio rápido y seguro'
      ],
      equipment: 'Generador de ozono medicinal certificado',
      duration: '30 min'
    },
    {
      id: 'esp-13',
      category: 'complementarios',
      name: 'Medicina Estética',
      icon: Sparkles,
      badge: 'Tratamientos',
      shortDesc: 'Bioestimulación de colágeno y revitalización no quirúrgica.',
      description: 'Procedimientos médicos no quirúrgicos orientados a la bioestimulación celular, revitalización dérmica, tonificación y bienestar integral.',
      features: [
        'Bioestimulación de colágeno y ácido hialurónico',
        'Tratamientos dérmicos regenerativos',
        'Asesoramiento médico personalizado',
        'Insumos aprobados por ANMAT'
      ],
      equipment: 'Gabinete médico en estricta asepsia',
      duration: '30-45 min'
    }
  ];

  const filteredCards = serviceCards.filter((c) => {
    const matchesCategory = activeCategory === 'all' || c.category === activeCategory;
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.shortDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      {/* Header Banner — Ultra compacto y limpio en mobile */}
      <section
        style={{
          background: 'linear-gradient(135deg, #001556 0%, #002182 100%)',
          color: '#ffffff',
          padding: '2.5rem 1.25rem 1.75rem',
          position: 'relative'
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(37, 124, 230, 0.18)',
              border: '1px solid rgba(37, 124, 230, 0.35)',
              color: '#D2E3FC',
              padding: '0.3rem 0.8rem',
              borderRadius: '100px',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              marginBottom: '0.65rem'
            }}
          >
            <Sparkles size={12} color="#257CE6" />
            CITRA · SERVICIOS ESPECIALIZADOS
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
            Servicios Médicos & Terapias
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
            Atención clínica especializada, kinesiología, diagnóstico por imágenes y tratamientos en Arroyito.
          </p>

          {/* Quick Metrics Bar — Compact Chips Grid en 1 línea / 4 chips */}
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
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#257CE6' }}>13</div>
              <div style={{ fontSize: '0.68rem', color: '#D2E3FC', fontWeight: 700 }}>Servicios</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.07)', padding: '0.5rem 0.35rem', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#257CE6' }}>180 m²</div>
              <div style={{ fontSize: '0.68rem', color: '#D2E3FC', fontWeight: 700 }}>Gimnasio</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.07)', padding: '0.5rem 0.35rem', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#257CE6' }}>Digital</div>
              <div style={{ fontSize: '0.68rem', color: '#D2E3FC', fontWeight: 700 }}>Rayos X</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.07)', padding: '0.5rem 0.35rem', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#257CE6' }}>Integral</div>
              <div style={{ fontSize: '0.68rem', color: '#D2E3FC', fontWeight: 700 }}>Equipo</div>
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
            placeholder="Buscar por especialidad o síntoma (ej. rodilla, migraña, yeso)..."
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

                      {/* Fila compacta de equipamiento y tiempo */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem',
                          background: '#EBF3FD',
                          borderRadius: '10px',
                          padding: '0.5rem 0.75rem',
                          marginBottom: '0.85rem',
                          fontSize: '0.74rem',
                          color: '#002182',
                          flexWrap: 'wrap'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Sparkles size={13} color="#076ABC" />
                          <span style={{ fontWeight: 700 }}>{service.equipment}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#076ABC', fontWeight: 800 }}>
                          <Clock size={13} />
                          <span>{service.duration}</span>
                        </div>
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

        {/* Pilares Institucionales — Versión Ultra Compacta en 1 sola tarjeta unificada */}
        <div
          style={{
            marginTop: '2.5rem',
            background: '#F5F8FE',
            borderRadius: '16px',
            border: '1.5px solid #D2E3FC',
            padding: '1.25rem 1.15rem'
          }}
        >
          <div style={{ fontSize: '0.76rem', fontWeight: 900, color: '#002182', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.85rem' }}>
            Compromiso Asistencial CITRA
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#EBF3FD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#076ABC', flexShrink: 0, marginTop: '2px' }}>
                <ShieldCheck size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 800, color: '#002182', fontSize: '0.86rem' }}>Atención Personalizada</div>
                <div style={{ fontSize: '0.75rem', color: '#496386', lineHeight: 1.35 }}>Plan terapéutico y seguimiento médico adaptado a tus necesidades.</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#EBF3FD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#076ABC', flexShrink: 0, marginTop: '2px' }}>
                <Clock size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 800, color: '#002182', fontSize: '0.86rem' }}>Equipo Multidisciplinario</div>
                <div style={{ fontSize: '0.75rem', color: '#496386', lineHeight: 1.35 }}>Médicos, kinesiólogos y nutricionistas integrados en el mismo centro.</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#EBF3FD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#076ABC', flexShrink: 0, marginTop: '2px' }}>
                <Sparkles size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 800, color: '#002182', fontSize: '0.86rem' }}>Tecnología de Precisión</div>
                <div style={{ fontSize: '0.75rem', color: '#496386', lineHeight: 1.35 }}>Gimnasio de 180 m², baropodometría y radiología digital directa.</div>
              </div>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
};
