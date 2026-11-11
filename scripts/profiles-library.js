/* Mosaic 2.5.31 — ordered app script 10 of 22. */
;/* profiles: rename, colour, who's-watching gate */
try{(()=>{
try{const st=switchTo;switchTo=function(id){try{sessionStorage.setItem('mosaic-gate','1')}catch(e){}st(id)}}catch(e){}
try{const pp=proPaint;proPaint=function(){pp.apply(this,arguments);try{if(!$('#pe').textContent.startsWith('Done'))return;document.querySelectorAll('#pg .pf').forEach(f=>{const a=f.querySelector('.pav[data-pf]'),n=f.querySelector('b');if(!a||!n||a.dataset.pf==='add'||a.dataset.pf==='new')return;const id=a.dataset.pf;n.insertAdjacentHTML('afterend','<button class="more" data-prn="'+id+'">Rename</button><button class="more" data-pcl="'+id+'">Colour</button>')})}catch(e){}}}catch(e){}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-prn],[data-pcl]');if(!b)return;e.stopPropagation();const id=b.dataset.prn||b.dataset.pcl,p=PROFILES.find(x=>x.id===id);if(!p)return;
if(b.dataset.pcl){p.hue=(p.hue+47)%360;saveProf();if(id===PID){const a=$('#avb');if(a)a.style.setProperty('--h',p.hue)}proPaint();return}
const nb=b.closest('.pf').querySelector('b'),i=document.createElement('input');i.className='pin';i.value=p.name;i.maxLength=14;i.setAttribute('aria-label','Profile name');nb.replaceWith(i);i.focus();i.select();let done=false;
const fin=ok=>{if(done)return;done=true;const n=i.value.trim();if(ok&&n&&n!==p.name){p.name=n;saveProf();toast('Renamed')}proPaint()};
i.onkeydown=ev=>{if(ev.key==='Enter')fin(true);else if(ev.key==='Escape'){ev.preventDefault();ev.stopPropagation();fin(false)}};i.onblur=()=>fin(true)},true);
/* with several profiles, ask who is watching once per visit, after the splash */
try{if(PROFILES.length>1&&!sessionStorage.getItem('mosaic-gate')){sessionStorage.setItem('mosaic-gate','1');let n=0;const t=setInterval(()=>{const sp=$('#splash'),cs=sp&&getComputedStyle(sp),gone=!sp||cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0;if(gone||++n>200){clearInterval(t);if(gone&&!document.querySelector('dialog[open]')){proPaint();$('#pro').showModal()}}},300)}}catch(e){}
})()}catch(e){}

;/* user-controlled library: remove from any of your own cards */
try{(()=>{const r0=render;render=function(){r0.apply(this,arguments);try{if(!ITEMS.some(x=>x.k!=='r'&&!x.lab)){const sb=$('#sur');if(sb)sb.remove()}
if(!q&&!ITEMS.some(x=>x.k!=='r'&&!x.lab)){const W={home:'Your library is empty. Add a film, song or clip and it will show up here. It stays on this device.',m:'No films yet. Add a video file and it will appear here.',a:'No songs yet. Add an audio file and it will appear here.',c:'No clips yet. Add a short video and it will appear here.'};document.querySelectorAll('#main .empty').forEach(e=>{if(/Nothing by that name/.test(e.textContent)&&W[tab])e.textContent=W[tab]})}}catch(e){}
try{document.querySelectorAll('.card[data-id]').forEach(c=>{const x=by(c.dataset.id);if(!x||!x.user||c.querySelector('.cx'))return;const a=c.querySelector('.art');if(a)a.insertAdjacentHTML('beforeend','<button class="cx" data-cx="'+x.id+'" aria-label="Remove '+esc(x.t)+' from library">&times;</button>')})}catch(e){}};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-cx]');if(!b)return;e.stopImmediatePropagation();e.preventDefault();
if(b.dataset.arm!=='1'){b.dataset.arm='1';b.classList.add('arm');b.textContent='Remove?';setTimeout(()=>{b.dataset.arm='';b.classList.remove('arm');b.innerHTML='&times;'},3000);return}
const t=document.createElement('button');t.dataset.del=b.dataset.cx;t.hidden=true;document.body.appendChild(t);t.click();t.remove();try{render()}catch(x){}},true)})()}catch(e){}
