/**
 * =============================================================================
 * FREELANCE LEDGER AI - SERVICIO DE INTELIGENCIA ARTIFICIAL (GEMINI)
 * =============================================================================
 * 
 * Este archivo contiene todas las integraciones con Google Gemini AI.
 * Es el núcleo de la funcionalidad de IA de la aplicación.
 * 
 * FUNCIONES DISPONIBLES:
 * 1. getFinancialInsights - Análisis financiero automatizado
 * 2. chatWithAssistant - Chatbot "Compañero de Vida" personalizado
 * 3. generateProposalContent - Generación de propuestas comerciales
 * 4. processInvoiceOCR - Extracción de datos de facturas (imagen)
 * 5. processDocumentPDF - Procesamiento de documentos PDF
 * 6. detectVampireSubscriptions - Detección de gastos duplicados
 * 7. runScenarioSimulation - Simulaciones financieras what-if
 * 8. extractCompanyDNA - Extracción de ADN empresarial de PDFs
 * 
 * CONFIGURACIÓN REQUERIDA:
 * - Variable de entorno: VITE_GEMINI_API_KEY o VITE_API_KEY
 * - Archivo: .env.local en la raíz del proyecto
 * 
 * MODELO UTILIZADO:
 * - gemini-2.0-flash (más rápido y económico)
 * 
 * PARA ESCALAMIENTO:
 * - Considerar rate limiting para uso comercial
 * - Implementar fallback a otros modelos si es necesario
 * - Cachear respuestas frecuentes para reducir costos
 * 
 * @author Traffic Digital Home
 * @version 1.0.0
 * @license Propietario
 * =============================================================================
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Transaction, UserProfile, CompanyDNA } from "../types";

// =============================================================================
// CONFIGURACIÓN DE LA API DE GEMINI
// =============================================================================

/**
 * Clave API de Google Gemini
 * Se lee de las variables de entorno de Vite
 * Prioridad: VITE_GEMINI_API_KEY > VITE_API_KEY
 */
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY || "";

// Advertencia en consola si falta la API key
if (!apiKey) {
  console.warn("⚠️ Gemini API Key faltante. Revisa el archivo .env.local");
}

/**
 * Instancia del cliente de Google Generative AI
 * Se usa en todas las funciones de este servicio
 */
const genAI = new GoogleGenerativeAI(apiKey);

// =============================================================================
// FUNCIÓN: ANÁLISIS FINANCIERO INTELIGENTE
// =============================================================================

/**
 * Analiza las transacciones del usuario y genera consejos financieros personalizados
 * 
 * @param transactions - Array de transacciones a analizar (máx. 15 recomendado)
 * @returns Array de consejos con categoría y texto, o array vacío si hay error
 * 
 * @example
 * const consejos = await getFinancialInsights(misTransacciones);
 * // Retorna: [{ tip: "Reduce gastos en suscripciones", category: "OPTIMIZACIÓN" }]
 */
export const getFinancialInsights = async (transactions: Transaction[]) => {
  // Preparar resumen de transacciones para el prompt
  const summary = transactions.map(t =>
    `${t.date}: ${t.description} (${t.type === 'income' ? 'Ingreso' : 'Gasto'}) - $${t.amount}`
  ).join('\n');

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Analiza estas transacciones y proporciona 3 consejos financieros cortos en ESPAÑOL.
    REGLA CRÍTICA: NO USES SÍMBOLOS DE MARKDOWN (#, *, **). Responde en texto plano organizado.
    Formato JSON: [{"tip": "consejo aquí", "category": "CATEGORÍA"}]
    
    Transacciones:
    ${summary}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extraer JSON de la respuesta usando regex
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error("❌ Error obteniendo insights financieros:", error);
    return [];
  }
};

// =============================================================================
// INTERFAZ: CONTEXTO DE USUARIO PARA CHATBOT
// =============================================================================

/**
 * Contexto del usuario para personalizar respuestas del chatbot
 * Incluye información financiera real del usuario
 */
interface ChatUserContext {
  /** Nombre del usuario */
  userName?: string;

  /** Nombre de la empresa */
  companyName?: string;

  /** Código de moneda (COP, USD, etc.) */
  currency?: string;

  /** Total de ingresos registrados */
  totalIncome?: number;

  /** Total de gastos registrados */
  totalExpenses?: number;

  /** Cantidad de facturas pendientes de cobro */
  pendingInvoices?: number;

  /** Últimas transacciones para contexto */
  recentTransactions?: {
    description: string;
    amount: number;
    type: string;
    date: string
  }[];

  /** Cotizaciones activas del usuario */
  activeQuotations?: {
    client: string;
    total: number;
    status: string
  }[];

  /** Número total de clientes */
  clientCount?: number;

  /** ADN de empresa (si está configurado) */
  companyDNA?: any;
}

// =============================================================================
// FUNCIÓN: CHATBOT "COMPAÑERO DE VIDA"
// =============================================================================

/**
 * Chatbot de asistencia financiera personalizada
 * Utiliza el contexto real del usuario para dar consejos específicos
 * 
 * CARACTERÍSTICAS:
 * - Respuestas en texto plano (sin markdown)
 * - Tono profesional pero cercano
 * - Usa datos reales del usuario para personalizar
 * - Historial de conversación para continuidad
 * 
 * @param history - Historial de la conversación
 * @param message - Mensaje actual del usuario
 * @param userContext - Contexto financiero del usuario (opcional pero recomendado)
 * @returns Respuesta del asistente o mensaje de error
 * 
 * @example
 * const respuesta = await chatWithAssistant(historial, "¿Cómo mejorar mis finanzas?", contexto);
 */
export const chatWithAssistant = async (
  history: { role: string, parts: { text: string }[] }[],
  message: string,
  userContext?: ChatUserContext
) => {
  try {
    // Construir contexto personalizado si está disponible
    const contextInfo = userContext ? `

CONTEXTO DEL USUARIO (USA ESTA INFORMACIÓN PARA PERSONALIZAR TUS RESPUESTAS):

Datos del Usuario:
- Nombre: ${userContext.userName || 'Usuario'}
- Empresa: ${userContext.companyName || 'Freelancer independiente'}
- Moneda: ${userContext.currency || 'COP'}

Situación Financiera Actual:
- Ingresos totales: ${userContext.currency || 'COP'} ${(userContext.totalIncome || 0).toLocaleString()}
- Gastos totales: ${userContext.currency || 'COP'} ${(userContext.totalExpenses || 0).toLocaleString()}
- Balance neto: ${userContext.currency || 'COP'} ${((userContext.totalIncome || 0) - (userContext.totalExpenses || 0)).toLocaleString()}
- Facturas pendientes por cobrar: ${userContext.pendingInvoices || 0}

Clientes: ${userContext.clientCount || 0} clientes registrados

${userContext.recentTransactions && userContext.recentTransactions.length > 0 ? `
Últimas Transacciones (para contexto):
${userContext.recentTransactions.slice(0, 5).map(t => `- ${t.type === 'income' ? 'Ingreso' : 'Gasto'}: ${t.description} - ${userContext.currency} ${t.amount.toLocaleString()} (${t.date})`).join('\n')}
` : ''}

${userContext.activeQuotations && userContext.activeQuotations.length > 0 ? `
Cotizaciones Activas:
${userContext.activeQuotations.slice(0, 5).map(q => `- ${q.client}: ${userContext.currency} ${q.total.toLocaleString()} (${q.status === 'accepted' ? 'Aceptada' : q.status === 'sent' ? 'Enviada' : q.status === 'declined' ? 'Rechazada' : 'Borrador'})`).join('\n')}
` : ''}

INSTRUCCIÓN: Usa estos datos reales del usuario para dar consejos específicos y personalizados. Menciona cifras concretas cuando sea relevante. Si el usuario pregunta sobre su situación financiera, usa estos números reales.
` : '';

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: `Eres "Compañero de Vida", un consultor financiero experto para freelancers y emprendedores. Tu objetivo es ayudar al usuario a organizar sus finanzas personales y profesionales.
${contextInfo}
REGLAS DE FORMATO ABSOLUTAS (MUY IMPORTANTE):
- PROHIBIDO USAR MARKDOWN: No uses **, *, #, ##, __, ni ningún símbolo de formato.
- PROHIBIDO USAR ASTERISCOS: Nunca escribas *palabra* ni **palabra**. Todo debe ser texto plano.
- PROHIBIDO USAR NUMERACIÓN CON PUNTOS: En lugar de "1. Algo" usa "1) Algo" o simplemente párrafos.
- Para listas usa guiones simples: - Elemento
- Escribe en párrafos limpios, claros y bien estructurados.
- Usa saltos de línea para separar ideas.
- Tu tono es profesional pero cercano, como un amigo que sabe de finanzas.

Si te preguntan sobre gastos, supervivencia financiera o deudas, da consejos prácticos, empáticos y estructurados (método bola de nieve, regla 50/30/20).

Recuerda: Texto plano, sin símbolos extraños, sin markdown, sin asteriscos. Formato limpio y organizado.`
    });

    // Convertir formato del historial para la API
    const chatHistory = history.map(h => ({
      role: h.role === "model" ? "model" : "user",
      parts: [{ text: h.parts[0].text }]
    }));

    // Iniciar chat con historial y enviar mensaje
    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message);
    const response = await result.response;

    return response.text() || "Lo siento, tuve un problema procesando tu mensaje.";
  } catch (error: any) {
    console.error("❌ Error en chatbot:", error);
    const keyStatus = apiKey ? "Key Cargada" : "Key FALTANTE";
    return `Error: ${error.message || error} (${keyStatus})`;
  }
};

// =============================================================================
// FUNCIÓN: GENERACIÓN DE PROPUESTAS COMERCIALES
// =============================================================================

/**
 * Genera contenido para propuestas comerciales usando IA
 * Incorpora el ADN de empresa si está configurado para personalización
 * 
 * CARACTERÍSTICAS:
 * - Precios adaptados al mercado LATAM (Colombia, México, Argentina)
 * - Desglose granular de servicios (mínimo 4-6 ítems)
 * - Integración con ADN de empresa para personalización
 * - Lenguaje de neuroventas persuasivo
 * 
 * @param prompt - Descripción del proyecto/servicio solicitado
 * @param user - Perfil del usuario con datos de empresa (opcional)
 * @returns Objeto JSON con items, notas y fecha de validez, o null si hay error
 * 
 * @example
 * const propuesta = await generateProposalContent("Desarrollo de sitio web e-commerce", usuario);
 * // Retorna: { items: [...], notes: "...", validUntil: "2024-02-01" }
 */
export const generateProposalContent = async (prompt: string, user?: UserProfile) => {
  try {
    // Construir contexto de la empresa desde el perfil
    const companyContext = user ? `
      CONTEXTO DE LA EMPRESA:
      Nombre: ${user.companyName || "Empresa Genérica"}
      Descripción: ${user.companyDescription || "Servicios profesionales"}
      Tarifas/Precios: ${user.pricingStrategy || "Precios de mercado estándar"}
      País/Moneda: ${user.country || "General"} (${user.currency})
      Impuestos: ${user.taxRate || 0}%
    ` : "";

    // Incorporar ADN de empresa si está activo
    const companyDNA = user?.companyDNA;
    const dnaContext = companyDNA?.isActive ? `
      
      ==========================================
      ADN E IDENTIDAD DE LA EMPRESA (CRÍTICO - ÚSALO PARA PERSONALIZAR)
      ==========================================
      
      METODOLOGÍA DE TRABAJO: ${companyDNA.extractedData.methodology || "No especificada"}
      ESTILO DE PROPUESTAS: ${companyDNA.extractedData.proposalStyle || "Estándar profesional"}
      VOZ DE MARCA: ${companyDNA.extractedData.brandVoice || "Profesional y directa"}
      SERVICIOS PRINCIPALES: ${companyDNA.extractedData.coreServices?.join(', ') || "Servicios generales"}
      MERCADO OBJETIVO: ${companyDNA.extractedData.targetMarket || "General"}
      PROPUESTA DE VALOR: ${companyDNA.extractedData.valueProposition || "Soluciones de calidad"}
      FILOSOFÍA DE PRECIOS: ${companyDNA.extractedData.pricingPhilosophy || "Basado en valor entregado"}
      DIFERENCIADORES: ${companyDNA.extractedData.competitiveDifferentiators || "Experiencia y calidad"}
      STACK TÉCNICO: ${companyDNA.extractedData.technicalStack?.join(', ') || "Tecnologías modernas"}
      PROCESO DE ENTREGA: ${companyDNA.extractedData.deliveryProcess || "Metodología ágil"}
      ESTÁNDARES DE CALIDAD: ${companyDNA.extractedData.qualityStandards || "Alta calidad garantizada"}
      PAUTAS ADICIONALES: ${companyDNA.extractedData.customGuidelines || "N/A"}
      
      ==========================================
      INSTRUCCIÓN: Adapta COMPLETAMENTE la propuesta a este ADN.
      ==========================================
    ` : "";

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Prompt completo con instrucciones de neuroventas
    const fullPrompt = `
    Actúa como un Senior Sales Manager & Neuromarketing Strategist experto en ${user?.companyDescription || "servicios digitales de alto impacto"}.
    
    ${companyContext}
    ${dnaContext}

    TAREA:
    Redacta una propuesta comercial IRRESISTIBLE y de ALTO IMPACTO para: "${prompt}".
    ${companyDNA?.isActive ? `
    CRÍTICO: Esta propuesta debe reflejar EXACTAMENTE la metodología, estilo y ADN de la empresa.` : ''}
    
    ESTRATEGIA NEURO-VENTAS Y DESGLOSE TÉCNICO:
    1.  DESGLOSE GRANULAR OBLIGATORIO: NO agrupes servicios. Si piden "Una Web", desglosar en múltiples ítems (Diseño UX/UI, Frontend, Backend, Hosting, etc.). Mínimo 4-6 ítems.
    
    2.  PRECIOS REALISTAS PARA LATINOAMÉRICA:
        - COP (Colombia): Web completa 1,500,000 - 2,500,000 COP
        - MXN (México): Web completa $15,000 - $35,000 MXN
        - ARS (Argentina): Web completa $500,000 - $1,500,000 ARS
        - USD/EUR: Web completa $2,000 - $4,000 USD
    
    3.  Lenguaje Persuasivo: Vende transformación, no solo características.
    4.  Realismo Técnico: Incluye stacks tecnológicos modernos.

    REGLAS DE FORMATO (CRÍTICO):
    - PROHIBIDO USAR MARKDOWN: NO asteriscos (*), ni guiones bajos (_).
    - PROHIBIDO LISTAS EN DESCRIPCIÓN: Cada componente es un ítem separado.
    - Estilo: Profesional, elegante y directo.

    Responde SOLO en JSON válido:
    {
      "items": [
        {"description": "Servicio individual (texto plano)", "quantity": 1, "price": 0}
      ],
      "notes": "Texto de cierre persuasivo (texto plano)",
      "validUntil": "YYYY-MM-DD"
    }`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // Extraer JSON de la respuesta
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error("❌ Error generando propuesta:", error);
    return null;
  }
};

// =============================================================================
// FUNCIÓN: PROCESAMIENTO OCR DE FACTURAS
// =============================================================================

/**
 * Extrae datos de una imagen de factura usando visión por computadora
 * 
 * @param base64Image - Imagen codificada en base64 (JPEG recomendado)
 * @returns Objeto con descripción, monto, fecha y tipo de transacción
 * 
 * @example
 * const datos = await processInvoiceOCR(imagenBase64);
 * // Retorna: { description: "Factura Adobe", amount: 50000, date: "2024-01-15", type: "expense" }
 */
export const processInvoiceOCR = async (base64Image: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Preparar imagen para el modelo multimodal
    const imageParts = [{
      inlineData: {
        data: base64Image.split(',')[1], // Remover prefijo data:image/...
        mimeType: "image/jpeg"
      }
    }];

    const prompt = "Extrae los datos de esta factura. Devuelve JSON: {\"description\": \"...\", \"amount\": 0, \"date\": \"YYYY-MM-DD\", \"type\": \"income/expense\"}";

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return {};
  } catch (error) {
    console.error("❌ Error en OCR:", error);
    throw error;
  }
};

// =============================================================================
// FUNCIÓN: PROCESAMIENTO DE DOCUMENTOS PDF
// =============================================================================

/**
 * Extrae información de documentos PDF (tarifas, precios, etc.)
 * 
 * @param base64PDF - Documento PDF codificado en base64
 * @returns Texto estructurado con la información extraída
 */
export const processDocumentPDF = async (base64PDF: string): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = "Extrae TODA la información relevante de este documento de tarifas/precios. Devuelve un texto estructurado con los servicios y sus precios.";

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "No se pudo extraer información del PDF.";
  } catch (error) {
    console.error("❌ Error procesando PDF:", error);
    throw error;
  }
};

// =============================================================================
// FUNCIÓN: DETECCIÓN DE SUSCRIPCIONES VAMPIRO
// =============================================================================

/**
 * Analiza gastos y detecta suscripciones duplicadas o innecesarias
 * "Suscripciones Vampiro" = servicios que drenan dinero sin uso real
 * 
 * @param transactions - Array de transacciones (filtra automáticamente gastos)
 * @returns Array de sugerencias con ahorro potencial y razón
 * 
 * @example
 * const vampiros = await detectVampireSubscriptions(transacciones);
 * // Retorna: [{ suggestion: "Cancelar Figma duplicado", potentialSaving: 15, reasoning: "..." }]
 */
export const detectVampireSubscriptions = async (transactions: Transaction[]) => {
  // Filtrar solo gastos y preparar resumen
  const summary = transactions
    .filter(t => t.type === 'expense')
    .map(t => `${t.description}: $${t.amount} (${t.category})`)
    .join('\n');

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Analiza estos gastos y detecta "Suscripciones Vampiro" (herramientas duplicadas o servicios optimizables).
    Responde en JSON: [{"suggestion": "...", "potentialSaving": 0, "reasoning": "..."}]
    
    Gastos:
    ${summary}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error("❌ Error detectando suscripciones:", error);
    return [];
  }
};

// =============================================================================
// FUNCIÓN: SIMULACIÓN DE ESCENARIOS FINANCIEROS
// =============================================================================

/**
 * Ejecuta simulaciones financieras "What-If"
 * Proyecta el impacto de decisiones financieras a futuro
 * 
 * @param currentBalance - Balance actual del usuario
 * @param monthlyExpenses - Gastos mensuales promedio
 * @param newExpense - Nuevo gasto a simular (monto, cuotas, descripción)
 * @returns Proyección con runway, impacto mensual y balance proyectado
 * 
 * @example
 * const sim = await runScenarioSimulation(5000000, 2000000, { amount: 3000000, installments: 12, description: "MacBook Pro" });
 */
export const runScenarioSimulation = async (
  currentBalance: number,
  monthlyExpenses: number,
  newExpense: { amount: number, installments: number, description: string }
) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Haz una proyección financiera.
    Balance actual: $${currentBalance}
    Gastos mensuales: $${monthlyExpenses}
    Nuevo gasto: ${newExpense.description} de $${newExpense.amount} en ${newExpense.installments} cuotas.
    
    Responde en JSON:
    {
      "runwayMonths": 0,
      "monthlyImpact": 0,
      "projectedBalance": [{"month": "Ene", "balance": 5000}]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error("❌ Error en simulación:", error);
    return null;
  }
};

// =============================================================================
// FUNCIÓN: EXTRACCIÓN DE ADN EMPRESARIAL
// =============================================================================

/**
 * Analiza un documento PDF y extrae el "ADN" de la empresa
 * Utiliza visión multimodal para procesar el PDF completo
 * 
 * EXTRAE:
 * - Metodología de trabajo
 * - Estilo de propuestas
 * - Voz de marca
 * - Servicios principales
 * - Mercado objetivo
 * - Propuesta de valor
 * - Filosofía de precios
 * - Diferenciadores competitivos
 * - Stack técnico preferido
 * - Proceso de entrega
 * - Estándares de calidad
 * 
 * @param base64PDF - PDF codificado en base64
 * @param fileName - Nombre original del archivo (para registro)
 * @returns Objeto CompanyDNA estructurado o null si falla
 * 
 * @example
 * const dna = await extractCompanyDNA(pdfBase64, "presentacion-corporativa.pdf");
 */
export const extractCompanyDNA = async (base64PDF: string, fileName: string): Promise<CompanyDNA | null> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Preparar PDF para procesamiento multimodal
    const pdfParts = [{
      inlineData: {
        data: base64PDF.split(',')[1] || base64PDF,
        mimeType: "application/pdf"
      }
    }];

    const prompt = `Analiza este documento PDF de empresa y extrae TODA la información relevante sobre el ADN e identidad de la compañía.

IMPORTANTE: Responde SOLO en formato JSON válido sin markdown ni bloques de código.

Extrae la siguiente información (si está disponible en el documento):

1. METODOLOGÍA: ¿Cómo trabajan? ¿Qué frameworks o metodologías usan?
2. ESTILO DE PROPUESTAS: ¿Cómo estructuran sus propuestas comerciales?
3. VOZ DE MARCA: Tono de comunicación (formal, casual, técnico, etc.)
4. SERVICIOS PRINCIPALES: Lista completa de servicios que ofrecen
5. MERCADO OBJETIVO: ¿A quién se dirigen?
6. PROPUESTA DE VALOR: ¿Qué los hace únicos?
7. FILOSOFÍA DE PRECIOS: ¿Cómo determinan precios?
8. DIFERENCIADORES COMPETITIVOS: ¿Qué los distingue?
9. STACK TÉCNICO: Tecnologías y herramientas preferidas
10. PROCESO DE ENTREGA: ¿Cómo entregan proyectos?
11. ESTÁNDARES DE CALIDAD: Procesos de QA, garantías
12. OTRAS PAUTAS: Cualquier otra información relevante

Responde EXACTAMENTE en este formato JSON:
{
  "methodology": "descripción o null",
  "proposalStyle": "descripción o null",
  "brandVoice": "descripción o null",
  "coreServices": ["servicio1", "servicio2"] o [],
  "targetMarket": "descripción o null",
  "valueProposition": "propuesta de valor o null",
  "pricingPhilosophy": "filosofía de precios o null",
  "competitiveDifferentiators": "diferenciadores o null",
  "technicalStack": ["tech1", "tech2"] o [],
  "deliveryProcess": "proceso de entrega o null",
  "qualityStandards": "estándares de calidad o null",
  "customGuidelines": "otra información o null"
}`;

    const result = await model.generateContent([prompt, ...pdfParts]);
    const response = await result.response;
    const text = response.text();

    // Intentar extraer JSON de la respuesta
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const extractedData = JSON.parse(jsonMatch[0]);

      // Construir objeto CompanyDNA estructurado
      return {
        id: Math.random().toString(36).substr(2, 9),
        uploadDate: new Date().toISOString(),
        fileName,
        extractedData,
        rawExtraction: text,
        isActive: true
      };
    }

    console.error("❌ No se encontró JSON en la respuesta:", text);
    return null;
  } catch (error) {
    console.error("❌ Error extrayendo ADN de empresa:", error);
    throw error;
  }
};
