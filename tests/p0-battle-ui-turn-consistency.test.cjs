'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 test(page+': battle interface matches selectable stacks and battle context',()=>{
  assert.match(html,/Puedes elegir otra unidad pendiente/);
  assert.match(html,/battle\.enemyStacks\?'☠ Ejército enemigo · final de ronda':'☠ Guardianes · final de ronda'/);
  for(const type of ['soldier','archer','griffin','dragon'])
   assert.ok(html.includes("$('unit-"+type+"').disabled=!!battle.moving||!battleUnitReady("));
 });
}
