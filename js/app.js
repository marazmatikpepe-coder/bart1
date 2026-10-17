import {CFG,PROXY,OR_KEY} from './config.js';
import {FB} from './firebase-config.js';
const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const K=Object.fromEntries(Object.entries(CFG).map(([k,v])=>[k,atob(v)]));
const P={groq:{url:'https://api.groq.com/openai/v1',key:K.groq,budget:12000,out:2500},ms:{url:(PROXY?PROXY.replace(/\/$/,''):'https://api-inference.modelscope.cn')+'/v1',key:K.ms,budget:80000,out:16384},or:{url:'https://openrouter.ai/api/v1',key:OR_KEY||'',budget:30000,out:6000}};
const MAX=30000,LOGO='https://i.ibb.co/1pCX2Nr/image-Photoroom.png',G='https://www.gstatic.com/firebasejs/10.12.2/';
const sv=(d,f)=>`<svg viewBox="0 0 24 24" fill="${f?'currentColor':'none'}" stroke="${f?'none':'currentColor'}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
const SV={menu:sv('M4 6h16M4 12h16M4 18h16'),plus:sv('M12 5v14M5 12h14'),send:sv('M12 19V5M5 12l7-7 7 7'),attachFile:sv('M21 11.5l-8.6 8.6a5.5 5.5 0 0 1-7.8-7.8l8.6-8.6a3.7 3.7 0 0 1 5.2 5.2l-8.6 8.6a1.8 1.8 0 0 1-2.6-2.6l8-8'),close:sv('M6 6l12 12M18 6L6 18'),camera:sv('M4 8h3l2-3h6l2 3h3v11H4zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z'),delete:sv('M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3'),search:sv('M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5'),copyIcon:sv('M9 9h11v11H9zM5 15V4h11'),download:sv('M12 4v11M7 11l5 5 5-5M5 20h14'),stop:sv('M7 7h10v10H7z',1),logout:sv('M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10'),mic:sv('M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3'),theme:sv('M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z'),eye:sv('M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'),edit:sv('M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4'),eyeOff:sv('M3 3l18 18M10.6 6.2A9.8 9.8 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.2 3.9M6.6 7.6A16.6 16.6 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 4-.9M9.9 9.9a3 3 0 0 0 4.2 4.2')};
/* реальная высота видимой области (клавиатура на телефоне не обрезает интерфейс) */
const vv=window.visualViewport,setVh=()=>{document.documentElement.style.setProperty('--vh',(vv?vv.height:innerHeight)+'px');if(vv&&vv.offsetTop)scrollTo(0,0)};
setVh();vv?.addEventListener('resize',setVh);vv?.addEventListener('scroll',setVh);addEventListener('resize',setVh);addEventListener('orientationchange',()=>setTimeout(setVh,200));
const ic=n=>`<i class="ic" data-i="${n}"></i>`; // сначала встроенная SVG-иконка; если есть assets/icons/<имя>.png (ваши иконки) — подменяется ею
const ICON_NAMES=new Set(['menu','plus','send','attachFile','close','camera','delete','search','copyIcon','download','mic','eye']);
const iconsOn=new Promise(r=>{const i=new Image();i.onload=()=>r(1);i.onerror=()=>r(0);i.src='assets/icons/menu.png'}); // нет папки с иконками — больше не запрашиваем
const hyd=r=>$$('i[data-i]:not([data-h])',r).forEach(e=>{e.dataset.h=1;const n=e.dataset.i;e.innerHTML=SV[n]||'';if(!ICON_NAMES.has(n))return;iconsOn.then(ok=>{if(!ok)return;const im=new Image();im.onload=()=>e.replaceChildren(im);im.src=`assets/icons/${n}.png`})});
new MutationObserver(()=>hyd(document)).observe(document.body,{childList:true,subtree:true});
$$('[data-ic]').forEach(e=>e.innerHTML=ic(e.dataset.ic));
const loaded={};const lib=u=>loaded[u]??=new Promise((r,j)=>{const s=document.createElement('script');s.src=u;s.onload=r;s.onerror=()=>j(new Error('не загрузилась библиотека'));document.head.append(s)});
const CDN='https://cdnjs.cloudflare.com/ajax/libs/';

/* ---------- markdown ---------- */
const FILES=new Map(),FC={html:['h','HTML'],htm:['h','HTML'],svg:['h','SVG'],pdf:['p','PDF'],zip:['z','ZIP'],docx:['d','DOCX'],xlsx:['x','XLSX'],csv:['x','CSV'],pptx:['o','PPTX'],json:['j','JSON'],py:['c','PY'],js:['c','JS'],css:['c','CSS'],md:['c','MD'],txt:['c','TXT']};
let NS='x',CNT=0;
const pl=(n,a)=>n+' '+a[n%10==1&&n%100!=11?0:n%10>=2&&n%10<=4&&(n%100<10||n%100>=20)?1:2];
const fileCard=(id,name,text,info)=>{const ext=(name.split('.').pop()||'').toLowerCase(),[k,lb]=FC[ext]||['c',ext.slice(0,4).toUpperCase()||'FILE'];
 return `<div class="fc" data-fid="${esc(id)}"><span class="fi ${k}">${esc(lb)}</span><span class="fn"><b>${esc(name)}</b><small>${esc(info||(text==null?'':pl(text.split('\n').length,['строка','строки','строк'])+' · '+fmt(text.length)))}</small></span><span class="fbt"><button data-a="fopen">Открыть</button><button data-a="fdl">${ic('download')} Скачать</button></span></div>`};
marked.use({renderer:{code(c,l){const [lang='',fn='']=(l||'').trim().split(/\s+/);
 if(fn||c.split('\n').length>60){const e2=fn&&fn.includes('.')?fn.split('.').pop().toLowerCase():(EXT[lang]||lang||'txt'),name=fn||`${lang=='html'?'index':'code'}${CNT?'-'+CNT:''}.${e2}`,id=`${NS}.${CNT++}`;FILES.set(id,{name,lang,text:c});return fileCard(id,name,c)}
 const v=lang&&c.length<20000&&hljs.getLanguage(lang)?hljs.highlight(c,{language:lang}).value:esc(c);
 return `<div class="code"><div class="ch"><span>${esc(lang||'code')}</span><span><button data-a="copy">${ic('copyIcon')} Копировать</button><button data-a="dl" data-l="${esc(lang)}" data-n="">${ic('download')} Скачать</button>${/html|svg/.test(lang)?'<button data-a="run">▶ Запуск</button>':''}</span></div><pre><code class="hljs">${v}</code></pre></div>`}}});
const clean=t=>(t||'').replace(/<think>[\s\S]*?(<\/think>|$)/g,'');
const namedFiles=t=>[...clean(t).matchAll(/```[^\S\n]*\w[\w+#.-]*[^\S\n]+([^\s`]+)[^\n]*\n([\s\S]*?)```/g)].map(m=>[m[1].replace(/^[\/\\]+/,''),m[2]]).filter(x=>/[./]/.test(x[0]));
const dlBlob=(b,n)=>{const x=document.createElement('a');x.href=URL.createObjectURL(b);x.download=n;x.click();setTimeout(()=>URL.revokeObjectURL(x.href),5000)};
const md=(t,ns='x')=>{NS=ns;CNT=0;try{return DOMPurify.sanitize(marked.parse(clean(t)),{ADD_ATTR:['data-a','data-l','data-n','data-i','data-fid']})}catch(e){console.error(e);return '<pre>'+esc(t)+'</pre>'}};
const mdc=new Map(),mdm=(t,ns)=>{const k=ns+'\0'+t;if(!mdc.has(k)){if(mdc.size>60)mdc.delete(mdc.keys().next().value);mdc.set(k,md(t,ns))}return mdc.get(k)};
const EXT={javascript:'js',js:'js',python:'py',html:'html',css:'css',json:'json',typescript:'ts',bash:'sh',sql:'sql',java:'java',cpp:'cpp',csharp:'cs',markdown:'md',svg:'svg'};

/* ---------- state + storage (Firestore или localStorage) ---------- */
const S={chat:null,files:[],busy:false};let uid='local',fs=null,fb={},CH=[],unl=null,unw=null,ctl=null;
const DATA=new WeakMap();
const L=()=>JSON.parse(localStorage.bart_chats||'{}');
/* документ чата в Firestore ≤1 МБ: тексты файлов сохраняем сокращённо, при необходимости чистим самые старые */
function compact(c){c=JSON.parse(JSON.stringify(c));const sz=()=>new TextEncoder().encode(JSON.stringify(c)).length;
 c.msgs.forEach(m=>{if(m.img&&m.img.startsWith('data:'))m.img=null});c.msgs.forEach(m=>(m.a||[]).forEach(a=>{if(a.x&&a.x.length>3000)a.x=a.x.slice(0,3000)+'\n…[сохранено сокращённо]'}));
 for(let i=0;sz()>850000&&i<c.msgs.length;i++){(c.msgs[i].a||[]).forEach(a=>a.x=null);if(c.msgs[i].t.length>1500)c.msgs[i].t=c.msgs[i].t.slice(0,1500)+'…'}return c}
const db={
 list(cb){if(fs)return fs.onSnapshot(fs.query(fs.collection(fs.db,'users',uid,'chats'),fs.orderBy('updated','desc')),s=>cb(s.docs.map(d=>d.data())));
  db.cb=()=>cb(Object.values(L()).sort((a,b)=>b.updated-a.updated));db.cb();return()=>{}},
 async save(c){c=compact(c);if(fs)await fs.setDoc(fs.doc(fs.db,'users',uid,'chats',c.id),c);else{const l=L();l[c.id]=c;localStorage.bart_chats=JSON.stringify(l);db.cb?.()}},
 async del(id){if(fs)await fs.deleteDoc(fs.doc(fs.db,'users',uid,'chats',id));else{const l=L();delete l[id];localStorage.bart_chats=JSON.stringify(l);db.cb?.()}},
 watch(id,cb){return fs?fs.onSnapshot(fs.doc(fs.db,'users',uid,'chats',id),s=>s.exists()&&cb(s.data())):()=>{}}
};
const uuid=()=>crypto.randomUUID?crypto.randomUUID():'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c=='x'?r:r&3|8).toString(16)});
const newChat=()=>({id:uuid(),title:'Новый чат',updated:Date.now(),msgs:[]});
function follow(c){unw?.();unw=db.watch(c.id,d=>{if(!S.busy&&S.chat?.id==d.id&&d.updated>S.chat.updated){S.chat=d;renderMsgs()}})}

/* ---------- AI: роутер моделей (Groq + ModelScope) ---------- */
const mc={},dead=new Set(),cool={},deadP=new Set();let msWhy=''; // deadP — провайдеры, отвечающие 401/403 (не тратим на них запросы)
const ml=p=>mc[p]??=!P[p].key?Promise.resolve([]):fetch(P[p].url+'/models',{headers:{Authorization:'Bearer '+P[p].key}}).then(r=>r.json()).then(j=>(j.data||[]).map(x=>x.id).filter(i=>!/whisper|guard|orpheus|tts|embed|safeguard|playai|compound/i.test(i)&&(p!='or'||/:free$/.test(i)))).catch(()=>[]);
const sleep=(ms,sig)=>new Promise((r,j)=>{const t=setTimeout(r,ms);sig?.addEventListener('abort',()=>{clearTimeout(t);j(new DOMException('','AbortError'))})});
const vnum=m=>+(m.match(/v(\d+(?:\.\d+)?)/i)?.[1]||0),qver=m=>+(m.match(/qwen(\d+(?:\.\d+)?)/i)?.[1]||0);
async function chain(kind,prefMs){
 const [g,s,orl]=await Promise.all([ml('groq'),ml('ms'),ml('or')]),o=[],vis=/qwen.*27b|vl|vision|maverick/i,hasMs=!!P.ms.key;
 if(kind=='vision'){
  g.filter(m=>vis.test(m)).sort((a,b)=>qver(b)-qver(a)).forEach(m=>o.push(['groq',m]));o.push(['groq','qwen/qwen3.8-27b'],['groq','qwen/qwen3.6-27b']);
  if(hasMs){const v=s.filter(m=>/qwen.*vl/i.test(m)).sort((a,b)=>qver(b)-qver(a)).slice(0,2);(v.length?v:['Qwen/Qwen3-VL-235B-A22B-Instruct']).forEach(m=>o.push(['ms',m]))}}
 else{
  const t=g.filter(m=>!/vl|vision|maverick/i.test(m)),gq=[];
  for(const re of kind=='code'?[/gpt-oss-120b/i,/coder/i,/qwen.*27b|qwen3-32b/i,/llama-3\.3-70b/i]:[/gpt-oss-120b/i,/llama-3\.3-70b/i,/qwen.*27b|qwen3-32b/i])t.filter(m=>re.test(m)).slice(0,1).forEach(m=>gq.push(['groq',m]));
  gq.push(['groq','openai/gpt-oss-120b'],['groq','llama-3.3-70b-versatile']);
  /* DeepSeek на ModelScope: берём самую новую версию из списка (V4 → V3.2 → …) */
  const ds=s.filter(m=>/^deepseek-ai\/deepseek-v\d/i.test(m)&&!/distill/i.test(m)).sort((a,b)=>vnum(b)-vnum(a)).slice(0,2),
   mq=hasMs?(ds.length?ds:['deepseek-ai/DeepSeek-V4','deepseek-ai/DeepSeek-V3.2']).map(m=>['ms',m]):[];
  /* OpenRouter (бесплатные :free модели, если задан OR_KEY) */
  const orq=[];for(const re of [/deepseek/i,/qwen.*coder/i,/gpt-oss-120b/i,/llama-3\.3-70b/i,/qwen3.*(235|80|32)b/i])orl.filter(m=>re.test(m)&&!/vl|vision/i.test(m)).slice(0,1).forEach(m=>orq.push(['or',m]));
  const hardQ=kind=='code'||prefMs,orDs=orq.filter(x=>/deepseek/i.test(x[1])),orRest=orq.filter(x=>!/deepseek/i.test(x[1]));
  o.push(...(hardQ?[...mq,...orDs,...gq,...orRest]:[...gq,...mq,...orq]))}
 const seen=new Set();return o.filter(([p,m])=>!deadP.has(p)&&!/scout/i.test(m)&&!dead.has(m)&&!seen.has(p+m)&&seen.add(p+m))}
let CUT=false,LAST=null; // CUT — ответ оборван лимитом длины; LAST — модель, давшая ответ
async function stream(p,model,messages,onD,sig,k=1){
 CUT=false;const c=P[p],body={model,messages,stream:true,temperature:.6,max_tokens:Math.floor(c.out*k)};if(p=='groq'&&/gpt-oss/.test(model))body.reasoning_effort='medium';
 const r=await fetch(c.url+'/chat/completions',{method:'POST',signal:sig,headers:{'Content-Type':'application/json',Authorization:'Bearer '+c.key,...(p=='or'?{'HTTP-Referer':location.origin,'X-Title':'Bart'}:{})},body:JSON.stringify(body)});
 if(!r.ok){const tx=await r.text(),w=tx.match(/try again in ([\d.]+)\s*(ms|s|m)\b/i),e=new Error(r.status+': '+tx.slice(0,200));e.status=r.status;e.body=tx;const lr=tx.match(/Limit (\d+), Requested (\d+)/i);if(lr){e.lim=+lr[1];e.req=+lr[2]};
  e.wait=(+r.headers.get('retry-after')||0)*1000||(w?+w[1]*({ms:1,s:1000,m:60000}[w[2]]):0);throw e}
 const rd=r.body.getReader(),dec=new TextDecoder();let buf='',got=false;
 for(;;){const {done,value}=await rd.read();if(done)break;buf+=dec.decode(value,{stream:true});const ls=buf.split('\n');buf=ls.pop();
  for(const l of ls){if(!l.startsWith('data:')||l.includes('[DONE]'))continue;try{const j=JSON.parse(l.slice(5)).choices?.[0],d=j?.delta?.content;if(j?.finish_reason=='length')CUT=true;if(d){got=true;onD(d)}}catch{}}}
 return got}
const WHY={429:'лимит запросов',404:'модель недоступна',413:'слишком длинный запрос',401:'ключ не принят',403:'доступ запрещён',400:'запрос отклонён'};
/* ограничитель частоты запросов: не чаще одного запроса к провайдеру за GAP мс (бесплатные тарифы: Groq ≈30/мин) */
const GAP={groq:2200,ms:1200,or:3200},nextAt={groq:0,ms:0,or:0};
async function gate(p,sig){const now=Date.now(),at=Math.max(now,nextAt[p]);nextAt[p]=at+GAP[p];if(at>now)await sleep(at-now,sig)}
/* mk(провайдер, k) → сообщения (k<1 — сжатый запрос); rs() — сброс частично пришедшего ответа перед новой моделью */
async function tryChain(list,mk,onD,sig,label,rs=()=>{}){const errs=[];
 for(const [p,m] of list){const nm=m.split('/').pop();if(deadP.has(p))continue;
  if((cool[m]||0)>Date.now()){errs.push({t:nm+': пауза после лимита',st:429});continue}
  for(let a=0,k=1;a<2;a++){
   try{label('Bart-beta',m);rs();await gate(p,sig);if(await stream(p,m,mk(p,k),onD,sig,k)){LAST=[p,m];return}errs.push({t:nm+': пустой ответ'});break}
   catch(e){if(e.name=='AbortError')throw e;const st=e.status||0;console.warn('model failed',m,e.message);
    const fit=e.lim&&e.req?Math.max(.3,e.lim/e.req*.8):.5; // во сколько раз ужать запрос, чтобы влез в лимит токенов
    if(st==429){if(a==0&&e.wait&&e.wait<=8000){await sleep(e.wait+250,sig);if(e.req>e.lim)k=fit;continue}cool[m]=Date.now()+Math.max(e.wait||0,20000)}
    else if(st==404)dead.add(m);
    else if(st==401||st==403)deadP.add(p);
    else if((st==413||st==400)&&a==0&&/too large|context|token|length|limit|max_tokens/i.test(e.body||'')){k=fit;continue}
    errs.push({t:nm+': '+(WHY[st]||(st?'ошибка '+st:'нет связи'))+(st?' ('+st+')':''),st});break}}}
 const has=n=>errs.some(e=>e.st==n);
 throw new Error('Bart-beta сейчас не смог ответить — '+errs.map(e=>e.t).join('; ')+'. '+(has(413)||has(400)?'Запрос слишком велик для моделей даже после сокращения — начните новый чат или прикрепите меньше текста.':has(429)?'Это временный лимит у провайдера моделей: подождите около минуты и повторите.':'Попробуйте ещё раз; подробности в консоли (F12). Кнопка 🔧 в меню проверит модели и прокси.'))}
const IMG_RE=/нарису|сгенерир\w*\s+(?:\S+\s+)?(?:картин|изображ|фот|арт|логотип|иллюстр)|созда\w+\s+(?:\S+\s+)?(?:картин|изображ|арт|логотип|иллюстр)|нарисов|(?:generate|create|draw)\s+(?:an?\s+)?(?:image|picture|logo|art)|\bdraw\b/i;
/* генерация картинок: ModelScope Qwen-Image (асинхронная задача), запасной вариант — Pollinations */
async function msImage(prompt,sig){
 const h={Authorization:'Bearer '+P.ms.key,'Content-Type':'application/json'};
 const r=await fetch(P.ms.url+'/images/generations',{method:'POST',signal:sig,headers:{...h,'X-ModelScope-Async-Mode':'true'},body:JSON.stringify({model:'Qwen/Qwen-Image',prompt,size:'1024x1024'})});
 if(!r.ok)throw new Error('ModelScope '+r.status+': '+(await r.text()).slice(0,140));
 const id=(await r.json()).task_id;if(!id)throw new Error('нет task_id');
 for(let i=0;i<60;i++){await sleep(2000,sig);const t=await(await fetch(P.ms.url+'/tasks/'+id,{signal:sig,headers:{...h,'X-ModelScope-Task-Type':'image_generation'}})).json();
  if(t.task_status=='SUCCEED'&&t.output_images?.[0])return t.output_images[0];if(t.task_status=='FAILED')throw new Error(t.errors?.message||'генерация не удалась')}
 throw new Error('генерация заняла слишком много времени')}
async function draw(am,t,sig){
 am.m='Bart-beta';live(am);let p='';
 try{await tryChain(await chain('text'),()=>[{role:'system',content:'Convert the user request into one detailed English prompt for an image generator (subject, style, lighting, composition). If the image must contain written text, keep that text verbatim in quotes. Output only the prompt text.'},{role:'user',content:t}],d=>p+=d,sig,()=>{},()=>{p=''});p=clean(p).trim()}catch(e){if(e.name=='AbortError')throw e}
 p=p||t;am.pr=p;let u=null,why='';
 if(P.ms.key&&!deadP.has('ms'))try{u=await msImage(p,sig)}catch(e){if(e.name=='AbortError')throw e;console.warn('ModelScope image failed',e);if(/ 40[13]:/.test(e.message)){deadP.add('ms');msWhy='ModelScope просит привязать аккаунт Alibaba Cloud (см. README)'}why=deadP.has('ms')?msWhy:e instanceof TypeError?(await fetch(P.ms.url+'/models',{mode:'no-cors',signal:sig}).then(()=>'ModelScope виден, но браузер блокирует ответ (CORS) — нужен прокси, см. README',()=>'ModelScope не открывается из вашей сети — попробуйте VPN или прокси, см. README')):e.message}
 else why=deadP.has('ms')?msWhy:'ключ ModelScope не задан';
 let fl='';
 if(!u&&PROXY)try{const r=await fetch(PROXY.replace(/\/$/,'')+'/ai/image',{method:'POST',signal:sig,body:JSON.stringify({prompt:p})});
  if(!r.ok)throw new Error((await r.text()).slice(0,120));const j=await r.json();if(!j.image)throw new Error('пустой ответ');u='data:image/'+(j.type||'jpeg')+';base64,'+j.image;fl='Flux (Cloudflare)'}
  catch(e){if(e.name=='AbortError')throw e;why+=' · Workers AI: '+e.message}
 if(u){am.img=u;am.t=(fl?'Промпт для генератора:\n\n> '+p+'\n\n⚠️ Qwen-Image сейчас недоступен: '+why+'. Нарисовал запасной генератор: '+fl+'.':'Готово, сэр. Промпт для генератора:\n\n> '+p);
  try{const src=u.startsWith('data:')||!PROXY?u:PROXY.replace(/\/$/,'')+'/fetch?u='+encodeURIComponent(u);am.img=await up(await(await fetch(src)).blob())}catch{}return}
 /* запасной вариант: Pollinations (бесплатно 1 картинка в ~45 секунд, при превышении отдаёт картинку-заглушку) */
 const x=`https://image.pollinations.ai/prompt/${encodeURIComponent(p.slice(0,900))}?width=1024&height=1024&model=flux&nologo=true&seed=${Math.floor(Math.random()*1e6)}`;
 if(!await new Promise(r=>{const im=new Image();im.onload=()=>r(1);im.onerror=()=>r(0);im.src=x}))throw new Error('Qwen-Image не ответил ('+why+'), запасной генератор тоже.');
 am.img=x;am.t='Промпт для генератора:\n\n> '+p+'\n\n⚠️ Qwen-Image сейчас недоступен: '+why+'. Рисовал запасной генератор (лимит — 1 картинка в 45 секунд; если вместо рисунка видите «Free limit reached», повторите позже).'}
/* ---------- редактирование картинки (✎): фото + «что изменить» ---------- */
async function imgToData(url){let b;try{b=await(await fetch(url)).blob()}catch{if(!PROXY)throw new Error('не удалось загрузить картинку');b=await(await fetch(PROXY.replace(/\/$/,'')+'/fetch?u='+encodeURIComponent(url))).blob()}
 return new Promise(r=>{const d=new FileReader();d.onload=()=>r(d.result);d.readAsDataURL(b)})}
const fitData=(url,max=768)=>new Promise((res,rej)=>{const im=new Image();im.onload=()=>{const k=Math.min(1,max/Math.max(im.width,im.height)),w=Math.max(64,Math.round(im.width*k/8)*8),h=Math.max(64,Math.round(im.height*k/8)*8),c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(im,0,0,w,h);res(c.toDataURL('image/jpeg',.92))};im.onerror=()=>rej(new Error('не удалось открыть картинку'));im.src=url});
async function editFrom(i){const m=S.chat?.msgs[i];if(!m?.img)return;
 try{toast('Подготавливаю фото…');const data=await imgToData(m.img);$('#toast').hidden=true;
  S.files=S.files.filter(f=>f.k!='img');S.files.push({n:'image.jpg',k:'img',s:0,ok:true,data,url:m.img,urlP:m.img,prompt:m.pr||''});S.edit=true;chips();$('#inp').focus()}
 catch(e){toast('Не удалось взять картинку: '+e.message)}}
async function cfImg(path,body,sig){const r=await fetch(PROXY.replace(/\/$/,'')+path,{method:'POST',signal:sig,body:JSON.stringify(body)}),j=await r.json().catch(()=>({}));
 if(!r.ok||!j.image)throw new Error(j.error||('Workers AI '+r.status));return 'data:image/'+(j.type||'jpeg')+';base64,'+j.image}
async function editImg(am,last,sig){
 am.m='Bart-beta';live(am);const a=(last.a||[]).find(x=>x.k=='img'),req=last.t||'Улучши качество изображения';
 const dataUrl=DATA.get(a)||await imgToData(a.u);let base=a.pr||'';
 if(!base){try{await tryChain(await chain('vision'),()=>[{role:'user',content:[{type:'text',text:'Describe this image as one detailed English prompt for an image generator (subject, style, lighting, composition, colors). Output only the prompt.'},{type:'image_url',image_url:{url:dataUrl}}]}],d=>base+=d,sig,()=>{},()=>{base=''});base=clean(base).trim()}catch(e){if(e.name=='AbortError')throw e}}
 let np='';
 try{await tryChain(await chain('text'),()=>[{role:'system',content:'You edit image-generation prompts. Given the ORIGINAL prompt and the user EDIT request (may be in Russian), output ONE English prompt describing the final image: keep everything from the original that the edit does not change, and apply the edit. Output only the prompt.'},{role:'user',content:'ORIGINAL: '+(base||'(unknown)')+'\nEDIT: '+req}],d=>np+=d,sig,()=>{},()=>{np=''});np=clean(np).trim()}catch(e){if(e.name=='AbortError')throw e}
 np=np||((base?base+', ':'')+req);
 let u=null,how='',why='';
 if(PROXY){
  try{u=await cfImg('/ai/edit',{prompt:np,image_b64:(await fitData(dataUrl)).split(',')[1],strength:.6},sig);how='edit'}catch(e){if(e.name=='AbortError')throw e;why=e.message}
  if(!u)try{u=await cfImg('/ai/image',{prompt:np},sig);how='regen'}catch(e){if(e.name=='AbortError')throw e;why+=' · '+e.message}}
 if(!u)throw new Error('Не удалось отредактировать фото: '+(why||'прокси не задан (PROXY в js/config.js)'));
 am.img=u;am.pr=np;am.t='Готово, сэр. Применил правку: «'+req+'».'+(how=='regen'?'\n\n⚠️ Прямое редактирование сейчас недоступно ('+why+'), поэтому я перерисовал картинку заново по обновлённому описанию — детали могут отличаться от оригинала.':'');
 try{am.img=await up(await(await fetch(u)).blob())}catch{}}
const REASON_RE=/почему|докаж|реши|задач|алгоритм|анализ|сравни|рассужд|логик|математ|вычисл|оптимиз|архитектур|refactor|debug|prove|solve/i;
const CODE_RE=/zip|архив|проект|сайт|код|скрипт|функци|баг|ошибк|програм|python|javascript|html|css|sql|react|json|```|api\b|class\b|def\b|верстк/i,CODE_EXT=/\.(py|js|ts|jsx|tsx|html|css|json|java|c|cpp|cs|go|rs|php|sql|sh|yml|yaml)$/i;
const SYS='Ты — Bart-beta (Барт), универсальный ИИ-ассистент. Никогда не называй модели, компании и сервисы, на которых ты основан; если спросят — ты Bart-beta. Обращайся к пользователю «сэр». Отвечай на языке пользователя (по умолчанию по-русски), по делу, в Markdown. Код — только в блоках ``` с указанием языка. Когда просят создать файлы, проект или ZIP-архив, выдавай каждый файл отдельным блоком, где после языка стоит имя файла или путь, например: ```python app.py или ```html site/index.html. Сайт сам соберёт из них ZIP-кнопкой под ответом, поэтому не говори, что не можешь создавать архивы. Прикреплённые пользователем файлы (PDF, Word, Excel, PowerPoint, ZIP, код и др.) ты видишь как текст в сообщении. ФАЙЛЫ: любой файл (страницу, документ, таблицу, презентацию, скрипт) выдавай блоком ``` с языком и ИМЕНЕМ файла, например ```html index.html — сайт покажет его красивой карточкой «Открыть / Скачать», поэтому не пересказывай содержимое файла в тексте: одна-две строки до или после. Форматы: html, svg, css, js, py, json, csv, md, txt, xml, yaml и другие текстовые; pdf (внутри Markdown или HTML документа), docx (Markdown-подобный текст: # заголовки, - списки), xlsx (внутри CSV), pptx (слайды разделены строкой ---, первая строка слайда — заголовок, дальше пункты через -); несколько именованных блоков в одном ответе сайт соберёт в ZIP. Если просят точный объём (например 2000 строк) — пиши полностью, без заглушек и сокращений вроде «остальное аналогично».';
/* история под бюджет символов провайдера: свежее — полностью, старое — сокращённо, самое старое — отбрасывается */
function build(hist,budget){
 const n=hist.length,li=hist.map(m=>m.a?.some(a=>a.k=='img')).lastIndexOf(true),cap=(t,k)=>t.length>k?t.slice(0,k)+'\n…[сокращено]':t;
 const items=hist.slice(-8).map((m,j,arr)=>{const i=n-arr.length+j,last=i==n-1;
  if(m.r!='user')return {role:'assistant',content:cap(clean(m.t),last?budget:i==n-2?Math.floor(budget*.5):2000)||'…'};
  const fs_=(m.a||[]).filter(a=>a.x);
  let t=(m.t||'')+fs_.map(a=>`\n\n[Файл: ${a.n}]\n`+(last?cap(a.x,Math.floor(budget*.7/fs_.length)):n-i<=3?cap(a.x,1500):'[содержимое опущено — файл был выше в чате]')).join('');
  t=cap(t,last?budget:3000);const im=(m.a||[]).filter(a=>a.k=='img');
  if(i==li&&li==n-1&&im.length)return {role:'user',content:[{type:'text',text:t||'Опиши изображение.'},...im.slice(0,4).map(a=>({type:'image_url',image_url:{url:DATA.get(a)||a.u}}))]};
  return {role:'user',content:t+im.map(a=>`\n[изображение: ${a.n}]`).join('')||'…'}});
 const len=m=>typeof m.content=='string'?m.content.length:(m.content[0].text||'').length+800;
 let tot=0,k=items.length;while(k>0&&(tot+=len(items[k-1]))<=budget)k--;if(k==items.length)k=items.length-1;
 let kept=items.slice(k);while(kept.length>1&&kept[0].role!='user')kept.shift();
 return [{role:'system',content:SYS},...kept]}
async function run(c,am){
 const hist=c.msgs.slice(0,-1),last=hist[hist.length-1],att=last.a||[];
 if(last.e)return editImg(am,last,ctl.signal);
 if(IMG_RE.test(last.t||'')&&!att.some(a=>a.k=='img'))return draw(am,last.t,ctl.signal);
 const img=att.some(a=>a.k=='img'),code=CODE_RE.test(last.t||'')||att.some(a=>a.k=='file'&&CODE_EXT.test(a.n)),big=att.some(a=>a.x&&a.x.length>5000);
 const hard=REASON_RE.test(last.t||'')||att.some(a=>a.x&&a.x.length>8000),lab=(x,mdl)=>{am.m=(am.pre?am.pre+' → ':'')+x;if(mdl)am.via=mdl.split('/').pop();live(am)};let desc=null;
 const mk=(p,k=1)=>{const ms=build(hist,P[p].budget*k);return desc==null?ms:ms.map(m=>Array.isArray(m.content)?{role:'user',content:m.content[0].text+'\n\n[Описание изображений от vision-модели]\n'+desc}:m)};
 const long=/\d{3,}\s*строк|\d{4,}\s*слов|полн\w+\s+(сайт|код|проект)/i.test(last.t||'');
 const go=async k=>{await tryChain(await chain(k,big||long),mk,d=>put(am,d),ctl.signal,lab);
  /* ответ упёрся в лимит длины — просим продолжить с места обрыва (до 6 раз) */
  for(let i=0;i<6&&CUT&&LAST;i++){const [p,m]=LAST,tail=(am.t+(QU.get(am)||'')).slice(-Math.floor(P[p].budget*.5));
   await tryChain([[p,m]],(pp,a)=>[...mk(pp,a),{role:'assistant',content:tail},{role:'user',content:'Ответ оборвался из-за лимита длины. Продолжи ровно с места обрыва: не повторяй написанное, не начинай новый блок кода и не пиши пояснений — только следующие символы.'}],d=>put(am,d),ctl.signal,lab)}};
 if(img&&(code||att.some(a=>a.x))){ // два шага: vision «видит», потом код/рассуждение отвечает
  desc='';const vmk=()=>[{role:'user',content:[{type:'text',text:'Подробно опиши изображение, дословно перепиши весь видимый текст и код.'},...build(hist,9000).slice(-1)[0].content.filter(x=>x.type=='image_url')]}];
  await tryChain(await chain('vision'),vmk,d=>desc+=d,ctl.signal,lab,()=>{desc=''});am.pre=am.m;
  return go(code||hard?'code':'text')}
 return go(img?'vision':code||hard?'code':'text')}

/* ---------- UI: чат ---------- */
function renderList(list){CH=list;const q=$('#q').value.toLowerCase();
 $('#list').innerHTML=list.filter(c=>c.title.toLowerCase().includes(q)).map(c=>`<div class="ci ${S.chat?.id==c.id?'on':''}" data-id="${c.id}"><span>${esc(c.title)}</span><button data-del="${c.id}">${ic('delete')}</button></div>`).join('')}
/* ---------- альбом вложений (мозаика как в мессенджерах) ---------- */
// s — ширина ячейки в 6-колоночной сетке (или [колонки,строки]); r — высоты строк; ar — пропорции альбома
const LAY=[0,{s:[6]},
 {s:[3,3],r:'1fr',ar:'1.25/1'},
 {s:[[4,2],2,2],r:'1fr 1fr',ar:'1/1'},
 {s:[[4,3],2,2,2],r:'1fr 1fr 1fr',ar:'1/1'},
 {s:[3,3,2,2,2],r:'1.45fr 1fr',ar:'1/.93'},
 {s:[2,2,2,2,2,2],r:'1fr 1fr',ar:'3/2'},
 {s:[6,2,2,2,2,2,2],r:'1.95fr 1fr 1fr',ar:'1/1.32'},
 {s:[3,3,2,2,2,2,2,2],r:'1.5fr 1fr 1fr',ar:'1/1.17'},
 {s:[2,2,2,2,2,2,2,2,2],r:'1fr 1fr 1fr',ar:'1/1'},
 {s:[6,2,2,2,2,2,2,2,2,2],r:'1.5fr 1fr 1fr 1fr',ar:'1/1.5'}];
const imgSrc=a=>a.u||DATA.get(a)||'';
const fmt=n=>n<1024?n+' Б':n<1048576?Math.round(n/1024)+' КБ':(n/1048576).toFixed(1)+' МБ';
function albumHTML(imgs,mi){let o='';
 for(let i=0;i<imgs.length;i+=10){const g=imgs.slice(i,i+10),L=LAY[g.length],one=g.length==1;
  o+=`<div class="alb${one?' one':''}"${one?'':` style="grid-template-rows:${L.r};aspect-ratio:${L.ar}"`}>`+g.map((a,j)=>{const sp=L.s[j],[c,r]=Array.isArray(sp)?sp:[sp,1];
   return `<button class="ph" data-lb="${mi}" data-j="${i+j}" style="grid-column:span ${c};grid-row:span ${r}"><img src="${esc(imgSrc(a))}" alt="" loading="lazy" draggable="false"></button>`}).join('')+'</div>'}
 return o}
const fileRow=a=>{const im=a.k=='img',inner=`${im?`<img class="fx th2" src="${esc(imgSrc(a))}" alt="">`:`<span class="fx">${esc((a.n.split('.').pop()||'file').slice(0,4).toUpperCase())}</span>`}<span class="fi2"><b>${esc(a.n)}</b><small>${a.s?fmt(a.s):'файл'}</small></span>`;
 return im&&a.u?`<a class="fr" href="${esc(a.u)}" target="_blank" rel="noopener">${inner}</a>`:`<div class="fr">${inner}</div>`};
function userMsg(m,i){const im=(m.a||[]).filter(a=>a.k=='img'&&!a.f),fl=(m.a||[]).filter(a=>a.k!='img'||a.f);
 return `<div class="m u"><div class="b${im.length?' ph-b':''}">${im.length?albumHTML(im,i):''}${fl.map(fileRow).join('')}${m.t?`<div class="tx">${esc(m.t)}</div>`:''}</div></div>`}
/* просмотр фото на весь экран */
let LB={l:[],i:0};
const lbShow=()=>{$('#lbi').src=LB.l[LB.i];$('#lbc').textContent=LB.l.length>1?`${LB.i+1} / ${LB.l.length}`:'';$('#lbp').hidden=$('#lbn').hidden=LB.l.length<2};
const lbOpen=(l,i)=>{LB={l,i};lbShow();$('#lb').hidden=false},lbClose=()=>{$('#lb').hidden=true;$('#lbi').removeAttribute('src')},lbMove=d=>{LB.i=(LB.i+d+LB.l.length)%LB.l.length;lbShow()};
$('#lbx').onclick=lbClose;$('#lbp').onclick=()=>lbMove(-1);$('#lbn').onclick=()=>lbMove(1);$('#lb').onclick=e=>{if(e.target.id=='lb')lbClose()};
addEventListener('keydown',e=>{if($('#lb').hidden)return;if(e.key=='Escape')lbClose();if(e.key=='ArrowLeft')lbMove(-1);if(e.key=='ArrowRight')lbMove(1)});
let tx0=null;$('#lb').addEventListener('touchstart',e=>tx0=e.touches[0].clientX,{passive:true});
$('#lb').addEventListener('touchend',e=>{if(tx0==null||LB.l.length<2)return;const d=e.changedTouches[0].clientX-tx0;tx0=null;if(Math.abs(d)>50)lbMove(d>0?-1:1)});

/* плавная печать: приходящий текст копится в очереди и выдаётся порциями — скорость растёт, если очередь большая */
const QU=new WeakMap(),RES=new WeakMap(),TW=new WeakSet();
function put(am,d){QU.set(am,(QU.get(am)||'')+d);if(!TW.has(am)){TW.add(am);const step=()=>{const q=QU.get(am)||'';
  if(!q){TW.delete(am);RES.get(am)?.();RES.delete(am);return}
  let n=Math.min(q.length,Math.max(2,Math.ceil(q.length/14)),500);const c=q.charCodeAt(n-1);if(c>=0xD800&&c<=0xDBFF&&n<q.length)n++;
  am.t+=q.slice(0,n);QU.set(am,q.slice(n));live(am);setTimeout(step,28)};step()}}
const flush=am=>new Promise(r=>{if(!(QU.get(am)||'')){r();return}RES.set(am,r)});
/* умный скролл: следуем за текстом, только если пользователь внизу */
const DBG=/[?&]debug/.test(location.search),mbox=$('#msgs');let stick=true;
const near=()=>mbox.scrollHeight-mbox.scrollTop-mbox.clientHeight<90,toBot=()=>{mbox.scrollTop=mbox.scrollHeight};
mbox.addEventListener('scroll',()=>{stick=near();$('#tobot').hidden=stick||!S.busy},{passive:true});
$('#tobot').onclick=()=>{stick=true;toBot();$('#tobot').hidden=true};
const metaTxt=m=>(m.m||'')+(DBG&&m.via?' · '+m.via:'');
/* копирование: конфетти (0,5 с) → галочка и «Скопировано» → через 2 с снова значок */
function copyFx(b){if(b.dataset.busy)return;b.dataset.busy=1;const h=b.innerHTML;b.classList.add('okc');
 b.innerHTML='<svg class="ckm" viewBox="0 0 24 24" width="18" height="18"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="cpt">Скопировано</span>';
 const cf=document.createElement('span');cf.className='cf';
 for(let i=0;i<16;i++){const e=document.createElement('i'),an=i/16*6.283+Math.random()*.4,r=24+Math.random()*22;e.style.cssText=`--dx:${Math.cos(an)*r}px;--dy:${Math.sin(an)*r}px;background:hsl(${i*23},85%,60%);animation-delay:${Math.random()*.06}s`;cf.append(e)}
 b.append(cf);setTimeout(()=>cf.remove(),650);
 setTimeout(()=>{b.innerHTML=h;b.classList.remove('okc');delete b.dataset.busy},2500)}
const zipCard=(m,cid,i)=>{const f=namedFiles(m.t);if(f.length<2)return '';const id=cid+'.'+i+'.zip';FILES.set(id,{name:'bart-project.zip',zip:f});return fileCard(id,'bart-project.zip',null,pl(f.length,['файл','файла','файлов'])+' в архиве')};
function renderMsgs(){const c=S.chat;$('#hero').hidden=!!c?.msgs.length;$('#ttl').textContent=c?.title||'Новый чат';
 $('#msgs').innerHTML=(c?.msgs||[]).map((m,i)=>m.r=='user'?userMsg(m,i)
  :`<div class="m a"><img class="av" src="${LOGO}"><div class="b"><div class="md">${mdm(m.t,c.id+'.'+i)||'<span class="dots"><i></i><i></i><i></i></span>'}</div>${zipCard(m,c.id,i)}${m.img?`<div class="gen"><img src="${esc(m.img)}" alt=""><a href="${esc(m.img)}" target="_blank" rel="noopener">${ic('download')} Открыть / скачать</a><button class="edb" data-a="edit" data-mi="${i}">${ic('edit')} Отредактировать</button></div>`:''}<div class="act"><button data-a="cp">${ic('copyIcon')}</button><span class="meta">${esc(metaTxt(m))}</span></div></div></div>`).join('');
 if(!(S.busy&&!stick))toBot();renderList(CH)}
let raf=0;function live(am){if(raf)return;raf=setTimeout(()=>{raf=0;const e=$('#msgs .m.a:last-child');if(!e||!S.chat)return;$('.md',e).innerHTML=md(am.t,S.chat.id+'.'+(S.chat.msgs.length-1))||'<span class="dots"><i></i><i></i><i></i></span>';$('.meta',e).textContent=metaTxt(am);if(stick)toBot()},70)}
async function send(){
 if(S.busy){ctl?.abort();return}
 const t=$('#inp').value.trim(),fl=S.files.filter(f=>f.ok),ed=!!S.edit&&fl.some(f=>f.k=='img');if(!t&&!fl.length||S.files.some(f=>!f.ok&&!f.err))return;
 S.files=[];chips();$('#inp').value='';grow();
 const c=S.chat||(S.chat=newChat()),um={r:'user',t,e:ed?1:0,a:fl.map(f=>{const a={pr:f.prompt||null,k:f.k,n:f.n,u:f.url||null,x:f.text||null,s:f.s||null,f:f.asFile?1:0};if(f.data)DATA.set(a,f.data);return a})},am={r:'assistant',t:'',m:''};
 stick=true;c.msgs.push(um,am);if(c.msgs.length==2){c.title=(t||fl[0].n).slice(0,40)}
 renderMsgs();follow(c);S.busy=true;ctl=new AbortController();$('#go').innerHTML=ic('stop');
 try{await run(c,am);await flush(am)}catch(e){am.t+=QU.get(am)||'';QU.delete(am);if(e.name!='AbortError')am.t+=(am.t?'\n\n':'')+'⚠️ '+e.message}
 finally{S.busy=false;$('#tobot').hidden=true;$('#go').innerHTML=ic('send');c.updated=Date.now();renderMsgs();db.save(c).catch(e=>{console.error(e);toast(e.code=='permission-denied'?'Чат не сохранился в облаке: в Firebase не опубликованы правила Firestore (см. README). Пока он виден только на этом устройстве.':'Не сохранилось: '+e.message)})}}
let tt;const toast=m=>{const e=$('#toast');e.textContent=m;e.hidden=false;clearTimeout(tt);tt=setTimeout(()=>e.hidden=true,9000)};
const grow=()=>{const i=$('#inp');i.style.height='auto';i.style.height=Math.min(i.scrollHeight,180)+'px'};
$('#inp').oninput=grow;$('#go').onclick=send;
$('#inp').onkeydown=e=>{if(e.key=='Enter'&&!e.shiftKey&&!matchMedia('(pointer:coarse)').matches){e.preventDefault();send()}};
$('#new').onclick=()=>{S.chat=null;unw?.();renderMsgs();document.body.classList.remove('side')};
$('#menu').onclick=()=>document.body.classList.add('side');$('#shade').onclick=()=>document.body.classList.remove('side');
$('#q').oninput=()=>renderList(CH);
$('#list').onclick=async e=>{const d=e.target.closest('[data-del]');
 if(d){e.stopPropagation();if(confirm('Удалить чат?')){await db.del(d.dataset.del);if(S.chat?.id==d.dataset.del){S.chat=null;renderMsgs()}}return}
 const i=e.target.closest('[data-id]');if(i){S.chat=CH.find(c=>c.id==i.dataset.id);follow(S.chat);renderMsgs();document.body.classList.remove('side')}};
$$('.sug button').forEach(b=>b.onclick=()=>{$('#inp').value=b.textContent;$('#inp').focus()});
$('#msgs').onclick=async e=>{const ph=e.target.closest('[data-lb]');if(ph){lbOpen(S.chat.msgs[ph.dataset.lb].a.filter(a=>a.k=='img'&&!a.f).map(imgSrc),+ph.dataset.j);return}
 const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a;
 if(a=='cp'){const i=[...$$('#msgs .m')].indexOf(b.closest('.m')),tx=S.chat.msgs[i]?.t||$('.md',b.closest('.m')).innerText;Promise.resolve(navigator.clipboard?.writeText(tx)).catch(()=>{});copyFx(b);return}
 if(a=='edit'){editFrom(+b.dataset.mi);return}
 if(a=='fopen'||a=='fdl'){const f=FILES.get(b.closest('.fc').dataset.fid);if(f)a=='fdl'?fileDl(f):fileOpen(f);return}
 const code=$('code',b.closest('.code')).textContent;
 if(a=='copy'){navigator.clipboard.writeText(code);const h=b.innerHTML;b.textContent='Готово ✓';setTimeout(()=>b.innerHTML=h,1200)}
 if(a=='dl')dlBlob(new Blob([code]),b.dataset.n||'bart-code.'+(EXT[b.dataset.l]||b.dataset.l||'txt'));
 if(a=='run'){$('#modal iframe').srcdoc=code;$('#modal').hidden=false}};
$('#mx').onclick=()=>{$('#modal').hidden=true;$('#modal iframe').srcdoc=''};

/* ---------- файлы, которые отправляет Bart: карточка → открыть / скачать ---------- */
const MIME={html:'text/html',htm:'text/html',svg:'image/svg+xml',json:'application/json',csv:'text/csv',md:'text/markdown',css:'text/css',js:'text/javascript',xml:'text/xml'};
async function fileBlob(f){const ext=(f.name.split('.').pop()||'').toLowerCase(),t=f.text||'';
 if(f.zip){await lib(JSZ);const z=new JSZip();f.zip.forEach(([n,c])=>z.file(n,c));return z.generateAsync({type:'blob'})}
 if(ext=='pdf'){await lib(CDN+'html2pdf.js/0.10.1/html2pdf.bundle.min.js');const h=document.createElement('div');h.style.cssText='position:fixed;left:-9999px;top:0;width:794px;background:#fff;color:#111;padding:32px;font:14px/1.55 Arial,sans-serif';
  h.innerHTML=DOMPurify.sanitize(/^\s*</.test(t)?t:marked.parse(t));document.body.append(h);
  try{return await html2pdf().set({margin:10,image:{type:'jpeg',quality:.92},html2canvas:{scale:2,useCORS:true},jsPDF:{unit:'mm',format:'a4'},pagebreak:{mode:['css','legacy']}}).from(h).outputPdf('blob')}finally{h.remove()}}
 if(ext=='docx'){await lib(JSZ);const z=new JSZip(),x=v=>v.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'),H='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  const ps=t.split('\n').map(l=>{const h=l.match(/^(#{1,3})\s+(.*)/),b=(h?h[2]:l.replace(/^\s*[-*]\s+/,'• ')).replace(/\*\*(.*?)\*\*/g,'$1');
   return `<w:p>${h?'<w:pPr><w:spacing w:before="240" w:after="80"/></w:pPr>':''}<w:r>${h?`<w:rPr><w:b/><w:sz w:val="${[0,36,30,26][h[1].length]}"/></w:rPr>`:''}<w:t xml:space="preserve">${x(b)}</w:t></w:r></w:p>`}).join('');
  z.file('[Content_Types].xml',H+'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
  z.file('_rels/.rels',H+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  z.file('word/document.xml',H+`<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${ps}</w:body></w:document>`);
  return z.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'})}
 if(/^xlsx?$/.test(ext)){await lib(XLS);const w=XLSX.read(t,{type:'string'});return new Blob([XLSX.write(w,{bookType:'xlsx',type:'array'})],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})}
 if(ext=='pptx'){await lib(CDN+'pptxgenjs/3.12.0/pptxgen.bundle.js');const pp=new PptxGenJS();
  t.split(/\n-{3,}\s*\n/).forEach(sl=>{const sd=pp.addSlide(),ls=sl.trim().split('\n').filter(Boolean);sd.addText((ls[0]||'').replace(/^#+\s*/,''),{x:.5,y:.3,w:9,h:1,fontSize:30,bold:true});
   if(ls.length>1)sd.addText(ls.slice(1).map(l=>({text:l.replace(/^\s*[-*]\s+/,''),options:{bullet:/^\s*[-*]\s/.test(l),breakLine:true}})),{x:.5,y:1.4,w:9,h:4,fontSize:18,valign:'top'})});
  return await pp.write({outputType:'blob'})}
 return new Blob([ext=='csv'?'\ufeff'+t:t],{type:(MIME[ext]||'text/plain')+';charset=utf-8'})}
const fileDl=async f=>{try{toast('Готовлю файл…');dlBlob(await fileBlob(f),f.name);$('#toast').hidden=true}catch(e){toast('Не удалось создать файл: '+(e.message||e))}};
async function fileOpen(f){const ext=(f.name.split('.').pop()||'').toLowerCase();
 if(/^(html?|svg)$/.test(ext)){$('#modal iframe').srcdoc=f.text;$('#modal').hidden=false;return}
 if(ext=='pdf'){const w=window.open('','_blank');try{toast('Готовлю PDF…');const b=await fileBlob(f);$('#toast').hidden=true;w?w.location=URL.createObjectURL(b):dlBlob(b,f.name)}catch(e){w?.close();toast('Не удалось создать PDF: '+(e.message||e))}return}
 if(f.zip||/^(docx|xlsx?|pptx)$/.test(ext))return fileDl(f); // эти форматы в браузере не показать — скачиваем
 $('#modal iframe').srcdoc=`<pre style="white-space:pre-wrap;word-break:break-word;font:13px/1.5 ui-monospace,Consolas,monospace;padding:16px;margin:0">${esc(f.text)}</pre>`;$('#modal').hidden=false}

/* ---------- файлы и картинки ---------- */
function chips(){if(!S.files.some(f=>f.k=='img'))S.edit=false;$('#inp').placeholder=S.edit?'Что изменить на фото?':'Сообщение…';$('#chips').innerHTML=(S.edit?'<span class="chip">✎ Режим редактирования</span>':'')+S.files.map((f,i)=>f.k=='img'
 ?`<span class="tn${f.err?' bad':f.ok?'':' ld'}" title="${esc(f.err||f.n)}">${f.data?`<img src="${f.data}" alt="">`:''}${f.err?'<em>!</em>':''}<b data-r="${i}">✕</b>${f.ok?`<i class="bd" data-m="${i}">${f.asFile?'Файл':'Фото'}</i><i class="bd ed${S.edit?' on':''}" data-e="${i}" title="Редактировать фото">✎</i>`:''}</span>`
 :`<span class="chip ${f.err?'bad':''}">${ic('attachFile')} ${esc(f.n)} ${f.err?'— '+esc(f.err):f.ok?'':'…'} <b data-r="${i}">✕</b></span>`).join('')}
$('#chips').onclick=async e=>{const r=e.target.dataset.r,m=e.target.dataset.m;if(e.target.dataset.e!=null){S.edit=!S.edit;chips();$('#inp').focus();return}if(r!=null){S.files.splice(r,1);chips()}
 if(m!=null){const f=S.files[m];if(!f||!f.ok)return;f.asFile=!f.asFile; // фото (сжатое, в альбоме) ↔ файл (оригинал без сжатия)
  if(f.asFile&&!f.urlF&&f.orig){f.ok=false;chips();f.urlF=await up(f.orig).catch(()=>null);f.ok=true}
  f.url=f.asFile?(f.urlF||f.urlP):f.urlP;chips()}};
/* сжатие картинки минимум вдвое по весу (с запасом: мелкие файлы до ~200 КБ не мучаем) */
async function shrink(f){
 const b=await createImageBitmap(f).catch(()=>{throw new Error('не удалось открыть изображение')}),goal=Math.max(f.size/2,200e3);
 let k=Math.min(1,2048/Math.max(b.width,b.height)),q=.86,o;const c=document.createElement('canvas'),x=c.getContext('2d');
 for(let i=0;i<10;i++){c.width=Math.max(1,Math.round(b.width*k));c.height=Math.max(1,Math.round(b.height*k));x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(b,0,0,c.width,c.height);
  o=await new Promise(r=>c.toBlob(r,'image/jpeg',q));if(!o)throw new Error('не удалось сжать изображение');if(o.size<=goal)break;if(q>.56)q-=.1;else k*=.8}
 b.close?.();
 return {blob:o,data:await new Promise(r=>{const d=new FileReader();d.onload=()=>r(d.result);d.readAsDataURL(o)})}}
async function up(d){let last;for(let t=0;t<2;t++){try{const fd=new FormData();if(typeof d=='string')fd.append('image',d.split(',')[1]);else fd.append('image',d,'photo.jpg');
 const j=await(await fetch('https://api.imgbb.com/1/upload?key='+K.imgbb,{method:'POST',body:fd})).json();if(j.data)return j.data.url;last=new Error(j.error?.message||'imgbb')}catch(e){last=e}}throw last}
const JSZ=CDN+'jszip/3.10.1/jszip.min.js',XLS=CDN+'xlsx/0.18.5/xlsx.full.min.js';
const ent=x=>x.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,'&');
const xmlText=x=>ent(x.replace(/<(script|style)[\s\S]*?<\/\1>/gi,'').replace(/<\/(?:text:p|text:h|p|div|h\d|li|tr)>|<br\s*\/?>/gi,'\n').replace(/<[^>]+>/g,' ')).replace(/[ \t]+/g,' ').replace(/\s*\n\s*/g,'\n').trim();
const TXT_IN_ZIP=/\.(txt|md|csv|json|xml|ya?ml|toml|ini|cfg|py|js|mjs|ts|jsx|tsx|html?|css|scss|c|cpp|h|hpp|java|kt|php|rb|swift|go|rs|sql|sh|bash|bat|ps1|ipynb|vue|svelte|lua|r|cs|dart|log)$|(^|\/)(Dockerfile|Makefile|README[^\/]*|\.env[^\/]*)$/i;
async function readFile(f,it){
 const ext=f.name.toLowerCase().split('.').pop(),buf=()=>f.arrayBuffer();
 if(f.type.startsWith('image/')||/^(jpe?g|png|gif|webp)$/.test(ext)){it.k='img';const z=await shrink(f);it.data=z.data;chips();it.orig=f;it.urlP=it.url=await up(z.blob).catch(()=>null);return}
 if(f.size>25e6)throw new Error('файл больше 25 МБ');
 if(ext=='pdf'){await lib(CDN+'pdf.js/3.11.174/pdf.min.js');pdfjsLib.GlobalWorkerOptions.workerSrc=CDN+'pdf.js/3.11.174/pdf.worker.min.js';
  const d=await pdfjsLib.getDocument({data:await buf()}).promise;let s='';
  for(let i=1;i<=Math.min(d.numPages,40)&&s.length<MAX;i++){const rows={};for(const x of(await(await d.getPage(i)).getTextContent()).items)(rows[Math.round(x.transform[5])]??=[]).push(x);
   s+=Object.keys(rows).sort((a,b)=>b-a).map(y=>rows[y].sort((a,b)=>a.transform[4]-b.transform[4]).map(x=>x.str).join('\t')).join('\n')+'\n\n'}
  it.text=s;
  if(s.trim().length<80){it.text='[В PDF нет текстового слоя — страницы приложены как изображения]';
   for(let i=1;i<=Math.min(d.numPages,3);i++){const p=await d.getPage(i),v=p.getViewport({scale:1.6}),c=document.createElement('canvas');c.width=v.width;c.height=v.height;await p.render({canvasContext:c.getContext('2d'),viewport:v}).promise;const data=c.toDataURL('image/jpeg',.85);S.files.push({k:'img',n:`${f.name} · стр.${i}`,data,url:await up(data).catch(()=>null),ok:true})}}}
 else if(ext=='docx'){await lib(CDN+'mammoth/1.6.0/mammoth.browser.min.js');it.text=(await mammoth.extractRawText({arrayBuffer:await buf()})).value}
 else if(ext=='doc'){const u=new Uint8Array(await buf()),pick=x=>(x.match(/[\p{L}\p{N}\p{P}\p{Zs}]{6,}/gu)||[]).join('\n'),A=pick(new TextDecoder('utf-16le').decode(u)),B=pick(new TextDecoder('windows-1251').decode(u));it.text='[Старый формат .doc: текст извлечён приблизительно]\n'+(A.length>B.length?A:B)}
 else if(/^(xlsx|xlsm|xls|ods)$/.test(ext)){await lib(XLS);const w=XLSX.read(await buf(),{type:'array'});it.text=w.SheetNames.map(n=>`## Лист: ${n}\n`+XLSX.utils.sheet_to_csv(w.Sheets[n]).slice(0,MAX)).join('\n\n')}
 else if(ext=='pptx'){await lib(JSZ);const z=await JSZip.loadAsync(await buf()),sl=Object.keys(z.files).filter(k=>/^ppt\/slides\/slide\d+\.xml$/.test(k)).sort((a,b)=>a.match(/\d+/)-b.match(/\d+/));
  it.text=(await Promise.all(sl.map(async(k,i)=>`## Слайд ${i+1}\n`+ent([...(await z.file(k).async('string')).matchAll(/<a:t>([^<]*)<\/a:t>/g)].map(m=>m[1]).join(' '))))).join('\n\n')}
 else if(ext=='odt'){await lib(JSZ);it.text=xmlText(await(await JSZip.loadAsync(await buf())).file('content.xml').async('string'))}
 else if(ext=='epub'){await lib(JSZ);const z=await JSZip.loadAsync(await buf());let o='';for(const k of Object.keys(z.files).filter(k=>/\.x?html?$/i.test(k)).sort()){if(o.length>MAX)break;o+=xmlText(await z.file(k).async('string'))+'\n\n'}it.text=o}
 else if(ext=='zip'){await lib(JSZ);const z=await JSZip.loadAsync(await buf()),ns=Object.keys(z.files).filter(k=>!z.files[k].dir);let o='Файлы в архиве:\n'+ns.slice(0,300).join('\n')+'\n';
  for(const k of ns){if(o.length>MAX)break;if(TXT_IN_ZIP.test(k))o+=`\n\n===== ${k} =====\n`+(await z.file(k).async('string')).slice(0,4000)}it.text=o}
 else if(ext=='rtf'){it.text=(await f.text()).replace(/\{\\(?:fonttbl|colortbl|stylesheet|info|\*)(?:[^{}]|\{[^{}]*\})*\}/g,'').replace(/\\u(-?\d+)(?:\\'[0-9a-f]{2}|\??)/gi,(m,c)=>String.fromCharCode(c<0?+c+65536:+c)).replace(/\\'([0-9a-f]{2})/gi,(m,h)=>new TextDecoder('windows-1251').decode(new Uint8Array([parseInt(h,16)]))).replace(/\\pard?/g,'\n').replace(/\\tab/g,'\t').replace(/\\[a-z]+-?\d* ?/gi,'').replace(/[{}]/g,'').replace(/\n{3,}/g,'\n\n').trim()}
 else if(/^html?$/.test(ext))it.text=xmlText(await f.text());
 else if(ext=='ipynb')it.text=(JSON.parse(await f.text()).cells||[]).map(c=>`# [${c.cell_type}]\n`+[].concat(c.source||[]).join('')).join('\n\n');
 else{if(f.size>3e6)throw new Error('текстовый файл больше 3 МБ');const t=await f.text();if(/\u0000/.test(t)||(t.match(/\uFFFD/g)||[]).length>20)throw new Error('формат не поддерживается');it.text=t}
}
async function addFiles(list){if(S.files.length+list.length>20){toast('Можно прикрепить не больше 20 файлов за раз');list=list.slice(0,Math.max(0,20-S.files.length))}
 await Promise.all(list.map(async f=>{const it={n:f.name||'photo.jpg',k:'file',s:f.size};S.files.push(it);chips();
  try{await readFile(f,it);if(it.text&&it.text.length>MAX)it.text=it.text.slice(0,MAX)+'\n…[текст обрезан]';it.ok=true}catch(e){it.err=e.message||'ошибка';toast(it.n+': '+it.err)}chips()}))}
/* ---------- голосовой ввод (Whisper) ---------- */
let rec,chunks;
async function mic(){const b=$('#mic');if(rec){rec.stop();return}
 try{const st=await navigator.mediaDevices.getUserMedia({audio:true});chunks=[];rec=new MediaRecorder(st);rec.ondataavailable=e=>chunks.push(e.data);
  rec.onstop=async()=>{st.getTracks().forEach(t=>t.stop());b.classList.remove('rec');b.innerHTML=ic('mic');const bl=new Blob(chunks,{type:rec.mimeType});rec=null;if(bl.size<1500)return;
   $('#inp').placeholder='Распознаю речь…';
   try{const fd=new FormData();fd.append('file',bl,'voice.'+(bl.type.includes('mp4')?'mp4':'webm'));fd.append('model','whisper-large-v3-turbo');
    const r=await fetch(P.groq.url+'/audio/transcriptions',{method:'POST',headers:{Authorization:'Bearer '+P.groq.key},body:fd});if(!r.ok)throw new Error(r.status);
    $('#inp').value=($('#inp').value+' '+(await r.json()).text).trim();grow();$('#inp').focus()}catch(e){toast('Не удалось распознать речь ('+e.message+')')}finally{$('#inp').placeholder='Сообщение…'}};
  rec.start();b.classList.add('rec');b.innerHTML=ic('stop')}catch(e){toast('Нет доступа к микрофону — разрешите его в настройках браузера для этого сайта')}}
$('#mic').onclick=mic;
$('#clip').onclick=()=>$('#fi').click();$('#cam').onclick=()=>$('#ci').click();
$('#fi').onchange=$('#ci').onchange=e=>{addFiles([...e.target.files]);e.target.value=''};
addEventListener('paste',e=>{const f=[...(e.clipboardData?.files||[])];if(f.length&&!$('#app').hidden){e.preventDefault();addFiles(f)}});
/* drag & drop: подсветка всего окна, файлы падают во вложения */
let dc=0;const hasF=e=>[...(e.dataTransfer?.types||[])].includes('Files'),appOn=()=>!$('#app').hidden,dropOff=()=>{dc=0;$('#drop').hidden=true};
addEventListener('dragenter',e=>{if(!hasF(e)||!appOn())return;e.preventDefault();dc++;$('#drop').hidden=false});
addEventListener('dragover',e=>{e.preventDefault();if(hasF(e)&&e.dataTransfer)e.dataTransfer.dropEffect='copy'});
addEventListener('dragleave',e=>{if(!hasF(e))return;dc=Math.max(0,dc-1);if(!dc)$('#drop').hidden=true});
addEventListener('dragend',dropOff);addEventListener('blur',dropOff);
addEventListener('drop',e=>{e.preventDefault();const f=[...(e.dataTransfer?.files||[])];dropOff();if(f.length&&appOn())addFiles(f)});

$('#theme').onclick=()=>{const t=document.documentElement.dataset.theme,d=t?t=='dark':matchMedia('(prefers-color-scheme:dark)').matches,n=d?'light':'dark';document.documentElement.dataset.theme=n;localStorage.bart_theme=n};
/* ---------- диагностика: проверка Groq / прокси / DeepSeek / Qwen-Image ---------- */
async function diag(){const L=[],show=()=>{$('#modal iframe').srcdoc='<body style="font:13px/1.6 ui-monospace,Consolas,monospace;padding:16px;white-space:pre-wrap;word-break:break-word">'+esc(L.join('\n'))+'</body>';$('#modal').hidden=false};
 const ok=t=>{L.push('✅ '+t);show()},bad=t=>{L.push('❌ '+t);show()},info=t=>{L.push('ℹ️ '+t);show()};
 const q=async(p,path,opt={})=>{const r=await fetch(P[p].url+path,{...opt,headers:{Authorization:'Bearer '+P[p].key,'Content-Type':'application/json',...(opt.headers||{})}});return {r,tx:await r.text()}};
 info('Прокси: '+(PROXY||'не задан — запросы идут напрямую из браузера'));
 try{const {r,tx}=await q('groq','/chat/completions',{method:'POST',body:JSON.stringify({model:'openai/gpt-oss-120b',messages:[{role:'user',content:'ping'}],max_tokens:20})});r.ok?ok('Groq (gpt-oss-120b) отвечает'):bad('Groq '+r.status+': '+tx.slice(0,160))}catch(e){bad('Groq: '+e.message)}
 let ids=[];
 try{const {r,tx}=await q('ms','/models');if(!r.ok)bad('ModelScope /models → '+r.status+': '+tx.slice(0,200));else{ids=(JSON.parse(tx).data||[]).map(x=>x.id);ok('ModelScope доступен, моделей в списке: '+ids.length+'; DeepSeek: '+(ids.filter(i=>/deepseek/i.test(i)).slice(0,8).join(', ')||'нет'))}}
 catch(e){bad('ModelScope /models: '+e.message+' — запрос не дошёл: проверьте, что воркер обновлён (proxy/worker.js) и адрес в config.js верный')}
 let got=false;for(const m of [...new Set([...ids.filter(i=>/^deepseek-ai\/deepseek-v\d/i.test(i)).sort((a,b)=>vnum(b)-vnum(a)),'deepseek-ai/DeepSeek-V4','deepseek-ai/DeepSeek-V3.2'])].slice(0,4)){
  try{const {r,tx}=await q('ms','/chat/completions',{method:'POST',body:JSON.stringify({model:m,messages:[{role:'user',content:'ping'}],max_tokens:16})});if(r.ok){ok('DeepSeek работает: '+m);got=true;break}bad(m+' → '+r.status+': '+tx.slice(0,180))}catch(e){bad(m+': '+e.message)}}
 if(!got)info('DeepSeek не подключился — для кода и рассуждений сайт использует gpt-oss-120b (Groq).');
 try{const {r,tx}=await q('ms','/images/generations',{method:'POST',headers:{'X-ModelScope-Async-Mode':'true'},body:JSON.stringify({model:'Qwen/Qwen-Image',prompt:'a red apple',size:'1024x1024'})});r.ok?ok('Qwen-Image: задача принята '+tx.slice(0,100)):bad('Qwen-Image → '+r.status+': '+tx.slice(0,200))}catch(e){bad('Qwen-Image: '+e.message)}
 if(PROXY)try{const r=await fetch(PROXY.replace(/\/$/,'')+'/ai/image',{method:'POST',body:JSON.stringify({prompt:'a red apple'})}),j=await r.json();r.ok&&j.image?ok('Запасной генератор Flux (Workers AI) работает'):bad('Workers AI → '+r.status+': '+(j.error||'').slice(0,160))}catch(e){bad('Workers AI: '+e.message)}
 if(P.or.key)try{const {r,tx}=await q('or','/models');if(!r.ok)bad('OpenRouter → '+r.status+': '+tx.slice(0,160));else{const f=(JSON.parse(tx).data||[]).map(x=>x.id).filter(i=>/:free$/.test(i));ok('OpenRouter доступен, бесплатных моделей: '+f.length+'; DeepSeek: '+(f.filter(i=>/deepseek/i.test(i)).slice(0,4).join(', ')||'нет'))}}catch(e){bad('OpenRouter: '+e.message)}
 else info('OpenRouter не подключён (необязательно): ключ вписывается в js/config.js → OR_KEY.')
 info('Готово. Если что-то красное — скопируйте этот текст и пришлите разработчику.')}
$('#diag').onclick=()=>{document.body.classList.remove('side');diag()};

/* ---------- вход: Firebase Auth (почта + Google) ---------- */
const show=n=>['splash','auth','verify','app'].forEach(x=>$('#'+x).hidden=x!=n);
const NET='Нет связи с сервером входа. Проверьте интернет; в мобильной сети (особенно с ограничениями) попробуйте Wi-Fi или VPN.';
const ER={'auth/invalid-credential':'Неверная почта или пароль','auth/wrong-password':'Неверная почта или пароль','auth/user-not-found':'Аккаунт с такой почтой не найден','auth/invalid-email':'Некорректная почта','auth/email-already-in-use':'Эта почта уже зарегистрирована — перейдите во вкладку «Вход»','auth/weak-password':'Пароль слишком короткий (от 6 символов)','auth/password-does-not-meet-requirements':'Пароль не подходит: нужен посложнее','auth/too-many-requests':'Слишком много попыток, подождите немного','auth/missing-password':'Введите пароль','auth/missing-email':'Введите почту','auth/network-request-failed':NET,'auth/operation-not-allowed':'Этот способ входа не включён в Firebase (Authentication → Sign-in method)','auth/unauthorized-domain':'Домен сайта не добавлен в Firebase (Authentication → Settings → Authorized domains)','auth/popup-blocked':'Браузер заблокировал окно входа — разрешите всплывающие окна','auth/user-disabled':'Аккаунт отключён','auth/admin-restricted-operation':'Регистрация отключена в настройках Firebase','auth/internal-error':'Внутренняя ошибка сервера входа, попробуйте ещё раз','auth/web-storage-unsupported':'Браузер блокирует хранилище — выключите приватный режим или откройте сайт в Chrome/Safari'};
const er=e=>ER[e.code]||('Не удалось войти ('+(e.code||e.message||'неизвестная ошибка')+')'),fail=(m,id='err',ok)=>{const e=$('#'+id);e.textContent=m||'';e.classList.toggle('ok',!!ok)};
const wait=async(btn,fn)=>{btn.disabled=true;btn.classList.add('ld');try{return await fn()}finally{btn.disabled=false;btn.classList.remove('ld')}};
const withTimeout=(p,ms)=>Promise.race([p,new Promise((_,j)=>setTimeout(()=>j(new Error('timeout')),ms))]);
/* вкладки «Вход» / «Регистрация» — два отдельных раздела */
const tab=n=>{$$('.tabs button').forEach(x=>x.classList.toggle('on',x.dataset.tab==n));$('#f-login').hidden=n!='login';$('#f-reg').hidden=n!='reg';fail('')};
$$('[data-tab],[data-go]').forEach(b=>b.onclick=()=>{const n=b.dataset.tab||b.dataset.go,v=($('#f-login').hidden?$('#r-em'):$('#li-em')).value;tab(n);const t=n=='reg'?$('#r-em'):$('#li-em');if(!t.value)t.value=v});
$$('[data-eye]').forEach(b=>{b.innerHTML=ic('eye');b.onclick=()=>{const i=b.parentElement.querySelector('input'),h=i.type=='password';i.type=h?'text':'password';b.innerHTML=ic(h?'eyeOff':'eye')}});
if(/Telegram|FBAN|FBAV|Instagram|VKApp|Line\/|; wv\)|(iPhone|iPad)(?!.*Safari)/i.test(navigator.userAgent))$('#inapp').hidden=false;
/* пока Firebase не загрузился (или недоступен) — понятная ошибка вместо тишины */
$('#f-login').onsubmit=$('#f-reg').onsubmit=e=>{e.preventDefault();fail(NET)};$('#google').onclick=$('#reset').onclick=()=>fail(NET);$('#skip').onclick=()=>enter(null);
async function enter(u){
 uid=u?u.uid:'local';fs=u?{...fb.f,db:fb.db}:null;S.chat=null;unl?.();show('app');setVh();
 $('#who').textContent=u?(u.displayName||u.email):'Локальный режим';$('#out').hidden=!u;$('#dev').textContent=u?'':'данные только на этом устройстве';
 unl=db.list(l=>{renderList(l);if(!S.busy&&!S.chat)renderMsgs()});renderMsgs();
 if(u){const did=localStorage.bart_dev||(localStorage.bart_dev=Math.random().toString(36).slice(2,8)),R=fb.d,pr=R.ref(fb.rt,`presence/${uid}/${did}`);
  R.set(pr,{ua:navigator.userAgent.slice(0,60),t:Date.now()}).catch(()=>{});R.onDisconnect(pr).remove().catch(()=>{});
  R.onValue(R.ref(fb.rt,`presence/${uid}`),s=>$('#dev').textContent='☁ синхронизация · онлайн: '+Object.keys(s.val()||{}).length,()=>{})}}
let vt;
async function boot(){
 if(FB.apiKey.startsWith('PASTE'))return enter(null);
 let m;try{m=await withTimeout(Promise.all(['app','auth','firestore','database'].map(n=>import(`${G}firebase-${n}.js`))),15000)}
 catch(e){console.error(e);show('auth');fail(NET);$('#skip').hidden=false;return}
 const app=m[0].initializeApp(FB),A=m[1];
 /* автоопределение long-polling: Firestore не зависает в мобильных сетях и за прокси */
 let dbf;try{dbf=m[2].initializeFirestore(app,{experimentalAutoDetectLongPolling:true})}catch{dbf=m[2].getFirestore(app)}
 fb={au:A,f:m[2],d:m[3],auth:A.getAuth(app),db:dbf,rt:m[3].getDatabase(app)};
 const needVerify=u=>u.providerData.some(p=>p.providerId=='password')&&!u.emailVerified;
 A.onAuthStateChanged(fb.auth,u=>{clearInterval(vt);if(!u){unl?.();show('auth');return}
  if(needVerify(u)){$('#vem').textContent=u.email;show('verify');vt=setInterval(async()=>{await u.reload().catch(()=>{});if(u.emailVerified){clearInterval(vt);enter(u)}},4000);return}
  enter(u)});
 document.addEventListener('visibilitychange',async()=>{const u=fb.auth.currentUser;if(document.hidden||!u||$('#verify').hidden)return;await u.reload().catch(()=>{});if(u.emailVerified){clearInterval(vt);enter(u)}});
 $('#f-login').onsubmit=e=>{e.preventDefault();fail('');const em=$('#li-em').value.trim(),pw=$('#li-pw').value;
  if(!em)return fail('Введите почту');if(!pw)return fail('Введите пароль');
  wait($('#f-login .btn'),()=>A.signInWithEmailAndPassword(fb.auth,em,pw)).catch(x=>fail(er(x)))};
 $('#f-reg').onsubmit=e=>{e.preventDefault();fail('');const em=$('#r-em').value.trim(),pw=$('#r-pw').value;
  if(!/^\S+@\S+\.\S+$/.test(em))return fail('Введите корректную почту');if(pw.length<6)return fail('Пароль — от 6 символов');if(pw!=$('#r-pw2').value)return fail('Пароли не совпадают');
  wait($('#f-reg .btn'),async()=>{const r=await A.createUserWithEmailAndPassword(fb.auth,em,pw);A.sendEmailVerification(r.user).catch(()=>{})}).catch(x=>fail(er(x)))};
 $('#reset').onclick=()=>{const em=$('#li-em').value.trim();if(!em)return fail('Введите почту выше — вышлем ссылку для сброса пароля');
  A.sendPasswordResetEmail(fb.auth,em).then(()=>fail('Письмо для сброса отправлено — проверьте «Спам»','err',true)).catch(x=>fail(er(x)))};
 $('#google').onclick=()=>wait($('#google'),async()=>{fail('');const p=new A.GoogleAuthProvider();p.setCustomParameters({prompt:'select_account'});
  try{await A.signInWithPopup(fb.auth,p)}catch(x){if(/popup-blocked|operation-not-supported|web-storage-unsupported/.test(x.code||'')){await A.signInWithRedirect(fb.auth,p);return}throw x}})
  .catch(x=>{if(!/popup-closed-by-user|cancelled-popup-request/.test(x.code||''))fail(er(x))});
 A.getRedirectResult(fb.auth).catch(x=>fail(er(x)));
 $('#vok').onclick=async()=>{const u=fb.auth.currentUser;await u.reload().catch(()=>{});u.emailVerified?(clearInterval(vt),enter(u)):fail('Почта ещё не подтверждена','verr')};
 $('#vre').onclick=async()=>{try{await A.sendEmailVerification(fb.auth.currentUser);fail('Письмо отправлено','verr',true)}catch(x){fail(er(x),'verr')}};
 $('#vout').onclick=$('#out').onclick=()=>A.signOut(fb.auth)}
boot().catch(e=>{console.error(e);show('auth');fail('Не удалось запустить вход: '+(e.message||e));$('#skip').hidden=false});

hyd(document);
