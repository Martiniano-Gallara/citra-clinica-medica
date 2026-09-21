import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Building2,
  MapPin,
  Phone,
  Clock,
  CalendarPlus,
  CheckCircle2,
  Dumbbell,
  Stethoscope,
  ScanLine,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  Activity,
  Check,
  Car,
  Accessibility,
  Zap,
  CreditCard
} from 'lucide-react';

export const ClinicPage = () => {
  const { setCurrentView } = useClinic();

  const realAreas = [
    {
      icon: Stethoscope,
      title: 'Consultorios Médicos',
      badge: 'Especialidades',
      detail: 'Módulos equipados para traumatología, neurología, reumatología y nutrición clínica.',
      color: '#076ABC',
      bg: '#EBF3FD'
    },
    {
      icon: Dumbbell,
      title: 'Gimnasio Biomecánico',
      badge: '180 m²',
      detail: 'Rehabilitación motora activa, kinesiología, osteopatía y reeducación postural.',
      color: '#059669',
      bg: '#ECFDF5'
    },
    {
      icon: ScanLine,
      title: 'Diagnóstico & Imágenes',
      badge: 'Digital Directo',
      detail: 'Radiología digital de alta resolución y plataforma baropodométrica computarizada.',
      color: '#7C3AED',
      bg: '#F5F3FF'
    },
    {
      icon: Sparkles,
      title: 'Gabinete de Terapias',
      badge: 'Avanzado',
      detail: 'Ozonoterapia médica, medicina biológica regenerativa y fisioterapia analgésica.',
      color: '#D97706',
      bg: '#FEF3C7'
    },
    {
      icon: Activity,
      title: 'Estudio de Pisada & Baropodometría',
      badge: 'Biomecánica',
      detail: 'Evaluación de presiones plantares computarizada y confección de plantillas ortopédicas.',
      color: '#2563EB',
      bg: '#EFF6FF'
    },
    {
      icon: ShieldCheck,
      title: 'Recepción & Admisión Médica',
      badge: 'Atención Ágil',
      detail: 'Gestión rápida de turnos, convenios con obras sociales y sala de espera climatizada.',
      color: '#0D9488',
      bg: '#F0FDFA'
    }
  ];

  const careModelSteps = [
    {
      step: '01',
      title: 'Consulta Médica',
      desc: 'Evaluación clínica especializada en traumatología y áreas afines sin demoras.',
      icon: Stethoscope,
      color: '#076ABC',
      bg: '#EBF3FD'
    },
    {
      step: '02',
      title: 'Diagnóstico Inmediato',
      desc: 'Rayos X digital y análisis biomecánico en la misma sede y con entrega en el día.',
      icon: ScanLine,
      color: '#7C3AED',
      bg: '#F5F3FF'
    },
    {
      step: '03',
      title: 'Rehabilitación Activa',
      desc: 'Tratamiento kinésico continuo y personalizado en nuestro gimnasio de 180 m².',
      icon: Dumbbell,
      color: '#059669',
      bg: '#ECFDF5'
    }
  ];

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      {/* Header Banner — Rediseño Premium: Glassmorphism, atmósfera tech y métricas de sede */}
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
            <Building2 size={13} color="#00F0FF" />
            <span>CITRA · SEDE INSTITUCIONAL ARROYITO</span>
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
            La Clínica &{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #60A5FA 0%, #38BDF8 50%, #A5F3FC 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Sede Central
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
            Centro Integral de Traumatología & Rehabilitación. Infraestructura médica de vanguardia con consultorios, gimnasio de 180 m² y diagnóstico digital en Arroyito.
          </p>

          {/* Quick Metrics Bar — Tarjetas Glassmorphism de la Sede */}
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
                <div className="services-metric-value">8 Módulos</div>
                <div className="services-metric-label">Consultorios</div>
                <div className="services-metric-sub">Atención médica</div>
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
                <Dumbbell size={20} color="#34D399" />
              </div>
              <div className="services-metric-content">
                <div className="services-metric-value">180 m²</div>
                <div className="services-metric-label">Gimnasio</div>
                <div className="services-metric-sub">Biomecánica motora</div>
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
                <div className="services-metric-sub">Diagnóstico propio</div>
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
                <MapPin size={20} color="#FBBF24" />
              </div>
              <div className="services-metric-content">
                <div className="services-metric-value">Arroyito</div>
                <div className="services-metric-label">Carlos Pontin 556</div>
                <div className="services-metric-sub">Fácil acceso</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section style={{ maxWidth: '920px', margin: '0 auto', padding: '2rem 1.25rem 3.5rem' }}>
        
        {/* Foto Real de la Sede con Badge Glassmorphism de Ubicación */}
        <div
          style={{
            position: 'relative',
            borderRadius: '20px',
            overflow: 'hidden',
            border: '1.5px solid #D2E3FC',
            boxShadow: '0 10px 30px rgba(0, 33, 130, 0.08)',
            marginBottom: '2rem'
          }}
        >
          <img
            src="/citra-fachada.jpg"
            alt="Fachada real de CITRA en Arroyito"
            style={{
              width: '100%',
              height: 'clamp(210px, 46vw, 340px)',
              objectFit: 'cover',
              objectPosition: 'center 35%',
              display: 'block'
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '0.85rem',
              left: '0.85rem',
              right: '0.85rem',
              background: 'rgba(0, 21, 86, 0.92)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              color: '#ffffff',
              padding: '0.75rem 1rem',
              borderRadius: '14px',
              border: '1px solid rgba(210, 227, 252, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              flexWrap: 'wrap',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)'
            }}
          >
            <a
              href="https://maps.app.goo.gl/FJhLndjvgSAWb2Si6"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.84rem',
                fontWeight: 800,
                color: '#ffffff',
                textDecoration: 'none'
              }}
            >
              <MapPin size={16} color="#00F0FF" />
              <span>Av. Carlos Pontin Nº556, Arroyito</span>
              <ExternalLink size={13} color="#93C5FD" />
            </a>
            <span
              style={{
                fontSize: '0.74rem',
                color: '#D2E3FC',
                fontWeight: 700,
                background: 'rgba(37, 124, 230, 0.25)',
                border: '1px solid rgba(142, 190, 245, 0.3)',
                padding: '0.2rem 0.6rem',
                borderRadius: '100px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Check size={12} /> Estacionamiento exclusivo
            </span>
          </div>
        </div>

        {/* Strip de Infraestructura y Confort */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.65rem',
            marginBottom: '2.5rem'
          }}
        >
          {[
            { icon: Car, label: 'Estacionamiento', sub: 'Exclusivo en puerta' },
            { icon: Accessibility, label: 'Accesibilidad', sub: '100% adaptado' },
            { icon: Zap, label: 'Rayos X In situ', sub: 'Entrega digital en el día' },
            { icon: Clock, label: 'Horario Corrido', sub: 'Lun a Vie 8 a 20 hs' },
            { icon: CreditCard, label: 'Obras Sociales', sub: 'Atención con convenios' }
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: '#F8FAFD',
                border: '1px solid #E2EDFC',
                borderRadius: '12px',
                padding: '0.65rem 0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                boxShadow: '0 2px 6px rgba(0, 33, 130, 0.02)'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#EAF3FD',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#076ABC',
                  flexShrink: 0
                }}
              >
                <item.icon size={17} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#002182', lineHeight: 1.2 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>
                  {item.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modelo Asistencial Integrado — 3 Pasos Visuales Sin Bloques Pesados de Texto */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 900, color: '#076ABC', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>
              MODELO DE ATENCIÓN INTEGRAL
            </div>
            <h2 style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.55rem)', fontWeight: 900, color: '#002182', margin: '0 0 0.4rem', letterSpacing: '-0.02em' }}>
              Consulta Médica, Diagnóstico y Terapia en un Mismo Centro
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#496386', lineHeight: 1.45, margin: 0, maxWidth: '680px' }}>
              Coordinación continua sin trámites ni demoras entre médicos especialistas y kinesiólogos.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
            {careModelSteps.map((step, i) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={i}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #D2E3FC',
                    borderRadius: '16px',
                    padding: '1.15rem 1.1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                    boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: step.bg,
                        color: step.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <StepIcon size={18} />
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#7994B8', letterSpacing: '0.05em' }}>
                      {step.step}
                    </span>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#002182', marginBottom: '0.2rem' }}>
                      {step.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#496386', lineHeight: 1.4 }}>
                      {step.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Garantías del Modelo Asistencial (Reemplaza los viejos checkmarks de texto denso) */}
          <div className="trust-commitment-card" style={{ marginTop: '1.2rem' }}>
            <div className="trust-commitment-badge">
              <ShieldCheck size={14} color="#076ABC" />
              <span>GARANTÍAS ASISTENCIALES DE LA SEDE</span>
            </div>
            <div className="trust-grid">
              <div className="trust-item">
                <div className="trust-icon-box" style={{ background: '#EBF3FD', color: '#076ABC' }}>
                  <Check size={18} />
                </div>
                <div className="trust-content">
                  <span className="trust-title">Interconsulta Directa</span>
                  <span className="trust-desc">Médicos y kinesiólogos comunicados en tiempo real</span>
                </div>
              </div>

              <div className="trust-item">
                <div className="trust-icon-box" style={{ background: '#ECFDF5', color: '#059669' }}>
                  <ShieldCheck size={18} />
                </div>
                <div className="trust-content">
                  <span className="trust-title">Profesionales Colegiados</span>
                  <span className="trust-desc">Especialistas matriculados con posgrados activos</span>
                </div>
              </div>

              <div className="trust-item">
                <div className="trust-icon-box" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                  <CheckCircle2 size={18} />
                </div>
                <div className="trust-content">
                  <span className="trust-title">Obras Sociales & Prepagas</span>
                  <span className="trust-desc">Atención y cobertura sin demoras burocráticas</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instalaciones y Áreas de la Sede (Tarjetas Modernas con Hover) */}
        <div style={{ marginBottom: '2.25rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 900, color: '#076ABC', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>
              INSTALACIONES & EQUIPAMIENTO
            </div>
            <h2 style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.55rem)', fontWeight: 900, color: '#002182', margin: 0, letterSpacing: '-0.02em' }}>
              Áreas y Espacios de la Sede
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
            {realAreas.map((area, i) => {
              const Icon = area.icon;
              return (
                <div
                  key={i}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #E2EDFC',
                    borderRadius: '16px',
                    padding: '1rem 1.1rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.85rem',
                    boxShadow: '0 2px 10px rgba(0, 33, 130, 0.03)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = '#8EBEF5';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(7, 106, 188, 0.09)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#E2EDFC';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 33, 130, 0.03)';
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: area.bg,
                      color: area.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#002182' }}>
                        {area.title}
                      </span>
                      <span
                        style={{
                          fontSize: '0.66rem',
                          fontWeight: 800,
                          background: area.bg,
                          color: area.color,
                          padding: '0.1rem 0.45rem',
                          borderRadius: '6px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {area.badge}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#496386', lineHeight: 1.38 }}>
                      {area.detail}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ficha Directa de Información & Contacto — Rediseño Elevado */}
        <div
          style={{
            background: 'linear-gradient(135deg, #001556 0%, #002182 100%)',
            borderRadius: '20px',
            border: '1.5px solid rgba(37, 124, 230, 0.3)',
            padding: '1.5rem',
            color: '#ffffff',
            boxShadow: '0 10px 30px rgba(0, 21, 86, 0.25)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-30%',
              right: '-10%',
              width: '250px',
              height: '250px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 240, 255, 0.15) 0%, transparent 70%)',
              filter: 'blur(40px)',
              pointerEvents: 'none'
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#60A5FA', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              VISITA Y ATENCIÓN CITRA
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: '0 0 1rem' }}>
              Información de Atención en Sede
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', marginBottom: '1.35rem' }}>
              <a
                href="https://maps.app.goo.gl/FJhLndjvgSAWb2Si6"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(210, 227, 252, 0.18)',
                  borderRadius: '12px',
                  padding: '0.75rem 0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  color: '#ffffff',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <MapPin size={18} color="#38BDF8" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.78rem' }}>
                  <div style={{ fontWeight: 800, color: '#D2E3FC' }}>Dirección</div>
                  <div>Av. Carlos Pontin Nº556</div>
                </div>
              </a>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(210, 227, 252, 0.18)',
                  borderRadius: '12px',
                  padding: '0.75rem 0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem'
                }}
              >
                <Clock size={18} color="#34D399" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.78rem' }}>
                  <div style={{ fontWeight: 800, color: '#D2E3FC' }}>Horarios</div>
                  <div>Lun a Vie 8:00 a 20:00 hs</div>
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(210, 227, 252, 0.18)',
                  borderRadius: '12px',
                  padding: '0.75rem 0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem'
                }}
              >
                <Phone size={18} color="#FBBF24" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.78rem' }}>
                  <div style={{ fontWeight: 800, color: '#D2E3FC' }}>Teléfono</div>
                  <div>(03576) 450214</div>
                </div>
              </div>
            </div>

            {/* Botón de Turnos con degradé vibrante */}
            <button
              onClick={() => {
                setCurrentView('booking');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #257CE6 0%, #076ABC 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.9rem 1.4rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.55rem',
                boxShadow: '0 6px 20px rgba(7, 106, 188, 0.35)',
                minHeight: '48px',
                transition: 'all 0.2s ease'
              }}
            >
              <CalendarPlus size={18} />
              Sacar Turno Online en CITRA
            </button>
          </div>
        </div>

      </section>
    </div>
  );
};
