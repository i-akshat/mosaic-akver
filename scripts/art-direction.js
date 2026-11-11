/* Mosaic 2.5.31 — ordered app script 21 of 22. */
(function(){try{
 const xml=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
 const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
 const PAL=[['#2a1633','#7a2e5a','#f2b84b'],['#10242b','#1f5c5a','#f0e2c0'],['#3a1a12','#b4492e','#f4d9a0'],['#1a1d3a','#4a4fa8','#f08a6a'],['#1d2a1a','#58773a','#f2e6b8'],['#2b1d12','#8c5a2b','#e9c7a0'],['#22172e','#5d3a8a','#f6d27a'],['#241214','#9b2f3a','#f1dcc2']];
 const COMP=[
  (a,b,c)=>`<circle cx="268" cy="212" r="122" fill="${c}"/><rect y="330" width="400" height="26" fill="${b}"/><rect y="372" width="400" height="16" fill="${b}" opacity=".7"/><rect y="404" width="400" height="9" fill="${b}" opacity=".45"/>`,
  (a,b,c)=>`<path d="M60 410V232a140 140 0 0 1 280 0v178z" fill="${b}"/><path d="M110 410V244a90 90 0 0 1 180 0v166z" fill="${a}"/><path d="M160 410V254a40 40 0 0 1 80 0v156z" fill="${c}"/>`,
  (a,b,c)=>`<path d="M400 0v400L0 240V0z" fill="${b}"/><circle cx="126" cy="150" r="72" fill="${c}"/>`,
  (a,b,c,h)=>Array.from({length:20},(_,i)=>{const r=i>>2,k=i&3,hot=i===h%20;return `<rect x="${44+k*84}" y="${64+r*76}" width="76" height="68" rx="5" fill="${hot?c:b}" opacity="${hot?1:.35+((i*7+h)%4)*.17}"/>`}).join(''),
  (a,b,c,h)=>Array.from({length:9},(_,i)=>`<rect x="${34+i*36}" y="${150+((i*53+h)%130)}" width="26" height="400" fill="${b}" opacity="${.45+(i%3)*.2}"/>`).join('')+`<circle cx="${110+h%180}" cy="108" r="44" fill="${c}"/>`,
  (a,b,c)=>`<circle cx="150" cy="230" r="96" fill="none" stroke="${b}" stroke-width="14"/><circle cx="250" cy="230" r="96" fill="none" stroke="${c}" stroke-width="14"/><circle cx="200" cy="320" r="96" fill="none" stroke="${b}" stroke-width="14" opacity=".6"/>`
 ];
 const wrap=t=>{const w=String(t).split(' '),L=[''];w.forEach(x=>{const l=L[L.length-1];if((l+' '+x).trim().length>11&&l)L.push(x);else L[L.length-1]=(l+' '+x).trim()});return L.slice(0,3)};
 const prev=scene;
 scene=function(x){
  if(!x||x.k==='a'||x.k==='c'||x.k==='r')return prev(x);
  try{
   const t=String(x.t||''),hs=hash(t),n=ITEMS.filter(i=>i.k==='m'&&!i.user).findIndex(i=>i.id===x.id),sq=n>=0?n:hs,p=PAL[(sq*3+(hs&1))%PAL.length],cmp=COMP[(n>=0?n:(hs>>>5))%COMP.length],id='mp'+(hs%99991),lines=wrap(t),y0=548-(lines.length-1)*44;
   return `<svg viewBox="0 0 400 600" role="img" aria-label="${xml(t)} film artwork" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="600" fill="${p[0]}"/>
    ${cmp(p[0],p[1],p[2],hs>>>9)}
    <rect y="420" width="400" height="180" fill="${p[0]}"/>
    <text x="28" y="38" fill="${p[2]}" font-size="12" font-family="system-ui,sans-serif" font-weight="600">${xml(String(x.genre||'Film'))}</text>
    ${x.year?`<text x="372" y="38" text-anchor="end" fill="#f4e9d8" fill-opacity=".72" font-size="12" font-family="system-ui,sans-serif">${xml(x.year)}</text>`:''}
    <text font-family="Fraunces,Georgia,serif" font-weight="600" font-size="46" fill="#f4e9d8" letter-spacing="-1">${lines.map((l,i)=>`<tspan x="28" y="${y0+i*48}">${xml(l)}</tspan>`).join('')}</text>
    <text x="29" y="${y0+(lines.length-1)*48+30}" fill="#f4e9d8" fill-opacity=".7" font-size="12" font-family="system-ui,sans-serif">${xml(String(x.genre||'Feature'))}</text>
   </svg>`;
  }catch(e){return prev(x)}
 };
 try{render()}catch(e){}
}catch(e){console.warn('mosaic redesign',e)}})();
