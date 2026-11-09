'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 test(page+': flying stacks may cross but never land on blocked cells',()=>{
  const start=html.indexOf('function tacticalReachable(type)'),end=html.indexOf('function tacticalCanAttack(type)',start);
  assert.ok(start>=0&&end>start);
  const s={soldiers:1,archers:0,griffins:1,dragons:0};
  const battle={moving:false,acted:[],gx:0,gy:0,sx:5,sy:4,obstacles:[[1,0]],ex:5,ey:0};
  const ctx={s,battle,duelEnemies:()=>[],pos:type=>type==='griffins'?[battle.gx,battle.gy]:[battle.sx,battle.sy],battleCount:type=>s[type],battleUnitReady:type=>s[type]>0,battleSpeed:type=>type==='griffins'?3:1};
  vm.createContext(ctx);vm.runInContext(html.slice(start,end),ctx);
  const cells=ctx.tacticalReachable('griffins');
  assert.equal(cells.has('1,0'),false,'flying stack cannot land on obstacle');
  assert.equal(cells.has('2,0'),true,'flying stack can cross obstacle');
 });
}
