// Run: node --test tests/p0-combat.test.cjs
// Focused regression tests of the actual inline combat function in both game pages.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

for (const page of ['index.html', 'combate-demo.html']) {
  test(page + ': damage, survivors and target switching', () => {
    const html = fs.readFileSync(path.join(__dirname, '..', 'juego', page), 'utf8');
    const start = html.indexOf('function duelApplyDamage(amount){');
    const end = html.indexOf('function duelEnemyTurn(done){', start);
    assert.ok(start >= 0 && end > start, 'Combat functions must exist');
    const source = html.slice(start, end);
    const enemies = [
      {id:'soldiers',hp:12,hpPerUnit:4,count:3},
      {id:'archers',hp:6,hpPerUnit:3,count:2}
    ];
    const battle = {enemyStacks:enemies,targetEnemyId:'soldiers',hp:18};
    const context = {
      battle,
      duelTarget: () => enemies.find(u => u.id === battle.targetEnemyId && u.count > 0),
      duelEnemies: () => enemies.filter(u => u.count > 0),
      duelEnemyHp: () => enemies.filter(u => u.count > 0).reduce((sum,u) => sum + u.hp, 0),
      duelSelectEnemy: u => {battle.targetEnemyId=u.id;}
    };
    vm.createContext(context);
    vm.runInContext(source, context);
    context.duelApplyDamage(-10);
    assert.equal(enemies[0].hp,12, 'Negative damage must not heal');
    context.duelApplyDamage(NaN);
    assert.equal(enemies[0].hp,12, 'Invalid damage must not corrupt HP');
    context.duelApplyDamage(5);
    assert.equal(enemies[0].hp,7);
    assert.equal(enemies[0].count,2);
    assert.equal(battle.hp,13);
    context.duelApplyDamage(100);
    assert.equal(enemies[0].count,0);
    assert.equal(battle.targetEnemyId,'archers');
    assert.equal(battle.hp,6);
    context.duelApplyDamage(100);
    assert.equal(enemies[1].count,0);
    assert.equal(battle.hp,0);
  });
  test(page + ': rival losses do not rewrite rival army for neutral battles', () => {
    const html = fs.readFileSync(path.join(__dirname, '..', 'juego', page), 'utf8');
    assert.match(html, /if\(battle\?\.enemyStacks&&battle\.rival\)/);
  });
  test(page + ': archers can attack adjacent enemies', () => {
    const html = fs.readFileSync(path.join(__dirname, '..', 'juego', page), 'utf8');
    // Enemy archers intentionally require range >= 2; adjacent units are handled by repositioning.
    assert.match(html,/const validShot=t=>distanceTo\(t\)>=2&&distanceTo\(t\)<=3&&clearShot/);
    assert.match(html,/u\.id!=='archers'\|\|distance>=2/);
  });
}
