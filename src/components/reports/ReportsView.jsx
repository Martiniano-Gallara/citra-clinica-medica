import React, { useState, useMemo } from 'react';
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
  Printer,
  Stethoscope,
  Clock,
  CheckCircle2,
  Award
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
    healthInsurances,
    isDoctor,
    currentDoctor,
    scopedAppointments,
    scopedPatients,
    scopedConsultations
  } = useClinic();

  const [period, setPeriod] = useState('month'); // 'week', 'month', 'year'

  const handleExportPDF = () => {
    window.print();
  };

  // ==============================================================
  // DOCTOR PERSONAL METRICS & CHARTS (DR. ALEJANDRO BLANCO SCOPE)
  // ==============================================================
  const doctorMetrics = useMemo(() => {
    if (!isDoctor || !currentDoctor) return null;

    const totalConsultations = scopedConsultations.length;
    const totalAppointments = scopedAppointments.length;
    const completedAppts = scopedAppointments.filter((a) => a.status === 'Completado' || a.status === 'Atendido' || a.status === 'En Espera').length;
    const cancelledAppts = scopedAppointments.filter((a) => a.status === 'Cancelado').length;
    const attendanceRate = totalAppointments > 0 ? Math.round(((totalAppointments - cancelledAppts) / totalAppointments) * 100) : 96;

    // Monthly Fee Revenue for Doctor
    const pricePerConsult = currentDoctor.consultationPrice || 12000;
    const feePct = (currentDoctor.feePercentage || 75) / 100;
    const estimatedMonthlyFees = Math.round(Math.max(totalConsultations, 18) * pricePerConsult * feePct);

    // Distribution by insurance of his patients
    const insuranceCounts = {};
    scopedAppointments.forEach((a) => {
      const insName = a.healthInsurance || 'Particular';
      insuranceCounts[insName] = (insuranceCounts[insName] || 0) + 1;
    });

    const insLabels = Object.keys(insuranceCounts).length > 0
      ? Object.keys(insuranceCounts)
      : ['OSDE (40%)', 'Swiss Medical (28%)', 'Galeno (16%)', 'Particular (16%)'];
    const insValues = Object.keys(insuranceCounts).length > 0
      ? Object.values(insuranceCounts)
      : [40, 28, 16, 16];

    return {
      totalConsultations,
      totalAppointments,
      completedAppts,
      attendanceRate,
      estimatedMonthlyFees,
      uniquePatients: scopedPatients.length,
      insLabels,
      insValues
    };
  }, [isDoctor, currentDoctor, scopedConsultations, scopedAppointments, scopedPatients]);

  // Doctor Chart: Monthly Honorarios Evolution
  const doctorRevenueTrendData = {
    labels: ['Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto (Actual)'],
    datasets: [
      {
        fill: true,
        label: 'Honorarios Médicos Percibidos ($)',
        data: [780000, 890000, 960000, 1050000, 1180000, 1260000],
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.12)',
        tension: 0.35
      }
    ]
  };

  // Doctor Chart: Distribution by Health Insurance
  const doctorInsuranceData = {
    labels: doctorMetrics?.insLabels || ['OSDE', 'Swiss Medical', 'Particular', 'Galeno'],
    datasets: [
      {
        data: doctorMetrics?.insValues || [35, 25, 20, 20],
        backgroundColor: ['#059669', '#0d9488', '#0284c7', '#6366f1', '#f59e0b'],
        borderWidth: 0
      }
    ]
  };

  // Doctor Chart: Weekly Patient Distribution by Working Day (Lun, Mié, Vie)
  const doctorWeeklyScheduleData = {
    labels: ['Lunes', 'Martes (Quirófano)', 'Miércoles', 'Jueves (Guardia)', 'Viernes'],
    datasets: [
      {
        label: 'Consultas Traumatología',
        data: [14, 4, 16, 2, 12],
        backgroundColor: '#059669',
        borderRadius: 6
      }
    ]
  };

  // ==============================================================
  // CLINIC GLOBAL METRICS (ADMINISTRATIVE / SUPERADMIN SCOPE)
  // ==============================================================
  const revenueTrendData = {
    labels: ['Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto (Actual)'],
    datasets: [
      {
        fill: true,
        label: 'Facturación Total ($)',
        data: [1420000, 1680000, 1890000, 2100000, 2450000, 2890000],
        borderColor: '#076ABC',
        backgroundColor: 'rgba(7, 106, 188, 0.15)',
        tension: 0.35
      }
    ]
  };

  const specialtyDistributionData = {
    labels: ['Traumatología', 'Kinesiología', 'Rehabilitación', 'Clínica Médica', 'Cardiología', 'Dermatología'],
    datasets: [
      {
        label: 'Turnos',
        data: [54, 48, 39, 35, 28, 24],
        backgroundColor: [
          '#002182',
          '#076ABC',
          '#257CE6',
          '#0d9488',
          '#14b8a6',
          '#99f6e4'
        ],
        borderRadius: 6
      }
    ]
  };

  const insuranceDoughnutData = {
    labels: ['OSDE (38%)', 'Swiss Medical (24%)', 'Galeno (16%)', 'Apross / PAMI (12%)', 'Particular (10%)'],
    datasets: [
      {
        data: [38, 24, 16, 12, 10],
        backgroundColor: ['#002182', '#076ABC', '#257CE6', '#14b8a6', '#496386'],
        borderWidth: 0
      }
    ]
  };

  const patientRetentionData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
    datasets: [
      {
        label: 'Pacientes Recurrentes',
        data: [18, 22, 19, 25, 28],
        backgroundColor: '#076ABC'
      },
      {
        label: 'Pacientes Nuevos (1ra vez)',
        data: [6, 8, 5, 9, 7],
        backgroundColor: '#257CE6'
      }
    ]
  };

  // ==============================================================
  // RENDER: DOCTOR VIEW (ESTADÍSTICAS EXCLUSIVAS DE ÉL)
  // ==============================================================
  if (isDoctor) {
    return (
      <div className="reports-container">
        {/* Header Doctor */}
        <div className="page-header">
          <div className="page-title-group">
            <div className="badge-wrapper" style={{ marginBottom: '0.4rem' }}>
              <span className="badge badge-teal" style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>
                <Stethoscope size={13} style={{ marginRight: '4px' }} />
                Estadísticas Profesionales · {currentDoctor?.name?.startsWith('Dr.') ? currentDoctor.name : `Dr. ${currentDoctor?.name || 'Alejandro Blanco'}`}
              </span>
            </div>
            <h1>
              <BarChart3 size={30} color="#059669" />
              <span>Mis Métricas de Rendimiento & Consultas</span>
            </h1>
            <p>Rendimiento clínico individual, honorarios devengados, asistencia y distribución de pacientes atendidos</p>
          </div>

          <div className="page-actions-group">
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
              <button
                type="button"
                className={`btn btn-sm ${period === 'week' ? 'btn-primary' : 'btn-outline'}`}
                style={{ border: 'none' }}
                onClick={() => setPeriod('week')}
              >
                Semanal
              </button>
              <button
                type="button"
                className={`btn btn-sm ${period === 'month' ? 'btn-primary' : 'btn-outline'}`}
                style={{ border: 'none' }}
                onClick={() => setPeriod('month')}
              >
                Mensual
              </button>
              <button
                type="button"
                className={`btn btn-sm ${period === 'year' ? 'btn-primary' : 'btn-outline'}`}
                style={{ border: 'none' }}
                onClick={() => setPeriod('year')}
              >
                Anual
              </button>
            </div>

            <button type="button" className="btn btn-primary" onClick={handleExportPDF} style={{ background: '#059669', borderColor: '#059669' }}>
              <Printer size={16} />
              <span>Imprimir Mi Reporte</span>
            </button>
          </div>
        </div>

        {/* Doctor KPIs */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-top">
              <span className="kpi-label">Mis Consultas Realizadas</span>
              <div className="kpi-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
                <Activity size={22} />
              </div>
            </div>
            <div className="kpi-value">{doctorMetrics?.totalConsultations || 24}</div>
            <div className="kpi-trend positive">
              <TrendingUp size={15} />
              <span>+14.2% vs mes anterior</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-top">
              <span className="kpi-label">Mis Honorarios Liquidados</span>
              <div className="kpi-icon-box" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                <DollarSign size={22} />
              </div>
            </div>
            <div className="kpi-value" style={{ color: '#16a34a' }}>
              ${doctorMetrics?.estimatedMonthlyFees?.toLocaleString() || '1.260.000'}
            </div>
            <div className="kpi-trend positive">
              <Award size={15} />
              <span>{currentDoctor?.feePercentage || 75}% liquidación honorarios</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-top">
              <span className="kpi-label">Pacientes en Mi Padrón</span>
              <div className="kpi-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <Users size={22} />
              </div>
            </div>
            <div className="kpi-value">{doctorMetrics?.uniquePatients || 18}</div>
            <div className="kpi-trend positive">
              <span>Bajo su seguimiento traumatológico</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-top">
              <span className="kpi-label">Tasa de Asistencia en Consultorio</span>
              <div className="kpi-icon-box" style={{ background: '#fefce8', color: '#ca8a04' }}>
                <CheckCircle2 size={22} />
              </div>
            </div>
            <div className="kpi-value">{doctorMetrics?.attendanceRate || 96}%</div>
            <div className="kpi-trend positive">
              <span>Alta adherencia a turnos</span>
            </div>
          </div>
        </div>

        {/* Row 1: Doctor Honorarios Line & Patient Insurance Doughnut */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <TrendingUp size={20} color="#059669" />
                <span>Evolución de Mis Honorarios Profesionales ($)</span>
              </div>
            </div>
            <div style={{ height: '280px' }}>
              <Line
                data={doctorRevenueTrendData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    y: {
                      ticks: {
                        callback: (value) => `$${(value / 1000).toFixed(0)}k`
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <PieChartIcon size={20} color="#059669" />
                <span>Mis Pacientes por Prepaga</span>
              </div>
            </div>
            <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Doughnut
                data={doctorInsuranceData}
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

        {/* Row 2: Consultations per Working Day */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <BarChart3 size={20} color="#059669" />
              <span>Carga Asistencial de Mis Consultas por Día de Atención</span>
            </div>
          </div>
          <div style={{ height: '260px' }}>
            <Bar
              data={doctorWeeklyScheduleData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================
  // RENDER: ADMINISTRATIVE / SUPERADMIN GLOBAL REPORT
  // ==============================================================
  return (
    <div className="reports-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <BarChart3 size={32} color="#076ABC" />
            <span>Estadísticas & Reportes Ejecutivos Institucionales</span>
          </h1>
          <p>Métricas globales de la clínica: productividad, volumen de pacientes, ingresos por especialidad y retención</p>
        </div>

        <div className="page-actions-group">
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
            <button
              type="button"
              className={`btn btn-sm ${period === 'week' ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none' }}
              onClick={() => setPeriod('week')}
            >
              Semanal
            </button>
            <button
              type="button"
              className={`btn btn-sm ${period === 'month' ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none' }}
              onClick={() => setPeriod('month')}
            >
              Mensual
            </button>
            <button
              type="button"
              className={`btn btn-sm ${period === 'year' ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none' }}
              onClick={() => setPeriod('year')}
            >
              Anual
            </button>
          </div>

          <button type="button" className="btn btn-primary" onClick={handleExportPDF}>
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
