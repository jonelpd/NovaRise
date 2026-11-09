'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 test(page+': enemy turn completes even when all allied stacks are gone',()=>{
  const begin=html.indexOf('function enemyAdvance(onComplete)'),end=html.indexOf('function tacticalMove(x,y)',begin);
  assert.ok(begin>=0&&end>begin);
  const source=html.slice(begin,end);
  assert.match(source,/if\(!targets\.length\)\{if\(onComplete\)onComplete\(\);return;\}/);
  const ctx={battle:{enemyStacks:null},s:{soldiers:0,archers:0,griffins:0,dragons:0},battleCount:()=>0,pos:()=>[0,0]};
  vm.createContext(ctx);vm.runInContext(source,ctx);
  let calls=0;ctx.enemyAdvance(()=>calls++);
  assert.equal(calls,1);
 });
}
