import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { KeyRound, X, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export const OnlineAuthModal = () => {
  const {
    isOnlineAuthModalOpen,
    setIsOnlineAuthModalOpen,
    patients,
    healthInsurances,
    nomenclatorItems,
    requestOnlineAuthorization
  } = useClinic();

  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [selectedInsuranceName, setSelectedInsuranceName] = useState('OSDE');
  const [selectedNomenclatorCode, setSelectedNomenclatorCode] = useState('25.01.01');
  const [tokenProvided, setTokenProvided] = useState('OSDE-8921-TK');
  const [copayCharged, setCopayCharged] = useState(0);

  if (!isOnlineAuthModalOpen) return null;

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  const selectedNomenclator = nomenclatorItems.find((n) => n.code === selectedNomenclatorCode) || nomenclatorItems[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    requestOnlineAuthorization({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      patientDni: selectedPatient.dni,
      insuranceName: selectedInsuranceName,
      nomenclatorCode: selectedNomenclator.code,
      description: selectedNomenclator.name,
      tokenProvided,
      copayCharged: Number(copayCharged)
    });
    setIsOnlineAuthModalOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsOnlineAuthModalOpen(false)}>
      <div
        className="modal-content"
        style={{ maxWidth: '580px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="avatar-sm" style={{ background: 'var(--c-soft)', color: 'var(--c-dark)' }}>
              <KeyRound size={18} />
            </div>
            <div>
              <h3 className="modal-title">Autorización Online con Obra Social / Prepaga</h3>
              <p className="modal-subtitle">Validación de credencial digital & Token en tiempo real</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={() => setIsOnlineAuthModalOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div className="form-group">
              <label className="form-label">Paciente Titular</label>
              <select
                className="form-select"
                value={selectedPatientId}
                onChange={(e) => {
                  setSelectedPatientId(e.target.value);
                  const p = patients.find((pat) => pat.id === e.target.value);
                  if (p && p.insuranceName) {
                    setSelectedInsuranceName(p.insuranceName.split(' ')[0]);
                  }
                }}
                required
              >
                {patients.map((pat) => (
                  <option key={pat.id} value={pat.id}>
                    {pat.name} — DNI {pat.dni} ({pat.insuranceName})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Obra Social / Prepaga</label>
                <select
                  className="form-select"
                  value={selectedInsuranceName}
                  onChange={(e) => setSelectedInsuranceName(e.target.value)}
                  required
                >
                  <option value="OSDE">OSDE</option>
                  <option value="Swiss Medical">Swiss Medical</option>
                  <option value="Galeno">Galeno</option>
                  <option value="Apross">Apross (Córdoba)</option>
                  <option value="PAMI">PAMI</option>
                  <option value="Medicus">Medicus</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Token de Afiliado / Credencial Digital</label>
                <input
                  type="text"
                  className="form-input"
                  value={tokenProvided}
                  onChange={(e) => setTokenProvided(e.target.value)}
                  placeholder="Ej: OSDE-4891 o 6 dígitos..."
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Práctica / Código Nomenclador</label>
              <select
                className="form-select"
                value={selectedNomenclatorCode}
                onChange={(e) => {
                  setSelectedNomenclatorCode(e.target.value);
                  const n = nomenclatorItems.find((itm) => itm.code === e.target.value);
                  if (n) setCopayCharged(n.copaySuggested || 0);
                }}
                required
              >
                {nomenclatorItems.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.code} — {item.name} (${item.arancelBase?.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Coseguro / Copago a Cobrar ($)</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={copayCharged}
                onChange={(e) => setCopayCharged(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--bg-subtle)', padding: '0.65rem', borderRadius: '6px' }}>
              <ShieldCheck size={16} color="var(--primary)" />
              <span>Conexión cifrada directa con WebService de validación prestacional.</span>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsOnlineAuthModalOpen(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={16} />
              Transmitir y Autorizar Online
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
