import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Receipt,
  DollarSign,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  CreditCard,
  Building2,
  TrendingUp,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  QrCode,
  ShieldCheck,
  UserCheck,
  Check
} from 'lucide-react';
import { PaymentModal } from './PaymentModal';
import { ArcaInvoiceModal } from './ArcaInvoiceModal';

export const BillingView = () => {
  const {
    invoices,
    doctors,
    setIsPaymentModalOpen,
    setPaymentPreloadData,
    setIsArcaInvoiceModalOpen,
    setArcaInvoicePreloadData,
    clinicInfo,
    addToast
  } = useClinic();

  const [activeSubTab, setActiveSubTab] = useState('invoices'); // 'invoices' or 'honorarios'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('all');

  // KPI Calculations
  const totalFacturado = invoices.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalHonorariosMedicos = invoices.reduce((acc, curr) => acc + (curr.doctorHonorario || Math.round(curr.amount * 0.75)), 0);
  const totalRetencionClinica = totalFacturado - totalHonorariosMedicos;

  const filteredInvoices = invoices.filter((inv) => {
    const cleanQ = searchTerm.toLowerCase();
    const matchSearch =
      inv.patientName.toLowerCase().includes(cleanQ) ||
      inv.invoiceNumber.toLowerCase().includes(cleanQ) ||
      inv.concept.toLowerCase().includes(cleanQ) ||
      (inv.dni && inv.dni.includes(cleanQ)) ||
      (inv.cae && inv.cae.includes(cleanQ));

    const matchMethod = filterMethod === 'all' || inv.paymentMethod === filterMethod;
    return matchSearch && matchMethod;
  });

  const handleExportCSV = () => {
    const headers = ['Nro Comprobante', 'CAE ARCA', 'Vto CAE', 'Fecha', 'Paciente', 'DNI', 'Concepto', 'Médico', 'Importe ($)', 'Honorario Médico ($)', 'Metodo Pago', 'Estado'];
    const rows = filteredInvoices.map((i) => [
      i.invoiceNumber,
      i.cae || '74291823901248',
      i.caeVto || '2026-09-07',
      i.date,
      `"${i.patientName}"`,
      i.dni || '-',
      `"${i.concept}"`,
      `"${i.doctorName || '-'}"`,
      i.amount,
      i.doctorHonorario || Math.round(i.amount * 0.75),
      `"${i.paymentMethod}"`,
      i.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CITRA_Libro_IVA_Ventas_ARCA_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="billing-container">
      {/* Modals */}
      <PaymentModal />
      <ArcaInvoiceModal />

      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Receipt size={32} color="#076ABC" />
            <span>Facturación ARCA (AFIP) & Honorarios Médicos</span>
          </h1>
          <p>
            Comprobantes fiscales electrónicos con CAE, liquidación de honorarios y control de caja (Pto Vta {clinicInfo.arcaPtoVta})
          </p>
        </div>

        <div className="page-actions-group">
          <button className="btn btn-outline" onClick={handleExportCSV}>
            <FileSpreadsheet size={16} />
            <span>Exportar Libro IVA Ventas</span>
          </button>

          <button
            className="btn btn-primary"
            onClick={() => {
              setArcaInvoicePreloadData(null);
              setIsArcaInvoiceModalOpen(true);
            }}
          >
            <Plus size={18} />
            <span>+ Emitir Factura Electrónica ARCA</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Facturación Total Emitida</span>
            <div className="kpi-icon-box" style={{ background: '#EBF3FD', color: '#076ABC' }}>
              <DollarSign size={24} />
            </div>
          </div>
          <div className="kpi-value">${totalFacturado.toLocaleString()}</div>
          <div className="kpi-trend positive">
            <ShieldCheck size={16} />
            <span>100% Comprobantes con CAE ARCA</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Honorarios Médicos Liquidados</span>
            <div className="kpi-icon-box" style={{ background: '#d1fae5', color: '#065f46' }}>
              <UserCheck size={24} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#065f46' }}>
            ${totalHonorariosMedicos.toLocaleString()}
          </div>
          <div className="kpi-trend positive">
            <span>Para {doctors.length} profesionales</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Retención Operativa Clínica</span>
            <div className="kpi-icon-box" style={{ background: '#fef3c7', color: '#92400e' }}>
              <Building2 size={24} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#002182' }}>
            ${totalRetencionClinica.toLocaleString()}
          </div>
          <div className="kpi-trend positive">
            <span>25% Arancel institucional</span>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="tabs-header" style={{ marginBottom: '1.5rem' }}>
        <button
          className={`tab-btn ${activeSubTab === 'invoices' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('invoices')}
        >
          <Receipt size={18} />
          <span>Comprobantes Fiscales ARCA ({filteredInvoices.length})</span>
        </button>

        <button
          className={`tab-btn ${activeSubTab === 'caja' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('caja')}
        >
          <DollarSign size={18} />
          <span>Caja Diaria & Arqueos de Turno</span>
        </button>

        <button
          className={`tab-btn ${activeSubTab === 'honorarios' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('honorarios')}
        >
          <UserCheck size={18} />
          <span>Liquidación por Profesional ({doctors.length})</span>
        </button>
      </div>

      {activeSubTab === 'invoices' ? (
        <div>
          {/* Filters */}
          <div className="filter-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
              <Search size={18} color="#076ABC" />
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por comprobante, CAE, paciente o DNI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ minWidth: '200px' }}>
              <select
                className="form-control"
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
              >
                <option value="all">Todos los Métodos de Pago</option>
                <option value="Tarjeta Débito">Tarjeta Débito</option>
                <option value="MercadoPago QR">MercadoPago QR</option>
                <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Obra Social / Prepaga">Obra Social / Prepaga</option>
              </select>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>N° Comprobante</th>
                  <th>CAE ARCA / Vto</th>
                  <th>Fecha</th>
                  <th>Paciente / DNI</th>
                  <th>Concepto Prestacional</th>
                  <th>Profesional</th>
                  <th>Total Facturado</th>
                  <th>Honorario Médico</th>
                  <th>Medio de Pago</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <div style={{ fontWeight: 800, color: '#002182' }}>{inv.invoiceNumber}</div>
                      <div style={{ fontSize: '0.74rem', color: '#496386' }}>Pto Vta 0001 · CUIT {clinicInfo.cuit}</div>
                    </td>
                    <td>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#076ABC' }}>
                        {inv.cae || '74291823901248'}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        Vto: {inv.caeVto || '2026-09-07'}
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{inv.date}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#002182' }}>{inv.patientName}</div>
                      <div style={{ fontSize: '0.76rem', color: '#496386' }}>DNI: {inv.dni || '-'}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{inv.concept}</td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{inv.doctorName || 'Clínica CITRA'}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 900, color: '#002182', fontSize: '1.05rem' }}>
                        ${inv.amount.toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#065f46' }}>
                        ${(inv.doctorHonorario || Math.round(inv.amount * 0.75)).toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', background: '#F5F8FE', border: '1px solid #D2E3FC', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td>
                      <span style={{ background: '#d1fae5', color: '#065f46', padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.76rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Check size={12} />
                        <span>{inv.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeSubTab === 'caja' ? (
        /* CAJA DIARIA & ARQUEOS DE TURNO VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {cashClosures.map((caja) => (
            <div key={caja.id} className="card" style={{ border: '2px solid var(--c-primary)' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="badge badge-teal" style={{ marginBottom: '0.35rem' }}>{caja.id}</div>
                  <h3 className="card-title">{caja.shift} — {caja.date}</h3>
                  <p className="card-subtitle">Responsable de Caja: <strong>{caja.cashierName}</strong></p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      const amount = prompt('Monto del Egreso Menor ($):', '2500');
                      const concept = prompt('Concepto del Egreso:', 'Artículos de limpieza / librería');
                      if (amount && concept) {
                        const { addCashMovement } = useClinic; // or called from hook
                      }
                    }}
                  >
                    - Registrar Egreso
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => addToast('Arqueo de Turno Cerrado', 'Cierre de caja exportado y archivado.', 'success')}
                  >
                    <CheckCircle2 size={15} />
                    Cerrar y Arquear Turno
                  </button>
                </div>
              </div>

              {/* Balances Breakdown Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="data-box">
                  <span className="data-box-label">Saldo Inicial Fondo Fijo</span>
                  <span className="data-box-value">${caja.openingBalance?.toLocaleString()}</span>
                </div>
                <div className="data-box">
                  <span className="data-box-label">Efectivo Cobrado</span>
                  <span className="data-box-value" style={{ color: '#059669' }}>+${caja.totalCash?.toLocaleString()}</span>
                </div>
                <div className="data-box">
                  <span className="data-box-label">Tarjetas Déb/Créd</span>
                  <span className="data-box-value">+${caja.totalCards?.toLocaleString()}</span>
                </div>
                <div className="data-box">
                  <span className="data-box-label">Mercado Pago / Transfer</span>
                  <span className="data-box-value">+${caja.totalQrTransfer?.toLocaleString()}</span>
                </div>
                <div className="data-box" style={{ background: '#fee2e2', border: '1px solid #fca5a5' }}>
                  <span className="data-box-label" style={{ color: '#991b1b' }}>Egresos / Gastos</span>
                  <span className="data-box-value" style={{ color: '#dc2626' }}>-${caja.totalExpenses?.toLocaleString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--primary-light)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>ESTADO DEL ARQUEO:</span>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--c-dark)' }}>{caja.status}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL RECAUDADO EN TURNO:</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--c-primary)' }}>
                    ${caja.netTotal?.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* HONORARIOS LIQUIDATION VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {doctors.map((doc) => {
            const docInvoices = invoices.filter((i) => i.doctorName === doc.name);
            const totalBruto = docInvoices.reduce((acc, curr) => acc + (curr.amount || 0), 0);
            const totalNeto = docInvoices.reduce((acc, curr) => acc + (curr.doctorHonorario || Math.round(curr.amount * (doc.feePercentage / 100))), 0);

            return (
              <div key={doc.id} className="card" style={{ padding: '1.5rem', borderTop: `4px solid ${doc.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                  <img
                    src={doc.avatar}
                    alt={doc.name}
                    style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#002182' }}>{doc.name}</h3>
                    <div style={{ fontSize: '0.78rem', color: '#496386' }}>{doc.specialtyName} · {doc.license}</div>
                  </div>
                </div>

                <div style={{ background: '#F5F8FE', border: '1px solid #D2E3FC', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Prestaciones Realizadas:</span>
                    <strong>{docInvoices.length} consultas</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Facturado Bruto:</span>
                    <strong>${totalBruto.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Porcentaje Acordado:</span>
                    <strong>{doc.feePercentage}%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #D2E3FC', paddingTop: '6px', marginTop: '6px', color: '#065f46', fontSize: '0.95rem' }}>
                    <span><strong>Total Neto a Liquidar:</strong></span>
                    <strong>${totalNeto.toLocaleString()}</strong>
                  </div>
                </div>

                <button
                  className="btn btn-outline btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => addToast('Liquidación Emitida', `Se ha generado el recibo de liquidación para ${doc.name}.`, 'success')}
                >
                  <span>Generar Orden de Pago Bancaria</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
