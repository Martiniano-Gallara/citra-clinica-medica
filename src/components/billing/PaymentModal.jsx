import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Modal } from '../common/Modal';
import { DollarSign, Receipt, CreditCard, Shield, User } from 'lucide-react';
import confetti from 'canvas-confetti';

export const PaymentModal = () => {
  const {
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    paymentPreloadData,
    patients,
    doctors,
    addInvoice,
    addToast
  } = useClinic();

  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    dni: '',
    doctorName: doctors[0]?.name || '',
    concept: 'Consulta Médica General',
    amount: 1500,
    paymentMethod: 'Efectivo',
    invoiceType: 'Factura B (Consumidor Final)',
    status: 'Cobrado'
  });

  useEffect(() => {
    if (paymentPreloadData) {
      setFormData((prev) => ({
        ...prev,
        ...paymentPreloadData
      }));
    } else {
      const defaultPat = patients[0] || {};
      setFormData({
        patientId: defaultPat.id || '',
        patientName: defaultPat.name || '',
        dni: defaultPat.dni || '',
        doctorName: doctors[0]?.name || '',
        concept: 'Copago de Consulta Especialidad',
        amount: 2000,
        paymentMethod: 'Tarjeta Débito',
        invoiceType: 'Factura B (Consumidor Final)',
        status: 'Cobrado'
      });
    }
  }, [paymentPreloadData, isPaymentModalOpen, patients, doctors]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.patientName || formData.amount <= 0) {
      addToast('Error', 'Debe seleccionar un paciente y monto válido.', 'error');
      return;
    }

    const invNumber = `FC-B 0001-0000${Math.floor(4820 + Math.random() * 2000)}`;

    addInvoice({
      ...formData,
      invoiceNumber: invNumber
    });

    // Throw celebratory confetti for payment registration
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch (e) {
      // ignore
    }

    setIsPaymentModalOpen(false);
  };

  return (
    <Modal
      isOpen={isPaymentModalOpen}
      onClose={() => setIsPaymentModalOpen(false)}
      title="Registrar Cobro / Emisión de Comprobante"
      size="default"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsPaymentModalOpen(false)}
          >
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
            <Receipt size={16} />
            <span>Confirmar & Cobrar</span>
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Paciente *</label>
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
            {patients.map((pat) => (
              <option key={pat.id} value={pat.id}>
                {pat.name} — DNI {pat.dni} ({pat.insuranceName})
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Médico / Profesional</label>
            <select
              className="form-control"
              value={formData.doctorName}
              onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
            >
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.name}>{doc.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tipo de Comprobante</label>
            <select
              className="form-control"
              value={formData.invoiceType}
              onChange={(e) => setFormData({ ...formData, invoiceType: e.target.value })}
            >
              <option value="Factura B (Consumidor Final)">Factura B (Consumidor Final)</option>
              <option value="Factura A (Responsable Inscripto)">Factura A (Resp. Inscripto)</option>
              <option value="Recibo X (Interno)">Recibo X (Caja Interna)</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Concepto del Cobro</label>
          <input
            type="text"
            className="form-control"
            placeholder="Ej: Copago Swiss Medical, Consulta particular..."
            value={formData.concept}
            onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Monto Total a Cobrar ($) *</label>
            <input
              type="number"
              className="form-control"
              style={{ fontSize: '1.2rem', fontWeight: 800, color: '#16a34a' }}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Método de Pago *</label>
            <select
              className="form-control"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta Débito">Tarjeta Débito</option>
              <option value="Tarjeta Crédito">Tarjeta Crédito</option>
              <option value="MercadoPago QR">MercadoPago QR</option>
              <option value="Transferencia Bancaria">Transferencia Bancaria</option>
              <option value="Obra Social / Prepaga">Obra Social / Prepaga</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
};
