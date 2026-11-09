'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 test(page+': initiative derives from speed and uses stable tie breaking',()=>{
  const begin=html.indexOf('function battleSpeed(type)'),end=html.indexOf('function battleUnitReady(type)',begin);
  assert.ok(begin>=0&&end>begin);
  const ctx={s:{griffins:1,dragons:1,archers:1,soldiers:1},battle:{acted:[]},battleCount:type=>ctx.s[type]};
  vm.createContext(ctx);vm.runInContext(html.slice(begin,end),ctx);
  assert.deepEqual(Array.from(ctx.battleInitiativeOrder()),['griffins','dragons','archers','soldiers']);
  assert.equal(ctx.battleNextUnit(),'griffins');
  ctx.battle.acted.push('griffins');
  assert.equal(ctx.battleNextUnit(),'dragons');
  ctx.s.dragons=0;
  assert.equal(ctx.battleNextUnit(),'archers');
 });
}
