import {CFG} from './config.js';
import {FB} from './firebase-config.js';
const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const K=Object.fromEntries(Object.entries(CFG).map(([k,v])=>[k,atob(v)]));
const P={groq:{url:'https://api.groq.com/openai/v1',key:K.groq}};
const MAX=12000,LOGO='https://i.ibb.co/1pCX2Nr/image-Photoroom.png',G='https://www.gstatic.com/firebasejs/10.12.2/';
const sv=(d,f)=>`<svg viewBox="0 0 24 24" fill="${f?'currentColor':'none'}" stroke="${f?'none':'currentColor'}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
const SV={menu:sv('M4 6h16M4 12h16M4 18h16'),plus:sv('M12 5v14M5 12h14'),send:sv('M12 19V5M5 12l7-7 7 7'),attachFile:sv('M21 11.5l-8.6 8.6a5.5 5.5 0 0 1-7.8-7.8l8.6-8.6a3.7 3.7 0 0 1 5.2 5.2l-8.6 8.6a1.8 1.8 0 0 1-2.6-2.6l8-8'),close:sv('M6 6l12 12M18 6L6 18'),camera:sv('M4 8h3l2-3h6l2 3h3v11H4zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z'),delete:sv('M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3'),search:sv('M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5'),copyIcon:sv('M9 9h11v11H9zM5 15V4h11'),download:sv('M12 4v11M7 11l5 5 5-5M5 20h14'),stop:sv('M7 7h10v10H7z',1),logout:sv('M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10'),mic:sv('M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3'),theme:sv('M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z'),eye:sv('M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'),eyeOff:sv('M3 3l18 18M10.6 6.2A9.8 9.8 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.2 3.9M6.6 7.6A16.6 16.6 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 4-.9M9.9 9.9a3 3 0 0 0 4.2 4.2')};
/* реальная высота видимой области (клавиатура на телефоне не обрезает интерфейс) */
const vv=window.visualViewport,setVh=()=>{document.documentElement.style.setProperty('--vh',(vv?vv.height:innerHeight)+'px');if(vv&&vv.offsetTop)scrollTo(0,0)};
setVh();vv?.addEventListener('resize',setVh);vv?.addEventListener('scroll',setVh);addEventListener('resize',setVh);addEventListener('orientationchange',()=>setTimeout(setVh,200));
const ic=n=>`<i class="ic" data-i="${n}"></i>`; // сначала встроенная SVG-иконка; если есть assets/icons/<имя>.png (ваши иконки) — подменяется ею
const hyd=r=>$$('i[data-i]:not([data-h])',r).forEach(e=>{e.dataset.h=1;const n=e.dataset.i;e.innerHTML=SV[n]||'';const im=new Image();im.onload=()=>e.replaceChildren(im);im.src=`assets/icons/${n}.png`});
new MutationObserver(()=>hyd(document)).observe(document.body,{childList:true,subtree:true});
$$('[data-ic]').forEach(e=>e.innerHTML=ic(e.dataset.ic));
const loaded={};const lib=u=>loaded[u]??=new Promise((r,j)=>{const s=document.createElement('script');s.src=u;s.onload=r;s.onerror=()=>j(new Error('не загрузилась библиотека'));document.head.append(s)});
const CDN='https://cdnjs.cloudflare.com/ajax/libs/';

/* ---------- markdown ---------- */
marked.use({renderer:{code(c,l){const [lang='',fn='']=(l||'').trim().split(/\s+/);const v=lang&&hljs.getLanguage(lang)?hljs.highlight(c,{language:lang}).value:hljs.highlightAuto(c).value;
 return `<div class="code"><div class="ch"><span>${esc(fn||lang||'code')}</span><span><button data-a="copy">${ic('copyIcon')} Копировать</button><button data-a="dl" data-l="${esc(lang)}" data-n="${esc(fn)}">${ic('download')} Скачать</button>${/html|svg/.test(lang)?'<button data-a="run">▶ Запуск</button>':''}</span></div><pre><code class="hljs">${v}</code></pre></div>`}}});
const clean=t=>(t||'').replace(/<think>[\s\S]*?(<\/think>|$)/g,'');
const namedFiles=t=>[...clean(t).matchAll(/```[^\S\n]*\w[\w+#.-]*[^\S\n]+([^\s`]+)[^\n]*\n([\s\S]*?)```/g)].map(m=>[m[1].replace(/^[\/\\]+/,''),m[2]]).filter(x=>/[./]/.test(x[0]));
const dlBlob=(b,n)=>{const x=document.createElement('a');x.href=URL.createObjectURL(b);x.download=n;x.click();setTimeout(()=>URL.revokeObjectURL(x.href),5000)};
const md=t=>DOMPurify.sanitize(marked.parse(clean(t)),{ADD_ATTR:['data-a','data-l','data-n','data-i']});
const EXT={javascript:'js',js:'js',python:'py',html:'html',css:'css',json:'json',typescript:'ts',bash:'sh',sql:'sql',java:'java',cpp:'cpp',csharp:'cs',markdown:'md',svg:'svg'};

/* ---------- state + storage (Firestore или localStorage) ---------- */
const S={chat:null,files:[],busy:false};let uid='local',fs=null,fb={},CH=[],unl=null,unw=null,ctl=null;
const DATA=new WeakMap();
const L=()=>JSON.parse(localStorage.bart_chats||'{}');
const db={
 list(cb){if(fs)return fs.onSnapshot(fs.query(fs.collection(fs.db,'users',uid,'chats'),fs.orderBy('updated','desc')),s=>cb(s.docs.map(d=>d.data())));
  db.cb=()=>cb(Object.values(L()).sort((a,b)=>b.updated-a.updated));db.cb();return()=>{}},
 async save(c){c=JSON.parse(JSON.stringify(c));if(fs)await fs.setDoc(fs.doc(fs.db,'users',uid,'chats',c.id),c);else{const l=L();l[c.id]=c;localStorage.bart_chats=JSON.stringify(l);db.cb?.()}},
 async del(id){if(fs)await fs.deleteDoc(fs.doc(fs.db,'users',uid,'chats',id));else{const l=L();delete l[id];localStorage.bart_chats=JSON.stringify(l);db.cb?.()}},
 watch(id,cb){return fs?fs.onSnapshot(fs.doc(fs.db,'users',uid,'chats',id),s=>s.exists()&&cb(s.data())):()=>{}}
};
const uuid=()=>crypto.randomUUID?crypto.randomUUID():'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c=='x'?r:r&3|8).toString(16)});
const newChat=()=>({id:uuid(),title:'Новый чат',updated:Date.now(),msgs:[]});
function follow(c){unw?.();unw=db.watch(c.id,d=>{if(!S.busy&&S.chat?.id==d.id&&d.updated>S.chat.updated){S.chat=d;renderMsgs()}})}

/* ---------- AI: роутер моделей ---------- */
const mc={};
async function ml(p){return mc[p]??=fetch(P[p].url+'/models',{headers:{Authorization:'Bearer '+P[p].key}}).then(r=>r.json()).then(j=>(j.data||[]).map(x=>x.id).filter(i=>!/whisper|guard|orpheus|tts|embed|safeguard|playai|compound/i.test(i))).catch(()=>[])}
async function chain(kind){
 const g=await ml('groq'),o=[],add=(l,re,n=9)=>l.filter(m=>re.test(m)).slice(0,n).forEach(m=>o.push(m)),ver=m=>+(m.match(/qwen(\d+(?:\.\d+)?)/)?.[1]||0),vis=/qwen.*27b|vl|vision|maverick/i;
 if(kind=='vision'){add(g.filter(m=>vis.test(m)).sort((a,b)=>ver(b)-ver(a)),/./);o.push('qwen/qwen3.8-27b','qwen/qwen3.6-27b')}
 else{const t=g.filter(m=>!/vl|vision|maverick/i.test(m));for(const re of kind=='code'?[/coder/i,/gpt-oss-120b/i,/qwen.*27b|qwen3-32b/i,/llama-3\.3-70b/i]:[/gpt-oss-120b/i,/llama-3\.3-70b/i,/qwen.*27b|qwen3-32b/i])add(t,re,1);add(t,/./,2);o.push('openai/gpt-oss-120b','llama-3.3-70b-versatile')}
 return [...new Set(o)].filter(m=>!/scout/i.test(m)).map(m=>['groq',m])}
async function stream(p,model,messages,onD,sig){
 const body={model,messages,stream:true,temperature:.6,max_tokens:4096};if(/gpt-oss/.test(model))body.reasoning_effort='medium';
 const r=await fetch(P[p].url+'/chat/completions',{method:'POST',signal:sig,headers:{'Content-Type':'application/json',Authorization:'Bearer '+P[p].key},body:JSON.stringify(body)});
 if(!r.ok)throw new Error(r.status+': '+(await r.text()).slice(0,200));
 const rd=r.body.getReader(),dec=new TextDecoder();let buf='',got=false;
 for(;;){const {done,value}=await rd.read();if(done)break;buf+=dec.decode(value,{stream:true});const ls=buf.split('\n');buf=ls.pop();
  for(const l of ls){if(!l.startsWith('data:')||l.includes('[DONE]'))continue;try{const d=JSON.parse(l.slice(5)).choices?.[0]?.delta?.content;if(d){got=true;onD(d)}}catch{}}}
 return got}
async function tryChain(list,messages,onD,sig,label){const errs=[];
 for(const [p,m] of list){try{label('Bart-beta');if(await stream(p,m,messages,onD,sig))return;errs.push(m+': пустой ответ');console.warn('model empty',m)}catch(e){if(e.name=='AbortError')throw e;console.warn('model failed',m,e.message);errs.push(e.message.slice(0,3))}}
 throw new Error('Bart-beta сейчас не смог ответить (код '+(errs.join('/')||'—')+'). Попробуйте ещё раз; подробности в консоли (F12).')}
const IMG_RE=/нарису|сгенерир\w*\s+(?:\S+\s+)?(?:картин|изображ|фот|арт|логотип|иллюстр)|созда\w+\s+(?:\S+\s+)?(?:картин|изображ|арт|логотип|иллюстр)|нарисов|(?:generate|create|draw)\s+(?:an?\s+)?(?:image|picture|logo|art)|\bdraw\b/i;
async function draw(am,t,sig){
 am.m='Bart-beta';live(am);let p='';
 try{await tryChain(await chain('text'),[{role:'system',content:'Convert the user request into one detailed English prompt for an image generator (subject, style, lighting, composition). Output only the prompt text.'},{role:'user',content:t}],d=>p+=d,sig,()=>{});p=clean(p).trim()}catch(e){if(e.name=='AbortError')throw e}
 p=p||t;
 for(let i=0;i<4;i++){const u=`https://image.pollinations.ai/prompt/${encodeURIComponent(p.slice(0,900))}?width=1024&height=1024&model=flux&nologo=true&seed=${Math.floor(Math.random()*1e6)}`;
  if(await new Promise(r=>{const im=new Image();im.onload=()=>r(1);im.onerror=()=>r(0);im.src=u})){am.img=u;am.t='Готово, сэр. Промпт для генератора:\n\n> '+p;
   try{const b=await(await fetch(u)).blob(),d=await new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(b)});am.img=await up(d)}catch{}
   return}
  await new Promise(r=>setTimeout(r,8000))}
 throw new Error('Генератор картинок не ответил (лимит — 1 запрос в 15 секунд). Повторите через минуту.')}
const CODE_RE=/zip|архив|проект|сайт|код|скрипт|функци|баг|ошибк|програм|python|javascript|html|css|sql|react|json|```|api\b|class\b|def\b|верстк/i,CODE_EXT=/\.(py|js|ts|jsx|tsx|html|css|json|java|c|cpp|cs|go|rs|php|sql|sh|yml|yaml)$/i;
const SYS='Ты — Bart-beta (Барт), универсальный ИИ-ассистент. Никогда не называй модели, компании и сервисы, на которых ты основан; если спросят — ты Bart-beta. Обращайся к пользователю «сэр». Отвечай на языке пользователя (по умолчанию по-русски), по делу, в Markdown. Код — только в блоках ``` с указанием языка. Когда просят создать файлы, проект или ZIP-архив, выдавай каждый файл отдельным блоком, где после языка стоит имя файла или путь, например: ```python app.py или ```html site/index.html. Сайт сам соберёт из них ZIP-кнопкой под ответом, поэтому не говори, что не можешь создавать архивы. Прикреплённые пользователем файлы (PDF, Word, Excel, PowerPoint, ZIP, код и др.) ты видишь как текст в сообщении.';
function build(hist){
 const li=hist.map(m=>m.a?.some(a=>a.k=='img')).lastIndexOf(true);
 return [{role:'system',content:SYS},...hist.slice(-12).map((m,j,arr)=>{const i=hist.length-arr.length+j;
  if(m.r!='user')return {role:'assistant',content:clean(m.t)||'…'};
  let t=(m.t||'')+(m.a||[]).filter(a=>a.x).map(a=>`\n\n[Файл: ${a.n}]\n${a.x}`).join('');
  const im=(m.a||[]).filter(a=>a.k=='img');
  if(i==li&&im.length)return {role:'user',content:[{type:'text',text:t||'Опиши изображение.'},...im.slice(0,4).map(a=>({type:'image_url',image_url:{url:DATA.get(a)||a.u}}))]};
  return {role:'user',content:t+im.map(a=>`\n[изображение: ${a.n}]`).join('')||'…'}})]}
async function run(c,am){
 const hist=c.msgs.slice(0,-1),last=hist[hist.length-1],att=last.a||[];
 if(IMG_RE.test(last.t||'')&&!att.some(a=>a.k=='img'))return draw(am,last.t,ctl.signal);
 const img=att.some(a=>a.k=='img'),code=CODE_RE.test(last.t||'')||att.some(a=>a.k=='file'&&CODE_EXT.test(a.n));
 const upd=()=>live(am),lab=x=>{am.m=(am.pre?am.pre+' → ':'')+x;upd()};let msgs=build(hist);
 const go=(k)=>chain(k).then(l=>tryChain(l,msgs,d=>{am.t+=d;upd()},ctl.signal,lab));
 if(img&&(code||att.some(a=>a.x))){ // два шага: vision «видит», потом код/рассуждение отвечает
  let desc='';const vm=[{role:'user',content:[{type:'text',text:'Подробно опиши изображение, дословно перепиши весь видимый текст и код.'},...msgs[msgs.length-1].content.filter(p=>p.type=='image_url')]}];
  await tryChain(await chain('vision'),vm,d=>desc+=d,ctl.signal,lab);am.pre=am.m;
  msgs=msgs.map(m=>Array.isArray(m.content)?{role:'user',content:m.content[0].text+'\n\n[Описание изображений от vision-модели]\n'+desc}:m);
  return go(code?'code':'text')}
 return go(img?'vision':code?'code':'text')}

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
const fileRow=a=>`<div class="fr"><span class="fx">${esc((a.n.split('.').pop()||'file').slice(0,4).toUpperCase())}</span><span class="fi2"><b>${esc(a.n)}</b><small>${a.s?fmt(a.s):'файл'}</small></span></div>`;
function userMsg(m,i){const im=(m.a||[]).filter(a=>a.k=='img'),fl=(m.a||[]).filter(a=>a.k!='img');
 return `<div class="m u"><div class="b${im.length?' ph-b':''}">${im.length?albumHTML(im,i):''}${fl.map(fileRow).join('')}${m.t?`<div class="tx">${esc(m.t)}</div>`:''}</div></div>`}
/* просмотр фото на весь экран */
let LB={l:[],i:0};
const lbShow=()=>{$('#lbi').src=LB.l[LB.i];$('#lbc').textContent=LB.l.length>1?`${LB.i+1} / ${LB.l.length}`:'';$('#lbp').hidden=$('#lbn').hidden=LB.l.length<2};
const lbOpen=(l,i)=>{LB={l,i};lbShow();$('#lb').hidden=false},lbClose=()=>{$('#lb').hidden=true;$('#lbi').removeAttribute('src')},lbMove=d=>{LB.i=(LB.i+d+LB.l.length)%LB.l.length;lbShow()};
$('#lbx').onclick=lbClose;$('#lbp').onclick=()=>lbMove(-1);$('#lbn').onclick=()=>lbMove(1);$('#lb').onclick=e=>{if(e.target.id=='lb')lbClose()};
addEventListener('keydown',e=>{if($('#lb').hidden)return;if(e.key=='Escape')lbClose();if(e.key=='ArrowLeft')lbMove(-1);if(e.key=='ArrowRight')lbMove(1)});
let tx0=null;$('#lb').addEventListener('touchstart',e=>tx0=e.touches[0].clientX,{passive:true});
$('#lb').addEventListener('touchend',e=>{if(tx0==null||LB.l.length<2)return;const d=e.changedTouches[0].clientX-tx0;tx0=null;if(Math.abs(d)>50)lbMove(d>0?-1:1)});

function renderMsgs(){const c=S.chat;$('#hero').hidden=!!c?.msgs.length;$('#ttl').textContent=c?.title||'Новый чат';
 $('#msgs').innerHTML=(c?.msgs||[]).map((m,i)=>m.r=='user'?userMsg(m,i)
  :`<div class="m a"><img class="av" src="${LOGO}"><div class="b"><div class="md">${md(m.t)||'<span class="dots"><i></i><i></i><i></i></span>'}</div>${m.img?`<div class="gen"><img src="${esc(m.img)}" alt=""><a href="${esc(m.img)}" target="_blank" rel="noopener">${ic('download')} Открыть / скачать</a></div>`:''}<div class="act"><button data-a="cp">${ic('copyIcon')}</button>${namedFiles(m.t).length?`<button data-a="zip" data-mi="${i}" class="zipb">${ic('download')} ZIP · ${namedFiles(m.t).length}</button>`:''}<span class="meta">${esc(m.m||'')}</span></div></div></div>`).join('');
 $('#msgs').scrollTop=1e9;renderList(CH)}
let raf=0;function live(am){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;const e=$('#msgs .m.a:last-child');if(!e)return;$('.md',e).innerHTML=md(am.t)||'<span class="dots"><i></i><i></i><i></i></span>';$('.meta',e).textContent=am.m||'';$('#msgs').scrollTop=1e9})}
async function send(){
 if(S.busy){ctl?.abort();return}
 const t=$('#inp').value.trim(),fl=S.files.filter(f=>f.ok);if(!t&&!fl.length||S.files.some(f=>!f.ok&&!f.err))return;
 S.files=[];chips();$('#inp').value='';grow();
 const c=S.chat||(S.chat=newChat()),um={r:'user',t,a:fl.map(f=>{const a={k:f.k,n:f.n,u:f.url||null,x:f.text||null,s:f.s||null};if(f.data)DATA.set(a,f.data);return a})},am={r:'assistant',t:'',m:''};
 c.msgs.push(um,am);if(c.msgs.length==2){c.title=(t||fl[0].n).slice(0,40)}
 renderMsgs();follow(c);S.busy=true;ctl=new AbortController();$('#go').innerHTML=ic('stop');
 try{await run(c,am)}catch(e){if(e.name!='AbortError')am.t+=(am.t?'\n\n':'')+'⚠️ '+e.message}
 finally{S.busy=false;$('#go').innerHTML=ic('send');c.updated=Date.now();renderMsgs();db.save(c).catch(e=>{console.error(e);toast(e.code=='permission-denied'?'Чат не сохранился в облаке: в Firebase не опубликованы правила Firestore (см. README). Пока он виден только на этом устройстве.':'Не сохранилось: '+e.message)})}}
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
$('#msgs').onclick=async e=>{const ph=e.target.closest('[data-lb]');if(ph){lbOpen(S.chat.msgs[ph.dataset.lb].a.filter(a=>a.k=='img').map(imgSrc),+ph.dataset.j);return}
 const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a;
 if(a=='cp'){navigator.clipboard.writeText($('.md',b.closest('.m')).innerText);return}
 if(a=='zip'){await lib(JSZ);const z=new JSZip();namedFiles(S.chat.msgs[b.dataset.mi].t).forEach(([n,c])=>z.file(n,c));dlBlob(await z.generateAsync({type:'blob'}),'bart-project.zip');return}
 const code=$('code',b.closest('.code')).textContent;
 if(a=='copy'){navigator.clipboard.writeText(code);const h=b.innerHTML;b.textContent='Готово ✓';setTimeout(()=>b.innerHTML=h,1200)}
 if(a=='dl')dlBlob(new Blob([code]),b.dataset.n||'bart-code.'+(EXT[b.dataset.l]||b.dataset.l||'txt'));
 if(a=='run'){$('#modal iframe').srcdoc=code;$('#modal').hidden=false}};
$('#mx').onclick=()=>{$('#modal').hidden=true;$('#modal iframe').srcdoc=''};

/* ---------- файлы и картинки ---------- */
function chips(){$('#chips').innerHTML=S.files.map((f,i)=>f.k=='img'
 ?`<span class="tn${f.err?' bad':f.ok?'':' ld'}" title="${esc(f.err||f.n)}">${f.data?`<img src="${f.data}" alt="">`:''}${f.err?'<em>!</em>':''}<b data-r="${i}">✕</b></span>`
 :`<span class="chip ${f.err?'bad':''}">${ic('attachFile')} ${esc(f.n)} ${f.err?'— '+esc(f.err):f.ok?'':'…'} <b data-r="${i}">✕</b></span>`).join('')}
$('#chips').onclick=e=>{const r=e.target.dataset.r;if(r!=null){S.files.splice(r,1);chips()}};
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
 if(f.type.startsWith('image/')||/^(jpe?g|png|gif|webp)$/.test(ext)){it.k='img';const z=await shrink(f);it.data=z.data;chips();it.url=await up(z.blob).catch(()=>null);return}
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
