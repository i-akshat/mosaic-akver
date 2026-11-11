/* Mosaic 2.5.31 — ordered app script 05 of 22. */
/* ---------- additions 7: audio tracks and automatic posters (self-contained) ---------- */
(function(){try{
 const v=$('#vid');
 const lsGet=k=>{try{return localStorage.getItem(k)}catch(e){return null}},lsSet=(k,x)=>{try{localStorage.setItem(k,x)}catch(e){}};
 const J=(u,o)=>fetch(API+u,o).then(r=>{if(!r.ok)throw new Error(r.status);return r.json()});
 /* ===== audio tracks: separate audio files kept in step with the video, plus the browser's own track list where it exists ===== */
 const alt=document.createElement('audio');alt.id='alt';alt.preload='auto';alt.style.display='none';document.body.appendChild(alt);
 let altRouted=false,sel=null,offset=0;
 const short=s=>String(s||'').replace(/\.[^.]+$/,'').slice(0,22)||'Track';
 const aList=async id=>{try{db=db||await idb();if(!db)return[];return await new Promise(res=>{const r=db.transaction('f').objectStore('f').getAll(IDBKeyRange.bound('aud:'+id+':','aud:'+id+':\uffff'));r.onsuccess=()=>res(r.result||[]);r.onerror=()=>res([])})}catch(e){return[]}};
 const aDel=id=>new Promise(async r=>{try{db=db||await idb();const tx=db.transaction('f','readwrite');tx.objectStore('f').delete(id);tx.oncomplete=tx.onerror=tx.onabort=()=>r()}catch(e){r()}});
 const btn=document.createElement('button');btn.className='b o';btn.textContent='Audio';btn.style.display='none';$('#sC').before(btn);
 const label=()=>{btn.textContent='Audio'+(sel?': '+short(sel.name):'')};
 const want=()=>Math.max(0,v.currentTime-offset);
 const sync=hard=>{if(!sel)return;const d=alt.currentTime-want();if(hard||Math.abs(d)>.25){try{alt.currentTime=want()}catch(e){}}};
 const route=()=>{if(altRouted)return;if(AC&&master&&vidRouted){try{AC.createMediaElementSource(alt).connect(master);altRouted=true;alt.volume=1;return}catch(e){}}alt.volume=vol};
 const stopAlt=()=>{try{alt.pause()}catch(e){}alt.onloadedmetadata=null;alt.removeAttribute('src');try{alt.load()}catch(e){}if(alt._u){URL.revokeObjectURL(alt._u);alt._u=null}v.muted=false;sel=null;offset=0;label()};
 const useAlt=async rec=>{stopAlt();route();alt._u=URL.createObjectURL(rec.blob);sel=rec;offset=rec.offset||0;v.muted=true;alt.playbackRate=v.playbackRate||1;
  alt.onloadedmetadata=()=>{sync(true);if(!v.paused)alt.play().catch(()=>{})};alt.src=alt._u;label()};
 alt.addEventListener('error',()=>{if(sel){toast('This audio file cannot be played here');stopAlt()}});
 v.addEventListener('play',()=>{if(sel){sync(true);alt.play().catch(()=>{})}});
 v.addEventListener('playing',()=>{if(sel&&alt.paused){sync(true);alt.play().catch(()=>{})}});
 v.addEventListener('pause',()=>{if(sel)alt.pause()});
 v.addEventListener('waiting',()=>{if(sel)alt.pause()});
 v.addEventListener('ended',()=>{if(sel)alt.pause()});
 v.addEventListener('seeked',()=>sel&&sync(true));
 v.addEventListener('ratechange',()=>{if(sel)alt.playbackRate=v.playbackRate});
 setInterval(()=>{if(sel&&!v.paused)sync(false)},500);
 const emb=()=>{const t=v.audioTracks;return t&&t.length>1?[...Array(t.length).keys()].map(i=>({i,name:t[i].label||t[i].language||('Track '+(i+1)),on:t[i].enabled})):[]};
 const dlg=document.createElement('dialog');dlg.id='audd';
 dlg.innerHTML='<h3>Audio</h3><p class="cnt" style="margin:0 0 8px">Choose the sound that plays with this video.</p><div id="aul"></div><div class="orow"><span>Sync</span><span class="chips"><button class="chip" data-au="minus" aria-label="Play audio earlier">-0.1 s</button><b id="auo">0.0 s</b><button class="chip" data-au="plus" aria-label="Play audio later">+0.1 s</button></span></div><div class="acts" style="justify-content:flex-start"><label class="b o" style="cursor:pointer">Add audio file<input type="file" id="aufi" accept="audio/*,.m4a,.aac,.mka,.ac3,.eac3,.opus" multiple hidden></label></div><details><summary>How do I get another language?</summary><p class="cnt">Android cannot read extra audio tracks inside a video, so export the track you want as its own audio file and add it here. With ffmpeg: <code style="word-break:break-all">ffmpeg -i movie.mkv -map 0:a:1 -c:a aac dub.m4a</code> (0:a:1 is the second audio track). Mosaic keeps it in step with the video and remembers your choice.</p></details><div class="acts"><button class="b o" id="aux">Done</button></div>';
 document.body.appendChild(dlg);
 const paint=async()=>{if(!cur)return;const recs=await aList(cur.id),em=emb(),row=(act,name,on,del)=>'<div class="orow"><button class="chip'+(on?' on':'')+'" data-au="'+act+'" aria-pressed="'+!!on+'">'+esc(name)+'</button>'+(del?'<button class="chip" data-au="del:'+del+'" aria-label="Remove '+esc(name)+'">Remove</button>':'')+'</div>';
  $('#aul').innerHTML=(em.length?em.map(e=>row('emb:'+e.i,e.name,!sel&&e.on)).join(''):row('orig','Original sound',!sel))+recs.map(r=>row('pick:'+r.id,r.name,sel&&sel.id===r.id,r.id)).join('');
  $('#auo').textContent=(sel?offset:0).toFixed(1)+' s'};
 dlg.addEventListener('click',async e=>{const b=e.target.closest('[data-au]');if(!b||!cur)return;const a=b.dataset.au;
  if(a==='orig'){stopAlt();lsSet('mosaic-audsel:'+cur.id,'')}
  else if(a.startsWith('emb:')){stopAlt();const t=v.audioTracks;for(let i=0;i<t.length;i++)t[i].enabled=i===+a.slice(4);lsSet('mosaic-audsel:'+cur.id,a)}
  else if(a.startsWith('pick:')){const rec=(await aList(cur.id)).find(r=>r.id===a.slice(5));if(rec){await useAlt(rec);lsSet('mosaic-audsel:'+cur.id,rec.id)}}
  else if(a.startsWith('del:')){const id=a.slice(4);if(sel&&sel.id===id){stopAlt();lsSet('mosaic-audsel:'+cur.id,'')}await aDel(id)}
  else if((a==='minus'||a==='plus')&&sel){offset=Math.max(-10,Math.min(10,Math.round((offset+(a==='plus'?.1:-.1))*10)/10));const{blob,...meta}=sel;sel.offset=offset;dbPut({...meta,offset},blob);sync(true)}
  label();paint()});
 $('#aufi').addEventListener('change',async e=>{const fs=[...e.target.files];e.target.value='';if(!cur)return;let last=null;
  for(const f of fs){if(!/^audio\//.test(f.type)&&!/\.(m4a|aac|mka|ac3|eac3|opus|mp3|ogg|wav|flac)$/i.test(f.name)){toast('Not an audio file: '+f.name);continue}
   const rec={id:'aud:'+cur.id+':'+Date.now()+Math.floor(Math.random()*99),aud:1,of:cur.id,name:short(f.name),offset:0};
   if(!(await dbPut(rec,f))){toast('Could not save '+f.name);continue}last={...rec,blob:f}}
  if(last){await useAlt(last);lsSet('mosaic-audsel:'+cur.id,last.id);toast('Audio added')}label();paint()});
 $('#aux').onclick=()=>dlg.close();
 btn.onclick=()=>{if(!cur)return;paint();dlg.showModal()};
 setInterval(()=>{btn.style.display=(cur&&cur.isVid&&cur.src)?'':'none'},700);
 const restore=async id=>{const s=lsGet('mosaic-audsel:'+id);if(!s||!cur||!cur.isVid||!cur.src)return;
  if(s.startsWith('emb:')){const idx=+s.slice(4),apply=()=>{const t=v.audioTracks;if(t&&t.length>idx)for(let i=0;i<t.length;i++)t[i].enabled=i===idx};v.addEventListener('loadedmetadata',apply,{once:true});apply();return}
  const rec=(await aList(id)).find(r=>r.id===s);if(rec&&cur&&cur.id===id)useAlt(rec)};
 const op7=play;play=id=>{stopAlt();op7(id);if(cur)restore(cur.id)};
 const os7=stop;stop=function(){stopAlt();return os7.apply(this,arguments)};
 setTimeout(async()=>{try{db=db||await idb();if(!db)return;const s=db.transaction('f','readwrite').objectStore('f'),r=s.getAllKeys();r.onsuccess=()=>{const ks=r.result,have=new Set(ks);ks.forEach(k=>{if(typeof k==='string'&&k.startsWith('aud:')&&!have.has(k.split(':')[1]))s.delete(k)})}}catch(e){}},6000);
 /* ===== automatic posters: titles of added films and songs are looked up once through the backend ===== */
 const metaOn=()=>lsGet('mosaic-meta')!=='0';
 const QUAL=/(480p|576p|720p|1080p|2160p|4k|uhd|bluray|brrip|bdrip|webrip|web[- ]?dl|hdrip|dvdrip|hdtv|x26[45]|h26[45]|hevc|aac|ac3|dts|hdr|10bit|remux|yify|rarbg)/i;
 const cleanName=n=>{const o=String(n).replace(/[._]+/g,' ').replace(/\s+/g,' ').trim();let year=null,best=null,m;const re=/(?:^|[\s(\[])((?:19|20)\d{2})(?=$|[\s)\]])/g;
  while((m=re.exec(o))){const at=m.index+m[0].length-m[1].length,b=o[at-1],nx=o.slice(at+4).trim().split(/\s+/)[0]||'';if(at>0&&(b==='('||b==='['||QUAL.test(nx)))best={y:+m[1],at}}
  let s=o;if(best){year=best.y;s=o.slice(0,best.at)}
  s=s.replace(new RegExp('\\b'+QUAL.source+'\\b.*$','i'),'').replace(/[\[(].*$/,'').replace(/\s+/g,' ').trim();return{q:s||o,year}};
 window.__cleanName=cleanName;
 const saveMeta=x=>dbDo(s=>{const g=s.get(x.id);g.onsuccess=()=>{const o=g.result;if(o){o.poster=x.poster;o.d=x.d;o.s=x.s;o.year=x.year;o.metaAt=x.metaAt;s.put(o)}}});
 let busy=false;
 const scan=async()=>{if(busy||KIDS||!window.__apiUp||!metaOn()||document.documentElement.classList.contains('ds'))return;
  const x=ITEMS.find(i=>i.user&&(i.k==='m'||i.k==='a')&&!i.poster&&(!i.metaAt||Date.now()-i.metaAt>6048e5));if(!x)return;busy=true;
  try{const{q,year}=cleanName(x.t),r=await J('/api/meta?kind='+(x.k==='m'?'movie':'music')+'&q='+encodeURIComponent(q)+(year?'&year='+year:''));x.metaAt=Date.now();
   if(r.found){if(r.poster&&/^https:\/\/([\w-]+\.)*(mzstatic\.com|tmdb\.org)\//.test(r.poster))x.poster=r.poster;if(!x.d&&r.overview)x.d=r.overview.slice(0,160);if(x.k==='a'&&r.artist&&/^My /.test(x.s))x.s=r.artist;if(r.year)x.year=r.year}
   saveMeta(x);render()}
  catch(e){x.metaAt=Date.now()-6048e5+36e5}
  finally{busy=false}};
 setInterval(scan,4000);
 const hp7=helpPaint;helpPaint=function(){hp7();try{const c=document.querySelector('#hpb .sc:last-child .chips');if(c&&window.__apiUp)c.insertAdjacentHTML('beforeend','<button class="chip" data-x="meta">Online posters: '+(metaOn()?'On':'Off')+'</button>')}catch(e){}};
 document.addEventListener('click',e=>{if(e.target.closest('[data-x=meta]')){lsSet('mosaic-meta',metaOn()?'0':'1');helpPaint();toast('Online posters '+(metaOn()?'on':'off'))}});
}catch(e){}})();

