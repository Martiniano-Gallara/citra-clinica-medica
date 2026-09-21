import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { QRCodeSVG } from 'qrcode.react';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  CreditCard,
  Printer,
  CalendarCheck,
  Sparkles,
  MapPin,
  AlertCircle,
  ShieldCheck,
  Check,
  Sun,
  Moon,
  Activity,
  Dumbbell,
  ScanLine,
  Layers,
  HeartPulse,
  Brain,
  Zap
} from 'lucide-react';

const DEFAULT_DOCTOR_AVATAR = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80';

export const AppointmentBookingWizard = () => {
  const {
    specialties,
    doctors,
    appointments,
    addAppointment,
    healthInsurances,
    clinicSchedule,
    authRole,
    authPatient,
    setCurrentView,
    bookingPreselectedSpecialty,
    bookingPreselectedDoctor,
    setBookingPreselectedSpecialty,
    setBookingPreselectedDoctor,
    setIsAuthModalOpen,
    setAuthModalTab,
    addToast
  } = useClinic();

  // Wizard Steps: 1 (Especialidad), 2 (Profesional), 3 (Fecha & Horario), 4 (Datos), 5 (Confirmado)
  const [currentStep, setCurrentStep] = useState(1);
  const [specialtyCategoryFilter, setSpecialtyCategoryFilter] = useState('all');

  // Selection states
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Patient info states
  const [patientName, setPatientName] = useState('');
  const [patientDni, setPatientDni] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientInsurance, setPatientInsurance] = useState('OSDE');
  const [patientInsuranceNumber, setPatientInsuranceNumber] = useState('');
  const [consultationReason, setConsultationReason] = useState('');

  // Created appointment result
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);

  // Pre-selection initialization from external triggers
  useEffect(() => {
    if (bookingPreselectedSpecialty) {
      const spec = specialties.find((s) => s.id === bookingPreselectedSpecialty);
      if (spec) setSelectedSpecialty(spec);
    }
    if (bookingPreselectedDoctor) {
      const doc = doctors.find((d) => d.id === bookingPreselectedDoctor);
      if (doc) {
        setSelectedDoctor(doc);
        const spec = specialties.find((s) => s.id === doc.specialtyId || s.name === doc.specialty);
        if (spec) setSelectedSpecialty(spec);
        setCurrentStep(2);
      }
    }
  }, [bookingPreselectedSpecialty, bookingPreselectedDoctor, specialties, doctors]);

  // Autofill patient info if logged in as patient
  useEffect(() => {
    if (authPatient) {
      setPatientName(authPatient.name || '');
      setPatientDni(authPatient.dni || '');
      setPatientPhone(authPatient.phone || '');
      setPatientEmail(authPatient.email || '');
      setPatientInsurance(authPatient.insuranceName || 'OSDE');
      setPatientInsuranceNumber(authPatient.insuranceNumber || '');
    }
  }, [authPatient]);

  // Nombres de días en español
  const SPANISH_DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  // Generate available dates respecting doctor and clinic working days & blocked dates
  const availableDates = React.useMemo(() => {
    const dates = [];
    const today = new Date();
    const globalBlocked = clinicSchedule?.blockedDates || ['2026-12-25', '2027-01-01'];
    const docBlocked = selectedDoctor?.blockedDates || [];
    const allowedDays = (selectedDoctor && selectedDoctor.id !== 'any' && selectedDoctor.workingDays)
      ? selectedDoctor.workingDays
      : clinicSchedule?.workingDays || ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    for (let i = 1; i <= 21; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayOfWeekIndex = d.getDay();
      const dayNameFull = SPANISH_DAYS[dayOfWeekIndex];

      // Exclude non-working days
      if (dayOfWeekIndex === 0 || !allowedDays.includes(dayNameFull)) {
        continue;
      }

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      // Exclude blocked dates
      if (globalBlocked.includes(dateStr) || docBlocked.includes(dateStr)) {
        continue;
      }

      const dayShort = d.toLocaleDateString('es-AR', { weekday: 'short' });
      const monthShort = d.toLocaleDateString('es-AR', { month: 'short' });
      dates.push({
        dateStr,
        dayNumber: dd,
        dayName: dayShort.replace('.', '').toUpperCase(),
        monthName: monthShort.replace('.', '').toUpperCase()
      });

      if (dates.length >= 14) break;
    }
    return dates;
  }, [clinicSchedule, selectedDoctor]);

  // Set first date as default if current selection is invalid
  useEffect(() => {
    if (availableDates.length > 0) {
      if (!selectedDate || !availableDates.some((ad) => ad.dateStr === selectedDate)) {
        setSelectedDate(availableDates[0].dateStr);
      }
    }
  }, [availableDates, selectedDate]);

  // Generate available time slots based on doctor's schedule or general slots
  const generateTimeSlots = () => {
    const slots = [];
    const startTime = selectedDoctor?.scheduleStart || '08:00';
    const endTime = selectedDoctor?.scheduleEnd || '19:30';
    const intervalMinutes = selectedDoctor?.slotDuration || 30;

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    let currentMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;

    const occupiedTimes = appointments
      .filter((a) => {
        if (a.date !== selectedDate || a.status === 'cancelado') return false;
        if (selectedDoctor && selectedDoctor.id !== 'any') {
          return a.doctorId === selectedDoctor.id;
        }
        return false;
      })
      .map((a) => a.time);

    while (currentMin < endMin) {
      const h = Math.floor(currentMin / 60);
      const m = currentMin % 60;
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const isOccupied = occupiedTimes.includes(timeStr);
      slots.push({ time: timeStr, isOccupied, hour: h });
      currentMin += intervalMinutes;
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();
  const morningSlots = timeSlots.filter((s) => s.hour < 13);
  const afternoonSlots = timeSlots.filter((s) => s.hour >= 13);

  // Doctors matching selected specialty
  const filteredDoctors = selectedSpecialty
    ? doctors.filter((d) =>
        d.specialtyId === selectedSpecialty.id ||
        d.specialty === selectedSpecialty.name ||
        (Array.isArray(d.specialtyIds) && d.specialtyIds.includes(selectedSpecialty.id)) ||
        (d.specialty && selectedSpecialty.name && d.specialty.toLowerCase().includes(selectedSpecialty.name.toLowerCase()))
      )
    : doctors;

  // Specialty category filter
  const filteredSpecialties = specialties.filter((s) => {
    if (specialtyCategoryFilter === 'all') return true;
    if (specialtyCategoryFilter === 'medicas') {
      return ['esp-1', 'esp-2', 'esp-3', 'esp-4', 'esp-14'].includes(s.id);
    }
    if (specialtyCategoryFilter === 'kinesio') {
      return ['esp-5', 'esp-6', 'esp-7', 'esp-8', 'esp-9'].includes(s.id);
    }
    if (specialtyCategoryFilter === 'diagnostico') {
      return ['esp-10', 'esp-11', 'esp-12', 'esp-13'].includes(s.id);
    }
    return true;
  });

  const getSpecialtyIconComponent = (spec) => {
    const n = (spec.name || '').toLowerCase();
    if (n.includes('trauma')) return Stethoscope;
    if (n.includes('neuro')) return Brain;
    if (n.includes('reuma')) return Activity;
    if (n.includes('nutri')) return HeartPulse;
    if (n.includes('kinesio')) return Dumbbell;
    if (n.includes('fisio')) return Zap;
    if (n.includes('osteo')) return Layers;
    if (n.includes('radio') || n.includes('rayos')) return ScanLine;
    if (n.includes('pisada')) return Activity;
    if (n.includes('ozono') || n.includes('estética')) return Sparkles;
    return Stethoscope;
  };

  // Handle finalize booking
  const handleConfirmBooking = (e) => {
    e.preventDefault();

    if (!patientName.trim() || !patientDni.trim() || !patientEmail.trim()) {
      addToast('Datos requeridos', 'Completá tu nombre, DNI y correo electrónico.', 'warning');
      return;
    }

    const assignedDoctor = selectedDoctor && selectedDoctor.id !== 'any'
      ? selectedDoctor
      : filteredDoctors[0] || doctors[0];

    const newAppointmentData = {
      patientId: authPatient ? authPatient.id : `pat-temp-${Date.now()}`,
      patientName: patientName.trim(),
      patientDni: patientDni.trim(),
      patientPhone: patientPhone.trim() || '+54 9 3576 000-000',
      patientEmail: patientEmail.trim(),
      patientInsurance: patientInsurance,
      patientInsuranceNumber: patientInsuranceNumber.trim() || '',
      insuranceName: patientInsurance,
      insurancePlan: 'Plan Estándar',
      doctorId: assignedDoctor.id,
      doctorName: assignedDoctor.name,
      doctorSpecialty: selectedSpecialty ? selectedSpecialty.name : assignedDoctor.specialty,
      specialtyId: selectedSpecialty?.id || assignedDoctor.specialtyId,
      specialtyName: selectedSpecialty?.name || assignedDoctor.specialty,
      roomId: assignedDoctor.roomId || 'room-101',
      roomName: assignedDoctor.roomName || 'Consultorio 101',
      date: selectedDate,
      time: selectedTime || '09:00',
      duration: selectedSpecialty?.estimatedDuration || 30,
      type: 'Consulta Presencial',
      status: 'confirmado',
      reason: consultationReason.trim() || 'Consulta médica general',
      copayAmount: patientInsurance === 'Particular' ? 25000 : 0,
      bookedOnline: true,
      bookingCode: `CITRA-${Math.floor(10000 + Math.random() * 90000)}`
    };

    const created = addAppointment(newAppointmentData);
    setConfirmedAppointment(created);
    setCurrentStep(5);
  };

  const handlePrint = () => {
    window.print();
  };

  const stepNames = [
    'Especialidad',
    'Profesional',
    'Fecha y Horario',
    'Tus Datos'
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F5F8FE',
        padding: '1.75rem 1.25rem 4rem'
      }}
    >
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Top Navigation Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setCurrentView('home')}
            style={{
              background: '#ffffff',
              border: '1.5px solid #D2E3FC',
              color: '#002182',
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              fontSize: '0.84rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 33, 130, 0.04)',
              transition: 'all 0.15s ease'
            }}
          >
            <ArrowLeft size={16} />
            Volver a la Web Institucional
          </button>

          {!authPatient && (
            <div style={{ fontSize: '0.82rem', color: '#496386' }}>
              ¿Ya tenés cuenta en CITRA?{' '}
              <button
                onClick={() => { setAuthModalTab('login'); setIsAuthModalOpen(true); }}
                style={{ background: 'none', border: 'none', color: '#076ABC', fontWeight: 800, cursor: 'pointer', padding: 0 }}
              >
                Iniciá sesión aquí
              </button>
            </div>
          )}
        </div>

        {/* Wizard Card Container */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '24px',
            border: '1.5px solid #D2E3FC',
            boxShadow: '0 12px 36px rgba(0, 33, 130, 0.07)',
            overflow: 'hidden'
          }}
        >
          {/* Header Banner — Rediseño Elevado con Atmósfera Tech */}
          <div
            style={{
              background: 'linear-gradient(135deg, #001556 0%, #002182 100%)',
              color: '#ffffff',
              padding: '1.75rem 2rem 1.5rem',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '-50%',
                right: '-15%',
                width: '320px',
                height: '320px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0, 240, 255, 0.18) 0%, transparent 70%)',
                filter: 'blur(40px)',
                pointerEvents: 'none'
              }}
            />

            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Badge del Sistema */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'rgba(37, 124, 230, 0.22)',
                  border: '1px solid rgba(142, 190, 245, 0.35)',
                  color: '#D2E3FC',
                  padding: '0.28rem 0.75rem',
                  borderRadius: '100px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  marginBottom: '0.65rem'
                }}
              >
                <Calendar size={13} color="#38BDF8" />
                <span>CITRA · SISTEMA DE TURNOS ONLINE</span>
              </div>

              {/* Título Dinámico del Paso */}
              <h1 style={{ margin: '0 0 0.35rem', fontSize: 'clamp(1.35rem, 3.5vw, 1.85rem)', fontWeight: 900, letterSpacing: '-0.02em', color: '#ffffff' }}>
                {currentStep === 1 && '1. Seleccioná la Especialidad'}
                {currentStep === 2 && '2. Seleccioná el Profesional Médico'}
                {currentStep === 3 && '3. Elegí la Fecha y el Horario'}
                {currentStep === 4 && '4. Completá tus Datos de Contacto'}
                {currentStep === 5 && '¡Turno Confirmado con Éxito!'}
              </h1>

              <p style={{ margin: 0, fontSize: '0.86rem', color: '#BFDBFE', maxWidth: '640px', lineHeight: 1.4 }}>
                {currentStep === 1 && 'Elegí el servicio médico o área de rehabilitación para la cual solicitás atención.'}
                {currentStep === 2 && 'Elegí a tu especialista de preferencia o seleccioná el primer turno disponible.'}
                {currentStep === 3 && 'Seleccioná el día y horario que mejor se adapte a tu agenda.'}
                {currentStep === 4 && 'Ingresá tu información para generar el comprobante oficial de turno.'}
                {currentStep === 5 && 'Guardá o imprimí tu comprobante con código QR de acceso a recepción.'}
              </p>

              {/* Stepper Responsivo (Segmentos en Desktop, Barra de Progreso Continua en Mobile) */}
              {currentStep < 5 && (
                <div style={{ marginTop: '1.35rem' }}>
                  {/* Vista Desktop: 4 Cápsulas de Paso */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      flexWrap: 'wrap'
                    }}
                  >
                    {[1, 2, 3, 4].map((stepNum) => {
                      const isActive = currentStep === stepNum;
                      const isDone = currentStep > stepNum;
                      return (
                        <div key={stepNum} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <div
                            onClick={() => { if (isDone) setCurrentStep(stepNum); }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              background: isActive ? '#ffffff' : isDone ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                              color: isActive ? '#002182' : isDone ? '#A7F3D0' : '#D2E3FC',
                              border: isActive ? '1px solid #ffffff' : isDone ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(255, 255, 255, 0.18)',
                              padding: '0.3rem 0.75rem',
                              borderRadius: '100px',
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              cursor: isDone ? 'pointer' : 'default',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span>{isDone ? <Check size={11} style={{ verticalAlign: '-1px' }} /> : stepNum}</span>
                            <span>{stepNames[stepNum - 1]}</span>
                          </div>
                          {stepNum < 4 && (
                            <div
                              style={{
                                width: '14px',
                                height: '2px',
                                background: isDone ? '#34D399' : 'rgba(255, 255, 255, 0.25)'
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Barra de Progreso Visual */}
                  <div
                    style={{
                      width: '100%',
                      height: '4px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      marginTop: '0.85rem',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: `${((currentStep - 1) / 3) * 100}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #38BDF8 0%, #34D399 100%)',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Wizard Content Body */}
          <div style={{ padding: '2rem 1.75rem 2.5rem' }}>
            
            {/* ================= STEP 1: Selección de Especialidad ================= */}
            {currentStep === 1 && (
              <div>
                {/* Categorías de Filtro Rápido */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    overflowX: 'auto',
                    paddingBottom: '0.5rem',
                    marginBottom: '1.35rem',
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none'
                  }}
                >
                  {[
                    { id: 'all', label: 'Todas las Especialidades' },
                    { id: 'medicas', label: 'Consultas Médicas' },
                    { id: 'kinesio', label: 'Kinesiología & Rehabilitación' },
                    { id: 'diagnostico', label: 'Diagnóstico & Terapias' }
                  ].map((tab) => {
                    const isTabActive = specialtyCategoryFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSpecialtyCategoryFilter(tab.id)}
                        style={{
                          background: isTabActive ? '#076ABC' : '#F5F8FE',
                          color: isTabActive ? '#ffffff' : '#002182',
                          border: isTabActive ? '1.5px solid #076ABC' : '1.5px solid #D2E3FC',
                          padding: '0.4rem 0.85rem',
                          borderRadius: '100px',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Grilla de Especialidades */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.9rem' }}>
                  {filteredSpecialties.map((spec) => {
                    const isSelected = selectedSpecialty?.id === spec.id;
                    const IconComponent = getSpecialtyIconComponent(spec);

                    return (
                      <div
                        key={spec.id}
                        onClick={() => setSelectedSpecialty(spec)}
                        style={{
                          background: isSelected ? '#EFF6FF' : '#ffffff',
                          border: isSelected ? '2px solid #076ABC' : '1.5px solid #DCE7F7',
                          borderRadius: '16px',
                          padding: '1.15rem 1.1rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                          boxShadow: isSelected ? '0 8px 20px rgba(7, 106, 188, 0.15)' : '0 2px 6px rgba(0, 33, 130, 0.02)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                            <div
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '11px',
                                background: isSelected ? '#076ABC' : '#EBF3FD',
                                color: isSelected ? '#ffffff' : '#076ABC',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              <IconComponent size={20} />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  background: '#F1F5F9',
                                  color: '#475569',
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '6px'
                                }}
                              >
                                {spec.estimatedDuration || 30} min
                              </span>
                              {isSelected && <CheckCircle2 size={20} color="#076ABC" />}
                            </div>
                          </div>

                          <h4 style={{ margin: '0 0 0.3rem', fontSize: '0.98rem', fontWeight: 900, color: '#002182' }}>
                            {spec.name}
                          </h4>
                          <p style={{ margin: 0, fontSize: '0.78rem', color: '#496386', lineHeight: 1.4 }}>
                            {spec.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Botón de Continuar */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                  <button
                    disabled={!selectedSpecialty}
                    onClick={() => setCurrentStep(2)}
                    style={{
                      background: selectedSpecialty ? 'linear-gradient(135deg, #257CE6 0%, #076ABC 100%)' : '#D2E3FC',
                      color: selectedSpecialty ? '#ffffff' : '#7994B8',
                      border: 'none',
                      padding: '0.85rem 1.6rem',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      cursor: selectedSpecialty ? 'pointer' : 'not-allowed',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: selectedSpecialty ? '0 4px 14px rgba(7, 106, 188, 0.3)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>Continuar a Selección de Médico</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 2: Selección de Profesional ================= */}
            {currentStep === 2 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#002182' }}>
                    Especialistas disponibles en {selectedSpecialty?.name}
                  </h3>
                  <button
                    onClick={() => setCurrentStep(1)}
                    style={{
                      background: '#EBF3FD',
                      border: '1px solid #D2E3FC',
                      color: '#076ABC',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Cambiar Especialidad
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '0.9rem' }}>
                  {/* Tarjeta de Primer Turno Disponible */}
                  <div
                    onClick={() => setSelectedDoctor({ id: 'any', name: 'Primer profesional disponible', specialty: selectedSpecialty?.name })}
                    style={{
                      background: selectedDoctor?.id === 'any' ? '#EFF6FF' : '#F9FBFE',
                      border: selectedDoctor?.id === 'any' ? '2px solid #076ABC' : '1.5px solid #D2E3FC',
                      borderRadius: '16px',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      transition: 'all 0.2s ease',
                      boxShadow: selectedDoctor?.id === 'any' ? '0 6px 18px rgba(7, 106, 188, 0.15)' : 'none'
                    }}
                  >
                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        flexShrink: 0
                      }}
                    >
                      <Sparkles size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Sparkles size={11} /> MÁS RÁPIDO
                      </div>
                      <h4 style={{ margin: '0 0 0.15rem', fontSize: '0.95rem', fontWeight: 900, color: '#002182' }}>
                        Primer turno disponible
                      </h4>
                      <div style={{ fontSize: '0.74rem', color: '#496386' }}>
                        Cualquier especialista colegiado
                      </div>
                    </div>
                    {selectedDoctor?.id === 'any' && <CheckCircle2 size={20} color="#076ABC" />}
                  </div>

                  {/* Médicos de la Especialidad */}
                  {filteredDoctors.map((doc) => {
                    const isSelected = selectedDoctor?.id === doc.id;
                    return (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDoctor(doc)}
                        style={{
                          background: isSelected ? '#EFF6FF' : '#ffffff',
                          border: isSelected ? '2px solid #076ABC' : '1.5px solid #DCE7F7',
                          borderRadius: '16px',
                          padding: '1.1rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.85rem',
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? '0 6px 18px rgba(7, 106, 188, 0.15)' : '0 2px 6px rgba(0, 33, 130, 0.02)'
                        }}
                      >
                        <img
                          src={doc.avatar || DEFAULT_DOCTOR_AVATAR}
                          alt={doc.name}
                          onError={(e) => { e.currentTarget.src = DEFAULT_DOCTOR_AVATAR; }}
                          style={{
                            width: '54px',
                            height: '54px',
                            borderRadius: '14px',
                            objectFit: 'cover',
                            flexShrink: 0,
                            border: '1.5px solid #D2E3FC'
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ margin: '0 0 0.2rem', fontSize: '0.94rem', fontWeight: 900, color: '#002182', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {doc.name}
                          </h4>
                          <div style={{ fontSize: '0.74rem', color: '#076ABC', fontWeight: 700 }}>
                            {doc.specialty}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#7994B8', marginTop: '2px' }}>
                            {doc.roomName || 'Consultorios CITRA'}
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 size={20} color="#076ABC" />}
                      </div>
                    );
                  })}
                </div>

                {/* Botones de Navegación */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <button
                    onClick={() => setCurrentStep(1)}
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid #D2E3FC',
                      color: '#002182',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <ChevronLeft size={16} />
                    Atrás
                  </button>

                  <button
                    disabled={!selectedDoctor}
                    onClick={() => setCurrentStep(3)}
                    style={{
                      background: selectedDoctor ? 'linear-gradient(135deg, #257CE6 0%, #076ABC 100%)' : '#D2E3FC',
                      color: selectedDoctor ? '#ffffff' : '#7994B8',
                      border: 'none',
                      padding: '0.85rem 1.6rem',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      cursor: selectedDoctor ? 'pointer' : 'not-allowed',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: selectedDoctor ? '0 4px 14px rgba(7, 106, 188, 0.3)' : 'none'
                    }}
                  >
                    <span>Continuar a Fecha y Horario</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 3: Selección de Fecha y Horario ================= */}
            {currentStep === 3 && (
              <div>
                <div style={{ marginBottom: '1.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#002182', marginBottom: '0.65rem' }}>
                    1. Elegí el Día de Atención
                  </label>

                  {/* Carrusel de Días Disponibles */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.65rem',
                      overflowX: 'auto',
                      paddingBottom: '0.75rem',
                      WebkitOverflowScrolling: 'touch',
                      scrollbarWidth: 'none'
                    }}
                  >
                    {availableDates.map((item) => {
                      const isSelected = selectedDate === item.dateStr;
                      return (
                        <div
                          key={item.dateStr}
                          onClick={() => { setSelectedDate(item.dateStr); setSelectedTime(''); }}
                          style={{
                            minWidth: '80px',
                            background: isSelected ? 'linear-gradient(135deg, #001556 0%, #002182 100%)' : '#ffffff',
                            color: isSelected ? '#ffffff' : '#002182',
                            border: isSelected ? '2px solid #076ABC' : '1.5px solid #D2E3FC',
                            borderRadius: '14px',
                            padding: '0.85rem 0.5rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            boxShadow: isSelected ? '0 6px 16px rgba(0, 33, 130, 0.25)' : '0 2px 6px rgba(0, 33, 130, 0.02)',
                            flexShrink: 0
                          }}
                        >
                          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 800, opacity: isSelected ? 0.9 : 0.65 }}>
                            {item.dayName}
                          </div>
                          <div style={{ fontSize: '1.45rem', fontWeight: 900, margin: '2px 0', lineHeight: 1.1 }}>
                            {item.dayNumber}
                          </div>
                          <div style={{ fontSize: '0.68rem', fontWeight: 700, opacity: isSelected ? 0.9 : 0.65 }}>
                            {item.monthName}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selección de Horarios por Turnos (Mañana y Tarde) */}
                <div style={{ marginBottom: '2.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#002182', marginBottom: '0.75rem' }}>
                    2. Elegí el Horario Disponible para el {selectedDate}
                  </label>

                  {/* Turno Mañana */}
                  {morningSlots.length > 0 && (
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', fontWeight: 800, color: '#076ABC', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                        <Sun size={14} />
                        <span>Turno Mañana (08:00 a 13:00 hs)</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))', gap: '0.6rem' }}>
                        {morningSlots.map((slot) => {
                          const isSelected = selectedTime === slot.time;
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={slot.isOccupied}
                              onClick={() => setSelectedTime(slot.time)}
                              style={{
                                background: isSelected ? '#002182' : slot.isOccupied ? '#F1F5F9' : '#ffffff',
                                color: isSelected ? '#ffffff' : slot.isOccupied ? '#94A3B8' : '#002182',
                                border: isSelected ? '2px solid #002182' : '1.5px solid #D2E3FC',
                                padding: '0.65rem 0.4rem',
                                borderRadius: '10px',
                                fontSize: '0.88rem',
                                fontWeight: 800,
                                cursor: slot.isOccupied ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.3rem',
                                transition: 'all 0.15s ease',
                                boxShadow: isSelected ? '0 4px 12px rgba(0, 33, 130, 0.25)' : 'none'
                              }}
                            >
                              <Clock size={13} color={isSelected ? '#38BDF8' : '#076ABC'} />
                              <span>{slot.time}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Turno Tarde */}
                  {afternoonSlots.length > 0 && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', fontWeight: 800, color: '#076ABC', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                        <Moon size={14} />
                        <span>Turno Tarde (14:00 a 20:00 hs)</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))', gap: '0.6rem' }}>
                        {afternoonSlots.map((slot) => {
                          const isSelected = selectedTime === slot.time;
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={slot.isOccupied}
                              onClick={() => setSelectedTime(slot.time)}
                              style={{
                                background: isSelected ? '#002182' : slot.isOccupied ? '#F1F5F9' : '#ffffff',
                                color: isSelected ? '#ffffff' : slot.isOccupied ? '#94A3B8' : '#002182',
                                border: isSelected ? '2px solid #002182' : '1.5px solid #D2E3FC',
                                padding: '0.65rem 0.4rem',
                                borderRadius: '10px',
                                fontSize: '0.88rem',
                                fontWeight: 800,
                                cursor: slot.isOccupied ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.3rem',
                                transition: 'all 0.15s ease',
                                boxShadow: isSelected ? '0 4px 12px rgba(0, 33, 130, 0.25)' : 'none'
                              }}
                            >
                              <Clock size={13} color={isSelected ? '#38BDF8' : '#076ABC'} />
                              <span>{slot.time}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Botones de Navegación */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <button
                    onClick={() => setCurrentStep(2)}
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid #D2E3FC',
                      color: '#002182',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <ChevronLeft size={16} />
                    Atrás
                  </button>

                  <button
                    disabled={!selectedDate || !selectedTime}
                    onClick={() => setCurrentStep(4)}
                    style={{
                      background: selectedDate && selectedTime ? 'linear-gradient(135deg, #257CE6 0%, #076ABC 100%)' : '#D2E3FC',
                      color: selectedDate && selectedTime ? '#ffffff' : '#7994B8',
                      border: 'none',
                      padding: '0.85rem 1.6rem',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      cursor: selectedDate && selectedTime ? 'pointer' : 'not-allowed',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: selectedDate && selectedTime ? '0 4px 14px rgba(7, 106, 188, 0.3)' : 'none'
                    }}
                  >
                    <span>Continuar a Datos del Paciente</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 4: Datos del Paciente & Confirmación ================= */}
            {currentStep === 4 && (
              <form onSubmit={handleConfirmBooking}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.75rem', alignItems: 'start' }}>
                  
                  {/* Columna Izquierda: Formulario de Datos */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#002182' }}>
                        Datos del Paciente
                      </h3>
                      {authPatient && (
                        <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 800, background: '#ECFDF5', padding: '0.2rem 0.5rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={12} /> Autocompletado desde tu cuenta
                        </span>
                      )}
                    </div>

                    <div style={{ marginBottom: '0.9rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.3rem' }}>
                        Nombre y Apellido Completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="Nombre y apellido"
                        style={{
                          width: '100%',
                          padding: '0.7rem 0.85rem',
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.9rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.3rem' }}>
                          DNI del Paciente *
                        </label>
                        <input
                          type="text"
                          required
                          value={patientDni}
                          onChange={(e) => setPatientDni(e.target.value)}
                          placeholder="Número sin puntos"
                          style={{
                            width: '100%',
                            padding: '0.7rem 0.85rem',
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

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.3rem' }}>
                          Teléfono / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          required
                          value={patientPhone}
                          onChange={(e) => setPatientPhone(e.target.value)}
                          placeholder="Cód. área y número"
                          style={{
                            width: '100%',
                            padding: '0.7rem 0.85rem',
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

                    <div style={{ marginBottom: '0.9rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.3rem' }}>
                        Correo Electrónico (para comprobante digital) *
                      </label>
                      <input
                        type="email"
                        required
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        placeholder="nombre@correo.com"
                        style={{
                          width: '100%',
                          padding: '0.7rem 0.85rem',
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem', marginBottom: '0.9rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.3rem' }}>
                          Obra Social o Prepaga
                        </label>
                        <select
                          value={patientInsurance}
                          onChange={(e) => setPatientInsurance(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.7rem 0.85rem',
                            borderRadius: '10px',
                            border: '1.5px solid #D2E3FC',
                            fontSize: '0.88rem',
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
                        <input
                          type="text"
                          value={patientInsuranceNumber}
                          onChange={(e) => setPatientInsuranceNumber(e.target.value)}
                          placeholder="Número de credencial"
                          style={{
                            width: '100%',
                            padding: '0.7rem 0.85rem',
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

                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.3rem' }}>
                        Motivo de Consulta o Síntomas Principales
                      </label>
                      <textarea
                        rows={2}
                        value={consultationReason}
                        onChange={(e) => setConsultationReason(e.target.value)}
                        placeholder="Contanos brevemente tu molestia o motivo de consulta (opcional)..."
                        style={{
                          width: '100%',
                          padding: '0.7rem 0.85rem',
                          borderRadius: '10px',
                          border: '1.5px solid #D2E3FC',
                          fontSize: '0.88rem',
                          color: '#002182',
                          outline: 'none',
                          resize: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  {/* Columna Derecha: Tarjeta Resumen de Turno */}
                  <div
                    style={{
                      background: '#F8FAFD',
                      border: '1.5px solid #D2E3FC',
                      borderRadius: '18px',
                      padding: '1.5rem',
                      boxShadow: '0 8px 24px rgba(0, 33, 130, 0.05)'
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#076ABC', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
                      RESUMEN DE TU RESERVA
                    </div>
                    <h4 style={{ margin: '0 0 1rem', fontSize: '1.15rem', fontWeight: 900, color: '#002182' }}>
                      Detalle del Turno Médico
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', borderBottom: '1px solid #D2E3FC', paddingBottom: '1.15rem', marginBottom: '1.15rem' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#7994B8', fontWeight: 700 }}>Especialidad:</div>
                        <div style={{ fontWeight: 900, color: '#002182', fontSize: '0.94rem' }}>{selectedSpecialty?.name}</div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#7994B8', fontWeight: 700 }}>Profesional Asignado:</div>
                        <div style={{ fontWeight: 800, color: '#002182' }}>
                          {selectedDoctor?.name || 'Profesional asignado por CITRA'}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#7994B8', fontWeight: 700 }}>Fecha y Horario:</div>
                        <div style={{ fontWeight: 900, color: '#076ABC', fontSize: '0.94rem' }}>
                          {selectedDate} a las {selectedTime} hs
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#7994B8', fontWeight: 700 }}>Lugar de Atención:</div>
                        <div style={{ fontWeight: 700, color: '#475569' }}>
                          Av. Carlos Pontín Nº556, Arroyito (Sede Central)
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.76rem', color: '#496386', lineHeight: 1.45, marginBottom: '1.25rem' }}>
                      Al confirmar tu turno, recibirás la confirmación inmediata y podrás consultar el comprobante en cualquier momento.
                    </div>

                    <button
                      type="submit"
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #257CE6 0%, #076ABC 100%)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.9rem',
                        borderRadius: '12px',
                        fontWeight: 900,
                        fontSize: '0.98rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.55rem',
                        boxShadow: '0 6px 18px rgba(7, 106, 188, 0.35)',
                        minHeight: '48px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <CheckCircle2 size={18} />
                      Confirmar y Reservar Turno
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid #D2E3FC',
                      color: '#002182',
                      padding: '0.65rem 1.2rem',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <ChevronLeft size={15} />
                    Modificar Fecha u Horario
                  </button>
                </div>
              </form>
            )}

            {/* ================= STEP 5: Confirmación & Voucher Imprimible ================= */}
            {currentStep === 5 && confirmedAppointment && (
              <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                    border: '2px solid #34D399',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#059669',
                    margin: '0 auto 1.25rem',
                    boxShadow: '0 6px 20px rgba(5, 150, 105, 0.18)'
                  }}
                >
                  <CheckCircle2 size={42} />
                </div>

                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#002182', margin: '0 0 0.4rem' }}>
                  ¡Turno Reservado con Éxito!
                </h2>
                <p style={{ fontSize: '0.88rem', color: '#496386', margin: '0 0 2rem' }}>
                  Tu reserva quedó registrada en CITRA. Podés consultar tu turno cuando quieras desde <strong>"Mis Turnos"</strong>.
                </p>

                {/* Voucher Ticket Card */}
                <div
                  id="ticket-imprimible"
                  style={{
                    background: '#ffffff',
                    border: '2px dashed #076ABC',
                    borderRadius: '20px',
                    padding: '1.75rem 1.75rem 1.5rem',
                    textAlign: 'left',
                    boxShadow: '0 10px 25px rgba(0, 33, 130, 0.08)',
                    marginBottom: '2rem',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #D2E3FC', paddingBottom: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#002182' }}>CITRA Clínica Médica</div>
                      <div style={{ fontSize: '0.74rem', color: '#076ABC', fontWeight: 800 }}>Comprobante Oficial de Reserva</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: '#7994B8', fontWeight: 700 }}>CÓDIGO DE RESERVA</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#002182', letterSpacing: '0.04em' }}>
                        {confirmedAppointment.bookingCode || 'CITRA-TRN-8840'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                      <div>
                        <span style={{ color: '#7994B8' }}>Paciente: </span>
                        <strong>{confirmedAppointment.patientName}</strong> (DNI: {confirmedAppointment.patientDni})
                      </div>
                      <div>
                        <span style={{ color: '#7994B8' }}>Especialidad: </span>
                        <strong>{confirmedAppointment.specialtyName || confirmedAppointment.doctorSpecialty}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#7994B8' }}>Profesional: </span>
                        <strong>{confirmedAppointment.doctorName}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#7994B8' }}>Fecha y Horario: </span>
                        <strong style={{ color: '#076ABC' }}>{confirmedAppointment.date} a las {confirmedAppointment.time} hs</strong>
                      </div>
                      <div>
                        <span style={{ color: '#7994B8' }}>Ubicación: </span>
                        <span>{confirmedAppointment.roomName} · Sede Central</span>
                      </div>
                      <div>
                        <span style={{ color: '#7994B8' }}>Cobertura: </span>
                        <span>{confirmedAppointment.insuranceName || 'Particular'}</span>
                      </div>
                    </div>

                    {/* QR Code SVG */}
                    <div style={{ textAlign: 'center', background: '#F8FAFD', padding: '1rem', borderRadius: '14px', border: '1px solid #D2E3FC' }}>
                      <QRCodeSVG
                        value={`https://citra.com.ar/validar-turno/${confirmedAppointment.id}`}
                        size={110}
                        bgColor="#F8FAFD"
                        fgColor="#002182"
                        level="M"
                      />
                      <div style={{ fontSize: '0.66rem', color: '#496386', marginTop: '0.45rem', fontWeight: 700 }}>
                        Escanear al ingresar a recepción
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción Post-Reserva */}
                <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={handlePrint}
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid #076ABC',
                      color: '#002182',
                      padding: '0.75rem 1.4rem',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Printer size={16} />
                    Imprimir Comprobante
                  </button>

                  <button
                    onClick={() => setCurrentView('my-turnos')}
                    style={{
                      background: 'linear-gradient(135deg, #257CE6 0%, #076ABC 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.75rem 1.6rem',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(7, 106, 188, 0.3)'
                    }}
                  >
                    <CalendarCheck size={16} />
                    Ver en Mis Turnos
                  </button>

                  <button
                    onClick={() => setCurrentView('home')}
                    style={{
                      background: '#F5F8FE',
                      border: '1.5px solid #D2E3FC',
                      color: '#002182',
                      padding: '0.75rem 1.3rem',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      cursor: 'pointer'
                    }}
                  >
                    Volver al Inicio
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
