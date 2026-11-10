'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'..','juego','index.html'),'utf8');
const heroStart=html.indexOf('function enemyCastleHeroes(){');
const heroEnd=html.indexOf('function drawEnemyCastleHeroes(',heroStart);
const retreatStart=html.indexOf('function applySecondarySiegeRetreat(');
const retreatEnd=html.indexOf('function applySecondarySiegeOutcome(',retreatStart);
assert.ok(heroStart>=0&&heroEnd>heroStart&&retreatStart>=0&&retreatEnd>retreatStart);
const heroSource=html.slice(heroStart,heroEnd),retreatSource=html.slice(retreatStart,retreatEnd);
function setup(saved){
 const state=JSON.parse(JSON.stringify(saved));
 const sites=[{id:'fort-west',kind:'fort',x:20,y:20},{id:'fort-center',kind:'fort',x:30,y:30}];
 const owners={'fort-west':'rival','fort-center':'player'};
 const ctx={s:state,VERIFIED_MAP_SITES:sites,verifiedSiteState:()=>owners,CASTLE_PROFILES:{'fort-west':{guard:{soldiers:8,archers:2}}},safeHeroPoint:(x,y)=>[x,y],siteGarrison:()=>state.garrison,Math,Number,Object};
 vm.createContext(ctx);vm.runInContext(heroSource+retreatSource,ctx);
 ctx.secondarySiegeEligibility=()=>({commanderId:'fort-west',castleId:'fort-center'});
 return {ctx,state,owners};
}
const base=()=>({enemyCastleHeroes:{'fort-west':{castleId:'fort-west',x:30,y:30,soldiers:8,archers:3,gold:0,turns:4,recovery:0,active:true,defeated:false}},garrison:{defenders:{soldiers:5,archers:2,griffins:1,dragons:0}}});
const draft={commanderId:'fort-west',castleId:'fort-center',enemyArmyBefore:{soldiers:8,archers:3},defenseBefore:{soldiers:5,archers:2,griffins:1,dragons:0}};
const outcome={winner:'retreat',attackers:{soldiers:6,archers:2},defenders:{soldiers:3,archers:1,griffins:1,dragons:0}};
test('secondary retreat survives save/load and blocks duplicate application',()=>{
 const a=setup(base());assert.equal(a.ctx.applySecondarySiegeRetreat(draft,outcome),true);
 const restored=setup(JSON.parse(JSON.stringify(a.state)));
 const h=restored.ctx.enemyCastleHeroes()['fort-west'];
 assert.equal(h.soldiers,6);assert.equal(h.archers,2);
 assert.equal(restored.state.garrison.defenders.soldiers,3);
 assert.equal(h.lastSiegeRetreat,'fort-west:fort-center:4');
 assert.equal(restored.ctx.applySecondarySiegeRetreat(draft,outcome),false);
 assert.equal(restored.owners['fort-center'],'player');
});
test('old saves without retreat stamp remain compatible',()=>{
 const a=setup(base());const h=a.ctx.enemyCastleHeroes()['fort-west'];
 assert.equal(h.lastSiegeRetreat,'');assert.equal(h.soldiers,8);
});
test('invalid retreat stamp is normalized without losing army',()=>{
 const saved=base();saved.enemyCastleHeroes['fort-west'].lastSiegeRetreat={bad:true};
 const a=setup(saved);const h=a.ctx.enemyCastleHeroes()['fort-west'];
 assert.equal(h.lastSiegeRetreat,'');assert.equal(h.archers,3);
});

test('secondary siege decision stamp survives JSON reload',()=>{
 const saved=base();saved.enemyCastleHeroes['fort-west'].lastSecondarySiege='fort-west:fort-center:4';
 const a=setup(JSON.parse(JSON.stringify(saved)));
 const h=a.ctx.enemyCastleHeroes()['fort-west'];
 assert.equal(h.lastSecondarySiege,'fort-west:fort-center:4');
 assert.equal(h.soldiers,8);assert.equal(h.archers,3);
});
test('invalid secondary siege stamp is normalized without altering troops',()=>{
 const saved=base();saved.enemyCastleHeroes['fort-west'].lastSecondarySiege={bad:true};
 const a=setup(saved);const h=a.ctx.enemyCastleHeroes()['fort-west'];
 assert.equal(h.lastSecondarySiege,'');assert.equal(h.soldiers,8);
});
