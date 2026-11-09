'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 test(page+': a guard absorbs exactly one hit',()=>{
  const begin=html.indexOf('function consumeBattleGuard(type)'),end=html.indexOf('function battleCount(type)',begin);
  assert.ok(begin>=0&&end>begin);
  const ctx={battle:{guarding:['soldiers','archers']}};
  vm.createContext(ctx);vm.runInContext(html.slice(begin,end),ctx);
  assert.equal(ctx.consumeBattleGuard('soldiers'),true);
  assert.equal(ctx.consumeBattleGuard('soldiers'),false);
  assert.equal(ctx.consumeBattleGuard('archers'),true);
  assert.equal(ctx.consumeBattleGuard('dragons'),false);
  assert.equal(ctx.battle.guarding.length,0);
 });
 test(page+': guard consumption covers hero attacks and ordinary counters',()=>{
  const duel=html.slice(html.indexOf('function duelEnemyTurn(done)'),html.indexOf('function battleCount(type)'));
  const enemy=html.slice(html.indexOf('function enemyAdvance(onComplete)'),html.indexOf('function tacticalReachable(type)'));
  const hit=html.slice(html.indexOf('function hit(defend)'),html.indexOf('function hireMiner()'));
  assert.match(duel,/const guarded=consumeBattleGuard\(nearest\.type\)/);
  assert.match(enemy,/guarded=consumeBattleGuard\(best\.target\.type\)/);
  assert.match(hit,/const protectedStack=consumeBattleGuard\(attacker\)/);
 });
}
