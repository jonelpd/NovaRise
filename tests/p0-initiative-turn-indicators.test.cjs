'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 test(page+': initiative display reflects freely selectable ready stacks',()=>{
  const begin=html.indexOf('function renderBattleInitiative()'),end=html.indexOf('function duelEnemies()',begin);
  assert.ok(begin>=0&&end>begin);
  const src=html.slice(begin,end);
  assert.match(src,/for\(const type of battleInitiativeOrder\(\)\)/);
  assert.match(src,/current\?' · Seleccionada':pending\.includes\(type\)\?' · Disponible'/);
  assert.match(src,/Disponible para seleccionar · velocidad/);
  assert.doesNotMatch(src,/Siguiente turno| · Después/);
 });
}
