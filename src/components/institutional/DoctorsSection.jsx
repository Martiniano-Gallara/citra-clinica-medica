import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  CalendarPlus,
  Star,
  Clock,
  MapPin,
  Award,
  ChevronRight
} from 'lucide-react';

export const DoctorsSection = () => {
  const { doctors, setCurrentView, setBookingPreselectedDoctor, setBookingPreselectedSpecialty } = useClinic();

  const handleBookDoctor = (doc) => {
    setBookingPreselectedDoctor(doc.id);
    if (doc.specialtyId) {
      setBookingPreselectedSpecialty(doc.specialtyId);
    }
    setCurrentView('booking');
  };

  const activeDoctors = doctors.filter((d) => d.active !== false);

  return (
    <section
      id="profesionales"
      style={{
        padding: '5rem 1.5rem',
        background: '#F5F8FE'
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#EBF3FD',
              color: '#002182',
              padding: '0.35rem 0.85rem',
              borderRadius: '100px',
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
              marginBottom: '0.75rem'
            }}
          >
            CUERPO MÉDICO CITRA
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
              fontWeight: 900,
              color: '#002182',
              margin: '0 0 1rem',
              letterSpacing: '-0.02em'
            }}
          >
            Profesionales Especializados y Comprometidos
          </h2>
          <p style={{ fontSize: '1rem', color: '#496386', margin: 0, lineHeight: 1.6 }}>
            Médicos traumatólogos, cirujanos ortopedistas y kinesiólogos formados en los principales centros hospitalarios y de investigación.
          </p>
        </div>

        {/* Doctors Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '2rem'
          }}
        >
          {activeDoctors.map((doc) => (
            <div
              key={doc.id}
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                border: '1.5px solid #D2E3FC',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 15px rgba(0, 33, 130, 0.05)',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 33, 130, 0.12)';
                e.currentTarget.style.borderColor = '#076ABC';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 33, 130, 0.05)';
                e.currentTarget.style.borderColor = '#D2E3FC';
              }}
            >
              {/* Doctor Avatar Header */}
              <div style={{ position: 'relative', height: '220px', background: '#EDF3FD', overflow: 'hidden' }}>
                <img
                  src={doc.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300'}
                  alt={doc.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '0.85rem',
                    right: '0.85rem',
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '100px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#002182',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <Star size={13} fill="#f59e0b" color="#f59e0b" />
                  {doc.stats?.rating || 4.9}
                </div>
              </div>

              {/* Doctor Details */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#076ABC', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {doc.specialty}
                  </div>
                  <h3 style={{ margin: '0.3rem 0 0.5rem', fontSize: '1.2rem', fontWeight: 800, color: '#002182' }}>
                    {doc.name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#7994B8', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Award size={14} color="#076ABC" />
                    Matrícula: {doc.license || 'MN 114829 / MP 33490'}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem', color: '#496386', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={14} color="#076ABC" />
                      <span>{doc.workingDays ? doc.workingDays.join(', ') : 'Lun, Mié, Vie'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={14} color="#076ABC" />
                      <span>{doc.roomName || 'Consultorio Principal'}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleBookDoctor(doc)}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(7, 106, 188, 0.2)'
                  }}
                >
                  <CalendarPlus size={16} />
                  Sacar Turno con Profesional
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
