import {CFG} from './config.js';
import {FB} from './firebase-config.js';
const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const K=Object.fromEntries(Object.entries(CFG).map(([k,v])=>[k,atob(v)]));
const P={groq:{url:'https://api.groq.com/openai/v1',key:K.groq},samba:{url:'https://api.sambanova.ai/v1',key:K.samba}};
const MAX=12000,LOGO='https://i.ibb.co/1pCX2Nr/image-Photoroom.png',G='https://www.gstatic.com/firebasejs/10.12.2/';
const B='https://allwebs.ru/images/2026/09/';
const IC={menu:['12/5c073ae07e0c1c31825b36dc713376df.md','☰'],plus:['12/17eb5afb1824c1df94b6062b8c4f215d.md','＋'],send:['10/1b75f644fd3f052872866c4329a81cc9.md','➤'],clip:['12/efb9b68b9a01c3b4a18e760508c0c924.md','📎'],x:['10/893379a0e3d94296b2c4f44951cc15ea.md','⎋'],del:['12/5953f7a1f560fa61d3226928e8e9cd12.md','🗑'],cam:['12/a194d97406bde19136714cbcd941817c.md','📷']};
const ic=n=>`<img class="ic" src="${B}${IC[n][0]}.png" alt="" onerror="this.outerHTML='<span class=ic>${IC[n][1]}</span>'">`;
$$('[data-ic]').forEach(e=>e.innerHTML=ic(e.dataset.ic));
const loaded={};const lib=u=>loaded[u]??=new Promise((r,j)=>{const s=document.createElement('script');s.src=u;s.onload=r;s.onerror=()=>j(new Error('не загрузилась библиотека'));document.head.append(s)});
const CDN='https://cdnjs.cloudflare.com/ajax/libs/';

/* ---------- markdown ---------- */
marked.use({renderer:{code(c,l){const lang=(l||'').split(/\s/)[0];const v=lang&&hljs.getLanguage(lang)?hljs.highlight(c,{language:lang}).value:hljs.highlightAuto(c).value;
 return `<div class="code"><div class="ch"><span>${esc(lang||'code')}</span><span><button data-a="copy">Копировать</button><button data-a="dl" data-l="${esc(lang)}">Скачать</button>${/html|svg/.test(lang)?'<button data-a="run">▶ Запуск</button>':''}</span></div><pre><code class="hljs">${v}</code></pre></div>`}}});
const md=t=>DOMPurify.sanitize(marked.parse(t||''),{ADD_ATTR:['data-a','data-l']});
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

/* ---------- AI: роутер моделей ---------- */
const mc={};
async function ml(p){return mc[p]??=fetch(P[p].url+'/models',{headers:{Authorization:'Bearer '+P[p].key}}).then(r=>r.json()).then(j=>(j.data||[]).map(x=>x.id).filter(i=>!/whisper|guard|orpheus|tts|embed|safeguard|playai/i.test(i))).catch(()=>[])}
async function chain(kind){
 const [g,s]=await Promise.all([ml('groq'),ml('samba')]),o=[],add=(p,l,re,n=9)=>l.filter(m=>re.test(m)).slice(0,n).forEach(m=>o.push([p,m]));
 if(kind=='vision'){add('samba',s,/maverick|vision|vl\b|-vl|llama-?4/i,2);add('groq',g,/scout|maverick|llama-4/i);o.push(['samba','Llama-4-Maverick-17B-128E-Instruct'],['groq','meta-llama/llama-4-scout-17b-16e-instruct'])}
 else{for(const re of kind=='code'?[/coder/i,/gpt-oss-120b/i,/llama-3\.3-70b/i]:[/gpt-oss-120b/i,/llama-3\.3-70b/i,/qwen3-32b/i])add('groq',g,re,1);
  add('samba',s,/70b|gpt-oss|deepseek/i,1);o.push(['groq','openai/gpt-oss-120b'],['groq','llama-3.3-70b-versatile'])}
 return o.filter((x,i)=>o.findIndex(y=>y[1]==x[1]&&y[0]==x[0])==i)}
async function stream(p,model,messages,onD,sig){
 const body={model,messages,stream:true,temperature:.6,max_tokens:4096};
 if(/gpt-oss/.test(model))body.reasoning_effort='medium';if(/qwen3/.test(model)&&p=='groq')body.reasoning_format='hidden';
 const r=await fetch(P[p].url+'/chat/completions',{method:'POST',signal:sig,headers:{'Content-Type':'application/json',Authorization:'Bearer '+P[p].key},body:JSON.stringify(body)});
 if(!r.ok)throw new Error(`${p} ${r.status}: ${(await r.text()).slice(0,160)}`);
 const rd=r.body.getReader(),dec=new TextDecoder();let buf='',got=false;
 for(;;){const {done,value}=await rd.read();if(done)break;buf+=dec.decode(value,{stream:true});const ls=buf.split('\n');buf=ls.pop();
  for(const l of ls){if(!l.startsWith('data:')||l.includes('[DONE]'))continue;try{const d=JSON.parse(l.slice(5)).choices?.[0]?.delta?.content;if(d){got=true;onD(d)}}catch{}}}
 return got}
async function tryChain(list,messages,onD,sig,label){let err;
 for(const [p,m] of list){try{label(`${p==='groq'?'Groq':'SambaNova'} · ${m.split('/').pop()}`);if(await stream(p,m,messages,onD,sig))return}catch(e){if(e.name=='AbortError')throw e;err=e}}
 throw err||new Error('Ни одна модель не ответила')}
const CODE_RE=/код|скрипт|функци|баг|ошибк|програм|python|javascript|html|css|sql|react|json|```|api\b|class\b|def\b|верстк/i,CODE_EXT=/\.(py|js|ts|jsx|tsx|html|css|json|java|c|cpp|cs|go|rs|php|sql|sh|yml|yaml)$/i;
const SYS='Ты — Барт, универсальный ИИ-ассистент. Обращайся к пользователю «сэр». Отвечай на языке пользователя (по умолчанию по-русски), по делу, в Markdown. Код — только в блоках ``` с указанием языка; для нескольких файлов давай отдельный блок на каждый, перед ним название файла.';
function build(hist){
 const li=hist.map(m=>m.a?.some(a=>a.k=='img')).lastIndexOf(true);
 return [{role:'system',content:SYS},...hist.slice(-12).map((m,j,arr)=>{const i=hist.length-arr.length+j;
  if(m.r!='user')return {role:'assistant',content:m.t||'…'};
  let t=(m.t||'')+(m.a||[]).filter(a=>a.x).map(a=>`\n\n[Файл: ${a.n}]\n${a.x}`).join('');
  const im=(m.a||[]).filter(a=>a.k=='img');
  if(i==li&&im.length)return {role:'user',content:[{type:'text',text:t||'Опиши изображение.'},...im.slice(0,4).map(a=>({type:'image_url',image_url:{url:DATA.get(a)||a.u}}))]};
  return {role:'user',content:t+im.map(a=>`\n[изображение: ${a.n}]`).join('')||'…'}})]}
async function run(c,am){
 const hist=c.msgs.slice(0,-1),last=hist[hist.length-1],att=last.a||[];
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
 $('#list').innerHTML=list.filter(c=>c.title.toLowerCase().includes(q)).map(c=>`<div class="ci ${S.chat?.id==c.id?'on':''}" data-id="${c.id}"><span>${esc(c.title)}</span><button data-del="${c.id}">${ic('del')}</button></div>`).join('')}
function renderMsgs(){const c=S.chat;$('#hero').hidden=!!c?.msgs.length;$('#ttl').textContent=c?.title||'Новый чат';
 $('#msgs').innerHTML=(c?.msgs||[]).map(m=>m.r=='user'?`<div class="m u"><div class="b">${(m.a||[]).map(a=>a.k=='img'?`<img class="th" src="${esc(a.u||DATA.get(a)||'')}">`:`<span class="chip">📄 ${esc(a.n)}</span>`).join('')}${esc(m.t)}</div></div>`
  :`<div class="m a"><img class="av" src="${LOGO}"><div class="b"><div class="md">${md(m.t)||'<span class="dots"><i></i><i></i><i></i></span>'}</div><div class="meta">${esc(m.m||'')}</div></div></div>`).join('');
 $('#msgs').scrollTop=1e9;renderList(CH)}
let raf=0;function live(am){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;const e=$('#msgs .m.a:last-child');if(!e)return;$('.md',e).innerHTML=md(am.t)||'<span class="dots"><i></i><i></i><i></i></span>';$('.meta',e).textContent=am.m||'';$('#msgs').scrollTop=1e9})}
async function send(){
 if(S.busy){ctl?.abort();return}
 const t=$('#inp').value.trim(),fl=S.files.filter(f=>f.ok);if(!t&&!fl.length||S.files.some(f=>!f.ok&&!f.err))return;
 S.files=[];chips();$('#inp').value='';grow();
 const c=S.chat||(S.chat=newChat()),um={r:'user',t,a:fl.map(f=>{const a={k:f.k,n:f.n,u:f.url||null,x:f.text||null};if(f.data)DATA.set(a,f.data);return a})},am={r:'assistant',t:'',m:''};
 c.msgs.push(um,am);if(c.msgs.length==2){c.title=(t||fl[0].n).slice(0,40)}
 renderMsgs();follow(c);S.busy=true;ctl=new AbortController();$('#go').innerHTML=ic('x');
 try{await run(c,am)}catch(e){if(e.name!='AbortError')am.t+=(am.t?'\n\n':'')+'⚠️ '+e.message}
 finally{S.busy=false;$('#go').innerHTML=ic('send');c.updated=Date.now();renderMsgs();db.save(c).catch(e=>alert('Не сохранилось: '+e.message))}}
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
$('#msgs').onclick=e=>{const b=e.target.closest('[data-a]');if(!b)return;const code=$('code',b.closest('.code')).textContent,a=b.dataset.a;
 if(a=='copy'){navigator.clipboard.writeText(code);b.textContent='Готово ✓';setTimeout(()=>b.textContent='Копировать',1200)}
 if(a=='dl'){const l=b.dataset.l,x=document.createElement('a');x.href=URL.createObjectURL(new Blob([code]));x.download='bart-code.'+(EXT[l]||l||'txt');x.click()}
 if(a=='run'){$('#modal iframe').srcdoc=code;$('#modal').hidden=false}};
$('#mx').onclick=()=>{$('#modal').hidden=true;$('#modal iframe').srcdoc=''};

/* ---------- файлы и картинки ---------- */
function chips(){$('#chips').innerHTML=S.files.map((f,i)=>`<span class="chip ${f.err?'bad':''}">${f.k=='img'?'🖼':'📄'} ${esc(f.n)} ${f.err?'— '+esc(f.err):f.ok?'':'…'} <b data-r="${i}">✕</b></span>`).join('')}
$('#chips').onclick=e=>{const r=e.target.dataset.r;if(r!=null){S.files.splice(r,1);chips()}};
const shrink=async f=>{const b=await createImageBitmap(f),k=Math.min(1,1600/Math.max(b.width,b.height)),c=document.createElement('canvas');c.width=b.width*k;c.height=b.height*k;c.getContext('2d').drawImage(b,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.85)};
async function up(d){const fd=new FormData();fd.append('image',d.split(',')[1]);const j=await(await fetch('https://api.imgbb.com/1/upload?key='+K.imgbb,{method:'POST',body:fd})).json();if(!j.data)throw 0;return j.data.url}
async function addFiles(list){for(const f of list){const it={n:f.name||'photo.jpg',k:'file'};S.files.push(it);chips();
 try{if(f.type.startsWith('image/')){it.k='img';it.data=await shrink(f);it.url=await up(it.data).catch(()=>null)}
  else if(/\.pdf$/i.test(f.name)){await lib(CDN+'pdf.js/3.11.174/pdf.min.js');pdfjsLib.GlobalWorkerOptions.workerSrc=CDN+'pdf.js/3.11.174/pdf.worker.min.js';const d=await pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise;let s='';for(let i=1;i<=Math.min(d.numPages,40)&&s.length<MAX;i++)s+=(await(await d.getPage(i)).getTextContent()).items.map(x=>x.str).join(' ')+'\n';it.text=s}
  else if(/\.docx$/i.test(f.name)){await lib(CDN+'mammoth/1.6.0/mammoth.browser.min.js');it.text=(await mammoth.extractRawText({arrayBuffer:await f.arrayBuffer()})).value}
  else if(f.size<3e6){it.text=await f.text();if((it.text.match(/\uFFFD/g)||[]).length>20)throw new Error('формат не поддерживается')}
  else throw new Error('файл больше 3 МБ');
  if(it.text)it.text=it.text.slice(0,MAX);it.ok=true}catch(e){it.err=e.message||'ошибка'}chips()}}
$('#clip').onclick=()=>$('#fi').click();$('#cam').onclick=()=>$('#ci').click();
$('#fi').onchange=$('#ci').onchange=e=>{addFiles([...e.target.files]);e.target.value=''};
$('#inp').onpaste=e=>{const f=[...e.clipboardData.files];if(f.length){e.preventDefault();addFiles(f)}};
addEventListener('dragover',e=>e.preventDefault());addEventListener('drop',e=>{e.preventDefault();addFiles([...e.dataTransfer.files])});

/* ---------- вход: Firebase Auth (почта + телефон) ---------- */
const show=n=>['auth','verify','app'].forEach(s=>$('#'+s).hidden=s!=n);
const ER={'auth/invalid-credential':'Неверная почта или пароль','auth/email-already-in-use':'Эта почта уже зарегистрирована','auth/weak-password':'Пароль слишком короткий (от 6 символов)','auth/invalid-phone-number':'Неверный номер, формат: +79991234567','auth/invalid-verification-code':'Неверный код','auth/too-many-requests':'Слишком много попыток, подождите','auth/missing-password':'Введите пароль','auth/operation-not-allowed':'Этот способ входа не включён в Firebase'};
const er=e=>ER[e.code]||e.message,fail=(m,id='err')=>$('#'+id).textContent=m;
async function enter(u){
 uid=u?u.uid:'local';fs=u?{...fb.f,db:fb.db}:null;S.chat=null;unl?.();show('app');
 $('#who').textContent=u?(u.email||u.phoneNumber):'Локальный режим';$('#out').hidden=!u;$('#dev').textContent=u?'':'данные только на этом устройстве';
 unl=db.list(l=>{renderList(l);if(!S.busy&&!S.chat)renderMsgs()});renderMsgs();
 if(u){const did=localStorage.bart_dev||(localStorage.bart_dev=Math.random().toString(36).slice(2,8)),R=fb.d,pr=R.ref(fb.rt,`presence/${uid}/${did}`);
  R.set(pr,{ua:navigator.userAgent.slice(0,60),t:Date.now()});R.onDisconnect(pr).remove();
  R.onValue(R.ref(fb.rt,`presence/${uid}`),s=>$('#dev').textContent='☁ синхронизация · онлайн: '+Object.keys(s.val()||{}).length)}}
let vt;
async function boot(){
 if(FB.apiKey.startsWith('PASTE')){return enter(null)}
 const m=await Promise.all(['app','auth','firestore','database'].map(n=>import(`${G}firebase-${n}.js`)));
 const app=m[0].initializeApp(FB);fb={au:m[1],f:m[2],d:m[3],auth:m[1].getAuth(app),db:m[2].getFirestore(app),rt:m[3].getDatabase(app)};const A=fb.au;
 A.onAuthStateChanged(fb.auth,u=>{clearInterval(vt);if(!u){unl?.();show('auth');return}
  if(u.email&&!u.emailVerified){$('#vem').textContent=u.email;show('verify');vt=setInterval(async()=>{await u.reload();if(u.emailVerified){clearInterval(vt);enter(u)}},4000);return}
  enter(u)});
 $$('.tabs button').forEach(b=>b.onclick=()=>{$$('.tabs button').forEach(x=>x.classList.toggle('on',x==b));$('#f-email').hidden=b.dataset.tab!='email';$('#f-phone').hidden=b.dataset.tab!='phone';fail('')});
 $('#f-email').onsubmit=async e=>{e.preventDefault();fail('');try{await A.signInWithEmailAndPassword(fb.auth,$('#em').value.trim(),$('#pw').value)}catch(x){fail(er(x))}};
 $('#reg').onclick=async()=>{fail('');try{const r=await A.createUserWithEmailAndPassword(fb.auth,$('#em').value.trim(),$('#pw').value);await A.sendEmailVerification(r.user)}catch(x){fail(er(x))}};
 $('#reset').onclick=async()=>{try{await A.sendPasswordResetEmail(fb.auth,$('#em').value.trim());fail('Письмо для сброса отправлено')}catch(x){fail(er(x))}};
 let conf,rv;$('#f-phone').onsubmit=async e=>{e.preventDefault();fail('');try{
  if(!conf){rv??=new A.RecaptchaVerifier(fb.auth,'recaptcha',{size:'invisible'});conf=await A.signInWithPhoneNumber(fb.auth,$('#ph').value.replace(/[\s()-]/g,''),rv);$('#cd').hidden=false;$('#phb').textContent='Подтвердить';$('#cd').focus()}
  else await conf.confirm($('#cd').value.trim())}catch(x){fail(er(x));if(!conf){rv?.clear();rv=null}}};
 $('#vok').onclick=async()=>{const u=fb.auth.currentUser;await u.reload();u.emailVerified?enter(u):fail('Почта ещё не подтверждена','verr')};
 $('#vre').onclick=async()=>{try{await A.sendEmailVerification(fb.auth.currentUser);fail('Письмо отправлено','verr')}catch(x){fail(er(x),'verr')}};
 $('#vout').onclick=$('#out').onclick=()=>A.signOut(fb.auth);}
boot().catch(e=>{console.error(e);alert('Firebase не запустился: '+e.message+'\nРежим без аккаунта.');enter(null)});
