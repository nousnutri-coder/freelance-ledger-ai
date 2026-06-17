#!/usr/bin/env node

/**
 * Deploy Supabase Edge Function "send-email" via Management API
 *
 * Node.js 18+ nativo (no requiere CLI de Supabase ni dependencias externas).
 * Funciona en Windows, Linux y macOS.
 *
 * USO (PowerShell):
 *   $env:SUPABASE_SERVICE_KEY="sbp_xxx"; node scripts\deploy-edge-function.mjs
 *
 * USO (Bash):
 *   export SUPABASE_SERVICE_KEY=sbp_xxx && node scripts/deploy-edge-function.mjs
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';
import https from 'https';
import { gzipSync, gunzipSync } from 'zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const PROJECT_REF = 'iicdtvhnilhgupckcfrn';
const FN_NAME = 'send-email';
const API_BASE = `https://api.supabase.com/v1/projects/${PROJECT_REF}`;

const SECRETS = [
  { name: 'SMTP_HOST', value: 'smtp.gmail.com' },
  { name: 'SMTP_PORT', value: '587' },
  { name: 'SMTP_USER', value: 'aissistpro9@gmail.com' },
  { name: 'SMTP_PASS', value: process.env.SMTP_PASS || 'swjotginidnycrqh' },
  { name: 'SMTP_SENDER', value: 'Freelance Ledger <aissistpro9@gmail.com>' },
];

async function apiJson(method, path, apiKey, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, body: text };
}

async function main() {
  const apiKey = process.env.SUPABASE_SERVICE_KEY;
  if (!apiKey) {
    console.error('❌ SUPABASE_SERVICE_KEY no está configurada.');
    console.error('   $env:SUPABASE_SERVICE_KEY="sbp_xxx"; node scripts/deploy-edge-function.mjs');
    process.exit(1);
  }

  // 1. Configurar secrets
  console.log('🔐 Configurando secrets...');
  const secretsResult = await apiJson('POST', '/secrets', apiKey, SECRETS);
  if (secretsResult.status >= 400) {
    console.error(`   ❌ Error: HTTP ${secretsResult.status} — ${secretsResult.body.slice(0, 300)}`);
  } else {
    console.log('   ✅ Secrets configurados');
  }

  // 2. Desplegar función
  console.log(`\n🚀 Desplegando función "${FN_NAME}"...`);

  const fnPath = join(rootDir, 'supabase', 'functions', FN_NAME, 'index.ts');
  if (!existsSync(fnPath)) {
    console.error(`   ❌ No se encuentra: ${fnPath}`);
    process.exit(1);
  }

  const fnCode = readFileSync(fnPath, 'utf-8');
  console.log(`   📄 Código fuente: ${fnCode.length} bytes`);

  // Create temp directory — tar should have index.ts at root (no source/ prefix)
  const tmpDir = join(tmpdir(), `sfn-${Date.now()}`);
  mkdirSync(tmpDir, { recursive: true });
  writeFileSync(join(tmpDir, 'index.ts'), fnCode);

  const tarPath = join(tmpDir, 'function.tar.gz');
  const fileData = readFileSync(join(tmpDir, 'index.ts'));

  // Build ustar tar header for "index.ts"
  function ustarHeader(name, size) {
    const b = Buffer.alloc(512);
    Buffer.from(name, 'utf-8').copy(b, 0, 0, Math.min(name.length, 100));
    b.write('000644 ', 100, 8, 'ascii');
    b.write('000000 ', 108, 8, 'ascii');
    b.write('000000 ', 116, 8, 'ascii');
    b.write(size.toString(8).padStart(11, '0') + ' ', 124, 12, 'ascii');
    b.write('00000000000 ', 136, 12, 'ascii');
    b[156] = 0x30;
    Buffer.from('ustar', 'ascii').copy(b, 257);
    b[262] = 0;
    Buffer.from('00', 'ascii').copy(b, 263);
    Buffer.from('root', 'ascii').copy(b, 265);
    Buffer.from('root', 'ascii').copy(b, 297);
    b.fill(0x20, 148, 156);
    let sum = 0;
    for (let i = 0; i < 512; i++) sum += b[i];
    b.write(sum.toString(8).padStart(6, '0') + ' \0', 148, 8, 'ascii');
    return b;
  }

  const header = ustarHeader('index.ts', fileData.length);

  // Pad data to 512-byte block
  const padLen = (512 - (fileData.length % 512)) % 512;
  const dataBlock = Buffer.concat([fileData, Buffer.alloc(padLen)]);

  // End-of-archive: two 512-byte zero blocks
  const eof = Buffer.alloc(1024);

  const tarBuffer = Buffer.concat([header, dataBlock, eof]);

  // Gzip it
  const gzipped = gzipSync(tarBuffer);
  writeFileSync(tarPath, gzipped);
  console.log(`   📦 Tar.gz: ${(gzipped.length / 1024).toFixed(1)} KB`);

  // Verify tar.gz contents
  const unzipped = gunzipSync(gzipped);
  const entryName = unzipped.toString('utf-8', 0, 100).replace(/\0/g, '').trim();
  console.log(`   🔍 Entry name in tar: "${entryName}"`);
  if (entryName.includes('source/')) {
    console.log('   ⚠️  Entry has source/ prefix — may cause path mismatch');
  }

  // 3. Deploy — try multiple approaches
  console.log('   📤 Enviando a Supabase Management API...');

  const metadata = JSON.stringify({
    name: FN_NAME,
    slug: FN_NAME,
    verify_jwt: false,
    entrypoint_path: 'index.ts',
    import_map: false,
  });

  // Approach A: multipart/form-data via raw https (most reliable cross-platform)
  const boundary = '----Boundary' + Math.random().toString(36).substring(2, 15);
  const encoder = new TextEncoder();

  const part1 =
    `--${boundary}\r\n` +
    'Content-Disposition: form-data; name="metadata"\r\n' +
    'Content-Type: application/json\r\n\r\n' +
    metadata + '\r\n';

  const part2Header =
    `--${boundary}\r\n` +
    'Content-Disposition: form-data; name="file"; filename="function.tar.gz"\r\n' +
    'Content-Type: application/gzip\r\n\r\n';

  const footer = `\r\n--${boundary}--\r\n`;

  const body = Buffer.concat([
    encoder.encode(part1 + part2Header),
    Buffer.from(gzipped),
    encoder.encode(footer),
  ]);

  const deployRes = await new Promise((resolve) => {
    const opts = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT_REF}/functions/deploy`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', (e) => resolve({ status: 0, body: e.message }));
    req.setTimeout(30000, () => { req.destroy(); resolve({ status: 0, body: 'Timeout' }); });
    req.write(body);
    req.end();
  });

  if (deployRes.status >= 200 && deployRes.status < 300) {
    console.log(`   ✅ Función desplegada exitosamente! (HTTP ${deployRes.status})`);
    try {
      const parsed = JSON.parse(deployRes.body);
      if (parsed.id) console.log(`   📍 ID: ${parsed.id}`);
      if (parsed.endpoint_url) console.log(`   🔗 ${parsed.endpoint_url}`);
    } catch {}
  } else {
    console.error(`   ❌ Error: HTTP ${deployRes.status}`);
    console.error(`   ${deployRes.body.slice(0, 1000)}`);
    console.log('\n👉 Usando Dashboard: https://supabase.com/dashboard/project/' + PROJECT_REF + '/edge-functions');
  }

  // Cleanup
  try { rmSync(tmpDir, { recursive: true, force: true }); } catch {}

  console.log('\n✨ Proceso completado!');
}

main().catch(err => {
  console.error('❌ Error fatal:', err.message);
  process.exit(1);
});
