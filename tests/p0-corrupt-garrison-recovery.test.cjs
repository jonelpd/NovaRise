'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 const start=html.indexOf('function siteGarrison(id)'),end=html.indexOf('async function recruitFromCastle(site)',start);
 test(page+': corrupt castle garrison state is rebuilt safely',()=>{
  assert.ok(start>=0&&end>start);
  const state={garrisons:{'fort-west':{stock:'corrupted',defenders:[]}}};
  const ctx={verifiedSiteState:()=>state,CASTLE_PROFILES:{'fort-west':{stock:{soldiers:4,archers:2,griffins:0,dragons:0},guard:{soldiers:8,archers:2,griffins:0,dragons:0}}},CASTLE_RECRUIT_COST:{soldiers:30,archers:50,griffins:100,dragons:200}};
  vm.createContext(ctx);vm.runInContext(html.slice(start,end),ctx);
  const g=ctx.siteGarrison('fort-west');
  assert.equal(g.stock.soldiers,4);
  assert.equal(g.defenders.soldiers,0);
  assert.equal(state.garrisons['fort-west'],g);
  state.garrisons=[];
  const recovered=ctx.siteGarrison('fort-west');
  assert.equal(recovered.stock.archers,2);
  assert.equal(Array.isArray(state.garrisons),false);
 });
}
