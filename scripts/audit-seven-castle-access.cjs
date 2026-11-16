#!/usr/bin/env node
'use strict';
// Informe de los siete castillos usando la máscara REAL desplegada.
// No confundir cercanía geométrica con una puerta visualmente aprobada.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const mask=JSON.parse(fs.readFileSync(path.join(root,'juego/rutas-turquesa-160.json'),'utf8'));
const sites=JSON.parse(fs.readFileSync(path.join(root,'docs/catalogo-elementos-mapa-nuevo.json'),'utf8')).items.filter(x=>x.kind==='castle');
assert.equal(sites.length,7,'El catálogo debe tener siete castillos');
const raw=zlib.inflateSync(Buffer.from(mask.compressed,'base64'));
assert.equal(raw.length,3200);
const free=(x,y)=>x>0&&y>0&&x<159&&y<159&&!!(raw[(y*160+x)>>3]&(1<<(7-((y*160+x)&7))));
const labels=new Int16Array(25600).fill(-1),sizes=[];
const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
for(let p=0;p<25600;p++){
 const sx=p%160,sy=Math.floor(p/160);
 if(labels[p]>=0||!free(sx,sy))continue;
 const id=sizes.length,q=[p];labels[p]=id;
 for(let k=0;k<q.length;k++){
  const v=q[k],x=v%160,y=Math.floor(v/160);
  for(const [dx,dy] of dirs){
   const nx=x+dx,ny=y+dy,ni=ny*160+nx;
   if(!free(nx,ny)||labels[ni]>=0)continue;
   if(dx&&dy&&(!free(x+dx,y)||!free(x,y+dy)))continue;
   labels[ni]=id;q.push(ni);
  }
 }
 sizes.push(q.length);
}
const pxToCell=(v)=>Math.floor(v/1254*160);
function entrances(site){
 const cx=pxToCell(site.x),cy=pxToCell(site.y),byComponent=new Map();
 for(let dy=-14;dy<=14;dy++)for(let dx=-14;dx<=14;dx++){
  const x=cx+dx,y=cy+dy,d=dx*dx+dy*dy;
  if(d>196||!free(x,y))continue;
  const id=labels[y*160+x],prior=byComponent.get(id);
  if(!prior||d<prior.d2)byComponent.set(id,{component:id,size:sizes[id],cell:[x,y],d2:d});
 }
 return [...byComponent.values()].sort((a,b)=>a.d2-b.d2).map(({d2,...v})=>({...v,distance_cells:Math.sqrt(d2)}));
}
const home=sites.find(x=>x.game_id==='home');
assert.ok(home,'No existe castillo inicial');
const homeEntries=entrances(home);
// La posición de referencia del castillo inicial es su escalinata,
// no todas las componentes que casualmente pasan cerca del círculo rojo.
const staircase=[Math.floor(309/1254*160),Math.floor(177/1254*160)];
const approach=[Math.floor(321/1254*160),Math.floor(196/1254*160)];
assert.ok(free(...staircase)&&free(...approach),'El ramal costero debe estar en la máscara');
const homeStairComponent=labels[staircase[1]*160+staircase[0]];
assert.equal(homeStairComponent,labels[approach[1]*160+approach[0]],'La escalinata no está conectada con el anclaje');
assert.ok(sizes[homeStairComponent]>=10,'El ramal está aislado');
assert.ok(homeEntries.some(x=>x.component===homeStairComponent),'La escalinata no está dentro del radio de acceso al castillo inicial');
const homeComponents=new Set([homeStairComponent]);
// Identificar el corte geométrico mínimo entre redes, sin crear puentes.
const componentPixels=sizes.map(()=>[]);
for(let p=0;p<labels.length;p++)if(labels[p]>=0)componentPixels[labels[p]].push([p%160,Math.floor(p/160)]);
function nearestGapToHome(id){
 if(id===homeStairComponent)return {distance_cells:0,from:null,to:null};
 let best=Infinity,from=null,to=null;
 const origin=componentPixels[homeStairComponent],target=componentPixels[id];
 for(const [x,y] of origin)for(const [u,v] of target){
  const d=(x-u)**2+(y-v)**2;
  if(d<best){best=d;from=[x,y];to=[u,v]}
 }
 return {distance_cells:Math.sqrt(best),from,to};
}
const report=sites.map(site=>{
 const candidates=entrances(site);
 return {id:site.id,center_px:[site.x,site.y],candidates,
  shared_with_home:candidates.filter(x=>homeComponents.has(x.component)).map(x=>x.component),
  nearest_separate_network_gap:candidates.filter(x=>!homeComponents.has(x.component))
    .map(x=>({component:x.component,...nearestGapToHome(x.component)}))
    .sort((a,b)=>a.distance_cells-b.distance_cells)[0]||null,
  status:candidates.length===0?'NO_ENTRANCE_WITHIN_14':candidates.some(x=>homeComponents.has(x.component))?'GEOMETRICALLY_CONNECTED_TO_HOME':'SEPARATE_NETWORK',
  visual_gate_verified:false};
});
const result={mask_source:mask.source,road_cells:mask.road_cells,components:sizes.length,home_components:[...homeComponents],coastal_staircase_component:homeStairComponent,castles:report};
const output=path.join(root,'castle-access-audit.json');
fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
console.table(report.map(x=>({castle:x.id,status:x.status,networks:x.candidates.length,shared:x.shared_with_home.join(',')||'none'})));
console.log('Diagnóstico guardado en castle-access-audit.json. Ninguna puerta se considera visualmente aprobada.');
