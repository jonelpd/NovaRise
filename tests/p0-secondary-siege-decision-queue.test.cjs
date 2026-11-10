'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'..','juego','index.html'),'utf8');
const start=html.indexOf('function queueSecondarySiegeDecision(');
const end=html.indexOf('function simulateSecondarySiege(',start);
assert.ok(start>=0&&end>start);
const source=html.slice(start,end);
function fixture(){
 const hero={turns:7,soldiers:8,archers:2,lastSiegeRetreat:''};
 const garrison={soldiers:3,archers:1,griffins:0,dragons:0};
 const state={pendingDefensiveSiege:null,pendingSecondarySiege:null};
 const draft=()=>({commanderId:'fort-west',castleId:'fort-center',enemyArmyBefore:{soldiers:hero.soldiers,archers:hero.archers},defenseBefore:{...garrison}});
 const ctx={s:state,battle:null,secondarySiegeBattleDraft:draft,enemyCastleHeroes:()=>({'fort-west':hero})};
 vm.createContext(ctx);vm.runInContext(source,ctx);
 return {ctx,state,hero,garrison,queue:()=>ctx.queueSecondarySiegeDecision('fort-west','fort-center'),recover:()=>ctx.recoverSecondarySiegeDecision()};
}
test('secondary siege decision queues one independent snapshot',()=>{
 const f=fixture();assert.equal(f.queue(),true);assert.equal(f.queue(),false);
 assert.equal(f.state.pendingSecondarySiege.turn,7);
 assert.equal(f.recover().attackers,undefined);
 assert.equal(f.recover().enemyArmyBefore.soldiers,8);
});
test('secondary siege decision survives JSON save and reload',()=>{
 const f=fixture();f.queue();f.state.pendingSecondarySiege=JSON.parse(JSON.stringify(f.state.pendingSecondarySiege));
 assert.ok(f.recover());assert.equal(f.state.pendingSecondarySiege.castleId,'fort-center');
});
test('secondary siege decision rejects stale army and clears pending state',()=>{
 const f=fixture();f.queue();f.hero.soldiers=7;
 assert.equal(f.recover(),null);assert.equal(f.state.pendingSecondarySiege,null);
});
test('secondary siege decision does not overlap main siege or battle',()=>{
 const f=fixture();f.state.pendingDefensiveSiege='fort-east';
 assert.equal(f.queue(),false);f.state.pendingDefensiveSiege=null;
 f.ctx.battle={};assert.equal(f.queue(),false);
});
test('secondary siege decision respects previous retreat on same turn',()=>{
 const f=fixture();f.hero.lastSiegeRetreat='fort-west:fort-center:7';
 assert.equal(f.queue(),false);assert.equal(f.state.pendingSecondarySiege,null);
});
