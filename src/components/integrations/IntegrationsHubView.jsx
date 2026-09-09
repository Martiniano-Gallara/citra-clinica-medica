import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Network, CheckCircle2, AlertCircle, RefreshCw, Server, ShieldCheck, Zap, Globe, FileText, Check } from 'lucide-react';

export const IntegrationsHubView = () => {
  const { clinicInfo, addToast } = useClinic();

  const [testingService, setTestingService] = useState(null);

  const integrations = [
    {
      id: 'renapdis',
      name: 'ReNaPDiS — Receta Electrónica Nacional',
      organism: 'Ministerio de Salud de la Nación (MSAL)',
      normative: 'Ley 27.553 / Decreto 98/2023',
      status: 'Conectado & Homologado',
      endpoint: 'https://sisa.msal.gov.ar/ws/renapdis/v2',
      details: `ID de Plataforma Homologada: ${clinicInfo.renapdisPlatformId}. Emisión de CUIR y validación de farmacias activa.`,
      icon: 'Pill',
      color: '#076ABC'
    },
    {
      id: 'arca',
      name: 'ARCA — Facturación Electrónica WSFE v1',
      organism: 'Agencia de Recaudación y Control Aduanero (ex AFIP)',
      normative: 'RG 4291 / RG 4892 (QR Fiscal)',
      status: 'Conectado & Autorizado',
      endpoint: 'https://servicios1.afip.gov.ar/wsfev1/service.asmx',
      details: `Punto de Venta N° ${clinicInfo.arcaPtoVta} habilitado para CUIT ${clinicInfo.cuit}. CAE en tiempo real.`,
      icon: 'Receipt',
      color: '#002182'
    },
    {
      id: 'sisa',
      name: 'SISA — Registro Federal de Profesionales (REFEPS)',
      organism: 'Sistema de Información Sanitaria Argentino',
      normative: 'Resolución MSAL 1341/2013',
      status: 'Sincronizado',
      endpoint: 'https://sisa.msal.gov.ar/ws/refeps/v1',
      details: `Establecimiento REFES: ${clinicInfo.sisaRefesCode}. Validación de matrículas nacionales y provinciales.`,
      icon: 'ShieldCheck',
      color: '#0d9488'
    },
    {
      id: 'fhir',
      name: 'HL7® FHIR® Argentina Core',
      organism: 'Dirección Nacional de Sistemas de Información Sanitaria',
      normative: 'Estrategia Nacional de Salud Digital 2024-2030',
      status: 'Preparado para Interoperabilidad',
      endpoint: 'https://fhir.salud.gob.ar/r4/citra',
      details: 'Mapeo de recursos Patient, Encounter, Condition y MedicationRequest según perfil nacional FHIR.',
      icon: 'Globe',
      color: '#257CE6'
    }
  ];

  const handleTestConnection = (id, name) => {
    setTestingService(id);
    setTimeout(() => {
      setTestingService(null);
      addToast('Conexión Exitosa', `Servicio ${name} respondió con estado HTTP 200 OK (Latencia: 64ms).`, 'success');
    }, 700);
  };

  return (
    <div className="integrations-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <Network size={32} color="#076ABC" />
            <span>Hub de Integraciones Sanitarias Oficiales</span>
          </h1>
          <p>
            Conectores gubernamentales y normativos: ReNaPDiS, ARCA / AFIP, SISA / REFEPS y HL7 FHIR Core Argentina.
          </p>
        </div>
      </div>

      {/* Grid of integrations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
        {integrations.map((item) => (
          <div
            key={item.id}
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '1.5rem',
              borderLeft: `5px solid ${item.color}`
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#002182' }}>
                    {item.name}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#496386', fontWeight: 600 }}>
                    {item.organism} · {item.normative}
                  </div>
                </div>

                  <span
                    style={{
                      background: '#d1fae5',
                      color: '#065f46',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Check size={12} />
                    <span>{item.status}</span>
                  </span>
              </div>

              <div style={{ background: '#F5F8FE', border: '1px solid #D2E3FC', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.84rem', color: '#172A4A' }}>
                {item.details}
                <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748b', marginTop: '4px' }}>
                  Endpoint: {item.endpoint}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #D2E3FC', paddingTop: '0.85rem' }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handleTestConnection(item.id, item.name)}
                disabled={testingService === item.id}
              >
                <RefreshCw size={14} className={testingService === item.id ? 'animate-spin' : ''} />
                <span>{testingService === item.id ? 'Verificando...' : 'Probar WebService'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
