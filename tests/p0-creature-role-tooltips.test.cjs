'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 test(page+': tactical tooltips describe existing unit roles',()=>{
  for(const role of ['Soldados · primera línea · alcance 1 · movimiento 1','Arqueros · distancia 2–3 · movimiento 1 · sin disparo adyacente','Grifos · movilidad 3 · contraataque · alcance 1','Dragones · daño elevado · alcance 2 · movimiento 2'])assert.ok(html.includes(role),role);
  assert.match(html,/function battleRange\(type\)\{return type==='archers'\?3:type==='dragons'\?2:1\}/);
  assert.match(html,/function battleSpeed\(type\)\{return type==='griffins'\?3:type==='dragons'\?2:1\}/);
 });
}
