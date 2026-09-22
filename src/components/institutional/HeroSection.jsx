import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  CalendarPlus,
  ArrowDown,
  ChevronDown
} from 'lucide-react';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

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
          background: 'radial-gradient(125% 90% at 50% 0%, #EDF4FE 0%, #F7FAFD 55%, #FFFFFF 100%)',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
        className="hero-container"
      >
        {/* Fondo Clean Medical Tech: Plexus dinámico con movimiento sutil, mesh halos y partículas */}
        {/* Capa Plexus Network / Constelación Biomédica Animada */}
        <div
          aria-hidden="true"
          className="hero-plexus-layer"
        />

        {/* Capa de textura reticular sutil (patrón médico tech) */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(7, 106, 188, 0.08) 1.2px, transparent 1.2px)',
            backgroundSize: '32px 32px',
            opacity: 0.5,
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 80%)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        {/* Halo luminoso central superior animado */}
        <div
          aria-hidden="true"
          className="hero-halo-layer"
        />

        {/* Ambient Glow lateral izquierdo animado (celeste suave) */}
        <div
          aria-hidden="true"
          className="hero-orb-left-layer"
        />

        {/* Ambient Glow lateral derecho animado (azul institucional) */}
        <div
          aria-hidden="true"
          className="hero-orb-right-layer"
        />

        {/* Micro-partículas luminosas flotantes (movimiento sutil orgánico) */}
        <div
          aria-hidden="true"
          className="hero-particle"
          style={{
            width: '6px',
            height: '6px',
            top: '32%',
            left: '18%',
            '--px': '22px',
            '--py': '-45px',
            animationDuration: '18s',
            animationDelay: '0s'
          }}
        />
        <div
          aria-hidden="true"
          className="hero-particle"
          style={{
            width: '7px',
            height: '7px',
            top: '58%',
            left: '26%',
            '--px': '-26px',
            '--py': '-55px',
            animationDuration: '22s',
            animationDelay: '3.5s'
          }}
        />
        <div
          aria-hidden="true"
          className="hero-particle"
          style={{
            width: '5px',
            height: '5px',
            top: '46%',
            left: '11%',
            '--px': '28px',
            '--py': '-40px',
            animationDuration: '19s',
            animationDelay: '7s'
          }}
        />
        <div
          aria-hidden="true"
          className="hero-particle"
          style={{
            width: '6px',
            height: '6px',
            top: '24%',
            left: '78%',
            '--px': '-24px',
            '--py': '-50px',
            animationDuration: '24s',
            animationDelay: '2s'
          }}
        />
        <div
          aria-hidden="true"
          className="hero-particle"
          style={{
            width: '5px',
            height: '5px',
            top: '66%',
            left: '84%',
            '--px': '-20px',
            '--py': '-42px',
            animationDuration: '26s',
            animationDelay: '8s'
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
              margin: '0 0 1.6rem'
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

          {/* BOTÓN DE SACAR TURNO POR WHATSAPP */}
          <a
            href={`https://wa.me/543576450214?text=${encodeURIComponent('Hola CITRA, quisiera solicitar un turno.')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: '100%',
              maxWidth: '290px',
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              color: '#ffffff',
              textDecoration: 'none',
              padding: '0.95rem 1.6rem',
              borderRadius: '14px',
              fontWeight: 800,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(37, 211, 102, 0.35)',
              minHeight: '48px',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 28px rgba(37, 211, 102, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 211, 102, 0.35)';
            }}
          >
            <WhatsAppIcon size={20} color="#ffffff" />
            <span>Sacar Turno</span>
          </a>

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
