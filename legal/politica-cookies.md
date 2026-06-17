# POLÍTICA DE COOKIES

**Última actualización:** 20 de enero de 2026

---

## 1. ¿QUÉ SON LAS COOKIES?

Las **cookies** son pequeños archivos de texto que se almacenan en su dispositivo (ordenador, tablet o móvil) cuando visita un sitio web. Permiten al sitio recordar sus acciones y preferencias durante un período de tiempo, para que no tenga que reconfigurarlas cada vez que regrese.

**FreelAissistPro** utiliza cookies y tecnologías similares para mejorar la experiencia del usuario, personalizar el servicio y analizar el uso de la Aplicación.

---

## 2. TIPOS DE COOKIES QUE UTILIZAMOS

### 2.1 Cookies estrictamente necesarias ⚙️

Estas cookies son esenciales para el funcionamiento básico de la Aplicación y no se pueden desactivar.

| Cookie | Propósito | Duración | Tipo |
|--------|-----------|----------|------|
| `auth_token` | Mantener su sesión activa | Sesión | Primera parte |
| `user_profile` | Almacenar datos de perfil de usuario | Persistente (1 año) | Primera parte |
| `privacy_mode` | Recordar preferencia de Modo Privacidad | Persistente (1 año) | Primera parte |

> [!IMPORTANT]
> **Estas cookies son necesarias para usar la Aplicación.** Sin ellas, funciones esenciales como el inicio de sesión y la persistencia de datos no funcionarán.

---

### 2.2 Cookies de funcionalidad 🎨

Permiten recordar sus preferencias y personalizar su experiencia.

| Cookie | Propósito | Duración | Tipo |
|--------|-----------|----------|------|
| `theme_preference` | Recordar tema claro/oscuro | Persistente (1 año) | Primera parte |
| `language_preference` | Recordar idioma seleccionado | Persistente (1 año) | Primera parte |
| `sidebar_state` | Recordar si la barra lateral está expandida/colapsada | Persistente (30 días) | Primera parte |
| `ledger_view_mode` | Recordar vista preferida (lista/tarjetas) | Persistente (30 días) | Primera parte |

**Puede desactivar estas cookies,** pero algunas funciones de personalización no estarán disponibles.

---

### 2.3 Cookies de rendimiento y análisis 📊

Nos ayudan a entender cómo los usuarios interactúan con la Aplicación para mejorarla.

**Actualmente NO utilizamos cookies de análisis de terceros** (como Google Analytics). Sin embargo, en futuras versiones podríamos implementar:

| Servicio | Propósito | Tipo de datos recopilados |
|----------|-----------|---------------------------|
| Google Analytics (futuro) | Análisis de uso y comportamiento | Páginas visitadas, tiempo de permanencia, eventos de usuario |
| Sentry/LogRocket (futuro) | Detección de errores y debugging | Errores de JavaScript, sesiones anómalas |

> [!NOTE]
> **Versión actual:** FreelAissistPro v1.0.0 NO utiliza cookies de análisis de terceros. Si esto cambia en el futuro, actualizaremos esta política y le solicitaremos su consentimiento.

---

### 2.4 Cookies de publicidad 🎯

**NO utilizamos cookies publicitarias.** FreelAissistPro no muestra anuncios de terceros ni rastrea su actividad para publicidad dirigida.

---

## 3. ALMACENAMIENTO LOCAL (localStorage)

Además de cookies, utilizamos **localStorage** del navegador para almacenar sus datos financieros, clientes, proyectos y configuraciones.

### 3.1 ¿Qué almacenamos en localStorage?

| Clave | Contenido | Sensibilidad |
|-------|-----------|--------------|
| `user_profile` | Datos del usuario y empresa | Media |
| `ledger_transactions` | Transacciones financieras (ingresos/gastos) | **Alta** |
| `ledger_tasks` | Tareas del tablero Kanban | Baja |
| `ledger_clients` | Directorio de clientes | Media |
| `ledger_quotations` | Cotizaciones generadas | Media |
| `ledger_events` | Eventos del calendario | Baja |
| `company_dna` | ADN de empresa extraído de PDFs | Media |
| `chat_history` | Historial de conversaciones con el chatbot | Media |

> [!CAUTION]
> **Importante sobre localStorage:**
> - Los datos se almacenan **sin encriptar** en su navegador
> - Si borra los datos del navegador, **perderá toda su información**
> - Recomendamos exportar sus datos regularmente usando la función "Exportar datos"

---

## 4. COOKIES DE TERCEROS

### 4.1 Google Gemini AI

Aunque no utilizamos cookies de Google directamente, al enviar datos a **Google Gemini API** para procesamiento de IA, Google puede establecer sus propias cookies según su política de privacidad:

- **Política de Privacidad de Google:** [https://policies.google.com/privacy](https://policies.google.com/privacy)
- **Política de Google AI:** [https://ai.google.dev/gemini-api/terms](https://ai.google.dev/gemini-api/terms)

### 4.2 Fuentes de Google (Google Fonts)

Utilizamos Google Fonts para tipografías. Google puede registrar información técnica básica (navegador, sistema operativo) pero no utiliza cookies para este servicio.

### 4.3 CDN de Tailwind CSS

Cargamos Tailwind CSS desde un CDN público. Este servicio no establece cookies.

---

## 5. GESTIÓN DE COOKIES

### 5.1 Consentimiento de cookies

Al acceder a FreelAissistPro por primera vez, se le presentará un **banner de consentimiento de cookies**. Puede elegir:

- ✅ **Aceptar todas las cookies** (recomendado para experiencia completa)
- ⚙️ **Configurar preferencias** (solo cookies necesarias + funcionalidad seleccionada)
- ❌ **Rechazar cookies opcionales** (solo cookies estrictamente necesarias)

### 5.2 Cambiar preferencias en cualquier momento

Puede modificar sus preferencias de cookies en cualquier momento desde:

**Configuración → Privacidad y Datos → Preferencias de Cookies**

También puede utilizar las opciones de su navegador (ver sección 5.3).

### 5.3 Eliminar cookies desde su navegador

Puede borrar cookies en cualquier momento desde la configuración de su navegador:

#### Google Chrome
1. Configuración → Privacidad y seguridad → Cookies y otros datos de sitios
2. Ver todas las cookies y datos de sitios → Buscar "freelaissistpro"
3. Eliminar

#### Mozilla Firefox
1. Configuración → Privacidad y seguridad → Cookies y datos del sitio
2. Administrar datos → Buscar "freelaissistpro"
3. Eliminar seleccionados

#### Safari (Mac/iOS)
1. Preferencias → Privacidad → Administrar datos de sitios web
2. Buscar "freelaissistpro" → Eliminar

#### Microsoft Edge
1. Configuración → Privacidad, búsqueda y servicios → Cookies y datos de sitios almacenados
2. Ver todas las cookies y datos de sitios → Buscar "freelaissistpro"
3. Eliminar

> [!WARNING]
> **Al eliminar cookies y localStorage, perderá todos sus datos financieros.** Asegúrese de exportar sus datos antes de borrar.

---

## 6. COOKIES Y TECNOLOGÍAS SIMILARES

Además de cookies tradicionales, utilizamos:

### 6.1 Web Storage API (localStorage y sessionStorage)

- **localStorage:** Almacenamiento persistente sin fecha de expiración
- **sessionStorage:** Almacenamiento temporal que se borra al cerrar la pestaña

**Uso actual:** Principalmente utilizamos localStorage para todas las funcionalidades de la Aplicación.

### 6.2 IndexedDB (futuro)

En futuras versiones, podemos migrar a **IndexedDB** para almacenar grandes cantidades de datos estructurados de manera más eficiente.

### 6.3 Service Workers (futuro)

Podemos implementar Service Workers para permitir funcionalidad offline y mejorar el rendimiento.

---

## 7. SEGURIDAD Y PRIVACIDAD

### 7.1 Protección de cookies

Aunque las cookies no contienen contraseñas, almacenan identificadores de sesión. Para protegerlas:

- ✅ Utilizamos **HTTPS** para encriptar la transmisión
- ✅ Marcamos cookies sensibles como **HttpOnly** cuando es posible
- ✅ Implementamos **SameSite=Strict** para prevenir CSRF

### 7.2 Datos sensibles en localStorage

> [!CAUTION]
> **localStorage NO está encriptado.** Aunque solo usted tiene acceso a través de su navegador, le recomendamos:
> 
> - No usar dispositivos públicos o compartidos
> - Cerrar sesión al terminar
> - Activar el "Modo Privacidad" cuando comparta pantalla
> - Exportar datos regularmente

### 7.3 Migración futura a almacenamiento seguro

Estamos trabajando en migrar a **almacenamiento en la nube con encriptación de grado bancario** (Supabase/Firebase). Sus datos serán transferidos con su consentimiento.

---

## 8. COOKIES EN APLICACIONES MÓVILES (FUTURO)

Si en el futuro lanzamos aplicaciones móviles nativas de FreelAissistPro, esta Política de Cookies se actualizará para cubrir tecnologías equivalentes como:

- Identificadores de dispositivos
- SDKs de análisis
- Almacenamiento local de apps

---

## 9. COOKIES PARA MENORES

FreelAissistPro no está dirigido a menores de 18 años. No recopilamos conscientemente cookies o datos de menores. Si un padre/tutor descubre que un menor ha proporcionado información, contáctenos para eliminarla.

---

## 10. ACTUALIZACIONES DE ESTA POLÍTICA

Nos reservamos el derecho de modificar esta Política de Cookies en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación.

**Le notificaremos sobre cambios significativos mediante:**

- Banner de aviso en la Aplicación
- Correo electrónico a su cuenta registrada
- Solicitud de nuevo consentimiento (si aplica según regulaciones)

**Última modificación:** 20 de enero de 2026

---

## 11. CUMPLIMIENTO NORMATIVO

Esta Política de Cookies cumple con:

- **ePrivacy Directive** (Directiva de Privacidad Electrónica de la UE)
- **GDPR** (Reglamento General de Protección de Datos)
- **CCPA** (Ley de Privacidad del Consumidor de California)
- **LGPD** (Ley General de Protección de Datos de Brasil)
- Otras regulaciones aplicables según su jurisdicción

---

## 12. PREGUNTAS FRECUENTES (FAQ)

### ¿Qué pasa si rechazo todas las cookies?

Podrá usar la Aplicación, pero solo con cookies estrictamente necesarias. Perderá funcionalidades como:
- Recordar su preferencia de tema (claro/oscuro)
- Mantener su sesión activa por más de 1 día
- Personalización de la interfaz

### ¿FreelAissistPro vende mis datos de cookies a terceros?

**NO.** Nunca vendemos, alquilamos ni comercializamos datos de cookies o de ningún tipo.

### ¿Por qué usan localStorage en lugar de una base de datos?

La versión actual (v1.0.0) es una aplicación de cliente simple. Estamos desarrollando la integración con Supabase para almacenamiento en la nube seguro en futuras versiones.

### ¿Puedo usar FreelAissistPro sin aceptar cookies?

Las **cookies estrictamente necesarias** son obligatorias para el funcionamiento básico. Puede rechazar cookies de funcionalidad y análisis.

### ¿Qué pasa con mi información si borro las cookies?

Si borra cookies **Y** datos de localStorage, **perderá todos sus datos financieros**. Asegúrese de exportar sus datos regularmente.

---

## 13. CONTACTO

Si tiene preguntas sobre nuestra Política de Cookies, contáctenos:

**Traffic Digital Home**
- **Email:** contacto@trafficdigitalhome.com
- **Web:** trafficdigitalhome.com
- **Asunto:** "Política de Cookies - FreelAissistPro"

Nos comprometemos a responder a todas las consultas en un plazo máximo de 30 días hábiles.

---

## 14. RESUMEN VISUAL DE COOKIES

```
┌─────────────────────────────────────────────────────────────┐
│                    COOKIES DE FREELAISSISTPRO               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ⚙️  ESTRICTAMENTE NECESARIAS (Siempre activas)            │
│  ├─ auth_token: Sesión de usuario                         │
│  ├─ user_profile: Datos de perfil                         │
│  └─ privacy_mode: Modo privacidad                         │
│                                                             │
│  🎨 FUNCIONALIDAD (Opcionales)                             │
│  ├─ theme_preference: Tema claro/oscuro                   │
│  ├─ language_preference: Idioma                           │
│  └─ sidebar_state: Estado de barra lateral               │
│                                                             │
│  📊 ANÁLISIS (No utilizadas actualmente)                   │
│  └─ Ninguna cookie de análisis de terceros                │
│                                                             │
│  🎯 PUBLICIDAD (No utilizadas)                             │
│  └─ FreelAissistPro NO muestra publicidad                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

**© 2024-2026 Traffic Digital Home - Todos los derechos reservados**

**FreelAissistPro™** es una marca registrada de Traffic Digital Home.
