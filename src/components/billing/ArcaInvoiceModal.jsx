import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Modal } from '../common/Modal';
import { QRCodeSVG } from 'qrcode.react';
import { Receipt, DollarSign, ShieldCheck, Printer, CheckCircle } from 'lucide-react';
import { generateAfipQRPayload, calculateDoctorHonorarios } from '../../utils/arcaValidator';
import confetti from 'canvas-confetti';

export const ArcaInvoiceModal = () => {
  const {
    isArcaInvoiceModalOpen,
    setIsArcaInvoiceModalOpen,
    arcaInvoicePreloadData,
    clinicInfo,
    patients,
    doctors,
    addArcaInvoice,
    addToast
  } = useClinic();

  const [formData, setFormData] = useState({
    patientId: patients[0]?.id || '',
    patientName: patients[0]?.name || '',
    dni: patients[0]?.dni || '',
    tipoCmp: 6, // Factura B
    tipoCmpName: 'Factura B (Consumidor Final)',
    concept: 'Consulta Médica Especializada Traumatología',
    doctorName: doctors[0]?.name || '',
    amount: 2500,
    paymentMethod: 'Tarjeta Débito',
    ivaCondition: 'Consumidor Final',
    docHonorarioPercent: 75
  });

  useEffect(() => {
    if (arcaInvoicePreloadData) {
      setFormData((prev) => ({
        ...prev,
        ...arcaInvoicePreloadData
      }));
    }
  }, [arcaInvoicePreloadData, isArcaInvoiceModalOpen]);

  const honorariosCalc = calculateDoctorHonorarios(formData.amount, formData.docHonorarioPercent);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.patientName || formData.amount <= 0) {
      addToast('Error', 'Debe seleccionar un paciente y monto válido.', 'error');
      return;
    }

    addArcaInvoice({
      ...formData,
      doctorHonorario: honorariosCalc.honorarioNeto
    });

    try {
      confetti({ particleCount: 35, spread: 55, origin: { y: 0.75 } });
    } catch (e) {}

    setIsArcaInvoiceModalOpen(false);
  };

  return (
    <Modal
      isOpen={isArcaInvoiceModalOpen}
      onClose={() => setIsArcaInvoiceModalOpen(false)}
      title="Emisión de Comprobante Fiscal Electrónico — ARCA (AFIP)"
      size="lg"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsArcaInvoiceModalOpen(false)}
          >
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
            <Receipt size={16} />
            <span>Emitir & Solicitar CAE a ARCA</span>
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <div style={{ background: '#e0f6f5', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #6FD0CC', marginBottom: '1.25rem', fontSize: '0.84rem', color: '#0C4E4C' }}>
          <strong>Conexión ARCA WebServices (WSFEv1):</strong> Emisión oficial de comprobante fiscal con validación de CUIT emisor <strong>{clinicInfo.cuit}</strong> en Punto de Venta <strong>N° {clinicInfo.arcaPtoVta}</strong>.
        </div>

        <div className="form-row">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Paciente Receptor *</label>
            <select
              className="form-control"
              value={formData.patientId}
              onChange={(e) => {
                const p = patients.find((pat) => pat.id === e.target.value);
                setFormData((prev) => ({
                  ...prev,
                  patientId: e.target.value,
                  patientName: p ? p.name : prev.patientName,
                  dni: p ? p.dni : prev.dni
                }));
              }}
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — DNI {p.dni} ({p.insuranceName})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tipo de Comprobante *</label>
            <select
              className="form-control"
              value={formData.tipoCmp}
              onChange={(e) => {
                const val = Number(e.target.value);
                const name = val === 1 ? 'Factura A (Responsable Inscripto)' : val === 6 ? 'Factura B (Consumidor Final)' : 'Factura C';
                setFormData({ ...formData, tipoCmp: val, tipoCmpName: name });
              }}
            >
              <option value={6}>Factura B (Consumidor Final / Prepaga)</option>
              <option value={1}>Factura A (Responsable Inscripto)</option>
              <option value={11}>Factura C (Prestación Exenta)</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Médico Prestador</label>
            <select
              className="form-control"
              value={formData.doctorName}
              onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.name}>{d.name} ({d.specialtyName})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Método de Pago</label>
            <select
              className="form-control"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            >
              <option value="Tarjeta Débito">Tarjeta Débito</option>
              <option value="MercadoPago QR">MercadoPago QR</option>
              <option value="Transferencia Bancaria">Transferencia Bancaria</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Obra Social / Prepaga">Obra Social / Prepaga</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Importe Total ($) *</label>
            <input
              type="number"
              className="form-control"
              style={{ fontWeight: 800, fontSize: '1.2rem', color: '#1A9E9B' }}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Concepto Facturado</label>
          <input
            type="text"
            className="form-control"
            value={formData.concept}
            onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
            required
          />
        </div>

        {/* Honorarios breakdown */}
        <div
          style={{
            background: '#F3FBFB',
            border: '1px solid #CDEEEE',
            padding: '0.85rem 1.15rem',
            borderRadius: '8px',
            marginTop: '1rem',
            fontSize: '0.85rem'
          }}
        >
          <div style={{ fontWeight: 700, color: '#0C4E4C', marginBottom: '4px' }}>
            Desglose de Liquidación de Honorarios Médicos ({formData.docHonorarioPercent}% convenido):
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1e3a39' }}>
            <span>Honorario Bruto: <strong>${honorariosCalc.honorarioBruto.toLocaleString()}</strong></span>
            <span>Retención IIBB (3.5%): <strong>-${honorariosCalc.retencion.toLocaleString()}</strong></span>
            <span>Honorario Neto a Liquidar: <strong style={{ color: '#1A9E9B' }}>${honorariosCalc.honorarioNeto.toLocaleString()}</strong></span>
          </div>
        </div>
      </form>
    </Modal>
  );
};
