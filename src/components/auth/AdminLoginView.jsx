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
  Shield,
  X,
  CheckCircle2,
  Activity
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
    <div className="admin-login-fullscreen-root">
      <style>{`
        .admin-login-fullscreen-root {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          flex-direction: row;
          background: #ffffff;
          font-family: inherit;
          position: relative;
          overflow-x: hidden;
          box-sizing: border-box;
        }
        .admin-login-left-showcase {
          flex: 1.15;
          min-height: 100vh;
          background: linear-gradient(145deg, #001344 0%, #002182 55%, #076ABC 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem 3.5rem;
          position: relative;
          overflow: hidden;
          color: #ffffff;
          box-sizing: border-box;
        }
        .admin-login-left-glow-top {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(7, 106, 188, 0.4) 0%, rgba(0, 33, 130, 0) 70%);
          top: -200px;
          left: -150px;
          pointer-events: none;
        }
        .admin-login-left-glow-bottom {
          position: absolute;
          width: 450px;
          height: 450px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(2, 132, 199, 0.25) 0%, rgba(0, 19, 68, 0) 70%);
          bottom: -150px;
          right: -100px;
          pointer-events: none;
        }
        .admin-login-right-panel {
          flex: 0.95;
          min-height: 100vh;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 2.5rem 2.5rem;
          box-sizing: border-box;
          position: relative;
          overflow-y: auto;
        }
        .admin-login-card-inner {
          width: 100%;
          max-width: 450px;
        }
        .admin-login-mobile-restricted {
          display: none;
        }
        @media (max-width: 1023px) {
          .admin-login-fullscreen-root {
            flex-direction: column;
            background: radial-gradient(circle at 50% 20%, #002182 0%, #001344 60%, #020718 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem 1.5rem;
            min-height: 100vh;
          }
          .admin-login-left-showcase {
            display: none !important;
          }
          .admin-login-right-panel {
            display: none !important;
          }
          .admin-login-mobile-restricted {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            max-width: 380px;
            width: 100%;
            background: #ffffff;
            border-radius: 24px;
            padding: 2.5rem 1.75rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            box-sizing: border-box;
          }
        }
      `}</style>

      {/* Mobile restriction screen */}
      <div className="admin-login-mobile-restricted">
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#076ABC',
            marginBottom: '1.25rem',
            border: '1.5px solid #BFDBFE'
          }}
        >
          <Shield size={28} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#002182', margin: '0 0 0.5rem' }}>
          Acceso de Escritorio
        </h2>
        <p style={{ fontSize: '0.86rem', color: '#496386', lineHeight: 1.55, margin: '0 0 1.5rem' }}>
          El Portal de Administración y gestión clínica de CITRA es de uso exclusivo para computadoras y estaciones de trabajo de la clínica.
        </p>
        <button
          onClick={() => setCurrentView('home')}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '0.8rem 1rem',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 14px rgba(7, 106, 188, 0.28)'
          }}
        >
          <ArrowLeft size={16} />
          Volver a la Web Institucional
        </button>
      </div>

      {/* Left Showcase (Desktop First Full-Screen Presentation) */}
      <div className="admin-login-left-showcase">
        <div className="admin-login-left-glow-top" />
        <div className="admin-login-left-glow-bottom" />

        {/* Top Header Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2 }}>
          <button
            type="button"
            onClick={() => setCurrentView('home')}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              color: '#ffffff',
              borderRadius: '12px',
              padding: '0.65rem 1.15rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              cursor: 'pointer',
              fontSize: '0.86rem',
              fontWeight: 700,
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 14px rgba(0,0,0,0.12)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <ArrowLeft size={16} />
            Volver a la Web Institucional
          </button>

          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: 'rgba(255, 255, 255, 0.8)',
              textTransform: 'uppercase',
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '0.35rem 0.75rem',
              borderRadius: '100px',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            CITRA CLINIC OS
          </span>
        </div>

        {/* Center Presentation */}
        <div style={{ maxWidth: '520px', zIndex: 2, margin: '2rem 0' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.28)',
              color: '#ffffff',
              padding: '0.35rem 0.85rem',
              borderRadius: '100px',
              fontSize: '0.74rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
              backdropFilter: 'blur(8px)'
            }}
          >
            <ShieldCheck size={14} color="#93C5FD" />
            Sistema de Gestión Clínica & Administrativa
          </div>

          <h2
            style={{
              fontSize: 'clamp(1.85rem, 2.7vw, 2.45rem)',
              fontWeight: 900,
              lineHeight: 1.18,
              letterSpacing: '-0.03em',
              margin: '0 0 1rem',
              color: '#ffffff'
            }}
          >
            Tecnología médica para la excelencia en cada consulta.
          </h2>

          <p
            style={{
              fontSize: '0.94rem',
              lineHeight: 1.6,
              color: 'rgba(255, 255, 255, 0.82)',
              margin: '0 0 1.75rem'
            }}
          >
            Acceso unificado para el equipo de profesionales de la salud, secretaría, kinesiología y dirección médica de la Sede Arroyito.
          </p>

          {/* 3 Module Showcase Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: '14px',
                padding: '0.85rem 1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Stethoscope size={18} color="#93C5FD" />
              </div>
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#ffffff' }}>
                  Historia Clínica Electrónica (HCE)
                </div>
                <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.72)' }}>
                  Evoluciones médicas, prescripciones digitales y consentimiento firmado.
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: '14px',
                padding: '0.85rem 1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Activity size={18} color="#86EFAC" />
              </div>
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#ffffff' }}>
                  Rehabilitación & Kinesiología
                </div>
                <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.72)' }}>
                  Seguimiento de planes de fisioterapia activa, boxes y gimnasio terapéutico.
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: '14px',
                padding: '0.85rem 1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <ShieldCheck size={18} color="#FDE047" />
              </div>
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#ffffff' }}>
                  Auditoría, Facturación & Obras Sociales
                </div>
                <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.72)' }}>
                  Facturación fiscal ARCA directa y validación de coberturas en tiempo real.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Status Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.76rem', color: 'rgba(255, 255, 255, 0.75)', zIndex: 2 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 10px #22C55E' }} />
          <span>Servidor Sede Arroyito Conectado · Cifrado Seguro TLS 1.3</span>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="admin-login-right-panel">
        <div className="admin-login-mobile-back">
          <button
            type="button"
            onClick={() => setCurrentView('home')}
            style={{
              background: '#F1F5F9',
              border: '1px solid #E2E8F0',
              color: '#002182',
              borderRadius: '10px',
              padding: '0.55rem 0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 700
            }}
          >
            <ArrowLeft size={15} />
            Volver a la Web Institucional
          </button>
        </div>

        <div className="admin-login-card-inner">
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
                fontSize: '1.65rem',
                fontWeight: 900,
                color: '#0f172a',
                letterSpacing: '-0.02em'
              }}
            >
              Portal de Administración
            </h1>
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
