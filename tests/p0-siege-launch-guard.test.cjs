'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 const a=html.indexOf('function launchDefensiveSiege(site){');
 const b=html.indexOf('function rivalCastleConquest(siteId){',a);
 assert(a>=0&&b>a);
 const code=html.slice(a,b);
 for(const scenario of ['active battle','lost castle']){
  test(page+': siege launch rejects '+scenario+' without modifying hero troops',()=>{
   const state={soldiers:20,archers:5,griffins:1,dragons:0};
   const existing={k:'another-fight'};
   const ctx={s:state,battle:scenario==='active battle'?existing:null,verifiedSiteState:()=>({'fort-west':scenario==='lost castle'?'rival':'player'}),siteGarrison:()=>{throw Error('Must not access garrison');}};
   vm.createContext(ctx);vm.runInContext(code,ctx);
   assert.equal(ctx.launchDefensiveSiege({id:'fort-west'}),false);
   assert.equal(state.soldiers,20);assert.equal(state.archers,5);
   assert.equal(ctx.battle,scenario==='active battle'?existing:null);
  });
 }
}
