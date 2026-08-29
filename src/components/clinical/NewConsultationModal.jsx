import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Modal } from '../common/Modal';
import { CIE10_COMMON_DIAGNOSES } from '../../data/mockData';
import {
  Stethoscope,
  Activity,
  Heart,
  Plus,
  Trash2,
  FileCheck,
  AlertTriangle,
  Pill,
  Sparkles
} from 'lucide-react';

export const NewConsultationModal = () => {
  const {
    isNewConsultationModalOpen,
    setIsNewConsultationModalOpen,
    consultationPreloadData,
    doctors,
    patients,
    addConsultation,
    addToast
  } = useClinic();

  const [formData, setFormData] = useState({
    appointmentId: '',
    patientId: '',
    patientName: '',
    doctorId: doctors[0]?.id || '',
    doctorName: doctors[0]?.name || '',
    doctorLicense: doctors[0]?.license || 'MN 114.829',
    specialtyName: doctors[0]?.specialtyName || 'Cardiología',
    reason: '',
    symptoms: '',
    vitals: {
      bpSystolic: 120,
      bpDiastolic: 80,
      heartRate: 75,
      respiratoryRate: 16,
      temperature: 36.5,
      weight: 70,
      height: 1.70,
      bmi: 24.2,
      bmiCategory: 'Peso normal'
    },
    diagnosis: 'I10 - Hipertensión esencial (primaria)',
    secondaryDiagnosis: '',
    evolution: '',
    prescriptions: [
      { medication: '', dosage: '', frequency: '', duration: '' }
    ],
    indications: '',
    studiesRequested: ''
  });

  const [diagnosisQuery, setDiagnosisQuery] = useState('');
  const [showDiagnosisDropdown, setShowDiagnosisDropdown] = useState(false);

  useEffect(() => {
    if (consultationPreloadData) {
      const defaultDoc = doctors.find((d) => d.id === consultationPreloadData.doctorId) || doctors[0];
      setFormData((prev) => ({
        ...prev,
        ...consultationPreloadData,
        doctorId: defaultDoc.id,
        doctorName: defaultDoc.name,
        doctorLicense: defaultDoc.license,
        specialtyName: defaultDoc.specialtyName,
        reason: consultationPreloadData.reason || prev.reason
      }));
    } else {
      const defaultPat = patients[0] || {};
      const defaultDoc = doctors[0] || {};
      setFormData({
        appointmentId: '',
        patientId: defaultPat.id || '',
        patientName: defaultPat.name || '',
        doctorId: defaultDoc.id || '',
        doctorName: defaultDoc.name || '',
        doctorLicense: defaultDoc.license || '',
        specialtyName: defaultDoc.specialtyName || '',
        reason: 'Consulta de control clínico general',
        symptoms: '',
        vitals: {
          bpSystolic: 120,
          bpDiastolic: 80,
          heartRate: 75,
          respiratoryRate: 16,
          temperature: 36.5,
          weight: 70,
          height: 1.70,
          bmi: 24.2,
          bmiCategory: 'Peso normal'
        },
        diagnosis: 'Z00.0 - Examen médico general de rutina / Apto físico',
        secondaryDiagnosis: '',
        evolution: 'Paciente refiere sentirse en buen estado general. Sin sintomatología aguda.',
        prescriptions: [],
        indications: 'Control periódico y mantener hábitos de vida saludables.',
        studiesRequested: ''
      });
    }
  }, [consultationPreloadData, isNewConsultationModalOpen, doctors, patients]);

  // Recalculate BMI when weight or height changes
  const handleVitalsChange = (field, value) => {
    const updatedVitals = { ...formData.vitals, [field]: Number(value) };
    if (field === 'weight' || field === 'height') {
      const w = field === 'weight' ? Number(value) : formData.vitals.weight;
      const h = field === 'height' ? Number(value) : formData.vitals.height;
      if (w > 0 && h > 0) {
        const bmiVal = Number((w / (h * h)).toFixed(1));
        let cat = 'Peso normal';
        if (bmiVal < 18.5) cat = 'Bajo peso';
        else if (bmiVal >= 25 && bmiVal < 30) cat = 'Sobrepeso';
        else if (bmiVal >= 30) cat = 'Obesidad';
        updatedVitals.bmi = bmiVal;
        updatedVitals.bmiCategory = cat;
      }
    }
    setFormData((prev) => ({ ...prev, vitals: updatedVitals }));
  };

  // Prescriptions handling
  const handleAddPrescription = () => {
    setFormData((prev) => ({
      ...prev,
      prescriptions: [...prev.prescriptions, { medication: '', dosage: '', frequency: '', duration: '' }]
    }));
  };

  const handleRemovePrescription = (index) => {
    setFormData((prev) => ({
      ...prev,
      prescriptions: prev.prescriptions.filter((_, i) => i !== index)
    }));
  };

  const handlePrescriptionChange = (index, field, value) => {
    setFormData((prev) => {
      const list = [...prev.prescriptions];
      list[index][field] = value;
      return { ...prev, prescriptions: list };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.patientName || !formData.diagnosis) {
      addToast('Error', 'Debe seleccionar un paciente y especificar un diagnóstico.', 'error');
      return;
    }

    const payload = {
      ...formData,
      studiesRequested: formData.studiesRequested
        ? formData.studiesRequested.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      prescriptions: formData.prescriptions.filter((p) => p.medication.trim())
    };

    addConsultation(payload);
    setIsNewConsultationModalOpen(false);
  };

  const matchedCIE10 = diagnosisQuery
    ? CIE10_COMMON_DIAGNOSES.filter((d) =>
        d.label.toLowerCase().includes(diagnosisQuery.toLowerCase())
      )
    : CIE10_COMMON_DIAGNOSES;

  return (
    <Modal
      isOpen={isNewConsultationModalOpen}
      onClose={() => setIsNewConsultationModalOpen(false)}
      title="Registrar Consulta Médica & Historia Clínica Electrónica"
      size="xl"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Al guardar, se firmará digitalmente por <strong>{formData.doctorName}</strong>.
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsNewConsultationModalOpen(false)}
            >
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit}>
              <FileCheck size={16} />
              <span>Guardar & Firmar Consulta</span>
            </button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        {/* Patient & Doctor Assignment */}
        <div className="form-row" style={{ marginBottom: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Paciente *</label>
            <select
              className="form-control"
              value={formData.patientId}
              onChange={(e) => {
                const pat = patients.find((p) => p.id === e.target.value);
                setFormData((prev) => ({
                  ...prev,
                  patientId: e.target.value,
                  patientName: pat ? pat.name : prev.patientName
                }));
              }}
            >
              {patients.map((pat) => (
                <option key={pat.id} value={pat.id}>
                  {pat.name} — DNI {pat.dni} ({pat.insuranceName})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Médico Tratante *</label>
            <select
              className="form-control"
              value={formData.doctorId}
              onChange={(e) => {
                const doc = doctors.find((d) => d.id === e.target.value);
                setFormData((prev) => ({
                  ...prev,
                  doctorId: e.target.value,
                  doctorName: doc ? doc.name : prev.doctorName,
                  doctorLicense: doc ? doc.license : prev.doctorLicense,
                  specialtyName: doc ? doc.specialtyName : prev.specialtyName
                }));
              }}
            >
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} — {doc.specialtyName} ({doc.license})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 1. Motivo y Síntomas */}
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2563eb', marginBottom: '0.6rem' }}>
          1. Motivo de Consulta & Anamnesis
        </div>
        <div className="form-row">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Motivo Principal de Consulta *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ej: Control de presión arterial, dolor articular, cefalea recurrente..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
            />
          </div>
        </div>

        {/* 2. Signos Vitales y Parámetros */}
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2563eb', margin: '1rem 0 0.6rem' }}>
          2. Signos Vitales & Medición Antropométrica
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '0.75rem',
            background: '#f8fafc',
            padding: '1rem',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            marginBottom: '1rem'
          }}
        >
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.74rem' }}>TA Sistólica (mmHg)</label>
            <input
              type="number"
              className="form-control"
              value={formData.vitals.bpSystolic}
              onChange={(e) => handleVitalsChange('bpSystolic', e.target.value)}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.74rem' }}>TA Diastólica (mmHg)</label>
            <input
              type="number"
              className="form-control"
              value={formData.vitals.bpDiastolic}
              onChange={(e) => handleVitalsChange('bpDiastolic', e.target.value)}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.74rem' }}>FC (lpm)</label>
            <input
              type="number"
              className="form-control"
              value={formData.vitals.heartRate}
              onChange={(e) => handleVitalsChange('heartRate', e.target.value)}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.74rem' }}>Temp (°C)</label>
            <input
              type="number"
              step="0.1"
              className="form-control"
              value={formData.vitals.temperature}
              onChange={(e) => handleVitalsChange('temperature', e.target.value)}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.74rem' }}>Peso (kg)</label>
            <input
              type="number"
              step="0.1"
              className="form-control"
              value={formData.vitals.weight}
              onChange={(e) => handleVitalsChange('weight', e.target.value)}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.74rem' }}>Altura (m)</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              value={formData.vitals.height}
              onChange={(e) => handleVitalsChange('height', e.target.value)}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.74rem' }}>IMC Calculado</label>
            <div style={{ padding: '0.55rem', background: '#eff6ff', borderRadius: '6px', fontWeight: 800, color: '#2563eb', textAlign: 'center', fontSize: '0.88rem' }}>
              {formData.vitals.bmi} <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>({formData.vitals.bmiCategory})</span>
            </div>
          </div>
        </div>

        {/* 3. Diagnóstico (CIE-10) */}
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2563eb', margin: '1rem 0 0.6rem' }}>
          3. Diagnóstico Clínico (CIE-10)
        </div>
        <div className="form-row">
          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Diagnóstico Principal *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar código o diagnóstico..."
              value={formData.diagnosis}
              onChange={(e) => {
                setFormData({ ...formData, diagnosis: e.target.value });
                setDiagnosisQuery(e.target.value);
                setShowDiagnosisDropdown(true);
              }}
              onFocus={() => setShowDiagnosisDropdown(true)}
              required
            />

            {showDiagnosisDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 60,
                  maxHeight: '160px',
                  overflowY: 'auto'
                }}
              >
                {matchedCIE10.map((d) => (
                  <div
                    key={d.code}
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, diagnosis: d.label }));
                      setShowDiagnosisDropdown(false);
                    }}
                    style={{
                      padding: '0.5rem 0.75rem',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      borderBottom: '1px solid #f1f5f9'
                    }}
                    className="hover-subtle"
                  >
                    <strong>{d.code}</strong> — {d.label.split(' - ')[1]}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Diagnóstico Secundario / Comorbilidad</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ej: E78.0 - Dislipemia mixta"
              value={formData.secondaryDiagnosis}
              onChange={(e) => setFormData({ ...formData, secondaryDiagnosis: e.target.value })}
            />
          </div>
        </div>

        {/* 4. Evolución Médica */}
        <div className="form-group">
          <label className="form-label">Evolución Médica & Examen Físico Completo *</label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Detalles del examen físico, auscultación, estado general y evolución..."
            value={formData.evolution}
            onChange={(e) => setFormData({ ...formData, evolution: e.target.value })}
            required
          />
        </div>

        {/* 5. Prescripciones / Recetario Digital */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1.25rem 0 0.6rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2563eb' }}>
            4. Prescripción Farmacológica (Rp/)
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleAddPrescription}
          >
            <Plus size={14} />
            <span>Agregar Medicamento</span>
          </button>
        </div>

        {formData.prescriptions.map((presc, idx) => (
          <div
            key={idx}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1.2fr 2fr 1.5fr 40px',
              gap: '0.5rem',
              alignItems: 'center',
              marginBottom: '0.5rem',
              background: '#f8fafc',
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}
          >
            <input
              type="text"
              className="form-control"
              placeholder="Fármaco (Ej: Amoxicilina 500mg)"
              value={presc.medication}
              onChange={(e) => handlePrescriptionChange(idx, 'medication', e.target.value)}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Dosis (Ej: 1 comp.)"
              value={presc.dosage}
              onChange={(e) => handlePrescriptionChange(idx, 'dosage', e.target.value)}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Frecuencia (Ej: Cada 8 hs)"
              value={presc.frequency}
              onChange={(e) => handlePrescriptionChange(idx, 'frequency', e.target.value)}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Duración (Ej: 7 días)"
              value={presc.duration}
              onChange={(e) => handlePrescriptionChange(idx, 'duration', e.target.value)}
            />
            <button
              type="button"
              className="btn btn-danger btn-icon"
              onClick={() => handleRemovePrescription(idx)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {/* 6. Indicaciones & Estudios */}
        <div className="form-row" style={{ marginTop: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Indicaciones & Pautas de Alarma</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Dieta, reposo, actividad física, cuidados..."
              value={formData.indications}
              onChange={(e) => setFormData({ ...formData, indications: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Solicitud de Estudios Complementarios (separados por coma)</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Ej: Hemograma completo, Radiografía de tórax frente y perfil, Ecografía..."
              value={formData.studiesRequested}
              onChange={(e) => setFormData({ ...formData, studiesRequested: e.target.value })}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
