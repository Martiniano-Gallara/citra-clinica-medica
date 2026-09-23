import React, { useState, useEffect, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Lock,
  Mail,
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  Stethoscope,
  ShieldCheck,
  Shield,
  X,
  CheckCircle2,
  Activity,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Search,
  Users,
  Check,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';

export const AdminLoginView = () => {
  const { loginAdmin, setCurrentView, users, resetUserPassword, logAudit } = useClinic();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Security Lockout / Rate Limiting State (5 attempts -> 60s cooldown)
  const [failedAttempts, setFailedAttempts] = useState(() => {
    try {
      const stored = sessionStorage.getItem('citra_login_failed_attempts');
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [lockoutUntil, setLockoutUntil] = useState(() => {
    try {
      const stored = sessionStorage.getItem('citra_login_lockout_until');
      return stored ? parseInt(stored, 10) : null;
    } catch {
      return null;
    }
  });

  const [lockoutRemainingSecs, setLockoutRemainingSecs] = useState(0);

  useEffect(() => {
    if (!lockoutUntil) {
      setLockoutRemainingSecs(0);
      return;
    }

    const checkLockout = () => {
      const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setLockoutRemainingSecs(remaining);
      if (remaining <= 0) {
        setLockoutUntil(null);
        setFailedAttempts(0);
        try {
          sessionStorage.removeItem('citra_login_lockout_until');
          sessionStorage.removeItem('citra_login_failed_attempts');
        } catch {
          // ignore
        }
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  // Accordion state for all 13 specialists
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [specialistCategory, setSpecialistCategory] = useState('all');
  const [specialistSearch, setSpecialistSearch] = useState('');

  // Password Recovery modal state
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryMsg, setRecoveryMsg] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  // Reception user (Mesa de Entrada)
  const receptionUser = useMemo(() => {
    return (
      users.find((u) => u.email === 'recepcion@citra.com.ar') ||
      users.find((u) => u.adminType === 'administrative' && u.name?.includes('Romina')) || {
        id: 'usr-2',
        name: 'Romina Maidana',
        email: 'recepcion@citra.com.ar',
        role: 'Mesa de Entrada & Recepción',
        adminType: 'administrative'
      }
    );
  }, [users]);

  // List of all 13 specialists
  const specialists = useMemo(() => {
    return users.filter((u) => u.adminType === 'doctor' || (u.doctorId && u.doctorId.startsWith('doc-')));
  }, [users]);

  // Filtered specialists inside accordion
  const filteredSpecialists = useMemo(() => {
    return specialists.filter((s) => {
      // Category filter
      if (specialistCategory === 'trauma') {
        const spec = (s.specialty || s.role || '').toLowerCase();
        if (!spec.includes('trauma') && !spec.includes('pie') && !spec.includes('mano')) return false;
      } else if (specialistCategory === 'kine') {
        const spec = (s.specialty || s.role || '').toLowerCase();
        if (!spec.includes('kine') && !spec.includes('pelv') && !spec.includes('osteo') && !spec.includes('atm')) {
          return false;
        }
      } else if (specialistCategory === 'especialidades') {
        const spec = (s.specialty || s.role || '').toLowerCase();
        if (
          spec.includes('trauma') ||
          (spec.includes('kine') && !spec.includes('pisada'))
        ) {
          return false;
        }
      }

      // Search query
      if (specialistSearch.trim()) {
        const q = specialistSearch.toLowerCase().trim();
        const matchesName = s.name?.toLowerCase().includes(q);
        const matchesSpec = (s.specialty || s.role || '').toLowerCase().includes(q);
        const matchesEmail = s.email?.toLowerCase().includes(q);
        if (!matchesName && !matchesSpec && !matchesEmail) return false;
      }

      return true;
    });
  }, [specialists, specialistCategory, specialistSearch]);

  const isLockedOut = lockoutRemainingSecs > 0;

  // Handle direct login submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isLockedOut) {
      setErrorMsg(`Sistema temporalmente bloqueado por seguridad. Reintente en ${lockoutRemainingSecs} segundos.`);
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setErrorMsg('Ingrese su correo institucional y su contraseña de seguridad.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = loginAdmin(cleanEmail, cleanPass);
      setLoading(false);

      if (!res.success) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        try {
          sessionStorage.setItem('citra_login_failed_attempts', nextAttempts.toString());
        } catch {
          // ignore
        }

        if (nextAttempts >= 5) {
          const until = Date.now() + 60 * 1000;
          setLockoutUntil(until);
          try {
            sessionStorage.setItem('citra_login_lockout_until', until.toString());
          } catch {
            // ignore
          }
          if (logAudit) {
            logAudit('SECURITY_LOCKOUT', 'Portal Login', cleanEmail, 'Bloqueo preventivo de 60 segundos por 5 intentos fallidos');
          }
          setErrorMsg('Demasiados intentos fallidos. Por protocolo de seguridad médica (Ley 25.326), el acceso está bloqueado por 60 segundos.');
        } else {
          const remaining = 5 - nextAttempts;
          setErrorMsg(`Credenciales no válidas. Evento registrado bajo auditoría de seguridad. Le quedan ${remaining} ${remaining === 1 ? 'intento' : 'intentos'} antes del bloqueo temporal.`);
        }
      } else {
        // Reset attempts on success
        setFailedAttempts(0);
        try {
          sessionStorage.removeItem('citra_login_failed_attempts');
          sessionStorage.removeItem('citra_login_lockout_until');
        } catch {
          // ignore
        }
      }
    }, 350);
  };

  // 1-Click quick login handler for demo/testing
  const handleQuickLogin = (targetUser) => {
    if (!targetUser || isLockedOut) return;
    setEmail(targetUser.email);
    setPassword('citra2026');
    setLoading(true);
    setTimeout(() => {
      loginAdmin(targetUser.email, 'citra2026');
      setLoading(false);
    }, 200);
  };

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) {
      setRecoveryMsg('Por favor ingrese su correo institucional.');
      return;
    }
    setRecoveryLoading(true);
    const res = await resetUserPassword(recoveryEmail.trim());
    setRecoveryLoading(false);
    if (res.success) {
      setRecoverySuccess(true);
      setRecoveryMsg(`Se ha generado la solicitud de restablecimiento para ${recoveryEmail}. Si el usuario existe en la nómina oficial, recibirá la clave temporal.`);
    } else {
      setRecoverySuccess(false);
      setRecoveryMsg('No se encontró personal registrado con ese correo institucional.');
    }
  };

  return (
    <div className="admin-login-fullscreen-root">
      <style>{`
        .admin-login-fullscreen-root {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          flex-direction: row;
          background: #f8fafc;
          font-family: inherit;
          position: relative;
          overflow-x: hidden;
          box-sizing: border-box;
        }
        .admin-login-left-showcase {
          flex: 1.1;
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
          background: radial-gradient(circle, rgba(7, 106, 188, 0.45) 0%, rgba(0, 33, 130, 0) 70%);
          top: -200px;
          left: -150px;
          pointer-events: none;
        }
        .admin-login-left-glow-bottom {
          position: absolute;
          width: 450px;
          height: 450px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(2, 132, 199, 0.3) 0%, rgba(0, 19, 68, 0) 70%);
          bottom: -150px;
          right: -100px;
          pointer-events: none;
        }
        .admin-login-right-panel {
          flex: 1;
          min-height: 100vh;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2.5rem 3rem;
          box-sizing: border-box;
          position: relative;
          overflow-y: auto;
        }
        .admin-login-card-inner {
          width: 100%;
          max-width: 490px;
          margin: auto 0;
        }
        .admin-login-mobile-restricted {
          display: none;
        }
        .specialist-scroll-area::-webkit-scrollbar {
          width: 6px;
        }
        .specialist-scroll-area::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .specialist-scroll-area::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .specialist-scroll-area::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
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
              color: 'rgba(255, 255, 255, 0.85)',
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
              color: 'rgba(255, 255, 255, 0.85)',
              margin: '0 0 1.75rem'
            }}
          >
            Acceso unificado para el equipo de profesionales de la salud, mesa de entrada, kinesiología y dirección médica de la Sede Arroyito (Av. Carlos Pontin 556).
          </p>

          {/* 3 Authentic Clinical Modules */}
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
                  Historia Clínica Electrónica (HCE Inmutable)
                </div>
                <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.75)' }}>
                  Aislamiento estricto por profesional. Cada médico accede exclusivamente a sus pacientes y evoluciones.
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
                  Rehabilitación & Kinesiología Motora
                </div>
                <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.75)' }}>
                  Planes de fisioterapia activa, suelo pélvico, ATM y gimnasio terapéutico.
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
                <Users size={18} color="#FDE047" />
              </div>
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#ffffff' }}>
                  Mesa de Entrada & Asignación de Turnos
                </div>
                <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.75)' }}>
                  Recepción de pacientes en sala y coordinación centralizada de turnos para todos los médicos.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Status Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.76rem', color: 'rgba(255, 255, 255, 0.75)', zIndex: 2 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 10px #22C55E' }} />
          <span>Servidor Sede Arroyito Conectado · Cifrado Seguro TLS 1.3 · Hash SHA-256</span>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="admin-login-right-panel">
        <div className="admin-login-card-inner">
          {/* Logo & Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <img
              src="./citra-logo.png"
              alt="CITRA Centro Integral de Traumatología & Rehabilitación"
              style={{
                height: '48px',
                maxWidth: '210px',
                objectFit: 'contain',
                margin: '0 auto 1rem',
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
                padding: '0.25rem 0.75rem',
                borderRadius: '100px',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem'
              }}
            >
              <Lock size={12} />
              Acceso Restringido · Personal Acreditado
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: 900,
                color: '#0f172a',
                letterSpacing: '-0.02em'
              }}
            >
              Portal de Administración
            </h1>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Gestión clínica, turnos y recepción · Sede Arroyito
            </p>
          </div>

          {/* ============================================================== */}
          {/* SECCIÓN DESTACADA: MESA DE ENTRADA & RECEPCIÓN */}
          {/* ============================================================== */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
              border: '1.5px solid #7dd3fc',
              borderRadius: '14px',
              padding: '0.85rem 1rem',
              marginBottom: '1rem',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: '#0284c7',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <UserCheck size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0369a1', lineHeight: 1.2 }}>
                    Mesa de Entrada & Recepción
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: 600 }}>
                    Romina Maidana · recepcion@citra.com.ar
                  </div>
                </div>
              </div>
              <span
                style={{
                  background: '#ffffff',
                  color: '#0369a1',
                  border: '1px solid #bae6fd',
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '100px'
                }}
              >
                Mesa Central
              </span>
            </div>

            <div style={{ fontSize: '0.72rem', color: '#334155', lineHeight: 1.45, margin: '0.35rem 0 0.65rem' }}>
              Recibe a los pacientes en sala y <strong>puede asignar y reprogramar turnos a todos los médicos</strong> de la clínica.
            </div>

            <button
              type="button"
              onClick={() => handleQuickLogin(receptionUser)}
              disabled={isLockedOut || loading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #0284c7 0%, #002182 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.55rem 0.85rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: isLockedOut ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isLockedOut) e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Sparkles size={14} color="#fef08a" />
              Ingresar como Recepción (Asignar Turnos a Todos los Médicos)
            </button>
          </div>

          {/* ============================================================== */}
          {/* ACORDEÓN: NÓMINA DE ESPECIALISTAS (13 PROFESIONALES) */}
          {/* ============================================================== */}
          <div
            style={{
              background: '#f8fafc',
              border: `1.5px solid ${isAccordionOpen ? '#93c5fd' : '#e2e8f0'}`,
              borderRadius: '14px',
              marginBottom: '1.25rem',
              overflow: 'hidden',
              transition: 'all 0.2s ease'
            }}
          >
            {/* Accordion Header Toggle */}
            <button
              type="button"
              onClick={() => setIsAccordionOpen(!isAccordionOpen)}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: '#eff6ff',
                    color: '#076abc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Stethoscope size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                    Nómina de Especialistas CITRA
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    13 profesionales activos · Aislamiento estricto de historias clínicas
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span
                  style={{
                    background: '#eff6ff',
                    color: '#076abc',
                    border: '1px solid #bfdbfe',
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '100px'
                  }}
                >
                  13 Médicos
                </span>
                {isAccordionOpen ? <ChevronUp size={16} color="#076abc" /> : <ChevronDown size={16} color="#64748b" />}
              </div>
            </button>

            {/* Accordion Expandable Content */}
            {isAccordionOpen && (
              <div
                style={{
                  borderTop: '1px solid #e2e8f0',
                  background: '#ffffff',
                  padding: '0.75rem 0.85rem'
                }}
              >
                {/* Search & Category Filter Pills */}
                <div style={{ marginBottom: '0.65rem' }}>
                  <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                    <Search
                      size={13}
                      style={{
                        position: 'absolute',
                        left: '9px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8'
                      }}
                    />
                    <input
                      type="text"
                      value={specialistSearch}
                      onChange={(e) => setSpecialistSearch(e.target.value)}
                      placeholder="Buscar por especialista o área..."
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '0.35rem 0.5rem 0.35rem 1.85rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.74rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                    {[
                      { id: 'all', label: 'Todos (13)' },
                      { id: 'trauma', label: 'Traumatología (3)' },
                      { id: 'kine', label: 'Kinesiología (3)' },
                      { id: 'especialidades', label: 'Otras Especialidades (7)' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSpecialistCategory(tab.id)}
                        style={{
                          background: specialistCategory === tab.id ? '#002182' : '#f1f5f9',
                          color: specialistCategory === tab.id ? '#ffffff' : '#475569',
                          border: 'none',
                          padding: '0.22rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.1s ease'
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notice on Isolation */}
                <div
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    padding: '0.45rem 0.6rem',
                    marginBottom: '0.65rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.68rem',
                    color: '#1e3a8a',
                    lineHeight: 1.35
                  }}
                >
                  <ShieldCheck size={14} color="#076abc" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Aislamiento Estricto:</strong> Cada especialista tiene información médica exclusiva. No comparten pacientes ni turnos entre sí.
                  </div>
                </div>

                {/* Specialist Scrollable List */}
                <div
                  className="specialist-scroll-area"
                  style={{
                    maxHeight: '230px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                    paddingRight: '0.2rem'
                  }}
                >
                  {filteredSpecialists.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', fontSize: '0.75rem' }}>
                      No se encontraron especialistas con ese criterio.
                    </div>
                  ) : (
                    filteredSpecialists.map((doc) => (
                      <div
                        key={doc.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.45rem 0.6rem',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          gap: '0.5rem'
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {doc.name}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#076abc', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {doc.specialty || doc.role}
                          </div>
                          <div style={{ fontSize: '0.64rem', color: '#94a3b8' }}>
                            {doc.email}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleQuickLogin(doc)}
                          disabled={isLockedOut || loading}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #bfdbfe',
                            color: '#002182',
                            padding: '0.35rem 0.65rem',
                            borderRadius: '8px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            cursor: isLockedOut ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            flexShrink: 0,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (!isLockedOut) {
                              e.currentTarget.style.background = '#002182';
                              e.currentTarget.style.color = '#ffffff';
                              e.currentTarget.style.borderColor = '#002182';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#ffffff';
                            e.currentTarget.style.color = '#002182';
                            e.currentTarget.style.borderColor = '#bfdbfe';
                          }}
                        >
                          Acceder
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Rate-Limiting Lockout Alert */}
          {isLockedOut && (
            <div
              style={{
                background: '#fef2f2',
                border: '1.5px solid #ef4444',
                color: '#991b1b',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                fontSize: '0.82rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
              }}
            >
              <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 800, marginBottom: '0.2rem' }}>
                  Bloqueo Preventivo de Seguridad Activado
                </div>
                <div style={{ lineHeight: 1.45 }}>
                  Por exceder 5 intentos fallidos y en cumplimiento de la Ley 25.326 de Protección de Datos de Salud, el acceso ha sido suspendido temporalmente.
                </div>
                <div
                  style={{
                    marginTop: '0.5rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: '#ffffff',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                    fontWeight: 800,
                    color: '#b91c1c',
                    border: '1px solid #fca5a5'
                  }}
                >
                  <Clock size={13} />
                  Reintente en: {lockoutRemainingSecs} segundos
                </div>
              </div>
            </div>
          )}

          {/* Regular Error Alert */}
          {errorMsg && !isLockedOut && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: '0.75rem 0.9rem',
                borderRadius: '12px',
                fontSize: '0.82rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}
            >
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              <div>{errorMsg}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.1rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  marginBottom: '0.35rem'
                }}
              >
                Correo Institucional o Usuario
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
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
                  disabled={isLockedOut || loading}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="recepcion@citra.com.ar"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '0.72rem 0.75rem 0.72rem 2.35rem',
                    borderRadius: '12px',
                    border: '1.5px solid #e2e8f0',
                    background: isLockedOut ? '#f1f5f9' : '#f8fafc',
                    fontSize: '0.88rem',
                    color: '#0f172a',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    cursor: isLockedOut ? 'not-allowed' : 'text'
                  }}
                  onFocus={(e) => {
                    if (!isLockedOut) {
                      e.target.style.borderColor = '#002182';
                      e.target.style.background = '#ffffff';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.background = isLockedOut ? '#f1f5f9' : '#f8fafc';
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '0.85rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  marginBottom: '0.35rem'
                }}
              >
                Contraseña Administrativa
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound
                  size={16}
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
                  disabled={isLockedOut || loading}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '0.72rem 2.5rem 0.72rem 2.35rem',
                    borderRadius: '12px',
                    border: '1.5px solid #e2e8f0',
                    background: isLockedOut ? '#f1f5f9' : '#f8fafc',
                    fontSize: '0.88rem',
                    color: '#0f172a',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    cursor: isLockedOut ? 'not-allowed' : 'text'
                  }}
                  onFocus={(e) => {
                    if (!isLockedOut) {
                      e.target.style.borderColor = '#002182';
                      e.target.style.background = '#ffffff';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.background = isLockedOut ? '#f1f5f9' : '#f8fafc';
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
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.15rem' }}>
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
                  fontSize: '0.78rem',
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
              disabled={isLockedOut || loading}
              style={{
                width: '100%',
                background: isLockedOut
                  ? '#94a3b8'
                  : 'linear-gradient(135deg, #002182 0%, #076abc 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: isLockedOut || loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: isLockedOut ? 'none' : '0 4px 14px rgba(0, 33, 130, 0.28)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isLockedOut && !loading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 33, 130, 0.38)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = isLockedOut ? 'none' : '0 4px 14px rgba(0, 33, 130, 0.28)';
              }}
            >
              <Lock size={16} />
              {isLockedOut
                ? `Bloqueado (${lockoutRemainingSecs}s)`
                : loading
                ? 'Verificando...'
                : 'Ingresar al Panel de Gestión'}
            </button>
          </form>

          {/* ============================================================== */}
          {/* SELLOS DE AUDITORÍA Y CIBERSEGURIDAD MÉDICA */}
          {/* ============================================================== */}
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid #f1f5f9'
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.5rem',
                marginBottom: '0.85rem'
              }}
            >
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.45rem',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#002182' }}>
                  TLS 1.3
                </div>
                <div style={{ fontSize: '0.6rem', color: '#64748b' }}>
                  Cifrado E2E
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.45rem',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#059669' }}>
                  Ley 25.326
                </div>
                <div style={{ fontSize: '0.6rem', color: '#64748b' }}>
                  Datos Protegidos
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.45rem',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#7c3aed' }}>
                  SHA-256
                </div>
                <div style={{ fontSize: '0.6rem', color: '#64748b' }}>
                  Audit Trail
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: '0.68rem',
                color: '#94a3b8',
                textAlign: 'center',
                lineHeight: 1.45
              }}
            >
              Portal exclusivo para personal médico y administrativo de CITRA Sede Arroyito. Todo intento de acceso no autorizado es registrado con trazabilidad de IP y dispositivo.
            </div>
          </div>
        </div>
      </div>

      {/* Password Recovery Modal */}
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
              Ingrese su correo institucional registrado. Se validará su identidad contra la nómina oficial de CITRA y se enviarán las instrucciones para restablecer su clave.
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
