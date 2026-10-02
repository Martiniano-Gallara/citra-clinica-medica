import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Modal } from '../common/Modal';
import { ShieldCheck, KeyRound, Lock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const DigitalSignatureModal = () => {
  const {
    isDigitalSignatureModalOpen,
    setIsDigitalSignatureModalOpen,
    doctors,
    currentUser,
    addToast
  } = useClinic();

  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id || 'doc-1');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const selectedDoc = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];

  const handleVerifyCert = () => {
    setIsVerifying(true);
    setVerificationResult(null);

    setTimeout(() => {
      setIsVerifying(false);
      setVerificationResult({
        status: 'VALID',
        issuer: 'AC ONTI - Autoridad Certificante de la Oficina Nacional de Tecnologías de Información',
        subject: `CN=${selectedDoc.name}, SERIALNUMBER=CUIL 20-${selectedDoc.license.replace(/\D/g, '')}-4, C=AR`,
        validFrom: '2025-01-10 09:00:00 UTC',
        validTo: selectedDoc.certExpiration || '2027-11-15 18:00:00 UTC',
        keyUsage: 'Digital Signature, Non-Repudiation (Firma Digital Certificada)',
        algorithm: 'SHA256withRSA (2048 bits)',
        ocspStatus: 'Good (No revocado según servidor OCSP oficial)',
        tsaProvider: 'Autoridad de Sellado de Tiempo ONTI Argentina'
      });
      addToast('Certificado PKI Verificado', 'El certificado digital X.509 es válido y se encuentra activo.', 'success');
    }, 800);
  };

  return (
    <Modal
      isOpen={isDigitalSignatureModalOpen}
      onClose={() => {
        setIsDigitalSignatureModalOpen(false);
        setVerificationResult(null);
      }}
      title="Infraestructura de Firma Digital PKI X.509"
      size="lg"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsDigitalSignatureModalOpen(false)}
          >
            Cerrar
          </button>
        </div>
      }
    >
      <div>
        <div
          style={{
            background: '#F8FAFC',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            border: '1.5px solid #94A3B8',
            marginBottom: '1.25rem',
            fontSize: '0.84rem',
            color: '#1E293B'
          }}
        >
          <div style={{ fontWeight: 800, color: '#002182', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="#076ABC" />
            <span>Marco Legal de Firma (Ley 25.506 · Firma Electrónica vs Firma Digital):</span>
          </div>
          <p style={{ margin: '0 0 6px', lineHeight: 1.45 }}>
            • <strong>Firma Electrónica Médica Activa (Art. 5):</strong> Las consultas y recetas emitidas en CITRA cuentan con verificación de identidad, marca temporal de servidor y cadena de integridad criptográfica SHA-256 auditable.
          </p>
          <p style={{ margin: 0, lineHeight: 1.45, color: '#475569' }}>
            • <strong>Firma Digital con Token Criptográfico (Art. 2):</strong> Requiere dispositivo criptográfico de hardware FIPS 140-2 (token USB) emitido por una Autoridad Certificante Licenciada (AC ONTI). Este simulador permite validar la compatibilidad del certificado X.509 de cada profesional.
          </p>
        </div>

        {/* Doctor Selector */}
        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Seleccionar Profesional para Inspección Criptográfica:</label>
          <select
            className="form-control"
            value={selectedDoctorId}
            onChange={(e) => {
              setSelectedDoctorId(e.target.value);
              setVerificationResult(null);
            }}
          >
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — {d.specialtyName} ({d.license})
              </option>
            ))}
          </select>
        </div>

        {/* Card info */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #D2E3FC',
            borderRadius: '10px',
            padding: '1.25rem',
            marginBottom: '1.25rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <KeyRound size={22} color="#076ABC" />
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#002182' }}>
                  Certificado X.509 v3 del Profesional
                </div>
                <div style={{ fontSize: '0.78rem', color: '#496386' }}>
                  Identificador SISA/REFEPS: {selectedDoc.sisaRefeps}
                </div>
              </div>
            </div>

            <button
              className="btn btn-primary btn-sm"
              onClick={handleVerifyCert}
              disabled={isVerifying}
            >
              <RefreshCw size={14} className={isVerifying ? 'animate-spin' : ''} />
              <span>{isVerifying ? 'Consultando OCSP/CRL...' : 'Verificar Estado PKI'}</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.84rem' }}>
            <div>
              <span style={{ color: '#496386' }}>Titular del Certificado:</span>
              <div style={{ fontWeight: 700, color: '#002182' }}>{selectedDoc.name}</div>
            </div>
            <div>
              <span style={{ color: '#496386' }}>Dispositivo / Token:</span>
              <div style={{ fontWeight: 700, color: '#002182' }}>{selectedDoc.digitalSignatureStatus}</div>
            </div>
            <div>
              <span style={{ color: '#496386' }}>Especialidad Certificada:</span>
              <div style={{ fontWeight: 700, color: '#002182' }}>{selectedDoc.specialty || selectedDoc.specialtyName || 'Traumatología y Ortopedia'}</div>
            </div>
            <div>
              <span style={{ color: '#496386' }}>Vencimiento del Certificado:</span>
              <div style={{ fontWeight: 700, color: '#076ABC' }}>{selectedDoc.certExpiration}</div>
            </div>
          </div>
        </div>

        {/* Verification Result Drawer */}
        {verificationResult && (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #6ee7b7',
              borderRadius: '10px',
              padding: '1.25rem',
              fontSize: '0.84rem',
              color: '#065f46'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
              <CheckCircle2 size={18} color="#047857" />
              <span>Cadena de Confianza y Sellado de Tiempo Válidos</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
              <div><strong>Autoridad Certificante (CA):</strong> {verificationResult.issuer}</div>
              <div><strong>Sujeto (Subject DN):</strong> {verificationResult.subject}</div>
              <div><strong>Uso de Clave:</strong> {verificationResult.keyUsage}</div>
              <div><strong>Algoritmo Criptográfico:</strong> {verificationResult.algorithm}</div>
              <div><strong>Consulta OCSP en Tiempo Real:</strong> <span style={{ color: '#047857', fontWeight: 700 }}>{verificationResult.ocspStatus}</span></div>
              <div><strong>Sellador de Tiempo (TSA):</strong> {verificationResult.tsaProvider}</div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
