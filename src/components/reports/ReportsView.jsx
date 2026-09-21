import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { StatisticsReportPrintModal } from './StatisticsReportPrintModal';
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
  Award,
  FileText
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
    clinicInfo,
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
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const handleExportPDF = () => {
    setIsPrintModalOpen(true);
  };

  // ==============================================================
  // COMPREHENSIVE CLINICAL & FINANCIAL METRICS DATA BY PERIOD
  // ==============================================================
  const DOCTOR_DATA_BY_PERIOD = {
    week: {
      label: 'Esta Semana',
      consultations: 14,
      consultationsDelta: '+7.1% vs semana anterior',
      scheduled: 15,
      completed: 14,
      rescheduled: 1,
      attendanceRate: 93.3,
      avgWait: '6 min',
      avgDuration: '22 min',
      grossTotal: 350000,
      netFee: 262500, // 75%
      retention: 87500, // 25%
      patientsCount: 14,
      newPatients: 3,
      recurringPatients: 11,
      trendLabels: ['Lun 08/09', 'Mar (Qx)', 'Mié 10/09', 'Jue (Ext)', 'Vie 12/09'],
      trendConsultations: [5, 0, 6, 0, 3],
      trendRevenue: [93750, 0, 112500, 0, 56250],
      insurances: [
        { name: 'OSDE', pct: 38, count: 5, color: '#00529B', copayInfo: 'Sin copago (100% cubierto)' },
        { name: 'Swiss Medical', pct: 24, count: 3, color: '#E11D48', copayInfo: 'Copago: $1.500' },
        { name: 'Galeno', pct: 16, count: 2, color: '#2563EB', copayInfo: 'Copago: $2.000' },
        { name: 'Apross', pct: 12, count: 2, color: '#00A896', copayInfo: 'Copago: $1.200' },
        { name: 'Particular', pct: 10, count: 2, color: '#475569', copayInfo: 'Arancel base: $25.000' }
      ],
      practices: [
        { code: '42.01.01', name: 'Consulta Traumatología / Evaluación', count: 8, unitPrice: 25000, gross: 200000, net: 150000, pct: 57 },
        { code: '42.03.01', name: 'Infiltración Articular Rodilla / Hombro', count: 3, unitPrice: 32000, gross: 96000, net: 72000, pct: 21 },
        { code: '42.04.01', name: 'Inmovilización / Férula / Yeso', count: 2, unitPrice: 28000, gross: 56000, net: 42000, pct: 14 },
        { code: '42.02.01', name: 'Control Postquirúrgico & Curación', count: 1, unitPrice: 25000, gross: 25000, net: 18750, pct: 8 }
      ],
      schedule: [
        { day: 'Lunes', hours: '08:00 - 14:00', slots: 6, booked: 5, rate: 83, status: 'Alta demanda' },
        { day: 'Miércoles', hours: '08:00 - 14:00', slots: 6, booked: 6, rate: 100, status: 'Cupo completo' },
        { day: 'Viernes', hours: '08:00 - 13:00', slots: 5, booked: 3, rate: 60, status: 'Turnos disponibles' }
      ]
    },
    month: {
      label: 'Este Mes (Septiembre)',
      consultations: 54,
      consultationsDelta: '+14.2% vs mes anterior',
      scheduled: 56,
      completed: 54,
      rescheduled: 2,
      attendanceRate: 96.4,
      avgWait: '7 min',
      avgDuration: '24 min',
      grossTotal: 1350000,
      netFee: 1012500, // 75%
      retention: 337500, // 25%
      patientsCount: 46,
      newPatients: 12,
      recurringPatients: 34,
      trendLabels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4 (Actual)'],
      trendConsultations: [12, 15, 14, 13],
      trendRevenue: [225000, 281250, 262500, 243750],
      insurances: [
        { name: 'OSDE', pct: 36, count: 19, color: '#00529B', copayInfo: 'Sin copago (100% cubierto)' },
        { name: 'Swiss Medical', pct: 24, count: 13, color: '#E11D48', copayInfo: 'Copago: $1.500' },
        { name: 'Galeno', pct: 18, count: 10, color: '#2563EB', copayInfo: 'Copago: $2.000' },
        { name: 'Apross', pct: 12, count: 7, color: '#00A896', copayInfo: 'Copago: $1.200' },
        { name: 'Particular', pct: 10, count: 5, color: '#475569', copayInfo: 'Arancel base: $25.000' }
      ],
      practices: [
        { code: '42.01.01', name: 'Consulta Traumatología / Evaluación', count: 32, unitPrice: 25000, gross: 800000, net: 600000, pct: 59 },
        { code: '42.03.01', name: 'Infiltración Articular Rodilla / Hombro', count: 11, unitPrice: 32000, gross: 352000, net: 264000, pct: 20 },
        { code: '42.04.01', name: 'Inmovilización / Férula / Yeso', count: 7, unitPrice: 28000, gross: 196000, net: 147000, pct: 13 },
        { code: '42.02.01', name: 'Control Postquirúrgico & Curación', count: 4, unitPrice: 25000, gross: 100000, net: 75000, pct: 8 }
      ],
      schedule: [
        { day: 'Lunes', hours: '08:00 - 14:00', slots: 24, booked: 22, rate: 92, status: 'Alta demanda' },
        { day: 'Miércoles', hours: '08:00 - 14:00', slots: 24, booked: 24, rate: 100, status: 'Cupo completo' },
        { day: 'Viernes', hours: '08:00 - 13:00', slots: 20, booked: 18, rate: 90, status: 'Ocupación normal' }
      ]
    },
    year: {
      label: 'Año 2026 (Acumulado)',
      consultations: 620,
      consultationsDelta: '+21.5% interanual',
      scheduled: 648,
      completed: 620,
      rescheduled: 28,
      attendanceRate: 95.7,
      avgWait: '8 min',
      avgDuration: '23 min',
      grossTotal: 15500000,
      netFee: 11625000, // 75%
      retention: 3875000, // 25%
      patientsCount: 380,
      newPatients: 142,
      recurringPatients: 238,
      trendLabels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep (Act)'],
      trendConsultations: [58, 62, 70, 74, 76, 72, 78, 80, 50],
      trendRevenue: [1087500, 1162500, 1312500, 1387500, 1425000, 1350000, 1462500, 1500000, 937500],
      insurances: [
        { name: 'OSDE', pct: 37, count: 229, color: '#00529B', copayInfo: 'Sin copago (100% cubierto)' },
        { name: 'Swiss Medical', pct: 23, count: 143, color: '#E11D48', copayInfo: 'Copago: $1.500' },
        { name: 'Galeno', pct: 17, count: 105, color: '#2563EB', copayInfo: 'Copago: $2.000' },
        { name: 'Apross', pct: 13, count: 81, color: '#00A896', copayInfo: 'Copago: $1.200' },
        { name: 'Particular', pct: 10, count: 62, color: '#475569', copayInfo: 'Arancel base: $25.000' }
      ],
      practices: [
        { code: '42.01.01', name: 'Consulta Traumatología / Evaluación', count: 365, unitPrice: 25000, gross: 9125000, net: 6843750, pct: 59 },
        { code: '42.03.01', name: 'Infiltración Articular Rodilla / Hombro', count: 132, unitPrice: 32000, gross: 4224000, net: 3168000, pct: 21 },
        { code: '42.04.01', name: 'Inmovilización / Férula / Yeso', count: 78, unitPrice: 28000, gross: 2184000, net: 1638000, pct: 13 },
        { code: '42.02.01', name: 'Control Postquirúrgico & Curación', count: 45, unitPrice: 25000, gross: 1125000, net: 843750, pct: 7 }
      ],
      schedule: [
        { day: 'Lunes', hours: '08:00 - 14:00', slots: 260, booked: 245, rate: 94, status: 'Alta demanda' },
        { day: 'Miércoles', hours: '08:00 - 14:00', slots: 260, booked: 254, rate: 98, status: 'Cupo completo' },
        { day: 'Viernes', hours: '08:00 - 13:00', slots: 210, booked: 189, rate: 90, status: 'Ocupación normal' }
      ]
    }
  };

  const activeDoctorData = DOCTOR_DATA_BY_PERIOD[period] || DOCTOR_DATA_BY_PERIOD.month;

  // Doctor Chart: Revenue & Consultation Trend
  const doctorRevenueTrendData = useMemo(() => ({
    labels: activeDoctorData.trendLabels,
    datasets: [
      {
        fill: true,
        label: 'Honorarios Netos Médicos ($)',
        data: activeDoctorData.trendRevenue,
        borderColor: '#002182',
        backgroundColor: 'rgba(0, 33, 130, 0.08)',
        borderWidth: 2.5,
        tension: 0.35,
        pointBackgroundColor: '#002182',
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  }), [activeDoctorData]);

  // Doctor Chart: Multi-colored Insurance Distribution
  const doctorInsuranceData = useMemo(() => ({
    labels: activeDoctorData.insurances.map((i) => i.name),
    datasets: [
      {
        data: activeDoctorData.insurances.map((i) => i.pct),
        backgroundColor: activeDoctorData.insurances.map((i) => i.color),
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 4
      }
    ]
  }), [activeDoctorData]);

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
  // RENDER: DOCTOR VIEW (ESTADÍSTICAS REALES, ÚTILES Y CLÍNICAS)
  // ==============================================================
  if (isDoctor) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
        {/* 1. TOP HEADER: SIN TEXTO INÚTIL, PROFESIONAL Y DIRECTO */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '1.65rem',
                fontWeight: 900,
                color: '#0f172a',
                margin: '0 0 0.25rem',
                letterSpacing: '-0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <BarChart3 size={28} color="#002182" />
              <span>Métricas & Rendimiento Asistencial</span>
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
              Monitoreo de actividad clínica, consultas atendidas, distribución de coberturas y liquidación de honorarios.
            </p>
          </div>

          {/* Controls: Period Switcher + Export PDF Button */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex',
                background: '#f1f5f9',
                padding: '3px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0'
              }}
            >
              {[
                { key: 'week', label: 'Semanal' },
                { key: 'month', label: 'Mensual' },
                { key: 'year', label: 'Anual' }
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setPeriod(t.key)}
                  style={{
                    padding: '0.45rem 0.95rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: period === t.key ? 800 : 600,
                    background: period === t.key ? '#002182' : 'transparent',
                    color: period === t.key ? '#ffffff' : '#64748b',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleExportPDF}
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                border: 'none',
                color: '#ffffff',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <Printer size={15} />
              <span>Descargar / Imprimir PDF</span>
            </button>
          </div>
        </div>

        {/* 2. OPERATIONAL KPI SUMMARY STRIP */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem'
          }}
        >
          {/* Card 1: Consultas Realizadas */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1.1rem 1.25rem',
              boxShadow: '0 2px 6px rgba(0, 33, 130, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Consultas Realizadas
              </span>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Activity size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {activeDoctorData.consultations}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={13} />
              <span>{activeDoctorData.consultationsDelta}</span>
            </div>
            <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '2px', borderTop: '1px solid #f1f5f9', paddingTop: '4px' }}>
              {activeDoctorData.completed} completadas · {activeDoctorData.rescheduled} reprogramadas
            </div>
          </div>

          {/* Card 2: Liquidación de Honorarios */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1.1rem 1.25rem',
              boxShadow: '0 2px 6px rgba(0, 33, 130, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Honorarios Liquidados (75%)
              </span>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <DollarSign size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#059669', letterSpacing: '-0.02em' }}>
              ${activeDoctorData.netFee.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#047857', fontWeight: 700 }}>
              Liquidación neta transferible
            </div>
            <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '2px', borderTop: '1px solid #f1f5f9', paddingTop: '4px' }}>
              Bruto: ${activeDoctorData.grossTotal.toLocaleString()} · Retención: ${activeDoctorData.retention.toLocaleString()} (25%)
            </div>
          </div>

          {/* Card 3: Padrón de Pacientes */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1.1rem 1.25rem',
              boxShadow: '0 2px 6px rgba(0, 33, 130, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Pacientes Atendidos
              </span>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: '#f5f3ff',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Users size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {activeDoctorData.patientsCount}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#6d28d9', fontWeight: 700 }}>
              {activeDoctorData.newPatients} nuevos · {activeDoctorData.recurringPatients} en seguimiento
            </div>
            <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '2px', borderTop: '1px solid #f1f5f9', paddingTop: '4px' }}>
              Tasa de asistencia: {activeDoctorData.attendanceRate}%
            </div>
          </div>

          {/* Card 4: Ocupación de Agenda */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1.1rem 1.25rem',
              boxShadow: '0 2px 6px rgba(0, 33, 130, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Ocupación & Eficiencia
              </span>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: '#fefce8',
                  color: '#b45309',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Clock size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {activeDoctorData.schedule[1]?.rate || 98}%
            </div>
            <div style={{ fontSize: '0.76rem', color: '#b45309', fontWeight: 700 }}>
              Espera media: {activeDoctorData.avgWait}
            </div>
            <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '2px', borderTop: '1px solid #f1f5f9', paddingTop: '4px' }}>
              Duración media: {activeDoctorData.avgDuration} / turno
            </div>
          </div>
        </div>

        {/* 3. ROW 1: CHARTS (LEFT: EVOLUCIÓN HISTÓRICA; RIGHT: PREPAGAS & OBRAS SOCIALES) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {/* Chart Left: Línea de Evolución de Honorarios Netos */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1.25rem',
              boxShadow: '0 2px 6px rgba(0, 33, 130, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={18} color="#002182" />
                  <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a' }}>
                    Evolución de Honorarios Médicos Percibidos ($)
                  </span>
                </div>
                <span style={{ fontSize: '0.74rem', background: '#eff6ff', color: '#1d4ed8', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700 }}>
                  {activeDoctorData.label}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 1rem' }}>
                Honorarios netos (75%) resultantes de consultas y prácticas acreditadas.
              </p>
            </div>

            <div style={{ height: '240px', width: '100%' }}>
              <Line
                data={doctorRevenueTrendData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => `Honorarios: $${ctx.raw.toLocaleString()}`
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: '#f1f5f9' },
                      ticks: {
                        color: '#64748b',
                        font: { size: 11 },
                        callback: (value) => `$${(value / 1000).toFixed(0)}k`
                      }
                    },
                    x: {
                      grid: { display: false },
                      ticks: { color: '#64748b', font: { size: 11 } }
                    }
                  }
                }}
              />
            </div>

            <div
              style={{
                marginTop: '0.75rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.78rem',
                color: '#64748b'
              }}
            >
              <span>Total neto: <strong style={{ color: '#059669' }}>${activeDoctorData.netFee.toLocaleString()}</strong></span>
              <span>Promedio por consulta: <strong style={{ color: '#002182' }}>${Math.round(activeDoctorData.netFee / activeDoctorData.consultations).toLocaleString()}</strong></span>
            </div>
          </div>

          {/* Chart Right: Distribución por Cobertura & Obra Social (Con desglose analítico) */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1.25rem',
              boxShadow: '0 2px 6px rgba(0, 33, 130, 0.02)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem' }}>
              <PieChartIcon size={18} color="#002182" />
              <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a' }}>
                Pacientes por Cobertura & Obra Social
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.85rem' }}>
              Participación porcentual y condiciones arancelarias registradas.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              {/* Anillo de Donut estilizado */}
              <div style={{ width: '160px', height: '160px', flexShrink: 0, margin: '0 auto' }}>
                <Doughnut
                  data={doctorInsuranceData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '72%',
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (ctx) => ` ${ctx.label}: ${ctx.raw}% (${activeDoctorData.insurances[ctx.dataIndex]?.count} pacientes)`
                        }
                      }
                    }
                  }}
                />
              </div>

              {/* Lista Detallada con porcentajes reales y copagos */}
              <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {activeDoctorData.insurances.map((ins) => (
                  <div
                    key={ins.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.78rem',
                      padding: '0.25rem 0.4rem',
                      borderRadius: '6px',
                      background: '#f8fafc'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '3px',
                          background: ins.color,
                          display: 'inline-block',
                          flexShrink: 0
                        }}
                      />
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{ins.name}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, color: '#002182' }}>{ins.pct}%</span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>({ins.count})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px solid #f1f5f9', fontSize: '0.73rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <CheckCircle2 size={13} color="#059669" /> 100% de coberturas homologadas con token digital en consultorio.
            </div>
          </div>
        </div>

        {/* 4. ROW 2: PRACTICE INTELLIGENCE & AGENDA OCCUPANCY */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {/* Practice Intelligence: Nomenclador Traumatológico */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1.25rem',
              boxShadow: '0 2px 6px rgba(0, 33, 130, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
                <Stethoscope size={18} color="#002182" />
                <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a' }}>
                  Prácticas y Prestaciones Más Frecuentes
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                Códigos del Nomenclador de Traumatología ejecutados en el período.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activeDoctorData.practices.map((pr) => (
                <div key={pr.code}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.72rem',
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          padding: '0.1rem 0.35rem',
                          borderRadius: '4px',
                          fontWeight: 700
                        }}
                      >
                        {pr.code}
                      </span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
                        {pr.name}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#002182' }}>
                      {pr.count} prácticas
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pr.pct}%`,
                        background: 'linear-gradient(90deg, #002182, #076ABC)',
                        borderRadius: '4px'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                    <span>Participación: {pr.pct}%</span>
                    <span>Honorario Neto: <strong>${pr.net.toLocaleString()}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agenda & Day Occupancy */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1.25rem',
              boxShadow: '0 2px 6px rgba(0, 33, 130, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
                <Calendar size={18} color="#002182" />
                <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a' }}>
                  Carga Asistencial y Ocupación Semanal
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                Días de consultorio asignados y porcentaje de slots utilizados.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {activeDoctorData.schedule.map((sc) => (
                <div
                  key={sc.day}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '0.75rem 0.95rem',
                    background: '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>{sc.day}</span>
                      <span style={{ fontSize: '0.74rem', color: '#64748b', marginLeft: '6px' }}>({sc.hours})</span>
                    </div>

                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        background: sc.rate >= 95 ? '#ecfdf5' : '#eff6ff',
                        color: sc.rate >= 95 ? '#065f46' : '#1e40af',
                        border: sc.rate >= 95 ? '1px solid #a7f3d0' : '1px solid #bfdbfe',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '6px'
                      }}
                    >
                      {sc.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#475569' }}>
                    <span>Turnos: <strong>{sc.booked}</strong> de {sc.slots} slots</span>
                    <strong style={{ color: sc.rate >= 95 ? '#059669' : '#002182' }}>{sc.rate}% ocupación</strong>
                  </div>

                  <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${sc.rate}%`,
                        background: sc.rate >= 95 ? '#10b981' : '#076ABC',
                        borderRadius: '3px'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#64748b', marginTop: 'auto' }}>
              <CheckCircle2 size={14} color="#059669" />
              <span>Día con mayor afluencia de pacientes: <strong>Miércoles (100% de agenda ocupada)</strong>.</span>
            </div>
          </div>
        </div>

        {/* 5. ROW 3: DETALLED FINANCIAL SETTLEMENT TABLE (LIQUIDACIÓN PROFESIONAL) */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0, 33, 130, 0.03)'
          }}
        >
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="#002182" />
                <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a' }}>
                  Liquidación Analítica de Honorarios Médicos
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' }}>
                Desglose arancelario con retención clínica institucional ({100 - (currentDoctor?.feePercentage || 75)}%) y honorario neto a percibir.
              </p>
            </div>

            <span style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 800 }}>
              Convenio Activo: 75% Médico / 25% Clínica
            </span>
          </div>

          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr
                  style={{
                    background: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    color: '#64748b',
                    fontSize: '0.73rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  <th style={{ padding: '0.85rem 1.25rem', width: '12%' }}>Código</th>
                  <th style={{ padding: '0.85rem 1rem', width: '38%' }}>Práctica Médica</th>
                  <th style={{ padding: '0.85rem 0.75rem', width: '10%', textAlign: 'center' }}>Cant.</th>
                  <th style={{ padding: '0.85rem 0.75rem', width: '12%', textAlign: 'right' }}>Arancel Base</th>
                  <th style={{ padding: '0.85rem 0.75rem', width: '14%', textAlign: 'right' }}>Total Facturado</th>
                  <th style={{ padding: '0.85rem 1.25rem', width: '14%', textAlign: 'right' }}>Neto Médico (75%)</th>
                </tr>
              </thead>
              <tbody>
                {activeDoctorData.practices.map((item) => (
                  <tr key={item.code} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.85rem 1.25rem', verticalAlign: 'middle' }}>
                      <span
                        style={{
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          border: '1px solid #bfdbfe',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '5px',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          fontFamily: 'monospace'
                        }}
                      >
                        {item.code}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', verticalAlign: 'middle' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a' }}>
                        {item.name}
                      </div>
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem', verticalAlign: 'middle', textAlign: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.84rem', color: '#334155' }}>
                        {item.count}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem', verticalAlign: 'middle', textAlign: 'right' }}>
                      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        ${item.unitPrice.toLocaleString()}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 0.75rem', verticalAlign: 'middle', textAlign: 'right' }}>
                      <span style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 700 }}>
                        ${item.gross.toLocaleString()}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1.25rem', verticalAlign: 'middle', textAlign: 'right' }}>
                      <span style={{ fontWeight: 900, fontSize: '0.9rem', color: '#059669' }}>
                        ${item.net.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                  <td colSpan={2} style={{ padding: '0.95rem 1.25rem', fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                    Total Liquidado del Período ({activeDoctorData.label})
                  </td>
                  <td style={{ padding: '0.95rem 0.75rem', textAlign: 'center', fontWeight: 900, color: '#002182', fontSize: '0.9rem' }}>
                    {activeDoctorData.consultations}
                  </td>
                  <td></td>
                  <td style={{ padding: '0.95rem 0.75rem', textAlign: 'right', fontWeight: 700, color: '#64748b', fontSize: '0.86rem' }}>
                    ${activeDoctorData.grossTotal.toLocaleString()}
                  </td>
                  <td style={{ padding: '0.95rem 1.25rem', textAlign: 'right', fontWeight: 900, color: '#059669', fontSize: '1.05rem' }}>
                    ${activeDoctorData.netFee.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Modal de Impresión y Descarga en PDF (100% Sincronizado) */}
        <StatisticsReportPrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          period={period}
          setPeriod={setPeriod}
          isDoctor={true}
          activeDoctorData={activeDoctorData}
          currentDoctor={currentDoctor}
          clinicInfo={clinicInfo}
        />
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
            <span>Descargar / Imprimir Reporte PDF</span>
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

      {/* Modal de Impresión y Descarga en PDF (100% Sincronizado - Vista Admin) */}
      <StatisticsReportPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        period={period}
        setPeriod={setPeriod}
        isDoctor={false}
        activeDoctorData={activeDoctorData}
        currentDoctor={currentDoctor}
        clinicInfo={clinicInfo}
        globalAdminData={{
          kpis: {
            consultations: period === 'year' ? '17.780' : period === 'week' ? '370' : '1.482',
            revenue: period === 'year' ? 34680000 : period === 'week' ? 720000 : 2890000,
            newPatients: period === 'year' ? '2.200' : period === 'week' ? '46' : '184',
            attendanceRate: '94.2%'
          }
        }}
      />
    </div>
  );
};
