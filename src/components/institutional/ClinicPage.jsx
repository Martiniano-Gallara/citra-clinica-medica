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
  ArrowRight
} from 'lucide-react';

export const ClinicPage = () => {
  const { setCurrentView } = useClinic();

  const realAreas = [
    {
      icon: Stethoscope,
      title: 'Consultorios Médicos',
      detail: 'Atención clínica y diagnóstica en traumatología, reumatología, neurología y nutrición.'
    },
    {
      icon: Dumbbell,
      title: 'Gimnasio de Rehabilitación',
      detail: 'Espacio acondicionado para kinesiología activa, fisioterapia, osteopatía y reeducación motora.'
    },
    {
      icon: ScanLine,
      title: 'Diagnóstico & Biomecánica',
      detail: 'Radiología digital directa y plataforma baropodométrica para estudio de la pisada y marcha.'
    },
    {
      icon: Sparkles,
      title: 'Gabinete de Terapias',
      detail: 'Equipamiento para ozonoterapia médica, terapias biológicas y fisioterapia especializada.'
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
            <Building2 size={12} color="#8EBEF5" />
            SEDE INSTITUCIONAL ARROYITO
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
            La Clínica
          </h1>

          <p
            style={{
              fontSize: '0.92rem',
              color: '#D2E3FC',
              maxWidth: '580px',
              lineHeight: 1.45,
              margin: 0,
              opacity: 0.92
            }}
          >
            Centro Integral de Traumatología & Rehabilitación. Atención profesional, diagnóstico y recuperación en un mismo lugar.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section style={{ maxWidth: '850px', margin: '0 auto', padding: '1.75rem 1.25rem 3.5rem' }}>
        
        {/* Foto Real de la Sede con Badge de Ubicación */}
        <div
          style={{
            position: 'relative',
            borderRadius: '18px',
            overflow: 'hidden',
            border: '1.5px solid #D2E3FC',
            boxShadow: '0 8px 24px rgba(0, 33, 130, 0.08)',
            marginBottom: '1.75rem'
          }}
        >
          <img
            src="/citra-fachada.jpg"
            alt="Fachada real de CITRA en Arroyito"
            style={{
              width: '100%',
              height: 'clamp(200px, 45vw, 320px)',
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
              background: 'rgba(0, 21, 86, 0.88)',
              backdropFilter: 'blur(6px)',
              color: '#ffffff',
              padding: '0.65rem 0.95rem',
              borderRadius: '12px',
              border: '1px solid rgba(210, 227, 252, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}
          >
            <a
              href="https://maps.app.goo.gl/FJhLndjvgSAWb2Si6"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 800, color: 'inherit', textDecoration: 'none' }}
            >
              <MapPin size={15} color="#257CE6" />
              <span>Av. Carlos Pontin Nº556, Arroyito</span>
            </a>
            <span style={{ fontSize: '0.72rem', color: '#D2E3FC', fontWeight: 700 }}>
              Fácil acceso y estacionamiento
            </span>
          </div>
        </div>

        {/* Propuesta de Atención Real y Verídica */}
        <div
          style={{
            background: '#F5F8FE',
            borderRadius: '16px',
            border: '1.5px solid #D2E3FC',
            padding: '1.25rem',
            marginBottom: '1.75rem'
          }}
        >
          <div style={{ fontSize: '0.74rem', fontWeight: 900, color: '#076ABC', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
            NUESTRO MODELO DE ATENCIÓN
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#002182', margin: '0 0 0.55rem' }}>
            Diagnóstico, Consulta Médica y Rehabilitación Integrados
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#496386', lineHeight: 1.5, margin: '0 0 0.85rem' }}>
            En CITRA reunimos a médicos especialistas, kinesiólogos y tecnología diagnóstica en un mismo centro en Arroyito. Esto permite coordinar la evaluación médica, la indicación de estudios y el tratamiento kinésico de forma continua, sin demoras ni trámites innecesarios.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: '#002182', fontWeight: 700 }}>
              <CheckCircle2 size={15} color="#076ABC" />
              <span>Interconsulta médica directa</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: '#002182', fontWeight: 700 }}>
              <CheckCircle2 size={15} color="#076ABC" />
              <span>Profesionales de la salud colegiados</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: '#002182', fontWeight: 700 }}>
              <CheckCircle2 size={15} color="#076ABC" />
              <span>Atención para obras sociales y prepagas</span>
            </div>
          </div>
        </div>

        {/* Instalaciones y Áreas de la Clínica (Tarjetas Compactas) */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 900, color: '#076ABC', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem', paddingLeft: '0.25rem' }}>
            Áreas y Espacios de la Sede
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.65rem' }}>
            {realAreas.map((area, i) => {
              const Icon = area.icon;
              return (
                <div
                  key={i}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #D2E3FC',
                    borderRadius: '14px',
                    padding: '0.9rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    boxShadow: '0 2px 8px rgba(0, 33, 130, 0.03)'
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: '#EBF3FD',
                      color: '#076ABC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#002182', marginBottom: '0.2rem' }}>
                      {area.title}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#496386', lineHeight: 1.35 }}>
                      {area.detail}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ficha Directa de Información & Contacto */}
        <div
          style={{
            background: 'linear-gradient(135deg, #EBF3FD 0%, #F5F8FE 100%)',
            borderRadius: '16px',
            border: '1.5px solid #D2E3FC',
            padding: '1.25rem'
          }}
        >
          <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#002182', marginBottom: '0.75rem' }}>
            Información de Atención
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.82rem', color: '#172A4A', marginBottom: '1.25rem' }}>
            <a
              href="https://maps.app.goo.gl/FJhLndjvgSAWb2Si6"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'inherit', textDecoration: 'none' }}
            >
              <MapPin size={15} color="#076ABC" />
              <span><strong>Dirección:</strong> Av. Carlos Pontin Nº556, Arroyito (CP 2434)</span>
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={15} color="#076ABC" />
              <span><strong>Horarios:</strong> Lunes a Viernes de 8:00 a 20:00 hs</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={15} color="#076ABC" />
              <span><strong>Teléfono:</strong> 3576 450214</span>
            </div>
          </div>

          {/* Botón de Turnos */}
          <button
            onClick={() => {
              setCurrentView('booking');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '0.8rem 1.25rem',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(7, 106, 188, 0.25)',
              minHeight: '44px'
            }}
          >
            <CalendarPlus size={17} />
            Sacar Turno Online
          </button>
        </div>

      </section>
    </div>
  );
};
