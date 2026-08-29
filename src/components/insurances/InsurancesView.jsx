import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Shield,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  TrendingUp,
  KeyRound,
  RefreshCw,
  ExternalLink,
  Ban,
  Percent,
  Check
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const InsurancesView = () => {
  const {
    healthInsurances,
    insuranceAgreements,
    nomenclatorItems,
    authorizations,
    setIsOnlineAuthModalOpen,
    processInsuranceRejection
  } = useClinic();

  const [activeTab, setActiveTab] = useState('agreements'); // 'agreements', 'nomenclator', 'authorizations', 'debits'
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAgreements = insuranceAgreements.filter((agr) =>
    agr.insuranceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agr.cuit.includes(searchTerm)
  );

  const filteredNomenclator = nomenclatorItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.includes(searchTerm) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAuths = authorizations.filter((auth) =>
    auth.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    auth.patientDni.includes(searchTerm) ||
    auth.insuranceName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAgreements = insuranceAgreements.length;
  const approvedAuths = authorizations.filter((a) => a.status === 'Aprobada Online').length;
  const rejectedAuths = authorizations.filter((a) => a.status === 'Rechazada').length;

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header">
        <div>
          <div className="badge-wrapper" style={{ marginBottom: '0.4rem' }}>
            <span className="badge badge-teal">
              <Shield size={13} style={{ marginRight: '4px' }} />
              Convenios Prestadores, Nomenclador Traumatológico & Autorizaciones Online
            </span>
          </div>
          <h1 className="view-title">Obras Sociales & Prepagas</h1>
          <p className="view-subtitle">
            Administración de convenios, aranceles del Nomenclador Nacional, validación de tokens en tiempo real y débitos.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsOnlineAuthModalOpen(true)}
          >
            <KeyRound size={18} />
            Validar / Autorizar Token Online
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="dashboard-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-teal">
            <Shield size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Convenios Vigentes</span>
            <span className="kpi-value">{totalAgreements}</span>
            <span className="kpi-meta text-success">OSDE, Swiss, Apross, PAMI</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-mint">
            <CheckCircle2 size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Autorizaciones Aprobadas</span>
            <span className="kpi-value">{approvedAuths}</span>
            <span className="kpi-meta text-success">Tasa de aprobación 92%</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-warning">
            <AlertCircle size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Débitos / Rechazos</span>
            <span className="kpi-value">{rejectedAuths}</span>
            <span className="kpi-meta text-warning">En revisión para refacturar</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-teal">
            <Percent size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Nomenclador Arancelado</span>
            <span className="kpi-value">{nomenclatorItems.length} cód</span>
            <span className="kpi-meta text-muted">Trauma & Kinesiología</span>
          </div>
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="filter-bar" style={{ justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'agreements' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('agreements')}
          >
            <Shield size={15} />
            Convenios & Prepagas ({insuranceAgreements.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'authorizations' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('authorizations')}
          >
            <KeyRound size={15} />
            Autorizaciones Online ({authorizations.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'nomenclator' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('nomenclator')}
          >
            <FileText size={15} />
            Nomenclador Nacional ({nomenclatorItems.length})
          </button>
        </div>

        <div className="search-box-inline">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar convenio, código o paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TAB 1: CONVENIOS VIGENTES */}
      {activeTab === 'agreements' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Convenios Institucionales y Modalidades de Cobertura</h3>
              <p className="card-subtitle">Parámetros de facturación, plazos de pago y requisitos de kinesiología</p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Obra Social / Prepaga</th>
                  <th>CUIT / Modalidad</th>
                  <th>Validación Online</th>
                  <th>Cobertura</th>
                  <th>Kinesiología</th>
                  <th>Plazo Cobro</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredAgreements.map((agr) => (
                  <tr key={agr.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                        {agr.insuranceName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Auditoría: {agr.contactAudit}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{agr.cuit}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{agr.agreementType}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--c-primary)' }}>
                        {agr.onlineValidation}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-teal">{agr.coveredPercentage}% Cobertura</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem' }}>
                        {agr.requiresPriorAuthForKinesio ? (
                          <span style={{ color: '#d97706', fontWeight: 700 }}>Requiere Autorización Previa</span>
                        ) : (
                          <span style={{ color: '#059669', fontWeight: 700 }}>Directa hasta {agr.maxKinesioSessionsWithoutOrder} ses</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700 }}>{agr.paymentTermDays} días</span>
                    </td>
                    <td>
                      <Badge variant="confirmado">{agr.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AUTORIZACIONES ONLINE & DÉBITOS */}
      {activeTab === 'authorizations' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 className="card-title">Registro de Autorizaciones Online & Tokens</h3>
              <p className="card-subtitle">Consultas y transacciones en tiempo real con WebServices de Obras Sociales</p>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => setIsOnlineAuthModalOpen(true)}
            >
              <KeyRound size={15} />
              Nueva Autorización
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Paciente / DNI</th>
                  <th>Obra Social</th>
                  <th>Código Prestación</th>
                  <th>Token Validado</th>
                  <th>N° Autorización</th>
                  <th>Coseguro</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredAuths.map((auth) => (
                  <tr key={auth.id}>
                    <td>
                      <span style={{ fontWeight: 600 }}>{auth.date}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{auth.patientName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DNI {auth.patientDni}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700 }}>{auth.insuranceName}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{auth.nomenclatorCode}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{auth.description}</div>
                    </td>
                    <td>
                      <code style={{ background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>
                        {auth.tokenProvided}
                      </code>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--c-primary)' }}>
                        {auth.authNumber || '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700 }}>
                        {auth.copayCharged > 0 ? `$${auth.copayCharged?.toLocaleString()}` : '$0 (Sin Coseguro)'}
                      </span>
                    </td>
                    <td>
                      <Badge variant={auth.status === 'Aprobada Online' ? 'atendido' : 'cancelado'}>
                        {auth.status}
                      </Badge>
                      {auth.rejectionReason && (
                        <div style={{ fontSize: '0.72rem', color: '#dc2626', marginTop: '3px', maxWidth: '200px' }}>
                          {auth.rejectionReason}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: NOMENCLADOR NACIONAL */}
      {activeTab === 'nomenclator' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Nomenclador Nacional de Prestaciones Traumatológicas & Kinesiológicas</h3>
              <p className="card-subtitle">Códigos homologados de práctica médica y aranceles de referencia</p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descripción de la Práctica</th>
                  <th>Categoría</th>
                  <th>Arancel Base Convenio</th>
                  <th>Coseguro Sugerido</th>
                </tr>
              </thead>
              <tbody>
                {filteredNomenclator.map((item) => (
                  <tr key={item.code}>
                    <td>
                      <span className="badge badge-teal" style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                        {item.code}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                        {item.name}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-soft">{item.category}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--c-dark)', fontSize: '0.92rem' }}>
                        ${item.arancelBase?.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: item.copaySuggested > 0 ? '#d97706' : '#059669' }}>
                        {item.copaySuggested > 0 ? `$${item.copaySuggested?.toLocaleString()}` : '$0 (Sin Coseguro)'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
