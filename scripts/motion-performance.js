/* Mosaic 2.5.31 — ordered app script 09 of 22. */
;/* extreme grand: scroll reveals + pointer light */
try{(()=>{const rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
try{const r0=render;render=function(){r0.apply(this,arguments);try{if(rm||!('IntersectionObserver' in window))return;const els=[...document.querySelectorAll('#main > h2,#main > .rail,#main > .grid,#main > .sc')].slice(1).filter(e=>!e.classList.contains('rvx'));
const io=new IntersectionObserver(es=>es.forEach(n=>{if(n.isIntersecting){n.target.classList.add('in');io.unobserve(n.target)}}),{threshold:.06});
els.forEach((e,i)=>{e.classList.add('rvx');e.style.transitionDelay=Math.min(i%4,3)*70+'ms';io.observe(e)});setTimeout(()=>els.forEach(e=>e.classList.add('in')),2800)}catch(e){}}}catch(e){}
if(matchMedia('(hover:hover)').matches)document.addEventListener('pointermove',e=>{const t=e.target.closest&&e.target.closest('.card .art,.hero');if(!t)return;const r=t.getBoundingClientRect();t.style.setProperty('--mx',((e.clientX-r.left)/r.width*100).toFixed(1)+'%');t.style.setProperty('--my',((e.clientY-r.top)/r.height*100).toFixed(1)+'%')},{passive:true})})()}catch(e){}

;/* reels double-tap, Synth Keys, lite mode */
try{(()=>{const root=document.documentElement;
try{const w=(navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||8)<=2||(navigator.connection&&navigator.connection.saveData);if(w)root.classList.add('lite');document.addEventListener('visibilitychange',()=>root.classList.toggle('bg',document.hidden))}catch(e){}
try{let lt=0,lx=0,ly=0;document.addEventListener('pointerup',e=>{const r=e.target.closest&&e.target.closest('.reel');if(!r||e.target.closest('button,a,input'))return;const t=performance.now();
if(t-lt<320&&Math.hypot(e.clientX-lx,e.clientY-ly)<40){const b=r.querySelector('[data-ra="like"]');if(b&&b.getAttribute('aria-pressed')!=='true')b.click();const h=document.createElement('div'),rc=r.getBoundingClientRect();h.className='hb';h.style.left=e.clientX-rc.left+'px';h.style.top=e.clientY-rc.top+'px';h.innerHTML='<svg viewBox="0 0 24 24" width="96" height="96"><path fill="#ff4d6d" d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21z"/></svg>';r.appendChild(h);setTimeout(()=>h.remove(),900);lt=0}else{lt=t;lx=e.clientX;ly=e.clientY}})}catch(e){}
try{const BK=[[1,1],[3,2],[6,4],[8,5],[10,6]],WK=[0,2,4,5,7,9,11,12],MAP={a:0,w:1,s:2,e:3,d:4,f:5,t:6,g:7,y:8,h:9,u:10,j:11,k:12},NM={sine:'Sine',triangle:'Soft',sawtooth:'Bright',square:'Retro'};let oct=4,wave='triangle';const live={};
const key=n=>document.querySelector('#ks [data-n="'+n+'"]');
const on=(n,id)=>{if(live[id])return;initAudio();if(AC.state==='suspended')AC.resume();const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime;o.type=wave;o.frequency.value=261.63*Math.pow(2,(n+(oct-4)*12)/12);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.38,t+.02);g.gain.linearRampToValueAtTime(.26,t+.3);o.connect(g);g.connect(master);o.start(t);live[id]={o,g,n};const k=key(n);if(k)k.classList.add('dn')};
const off=id=>{const v=live[id];if(!v)return;const t=AC.currentTime;v.g.gain.cancelScheduledValues(t);v.g.gain.setValueAtTime(Math.max(v.g.gain.value,.001),t);v.g.gain.exponentialRampToValueAtTime(.001,t+.45);v.o.stop(t+.5);delete live[id];const k=key(v.n);if(k&&!Object.values(live).some(x=>x.n===v.n))k.classList.remove('dn')};
const html=()=>`<div class="sc" id="ks"><h4>Synth Keys <span class="time">tap, or play with A to K on your keyboard</span></h4><div class="bsb">${Object.keys(NM).map(w=>`<button class="chip${w===wave?' on':''}" data-kw="${w}">${NM[w]}</button>`).join('')}<span class="bst"><button class="b o" data-ko="-1" aria-label="Octave down">Oct &minus;</button><b id="kov">${oct}</b><button class="b o" data-ko="1" aria-label="Octave up">Oct +</button></span></div><div class="kb2">${WK.map(n=>`<button class="wk" data-n="${n}" aria-label="Note ${n}"></button>`).join('')}${BK.map(([n,p])=>`<button class="bk" data-n="${n}" style="left:calc(${p*12.5}% - 3.5%)" aria-label="Sharp note ${n}"></button>`).join('')}</div></div>`;
const r1=render;render=function(){r1.apply(this,arguments);try{if(tab==='x'&&!$('#ks')){const a=$('#bs')||$('#main .cnt');if(a)a.insertAdjacentHTML('afterend',html())}}catch(e){}};
document.addEventListener('pointerdown',e=>{const k=e.target.closest&&e.target.closest('#ks [data-n]');if(k)try{on(+k.dataset.n,'p'+e.pointerId)}catch(x){}});
['pointerup','pointercancel','pointerout'].forEach(ev=>document.addEventListener(ev,e=>{if(e.target.closest&&e.target.closest('#ks [data-n]'))off('p'+e.pointerId)}));
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#ks [data-kw],#ks [data-ko]');if(!b)return;if(b.dataset.kw)wave=b.dataset.kw;else oct=Math.max(2,Math.min(6,oct+ +b.dataset.ko));const o=$('#ks');if(o)o.outerHTML=html()});
const typing=e=>{const t=e.target;return e.ctrlKey||e.metaKey||e.altKey||(t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable))||tab!=='x'||$('#stage').style.display==='flex'};
addEventListener('keydown',e=>{if(e.repeat||typing(e))return;const n=MAP[e.key.toLowerCase()];if(n!=null)try{on(n,'k'+e.key.toLowerCase())}catch(x){}});
addEventListener('keyup',e=>{off('k'+e.key.toLowerCase())})}catch(e){}
})()}catch(e){}

