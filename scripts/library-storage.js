/* Mosaic 2.5.31 — ordered app script 02 of 22. */
/* IndexedDB lifecycle and transaction results. */
let db;
const idb=()=>new Promise(resolve=>{
 try{
  const request=indexedDB.open('mosaic',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('f',{keyPath:'id'});
  request.onsuccess=()=>{db=request.result;db.onversionchange=()=>db.close();resolve(db)};
  request.onerror=()=>resolve(null)
 }catch(e){resolve(null)}
});
async function dbDo(fn){
 try{
  db=db||await idb();if(!db)return false;
  return await new Promise(resolve=>{
   let tx,settled=false;
   const finish=ok=>{if(!settled){settled=true;resolve(ok)}};
   try{
    tx=db.transaction('f','readwrite');
    tx.oncomplete=()=>finish(true);tx.onerror=tx.onabort=()=>finish(false);
    fn(tx.objectStore('f'))
   }catch(e){try{tx?.abort()}catch(x){}finish(false)}
  })
 }catch(e){return false}
}
async function dbLoad(){
 try{
  db=db||await idb();if(!db){window.__mosaicDbReady=true;return}
  const request=db.transaction('f').objectStore('f').getAll();
  request.onsuccess=()=>{
   for(const item of request.result){
    if(item.aud||!item.blob||ITEMS.some(x=>x.id===item.id))continue;
    try{ITEMS.push({...item,src:URL.createObjectURL(item.blob)})}catch(e){}
   }
   window.__mosaicDbReady=true;render()
  };
  request.onerror=()=>{window.__mosaicDbReady=true}
 }catch(e){window.__mosaicDbReady=true}
}
const revokeItemUrl=item=>{if(typeof item?.src==='string'&&item.src.startsWith('blob:'))try{URL.revokeObjectURL(item.src)}catch(e){}};
/* Local import controls and media classification. */
let pend=[],importGeneration=0,importSaving=false;
$('#no').onclick=()=>{if(!importSaving)$('#imp').close()};
$('#f').onchange=e=>{stageFiles(e.target.files);e.target.value=''};
['dragenter','dragover'].forEach(v=>document.addEventListener(v,e=>{e.preventDefault();$('#drop').style.display='flex'}));
document.addEventListener('dragleave',e=>{if(!e.relatedTarget)$('#drop').style.display='none'});
document.addEventListener('drop',e=>{e.preventDefault();$('#drop').style.display='none';stageFiles(e.dataTransfer.files)});
$('#sD').onclick=async()=>{if(!cur||!cur.user)return;const item=cur,id=item.id;stop();ITEMS.splice(ITEMS.findIndex(x=>x.id===id),1);revokeItemUrl(item);const stored=await dbDo(s=>s.delete(id));saved=saved.filter(x=>x!==id);persist();render();ping();toast(stored?'Removed from your library':'Removed from view, but this device could not delete the saved file.')};
/* Metadata parsing, validation and import review. */
 /* ---------- upload v2: validation, duplicates, storage, progress ---------- */
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const isVidF=f=>f.type?f.type.startsWith('video'):/\.(mp4|m4v|mov|webm|mkv)$/i.test(f.name);
const have=()=>new Set(ITEMS.filter(x=>x.user&&x.key).map(x=>x.key));
async function coverHue(src){if(!src)return null;return new Promise(resolve=>{const im=new Image();im.onload=()=>{try{const c=document.createElement('canvas');c.width=c.height=1;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0,1,1);const d=g.getImageData(0,0,1,1).data,r=d[0]/255,gg=d[1]/255,b=d[2]/255,mx=Math.max(r,gg,b),mn=Math.min(r,gg,b),delta=mx-mn;let h=0;if(delta){if(mx===r)h=60*(((gg-b)/delta)%6);else if(mx===gg)h=60*((b-r)/delta+2);else h=60*((r-gg)/delta+4)}resolve((h+360)%360)}catch(e){resolve(null)}};im.onerror=()=>resolve(null);im.src=src})}
async function readAudioTags(file){
 const out={};try{const b=await file.slice(0,8*1024*1024).arrayBuffer(),d=new DataView(b),u=new Uint8Array(b);if(u[0]!==73||u[1]!==68||u[2]!==51)return out;
 const ver=u[3],tag=(u[6]<<21)|(u[7]<<14)|(u[8]<<7)|u[9],end=Math.min(u.length,10+tag);let p=10;
 const text=(a,z)=>{if(z<=a+1)return '';const enc=u[a],bytes=u.slice(a+1,z);try{return new TextDecoder(enc===1?'utf-16':enc===2?'utf-16be':enc===3?'utf-8':'windows-1252').decode(bytes).replace(/\0/g,'').trim()}catch(e){return new TextDecoder().decode(bytes).replace(/\0/g,'').trim()}};
 while(p+10<=end){const id=String.fromCharCode(...u.slice(p,p+4));if(!id.trim())break;let n=ver===4?((u[p+4]<<21)|(u[p+5]<<14)|(u[p+6]<<7)|u[p+7]):d.getUint32(p+4);if(n<=0||p+10+n>end)break;const a=p+10,z=a+n;
  if(id==='TIT2')out.title=text(a,z);if(id==='TPE1')out.artist=text(a,z);
  if(id==='APIC'&&n>16){let q=a,encoding=u[q++],m=q;while(q<z&&u[q]!==0)q++;const mime=new TextDecoder().decode(u.slice(m,q))||'image/jpeg';q+=2;if(encoding===1||encoding===2){while(q+1<z&&(u[q]!==0||u[q+1]!==0))q+=2;q+=2}else{while(q<z&&u[q]!==0)q++;q++}if(q<z){const bytes=u.slice(q,z);let bin='';for(let i=0;i<bytes.length;i+=0x8000)bin+=String.fromCharCode(...bytes.subarray(i,i+0x8000));out.cover='data:'+mime+';base64,'+btoa(bin)}}
  p=z;
 }
 }catch(e){}return out;
}
const probe2=f=>new Promise(res=>{const url=URL.createObjectURL(f),isVid=isVidF(f),o={f,url,isVid,key:f.name+'|'+f.size,t:f.name.replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim(),len:0,thumb:'',err:'',on:true,w:0,h2:0};let done=false;
 const el=document.createElement(isVid?'video':'audio');el.preload='metadata';el.muted=true;
 const fin=()=>{if(done)return;done=true;if(!o.err&&have().has(o.key))o.err='Already in your library';if(o.err)o.on=false;o.k=!isVid?'a':(o.len>=1200&&o.w>=o.h2)?'m':'c';res(o)};
 el.onloadedmetadata=async()=>{o.len=isFinite(el.duration)?el.duration:(f._dur||0);o.w=el.videoWidth;o.h2=el.videoHeight;if(isVid)el.currentTime=Math.min(2,o.len/3);else{const tags=await readAudioTags(f);o.artist=tags.artist||'';o.thumb=tags.cover||'';o.albumTitle=tags.title||'';o.h=await coverHue(tags.cover);if(tags.title)o.t=tags.title;fin()}};
 el.onseeked=()=>{try{const c=document.createElement('canvas');c.width=320;c.height=180;c.getContext('2d').drawImage(el,0,0,320,180);o.thumb=c.toDataURL('image/jpeg',.7)}catch(e){}fin()};
 el.onerror=()=>{o.err="Can't play this format in your browser";fin()};setTimeout(fin,6000);el.src=url});
async function storeInfo(){try{const e=await navigator.storage.estimate();return 'Using '+fmtB(e.usage)+' on this device'}catch(x){return ''}}
const dbPut=(it,blob)=>dbDo(s=>s.put({...it,blob}));
function updOk(){const n=pend.filter(o=>o.on).length;$('#ok').disabled=!n;$('#ok').textContent=n?'Add '+n+(n>1?' items':' item'):'Nothing to add'}
function paintRows(){$('#rows').innerHTML=pend.map((o,i)=>`<div class="rw ${o.on?'':'off'}" style="animation-delay:${Math.min(i,8)*40}ms"><input type="checkbox" class="ck" data-k="${i}" ${o.on?'checked':''} ${o.err?'disabled':''} aria-label="Include ${esc(o.t)}"><div class="th">${o.thumb?`<img src="${o.thumb}" alt="">`:'<span>Audio</span>'}</div><div class="f"><input class="nm" data-i="${i}" value="${esc(o.t)}" ${o.on?'':'disabled'} aria-label="Title"><small>${o.err?`<b class="er">${o.err}</b>`:(o.len?fmt(o.len):'Unknown length')+' · '+(o.f.size/1048576).toFixed(1)+' MB'}</small></div><select data-s="${i}" aria-label="Category" ${o.on?'':'disabled'}>${(o.isVid?[['m','Film'],['c','Clip']]:[['a','Song']]).map(([k,n])=>`<option value="${k}" ${o.k===k?'selected':''}>${n}</option>`).join('')}</select></div>`).join('');updOk()}
async function stageFiles(files){
 if(importSaving)return toast('Wait for the current files to finish saving.');
 if($('#imp').open)return toast('Finish or close the current import first.');
 pend.forEach(o=>{if(!o.added)URL.revokeObjectURL(o.url)});pend=[];
 const request=++importGeneration,all=Array.from(files||[]),fs=all.filter(f=>/^(video|audio)\//.test(f.type)||/\.(mp4|m4v|mov|webm|mkv|mp3|m4a|wav|ogg|flac|aac)$/i.test(f.name));
 if(!fs.length)return toast('Mosaic can only play audio and video files.');
 const read=[];
 for(let i=0;i<fs.length;i++){
  toast('Reading file '+(i+1)+' of '+fs.length+'...');
  let item;try{item=await probe2(fs[i])}catch(e){read.forEach(x=>URL.revokeObjectURL(x.url));if(request===importGeneration)toast('Could not read '+fs[i].name+'.');return}
  if(request!==importGeneration){URL.revokeObjectURL(item.url);read.forEach(x=>URL.revokeObjectURL(x.url));return}
  read.push(item)
 }
 if(request!==importGeneration){read.forEach(x=>URL.revokeObjectURL(x.url));return}
 pend=read;$('#stor').textContent=await storeInfo();if(request!==importGeneration)return;paintRows();$('#imp').showModal();if(fs.length<all.length)toast((all.length-fs.length)+' non-media file(s) skipped')}
$('#rows').addEventListener('input',e=>{const t=e.target;if(t.dataset.i!==undefined)pend[t.dataset.i].t=t.value});
$('#rows').addEventListener('change',e=>{const t=e.target;if(t.dataset.k!==undefined){pend[t.dataset.k].on=t.checked;paintRows()}if(t.dataset.s!==undefined)pend[t.dataset.s].k=t.value});
$('#imp').addEventListener('close',()=>{pend.forEach(o=>{if(!o.added)URL.revokeObjectURL(o.url)});pend=[];importSaving=false;$('#no').disabled=false});
$('#imp').addEventListener('cancel',e=>{if(importSaving)e.preventDefault()});
$('#ok').onclick=async()=>{
 const sel=pend.filter(o=>o.on);if(!sel.length||importSaving)return;
 importSaving=true;$('#ok').disabled=true;$('#no').disabled=true;try{await navigator.storage.persist()}catch(e){}
 const cnt={},N={m:'Films',a:'Music',c:'Clips'};let fail=0,i=0;
 for(const o of sel){
  $('#ok').textContent='Saving '+(++i)+' of '+sel.length+'...';
  const k=o.k,it={id:'u'+Date.now()+i,key:o.key,size:o.f.size,k,t:o.t.trim()||'Untitled',s:k==='a'?(o.artist||'My music'):{m:'My films',c:'My clips'}[k],artist:o.artist||'',albumTitle:o.albumTitle||'',d:'',h:o.h==null?(o.f.size+i*37)%360:o.h,len:o.len||1,isVid:o.isVid,thumb:o.thumb,user:true,added:Date.now()};
  ITEMS.push({...it,src:o.url});o.added=true;if(!(await dbPut(it,o.f)))fail++;syncUp(it,o.f);cnt[k]=(cnt[k]||0)+1
 }
 const ks=Object.keys(cnt);importSaving=false;$('#no').disabled=false;$('#imp').close();ping();toast('Added to '+ks.map(k=>N[k]+' ('+cnt[k]+')').join(' and ')+(fail?'. '+fail+' could not be saved for your next visit.':''));document.querySelector('nav [data-t="'+ks[0]+'"]').click()
};
/* Render the first library view after storage helpers are available. */
render();frame();dbLoad();
