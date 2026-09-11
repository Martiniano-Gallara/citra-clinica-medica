import React from 'react';
import { useClinic } from '../../context/ClinicContext';

export const Footer = () => {
  const { setCurrentView, setAuthRole, setAuthAdmin, users } = useClinic();

  const handleAdminDirectClick = (e) => {
    e.preventDefault();
    if (users && users.length > 0) {
      const defaultAdmin = users.find((u) => u.role?.includes('Admin') || u.email?.includes('admin')) || users[0];
      setAuthRole('admin');
      setAuthAdmin(defaultAdmin);
    }
    setCurrentView('admin-panel');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      style={{
        background: '#001556',
        color: '#D2E3FC',
        padding: '0.85rem 1rem',
        borderTop: '1px solid rgba(37, 124, 230, 0.2)'
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'nowrap',
          whiteSpace: 'nowrap',
          fontSize: 'clamp(0.74rem, 2.8vw, 0.84rem)',
          gap: '0.5rem',
          overflow: 'hidden'
        }}
      >
        <span>© 2026 CITRA</span>
        <span style={{ opacity: 0.4 }}>•</span>
        <span>
          Desarrollado por{' '}
          <a
            href="https://www.instagram.com/martiniano.web"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#257CE6',
              fontWeight: 800,
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#257CE6';
            }}
          >
            MGH
          </a>
        </span>
        <span style={{ opacity: 0.4 }}>•</span>
        <a
          href="#admin"
          onClick={handleAdminDirectClick}
          style={{
            color: '#A8C7FA',
            textDecoration: 'none',
            opacity: 0.75,
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.75';
            e.currentTarget.style.color = '#A8C7FA';
          }}
          title="Panel Administrativo de CITRA"
        >
          Administración
        </a>
      </div>
    </footer>
  );
};
