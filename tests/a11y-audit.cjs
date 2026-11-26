// Auditoria automática de acessibilidade do Lume: menor tamanho de fonte e menor
// contraste de texto (WCAG 1.4.3) em todas as telas, nos modos claro e escuro.
// Uso: com o app rodando: node tests/a11y-audit.cjs   (BASE_URL opcional)
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pages=['Dashboard','Notas','Disciplinas','Matrícula','Calendário','Meu perfil'];
const p=await b.newPage({viewport:{width:1366,height:768}});await p.goto(process.env.BASE_URL || 'http://localhost:5173');await p.waitForTimeout(800);
const audit=()=>p.evaluate(()=>{
 const parse=s=>{const m=s.match(/rgba?\(([^)]+)\)/);if(!m)return null;const a=m[1].split(',').map(x=>parseFloat(x));return {rgb:a.slice(0,3),a:a.length>3?a[3]:1}};
 const lum=c=>{const [r,g,b]=c.map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});return 0.2126*r+0.7152*g+0.0722*b};
 const blend=(f,bg)=>f.rgb.map((v,k)=>v*f.a+bg[k]*(1-f.a));
 const bgOf=el=>{const layers=[];let e=el;while(e){const c=parse(getComputedStyle(e).backgroundColor);if(c&&c.a>0){layers.push(c);if(c.a>=1)break}e=e.parentElement}
  let base=[255,255,255];for(let i=layers.length-1;i>=0;i--)base=blend(layers[i],base);return base};
 let minFont=99,minFontEl='',min=99,minEl='';const off=[];
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 const seen=new Set();
 while(walker.nextNode()){const n=walker.currentNode;if(!n.textContent.trim())continue;const el=n.parentElement;if(!el||seen.has(el))continue;seen.add(el);
  const cs=getComputedStyle(el);if(cs.visibility==='hidden'||cs.display==='none')continue;const r=el.getBoundingClientRect();if(r.width===0||r.height===0)continue;
  if(el.closest('[disabled],.Mui-disabled,[aria-disabled=true],legend'))continue;
  // ignora texto fora da viewport recortada por overflow? mantém
  const fs=parseFloat(cs.fontSize);if(fs<minFont){minFont=fs;minFontEl=el.textContent.trim().slice(0,30)}
  const fg=parse(cs.color);if(!fg)continue;const bg=bgOf(el);const fgc=blend(fg,bg);
  const L1=lum(fgc),L2=lum(bg);const ratio=(Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
  const large=fs>=24||(fs>=18.66&&parseInt(cs.fontWeight)>=700);const need=large?3:4.5;
  if(ratio<min){min=ratio;minEl=el.textContent.trim().slice(0,30)}
  if(ratio<need)off.push(`${ratio.toFixed(2)} ${fs}px "${el.textContent.trim().slice(0,28)}"`)}
 return {minFont,minFontEl,min:+min.toFixed(2),minEl,off:[...new Set(off)].slice(0,8)}});
for(const mode of ['claro','escuro']){
 if(mode==='escuro')await p.click('[aria-label="Ativar modo escuro"]');
 let gMin=99,gFont=99,all=[];
 for(const pg of pages){await p.click(`.MuiDrawer-docked >> text=${pg}`);await p.waitForTimeout(450);const r=await audit();gMin=Math.min(gMin,r.min);gFont=Math.min(gFont,r.minFont);
  console.log(mode.padEnd(6),pg.padEnd(12),'fonte mín',r.minFont+'px','|contraste mín',r.min,`"${r.minEl}"`,r.off.length?'| ABAIXO: '+r.off.join(' ; '):'| ok')}
 console.log('  =>',mode,'menor fonte',gFont,'px; menor contraste',gMin.toFixed(2));
}
await b.close();})();
