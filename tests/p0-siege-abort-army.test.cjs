'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 test(page+': aborted defensive battle restores hero troops before closing',()=>{
  const start=html.indexOf('if(s.soldiers+s.archers+s.griffins+s.dragons===0){if(battle&&battle.defenseSiteId)');
  const end=html.indexOf(' clearAdventureRoute();',start);
  assert(start>=0&&end>start);
  const code=html.slice(start,end);
  const s={soldiers:0,archers:0,griffins:0,dragons:0};
  const garrison={defenders:{soldiers:0,archers:0,griffins:0,dragons:0}};
  const ctx={s,battle:{defenseSiteId:'fort-west',heroArmyBefore:{soldiers:21,archers:7,griffins:2,dragons:1}},CASTLE_RECRUIT_COST:{soldiers:1,archers:1,griffins:1,dragons:1},message:()=>{},garrison};
  vm.createContext(ctx);
  vm.runInContext('(function(){'+code+'})()',ctx);
  assert.equal(ctx.battle,null);
  assert.deepEqual([s.soldiers,s.archers,s.griffins,s.dragons],[21,7,2,1]);
  assert.equal(garrison.defenders.soldiers,0);
 });
 test(page+': normal empty-army battle still cancels without fabricating troops',()=>{
  const start=html.indexOf('if(s.soldiers+s.archers+s.griffins+s.dragons===0){if(battle&&battle.defenseSiteId)');
  const end=html.indexOf(' clearAdventureRoute();',start);
  assert(start>=0&&end>start);
  const s={soldiers:0,archers:0,griffins:0,dragons:0};
  const ctx={s,battle:{k:'neutral'},CASTLE_RECRUIT_COST:{soldiers:1,archers:1,griffins:1,dragons:1},message:()=>{}};
  vm.createContext(ctx);
  vm.runInContext('(function(){'+html.slice(start,end)+'})()',ctx);
  assert.equal(ctx.battle,null);
  assert.equal(s.soldiers,0);
 });
}
