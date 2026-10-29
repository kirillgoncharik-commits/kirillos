import envelope from './snapshot.enc.json';
import {openEnvelope,verifyAccess} from './crypto.mjs';
import {validateSnapshot,visibleSnapshot} from './model.mjs';

const headers = {
  'X-Content-Type-Options':'nosniff',
  'Referrer-Policy':'same-origin',
  'X-Frame-Options':'DENY',
  'Permissions-Policy':'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
  'X-Robots-Tag':'noindex, nofollow, noarchive'
};
function json(value,status=200) { return new Response(JSON.stringify(value),{status,headers:{...headers,'Content-Type':'application/json;charset=utf-8','Cache-Control':'private, no-store','Vary':'Cookie, Cf-Access-Jwt-Assertion'}}); }
let cache;
export default {
  async fetch(request,env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/health') return json({ok:true,service:'kirillos',generation:envelope.generation,configured:!!(env.SNAPSHOT_PRIVATE_KEY&&env.ACCESS_TEAM_DOMAIN&&env.ACCESS_AUD&&env.OWNER_EMAIL)});
    if (url.pathname.startsWith('/api/')) {
      if (request.method !== 'GET') return json({error:'Method not allowed'},405);
      if (!(env.SNAPSHOT_PRIVATE_KEY&&env.ACCESS_TEAM_DOMAIN&&env.ACCESS_AUD&&env.OWNER_EMAIL)) return json({error:'Доступ ещё настраивается. Данные проектов защищены.',code:'SETUP_REQUIRED'},503);
      let identity;
      try { identity = await verifyAccess(request.headers.get('Cf-Access-Jwt-Assertion'),{teamDomain:env.ACCESS_TEAM_DOMAIN,audience:env.ACCESS_AUD}); }
      catch { return json({error:'Нужно войти с разрешённым email.',code:'AUTH_REQUIRED'},401); }
      try {
        if (!cache) cache = openEnvelope(envelope,env.SNAPSHOT_PRIVATE_KEY).then(validateSnapshot).catch(e=>{cache=null;throw e;});
        const state = await cache;
        const view = visibleSnapshot(state,identity,env.OWNER_EMAIL);
        if (!view) return json({error:'Этот email не добавлен к проектам.',code:'NO_MEMBERSHIP'},403);
        if (url.pathname === '/api/data') return json(view);
        if (url.pathname === '/api/session') return json(view.viewer);
        return json({error:'Not found'},404);
      } catch { return json({error:'Не удалось прочитать рабочие данные. Последняя версия сохранена.',code:'DATA_UNAVAILABLE'},503); }
    }
    if (!['GET','HEAD'].includes(request.method)) return json({error:'Method not allowed'},405);
    let asset = await env.ASSETS.fetch(request);
    if (asset.status === 404 && !url.pathname.includes('.')) asset = await env.ASSETS.fetch(new URL('/',url));
    const response = new Response(asset.body,asset);
    for (const [key,value] of Object.entries(headers)) response.headers.set(key,value);
    response.headers.set('Cache-Control','no-cache');
    return response;
  }
};
