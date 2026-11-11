/* Mosaic 2.5.31 — ordered app script 04 of 22. */
/* ---------- additions 4: help button in top bar, profile setup, profile colours, splash polish (self-contained) ---------- */
(function(){try{
 const h=$('#hlp'),top=document.querySelector('.top');if(h&&top)top.appendChild(h);
 const wm=document.querySelector('#splash .wm');if(wm&&!document.querySelector('#splash .stg')){const t=document.createElement('div');t.className='stg';t.textContent='Films, music and clips';wm.after(t)}
 const HUES=[230,275,325,8,38,145,185,205],HN=['Indigo','Violet','Pink','Red','Amber','Green','Teal','Blue'];
 const sw=sel=>HUES.map((hu,i)=>'<button type="button" class="sw'+(hu===sel?' on':'')+'" data-hue="'+hu+'" aria-label="'+HN[i]+'" style="--h:'+hu+'"></button>').join('');
 window.__phue=null;
 const pp0=proPaint;proPaint=function(){pp0();try{if(!adding){window.__phue=null;return}const f=$('#pnm');if(!f)return;const r=document.createElement('div');r.className='sws';r.innerHTML=sw(window.__phue);f.after(r);const kl=$('#pkd');if(kl&&kl.parentNode)kl.parentNode.innerHTML='<input type="checkbox" id="pkd"> This profile is for a kid'}catch(e){}};
 document.addEventListener('click',e=>{const b=e.target.closest('#pro .sws .sw');if(!b)return;window.__phue=+b.dataset.hue;b.parentNode.querySelectorAll('.sw').forEach(x=>x.classList.toggle('on',x===b))});
 /* first-run profile setup, like Netflix: your profile, then an optional Kids profile */
 const first=(()=>{try{return _gi.call(localStorage,'mosaic-profiles')===null&&_gi.call(localStorage,'mosaic-onboarded')===null}catch(e){return false}})();
 const kp=document.createElement('dialog');kp.id='kpd';document.body.appendChild(kp);
 const offerPin=after=>{if(getPin()||KIDS){after();return}kp.innerHTML='<div class="ob" style="min-height:0;padding:8px"><h3 style="margin:0">Protect the Kids profile?</h3><p class="cnt">Set a 4-digit PIN so only you can leave it or open Settings there. You can change this later in Settings.</p><div class="acts"><button class="b o" id="kpn">Not now</button><button class="b" id="kpy">Set PIN</button></div></div>';kp.showModal();$('#kpn').onclick=()=>{kp.close();after()};$('#kpy').onclick=()=>{kp.close();$('#pnd').addEventListener('close',()=>after(),{once:true});pinDlg('set')}};
 let n0=0;document.addEventListener('click',e=>{if(e.target.closest('[data-pf=new]'))n0=PROFILES.length},true);
 document.addEventListener('click',e=>{if(e.target.closest('[data-pf=new]')&&PROFILES.length>n0&&PROFILES[PROFILES.length-1].kids)setTimeout(()=>offerPin(()=>{}),150)});
 const ts=tourStart;tourStart=function(){if(window.__onbOpen){window.__tourPending=true;return}ts()};
 if(!first||swFlag)return;
 const d=document.createElement('dialog');d.id='onb';document.body.appendChild(d);
 d.addEventListener('cancel',e=>e.preventDefault());
 let hue=230,name='',kid=false;
 const done=()=>{try{_si.call(localStorage,'mosaic-onboarded','1')}catch(e){}window.__onbOpen=false;d.close();if(window.__tourPending){window.__tourPending=false;let seen=null;try{seen=localStorage.getItem('mosaic-toured')}catch(e){}if(!seen)setTimeout(tourStart,300)}};
 const s2=()=>{d.innerHTML='<div class="ob"><div class="obh">Step 2 of 2</div><h2>Who else is watching?</h2><p class="cnt">Add a Kids profile for a child. It only shows age-appropriate titles. This is optional.</p><input id="okn" class="pin" maxlength="14" placeholder="Child\u2019s name" aria-label="Child name"><div class="acts"><button class="b o" id="oks">Not now</button><button class="b" id="oka">Add Kids profile</button></div></div>';
  $('#oks').onclick=done;$('#oka').onclick=()=>{const n=$('#okn').value.trim();if(!n){$('#okn').focus();return}PROFILES.push({id:'p'+Date.now(),name:n,hue:HUES[(HUES.indexOf(hue)+3)%HUES.length],kids:true});saveProf();toast('Kids profile added');offerPin(done)};
  $('#okn').addEventListener('keydown',e=>{if(e.key==='Enter')$('#oka').click()});setTimeout(()=>$('#okn').focus(),50)};
 const s1=()=>{d.innerHTML='<div class="ob"><div class="obh">Welcome to Mosaic</div><h2>Create your profile</h2><p class="cnt">Your lists, history and settings are saved to your profile.</p><div class="obav" id="obav" style="--h:'+hue+'">'+esc((name[0]||'?').toUpperCase())+'</div><input id="obn" class="pin" maxlength="14" placeholder="Your name" aria-label="Your name" value="'+esc(name)+'" autocomplete="off"><div class="sws" id="obs">'+sw(hue)+'</div><div class="kq"><p class="cnt" style="margin:0 0 8px">Is this profile for a kid?</p><div class="chips" style="justify-content:center"><button type="button" class="chip on" data-k="0">No</button><button type="button" class="chip" data-k="1">Yes</button></div><small class="time" id="kqh" style="display:none">Kids profiles only show age-appropriate titles.</small></div><div class="acts"><button class="b o" id="obk">Skip for now</button><button class="b" id="obc">Continue</button></div></div>';
  const inp=$('#obn'),av=$('#obav');
  inp.addEventListener('input',()=>{name=inp.value;av.textContent=(name.trim()[0]||'?').toUpperCase()});
  inp.addEventListener('keydown',e=>{if(e.key==='Enter')$('#obc').click()});
  $('#obs').addEventListener('click',e=>{const b=e.target.closest('.sw');if(!b)return;hue=+b.dataset.hue;av.style.setProperty('--h',hue);$('#obs').querySelectorAll('.sw').forEach(x=>x.classList.toggle('on',x===b))});
  $('#obk').onclick=done;
  $('.kq').addEventListener('click',e=>{const b=e.target.closest('[data-k]');if(!b)return;kid=b.dataset.k==='1';$('.kq').querySelectorAll('.chip').forEach(x=>x.classList.toggle('on',x===b));$('#kqh').style.display=kid?'':'none'});
  $('#obc').onclick=()=>{const n=inp.value.trim();if(!n){inp.focus();toast('Type a name to continue');return}PROFILES[0].name=n;PROFILES[0].hue=hue;PROFILES[0].kids=kid;saveProf();if(kid){try{_si.call(localStorage,'mosaic-onboarded','1')}catch(e){}window.__onbOpen=false;switchTo(PID);return}try{avUp()}catch(e){}try{render()}catch(e){}s2()};
  setTimeout(()=>inp.focus(),50)};
 $('#enter').addEventListener('click',()=>{window.__onbOpen=true;setTimeout(()=>{s1();d.showModal()},250)});
}catch(e){}})();
/* ---------- additions 6: logic hardening (Kids guard, touch wording) ---------- */
(function(){try{
 const p0=play;play=function(id){try{const x=by(id);if(KIDS&&x&&(RK[x.r]||0)>1){toast('This title is not available in a Kids profile');return}}catch(e){}return p0.apply(this,arguments)};
 const pp1=proPaint;proPaint=function(){pp1();try{if(KIDS&&getPin()){const a=document.querySelector('#pro [data-pf=add]');if(a&&a.closest('.pf'))a.closest('.pf').remove()}}catch(e){}};
 if(matchMedia('(hover:none)').matches){TIPS.home='Tap a card to play it. Tap the + to add it to My List.';TOUR[4][2]='Tap a card to play it. Add titles to My List.'}
}catch(e){}})();
