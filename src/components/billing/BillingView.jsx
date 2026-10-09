import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { sanitizeCsvCell, getTodayArgentina } from '../../utils/dateUtils';
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
  Check,
  Stethoscope,
  AlertCircle,
  X,
  FileText
} from 'lucide-react';
import { PaymentModal } from './PaymentModal';
import { ArcaInvoiceModal } from './ArcaInvoiceModal';

export const BillingView = () => {
  const {
    invoices,
    doctors,
    cashClosures,
    addCashMovement,
    openCashShift,
    closeCashShift,
    setIsPaymentModalOpen,
    setPaymentPreloadData,
    setIsArcaInvoiceModalOpen,
    setArcaInvoicePreloadData,
    clinicInfo,
    addToast,
    issueCreditNote
  } = useClinic();

  const [activeSubTab, setActiveSubTab] = useState('invoices'); // 'invoices' or 'honorarios'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('all');
  const [isClosingShift, setIsClosingShift] = useState(false);

  // V3-M3: Estado para emisión de Notas de Crédito / Anulaciones
  const [isCreditNoteModalOpen, setIsCreditNoteModalOpen] = useState(false);
  const [selectedInvoiceForNC, setSelectedInvoiceForNC] = useState(null);
  const [creditNoteReason, setCreditNoteReason] = useState('');
  const [isIssuingNC, setIsIssuingNC] = useState(false);

  const handleOpenCreditNoteModal = (inv) => {
    setSelectedInvoiceForNC(inv);
    setCreditNoteReason('Error de facturación / anulación solicitada por el paciente');
    setIsCreditNoteModalOpen(true);
  };

  const handleConfirmCreditNote = async (e) => {
    e.preventDefault();
    if (!selectedInvoiceForNC) return;
    if (!creditNoteReason.trim()) {
      addToast('Motivo Requerido', 'Debe detallar el motivo de la emisión de la Nota de Crédito.', 'warning');
      return;
    }
    setIsIssuingNC(true);
    try {
      if (typeof issueCreditNote === 'function') {
        await issueCreditNote(selectedInvoiceForNC.id, creditNoteReason.trim());
      }
      setIsCreditNoteModalOpen(false);
      setSelectedInvoiceForNC(null);
      setCreditNoteReason('');
    } catch (err) {
      console.error('Error al emitir nota de crédito:', err);
    } finally {
      setIsIssuingNC(false);
    }
  };

  const handleOpenShift = async () => {
    const balanceStr = prompt('Monto de Apertura de Caja (Fondo Fijo $):', '10000');
    if (balanceStr === null) return;
    const numBalance = Number(balanceStr);
    if (isNaN(numBalance) || numBalance < 0) {
      addToast('Monto Inválido', 'Debe ingresar un monto numérico válido (0 o superior).', 'warning');
      return;
    }
    const shiftName = prompt('Nombre del Turno:', 'Turno Mañana') || 'Turno Regular';
    try {
      if (typeof openCashShift === 'function') {
        await openCashShift(numBalance, shiftName);
      }
    } catch (err) {
      console.error('Error al abrir turno de caja:', err);
    }
  };

  // V4-M1: Identificar comprobantes anulados mediante Notas de Crédito emitidas
  const voidedInvoiceIds = useMemo(() => {
    const set = new Set();
    invoices.forEach((inv) => {
      if (inv.relatedInvoiceId) {
        set.add(inv.relatedInvoiceId);
      }
    });
    return set;
  }, [invoices]);

  const isCreditNoteCheck = (inv) => Boolean(inv.relatedInvoiceId || [3, 8, 13].includes(Number(inv.tipoCmp)));
  const getInvSign = (inv) => (isCreditNoteCheck(inv) ? -1 : 1);
  const getInvTotal = (inv) => Number(inv.total ?? inv.amount ?? 0);

  // V4-M1: Las Notas de Crédito restan del total facturado y honorarios médicos
  const totalFacturado = invoices.reduce((acc, curr) => acc + (getInvSign(curr) * getInvTotal(curr)), 0);
  const totalHonorariosMedicos = invoices.reduce((acc, curr) => {
    const hon = curr.doctorHonorario || Math.round(getInvTotal(curr) * 0.75);
    return acc + (getInvSign(curr) * hon);
  }, 0);
  const totalRetencionClinica = totalFacturado - totalHonorariosMedicos;

  const filteredInvoices = invoices.filter((inv) => {
    const cleanQ = searchTerm.toLowerCase();
    const matchSearch =
      (inv.patientName && inv.patientName.toLowerCase().includes(cleanQ)) ||
      (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(cleanQ)) ||
      (inv.concept && inv.concept.toLowerCase().includes(cleanQ)) ||
      (inv.dni && String(inv.dni).includes(cleanQ)) ||
      (inv.cae && String(inv.cae).includes(cleanQ));

    const matchMethod = filterMethod === 'all' || inv.paymentMethod === filterMethod;
    return matchSearch && matchMethod;
  });

  const handleExportCSV = () => {
    const headers = ['Nro Comprobante', 'CAE ARCA', 'Vto CAE', 'Fecha', 'Paciente', 'DNI', 'Concepto', 'Médico', 'Importe ($)', 'Honorario Médico ($)', 'Metodo Pago', 'Estado'];
    const rows = filteredInvoices.map((i) => [
      sanitizeCsvCell(i.invoiceNumber),
      sanitizeCsvCell(i.cae || (isCreditNoteCheck(i) ? 'Pendiente de CAE' : 'Sin CAE')),
      sanitizeCsvCell(i.caeVto || '-'),
      sanitizeCsvCell(i.date),
      sanitizeCsvCell(i.patientName),
      sanitizeCsvCell(i.dni || '-'),
      sanitizeCsvCell(i.concept),
      sanitizeCsvCell(i.doctorName || '-'),
      sanitizeCsvCell(getInvSign(i) * getInvTotal(i)),
      sanitizeCsvCell(getInvSign(i) * (i.doctorHonorario || Math.round(getInvTotal(i) * 0.75))),
      sanitizeCsvCell(i.paymentMethod),
      sanitizeCsvCell(voidedInvoiceIds.has(i.id) ? 'Anulada' : i.status)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.map(sanitizeCsvCell).join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CITRA_Libro_IVA_Ventas_ARCA_${getTodayArgentina()}.csv`);
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
            <span>Facturación Representativa & Honorarios Médicos</span>
          </h1>
          <p>
            Comprobantes de facturación representativa, liquidación de honorarios y control de caja
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
            <span>Emitir Factura Representativa</span>
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
            <span>100% Facturación Representativa Registrada</span>
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
          <span>Comprobantes Representativos ({filteredInvoices.length})</span>
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
                  <th style={{ textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => {
                  const isCreditNote = isCreditNoteCheck(inv);
                  const isVoided = inv.status === 'Anulada' || voidedInvoiceIds.has(inv.id);

                  return (
                    <tr key={inv.id}>
                      <td>
                        <div style={{ fontWeight: 800, color: '#002182' }}>{inv.invoiceNumber}</div>
                        <div style={{ fontSize: '0.74rem', color: '#496386' }}>
                          {isCreditNote ? (
                            <span style={{ color: '#b45309', fontWeight: 600 }}>NC Vinculada a {inv.relatedInvoiceId || 'comprobante'}</span>
                          ) : (
                            `Pto Vta 0001 · CUIT ${clinicInfo?.cuit || '30-71829304-8'}`
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontFamily: 'monospace', fontWeight: 700, color: isCreditNote ? '#b45309' : (inv.cae ? '#076ABC' : '#64748b') }}>
                          {inv.cae ? inv.cae : (isCreditNote ? 'Pendiente de CAE' : 'Sin CAE')}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          {inv.caeVto ? `Vto: ${inv.caeVto}` : 'Vto: —'}
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
                        <div style={{ fontWeight: 900, color: isCreditNote ? '#b45309' : '#002182', fontSize: '1.05rem' }}>
                          {isCreditNote ? `-$${getInvTotal(inv).toLocaleString()}` : `$${getInvTotal(inv).toLocaleString()}`}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: isCreditNote ? '#b45309' : '#065f46' }}>
                          {isCreditNote ? `-$${(inv.doctorHonorario || Math.round(getInvTotal(inv) * 0.75)).toLocaleString()}` : `$${(inv.doctorHonorario || Math.round(getInvTotal(inv) * 0.75)).toLocaleString()}`}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', background: '#F5F8FE', border: '1px solid #D2E3FC', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                          {inv.paymentMethod}
                        </span>
                      </td>
                      <td>
                        {isCreditNote ? (
                          <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.76rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <AlertCircle size={12} />
                            <span>Nota de Crédito</span>
                          </span>
                        ) : isVoided ? (
                          <span style={{ background: '#fee2e2', color: '#991b1b', padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.76rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <X size={12} />
                            <span>Anulada (NC)</span>
                          </span>
                        ) : (
                          <span style={{ background: '#d1fae5', color: '#065f46', padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.76rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Check size={12} />
                            <span>{inv.status}</span>
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {!isCreditNote && !isVoided && (
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => handleOpenCreditNoteModal(inv)}
                            style={{
                              padding: '0.25rem 0.55rem',
                              fontSize: '0.74rem',
                              color: '#b91c1c',
                              borderColor: '#fca5a5',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Emitir Nota de Crédito en ARCA para anular este comprobante (V3-M3)"
                          >
                            <FileText size={12} />
                            <span>Emitir NC</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeSubTab === 'caja' ? (
        /* CAJA DIARIA & ARQUEOS DE TURNO VIEW (V2-A7) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div>
              <h3 style={{ margin: 0, color: '#002182', fontSize: '1.15rem', fontWeight: 800 }}>
                Control de Caja y Turnos de Arqueo
              </h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.84rem', color: '#496386' }}>
                Apertura y cierre seguro de caja con conciliación de efectivo y comprobantes.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleOpenShift}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', fontSize: '0.88rem' }}
            >
              <Plus size={16} />
              <span>Abrir Turno de Caja</span>
            </button>
          </div>

          {(!cashClosures || cashClosures.length === 0) ? (
            <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', color: '#64748b' }}>
              <p style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>No hay turnos de caja registrados actualmente.</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleOpenShift}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', margin: '0 auto' }}
              >
                <Plus size={16} />
                <span>Abrir Primer Turno de Caja</span>
              </button>
            </div>
          ) : (
            cashClosures.map((caja) => (
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
                      onClick={async () => {
                        const amountStr = prompt('Monto del Egreso Menor ($):', '2500');
                        if (!amountStr) return;
                        const numAmount = Number(amountStr);
                        if (isNaN(numAmount) || numAmount <= 0) {
                          addToast('Monto Inválido', 'Debe ingresar un monto numérico mayor a 0.', 'warning');
                          return;
                        }
                        const concept = prompt('Concepto del Egreso:', 'Artículos de limpieza / librería');
                        if (concept) {
                          if (typeof addCashMovement === 'function') {
                            try {
                              await addCashMovement('EGRESO', numAmount, concept, caja.cashierName || 'Recepción', 'Efectivo');
                            } catch (err) {
                              console.error('Error al registrar egreso:', err);
                            }
                          }
                        }
                      }}
                    >
                      - Registrar Egreso
                    </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={isClosingShift}
                    onClick={async () => {
                      if (isClosingShift) return;
                      const confirmed = window.confirm('¿Confirma el cierre y arqueo definitivo de la caja? Esta operación registrará el balance fiscal.');
                      if (!confirmed) return;
                      const obs = prompt('Observaciones del arqueo (opcional):', 'Cierre de turno normal sin discrepancias');
                      setIsClosingShift(true);
                      try {
                        if (typeof closeCashShift === 'function') {
                          await closeCashShift(obs || '');
                        }
                      } catch (err) {
                        console.error('Error cerrando caja:', err);
                      } finally {
                        setIsClosingShift(false);
                      }
                    }}
                  >
                    <CheckCircle2 size={15} />
                    {isClosingShift ? 'Cerrando Turno...' : 'Cerrar y Arquear Turno'}
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
          ))
        )}
      </div>
      ) : (
        /* HONORARIOS LIQUIDATION VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.25rem' }}>
          {doctors.map((doc) => {
            const docInvoices = invoices.filter((i) => i.doctorName === doc.name);
            const totalBruto = docInvoices.reduce((acc, curr) => acc + (curr.amount || 0), 0);
            const totalNeto = docInvoices.reduce((acc, curr) => acc + (curr.doctorHonorario || Math.round(curr.amount * (doc.feePercentage / 100))), 0);

            return (
              <div key={doc.id} className="card" style={{ padding: '1.5rem', borderTop: `4px solid ${doc.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: 'rgba(7, 106, 188, 0.1)',
                      border: '1.5px solid #BFDBFE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#002182',
                      flexShrink: 0
                    }}
                    title="Médico"
                  >
                    <Stethoscope size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#002182' }}>{doc.name}</h3>
                    <div style={{ fontSize: '0.78rem', color: '#076ABC', fontWeight: 700 }}>
                      {doc.specialtyName || doc.specialty || 'Especialidad médica'}
                    </div>
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

      {/* Modal Emisión de Nota de Crédito (V3-M3) */}
      {isCreditNoteModalOpen && selectedInvoiceForNC && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: '520px', width: '90%' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Receipt size={22} color="#b91c1c" />
                <h3 style={{ margin: 0, color: '#002182', fontSize: '1.2rem', fontWeight: 800 }}>
                  Emitir Nota de Crédito ARCA
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreditNoteModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmCreditNote} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                <div><strong>Comprobante Original:</strong> {selectedInvoiceForNC.invoiceNumber} (CAE: {selectedInvoiceForNC.cae || 'Simulado'})</div>
                <div style={{ marginTop: '0.25rem' }}><strong>Paciente:</strong> {selectedInvoiceForNC.patientName} (DNI: {selectedInvoiceForNC.dni || '-'})</div>
                <div style={{ marginTop: '0.25rem' }}><strong>Importe a Anular:</strong> ${getInvTotal(selectedInvoiceForNC).toLocaleString()}</div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                  Motivo de Emisión / Justificación Fiscal:
                </label>
                <textarea
                  required
                  rows={3}
                  value={creditNoteReason}
                  onChange={(e) => setCreditNoteReason(e.target.value)}
                  placeholder="Detalle el motivo fiscal o administrativo por el cual se emite la Nota de Crédito..."
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsCreditNoteModalOpen(false)}
                  disabled={isIssuingNC}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ background: '#b91c1c', borderColor: '#b91c1c' }}
                  disabled={isIssuingNC}
                >
                  {isIssuingNC ? 'Emitiendo en ARCA...' : 'Confirmar Emisión de NC'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
