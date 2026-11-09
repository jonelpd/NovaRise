'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 const begin=html.indexOf('function finishDefensiveSiege(won)'),end=html.indexOf('function launchDefensiveSiege(site)',begin);
 test(page+': defensive siege preserves hero troops and records garrison casualties',()=>{
  assert.ok(begin>=0&&end>begin);
  const source=html.slice(begin,end);
  const s={soldiers:2,archers:1,griffins:0,dragons:0};
  const g={defenders:{soldiers:5,archers:3,griffins:0,dragons:0}};
  const v={defeated:false,recovery:2,soldiers:7,archers:4};
  const b={defenseSiteId:'keep',heroArmyBefore:{soldiers:10,archers:4,griffins:1,dragons:0},defenseBefore:{},defenseEnemyBefore:{}};
  let renders=0;
  const ctx={s,battle:b,CASTLE_PROFILES:{keep:{name:'Castillo'}},CASTLE_RECRUIT_COST:{soldiers:1,archers:1,griffins:1,dragons:1},siteGarrison:()=>g,rivalState:()=>v,verifiedSiteState:()=>({keep:'player'}),$:()=>({hidden:false}),message:()=>renders++,render:()=>renders++};
  vm.createContext(ctx);vm.runInContext(source,ctx);
  assert.equal(ctx.finishDefensiveSiege(true),true);
  assert.equal(s.soldiers,10);assert.equal(s.archers,4);assert.equal(s.griffins,1);
  assert.equal(g.defenders.soldiers,2);assert.equal(g.defenders.archers,1);
  assert.equal(v.defeated,true);assert.equal(ctx.battle,null);assert.equal(renders,1);
 });
}
