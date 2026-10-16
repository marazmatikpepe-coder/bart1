// Cloudflare Worker: прокси для ModelScope (обходит CORS, ключ можно хранить на стороне воркера).
// Деплой: dash.cloudflare.com → Workers & Pages → Create → Hello World → вставить этот код → Deploy.
// По желанию: Settings → Variables → Secret MS_KEY = ваш ключ ModelScope (тогда ключ из js/config.js не нужен).
// Затем адрес воркера (https://имя.аккаунт.workers.dev) вставьте в js/config.js → PROXY.
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '86400'
};
export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const u = new URL(req.url);
    // /fetch?u=<url> — скачать готовую картинку (чтобы перезалить на imgbb), только домены ModelScope/Alibaba OSS
    if (u.pathname === '/fetch') {
      const t = new URL(u.searchParams.get('u') || 'about:blank');
      if (!/(^|\.)(modelscope\.cn|aliyuncs\.com)$/.test(t.hostname)) return new Response('forbidden', { status: 403, headers: CORS });
      const r = await fetch(t);
      return new Response(r.body, { status: r.status, headers: { ...CORS, 'Content-Type': r.headers.get('Content-Type') || 'image/png' } });
    }
    const h = new Headers(req.headers);
    ['host', 'origin', 'referer', 'cf-connecting-ip'].forEach(k => h.delete(k));
    if (env.MS_KEY) h.set('Authorization', 'Bearer ' + env.MS_KEY);
    const r = await fetch('https://api-inference.modelscope.cn' + u.pathname + u.search, {
      method: req.method, headers: h, body: req.method === 'GET' ? undefined : req.body
    });
    const rh = new Headers(r.headers);
    Object.entries(CORS).forEach(([k, v]) => rh.set(k, v));
    return new Response(r.body, { status: r.status, headers: rh });
  }
};
