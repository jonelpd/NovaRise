'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'..','juego','index.html'),'utf8');
const a=html.indexOf('function checkpointSecondarySiegeBeforeBattle('),b=html.indexOf('function finishDefensiveSiege(',a);
assert.ok(a>=0&&b>a);
function setup(){
 const draft={commanderId:'fort-west',castleId:'fort-center',defenders:{soldiers:4,archers:2,griffins:1,dragons:0},defenseBefore:{soldiers:4,archers:2,griffins:1,dragons:0},enemyArmyBefore:{soldiers:8,archers:2},enemyStacks:[{id:'soldiers',count:8,hp:16,hpPerUnit:2,x:5,y:2},{id:'archers',count:2,hp:6,hpPerUnit:3,x:5,y:4}],hp:22};
 const s={x:1,y:2,soldiers:15,archers:6,griffins:3,dragons:1,pendingSecondarySiege:{commanderId:'fort-west'}};
 const h={turns:4,lastSecondarySiege:''};
 let applied=null,rendered=0;
 const ctx={s,battle:null,secondarySiegeEligibility:()=>draft,recoverSecondarySiegeDecision:()=>draft,showBattle:()=>{},applySecondarySiegeOutcome:(_draft,result)=>{applied=result;return true},enemyCastleHeroes:()=>({'fort-west':h}),$:()=>({hidden:false}),message:()=>{},render:()=>{rendered++}};
 vm.createContext(ctx);vm.runInContext(html.slice(a,b),ctx);ctx.checkpointSecondarySiegeBeforeBattle=()=>true;
 return {ctx,s,h,draft,applied:()=>applied,rendered:()=>rendered};
}
test('manual secondary defense swaps only garrison and restores hero on victory',()=>{
 const f=setup();assert.equal(f.ctx.launchSecondaryDefensiveSiege(f.draft),true);
 assert.equal(f.s.soldiers,4);assert.equal(f.s.archers,2);assert.equal(f.s.pendingSecondarySiege,null);
 f.s.soldiers=3;f.s.archers=1;f.ctx.battle.enemyStacks.forEach(u=>u.count=0);
 assert.equal(f.ctx.finishSecondaryDefensiveSiege(true),true);
 assert.equal(f.s.soldiers,15);assert.equal(f.s.archers,6);assert.equal(f.s.griffins,3);
 assert.equal(f.applied().winner,'defender');assert.equal(f.applied().defenders.soldiers,3);
 assert.equal(f.h.lastSecondarySiege,'fort-west:fort-center:4');
});
test('manual secondary defense applies attacker survivors on defeat',()=>{
 const f=setup();f.ctx.launchSecondaryDefensiveSiege(f.draft);
 f.s.soldiers=0;f.s.archers=0;f.s.griffins=0;f.s.dragons=0;
 assert.equal(f.ctx.finishSecondaryDefensiveSiege(false),true);
 assert.equal(f.applied().winner,'attacker');assert.equal(f.applied().attackers.soldiers,8);
 assert.equal(f.s.soldiers,15);
});
test('manual secondary defense refuses overlapping combat',()=>{
 const f=setup();f.ctx.battle={};assert.equal(f.ctx.launchSecondaryDefensiveSiege(f.draft),false);
 assert.equal(f.s.soldiers,15);
});

test('failed tactical scene restores hero army and pending siege',()=>{
 const f=setup();f.ctx.showBattle=()=>{throw new Error('scene unavailable')};
 assert.equal(f.ctx.launchSecondaryDefensiveSiege(f.draft),false);
 assert.equal(f.ctx.battle,null);assert.equal(f.s.soldiers,15);assert.equal(f.s.archers,6);
 assert.equal(f.s.griffins,3);assert.equal(f.s.dragons,1);
 assert.equal(f.s.pendingSecondarySiege.commanderId,'fort-west');
});
test('scene that aborts battle restores hero army and pending siege',()=>{
 const f=setup();f.ctx.showBattle=()=>{f.ctx.battle=null};
 assert.equal(f.ctx.launchSecondaryDefensiveSiege(f.draft),false);
 assert.equal(f.s.soldiers,15);assert.equal(f.s.pendingSecondarySiege.commanderId,'fort-west');
});

test('premature victory cannot erase surviving enemy stacks',()=>{
 const f=setup();f.ctx.launchSecondaryDefensiveSiege(f.draft);
 assert.equal(f.ctx.finishSecondaryDefensiveSiege(true),false);
 assert.ok(f.ctx.battle);assert.equal(f.s.soldiers,4);
 assert.equal(f.applied(),null);assert.equal(f.h.lastSecondarySiege,'');
});
test('premature defeat cannot discard surviving defenders',()=>{
 const f=setup();f.ctx.launchSecondaryDefensiveSiege(f.draft);
 assert.equal(f.ctx.finishSecondaryDefensiveSiege(false),false);
 assert.ok(f.ctx.battle);assert.equal(f.s.archers,2);
 assert.equal(f.applied(),null);
});

test('stale defender snapshot cannot open manual siege',()=>{
 const f=setup();const snapshot=JSON.parse(JSON.stringify(f.draft));f.ctx.recoverSecondarySiegeDecision=()=>snapshot;f.draft.defenseBefore.archers=99;
 assert.equal(f.ctx.launchSecondaryDefensiveSiege(f.draft),false);
 assert.equal(f.s.soldiers,15);assert.equal(f.s.archers,6);
 assert.equal(f.s.pendingSecondarySiege.commanderId,'fort-west');
 assert.equal(f.ctx.battle,null);
});
test('stale attacker snapshot cannot open manual siege',()=>{
 const f=setup();const snapshot=JSON.parse(JSON.stringify(f.draft));f.ctx.recoverSecondarySiegeDecision=()=>snapshot;f.draft.enemyArmyBefore.soldiers=99;
 assert.equal(f.ctx.launchSecondaryDefensiveSiege(f.draft),false);
 assert.equal(f.s.soldiers,15);assert.equal(f.ctx.battle,null);
});

test('rejected siege outcome restores army and preserves original decision',()=>{
 const f=setup();f.ctx.launchSecondaryDefensiveSiege(f.draft);
 f.ctx.applySecondarySiegeOutcome=()=>false;
 f.ctx.battle.enemyStacks.forEach(u=>u.count=0);
 assert.equal(f.ctx.finishSecondaryDefensiveSiege(true),false);
 assert.equal(f.s.soldiers,15);assert.equal(f.s.archers,6);
 assert.equal(f.ctx.battle,null);
 assert.equal(f.s.pendingSecondarySiege.commanderId,'fort-west');
 assert.equal(f.s.pendingSecondarySiege.enemyArmyBefore.soldiers,8);
 assert.equal(f.h.lastSecondarySiege,'');
});

test('manual defense refuses to start when checkpoint cannot be saved',()=>{
 const f=setup();f.ctx.checkpointSecondarySiegeBeforeBattle=()=>false;
 assert.equal(f.ctx.launchSecondaryDefensiveSiege(f.draft),false);
 assert.equal(f.s.soldiers,15);assert.equal(f.s.archers,6);
 assert.equal(f.s.pendingSecondarySiege.commanderId,'fort-west');
 assert.equal(f.ctx.battle,null);
});
test('checkpoint stores original army and pending siege before combat',()=>{
 const f=setup();const store=new Map();
 f.ctx.STORE='game-test';f.ctx.validGame=()=>true;
 f.ctx.localStorage={getItem:key=>store.get(key)||null,setItem:(key,val)=>store.set(key,val)};
 vm.runInContext(html.slice(a,html.indexOf('function launchSecondaryDefensiveSiege(',a)),f.ctx);
 assert.equal(f.ctx.launchSecondaryDefensiveSiege(f.draft),true);
 const saved=JSON.parse(store.get('game-test'));
 assert.equal(saved.soldiers,15);assert.equal(saved.archers,6);
 assert.equal(saved.pendingSecondarySiege.commanderId,'fort-west');
 assert.equal(f.s.soldiers,4);
});

test('checkpoint refuses battle if browser silently fails to persist',()=>{
 const f=setup();const store=new Map();
 f.ctx.STORE='game-test';f.ctx.validGame=()=>true;
 f.ctx.localStorage={getItem:key=>store.get(key)||null,setItem:()=>{}};
 vm.runInContext(html.slice(a,html.indexOf('function launchSecondaryDefensiveSiege(',a)),f.ctx);
 assert.equal(f.ctx.launchSecondaryDefensiveSiege(f.draft),false);
 assert.equal(f.s.soldiers,15);assert.equal(f.s.archers,6);
 assert.equal(f.s.pendingSecondarySiege.commanderId,'fort-west');
 assert.equal(f.ctx.battle,null);
});
test('checkpoint preserves recoverable army when browser reloads during battle',()=>{
 const f=setup();const store=new Map();
 f.ctx.STORE='game-test';f.ctx.validGame=()=>true;
 f.ctx.localStorage={getItem:key=>store.get(key)||null,setItem:(key,val)=>store.set(key,val)};
 vm.runInContext(html.slice(a,html.indexOf('function launchSecondaryDefensiveSiege(',a)),f.ctx);
 assert.equal(f.ctx.launchSecondaryDefensiveSiege(f.draft),true);
 f.s.soldiers=0;f.s.archers=0; // simulated losses before closing the tab
 const recovered=JSON.parse(store.get('game-test'));
 assert.equal(recovered.soldiers,15);assert.equal(recovered.archers,6);
 assert.equal(recovered.griffins,3);assert.equal(recovered.dragons,1);
 assert.equal(recovered.pendingSecondarySiege.commanderId,'fort-west');
});
