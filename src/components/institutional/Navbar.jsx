import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  CalendarPlus,
  Shield,
  Menu,
  X,
  Stethoscope,
  Phone,
  Clock,
  MapPin,
  Home,
  Users,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

export const Navbar = () => {
  const {
    currentView,
    setCurrentView,
    authRole,
    clinicInfo
  } = useClinic();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'booking', label: 'Sacar Turno', icon: CalendarPlus },
    { id: 'services', label: 'Servicios', icon: Stethoscope },
    { id: 'doctors', label: 'Equipo Médico', icon: Users },
    { id: 'insurances', label: 'Obras Sociales', icon: ShieldCheck },
    { id: 'contact', label: 'Contacto', icon: PhoneCall }
  ];

  const navigateToPage = (viewId) => {
    setMobileMenuOpen(false);
    if (viewId === 'contact') {
      if (currentView !== 'home') {
        setCurrentView('home');
        setTimeout(() => {
          const el = document.getElementById('contacto');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 150);
      } else {
        const el = document.getElementById('contacto');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
      return;
    }
    setCurrentView(viewId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const rawWa = (clinicInfo?.whatsapp || '543576450214').replace(/\D/g, '');
  const cleanWa = rawWa.startsWith('54') ? rawWa : `54${rawWa}`;
  const phoneFijo = (clinicInfo?.phone || '3576450214').replace(/\D/g, '');
  const phoneDisplay = clinicInfo?.phoneFormatted || clinicInfo?.phone || '3576 450214';
  const addressDisplay = clinicInfo?.addressFull || clinicInfo?.address || 'Av. Carlos Pontin 556, Arroyito (CP 2434)';
  const scheduleDisplay = clinicInfo?.scheduleShort || clinicInfo?.schedule || 'Lunes a Viernes: 8 a 20 hs';
  const mapsUrl = clinicInfo?.mapsUrl || 'https://maps.app.goo.gl/FJhLndjvgSAWb2Si6';
  const clinicName = clinicInfo?.name || 'CITRA';

  const handleBookingClick = (customText) => {
    setMobileMenuOpen(false);
    const msg = customText || `Hola ${clinicName}, quisiera solicitar un turno.`;
    window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  const handleAdminAccessClick = () => {
    setMobileMenuOpen(false);
    if (authRole === 'admin') {
      setCurrentView('admin-panel');
    } else {
      setCurrentView('admin-login');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Top emergency & contact strip (DESKTOP ONLY) */}
      <div
        className="desktop-only"
        style={{
          background: '#001556',
          color: '#D2E3FC',
          fontSize: '0.78rem',
          padding: '0.45rem 1.5rem',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(210, 227, 252, 0.15)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'inherit',
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#D2E3FC'; }}
          >
            <MapPin size={13} color="#257CE6" />
            {addressDisplay}
          </a>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={13} color="#257CE6" />
            {scheduleDisplay}
          </span>
          <a
            href={`tel:0${phoneFijo}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#ffffff',
              fontWeight: 800,
              textDecoration: 'none'
            }}
          >
            <Phone size={13} color="#257CE6" />
            {phoneDisplay}
          </a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            onClick={() => navigateToPage('portal')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#D2E3FC',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              cursor: 'pointer',
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#D2E3FC')}
          >
            <Users size={13} color="#257CE6" />
            Portal Pacientes (Mis Turnos)
          </button>

          <span style={{ color: 'rgba(210, 227, 252, 0.3)' }}>|</span>

          <button
            onClick={handleAdminAccessClick}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#D2E3FC',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              cursor: 'pointer',
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#D2E3FC')}
          >
            <Shield size={13} color="#257CE6" />
            Portal Administración
          </button>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          background: scrolled ? 'rgba(255, 255, 255, 0.98)' : '#ffffff',
          boxShadow: scrolled ? '0 4px 20px rgba(0, 33, 130, 0.08)' : '0 1px 3px rgba(0, 33, 130, 0.05)',
          borderBottom: '1px solid #D2E3FC',
          transition: 'all 0.25s ease'
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0.75rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          {/* Brand Logo (Always visible, clean) */}
          <div
            onClick={() => navigateToPage('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            <img
              src="./citra-logo.png"
              alt="CITRA Centro Integral de Traumatología & Rehabilitación"
              style={{
                height: '42px',
                maxWidth: '190px',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </div>

          {/* Desktop Navigation Links */}
          <nav
            className="desktop-only"
            style={{
              alignItems: 'center',
              gap: '1.75rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#172A4A'
            }}
          >
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateToPage(item.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isActive ? '#002182' : '#172A4A',
                    fontWeight: isActive ? 800 : 600,
                    cursor: 'pointer',
                    fontSize: 'inherit',
                    position: 'relative',
                    padding: '0.35rem 0',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = '#076ABC';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = '#172A4A';
                  }}
                >
                  {item.label}
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '-4px',
                        left: 0,
                        right: 0,
                        height: '2.5px',
                        background: '#076ABC',
                        borderRadius: '2px'
                      }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Desktop Actions: Sacar Turno Online (Principal) & Turno por WhatsApp */}
          <div className="desktop-only" style={{ alignItems: 'center', gap: '0.65rem' }}>
            <button
              onClick={() => navigateToPage('booking')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                border: 'none',
                color: '#ffffff',
                padding: '0.6rem 1.15rem',
                borderRadius: '10px',
                fontSize: '0.86rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(7, 106, 188, 0.28)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(7, 106, 188, 0.38)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(7, 106, 188, 0.28)';
              }}
            >
              <CalendarPlus size={16} color="#ffffff" />
              <span>Sacar Turno Online</span>
            </button>

            <button
              onClick={() => handleBookingClick()}
              title="Solicitar asistencia de turnos por WhatsApp"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: '#F0FDF4',
                border: '1.5px solid #86EFAC',
                color: '#15803D',
                padding: '0.55rem 0.95rem',
                borderRadius: '10px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#DCFCE7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#F0FDF4';
              }}
            >
              <WhatsAppIcon size={16} color="#22C55E" />
              <span>WhatsApp</span>
            </button>
          </div>

          {/* Clean Mobile Hamburger / Close Button (MOBILE ONLY - keeps header clean with logo only) */}
          <div className="mobile-only">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: mobileMenuOpen ? '#002182' : '#F5F8FE',
                border: mobileMenuOpen ? '1.5px solid #002182' : '1.5px solid #D2E3FC',
                color: mobileMenuOpen ? '#ffffff' : '#002182',
                borderRadius: '12px',
                width: '44px',
                height: '44px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0, 33, 130, 0.05)',
                transition: 'all 0.2s ease'
              }}
              aria-label={mobileMenuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* OFF-CANVAS SIDE DRAWER — Overlay starts BELOW header so it stays visible */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer-overlay"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="mobile-drawer-panel"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Scrollable Drawer Body */}
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.1rem', flex: 1 }}>

              {/* Highlighted Primary CTA: Sacar Turno Online */}
              <button
                onClick={() => navigateToPage('booking')}
                style={{
                  background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  fontWeight: 900,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.55rem',
                  cursor: 'pointer',
                  boxShadow: '0 6px 18px rgba(7, 106, 188, 0.3)'
                }}
              >
                <CalendarPlus size={19} color="#ffffff" />
                <span>Sacar Turno Online</span>
              </button>

              {/* Secondary CTA: Asistencia por WhatsApp */}
              <button
                onClick={() => handleBookingClick()}
                style={{
                  background: '#F0FDF4',
                  color: '#15803D',
                  border: '1.5px solid #86EFAC',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.55rem',
                  cursor: 'pointer'
                }}
              >
                <WhatsAppIcon size={18} color="#22C55E" />
                <span>Asistencia por WhatsApp</span>
              </button>

              {/* Navigation Links */}
              <div>
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#7994B8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '0.5rem',
                    paddingLeft: '0.5rem'
                  }}
                >
                  Menú Principal
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  {navItems.map((item) => {
                    const isActive = currentView === item.id;
                    const ItemIcon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigateToPage(item.id)}
                        style={{
                          textAlign: 'left',
                          background: isActive ? '#EBF3FD' : 'transparent',
                          border: isActive ? '1px solid #D2E3FC' : '1px solid transparent',
                          padding: '0.72rem 0.85rem',
                          borderRadius: '10px',
                          fontSize: '0.95rem',
                          fontWeight: isActive ? 800 : 600,
                          color: isActive ? '#002182' : '#172A4A',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: isActive ? '#076ABC' : '#F5F8FE',
                            color: isActive ? '#ffffff' : '#076ABC',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <ItemIcon size={17} />
                        </div>
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {isActive && (
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#076ABC', flexShrink: 0 }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Patient and Admin Portal Access links */}
              <div style={{ borderTop: '1px solid #D2E3FC', paddingTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <button
                  onClick={() => navigateToPage('portal')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '0.65rem 0.8rem',
                    borderRadius: '10px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: '#076ABC',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem'
                  }}
                >
                  <Users size={16} />
                  <span>Portal Pacientes (Mis Turnos)</span>
                </button>
                <button
                  onClick={handleAdminAccessClick}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '0.65rem 0.8rem',
                    borderRadius: '10px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: '#475569',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem'
                  }}
                >
                  <Shield size={16} />
                  <span>Portal de Administración</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

