# 📄 Documentos Legales - FreelAissistPro

Esta carpeta contiene todos los documentos legales necesarios para el cumplimiento normativo de **FreelAissistPro**.

---

## 📋 Documentos Disponibles

### 1. [Política de Privacidad](./politica-privacidad.md)
**Archivo:** `politica-privacidad.md`

Detalla cómo recopilamos, utilizamos, almacenamos y protegemos la información personal de los usuarios.

**Puntos clave:**
- ✅ Cumplimiento GDPR, CCPA, LGPD
- ✅ Transparencia sobre procesamiento con Google Gemini AI
- ✅ Derechos de acceso, rectificación y eliminación de datos
- ✅ Política de almacenamiento local (localStorage)
- ✅ Exportación de datos en formatos estándar

---

### 2. [Términos y Condiciones](./terminos-condiciones.md)
**Archivo:** `terminos-condiciones.md`

Establece las reglas de uso de la Aplicación, derechos de propiedad intelectual, limitaciones de responsabilidad y acuerdos legales.

**Puntos clave:**
- ✅ Licencia de uso y restricciones
- ✅ Propiedad intelectual de Traffic Digital Home
- ✅ Limitaciones de responsabilidad sobre IA
- ✅ Descargos de garantías
- ✅ Política de indemnización
- ✅ Resolución de disputas

---

### 3. [Política de Cookies](./politica-cookies.md)
**Archivo:** `politica-cookies.md`

Explica el uso de cookies, localStorage y tecnologías similares para personalizar la experiencia del usuario.

**Puntos clave:**
- ✅ Tipos de cookies (necesarias, funcionalidad, análisis)
- ✅ Detalle de localStorage y qué datos almacena
- ✅ Instrucciones para gestión de cookies por navegador
- ✅ Cookies de terceros (Google Fonts, Google Gemini)
- ✅ Cumplimiento ePrivacy Directive

---

## 🔄 Última Actualización

**Fecha:** 20 de enero de 2026  
**Versión de documentos:** 1.0.0

---

## ⚖️ Cumplimiento Normativo

Todos los documentos cumplen con:

| Normativa | Región | Estado |
|-----------|--------|--------|
| **GDPR** | Unión Europea | ✅ Completo |
| **CCPA** | California, USA | ✅ Completo |
| **LGPD** | Brasil | ✅ Completo |
| **LFPDPPP** | México | ✅ Completo |
| **LPDP** | Argentina | ✅ Completo |
| **ePrivacy Directive** | Unión Europea | ✅ Completo |

---

## 📌 Implementación en la Aplicación

Para integrar estos documentos en FreelAissistPro:

### Opción 1: Enlaces en el Footer

Agrega enlaces en el componente `Layout.tsx`:

```tsx
<footer className="text-center py-4 text-sm text-gray-500">
  <div className="flex justify-center gap-4">
    <a href="/legal/politica-privacidad" className="hover:text-emerald-600">
      Política de Privacidad
    </a>
    <span>•</span>
    <a href="/legal/terminos-condiciones" className="hover:text-emerald-600">
      Términos y Condiciones
    </a>
    <span>•</span>
    <a href="/legal/politica-cookies" className="hover:text-emerald-600">
      Política de Cookies
    </a>
  </div>
  <p className="mt-2">© 2024-2026 Traffic Digital Home - Todos los derechos reservados</p>
</footer>
```

### Opción 2: Modal de Aceptación al Registro

Implementa un modal que requiera aceptación explícita antes de usar la app:

```tsx
<div className="text-sm text-gray-600">
  Al registrarte, aceptas nuestros{' '}
  <a href="/legal/terminos-condiciones" className="text-emerald-600 underline">
    Términos y Condiciones
  </a>{' '}
  y nuestra{' '}
  <a href="/legal/politica-privacidad" className="text-emerald-600 underline">
    Política de Privacidad
  </a>.
</div>
```

### Opción 3: Banner de Cookies

Muestra un banner en la primera visita:

```tsx
{showCookieBanner && (
  <div className="fixed bottom-0 left-0 right-0 bg-slate-900 text-white p-4 shadow-lg z-50">
    <div className="container mx-auto flex items-center justify-between">
      <p className="text-sm">
        Usamos cookies para mejorar tu experiencia. Consulta nuestra{' '}
        <a href="/legal/politica-cookies" className="underline">Política de Cookies</a>.
      </p>
      <button 
        onClick={() => setShowCookieBanner(false)}
        className="bg-emerald-600 px-4 py-2 rounded"
      >
        Aceptar
      </button>
    </div>
  </div>
)}
```

---

## 📋 Checklist de Implementación

- [ ] Crear rutas para cada documento legal en `App.tsx`
- [ ] Agregar componente visualizador de Markdown (o convertir a HTML)
- [ ] Implementar enlaces en footer del `Layout.tsx`
- [ ] Crear modal de aceptación en primera sesión
- [ ] Implementar banner de cookies
- [ ] Agregar registro de consentimiento en `localStorage`:
  - `user_accepted_terms` - Timestamp de aceptación de T&C
  - `user_accepted_privacy` - Timestamp de aceptación de Privacidad
  - `user_accepted_cookies` - Timestamp de aceptación de Cookies
- [ ] Añadir versión de documentos aceptados (para rastrear cambios)
- [ ] Crear sección "Privacidad y Datos" en Settings para gestión de datos

---

## 🚨 Notas Importantes

> [!IMPORTANT]
> **Antes de producción:**
> 
> 1. **Revisar jurisdicción:** Actualizar las secciones de "Ley aplicable" en Términos y Condiciones con la ubicación legal de Traffic Digital Home
> 2. **Datos de contacto:** Confirmar que los emails y datos de contacto son correctos
> 3. **Revisión legal:** Idealmente, hacer revisar estos documentos por un abogado especializado en derecho digital
> 4. **Traducciones:** Si la app será multiidioma, traducir estos documentos

> [!WARNING]
> **Actualizar documentos cuando:**
> 
> - Agregues nuevas funcionalidades que procesen datos personales
> - Cambies proveedores de servicios (ej: migrar de Google Gemini a otro servicio)
> - Implementes almacenamiento en la nube (Supabase)
> - Agregues cookies de análisis (Google Analytics, etc.)
> - Cambien las leyes de protección de datos

---

## 🔗 Enlaces Útiles

- [GDPR Official Text](https://gdpr-info.eu/)
- [CCPA Official Text](https://oag.ca.gov/privacy/ccpa)
- [Google AI Terms of Service](https://ai.google.dev/gemini-api/terms)
- [Google Privacy Policy](https://policies.google.com/privacy)

---

## 📞 Contacto Legal

Para consultas legales sobre estos documentos:

**Traffic Digital Home**
- **Email:** contacto@trafficdigitalhome.com
- **Web:** trafficdigitalhome.com

---

**© 2024-2026 Traffic Digital Home - Todos los derechos reservados**
