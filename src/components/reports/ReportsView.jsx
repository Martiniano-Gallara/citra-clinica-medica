import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Users,
  UserX,
  PieChart as PieChartIcon,
  Activity,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

export const ReportsView = () => {
  const {
    appointments,
    invoices,
    doctors,
    specialties,
    healthInsurances
  } = useClinic();

  const [period, setPeriod] = useState('month'); // 'today', 'week', 'month', 'year'

  // Monthly revenue trend (Past 6 months simulation)
  const revenueTrendData = {
    labels: ['Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto (Actual)'],
    datasets: [
      {
        fill: true,
        label: 'Facturación Total ($)',
        data: [1420000, 1680000, 1890000, 2100000, 2450000, 2890000],
        borderColor: '#1A9E9B',
        backgroundColor: 'rgba(26, 158, 155, 0.15)',
        tension: 0.35
      }
    ]
  };

  // Turnos por Especialidad
  const specialtyDistributionData = {
    labels: ['Traumatología', 'Kinesiología', 'Rehabilitación', 'Clínica Médica', 'Cardiología', 'Dermatología'],
    datasets: [
      {
        label: 'Turnos',
        data: [54, 48, 39, 35, 28, 24],
        backgroundColor: [
          '#0C4E4C',
          '#1A9E9B',
          '#6FD0CC',
          '#0d9488',
          '#14b8a6',
          '#99f6e4'
        ],
        borderRadius: 6
      }
    ]
  };

  // Distribución por Obra Social / Prepaga
  const insuranceDoughnutData = {
    labels: ['OSDE (38%)', 'Swiss Medical (24%)', 'Galeno (16%)', 'Apross / PAMI (12%)', 'Particular (10%)'],
    datasets: [
      {
        data: [38, 24, 16, 12, 10],
        backgroundColor: ['#0C4E4C', '#1A9E9B', '#6FD0CC', '#14b8a6', '#4e7a78'],
        borderWidth: 0
      }
    ]
  };

  // Pacientes Nuevos vs Recurrentes
  const patientRetentionData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
    datasets: [
      {
        label: 'Pacientes Recurrentes',
        data: [18, 22, 19, 25, 28],
        backgroundColor: '#1A9E9B'
      },
      {
        label: 'Pacientes Nuevos (1ra vez)',
        data: [6, 8, 5, 9, 7],
        backgroundColor: '#6FD0CC'
      }
    ]
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="reports-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <BarChart3 size={32} color="#1A9E9B" />
            <span>Estadísticas & Reportes Ejecutivos</span>
          </h1>
          <p>Métricas de productividad, volumen de pacientes, ingresos por especialidad y retención</p>
        </div>

        <div className="page-actions-group">
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
            <button
              className={`btn btn-sm ${period === 'week' ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none' }}
              onClick={() => setPeriod('week')}
            >
              Semanal
            </button>
            <button
              className={`btn btn-sm ${period === 'month' ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none' }}
              onClick={() => setPeriod('month')}
            >
              Mensual
            </button>
            <button
              className={`btn btn-sm ${period === 'year' ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none' }}
              onClick={() => setPeriod('year')}
            >
              Anual
            </button>
          </div>

          <button className="btn btn-primary" onClick={handleExportPDF}>
            <Printer size={16} />
            <span>Imprimir / Exportar Reporte</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Highlights */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Consultas Totales (Mes)</span>
            <div className="kpi-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Activity size={22} />
            </div>
          </div>
          <div className="kpi-value">1,482</div>
          <div className="kpi-trend positive">
            <TrendingUp size={15} />
            <span>+18.4% vs mes anterior</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Facturación Mensual</span>
            <div className="kpi-icon-box" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <DollarSign size={22} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#16a34a' }}>
            $2.890.000
          </div>
          <div className="kpi-trend positive">
            <TrendingUp size={15} />
            <span>+22.1% crecimiento</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Nuevos Pacientes</span>
            <div className="kpi-icon-box" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
              <Users size={22} />
            </div>
          </div>
          <div className="kpi-value">184</div>
          <div className="kpi-trend positive">
            <span>24% del volumen total</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Tasa de Asistencia</span>
            <div className="kpi-icon-box" style={{ background: '#fefce8', color: '#ca8a04' }}>
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="kpi-value">94.2%</div>
          <div className="kpi-trend positive">
            <span>Ausentismo bajo (5.8%)</span>
          </div>
        </div>
      </div>

      {/* Row 1: Revenue Line Chart & Insurance Doughnut */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Revenue Growth Line */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <TrendingUp size={20} color="#2563eb" />
              <span>Evolución Histórica de Facturación e Ingresos</span>
            </div>
          </div>
          <div style={{ height: '280px' }}>
            <Line
              data={revenueTrendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: {
                    ticks: {
                      callback: (value) => `$${(value / 1000000).toFixed(1)}M`
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Insurance Doughnut */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <PieChartIcon size={20} color="#2563eb" />
              <span>Pacientes por Prepaga</span>
            </div>
          </div>
          <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Doughnut
              data={insuranceDoughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10.5 } } }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Row 2: Turnos por Especialidad & Pacientes Nuevos vs Recurrentes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Turnos por Especialidad Bar */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <BarChart3 size={20} color="#2563eb" />
              <span>Demanda de Turnos por Especialidad</span>
            </div>
          </div>
          <div style={{ height: '260px' }}>
            <Bar
              data={specialtyDistributionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
              }}
            />
          </div>
        </div>

        {/* Nuevos vs Recurrentes */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Users size={20} color="#2563eb" />
              <span>Fidelización: Nuevos vs Recurrentes</span>
            </div>
          </div>
          <div style={{ height: '260px' }}>
            <Bar
              data={patientRetentionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { stacked: true },
                  y: { stacked: true }
                },
                plugins: {
                  legend: { position: 'bottom', labels: { boxWidth: 12 } }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
