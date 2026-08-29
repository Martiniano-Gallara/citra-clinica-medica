# CITRA — Centro Integral de Traumatología & Rehabilitación

Sistema integral de gestión clínica y SaaS médico especializado en **Traumatología, Ortopedia, Kinesiología y Rehabilitación Física**.

Diseñado bajo estándares de diseño contemporáneo, máxima densidad de información y estética médica minimalista en paleta Teal & Mint.

---

## 🏥 Módulos Principales

- **Panel de Inicio (Dashboard):** Visión ejecutiva con Bento Grid de 4 KPIs clínicos, control de guardia, mesa operativa de turnos del día y atajos rápidos por rol.
- **Turnos & Agenda Médica:** Modo "Lista Rápida / Flujo Operativo" para alta demanda, buscador predictivo por DNI/nombre, gestión de sala de espera con tiempo de demora y multi-vistas (Por Médico, Salas & Boxes, Semana, Mes).
- **Padrón de Pacientes:** Ficha médica completa, filiación, antecedentes patológicos, alertas de alergias y exportación de padrón en CSV.
- **Historia Clínica Electrónica (HCE):** Registro evolutivo traumatológico, evaluación articular/ROM, prescripción farmacológica, órdenes de estudio, emisión de certificados y consentimiento informado con firma digital.
- **Kinesiología & Fisiatría:** Planes personalizados, seguimiento de sesiones restantes, escala de dolor EVA (0 a 10), goniometría articular y control de boxes/gimnasio terapéutico.
- **Estudios e Imágenes (PACS):** Visualización y archivo de Resonancias Magnéticas (RMN), Radiografías Digitales (RX), Tomografías y Ecografías.
- **Obras Sociales & Prepagas:** Nomenclador de prestaciones, convenios arancelarios (*OSDE, Swiss Medical, Galeno, Apross, PAMI*) y liquidaciones.
- **Facturación & Caja Diaria:** Arqueos de turno, cobro de coseguros/copagos en mostrador con QR y trazabilidad contable.
- **Portal del Paciente:** Autogestión con acceso DNI para consultar turnos, recetas emitidas y descargar informes.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 19 + Vite 8
- **Estilos:** CSS3 nativo con sistema de variables personalizadas (Design System CITRA)
- **Tipografía:** Inter (Google Fonts)
- **Iconografía:** Lucide React
- **Gráficos:** Chart.js + React-Chartjs-2
- **QR / Firma:** QRCode.react

---

## 🚀 Instalación y Uso Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/Martiniano-Gallara/citra-clinica-medica.git

# 2. Ingresar al directorio
cd citra-clinica-medica

# 3. Instalar dependencias
npm install

# 4. Iniciar servidor de desarrollo
npm run dev
```

La aplicación se ejecutará en `http://localhost:5173/`.

---

## 👥 Roles Médicos Disponibles (Simulación Interactiva)

- **Director Médico**
- **Traumatólogo Especialista**
- **Kinesiólogo / Fisiatra**
- **Recepción / Secretaría de Guardia**
- **Facturación & Administración**
