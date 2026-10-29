import {existsSync,readFileSync} from 'node:fs';
for (const path of ['public/index.html','public/app.js','public/styles.css','src/snapshot.enc.json','config/snapshot-public.pem']) if (!existsSync(path)) throw new Error('Missing '+path);
const e=JSON.parse(readFileSync('src/snapshot.enc.json','utf8'));
if (e.format !== 'kirillos-envelope-v1' || !e.ciphertext || !e.wrappedKey) throw new Error('Encrypted data required');
console.log('Build ready: public shell and encrypted snapshot '+e.generation);
