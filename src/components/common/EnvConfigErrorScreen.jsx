import React from 'react';
import { AlertTriangle, Server, Key, FileCode, CheckCircle2, XCircle, ArrowRight, ShieldAlert } from 'lucide-react';

export const EnvConfigErrorScreen = ({ diagnostics, onBypass }) => {
  const isProd = diagnostics?.isProd ?? true;
  const missingUrl = diagnostics?.missingUrl;
  const missingKey = diagnostics?.missingKey;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0B132B',
        color: '#E0E7FF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.25rem',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
    >
      <div
        style={{
          maxWidth: '680px',
          width: '100%',
          background: '#1C2541',
          border: '1.5px solid #EF4444',
          borderRadius: '20px',
          padding: '2.5rem 2rem',
          boxShadow: '0 20px 50px rgba(239, 68, 68, 0.25)',
          boxSizing: 'border-box'
        }}
      >
        {/* Header Icon & Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1.5px solid #EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#EF4444',
              flexShrink: 0
            }}
          >
            <ShieldAlert size={28} />
          </div>
          <div>
            <span
              style={{
                background: '#EF4444',
                color: '#ffffff',
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 900,
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}
            >
              Auditoría B-04 · Bloqueo de Arranque
            </span>
            <h1
              style={{
                margin: '0.35rem 0 0',
                fontSize: '1.35rem',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.02em'
              }}
            >
              Error Crítico: Persistencia Cloud no Configurada
            </h1>
          </div>
        </div>

        {/* Diagnostic Explanation */}
        <p style={{ fontSize: '0.92rem', color: '#94A3B8', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
          La plataforma médica <strong>CITRA</strong> no puede iniciar en modo de producción sin las variables de entorno para la base de datos central en Supabase.
          Operar sin estas variables provocaría que los turnos, consultas y recetas operen en memoria volátil no persistida, violando la integridad de datos clínicos.
        </p>

        {/* Variables Diagnostic Checklist */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '14px',
            border: '1px solid #334155',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Diagnóstico de Variables Requeridas (.env):
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.86rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F1F5F9' }}>
              <Server size={16} color={missingUrl ? '#EF4444' : '#10B981'} />
              <code>VITE_SUPABASE_URL</code>
            </div>
            {missingUrl ? (
              <span style={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, fontSize: '0.8rem' }}>
                <XCircle size={15} /> Ausente / Inválida
              </span>
            ) : (
              <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, fontSize: '0.8rem' }}>
                <CheckCircle2 size={15} /> Configurada
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.86rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F1F5F9' }}>
              <Key size={16} color={missingKey ? '#EF4444' : '#10B981'} />
              <code>VITE_SUPABASE_ANON_KEY</code>
            </div>
            {missingKey ? (
              <span style={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, fontSize: '0.8rem' }}>
                <XCircle size={15} /> Ausente / Inválida
              </span>
            ) : (
              <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, fontSize: '0.8rem' }}>
                <CheckCircle2 size={15} /> Configurada
              </span>
            )}
          </div>
        </div>

        {/* How to Resolve Instructions */}
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.7)',
            borderRadius: '12px',
            border: '1px solid #475569',
            padding: '1.1rem 1.25rem',
            marginBottom: '1.75rem',
            fontSize: '0.85rem',
            color: '#CBD5E1',
            lineHeight: 1.55
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, color: '#38BDF8', marginBottom: '0.5rem' }}>
            <FileCode size={16} /> Instrucciones de Resolución:
          </div>
          <ol style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <li>Cree o copie el archivo <code>.env.example</code> a <code>.env</code> en la raíz del proyecto.</li>
            <li>Configure los valores reales de su instancia de Supabase (Project Settings &gt; API).</li>
            <li>Reinicie el servidor de desarrollo o vuelva a compilar el paquete de producción.</li>
          </ol>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
            Entorno: <strong>{isProd ? 'Producción (Bloqueo Estricto)' : 'Desarrollo Local'}</strong>
          </div>

          {!isProd && onBypass && (
            <button
              onClick={onBypass}
              style={{
                background: 'transparent',
                border: '1px solid #475569',
                color: '#94A3B8',
                padding: '0.6rem 1.1rem',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#F1F5F9';
                e.currentTarget.style.borderColor = '#94A3B8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94A3B8';
                e.currentTarget.style.borderColor = '#475569';
              }}
            >
              <span>Continuar en Modo Mock / Sandbox (Solo Dev)</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
