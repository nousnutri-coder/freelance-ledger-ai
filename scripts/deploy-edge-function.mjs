#!/usr/bin/env node

/**
 * Deploy Supabase Edge Function for sending emails.
 *
 * REQUISITOS:
 *   - Supabase CLI (https://supabase.com/docs/guides/cli)
 *   - Variable de entorno SUPABASE_SERVICE_KEY con la Service Role Key
 *     (configurada en GitHub Secrets / entorno local)
 *
 * USO:
 *   export SUPABASE_SERVICE_KEY=sbp_xxx
 *   node scripts/deploy-edge-function.mjs
 *
 * NOTA: El CLI de Supabase no soporta Windows (win32-x64).
 * En Windows, desplegar manualmente desde el Dashboard de Supabase:
 *   1. Ir a https://supabase.com/dashboard/project/iicdtvhnilhgupckcfrn/edge-functions
 *   2. Crear función "send-email"
 *   3. Copiar el contenido de supabase/functions/send-email/index.ts
 *   4. Configurar secrets: SMTP_HOST, SMTP_PASS, SMTP_USER, SMTP_PORT, SMTP_SENDER
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const DEFAULTS = {
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: '587',
  SMTP_USER: 'aissistpro9@gmail.com',
  SMTP_SENDER: 'Freelance Ledger <aissistpro9@gmail.com>',
};

const requiredSecrets = [
  { name: 'SMTP_HOST', value: process.env.SMTP_HOST || DEFAULTS.SMTP_HOST },
  { name: 'SMTP_PORT', value: process.env.SMTP_PORT || DEFAULTS.SMTP_PORT },
  { name: 'SMTP_USER', value: process.env.SMTP_USER || DEFAULTS.SMTP_USER },
  { name: 'SMTP_PASS', value: process.env.SMTP_PASS },
  { name: 'SMTP_SENDER', value: process.env.SMTP_SENDER || DEFAULTS.SMTP_SENDER },
];

async function main() {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) {
    console.error('ERROR: SUPABASE_SERVICE_KEY no está configurada.');
    console.error('Exporta la variable o pásala inline:');
    console.error('  export SUPABASE_SERVICE_KEY=tu_service_role_key');
    console.error('  node scripts/deploy-edge-function.mjs');
    process.exit(1);
  }

  // Verificar que el CLI de Supabase está instalado
  try {
    execSync('npx supabase --version', { stdio: 'pipe', cwd: rootDir });
  } catch {
    console.log('⚠️  Supabase CLI no detectado. Intentando método alternativo (API directa)...');
    await deployViaApi(serviceKey);
    return;
  }

  // Verificar que el archivo de la función existe
  const fnPath = join(rootDir, 'supabase', 'functions', 'send-email', 'index.ts');
  if (!existsSync(fnPath)) {
    console.error(`ERROR: No se encuentra ${fnPath}`);
    process.exit(1);
  }

  console.log('📦 Desplegando Edge Function send-email...\n');

  // 1. Configurar secrets
  console.log('🔐 Configurando secrets...');
  for (const secret of requiredSecrets) {
    try {
      execSync(
        `npx supabase secrets set --project-ref iicdtvhnilhgupckcfrn ${secret.name}="${secret.value}"`,
        { stdio: 'pipe', cwd: rootDir, env: { ...process.env, SUPABASE_SERVICE_KEY: serviceKey } }
      );
      console.log(`   ✅ ${secret.name}`);
    } catch (err) {
      console.error(`   ❌ ${secret.name}: ${err.message}`);
    }
  }

  // 2. Desplegar la función
  console.log('\n🚀 Desplegando función...');
  try {
    execSync(
      `npx supabase functions deploy send-email --project-ref iicdtvhnilhgupckcfrn`,
      { stdio: 'inherit', cwd: rootDir, env: { ...process.env, SUPABASE_SERVICE_KEY: serviceKey } }
    );
    console.log('\n✅ Función desplegada exitosamente!');
  } catch (err) {
    console.error('\n❌ Error desplegando función:', err.message);
    console.log('\n👉 Despliegue manual: https://supabase.com/dashboard/project/iicdtvhnilhgupckcfrn/edge-functions');
    process.exit(1);
  }
}

/**
 * Método alternativo: despliega usando la Management API directamente.
 * Se usa cuando supabase CLI no está disponible.
 */
async function deployViaApi(apiKey) {
  const { readFileSync } = await import('fs');
  const https = await import('https');
  const { execSync } = await import('child_process');
  const os = await import('os');

  const code = readFileSync(join(rootDir, 'supabase', 'functions', 'send-email', 'index.ts'), 'utf-8');

  // Primero configurar secrets via API
  console.log('🔐 Configurando secrets via API...');
  await apiRequest(apiKey, '/projects/iicdtvhnilhgupckcfrn/secrets', 'POST', JSON.stringify(
    requiredSecrets.map(s => ({ name: s.name, value: s.value }))
  ));
  console.log('   ✅ Secrets configurados');

  // Probar deploy via Management API
  console.log('🚀 Desplegando función via API...');
  try {
    // Crear tar.gz temporal
    const tmpDir = execSync('mktemp -d', { encoding: 'utf-8' }).trim();
    const tarPath = `${tmpDir}/function.tar.gz`;
    execSync(`cp '${join(rootDir, 'supabase', 'functions', 'send-email', 'index.ts')}' ${tmpDir}/index.ts && cd ${tmpDir} && tar -czf ${tarPath} index.ts`, { stdio: 'pipe' });

    const tarball = readFileSync(tarPath);
    const boundary = '----Boundary' + Math.random().toString(36).substring(2);

    const body = [
      `--${boundary}\r\nContent-Disposition: form-data; name="slug"\r\n\r\nsend-email\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="name"\r\n\r\nsend-email\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="verify_jwt"\r\n\r\nfalse\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="body"; filename="function.tar.gz"\r\nContent-Type: application/gzip\r\n\r\n`,
      tarball.toString('binary'),
      `\r\n--${boundary}--\r\n`,
    ].join('');
    const bodyBuf = Buffer.from(body, 'binary');

    const result = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.supabase.com',
        path: '/v1/projects/iicdtvhnilhgupckcfrn/functions/deploy',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': bodyBuf.length,
        },
      }, res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => resolve({ status: res.statusCode, data: d }));
      });
      req.on('error', reject);
      req.write(bodyBuf);
      req.end();
    });

    if (result.status === 201 || result.status === 200) {
      console.log('   ✅ Función desplegada exitosamente!');
    } else {
      console.log(`   ⚠️  API respondió ${result.status}: ${result.data.slice(0, 300)}`);
      console.log('\n👉 Despliegue manual requerido: https://supabase.com/dashboard/project/iicdtvhnilhgupckcfrn/edge-functions');
    }

    execSync(`rm -rf ${tmpDir}`, { stdio: 'pipe' });
  } catch (err) {
    console.error('   ❌ Error:', err.message);
    console.log('\n👉 Despliegue manual: https://supabase.com/dashboard/project/iicdtvhnilhgupckcfrn/edge-functions');
  }
}

function apiRequest(apiKey, path, method, body) {
  return new Promise((resolve, reject) => {
    const https = require('https');
    const opts = {
      hostname: 'api.supabase.com',
      path: `/v1${path}`,
      method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch { resolve(d); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

main().catch(console.error);
