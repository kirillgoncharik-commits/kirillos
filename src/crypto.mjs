const enc = new TextEncoder();
const dec = new TextDecoder();
export function bytes64(s) {
  const value = s.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(value), c => c.charCodeAt(0));
}
export function pemBytes(pem) {
  return bytes64(pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, ''));
}
export async function openEnvelope(envelope, privateKey) {
  if (envelope?.format !== 'kirillos-envelope-v1' || envelope.algorithm !== 'RSA-OAEP-256+A256GCM') throw new Error('Unsupported envelope');
  const rsa = await crypto.subtle.importKey('pkcs8', pemBytes(privateKey), {name:'RSA-OAEP',hash:'SHA-256'}, false, ['decrypt']);
  const keyBytes = await crypto.subtle.decrypt('RSA-OAEP', rsa, bytes64(envelope.wrappedKey));
  const aes = await crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['decrypt']);
  const raw = await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes64(envelope.iv),additionalData:enc.encode(envelope.generation)}, aes, bytes64(envelope.ciphertext));
  const data = JSON.parse(dec.decode(raw));
  if (data.generation !== envelope.generation) throw new Error('Generation mismatch');
  return data;
}

const jwksCache = new Map();
export async function verifyAccess(token, config, now = Date.now(), fetcher = fetch) {
  if (!config.teamDomain || !config.audience) throw new Error('Identity is not configured');
  const domain = config.teamDomain.replace(/\/$/, '');
  if (!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(domain)) throw new Error('Invalid identity issuer');
  const parts = (token || '').split('.');
  if (parts.length !== 3) throw new Error('Authentication required');
  let header, claims;
  try { header = JSON.parse(dec.decode(bytes64(parts[0]))); claims = JSON.parse(dec.decode(bytes64(parts[1]))); } catch { throw new Error('Invalid identity token'); }
  if (header.alg !== 'RS256' || !header.kid) throw new Error('Unsupported identity signature');
  const t = now/1000;
  if (claims.iss !== domain || !Number.isFinite(claims.exp) || claims.exp <= t || (claims.nbf && claims.nbf > t + 15) || (claims.iat && claims.iat > t + 15)) throw new Error('Expired or invalid identity');
  if (!(Array.isArray(claims.aud) ? claims.aud : [claims.aud]).includes(config.audience)) throw new Error('Invalid audience');
  if (typeof claims.email !== 'string' || !claims.email.includes('@')) throw new Error('Email identity required');
  let cache = jwksCache.get(domain);
  if (!cache || cache.expires < now || !cache.keys.some(k=>k.kid === header.kid)) {
    const res = await fetcher(domain + '/cdn-cgi/access/certs');
    if (!res.ok) throw new Error('Identity keys unavailable');
    const body = await res.json();
    if (!Array.isArray(body.keys)) throw new Error('Identity keys invalid');
    cache = {keys:body.keys,expires:now+300000}; jwksCache.set(domain,cache);
  }
  const jwk = cache.keys.find(k=>k.kid === header.kid && k.kty === 'RSA');
  if (!jwk) throw new Error('Unknown identity key');
  const key = await crypto.subtle.importKey('jwk', jwk, {name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'}, false, ['verify']);
  if (!(await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, bytes64(parts[2]), enc.encode(parts[0] + '.' + parts[1])))) throw new Error('Invalid signature');
  return {email:claims.email.trim().toLowerCase()};
}
