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
  Sparkles,
  Trash2
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

  // Protocolos frecuentes de traumatología (1-Click)
  const prescriptionPresets = [
    {
      title: 'Artrosis / Condroprotección',
      diagnosis: 'M17.1 - Gonartrosis primaria bilateral / Desgaste articular',
      medications: [
        {
          name: 'Glucosamina Sulfato + Condroitín',
          concentration: '1500 / 1200 mg',
          form: 'Sobres monodosis',
          quantity: '60 (sesenta) sobres',
          instructions: '1 sobre al día disuelto en agua con el desayuno durante 60 días'
        },
        {
          name: 'Paracetamol',
          concentration: '500 mg',
          form: 'Comprimidos',
          quantity: '20 comprimidos',
          instructions: '1 comprimido cada 8 hs en caso de dolor articular moderado'
        }
      ],
      indications: 'Mantener caminatas suaves en terreno plano y aplicar calor local 20 minutos.'
    },
    {
      title: 'Analgesia Postquirúrgica LCA',
      diagnosis: 'S83.5 - Plastia de ligamento cruzado anterior (Postoperatorio)',
      medications: [
        {
          name: 'Ketorolac Trometamina',
          concentration: '10 mg SL',
          form: 'Comprimidos sublinguales',
          quantity: '10 comprimidos',
          instructions: '1 comprimido sublingual cada 8 horas (máximo 5 días)'
        },
        {
          name: 'Paracetamol',
          concentration: '1 g',
          form: 'Comprimidos',
          quantity: '20 comprimidos',
          instructions: '1 comprimido cada 8 horas intercalado con antiinflamatorio'
        }
      ],
      indications: 'Crioterapia 20 min cada 4 horas y deambulación con férula y muletas según protocolo.'
    },
    {
      title: 'Lumbalgia Mecánica Aguda',
      diagnosis: 'M54.5 - Lumbago agudo / Contractura paravertebral severa',
      medications: [
        {
          name: 'Diclofenac Sódico + Pridinol',
          concentration: '75 / 4 mg',
          form: 'Comprimidos recubiertos',
          quantity: '1 caja x 15 comprimidos',
          instructions: '1 comprimido cada 12 horas después de las comidas por 5 días'
        },
        {
          name: 'Omeprazol',
          concentration: '20 mg',
          form: 'Cápsulas',
          quantity: '1 caja x 14 cápsulas',
          instructions: '1 cápsula en ayunas 30 minutos antes del desayuno'
        }
      ],
      indications: 'Reposo relativo, evitar esfuerzos de carga y no realizar rotaciones bruscas del tronco.'
    },
    {
      title: 'Tendinopatía & Antiinflamatorio',
      diagnosis: 'M75.1 - Síndrome de manguito rotador / Tendinitis supraespinoso',
      medications: [
        {
          name: 'Ibuprofeno',
          concentration: '600 mg',
          form: 'Comprimidos',
          quantity: '1 caja x 20 comprimidos',
          instructions: '1 comprimido cada 8 horas con las comidas por 7 días'
        }
      ],
      indications: 'Evitar movimientos del brazo por encima de 90° de elevación y aplicar hielo 15 min.'
    }
  ];

  // Modal para prescribir nueva receta
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [selectedDoctorId, setSelectedDoctorId] = useState(isDoctor && currentDoctor ? currentDoctor.id : (doctors[0]?.id || ''));
  const [diagnosis, setDiagnosis] = useState('M54.5 - Lumbago no especificado / Lumbalgia mecánica');
  const [medicationsList, setMedicationsList] = useState([
    {
      name: 'Ibuprofeno',
      concentration: '600 mg',
      form: 'Comprimidos',
      quantity: '1 caja x 20 comprimidos',
      instructions: '1 comprimido cada 8 horas con las comidas durante 5 días'
    }
  ]);
  const [indications, setIndications] = useState('Reposo relativo y no realizar esfuerzos bruscos.');

  const handleAddMedication = () => {
    setMedicationsList((prev) => [
      ...prev,
      {
        name: '',
        concentration: '',
        form: 'Comprimidos',
        quantity: '1 caja',
        instructions: '1 comprimido cada 8 horas'
      }
    ]);
  };

  const handleRemoveMedication = (index) => {
    if (medicationsList.length <= 1) return;
    setMedicationsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMedicationChange = (index, field, value) => {
    setMedicationsList((prev) =>
      prev.map((med, i) => (i === index ? { ...med, [field]: value } : med))
    );
  };

  const handleApplyPreset = (preset) => {
    setDiagnosis(preset.diagnosis);
    setMedicationsList(preset.medications);
    setIndications(preset.indications);
    addToast('Protocolo Aplicado', `Plantilla de ${preset.title} cargada.`, 'info');
  };

  const handleCreatePrescription = (e) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === selectedPatientId) || patients[0];
    const doc = isDoctor && currentDoctor ? currentDoctor : (doctors.find((d) => d.id === selectedDoctorId) || doctors[0]);

    const validMeds = medicationsList.filter((m) => m.name.trim());
    if (validMeds.length === 0) {
      addToast('Medicamento requerido', 'Por favor ingresa al menos un medicamento en la receta.', 'warning');
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
      doctorLicense: doc.license || doc.matricula || 'MN 114.829 / MP 44.920',
      doctorSpecialty: doc.specialty || 'Traumatología y Ortopedia',
      diagnosis: diagnosis.trim(),
      diagnosisPresuntivo: diagnosis.trim(),
      medications: validMeds.map((m) => ({
        dci: m.name.trim(),
        name: m.name.trim(),
        genericName: m.name.trim(),
        concentration: m.concentration?.trim() || '',
        form: m.form?.trim() || 'Comprimidos',
        quantityUnits: m.quantity?.trim() || '1 caja',
        instructions: m.instructions?.trim() || 'Tomar según indicación médica'
      })),
      indications: indications.trim(),
      status: 'activa'
    });

    addToast('Receta Médica Emitida', `Receta oficial emitida para ${pat.name}`, 'success');
    setIsNewModalOpen(false);
    setSelectedPrescriptionForView(newPrescription);
    setIsPrescriptionModalOpen(true);
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
                background: '#EBF3FD',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Stethoscope size={15} color="#002182" /> Prescriptor: {currentDoctor?.name || 'Dr. Blanco'}
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

      {/* Modal Nueva Receta Médica */}
      {isNewModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 33, 130, 0.45)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => setIsNewModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              maxWidth: '680px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 50px rgba(0, 33, 130, 0.25)',
              position: 'relative',
              maxHeight: '92vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
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
                  <Pill size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#002182', margin: 0 }}>
                    Emisión de Receta Médica
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#496386' }}>
                    Prescripción Farmacológica Homologada · CITRA Clínica Médica
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Presets 1-Click */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#002182', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={14} color="#076ABC" />
                Protocolos Traumatológicos Frecuentes (1-Click):
              </div>
              <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                {prescriptionPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    style={{
                      background: '#F5F8FE',
                      border: '1.5px solid #BFDBFE',
                      borderRadius: '8px',
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      color: '#002182',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#002182';
                      e.currentTarget.style.background = '#e0edff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#BFDBFE';
                      e.currentTarget.style.background = '#F5F8FE';
                    }}
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreatePrescription} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Patient & Doctor Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                    Paciente
                  </label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.9rem',
                      borderRadius: '10px',
                      border: '1.5px solid #D2E3FC',
                      fontSize: '0.86rem',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  >
                    {patients.map((pat) => (
                      <option key={pat.id} value={pat.id}>
                        {pat.name} (DNI {pat.dni}) · {pat.insurance || 'Particular'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                    Médico Prescriptor
                  </label>
                  {isDoctor ? (
                    <div
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.9rem',
                        borderRadius: '10px',
                        border: '1.5px solid #8EBEF5',
                        fontSize: '0.86rem',
                        fontWeight: 800,
                        background: '#EBF3FD',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Stethoscope size={15} color="#002182" /> {currentDoctor?.name || 'Dr. Blanco'} — {currentDoctor?.specialty || 'Traumatología y Ortopedia'}
                    </div>
                  ) : (
                    <select
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.9rem',
                        borderRadius: '10px',
                        border: '1.5px solid #D2E3FC',
                        fontSize: '0.86rem',
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

              {/* Diagnosis CIE-10 */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                  Diagnóstico Clínico (CIE-10)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: S83.5 - Traumatismo y reconstrucción LCA rodilla"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    borderRadius: '10px',
                    border: '1.5px solid #D2E3FC',
                    fontSize: '0.88rem',
                    outline: 'none',
                    background: '#F8FAFD'
                  }}
                />
              </div>

              {/* Multi-Medications List (Rp/) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#002182' }}>
                    Medicamentos Prescriptos (Rp/)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddMedication}
                    style={{
                      background: '#EBF3FD',
                      border: '1px solid #BFDBFE',
                      color: '#076ABC',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={13} />
                    <span>Agregar otro medicamento</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {medicationsList.map((med, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#F8FAFD',
                        border: '1.5px solid #D2E3FC',
                        borderRadius: '12px',
                        padding: '0.85rem 1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.65rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#076ABC', textTransform: 'uppercase' }}>
                          Medicamento #{idx + 1}
                        </span>
                        {medicationsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMedication(idx)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#EF4444',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '0.72rem',
                              fontWeight: 700
                            }}
                          >
                            <Trash2 size={13} />
                            <span>Quitar</span>
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '0.65rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '2px' }}>
                            Droga / DCI *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ej: Glucosamina Sulfato + Condroitín"
                            value={med.name}
                            onChange={(e) => handleMedicationChange(idx, 'name', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.55rem 0.75rem',
                              borderRadius: '8px',
                              border: '1px solid #CBD5E1',
                              fontSize: '0.84rem',
                              background: '#ffffff'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '2px' }}>
                            Concentración
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: 1500 / 1200 mg"
                            value={med.concentration}
                            onChange={(e) => handleMedicationChange(idx, 'concentration', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.55rem 0.75rem',
                              borderRadius: '8px',
                              border: '1px solid #CBD5E1',
                              fontSize: '0.84rem',
                              background: '#ffffff'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '2px' }}>
                            Forma Farmacéutica
                          </label>
                          <select
                            value={med.form}
                            onChange={(e) => handleMedicationChange(idx, 'form', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.55rem 0.75rem',
                              borderRadius: '8px',
                              border: '1px solid #CBD5E1',
                              fontSize: '0.84rem',
                              background: '#ffffff'
                            }}
                          >
                            <option value="Comprimidos">Comprimidos</option>
                            <option value="Cápsulas">Cápsulas</option>
                            <option value="Sobres monodosis">Sobres monodosis</option>
                            <option value="Comprimidos sublinguales">Comprimidos sublinguales</option>
                            <option value="Gotas / Solución oral">Gotas / Solución oral</option>
                            <option value="Gel tópico">Gel tópico</option>
                            <option value="Inyectable">Inyectable</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.65rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '2px' }}>
                            Cantidad Total
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: 60 sobres / 1 caja"
                            value={med.quantity}
                            onChange={(e) => handleMedicationChange(idx, 'quantity', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.55rem 0.75rem',
                              borderRadius: '8px',
                              border: '1px solid #CBD5E1',
                              fontSize: '0.84rem',
                              background: '#ffffff'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '2px' }}>
                            Posología e Instrucciones de Toma *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ej: 1 sobre al día con el desayuno disuelto en agua"
                            value={med.instructions}
                            onChange={(e) => handleMedicationChange(idx, 'instructions', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.55rem 0.75rem',
                              borderRadius: '8px',
                              border: '1px solid #CBD5E1',
                              fontSize: '0.84rem',
                              background: '#ffffff'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Indications */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#002182', marginBottom: '0.35rem' }}>
                  Indicaciones Adicionales al Paciente
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Aplicar frío local 15 minutos y evitar esfuerzos de carga."
                  value={indications}
                  onChange={(e) => setIndications(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    borderRadius: '10px',
                    border: '1.5px solid #D2E3FC',
                    fontSize: '0.86rem',
                    outline: 'none',
                    background: '#F8FAFD',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Clean Notice */}
              <div
                style={{
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: '10px',
                  padding: '0.65rem 0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  fontSize: '0.76rem',
                  color: '#166534'
                }}
              >
                <CheckCircle2 size={16} color="#16A34A" />
                <span>Receta médica oficial homologada con código CUIR asignado para dispensa farmacéutica nacional.</span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  style={{
                    padding: '0.7rem 1.25rem',
                    borderRadius: '10px',
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
                    padding: '0.7rem 1.5rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #076ABC 0%, #002182 100%)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(7, 106, 188, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FileText size={16} />
                  <span>Emitir Receta Médica</span>
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
