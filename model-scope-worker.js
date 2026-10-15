// Cloudflare Worker proxy for BART. Add secret MODELSCOPE_TOKEN in Worker settings.
// Set the browser's js/config.js CFG.modelApi to this Worker URL. Never commit the token.
const API = 'https://api-inference.modelscope.ai';
const CHAT_MODEL = 'deepseek-ai/DeepSeek-V4.1-Flash';
const IMAGE_MODEL = 'Qwen/Qwen-Image';
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Vary': 'Origin'
};
function json(data, status=200) { return new Response(JSON.stringify(data), {status, headers:{...cors,'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}}); }
export default {
 async fetch(request, env) {
  const url = new URL(request.url);
  if (request.method === 'OPTIONS') return new Response(null,{status:204,headers:cors});
  if (!['POST'].includes(request.method)) return json({error:{message:'POST only'}},405);
  if (!env.MODELSCOPE_TOKEN) return json({error:{message:'Worker secret MODELSCOPE_TOKEN is missing'}},500);
  const headers={'Authorization':`Bearer ${env.MODELSCOPE_TOKEN}`,'Content-Type':'application/json'};
  try {
   const input=await request.json();
   if(url.pathname.endsWith('/chat')) {
    const messages=Array.isArray(input.messages)?input.messages:[];
    if(!messages.length || messages.length>20) return json({error:{message:'Invalid message history'}},400);
    // Enforce content bounds so a runaway conversation cannot send huge requests.
    const safe=messages.map(m=>({role:['system','user','assistant'].includes(m.role)?m.role:'user',content:typeof m.content==='string'?m.content.slice(-9000):Array.isArray(m.content)?m.content.slice(0,5):String(m.content??'')}));
    const upstream=await fetch(`${API}/v1/chat/completions`,{method:'POST',headers,body:JSON.stringify({model:CHAT_MODEL,messages:safe,stream:input.stream!==false,max_tokens:3072,temperature:0.6})});
    if(!upstream.ok) return json({error:{message:(await upstream.text()).slice(0,1200)}},upstream.status);
    const h=new Headers(upstream.headers);for(const [k,v] of Object.entries(cors))h.set(k,v);h.set('Cache-Control','no-store');return new Response(upstream.body,{status:upstream.status,headers:h});
   }
   if(url.pathname.endsWith('/image')) {
    const prompt=String(input.prompt||'').trim();if(!prompt||prompt.length>4000)return json({error:{message:'Prompt is empty or too long'}},400);
    const start=await fetch(`${API}/v1/images/generations`,{method:'POST',headers:{...headers,'X-ModelScope-Async-Mode':'true'},body:JSON.stringify({model:IMAGE_MODEL,prompt})});
    if(!start.ok)return json({error:{message:(await start.text()).slice(0,1200)}},start.status);
    const task=await start.json();if(!task.task_id)return json({error:{message:'ModelScope did not return task_id',details:task}},502);
    // The API is asynchronous. Poll for up to ~4 minutes, with a bounded loop.
    for(let i=0;i<48;i++){
      await new Promise(r=>setTimeout(r,5000));
      const check=await fetch(`${API}/v1/tasks/${encodeURIComponent(task.task_id)}`,{headers:{'Authorization':`Bearer ${env.MODELSCOPE_TOKEN}`,'X-ModelScope-Task-Type':'image_generation'}});
      if(!check.ok)return json({error:{message:`Image task polling failed (${check.status})`}},check.status);
      const state=await check.json();
      if(state.task_status==='SUCCEED'&&state.output_images?.[0])return json({url:state.output_images[0],model:IMAGE_MODEL});
      if(state.task_status==='FAILED')return json({error:{message:'Qwen-Image generation failed',details:state}},502);
    }
    return json({error:{message:'Qwen-Image timed out. Try again later.'}},504);
   }
   return json({error:{message:'Unknown endpoint. Use /chat or /image'}},404);
  } catch(e) { return json({error:{message:e?.message||'Unexpected Worker error'}},500); }
 }
};
