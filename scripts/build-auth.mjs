import {readFileSync,writeFileSync} from 'node:fs';
let key=process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
if(!key){const env=readFileSync('.env.local','utf8');key=env.match(/^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=["']?([^"'\r\n]+)/m)?.[1];}
if(!/^pk_(test|live)_/.test(key||''))throw Error('Missing Clerk public key');
const domain=Buffer.from(key.split('_')[2],'base64').toString().replace(/\$$/,'');
if(!/^[a-z0-9.-]+$/.test(domain))throw Error('Invalid Clerk domain');
writeFileSync('dist/auth-config.mjs',`export const publishableKey=${JSON.stringify(key)};\nexport const domain=${JSON.stringify(domain)};\n`);
for(const file of ['index.html','login.html']){let html=readFileSync('dist/'+file,'utf8');html=html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/,`<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' blob: 'wasm-unsafe-eval' https://${domain} https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://img.clerk.com https://${domain}; connect-src 'self' https://huggingface.co https://*.huggingface.co https://*.hf.co https://${domain} https://clerk-telemetry.com; frame-src https://${domain} https://challenges.cloudflare.com https://*.protect.clerk.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self' https://${domain}">`);writeFileSync('dist/'+file,html);}
console.log('Public authentication configuration generated. Secret keys excluded.');
