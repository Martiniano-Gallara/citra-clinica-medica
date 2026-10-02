import React, { useState, useEffect, useCallback } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { dataService } from '../../services/dataService';
import { sanitizeCsvCell, getTodayArgentina } from '../../utils/dateUtils';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Server
} from 'lucide-react';

export const AuditLogsView = () => {
  const { auditLogs: localLogs, logAudit } = useClinic();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [isServerSource, setIsServerSource] = useState(false);

  const fetchServerLogs = useCallback(async (page = 1, action = 'ALL') => {
    if (!dataService.isLive()) {
      setLogs(localLogs || []);
      setTotalCount((localLogs || []).length);
      setIsServerSource(false);
      return;
    }

    setLoading(true);
    try {
      const offset = (page - 1) * pageSize;
      const res = await dataService.fetchAuditLogs({
        limit: pageSize,
        offset,
        action: action === 'ALL' ? null : action
      });

      if (res && res.logs && res.logs.length > 0) {
        setLogs(res.logs);
        setTotalCount(res.count || res.logs.length);
        setIsServerSource(true);
      } else {
        // Fallback al estado local si la tabla está vacía en este entorno
        setLogs(localLogs || []);
        setTotalCount((localLogs || []).length);
        setIsServerSource(false);
      }
    } catch (err) {
      console.warn('Error fetching server audit logs, falling back to local logs:', err);
      setLogs(localLogs || []);
      setTotalCount((localLogs || []).length);
      setIsServerSource(false);
    } finally {
      setLoading(false);
    }
  }, [localLogs, pageSize]);

  useEffect(() => {
    fetchServerLogs(currentPage, filterAction);
  }, [fetchServerLogs, currentPage, filterAction]);

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      (log.userName || '').toLowerCase().includes(s) ||
      (log.resource || '').toLowerCase().includes(s) ||
      (log.targetDni || '').includes(s) ||
      (log.details || '').toLowerCase().includes(s)
    );
  });

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const getActionBadgeColor = (action) => {
    switch (action) {
      case 'READ': return { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' };
      case 'CREATE': return { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' };
      case 'SIGN_DIGITAL': return { bg: '#EBF3FD', text: '#002182', border: '#257CE6' };
      case 'UPDATE_ADENDA': return { bg: '#fef3c7', text: '#92400e', border: '#fde68a' };
      case 'EXPORT_HCE': return { bg: '#ede9fe', text: '#5b21b6', border: '#ddd6fe' };
      case 'ARCA_INVOICE': return { bg: '#fae8ff', text: '#86198f', border: '#f5d0fe' };
      case 'MFA_AUTH': return { bg: '#e2e8f0', text: '#334155', border: '#cbd5e1' };
      case 'ANNUL_PRESCRIPTION': return { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' };
      case 'CLOSE_CASH_SHIFT': return { bg: '#fef9c3', text: '#854d0e', border: '#fde047' };
      default: return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Fecha y Hora UTC', 'Usuario', 'Rol', 'Accion', 'Recurso', 'DNI Objetivo', 'Detalle', 'IP', 'Hash SHA-256'];
    const rows = filteredLogs.map((l) => [
      sanitizeCsvCell(l.id),
      sanitizeCsvCell(l.timestamp),
      sanitizeCsvCell(l.userName),
      sanitizeCsvCell(l.userRole),
      sanitizeCsvCell(l.action),
      sanitizeCsvCell(l.resource),
      sanitizeCsvCell(l.targetDni),
      sanitizeCsvCell(l.details),
      sanitizeCsvCell(l.ipAddress),
      sanitizeCsvCell(l.eventHash)
    ]);

    const csvContent = '\uFEFF' + [headers.map(sanitizeCsvCell).join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CITRA_Auditoria_Seguridad_Inmutable_${getTodayArgentina()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (logAudit) {
      logAudit('EXPORT_HCE', 'Auditoría y Seguridad', '-', `Exportación de ${filteredLogs.length} eventos de auditoría a CSV.`);
    }
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
            Registro inmutable y cronológico de cada acceso, consulta, firma digital y exportación de datos sensibles de salud (Ley 26.529 y 25.326).
          </p>
        </div>

        <div className="page-actions-group" style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn btn-outline"
            onClick={() => fetchServerLogs(currentPage, filterAction)}
            disabled={loading}
            title="Sincronizar eventos directamente con la base de datos Supabase"
          >
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            <span>{loading ? 'Cargando...' : 'Actualizar del Servidor'}</span>
          </button>
          <button className="btn btn-outline" onClick={handleExportCSV}>
            <FileSpreadsheet size={16} />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Info Alert with Server Status */}
      <div style={{
        background: '#EBF3FD',
        padding: '0.85rem 1.15rem',
        borderRadius: '8px',
        border: '1px solid #257CE6',
        marginBottom: '1.5rem',
        fontSize: '0.86rem',
        color: '#002182',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div>
          <strong>Protección y Cifrado de Datos de Salud:</strong> Cada evento queda sellado criptográficamente con Hash SHA-256 forzado en el servidor PostgreSQL para garantizar no repudio y trazabilidad forense.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700 }}>
          <Server size={15} color={isServerSource ? '#059669' : '#b45309'} />
          <span>{isServerSource ? 'Conectado a audit_logs (PostgreSQL)' : 'Modo local sincronizado'}</span>
        </div>
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
            onChange={(e) => {
              setFilterAction(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="ALL">Todas las Acciones</option>
            <option value="READ">Lectura de HCE (READ)</option>
            <option value="CREATE">Creación de Registro (CREATE)</option>
            <option value="SIGN_DIGITAL">Firma Digital PKI (SIGN_DIGITAL)</option>
            <option value="UPDATE_ADENDA">Adenda Médica (UPDATE_ADENDA)</option>
            <option value="ANNUL_PRESCRIPTION">Anulación de Receta (ANNUL_PRESCRIPTION)</option>
            <option value="CLOSE_CASH_SHIFT">Cierre de Caja (CLOSE_CASH_SHIFT)</option>
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
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  {loading ? 'Cargando eventos desde el servidor...' : 'No se encontraron eventos de auditoría para los criterios seleccionados.'}
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const badgeStyle = getActionBadgeColor(log.action);
                const timeString = log.timestamp || '';
                const datePart = timeString.includes('T') ? timeString.split('T')[0] : timeString.split(' ')[0] || '-';
                const timePart = timeString.includes('T') ? timeString.split('T')[1]?.substring(0, 8) : (timeString.split(' ')[1] || '');

                return (
                  <tr key={log.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.84rem' }}>
                      <div style={{ fontWeight: 700 }}>{datePart}</div>
                      <div style={{ color: '#64748b', fontSize: '0.76rem' }}>{timePart} UTC</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: '#002182' }}>{log.userName || 'Sistema'}</div>
                      <div style={{ fontSize: '0.76rem', color: '#496386' }}>{log.userRole || 'admin'}</div>
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
                    <td style={{ fontWeight: 600 }}>{log.resource || log.module || '-'}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{log.targetDni || '-'}</td>
                    <td style={{ fontSize: '0.86rem', maxWidth: '300px' }}>{log.details || '-'}</td>
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
                        {log.eventHash || 'hash-calculado-servidor'}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '1rem',
          padding: '0.75rem 0.5rem',
          fontSize: '0.86rem',
          color: '#475569'
        }}>
          <div>
            Mostrando página {currentPage} de {totalPages} ({totalCount} eventos auditados)
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-outline"
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{ padding: '0.35rem 0.75rem' }}
            >
              <ChevronLeft size={16} />
              <span>Anterior</span>
            </button>
            <button
              className="btn btn-outline"
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{ padding: '0.35rem 0.75rem' }}
            >
              <span>Siguiente</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
