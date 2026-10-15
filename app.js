import {CFG} from './config.js';
import {FB} from './firebase-config.js';
const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const K=Object.fromEntries(Object.entries(CFG).filter(([k])=>k!=='modelApi').map(([k,v])=>[k,atob(v)]));
const P={groq:{url:'https://api.groq.com/openai/v1',key:K.groq}};
const MAX=12000,LOGO='https://i.ibb.co/1pCX2Nr/image-Photoroom.png',G='https://www.gstatic.com/firebasejs/10.12.2/';
const sv=(d,f)=>`<svg viewBox="0 0 24 24" fill="${f?'currentColor':'none'}" stroke="${f?'none':'currentColor'}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
const SV={menu:sv('M4 6h16M4 12h16M4 18h16'),plus:sv('M12 5v14M5 12h14'),send:sv('M12 19V5M5 12l7-7 7 7'),attachFile:sv('M21 11.5l-8.6 8.6a5.5 5.5 0 0 1-7.8-7.8l8.6-8.6a3.7 3.7 0 0 1 5.2 5.2l-8.6 8.6a1.8 1.8 0 0 1-2.6-2.6l8-8'),close:sv('M6 6l12 12M18 6L6 18'),camera:sv('M4 8h3l2-3h6l2 3h3v11H4zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z'),delete:sv('M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3'),search:sv('M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5'),copyIcon:sv('M9 9h11v11H9zM5 15V4h11'),download:sv('M12 4v11M7 11l5 5 5-5M5 20h14'),stop:sv('M7 7h10v10H7z',1),logout:sv('M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10'),mic:sv('M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3'),theme:sv('M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z')};
const ic=n=>`<i class="ic" aria-hidden="true">${SV[n]||''}</i>`;
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
const newChat=()=>({id:crypto.randomUUID(),title:'Новый чат',updated:Date.now(),msgs:[]});
function follow(c){unw?.();unw=db.watch(c.id,d=>{if(!S.busy&&S.chat?.id==d.id&&d.updated>S.chat.updated){S.chat=d;renderMsgs()}})}

/* ---------- ModelScope gateway: API key stays on the server ---------- */
// Deploy worker/model-scope-worker.js and set MODEL_API to its public URL in js/config.js.
const MODEL_API=(CFG.modelApi||'').replace(/\/$/,'');
async function stream(model,messages,onD,sig){
 if(!MODEL_API)throw new Error('ИИ ещё не подключён: разверните worker/model-scope-worker.js и укажите его адрес в js/config.js');
 const r=await fetch(MODEL_API+'/chat',{method:'POST',signal:sig,headers:{'Content-Type':'application/json'},body:JSON.stringify({model,messages,stream:true})});
 if(!r.ok)throw new Error(await readableApiError(r));
 const rd=r.body.getReader(),dec=new TextDecoder();let buf='',got=false;
 for(;;){const {done,value}=await rd.read();if(done)break;buf+=dec.decode(value,{stream:true});const ls=buf.split('\n');buf=ls.pop();
  for(const l of ls){if(!l.startsWith('data:')||l.includes('[DONE]'))continue;try{const j=JSON.parse(l.slice(5)),d=j.choices?.[0]?.delta?.content;if(typeof d==='string'&&d){got=true;onD(d)}}catch{}}
 }
 return got;
}
async function readableApiError(r){let body='';try{body=await r.text()}catch{};let msg='';try{msg=JSON.parse(body).error?.message||JSON.parse(body).message||''}catch{};
 if(r.status===429)return 'ModelScope временно ограничил частоту запросов (429). Подождите 30–60 секунд и отправьте запрос один раз.';
 if(r.status===401||r.status===403)return 'ModelScope не принял токен. Проверьте секрет MODELSCOPE_TOKEN в настройках Worker.';
 if(r.status===404)return 'Модель или API-маршрут не найдены (404). Проверьте имя модели в Worker.';
 if(r.status===400)return 'Модель отклонила формат запроса (400)'+(msg?': '+msg.slice(0,220):'. Проверьте вложения и историю чата.');
 return `ModelScope вернул ошибку ${r.status}`+(msg?`: ${msg.slice(0,220)`:'.');
}
async function tryChain(list,messages,onD,sig,label){
 label('DeepSeek-V4 · ModelScope');
 const ok=await stream('deepseek-ai/DeepSeek-V4.1-Flash',messages,onD,sig);
 if(!ok)throw new Error('DeepSeek-V4 вернул пустой ответ. Попробуйте ещё раз чуть позже.');
}
const IMG_RE=/нарису|сгенерир\w*\s+(?:\S+\s+)?(?:картин|изображ|фот|арт|логотип|иллюстр)|созда\w+\s+(?:\S+\s+)?(?:картин|изображ|арт|логотип|иллюстр)|нарисов|(?:generate|create|draw)\s+(?:an?\s+)?(?:image|picture|logo|art)|\bdraw\b/i;
async function draw(am,t,sig){
 if(!MODEL_API)throw new Error('Генерация картинок ещё не подключена: настройте ModelScope Worker в js/config.js');
 am.m='Qwen-Image · ModelScope';live(am);
 const r=await fetch(MODEL_API+'/image',{method:'POST',signal:sig,headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:t})});
 if(!r.ok)throw new Error(await readableApiError(r));
 const result=await r.json();if(!result.url)throw new Error('ModelScope завершил задачу без ссылки на изображение.');
 am.img=result.url;am.t='Готово, сэр. Изображение создано моделью Qwen-Image.';
}
const CODE_RE=/zip|архив|проект|сайт|код|скрипт|функци|баг|ошибк|програм|python|javascript|html|css|sql|react|json|```|api\b|class\b|def\b|верстк/i,CODE_EXT=/\.(py|js|ts|jsx|tsx|html|css|json|java|c|cpp|cs|go|rs|php|sql|sh|yml|yaml)$/i;
const SYS='Ты — Bart-beta (Барт), универсальный ИИ-ассистент. Никогда не называй модели, компании и сервисы, на которых ты основан; если спросят — ты Bart-beta. Обращайся к пользователю «сэр». Отвечай на языке пользователя (по умолчанию по-русски), по делу, в Markdown. Код — только в блоках ``` с указанием языка. Когда просят создать файлы, проект или ZIP-архив, выдавай каждый файл отдельным блоком, где после языка стоит имя файла или путь, например: ```python app.py или ```html site/index.html. Сайт сам соберёт из них ZIP-кнопкой под ответом, поэтому не говори, что не можешь создавать архивы. Прикреплённые пользователем файлы (PDF, Word, Excel, PowerPoint, ZIP, код и др.) ты видишь как текст в сообщении.';
function build(hist){
 const tail=hist.slice(-8);let chars=0;
 const msgs=tail.map((m,j)=>{
  if(m.r!=='user')return {role:'assistant',content:(clean(m.t)||'…').slice(-5000)};
  const files=(m.a||[]).filter(a=>a.x).map(a=>`\n\n[Файл: ${a.n}]\n${a.x.slice(0,5000)}`).join('');
  let t=((m.t||'')+files).slice(-6500);const imgs=(m.a||[]).filter(a=>a.k==='img');
  // Only the most recent user turn sends actual image payloads. Older turns become short references,
  // preventing the request from growing without bound and avoiding content-array 400 errors.
  const latest=j===tail.length-1;
  if(latest&&imgs.length){const parts=[{type:'text',text:t||'Опиши приложенные изображения.'},...imgs.slice(0,4).map(a=>({type:'image_url',image_url:{url:a.u||DATA.get(a),detail:'low'}})).filter(p=>p.image_url.url)];return {role:'user',content:parts}}
  return {role:'user',content:(t+imgs.map(a=>`\n[Изображение: ${a.n}]`).join('')).slice(-6500)||'…'};
 });
 // Hard cap total prompt size to avoid TPM/context-limit errors on long chats.
 for(let i=msgs.length-1;i>=0;i--){const m=msgs[i];if(typeof m.content==='string'){const room=Math.max(600,22000-chars);m.content=m.content.slice(-room);chars+=m.content.length}else{const txt=m.content[0]?.text||'';chars+=txt.length}}
 while(msgs.length>2&&chars>22000){const x=msgs.shift();if(typeof x.content==='string')chars-=x.content.length;}
 return [{role:'system',content:SYS},...msgs];
}
async function run(c,am){
 const hist=c.msgs.slice(0,-1),last=hist[hist.length-1],att=last.a||[];
 if(IMG_RE.test(last.t||'')&&!att.some(a=>a.k=='img'))return draw(am,last.t,ctl.signal);
 const img=att.some(a=>a.k=='img'),code=CODE_RE.test(last.t||'')||att.some(a=>a.k=='file'&&CODE_EXT.test(a.n));
 const upd=()=>live(am),lab=x=>{am.m=(am.pre?am.pre+' → ':'')+x;upd()};let msgs=build(hist);
 const go=(k)=>chain(k).then(l=>tryChain(l,msgs,d=>{am.t+=d;upd()},ctl.signal,lab));
 if(img&&(code||att.some(a=>a.x))){ // два шага: vision «видит», потом код/рассуждение отвечает
  let desc='';const lastContent=msgs[msgs.length-1]?.content;const imageParts=Array.isArray(lastContent)?lastContent.filter(p=>p.type==='image_url'):[];const vm=[{role:'user',content:[{type:'text',text:'Подробно опиши изображение, дословно перепиши весь видимый текст и код.'},...imageParts]}];
  await tryChain(await chain('vision'),vm,d=>desc+=d,ctl.signal,lab);am.pre=am.m;
  msgs=msgs.map(m=>Array.isArray(m.content)?{role:'user',content:m.content[0].text+'\n\n[Описание изображений от vision-модели]\n'+desc}:m);
  return go(code?'code':'text')}
 return go(img?'vision':code?'code':'text')}

/* ---------- UI: чат ---------- */
function renderList(list){CH=list;const q=$('#q').value.toLowerCase();
 $('#list').innerHTML=list.filter(c=>c.title.toLowerCase().includes(q)).map(c=>`<div class="ci ${S.chat?.id==c.id?'on':''}" data-id="${c.id}"><span>${esc(c.title)}</span><button data-del="${c.id}">${ic('delete')}</button></div>`).join('')}
function fileIcon(name){const e=(name.split('.').pop()||'FILE').toLowerCase();const map={pdf:'file-text',doc:'file-text',docx:'file-text',xls:'table',xlsx:'table',ppt:'presentation',pptx:'presentation',zip:'archive',rar:'archive',7z:'archive',js:'code',ts:'code',py:'code',html:'code',css:'code',json:'braces',txt:'file-text',md:'file-text',mp3:'music',wav:'music',mp4:'film',mov:'film'};return map[e]||'file'}
const fileSvg={file:sv('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8'), 'file-text':sv('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8'),table:sv('M3 4h18v16H3zM3 10h18M9 4v16M15 4v16'),presentation:sv('M3 4h18v12H3zM12 16v5M8 21h8'),archive:sv('M4 4h16v16H4zM9 4v4h6V4M10 12h4M10 15h4'),code:sv('m8 8-4 4 4 4m8-8 4 4-4 4m-3-10-2 12'),braces:sv('M8 4H6a2 2 0 0 0-2 2v3a2 2 0 0 1-2 3 2 2 0 0 1 2 3v3a2 2 0 0 0 2 2h2M16 4h2a2 2 0 0 1 2 2v3a2 2 0 0 0 2 3 2 2 0 0 0-2 3v3a2 2 0 0 1-2 2h-2'),music:sv('M9 18V5l12-2v13M9 18a3 3 0 1 1-3-3c1.7 0 3 1 3 3zm12-2a3 3 0 1 1-3-3c1.7 0 3 1 3 3z'),'film':sv('M4 4h16v16H4zM4 8h16M4 16h16M8 4v4M16 4v4M8 16v4M16 16v4')};
function renderMsgs(){const c=S.chat;$('#hero').hidden=!!c?.msgs.length;$('#ttl').textContent=c?.title||'Новый чат';
 $('#msgs').innerHTML=(c?.msgs||[]).map((m,i)=>m.r==='user'?`<div class="m u"><div class="b">${(()=>{const imgs=(m.a||[]).filter(a=>a.k==='img'),files=(m.a||[]).filter(a=>a.k!=='img');return `${imgs.length?`<div class="media-album count-${Math.min(imgs.length,4)}">${imgs.slice(0,4).map((a,j)=>`<a class="album-item" href="${esc(a.u||'#')}" ${a.u?'target="_blank" rel="noopener"':''} aria-label="Открыть изображение ${j+1}"><img src="${esc(a.u||DATA.get(a)||'')}" loading="lazy" alt="${esc(a.n||'Изображение')}">${imgs.length>4&&j===3?`<span class="album-more">+${imgs.length-4}</span>`:''}</a>`).join('')}</div>`:''}${files.map(a=>`<div class="file-card"><span class="file-icon">${fileSvg[fileIcon(a.n)]||fileSvg.file}</span><span class="file-info"><strong>${esc(a.n)}</strong><small>${esc(a.mime||'Файл')} · ${esc(a.sizeLabel||'вложение')}</small></span><span class="file-ext">${esc((a.n.split('.').pop()||'FILE').slice(0,5).toUpperCase())}</span></div>`).join('')}`})()}${esc(m.t)}</div></div>`
  :`<div class="m a"><img class="av" src="${LOGO}"><div class="b"><div class="md">${md(m.t)||'<span class="dots"><i></i><i></i><i></i></span>'}</div>${m.img?`<div class="gen"><img src="${esc(m.img)}" alt="Созданное изображение"><a href="${esc(m.img)}" target="_blank" rel="noopener">${ic('download')} Открыть / скачать</a></div>`:''}<div class="act"><button data-a="cp">${ic('copyIcon')}</button>${namedFiles(m.t).length?`<button data-a="zip" data-mi="${i}" class="zipb">${ic('download')} ZIP · ${namedFiles(m.t).length}</button>`:''}<span class="meta">${esc(m.m||'')}</span></div></div></div>`).join('');
 $('#msgs').scrollTop=1e9;renderList(CH)}
let raf=0;function live(am){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;const e=$('#msgs .m.a:last-child');if(!e)return;$('.md',e).innerHTML=md(am.t)||'<span class="dots"><i></i><i></i><i></i></span>';$('.meta',e).textContent=am.m||'';$('#msgs').scrollTop=1e9})}
async function send(){
 if(S.busy){ctl?.abort();return}
 const t=$('#inp').value.trim(),fl=S.files.filter(f=>f.ok);if(!t&&!fl.length||S.files.some(f=>!f.ok&&!f.err))return;
 S.files=[];chips();$('#inp').value='';grow();
 const c=S.chat||(S.chat=newChat()),um={r:'user',t,a:fl.map(f=>{const a={k:f.k,n:f.n,u:f.url||null,x:f.text||null,sizeLabel:f.sizeLabel||'',mime:f.mime||''};if(f.data)DATA.set(a,f.data);return a})},am={r:'assistant',t:'',m:''};
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
$('#msgs').onclick=async e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a;
 if(a=='cp'){navigator.clipboard.writeText($('.md',b.closest('.m')).innerText);return}
 if(a=='zip'){await lib(JSZ);const z=new JSZip();namedFiles(S.chat.msgs[b.dataset.mi].t).forEach(([n,c])=>z.file(n,c));dlBlob(await z.generateAsync({type:'blob'}),'bart-project.zip');return}
 const code=$('code',b.closest('.code')).textContent;
 if(a=='copy'){navigator.clipboard.writeText(code);const h=b.innerHTML;b.textContent='Готово ✓';setTimeout(()=>b.innerHTML=h,1200)}
 if(a=='dl')dlBlob(new Blob([code]),b.dataset.n||'bart-code.'+(EXT[b.dataset.l]||b.dataset.l||'txt'));
 if(a=='run'){$('#modal iframe').srcdoc=code;$('#modal').hidden=false}};
$('#mx').onclick=()=>{$('#modal').hidden=true;$('#modal iframe').srcdoc=''};

/* ---------- файлы и картинки ---------- */
function chips(){$('#chips').innerHTML=S.files.map((f,i)=>`<span class="pending-file ${f.err?'bad':''}"><span class="pending-icon">${ic(f.k==='img'?'camera':'attachFile')}</span><span class="pending-info"><b>${esc(f.n)}</b><small>${esc(f.sizeLabel||'Подготовка…')}${f.err?' · '+esc(f.err):f.ok?' · готово':' · обрабатывается'}</small></span><button type="button" data-r="${i}" aria-label="Убрать вложение">×</button></span>`).join('')}
$('#chips').onclick=e=>{const r=e.target.dataset.r;if(r!=null){S.files.splice(r,1);chips()}};
const shrink=async f=>{if(f.type==='image/gif'||f.type==='image/svg+xml')return await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(f)});const b=await createImageBitmap(f),k=Math.min(1,1440/Math.max(b.width,b.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(b.width*k));c.height=Math.max(1,Math.round(b.height*k));const x=c.getContext('2d',{alpha:false});x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(b,0,0,c.width,c.height);b.close?.();return c.toDataURL('image/jpeg',.68)};
async function up(d){const fd=new FormData();fd.append('image',d.split(',')[1]);const j=await(await fetch('https://api.imgbb.com/1/upload?key='+K.imgbb,{method:'POST',body:fd})).json();if(!j.data)throw 0;return j.data.url}
const JSZ=CDN+'jszip/3.10.1/jszip.min.js',XLS=CDN+'xlsx/0.18.5/xlsx.full.min.js';
const ent=x=>x.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,'&');
const xmlText=x=>ent(x.replace(/<(script|style)[\s\S]*?<\/\1>/gi,'').replace(/<\/(?:text:p|text:h|p|div|h\d|li|tr)>|<br\s*\/?>/gi,'\n').replace(/<[^>]+>/g,' ')).replace(/[ \t]+/g,' ').replace(/\s*\n\s*/g,'\n').trim();
const TXT_IN_ZIP=/\.(txt|md|csv|json|xml|ya?ml|toml|ini|cfg|py|js|mjs|ts|jsx|tsx|html?|css|scss|c|cpp|h|hpp|java|kt|php|rb|swift|go|rs|sql|sh|bash|bat|ps1|ipynb|vue|svelte|lua|r|cs|dart|log)$|(^|\/)(Dockerfile|Makefile|README[^\/]*|\.env[^\/]*)$/i;
async function readFile(f,it){
 const ext=f.name.toLowerCase().split('.').pop(),buf=()=>f.arrayBuffer();
 if(f.type.startsWith('image/')||/^(jpe?g|png|gif|webp)$/.test(ext)){it.k='img';it.data=await shrink(f);it.url=await up(it.data).catch(()=>null);return}
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
 else{if(f.size>3e6)throw new Error('текстовый файл больше 3 МБ');const t=await f.text();if(/\u0000/.test(t)||(t.match(/\uFFFD/g)||[]).length>20){it.text=`[Файл «${f.name}» прикреплён (${f.type||'неизвестный тип'}, ${it.sizeLabel}), но браузер не умеет извлечь из этого формата текст. Попроси пользователя конвертировать его в PDF/TXT или поддерживаемый документ.]`}else it.text=t}
}
const humanSize=n=>n<1024?`${n} Б`:n<1048576?`${(n/1024).toFixed(1)} КБ`:`${(n/1048576).toFixed(1)} МБ`;
async function addFiles(list){for(const f of list){const it={n:f.name||'photo.jpg',k:'file',mime:f.type||'Файл',sizeLabel:humanSize(f.size),size:f.size};S.files.push(it);chips();
 try{await readFile(f,it);if(it.text&&it.text.length>MAX)it.text=it.text.slice(0,MAX)+'\n…[текст обрезан]';it.ok=true}catch(e){it.err=e.message||'ошибка'}chips()}}
/* ---------- голосовой ввод (Whisper) ---------- */
let rec,chunks;
async function mic(){const b=$('#mic');if(rec){rec.stop();return}
 try{const st=await navigator.mediaDevices.getUserMedia({audio:true});chunks=[];rec=new MediaRecorder(st);rec.ondataavailable=e=>chunks.push(e.data);
  rec.onstop=async()=>{st.getTracks().forEach(t=>t.stop());b.classList.remove('rec');b.innerHTML=ic('mic');const bl=new Blob(chunks,{type:rec.mimeType});rec=null;if(bl.size<1500)return;
   $('#inp').placeholder='Распознаю речь…';
   try{const fd=new FormData();fd.append('file',bl,'voice.'+(bl.type.includes('mp4')?'mp4':'webm'));fd.append('model','whisper-large-v3-turbo');
    const r=await fetch(P.groq.url+'/audio/transcriptions',{method:'POST',headers:{Authorization:'Bearer '+P.groq.key},body:fd});if(!r.ok)throw new Error(r.status);
    $('#inp').value=($('#inp').value+' '+(await r.json()).text).trim();grow();$('#inp').focus()}catch(e){toast('Не удалось распознать речь ('+e.message+')')}finally{$('#inp').placeholder='Напишите сообщение…'}};
  rec.start();b.classList.add('rec');b.innerHTML=ic('stop')}catch(e){toast('Нет доступа к микрофону — разрешите его в настройках браузера для этого сайта')}}
$('#mic').onclick=mic;
$('#clip').onclick=()=>$('#fi').click();$('#cam').onclick=()=>$('#ci').click();
$('#fi').onchange=$('#ci').onchange=e=>{addFiles([...e.target.files]);e.target.value=''};
$('#inp').onpaste=e=>{const f=[...e.clipboardData.files];if(f.length){e.preventDefault();addFiles(f)}};
let dragDepth=0;addEventListener('dragenter',e=>{if(!e.dataTransfer?.types?.includes('Files'))return;e.preventDefault();dragDepth++;document.body.classList.add('file-drag')});addEventListener('dragover',e=>{if(e.dataTransfer?.types?.includes('Files'))e.preventDefault()});addEventListener('dragleave',e=>{if(!e.dataTransfer?.types?.includes('Files'))return;dragDepth=Math.max(0,dragDepth-1);if(!dragDepth)document.body.classList.remove('file-drag')});addEventListener('drop',e=>{if(!e.dataTransfer?.files?.length)return;e.preventDefault();dragDepth=0;document.body.classList.remove('file-drag');addFiles([...e.dataTransfer.files])});

$('#theme').onclick=()=>{const t=document.documentElement.dataset.theme,d=t?t=='dark':matchMedia('(prefers-color-scheme:dark)').matches,n=d?'light':'dark';document.documentElement.dataset.theme=n;localStorage.bart_theme=n};
/* ---------- вход: Firebase Auth (почта и Google) ---------- */
const show=n=>['auth','verify','app'].forEach(s=>$('#'+s).hidden=s!=n);
const ER={'auth/invalid-credential':'Неверная почта или пароль','auth/email-already-in-use':'Эта почта уже зарегистрирована','auth/weak-password':'Пароль должен содержать не менее 6 символов','auth/too-many-requests':'Слишком много попыток. Подожди немного и попробуй снова','auth/missing-password':'Введите пароль','auth/operation-not-allowed':'Этот способ входа не включён в Firebase','auth/popup-closed-by-user':'Окно входа Google закрыто до завершения','auth/popup-blocked':'Браузер заблокировал окно Google. Разреши всплывающие окна для сайта','auth/unauthorized-domain':'Домен сайта не добавлен в Firebase: Authentication → Settings → Authorized domains','auth/network-request-failed':'Не удалось подключиться к Firebase. Проверь интернет или отключи блокировщик для сайта','auth/invalid-email':'Проверь адрес электронной почты'};
const er=e=>ER[e.code]||e.message||'Неизвестная ошибка',fail=(m,id='err')=>$('#'+id).textContent=m;
let authMode='login';function setAuthMode(mode){authMode=mode;$$('[data-auth-mode]').forEach(b=>b.classList.toggle('on',b.dataset.authMode===mode));$('#auth-submit').textContent=mode==='login'?'Войти':'Создать аккаунт';$('#pw').autocomplete=mode==='login'?'current-password':'new-password';$('#reset').hidden=mode!=='login';fail('')}
$$('[data-auth-mode]').forEach(b=>b.onclick=()=>setAuthMode(b.dataset.authMode));
async function enter(u){uid=u?u.uid:'local';fs=u?{...fb.f,db:fb.db}:null;S.chat=null;unl?.();show('app');$('#who').textContent=u?(u.email||u.displayName||'Аккаунт Google'):'Локальный режим';$('#out').hidden=!u;$('#dev').textContent=u?'':'данные только на этом устройстве';unl=db.list(l=>{renderList(l);if(!S.busy&&!S.chat)renderMsgs()});renderMsgs();if(u){const did=localStorage.bart_dev||(localStorage.bart_dev=Math.random().toString(36).slice(2,8)),R=fb.d,pr=R.ref(fb.rt,`presence/${uid}/${did}`);R.set(pr,{ua:navigator.userAgent.slice(0,60),t:Date.now()});R.onDisconnect(pr).remove();R.onValue(R.ref(fb.rt,`presence/${uid}`),s=>$('#dev').textContent='☁ синхронизация · онлайн: '+Object.keys(s.val()||{}).length)}}
let vt;async function boot(){if(FB.apiKey.startsWith('PASTE'))return enter(null);const m=await Promise.all(['app','auth','firestore','database'].map(n=>import(`${G}firebase-${n}.js`)));const app=m[0].initializeApp(FB);fb={au:m[1],f:m[2],d:m[3],auth:m[1].getAuth(app),db:m[2].getFirestore(app),rt:m[3].getDatabase(app)};const A=fb.au;
 A.onAuthStateChanged(fb.auth,u=>{clearInterval(vt);if(!u){unl?.();show('auth');return}if(u.email&&!u.emailVerified&&!u.providerData.some(p=>p.providerId==='google.com')){$('#vem').textContent=u.email;show('verify');vt=setInterval(async()=>{try{await u.reload();if(u.emailVerified){clearInterval(vt);enter(u)}}catch(e){}},4000);return}enter(u)});
 $('#f-email').onsubmit=async e=>{e.preventDefault();fail('');const email=$('#em').value.trim(),password=$('#pw').value;if(password.length<6){fail('Пароль должен содержать не менее 6 символов');return}const submit=$('#auth-submit');submit.disabled=true;submit.textContent='Подождите…';try{if(authMode==='login')await A.signInWithEmailAndPassword(fb.auth,email,password);else{const r=await A.createUserWithEmailAndPassword(fb.auth,email,password);await A.sendEmailVerification(r.user)}}catch(x){fail(er(x))}finally{submit.disabled=false;submit.textContent=authMode==='login'?'Войти':'Создать аккаунт'}};
 $('#google').onclick=async()=>{fail('');const b=$('#google');b.disabled=true;try{const provider=new A.GoogleAuthProvider();if(matchMedia('(pointer: coarse)').matches)await A.signInWithRedirect(fb.auth,provider);else await A.signInWithPopup(fb.auth,provider)}catch(x){fail(er(x));b.disabled=false}};A.getRedirectResult(fb.auth).catch(x=>fail(er(x)));
 $('#reset').onclick=async()=>{const email=$('#em').value.trim();if(!email){fail('Сначала введи свою почту');$('#em').focus();return}try{await A.sendPasswordResetEmail(fb.auth,email);fail('Ссылка для сброса пароля отправлена на почту')}catch(x){fail(er(x))}};
 $('#vok').onclick=async()=>{try{const u=fb.auth.currentUser;await u.reload();u.emailVerified?enter(u):fail('Почта ещё не подтверждена','verr')}catch(x){fail(er(x),'verr')}};$('#vre').onclick=async()=>{try{await A.sendEmailVerification(fb.auth.currentUser);fail('Письмо отправлено','verr')}catch(x){fail(er(x),'verr')}};$('#vout').onclick=$('#out').onclick=()=>A.signOut(fb.auth)}
boot().catch(e=>{console.error(e);alert('Firebase не запустился: '+e.message+'\nРежим без аккаунта.');enter(null)});


