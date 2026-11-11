/* Mosaic 2.5.31 — ordered app script 08 of 22. */
/* ---------- additions 10: polish (self-contained, safe to remove) ---------- */
try{(()=>{
 let lastT=null;
 const nHTML=n=>n?n+(n===1?' title':' titles'):'Nothing yet';
 const I={heart:'<path d="M12 20.5s-8-4.9-8-10.6A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 8 2.3c0 5.7-8 10.6-8 10.6z"/>',mark:'<path d="M6 3h12v18l-6-4-6 4z"/>',cont:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',pl:'<path d="M4 6h12M4 12h12M4 18h7M18 15v6M15 18h6"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1 1-1.1 1.8M12 17h.01"/>'};
 const row=(k,ic,bg,t,sub)=>`<button class="lr" data-lj="${k}"><i style="background:${bg}"><svg viewBox="0 0 24 24" aria-hidden="true">${I[ic]}</svg></i><span><b>${t}</b><small>${sub}</small></span><svg class="lc" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>`;
 function hub(){
  const A=ITEMS.filter(mine),lk=A.filter(x=>likes[x.id]===1).length,ct=A.filter(cont).length,sv=saved.filter(i=>by(i)).length;
  return '<h2 class="libt">Your Library</h2><div class="lh">'
   +row('Liked','heart','linear-gradient(135deg,#ec4899,#be185d)','Liked',nHTML(lk))
   +row('My List','mark','linear-gradient(135deg,#fb923c,#c2410c)','My List',nHTML(sv))
   +row('Continue','cont','linear-gradient(135deg,#8b5cf6,#5b21b6)','Continue watching',nHTML(ct))
   +row('Playlists','pl','linear-gradient(135deg,#34d399,#047857)','Playlists',pls.length?pls.length+(pls.length===1?' playlist':' playlists'):'Create your first')
   +row('help','help','linear-gradient(135deg,#38bdf8,#1d4ed8)','Help and tour','Tips and the guided tour')+'</div>'}
 function post(){
  try{const m=$('#main');
   if(tab==='l'&&!q){m.insertAdjacentHTML('afterbegin',hub());const e=m.querySelector('.empty');if(e&&/Nothing saved/.test(e.textContent||''))e.insertAdjacentHTML('afterend','<div class="btns" style="justify-content:center;margin:-2px 0 12px"><button class="b" data-go="m">Browse films</button></div>')}
   if(tab==='home'&&!q&&!ITEMS.some(x=>x.user)){const h=m.querySelector('.hero'),c=m.querySelector('.cta');if(h&&c&&h.insertAdjacentElement)h.insertAdjacentElement('afterend',c)}
  }catch(e){}}
 const r10=render;
 render=()=>{r10();
  try{if(tab!==lastT){lastT=tab;const m=$('#main');if(m&&m.classList){m.classList.remove('pgin');void m.offsetWidth;m.classList.add('pgin')}}}catch(e){}
  post()};
 document.addEventListener('click',e=>{
  const t=e.target;if(!t||!t.closest)return;
  const b=t.closest('[data-lj]');if(!b)return;
  const k=b.dataset.lj;
  if(k==='help'){const h=$('#hlp');if(h)h.click();return}
  const hs=[...document.querySelectorAll('#main h2.rh')],h=hs.find(x=>(x.textContent||'').trim().startsWith(k));
  if(h&&h.scrollIntoView)h.scrollIntoView({behavior:'smooth',block:'start'});
  else toast(k==='Liked'?'Like a title and it shows up here.':'Nothing here yet.')});
 /* player: the long row of secondary buttons sits behind a More toggle */
 try{const mr=document.querySelector('.ctl.mr');if(mr&&document.createElement){const t=document.createElement('button');t.className='b o';t.id='mrt';t.setAttribute('aria-expanded','false');t.textContent='More controls';t.onclick=()=>{const o=mr.classList.toggle('open');t.textContent=o?'Fewer controls':'More controls';t.setAttribute('aria-expanded',String(o))};mr.prepend(t)}}catch(e){}
})()}catch(e){}


;/* grandeur + logic pass (appended block, per CLAUDE.md) */
try{(()=>{const root=document.documentElement,BASE=document.title;
try{const _i=info;info=function(){_i.apply(this,arguments);try{root.style.setProperty('--ah',String(Math.round(cur&&cur.h!=null?cur.h:260)));const ms=navigator.mediaSession;if(ms&&cur&&typeof MediaMetadata!=='undefined'){const a=cur.poster||cur.thumb;ms.metadata=new MediaMetadata({title:cur.t,artist:cur.s||'Mosaic',album:'Mosaic',artwork:a?[{src:a}]:[]})}}catch(e){}}}catch(e){}
try{const _u=ui;ui=function(){_u.apply(this,arguments);try{const t=cur&&playing?cur.t+' on Mosaic':BASE;if(document.title!==t)document.title=t;const ms=navigator.mediaSession;if(ms)ms.playbackState=cur?(playing?'playing':'paused'):'none'}catch(e){}}}catch(e){}
try{const ms=navigator.mediaSession;if(ms){const go=(n,f)=>{try{ms.setActionHandler(n,f)}catch(e){}},tap=id=>()=>{const b=$(id);b&&b.click()};go('play',()=>{if(!playing)tap('#sPlay')()});go('pause',()=>{if(playing)tap('#sPlay')()});go('nexttrack',tap('#nx'));go('previoustrack',tap('#pv'));go('seekbackward',tap('#bk'));go('seekforward',tap('#fw'))}}catch(e){}
try{const k=$('#kb .cnt');if(k&&!k.dataset.x){k.dataset.x='1';k.insertAdjacentHTML('beforeend','<br>N and P: next and previous<br>F: full screen<br>L: like<br>S: save')}
addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||!cur)return;const t=e.target;if(t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable))return;if($('#stage').style.display!=='flex')return;const id={n:'#nx',p:'#pv',f:'#fs',l:'#lk',s:'#sv'}[e.key.toLowerCase()],b=id&&$(id);if(b){e.preventDefault();b.click()}})}catch(e){}
/* hero follows the pointer a little (mouse only, never with reduced motion) */
try{if(matchMedia('(hover:hover) and (prefers-reduced-motion:no-preference)').matches){const m=$('#main'),set=(h,x,y)=>{h.style.setProperty('--px',x+'px');h.style.setProperty('--py',y+'px')};
m.addEventListener('pointermove',e=>{const h=e.target.closest&&e.target.closest('.hero');if(!h)return;const r=h.getBoundingClientRect();set(h,(((e.clientX-r.left)/r.width-.5)*-16).toFixed(1),(((e.clientY-r.top)/r.height-.5)*-10).toFixed(1))});
m.addEventListener('pointerout',e=>{const h=e.target.closest&&e.target.closest('.hero');if(h&&!h.contains(e.relatedTarget))set(h,0,0)})}}catch(e){}
})()}catch(e){}

;/* profiles, Lab Beat Studio */
try{(()=>{
let rr=null;try{rr=render}catch(e){}
/* removing a profile: two taps, always keep one, wipe that profile's data */
try{let T;document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-pdel]');if(!b)return;const id=b.dataset.pdel;
if(PROFILES.length<2){e.stopImmediatePropagation();e.preventDefault();toast('Keep at least one profile.');return}
if(b.dataset.armed!=='1'){e.stopImmediatePropagation();e.preventDefault();b.dataset.armed='1';b.dataset.t0=b.textContent;b.textContent='Tap again to delete';clearTimeout(T);T=setTimeout(()=>{b.dataset.armed='';b.textContent=b.dataset.t0},4000);return}
if(id!=='p1')Object.keys(localStorage).filter(k=>k.startsWith(id+':')).forEach(k=>Storage.prototype.removeItem.call(localStorage,k))},true)}catch(e){}
/* Beat Studio: 6 tracks x 16 steps, on-device WebAudio */
try{const N=['Kick','Snare','Hat','Bass','Clap','Lead'],C=['#f2b24c','#e5637a','#38b58c','#5b7cf0','#d58cff','#61c8f5'],E=()=>N.map(()=>Array(16).fill(0));let G=E(),bpm=100,sw=0,run=false,st=0,nt=0,iv,nb,B=[];
try{B=JSON.parse(localStorage.getItem('mosaic-beats')||'[]')}catch(e){}
const keep=()=>{try{localStorage.setItem('mosaic-beats',JSON.stringify(B))}catch(e){}};
[0,4,8,12].forEach(i=>G[0][i]=1);[4,12].forEach(i=>G[1][i]=1);[2,6,10,14].forEach(i=>G[2][i]=1);[4,12].forEach(i=>G[4][i]=1);[0,7,10,14].forEach(i=>G[5][i]=1);
const env=(g,t,a,d)=>{g.gain.setValueAtTime(a,t);g.gain.exponentialRampToValueAtTime(.001,t+d)};
const noise=()=>{if(nb)return nb;nb=AC.createBuffer(1,AC.sampleRate>>1,AC.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return nb};
const hit=(k,t,i)=>{const g=AC.createGain();g.connect(master);
if(k===1||k===2||k===4){const s=AC.createBufferSource(),f=AC.createBiquadFilter();s.buffer=noise();f.type='highpass';f.frequency.value=k===1?1400:k===2?7000:1100;s.connect(f);f.connect(g);env(g,t,k===1?.55:k===4?.38:.22,k===1?.2:k===4?.13:.05);s.start(t);s.stop(t+.25);return}
const o=AC.createOscillator();if(k===0){o.connect(g);o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(42,t+.12);env(g,t,.9,.32);o.start(t);o.stop(t+.35)}
else if(k===3){const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=320;o.type='sawtooth';o.frequency.value=[55,55,82.4,73.4][i%4];o.connect(f);f.connect(g);env(g,t,.35,.28);o.start(t);o.stop(t+.3)}else{o.type='triangle';o.frequency.value=[220,261.6,293.7,329.6,392,440,392,329.6][i%8];o.connect(g);env(g,t,.22,.2);o.start(t);o.stop(t+.22)}};
const mark=n=>document.querySelectorAll('#bs .sp').forEach(b=>b.classList.toggle('now',n>=0&&+b.dataset.s===n));
const tick=()=>{while(nt<AC.currentTime+.12){G.forEach((r,k)=>{if(r[st])hit(k,nt,st)});const n=st;setTimeout(()=>{if(run)mark(n)},Math.max(0,(nt-AC.currentTime)*1000));nt+=60/bpm/4*(st%2?1-sw:1+sw);st=(st+1)%16}};
const go=()=>{initAudio();if(AC.state==='suspended')AC.resume();if(run){run=false;clearInterval(iv);mark(-1)}else{run=true;st=0;nt=AC.currentTime+.06;iv=setInterval(tick,25)}const p=$('#bsp');if(p)p.textContent=run?'Stop':'Play'};
const html=()=>`<div class="sc" id="bs"><h4>Beat Studio <span class="time">tap the squares, then press play</span></h4><div class="bsb"><button class="b" id="bsp">${run?'Stop':'Play'}</button><button class="b o" data-bs="rand">Surprise pattern</button><button class="b o" data-bs="clr">Clear</button><button class="b o" data-bs="save">Save beat</button><label class="bst">Tempo <input type="range" id="bst" min="60" max="180" value="${bpm}" aria-label="Tempo"><b id="bsv">${bpm}</b></label><label class="bst" style="margin-left:0">Swing <input type="range" id="bsw" min="0" max="40" value="${Math.round(sw*100)}" aria-label="Swing"></label></div><div class="bsg">${G.map((r,k)=>`<div class="bsr" style="--c:${C[k]}"><span>${N[k]}</span>${r.map((v,i)=>`<button class="sp${v?' on':''}${i%4?'':' q'}" data-k="${k}" data-s="${i}" aria-pressed="${!!v}" aria-label="${N[k]} step ${i+1}"></button>`).join('')}</div>`).join('')}</div>${B.length?`<div class="chips" style="padding-top:12px">${B.map((b,i)=>`<span class="bchip"><button class="chip" data-bs="load" data-i="${i}">${esc(b.n)}, ${b.b} bpm</button><button class="chip" data-bs="del" data-i="${i}" aria-label="Remove ${esc(b.n)}">&times;</button></span>`).join('')}</div>`:''}</div>`;
if(rr){render=function(){if(tab!=='x'&&run)go();rr.apply(this,arguments);try{if(tab==='x'&&!$('#bs')){const p=$('#main .cnt');if(p)p.insertAdjacentHTML('afterend',html())}}catch(e){}}}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#bs button');if(!t)return;try{if(t.id==='bsp')return go();
if(t.classList.contains('sp')){const k=+t.dataset.k,i=+t.dataset.s;G[k][i]^=1;t.classList.toggle('on',!!G[k][i]);t.setAttribute('aria-pressed',String(!!G[k][i]));if(!run&&G[k][i]){initAudio();hit(k,AC.currentTime,i)}return}
const a=t.dataset.bs;if(a==='clr')G=E();else if(a==='rand')G=N.map((_,k)=>Array.from({length:16},(_,i)=>+(Math.random()<[.25,.16,.5,.3,.12,.2][k]||(k===0&&i%4===0))));
else if(a==='save'){B.unshift({n:'Beat '+(B.length+1),g:G.map(r=>r.slice()),b:bpm});B=B.slice(0,8);keep();toast('Beat saved')}
else if(a==='load'){const x=B[+t.dataset.i];if(x){G=N.map((_,k)=>Array.from({length:16},(_,i)=>+(x.g[k]?.[i]||0)));bpm=x.b}}else if(a==='del'){B.splice(+t.dataset.i,1);keep()}
const o=$('#bs');if(o)o.outerHTML=html()}catch(x){}});
document.addEventListener('input',e=>{if(e.target.id==='bsw')sw=e.target.value/100;if(e.target.id==='bst'){bpm=+e.target.value;const v=$('#bsv');if(v)v.textContent=bpm}})}catch(e){}
})()}catch(e){}

