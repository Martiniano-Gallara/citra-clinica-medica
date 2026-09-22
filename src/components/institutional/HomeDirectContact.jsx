import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import {
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';

const InstagramIcon = ({ size = 20, color = '#ffffff', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export const HomeDirectContact = () => {
  const { setCurrentView } = useClinic();

  const phoneFijo = '3576450214';
  const mapsUrl = 'https://maps.app.goo.gl/FJhLndjvgSAWb2Si6';
  const instagramUrl = 'https://www.instagram.com/citra.arroyito';
  const whatsappUrl = `https://wa.me/543576450214?text=${encodeURIComponent('Hola CITRA, quisiera consultar por turnos y especialidades.')}`;

  return (
    <section
      id="contacto"
      style={{
        padding: '2.75rem 1.25rem 3.5rem',
        background: '#ffffff',
        borderTop: '1px solid #D2E3FC'
      }}
    >
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#EBF3FD',
              color: '#002182',
              padding: '0.3rem 0.8rem',
              borderRadius: '100px',
              fontSize: '0.74rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              marginBottom: '0.4rem',
              border: '1px solid #D2E3FC'
            }}
          >
            <Sparkles size={13} color="#076ABC" />
            ATENCIÓN INMEDIATA
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 900,
              color: '#002182',
              margin: '0 0 0.25rem',
              letterSpacing: '-0.02em'
            }}
          >
            Canales de Contacto
          </h2>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#496386' }}>
            Accedé con un toque a nuestras vías oficiales de atención.
          </p>
        </div>

        {/* 2X2 COMPACT GRID */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}
        >
          {/* 1. Ubicación (Sin '(Google Maps)') */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#F5F8FE',
              border: '1.5px solid #D2E3FC',
              borderRadius: '14px',
              padding: '0.9rem 0.75rem',
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '0.45rem',
              boxShadow: '0 2px 8px rgba(0, 33, 130, 0.03)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = '#076ABC';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(7, 106, 188, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#D2E3FC';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 33, 130, 0.03)';
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <MapPin size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#002182', marginBottom: '0.1rem' }}>
                Ubicación
              </div>
              <div style={{ fontSize: '0.74rem', color: '#496386', lineHeight: 1.25 }}>
                Av. Carlos Pontin 556
              </div>
            </div>
          </a>

          {/* 2. Horarios */}
          <div
            style={{
              background: '#F5F8FE',
              border: '1.5px solid #D2E3FC',
              borderRadius: '14px',
              padding: '0.9rem 0.75rem',
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '0.45rem',
              boxShadow: '0 2px 8px rgba(0, 33, 130, 0.03)',
              transition: 'all 0.2s ease'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #002182 0%, #001556 100%)',
                color: '#257CE6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Clock size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#002182', marginBottom: '0.1rem' }}>
                Horarios
              </div>
              <div style={{ fontSize: '0.74rem', color: '#496386', lineHeight: 1.25 }}>
                Lunes a Viernes 8 a 20 hs
              </div>
            </div>
          </div>

          {/* 3. WhatsApp (Logo Oficial) */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#F5F8FE',
              border: '1.5px solid #D2E3FC',
              borderRadius: '14px',
              padding: '0.9rem 0.75rem',
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '0.45rem',
              boxShadow: '0 2px 8px rgba(0, 33, 130, 0.03)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = '#25D366';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 211, 102, 0.16)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#D2E3FC';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 33, 130, 0.03)';
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#25D366',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <WhatsAppIcon size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#002182', marginBottom: '0.1rem' }}>
                WhatsApp
              </div>
              <div style={{ fontSize: '0.74rem', color: '#128C7E', fontWeight: 700 }}>
                3576 450214
              </div>
            </div>
          </a>

          {/* 4. Instagram */}
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#F5F8FE',
              border: '1.5px solid #D2E3FC',
              borderRadius: '14px',
              padding: '0.9rem 0.75rem',
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '0.45rem',
              boxShadow: '0 2px 8px rgba(0, 33, 130, 0.03)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = '#E1306C';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(225, 48, 108, 0.16)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#D2E3FC';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 33, 130, 0.03)';
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <InstagramIcon size={18} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#002182', marginBottom: '0.1rem' }}>
                Instagram
              </div>
              <div style={{ fontSize: '0.74rem', color: '#E1306C', fontWeight: 700 }}>
                @citra.arroyito
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
};
