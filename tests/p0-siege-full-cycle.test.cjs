'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 const start=html.indexOf('function finishDefensiveSiege(won){');
 const end=html.indexOf('function rivalCastleConquest(siteId){',start);
 assert(start>=0&&end>start);
 for(const won of [true,false]){
  test(page+': siege '+(won?'victory':'defeat')+' retains hero army and persists surviving garrison',()=>{
   const s={soldiers:17,archers:4,griffins:2,dragons:1,verifiedSites:{'fort-west':'player'}};
   const original={soldiers:17,archers:4,griffins:2,dragons:1};
   const defenders={soldiers:8,archers:3,griffins:1,dragons:0};
   const garrison={defenders:{...defenders}};
   const rival={soldiers:12,archers:4,defeated:false,recovery:0};
   const storage=[];
   let hidden=false,shown=0;
   const ctx={s,battle:null,CASTLE_PROFILES:{'fort-west':{name:'Bastión'}},CASTLE_RECRUIT_COST:{soldiers:30,archers:50,griffins:110,dragons:300},siteGarrison:()=>garrison,verifiedSiteState:()=>s.verifiedSites,rivalState:()=>rival,showBattle:()=>{shown++;},render:()=>{storage.push(JSON.stringify(s));},message:()=>{storage.push(JSON.stringify(s));},rivalCastleConquest:()=>{throw Error('Unexpected automatic siege');},$:()=>({set hidden(v){hidden=v;}})};
   vm.createContext(ctx);vm.runInContext(html.slice(start,end),ctx);
   assert.equal(ctx.launchDefensiveSiege({id:'fort-west'}),undefined);
   assert.equal(shown,1);
   assert.deepEqual([s.soldiers,s.archers,s.griffins,s.dragons],[8,3,1,0]);
   assert.equal(ctx.battle.defenseSiteId,'fort-west');
   s.soldiers=3;s.archers=1;s.griffins=won?1:0;s.dragons=0;
   assert.equal(ctx.finishDefensiveSiege(won),true);
   assert.equal(hidden,true);
   assert.equal(ctx.battle,null);
   assert.deepEqual([s.soldiers,s.archers,s.griffins,s.dragons],Object.values(original));
   assert.equal(s.verifiedSites['fort-west'],won?'player':'rival');
   assert.deepEqual(Object.values(garrison.defenders),won?[3,1,1,0]:[0,0,0,0]);
   assert.equal(storage.length,1);
   const saved=JSON.parse(storage[0]);
   assert.equal(saved.soldiers,17);
   assert.equal(saved.verifiedSites['fort-west'],won?'player':'rival');
   assert.equal(ctx.finishDefensiveSiege(won),false);
   assert.equal(storage.length,1);
  });
 }
}
