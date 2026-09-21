import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Lock,
  Mail,
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  Sparkles,
  Stethoscope,
  Briefcase,
  ShieldCheck,
  X,
  CheckCircle2
} from 'lucide-react';

export const AdminLoginView = () => {
  const { loginAdmin, setCurrentView, users, resetUserPassword } = useClinic();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Recovery modal state
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryMsg, setRecoveryMsg] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);

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
    }, 350);
  };

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) {
      setRecoveryMsg('Por favor ingresa tu correo institucional.');
      return;
    }
    setRecoveryLoading(true);
    const res = await resetUserPassword(recoveryEmail);
    setRecoveryLoading(false);
    if (res.success) {
      setRecoverySuccess(true);
      setRecoveryMsg(`Se ha generado la solicitud. Si el correo ${recoveryEmail} existe en la nómina, recibirás las credenciales temporales.`);
    } else {
      setRecoverySuccess(false);
      setRecoveryMsg('No se encontró personal registrado con ese correo institucional.');
    }
  };

  const handleDemoAdmin = (adminUser) => {
    if (!adminUser) return;
    setEmail(adminUser.email);
    setPassword('citra2026');
    setLoading(true);
    setTimeout(() => {
      loginAdmin(adminUser.email, 'citra2026');
      setLoading(false);
    }, 250);
  };

  const doctorUser = users.find((u) => u.adminType === 'doctor' || u.email?.includes('blanco')) || users[0];
  const adminUser = users.find((u) => u.adminType === 'administrative' || u.email?.includes('admin')) || users[2];
  const directorUser = users.find((u) => u.adminType === 'superadmin' || u.role?.includes('Director')) || users[5] || users[0];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 15%, #002182 0%, #001344 60%, #020718 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem 1rem',
        position: 'relative',
        fontFamily: 'inherit'
      }}
    >
      {/* Top back button */}
      <button
        type="button"
        onClick={() => setCurrentView('home')}
        style={{
          position: 'absolute',
          top: '1.5rem',
          left: '1.5rem',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '0.6rem 1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
          fontSize: '0.86rem',
          fontWeight: 600,
          backdropFilter: 'blur(10px)',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
        }}
      >
        <ArrowLeft size={16} />
        Volver a la Web Institucional
      </button>

      {/* Main card */}
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          padding: '2.5rem 2rem 2rem',
          boxSizing: 'border-box'
        }}
      >
        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <img
            src="./citra-logo.png"
            alt="CITRA Centro Integral de Traumatología & Rehabilitación"
            style={{
              height: '52px',
              maxWidth: '220px',
              objectFit: 'contain',
              margin: '0 auto 1.25rem',
              display: 'block'
            }}
          />

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
              padding: '0.28rem 0.75rem',
              borderRadius: '100px',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '0.65rem'
            }}
          >
            <Lock size={12} />
            Acceso Restringido · Personal
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: '1.55rem',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.02em'
            }}
          >
            Portal de Administración
          </h1>
          <p
            style={{
              margin: '0.35rem 0 0',
              fontSize: '0.84rem',
              color: '#64748b',
              lineHeight: 1.4
            }}
          >
            CITRA · Centro Integral de Traumatología & Rehabilitación
          </p>
        </div>

        {/* Quick Demo Access Box (Streamlined 3-column buttons) */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '0.85rem 1rem',
            marginBottom: '1.5rem'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.65rem'
            }}
          >
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#076abc',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Sparkles size={13} color="#076abc" />
              Acceso Rápido Demo (1-Click)
            </span>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Probar perfil</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem'
            }}
          >
            {/* Doctor */}
            {doctorUser && (
              <button
                type="button"
                onClick={() => handleDemoAdmin(doctorUser)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #dcfce7',
                  borderRadius: '12px',
                  padding: '0.65rem 0.4rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.2rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#86efac';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 10px rgba(22, 163, 74, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#dcfce7';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: '#f0fdf4',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Stethoscope size={15} />
                </div>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#14532d', whiteSpace: 'nowrap' }}>
                  Dr. Blanco
                </div>
                <div style={{ fontSize: '0.66rem', color: '#16a34a', fontWeight: 600 }}>
                  Médico
                </div>
              </button>
            )}

            {/* Admin */}
            {adminUser && (
              <button
                type="button"
                onClick={() => handleDemoAdmin(adminUser)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #dbeafe',
                  borderRadius: '12px',
                  padding: '0.65rem 0.4rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.2rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#93c5fd';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 10px rgba(37, 99, 235, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#dbeafe';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Briefcase size={15} />
                </div>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#1e3a8a', whiteSpace: 'nowrap' }}>
                  Lic. Quiroga
                </div>
                <div style={{ fontSize: '0.66rem', color: '#2563eb', fontWeight: 600 }}>
                  Admin
                </div>
              </button>
            )}

            {/* Director */}
            {directorUser && (
              <button
                type="button"
                onClick={() => handleDemoAdmin(directorUser)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #f3e8ff',
                  borderRadius: '12px',
                  padding: '0.65rem 0.4rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.2rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#d8b4fe';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 10px rgba(124, 58, 237, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#f3e8ff';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: '#faf5ff',
                    color: '#7c3aed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ShieldCheck size={15} />
                </div>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#581c87', whiteSpace: 'nowrap' }}>
                  Dr. Morales
                </div>
                <div style={{ fontSize: '0.66rem', color: '#7c3aed', fontWeight: 600 }}>
                  Director
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '0.75rem 0.9rem',
              borderRadius: '12px',
              fontSize: '0.84rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}
          >
            <AlertTriangle size={17} style={{ flexShrink: 0 }} />
            <div>{errorMsg}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.15rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#1e293b',
                marginBottom: '0.4rem'
              }}
            >
              Correo Institucional o Usuario
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={17}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }}
              />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@citra.com.ar"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '0.75rem 0.75rem 0.75rem 2.4rem',
                  borderRadius: '12px',
                  border: '1.5px solid #e2e8f0',
                  background: '#f8fafc',
                  fontSize: '0.9rem',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#002182';
                  e.target.style.background = '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.background = '#f8fafc';
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#1e293b',
                marginBottom: '0.4rem'
              }}
            >
              Contraseña Administrativa
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound
                size={17}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '0.75rem 2.5rem 0.75rem 2.4rem',
                  borderRadius: '12px',
                  border: '1.5px solid #e2e8f0',
                  background: '#f8fafc',
                  fontSize: '0.9rem',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#002182';
                  e.target.style.background = '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.background = '#f8fafc';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
            <button
              type="button"
              onClick={() => {
                setIsRecovering(true);
                setRecoveryMsg('');
                setRecoverySuccess(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#076abc',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0
              }}
            >
              ¿Olvidaste tu contraseña administrativa?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #002182 0%, #076abc 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.94rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(0, 33, 130, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 33, 130, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 33, 130, 0.3)';
            }}
          >
            <Lock size={17} />
            {loading ? 'Verificando...' : 'Ingresar al Panel de Gestión'}
          </button>
        </form>

        {/* Security badge footer */}
        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid #f1f5f9',
            textAlign: 'center',
            fontSize: '0.72rem',
            color: '#94a3b8'
          }}
        >
          🔒 Acceso restringido y auditado · CITRA 2026
        </div>
      </div>

      {/* Recovery Modal */}
      {isRecovering && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 19, 68, 0.75)',
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
            <button
              type="button"
              onClick={() => setIsRecovering(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X size={16} />
            </button>

            <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a', fontSize: '1.25rem', fontWeight: 800 }}>
              Recuperación de Contraseña
            </h3>
            <p style={{ margin: '0 0 1.25rem', color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Ingresa tu correo institucional registrado. Se validará tu cuenta y se enviarán las instrucciones para restablecer tu clave.
            </p>

            {recoveryMsg && (
              <div
                style={{
                  background: recoverySuccess ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${recoverySuccess ? '#86efac' : '#fecaca'}`,
                  color: recoverySuccess ? '#166534' : '#991b1b',
                  padding: '0.75rem 0.9rem',
                  borderRadius: '10px',
                  fontSize: '0.84rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {recoverySuccess ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                <div>{recoveryMsg}</div>
              </div>
            )}

            <form onSubmit={handleRecoverySubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#1e293b',
                    marginBottom: '0.35rem'
                  }}
                >
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
                    boxSizing: 'border-box',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: '1.5px solid #e2e8f0',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="submit"
                  disabled={recoveryLoading}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #002182 0%, #076abc 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: recoveryLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {recoveryLoading ? 'Enviando...' : 'Solicitar Clave'}
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
