'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'..','juego','index.html'),'utf8');
const start=html.indexOf('function applySecondarySiegeOutcome(');
const end=html.indexOf('function rivalCastleConquest(siteId){',start);
assert.ok(start>=0&&end>start);
const snippet=html.slice(start,end);
function fixture(){
 const h={soldiers:6,archers:2,active:true,defeated:false,recovery:0};
 const g={defenders:{soldiers:4,archers:3,griffins:1,dragons:0}};
 const owners={'fort-center':'player'};
 const draft={commanderId:'fort-west',castleId:'fort-center',enemyArmyBefore:{soldiers:6,archers:2},defenseBefore:{soldiers:4,archers:3,griffins:1,dragons:0}};
 const context={secondarySiegeEligibility:()=>({commanderId:'fort-west',castleId:'fort-center'}),enemyCastleHeroes:()=>({'fort-west':h}),siteGarrison:()=>g,verifiedSiteState:()=>owners};
 vm.createContext(context);vm.runInContext(snippet,context);
 return {h,g,owners,draft,apply:result=>context.applySecondarySiegeOutcome(draft,result)};
}
const empty={soldiers:0,archers:0,griffins:0,dragons:0};
test('secondary siege attacker victory captures only target castle',()=>{
 const f=fixture();assert.equal(f.apply({winner:'attacker',attackers:{soldiers:3,archers:1},defenders:empty}),true);
 assert.equal(f.owners['fort-center'],'rival');assert.equal(f.h.soldiers,3);assert.equal(f.g.defenders.archers,0);
});
test('secondary siege defender victory defeats only attacking commander',()=>{
 const f=fixture();assert.equal(f.apply({winner:'defender',attackers:{soldiers:0,archers:0},defenders:{soldiers:2,archers:1,griffins:1,dragons:0}}),true);
 assert.equal(f.owners['fort-center'],'player');assert.equal(f.h.defeated,true);assert.equal(f.h.active,false);
});
test('secondary siege rejects stale draft without mutating',()=>{
 const f=fixture();f.h.soldiers=5;
 assert.equal(f.apply({winner:'attacker',attackers:{soldiers:3,archers:1},defenders:empty}),false);
 assert.equal(f.owners['fort-center'],'player');assert.equal(f.g.defenders.soldiers,4);
});
test('secondary siege rejects invalid casualties atomically',()=>{
 const f=fixture();assert.equal(f.apply({winner:'attacker',attackers:{soldiers:7,archers:1},defenders:empty}),false);
 assert.equal(f.h.soldiers,6);assert.equal(f.owners['fort-center'],'player');
 assert.equal(f.apply({winner:'attacker',attackers:{soldiers:2,archers:1},defenders:{soldiers:1,archers:0,griffins:0,dragons:0}}),false);
 assert.equal(f.g.defenders.soldiers,4);
});
test('secondary siege cannot apply invalid outcome',()=>{
 const f=fixture();assert.equal(f.apply({winner:'unknown',attackers:{soldiers:1,archers:0},defenders:empty}),false);
});
