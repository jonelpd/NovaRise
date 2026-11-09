'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 const start=html.indexOf('function finishDefensiveSiege(won)'),end=html.indexOf('function launchDefensiveSiege(site)',start);
 test(page+': defensive siege preserves hero army and persists garrison casualties',()=>{
  assert.ok(start>=0&&end>start);
  for(const won of [true,false]){
   const s={soldiers:3,archers:1,griffins:0,dragons:0};
   const g={defenders:{soldiers:10,archers:5,griffins:2,dragons:0}};
   const rival={soldiers:12,archers:4,defeated:false,recovery:3};
   const ownership={'fort-west':'player'};
   const battle={defenseSiteId:'fort-west',heroArmyBefore:{soldiers:20,archers:8,griffins:1,dragons:0}};
   let notice='';
   const ctx={s,battle,CASTLE_PROFILES:{'fort-west':{name:'Castillo del Oeste'}},CASTLE_RECRUIT_COST:{soldiers:1,archers:1,griffins:1,dragons:1},siteGarrison:()=>g,rivalState:()=>rival,verifiedSiteState:()=>ownership,$:()=>({set hidden(v){}}),message:t=>{notice=t}};
   vm.createContext(ctx);vm.runInContext(html.slice(start,end),ctx);
   assert.equal(ctx.finishDefensiveSiege(won),true);
   assert.equal(ctx.battle,null);
   assert.deepEqual([s.soldiers,s.archers,s.griffins,s.dragons],[20,8,1,0]);
   assert.equal(g.defenders.soldiers,won?3:0);
   assert.equal(g.defenders.archers,won?1:0);
   assert.equal(ownership['fort-west'],won?'player':'rival');
   assert.equal(rival.defeated,won);
   assert.ok(notice.length>0);
  }
 });
}
