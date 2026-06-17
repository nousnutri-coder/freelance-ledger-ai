const https = require('https');
const fs = require('fs');

function req(options, body) {
  return new Promise((resolve, reject) => {
    const r = https.request({...options, headers: { ...options.headers, 'Content-Type': 'application/json' }}, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve({status: res.statusCode, data: JSON.parse(data)}); } catch(e) { resolve({status: res.statusCode, data}); } });
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function main() {
  const key = process.env.SUPABASE_SERVICE_KEY;
  const headers = { 'Authorization': 'Bearer ' + key };

  // Read the function
  const code = fs.readFileSync(__dirname + '/supabase/functions/send-email/index.ts', 'utf-8');

  // Deploy
  const r = await req({
    hostname: 'api.supabase.com',
    path: '/v1/projects/iicdtvhnilhgupckcfrn/functions/deploy',
    method: 'POST',
    headers
  }, JSON.stringify({
    slug: 'send-email',
    name: 'send-email',
    body: code,
    verify_jwt: false
  }));

  console.log('Status:', r.status);
  console.log('Result:', JSON.stringify(r.data, null, 2).slice(0, 2000));
}
main().catch(console.error);
