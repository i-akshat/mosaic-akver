/* Mosaic 2.5.31 — ordered app script 06 of 22. */
/* ---------- additions 8: tour v2, image fade-in ---------- */
;(function(){try{
 const raw=k=>{try{return _gi.call(localStorage,k)}catch(e){return null}},setRaw=(k,v)=>{try{_si.call(localStorage,k,v)}catch(e){}};
 const spot=$('#tspot'),card=$('#tcard');if(!spot||!card)return;
 const td=document.createElement('dialog');td.id='tourd';td.setAttribute('aria-label','Guided tour');td.append(spot,card);document.body.appendChild(td);
 const goHome=()=>{if(tab!=='home'){const b=document.querySelector('nav [data-t="home"]');if(b)b.click()}};
 const STEPS=[
  {c:1,t:'Welcome to Mosaic',d:'Here is a 30-second look around. You can skip it any time.'},
  {s:'#q',t:'Search everything',d:'Find films, songs and clips. Press Ctrl or Cmd + K from anywhere.'},
  {s:(innerWidth<=760?'#fab':'.top label.addf'),t:'Add your own files',d:'Pick or drag in videos and audio. Mosaic sorts them into Films, Music and Clips for you.'},
  {s:'nav',t:'Your library',d:'Home, Reels, Music and Library are one tap away. Films and Lab sit in the pills at the top on a phone.'},
  {s:'.card',t:'Tap to play',d:'On a computer, hover a card for a preview. Add titles to My List with the plus.',before:goHome},
  {s:'#avb',t:'Profiles',d:'Switch profiles, or add a Kids profile that only shows suitable titles.'},
  {s:'#stbtn',t:'Settings',d:'Colours, sound, storage and sync.'},
  {s:'#hlp',t:'Help any time',d:'Tap the question mark for tips, answers and this tour again.'},
  {c:1,last:1,t:'You are all set',d:'Enjoy Mosaic. Add your own films, clips and music to get started.'}
 ];
 let ti=-1,tgt=null,TOURING=false,poll=0,raf=0;
 const stepTag=document.createElement('div');stepTag.className='tstep';$('#tt').before(stepTag);
 const dots=document.createElement('div');dots.className='tdots';$('#td2').after(dots);
 const logo=document.createElement('div');logo.className='tlogo';logo.innerHTML=[...Array(9)].map((_,i)=>'<i style="--i:'+i+';--h:'+((i*40+210)%360)+'"></i>').join('');card.prepend(logo);
 const usable=el=>{if(!el||!el.getBoundingClientRect)return false;const r=el.getBoundingClientRect();return r.width>0&&r.height>0};
 function place(){if(!TOURING)return;const W=innerWidth,H=innerHeight,s=STEPS[ti]||{},cw=Math.min(300,W-24),gap=14,pad=6;card.style.width=cw+'px';const ch=card.offsetHeight||190;
  if(s.c||!tgt){spot.style.opacity='0';card.style.left=Math.max(12,(W-cw)/2)+'px';card.style.top=Math.max(12,(H-ch)/2)+'px';return}
  const r=tgt.getBoundingClientRect();spot.style.opacity='1';
  spot.style.left=(r.left-pad)+'px';spot.style.top=(r.top-pad)+'px';spot.style.width=(r.width+pad*2)+'px';spot.style.height=(r.height+pad*2)+'px';
  let left=Math.max(12,Math.min(W-cw-12,r.left+r.width/2-cw/2)),top=r.bottom+gap;
  if(top+ch>H-12)top=r.top-gap-ch;
  if(top<12){top=Math.max(12,Math.min(H-ch-12,r.top+r.height/2-ch/2));if(r.right+gap+cw<=W-12)left=r.right+gap;else if(r.left-gap-cw>=12)left=r.left-gap-cw;else top=H-ch-12}
  card.style.left=left+'px';card.style.top=top+'px'}
 function show(i,dir){
  while(i>=0&&i<STEPS.length&&!STEPS[i].c&&!usable(document.querySelector(STEPS[i].s)))i+=dir;
  if(i<0)i=0;if(i>=STEPS.length)return end();
  ti=i;const s=STEPS[i];if(s.before)s.before();
  tgt=s.c?null:document.querySelector(s.s);if(tgt&&tgt.scrollIntoView){try{tgt.scrollIntoView({block:'center',inline:'center'})}catch(e){}}
  $('#tt').textContent=s.t;$('#td2').textContent=s.d;stepTag.textContent=s.c?'':'Step '+i+' of '+(STEPS.length-2);
  logo.style.display=s.c?'grid':'none';dots.innerHTML=STEPS.map((_,k)=>'<i'+(k===i?' class="on"':'')+'></i>').join('');
  $('#tbk').style.display=i>0?'':'none';$('#tnx').textContent=i===0?'Start':s.last?'Done':'Next';$('#tsk').style.display=s.last?'none':'';
  td.classList.toggle('dim',!!s.c);card.classList.remove('in');void card.offsetWidth;card.classList.add('in');
  place();requestAnimationFrame(()=>requestAnimationFrame(place));$('#tnx').focus()}
 function end(){if(td.open)td.close();else{TOURING=false;setRaw('mosaic-toured','1')}}
 td.addEventListener('close',()=>{TOURING=false;tgt=null;setRaw('mosaic-toured','1')});
 td.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();$('#tnx').click()}else if(e.key==='ArrowLeft'){e.preventDefault();$('#tbk').click()}});
 $('#tnx').onclick=()=>{if(!TOURING)return;const s=STEPS[ti];if(s&&s.last)end();else show(ti+1,1)};$('#tbk').onclick=()=>{if(TOURING)show(ti-1,-1)};$('#tsk').onclick=end;
 const dialogOpen=()=>[...document.querySelectorAll('dialog[open]')].length>0;
 const safe=()=>!window.__onbOpen&&!dialogOpen()&&$('#stage').style.display!=='flex'&&$('#splash').style.display==='none';
 function begin(){if(TOURING)return;TOURING=true;td.showModal();show(0,1)}
 function schedule(){clearInterval(poll);let n=0;poll=setInterval(()=>{if(TOURING||++n>60){clearInterval(poll);return}if(safe()){clearInterval(poll);begin()}},400)}
 tourStart=function(){const hp=$('#hp');if(hp&&hp.open)hp.close();schedule()};tourEnd=end;
 const auto=()=>{if(!raw('mosaic-toured'))schedule()};
 $('#enter').addEventListener('click',()=>setTimeout(auto,900));
 if(swFlag)setTimeout(auto,1500);
 /* closing the welcome dialog any way at all (including the Android back button) must not strand the tour */
 const onb=$('#onb');if(onb)onb.addEventListener('close',()=>{if(window.__onbOpen){window.__onbOpen=false;setRaw('mosaic-onboarded','1')}auto()});
 const re=()=>{if(!TOURING||raf)return;raf=requestAnimationFrame(()=>{raf=0;place()})};addEventListener('resize',re);addEventListener('scroll',re,true);
 window.__tour={STEPS,state:()=>({TOURING,ti})};
 /* images fade in once loaded */
 document.addEventListener('load',e=>{if(e.target&&e.target.tagName==='IMG')e.target.classList.add('ld')},true);
 document.addEventListener('error',e=>{if(e.target&&e.target.tagName==='IMG')e.target.classList.add('ld')},true);
 const rr8=render;render=()=>{rr8();document.querySelectorAll('.art img').forEach(i=>{if(i.complete)i.classList.add('ld')})};
}catch(e){}})();

