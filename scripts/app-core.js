/* Mosaic 2.5.31 — ordered app script 01 of 22. */
/* profile-aware storage: every mosaic-* key is namespaced per profile (first profile keeps the original keys) */
const _gi=Storage.prototype.getItem,_si=Storage.prototype.setItem;
let PROFILES=[{id:'p1',name:'You',hue:230,kids:false}];try{PROFILES=JSON.parse(_gi.call(localStorage,'mosaic-profiles'))||PROFILES}catch(e){}
var PID=(()=>{try{return _gi.call(localStorage,'mosaic-profile')}catch(e){return null}})()||'p1',PROF=PROFILES.find(p=>p.id===PID)||PROFILES[0];PID=PROF.id;var KIDS=!!PROF.kids,RK={G:0,PG:1,'PG-13':2,'TV-14':3};
const RAW=k=>k==='mosaic-profile'||k==='mosaic-profiles'||PID==='p1'||!String(k).startsWith('mosaic-');
Storage.prototype.getItem=function(k){return _gi.call(this,RAW(k)?k:PID+':'+k)};Storage.prototype.setItem=function(k,v){return _si.call(this,RAW(k)?k:PID+':'+k,v)};
const names={m:'Film',a:'Song',c:'Clip'};
const R=(k,a)=>a.map((x,i)=>({id:k+i,k,t:x[0],s:x[1],d:x[2]||'',h:(i*47+(k==='m'?230:k==='a'?160:20))%360,len:x[3]||180}));
const ITEMS=[
...R('m',[['Last Signal','Sci-fi','A lighthouse keeper on a drifting station hears a transmission from her own future.',150],['Salt Road','Drama','Two sisters drive a failing salt truck across the desert to save the family business.',170],['Moth Hours','Thriller','A night nurse notices every patient she loses gets visited by the same stranger.',160],['Tiny Kingdom','Comedy','A dentist inherits a micro-nation of eleven people and one angry goat.',140],['Glass Harbor','Drama','A shipbuilder returns after twenty years to finish one last boat.',180],['Orbit Club','Sci-fi','Retired astronauts run a bar on the moon and get pulled into a heist.',155],['Paper Tigers','Comedy','Rival origami teachers enter the same national championship.',130],['Neon Orchard','Sci-fi','Farmers in a vertical city grow the one fruit the AI cannot predict.',165]]),
...R('a',[['Slow Tides','Ava Lindqvist',0,215],['Paper Lanterns','The Marigolds',0,188],['Static Bloom','Kite Hours',0,242],['Midnight Bus','Ravi Okoro',0,199],['Soft Machines','Ava Lindqvist',0,230],['Copper Sky','Dune Choir',0,205],['Overgrown','The Marigolds',0,176],['Low Orbit','Kite Hours',0,261]]),
...R('c',[['I built a clock from 400 spoons','Workshop Weekly','',728],['Bhopal street food in 24 hours','Plate Passport','',1125],['Why bridges sing in the wind','Quiet Physics','',571],['Chess openings in 10 minutes','Rook & Roll','',602],['Repairing a vintage camera','Workshop Weekly','',1277],['Monsoon timelapse, rooftop view','Cloud Diaries','',280],['How lakes freeze, explained','Quiet Physics','',475],['Budget train travel: 5 tips','Plate Passport','',806]])
];
const by=id=>ITEMS.find(x=>x.id===id),$=s=>document.querySelector(s);
const fmt=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
const G=h=>`linear-gradient(150deg,hsl(${h} 72% 52%),hsl(${(h+55)%360} 60% 26%))`;
let tab='home',q='',cur=null,playing=false,pos=0,last=-1,seeking=false,playPending=false,playGeneration=0,saved=[],vol=.7,t0=performance.now(),lastPlayerVisualPosition=-1;
try{saved=JSON.parse(localStorage.getItem('mosaic-saved')||'[]')}catch(e){}
const persist=()=>{try{localStorage.setItem('mosaic-saved',JSON.stringify(saved))}catch(e){}};
/* ---------- audio: real synthesized soundtrack ---------- */
let AC,master,an;
function initAudio(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)();master=AC.createGain();an=AC.createAnalyser();an.fftSize=512;an.smoothingTimeConstant=.78;master.gain.value=vol;buildEQ();try{const ds=AC.createMediaStreamDestination(),el=$('#sink');an.connect(ds);el.srcObject=ds.stream;el.play().catch(()=>{an.connect(AC.destination)})}catch(e){an.connect(AC.destination)}}catch(e){AC=null}}
function tone(f,dur,type,g,at){const o=AC.createOscillator(),e=AC.createGain(),w=AC.currentTime+(at||0);o.type=type;o.frequency.value=f;e.gain.setValueAtTime(.0001,w);e.gain.linearRampToValueAtTime(g,w+.02);e.gain.exponentialRampToValueAtTime(.0001,w+dur);o.connect(e);e.connect(master);o.start(w);o.stop(w+dur+.05)}
function kick(){const o=AC.createOscillator(),e=AC.createGain(),w=AC.currentTime;o.frequency.setValueAtTime(130,w);o.frequency.exponentialRampToValueAtTime(40,w+.15);e.gain.setValueAtTime(.35,w);e.gain.exponentialRampToValueAtTime(.0001,w+.2);o.connect(e);e.connect(master);o.start(w);o.stop(w+.25)}
function boom(){const o=AC.createOscillator(),e=AC.createGain(),w=AC.currentTime;o.frequency.setValueAtTime(70,w);o.frequency.exponentialRampToValueAtTime(28,w+1.4);e.gain.setValueAtTime(.45,w);e.gain.exponentialRampToValueAtTime(.0001,w+1.5);o.connect(e);e.connect(master);o.start(w);o.stop(w+1.6)}
function say(i){try{const l=[`Welcome back to ${cur.s}.`,`Today: ${cur.t}.`,'Let me walk you through it.','Here is the first thing to notice.','This is where it gets interesting.','And that is the whole idea.'];const u=new SpeechSynthesisUtterance(l[Math.floor(i)%l.length]);u.rate=.95;u.volume=vol;speechSynthesis.speak(u)}catch(e){}}
const bpmOf=x=>x.bpm?x.bpm:x.k==='m'?56+x.h%12:x.k==='a'?84+x.h%28:100+x.h%20;
function step(n){
 if(!AC)return;const x=cur,beat=60/bpmOf(x),root=110*2**((x.h%12)/12),f=s=>root*2**(s/12);
 const prog=[0,8,3,10][Math.floor(n/4)%4],sc=[0,3,5,7,10],pick=sc[(n*7+x.h)%5];
 if(x.k==='c'){if(n%24===0)say(n/24);return}
 if(n%4===0){[0,3,7].forEach(s=>tone(f(prog+s),beat*4,'sine',x.k==='m'?.07:.045));tone(f(prog)/2,beat*2,'triangle',.12)}
 if(x.k==='m'){if(n%8===0){tone(f(prog)/2,beat*8,'sawtooth',.03);tone(f(prog+7),beat*8,'sine',.06)}if(n%16===0)boom();return}
 if(n%2===0)kick();
 if((n*3+x.h)%4!==1)tone(f(pick+12+(n%8>5?12:0)),beat*.9,x.k==='a'?'triangle':'square',x.k==='a'?.08:.025);
}
/* ---------- rendering ---------- */
function scene(x){const h=x.h,s=x.id.length*7+h*3,r=n=>{const v=Math.sin(s*9301+n*49297)*233280;return v-Math.floor(v)};
 let o=`<svg viewBox="0 0 200 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g${x.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${h} 70% ${18+r(1)*18}%)"/><stop offset=".65" stop-color="hsl(${(h+40)%360} 80% ${52+r(2)*16}%)"/></linearGradient></defs><rect width="200" height="300" fill="url(#g${x.id})"/><circle cx="${60+r(3)*80}" cy="${80+r(4)*50}" r="${20+r(5)*16}" fill="hsl(${(h+20)%360} 95% 82%)" opacity=".92"/>`;
 for(let i=0;i<3;i++){let p='M0 300 L0 '+(185+i*28);for(let k=0;k<=8;k++)p+=` L${k*25} ${185+i*28-r(10+i*9+k)*(52-i*12)}`;p+=' L200 300Z';o+=`<path d="${p}" fill="hsl(${h} ${35+i*10}% ${24-i*7}%)" opacity="${.55+i*.2}"/>`}
 return o+'</svg>'}
const mine=x=>vis(x)&&(!q||(x.t+' '+x.s+' '+x.d).toLowerCase().includes(q));
const card=(x,i)=>`<button class="card ${x.k}" style="--i:${Math.min(i,14)}" data-id="${x.id}"><div class="art">${(x.poster||x.thumb)?`<img src="${esc(x.poster||x.thumb)}" alt="" referrerpolicy="no-referrer" loading="lazy">`:scene(x)}<span class="ov">${x.k==='m'?x.t:''}</span><span class="pl"></span>${pb(x)}<span class="tag" style="z-index:2">${x.live?'LIVE':x.src?(Date.now()-(x.added||0)<6048e5?'New':'Yours'):fmt(x.len)}</span></div><b>${esc(x.t)}</b><small>${esc(x.s)}</small></button>`;
const rail=(t,a)=>a.length?`<h2 class="rh">${t}${t==='Your library'||t==='Continue'?'':`<button class="more" data-go="${a[0].k}">See all</button>`}</h2><div class="rail">${a.map(card).join('')}</div>`:'';
const grid=(a,c)=>a.length?`<div class="grid ${c||''}">${a.map(card).join('')}</div>`:'<p class="empty">Nothing by that name yet. Try fewer letters, or add the file yourself.</p>';
function render(){
 if(tab==='r')tab='home';document.querySelectorAll('#nav button[data-t]').forEach(button=>{const current=button.dataset.t===tab;button.classList.toggle('on',current);if(current)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current')});const A=ITEMS.filter(mine),m=$('#main'),f=ITEMS.find(x=>x.k==='m'&&vis(x)&&saved.includes(x.id))||ITEMS.find(x=>x.k==='m'&&x.user&&vis(x))||ITEMS.find(x=>x.k==='m'&&vis(x));
 if(tab==='home')m.innerHTML=(q?'':`<p class="greet">${esc(greet())}</p>`)+(q||!f?'':`<section class="hero hero-feature" aria-labelledby="featured-title"><div class="hero-copy"><div class="hero-kicker"><span class="hero-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>FEATURED FILM</div><div class="meta2"><span>${esc(f.s)}</span><i aria-hidden="true">·</i><span>${fmt(f.len)}${f.user?'':' preview'}</span></div><h1 id="featured-title">${esc(f.t)}</h1>${f.d?`<p>${esc(f.d)}</p>`:''}<div class="btns"><button class="b hero-play" data-id="${f.id}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 10 6-10 6z" fill="currentColor" stroke="none"/></svg><span>${f.user||f.src?'Play':'Play preview'}</span></button><button class="b g hero-save" data-save="${f.id}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4.5h12v16l-6-4-6 4z"/></svg><span>${saved.includes(f.id)?'Saved':'Save'}</span></button></div></div><div class="hero-art" aria-hidden="true">${(f.poster||f.thumb)?`<img src="${esc(f.poster||f.thumb)}" alt="" referrerpolicy="no-referrer">`:scene(f)}<span class="hero-poster-brand"><i></i> MOSAIC FILM</span><span class="hero-poster-caption"><b>${esc(f.s)}</b><i>${fmt(f.len)}</i></span></div></section>`)
  +(q?'':genreRow(A))+rail('Continue',A.filter(cont))+topRow(A)+becauseRow(A)+(q||A.some(x=>x.user)?'':'<div class="cta"><b>Make it yours</b><span>Add films, songs and clips from your device. We sort them into the right place for you.</span><button class="b" data-add>Add files</button></div>')+rail('Your library',A.filter(x=>x.user))+rail('Films',A.filter(x=>x.k==='m'&&!x.user))+rail('Music for tonight',A.filter(x=>x.k==='a'&&!x.user))+(A.length?'':grid([]));
 else if(tab==='x'){m.innerHTML=labHTML()}else if(tab!=='l'){m.innerHTML=lib(A)}else if(tab==='l'){const a=saved.map(by).filter(Boolean).filter(mine);m.innerHTML=plHTML()+'<h2>My List</h2>'+(a.length?grid(a):'<p class="empty">Your list is empty. Open anything you like and choose Save. It will wait for you here.</p>')}
 else m.innerHTML='<h2>'+{m:'Films',a:'Music',c:'Clips'}[tab]+'</h2>'+'<p class="empty" style="padding:0 0 14px">Add your own files with the button above or drop them anywhere on this page. Yours appear first.</p>'+grid(A.filter(x=>x.k===tab).sort((a,b)=>!!b.user-!!a.user),tab==='c'?'c':'');
}
/* ---------- player ---------- */
const kindList=()=>ITEMS.filter(x=>cur&&cur.lab?x.lab&&vis(x):x.k===cur.k&&vis(x));
function sourceIsCurrent(){if(!cur?.src)return false;const v=$('#vid');try{return new URL(cur.src,document.baseURI).href===(v.currentSrc||v.src)}catch(e){return false}}
function requestVideoPlayback(item){const v=$('#vid'),request=++playGeneration;playPending=true;playing=true;ui();let attempt;try{attempt=v.play()}catch(e){attempt=Promise.reject(e)}if(attempt&&typeof attempt.then==='function')attempt.then(()=>{if(cur!==item||request!==playGeneration)return;playPending=false;playing=!v.paused&&!v.ended;ui()}).catch(()=>{if(cur!==item||request!==playGeneration)return;playPending=false;playing=false;v.pause();ui();toast('Playback could not start. Check the media format and try again.')});else{playPending=false;playing=!v.paused&&!v.ended;ui()}}
function play(id){const item=by(id);if(!item)return;initAudio();if(AC&&AC.state==='suspended')AC.resume();playGeneration++;playPending=false;cur=item;pos=0;last=-1;lastPlayerVisualPosition=-1;seeking=false;playing=!item.src;const v=$('#vid');v.pause();v.removeAttribute('src');v.style.display='none';try{speechSynthesis.cancel()}catch(e){}
 if(item.src){v.src=item.src;v.volume=vol;v.style.display=item.isVid?'block':'none';requestVideoPlayback(item)}
 $('#stage').style.display='flex';$('#mini').style.display='none';$('#stage').dataset.kind=item.k;info();ui()}
function info(){$('#sT').textContent=cur.t;$('#sS').textContent=cur.k==='m'?cur.s+' · '+cur.d:cur.k==='a'?cur.s:'by '+cur.s;$('#sv').textContent=saved.includes(cur.id)?'Saved':'Save';$('#sD').style.display=cur.user?'':'none';$('#td').textContent=fmt(cur.len);$('#mT').textContent=cur.t;$('#mS').textContent=cur.k==='a'?cur.s:names[cur.k];$('#mini').dataset.kind=cur.k;const cover=cur.poster||cur.thumb,art=cover?'<img alt="" src="'+esc(cover)+'">':scene(cur);$('#mA').innerHTML=art;const musicCover=$('#musicCover');if(musicCover){musicCover.innerHTML=art;musicCover.hidden=false}}
function ui(){const p=cur&&cur.len?Math.max(0,Math.min(100,pos/cur.len*100)):0,sb=$('#sBar'),label=playing?'Pause':'Play',pressed=String(playing),busy=String(playPending);$('#sFill').style.width=$('#mFill').style.width=p+'%';sb.style.setProperty('--p',p+'%');sb.setAttribute('aria-valuemax',Math.round(cur?.len||0));sb.setAttribute('aria-valuenow',Math.round(pos||0));sb.setAttribute('aria-valuetext',cur?.len?fmt(pos||0)+' of '+fmt(cur.len):'Timeline unavailable');$('#tc').textContent=fmt(pos);[$('#sPlay'),$('#mPlay')].forEach(b=>{if(b.textContent!==label)b.textContent=label;if(b.getAttribute('aria-label')!==label)b.setAttribute('aria-label',label);if(b.getAttribute('aria-pressed')!==pressed)b.setAttribute('aria-pressed',pressed);if(b.getAttribute('aria-busy')!==busy)b.setAttribute('aria-busy',busy);b.dataset.s=playing?'pause':'play'});$('#stage').classList.toggle('is-playing',playing);$('#mini').classList.toggle('pz',!playing);document.documentElement.classList.toggle('media-playing',playing)}
$('#vid').addEventListener('play',()=>{if(!sourceIsCurrent())return;playPending=false;playing=true;ui()});$('#vid').addEventListener('playing',()=>{if(!sourceIsCurrent())return;playPending=false;playing=true;ui()});['pause','ended','error'].forEach(type=>$('#vid').addEventListener(type,()=>{if(!sourceIsCurrent())return;playPending=false;playing=false;ui()}));
function hop(d){if(!cur)return;const l=kindList(),i=l.findIndex(x=>x.id===cur.id);if(!l.length)return;play(l[(i+d+l.length)%l.length].id)}
function stop(){try{speechSynthesis.cancel()}catch(e){}playGeneration++;playPending=false;seeking=false;$('#vid').pause();cur=null;playing=false;document.documentElement.classList.remove('media-playing');$('#stage').style.display=$('#mini').style.display='none'}
function toggle(){if(!cur)return;if(cur.src){const v=$('#vid');if(playPending||(!v.paused&&!v.ended)){playGeneration++;playPending=false;v.pause();playing=false;ui()}else{if(v.ended){try{v.currentTime=0}catch(e){}pos=0;last=-1}requestVideoPlayback(cur)}return}if(pos>=cur.len){pos=0;last=-1}playing=!playing;if(AC)try{const operation=playing?AC.resume():AC.suspend();operation?.catch?.(()=>{})}catch(e){}try{playing?speechSynthesis.resume():speechSynthesis.pause()}catch(e){}ui()}
function toggleSave(id){saved=saved.includes(id)?saved.filter(x=>x!==id):[...saved,id];persist();render();if(cur)info()}
setInterval(()=>{const n=performance.now(),dt=(n-t0)/1000;t0=n;if(!cur)return;if(cur.src){const v=$('#vid');if(isFinite(v.duration)&&v.duration){cur.len=v.duration;$('#td').textContent=fmt(cur.len)}if(!seeking)pos=v.currentTime;playing=!v.paused;if(v.ended&&(cur.k==='a'||autoOn)){autoNext();return}ui();return}if(!playing||seeking)return;pos+=dt;
 if(pos>=cur.len){pos=cur.len;playing=false;if(cur.k==='a'||autoOn)return autoNext();ui();return}
 const s=Math.floor(pos/(60/bpmOf(cur)));if(s!==last){last=s;step(s)}ui()},60);
/* ---------- visuals ---------- */
function paint(c,h,t,live){
 const w=c.width=c.clientWidth*(devicePixelRatio>1?1.5:1),ht=c.height=c.clientHeight*(devicePixelRatio>1?1.5:1),g=c.getContext('2d');
 g.fillStyle=`hsl(${h} 50% 10%)`;g.fillRect(0,0,w,ht);g.globalCompositeOperation='lighter';
 for(let i=0;i<5;i++){const x=w*(.5+.38*Math.sin(t*.35+i*1.9+h)),y=ht*(.5+.3*Math.cos(t*.27+i*2.3)),r=Math.max(w,ht)*(.28+.06*Math.sin(t+i)),d=g.createRadialGradient(x,y,0,x,y,r);
  d.addColorStop(0,`hsla(${(h+i*28)%360},85%,55%,.55)`);d.addColorStop(1,'transparent');g.fillStyle=d;g.fillRect(0,0,w,ht)}
 g.globalCompositeOperation='source-over';
 if(live&&an){const a=new Uint8Array(an.frequencyBinCount);an.getByteFrequencyData(a);const n=48,bw=w/n;g.fillStyle='rgba(255,255,255,.75)';
  for(let i=0;i<n;i++){const v=a[i]/255*ht*.4;g.fillRect(i*bw+bw*.2,ht-v-12,bw*.6,v+2)}}
}
function frame(){const t=performance.now()/1000,hc=$('#hc');
 if(!document.hidden&&hc)paint(hc,ITEMS[0].h,t,false);
 /* Keep the demo artwork tied to media time; freeze while paused and avoid repainting unchanged frames. */
 if(!document.hidden&&cur&&$('#stage').style.display==='flex'&&(!cur.isVid||!cur.src)){if(lastPlayerVisualPosition!==pos){paint($('#cv'),cur.h,pos,playing);lastPlayerVisualPosition=pos}}else lastPlayerVisualPosition=-1;
 requestAnimationFrame(frame)}
/* ---------- events ---------- */
document.addEventListener('click',e=>{const s=e.target.closest('[data-save]');if(s)return toggleSave(s.dataset.save);const c=e.target.closest('[data-id]');if(c)play(c.dataset.id)});
$('#nav').onclick=e=>{const b=e.target.closest('button');if(!b)return;tab=b.dataset.t;document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x===b));render()};
$('#q').oninput=e=>{q=e.target.value.trim().toLowerCase();render()};
$('#sPlay').onclick=toggle;$('#mPlay').type='button';$('#mPlay').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();toggle()});
$('#sC').onclick=()=>{if(cur){$('#stage').style.display='none';$('#mini').style.display='flex'}};
$('#mOpen').onclick=()=>{$('#stage').style.display='flex';$('#mini').style.display='none'};
$('#pv').onclick=()=>hop(-1);$('#nx').onclick=()=>hop(1);$('#sv').onclick=()=>{if(cur)toggleSave(cur.id)};
$('#vol').oninput=e=>{vol=+e.target.value;if(master)master.gain.value=vol;$('#vid').volume=vol};
$('#f').onchange=e=>{const fs=[...e.target.files];fs.forEach((f,i)=>{const v=f.type.startsWith('video');ITEMS.push({id:'u'+Date.now()+i,k:v?'c':'a',t:f.name.replace(/\.[^.]+$/,''),s:'My files',d:'',h:f.size%360,len:1,src:URL.createObjectURL(f),isVid:v})});if(fs.length)document.querySelector('nav [data-t="'+(fs[fs.length-1].type.startsWith('video')?'c':'a')+'"]').click()};
const seekBar=$('#sBar');function seekAt(e){if(!cur||!cur.len)return;const r=seekBar.getBoundingClientRect();if(!r.width)return;const x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));pos=x*cur.len;last=-1;ui()}
function commitSeek(){if(!cur)return;seeking=false;if(cur.src&&Number.isFinite($('#vid').duration))try{$('#vid').currentTime=Math.max(0,Math.min($('#vid').duration-.01,pos))}catch(e){}ui()}
seekBar.addEventListener('pointerdown',e=>{if(!cur||!cur.len||e.button!==0)return;seeking=true;try{seekBar.setPointerCapture(e.pointerId)}catch(x){}seekAt(e);e.preventDefault()});
seekBar.addEventListener('pointermove',e=>{if(seeking)seekAt(e)});seekBar.addEventListener('pointerup',commitSeek);seekBar.addEventListener('pointercancel',commitSeek);
seekBar.addEventListener('keydown',e=>{if(!cur)return;let target=null;if(e.key==='ArrowLeft')target=Math.max(0,pos-10);else if(e.key==='ArrowRight')target=Math.min(cur.len,pos+10);else if(e.key==='Home')target=0;else if(e.key==='End')target=cur.len;else return;e.preventDefault();e.stopPropagation();pos=target;last=-1;if(cur.src&&Number.isFinite($('#vid').duration))try{$('#vid').currentTime=target}catch(x){}ui()});
const mosaicIsEditingKeyTarget=e=>{const t=e.target;return !t||/^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(t.tagName)||t.isContentEditable||!!t.closest?.('[contenteditable="true"],[role="textbox"]')};const mosaicPlayerKeysActive=()=>{const mini=$('#mini');return !!cur&&($('#stage')?.style.display==='flex'||(tab!=='c'&&!!mini&&getComputedStyle(mini).display!=='none'))};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#stage')?.style.display==='flex'&&!document.fullscreenElement&&!document.querySelector('dialog[open]'))$('#sC').click();if(e.key===' '&&mosaicPlayerKeysActive()&&!mosaicIsEditingKeyTarget(e)&&!e.altKey&&!e.ctrlKey&&!e.metaKey&&!document.querySelector('dialog[open]')){e.preventDefault();toggle()}});
/* ---------- library: import, categorize, persist ---------- */
const toast=m=>{const t=$('#toast');t.textContent=m;t.style.opacity=1;clearTimeout(toast.h);toast.h=setTimeout(()=>t.style.opacity=0,2800)};
function skip(d){if(!cur)return;const v=$('#vid'),limit=cur.src&&Number.isFinite(v.duration)?v.duration:Number(cur.len);if(!Number.isFinite(limit)||limit<=0){toast('Playback position is still loading.');return}const from=cur.src&&Number.isFinite(v.currentTime)?v.currentTime:pos,target=Math.max(0,Math.min(Math.max(0,limit-.05),from+d));if(cur.src)try{v.currentTime=target}catch(e){toast('This video cannot seek right now.');return}pos=target;last=-1;ui()}
$('#bk').onclick=()=>skip(-10);$('#fw').onclick=()=>skip(10);$('#vid').onclick=toggle;
document.addEventListener('keydown',e=>{if(!mosaicPlayerKeysActive()||mosaicIsEditingKeyTarget(e)||e.altKey||e.ctrlKey||e.metaKey||document.querySelector('dialog[open]'))return;if(e.key==='ArrowRight'){e.preventDefault();skip(5)}if(e.key==='ArrowLeft'){e.preventDefault();skip(-5)}});
/* ---------- filter and sort ---------- */
let filt='All',sort='feat',lastTab='';
function lib(A){if(tab!==lastTab){filt='All';lastTab=tab}let a=A.filter(x=>x.k===tab);
 const ch=['All',...(a.some(x=>x.user)?['Yours']:[]),...[...new Set(a.filter(x=>!x.user).map(x=>x.s))]];if(!ch.includes(filt))filt='All';
 if(filt==='Yours')a=a.filter(x=>x.user);else if(filt!=='All')a=a.filter(x=>x.s===filt);
 const cmp={feat:(x,y)=>!!y.user-!!x.user,az:(x,y)=>x.t.localeCompare(y.t),short:(x,y)=>x.len-y.len,long:(x,y)=>y.len-x.len}[sort];a=[...a].sort(cmp);
 return `<h2>${{m:'Films',a:'Music',c:'Clips'}[tab]}</h2><div class="tools"><div class="chips">${tab==='a'?'<button class="chip" data-shuf>Shuffle</button>':''}${ch.map(c=>`<button class="chip ${c===filt?'on':''}" data-f="${c}">${c}</button>`).join('')}</div><label class="srt">Sort<select id="so">${[['feat','Featured'],['az','A to Z'],['short','Shortest first'],['long','Longest first']].map(([v,n])=>`<option value="${v}" ${v===sort?'selected':''}>${n}</option>`).join('')}</select></label></div><p class="cnt">${a.length} ${a.length===1?'title':'titles'}</p>`+grid(a,tab==='c'?'c':'')}
document.addEventListener('click',e=>{const c=e.target.closest('[data-f]');if(c){filt=c.dataset.f;render()}});
document.addEventListener('change',e=>{if(e.target.id==='so'){sort=e.target.value;render()}});
$('#sv').addEventListener('click',()=>{const b=$('#sv');b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop')});
/* ---------- lock screen and media keys ---------- */
const oi=info;info=()=>{oi();try{navigator.mediaSession.metadata=new MediaMetadata({title:cur.t,artist:cur.s,album:'Mosaic'})}catch(e){}};
try{[['play',toggle],['pause',toggle],['nexttrack',()=>hop(1)],['previoustrack',()=>hop(-1)]].forEach(([a,f])=>navigator.mediaSession.setActionHandler(a,f))}catch(e){}
/* ---------- volume: system-aware ---------- */
const IOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);let pre=.7;
function setVol(v){vol=Math.max(0,Math.min(1,v));if(master)master.gain.value=vol;try{if(!vidRouted)$('#vid').volume=IOS?1:vol}catch(e){}$('#vol').value=vol;$('#vp').textContent=Math.round(vol*100)+'%';$('#mute').textContent=vol?'Mute':'Unmute';try{localStorage.setItem('mosaic-vol',vol)}catch(e){}}
$('#vol').oninput=e=>setVol(+e.target.value);
$('#mute').onclick=()=>{if(vol>0){pre=vol;setVol(0)}else setVol(pre||.7)};
if(IOS){$('#vol').style.display=$('#vp').style.display='none';const h=document.createElement('small');h.className='time';h.textContent="Use your device's volume buttons";$('#mute').after(h)}
try{const sv=localStorage.getItem('mosaic-vol');if(sv!==null)vol=+sv}catch(e){}setVol(vol);
document.addEventListener('keydown',e=>{if(!mosaicPlayerKeysActive()||mosaicIsEditingKeyTarget(e)||e.altKey||e.ctrlKey||e.metaKey||document.querySelector('dialog[open]'))return;if(e.key==='ArrowUp'){e.preventDefault();setVol(vol+.05)}if(e.key==='ArrowDown'){e.preventDefault();setVol(vol-.05)}if(e.key==='m'||e.key==='M')$('#mute').click()});
$('#vid').onerror=()=>{if(cur&&cur.src)toast("This file format can't play in this browser.")};
$('#vid').onvolumechange=()=>{if(!IOS&&!vidRouted&&cur&&cur.src){const v=$('#vid').volume;if(Math.abs(v-vol)>.01)setVol(v)}};
const oi2=info;info=()=>{oi2();document.title=cur?cur.t+' · Mosaic':'Mosaic'};
/* ---------- loading screen: library-aware startup and safe handoff ---------- */
 (function(){
  const root=$('#splash'),fill=$('#pf'),label=$('#ps'),percent=$('#loadPct'),progress=fill&&fill.parentElement,enter=$('#enter'),app=document.querySelector('.app'),help=$('#hlp');
  if(!root||!fill||!label||!progress||!enter)return;
  const tiles=$('#mos');if(tiles&&!tiles.childElementCount){const hues=[342,18,42,154,202,262],frag=document.createDocumentFragment();for(let i=0;i<25;i++){const tile=document.createElement('i'),row=Math.floor(i/5),col=i%5,distance=Math.abs(row-2)+Math.abs(col-2);tile.style.setProperty('--i',String(i));tile.style.setProperty('--h',String(hues[(row*3+col*2+Math.floor(i/10))%hues.length]));tile.style.setProperty('--tile-delay',(distance*62+((row+col)%2)*14)+'ms');frag.appendChild(tile)}tiles.appendChild(frag)}
  if(app)app.inert=true;if(help)help.inert=true;root.focus({preventScroll:true});root.addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();if(root.dataset.ready==='true')enter.focus({preventScroll:true});else root.focus({preventScroll:true})}});
  const started=performance.now(),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let value=4,fontReady=!document.fonts||document.fonts.status==='loaded',finished=false;
  if(document.fonts)document.fonts.ready.then(()=>{fontReady=true}).catch(()=>{fontReady=true});
  const update=(n)=>{value=Math.max(0,Math.min(100,n));fill.style.width=value+'%';const shown=Math.round(value);progress.setAttribute('aria-valuenow',String(shown));if(percent)percent.textContent=String(shown).padStart(2,'0')+'%'};
  const setStatus=text=>{const localization=window.MosaicLocalization,next=localization?.translate?localization.translate(text):text;if(label.textContent!==next){label.classList.remove('swap');label.textContent=next;void label.offsetWidth;label.classList.add('swap')}};
  const release=()=>{if(app)app.inert=false;if(help)help.inert=false;if(root.style.display==='none'&&!document.querySelector('dialog[open]'))$('#q')?.focus({preventScroll:true})};
  const iv=setInterval(()=>{
   if(root.style.display==='none'||getComputedStyle(root).display==='none'){clearInterval(iv);release();root.setAttribute('aria-hidden','true');return}
   const elapsed=performance.now()-started,libraryReady=window.__mosaicDbReady===true,timedOut=elapsed>=8000;
   const ready=(libraryReady&&(fontReady||elapsed>=1600))||timedOut;
   const target=ready?100:libraryReady?91:Math.min(86,10+elapsed/8000*76);
   const next=reduced?target:value+(target-value)*.11;update(next);
   if(timedOut&&!libraryReady)setStatus('Your library is opening in the background');
   else if(libraryReady&&!fontReady)setStatus('Finishing the final details');
   else setStatus(['Warming up your library','Finding your saved titles','Arranging your space','Almost ready'][Math.min(3,Math.floor(value/25))]);
   if(ready&&value>=99.4&&!finished){finished=true;clearInterval(iv);update(100);setStatus(timedOut&&!libraryReady?'You can enter while your library finishes':'Your space is ready when you are');root.setAttribute('aria-busy','false');root.dataset.ready='true';enter.style.display='inline-flex';enter.focus({preventScroll:true})}
  },reduced?80:50);
 })();
/* ---------- cloud sync, storage manager, resume, polish ---------- */
let cloud=null,uid=null,adb=null,asx=null,prog={};try{prog=JSON.parse(localStorage.getItem('mosaic-prog')||'{}')}catch(e){}
const cont=x=>{const p=prog[x.id];return p>5&&p<x.len-10};
const pb=x=>cont(x)?`<span class="pbar"><i style="width:${prog[x.id]/x.len*100}%"></i></span>`:'';
cloud=false;
async function loadCloud(){try{const s=await adb.collection('data/users/'+uid).get();s.docs.forEach(d=>{const o=d.data();if(!o||!o.url||ITEMS.some(x=>x.id===o.id))return;ITEMS.push({...o,src:o.url,cloud:true,user:true})});render()}catch(e){}}
async function syncUp(it,blob){if(!cloud||blob.size>20*1048576)return;try{const r=await asx.upload(blob);await adb.collection('data/users/'+uid).doc(it.id).set({...it,url:r.url,assetId:r.id,cloud:true});const x=ITEMS.find(y=>y.id===it.id);if(x){x.cloud=true;x.assetId=r.id}}catch(e){}}
async function openSM(){let e={usage:0,quota:1},per='';try{e=await navigator.storage.estimate();per=(await navigator.storage.persisted())?'Protected from automatic cleanup. ':'The browser may clear this when space runs low. '}catch(x){}
 const u=e.usage||0,qt=e.quota||1;$('#mtx').textContent=fmtB(u)+' used by Mosaic on this device. '+per+'Everything stays on this device. Nothing is uploaded anywhere.';
 const us=ITEMS.filter(x=>x.user);$('#sl').innerHTML=us.length?us.map(x=>`<div class="rw"><div class="f"><b>${esc(x.t)}</b><small>${{m:'Film',a:'Song',c:'Clip'}[x.k]}${x.size?' · '+(x.size/1048576).toFixed(1)+' MB':''} · ${x.cloud?'Synced to cloud':'This device only'}</small></div><button class="b o" data-del="${x.id}">Remove</button></div>`).join(''):'<p class="empty">No files yet. Add a few and they show up here. They stay on this device.</p>';
 if(!$('#sm').open)$('#sm').showModal();paintMeter()}
$('#stbtn').onclick=openSM;$('#smx').onclick=()=>$('#sm').close();
document.addEventListener('click',async e=>{if(e.target.closest('[data-add]'))return $('#f').click();const b=e.target.closest('[data-del]');if(!b)return;const id=b.dataset.del,x=ITEMS.find(y=>y.id===id);if(!x)return;if(cur&&cur.id===id)stop();ITEMS.splice(ITEMS.indexOf(x),1);revokeItemUrl(x);const stored=await dbDo(s=>s.delete(id));if(cloud){try{await adb.collection('data/users/'+uid).doc(id).delete();if(x.assetId)await asx.delete(x.assetId)}catch(er){}}saved=saved.filter(s=>s!==id);delete prog[id];persist();ping();render();await openSM();if(!stored)toast('Removed from view, but this device could not delete the saved file.')});
const op=play;play=id=>{op(id);const rp=prog[id];if(rp>5&&rp<cur.len-10){pos=rp;last=-1;if(cur.src){const v=$('#vid');v.addEventListener('loadedmetadata',()=>{v.currentTime=rp},{once:true})}ui();toast('Resuming from '+fmt(rp))}};
setInterval(()=>{if(cur&&playing&&!cur.live){if(pos>=cur.len-10)delete prog[cur.id];else prog[cur.id]=pos;try{localStorage.setItem('mosaic-prog',JSON.stringify(prog))}catch(e){}}},4000);
const oi3=info;info=()=>{oi3();document.querySelectorAll('.card').forEach(c=>c.classList.toggle('now',!!cur&&c.dataset.id===cur.id));if(cur)$('#stage').style.background='radial-gradient(70% 55% at 50% 0%,hsl('+cur.h+' 60% 32% / .6),transparent),var(--bg)'};
document.addEventListener('pointerdown',e=>{const t=e.target.closest('.b,.chip,nav button,.ib');if(!t||t.disabled)return;const r=t.getBoundingClientRect(),d=Math.max(r.width,r.height)*2,s=document.createElement('span');s.className='ripple';s.style.cssText='width:'+d+'px;height:'+d+'px;left:'+(e.clientX-r.left-d/2)+'px;top:'+(e.clientY-r.top-d/2)+'px';t.appendChild(s);setTimeout(()=>s.remove(),700)});
/* ---------- appearance, hide samples, shuffle ---------- */
const hid=new Set();try{JSON.parse(localStorage.getItem('mosaic-hid')||'[]').forEach(i=>hid.add(i))}catch(e){}
const saveHid=()=>{try{localStorage.setItem('mosaic-hid',JSON.stringify([...hid]))}catch(e){}};
const demoItems=()=>ITEMS.filter(x=>!x.user&&x.k!=='r');
const vis=x=>!hid.has(x.id)&&!(KIDS&&(RK[x.r]||0)>1);
const greet=()=>{const h=new Date().getHours(),salutation=h<5?'Welcome back':'Good '+(h<12?'morning':h<18?'afternoon':'evening'),name=PROF.name&&PROF.name!=='You'?PROF.name:'';return salutation+(name?', '+name:'')};
const PRE={Mosaic:'#17111f',Ink:'#100e14',Plum:'#271c30',Forest:'#10251e',Slate:'#20232b',Paper:'#f5f1f4'},ACC=['#f2b24c','#5b7cf0','#38b58c','#e5637a','#a77bd6','#e98d73'];
let th={mode:'system',bg:null,acc:null};try{th={...th,...JSON.parse(localStorage.getItem('mosaic-theme')||'{}')}}catch(e){}
const lum=h=>{const n=parseInt(h.slice(1),16),f=c=>{c/=255;return c<=.03928?c/12.92:((c+.055)/1.055)**2.4};return .2126*f(n>>16)+.7152*f((n>>8)&255)+.0722*f(n&255)};
function updateThemeMeta(){const mc=document.querySelector('meta[name=theme-color]');if(mc)mc.content=th.bg||(th.mode==='light'?'#f5f1f4':'#17111f')}
function saveTheme(){try{localStorage.setItem('mosaic-theme',JSON.stringify(th))}catch(e){}updateThemeMeta()}
function applyTheme(persist=true){const R=document.documentElement,r=R.style;['--bg','--side','--surf','--line','--ink','--mute','--acc','--on'].forEach(k=>r.removeProperty(k));
 if(th.mode==='system')R.removeAttribute('data-theme');else R.dataset.theme=th.mode;
 if(th.bg){const d=lum(th.bg)<.4,w=d?'#fff':'#000';r.setProperty('--bg',th.bg);r.setProperty('--side','color-mix(in srgb,'+th.bg+' 90%,'+w+' 10%)');r.setProperty('--surf','color-mix(in srgb,'+th.bg+' 80%,'+w+' 20%)');r.setProperty('--line','color-mix(in srgb,'+th.bg+' 74%,'+w+' 26%)');r.setProperty('--ink',d?'#eef1f8':'#141b2e');r.setProperty('--mute',d?'#9aa6c2':'#5d6985')}
 if(th.acc){r.setProperty('--acc',th.acc);r.setProperty('--on',lum(th.acc)>.35?'#111':'#fff')}
 if(persist)saveTheme();else updateThemeMeta()}
function paintAp(){const sw=(l,k,c)=>l.map(v=>`<button class="sw ${c===v?'on':''}" data-th="${k}" data-v="${v}" style="background:${v}" aria-label="${k} ${v}"></button>`).join('');
 $('#ap').innerHTML=`<h4>Appearance</h4><div class="orow"><span>Theme</span><div class="chips">${['system','dark','light'].map(m=>`<button class="chip ${th.mode===m&&!th.bg?'on':''}" data-th="mode" data-v="${m}">${m[0].toUpperCase()+m.slice(1)}</button>`).join('')}</div></div><div class="orow"><span>Background</span><div class="chips">${sw(Object.values(PRE),'bg',th.bg)}<label class="sw pick" title="Custom colour"><input type="color" id="cbg" value="${th.bg||'#17111f'}" aria-label="Custom background colour"></label></div></div><div class="orow"><span>Accent</span><div class="chips">${sw(ACC,'acc',th.acc)}<label class="sw pick" title="Custom colour"><input type="color" id="cac" value="${th.acc||'#f2b24c'}" aria-label="Custom accent colour"></label></div></div><div class="orow"><span>Sample content</span><div class="chips"><button class="chip" data-th="hide">Hide samples</button><button class="chip" data-th="show">Restore samples</button></div></div><button class="chip" data-th="reset" style="margin-top:6px">Reset appearance</button>`}
document.addEventListener('click',e=>{const b=e.target.closest('[data-th]');if(!b)return;const k=b.dataset.th,v=b.dataset.v;
 if(k==='mode'){th.mode=v;th.bg=null}else if(k==='bg')th.bg=v;else if(k==='acc')th.acc=v;else if(k==='reset')th={mode:'system',bg:null,acc:null};
 else if(k==='hide'){const demos=demoItems();demos.forEach(x=>hid.add(x.id));saveHid();if(cur&&demos.some(x=>x.id===cur.id))stop();render();return toast('Demo data removed from your view. Add it again any time.')}
 else if(k==='show'){demoItems().forEach(x=>hid.delete(x.id));saveHid();render();return toast('Demo data restored')}
 applyTheme();paintAp()});
let themePreviewFrame=0,previewKind='',previewValue='';
function previewTheme(kind,value){previewKind=kind;previewValue=value;if(themePreviewFrame)return;themePreviewFrame=requestAnimationFrame(()=>{themePreviewFrame=0;const k=previewKind,v=previewValue,r=document.documentElement.style;if(k==='bg'){const d=lum(v)<.4,w=d?'#fff':'#000';r.setProperty('--bg',v);r.setProperty('--side','color-mix(in srgb,'+v+' 90%,'+w+' 10%)');r.setProperty('--surf','color-mix(in srgb,'+v+' 80%,'+w+' 20%)');r.setProperty('--line','color-mix(in srgb,'+v+' 74%,'+w+' 26%)');r.setProperty('--ink',d?'#eef1f8':'#141b2e');r.setProperty('--mute',d?'#9aa6c2':'#5d6985')}else{r.setProperty('--acc',v);r.setProperty('--on',lum(v)>.35?'#111':'#fff')}})}
document.addEventListener('input',e=>{if(e.target.id==='cbg'){th.bg=e.target.value;previewTheme('bg',th.bg)}else if(e.target.id==='cac'){th.acc=e.target.value;previewTheme('acc',th.acc)}});
document.addEventListener('change',e=>{if(e.target.id==='cbg'||e.target.id==='cac'){applyTheme(false);saveTheme()}});
const os=openSM;openSM=async()=>{paintAp();await os()};$('#stbtn').onclick=()=>openSM();
$('#sD').addEventListener('click',()=>{if(!cur||cur.user)return;hid.add(cur.id);saveHid();stop();render();toast('Title hidden. Restore it any time in Settings.')});
const oi4=info;info=()=>{oi4();if(cur){$('#sD').style.display='';$('#sD').textContent=cur.user?'Remove from library':'Hide this title'}};
document.addEventListener('click',e=>{if(e.target.closest('[data-shuf]')){const l=ITEMS.filter(x=>x.k==='a'&&vis(x));if(l.length)play(l[Math.floor(Math.random()*l.length)].id)}});
applyTheme();
/* ---------- final additions: queue, speed, sleep, PiP, fullscreen, repeat, shuffle, palette, install ---------- */
let queue=[],rep='all',shuf=false,spdI=2,slp=0,sleepT=0,wl=null,dip=null,cpi=0,cpl=[];try{queue=JSON.parse(localStorage.getItem('mosaic-queue')||'[]').filter(x=>typeof x==='string')}catch(e){}
const SP=[.5,.75,1,1.25,1.5,1.75,2],SL=[0,15,30,60],RP=['all','one','off'];try{const r=localStorage.getItem('mosaic-player-repeat'),s=localStorage.getItem('mosaic-player-shuffle'),v=+(localStorage.getItem('mosaic-player-rate')||1);if(RP.includes(r))rep=r;shuf=s==='1';if(SP.includes(v))spdI=SP.indexOf(v)}catch(e){}
function paintPlayModes(){const r=$('#rpt'),s=$('#shf');if(r){r.textContent='Repeat: '+rep;r.setAttribute('aria-pressed',String(rep!=='off'))}if(s){s.textContent='Shuffle: '+(shuf?'on':'off');s.setAttribute('aria-pressed',String(shuf))}}
function autoNext(){if(rep==='one'){delete prog[cur.id];return play(cur.id)}const l=kindList(),i=l.findIndex(x=>x.id===cur.id);if(!queue.length&&!shuf&&((rep==='off'&&i===l.length-1)||(l.length<2&&cur.k!=='a'))){playing=false;ui();return}hop(1)}
const qUpd=()=>{$('#qv').textContent='Up next ('+queue.length+')';try{localStorage.setItem('mosaic-queue',JSON.stringify(queue))}catch(e){}}
const oh=hop;hop=d=>{if(!cur)return;if(d>0&&queue.length){while(queue.length){const id=queue.shift();qUpd();if(by(id))return play(id)}toast('Skipped unavailable queue items')}if(d>0&&shuf){const l=kindList().filter(x=>x.id!==cur.id);if(l.length)return play(l[Math.floor(Math.random()*l.length)].id)}oh(d)};
function qPaint(){if(window.__mosaicDbReady){const n=queue.length;queue=queue.filter(id=>!!by(id));if(queue.length!==n)qUpd()}const term=($('#qs')?.value||'').toLowerCase().trim(),shown=queue.map((id,i)=>({id,i,x:by(id)})).filter(o=>!term||((o.x?.t||'')+' '+(o.x?.s||'')).toLowerCase().includes(term));$('#ql').innerHTML=shown.length?shown.map(({id,i,x})=>`<div class="rw" data-qindex="${i}"><div class="f"><b>${esc(x?x.t:'Loading queued item…')}</b><small>${esc(x?x.s:'')}</small></div><button class="b o" data-qd="${i}">Remove</button></div>`).join(''):queue.length?'<p class="empty">No queued titles match. Clear the search to see the full queue.</p>':'<p class="empty">Nothing is lined up. Add titles to the queue from the player.</p>'}
$('#qs').addEventListener('input',qPaint);
$('#qb').onclick=()=>{if(!cur)return;queue.push(cur.id);qUpd();toast('Added to queue')};
$('#qv').onclick=()=>{qPaint();$('#qd').showModal()};$('#qx').onclick=()=>$('#qd').close();$('#qc').onclick=()=>{queue=[];qUpd();qPaint()};
document.addEventListener('click',e=>{const b=e.target.closest('[data-qd]');if(b){queue.splice(+b.dataset.qd,1);qUpd();qPaint()}const c=e.target.closest('[data-cp]');if(c){$('#cp').close();play(c.dataset.cp)}});
$('#spd').textContent=SP[spdI]+'×';$('#spd').onclick=()=>{spdI=(spdI+1)%SP.length;$('#vid').playbackRate=SP[spdI];$('#spd').textContent=SP[spdI]+'×';try{localStorage.setItem('mosaic-player-rate',String(SP[spdI]))}catch(e){}};
$('#slp').onclick=()=>{slp=(slp+1)%SL.length;clearTimeout(sleepT);const m=SL[slp];$('#slp').textContent=m?'Sleep: '+m+' min':'Sleep: off';if(m){sleepT=setTimeout(()=>{if(playing)toggle();toast('Sleep timer finished');slp=0;$('#slp').textContent='Sleep: off'},m*60000);toast('Pausing in '+m+' minutes')}};
$('#pip').onclick=async()=>{try{document.pictureInPictureElement?await document.exitPictureInPicture():await $('#vid').requestPictureInPicture()}catch(e){toast('Picture in picture is not available here.')}};
$('#fs').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('#stage').requestFullscreen()}catch(e){toast('Full screen is not available here.')}};
$('#rpt').onclick=()=>{rep=RP[(RP.indexOf(rep)+1)%3];try{localStorage.setItem('mosaic-player-repeat',rep)}catch(e){}paintPlayModes()};
$('#shf').onclick=()=>{shuf=!shuf;try{localStorage.setItem('mosaic-player-shuffle',shuf?'1':'0')}catch(e){}paintPlayModes()};paintPlayModes();
const oi5=info;info=()=>{oi5();if(cur){$('#spd').style.display=cur.src?'':'none';$('#pip').style.display=cur.src&&cur.isVid?'':'none'}};
const op2=play;play=id=>{op2(id);if(cur.src)$('#vid').playbackRate=SP[spdI];if(cur.k!=='a'){try{navigator.wakeLock.request('screen').then(l=>wl=l).catch(()=>{})}catch(e){}}};
const os2=stop;stop=()=>{os2();try{if(wl){wl.release();wl=null}}catch(e){}};
function cpFill(){const t=$('#cpi').value.toLowerCase();cpl=ITEMS.filter(x=>vis(x)&&(!t||(x.t+' '+x.s).toLowerCase().includes(t))).slice(0,8);cpi=0;$('#cpr').innerHTML=cpl.length?cpl.map((x,i)=>`<button class="cpb ${i?'':'on'}" data-cp="${x.id}"><b>${esc(x.t)}</b><small>${names[x.k]} · ${esc(x.s)}</small></button>`).join(''):'<p class="empty">No matches.</p>'}
function cpOpen(){$('#cpi').value='';cpFill();$('#cp').showModal();$('#cpi').focus()}
$('#cpi').addEventListener('input',cpFill);
$('#cpi').addEventListener('keydown',e=>{const bs=[...document.querySelectorAll('.cpb')];if((e.key==='ArrowDown'||e.key==='ArrowUp')&&bs.length){e.preventDefault();cpi=(cpi+(e.key==='ArrowDown'?1:-1)+bs.length)%bs.length;bs.forEach((b,i)=>b.classList.toggle('on',i===cpi))}if(e.key==='Enter'&&cpl[cpi]){$('#cp').close();play(cpl[cpi].id)}});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();cpOpen();return}if(mosaicIsEditingKeyTarget(e))return;if(e.key==='/'){e.preventDefault();cpOpen()}if(e.key==='?'&&!document.querySelector('dialog[open]'))$('#kb').showModal()});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();dip=e;$('#inst').style.display=''});
$('#inst').onclick=async()=>{if(!dip)return;dip.prompt();await dip.userChoice;dip=null;$('#inst').style.display='none'};
window.addEventListener('offline',()=>toast('You are offline. Your library still works.'));window.addEventListener('online',()=>toast('Back online'));
/* ---------- polish: rail arrows, hero carousel, sticky bar, mini art ---------- */
let hi=0,hT=0,shelfObservers=[];
function decor() {
  shelfObservers.forEach(observer => observer.disconnect());
  shelfObservers = [];

  document.querySelectorAll('.rail').forEach((rail, index) => {
    if (rail.parentNode.classList.contains('rwrap')) return;

    const heading = rail.previousElementSibling;
    const title = heading?.classList.contains('rh')
      ? (heading.firstChild?.textContent || '').trim()
      : 'Media shelf';
    const wrap = document.createElement('div');
    wrap.className = 'rwrap';
    rail.id = 'mosaic-shelf-' + index;
    rail.tabIndex = 0;
    rail.setAttribute('role', 'region');
    rail.setAttribute('aria-roledescription', 'carousel');
    rail.setAttribute('aria-label', title + ' shelf');
    rail.setAttribute('aria-keyshortcuts', 'ArrowLeft ArrowRight Home End');
    rail.before(wrap);

    const makeArrow = (side, path, direction) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'arw ' + side;
      button.setAttribute('aria-label', 'Scroll ' + (direction > 0 ? 'right' : 'left') + ' through ' + title);
      button.setAttribute('aria-controls', rail.id);
      button.innerHTML = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="' + path + '"/></svg>';
      button.onclick = () => rail.scrollBy({
        left: direction * Math.max(220, rail.clientWidth * .82),
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });
      return button;
    };

    const left = makeArrow('l', 'M15 6l-6 6 6 6', -1);
    const right = makeArrow('r', 'M9 6l6 6-6 6', 1);
    const progress = document.createElement('div');
    progress.className = 'rail-progress';
    progress.setAttribute('role', 'scrollbar');
    progress.setAttribute('aria-orientation', 'horizontal');
    progress.setAttribute('aria-label', title + ' shelf position');
    progress.title = 'Drag or tap to jump through ' + title;
    progress.setAttribute('aria-controls', rail.id);
    progress.setAttribute('aria-valuemin', '0');
    progress.setAttribute('aria-valuemax', '0');
    progress.setAttribute('aria-valuenow', '0');
    progress.setAttribute('aria-valuetext', 'Shelf fits in one view');
    progress.setAttribute('aria-keyshortcuts', 'ArrowLeft ArrowRight PageUp PageDown Home End');
    progress.tabIndex = 0;
    progress.innerHTML = '<i></i>';
    wrap.append(rail, left, right, progress);

    let updateQueued = false;
    const update = () => {
      if (updateQueued) return;
      updateQueued = true;
      requestAnimationFrame(() => {
        updateQueued = false;
        const max = Math.max(0, rail.scrollWidth - rail.clientWidth);
        const scroll = Math.max(0, Math.min(max, rail.scrollLeft));
        const overflow = max > 2;
        const percentage = overflow ? Math.round(scroll / max * 100) : 0;
        wrap.classList.toggle('can-scroll', overflow);
        wrap.classList.toggle('can-left', scroll > 2);
        wrap.classList.toggle('can-right', scroll < max - 2);
        left.disabled = !overflow || scroll <= 2;
        right.disabled = !overflow || scroll >= max - 2;

        progress.setAttribute('aria-valuemax', String(Math.round(max)));
        progress.setAttribute('aria-valuenow', String(Math.round(scroll)));
        progress.setAttribute('aria-valuetext', overflow ? percentage + '% scrolled' : 'Shelf fits in one view');
        const thumb = progress.firstElementChild;
        const width = progress.clientWidth;
        const thumbWidth = overflow ? Math.max(24, width * rail.clientWidth / rail.scrollWidth) : width;
        const offset = overflow ? (width - thumbWidth) * scroll / max : 0;
        thumb.style.width = thumbWidth + 'px';
        thumb.style.transform = 'translateX(' + offset + 'px)';
      });
    };
    const setScrollFromPointer = clientX => {
      const rect = progress.getBoundingClientRect();
      const max = Math.max(0, rail.scrollWidth - rail.clientWidth);
      if (!max || !rect.width) return;
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      rail.scrollLeft = ratio * max;
    };

    rail.addEventListener('scroll', update, { passive: true });
    rail.addEventListener('wheel', event => {
      if (event.ctrlKey) return;
      const hasHorizontalIntent = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      if (!hasHorizontalIntent && !event.shiftKey) return;
      const delta = hasHorizontalIntent ? event.deltaX : event.deltaY;
      const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rail.clientWidth : 1;
      if (!delta) return;
      const max = Math.max(0, rail.scrollWidth - rail.clientWidth);
      const target = Math.max(0, Math.min(max, rail.scrollLeft + delta * scale));
      if (Math.abs(target - rail.scrollLeft) > 1) {
        event.preventDefault();
        rail.scrollLeft = target;
      }
    }, { passive: false });
    rail.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      if ((event.key === 'Home' || event.key === 'End') && event.target !== rail) return;
      event.preventDefault();
      event.stopPropagation();
      const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      if (event.key === 'Home') rail.scrollTo({ left: 0, behavior });
      else if (event.key === 'End') rail.scrollTo({ left: rail.scrollWidth, behavior });
      else rail.scrollBy({ left: (event.key === 'ArrowRight' ? 1 : -1) * Math.max(180, rail.clientWidth * .32), behavior });
    });
    progress.addEventListener('pointerdown', event => {
      if (event.button !== 0 || !wrap.classList.contains('can-scroll')) return;
      progress.focus({ preventScroll: true });
      progress.setPointerCapture(event.pointerId);
      wrap.classList.add('dragging');
      setScrollFromPointer(event.clientX);
      event.preventDefault();
      event.stopPropagation();
    });
    progress.addEventListener('pointermove', event => {
      if (progress.hasPointerCapture(event.pointerId)) setScrollFromPointer(event.clientX);
    });
    const endDrag = event => {
      if (!progress.hasPointerCapture(event.pointerId)) return;
      wrap.classList.remove('dragging');
      progress.releasePointerCapture(event.pointerId);
    };
    progress.addEventListener('pointerup', endDrag);
    progress.addEventListener('pointercancel', endDrag);
    progress.addEventListener('lostpointercapture', () => wrap.classList.remove('dragging'));
    progress.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      event.stopPropagation();
      const max = Math.max(0, rail.scrollWidth - rail.clientWidth);
      const step = Math.max(80, rail.clientWidth * .12);
      const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
      if (event.key === 'Home') rail.scrollTo({ left: 0, behavior });
      else if (event.key === 'End') rail.scrollTo({ left: max, behavior });
      else {
        const direction = event.key === 'ArrowRight' || event.key === 'PageDown' ? 1 : -1;
        rail.scrollBy({ left: direction * (event.key.startsWith('Page') ? rail.clientWidth * .8 : step), behavior });
      }
    });

    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(update);
      observer.observe(rail);
      shelfObservers.push(observer);
    }
    update();
  });
}
function heroInit(){clearInterval(hT);const h=$('.hero');if(!h)return;const fl=ITEMS.filter(x=>x.k==='m'&&vis(x)&&!x.user).slice(0,4);if(fl.length<2)return;
 const dots=document.createElement('div');dots.className='dots';dots.innerHTML=fl.map((_,i)=>`<button aria-label="Show film ${i+1}" data-hs="${i}"></button>`).join('');h.appendChild(dots);
 const mark=i=>dots.querySelectorAll('button').forEach((b,j)=>b.classList.toggle('on',j===i));
 const set=f=>{h.querySelector('svg').outerHTML=scene(f);h.querySelector('.meta2').textContent=f.s+', '+fmt(f.len)+' preview';h.querySelector('h1').textContent=f.t;h.querySelector('p').textContent=f.d;h.querySelector('[data-id]').dataset.id=f.id;const sv=h.querySelector('[data-save]');sv.dataset.save=f.id;sv.textContent=saved.includes(f.id)?'Saved':'Save'};
 const go=i=>{hi=i;h.classList.add('sw');setTimeout(()=>{set(fl[i]);mark(i);h.classList.remove('sw')},260)};
 hi=hi%fl.length;if(h.querySelector('[data-id]').dataset.id!==fl[hi].id)set(fl[hi]);mark(hi);
 dots.onclick=e=>{const b=e.target.closest('[data-hs]');if(b){clearInterval(hT);go(+b.dataset.hs)}};
 if(!matchMedia('(prefers-reduced-motion:reduce)').matches)hT=setInterval(()=>{if(!document.hidden&&$('#stage').style.display!=='flex')go((hi+1)%fl.length)},7000)}
const rr=render;render=()=>{rr();decor();heroInit()};
const oi6=info;info=()=>{oi6();if(cur)$('#mA').innerHTML=cur.thumb?`<img src="${cur.thumb}" alt="">`:scene(cur)};
addEventListener('scroll',()=>$('.top').classList.toggle('stuck',scrollY>8),{passive:true});
$('#nav').addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
/* ---------- no size limits: usage breakdown; playlists ---------- */
const fmtB=b=>b>=1073741824?(b/1073741824).toFixed(2)+' GB':b>=1048576?(b/1048576).toFixed(1)+' MB':Math.max(0,Math.round(b/1024))+' KB';
function paintMeter(){const sz={m:0,a:0,c:0};ITEMS.filter(x=>x.user).forEach(x=>sz[x.k]+=x.size||0);
 const segs=[['Films',sz.m,'#8b9bff'],['Music',sz.a,'#ff7b8a'],['Clips',sz.c,'#4fd1a5']].filter(s=>s[1]>0),tot=sz.m+sz.a+sz.c;
 $('#mm').innerHTML=segs.map(s=>`<i style="width:0;background:${s[2]}" data-w="${s[1]/tot*100}"></i>`).join('');
 $('#lg').innerHTML=segs.length?segs.map(s=>`<span><b style="background:${s[2]}"></b>${s[0]} ${fmtB(s[1])}</span>`).join('')+`<span><b style="background:var(--mute)"></b>Your files ${fmtB(tot)}</span>`:'<span>No files added yet</span>';
 setTimeout(()=>document.querySelectorAll('#mm i').forEach(i=>i.style.width=i.dataset.w+'%'),60)}
let pls=[],pdFor=null,activePl=null;try{pls=JSON.parse(localStorage.getItem('mosaic-pls')||'[]')}catch(e){}
const savePl=()=>{try{localStorage.setItem('mosaic-pls',JSON.stringify(pls))}catch(e){}};
function plHTML(){
 const chosen=pls.find(p=>p.id===activePl);if(activePl&&!chosen)activePl=null;
 if(chosen){const rows=chosen.ids.map((id,index)=>({id,index,item:by(id)})),available=rows.filter(x=>x.item),duration=available.reduce((n,x)=>n+(x.item.len||0),0);
  return `<section class="playlist-detail"><button class="playlist-back" data-plback>‹ All playlists</button><div class="playlist-detail-head"><div class="playlist-art"><span>♫</span><small>${available.length} TRACKS</small></div><div class="playlist-detail-copy"><span class="eyebrow">YOUR COLLECTION</span><h2>${esc(chosen.name)}</h2><p>${available.length} ${available.length===1?'item':'items'} · ${fmt(duration)}${rows.length>available.length?' · '+(rows.length-available.length)+' unavailable':''}</p><div class="playlist-actions"><button class="b" data-ppl="${chosen.id}">Play all</button><button class="b o" data-prename="${chosen.id}">Rename</button><button class="b o" data-dpl="${chosen.id}">Delete</button></div></div></div><div class="playlist-tracklist">${rows.length?rows.map(({id,index,item})=>`<div class="playlist-track"><span class="playlist-index">${String(index+1).padStart(2,'0')}</span><button class="playlist-track-name" data-pitem="${index}" ${item?'':'disabled'}><b>${esc(item?.t||'Unavailable media item')}</b><small>${esc(item?.s||'This title is no longer in the library')}</small></button><span class="playlist-track-type">${item?esc(names[item.k]||'Media'):'Unavailable'}</span><div class="playlist-track-actions"><button class="ib" data-pup="${index}" aria-label="Move up" ${index===0?'disabled':''}>↑</button><button class="ib" data-pdown="${index}" aria-label="Move down" ${index===rows.length-1?'disabled':''}>↓</button><button class="ib" data-prm="${index}" aria-label="Remove from playlist">×</button></div></div>`).join(''):'<p class="empty">This playlist is empty. Add titles from the player.</p>'}</div></section>`
 }
 return `<section class="playlist-hub"><div class="playlist-hub-head"><div><span class="eyebrow">YOUR COLLECTION</span><h2>Playlists</h2><p>Soundtracks, film nights, and everything you want to return to.</p></div><button class="b" data-npl>＋ New playlist</button></div>${pls.length?'<div class="plg">'+pls.map((p,index)=>{const n=p.ids.filter(by).length,d=p.ids.map(by).filter(Boolean).reduce((t,x)=>t+(x.len||0),0);return `<article class="plc" style="--plh:${(index*61+34)%360}"><div class="playlist-card-art"><span>♫</span><small>${n} ${n===1?'ITEM':'ITEMS'}</small></div><div class="playlist-card-copy"><b>${esc(p.name)}</b><small>${n} ${n===1?'title':'titles'} · ${fmt(d)}</small></div><div class="btns"><button class="b" data-pview="${p.id}">Open</button><button class="b o" data-ppl="${p.id}">Play</button><button class="ib" data-dpl="${p.id}" aria-label="Delete ${esc(p.name)}">×</button></div></article>`}).join('')+'</div>':'<div class="playlist-empty"><span>♫</span><h3>Your first playlist starts here</h3><p>Bring films, songs, and clips together in a collection of your own.</p><button class="b" data-npl>Create a playlist</button></div>'}</section>`
}
function pdPaint(){$('#pl').innerHTML=pls.length?pls.map(p=>{const on=pdFor&&p.ids.includes(pdFor),n=p.ids.filter(by).length;return `<div class="rw"><div class="f"><b>${esc(p.name)}</b><small>${n} ${n===1?'item':'items'}</small></div>${pdFor?`<button class="b ${on?'':'o'}" data-pt="${p.id}">${on?'Added':'Add'}</button>`:''}</div>`}).join(''):'<p class="empty">No playlists yet. Name one below.</p>'}
function pdOpen(id){pdFor=id;pdPaint();$('#pd').showModal();$('#pn').focus()}
$('#apl').onclick=()=>{if(cur)pdOpen(cur.id)};$('#px').onclick=()=>$('#pd').close();
$('#pc').onclick=()=>{const n=$('#pn').value.trim().slice(0,48);if(!n)return $('#pn').focus();if(pls.some(p=>p.name.toLocaleLowerCase()===n.toLocaleLowerCase())){toast('A playlist with that name already exists.');$('#pn').focus();return}pls.push({id:'p'+Date.now(),name:n,ids:pdFor?[pdFor]:[]});savePl();$('#pn').value='';pdPaint();if(tab==='l')render();toast('Playlist created')};
$('#pn').addEventListener('keydown',e=>{if(e.key==='Enter')$('#pc').click()});
document.addEventListener('click',e=>{let b;if(e.target.closest('[data-npl]'))return pdOpen(null);
 if(b=e.target.closest('[data-pview]')){activePl=b.dataset.pview;render();return}
 if(e.target.closest('[data-plback]')){activePl=null;render();return}
 if(b=e.target.closest('[data-pitem]')){const p=pls.find(x=>x.id===activePl),item=p&&by(p.ids[+b.dataset.pitem]);if(item)play(item.id);return}
 if(b=e.target.closest('[data-prm],[data-pup],[data-pdown]')){const p=pls.find(x=>x.id===activePl);if(!p)return;const i=+(b.dataset.prm??b.dataset.pup??b.dataset.pdown);if(b.hasAttribute('data-prm')){p.ids.splice(i,1);savePl();render();toast('Removed from playlist');return}const j=b.hasAttribute('data-pup')?i-1:i+1;if(j<0||j>=p.ids.length)return;[p.ids[i],p.ids[j]]=[p.ids[j],p.ids[i]];savePl();render();return}
 if(b=e.target.closest('[data-prename]')){const p=pls.find(x=>x.id===b.dataset.prename);if(!p)return;const n=prompt('Rename playlist',p.name)?.trim().slice(0,48);if(n&&!pls.some(x=>x!==p&&x.name.toLocaleLowerCase()===n.toLocaleLowerCase())){p.name=n;savePl();render();toast('Playlist renamed')}else if(n)toast('A playlist with that name already exists.');return}
 if(b=e.target.closest('[data-pt]')){const p=pls.find(x=>x.id===b.dataset.pt);if(p){p.ids=p.ids.includes(pdFor)?p.ids.filter(x=>x!==pdFor):[...p.ids,pdFor];savePl();pdPaint();if(tab==='l')render()}return}
 if(b=e.target.closest('[data-dpl]')){const id=b.dataset.dpl;if(!confirm('Delete this playlist?'))return;pls=pls.filter(x=>x.id!==id);if(activePl===id)activePl=null;savePl();render();return toast('Playlist deleted')}
 if(b=e.target.closest('[data-ppl]')){const p=pls.find(x=>x.id===b.dataset.ppl),l=p?p.ids.map(by).filter(x=>x&&vis(x)):[];if(!l.length)return toast('This playlist is empty');queue=l.slice(1).map(x=>x.id);qUpd();play(l[0].id)}});
/* ---------- Audio studio (all on-device, no cloud) ---------- */
var vidRouted=false,lpA=null,lpB=null;
function noise(len,freq,type,g){const n=Math.floor(AC.sampleRate*len),b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);const s=AC.createBufferSource(),f=AC.createBiquadFilter(),e=AC.createGain();f.type=type;f.frequency.value=freq;e.gain.value=g;s.buffer=b;s.connect(f);f.connect(e);e.connect(master);s.start()}
/* equalizer, bass boost, crossfade */
const BANDS=[31,62,125,250,500,1000,2000,4000,8000,16000],EQP={Flat:[0,0,0,0,0,0,0,0,0,0],'Bass boost':[6,5,4,2,0,0,0,0,0,0],Vocal:[-2,-2,-1,1,3,4,3,1,0,-1],Treble:[0,0,0,0,0,1,3,5,6,6],Rock:[5,4,2,-1,-2,-1,2,4,5,5],Lounge:[-2,-1,0,1,2,2,1,0,-1,-2]};
let eqG=EQP.Flat.slice(),eqN=[],bassN=null,bassOn=false,xf=0,xg=null,fading=false,dynN=null,dynamics='off';
try{const s=JSON.parse(localStorage.getItem('mosaic-eq')||'null');if(s){eqG=s.g||eqG;bassOn=!!s.b;xf=s.x||0;dynamics=s.d||'off'}}catch(e){}
function setDynamics(){if(!dynN)return;dynN.threshold.value=dynamics==='limiter'?-5:dynamics==='compressor'?-24:0;dynN.knee.value=dynamics==='limiter'?0:dynamics==='compressor'?18:0;dynN.ratio.value=dynamics==='limiter'?16:dynamics==='compressor'?3:1;dynN.attack.value=dynamics==='limiter'?.003:.015;dynN.release.value=.18}
function buildEQ(){let p=master;eqN=BANDS.map((f,i)=>{const n=AC.createBiquadFilter();n.type='peaking';n.frequency.value=f;n.Q.value=1.1;n.gain.value=eqG[i];p.connect(n);p=n;return n});bassN=AC.createBiquadFilter();bassN.type='lowshelf';bassN.frequency.value=90;bassN.gain.value=bassOn?7:0;p.connect(bassN);xg=AC.createGain();dynN=AC.createDynamicsCompressor();setDynamics();bassN.connect(xg);xg.connect(dynN);dynN.connect(an)}
const saveEQ=()=>{try{localStorage.setItem('mosaic-eq',JSON.stringify({g:eqG,b:bassOn,x:xf,d:dynamics}))}catch(e){}};
function eqPaint(){$('#eqp').innerHTML=Object.keys(EQP).map(k=>`<button class="chip ${EQP[k].join()===eqG.join()?'on':''}" data-eqp="${k}">${k}</button>`).join('');$('#eqs').innerHTML=BANDS.map((f,i)=>`<div class="eqb"><input type="range" min="-12" max="12" step="1" value="${eqG[i]}" data-eqb="${i}" aria-label="${f} Hz"><small>${f>=1000?f/1000+'k':f}</small></div>`).join('');$('#bb').textContent=bassOn?'On':'Off';$('#bb').classList.toggle('on',bassOn);$('#dyn').value=dynamics;$('#xf').value=xf;$('#xv').textContent=xf?xf+' s':'Off'}
$('#stu').onclick=()=>{eqPaint();$('#eq').showModal()};$('#eqx').onclick=()=>$('#eq').close();
$('#eq').addEventListener('input',e=>{const t=e.target;if(t.dataset.eqb!==undefined){const i=+t.dataset.eqb;eqG[i]=+t.value;if(eqN[i])eqN[i].gain.value=eqG[i];saveEQ();document.querySelectorAll('#eqp .chip').forEach(c=>c.classList.toggle('on',EQP[c.dataset.eqp].join()===eqG.join()))}if(t.id==='xf'){xf=+t.value;$('#xv').textContent=xf?xf+' s':'Off';saveEQ()}if(t.id==='dyn'){dynamics=t.value;setDynamics();saveEQ()}});
document.addEventListener('click',e=>{const p=e.target.closest('[data-eqp]');if(p){eqG=EQP[p.dataset.eqp].slice();eqN.forEach((n,i)=>n.gain.value=eqG[i]);saveEQ();eqPaint()}});
$('#bb').onclick=()=>{bassOn=!bassOn;if(bassN)bassN.gain.value=bassOn?7:0;saveEQ();eqPaint()};
$('#eqr').onclick=()=>{eqG=EQP.Flat.slice();eqN.forEach(n=>n.gain.value=0);bassOn=false;if(bassN)bassN.gain.value=0;xf=0;dynamics='off';setDynamics();saveEQ();eqPaint()};
function fadeIn(){if(!xg)return;const t=AC.currentTime;xg.gain.cancelScheduledValues(t);if(xf>0){xg.gain.setValueAtTime(0,t);xg.gain.linearRampToValueAtTime(1,t+xf/2)}else xg.gain.setValueAtTime(1,t);fading=false}
function seekTo(t){pos=t;last=-1;if(cur.src)$('#vid').currentTime=t;ui()}
setInterval(()=>{if(!cur||!playing)return;if(xg&&xf>0&&cur.k==='a'&&cur.len>xf*2&&cur.len-pos<=xf/2&&!fading){fading=true;const t=AC.currentTime;xg.gain.cancelScheduledValues(t);xg.gain.setValueAtTime(xg.gain.value,t);xg.gain.linearRampToValueAtTime(0,t+Math.max(.3,cur.len-pos))}if(lpB!=null&&pos>=lpB)seekTo(lpA)},150);
$('#abl').onclick=()=>{if(!cur||cur.live)return toast('Looping works on songs, films and clips.');if(lpA==null){lpA=pos;$('#abl').textContent='Set loop end';toast('Loop start set')}else if(lpB==null){if(pos<=lpA+1)return toast('Pick a later moment.');lpB=pos;$('#abl').textContent='Clear loop';toast('Looping this section')}else{lpA=lpB=null;$('#abl').textContent='A-B loop'}};
const op3=play;play=id=>{op3(id);lpA=lpB=null;$('#abl').textContent='A-B loop';if(cur.src&&AC&&!vidRouted){try{const source=AC.createMediaElementSource($('#vid')),delay=AC.createDelay(2);delay.delayTime.value=(window.MosaicPlayerAudioDelayMs||0)/1000;source.connect(delay);delay.connect(master);window.MosaicPlayerVideoDelayNode=delay;vidRouted=true;$('#vid').volume=1}catch(e){}}if(xg)fadeIn()};
/* visualiser styles */
const VS=['Aurora','Bars','Wave','Rings'];let vsI=0;$('#vst').onclick=()=>{vsI=(vsI+1)%VS.length;$('#vst').textContent='Visual: '+VS[vsI]};
function paint(c,h,t,live){const dp=devicePixelRatio>1?1.5:1,w=c.width=c.clientWidth*dp,ht=c.height=c.clientHeight*dp,g=c.getContext('2d');g.fillStyle='hsl('+h+' 50% 9%)';g.fillRect(0,0,w,ht);g.globalCompositeOperation='lighter';const am=vsI===0||!live?1:.45;
 for(let i=0;i<5;i++){const x=w*(.5+.38*Math.sin(t*.35+i*1.9+h)),y=ht*(.5+.3*Math.cos(t*.27+i*2.3)),r=Math.max(w,ht)*(.28+.06*Math.sin(t+i)),d=g.createRadialGradient(x,y,0,x,y,r);d.addColorStop(0,'hsla('+(h+i*28)%360+',85%,55%,'+.55*am+')');d.addColorStop(1,'transparent');g.fillStyle=d;g.fillRect(0,0,w,ht)}
 g.globalCompositeOperation='source-over';if(!(live&&an))return;const bn=an.frequencyBinCount,a=new Uint8Array(bn),T=new Uint8Array(an.fftSize);an.getByteFrequencyData(a);an.getByteTimeDomainData(T);
 const lv=i=>a[Math.min(bn-1,Math.floor(Math.pow(i/64,1.5)*bn*.7))]/255;g.fillStyle='rgba(255,255,255,.82)';g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=3*dp;
 if(vsI<2){const n=vsI?64:48,bw=w/n;for(let i=0;i<n;i++){const v=lv(i*64/n)*ht*(vsI?.7:.4);g.fillRect(i*bw+bw*.15,ht-v-12,bw*.7,v+2)}}
 else if(vsI===2){g.beginPath();for(let i=0;i<T.length;i++){const x=i/T.length*w,y=ht/2+(T[i]-128)/128*ht*.4;i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}
 else{const n=72,R=Math.min(w,ht)*.2;for(let i=0;i<n;i++){const an2=i/n*Math.PI*2+t*.2,v=lv(i%36*64/36)*Math.min(w,ht)*.28;g.beginPath();g.moveTo(w/2+Math.cos(an2)*R,ht/2+Math.sin(an2)*R);g.lineTo(w/2+Math.cos(an2)*(R+v+4),ht/2+Math.sin(an2)*(R+v+4));g.stroke()}}}
/* ---------- settings sheet, live storage, cross-tab sync ---------- */
try{if(localStorage.getItem('mosaic-rm')==='1')document.documentElement.classList.add('rm')}catch(e){}
let sigS='';
async function refreshStorage(){const su=$('#su');if(!su)return;let u=0,per=false;try{u=(await navigator.storage.estimate()).usage||0;per=await navigator.storage.persisted()}catch(e){}
 const sz={m:0,a:0,c:0},us=ITEMS.filter(x=>x.user);us.forEach(x=>sz[x.k]+=x.size||0);const tot=sz.m+sz.a+sz.c;
 su.textContent=fmtB(Math.max(u,tot));
 [['bmm',sz.m],['ba',sz.a],['bc',sz.c]].forEach(([id,v])=>{const el=$('#'+id);if(el)el.style.width=tot?v/tot*100+'%':'0'});
 $('#lg').innerHTML=tot?[['Films',sz.m,'#8b9bff'],['Music',sz.a,'#ff7b8a'],['Clips',sz.c,'#4fd1a5']].filter(s=>s[1]>0).map(s=>`<span><b style="background:${s[2]}"></b>${s[0]} ${fmtB(s[1])}</span>`).join(''):'<span>Add files to see a breakdown</span>';
 $('#sp').textContent=per?'Protected from automatic cleanup':'Browser may clear this when space runs low';$('#spb').style.display=per?'none':'';
 $('#sts').textContent='Live \u00b7 '+new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'});
 const rows=us.slice().sort((a,b)=>(b.size||0)-(a.size||0)),sig=rows.map(x=>x.id+'|'+x.size+'|'+x.t).join(',');
 if(sig!==sigS||!$('#sl').dataset.s){sigS=sig;$('#sl').dataset.s=1;$('#sl').innerHTML=rows.length?rows.map(x=>`<div class="rw"><div class="f"><b>${esc(x.t)}</b><small>${names[x.k]}${x.size?' \u00b7 '+fmtB(x.size):''}</small></div><button class="b o" data-del="${x.id}">Remove</button></div>`).join(''):'<p class="empty">No files yet. Use Add your files in the top bar.</p>'}}
function paintAp(){const sw=(l,k,c)=>l.map(v=>`<button class="sw ${c===v?'on':''}" data-th="${k}" data-v="${v}" style="background:${v}" aria-label="${k} ${v}"></button>`).join('');
 const tg=(k,on,label,sub)=>`<div class="row2"><div><b>${label}</b><br><small class="time">${sub}</small></div><button class="sw2 ${on?'on':''}" data-sw="${k}" role="switch" aria-checked="${on}" aria-label="${label}"></button></div>`;
 const demos=demoItems(),demoVisible=demos.filter(vis).length,rm=document.documentElement.classList.contains('rm'),nU=ITEMS.filter(x=>x.user).length;
 $('#ap').innerHTML=`<div class="sc"><h4>Demo data</h4><p class="time">Add or remove Mosaic’s built-in preview titles from your library view. Your files, playlists, and saved titles are untouched. Demo titles are bundled with the app and can be added again any time.</p><div class="row2"><span class="time">${demoVisible} of ${demos.length} demo titles shown</span></div><div class="chips"><button class="chip" data-demo-action="remove" ${demoVisible ? '' : 'disabled'}>Remove demo data</button><button class="chip" data-demo-action="add" ${demoVisible < demos.length ? '' : 'disabled'}>Add demo data</button></div></div><div class="sc"><h4>Appearance</h4><p class="time">Choose a preset, or pick a custom colour. Custom colours preview as you pick and save when you finish.</p><div class="seg">${['system','dark','light'].map(m=>`<button class="${th.mode===m&&!th.bg?'on':''}" data-th="mode" data-v="${m}">${m[0].toUpperCase()+m.slice(1)}</button>`).join('')}</div><div class="row2"><span>Background</span></div><div class="chips" style="padding:4px">${sw(Object.values(PRE),'bg',th.bg)}<label class="sw pick" title="Custom colour"><input type="color" id="cbg" value="${th.bg||'#17111f'}" aria-label="Custom background colour"></label></div><div class="row2"><span>Accent</span></div><div class="chips" style="padding:4px">${sw(ACC,'acc',th.acc)}<label class="sw pick" title="Custom colour"><input type="color" id="cac" value="${th.acc||'#f2b24c'}" aria-label="Custom accent colour"></label></div>${tg('rm',rm,'Reduce motion','Turns off animations')}<button class="chip" data-th="reset">Reset appearance</button></div>
 <div class="sc"><h4>Sound</h4><div class="row2"><span>Volume</span><input id="svol" type="range" min="0" max="1" step="0.05" value="${vol}" style="flex:1;max-width:220px"></div>${IOS?'<small class="time">On iPhone, use your device volume buttons.</small>':''}<div class="row2"><span>Equalizer, bass and crossfade</span><button class="chip" data-sa="studio">Open Studio</button></div>${tg('shake',shakeOn,'Shake to skip','Shake your phone for the next track')}${tg('hap',hapOn,'Beat haptics','Vibrate on the beat (Android)')}${tg('auto',autoOn,'Autoplay next','Keep playing the next title')}</div>
 <div class="sc"><h4>Library</h4><div class="row2"><span class="time">${nU} of your files \u00b7 ${pls.length} playlists \u00b7 ${saved.length} saved</span></div><div class="chips" style="padding:2px 0 6px"><button class="chip" data-sa="hist">Clear watch history</button><button class="chip" data-sa="keys">Keyboard shortcuts</button><button class="chip" data-sa="prof">Switch profile</button></div></div>
 
 <div class="sc"><h4>Storage <span class="lv" id="sts">Live</span></h4><div class="big" id="su">0 KB</div><div class="meter"><i id="bmm" style="background:#8b9bff"></i><i id="ba" style="background:#ff7b8a"></i><i id="bc" style="background:#4fd1a5"></i></div><div class="lg" id="lg"></div><div class="row2"><span class="time" id="sp"></span><button class="chip" id="spb" data-sa="persist">Protect my files</button></div><div id="sl"></div></div>
 ${famCard()}${syncCard()}<div class="sc"><h4>About</h4><small class="time">Mosaic keeps your files privately on this device. Nothing is uploaded unless you turn on sync, and sync never includes your files.</small></div>`;refreshStorage()}
async function openSettings(){paintAp();if(!$('#sm').open)$('#sm').showModal()}
openSM=openSettings;$('#stbtn').onclick=()=>openSM();
document.addEventListener('click',e=>{let b;if(b=e.target.closest('[data-sw]')){const k=b.dataset.sw;
 if(k==='rm'){const on=document.documentElement.classList.toggle('rm');try{localStorage.setItem('mosaic-rm',on?'1':'0')}catch(x){}}
 paintAp();return}
 if(b=e.target.closest('[data-sa]')){const a=b.dataset.sa;if(a==='studio')$('#stu').click();else if(a==='keys')$('#kb').showModal();else if(a==='hist'){prog={};try{localStorage.setItem('mosaic-prog','{}')}catch(x){}render();toast('Watch history cleared')}else if(a==='persist'){try{navigator.storage.persist().then(ok=>{toast(ok?'Your files are protected':'Your browser did not allow this');refreshStorage()}).catch(()=>toast('Could not check storage protection'))}catch(x){toast('Storage protection is not available')}}}});
document.addEventListener('input',e=>{if(e.target.id==='svol')setVol(+e.target.value)});
const rr2=render;render=()=>{rr2();if($('#sm').open)refreshStorage()};
setInterval(()=>{if($('#sm').open)refreshStorage()},2500);
const bc=window.BroadcastChannel?new BroadcastChannel('mosaic'):null;const ping=()=>setTimeout(()=>{try{bc&&bc.postMessage(1)}catch(e){}},400);
if(bc)bc.onmessage=async()=>{for(let i=ITEMS.length-1;i>=0;i--)if(ITEMS[i].user){revokeItemUrl(ITEMS[i]);ITEMS.splice(i,1)}await dbLoad();toast('Library updated from another tab')};
addEventListener('storage',e=>{try{if(e.key==='mosaic-saved')saved=JSON.parse(e.newValue||'[]');else if(e.key==='mosaic-prog')prog=JSON.parse(e.newValue||'{}');else if(e.key==='mosaic-hid'){hid.clear();JSON.parse(e.newValue||'[]').forEach(i=>hid.add(i))}else if(e.key==='mosaic-theme'){th={mode:'system',bg:null,acc:null,...JSON.parse(e.newValue||'{}')};applyTheme(false);return}else if(e.key==='mosaic-pls')pls=JSON.parse(e.newValue||'[]');else return;render()}catch(x){}});
/* ---------- LAB: seed records, mood map, soundscapes, focus, wind-down, beat pads, scenes ---------- */
var shakeOn=false,hapOn=false,padOn=false,pendingSeed=0;
try{shakeOn=localStorage.getItem('mosaic-shake')==='1';hapOn=localStorage.getItem('mosaic-hap')==='1'}catch(e){}
const mb=s=>()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const rnd=(x,n,i)=>x.seed!=null?mb(x.seed*7919+n*104729+i*1299721)():Math.random();
const AD=['Amber','Velvet','Quiet','Neon','Paper','Golden','Hollow','Silver','Slow','Wild','Misty','Cobalt'],NO=['Tide','Harbor','Lantern','Orbit','Meadow','Signal','Ember','Drift','Bloom','Echo','Canyon','Comet'];
const SCALES=[[0,3,5,7,10],[0,2,4,7,9],[0,2,3,5,7,8,10],[0,2,3,7,9],[0,2,4,5,7,9,11]];
function seedCh(seed){const r=mb(seed),pk=a=>a[Math.floor(r()*a.length)],offs=[0,2,3,5,7,8,10];const t=pk(AD)+' '+pk(NO);
 return {id:'lab',k:'a',lab:true,live:true,len:1e9,seed,t,s:'Seed '+seed.toString(16).toUpperCase(),d:'A record pressed from a seed',h:Math.floor(r()*360),bpm:50+Math.floor(r()*75),key:Math.floor(r()*12),scale:pk(SCALES),prog:[0,1,2,3].map(()=>pk(offs)),dens:.1+r()*.45,lead:pk(['sine','triangle','square','sawtooth']),warm:.8+r()*.7,drums:r()<.35?0:r()<.6?1:2,scn:Math.floor(r()*4)}}
function stepLab(n){if(!AC||!cur)return;const x=cur,beat=60/(x.bpm||96),sc=x.scale||SCALES[0],f=s=>110*2**(((x.key||0)+s)/12),prog=x.prog||[0,3,5,7],pr=prog[Math.floor(n/16)%prog.length],r1=rnd(x,n,1),r2=rnd(x,n,2),r3=rnd(x,n,3),r4=rnd(x,n,4);
 if(n%16===0)[0,2,4].forEach(i=>tone(f(pr+sc[i%sc.length]+12),beat*16,'sine',.04*x.warm));if(n%8===0)tone(f(pr)/2,beat*6,'triangle',.11);
 if(x.drums){if(n%4===0){kick();if(hapOn&&navigator.vibrate)navigator.vibrate(10)}if(n%4===2)noise(.05,7000,'highpass',.1);if(x.drums>1&&n%8===4)noise(.14,1800,'bandpass',.22)}
 if(r1<x.dens)tone(f(pr+sc[Math.floor(r2*sc.length)]+12+(r3<.3?12:0)),beat*(1+r4*2),x.lead||'triangle',.05)}
const defaultStep=step;step=n=>cur&&cur.lab?stepLab(n):defaultStep(n);
let LAB=null,seeds=[],pgrid=null,padBpm=96,padStepI=0,padT=0,mood={x:.5,y:.5},drag=false;const lvl={},mm={},NB={};
try{seeds=JSON.parse(localStorage.getItem('mosaic-seeds')||'[]');Object.assign(mm,JSON.parse(localStorage.getItem('mosaic-mood')||'{}'));pgrid=JSON.parse(localStorage.getItem('mosaic-pad')||'null')}catch(e){}
const ROWS=['Kick','Snare','Hat','Bass','Chord'];if(!pgrid){pgrid=ROWS.map(()=>Array(16).fill(0));[0,4,8,12].forEach(i=>pgrid[0][i]=1);[4,12].forEach(i=>pgrid[1][i]=1);for(let i=0;i<16;i+=2)pgrid[2][i]=1}
const saveSeeds=()=>{try{localStorage.setItem('mosaic-seeds',JSON.stringify(seeds))}catch(e){}},savePad=()=>{try{localStorage.setItem('mosaic-pad',JSON.stringify(pgrid))}catch(e){}};
function setLab(c){const i=ITEMS.findIndex(x=>x.id==='lab');if(i>=0)ITEMS.splice(i,1);ITEMS.push(c);LAB=c}
function pressRecord(seed){seed=seed||(Math.random()*4294967295>>>0);setLab(seedCh(seed));play('lab');if(tab==='x')render()}
function moodApply(){if(!LAB||LAB.seed!=null){setLab({...seedCh(7),seed:null,t:'Mood Mix',s:'Mood map',d:'Shaped by you'});play('lab')}else if(!cur||cur.id!=='lab')play('lab');
 const c=LAB,x=mood.x,y=mood.y;c.bpm=Math.round(48+x*84);c.dens=.08+x*.5;c.drums=x<.25?0:x<.6?1:2;c.scale=SCALES[y>.8?4:y>.55?1:y>.3?2:0];c.lead=y>.6?'triangle':y>.3?'sine':'sawtooth';c.warm=1.5-y*.8;c.h=Math.round(260-y*210)}
const mvp=e=>{const r=$('#mood').getBoundingClientRect();mood.x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));mood.y=Math.max(0,Math.min(1,1-(e.clientY-r.top)/r.height));$('#dot').style.left=mood.x*100+'%';$('#dot').style.top=(1-mood.y)*100+'%';moodApply()};
document.addEventListener('pointerdown',e=>{if(e.target.closest('#mood')&&!e.target.closest('.md')){drag=true;mvp(e)}});document.addEventListener('pointermove',e=>{if(drag&&$('#mood'))mvp(e)});document.addEventListener('pointerup',()=>{drag=false});
async function analyze(x){if(mm[x.id]||!x.src||(x.size||0)>6e7)return;try{initAudio();const buf=await AC.decodeAudioData(await (await fetch(x.src)).arrayBuffer()),d=buf.getChannelData(0),N=Math.min(d.length,buf.sampleRate*60);let e=0,z=0;for(let i=1;i<N;i++){e+=d[i]*d[i];if(d[i]*d[i-1]<0)z++}mm[x.id]=[Math.min(1,Math.sqrt(e/N)*4),Math.min(1,z/N*buf.sampleRate/2/3500)];localStorage.setItem('mosaic-mood',JSON.stringify(mm));if(tab==='x')render()}catch(er){}}
/* soundscapes */
const SC={rain:['Rain',1,'highpass',900,0,0,.5],wind:['Wind',0,'bandpass',420,.12,.6,.9],ocean:['Ocean',0,'lowpass',500,.08,.85,1.2],fire:['Fire',0,'lowpass',260,0,0,1.4],cafe:['Cafe',1,'bandpass',750,.35,.3,.35]},scN={};
function nbuf(w){const k=w?'w':'b';if(NB[k])return NB[k];const n=AC.sampleRate*4,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<n;i++){const v=Math.random()*2-1;if(w)d[i]=v*.6;else{l=(l+.02*v)/1.02;d[i]=l*3.5}}return NB[k]=b}
function scapeSet(k,v){if(v>0)initAudio();if(!AC)return;if(AC.state==='suspended')AC.resume();if(!scN[k]){const[,w,t,f,lf,ld]=SC[k],s=AC.createBufferSource(),fl=AC.createBiquadFilter(),g=AC.createGain(),m=AC.createGain();s.buffer=nbuf(w);s.loop=true;fl.type=t;fl.frequency.value=f;fl.Q.value=.7;m.gain.value=1;g.gain.value=0;s.connect(fl);fl.connect(m);m.connect(g);g.connect(master);s.start();if(lf){const o=AC.createOscillator(),og=AC.createGain();o.frequency.value=lf;og.gain.value=ld;o.connect(og);og.connect(m.gain);o.start()}scN[k]=g}scN[k].gain.setTargetAtTime(v*SC[k][6],AC.currentTime,.3)}
setInterval(()=>{if(!AC||AC.state!=='running')return;if(lvl.fire>0&&Math.random()<.55)noise(.03,2600,'bandpass',.3*lvl.fire);if(lvl.cafe>0&&Math.random()<.12)tone(1800+Math.random()*1800,.18,'sine',.02*lvl.cafe);if(lvl.rain>0&&Math.random()<.3)tone(900+Math.random()*900,.05,'sine',.008*lvl.rain)},220);
/* focus timer */
const FT={on:false,mode:'focus',end:0,round:1};
function chime(){initAudio();tone(659,1.4,'sine',.14);tone(988,1.8,'sine',.12,.3)}
function ftUpd(l){const e=$('#ftx');if(!e)return;const s=Math.max(0,Math.ceil((l==null?FT.end-Date.now():l)/1000));e.textContent=FT.on?(FT.mode==='focus'?'Focus ':'Break ')+Math.floor(s/60)+':'+String(s%60).padStart(2,'0')+' \u00b7 round '+FT.round:'25 minutes focus, then a break';$('#ftb').textContent=FT.on?'Stop':'Start focus'}
function ftStart(){initAudio();if(AC.state==='suspended')AC.resume();FT.on=true;FT.mode='focus';FT.round=1;FT.end=Date.now()+25*60000;play('r3');ftUpd()}
setInterval(()=>{if(!FT.on)return;let l=FT.end-Date.now();if(l<=0){chime();if(FT.mode==='focus'){FT.mode='break';FT.end=Date.now()+(FT.round%4?5:15)*60000;play('r1');toast('Break time')}else{FT.mode='focus';FT.round++;FT.end=Date.now()+25*60000;play('r3');toast('Back to focus. Round '+FT.round)}l=FT.end-Date.now()}ftUpd(l)},1000);
/* wind-down */
const WD={on:false,t0:0,dur:0,b0:0};
function wdUpd(){const e=$('#wdx');if(e)e.textContent=WD.on?'Winding down, '+Math.max(0,Math.ceil((WD.dur-(Date.now()-WD.t0))/60000))+' min left':'Slows, softens and dims, then stops'}
function wdStart(min){if(!cur)return toast('Play something first.');WD.on=true;WD.t0=Date.now();WD.dur=min*60000;WD.b0=cur.bpm||0;$('#dim').style.display='block';wdUpd()}
function wdEnd(done){WD.on=false;$('#dim').style.display='none';$('#dim').style.opacity=0;if(xg)xg.gain.setTargetAtTime(1,AC.currentTime,.1);eqN.forEach((n,i)=>n.gain.value=eqG[i]);if(done&&cur&&playing)toggle();wdUpd()}
setInterval(()=>{if(!WD.on)return;const p=Math.min(1,(Date.now()-WD.t0)/WD.dur);if(xg)xg.gain.setTargetAtTime(Math.max(0,1-p),AC.currentTime,.5);eqN.forEach((n,i)=>{if(i>=6)n.gain.value=eqG[i]-14*p});$('#dim').style.opacity=p*.8;if(p>=1)wdEnd(true);wdUpd()},2000);
/* beat pads and loop recording */
function padTick(){const i=padStepI%16,k=((LAB||cur||{}).key)||0;if(AC){if(pgrid[0][i])kick();if(pgrid[1][i])noise(.14,1800,'bandpass',.25);if(pgrid[2][i])noise(.05,7000,'highpass',.12);if(pgrid[3][i])tone(55*2**(k/12),.28,'triangle',.28);if(pgrid[4][i])[0,3,7].forEach(s=>tone(220*2**((k+s)/12),.22,'triangle',.07))}
 document.querySelectorAll('.pd').forEach(e=>e.classList.toggle('cur',+e.dataset.c===i));if(hapOn&&pgrid[0][i]&&navigator.vibrate)navigator.vibrate(12);padStepI++}
function padToggle(on){padOn=on;clearInterval(padT);if(on){initAudio();if(AC.state==='suspended')AC.resume();padStepI=0;padT=setInterval(padTick,60/padBpm/4*1000)}const b=$('#pdp');if(b)b.textContent=on?'Stop':'Play'}
function recStart(){initAudio();const st=$('#sink').srcObject;if(!st||!window.MediaRecorder)return toast('Recording is not supported here.');const ch=[],r=new MediaRecorder(st);r.ondataavailable=e=>ch.push(e.data);r.onstop=()=>{const b=new Blob(ch,{type:r.mimeType||'audio/webm'}),f=new File([b],'Mosaic loop '+new Date().toLocaleTimeString().replace(/[: ]/g,'-')+'.webm',{type:b.type});f._dur=15;stageFiles([f]);const x=$('#rcb');if(x)x.disabled=false};r.start();toast('Recording 15 seconds...');const x=$('#rcb');if(x)x.disabled=true;setTimeout(()=>r.stop(),15000)}
/* Lab screen */
function labHTML(){(async()=>{for(const x of ITEMS.filter(x=>x.user&&x.k==='a'&&!mm[x.id]).slice(0,4))await analyze(x)})();
 const rec=seeds.map((s,i)=>`<div class="rec"><button class="disc" data-seed="${s.seed}" style="--h:${s.seed%360}" aria-label="Play ${esc(s.name)}"></button><b>${esc(s.name)}</b><small>${s.seed.toString(16).toUpperCase()}</small><button class="more" data-rm="${i}">Remove</button></div>`).join('');
 const dots=Object.entries(mm).map(([id,v])=>{const x=by(id);return x?`<button class="md" data-id="${id}" style="left:${v[0]*100}%;top:${(1-v[1])*100}%" title="${esc(x.t)}" aria-label="Play ${esc(x.t)}"></button>`:''}).join('');
 return `<h2>Lab</h2><p class="cnt">Make, mix and shape sound. Everything is generated on your device.</p>
<div class="sc"><h4>Seed Records</h4><div class="row2"><div><b>${LAB?esc(LAB.t):'No record yet'}</b><br><small class="time">${LAB&&LAB.seed!=null?'Seed '+LAB.seed.toString(16).toUpperCase():'Press one to begin'}</small></div></div><div class="chips" style="padding:2px 0 8px"><button class="b" data-lab="press">Press a record</button><button class="b o" data-lab="keep">Keep it</button><button class="b o" data-lab="share">Copy share link</button></div>${seeds.length?'<div class="recs">'+rec+'</div>':'<small class="time">Records you keep appear here. A friend who opens your link hears exactly the same music.</small>'}</div>
<div class="sc"><h4>Mood Map <span class="time">drag the dot</span></h4><div id="mood"><span class="ax t">Bright</span><span class="ax b">Dark</span><span class="ax l">Calm</span><span class="ax r">Energetic</span>${dots}<i id="dot" style="left:${mood.x*100}%;top:${(1-mood.y)*100}%"></i></div><small class="time">Dots are your own songs, placed by how they sound. Tap one to play it.</small></div>
<div class="sc"><h4>Soundscapes</h4>${Object.keys(SC).map(k=>`<div class="row2"><span>${SC[k][0]}</span><input type="range" data-sc="${k}" min="0" max="1" step="0.05" value="${lvl[k]||0}" style="flex:1;max-width:240px" aria-label="${SC[k][0]} level"></div>`).join('')}</div>
<div class="sc"><h4>Focus timer</h4><div class="row2"><span id="ftx">25 minutes focus, then a break</span><button class="b" id="ftb" data-lab="focus">Start focus</button></div></div>
<div class="sc"><h4>Wind-down</h4><div class="row2"><span id="wdx">Slows, softens and dims, then stops</span><span><select id="wdm" aria-label="Duration"><option value="15">15 min</option><option value="30" selected>30 min</option><option value="60">60 min</option></select> <button class="b" data-lab="wind">Start</button></span></div></div>
<div class="sc"><h4>Beat pads</h4><div class="pdg">${pgrid.map((r,ri)=>r.map((v,ci)=>`<button class="pd r${ri} ${v?'on':''}" data-r="${ri}" data-c="${ci}" aria-label="${ROWS[ri]} step ${ci+1}"></button>`).join('')).join('')}</div><div class="row2"><div class="chips"><button class="b" id="pdp" data-lab="pad">${padOn?'Stop':'Play'}</button><button class="b o" data-lab="clr">Clear</button><button class="b o" id="rcb" data-lab="rec">Record 15 s</button></div><label class="time">Tempo <input type="range" id="pbm" min="60" max="160" value="${padBpm}"></label></div><small class="time">Rows: ${ROWS.join(', ')}. A recording lands in your library as a song.</small></div>`}
document.addEventListener('click',e=>{let b;
 if(b=e.target.closest('[data-lab]')){const a=b.dataset.lab;
  if(a==='press')pressRecord();
  else if(a==='keep'){if(!LAB||LAB.seed==null)return toast('Press a record first.');if(!seeds.some(s=>s.seed===LAB.seed)){seeds.push({seed:LAB.seed,name:LAB.t});saveSeeds();render();toast('Record kept')}}
  else if(a==='share'){if(!LAB||LAB.seed==null)return toast('Press a record first.');const u=location.href.split('#')[0]+'#seed='+LAB.seed;(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(()=>toast('Link copied. Anyone who opens it hears this record.')).catch(()=>prompt('Copy this link',u))}
  else if(a==='focus'){if(FT.on){FT.on=false;ftUpd()}else ftStart()}
  else if(a==='wind'){if(WD.on){wdEnd(false);b.textContent='Start'}else{wdStart(+$('#wdm').value||30);b.textContent=WD.on?'Cancel':'Start'}}
  else if(a==='pad')padToggle(!padOn);
  else if(a==='clr'){pgrid=ROWS.map(()=>Array(16).fill(0));savePad();render()}
  else if(a==='rec')recStart();return}
 if(b=e.target.closest('[data-seed]'))return pressRecord(+b.dataset.seed);
 if(b=e.target.closest('[data-rm]')){seeds.splice(+b.dataset.rm,1);saveSeeds();render();return}
 if(b=e.target.closest('.pd')){const r=+b.dataset.r,c=+b.dataset.c;pgrid[r][c]^=1;b.classList.toggle('on',!!pgrid[r][c]);savePad();if(pgrid[r][c]){initAudio();[kick,()=>noise(.14,1800,'bandpass',.25),()=>noise(.05,7000,'highpass',.12),()=>tone(55,.25,'triangle',.28),()=>tone(262,.2,'triangle',.08)][r]()}}});
document.addEventListener('input',e=>{const t=e.target;if(t.dataset&&t.dataset.sc){lvl[t.dataset.sc]=+t.value;scapeSet(t.dataset.sc,+t.value)}if(t.id==='pbm'){padBpm=+t.value;if(padOn)padToggle(true)}});
/* phone tricks */
document.addEventListener('click',async e=>{const b=e.target.closest('[data-sw]');if(!b)return;const k=b.dataset.sw;
 if(k==='shake'){shakeOn=!shakeOn;if(shakeOn&&window.DeviceMotionEvent&&DeviceMotionEvent.requestPermission){try{if(await DeviceMotionEvent.requestPermission()!=='granted')shakeOn=false}catch(x){shakeOn=false}}try{localStorage.setItem('mosaic-shake',shakeOn?'1':'0')}catch(x){}paintAp()}
 if(k==='hap'){hapOn=!hapOn;try{localStorage.setItem('mosaic-hap',hapOn?'1':'0')}catch(x){}paintAp();if(hapOn&&navigator.vibrate)navigator.vibrate(30)}});
let shk=0;addEventListener('devicemotion',e=>{if(!shakeOn||!cur)return;const a=e.accelerationIncludingGravity;if(!a)return;if(Math.hypot(a.x||0,a.y||0,a.z||0)>26&&Date.now()-shk>1200){shk=Date.now();hop(1);toast('Skipped')}});
/* scenes */
const SCN={r0:0,r1:1,r2:3,r3:3,r4:2};
function drawScene(c,h,t,live){if(!cur)return;const dp=devicePixelRatio>1?1.5:1,w=c.width=c.clientWidth*dp,H=c.height=c.clientHeight*dp,g=c.getContext('2d');let e=0;if(live&&an){const a=new Uint8Array(an.frequencyBinCount);an.getByteFrequencyData(a);for(let i=0;i<8;i++)e+=a[i];e=e/8/255}
 const k=cur.scn!=null?cur.scn:SCN[cur.id]!=null?SCN[cur.id]:Math.floor(h/90)%4,sk=g.createLinearGradient(0,0,0,H);sk.addColorStop(0,'hsl('+h+' 55% 10%)');sk.addColorStop(1,'hsl('+(h+(k===2?20:35))%360+' 65% '+(k===2?48:26)+'%)');g.fillStyle=sk;g.fillRect(0,0,w,H);
 if(k===0||k===3){g.fillStyle='rgba(255,255,255,.8)';for(let i=0;i<90;i++){const a=.3+.7*Math.abs(Math.sin(t*.8+i));g.globalAlpha=a;g.fillRect(Math.abs(Math.sin(i*91.7))*w,Math.abs(Math.sin(i*37.3))*H*.6,dp*1.5,dp*1.5)}g.globalAlpha=1}
 if(k===0){g.fillStyle='hsl('+h+' 40% 7%)';const n=14,bw=w/n;for(let i=0;i<n;i++){const bh=(.22+.34*Math.abs(Math.sin(i*12.9)))*H,x=i*bw,y=H-bh;g.fillRect(x,y,bw-2*dp,bh);for(let j=0;j<bh/(14*dp)-1;j++)for(let q=0;q<3;q++)if(Math.sin(i*7+j*3+q*5+Math.floor(t*.25))>.25){g.fillStyle='rgba(255,214,120,.75)';g.fillRect(x+bw*(.15+q*.28),y+8*dp+j*14*dp,bw*.16,7*dp)}g.fillStyle='hsl('+h+' 40% 7%)'}}
 else if(k===1){g.strokeStyle='rgba(190,215,255,.4)';g.lineWidth=1.5*dp;for(let i=0;i<110;i++){const x=(i*.618034%1)*w,y=((t*(.28+i%7*.05)+i*.37)%1)*H;g.beginPath();g.moveTo(x,y);g.lineTo(x-4*dp,y+(18+i%5*9)*dp);g.stroke()}g.globalCompositeOperation='lighter';for(let i=0;i<9;i++){const x=(i+.5)/9*w,y=H*(.78+.1*Math.sin(i*2.1)),r=(24+e*50+i%3*14)*dp,d=g.createRadialGradient(x,y,0,x,y,r);d.addColorStop(0,'hsla('+(h+i*40)%360+',90%,60%,.35)');d.addColorStop(1,'transparent');g.fillStyle=d;g.fillRect(x-r,y-r,r*2,r*2)}g.globalCompositeOperation='source-over'}
 else if(k===2){const sy=H*(.6-.1*Math.sin(t*.04)),sr=H*.13*(1+e*.35),d=g.createRadialGradient(w/2,sy,0,w/2,sy,sr*2.6);d.addColorStop(0,'rgba(255,240,190,1)');d.addColorStop(.35,'rgba(255,170,90,.7)');d.addColorStop(1,'transparent');g.fillStyle=d;g.fillRect(0,0,w,H);g.fillStyle='hsl('+h+' 45% 10%)';g.beginPath();g.moveTo(0,H);for(let x=0;x<=w;x+=w/40)g.lineTo(x,H*.68+Math.sin(x/w*7+1)*H*.05);g.lineTo(w,H);g.fill();g.fillStyle='#14121c';g.beginPath();g.moveTo(w*.42,H*.7);g.lineTo(w*.58,H*.7);g.lineTo(w*.9,H);g.lineTo(w*.1,H);g.fill();g.fillStyle='rgba(255,230,150,.85)';for(let i=0;i<8;i++){const z=(i/8+t*.12)%1,y=H*.7+H*.3*z*z,wd=w*.012*(.4+z*3),hh=H*.05*z;g.fillRect(w/2-wd/2,y,wd,hh+2)}}
 else{g.globalCompositeOperation='lighter';for(let j=0;j<3;j++){const gr=g.createLinearGradient(0,H*.2,0,H*.6);gr.addColorStop(0,'hsla('+(150+j*50)+',90%,60%,0)');gr.addColorStop(.5,'hsla('+(150+j*50)+',90%,60%,'+(.22+e*.3)+')');gr.addColorStop(1,'hsla('+(150+j*50)+',90%,60%,0)');g.strokeStyle=gr;g.lineWidth=46*dp;g.beginPath();for(let x=0;x<=w;x+=w/50){const y=H*(.36+.08*j)+Math.sin(x/w*6+t*.4+j*1.7)*H*.07;x?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}g.globalCompositeOperation='source-over'}}
const pa=paint;paint=(c,h,t,live)=>vsI===4?drawScene(c,h,t,live):pa(c,h,t,live);VS.push('Scene');vsI=4;$('#vst').textContent='Visual: Scene';
/* shared seed links */
const hm=/seed=(\d+)/.exec(location.hash);if(hm){pendingSeed=+hm[1];setTimeout(()=>toast('A shared record is waiting. Tap Enter Mosaic to hear it.'),3500)}
$('#enter').addEventListener('click',()=>{if(pendingSeed){const s=pendingSeed;pendingSeed=0;setTimeout(()=>pressRecord(s),700)}});
/* ---------- streaming logic: profiles, ratings, rows, hover card, search, next-up ---------- */
var autoOn=true;try{autoOn=localStorage.getItem('mosaic-auto')!=='0'}catch(e){}
ITEMS.forEach(x=>{if(!x.user&&x.k==='m')x.r={'Sci-fi':'PG',Drama:'PG-13',Thriller:'TV-14',Comedy:'PG'}[x.s]||'PG';else if(!x.user)x.r='G'});
let plays={},likes={},recent=[],popT=0,hideT=0,popId=null,nuX=null,manage=false,adding=false;
try{plays=JSON.parse(localStorage.getItem('mosaic-plays')||'{}');likes=JSON.parse(localStorage.getItem('mosaic-likes')||'{}');recent=JSON.parse(localStorage.getItem('mosaic-recent')||'[]')}catch(e){}
const savePL=()=>{try{localStorage.setItem('mosaic-plays',JSON.stringify(plays));localStorage.setItem('mosaic-likes',JSON.stringify(likes))}catch(e){}};
const aff=x=>{let a=0;for(const id in likes){const y=by(id);if(y&&y.k===x.k&&y.s===x.s)a+=likes[id]*2}for(const id in plays){const y=by(id);if(y&&y.k===x.k&&y.s===x.s)a+=Math.min(3,plays[id])*.5}return a};
const match=x=>{if(likes[x.id]===-1)return 20;const h=[...String(x.id)].reduce((s,c)=>s+c.charCodeAt(0),0);return Math.max(55,Math.min(99,Math.round(72+h%11+aff(x)*3)))};
const topRow=A=>{const l=A.filter(x=>'mac'.includes(x.k)&&!x.lab).sort((a,b)=>(plays[b.id]||0)-(plays[a.id]||0)).slice(0,10);return l.length>2?`<h2 class="rh">Top 10 on Mosaic</h2><div class="rail top10">${l.map((x,i)=>`<div class="tk" style="--i:${i}"><span class="rk">${i+1}</span>${card(x,i)}</div>`).join('')}</div>`:''};
const becauseRow=A=>{const L=by((()=>{try{return localStorage.getItem('mosaic-last')}catch(e){return null}})());if(!L||L.live)return '';const l=A.filter(x=>x.id!==L.id&&x.k===L.k&&!x.lab&&likes[x.id]!==-1).sort((a,b)=>(b.s===L.s)-(a.s===L.s)||aff(b)-aff(a)).slice(0,10);return l.length>1?rail('Because you played '+esc(L.t),l):''};
const genreRow=A=>{const g=[...new Set(A.filter(x=>x.k==='m'&&!x.user).map(x=>x.s))];return g.length?`<div class="chips gr">${g.map((v,i)=>`<button class="chip" style="animation-delay:${i*50}ms" data-gn="${esc(v)}">${esc(v)}</button>`).join('')}</div>`:''};
const op4=play;play=id=>{op4(id);hidePop();if(cur&&!cur.live){plays[cur.id]=(plays[cur.id]||0)+1;savePL();try{localStorage.setItem('mosaic-last',cur.id)}catch(e){}}nuX=null};
function lkUp(){if(!cur)return;$('#lk').textContent=likes[cur.id]===1?'Liked':'Like';$('#dl').textContent=likes[cur.id]===-1?'Disliked':'Dislike';$('#lk').classList.toggle('on',likes[cur.id]===1);$('#dl').classList.toggle('on',likes[cur.id]===-1)}
const pulse=s=>{const b=$(s);b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop')};
$('#lk').onclick=()=>{if(!cur)return;likes[cur.id]=likes[cur.id]===1?0:1;savePL();lkUp();pulse('#lk');toast(likes[cur.id]===1?'Liked. We will suggest more like this.':'Rating removed');render()};
$('#dl').onclick=()=>{if(!cur)return;likes[cur.id]=likes[cur.id]===-1?0:-1;savePL();lkUp();pulse('#dl');toast(likes[cur.id]===-1?'Noted. We will show less like this.':'Rating removed');render()};
const oi8=info;info=()=>{oi8();lkUp()};
document.addEventListener('click',e=>{const b=e.target.closest('[data-gn]');if(b){tab='m';document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x.dataset.t==='m'));lastTab='m';filt=b.dataset.gn;render();scrollTo(0,0)}});
/* hover preview card */
const POP=document.createElement('div');POP.id='popc';document.body.appendChild(POP);
function hidePop(){POP.style.display='none';popId=null}
function showPop(c){const x=by(c.dataset.id);if(!x)return;popId=x.id;const r=c.getBoundingClientRect(),w=Math.max(300,r.width*1.45),l=Math.max(10,Math.min(innerWidth-w-10,r.left+r.width/2-w/2)),t=Math.max(10,Math.min(innerHeight-310,r.top-30));
 POP.innerHTML=`<div class="pa">${x.thumb?`<img src="${x.thumb}" alt="">`:scene(x)}<span class="pz">${x.live?'LIVE':x.k==='a'?'Song':'Preview'}</span></div><div class="pb"><div class="pr"><button class="pcb p" data-id="${x.id}" aria-label="Play ${esc(x.t)}"><svg class="ic" viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z" fill="currentColor"/></svg></button><button class="pcb" data-save="${x.id}" aria-label="Add to My List"><svg class="ic" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button></div><div class="pm"><b class="mt">${match(x)}% Match</b>${x.r?`<span class="rt">${x.r}</span>`:''}<span class="time">${x.live?'Endless':fmt(x.len)}</span></div><b>${esc(x.t)}</b><br><small class="time">${esc(x.s)}${x.d?' \u00b7 '+esc(x.d.slice(0,70)):''}</small></div>`;
 Object.assign(POP.style,{display:'block',left:l+'px',top:t+'px',width:w+'px'});POP.classList.remove('in');void POP.offsetWidth;POP.classList.add('in')}
document.addEventListener('mouseover',e=>{if(!matchMedia('(hover:hover)').matches)return;const inP=e.target.closest('#popc'),c=e.target.closest('.card[data-id]');if(inP){clearTimeout(hideT);return}if(c){clearTimeout(hideT);if(popId!==c.dataset.id){clearTimeout(popT);popT=setTimeout(()=>showPop(c),520)}return}clearTimeout(popT);if(popId){clearTimeout(hideT);hideT=setTimeout(hidePop,220)}});
document.addEventListener('click',e=>{if(e.target.closest('#popc'))setTimeout(hidePop,0)});addEventListener('scroll',hidePop,{passive:true});
/* search suggestions and recents */
const SUG=document.createElement('div');SUG.id='sug';document.body.appendChild(SUG);
const pushRecent=s=>{recent=[s,...recent.filter(x=>x!==s)].slice(0,6);try{localStorage.setItem('mosaic-recent',JSON.stringify(recent))}catch(e){}};
function sugShow(){const raw=$('#q').value.trim(),t=raw.toLowerCase(),r=$('#q').getBoundingClientRect();let h='';
 if(!t)h=recent.map(s=>`<button class="sg" data-sq="${esc(s)}"><span class="time">Recent</span>${esc(s)}</button>`).join('');
 else h=ITEMS.filter(x=>vis(x)&&!x.lab&&(x.t+' '+x.s).toLowerCase().includes(t)).slice(0,6).map(x=>`<button class="sg" data-id="${x.id}"><span class="time">${names[x.k]}</span>${esc(x.t)}</button>`).join('')+`<button class="sg" data-sq="${esc(raw)}"><span class="time">Search</span>${esc(raw)}</button>`;
 if(!h){SUG.style.display='none';return}SUG.innerHTML=h;Object.assign(SUG.style,{display:'block',left:r.left+'px',top:(r.bottom+6)+'px',width:Math.max(r.width,260)+'px'})}
$('#q').addEventListener('focus',sugShow);$('#q').addEventListener('input',sugShow);$('#q').addEventListener('keydown',e=>{if(e.key==='Enter'){if($('#q').value.trim())pushRecent($('#q').value.trim());SUG.style.display='none'}if(e.key==='Escape')SUG.style.display='none'});
document.addEventListener('click',e=>{const b=e.target.closest('[data-sq]');if(b){const s=b.dataset.sq;$('#q').value=s;q=s.toLowerCase();pushRecent(s);render();SUG.style.display='none'}else if(!e.target.closest('#sug')&&!e.target.closest('#q'))SUG.style.display='none';else if(e.target.closest('[data-id]'))SUG.style.display='none'});
/* up next countdown and autoplay */
function nextOf(){const l=kindList(),i=l.findIndex(x=>x.id===cur.id);return rep==='off'&&i===l.length-1?null:l[(i+1)%l.length]}
setInterval(()=>{const n=$('#nu');if(!cur||!playing||cur.live||!autoOn){n.style.display='none';return}const rem=cur.len-pos;if(rem>8||rem<=0||nuX===cur.id){n.style.display='none';return}const nx=queue.length?by(queue[0]):nextOf();if(!nx||nx.id===cur.id){n.style.display='none';return}$('#nut').textContent=nx.t;$('#nus').textContent='Up next in '+Math.ceil(rem)+'s';n.style.display='flex'},500);
$('#nuy').onclick=()=>{$('#nu').style.display='none';hop(1)};$('#nun').onclick=()=>{nuX=cur&&cur.id;$('#nu').style.display='none'};
document.addEventListener('click',e=>{const b=e.target.closest('[data-sw]');if(b&&b.dataset.sw==='auto'){autoOn=!autoOn;try{localStorage.setItem('mosaic-auto',autoOn?'1':'0')}catch(x){}paintAp()}});
/* page transitions between tabs */
$('#nav').onclick=e=>{const b=e.target.closest('button');if(!b)return;tab=b.dataset.t;document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x===b));render()};
/* profiles */
function avUp(){const b=$('#avb');b.textContent=(PROF.name[0]||'?').toUpperCase();b.style.setProperty('--h',PROF.hue)}
function proPaint(){$('#pg').innerHTML=PROFILES.map(p=>`<div class="pf ${p.id===PID?'cur':''}"><button class="pav" data-pf="${p.id}" style="--h:${p.hue}" aria-label="${esc(p.name)}">${esc((p.name[0]||'?').toUpperCase())}${p.kids?'<i>KIDS</i>':''}</button><b>${esc(p.name)}</b>${manage&&PROFILES.length>1?`<button class="more" data-pdel="${p.id}">Delete</button>`:''}</div>`).join('')+(PROFILES.length<5?(adding?`<div class="pf"><input id="pnm" class="pin" placeholder="Name" maxlength="14" aria-label="Profile name"><label class="time"><input type="checkbox" id="pkd"> Kids</label><button class="b" data-pf="new">Create</button></div>`:`<div class="pf"><button class="pav add" data-pf="add" aria-label="Add profile">+</button><b>Add profile</b></div>`):'');$('#pe').textContent=manage?'Done managing':'Manage profiles'}
const saveProf=()=>_si.call(localStorage,'mosaic-profiles',JSON.stringify(PROFILES));
function switchTo(id){_si.call(localStorage,'mosaic-profile',id);try{sessionStorage.setItem('mosaic-sw','1')}catch(e){}location.reload()}
document.addEventListener('click',e=>{let b;if(b=e.target.closest('[data-pf]')){const v=b.dataset.pf;
 if(v==='add'){adding=true;proPaint();const i=$('#pnm');if(i)i.focus()}
 else if(v==='new'){const n=($('#pnm').value||'').trim();if(!n)return;PROFILES.push({id:'p'+Date.now(),name:n,hue:window.__phue!=null?window.__phue:Math.floor(Math.random()*360),kids:!!$('#pkd').checked});saveProf();adding=false;proPaint();toast('Profile created')}
 else if(v!==PID)switchTo(v);else $('#pro').close();return}
 if(b=e.target.closest('[data-pdel]')){const id=b.dataset.pdel;PROFILES=PROFILES.filter(p=>p.id!==id);saveProf();if(id===PID)switchTo(PROFILES[0].id);else proPaint();return}
 if((b=e.target.closest('[data-sa]'))&&b.dataset.sa==='prof'){$('#sm').close();proPaint();$('#pro').showModal()}});
document.addEventListener('click',e=>{const b=e.target.closest('[data-demo-action]');if(!b)return;const demos=demoItems();if(b.dataset.demoAction==='remove'){demos.forEach(x=>hid.add(x.id));if(cur&&demos.some(x=>x.id===cur.id))stop();saveHid();render();paintAp();toast('Demo data removed from your view. Add it again any time.')}else if(b.dataset.demoAction==='add'){demos.forEach(x=>hid.delete(x.id));saveHid();render();paintAp();toast('Demo data added to your view. Your files and lists were kept.')}});
$('#avb').onclick=()=>{proPaint();$('#pro').showModal()};$('#pe').onclick=()=>{manage=!manage;adding=false;proPaint()};$('#px2').onclick=()=>$('#pro').close();avUp();
let swFlag=null;try{swFlag=sessionStorage.getItem('mosaic-sw')}catch(e){}
 if(swFlag){try{sessionStorage.removeItem('mosaic-sw')}catch(e){}}
$('#enter').addEventListener('click',()=>{if(PROFILES.length>1&&!swFlag)setTimeout(()=>{proPaint();$('#pro').showModal()},900)});
/* ===== pro layer: help and tour, captions and lyrics, bookmarks, PIN, back button, shortcuts, sync, diagnostics ===== */
const API=(document.querySelector('meta[name=mosaic-api]')||{}).content||'',VER='2.5.31';
let errs=[];try{errs=JSON.parse(localStorage.getItem('mosaic-errs')||'[]')}catch(e){}
const logErr=m=>{errs=[{t:Date.now(),m:String(m).slice(0,200)},...errs].slice(0,15);try{localStorage.setItem('mosaic-errs',JSON.stringify(errs))}catch(e){}};
addEventListener('error',e=>logErr(e.message));addEventListener('unhandledrejection',e=>logErr(e.reason&&e.reason.message||e.reason));
/* captions and lyrics */
let subs=null;const SZ=[1,1.35,1.7];let subSz=0,subOffset=0;
const ptime=s=>{const m=String(s).trim().replace(',','.').match(/(?:(\d+):)?(\d+):(\d+(?:\.\d+)?)/);return m?(+(m[1]||0))*3600+ +m[2]*60+ +m[3]:0};
function parseSubs(txt,ext){txt=String(txt).replace(/\r/g,'').replace(/^\uFEFF/,'');const out=[];
 if(ext==='lrc'){txt.split('\n').forEach(l=>{const t=l.replace(/\[[^\]]*\]/g,'').trim();[...l.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)].forEach(x=>out.push({s:+x[1]*60+ +x[2],t}))});out.sort((a,b)=>a.s-b.s);out.forEach((c,i)=>c.e=out[i+1]?out[i+1].s:c.s+6);return out.filter(c=>c.t)}
 txt.split(/\n\s*\n/).forEach(b=>{const L=b.split('\n').filter(x=>x.trim()),i=L.findIndex(x=>x.includes('-->'));if(i<0)return;const p=L[i].split('-->');out.push({s:ptime(p[0]),e:ptime(p[1].trim().split(/\s+/)[0]),t:L.slice(i+1).join('\n').replace(/<[^>]+>/g,'')})});return out}
function ccUp(){const b=$('#cc');b.textContent=!subs?(cur&&cur.k==='a'?'Add lyrics':'Add subtitles'):subs.kind==='lrc'?(subs.on?'Lyrics: on':'Lyrics: off'):(subs.on?'Subtitles: on':'Subtitles: off');$('#ccz').style.display=subs?'':'none';if(!subs||!subs.on)$('#sub').style.display='none'}
async function loadSubs(f){const ext=(f.name.split('.').pop()||'').toLowerCase(),txt=await f.text(),cues=parseSubs(txt,ext);if(!cues.length)return toast('No captions found in that file.');subs={id:cur.id,kind:ext==='lrc'?'lrc':'srt',cues,on:true};try{localStorage.setItem('mosaic-subs:'+cur.id,JSON.stringify({ext,txt:txt.slice(0,400000)}))}catch(e){}ccUp();toast(subs.kind==='lrc'?'Lyrics loaded':'Subtitles loaded')}
function subsFor(){subs=null;subOffset=0;if(cur){try{const j=JSON.parse(localStorage.getItem('mosaic-subs:'+cur.id)||'null');if(j){const c=parseSubs(j.txt,j.ext);if(c.length)subs={id:cur.id,kind:j.ext==='lrc'?'lrc':'srt',cues:c,on:true};subOffset=+(localStorage.getItem('mosaic-sub-offset:'+cur.id)||0)}}catch(e){}}ccUp()}
$('#cc').onclick=()=>{if(!cur)return;if(!subs)$('#cf').click();else{subs.on=!subs.on;ccUp()}};
$('#cf').onchange=async e=>{const f=e.target.files&&e.target.files[0];e.target.value='';if(f&&cur){try{await loadSubs(f)}catch(x){toast('Could not read that file.')}}};
$('#ccz').onclick=()=>{subSz=(subSz+1)%3;$('#sub').style.setProperty('--ss',SZ[subSz])};
setInterval(()=>{if(!subs||!subs.on||!cur||subs.id!==cur.id)return;const s=$('#sub'),c=subs.cues;let i=-1;for(let k=0;k<c.length;k++){if(c[k].s<=pos)i=k;else break}
 if(i<0||(subs.kind==='srt'&&pos>=c[i].e+subOffset)){s.style.display='none';return}if(pos<c[i].s+subOffset){s.style.display='none';return}
 s.className=subs.kind==='lrc'?'lyr':'cap';s.innerHTML=subs.kind==='lrc'?'<span class="pl2">'+esc(c[i-1]?c[i-1].t:'')+'</span><b>'+esc(c[i].t)+'</b><span class="pl2">'+esc(c[i+1]?c[i+1].t:'')+'</span>':esc(c[i].t).replace(/\n/g,'<br>');s.style.display='block'},200);
/* bookmarks */
let bms={};try{bms=JSON.parse(localStorage.getItem('mosaic-bm')||'{}')}catch(e){}
const saveBm=()=>{try{localStorage.setItem('mosaic-bm',JSON.stringify(bms))}catch(e){}};
function bmUpd(){if(!cur)return;const l=bms[cur.id]||[];$('#bml').textContent='Bookmarks ('+l.length+')';$('#mks').innerHTML=cur.live?'':l.map(t=>'<b class="mk" style="left:'+Math.min(100,t/cur.len*100)+'%"></b>').join('')}
$('#bm').onclick=()=>{if(!cur||cur.live)return toast('Bookmarks work on songs, films and clips.');const l=bms[cur.id]=bms[cur.id]||[],t=Math.round(pos);if(!l.includes(t)){l.push(t);l.sort((a,b)=>a-b);saveBm()}bmUpd();toast('Bookmarked '+fmt(t))};
function bmPaint(){const l=(cur&&bms[cur.id])||[];$('#bl').innerHTML=l.length?l.map((t,i)=>'<div class="rw"><div class="f"><b>'+fmt(t)+'</b></div><button class="b" data-bj="'+t+'">Jump</button><button class="b o" data-bd="'+i+'">Remove</button></div>').join(''):'<p class="empty">No bookmarks yet. Tap Bookmark while playing to save a moment.</p>'}
$('#bml').onclick=()=>{bmPaint();$('#bd').showModal()};$('#bx').onclick=()=>$('#bd').close();
document.addEventListener('click',e=>{let b;if(b=e.target.closest('[data-bj]')){seekTo(+b.dataset.bj);$('#bd').close()}else if((b=e.target.closest('[data-bd]'))&&cur){bms[cur.id].splice(+b.dataset.bd,1);saveBm();bmUpd();bmPaint()}});
const oi9=info;info=()=>{oi9();bmUpd();document.body.classList.toggle('hasmini',!!cur)};
const op5=play;play=id=>{op5(id);subsFor();bmUpd();if(!stOv&&$('#stage').style.display==='flex'){try{history.pushState({ov:'s'},'')}catch(e){}stOv=true}};
/* parental PIN */
const pinHash=s=>{let h=5381;for(const c of 'mosaic'+s)h=(h*33^c.charCodeAt(0))>>>0;return String(h)};
const getPin=()=>{try{return _gi.call(localStorage,'mosaic-pin')}catch(e){return null}};
let pinCb=null,pinMode='verify',pinTmp='';
function pinDlg(mode,cb){pinMode=mode;pinCb=cb;pinTmp='';$('#pni').value='';$('#pnt').textContent=mode==='verify'?'Enter PIN':'Choose a 4-digit PIN';$('#pns').textContent=mode==='verify'?'This is locked for Kids profiles.':'Used to leave Kids profiles. It is a family lock, not strong security.';$('#pnd').showModal();$('#pni').focus()}
$('#pnc').onclick=()=>$('#pnd').close();
$('#pnk').onclick=()=>{const v=($('#pni').value||'').trim();if(!/^\d{4}$/.test(v)){toast('Use exactly 4 digits.');return}
 if(pinMode==='verify'){if(pinHash(v)===getPin()){$('#pnd').close();if(pinCb)pinCb()}else{toast('Wrong PIN');$('#pni').value=''}}
 else if(pinMode==='set'){pinTmp=v;pinMode='confirm';$('#pnt').textContent='Confirm PIN';$('#pni').value=''}
 else{if(v===pinTmp){_si.call(localStorage,'mosaic-pin',pinHash(v));$('#pnd').close();toast('PIN saved');paintAp()}else{toast('PINs did not match');pinMode='set';$('#pnt').textContent='Choose a 4-digit PIN';$('#pni').value=''}}};
const sw0=switchTo;switchTo=id=>{const t=PROFILES.find(p=>p.id===id);if(KIDS&&getPin()&&t&&!t.kids)pinDlg('verify',()=>sw0(id));else sw0(id)};
const pe0=$('#pe').onclick;$('#pe').onclick=()=>{if(KIDS&&getPin()&&!manage)pinDlg('verify',()=>pe0());else pe0()};
const st0b=$('#stbtn').onclick;$('#stbtn').onclick=()=>{if(KIDS&&getPin())pinDlg('verify',()=>st0b());else st0b()};
function famCard(){if(KIDS||!PROFILES.some(x=>x.kids))return '';const p=getPin();return '<div class="sc"><h4>Family</h4><div class="row2"><div><b>Kids PIN</b><br><small class="time">'+(p?'On. Needed to leave a Kids profile or open Settings there.':'Not set')+'</small></div><span class="chips"><button class="chip" data-sa="pinset">'+(p?'Change':'Set PIN')+'</button>'+(p?'<button class="chip" data-sa="pinoff">Remove</button>':'')+'</span></div></div>'}
document.addEventListener('click',e=>{const b=e.target.closest('[data-sa]');if(!b)return;const a=b.dataset.sa;if(a==='pinset')getPin()?pinDlg('verify',()=>pinDlg('set')):pinDlg('set');else if(a==='pinoff')pinDlg('verify',()=>{localStorage.removeItem('mosaic-pin');toast('PIN removed');paintAp()})});
/* Android back button and shortcuts: overlays close before the app leaves */
var ovN=0,ig=0,fp=false,stOv=false;
if(window.HTMLDialogElement){const sm0=HTMLDialogElement.prototype.showModal;HTMLDialogElement.prototype.showModal=function(){const was=this.open;sm0.call(this);if(!was){try{history.pushState({ov:1},'')}catch(e){}ovN++}}}
document.addEventListener('close',e=>{if(fp||!e.target||e.target.tagName!=='DIALOG')return;if(ovN>0){ovN--;ig++;try{history.back()}catch(x){ig=0}}},true);
addEventListener('popstate',()=>{if(ig>0){ig--;return}const ds=[...document.querySelectorAll('dialog[open]')];if(ds.length){fp=true;ovN=Math.max(0,ovN-1);ds[ds.length-1].close();fp=false;return}if($('#tour').style.display==='block'){tourEnd();return}if($('#stage').style.display==='flex'){stOv=false;$('#sC').click()}});
const sc0=$('#sC').onclick;$('#sC').onclick=()=>{sc0();if(stOv){stOv=false;ig++;try{history.back()}catch(e){ig=0}}};
const os3=stop;stop=()=>{os3();if(stOv){stOv=false;ig++;try{history.back()}catch(e){ig=0}}};
const hashTab=()=>{const m=/tab=(home|[macxl])/.exec(location.hash||'');return m?m[1]:null};
{const t=hashTab();if(t){tab=t;document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x.dataset.t===t))}}
addEventListener('hashchange',()=>{const t=hashTab(),b=t&&document.querySelector('nav [data-t="'+t+'"]');if(b)b.click()});
/* help corner and tour */
const FAQ=[['How do I add my own films or music?','Use Add your files in the top bar or drag files onto the page. Mosaic sorts them into Films, Music or Clips and you can change the category before adding.'],['Where are my files stored?','On this device only, inside the app. Nothing is uploaded unless you turn on sync, and sync never uploads your media files.'],['Why does the built-in content sound synthetic?','Built-in films, songs and clips are generated samples. Hide them in Settings and use your own files.'],['How do I get subtitles or lyrics?','Open a title, then use Add subtitles (.srt or .vtt) or Add lyrics (.lrc) in the player. They are remembered for that title.'],['What is the Lab?','Seed Records, Mood Map, soundscapes, a focus timer, wind-down and beat pads. Everything is generated on your device.'],['How do profiles and Kids mode work?','Tap your avatar to switch. Kids profiles hide titles rated PG-13 and above. Set a PIN in Settings so only you can leave a Kids profile.'],['How do I use sync?','In Settings, create a sync code and enter it on another device. Sync copies profile settings, playlists, followed creators and Reels comments, never your media files. If both devices changed, Mosaic asks which copy to keep.'],['Can I play in the background?','On Android, audio keeps playing with the screen off and shows lock-screen controls. Sleep and Wind-down timers are in the player.'],['What are the keyboard shortcuts?','Ctrl or Cmd + K or / to search, Space to play or pause, arrows to seek and change volume, M to mute, ? for the full list.'],['Something is broken. What now?','Open Help, choose Copy diagnostics, and send it to support. It lists your app version, device and recent errors, never your files.']];
const TIPS={home:'Hover a card for a preview. Tap the + to add it to My List.',m:'Filter by genre and sort with the controls above the grid.',a:'Try Shuffle, or build a queue with Add to queue in the player.',c:'Drop a phone video in and it lands here automatically.',r:'Open a channel and change its tempo, energy and key live.',x:'Drag the Mood Map dot and the music follows.',l:'Playlists and My List live here. Add titles from the player.'};
function ansPaint(t){t=(t||'').toLowerCase();const fl=FAQ.filter(f=>!t||(f[0]+' '+f[1]).toLowerCase().includes(t));$('#han').innerHTML='<h4>Answers</h4>'+(fl.length?fl.map(f=>'<details><summary>'+esc(f[0])+'</summary><p>'+esc(f[1])+'</p></details>').join(''):'<p class="empty">No answers match. Try Copy diagnostics and contact support.</p>')}
function helpPaint(){$('#hpb').innerHTML='<div class="sc"><h4>This screen</h4><p style="margin:0">'+esc(TIPS[tab]||TIPS.home)+'</p></div><div class="sc"><h4>Quick actions</h4><div class="chips" style="padding:2px 0 6px"><button class="chip" data-hl="tour">Take the tour</button><button class="chip" data-hl="keys">Shortcuts</button><button class="chip" data-hl="diag">Copy diagnostics</button><button class="chip" data-hl="mail">Contact support</button></div></div><input id="hq" class="pin" style="width:100%;margin:6px 0" placeholder="Search help" aria-label="Search help"><div class="sc" id="han"></div><div class="sc"><h4>What is new in '+VER+'</h4><small class="time">Profiles and Kids mode, Top 10, hover previews, Lab, subtitles and lyrics, bookmarks, sync, help and tour.</small></div>';ansPaint('')}
async function diag(){let u='unknown';try{u=fmtB((await navigator.storage.estimate()).usage)}catch(e){}const d=['Mosaic '+VER,navigator.userAgent,'Profile: '+(KIDS?'kids':'standard')+' ('+PROFILES.length+')','Library: '+ITEMS.filter(x=>x.user).length+' files, storage '+u,'Online: '+navigator.onLine,'Recent errors:'].concat(errs.length?errs.map(x=>new Date(x.t).toISOString()+' '+x.m):['none']).join('\n');try{await navigator.clipboard.writeText(d);toast('Diagnostics copied')}catch(e){prompt('Copy diagnostics',d)}}
$('#hlp').onclick=()=>{helpPaint();$('#hp').showModal()};$('#hpx').onclick=()=>$('#hp').close();
document.addEventListener('input',e=>{if(e.target.id==='hq')ansPaint(e.target.value)});
document.addEventListener('click',e=>{const b=e.target.closest('[data-hl]');if(!b)return;const a=b.dataset.hl;if(a==='tour')tourStart();else if(a==='keys')$('#kb').showModal();else if(a==='diag')diag();else if(a==='mail'){const m=(document.querySelector('meta[name=mosaic-support]')||{}).content||'support@example.com';location.href='mailto:'+m+'?subject='+encodeURIComponent('Mosaic '+VER+' feedback')}});
const TOUR=[['#q','Search everything','Type to search films, songs and clips. Press Ctrl or Cmd + K anywhere.'],['nav','Your library','Home, Reels, Music and Library are one tap away. Films and Lab sit in the pills at the top on a phone.'],['#avb','Profiles','Switch profiles or add a Kids profile.'],['#stbtn','Settings','Colours, sound, storage and sync.'],['.card','Previews','Hover a card for a preview, or tap to play. Add titles to My List.'],['#hlp','Help any time','Tap ? for tips, answers and diagnostics.']];
let ti=0;
function tourShow(){const s=TOUR[ti],el=document.querySelector(s[0]),r=el&&el.getBoundingClientRect?el.getBoundingClientRect():null;if(!r||(!r.width&&!r.height)){if(ti<TOUR.length-1){ti++;return tourShow()}return tourEnd()}
 Object.assign($('#tspot').style,{left:(r.left-6)+'px',top:(r.top-6)+'px',width:(r.width+12)+'px',height:(r.height+12)+'px'});$('#tt').textContent=s[1];$('#td2').textContent=s[2];$('#tbk').style.display=ti?'':'none';$('#tnx').textContent=ti===TOUR.length-1?'Done':'Next';
 const c=$('#tcard'),below=r.bottom+14+160<innerHeight;Object.assign(c.style,{left:Math.max(12,Math.min(innerWidth-292,r.left))+'px',top:(below?r.bottom+14:Math.max(12,r.top-14-170))+'px'});c.classList.remove('in');void c.offsetWidth;c.classList.add('in')}
function tourStart(){$('#hp').close();ti=0;$('#tour').style.display='block';tourShow()}
function tourEnd(){$('#tour').style.display='none';try{localStorage.setItem('mosaic-toured','1')}catch(e){}}
$('#tnx').onclick=()=>{if(ti>=TOUR.length-1)tourEnd();else{ti++;tourShow()}};$('#tbk').onclick=()=>{if(ti>0){ti--;tourShow()}};$('#tsk').onclick=tourEnd;
$('#enter').addEventListener('click',()=>{let seen=null;try{seen=localStorage.getItem('mosaic-toured')}catch(e){}if(!seen&&!swFlag)setTimeout(()=>{if(!$('#pro').open)tourStart()},PROFILES.length>1?1800:450)});
/* sync across devices (needs the Netlify backend) */
const SY={code:null,t:0,h:null};try{SY.code=_gi.call(localStorage,'mosaic-sync')||null;SY.t=+_gi.call(localStorage,'mosaic-synct')||0;SY.h=_gi.call(localStorage,'mosaic-synch')}catch(e){}
let syOK=null;const SYNCK=['saved','prog','hid','theme','pls','seeds','plays','likes','recent','pad','eq','bm','mood','auto','last','vol','rm','reel-comments','followed','language'];SY.conflict=false;
const fmtCode=c=>c.replace(/(.{4})(?=.)/g,'$1-');
function syGather(){const d={};for(const profile of PROFILES){const pre=profile.id==='p1'?'':profile.id+':';SYNCK.forEach(k=>{const v=_gi.call(localStorage,pre+'mosaic-'+k);if(v!==null)d[profile.id+'/'+k]=v})}return{profiles:_gi.call(localStorage,'mosaic-profiles'),pid:PID,data:d}}
async function syPing(){try{const r=await fetch(API+'/api/sync?ping=1');syOK=r.ok&&(await r.json()).ok===true}catch(e){syOK=false}return syOK}
async function syPush(){if(!SY.code)return;const g=syGather(),r=await fetch(API+'/api/sync',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({code:SY.code,expected:SY.t||0,...g})});if(!r.ok){const issue=await r.json().catch(()=>({}));if(r.status===409){SY.conflict=true;if($('#sm')?.open)setTimeout(()=>paintAp(),0)}throw new Error(issue.error||('Sync failed (HTTP '+r.status+')'))}const j=await r.json();SY.conflict=false;SY.t=j.t;SY.h=JSON.stringify(g);_si.call(localStorage,'mosaic-synct',String(j.t));_si.call(localStorage,'mosaic-synch',SY.h)}
async function syPull(){const r=await fetch(API+'/api/sync?code='+SY.code);if(r.status===404)return null;if(!r.ok)throw new Error('sync '+r.status);return r.json()}
function syApply(doc){let okp=null;try{const list=typeof doc.profiles==='string'?JSON.parse(doc.profiles):null,ids=new Set();if(Array.isArray(list)&&list.length>0&&list.length<=5&&list.every(x=>x&&typeof x.id==='string'&&/^p\d{1,16}$/.test(x.id)&&!ids.has(x.id)&&ids.add(x.id)&&typeof x.name==='string'&&x.name.trim()&&x.name.trim().length<=14&&Number.isFinite(x.hue)&&x.hue>=0&&x.hue<360&&typeof x.kids==='boolean'))okp=list.map(x=>({id:x.id,name:x.name.trim(),hue:Math.floor(x.hue),kids:x.kids}))}catch(e){}if(okp)_si.call(localStorage,'mosaic-profiles',JSON.stringify(okp));const profiles=okp||PROFILES,p=profiles.some(x=>x.id===doc.pid)?doc.pid:(profiles[0]?.id||'p1');_si.call(localStorage,'mosaic-profile',p);for(const[k,value]of Object.entries(doc.data||{})){if(typeof value!=='string')continue;const match=k.match(/^(p\d{1,16})\/([a-z-]+)$/),target=match?match[1]:p,key=match?match[2]:k;if(!profiles.some(x=>x.id===target)||!SYNCK.includes(key))continue;const pre=target==='p1'?'':target+':';_si.call(localStorage,pre+'mosaic-'+key,value)}_si.call(localStorage,'mosaic-synct',String(doc.t||Date.now()));_si.call(localStorage,'mosaic-synch',JSON.stringify({profiles:okp?JSON.stringify(okp):doc.profiles,pid:p,data:doc.data||{}}));location.reload()}
async function syStart(){if(!SY.code||!(await syPing()))return;let doc;try{doc=await syPull()}catch(e){return}if(doc&&doc.t>SY.t){const changed=SY.h&&SY.h!==JSON.stringify(syGather());if(!changed||confirm('Newer data from your other device was found. Replace what is on this device? Choose Cancel to keep this device and update the shared copy.'))syApply(doc);else{SY.t=doc.t;await syPush().catch(()=>{})}}else if(!doc&&SY.t){SY.conflict='missing';if($('#sm')?.open)paintAp()}else await syPush().catch(()=>{})}
function syncCard(){return '<div class="sc"><h4>Sync across devices <span class="lv">'+(SY.code?'On':'Off')+'</span></h4>'+(syOK===false?'<small class="time">Sync needs the Mosaic backend, which is not reachable here.</small>':SY.code?'<div class="row2"><div><b class="code">'+fmtCode(SY.code)+'</b><br><small class="time">Enter this code on your other device. Last synced '+(SY.t?new Date(SY.t).toLocaleString():'never')+'.</small></div></div><div class="chips" style="padding:2px 0 6px"><button class="chip" data-sa="syncnow">Sync now</button><button class="chip" data-sa="syncoff">Stop syncing</button></div>'+(SY.conflict?'<small class="time" role="status">'+(SY.conflict==='missing'?'The server copy is missing. Sync now to review restoring it from this device.':'Another device has newer changes. Choose Sync now to review before either copy is replaced.')+'</small>':''):'<div class="chips" style="padding:2px 0 6px"><button class="chip" data-sa="synccreate">Create sync code</button></div><div class="row2"><input id="syin" class="pin" placeholder="Code from another device" maxlength="19" aria-label="Sync code"><button class="chip" data-sa="syncjoin">Use code</button></div>')+'<small class="time">Syncs every profile: lists, Reels comments, followed creators, language and settings. Media files stay on each device.</small></div>'}
document.addEventListener('click',async e=>{const b=e.target.closest('[data-sa]');if(!b)return;const a=b.dataset.sa,off=()=>{SY.code=null;localStorage.removeItem('mosaic-sync')};
 if(a==='synccreate'){const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',r=crypto.getRandomValues(new Uint8Array(16));SY.code=[...r].map(x=>A[x%32]).join('');SY.t=0;SY.h=null;SY.conflict=false;_si.call(localStorage,'mosaic-sync',SY.code);try{await syPush();toast('Sync is on')}catch(x){toast(x.message||'Could not reach the backend');off()}paintAp()}
 else if(a==='syncjoin'){const c=($('#syin').value||'').toUpperCase().replace(/[^A-Z2-9]/g,'');if(c.length!==16)return toast('A code has 16 letters and numbers.');SY.code=c;_si.call(localStorage,'mosaic-sync',c);try{const d=await syPull();if(!d){toast('No data found for that code');off();paintAp();return}syApply(d)}catch(x){toast('Could not reach the backend');off();paintAp()}}
 else if(a==='syncnow'){try{const d=await syPull();if(d&&d.t>SY.t){const changed=SY.h&&SY.h!==JSON.stringify(syGather());if(!changed||confirm('Newer data found. Replace this device? Choose Cancel to keep this device and update the shared copy.'))return syApply(d);SY.t=d.t;await syPush();toast('Kept this device and updated the shared copy');paintAp();return}if(!d&&SY.t){if(!confirm('The server copy is missing. Upload this device as a new shared copy?')){paintAp();return}SY.t=0;SY.conflict=false}await syPush();toast('Synced');paintAp()}catch(x){toast(x.message||'Sync failed')}}
 else if(a==='syncoff'){const c=SY.code,del=c&&confirm('Also delete your synced copy from the server? Choose Cancel to keep it so another device can still use the code.');off();if(del){try{const r=await fetch(API+'/api/sync?code='+c,{method:'DELETE'});toast(r.ok?'Stopped and deleted the server copy':'Stopped. Could not delete the server copy')}catch(x){toast('Stopped. Could not reach the server to delete it')}}else toast('Sync stopped on this device');paintAp()}});
const os5=openSM;openSM=async()=>{await os5();if(syOK===null)syPing().then(()=>{if($('#sm').open)paintAp()})};
setInterval(()=>{if(SY.code&&syOK)syPush().catch(()=>{})},60000);addEventListener('visibilitychange',()=>{if(document.hidden&&SY.code&&syOK)syPush().catch(()=>{})});
if(swFlag===null)setTimeout(syStart,2500);
$('#enter').onclick=()=>{initAudio();const s=$('#splash'),app=document.querySelector('.app'),help=$('#hlp');if(app)app.inert=false;if(help)help.inert=false;s.classList.add('out');render();setTimeout(()=>{s.style.display='none';s.setAttribute('aria-hidden','true');if(!document.querySelector('dialog[open]'))$('#q')?.focus({preventScroll:true})},420)};
