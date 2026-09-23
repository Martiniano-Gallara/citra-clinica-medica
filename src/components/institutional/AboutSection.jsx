import React from 'react';
import {
  Building2,
  CheckCircle2,
  ShieldCheck,
  Award,
  Sparkles,
  Zap,
  Activity,
  Heart
} from 'lucide-react';

export const AboutSection = () => {
  return (
    <section
      id="nosotros"
      style={{
        padding: '5rem 1.5rem',
        background: '#ffffff'
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'center',
            gap: '3.5rem'
          }}
        >
          {/* Left Column: Image Collage & Badges */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0, 33, 130, 0.15)',
                border: '4px solid #ffffff'
              }}
            >
              <img
                src="/citra-fachada.jpg"
                alt="Fachada real de CITRA - Centro Integral de Traumatología y Rehabilitación Arroyito"
                style={{ width: '100%', height: '400px', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
              />
            </div>

            {/* Experience Floating Box */}
            <div
              style={{
                position: 'absolute',
                bottom: '-25px',
                right: '-20px',
                background: '#002182',
                color: '#ffffff',
                padding: '1.5rem',
                borderRadius: '18px',
                boxShadow: '0 15px 30px rgba(0,0,0,0.2)',
                border: '2px solid #257CE6',
                maxWidth: '220px'
              }}
            >
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#257CE6', lineHeight: 1 }}>
                +5
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '0.3rem' }}>
                Años construyendo CITRA en Arroyito
              </div>
              <div style={{ fontSize: '0.72rem', color: '#D2E3FC', marginTop: '0.25rem' }}>
                Atención humanizada y tecnología de punta
              </div>
            </div>
          </div>

          {/* Right Column: Narrative & Pillars */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#EBF3FD',
                color: '#002182',
                padding: '0.35rem 0.85rem',
                borderRadius: '100px',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                marginBottom: '0.75rem'
              }}
            >
              SOBRE NOSOTROS
            </div>
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                fontWeight: 900,
                color: '#002182',
                margin: '0 0 1.25rem',
                letterSpacing: '-0.02em',
                lineHeight: 1.2
              }}
            >
              Compromiso ético, precisión quirúrgica y rehabilitación activa
            </h2>

            <p style={{ fontSize: '0.98rem', color: '#496386', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
              En **CITRA** concebimos el tratamiento traumatológico de manera integral. Desde el diagnóstico precoz mediante radiología digital de baja radiación y ecografía musculoesquelética en tiempo real, hasta la intervención quirúrgica mínimamente invasiva y la fisiokinesioterapia de alta demanda.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div style={{ background: '#F5F8FE', padding: '1.25rem', borderRadius: '14px', border: '1px solid #D2E3FC' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#002182', fontSize: '0.92rem', marginBottom: '0.35rem' }}>
                  <ShieldCheck size={18} color="#076ABC" />
                  Garantía Médica
                </div>
                <div style={{ fontSize: '0.8rem', color: '#496386', lineHeight: 1.45 }}>
                  Especialistas certificados con residencias y fellowships reconocidos.
                </div>
              </div>

              <div style={{ background: '#F5F8FE', padding: '1.25rem', borderRadius: '14px', border: '1px solid #D2E3FC' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#002182', fontSize: '0.92rem', marginBottom: '0.35rem' }}>
                  <Zap size={18} color="#076ABC" />
                  Gimnasio Terapéutico
                </div>
                <div style={{ fontSize: '0.8rem', color: '#496386', lineHeight: 1.45 }}>
                  Equipamiento de magnetoterapia, láser de alta potencia y boxes privados.
                </div>
              </div>

              <div style={{ background: '#F5F8FE', padding: '1.25rem', borderRadius: '14px', border: '1px solid #D2E3FC' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#002182', fontSize: '0.92rem', marginBottom: '0.35rem' }}>
                  <Activity size={18} color="#076ABC" />
                  Historia Digital
                </div>
                <div style={{ fontSize: '0.8rem', color: '#496386', lineHeight: 1.45 }}>
                  Recetas electrónicas ReNaPDiS y estudios accesibles desde tu portal.
                </div>
              </div>

              <div style={{ background: '#F5F8FE', padding: '1.25rem', borderRadius: '14px', border: '1px solid #D2E3FC' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#002182', fontSize: '0.92rem', marginBottom: '0.35rem' }}>
                  <Heart size={18} color="#076ABC" />
                  Atención Cercana
                </div>
                <div style={{ fontSize: '0.8rem', color: '#496386', lineHeight: 1.45 }}>
                  Acompañamiento empático en cada etapa de tu proceso de curación.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
