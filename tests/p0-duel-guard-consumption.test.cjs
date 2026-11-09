'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 test(page+': guarding a stack absorbs one enemy hero attack and is consumed',()=>{
  const begin=html.indexOf('function duelEnemyTurn(done)'),end=html.indexOf('function battleCount(type)',begin);
  assert.ok(begin>=0&&end>begin);
  const code=html.slice(begin,end);
  assert.match(code,/const guarded=current\.guarding\?\.includes\(nearest\.type\)/);
  assert.match(code,/const losses=guarded\?0:/);
  assert.match(code,/if\(guarded\)current\.guarding\.splice\(current\.guarding\.indexOf\(nearest\.type\),1\)/);
 });
}
