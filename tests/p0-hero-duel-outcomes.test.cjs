'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 const begin=html.indexOf('function loseBattle()'),end=html.indexOf('function battleAttackDamage(type)',begin);
 test(page+': hero duel defeat keeps enemy survivors and allied casualties',()=>{
  assert.ok(begin>=0&&end>begin);
  const rival={soldiers:20,archers:10,defeated:false};
  const s={soldiers:0,archers:2,griffins:0,dragons:0,gold:50};
  const ctx={s,battle:{rival:true,enemyStacks:[{id:'soldiers',count:7},{id:'archers',count:3}]},rivalState:()=>rival,$:()=>({set hidden(x){}}),message:()=>{},render:()=>{}};
  vm.createContext(ctx);vm.runInContext(html.slice(begin,end),ctx);
  ctx.loseBattle();
  assert.equal(rival.soldiers,7);assert.equal(rival.archers,3);
  assert.equal(s.soldiers,0);assert.equal(s.archers,2);
  assert.equal(s.gold,50);assert.equal(ctx.battle,null);
 });
 test(page+': hero duel victory rewards once and clears enemy army',()=>{
  const rival={soldiers:7,archers:3,gold:120,defeated:false,recovery:2};
  const s={soldiers:4,archers:2,griffins:0,dragons:0,gold:50,experience:0};
  let renders=0;
  const ctx={s,battle:{rival:true},rivalState:()=>rival,$:()=>({set hidden(x){}}),render:()=>renders++,awardHeroExperience:n=>{s.experience+=n;return ''}};
  vm.createContext(ctx);vm.runInContext(html.slice(begin,end),ctx);
  ctx.hitResolveVictory();ctx.hitResolveVictory();
  assert.equal(rival.defeated,true);assert.equal(rival.soldiers,0);assert.equal(rival.archers,0);
  assert.equal(s.gold,170);assert.equal(s.experience,80);assert.equal(renders,1);
  assert.equal(ctx.battle,null);
 });
}
