'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'..','juego','index.html'),'utf8');
const start=html.indexOf('function simulateSecondarySiege(');
const end=html.indexOf('function applySecondarySiegeOutcome(',start);
assert.ok(start>=0&&end>start);
const context={Math,Number,Object};vm.createContext(context);vm.runInContext(html.slice(start,end),context);
const simulate=draft=>context.simulateSecondarySiege(draft);
const make=(attackers={soldiers:10,archers:4},defenders={soldiers:2,archers:1,griffins:0,dragons:0})=>({attackers,defenders});
test('secondary siege simulation does not mutate source armies',()=>{
 const draft=make();const before=JSON.stringify(draft);const result=simulate(draft);
 assert.ok(result);assert.equal(JSON.stringify(draft),before);
});
test('secondary siege simulation is deterministic and bounded to eight rounds',()=>{
 const draft=make();const a=simulate(draft),b=simulate(draft);
 assert.equal(JSON.stringify(a),JSON.stringify(b));assert.ok(a.rounds.length<=8);
});
test('secondary siege simulation rejects invalid attackers and defenders',()=>{
 assert.equal(simulate(make({soldiers:-1,archers:3})),null);
 assert.equal(simulate(make({soldiers:0,archers:0})),null);
 assert.equal(simulate(make({soldiers:2,archers:1},{soldiers:1,archers:0,griffins:0,dragons:-1})),null);
});
test('secondary siege attacker win requires eliminated defenders',()=>{
 const result=simulate(make({soldiers:40,archers:20},{soldiers:1,archers:0,griffins:0,dragons:0}));
 assert.equal(result.winner,'attacker');assert.equal(Object.values(result.defenders).reduce((a,b)=>a+b,0),0);
});
test('secondary siege retreat does not falsely count as defender annihilation',()=>{
 const result=simulate(make({soldiers:2,archers:1},{soldiers:50,archers:20,griffins:2,dragons:1}));
 assert.ok(['defender','retreat'].includes(result.winner));
 if(result.winner==='retreat')assert.ok(result.attackers.soldiers+result.attackers.archers>0);
});
