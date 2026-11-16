#!/usr/bin/env node
'use strict';
// Una sola prueba definitiva de las siete puertas principales.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const mask=JSON.parse(fs.readFileSync(path.join(root,'juego/rutas-turquesa-160.json'),'utf8'));
const html=fs.readFileSync(path.join(root,'juego/index.html'),'utf8');
const raw=zlib.inflateSync(Buffer.from(mask.compressed,'base64'));
assert.equal(mask.version,1);assert.equal(raw.length,3200);
const road=(x,y)=>x>0&&y>0&&x<159&&y<159&&!!(raw[(y*160+x)>>3]&(128>>((y*160+x)&7)));
const source=html.match(/const CASTLE_MAIN_GATE_CELLS=Object\.freeze\(\{([\s\S]*?)\}\);/);
assert.ok(source,'Falta catálogo de puertas principales');
const gates={};
for(const [,id,x,y] of source[1].matchAll(/'([^']+)'\s*:\s*\[(\d+),(\d+)\]/g))gates[id]=[Number(x),Number(y)];
assert.equal(Object.keys(gates).length,7);
assert.ok(html.includes('const castleGate=CASTLE_MAIN_GATE_CELLS[site.id]'),'La interacción no utiliza la puerta principal');
assert.deepEqual(gates,mask.castle_gate_cells,'Las puertas del juego y la máscara no coinciden');
const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
const components=new Int16Array(25600).fill(-1),sizes=[];
for(let i=0;i<25600;i++){
 const sx=i%160,sy=Math.floor(i/160);
 if(!road(sx,sy)||components[i]>=0)continue;
 const id=sizes.length,q=[i];components[i]=id;
 for(let j=0;j<q.length;j++){
  const p=q[j],x=p%160,y=Math.floor(p/160);
  for(const [dx,dy] of dirs){
   const nx=x+dx,ny=y+dy,ni=ny*160+nx;
   if(!road(nx,ny)||components[ni]>=0)continue;
   if(dx&&dy&&(!road(x+dx,y)||!road(x,y+dy)))continue;
   components[ni]=id;q.push(ni);
  }
 }
 sizes.push(q.length);
}
for(const [id,[x,y]] of Object.entries(gates)){
 assert.ok(road(x,y),id+': la puerta no tiene camino');
 const component=components[y*160+x];
 assert.ok(sizes[component]>=100,id+': puerta aislada de la red principal ('+sizes[component]+' celdas)');
 console.log('OK '+id+': puerta ('+x+','+y+'), red de '+sizes[component]+' celdas');
}
assert.equal([...raw].reduce((n,v)=>n+v.toString(2).replace(/0/g,'').length,0),mask.road_cells);
console.log('OK: siete puertas vinculadas al juego, máscara '+mask.road_cells+' celdas.');
