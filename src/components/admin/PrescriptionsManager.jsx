import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  FileText,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  Share2,
  AlertCircle,
  Copy,
  Pill,
  Calendar,
  User,
  Stethoscope,
  X,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { PrescriptionDigitalModal } from '../clinical/PrescriptionDigitalModal';

export const PrescriptionsManager = () => {
  const {
    electronicPrescriptions,
    scopedElectronicPrescriptions,
    isDoctor,
    currentDoctor,
    addElectronicPrescription,
    updatePrescriptionStatus,
    patients,
    doctors,
    setSelectedPrescriptionForView,
    setIsPrescriptionModalOpen,
    addToast
  } = useClinic();

  const effectivePrescriptions = isDoctor ? scopedElectronicPrescriptions : electronicPrescriptions;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDoctor, setFilterDoctor] = useState(isDoctor && currentDoctor ? currentDoctor.id : 'all');

  // Modal para prescribir nueva receta
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [selectedDoctorId, setSelectedDoctorId] = useState(isDoctor && currentDoctor ? currentDoctor.id : (doctors[0]?.id || ''));
  const [diagnosis, setDiagnosis] = useState('M54.5 - Lumbago no especificado / Lumbalgia mecánica');
  const [medicationName, setMedicationName] = useState('Ibuprofeno 600 mg');
  const [dosage, setDosage] = useState('1 comprimido cada 8 horas con las comidas durante 5 días.');
  const [quantity, setQuantity] = useState('1 caja x 20 comprimidos');
  const [indications, setIndications] = useState('Reposo relativo y no realizar esfuerzos bruscos.');

  const handleCreatePrescription = (e) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === selectedPatientId) || patients[0];
    const doc = isDoctor && currentDoctor ? currentDoctor : (doctors.find((d) => d.id === selectedDoctorId) || doctors[0]);

    if (!medicationName.trim()) {
      addToast('Medicamento requerido', 'Por favor ingresa al menos un medicamento.', 'warning');
      return;
    }

    const newPrescription = addElectronicPrescription({
      patientId: pat.id,
      patientName: pat.name,
      patientDni: pat.dni,
      patientInsurance: pat.insurance || 'Particular',
      patientPlan: pat.plan || 'Arancel Pleno',
      doctorId: doc.id,
      doctorName: doc.name,
      doctorMatricula: doc.license || doc.matricula || 'MP-34982',
      doctorSpecialty: doc.specialty,
      diagnosis: diagnosis.trim(),
      medications: [
        {
          name: medicationName.trim(),
          genericName: medicationName.split(' ')[0] || 'Ibuprofeno',
          dosage: dosage.trim(),
          quantity: quantity.trim(),
          presentation: 'Comprimidos recubiertos'
        }
      ],
      indications: indications.trim(),
      status: 'activa'
    });

    addToast('Receta Electrónica Emitida', `Receta CUIR creada para ${pat.name}`, 'success');
    setIsNewModalOpen(false);
  };

  const copyCUIR = (cuir) => {
    navigator.clipboard?.writeText(cuir);
    addToast('CUIR Copiado', `Código oficial copiado al portapapeles: ${cuir}`, 'info');
  };

  const sharePrescriptionWhatsApp = (prescription) => {
    const text = `Hola ${prescription.patientName}, desde Clínica CITRA te compartimos tu Receta Médica Electrónica Oficial (CUIR: ${prescription.cuir}). Podés presentarla en farmacias de todo el país. Vigencia: 30 días.`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const filteredPrescriptions = effectivePrescriptions.filter((rx) => {
    const matchesSearch =
      (rx.patientName && rx.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (rx.cuir && rx.cuir.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (rx.diagnosisPresuntivo && rx.diagnosisPresuntivo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (rx.diagnosis && rx.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (rx.patientDni && rx.patientDni.includes(searchTerm));

    const matchesStatus = filterStatus === 'all' || (rx.status || 'activa') === filterStatus;
    const matchesDoctor = isDoctor ? true : (filterDoctor === 'all' || rx.doctorId === filterDoctor);

    return matchesSearch && matchesStatus && matchesDoctor;
  });

  const totalPrescriptions = effectivePrescriptions.length;
  const activePrescriptions = effectivePrescriptions.filter((p) => (p.status || 'activa') === 'activa').length;
  const dispensedPrescriptions = effectivePrescriptions.filter((p) => p.status === 'dispensada').length;
  const expiredPrescriptions = effectivePrescriptions.filter((p) => p.status === 'vencida').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem'
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '1.4rem 1.6rem',
            border: '1.5px solid #D2E3FC',
            boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}
        >
          <div>
            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#496386', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              RECETAS TOTALES
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#002182', margin: '0.2rem 0' }}>
              {totalPrescriptions}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#496386' }}>Registradas en RENAPDIS</div>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#EBF3FD',
              color: '#076ABC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FileText size={22} />
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '1.4rem 1.6rem',
            border: '1.5px solid #D2E3FC',
            boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}
        >
          <div>
            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#496386', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              VIGENTES / ACTIVAS
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#059669', margin: '0.2rem 0' }}>
              {activePrescriptions}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#059669' }}>Disponibles en farmacia</div>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#d1fae5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '1.4rem 1.6rem',
            border: '1.5px solid #D2E3FC',
            boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}
        >
          <div>
            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#496386', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              DISPENSADAS
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#002182', margin: '0.2rem 0' }}>
              {dispensedPrescriptions}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#076ABC' }}>Retiradas por paciente</div>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#EBF3FD',
              color: '#002182',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Pill size={22} />
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Action Button */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '1.25rem 1.5rem',
          border: '1.5px solid #D2E3FC',
          boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', minWidth: '260px', flex: 1 }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#076ABC' }}
            />
            <input
              type="text"
              placeholder="Buscar por paciente, DNI, CUIR, medicamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.4rem',
                borderRadius: '12px',
                border: '1.5px solid #D2E3FC',
                fontSize: '0.88rem',
                outline: 'none',
                background: '#F5F8FE'
              }}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: '12px',
              border: '1.5px solid #D2E3FC',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#002182',
              background: '#ffffff',
              outline: 'none'
            }}
          >
            <option value="all">Todos los Estados</option>
            <option value="activa">Vigente / Activa</option>
            <option value="dispensada">Dispensada</option>
            <option value="vencida">Vencida</option>
          </select>

          {isDoctor ? (
            <div
              style={{
                padding: '0.65rem 1rem',
                borderRadius: '12px',
                border: '1.5px solid #8EBEF5',
                fontSize: '0.84rem',
                fontWeight: 800,
                color: '#002182',
                background: '#EBF3FD'
              }}
            >
              🩺 Prescriptor: {currentDoctor?.name || 'Dr. Blanco'}
            </div>
          ) : (
            <select
              value={filterDoctor}
              onChange={(e) => setFilterDoctor(e.target.value)}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: '12px',
                border: '1.5px solid #D2E3FC',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#002182',
                background: '#ffffff',
                outline: 'none'
              }}
            >
              <option value="all">Todos los Profesionales</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '0.75rem 1.4rem',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(7, 106, 188, 0.25)'
          }}
        >
          <Plus size={18} />
          <span>Nueva Receta Electrónica</span>
        </button>
      </div>

      {/* Table of Prescriptions */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1.5px solid #D2E3FC',
          boxShadow: '0 4px 14px rgba(0, 33, 130, 0.04)',
          overflow: 'hidden'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
            <thead>
              <tr style={{ background: '#F5F8FE', borderBottom: '2px solid #D2E3FC' }}>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', fontWeight: 900, color: '#002182', textTransform: 'uppercase' }}>
                  Código CUIR / Fecha
                </th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', fontWeight: 900, color: '#002182', textTransform: 'uppercase' }}>
                  Paciente
                </th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', fontWeight: 900, color: '#002182', textTransform: 'uppercase' }}>
                  Profesional Prescriptor
                </th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', fontWeight: 900, color: '#002182', textTransform: 'uppercase' }}>
                  Medicamentos
                </th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', fontWeight: 900, color: '#002182', textTransform: 'uppercase' }}>
                  Estado
                </th>
                <th style={{ padding: '1rem 1.25rem', fontSize: '0.78rem', fontWeight: 900, color: '#002182', textTransform: 'uppercase', textAlign: 'right' }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPrescriptions.map((p) => {
                const isActiva = p.status === 'activa';
                const isDispensada = p.status === 'dispensada';

                return (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: '1px solid #EDF3FD',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FBFF')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#076ABC', fontSize: '0.85rem' }}>
                          {p.cuir || 'CUIR-2026-9941'}
                        </span>
                        <button
                          onClick={() => copyCUIR(p.cuir || 'CUIR-2026-9941')}
                          title="Copiar CUIR"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7994B8', padding: '2px' }}
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#496386', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={12} />
                        {p.date || '2026-08-28'} — Vence: {p.expirationDate || '2026-09-27'}
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 800, color: '#002182', fontSize: '0.92rem' }}>
                        {p.patientName}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#496386' }}>
                        DNI {p.patientDni || '29.349.120'} • {p.patientInsurance || 'Particular'}
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 800, color: '#002182', fontSize: '0.88rem' }}>
                        {p.doctorName}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#496386' }}>
                        {p.doctorSpecialty || 'Especialista'} ({p.doctorMatricula || 'MP-34982'})
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      {p.medications && p.medications.length > 0 ? (
                        <div>
                          <div style={{ fontWeight: 700, color: '#076ABC', fontSize: '0.85rem' }}>
                            {p.medications[0].name}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#496386' }}>
                            {p.medications[0].dosage}
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.82rem', color: '#496386' }}>Tratamiento farmacológico</div>
                      )}
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      <button
                        onClick={() => updatePrescriptionStatus(p.id, isActiva ? 'dispensada' : 'activa')}
                        title="Click para alternar estado"
                        style={{
                          background: isActiva ? '#d1fae5' : isDispensada ? '#EBF3FD' : '#fee2e2',
                          color: isActiva ? '#065f46' : isDispensada ? '#002182' : '#991b1b',
                          border: 'none',
                          borderRadius: '100px',
                          padding: '0.35rem 0.8rem',
                          fontSize: '0.76rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: isActiva ? '#10b981' : isDispensada ? '#257CE6' : '#ef4444'
                          }}
                        />
                        {isActiva ? 'Vigente' : isDispensada ? 'Dispensada' : 'Vencida'}
                      </button>
                    </td>

                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.45rem' }}>
                        <button
                          onClick={() => {
                            setSelectedPrescriptionForView(p);
                            setIsPrescriptionModalOpen(true);
                          }}
                          style={{
                            background: '#F5F8FE',
                            border: '1.5px solid #D2E3FC',
                            color: '#076ABC',
                            padding: '0.4rem 0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            cursor: 'pointer'
                          }}
                        >
                          <Printer size={14} />
                          <span>Ver / Imprimir</span>
                        </button>

                        <button
                          onClick={() => sharePrescriptionWhatsApp(p)}
                          style={{
                            background: '#25D366',
                            border: 'none',
                            color: '#ffffff',
                            padding: '0.4rem 0.65rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Enviar por WhatsApp al paciente"
                        >
                          <Share2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nueva Receta Electrónica */}
      {isNewModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 33, 130, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              maxWidth: '560px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 50px rgba(0, 33, 130, 0.25)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#EBF3FD',
                    color: '#076ABC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Pill size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#002182', margin: 0 }}>
                    Emisión de Receta Electrónica
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#496386' }}>Prescripción Digital Homologada • Plataforma ReNaPDiS</div>
                </div>
              </div>

              <button
                onClick={() => setIsNewModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#496386' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePrescription} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                    Paciente
                  </label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.7rem 1rem',
                      borderRadius: '12px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.88rem',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  >
                    {patients.map((pat) => (
                      <option key={pat.id} value={pat.id}>
                        {pat.name} (DNI {pat.dni})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                    Médico Prescriptor
                  </label>
                  {isDoctor ? (
                    <div
                      style={{
                        width: '100%',
                        padding: '0.7rem 1rem',
                        borderRadius: '12px',
                        border: '1.5px solid #8EBEF5',
                        fontSize: '0.88rem',
                        fontWeight: 800,
                        background: '#EBF3FD',
                        color: '#002182'
                      }}
                    >
                      🩺 {currentDoctor?.name || 'Dr. Blanco'} — {currentDoctor?.specialty || 'Traumatología y Ortopedia'}
                    </div>
                  ) : (
                    <select
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.7rem 1rem',
                        borderRadius: '12px',
                        border: '1.5px solid #D2E3FC',
                        fontSize: '0.88rem',
                        outline: 'none',
                        background: '#ffffff'
                      }}
                    >
                      {doctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.name} ({doc.specialty})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                  Diagnóstico (CIE-10)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: M54.5 - Lumbago / Lumbalgia mecánica"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #D2E3FC',
                    fontSize: '0.9rem',
                    outline: 'none',
                    background: '#F5F8FE'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                    Medicamento / Droga Genérica
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Ibuprofeno 600 mg"
                    value={medicationName}
                    onChange={(e) => setMedicationName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.7rem 1rem',
                      borderRadius: '12px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.9rem',
                      outline: 'none',
                      background: '#F5F8FE'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                    Cantidad
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 1 caja x 20 comp."
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.7rem 1rem',
                      borderRadius: '12px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.9rem',
                      outline: 'none',
                      background: '#F5F8FE'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                  Posología e Instrucciones de Toma
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 1 comprimido cada 8 horas por 5 días con las comidas"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #D2E3FC',
                    fontSize: '0.9rem',
                    outline: 'none',
                    background: '#F5F8FE'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                  Indicaciones Adicionales
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Evitar levantar pesos superiores a 5kg y aplicar frío local 15 minutos."
                  value={indications}
                  onChange={(e) => setIndications(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #D2E3FC',
                    fontSize: '0.88rem',
                    outline: 'none',
                    background: '#F5F8FE',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div
                style={{
                  background: '#EBF3FD',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontSize: '0.78rem',
                  color: '#002182'
                }}
              >
                <ShieldCheck size={18} color="#076ABC" />
                <span>La receta se firmará digitalmente con certificado PKI institucional y se le asignará código CUIR único.</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: '12px',
                    border: '1.5px solid #D2E3FC',
                    background: '#ffffff',
                    color: '#496386',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.6rem',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                    color: '#ffffff',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(7, 106, 188, 0.25)'
                  }}
                >
                  Firmar y Emitir Receta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Visor de Receta Oficial para Imprimir/Descargar */}
      <PrescriptionDigitalModal />
    </div>
  );
};
