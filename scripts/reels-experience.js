/* Mosaic 2.5.31 — ordered app script 07 of 22. */
/* ---------- additions 9: Aurora skin, mobile shell, Reels feed (self-contained, safe to remove) ---------- */
try{(()=>{
 /* a profile that never chose a theme starts in the dark Aurora look (System/Light stay available in Settings) */
 try{if(localStorage.getItem('mosaic-aurora')===null){localStorage.setItem('mosaic-aurora','1');if(th.mode==='system'&&!th.bg&&!th.acc){th.mode='dark';applyTheme()}}}catch(e){}
 try{const qi=$('#q');if(qi)qi.placeholder='Search Mosaic'}catch(e){}
 /* nav labels follow the new design; tab letters stay the same */
 try{const L={c:'Reels',l:'Library'};document.querySelectorAll('#nav button').forEach(b=>{const n=L[b.dataset.t];if(n&&b.lastChild)b.lastChild.textContent=n})}catch(e){}
 const stageOpen=()=>{try{return $('#stage').style.display==='flex'}catch(e){return false}};
 /* centre "+" button and pill tabs (shown on phones only, by CSS) */
 try{const as=document.querySelector('aside');if(as&&document.createElement){const f=document.createElement('button');f.className='fab';f.id='fab';f.setAttribute('aria-label','Add your files');f.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';f.onclick=()=>{const i=$('#f');if(i)i.click()};as.appendChild(f)}}catch(e){}
 try{const top=document.querySelector('.top');if(top&&top.after){const p=document.createElement('div');p.id='pills';p.innerHTML=[['home','For You'],['m','Films'],['a','Music'],['x','Lab']].map(([t,l])=>`<button data-pt="${t}">${l}</button>`).join('');p.onclick=e=>{const b=e.target.closest('button[data-pt]');if(!b)return;const n=document.querySelector('#nav button[data-t="'+b.dataset.pt+'"]');if(n)n.click()};top.after(p)}}catch(e){}
 const sync=()=>{try{document.body.classList.toggle('inreels',tab==='c'&&!q&&!window.__rg);document.body.classList.toggle('reels-view',tab==='c');document.querySelectorAll('#pills button').forEach(b=>b.classList.toggle('on',b.dataset.pt===tab))}catch(e){}};
 /* ---- Reels feed ---- */
 const IC={
  heart:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-8-4.9-8-10.6A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 8 2.3c0 5.7-8 10.6-8 10.6z"/></svg>',
  mark:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
  share:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13"/></svg>',
  play:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
  note:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V6l11-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>'};
 const reelList=()=>ITEMS.filter(x=>x.k==='c'&&vis(x)).sort((a,b)=>!!b.user-!!a.user);
 const sig=l=>l.map(x=>x.id+(likes[x.id]===1?'L':'')+(saved.includes(x.id)?'S':'')+(x.thumb?'T':'')).join('|');
 const reelHTML=x=>{
  const L=likes[x.id]===1,S=saved.includes(x.id),who=esc(x.s||'You'),isV=!!(x.isVid&&x.src);
  const bg=isV?`<video src="${esc(x.src)}" muted loop playsinline preload="metadata"${x.thumb?` poster="${esc(x.thumb)}"`:''}></video>`:(x.poster||x.thumb)?`<img src="${esc(x.poster||x.thumb)}" alt="" loading="lazy">`:scene(x);
  return `<section class="reel" data-rid="${x.id}" aria-label="${esc(x.t)}"><div class="rbg">${bg}</div><div class="rsh"></div>`
   +`<div class="rtop"><span>${x.user?'Yours':'Sample clip'} · ${fmt(x.len)}</span><div class="rtr">${isV?`<button data-ra="snd" aria-label="Turn sound on or off">${window.__rsnd?'Sound on':'Sound off'}</button>`:''}<button data-rg="1" aria-label="Show as a grid">Grid</button></div></div>`
   +`<div class="ract"><button data-ra="like" class="${L?'on':''}" aria-label="Like" aria-pressed="${L}">${IC.heart}<small>${L?'Liked':'Like'}</small></button>`
   +`<button data-ra="save" class="${S?'on':''}" aria-label="Save to Library" aria-pressed="${S}">${IC.mark}<small>${S?'Saved':'Save'}</small></button>`
   +`<button data-ra="share" aria-label="Share">${IC.share}<small>Share</small></button><button data-ra="open" aria-label="Watch full screen">${IC.play}<small>Watch</small></button></div>`
   +`<div class="rinfo"><div class="rby"><i style="background:${G(x.h)}">${esc(String(x.s||'Y').charAt(0).toUpperCase())}</i><b>${who}</b></div><p>${esc(x.t)}</p><button class="raud" data-ra="open">${IC.note}<span>Original audio</span></button></div>`
   +(isV?'<div class="rbar"><i></i></div>':'')+`</section>`};
 let io=null;
 function wire(r){
  if(io){try{io.disconnect()}catch(e){}io=null}
  r.querySelectorAll('.reel').forEach(el=>{const v=el.querySelector('video');if(v)v.ontimeupdate=()=>{const b=el.querySelector('.rbar i');if(b&&v.duration)b.style.width=(v.currentTime/v.duration*100)+'%'}});
  if(typeof IntersectionObserver==='undefined'){const f=r.querySelector('.reel');if(f)f.classList.add('act');return}
  io=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('act',e.isIntersecting&&e.intersectionRatio>=.6)),{root:r,threshold:[0,.6,1]});
  r.querySelectorAll('.reel').forEach(el=>io.observe(el))}
 function paintReels(){
  const m=$('#main'),l=reelList(),s=sig(l),old=document.querySelector('#reels');
  if(old&&old.dataset&&old.dataset.sig===s)return;
  const st=old?old.scrollTop:0;
  m.innerHTML=l.length?`<div id="reels" data-sig="${s}" tabindex="0" aria-label="Reels. Scroll, or use the up and down arrow keys.">${l.map(reelHTML).join('')}</div>`
   :'<h2>Reels</h2><p class="empty">No clips yet. Tap + to add short videos from your device.</p>';
  const r=document.querySelector('#reels');if(r){if(st)r.scrollTop=st;wire(r)}
  try{if(l.length>1&&!sessionStorage.getItem('mosaic-rh')){sessionStorage.setItem('mosaic-rh','1');const f=document.querySelector('#reels .reel');if(f)f.insertAdjacentHTML('beforeend','<div class="rhint" aria-hidden="true">Swipe up for more</div>')}}catch(e){}}
 const stamp=()=>{try{const r=document.querySelector('#reels');if(r&&r.dataset)r.dataset.sig=sig(reelList())}catch(e){}};
 const paintBtns=(el,x)=>{try{const L=likes[x.id]===1,S=saved.includes(x.id),a=el.querySelector('[data-ra="like"]'),b=el.querySelector('[data-ra="save"]');
  if(a){a.classList.toggle('on',L);a.setAttribute('aria-pressed',String(L));const t=a.querySelector('small');if(t)t.textContent=L?'Liked':'Like'}
  if(b){b.classList.toggle('on',S);b.setAttribute('aria-pressed',String(S));const t=b.querySelector('small');if(t)t.textContent=S?'Saved':'Save'}}catch(e){}};
 const buzz=()=>{try{navigator.vibrate&&navigator.vibrate(12)}catch(e){}};
 const rLike=(x,el,on)=>{buzz();likes[x.id]=(on||likes[x.id]!==1)?1:0;savePL();paintBtns(el,x);stamp();toast(likes[x.id]===1?'Liked. We will suggest more like this.':'Rating removed')};
 const rSave=(x,el)=>{buzz();saved=saved.includes(x.id)?saved.filter(i=>i!==x.id):[...saved,x.id];persist();paintBtns(el,x);stamp();toast(saved.includes(x.id)?'Saved to your Library':'Removed from your Library')};
 const rShare=async x=>{const text=x.t+' on Mosaic',url=String(location.href).split('#')[0];
  try{if(navigator.share){await navigator.share({title:x.t,text,url});return}}catch(e){if(e&&e.name==='AbortError')return}
  try{await navigator.clipboard.writeText(text+' '+url);toast('Link copied')}catch(e){toast('Sharing is not available here')}};
 const burst=(el,e)=>{try{const r=el.getBoundingClientRect(),h=document.createElement('div');h.className='rheart';h.innerHTML=IC.heart;h.style.left=((e.clientX||r.left+r.width/2)-r.left)+'px';h.style.top=((e.clientY||r.top+r.height/2)-r.top)+'px';el.appendChild(h);setTimeout(()=>{try{h.remove()}catch(e){}},800)}catch(e){}};
 let tapT=0,tapId='',tapTO=0,reelPausedId='';
 document.addEventListener('click',e=>{
  const t=e.target;if(!t||!t.closest)return;
  /* Home rail "See all" buttons carried data-go but nothing listened to it */
  const go=t.closest('[data-go]');if(go){const n=document.querySelector('#nav button[data-t="'+go.dataset.go+'"]');if(n){n.click();try{scrollTo(0,0)}catch(e){}}return}
  const g=t.closest('[data-rg]');if(g){window.__rg=g.dataset.rg==='1';render();return}
  const el=t.closest('.reel');if(!el)return;
  const id=el.dataset.rid,x=by(id);if(!x)return;
  const ra=t.closest('[data-ra]');
  if(ra){const a=ra.dataset.ra;if(a==='like')rLike(x,el);else if(a==='save')rSave(x,el);else if(a==='share')rShare(x);else if(a==='snd'){window.__rsnd=!window.__rsnd;document.querySelectorAll('#reels [data-ra="snd"]').forEach(b=>b.textContent=window.__rsnd?'Sound on':'Sound off');document.querySelectorAll('#reels video').forEach(v=>{v.muted=!window.__rsnd})}else play(id);return}
  const now=Date.now();
  if(tapId===id&&now-tapT<320){clearTimeout(tapTO);tapT=0;burst(el,e);if(likes[id]!==1)rLike(x,el,true);return}
  tapT=now;tapId=id;clearTimeout(tapTO);tapTO=setTimeout(()=>{tapT=0;const v=el.querySelector('video');if(!v){play(id);return}if(v.paused){reelPausedId='';v.play().catch(()=>toast('Tap Sound on if playback is blocked.'))}else{reelPausedId=id;v.pause()}},330)});
 document.addEventListener('keydown',e=>{
  if(tab!=='c'||q||(e.key!=='ArrowDown'&&e.key!=='ArrowUp'))return;
  const r=document.querySelector('#reels');if(!r||!r.scrollBy)return;
  const tg=e.target&&e.target.tagName;if(tg==='INPUT'||tg==='SELECT'||tg==='TEXTAREA'||document.querySelector('dialog[open]')||stageOpen())return;
  e.preventDefault();r.scrollBy({top:(e.key==='ArrowDown'?1:-1)*r.clientHeight,behavior:'smooth'})});
 /* feed videos play muted, only the visible one, and never behind the full player */
 setInterval(()=>{try{const r=document.querySelector('#reels');if(!r||!r.querySelectorAll)return;const on=tab==='c'&&!stageOpen()&&!document.hidden,active=r.querySelector('.reel.act');if(active&&reelPausedId&&active.dataset.rid!==reelPausedId)reelPausedId='';
  r.querySelectorAll('.reel').forEach(el=>{const v=el.querySelector('video');if(!v)return;const want=on&&el.classList.contains('act')&&el.dataset.rid!==reelPausedId;v.muted=!window.__rsnd;if(want&&v.paused)v.play().catch(()=>{v.muted=true;window.__rsnd=false;v.play().catch(()=>{})});else if(!want&&!v.paused)v.pause()})}catch(e){}},700);
 const rA9=render;
 render=()=>{
  if(tab!=='c')window.__rg=false;
  if(tab==='c'&&!q&&!window.__rg){paintReels()}
  else{rA9();
   if(tab==='home'&&!q){try{const m=$('#main'),hs=[...m.querySelectorAll('h2.rh')],f=hs.find(h=>h.textContent.startsWith('Films')),t=hs.find(h=>h.textContent.startsWith('Top 10'));if(f&&t&&f.nextElementSibling){const w=f.nextElementSibling;m.insertBefore(f,t);m.insertBefore(w,t)}}catch(e){}}
   if(tab==='l'&&!q){try{const A=ITEMS.filter(mine),lk=A.filter(x=>likes[x.id]===1),ct=A.filter(cont),rl=(t,a)=>a.length?`<h2 class="rh">${t}</h2><div class="rail">${a.map(card).join('')}</div>`:'';$('#main').insertAdjacentHTML('afterbegin',rl('Continue watching',ct)+rl('Liked',lk))}catch(e){}}
   if(tab==='c'&&!q){try{$('#main').insertAdjacentHTML('afterbegin','<div class="btns" style="margin-bottom:10px"><button class="b" data-rg="0">Back to Reels</button></div>')}catch(e){}}}
  sync()};
 /* the play button shows an icon; mirror its state in a data attribute for CSS and give it an accessible name */
 try{if(typeof MutationObserver!=='undefined')['#sPlay','#mPlay'].forEach(s=>{const b=$(s);if(!b||!b.setAttribute)return;const f=()=>{const v=(b.textContent||'').trim()==='Play'?'play':'pause';if(b.dataset.s!==v){b.dataset.s=v;b.setAttribute('aria-label',v==='play'?'Play':'Pause')}};f();new MutationObserver(f).observe(b,{childList:true,characterData:true,subtree:true})})}catch(e){}
 try{const mc=document.querySelector('meta[name=theme-color]');if(mc&&th.mode==='dark'&&!th.bg)mc.content='#07060f'}catch(e){}
 window.__reels={list:reelList,like:rLike,save:rSave,sig,paint:paintReels};Object.defineProperty(window.__reels,'pausedId',{get:()=>reelPausedId,set:v=>{reelPausedId=v||''}});
 sync();
})()}catch(e){}



