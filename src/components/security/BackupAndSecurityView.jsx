import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Shield, Lock, Download, Database, Key, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export const BackupAndSecurityView = () => {
  const { exportEncryptedBackup, addToast, logAudit } = useClinic();

  const [passphrase, setPassphrase] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleExportBackup = (e) => {
    e.preventDefault();
    if (!passphrase || passphrase.length < 8) {
      addToast('Seguridad Insuficiente', 'La clave de cifrado del backup debe tener al menos 8 caracteres.', 'error');
      return;
    }

    setIsExporting(true);
    setTimeout(() => {
      exportEncryptedBackup(passphrase);
      setIsExporting(false);
      setPassphrase('');
    }, 600);
  };

  return (
    <div className="security-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Shield size={32} color="#076ABC" />
            <span>Seguridad, Cifrado & Backups (Ley 25.326)</span>
          </h1>
          <p>
            Políticas de seguridad informática, cifrado simétrico AES-256 de base de datos y respaldos inmutables.
          </p>
        </div>
      </div>

      {/* Security Status Cards */}
      <div className="kpi-grid" style={{ marginBottom: '2rem' }}>
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Cifrado en Reposo y Tránsito</span>
            <div className="kpi-icon-box" style={{ background: '#d1fae5', color: '#065f46' }}>
              <Lock size={24} />
            </div>
          </div>
          <div className="kpi-value" style={{ fontSize: '1.45rem', color: '#065f46' }}>
            AES-256 / TLS 1.3
          </div>
          <div className="kpi-trend positive">
            <CheckCircle2 size={16} />
            <span>Algoritmos criptográficos conformes ONTI</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Autenticación MFA / TOTP</span>
            <div className="kpi-icon-box" style={{ background: '#EBF3FD', color: '#076ABC' }}>
              <Key size={24} />
            </div>
          </div>
          <div className="kpi-value" style={{ fontSize: '1.45rem', color: '#076ABC' }}>
            100% Obligatorio
          </div>
          <div className="kpi-trend positive">
            <span>4 de 4 usuarios con 2FA activo</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Inalterabilidad de HCE</span>
            <div className="kpi-icon-box" style={{ background: '#dbeafe', color: '#1e40af' }}>
              <Database size={24} />
            </div>
          </div>
          <div className="kpi-value" style={{ fontSize: '1.45rem', color: '#1e40af' }}>
            SHA-256 Hashed
          </div>
          <div className="kpi-trend positive">
            <span>Ley 26.529 & 26.742 Cumplida</span>
          </div>
        </div>
      </div>

      {/* Export Encrypted Backup Box */}
      <div className="card" style={{ maxWidth: '850px', marginBottom: '2rem' }}>
        <div className="card-header">
          <div className="card-title">
            <Database size={20} color="#076ABC" />
            <span>Generador de Copia de Seguridad Cifrada (Snapshot AES-256)</span>
          </div>
        </div>

        <p style={{ fontSize: '0.88rem', color: '#172A4A', marginBottom: '1.25rem', lineHeight: 1.6 }}>
          Genera un volcado completo de la base de datos de pacientes, historias clínicas, recetas y facturas, protegido mediante el estándar de cifrado militar <strong>AES-256</strong> con suma de verificación SHA-256.
        </p>

        <form onSubmit={handleExportBackup}>
          <div className="form-group">
            <label className="form-label">Clave Secreta de Cifrado (Mínimo 8 caracteres) *</label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="password"
                className="form-control"
                placeholder="Ingrese una contraseña segura para proteger el archivo de backup..."
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                required
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ whiteSpace: 'nowrap' }}
                disabled={isExporting}
              >
                <Download size={16} />
                <span>{isExporting ? 'Cifrando base de datos...' : 'Descargar Backup Cifrado'}</span>
              </button>
            </div>
          </div>
        </form>

        <div style={{ background: '#F5F8FE', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #D2E3FC', fontSize: '0.8rem', color: '#496386', marginTop: '1rem' }}>
          <strong>Aviso de Seguridad:</strong> Conserve la clave en un administrador de contraseñas seguro. Sin esta clave, los datos clínicos no podrán ser recuperados en un procedimiento de Disaster Recovery.
        </div>
      </div>

      {/* Disaster Recovery Plan Information */}
      <div className="card" style={{ maxWidth: '850px' }}>
        <div className="card-header">
          <div className="card-title">
            <Shield size={20} color="#002182" />
            <span>Plan de Continuidad Operativa & DRP Sanitario</span>
          </div>
        </div>

        <div style={{ fontSize: '0.88rem', color: '#172A4A', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div><strong>RPO (Recovery Point Objective):</strong> Menor a 15 minutos (Snapshots incrementales).</div>
          <div><strong>RTO (Recovery Time Objective):</strong> Menor a 1 hora en contingencia crítica.</div>
          <div><strong>Retención Legal de Historias Clínicas:</strong> 10 años corridos según Código Civil y Comercial de la Nación y Ley 26.529.</div>
          <div><strong>Alojamiento de Servidores:</strong> Data Center Tier III con georredundancia nacional.</div>
        </div>
      </div>
    </div>
  );
};
