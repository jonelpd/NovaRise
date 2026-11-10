'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'..','juego','index.html'),'utf8');
const start=html.indexOf('function secondarySiegeBattleDraft(');
const end=html.indexOf('function rivalCastleConquest(siteId){',start);
assert.ok(start>=0&&end>start);
const source=html.slice(start,end);
function draft(eligible){
 const context={secondarySiegeEligibility:()=>eligible};
 vm.createContext(context);vm.runInContext(source,context);
 return context.secondarySiegeBattleDraft('fort-west','fort-center');
}
const eligible=()=>({commanderId:'fort-west',castleId:'fort-center',attackers:{soldiers:6,archers:2},defenders:{soldiers:4,archers:3,griffins:1,dragons:0}});
test('secondary siege draft refuses ineligible attacks',()=>assert.equal(draft(null),null));
test('secondary siege draft creates distinct tactical stacks',()=>{
 const result=draft(eligible());
 assert.equal(result.enemyStacks.length,2);
 assert.deepEqual(Array.from(result.enemyStacks,u=>[u.id,u.count,u.hp]),[['soldiers',6,12],['archers',2,6]]);
 assert.equal(result.hp,18);
 assert.equal(result.commanderId,'fort-west');
 assert.equal(result.castleId,'fort-center');
});
test('secondary siege draft preserves original armies and garrisons',()=>{
 const original=eligible(),result=draft(original);
 result.enemyStacks[0].count=0;
 result.attackers.soldiers=0;
 result.defenders.archers=0;
 result.enemyArmyBefore.archers=0;
 assert.equal(original.attackers.soldiers,6);
 assert.equal(original.attackers.archers,2);
 assert.equal(original.defenders.archers,3);
 assert.equal(result.enemyStacks[1].count,2);
 assert.equal(result.defenseBefore.archers,3);
});
test('secondary siege draft supports archers-only commanders',()=>{
 const e=eligible();e.attackers.soldiers=0;
 const result=draft(e);
 assert.equal(result.enemyStacks.length,1);
 assert.equal(result.enemyStacks[0].id,'archers');
 assert.equal(result.hp,6);
});
