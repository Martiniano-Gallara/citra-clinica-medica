import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Modal } from '../common/Modal';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, ShieldCheck, Pill, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { generateReNaPDiSVerificationUrl } from '../../utils/renapdisEngine';

export const PrescriptionDigitalModal = () => {
  const {
    selectedPrescriptionForView,
    setSelectedPrescriptionForView,
    clinicInfo,
    updatePrescriptionStatus,
    addToast
  } = useClinic();

  if (!selectedPrescriptionForView) return null;

  const rx = selectedPrescriptionForView;
  const qrUrl = generateReNaPDiSVerificationUrl(rx.cuir, rx.sisaRefeps, rx.patientDni);

  const handlePrint = () => {
    window.print();
  };

  const handleMarkDispensed = () => {
    const pharmacy = window.prompt('Ingrese el nombre de la Farmacia dispensadora:', 'Farmacia Central Arroyito');
    if (pharmacy) {
      updatePrescriptionStatus(rx.id, 'Dispensada', pharmacy);
    }
  };

  return (
    <Modal
      isOpen={!!selectedPrescriptionForView}
      onClose={() => setSelectedPrescriptionForView(null)}
      title="Receta Médica Electrónica Oficial ReNaPDiS"
      size="lg"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }} className="no-print">
          <div>
            {rx.dispensationStatus === 'Habilitada para Dispensa' && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleMarkDispensed}
              >
                <CheckCircle2 size={15} />
                <span>Simular Validación en Farmacia</span>
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSelectedPrescriptionForView(null)}
            >
              Cerrar
            </button>
            <button type="button" className="btn btn-primary" onClick={handlePrint}>
              <Printer size={16} />
              <span>Imprimir Receta Oficial</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="printable-area" style={{ background: '#ffffff', color: '#002182', padding: '1.25rem', fontFamily: 'serif' }}>
        {/* Top Official ReNaPDiS Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #002182', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <img
              src="/citra-icon.png"
              alt="CITRA Logo"
              style={{ width: '56px', height: '56px', objectFit: 'contain' }}
            />
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#002182', fontFamily: 'sans-serif' }}>
                {clinicInfo.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#496386', fontWeight: 700 }}>
                {clinicInfo.tagline}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Establecimiento {clinicInfo.sisaRefesCode} · CUIT: {clinicInfo.cuit}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right', fontFamily: 'sans-serif' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#076ABC' }}>
              RECETA ELECTRÓNICA OFICIAL
            </div>
            <div style={{ fontSize: '0.72rem', color: '#496386' }}>
              Plataforma ReNaPDiS: {clinicInfo.renapdisPlatformId}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#002182', fontWeight: 700, marginTop: '2px' }}>
              CUIR: {rx.cuir}
            </div>
          </div>
        </div>

        {/* Patient and Doctor Box */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            background: '#F5F8FE',
            border: '1px solid #D2E3FC',
            padding: '0.85rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.86rem',
            fontFamily: 'sans-serif'
          }}
        >
          <div>
            <div><strong>PACIENTE:</strong> {rx.patientName}</div>
            <div><strong>DNI:</strong> {rx.patientDni}</div>
            <div><strong>COBERTURA:</strong> {rx.patientInsurance}</div>
            <div><strong>DIAGNÓSTICO PRESUNTIVO:</strong> {rx.diagnosisPresuntivo}</div>
          </div>
          <div>
            <div><strong>PROFESIONAL:</strong> {rx.doctorName}</div>
            <div><strong>MATRÍCULA:</strong> {rx.doctorLicense}</div>
            <div><strong>REGISTRO SISA/REFEPS:</strong> {rx.sisaRefeps}</div>
            <div>
              <strong>ESTADO: </strong>
              <span style={{ color: rx.dispensationStatus === 'Dispensada' ? '#065f46' : '#076ABC', fontWeight: 700 }}>
                {rx.dispensationStatus} {rx.dispensedPharmacy ? `(${rx.dispensedPharmacy})` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Validity dates banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', background: '#EBF3FD', padding: '0.4rem 0.85rem', borderRadius: '6px', fontSize: '0.8rem', color: '#002182', marginBottom: '1rem', fontWeight: 600 }}>
          <span>Fecha de Emisión: <strong>{rx.issueDate}</strong></span>
          <span>Vencimiento (30 días): <strong>{rx.expirationDate}</strong></span>
        </div>

        {/* Prescriptions List Rp/ */}
        <div style={{ marginBottom: '1.5rem', border: '1px solid #257CE6', background: '#ffffff', padding: '1rem', borderRadius: '8px' }}>
          <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#002182', marginBottom: '0.75rem' }}>
            Rp/ (Prescripción por Denominación Común Internacional - DCI)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {rx.medications.map((med, idx) => (
              <div key={idx} style={{ paddingBottom: '0.65rem', borderBottom: idx < rx.medications.length - 1 ? '1px dashed #D2E3FC' : 'none' }}>
                <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#002182' }}>
                  {idx + 1}. {med.dci} — {med.concentration}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#172A4A', marginLeft: '1rem', marginTop: '2px' }}>
                  <strong>Forma Farmacéutica:</strong> {med.form} | <strong>Cantidad:</strong> {med.quantityUnits}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#496386', marginLeft: '1rem', fontStyle: 'italic' }}>
                  Posología / Indicaciones: {med.instructions}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QR Code and Cryptographic Signature Box */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #D2E3FC', paddingTop: '1rem', marginTop: '1rem' }}>
          {/* QR Code for Pharmacy Scanner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: '#ffffff', padding: '6px', border: '1px solid #D2E3FC', borderRadius: '6px' }}>
              <QRCodeSVG value={qrUrl} size={84} level="M" />
            </div>
            <div style={{ fontSize: '0.72rem', color: '#496386', maxWidth: '220px' }}>
              <strong>Código QR de Validación Farmacéutica</strong>
              <div>Escaneable por farmacias adheridas para dispensa oficial.</div>
            </div>
          </div>

          {/* Digital Signature */}
          <div style={{ textAlign: 'center', minWidth: '220px', borderTop: '1px solid #002182', paddingTop: '0.4rem' }}>
            <div style={{ fontStyle: 'italic', color: '#076ABC', fontWeight: 800, fontSize: '0.95rem' }}>
              {rx.doctorName}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#002182', fontWeight: 600 }}>{rx.doctorLicense}</div>
            <div style={{ fontSize: '0.72rem', color: '#065f46', fontWeight: 700 }}>
              Firma Digital Verificada (X.509)
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Hash: {rx.digitalSignatureHash?.substring(0, 20)}...</div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
