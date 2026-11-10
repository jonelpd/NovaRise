'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'..','juego','index.html'),'utf8');
const a=html.indexOf('async function promptSecondarySiegeDefense('),b=html.indexOf('function simulateSecondarySiege(',a);
assert.ok(a>=0&&b>a);
function fixture(confirm=true){
 const s={pendingSecondarySiege:{commanderId:'fort-west',castleId:'fort-center',turn:2}};
 const hero={turns:2,lastSecondarySiege:''};
 const calls={apply:0,render:0};
 const draft={commanderId:'fort-west',castleId:'fort-center'};
 const ctx={s,battle:null,rivalBusy:false,CASTLE_PROFILES:{'fort-center':{name:'Fortaleza Central'}},recoverSecondarySiegeDecision:()=>draft,realmConfirm:async()=>confirm,simulateSecondarySiege:()=>({winner:'attacker',attackers:{},defenders:{}}),applySecondarySiegeOutcome:()=>{calls.apply++;return true},applySecondarySiegeRetreat:()=>false,enemyCastleHeroes:()=>({'fort-west':hero}),message:()=>{},render:()=>{calls.render++}};
 vm.createContext(ctx);vm.runInContext(html.slice(a,b),ctx);
 return {ctx,s,hero,calls,run:()=>ctx.promptSecondarySiegeDefense()};
}
test('secondary siege prompt applies automatic resolution only on confirmation',async()=>{
 const f=fixture();assert.equal(await f.run(),true);assert.equal(f.calls.apply,1);
 assert.equal(f.s.pendingSecondarySiege,null);assert.equal(f.hero.lastSecondarySiege,'fort-west:fort-center:2');
});
test('secondary siege prompt keeps troops untouched on defensive hold',async()=>{
 const f=fixture(false);assert.equal(await f.run(),true);assert.equal(f.calls.apply,0);assert.equal(f.s.pendingSecondarySiege,null);assert.equal(f.hero.lastSecondarySiege,'fort-west:fort-center:2');
});
test('secondary siege prompt refuses an active battle',async()=>{
 const f=fixture();f.ctx.battle={};assert.equal(await f.run(),false);assert.equal(f.calls.apply,0);
});
test('secondary siege prompt refuses stale decision after asynchronous confirmation',async()=>{
 const f=fixture();f.ctx.realmConfirm=async()=>{f.s.pendingSecondarySiege={commanderId:'other'};return true};
 assert.equal(await f.run(),false);assert.equal(f.calls.apply,0);
});
