import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Modal } from '../common/Modal';
import { Printer, HeartPulse, Stethoscope, Download, CheckCircle } from 'lucide-react';

export const ConsultationPrintView = () => {
  const {
    selectedConsultationForPrint,
    setSelectedConsultationForPrint,
    clinicInfo,
    patients
  } = useClinic();

  if (!selectedConsultationForPrint) return null;

  const cons = selectedConsultationForPrint;
  const pat = patients.find((p) => p.id === cons.patientId) || {
    name: cons.patientName,
    dni: '34.892.110',
    insuranceName: 'OSDE',
    insurancePlan: '310',
    insuranceNumber: '310-892110-01'
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={!!selectedConsultationForPrint}
      onClose={() => setSelectedConsultationForPrint(null)}
      title="Informe de Consulta Médica & Recetario Oficial"
      size="lg"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }} className="no-print">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setSelectedConsultationForPrint(null)}
          >
            Cerrar
          </button>
          <button type="button" className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            <span>Imprimir / Guardar PDF</span>
          </button>
        </div>
      }
    >
      <div className="printable-area" style={{ background: '#ffffff', color: '#0f172a', padding: '1rem', fontFamily: 'serif' }}>
        {/* Clinic Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img
              src="/citra-icon.png"
              alt="CITRA Logo"
              style={{ width: '60px', height: '60px', objectFit: 'contain' }}
            />
            <div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1e3a8a', margin: 0, fontFamily: 'sans-serif' }}>
                {clinicInfo.name}
              </h1>
              <div style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>{clinicInfo.tagline}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                {clinicInfo.address} · Tel: {clinicInfo.phone} · CUIT: {clinicInfo.cuit}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>FECHA: {cons.date}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>HORA: {cons.time} hs</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID CONSULTA: {cons.id}</div>
          </div>
        </div>

        {/* Patient and Doctor Box */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
          <div>
            <div><strong>PACIENTE:</strong> {pat.name}</div>
            <div><strong>DNI:</strong> {pat.dni}</div>
            <div><strong>COBERTURA:</strong> {pat.insuranceName} ({pat.insurancePlan})</div>
            <div><strong>N° AFILIADO:</strong> {pat.insuranceNumber || '-'}</div>
          </div>
          <div>
            <div><strong>MÉDICO TRATANTE:</strong> {cons.doctorName}</div>
            <div><strong>ESPECIALIDAD:</strong> {cons.specialtyName}</div>
            <div><strong>MATRÍCULA:</strong> {cons.doctorLicense}</div>
            <div><strong>ESTADO:</strong> Registro Firmado Digitalmente</div>
          </div>
        </div>

        {/* Clinical Summary */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.92rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem', marginBottom: '0.5rem', color: '#1e3a8a' }}>
            1. MOTIVO DE CONSULTA & DIAGNÓSTICO
          </div>
          <div style={{ fontSize: '0.88rem', marginBottom: '0.35rem' }}><strong>Motivo:</strong> {cons.reason}</div>
          <div style={{ fontSize: '0.88rem' }}><strong>Diagnóstico (CIE-10):</strong> {cons.diagnosis}</div>
          {cons.secondaryDiagnosis && <div style={{ fontSize: '0.88rem' }}><strong>Diagnóstico Secundario:</strong> {cons.secondaryDiagnosis}</div>}
        </div>

        {/* Vitals */}
        {cons.vitals && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem', marginBottom: '0.5rem', color: '#1e3a8a' }}>
              2. SIGNOS VITALES & PARÁMETROS CLÍNICOS
            </div>
            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', flexWrap: 'wrap' }}>
              <span><strong>T.A.:</strong> {cons.vitals.bpSystolic}/{cons.vitals.bpDiastolic} mmHg</span>
              <span><strong>F.C.:</strong> {cons.vitals.heartRate} lpm</span>
              <span><strong>F.R.:</strong> {cons.vitals.respiratoryRate} rpm</span>
              <span><strong>Temp.:</strong> {cons.vitals.temperature} °C</span>
              <span><strong>Peso:</strong> {cons.vitals.weight} kg</span>
              <span><strong>Altura:</strong> {cons.vitals.height} m</span>
              <span><strong>IMC:</strong> {cons.vitals.bmi} ({cons.vitals.bmiCategory})</span>
            </div>
          </div>
        )}

        {/* Medical Evolución */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.92rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem', marginBottom: '0.5rem', color: '#1e3a8a' }}>
            3. EVOLUCIÓN MÉDICA & EXAMEN FÍSICO
          </div>
          <p style={{ fontSize: '0.88rem', lineHeight: 1.6, textAlign: 'justify' }}>
            {cons.evolution}
          </p>
        </div>

        {/* Prescriptions / Receta (RP/) */}
        {cons.prescriptions && cons.prescriptions.length > 0 && (
          <div style={{ marginBottom: '1.25rem', border: '1px solid #93c5fd', background: '#eff6ff', padding: '0.85rem', borderRadius: '6px' }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1e40af', marginBottom: '0.5rem' }}>
              Rp/ (RECETA MÉDICA DIGITAL)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {cons.prescriptions.map((p, idx) => (
                <div key={idx} style={{ fontSize: '0.9rem', color: '#1e293b' }}>
                  <strong>{idx + 1}. {p.medication}</strong> ({p.dosage})
                  <div style={{ fontSize: '0.84rem', color: '#334155', marginLeft: '1rem' }}>
                    Tomar: {p.frequency || '-'} · Duración: {p.duration || '-'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Indications & Studies */}
        {cons.indications && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem', marginBottom: '0.5rem', color: '#1e3a8a' }}>
              4. INDICACIONES & PAUTAS DE ALERTA
            </div>
            <div style={{ fontSize: '0.88rem', whiteSpace: 'pre-line', lineHeight: 1.5 }}>
              {cons.indications}
            </div>
          </div>
        )}

        {/* Studies Requested */}
        {cons.studiesRequested && cons.studiesRequested.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem', marginBottom: '0.5rem', color: '#1e3a8a' }}>
              5. ESTUDIOS SOLICITADOS
            </div>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.88rem' }}>
              {cons.studiesRequested.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Digital Signature */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2.5rem' }}>
          <div style={{ textAlign: 'center', minWidth: '220px', borderTop: '1px solid #0f172a', paddingTop: '0.5rem' }}>
            <div style={{ fontStyle: 'italic', color: '#2563eb', fontWeight: 700, fontSize: '1rem' }}>
              {cons.doctorName}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#475569' }}>{cons.doctorLicense}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Firma Digitalizada Validada</div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{cons.signatureTimestamp || cons.date}</div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
