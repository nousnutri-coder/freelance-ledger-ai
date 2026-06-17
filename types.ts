/**
 * =============================================================================
 * FREELANCE LEDGER AI - DEFINICIONES DE TIPOS
 * =============================================================================
 * 
 * Este archivo contiene todas las interfaces y tipos TypeScript utilizados
 * en la aplicación. Es el corazón del sistema de tipado y define la estructura
 * de todos los datos que maneja el software.
 * 
 * ESTRUCTURA DEL ARCHIVO:
 * 1. Tipos básicos (TransactionType)
 * 2. Sistema de ADN de Empresa (CompanyDNA, DocumentUploadHistory)
 * 3. Perfil de Usuario (UserProfile)
 * 4. Entidades de Negocio (Client, Quotation, Transaction)
 * 5. Sistema Kanban (KanbanTask, ProjectNote)
 * 6. Calendario (CalendarEvent)
 * 7. Análisis Financiero (SimulationResult, FinancialHealth)
 * 8. Estado Global de la Aplicación (AppState)
 * 
 * PARA ESCALAMIENTO:
 * - Si necesitas agregar nuevos campos, extender las interfaces existentes
 * - Mantener compatibilidad hacia atrás con localStorage existente
 * - Considerar migración a Supabase para producción
 * 
 * @author Traffic Digital Home
 * @version 1.0.0
 * @license Propietario
 * =============================================================================
 */

/**
 * Tipo de transacción financiera
 * - 'income': Ingresos (pagos de clientes, ventas, etc.)
 * - 'expense': Gastos (suscripciones, servicios, etc.)
 */
export type TransactionType = 'income' | 'expense';

/**
 * =============================================================================
 * SECCIÓN: SISTEMA DE ADN DE EMPRESA
 * =============================================================================
 * El ADN de Empresa permite a los usuarios subir documentos PDF con información
 * de su empresa. La IA extrae y almacena esta información para personalizar
 * automáticamente todas las propuestas y cotizaciones generadas.
 * =============================================================================
 */

/**
 * Estructura de datos extraídos del ADN de Empresa
 * Contiene toda la información que la IA extrae de los documentos PDF
 * del usuario para personalizar las propuestas comerciales.
 */
export interface CompanyDNA {
  /** Identificador único del registro de ADN */
  id: string;

  /** Fecha en que se subió el documento (ISO 8601) */
  uploadDate: string;

  /** Nombre original del archivo PDF subido */
  fileName: string;

  /** Datos estructurados extraídos del documento por la IA */
  extractedData: {
    /** Metodología de trabajo (Agile, Scrum, Waterfall, etc.) */
    methodology?: string;

    /** Estilo de estructuración de propuestas comerciales */
    proposalStyle?: string;

    /** Tono y estilo de comunicación de la marca */
    brandVoice?: string;

    /** Lista de servicios principales que ofrece la empresa */
    coreServices?: string[];

    /** Mercado objetivo y audiencia principal */
    targetMarket?: string;

    /** Propuesta de valor única de la empresa */
    valueProposition?: string;

    /** Filosofía y estrategia de precios */
    pricingPhilosophy?: string;

    /** Diferenciadores competitivos */
    competitiveDifferentiators?: string;

    /** Stack tecnológico preferido */
    technicalStack?: string[];

    /** Proceso de entrega de proyectos */
    deliveryProcess?: string;

    /** Estándares y procesos de calidad */
    qualityStandards?: string;

    /** Cualquier otra información relevante extraída */
    customGuidelines?: string;
  };

  /** Texto completo extraído del PDF (para referencia) */
  rawExtraction?: string;

  /** Indica si este ADN está actualmente activo para uso en propuestas */
  isActive: boolean;
}

/**
 * Registro del historial de subidas de documentos
 * Permite al usuario ver el estado de sus cargas anteriores
 */
export interface DocumentUploadHistory {
  /** Identificador único del registro */
  id: string;

  /** Nombre del archivo subido */
  fileName: string;

  /** Fecha y hora de la subida (ISO 8601) */
  uploadDate: string;

  /** Estado actual del procesamiento */
  status: 'processing' | 'completed' | 'failed';

  /** Mensaje de error si el procesamiento falló */
  errorMessage?: string;
}

/**
 * =============================================================================
 * SECCIÓN: PERFIL DE USUARIO
 * =============================================================================
 * Contiene toda la información del usuario y su empresa. Esta información
 * se utiliza para personalizar la aplicación, generar documentos PDF
 * con membrete y configurar el comportamiento de la IA.
 * =============================================================================
 */

/**
 * Perfil completo del usuario y su empresa
 * Se almacena en localStorage bajo la clave 'user_profile'
 */
export interface UserProfile {
  /** Nombre completo del usuario */
  name: string;

  /** Email personal del usuario */
  email: string;

  /** Código de moneda principal (COP, USD, EUR, etc.) */
  currency: string;

  /** Imagen de perfil del usuario (base64) */
  profileImage?: string;

  // ============= DATOS DE EMPRESA =============

  /** Nombre comercial de la empresa */
  companyName?: string;

  /** Descripción breve de la empresa (para IA) */
  companyDescription?: string;

  /** Logo de la empresa (base64, PNG recomendado) */
  companyLogo?: string;

  /** Firma digital del usuario (base64, PNG transparente) */
  digitalSignature?: string;

  /** Cargo o título profesional */
  jobTitle?: string;

  /** Estrategia de precios extraída de PDF (texto libre para IA) */
  pricingStrategy?: string;

  // ============= DATOS FISCALES =============

  /** País de residencia fiscal */
  country?: string;

  /** Tasa de impuesto porcentual (ej: 19 para 19%) */
  taxRate?: number;

  // ============= MEMBRETE CORPORATIVO =============

  /** Dirección física de la empresa */
  address?: string;

  /** Teléfono de contacto */
  phone?: string;

  /** Sitio web de la empresa */
  website?: string;


  /** Email corporativo para documentos */
  businessEmail?: string;

  // ============= PERSONALIZACIÓN PDF =============

  /** Template HTML personalizado para cotizaciones (futuro) */
  customQuotationTemplate?: string;

  /** Logo para marca de agua en PDFs (base64) */
  watermarkLogo?: string;

  /** Activar/desactivar marca de agua en PDFs */
  useWatermark?: boolean;

  /** Mostrar mensaje motivacional al iniciar la app */
  showMotivationalMessage?: boolean;

  // ============= SISTEMA DE ADN =============

  /** ADN de empresa actualmente activo */
  companyDNA?: CompanyDNA;

  /** Historial de subidas de documentos de ADN */
  dnaHistory?: DocumentUploadHistory[];

  // ============= SUSCRIPCIÓN Y MONETIZACIÓN =============

  /** Información de suscripción del usuario */
  subscription?: UserSubscription;

  /** Plan actual del usuario (derivado de subscription) */
  currentPlan?: SubscriptionPlan;

  /** Estado de la suscripción (derivado de subscription) */
  subscriptionStatus?: SubscriptionStatus;

  /** Fecha de renovación (derivado de subscription) */
  renewalDate?: string | null;

  /** Ciclo de facturación (derivado de subscription) */
  billingCycle?: 'monthly' | 'quarterly' | 'yearly';

  /** Indica si el usuario ya usó su trial de 7 días PRO */
  hasUsedTrial?: boolean;
}

/**
 * =============================================================================
 * SECCIÓN: GESTIÓN DE CLIENTES
 * =============================================================================
 * Sistema de directorio de clientes que permite gestionar contactos
 * comerciales, vincularlos a cotizaciones y eventos del calendario.
 * =============================================================================
 */

/**
 * Información de un cliente comercial
 * Se almacena en localStorage bajo la clave 'ledger_clients'
 */
export interface Client {
  /** Identificador único del cliente (generado automáticamente) */
  id: string;

  /** Nombre del contacto principal */
  name: string;

  /** Nombre de la empresa del cliente */
  company: string;

  /** Email de contacto */
  email: string;

  /** Teléfono de contacto */
  phone: string;

  /** Dirección comercial */
  address: string;
}

/**
 * =============================================================================
 * SECCIÓN: SISTEMA DE COTIZACIONES
 * =============================================================================
 * Permite crear, gestionar y enviar cotizaciones comerciales profesionales.
 * Incluye generación de PDF con membrete y asistente de IA para redacción.
 * =============================================================================
 */

/**
 * Ítem individual dentro de una cotización
 */
export interface QuotationItem {
  /** Identificador único del ítem */
  id: string;

  /** Descripción del servicio o producto */
  description: string;

  /** Cantidad de unidades */
  quantity: number;

  /** Precio unitario en la moneda del usuario */
  price: number;
}

/**
 * Cotización comercial completa
 * Se almacena en localStorage bajo la clave 'ledger_quotations'
 */
export interface Quotation {
  /** Identificador único de la cotización (formato COT-XXXXX) */
  id: string;

  /** ID del cliente asociado (referencia a Client.id) */
  clientId: string;

  /** Fecha de creación (YYYY-MM-DD) */
  date: string;

  /** Fecha de vencimiento de la cotización */
  validUntil: string;

  /** Lista de ítems/servicios cotizados */
  items: QuotationItem[];

  /** Total calculado de la cotización */
  total: number;

  /** Estado actual del flujo de trabajo */
  status: 'draft' | 'sent' | 'accepted' | 'declined';

  /** Notas adicionales o términos y condiciones */
  notes?: string;
}

/**
 * =============================================================================
 * SECCIÓN: TRANSACCIONES FINANCIERAS
 * =============================================================================
 * Registro de todos los movimientos financieros del usuario.
 * Permite tracking de ingresos, gastos y estado de pagos.
 * =============================================================================
 */

/**
 * Transacción financiera (ingreso o gasto)
 * Se almacena en localStorage bajo la clave 'ledger_transactions'
 */
export interface Transaction {
  /** Identificador único de la transacción */
  id: string;

  /** Fecha de la transacción (YYYY-MM-DD) */
  date: string;

  /** Descripción del movimiento */
  description: string;

  /** Monto en la moneda del usuario */
  amount: number;

  /** Tipo: ingreso o gasto */
  type: TransactionType;

  /** Categoría para clasificación y reportes */
  category: string;

  /** Estado de pago de la transacción */
  status: 'paid' | 'pending' | 'fixed';
}

/**
 * =============================================================================
 * SECCIÓN: SISTEMA KANBAN DE PROYECTOS
 * =============================================================================
 * Tablero Kanban para gestión de proyectos y tareas.
 * Incluye seguimiento de progreso, notas de proyecto y estados personalizados.
 * =============================================================================
 */

/**
 * Nota de proyecto con historial
 * Permite llevar un registro cronológico de actualizaciones
 */
export interface ProjectNote {
  /** Identificador único de la nota */
  id: string;

  /** Contenido de la nota */
  text: string;

  /** Fecha de creación (ISO 8601) */
  createdAt: string;
}

/**
 * Tarea/Proyecto en el tablero Kanban
 * Se almacena en localStorage bajo la clave 'ledger_tasks'
 */
export interface KanbanTask {
  /** Identificador único de la tarea */
  id: string;

  /** Título descriptivo del proyecto */
  title: string;

  /** Nombre del cliente asociado */
  client: string;

  /** Valor económico del proyecto */
  amount: number;

  /** Categoría del proyecto (Desarrollo, Diseño, etc.) */
  category: string;

  /** 
   * Estado actual en el flujo Kanban:
   * - todo: Por hacer
   * - in-progress: En progreso
   * - delivered: Entregado
   * - pending-payment: Pendiente de pago
   * - done: Completado
   */
  status: 'todo' | 'in-progress' | 'delivered' | 'pending-payment' | 'done';

  /** Porcentaje de progreso (0-100) */
  progress?: number;

  /** Notas resumidas (legacy, usar projectNotes) */
  notes?: string;

  /** Historial completo de notas del proyecto */
  projectNotes?: ProjectNote[];
}

/**
 * =============================================================================
 * SECCIÓN: CALENDARIO Y RECORDATORIOS
 * =============================================================================
 * Sistema de calendario con eventos, reuniones, deadlines y recordatorios
 * inteligentes. Integración con clientes y sistema de cobros.
 * =============================================================================
 */

/**
 * Evento del calendario
 * Se almacena en localStorage bajo la clave 'ledger_events'
 */
export interface CalendarEvent {
  /** Identificador único del evento */
  id: string;

  /** Título del evento */
  title: string;

  /** Hora de inicio (HH:mm o ISO string) */
  start: string;

  /** Hora de finalización (HH:mm o ISO string) */
  end: string;

  /** Fecha del evento (YYYY-MM-DD) */
  date: string;

  /** 
   * Tipo de evento:
   * - meeting: Reunión con cliente
   * - deep-work: Trabajo concentrado
   * - deadline: Fecha límite
   * - break: Descanso programado
   * - reminder: Recordatorio general
   */
  type: 'meeting' | 'deep-work' | 'deadline' | 'break' | 'reminder';

  /** Indica si el evento fue completado */
  completed?: boolean;

  /** ID del cliente asociado (opcional) */
  clientId?: string;

  /** Notas adicionales del evento */
  notes?: string;

  /** Link de videollamada (Zoom, Meet, etc.) */
  meetingLink?: string;

  /**
   * Categoría del recordatorio:
   * - payment-collection: Cobro de pago pendiente
   * - subscription-cancel: Cancelar suscripción
   * - follow-up: Seguimiento comercial
   * - tax-deadline: Vencimiento tributario
   * - contract-renewal: Renovación de contrato
   * - other: Otro
   */
  reminderCategory?: 'payment-collection' | 'subscription-cancel' | 'follow-up' | 'tax-deadline' | 'contract-renewal' | 'other';

  /** Monto relacionado (para recordatorios de cobro) */
  relatedAmount?: number;
}

/**
 * =============================================================================
 * SECCIÓN: INTELIGENCIA FINANCIERA
 * =============================================================================
 * Estructuras para análisis financiero predictivo, simulaciones
 * y evaluación de salud financiera del usuario.
 * =============================================================================
 */

/**
 * Resultado de simulación financiera (What-If)
 * Usado para proyectar impacto de decisiones financieras
 */
export interface SimulationResult {
  /** Meses de "runway" estimados con el balance actual */
  runwayMonths: number;

  /** Impacto mensual de la decisión simulada */
  monthlyImpact: number;

  /** Proyección mes a mes del balance */
  projectedBalance: { month: string; balance: number }[];
}

/**
 * Evaluación de salud financiera del usuario
 * Incluye score, nivel y comparativas anónimas
 */
export interface FinancialHealth {
  /** Puntuación de salud financiera (0-100) */
  score: number;

  /** Nivel categorizado de salud financiera */
  level: 'poor' | 'fair' | 'good' | 'excellent';

  /** Consejos personalizados para mejorar */
  tips: string[];

  /** Comparativas anónimas con otros freelancers */
  benchmarks: {
    /** Categoría de comparación */
    category: string;
    /** Valor del usuario */
    userValue: number;
    /** Promedio de la industria */
    averageValue: number;
    /** Percentil del usuario */
    percentile: number;
  }[];
}

/**
 * =============================================================================
 * SECCIÓN: ESTADO GLOBAL DE LA APLICACIÓN
 * =============================================================================
 * Estructura que representa el estado completo de la aplicación.
 * Útil para serialización, backup y restauración de datos.
 * =============================================================================
 */

/**
 * Estado completo de la aplicación
 * Puede usarse para exportación/importación de datos
 */
export interface AppState {
  /** Todas las transacciones del usuario */
  transactions: Transaction[];

  /** Todas las tareas del tablero Kanban */
  tasks: KanbanTask[];

  /** Directorio completo de clientes */
  clients: Client[];


  /** Todas las cotizaciones */
  quotations: Quotation[];

  /** Todos los eventos del calendario */
  events: CalendarEvent[];

  /** Consulta de búsqueda activa (UI state) */
  searchQuery: string;

  /** Notificaciones pendientes (UI state) */
  notifications: string[];

  /** Perfil del usuario */
  user: UserProfile;

  /** Evaluación de salud financiera (opcional) */
  health?: FinancialHealth;
}

/**
 * =============================================================================
 * SECCIÓN: SISTEMA DE SUSCRIPCIONES Y MONETIZACIÓN
 * =============================================================================
 * Gestión de planes (Free, Pro, Unicorn, Lifetime), cupones, y lógica de
 * feature gating basada en el tier del usuario.
 * =============================================================================
 */

/**
 * Planes de suscripción disponibles
 */
export type SubscriptionPlan = 'free' | 'pro' | 'unicorn' | 'team';

/**
 * Estados posibles de una suscripción
 */
export type SubscriptionStatus =
  | 'active'          // Suscripción activa y vigente
  | 'grace_period'    // 3 días de gracia tras fallo de pago
  | 'expired'         // Expirada, debe downgrade a Free
  | 'canceled';       // Cancelada por el usuario

/**
 * Tipos de cupones soportados
 */
export type CouponType =
  | 'percentage'      // Descuento porcentual (15%, 50%, etc.)
  | 'free_time'       // Tiempo gratuito (1 mes, 3 meses, 1 año)
  | 'lifetime';       // Acceso de por vida (pago único)

/**
 * Información de suscripción del usuario
 */
export interface UserSubscription {
  /** ID único de la suscripción */
  id: string;

  /** Plan actual del usuario */
  currentPlan: SubscriptionPlan;

  /** Estado de la suscripción */
  status: SubscriptionStatus;

  /** Fecha de inicio de la suscripción actual */
  startDate: string;

  /** Fecha de renovación/expiración (null si es lifetime) */
  renewalDate: string | null;

  /** Fecha de última facturación exitosa */
  lastBillingDate?: string;

  /** Ciclo de facturación (mensual, trimestral, anual) */
  billingCycle?: 'monthly' | 'quarterly' | 'yearly';

  /** ID de la transacción en Wompi */
  wompiTransactionId?: string;

  /** Cupón aplicado (si existe) */
  appliedCoupon?: AppliedCoupon;

  /** Historial de planes (para analytics) */
  planHistory: PlanHistoryEntry[];
}

/**
 * Cupón aplicado a una suscripción
 */
export interface AppliedCoupon {
  /** Código del cupón */
  code: string;

  /** Tipo de cupón */
  type: CouponType;

  /** Valor del descuento (porcentaje o meses gratis) */
  value: number;

  /** Fecha de aplicación */
  appliedDate: string;

  /** Fecha de expiración del descuento recurrente (null si es de una sola vez) */
  expiryDate?: string | null;
}

/**
 * Entrada del historial de cambios de plan
 */
export interface PlanHistoryEntry {
  /** Plan anterior */
  fromPlan: SubscriptionPlan;

  /** Plan nuevo */
  toPlan: SubscriptionPlan;

  /** Fecha del cambio */
  changeDate: string;

  /** Razón del cambio (upgrade, downgrade, expired, etc.) */
  reason: 'upgrade' | 'downgrade' | 'expired' | 'canceled' | 'coupon';
}

/**
 * Límites de funcionalidades por plan
 */
export interface PlanLimits {
  /** Número máximo de clientes activos (null = ilimitado) */
  maxClients: number | null;

  /** Número máximo de cotizaciones por mes (null = ilimitado) */
  maxQuotationsPerMonth: number | null;

  /** Acceso a IA con contexto completo */
  fullAIAccess: boolean;

  /** Número de perfiles de ADN de Empresa permitidos */
  maxCompanyDNAProfiles: number;

  /** Número máximo de firmas digitales en PDFs */
  maxSignatures: number;

  /** Si tiene marca de agua en PDFs */
  hasWatermark: boolean;

  /** Acceso a IA avanzada (simulaciones, vampire subs) */
  advancedAI: boolean;
}

/**
 * Configuración de un cupón en el sistema
 */
export interface Coupon {
  /** Código del cupón */
  code: string;

  /** Tipo de cupón */
  type: CouponType;

  /** Valor (porcentaje o meses) */
  value: number;

  /** Descripción del cupón */
  description: string;

  /** Planes a los que aplica (null = todos) */
  applicablePlans?: SubscriptionPlan[] | null;

  /** Fecha de expiración del cupón */
  expiryDate?: string;

  /** Número de usos restantes (null = ilimitado) */
  maxUses?: number | null;

  /** Veces que se ha usado */
  usedCount: number;

  /** Si es activo */
  isActive: boolean;
}

