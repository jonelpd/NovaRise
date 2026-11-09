'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 test(page+': defend command does not stack duplicate guard entries',()=>{
  assert.match(html,/if\(defend\)\{if\(!Array\.isArray\(battle\.guarding\)\)battle\.guarding=\[\];if\(!battle\.guarding\.includes\(battle\.selected\)\)battle\.guarding\.push\(battle\.selected\);\}/);
  assert.match(html,/function consumeBattleGuard\(type\)/);
 });
}
