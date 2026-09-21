import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  X,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';

export const UserAuthModal = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    loginPatient,
    registerPatient,
    healthInsurances,
    patients,
    resetUserPassword
  } = useClinic();

  // Bloquear scroll de fondo cuando el modal está abierto
  useEffect(() => {
    if (isAuthModalOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isAuthModalOpen]);

  // Login form state
  const [loginInput, setLoginInput] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Recovery form state
  const [recoverInput, setRecoverInput] = useState('');
  const [recoverMsg, setRecoverMsg] = useState('');
  const [recoverSuccess, setRecoverSuccess] = useState(false);
  const [recoverLoading, setRecoverLoading] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regDni, setRegDni] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regInsurance, setRegInsurance] = useState('OSDE');
  const [regInsuranceNumber, setRegInsuranceNumber] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginInput.trim() || !loginPassword.trim()) {
      setLoginError('Por favor ingresá tu DNI o Correo Electrónico y tu contraseña.');
      return;
    }

    const res = loginPatient(loginInput, loginPassword);
    if (!res.success) {
      setLoginError(res.message === 'Contraseña incorrecta' ? 'Contraseña incorrecta. Verificá tu clave o restablecela.' : 'Los datos ingresados no coinciden con ninguna cuenta.');
    }
  };

  const handleRecoverSubmit = async (e) => {
    e.preventDefault();
    setRecoverMsg('');
    if (!recoverInput.trim()) {
      setRecoverMsg('Por favor ingresá tu DNI o Correo Electrónico.');
      return;
    }
    setRecoverLoading(true);
    const res = await resetUserPassword(recoverInput);
    setRecoverLoading(false);
    if (res.success) {
      setRecoverSuccess(true);
      setRecoverMsg('Se han emitido las instrucciones de recuperación seguras.');
    } else {
      setRecoverSuccess(false);
      setRecoverMsg('No encontramos ninguna cuenta asociada a esos datos.');
    }
  };

  const handleQuickDemoLogin = () => {
    const demoPatient = patients[0] || { dni: '34892110', email: 'demo@citra.com.ar' };
    const dniVal = demoPatient.dni || '34892110';
    setLoginInput(dniVal);
    setLoginPassword('demo1234');
    loginPatient(dniVal, 'demo1234');
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim() || !regDni.trim() || !regEmail.trim()) {
      setRegError('Por favor completá los campos obligatorios (Nombre, DNI, Email).');
      return;
    }

    if (!regPassword.trim() || regPassword.length < 6) {
      setRegError('La contraseña de tu cuenta debe tener al menos 6 caracteres.');
      return;
    }

    const cleanDni = regDni.trim().replace(/\./g, '');
    const exists = patients.some((p) => (p.dni || '').replace(/\./g, '') === cleanDni);
    if (exists) {
      setRegError('Ya existe una cuenta con este DNI. Por favor iniciá sesión.');
      return;
    }

    registerPatient({
      name: regName.trim(),
      dni: regDni.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim() || '',
      insuranceName: regInsurance,
      insurancePlan: regInsurance === 'Particular' ? 'Sin cobertura' : 'Plan Estándar',
      insuranceNumber: regInsuranceNumber.trim() || '',
      password: regPassword.trim(),
      bloodType: 'N/E',
      allergies: []
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 21, 86, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={() => setIsAuthModalOpen(false)}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '94vh',
          overflowY: 'auto',
          boxShadow: '0 24px 60px rgba(0, 21, 86, 0.35)',
          border: '1px solid #D2E3FC',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado Superior con Identidad Institucional */}
        <div
          style={{
            background: 'linear-gradient(135deg, #001556 0%, #002182 100%)',
            padding: '1.5rem 1.75rem 1.25rem',
            color: '#ffffff',
            borderTopLeftRadius: '19px',
            borderTopRightRadius: '19px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Luz ambiental sutil */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '-40%',
              right: '-20%',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 240, 255, 0.2) 0%, transparent 70%)',
              filter: 'blur(30px)',
              pointerEvents: 'none'
            }}
          />

          {/* Botón Cerrar */}
          <button
            onClick={() => setIsAuthModalOpen(false)}
            aria-label="Cerrar modal"
            style={{
              position: 'absolute',
              top: '1.1rem',
              right: '1.1rem',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <X size={18} />
          </button>

          {/* Logo y Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
            <div
              style={{
                background: '#ffffff',
                padding: '0.35rem 0.65rem',
                borderRadius: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
              }}
            >
              <img
                src="/citra-logo.png"
                alt="CITRA"
                style={{ height: '28px', maxWidth: '120px', objectFit: 'contain', display: 'block' }}
              />
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'rgba(37, 124, 230, 0.22)',
                border: '1px solid rgba(142, 190, 245, 0.35)',
                padding: '0.25rem 0.65rem',
                borderRadius: '100px',
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#D2E3FC',
                letterSpacing: '0.04em'
              }}
            >
              <ShieldCheck size={13} color="#38BDF8" />
              PORTAL DEL PACIENTE
            </div>
          </div>

          <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.35rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#ffffff' }}>
            {authModalTab === 'login' ? 'Iniciar Sesión' : 'Registro de Paciente'}
          </h2>
          <p style={{ margin: 0, fontSize: '0.84rem', color: '#BFDBFE', lineHeight: 1.4 }}>
            {authModalTab === 'login'
              ? 'Accedé a tu cuenta para gestionar turnos y estudios.'
              : 'Completá tus datos para agendar consultas en menos de 1 minuto.'}
          </p>

          {/* Selector de Pestañas (Tabs) */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '4px',
              marginTop: '1.1rem',
              gap: '4px'
            }}
          >
            <button
              type="button"
              onClick={() => { setAuthModalTab('login'); setLoginError(''); }}
              style={{
                flex: 1,
                padding: '0.55rem 0.5rem',
                borderRadius: '8px',
                border: 'none',
                background: authModalTab === 'login' ? '#ffffff' : 'transparent',
                color: authModalTab === 'login' ? '#002182' : '#ffffff',
                fontWeight: 800,
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease',
                boxShadow: authModalTab === 'login' ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none'
              }}
            >
              <LogIn size={15} />
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setAuthModalTab('register'); setRegError(''); }}
              style={{
                flex: 1,
                padding: '0.55rem 0.5rem',
                borderRadius: '8px',
                border: 'none',
                background: authModalTab === 'register' ? '#ffffff' : 'transparent',
                color: authModalTab === 'register' ? '#002182' : '#ffffff',
                fontWeight: 800,
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease',
                boxShadow: authModalTab === 'register' ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none'
              }}
            >
              <UserPlus size={15} />
              Crear Cuenta
            </button>
          </div>
        </div>

        {/* Cuerpo del Formulario */}
        <div style={{ padding: '1.5rem 1.75rem 1.75rem' }}>
          {authModalTab === 'recover' ? (
            <form onSubmit={handleRecoverSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ margin: '0 0 0.35rem', color: '#002182', fontSize: '1.15rem', fontWeight: 800 }}>
                  Recuperación de Contraseña
                </h4>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b', lineHeight: 1.5 }}>
                  Ingresá tu DNI o Correo Electrónico asociado a tu ficha de paciente. Te enviaremos las instrucciones de acceso seguro.
                </p>
              </div>

              {recoverMsg && (
                <div
                  style={{
                    background: recoverSuccess ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${recoverSuccess ? '#86efac' : '#fecaca'}`,
                    color: recoverSuccess ? '#166534' : '#991b1b',
                    padding: '0.75rem 0.95rem',
                    borderRadius: '10px',
                    fontSize: '0.84rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem'
                  }}
                >
                  <CheckCircle2 size={17} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <div>{recoverMsg}</div>
                </div>
              )}

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                  DNI o Correo Electrónico
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#7994B8' }} />
                  <input
                    type="text"
                    required
                    value={recoverInput}
                    onChange={(e) => setRecoverInput(e.target.value)}
                    placeholder="Ej: 34892110 o paciente@gmail.com"
                    style={{
                      width: '100%',
                      padding: '0.72rem 0.85rem 0.72rem 2.45rem',
                      borderRadius: '10px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.88rem',
                      color: '#002182',
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={recoverLoading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #257CE6 0%, #076ABC 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: recoverLoading ? 'not-allowed' : 'pointer',
                  marginBottom: '0.75rem',
                  boxShadow: '0 4px 14px rgba(7, 106, 188, 0.3)'
                }}
              >
                {recoverLoading ? 'Enviando...' : 'Restablecer Clave'}
              </button>

              <button
                type="button"
                onClick={() => setAuthModalTab('login')}
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  border: '1px solid #D2E3FC',
                  color: '#002182',
                  padding: '0.7rem',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}
              >
                Volver al Inicio de Sesión
              </button>
            </form>
          ) : authModalTab === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              {loginError && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    padding: '0.75rem 0.95rem',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    lineHeight: 1.4
                  }}
                >
                  <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <div>{loginError}</div>
                </div>
              )}

              {/* Campo DNI o Email */}
              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                  DNI o Correo Electrónico
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#7994B8' }} />
                  <input
                    type="text"
                    required
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder="Ingresá tu DNI o email"
                    style={{
                      width: '100%',
                      padding: '0.72rem 0.85rem 0.72rem 2.45rem',
                      borderRadius: '10px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.88rem',
                      color: '#002182',
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#076ABC')}
                    onBlur={(e) => (e.target.style.borderColor = '#D2E3FC')}
                  />
                </div>
              </div>

              {/* Campo Contraseña con Toggle de Ver/Ocultar */}
              <div style={{ marginBottom: '1.35rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#002182' }}>
                    Contraseña
                  </label>
                  <span
                    onClick={() => { setAuthModalTab('recover'); setRecoverMsg(''); setRecoverSuccess(false); }}
                    style={{ fontSize: '0.75rem', color: '#076ABC', fontWeight: 700, cursor: 'pointer' }}
                  >
                    ¿Olvidaste tu clave?
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#7994B8' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Ingresá tu contraseña"
                    style={{
                      width: '100%',
                      padding: '0.72rem 2.5rem 0.72rem 2.45rem',
                      borderRadius: '10px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.88rem',
                      color: '#002182',
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#076ABC')}
                    onBlur={(e) => (e.target.style.borderColor = '#D2E3FC')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Ver contraseña"
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#7994B8',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Botón Principal de Inicio de Sesión */}
              <button
                type="submit"
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #257CE6 0%, #076ABC 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(7, 106, 188, 0.3)',
                  minHeight: '46px',
                  transition: 'all 0.2s ease'
                }}
              >
                <LogIn size={18} />
                Ingresar a Mi Cuenta
              </button>

              {/* Enlace para cambiar a Registro */}
              <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.84rem', color: '#496386' }}>
                ¿Primera vez en CITRA?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthModalTab('register'); setRegError(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#076ABC',
                    fontWeight: 800,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Registrate aquí
                </button>
              </div>

              {/* Botón Sutil de Acceso Rápido Demo (Sin datos verídicos falsos) */}
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #EDF3FD', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  style={{
                    background: '#F8FAFD',
                    border: '1px solid #D2E3FC',
                    color: '#076ABC',
                    padding: '0.45rem 0.95rem',
                    borderRadius: '100px',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Sparkles size={13} color="#076ABC" />
                  Acceso rápido de prueba (Demo)
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              {regError && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    padding: '0.75rem 0.95rem',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    marginBottom: '1.15rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    lineHeight: 1.4
                  }}
                >
                  <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <div>{regError}</div>
                </div>
              )}

              {/* Nombre Completo */}
              <div style={{ marginBottom: '0.9rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.3rem' }}>
                  Nombre Completo *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#7994B8' }} />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Nombre y apellido"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                      borderRadius: '10px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.85rem',
                      color: '#002182',
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* DNI y Teléfono */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem', marginBottom: '0.9rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.3rem' }}>
                    DNI *
                  </label>
                  <input
                    type="text"
                    required
                    value={regDni}
                    onChange={(e) => setRegDni(e.target.value)}
                    placeholder="Número de documento (sin puntos)"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '10px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.85rem',
                      color: '#002182',
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.3rem' }}>
                    Teléfono / WhatsApp *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#7994B8' }} />
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="Cód. área y número"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                        borderRadius: '10px',
                        border: '1.5px solid #D2E3FC',
                        fontSize: '0.85rem',
                        color: '#002182',
                        fontWeight: 600,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Correo Electrónico */}
              <div style={{ marginBottom: '0.9rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.3rem' }}>
                  Correo Electrónico *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#7994B8' }} />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="nombre@correo.com"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                      borderRadius: '10px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.85rem',
                      color: '#002182',
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Obra Social y N° de Afiliado */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem', marginBottom: '0.9rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.3rem' }}>
                    Obra Social o Prepaga
                  </label>
                  <select
                    value={regInsurance}
                    onChange={(e) => setRegInsurance(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '10px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.85rem',
                      color: '#002182',
                      fontWeight: 600,
                      outline: 'none',
                      background: '#ffffff',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Particular">Particular (Sin Obra Social)</option>
                    {healthInsurances.map((hi) => (
                      <option key={hi.id} value={hi.name}>
                        {hi.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.3rem' }}>
                    N° de Afiliado
                  </label>
                  <div style={{ position: 'relative' }}>
                    <CreditCard size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#7994B8' }} />
                    <input
                      type="text"
                      value={regInsuranceNumber}
                      onChange={(e) => setRegInsuranceNumber(e.target.value)}
                      placeholder="Número de credencial (opcional)"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                        borderRadius: '10px',
                        border: '1.5px solid #D2E3FC',
                        fontSize: '0.85rem',
                        color: '#002182',
                        fontWeight: 600,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Contraseña con Toggle */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.3rem' }}>
                  Crear Contraseña *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#7994B8' }} />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    style={{
                      width: '100%',
                      padding: '0.65rem 2.5rem 0.65rem 2.25rem',
                      borderRadius: '10px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.85rem',
                      color: '#002182',
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    aria-label="Ver contraseña"
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#7994B8',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Botón Submit Registro */}
              <button
                type="submit"
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #257CE6 0%, #076ABC 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(7, 106, 188, 0.3)',
                  minHeight: '46px',
                  transition: 'all 0.2s ease'
                }}
              >
                <CheckCircle2 size={18} />
                Completar Registro y Continuar
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.15rem', fontSize: '0.84rem', color: '#496386' }}>
                ¿Ya tenés cuenta?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthModalTab('login'); setLoginError(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#076ABC',
                    fontWeight: 800,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Iniciá sesión aquí
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
