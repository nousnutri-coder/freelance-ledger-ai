# 📊 Freelance Ledger AI

## Sistema de Gestión Financiera para Freelancers con Inteligencia Artificial

**Versión:** 1.0.0  
**Desarrollado por:** Traffic Digital Home  
**Licencia:** Propietario

---

## 🚀 Descripción General

**Freelance Ledger AI** es una aplicación web moderna para la gestión financiera integral de freelancers y emprendedores. Combina herramientas tradicionales de contabilidad con inteligencia artificial (Google Gemini) para automatizar tareas, generar propuestas comerciales y ofrecer asesoría financiera personalizada.

### Características Principales

- 💰 **Panel Financiero:** Visualización de ingresos, gastos y utilidades en tiempo real
- 📋 **Cotizaciones Profesionales:** Generación de propuestas con IA y exportación a PDF
- 🤖 **Chatbot "Compañero de Vida":** Asesor financiero personal con contexto del usuario
- 📅 **Calendario Inteligente:** Gestión de reuniones, deadlines y recordatorios
- 📊 **Tablero Kanban:** Seguimiento de proyectos y estados de pago
- 👥 **CRM de Clientes:** Directorio con historial completo por cliente
- 🧬 **ADN de Empresa:** Sube PDFs para personalizar automáticamente las propuestas
- 📸 **OCR de Facturas:** Escanea y registra facturas automáticamente
- 🔮 **Simulador Financiero:** Proyecciones "What-If" para decisiones

---

## 🛠️ Tecnologías Utilizadas

| Categoría | Tecnología |
|-----------|------------|
| **Frontend** | React 18 + TypeScript |
| **Bundler** | Vite |
| **Estilos** | TailwindCSS |
| **Gráficos** | Recharts |
| **PDF** | jsPDF + jspdf-autotable |
| **IA** | Google Gemini 2.0 Flash |
| **Almacenamiento** | localStorage (migrar a Supabase para producción) |
| **Routing** | React Router v6 (HashRouter) |

---

## 📁 Estructura del Proyecto

```
freelance-ledger-ai/
├── App.tsx                 # Componente principal y enrutamiento
├── index.tsx               # Punto de entrada de React
├── types.ts                # Definiciones de TypeScript (DOCUMENTADO)
├── 
├── components/             # Componentes reutilizables
│   ├── Layout.tsx          # Estructura principal (sidebar + header)
│   ├── PrivacyAmount.tsx   # Ocultador de montos (modo privacidad)
│   ├── SmartReminders.tsx  # Widget de recordatorios inteligentes
│   ├── CompanyProfileUpload.tsx  # Subida de PDFs para ADN
│   ├── CompanyDNAViewer.tsx      # Visualizador de ADN extraído
│   └── MotivationalModal.tsx     # Modal de mensaje motivacional
│
├── screens/                # Pantallas principales
│   ├── Dashboard.tsx       # Panel principal con chatbot
│   ├── Transactions.tsx    # Gestión de transacciones
│   ├── Quotations.tsx      # Sistema de cotizaciones (DOCUMENTADO)
│   ├── Clients.tsx         # Directorio de clientes
│   ├── Calendar.tsx        # Calendario de eventos
│   ├── Kanban.tsx          # Tablero de proyectos
│   ├── Settings.tsx        # Configuración y perfil
│   ├── Health.tsx          # Salud financiera
│   ├── Intelligence.tsx    # Insights de IA
│   └── Login.tsx           # Pantalla de login
│
├── services/               # Servicios y APIs
│   ├── geminiService.ts    # Integración con Gemini AI (DOCUMENTADO)
│   └── notificationService.ts  # Sistema de notificaciones
│
├── utils/                  # Utilidades
│   └── fileUtils.ts        # Manejo de archivos y PDFs
│
├── context/                # Contextos de React
│   └── PrivacyContext.tsx  # Estado global de modo privacidad
│
└── .env.local              # Variables de entorno (API keys)
```

---

## ⚙️ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <repositorio>
cd freelance-ledger-ai
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear archivo `.env.local` en la raíz:
```env
VITE_GEMINI_API_KEY=tu_api_key_de_google_gemini
```

### 4. Ejecutar en desarrollo
```bash
npm run dev
```

### 5. Construir para producción
```bash
npm run build
```

---

## 🔑 Claves de Almacenamiento (localStorage)

| Clave | Descripción |
|-------|-------------|
| `user_profile` | Datos del usuario y empresa |
| `ledger_transactions` | Transacciones financieras |
| `ledger_tasks` | Tareas del Kanban |
| `ledger_clients` | Directorio de clientes |
| `ledger_quotations` | Cotizaciones |
| `ledger_events` | Eventos del calendario |

---

## 🧬 Sistema de ADN de Empresa

El sistema de ADN permite a los usuarios subir documentos PDF (presentaciones corporativas, manuales de marca, propuestas anteriores) para que la IA extraiga automáticamente:

- Metodología de trabajo
- Estilo de propuestas
- Voz de marca
- Servicios principales
- Mercado objetivo
- Propuesta de valor
- Filosofía de precios
- Stack técnico preferido

Esta información se usa automáticamente al generar nuevas propuestas comerciales.

---

## 💡 Funciones de IA Disponibles

### 1. `chatWithAssistant()`
Chatbot personalizado que usa datos reales del usuario (ingresos, gastos, clientes) para dar consejos específicos.

### 2. `generateProposalContent()`
Genera propuestas comerciales con desglose de servicios y precios adaptados al mercado LATAM.

### 3. `extractCompanyDNA()`
Analiza PDFs y extrae el ADN de la empresa para personalización automática.

### 4. `getFinancialInsights()`
Analiza transacciones y genera 3 consejos financieros personalizados.

### 5. `detectVampireSubscriptions()`
Detecta suscripciones duplicadas o innecesarias.

### 6. `runScenarioSimulation()`
Simula el impacto de decisiones financieras a futuro.

### 7. `processInvoiceOCR()`
Extrae datos de imágenes de facturas automáticamente.

---

## 🚨 Consideraciones para Producción

### Migración de Datos
- Actualmente usa `localStorage` (límite ~5-10MB)
- Para producción, migrar a **Supabase** o **Firebase**
- Implementar autenticación real (actualmente es simulada)

### Seguridad
- La API key de Gemini se expone en el cliente (considerar backend proxy)
- Implementar rate limiting para evitar abusos
- Encriptar datos sensibles

### Rendimiento
- Implementar lazy loading para pantallas
- Cachear respuestas frecuentes de IA
- Optimizar imágenes base64 (considerar Cloudinary)

---

## 📞 Soporte

Para soporte técnico o licenciamiento, contactar a:
- **Email:** contacto@trafficdigitalhome.com
- **Web:** trafficdigitalhome.com

---

## 📜 Licencia

Este software es propiedad de **Traffic Digital Home**. Todos los derechos reservados.
La distribución, modificación o venta sin autorización está prohibida.

---

**© 2024 Traffic Digital Home - Todos los derechos reservados**
