#!/usr/bin/env node
'use strict';
// Auditoría reproducible: no inventa conexiones ni modifica la máscara.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'..');
// --mask=relative/path.json permite auditar una candidata sin desplegarla.
const maskArgument=process.argv.find(arg=>arg.startsWith('--mask='));
const maskPath=maskArgument?maskArgument.slice('--mask='.length):'juego/rutas-turquesa-160.json';
const absoluteMask=path.resolve(root,maskPath);
if(!absoluteMask.startsWith(root+path.sep))throw Error('La máscara debe estar dentro del repositorio');
const roads=JSON.parse(fs.readFileSync(absoluteMask,'utf8'));
const catalogue=JSON.parse(fs.readFileSync(path.join(root,'docs/catalogo-elementos-mapa-nuevo.json'),'utf8'));
const size=roads.resolution;
if(size!==160||roads.encoding!=='zlib-base64-bitset-msb')throw Error('Formato de máscara inesperado');
const raw=zlib.inflateSync(Buffer.from(roads.compressed,'base64'));
if(raw.length!==size*size/8)throw Error('Longitud incorrecta');
const mask=Uint8Array.from({length:size*size},(_,i)=>(raw[i>>3]>>(7-(i&7)))&1);
const total=mask.reduce((a,b)=>a+b,0);
if(total!==roads.road_cells)throw Error('Recuento de píxeles incompatible');
const component=new Int32Array(mask.length).fill(-1),groups=[];
const neighbors=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
for(let start=0;start<mask.length;start++){
 if(!mask[start]||component[start]>=0)continue;
 const id=groups.length,queue=[start],pixels=[],bbox=[size,size,0,0];
 component[start]=id;
 for(let k=0;k<queue.length;k++){
  const p=queue[k],x=p%size,y=(p/size)|0;pixels.push([x,y]);
  bbox[0]=Math.min(bbox[0],x);bbox[1]=Math.min(bbox[1],y);bbox[2]=Math.max(bbox[2],x);bbox[3]=Math.max(bbox[3],y);
  for(const [dx,dy] of neighbors){
   const nx=x+dx,ny=y+dy;
   if(nx<=0||ny<=0||nx>=size-1||ny>=size-1||!mask[ny*size+nx]||component[ny*size+nx]>=0)continue;
   if(dx&&dy&&(!mask[y*size+nx]||!mask[ny*size+x]))continue;
   component[ny*size+nx]=id;queue.push(ny*size+nx);
  }
 }
 groups.push({id,count:pixels.length,bbox,pixels});
}
function nearest(x,y){
 let best=null,d2=Infinity;
 for(let i=0;i<mask.length;i++)if(mask[i]){
  const xx=i%size,yy=(i/size)|0,d=(xx-x)**2+(yy-y)**2;
  if(d<d2){d2=d;best={cell:[xx,yy],component:component[i],distance_cells:Math.sqrt(d)}}
 }
 return best;
}
const sites=catalogue.items.map(site=>{
 const x=site.x_pct*size/100,y=site.y_pct*size/100;
 const closest=nearest(x,y);
 const group=closest?groups[closest.component]:null;
 const alternatives=groups.filter(g=>g.count>=50).map(g=>{
  let best=null,d2=Infinity;
  for(const [xx,yy] of g.pixels){
   const d=(xx-x)**2+(yy-y)**2;
   if(d<d2){d2=d;best=[xx,yy]}
  }
  return {component:g.id,component_size:g.count,cell:best,distance_cells:Math.sqrt(d2)};
 }).sort((a,b)=>a.distance_cells-b.distance_cells);
 // Evaluar accesibilidad REAL en la máscara, usando el mismo radio
 // euclídeo máximo de siteAccessPoint (14 celdas). No presupone que
 // una componente esté conectada con la posición inicial del héroe.
 const accessibleByComponent=[];
 for(const g of groups){
  if(g.count<2)continue;
  let best=null,d2=Infinity;
  for(const [xx,yy] of g.pixels){
   const d=(xx-x)**2+(yy-y)**2;
   if(d<=14*14&&d<d2){d2=d;best=[xx,yy]}
  }
  if(best)accessibleByComponent.push({component:g.id,component_size:g.count,cell:best,distance_cells:Math.sqrt(d2)});
 }
 accessibleByComponent.sort((a,b)=>a.distance_cells-b.distance_cells);
 const risks=[];
 if(accessibleByComponent.length===0)risks.push('NO_ENTRANCE_WITHIN_14');
 if(accessibleByComponent.length>1)risks.push('AMBIGUOUS_COMPONENT_ACCESS');
 if(group&&group.count===1)risks.push('NEAREST_IS_ISOLATED_PIXEL');
 if(group&&group.count<50)risks.push('SHORT_COMPONENT');
 if(closest&&closest.distance_cells>5)risks.push('FAR_FROM_ROAD');
 if(!closest)risks.push('NO_ROAD');
 return {id:site.id,kind:site.kind,game_id:site.game_id,center:[site.x,site.y],
  nearest:closest,nearest_component_size:group?group.count:0,
  major_component_candidate:alternatives[0]||null,
  accessible_components_within_14:accessibleByComponent,risks,
  status:'ACCESS_NOT_VISUALLY_VERIFIED'};
});
// El castillo inicial es la referencia de conectividad del reino.
// La máscara puede tener varias entradas candidatas; NO se asume una
// conexión que no exista en el dibujo original.
const home=sites.find(s=>s.game_id==='home');
if(!home)throw Error('No se encontró el castillo inicial');
const homeComponents=new Set(home.accessible_components_within_14.map(e=>e.component));
for(const site of sites){
 site.shared_components_with_home=site.accessible_components_within_14.filter(e=>homeComponents.has(e.component)).map(e=>e.component);
 if(site.id!==home.id&&site.shared_components_with_home.length===0)
  site.risks.push('NO_SHARED_COMPONENT_WITH_HOME');
}
const gaps=[];
for(let a=0;a<groups.length;a++)for(let b=a+1;b<groups.length;b++){
 let best=null,d2=Infinity;
 for(const [x,y] of groups[a].pixels)for(const [xx,yy] of groups[b].pixels){
  const d=(x-xx)**2+(y-yy)**2;
  if(d<d2){d2=d;best=[[x,y],[xx,yy]]}
 }
 gaps.push({components:[a,b],minimum_gap_cells:Math.sqrt(d2),endpoints:best,approved_connection:false});
}
const result={mask_file:maskPath,source:roads.source,resolution:size,road_cells:total,declared_components:roads.connected_components,actual_components:groups.length,components:groups.map(({id,count,bbox})=>({id,count,bbox})),gaps,sites};
if(sites.length!==44)throw Error('Catálogo incorrecto: se esperaban 44 elementos y hay '+sites.length);
if(groups.length!==roads.connected_components){
 console.error('AVISO: la máscara declara '+roads.connected_components+' componentes, pero el algoritmo de navegación detecta '+groups.length+'. Revisar topología; no se crean conexiones.');
}
if(process.argv.includes('--json'))console.log(JSON.stringify(result,null,2));
else{
 console.log('Celdas:',total,'Componentes:',groups.length,'Elementos:',sites.length);
 console.table(result.components);
 console.table(gaps.map(x=>({pair:x.components.join('-'),distance:x.minimum_gap_cells.toFixed(2),endpoints:JSON.stringify(x.endpoints)})));
 console.table(sites.map(x=>({id:x.id,kind:x.kind,component:x.nearest.component,distance:x.nearest.distance_cells.toFixed(2)})));
}
