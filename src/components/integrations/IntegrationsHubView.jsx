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
      normative: 'Homologación ReNaPDiS / Ley 27.553',
      status: 'Próximamente (Fase 2 / En Homologación)',
      badge: 'PRÓXIMAMENTE',
      isLive: false,
      endpoint: 'https://sisa.msal.gov.ar/ws/renapdis/v2',
      details: `Motor generador CUIR activo con ID de plataforma ${clinicInfo.renapdisPlatformId}. Conector SOAP en desarrollo para homologación directa con el Ministerio de Salud (Fase 2).`,
      icon: 'Pill',
      color: '#076ABC'
    },
    {
      id: 'arca',
      name: 'ARCA — Facturación Electrónica WSFE v1',
      organism: 'Agencia de Recaudación y Control Aduanero (ex AFIP)',
      normative: 'RG 4291 / RG 4892 (QR Fiscal)',
      status: 'Próximamente (Fase 2 / En Homologación)',
      badge: 'PRÓXIMAMENTE',
      isLive: false,
      endpoint: 'https://servicios1.afip.gov.ar/wsfev1/service.asmx',
      details: `Generador de CAE y QR fiscal operativo para CUIT ${clinicInfo.cuit}. Conexión directa contra Web Services en homologación a la espera de certificados de producción delegados (Fase 2).`,
      icon: 'Receipt',
      color: '#002182'
    },
    {
      id: 'sisa',
      name: 'SISA — Registro Federal de Profesionales (REFEPS)',
      organism: 'Sistema de Información Sanitaria Argentino',
      normative: 'Resolución MSAL 1341/2013',
      status: 'Próximamente (Fase 2 / En Certificación)',
      badge: 'PRÓXIMAMENTE',
      isLive: false,
      endpoint: 'https://sisa.msal.gov.ar/ws/refeps/v1',
      details: `Establecimiento REFES: ${clinicInfo.sisaRefesCode}. Validación de matrículas profesionales operando en catálogo interno con sincronización federada programada para Fase 2.`,
      icon: 'ShieldCheck',
      color: '#0d9488'
    },
    {
      id: 'fhir',
      name: 'HL7® FHIR® Argentina Core',
      organism: 'Dirección Nacional de Sistemas de Información Sanitaria',
      normative: 'Estrategia Nacional de Salud Digital 2024-2030',
      status: 'Próximamente (Fase 2 / En Diseño)',
      badge: 'PRÓXIMAMENTE',
      isLive: false,
      endpoint: 'https://fhir.salud.gob.ar/r4/citra',
      details: 'Definición de perfiles HL7 FHIR Argentina Core (Patient, Encounter, Condition) en diseño para futura interoperabilidad federada (Fase 2).',
      icon: 'Globe',
      color: '#257CE6'
    }
  ];

  const handleTestConnection = (id, name) => {
    setTestingService(id);
    setTimeout(() => {
      setTestingService(null);
      addToast('Prueba de Conector Sandbox', `El conector ${name} responde satisfactoriamente en entorno de desarrollo/pruebas locales (Mock Sandbox).`, 'info');
    }, 600);
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

      {/* Regulatory Sandbox Disclaimer Banner */}
      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
        <AlertCircle size={22} color="#1D4ED8" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.88rem', color: '#1E3A8A', lineHeight: 1.5 }}>
          <strong>Aviso de Homologación & Transparencia Regulatoria (B-03):</strong>
          <div>Los servicios expuestos a continuación se encuentran rotulados como <strong>PRÓXIMAMENTE (FASE 2)</strong>. Operan bajo arquitectura de simulación normativa interna. La emisión directa contra los Web Services gubernamentales en tiempo real requiere la adhesión formal de certificados fiscales delegados (AFIP/ARCA) y claves WS-Security de SISA provistas por el Ministerio de Salud.</div>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '0.5rem' }}>
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
                    background: '#FEF3C7',
                    color: '#92400E',
                    border: '1px solid #FDE68A',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <AlertCircle size={13} color="#D97706" />
                  <span>{item.status}</span>
                </span>
              </div>

              <div style={{ background: '#F5F8FE', border: '1px solid #D2E3FC', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.84rem', color: '#172A4A' }}>
                {item.details}
                <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748b', marginTop: '4px' }}>
                  Endpoint configurado: {item.endpoint}
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
                <span>{testingService === item.id ? 'Comprobando...' : 'Verificar Mock Sandbox (Próximamente)'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
