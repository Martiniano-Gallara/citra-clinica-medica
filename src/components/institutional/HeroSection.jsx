import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  CalendarPlus,
  ArrowDown,
  ChevronDown
} from 'lucide-react';

export const HeroSection = () => {
  const { setCurrentView } = useClinic();

  return (
    <section id="inicio" style={{ background: '#F5F8FE' }}>
      {/* PANTALLA 1: Primer pantallazo a pantalla completa con Logo Grande, Título y Botón de Turnos */}
      <div
        style={{
          minHeight: 'calc(100svh - 65px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem 1.25rem 3.5rem',
          textAlign: 'center',
          position: 'relative',
          background: 'linear-gradient(180deg, #F5F8FE 0%, #ffffff 100%)',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
        className="hero-container"
      >
        {/* Foto de la fachada de CITRA de fondo con difuminado suave y elegante */}
        <div
          className="hero-bg-facade"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url("./citra-fachada.jpg")',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            filter: 'blur(5px)',
            transform: 'scale(1.08)',
            zIndex: 0
          }}
        />

        {/* Overlay translúcido difuminado para máxima legibilidad y armonía visual */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(245, 248, 254, 0.68) 0%, rgba(255, 255, 255, 0.74) 50%, rgba(255, 255, 255, 0.94) 100%)',
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            zIndex: 1
          }}
        />

        {/* Decorative subtle background blurs */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            right: '-5%',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37, 124, 230, 0.12) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '-5%',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(7, 106, 188, 0.08) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />

        <div
          style={{
            width: '100%',
            maxWidth: '560px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* LOGO EN GRANDE */}
          <img
            src="./citra-logo.png"
            alt="CITRA Centro Médico"
            style={{
              width: '100%',
              maxWidth: '260px',
              height: 'auto',
              marginBottom: '1.5rem',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 14px rgba(0, 33, 130, 0.08))'
            }}
          />

          {/* TÍTULO */}
          <h1
            style={{
              fontSize: 'clamp(1.75rem, 4.5vw, 2.75rem)',
              fontWeight: 900,
              color: '#002182',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              margin: '0 0 0.85rem'
            }}
          >
            Nos enfocamos en tu{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              recuperación y bienestar
            </span>
          </h1>

          {/* Subtítulo breve orientado al paciente */}
          <p
            style={{
              fontSize: '0.98rem',
              lineHeight: 1.5,
              color: '#496386',
              margin: '0 0 1.85rem',
              maxWidth: '460px'
            }}
          >
            Especialistas médicos, kinesiología y diagnóstico por imágenes en Arroyito.
          </p>

          {/* BOTÓN DE SACAR TURNO */}
          <button
            onClick={() => setCurrentView('booking')}
            style={{
              width: '100%',
              maxWidth: '290px',
              background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '0.95rem 1.6rem',
              borderRadius: '14px',
              fontWeight: 800,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.55rem',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(7, 106, 188, 0.35)',
              minHeight: '48px',
              transition: 'all 0.2s ease'
            }}
          >
            <CalendarPlus size={20} />
            Sacar Turno Online
          </button>

          {/* Contacto y Horarios con flecha hacia abajo que lleva a la sección #contacto */}
          <a
            href="#contacto"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('contacto');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            style={{
              marginTop: '1rem',
              fontSize: '0.88rem',
              fontWeight: 800,
              color: '#076ABC',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 1rem',
              borderRadius: '100px',
              background: 'rgba(255, 255, 255, 0.92)',
              border: '1.5px solid #D2E3FC',
              boxShadow: '0 2px 8px rgba(0, 33, 130, 0.05)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#002182';
              e.currentTarget.style.borderColor = '#076ABC';
              e.currentTarget.style.transform = 'translateY(2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(7, 106, 188, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#076ABC';
              e.currentTarget.style.borderColor = '#D2E3FC';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 33, 130, 0.05)';
            }}
          >
            <span>Contacto y Horarios</span>
            <ArrowDown size={15} color="#076ABC" />
          </a>
        </div>

        {/* Indicador sutil de scroll hacia abajo */}
        <div
          style={{
            position: 'absolute',
            bottom: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.2rem',
            color: '#496386',
            fontSize: '0.74rem',
            fontWeight: 700,
            opacity: 0.75
          }}
        >
          <span>Deslizá para más</span>
          <ChevronDown size={16} color="#076ABC" />
        </div>
      </div>

      {/* ESTADÍSTICAS BASTANTE MÁS ABAJO — Visibles ÚNICAMENTE al deslizar */}
      <div
        style={{
          padding: '2.5rem 1.25rem 3rem',
          background: '#ffffff',
          borderTop: '1px solid #EDF3FD'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '620px',
            margin: '0 auto',
            background: '#F5F8FE',
            border: '1.5px solid #D2E3FC',
            borderRadius: '20px',
            padding: '1.35rem 1.25rem',
            boxShadow: '0 6px 20px rgba(0, 33, 130, 0.04)',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            textAlign: 'center'
          }}
        >
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#002182', whiteSpace: 'nowrap' }}>+25 años</div>
            <div style={{ fontSize: '0.78rem', color: '#496386', fontWeight: 700, marginTop: '0.15rem' }}>Trayectoria</div>
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#076ABC', whiteSpace: 'nowrap' }}>15.000+</div>
            <div style={{ fontSize: '0.78rem', color: '#496386', fontWeight: 700, marginTop: '0.15rem' }}>Pacientes</div>
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#002182', whiteSpace: 'nowrap' }}>20+</div>
            <div style={{ fontSize: '0.78rem', color: '#496386', fontWeight: 700, marginTop: '0.15rem' }}>Especialistas</div>
          </div>
        </div>
      </div>
    </section>
  );
};
