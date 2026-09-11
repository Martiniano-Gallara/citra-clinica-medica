import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { ShieldCheck, Search, Filter, Lock, Download, AlertCircle, FileSpreadsheet } from 'lucide-react';

export const AuditLogsView = () => {
  const { auditLogs } = useClinic();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchSearch =
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetDni.includes(searchTerm) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchAction = filterAction === 'ALL' ? true : log.action === filterAction;
    return matchSearch && matchAction;
  });

  const getActionBadgeColor = (action) => {
    switch (action) {
      case 'READ': return { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' };
      case 'CREATE': return { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' };
      case 'SIGN_DIGITAL': return { bg: '#EBF3FD', text: '#002182', border: '#257CE6' };
      case 'UPDATE_ADENDA': return { bg: '#fef3c7', text: '#92400e', border: '#fde68a' };
      case 'EXPORT_HCE': return { bg: '#ede9fe', text: '#5b21b6', border: '#ddd6fe' };
      case 'ARCA_INVOICE': return { bg: '#fae8ff', text: '#86198f', border: '#f5d0fe' };
      case 'MFA_AUTH': return { bg: '#e2e8f0', text: '#334155', border: '#cbd5e1' };
      default: return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Fecha y Hora UTC', 'Usuario', 'Rol', 'Accion', 'Recurso', 'DNI Objetivo', 'Detalle', 'IP', 'Hash SHA-256'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      `"${l.userName}"`,
      l.userRole,
      l.action,
      `"${l.resource}"`,
      l.targetDni,
      `"${l.details.replace(/"/g, '""')}"`,
      l.ipAddress,
      l.eventHash
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CITRA_Auditoria_Seguridad_Inmutable_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="audit-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <ShieldCheck size={32} color="#076ABC" />
            <span>Auditoría de Accesos & Trazabilidad Inmutable</span>
          </h1>
          <p>
            Registro inmutable y cronológico de cada acceso, consulta, firma digital y exportación de datos sensibles de salud.
          </p>
        </div>

        <div className="page-actions-group">
          <button className="btn btn-outline" onClick={handleExportCSV}>
            <FileSpreadsheet size={16} />
            <span>Exportar Registro Auditado CSV</span>
          </button>
        </div>
      </div>

      {/* Info Alert */}
      <div style={{ background: '#EBF3FD', padding: '0.85rem 1.15rem', borderRadius: '8px', border: '1px solid #257CE6', marginBottom: '1.5rem', fontSize: '0.86rem', color: '#002182' }}>
        <strong>Protección y Cifrado de Datos de Salud:</strong> Cada evento en la plataforma queda sellado criptográficamente con un Hash SHA-256 unívoco para garantizar que ningún registro de acceso pueda ser adulterado o suprimido.
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="#076ABC" />
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por usuario, DNI del paciente o detalle del evento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Filter size={16} color="#076ABC" />
          <select
            className="form-control"
            style={{ width: 'auto' }}
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
          >
            <option value="ALL">Todas las Acciones</option>
            <option value="READ">Lectura de HCE (READ)</option>
            <option value="CREATE">Creación de Registro (CREATE)</option>
            <option value="SIGN_DIGITAL">Firma Digital PKI (SIGN_DIGITAL)</option>
            <option value="UPDATE_ADENDA">Adenda Médica (UPDATE_ADENDA)</option>
            <option value="EXPORT_HCE">Exportación de Datos (EXPORT_HCE)</option>
            <option value="ARCA_INVOICE">Facturación Fiscal (ARCA_INVOICE)</option>
            <option value="MFA_AUTH">Autenticación MFA (MFA_AUTH)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Fecha y Hora</th>
              <th>Operador / Usuario</th>
              <th>Acción Legal</th>
              <th>Recurso Afectado</th>
              <th>DNI Paciente</th>
              <th>Detalle Operativo</th>
              <th>Hash SHA-256 de Integridad</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => {
              const badgeStyle = getActionBadgeColor(log.action);
              return (
                <tr key={log.id}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.84rem' }}>
                    <div style={{ fontWeight: 700 }}>{log.timestamp.split('T')[0]}</div>
                    <div style={{ color: '#64748b', fontSize: '0.76rem' }}>{log.timestamp.split('T')[1]?.substring(0, 8)} UTC</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, color: '#002182' }}>{log.userName}</div>
                    <div style={{ fontSize: '0.76rem', color: '#496386' }}>{log.userRole}</div>
                  </td>
                  <td>
                    <span
                      style={{
                        background: badgeStyle.bg,
                        color: badgeStyle.text,
                        border: `1px solid ${badgeStyle.border}`,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{log.resource}</td>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{log.targetDni}</td>
                  <td style={{ fontSize: '0.86rem', maxWidth: '300px' }}>{log.details}</td>
                  <td>
                    <div
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.72rem',
                        background: '#f1f5f9',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        color: '#475569',
                        maxWidth: '140px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={log.eventHash}
                    >
                      {log.eventHash}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
