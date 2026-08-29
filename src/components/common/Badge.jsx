import React from 'react';

export const Badge = ({ status, label }) => {
  const getStatusClass = (st) => {
    const s = (st || '').toLowerCase().replace(/\s+/g, '_');
    switch (s) {
      case 'confirmado':
        return 'badge-confirmado';
      case 'pendiente':
        return 'badge-pendiente';
      case 'en_sala':
      case 'en sala':
        return 'badge-ensala';
      case 'atendido':
      case 'cobrado':
      case 'activo':
      case 'activa':
        return 'badge-atendido';
      case 'cancelado':
      case 'anulado':
      case 'critico':
        return 'badge-cancelado';
      case 'ausente':
      case 'en_proceso':
      case 'en proceso':
        return 'badge-ausente';
      default:
        return 'badge-pendiente';
    }
  };

  const formatLabel = (st, customLabel) => {
    if (customLabel) return customLabel;
    const s = (st || '').toLowerCase();
    switch (s) {
      case 'confirmado': return 'Confirmado';
      case 'pendiente': return 'Pendiente';
      case 'en_sala': return 'En Sala de Espera';
      case 'atendido': return 'Atendido';
      case 'cancelado': return 'Cancelado';
      case 'ausente': return 'Ausente';
      default: return st;
    }
  };

  return (
    <span className={`badge ${getStatusClass(status)}`}>
      <span className="badge-dot"></span>
      {formatLabel(status, label)}
    </span>
  );
};
