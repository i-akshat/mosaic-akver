/* Mosaic 2.5.31 — ordered app script 03 of 22. */
/* ---------- additions: listening recap, seek bar accessibility, privacy note (self-contained, safe to remove) ---------- */
(function(){try{
 let tm={};try{tm=JSON.parse(localStorage.getItem('mosaic-time')||'{}')}catch(e){}
 let dirty=false;
 setInterval(()=>{if(cur&&playing&&!cur.live){tm[cur.k]=(tm[cur.k]||0)+1;dirty=true}},1000);
 setInterval(()=>{if(dirty){dirty=false;try{localStorage.setItem('mosaic-time',JSON.stringify(tm))}catch(e){}}},10000);
 addEventListener('pagehide',()=>{if(dirty)try{localStorage.setItem('mosaic-time',JSON.stringify(tm))}catch(e){}});
 const hm=s=>{const h=Math.floor(s/3600),m=Math.round(s%3600/60);return h?h+'h '+m+'m':m+' min'};
 const recap=()=>{
  const total=Object.values(tm).reduce((a,b)=>a+b,0);
  const top=Object.keys(plays||{}).map(id=>[by(id),plays[id]]).filter(x=>x[0]&&!x[0].lab).sort((a,b)=>b[1]-a[1]).slice(0,3);
  if(!total&&!top.length)return'<div class="sc"><h4>Your recap</h4><p style="margin:0;color:var(--mute)">Play something and your listening and watching stats will show up here.</p></div>';
  const art={};top.length&&Object.keys(plays).forEach(id=>{const y=by(id);if(y&&y.s&&y.k!=='c')art[y.s]=(art[y.s]||0)+plays[id]});
  const ta=Object.entries(art).sort((a,b)=>b[1]-a[1])[0];
  const kinds=Object.keys(tm).filter(k=>tm[k]>=60).map(k=>esc(names[k]||k)+' '+hm(tm[k])).join(' · ');
  return'<div class="sc"><h4>Your recap</h4><p style="margin:0 0 6px"><b>'+hm(total)+'</b> played on this device</p>'+(kinds?'<small class="time">'+kinds+'</small>':'')+
   (top.length?'<p style="margin:10px 0 2px;color:var(--mute)">Most played</p>'+top.map(x=>'<div>'+esc(x[0].t)+' <small class="time">'+x[1]+(x[1]===1?' play':' plays')+'</small></div>').join(''):'')+
   (ta?'<p style="margin:10px 0 0;color:var(--mute)">Top artist or channel: <b style="color:inherit">'+esc(ta[0])+'</b></p>':'')+'</div>'};
 const priv='<div class="sc"><h4>Privacy</h4><p style="margin:0;color:var(--mute)">Your library, bookmarks, profiles and settings are saved in this browser on this device. Files you add stay here unless account sync is turned on. Diagnostics are only copied when you ask. When a server is connected and online posters are on, the title of each film or song you add is sent to it, and on to Apple or TMDB, to find a poster. Nothing else is sent.</p></div>';
 const hp0=helpPaint;helpPaint=function(){hp0();try{$('#hpb').insertAdjacentHTML('beforeend',recap()+priv)}catch(e){}};
 /* seek bar and control accessibility */
 const sb=$('#sBar');if(sb){sb.setAttribute('role','slider');sb.setAttribute('aria-label','Seek');sb.tabIndex=0;sb.setAttribute('aria-valuemin','0');
  setInterval(()=>{if(!cur)return;sb.setAttribute('aria-valuemax',Math.round(cur.len||0));sb.setAttribute('aria-valuenow',Math.round(pos||0));sb.setAttribute('aria-valuetext',fmt(pos||0)+' of '+fmt(cur.len||0))},500)}
 const lab=(s,t)=>{const e=$(s);if(e&&!e.getAttribute('aria-label'))e.setAttribute('aria-label',t)};
 lab('#vol','Volume');lab('#mute','Mute');lab('#sPlay','Play or pause');lab('#sC','Close player');lab('#sv','Save to your list');
 const tst=$('#toast');if(tst)tst.setAttribute('aria-live','polite');
}catch(e){}})();
/* ---------- additions 2: lock-screen controls, storage protection, native shell (self-contained, safe to remove) ---------- */
(function(){try{
 const ms=navigator.mediaSession;
 if(ms){
  const h=(a,f)=>{try{ms.setActionHandler(a,f)}catch(e){}};
  h('seekbackward',d=>skip(-(d&&d.seekOffset||10)));h('seekforward',d=>skip(d&&d.seekOffset||10));
  h('seekto',d=>{if(cur&&d&&typeof d.seekTime==='number')skip(d.seekTime-pos)});
  h('stop',()=>{if(cur)stop()});
  setInterval(()=>{try{ms.playbackState=!cur?'none':playing?'playing':'paused';
   if(cur&&isFinite(cur.len)&&cur.len>0&&ms.setPositionState)ms.setPositionState({duration:cur.len,position:Math.min(Math.max(pos||0,0),cur.len),playbackRate:1})}catch(e){}},1000);
 }
 try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist().catch(()=>{})}catch(e){}
 const C=window.Capacitor;
 if(C&&C.isNativePlatform&&C.isNativePlatform()){document.documentElement.classList.add('native');const i=$('#inst');if(i)i.remove()}
}catch(e){}})();
/* ---------- additions 3: skip intro, data saver, comments, watch together, problem report, Android back button (self-contained, safe to remove) ---------- */
(function(){try{
 const J=(u,o)=>fetch(API+u,o).then(r=>{if(!r.ok)throw new Error(r.status);return r.json()});
 const post=(u,b)=>J(u,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b)});
 const mk=(id,html)=>{const d=document.createElement('dialog');d.id=id;d.innerHTML=html;document.body.appendChild(d);return d};
 let up=false;
 /* data saver */
 let ds=false;try{ds=localStorage.getItem('mosaic-ds')==='1'}catch(e){}
 
 const applyDs=()=>{document.documentElement.classList.toggle('ds',ds);try{$('#vid').preload=ds?'metadata':'auto'}catch(e){}};applyDs();
 const hp1=helpPaint;helpPaint=function(){hp1();try{$('#hpb').insertAdjacentHTML('beforeend','<div class="sc"><h4>Data and support</h4><div class="chips" style="padding:2px 0 6px"><button class="chip" data-x="ds">Data saver: '+(ds?'On':'Off')+'</button>'+(up?'<button class="chip" data-x="rep">Send problem report</button>':'')+'</div><small class="time">Data saver turns off animations and hover previews and loads only video details until you press play.</small></div>')}catch(e){}};
 document.addEventListener('click',async e=>{const b=e.target.closest('[data-x]');if(!b)return;
  if(b.dataset.x==='ds'){ds=!ds;try{localStorage.setItem('mosaic-ds',ds?'1':'0')}catch(x){}applyDs();helpPaint();toast('Data saver '+(ds?'on':'off'))}
  else if(b.dataset.x==='rep'){try{await post('/api/report',{v:VER,ua:navigator.userAgent,errs:errs.slice(0,15)});toast('Report sent. Thank you.')}catch(x){toast('Could not send the report')}}});
 /* back button on Android */
 const A=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.App;
 if(A&&A.addListener)A.addListener('backButton',()=>{const d=[...document.querySelectorAll('dialog[open]')].pop();if(d){d.close();return}if(cur){$('#sC').click();return}if(tab!=='home'){const h=document.querySelector('nav button[data-t="home"]');if(h){h.click();return}}if(A.exitApp)A.exitApp()});
 /* server features: need the backend, hidden in Kids profiles */
 if(typeof KIDS!=='undefined'&&KIDS)return;
 const cd=mk('cmd','<h3>Comments</h3><p class="cnt" id="cmh" style="margin:0"></p><div id="cml" style="max-height:40vh;overflow:auto"></div><div class="orow"><input id="cmi" class="pin" maxlength="280" placeholder="Comment at the current moment" aria-label="Comment"><button class="b" id="cms">Post</button></div><div class="acts"><button class="b o" id="cmx">Done</button></div>');
 let cmT=0;
  const localCommentKey=id=>'mosaic-player-comments:'+id;
  const localComments=id=>{try{return JSON.parse(localStorage.getItem(localCommentKey(id))||'[]')}catch(e){return[]}};
  const cmLoad=async()=>{if(!cur)return;let l=localComments(cur.id);if(up){try{const remote=await J('/api/comments?item='+encodeURIComponent(cur.id));const seen=new Set(l.map(c=>String(c.t)+'|'+String(c.name)+'|'+String(c.text)));l=l.concat(remote.filter(c=>!seen.has(String(c.t)+'|'+String(c.name)+'|'+String(c.text))))}catch(x){}}$('#cml').innerHTML=l.length?l.slice().reverse().map(c=>'<div class="cmr" data-t="'+(+c.t||0)+'" style="padding:6px 0;border-bottom:1px solid var(--line);cursor:pointer"><b>'+fmt(c.t)+'</b> '+esc(c.name||'Guest')+'<br>'+esc(c.text)+'</div>').join(''):'<p class="cnt">No comments yet. Add the first comment; it stays on this device.</p>'};
 cd.addEventListener('close',()=>clearInterval(cmT));
 $('#cmx').onclick=()=>cd.close();
 $('#cml').addEventListener('click',e=>{const r=e.target.closest('.cmr');if(r&&cur)skip(+r.dataset.t-pos)});
  $('#cms').onclick=async()=>{const i=$('#cmi'),t=i.value.trim();if(!t||!cur)return;const item=cur.id,comment={item,t:Math.floor(pos),text:t,name:(typeof PROF!=='undefined'&&PROF&&PROF.name)||'You',createdAt:Date.now()};try{const a=localComments(item);a.push(comment);localStorage.setItem(localCommentKey(item),JSON.stringify(a.slice(-200)));i.value='';cmLoad();if(up)post('/api/comments',comment).catch(()=>{});toast('Comment saved on this device')}catch(x){toast('Could not save the comment')}};
 $('#cmi').addEventListener('keydown',e=>{if(e.key==='Enter')$('#cms').click()});
 const wd=mk('wpd','<h3>Watch together</h3><p class="cnt" id="wps" style="margin:0"></p><div class="acts" style="justify-content:flex-start"><button class="b" id="wph">Host a party</button></div><div class="orow"><input id="wpi" class="pin" maxlength="6" placeholder="Party code" aria-label="Party code" style="text-transform:uppercase"><button class="b" id="wpj">Join</button></div><div class="acts"><button class="b o" id="wpl">Leave party</button><button class="b o" id="wpx">Done</button></div>');
 let P=null;
 const wpStat=()=>{$('#wps').textContent=P?(P.hostTok?'You are hosting. Share the code '+P.room+'. Guests follow your playback.':'Joined party '+P.room+'. Following the host.'):'Host a party and share the code, or enter a friend\u2019s code to follow their playback. Everyone needs the same title in their library.'};
 const pLeave=()=>{if(P){if(P.es)P.es.close();clearInterval(P.tmr);P=null}wpStat()};
 const follow=s=>{if(!s||!s.id)return;if(!cur||cur.id!==s.id){if(by(s.id))play(s.id);else{toast('Open the same title as the host');return}}
  if(s.at&&s.now&&s.now-s.at>20000)return;const age=s.playing&&s.at&&s.now?Math.max(0,Math.min(10,(s.now-s.at)/1000)):0,tgt=s.pos+age;if(Math.abs(tgt-pos)>2)skip(tgt-pos);if(!!s.playing!==!!playing)toggle()};
 $('#wph').onclick=async()=>{pLeave();try{const r=await post('/api/party',{});P={room:r.room,hostTok:r.host};
  P.tmr=setInterval(()=>{if(cur)post('/api/party/'+P.room+'/state',{host:P.hostTok,id:cur.id,pos:Math.floor(pos),playing}).catch(()=>{})},2000);wpStat()}catch(x){toast('Could not start a party')}};
 $('#wpj').onclick=()=>{const c=$('#wpi').value.trim().toUpperCase();if(c.length!==6)return toast('Enter the 6 character code');pLeave();
  P={room:c};let bad=0;const tick=async()=>{try{const s=await J('/api/party/'+c+'/state');bad=0;follow(s)}catch(x){if(++bad>=3){toast('That party is not available');pLeave()}}};tick();P.tmr=setInterval(tick,1500);wpStat()};
 $('#wpl').onclick=pLeave;$('#wpx').onclick=()=>wd.close();wpStat();
 const mkb=(t,f)=>{const b=document.createElement('button');b.className='b o';b.textContent=t;b.style.display='none';b.onclick=f;$('#sC').before(b);return b};
 const bc=mkb('Comments',()=>{if(!cur)return;$('#cmh').textContent=cur.t;cd.showModal();cmLoad();cmT=setInterval(cmLoad,6000)});bc.id='mosaicCommentsButton';document.querySelector('#mosaicPlayerMenus [data-mp-action="comments"]')?.addEventListener('click',()=>bc.click());
 const bw=mkb('Together',()=>{wpStat();wd.showModal()});
  bc.style.display='';bw.style.display='none';
  (API||(/^https?:/.test(location.protocol)&&!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform()))?fetch(API+'/api/sync?ping=1'):Promise.reject()).then(r=>r.json()).then(j=>{up=window.__apiUp=j.ok===true;bw.style.display=up?'':'none'}).catch(()=>{});
}catch(e){}})();
