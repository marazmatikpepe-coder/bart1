// Cloudflare Worker: прокси для Groq / OpenRouter / imgbb / ModelScope + картинки через Workers AI (бесплатно, без ключей).
// Деплой: dash.cloudflare.com → Workers & Pages → ваш воркер → Edit code → вставить этот код → Deploy.
// Для запасной генерации картинок (Flux): Settings → Bindings → Add → Workers AI → имя переменной: AI.
// По желанию: Settings → Variables → Secret MS_KEY = ключ ModelScope (тогда ключ из js/config.js не нужен).
const ALLOW = 'Authorization, Content-Type, X-ModelScope-Async-Mode, X-ModelScope-Task-Type';

export default {
  async fetch(req, env) {
    // Важно: Access-Control-Allow-Headers: "*" НЕ покрывает Authorization, поэтому перечисляем явно
    const CORS = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': req.headers.get('Access-Control-Request-Headers') || ALLOW,
      'Access-Control-Max-Age': '86400',
      'Vary': 'Access-Control-Request-Headers'
    };
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    const u = new URL(req.url);
    const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

    // /ai/image — картинка через Workers AI (Flux schnell)
    if (u.pathname === '/ai/image') {
      if (!env.AI) return json({ error: 'Не подключена привязка Workers AI (Bindings → Workers AI → имя AI)' }, 501);
      try {
        const { prompt } = await req.json();
        const r = await env.AI.run('@cf/black-forest-labs/flux-1-schnell', { prompt: String(prompt || '').slice(0, 2000), steps: 6 });
        return json({ image: r.image, type: 'jpeg' });
      } catch (e) { return json({ error: String(e && e.message || e) }, 500); }
    }

    // /ai/edit — правка картинки (img2img, Workers AI): {prompt, image_b64, strength}
    if (u.pathname === '/ai/edit') {
      if (!env.AI) return json({ error: 'Не подключена привязка Workers AI' }, 501);
      try {
        const { prompt, image_b64, strength } = await req.json();
        const out = await env.AI.run('@cf/runwayml/stable-diffusion-v1-5-img2img', {
          prompt: String(prompt || '').slice(0, 1000), image_b64,
          strength: Math.min(1, Math.max(0.1, +strength || 0.6)), guidance: 7.5, num_steps: 20
        });
        const buf = new Uint8Array(await new Response(out).arrayBuffer());
        let bin = ''; for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
        return json({ image: btoa(bin), type: 'png' });
      } catch (e) { return json({ error: String(e && e.message || e) }, 500); }
    }

    // /fetch?u=<url> — скачать готовую картинку (только домены ModelScope / Alibaba OSS / imgbb / pollinations)
    if (u.pathname === '/fetch') {
      let t; try { t = new URL(u.searchParams.get('u') || ''); } catch { return json({ error: 'bad url' }, 400); }
      if (!/(^|\.)(modelscope\.cn|aliyuncs\.com|ibb\.co|pollinations\.ai)$/.test(t.hostname)) return json({ error: 'forbidden' }, 403);
      const r = await fetch(t);
      return new Response(r.body, { status: r.status, headers: { ...CORS, 'Content-Type': r.headers.get('Content-Type') || 'image/png' } });
    }

    // /groq/…, /or/… (OpenRouter), /imgbb/… — прокси к API, закрытым в ряде стран.
    // Запрос уходит с серверов Cloudflare, поэтому VPN пользователю не нужен.
    // Ключи можно хранить здесь (Settings → Variables → Secrets: GROQ_KEY, OR_KEY, IMGBB_KEY, MS_KEY) —
    // тогда в js/config.js их держать не нужно.
    const pm = u.pathname.match(/^\/(groq|or|imgbb)(\/.*)?$/);
    if (pm) {
      const base = { groq: 'https://api.groq.com', or: 'https://openrouter.ai', imgbb: 'https://api.imgbb.com' }[pm[1]];
      const h = new Headers(req.headers);
      ['host', 'origin', 'referer', 'cf-connecting-ip', 'x-forwarded-for'].forEach(k => h.delete(k));
      const secret = { groq: env.GROQ_KEY, or: env.OR_KEY }[pm[1]];
      if (secret) h.set('Authorization', 'Bearer ' + secret);
      let search = u.search;
      if (pm[1] === 'imgbb' && env.IMGBB_KEY && !u.searchParams.get('key')) search = '?key=' + env.IMGBB_KEY;
      const r = await fetch(base + (pm[2] || '/') + search, { method: req.method, headers: h, body: req.method === 'GET' ? undefined : req.body });
      const rh = new Headers(r.headers);
      Object.entries(CORS).forEach(([k, v]) => rh.set(k, v));
      return new Response(r.body, { status: r.status, headers: rh });
    }

    // всё остальное — прозрачный прокси на ModelScope
    const h = new Headers(req.headers);
    ['host', 'origin', 'referer', 'cf-connecting-ip', 'x-forwarded-for'].forEach(k => h.delete(k));
    if (env.MS_KEY) h.set('Authorization', 'Bearer ' + env.MS_KEY);
    const r = await fetch('https://api-inference.modelscope.cn' + u.pathname + u.search, {
      method: req.method, headers: h, body: req.method === 'GET' ? undefined : req.body
    });
    const rh = new Headers(r.headers);
    Object.entries(CORS).forEach(([k, v]) => rh.set(k, v));
    return new Response(r.body, { status: r.status, headers: rh });
  }
};
