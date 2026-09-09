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
  AlertCircle
} from 'lucide-react';

export const AppointmentBookingWizard = () => {
  const {
    specialties,
    doctors,
    appointments,
    addAppointment,
    healthInsurances,
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
        setCurrentStep(2); // Show professional selection under the preselected specialty
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

  // Generate available dates (next 14 days, skipping Sundays)
  const availableDates = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    // Exclude Sundays (day 0)
    if (d.getDay() !== 0) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const dayName = d.toLocaleDateString('es-AR', { weekday: 'short' });
      const monthName = d.toLocaleDateString('es-AR', { month: 'short' });
      availableDates.push({
        dateStr,
        dayNumber: dd,
        dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
        monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1)
      });
    }
  }

  // Set first date as default if not selected
  useEffect(() => {
    if (!selectedDate && availableDates.length > 0) {
      setSelectedDate(availableDates[0].dateStr);
    }
  }, [availableDates, selectedDate]);

  // Generate available time slots based on doctor's schedule or general slots
  const generateTimeSlots = () => {
    const slots = [];
    const startTime = selectedDoctor?.scheduleStart || '08:30';
    const endTime = selectedDoctor?.scheduleEnd || '17:30';
    const intervalMinutes = selectedDoctor?.slotDuration || 30;

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    let currentMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;

    // Check occupied slots from existing appointments for this doctor on this date
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
      slots.push({ time: timeStr, isOccupied });
      currentMin += intervalMinutes;
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Doctors matching selected specialty
  const filteredDoctors = selectedSpecialty
    ? doctors.filter((d) =>
        d.specialtyId === selectedSpecialty.id ||
        d.specialty === selectedSpecialty.name ||
        (Array.isArray(d.specialtyIds) && d.specialtyIds.includes(selectedSpecialty.id)) ||
        (d.specialty && selectedSpecialty.name && d.specialty.toLowerCase().includes(selectedSpecialty.name.toLowerCase()))
      )
    : doctors;

  // Handle finalize booking
  const handleConfirmBooking = (e) => {
    e.preventDefault();

    if (!patientName.trim() || !patientDni.trim() || !patientEmail.trim()) {
      addToast('Datos requeridos', 'Completa tu nombre, DNI y correo electrónico.', 'warning');
      return;
    }

    const assignedDoctor = selectedDoctor && selectedDoctor.id !== 'any'
      ? selectedDoctor
      : filteredDoctors[0] || doctors[0];

    const newAppointmentData = {
      patientId: authPatient ? authPatient.id : `pat-temp-${Date.now()}`,
      patientName: patientName.trim(),
      patientDni: patientDni.trim(),
      patientPhone: patientPhone.trim() || '+54 9 351 000-0000',
      patientEmail: patientEmail.trim(),
      patientInsurance: patientInsurance,
      patientInsuranceNumber: patientInsuranceNumber.trim() || 'N/A',
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
      reason: consultationReason.trim() || 'Consulta traumatológica general',
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

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F5F8FE',
        padding: '2.5rem 1.5rem 4rem'
      }}
    >
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Top Back navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setCurrentView('home')}
            style={{
              background: '#ffffff',
              border: '1.5px solid #D2E3FC',
              color: '#002182',
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={16} />
            Volver a la Web Institucional
          </button>

          {!authPatient && (
            <div style={{ fontSize: '0.82rem', color: '#496386' }}>
              ¿Ya estás registrado?{' '}
              <button
                onClick={() => { setAuthModalTab('login'); setIsAuthModalOpen(true); }}
                style={{ background: 'none', border: 'none', color: '#076ABC', fontWeight: 800, cursor: 'pointer', padding: 0 }}
              >
                Iniciá sesión para autocompletar tus datos
              </button>
            </div>
          )}
        </div>

        {/* Wizard Main Container */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '24px',
            border: '1.5px solid #D2E3FC',
            boxShadow: '0 10px 30px rgba(0, 33, 130, 0.06)',
            overflow: 'hidden'
          }}
        >
          {/* Header & Step progress bar */}
          <div
            style={{
              background: 'linear-gradient(135deg, #002182 0%, #076ABC 100%)',
              color: '#ffffff',
              padding: '2rem 2.5rem 1.75rem'
            }}
          >
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#D2E3FC', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Sistema de Turnos Online
            </div>
            <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 900 }}>
              {currentStep === 1 && '1. Selecciona la Especialidad o Servicio'}
              {currentStep === 2 && '2. Selecciona el Profesional Médico'}
              {currentStep === 3 && '3. Elige la Fecha y el Horario'}
              {currentStep === 4 && '4. Tus Datos y Motivo de Consulta'}
              {currentStep === 5 && '¡Turno Confirmado con Éxito!'}
            </h1>

            {/* Stepper bubbles */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '1.5rem',
                overflowX: 'auto',
                paddingBottom: '0.25rem'
              }}
            >
              {[
                { num: 1, label: 'Especialidad' },
                { num: 2, label: 'Profesional' },
                { num: 3, label: 'Fecha y Hora' },
                { num: 4, label: 'Tus Datos' },
                { num: 5, label: 'Comprobante' }
              ].map((step, idx) => (
                <div key={step.num} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: currentStep >= step.num ? '#ffffff' : 'rgba(255, 255, 255, 0.2)',
                      color: currentStep >= step.num ? '#002182' : '#ffffff',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '100px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span>{step.num}</span>
                    <span>{step.label}</span>
                  </div>
                  {idx < 4 && <div style={{ width: '16px', height: '2px', background: 'rgba(255,255,255,0.3)' }} />}
                </div>
              ))}
            </div>
          </div>

          {/* Wizard Content Body */}
          <div style={{ padding: '2.5rem' }}>
            {/* STEP 1: Select Specialty */}
            {currentStep === 1 && (
              <div>
                <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.15rem', fontWeight: 800, color: '#002182' }}>
                  ¿Para qué especialidad necesitas tu turno?
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
                  {specialties.map((spec) => {
                    const isSelected = selectedSpecialty?.id === spec.id;
                    return (
                      <div
                        key={spec.id}
                        onClick={() => setSelectedSpecialty(spec)}
                        style={{
                          background: isSelected ? '#EBF3FD' : '#F5F8FE',
                          border: isSelected ? '2px solid #076ABC' : '1.5px solid #D2E3FC',
                          borderRadius: '16px',
                          padding: '1.5rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? '0 6px 18px rgba(7, 106, 188, 0.2)' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#002182' }}>
                            {spec.name}
                          </h4>
                          {isSelected && <CheckCircle2 size={18} color="#076ABC" />}
                        </div>
                        <p style={{ margin: '0 0 0.85rem', fontSize: '0.82rem', color: '#496386', lineHeight: 1.45 }}>
                          {spec.description}
                        </p>
                        <div style={{ fontSize: '0.74rem', color: '#076ABC', fontWeight: 700 }}>
                          Duración aprox: {spec.estimatedDuration || 30} minutos
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2.5rem' }}>
                  <button
                    disabled={!selectedSpecialty}
                    onClick={() => setCurrentStep(2)}
                    style={{
                      background: selectedSpecialty ? 'linear-gradient(135deg, #076ABC 0%, #002182 100%)' : '#D2E3FC',
                      color: selectedSpecialty ? '#ffffff' : '#7994B8',
                      border: 'none',
                      padding: '0.8rem 1.8rem',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      cursor: selectedSpecialty ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    Continuar a Selección de Médico
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Select Doctor */}
            {currentStep === 2 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#002182' }}>
                    Médicos disponibles en {selectedSpecialty?.name}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#496386' }}>
                    Especialidad elegida: <strong>{selectedSpecialty?.name}</strong>
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
                  {/* Any available doctor card */}
                  <div
                    onClick={() => setSelectedDoctor({ id: 'any', name: 'Cualquier profesional disponible', specialty: selectedSpecialty?.name })}
                    style={{
                      background: selectedDoctor?.id === 'any' ? '#EBF3FD' : '#F5F8FE',
                      border: selectedDoctor?.id === 'any' ? '2px solid #076ABC' : '1.5px solid #D2E3FC',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      textAlign: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: '#076ABC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        marginBottom: '0.85rem'
                      }}
                    >
                      <Sparkles size={28} />
                    </div>
                    <h4 style={{ margin: '0 0 0.35rem', fontSize: '1.05rem', fontWeight: 800, color: '#002182' }}>
                      Primer turno disponible
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#496386' }}>
                      Asignar con cualquier profesional certificado de la especialidad
                    </p>
                  </div>

                  {filteredDoctors.map((doc) => {
                    const isSelected = selectedDoctor?.id === doc.id;
                    return (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDoctor(doc)}
                        style={{
                          background: isSelected ? '#EBF3FD' : '#ffffff',
                          border: isSelected ? '2px solid #076ABC' : '1.5px solid #D2E3FC',
                          borderRadius: '16px',
                          padding: '1.25rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          boxShadow: isSelected ? '0 6px 18px rgba(7, 106, 188, 0.2)' : 'none'
                        }}
                      >
                        <img
                          src={doc.avatar}
                          alt={doc.name}
                          style={{ width: '60px', height: '60px', borderRadius: '14px', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.98rem', fontWeight: 800, color: '#002182' }}>
                            {doc.name}
                          </h4>
                          <div style={{ fontSize: '0.75rem', color: '#076ABC', fontWeight: 700 }}>
                            {doc.specialty}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#7994B8', marginTop: '3px' }}>
                            {doc.roomName}
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 size={18} color="#076ABC" />}
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem' }}>
                  <button
                    onClick={() => setCurrentStep(1)}
                    style={{
                      background: 'none',
                      border: '1.5px solid #D2E3FC',
                      color: '#002182',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <ChevronLeft size={16} />
                    Cambiar Especialidad
                  </button>

                  <button
                    disabled={!selectedDoctor}
                    onClick={() => setCurrentStep(3)}
                    style={{
                      background: selectedDoctor ? 'linear-gradient(135deg, #076ABC 0%, #002182 100%)' : '#D2E3FC',
                      color: selectedDoctor ? '#ffffff' : '#7994B8',
                      border: 'none',
                      padding: '0.8rem 1.8rem',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      cursor: selectedDoctor ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    Continuar a Fecha y Horario
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Select Date & Time */}
            {currentStep === 3 && (
              <div>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1.15rem', fontWeight: 800, color: '#002182' }}>
                  Selecciona el día y horario de tu consulta
                </h3>

                {/* Day selector carousel */}
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#002182', marginBottom: '0.6rem' }}>
                    Días Disponibles
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
                      overflowX: 'auto',
                      paddingBottom: '0.75rem'
                    }}
                  >
                    {availableDates.map((item) => {
                      const isSelected = selectedDate === item.dateStr;
                      return (
                        <div
                          key={item.dateStr}
                          onClick={() => { setSelectedDate(item.dateStr); setSelectedTime(''); }}
                          style={{
                            minWidth: '85px',
                            background: isSelected ? '#076ABC' : '#F5F8FE',
                            color: isSelected ? '#ffffff' : '#002182',
                            border: isSelected ? '2px solid #002182' : '1.5px solid #D2E3FC',
                            borderRadius: '14px',
                            padding: '0.75rem 0.5rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: isSelected ? '0 4px 12px rgba(7, 106, 188, 0.3)' : 'none'
                          }}
                        >
                          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, opacity: isSelected ? 0.9 : 0.7 }}>
                            {item.dayName}
                          </div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 900, margin: '2px 0' }}>
                            {item.dayNumber}
                          </div>
                          <div style={{ fontSize: '0.72rem', fontWeight: 600, opacity: isSelected ? 0.9 : 0.7 }}>
                            {item.monthName}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Time slot chips */}
                <div style={{ marginBottom: '2.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#002182', marginBottom: '0.6rem' }}>
                    Horarios Disponibles para el {selectedDate}
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem' }}>
                    {timeSlots.map((slot) => {
                      const isSelected = selectedTime === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={slot.isOccupied}
                          onClick={() => setSelectedTime(slot.time)}
                          style={{
                            background: isSelected ? '#002182' : slot.isOccupied ? '#f3f4f6' : '#ffffff',
                            color: isSelected ? '#ffffff' : slot.isOccupied ? '#9ca3af' : '#002182',
                            border: isSelected ? '2px solid #002182' : '1.5px solid #D2E3FC',
                            padding: '0.65rem 0.5rem',
                            borderRadius: '10px',
                            fontSize: '0.9rem',
                            fontWeight: 800,
                            cursor: slot.isOccupied ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.3rem',
                            transition: 'all 0.15s'
                          }}
                        >
                          <Clock size={14} color={isSelected ? '#257CE6' : '#076ABC'} />
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={() => setCurrentStep(2)}
                    style={{
                      background: 'none',
                      border: '1.5px solid #D2E3FC',
                      color: '#002182',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
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
                      background: selectedDate && selectedTime ? 'linear-gradient(135deg, #076ABC 0%, #002182 100%)' : '#D2E3FC',
                      color: selectedDate && selectedTime ? '#ffffff' : '#7994B8',
                      border: 'none',
                      padding: '0.8rem 1.8rem',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      cursor: selectedDate && selectedTime ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    Continuar a Datos del Paciente
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Patient details & Confirmation */}
            {currentStep === 4 && (
              <form onSubmit={handleConfirmBooking}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'start' }}>
                  {/* Left: Patient form */}
                  <div>
                    <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.15rem', fontWeight: 800, color: '#002182' }}>
                      Datos del Paciente
                    </h3>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.35rem' }}>
                        Nombre y Apellido Completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="Ej: Juan Ignacio Pérez"
                        style={{
                          width: '100%',
                          padding: '0.7rem 0.85rem',
                          borderRadius: '10px',
                          border: '1.5px solid #D2E3FC',
                          fontSize: '0.88rem',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.35rem' }}>
                          DNI del Paciente *
                        </label>
                        <input
                          type="text"
                          required
                          value={patientDni}
                          onChange={(e) => setPatientDni(e.target.value)}
                          placeholder="Ej: 34.892.110"
                          style={{
                            width: '100%',
                            padding: '0.7rem 0.85rem',
                            borderRadius: '10px',
                            border: '1.5px solid #D2E3FC',
                            fontSize: '0.88rem',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.35rem' }}>
                          Teléfono / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          required
                          value={patientPhone}
                          onChange={(e) => setPatientPhone(e.target.value)}
                          placeholder="+54 9 351 4455..."
                          style={{
                            width: '100%',
                            padding: '0.7rem 0.85rem',
                            borderRadius: '10px',
                            border: '1.5px solid #D2E3FC',
                            fontSize: '0.88rem',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.35rem' }}>
                        Correo Electrónico (para confirmación y comprobante) *
                      </label>
                      <input
                        type="email"
                        required
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        placeholder="tuemail@ejemplo.com"
                        style={{
                          width: '100%',
                          padding: '0.7rem 0.85rem',
                          borderRadius: '10px',
                          border: '1.5px solid #D2E3FC',
                          fontSize: '0.88rem',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.35rem' }}>
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
                            outline: 'none',
                            background: '#ffffff'
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
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.35rem' }}>
                          N° de Afiliado
                        </label>
                        <input
                          type="text"
                          value={patientInsuranceNumber}
                          onChange={(e) => setPatientInsuranceNumber(e.target.value)}
                          placeholder="Ej: 310-892110-01"
                          style={{
                            width: '100%',
                            padding: '0.7rem 0.85rem',
                            borderRadius: '10px',
                            border: '1.5px solid #D2E3FC',
                            fontSize: '0.88rem',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#002182', marginBottom: '0.35rem' }}>
                        Motivo de Consulta o Dolencia Principal
                      </label>
                      <textarea
                        rows={3}
                        value={consultationReason}
                        onChange={(e) => setConsultationReason(e.target.value)}
                        placeholder="Describe brevemente tu molestia o síntoma (opcional)..."
                        style={{
                          width: '100%',
                          padding: '0.7rem 0.85rem',
                          borderRadius: '10px',
                          border: '1.5px solid #D2E3FC',
                          fontSize: '0.88rem',
                          outline: 'none',
                          resize: 'none'
                        }}
                      />
                    </div>
                  </div>

                  {/* Right: Appointment Summary Card */}
                  <div
                    style={{
                      background: '#F5F8FE',
                      border: '1.5px solid #076ABC',
                      borderRadius: '18px',
                      padding: '1.5rem',
                      boxShadow: '0 8px 20px rgba(0, 33, 130, 0.06)'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#076ABC', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                      Resumen de la Reserva
                    </div>
                    <h4 style={{ margin: '0 0 1.25rem', fontSize: '1.15rem', fontWeight: 800, color: '#002182' }}>
                      Detalle del Turno
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem', color: '#172A4A', borderBottom: '1px solid #D2E3FC', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#7994B8' }}>Especialidad:</div>
                        <div style={{ fontWeight: 800, color: '#002182' }}>{selectedSpecialty?.name}</div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#7994B8' }}>Profesional:</div>
                        <div style={{ fontWeight: 800, color: '#002182' }}>
                          {selectedDoctor?.name || 'Profesional asignado por CITRA'}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#7994B8' }}>Fecha y Horario:</div>
                        <div style={{ fontWeight: 800, color: '#076ABC' }}>
                          {selectedDate} a las {selectedTime} hs
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#7994B8' }}>Consultorio:</div>
                        <div style={{ fontWeight: 700 }}>
                          {selectedDoctor?.roomName || 'Consultorio Principal'} (Sede Central)
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#496386', lineHeight: 1.45, marginBottom: '1.5rem' }}>
                      Al hacer clic en Confirmar Turno, recibirás un recordatorio por WhatsApp y correo electrónico con el comprobante y el código de acceso.
                    </div>

                    <button
                      type="submit"
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.9rem',
                        borderRadius: '12px',
                        fontWeight: 900,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 15px rgba(7, 106, 188, 0.35)'
                      }}
                    >
                      <CheckCircle2 size={20} />
                      Confirmar y Reservar Turno
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    style={{
                      background: 'none',
                      border: '1.5px solid #D2E3FC',
                      color: '#002182',
                      padding: '0.65rem 1.2rem',
                      borderRadius: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <ChevronLeft size={16} />
                    Modificar Fecha y Hora
                  </button>
                </div>
              </form>
            )}

            {/* STEP 5: Success & Printable Ticket Voucher */}
            {currentStep === 5 && confirmedAppointment && (
              <div style={{ textAlign: 'center', maxWidth: '620px', margin: '0 auto' }}>
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: '#EBF3FD',
                    border: '3px solid #076ABC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#076ABC',
                    margin: '0 auto 1.25rem'
                  }}
                >
                  <CheckCircle2 size={40} />
                </div>

                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#002182', margin: '0 0 0.5rem' }}>
                  ¡Turno Reservado con Éxito!
                </h2>
                <p style={{ fontSize: '0.92rem', color: '#496386', margin: '0 0 2rem' }}>
                  Hemos registrado tu reserva. Podés consultar o cancelar tu turno en cualquier momento desde la sección <strong>"Mis Turnos"</strong>.
                </p>

                {/* Voucher Ticket Card */}
                <div
                  id="ticket-imprimible"
                  style={{
                    background: '#ffffff',
                    border: '2px dashed #076ABC',
                    borderRadius: '20px',
                    padding: '2rem',
                    textAlign: 'left',
                    boxShadow: '0 10px 25px rgba(0, 33, 130, 0.08)',
                    marginBottom: '2rem',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #D2E3FC', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#002182' }}>CITRA Clínica Médica</div>
                      <div style={{ fontSize: '0.75rem', color: '#076ABC', fontWeight: 700 }}>Comprobante de Turno Oficial</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.72rem', color: '#7994B8' }}>CÓDIGO DE RESERVA</div>
                      <div style={{ fontSize: '1rem', fontWeight: 900, color: '#002182' }}>
                        {confirmedAppointment.bookingCode || 'CITRA-TRN-8840'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
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
                    <div style={{ textAlign: 'center', background: '#F5F8FE', padding: '1rem', borderRadius: '12px', border: '1px solid #D2E3FC' }}>
                      <QRCodeSVG
                        value={`https://citra.com.ar/validar-turno/${confirmedAppointment.id}`}
                        size={110}
                        bgColor="#F5F8FE"
                        fgColor="#002182"
                        level="M"
                      />
                      <div style={{ fontSize: '0.65rem', color: '#496386', marginTop: '0.5rem', fontWeight: 700 }}>
                        Escanear al ingresar a recepción
                      </div>
                    </div>
                  </div>
                </div>

                {/* Post-booking action buttons */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={handlePrint}
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid #076ABC',
                      color: '#002182',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Printer size={18} />
                    Imprimir Comprobante
                  </button>

                  <button
                    onClick={() => setCurrentView('my-turnos')}
                    style={{
                      background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.75rem 1.75rem',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(7, 106, 188, 0.25)'
                    }}
                  >
                    <CalendarCheck size={18} />
                    Ver en Mis Turnos
                  </button>

                  <button
                    onClick={() => setCurrentView('home')}
                    style={{
                      background: '#F5F8FE',
                      border: '1.5px solid #D2E3FC',
                      color: '#002182',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '0.9rem',
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
