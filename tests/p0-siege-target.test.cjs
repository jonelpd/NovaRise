'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
for(const page of ['index.html','combate-demo.html']){
 test(page+': undefended castle resolution targets the requested castle',()=>{
  const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
  const start=html.indexOf('function rivalCastleConquest(siteId){');
  const end=html.indexOf('function applyVerifiedSiteTurn(){',start);
  assert(start>=0&&end>start);
  const state={turn:3,verifiedSites:{'fort-near':'player','fort-far':'player'}};
  const garrisons={
   'fort-near':{defenders:{soldiers:0,archers:0,griffins:0,dragons:0}},
   'fort-far':{defenders:{soldiers:0,archers:0,griffins:0,dragons:0}}
  };
  const rival={x:0,y:0,soldiers:8,archers:2,defeated:false};
  const ctx={s:state,CASTLE_PROFILES:{'fort-near':{name:'Near'},'fort-far':{name:'Far'}},
   VERIFIED_MAP_SITES:[{id:'fort-near',kind:'fort',x:0,y:0},{id:'fort-far',kind:'fort',x:3,y:0}],
   rivalState:()=>rival,verifiedSiteState:()=>state.verifiedSites,siteGarrison:id=>garrisons[id],
   window:undefined};
  vm.createContext(ctx);vm.runInContext(html.slice(start,end),ctx);
  const result=ctx.rivalCastleConquest('fort-far');
  assert.match(result,/Far/);
  assert.equal(state.verifiedSites['fort-far'],'rival');
  assert.equal(state.verifiedSites['fort-near'],'player');
 });
 test(page+': empty-garrison fallback passes exact castle id',()=>{
  const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
  assert.match(html,/s\.message=rivalCastleConquest\(site\.id\)/);
 });
}
