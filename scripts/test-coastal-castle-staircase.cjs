#!/usr/bin/env node
'use strict';
// Verifica sobre la máscara publicada que el ramal costero realmente
// existe y está unido a una red transitable sin cortes diagonales.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const root=path.join(__dirname,'..');
const mask=JSON.parse(fs.readFileSync(path.join(root,'juego/rutas-turquesa-160.json'),'utf8'));
const proposal=JSON.parse(fs.readFileSync(path.join(root,'docs/ramal-castillo-costero-propuesta-2026-11-16.json'),'utf8'));
const raw=zlib.inflateSync(Buffer.from(mask.compressed,'base64'));
assert.equal(raw.length,3200);
const road=(x,y)=>x>0&&y>0&&x<159&&y<159&&!!((raw[(y*160+x)>>3]>>(7-((y*160+x)&7)))&1);
const cell=([x,y])=>[Math.floor(x/1254*160),Math.floor(y/1254*160)];
const start=cell(proposal.polyline_px[0]),end=cell(proposal.polyline_px.at(-1));
assert.ok(road(...start),'El anclaje del ramal no está sobre la máscara');
assert.ok(road(...end),'La escalinata no tiene celda de camino');
const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
const seen=new Set([start.join(',')]),queue=[start];
for(let i=0;i<queue.length;i++){
 const [x,y]=queue[i];
 for(const [dx,dy] of dirs){
  const nx=x+dx,ny=y+dy,key=nx+','+ny;
  if(seen.has(key)||!road(nx,ny))continue;
  if(dx&&dy&&(!road(x+dx,y)||!road(x,y+dy)))continue;
  seen.add(key);queue.push([nx,ny]);
 }
}
assert.ok(seen.has(end.join(',')),'La escalinata está separada del anclaje según la regla antiesquinas');
assert.ok(queue.length>=10,'El ramal está conectado solo a un fragmento pequeño');
console.log('OK: ramal costero '+start.join(',')+' -> '+end.join(',')+' conectado a '+queue.length+' celdas transitables.');
