# =============================================================================
# DOCKERFILE — Freelance Ledger
# Multi-stage build para producción con Nginx
# =============================================================================

# ---- Build Stage ----
FROM node:20-alpine AS build

WORKDIR /app

# Instalar dependencias (cache layer)
COPY package.json package-lock.json* ./
RUN npm ci --only=production && \
    npm ci --only=dev

# Copiar código fuente
COPY . .

# Build de la aplicación
RUN npm run build

# ---- Production Stage ----
FROM nginx:1.25-alpine

# Copiar build desde stage anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Configuración personalizada de Nginx para SPA
# Install curl for healthcheck
RUN apk add --no-cache curl

RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Gzip compression \
    gzip on; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml; \
    gzip_min_length 1000; \
    \
    # SPA: redirigir todas las rutas a index.html \
    location / { \
        try_files $uri $uri/ /index.html; \
        add_header Cache-Control "no-cache, must-revalidate"; \
    } \
    \
    # Archivos estáticos con cache \
    location /assets/ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    # Seguridad \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
    add_header Referrer-Policy "strict-origin-when-cross-origin" always; \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
