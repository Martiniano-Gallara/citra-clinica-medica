import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  ShieldAlert,
  Lock,
  Mail,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Sparkles,
  Server,
  UserCheck,
  Stethoscope,
  Briefcase
} from 'lucide-react';

export const AdminLoginView = () => {
  const { loginAdmin, setCurrentView, users, resetUserPassword } = useClinic();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Recovery modal state
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryMsg, setRecoveryMsg] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Ingresa tu correo y contraseña administrativa de seguridad.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = loginAdmin(email, password);
      setLoading(false);
      if (!res.success) {
        setErrorMsg('Credenciales inválidas. Este portal es exclusivo para personal administrativo y directivo.');
      }
    }, 400);
  };

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) {
      setRecoveryMsg('Por favor ingresa tu correo institucional.');
      return;
    }
    const res = await resetUserPassword(recoveryEmail);
    if (res.success) {
      setRecoverySuccess(true);
      setRecoveryMsg(`Se ha generado la solicitud de recuperación. Si el correo ${recoveryEmail} existe en la nómina, recibirás las credenciales temporales.`);
    } else {
      setRecoverySuccess(false);
      setRecoveryMsg('No se encontró personal registrado con ese correo.');
    }
  };

  const handleDemoAdmin = (adminUser) => {
    setEmail(adminUser.email);
    setPassword('citra2026');
    loginAdmin(adminUser.email, 'citra2026');
  };

  const doctorUser = users.find((u) => u.adminType === 'doctor' || u.email?.includes('blanco')) || users[0];
  const adminUser = users.find((u) => u.adminType === 'administrative' || u.email?.includes('admin')) || users[2];
  const directorUser = users.find((u) => u.adminType === 'superadmin' || u.role?.includes('Director')) || users[5] || users[0];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 10% 20%, #001556 0%, #002182 50%, #052625 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1.5rem',
        position: 'relative'
      }}
    >
      {/* Top back button */}
      <button
        onClick={() => setCurrentView('home')}
        style={{
          position: 'absolute',
          top: '1.5rem',
          left: '1.5rem',
          background: 'rgba(255, 255, 255, 0.12)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          color: '#ffffff',
          borderRadius: '10px',
          padding: '0.6rem 1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
          fontSize: '0.86rem',
          fontWeight: 700,
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s'
        }}
      >
        <ArrowLeft size={16} />
        Volver a la Web Institucional
      </button>

      {/* Main card */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(37, 124, 230, 0.3)',
          overflow: 'hidden'
        }}
      >
        {/* Header with Security Badge */}
        <div
          style={{
            background: 'linear-gradient(135deg, #002182 0%, #001556 100%)',
            padding: '2.5rem 2rem 1.75rem',
            color: '#ffffff',
            textAlign: 'center',
            borderBottom: '3px solid #076ABC',
            position: 'relative'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              padding: '0.75rem 1.5rem',
              borderRadius: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.25)',
              border: '2px solid #257CE6'
            }}
          >
            <img
              src="./citra-logo.png"
              alt="CITRA Centro Integral de Traumatología & Rehabilitación"
              style={{ height: '64px', maxWidth: '240px', objectFit: 'contain', display: 'block' }}
            />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '0.3rem 0.8rem',
              borderRadius: '100px',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              marginBottom: '0.6rem'
            }}
          >
            ACCESO RESTRINGIDO · AUDITADO
          </div>

          <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
            Portal de Administración
          </h1>
          <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem', color: '#D2E3FC' }}>
            CITRA · Centro Integral de Traumatología & Rehabilitación
          </p>
        </div>

        {/* Content body */}
        <div style={{ padding: '2rem' }}>
          {errorMsg && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem'
              }}
            >
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{errorMsg}</div>
            </div>
          )}

          {/* Quick Demo Access Box */}
          <div
            style={{
              background: '#F5F8FE',
              border: '1.5px dashed #257CE6',
              borderRadius: '14px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}
          >
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#002182', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={15} color="#076ABC" />
              Acceso Rápido Demo (1-Click)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {/* Doctor 1-click */}
              {doctorUser && (
                <button
                  type="button"
                  onClick={() => handleDemoAdmin(doctorUser)}
                  style={{
                    background: '#f0fdf4',
                    border: '1.5px solid #86efac',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Stethoscope size={14} color="#15803d" /> {doctorUser.name}
                      </span>
                      <span style={{ fontSize: '0.68rem', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                        MÉDICO
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#15803d' }}>
                      {doctorUser.role} · Vista aislada 10 módulos
                    </div>
                  </div>
                  <span
                    style={{
                      background: '#16a34a',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '0.3rem 0.65rem',
                      borderRadius: '6px'
                    }}
                  >
                    Entrar como Dr.
                  </span>
                </button>
              )}

              {/* Administrative 1-click */}
              {adminUser && (
                <button
                  type="button"
                  onClick={() => handleDemoAdmin(adminUser)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #D2E3FC',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#002182', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Briefcase size={14} color="#076ABC" /> {adminUser.name}
                      </span>
                      <span style={{ fontSize: '0.68rem', background: '#eff6ff', color: '#2563eb', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                        ADMINISTRACIÓN
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#496386' }}>
                      {adminUser.role} · Facturación y recepción
                    </div>
                  </div>
                  <span
                    style={{
                      background: '#076ABC',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '0.3rem 0.65rem',
                      borderRadius: '6px'
                    }}
                  >
                    Entrar Admin
                  </span>
                </button>
              )}

              {/* Director 1-click */}
              {directorUser && directorUser.id !== doctorUser?.id && directorUser.id !== adminUser?.id && (
                <button
                  type="button"
                  onClick={() => handleDemoAdmin(directorUser)}
                  style={{
                    background: '#faf5ff',
                    border: '1px solid #e9d5ff',
                    padding: '0.55rem 0.85rem',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6b21a8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building2 size={14} color="#7c3aed" /> {directorUser.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#7e22ce' }}>
                      {directorUser.role} · Auditoría general
                    </div>
                  </div>
                  <span
                    style={{
                      background: '#7c3aed',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px'
                    }}
                  >
                    Director
                  </span>
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#002182', marginBottom: '0.4rem' }}>
                Correo Institucional o Usuario
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#7994B8' }} />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@citra.com.ar"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.4rem',
                    borderRadius: '10px',
                    border: '1.5px solid #D2E3FC',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#002182', marginBottom: '0.4rem' }}>
                Contraseña Administrativa
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#7994B8' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.4rem',
                    borderRadius: '10px',
                    border: '1.5px solid #D2E3FC',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => { setIsRecovering(true); setRecoveryMsg(''); setRecoverySuccess(false); }}
                style={{ background: 'none', border: 'none', color: '#076ABC', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
              >
                ¿Olvidaste tu contraseña administrativa?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #002182 0%, #076ABC 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.9rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 15px rgba(0, 33, 130, 0.35)'
              }}
            >
              <Lock size={18} />
              {loading ? 'Verificando credenciales...' : 'Ingresar al Panel de Gestión'}
            </button>
          </form>

          {/* Compliance notice */}
          <div
            style={{
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid #EDF3FD',
              textAlign: 'center',
              fontSize: '0.72rem',
              color: '#7994B8',
              lineHeight: 1.5
            }}
          >
            Sistema de seguridad con cifrado AES-256 y firma digital criptográfica homologada.
          </div>
        </div>
      </div>

      {/* Modal de Recuperación de Contraseña Administrativa */}
      {isRecovering && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 21, 86, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 9999
          }}
          onClick={() => setIsRecovering(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '440px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 0.5rem', color: '#002182', fontSize: '1.3rem', fontWeight: 900 }}>
              Recuperación de Contraseña
            </h3>
            <p style={{ margin: '0 0 1.25rem', color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Ingresa tu correo institucional registrado. Se validará tu cuenta y se enviará la clave de recuperación segura.
            </p>

            {recoveryMsg && (
              <div
                style={{
                  background: recoverySuccess ? '#F0FDF4' : '#FEF2F2',
                  border: `1px solid ${recoverySuccess ? '#86EFAC' : '#FECACA'}`,
                  color: recoverySuccess ? '#166534' : '#991B1B',
                  padding: '0.85rem',
                  borderRadius: '10px',
                  fontSize: '0.84rem',
                  marginBottom: '1rem'
                }}
              >
                {recoveryMsg}
              </div>
            )}

            <form onSubmit={handleRecoverySubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.35rem' }}>
                  Correo Institucional
                </label>
                <input
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="profesional@citra.com.ar"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: '1.5px solid #D2E3FC',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #002182 0%, #076ABC 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  Solicitar Clave
                </button>
                <button
                  type="button"
                  onClick={() => setIsRecovering(false)}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    color: '#475569',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
