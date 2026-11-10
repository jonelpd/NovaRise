'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'..','juego','index.html'),'utf8');
const start=html.indexOf('function applySecondarySiegeRetreat(');
const end=html.indexOf('function applySecondarySiegeOutcome(',start);
assert.ok(start>=0&&end>start);
const snippet=html.slice(start,end);
function fixture(){
 const h={soldiers:8,archers:3,turns:4,active:true,defeated:false};
 const g={defenders:{soldiers:5,archers:2,griffins:1,dragons:0}};
 const owners={'fort-center':'player'};
 const draft={commanderId:'fort-west',castleId:'fort-center',enemyArmyBefore:{soldiers:8,archers:3},defenseBefore:{soldiers:5,archers:2,griffins:1,dragons:0}};
 const ctx={secondarySiegeEligibility:()=>({commanderId:'fort-west',castleId:'fort-center'}),enemyCastleHeroes:()=>({'fort-west':h}),siteGarrison:()=>g,verifiedSiteState:()=>owners};
 vm.createContext(ctx);vm.runInContext(snippet,ctx);
 return {h,g,owners,draft,apply:r=>ctx.applySecondarySiegeRetreat(draft,r)};
}
const retreat=()=>({winner:'retreat',attackers:{soldiers:6,archers:2},defenders:{soldiers:3,archers:1,griffins:1,dragons:0}});
test('retreat preserves castle ownership and surviving armies',()=>{
 const f=fixture();assert.equal(f.apply(retreat()),true);
 assert.equal(f.owners['fort-center'],'player');assert.equal(f.h.soldiers,6);
 assert.equal(f.g.defenders.soldiers,3);assert.equal(f.h.defeated,false);
});
test('retreat cannot apply twice during same turn',()=>{
 const f=fixture();assert.equal(f.apply(retreat()),true);assert.equal(f.apply(retreat()),false);
});
test('retreat refuses stale troop counts without side effects',()=>{
 const f=fixture();f.h.soldiers=7;
 assert.equal(f.apply(retreat()),false);assert.equal(f.g.defenders.soldiers,5);
});
test('retreat rejects invalid casualties and false victory',()=>{
 const f=fixture();const r=retreat();r.attackers.soldiers=9;
 assert.equal(f.apply(r),false);assert.equal(f.h.soldiers,8);
 assert.equal(f.apply({winner:'attacker',attackers:{soldiers:4,archers:2},defenders:r.defenders}),false);
});
test('retreat requires survivors on both sides',()=>{
 const f=fixture();const r=retreat();r.attackers.soldiers=0;r.attackers.archers=0;
 assert.equal(f.apply(r),false);
 const s=retreat();s.defenders={soldiers:0,archers:0,griffins:0,dragons:0};
 assert.equal(f.apply(s),false);
});
