'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 test(page+': defeat immediately renders and persists final state',()=>{
  const begin=html.indexOf('function loseBattle(){');
  const end=html.indexOf('function hitResolveVictory(){',begin);
  assert(begin>=0&&end>begin);
  const state={soldiers:0,archers:0,griffins:0,dragons:0};
  let renderCount=0;
  const ctx={s:state,battle:{rival:false},$:()=>({hidden:false}),message:()=>{},
   render:()=>{renderCount++},finishDefensiveSiege:()=>{throw Error('not defensive')}};
  vm.createContext(ctx);vm.runInContext(html.slice(begin,end),ctx);
  ctx.loseBattle();
  assert.equal(ctx.battle,null);
  assert.equal(renderCount,1);
 });
 test(page+': independent castle conquest renders final ownership',()=>{
  const begin=html.indexOf('function hitResolveVictory(){');
  const end=html.indexOf('function ',begin+10);
  assert(begin>=0&&end>begin);
  const state={moves:4,gold:200,verifiedSites:{'fort-west':'neutral'}};
  let renderCount=0;
  const ctx={s:state,battle:{siteId:'fort-west',siteLabel:'Fort West'},
   verifiedSiteState:()=>state.verifiedSites,siteGarrison:()=>({}),awardHeroExperience:()=>'',message:()=>{},
   $:()=>({hidden:false}),render:()=>{renderCount++}};
  vm.createContext(ctx);vm.runInContext(html.slice(begin,end),ctx);
  ctx.hitResolveVictory();
  assert.equal(state.verifiedSites['fort-west'],'player');
  assert.equal(state.gold,300);
  assert.equal(ctx.battle,null);
  assert.equal(renderCount,1);
 });
}
