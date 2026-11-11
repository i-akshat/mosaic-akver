/* Mosaic 2.5.31 — ordered app script 22 of 22. */
(function(){try{
 const xml=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
 const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
 const PAL=[['#2a1633','#7a2e5a','#f2b84b'],['#10242b','#1f5c5a','#f0e2c0'],['#3a1a12','#b4492e','#f4d9a0'],['#1a1d3a','#4a4fa8','#f08a6a'],['#1d2a1a','#58773a','#f2e6b8'],['#2b1d12','#8c5a2b','#e9c7a0'],['#22172e','#5d3a8a','#f6d27a'],['#241214','#9b2f3a','#f1dcc2']];
 const ALB=[
  (g,o,a)=>`<circle cx="250" cy="200" r="176" fill="${o}"/>${[150,120,90].map(r=>`<circle cx="250" cy="200" r="${r}" fill="none" stroke="${g}" stroke-opacity=".35" stroke-width="2"/>`).join('')}<circle cx="250" cy="200" r="50" fill="${a}"/><circle cx="250" cy="200" r="7" fill="${g}"/>`,
  (g,o,a)=>[0,1,2,3,4].map(i=>`<circle cx="250" cy="410" r="${70+i*48}" fill="${i%2?o:a}" opacity="${i%2?.85:.95}"/>`).reverse().join(''),
  (g,o,a,h,t)=>`<text x="10" y="430" font-family="Fraunces,Georgia,serif" font-weight="700" font-size="520" fill="${o}" opacity=".6">${xml(String(t).charAt(0).toUpperCase())}</text><circle cx="400" cy="100" r="34" fill="${a}"/>`,
  (g,o,a)=>[0,1,2,3,4,5].map(i=>`<polygon points="${i*90-60},400 ${i*90+10},0 ${i*90+55},0 ${i*90-15},400" fill="${i%3===0?a:o}" opacity="${i%3===0?1:.55+(i%2)*.25}"/>`).join(''),
  (g,o,a,h)=>Array.from({length:14},(_,i)=>{const ht=70+((i*47+h)%230);return `<rect x="${34+i*32}" y="${400-ht}" width="22" height="${ht}" rx="3" fill="${i%5===2?a:o}"/>`}).join(''),
  (g,o,a,h)=>Array.from({length:9},(_,i)=>`<rect x="${52+(i%3)*128}" y="${24+Math.floor(i/3)*122}" width="116" height="110" rx="${i%2?58:10}" fill="${i===h%9?a:o}" opacity="${i===h%9?1:.45+((i*5+h)%3)*.2}"/>`).join('')
 ];
 const CLP={
  Workshop:(g,o,a)=>`<circle cx="560" cy="215" r="95" fill="none" stroke="${o}" stroke-width="30" stroke-dasharray="22 16"/><circle cx="560" cy="215" r="48" fill="${a}"/><circle cx="360" cy="270" r="52" fill="none" stroke="${a}" stroke-width="18" stroke-dasharray="14 12"/>`,
  Food:(g,o,a)=>`<circle cx="400" cy="270" r="128" fill="${o}"/><circle cx="400" cy="270" r="96" fill="${a}"/>${[340,400,460].map(x=>`<path d="M${x} 130c-22-26 22-44 0-72" fill="none" stroke="${a}" stroke-width="7" stroke-linecap="round" opacity=".7"/>`).join('')}`,
  Science:(g,o,a)=>[0,1,2,3,4].map(i=>`<path d="M0 ${150+i*30}C200 ${70+i*30},400 ${230+i*30},800 ${150+i*30}" fill="none" stroke="${i%2?o:a}" stroke-width="${16-i*2}" opacity="${1-i*.12}"/>`).join(''),
  Learning:(g,o,a)=>Array.from({length:32},(_,i)=>{const r=i>>3,c=i&7;return (r+c)%2?`<rect x="${c*70+120}" y="${r*70+60}" width="70" height="70" fill="${i===11?a:o}" opacity="${i===11?1:.6}"/>`:''}).join(''),
  Nature:(g,o,a)=>`<circle cx="590" cy="130" r="64" fill="${a}"/><path d="M0 300Q200 200 400 280T800 250V450H0z" fill="${o}" opacity=".8"/><path d="M0 370Q220 300 440 360T800 330V450H0z" fill="${g}" opacity=".7"/>`,
  Travel:(g,o,a)=>`<path d="M400 170L-60 450M400 170L860 450" stroke="${a}" stroke-width="12" fill="none"/>${[0,1,2,3].map(i=>`<rect x="${400-(60+i*70)}" y="${230+i*52}" width="${120+i*140}" height="9" fill="${o}" opacity=".85"/>`).join('')}<circle cx="400" cy="130" r="30" fill="${a}"/>`
 };
 const prev=scene;
 scene=function(x){
  if(!x||x.k==='m'||x.k==='r')return prev(x);
  try{
   const t=String(x.t||''),hs=hash(t),id='mq'+(hs%99991);
   if(x.k==='a'){
    const n=ITEMS.filter(i=>i.k==='a'&&!i.user).findIndex(i=>i.id===x.id),q=n>=0?n:hs,p=PAL[(q*3+(hs&1))%PAL.length],g=q%2?p[1]:p[0],o=q%2?p[0]:p[1],cmp=ALB[(n>=0?n:(hs>>>5))%ALB.length],fs=t.length>16?25:34;
    return `<svg viewBox="0 0 500 500" role="img" aria-label="${xml(t)} album artwork" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><rect width="500" height="500" fill="${g}"/>${cmp(g,o,p[2],hs>>>9,t)}<rect y="398" width="500" height="102" fill="${p[0]}"/><text x="28" y="448" font-family="Fraunces,Georgia,serif" font-weight="600" font-size="${fs}" fill="#f4e9d8" letter-spacing="-.5">${xml(t.length>25?t.slice(0,24)+'…':t)}</text><text x="29" y="476" fill="#f4e9d8" fill-opacity=".65" font-size="11" font-family="system-ui,sans-serif" letter-spacing=".2">${xml(String(x.s||'').slice(0,32))}</text></svg>`;
   }
   if(x.k==='c'){
    const p=PAL[hs%PAL.length],f=CLP[x.genre]||CLP.Nature;
    return `<svg viewBox="0 0 800 450" role="img" aria-label="${xml(t)} clip artwork" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient></defs><rect width="800" height="450" fill="${p[0]}"/>${f(p[0],p[1],p[2])}<rect width="800" height="450" fill="url(#${id}s)"/><text x="32" y="418" fill="#f4e9d8" fill-opacity=".85" font-size="15" font-family="system-ui,sans-serif" font-weight="700" letter-spacing=".2">${xml(String(x.genre||'Clip'))}</text></svg>`;
   }
  }catch(e){}
  return prev(x);
 };
 try{render()}catch(e){}
}catch(e){console.warn('mosaic redesign 2',e)}})();
