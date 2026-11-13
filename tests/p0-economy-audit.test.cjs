'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../juego/index.html'),'utf8');
function extract(start,end){
 const a=html.indexOf(start),b=html.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,'missing economy function: '+start);
 return html.slice(a,b);
}
const code=extract('function mineYield(){','function minerCount()')+
 extract('function campaignGoldFactor(){','// Los estandartes son elementos visuales');
const catalogCode=extract('const VERIFIED_MAP_SITES=','\n];')+'\n];';
function model(overrides={}){
 const s={campaignLevel:1,gold:0,crystals:0,ownedMines:[],mineLevels:{},miners:{},moves:4,mapFood:0,turn:1,...overrides};
 const ctx={s,verifiedSiteState:()=>ctx.owners,owners:{},siteGarrison:()=>({stock:{soldiers:0,archers:0,griffins:0,dragons:0}})};
 vm.createContext(ctx);
 vm.runInContext(catalogCode+'\n'+code,ctx);
 return ctx;
}
test('mine workers and upgrades produce bounded, nonnegative crystal yields',()=>{
 const c=model({ownedMines:['1,1'],miners:{'1,1':3},mineLevels:{'1,1':1}});
 assert.equal(c.mineYield(),10);
 c.s.mineLevels['1,1']=2;assert.equal(c.mineYield(),25);
 c.s.mineLevels['1,1']=3;assert.equal(c.mineYield(),50);
 c.s.miners['1,1']=0;assert.equal(c.mineYield(),0);
 c.s.miners['1,1']=5;assert.equal(c.mineYield(),50,'workers capped at three');
});
test('campaign gold scaling remains nonnegative through level fifty',()=>{
 const c=model();
 let prev=Infinity;
 for(let level=1;level<=50;level++){
  c.s.campaignLevel=level;
  const amount=c.campaignGoldIncome(100);
  assert.ok(amount>=0&&amount<=prev,'gold income must not grow at higher difficulty');
  prev=amount;
 }
 assert.equal(c.campaignGoldIncome(100),45);
});
test('captured visible mines and mills have capped turn bonuses',()=>{
 const c=model();
 const sites=vm.runInContext('VERIFIED_MAP_SITES',c);
 const mines=sites.filter(v=>v.kind==='mine');
 const mills=sites.filter(v=>v.kind==='mill');
 assert.equal(mines.length,3);assert.equal(mills.length,5);
 for(const v of [...mines,...mills])c.owners[v.id]='player';
 c.applyVerifiedSiteTurn();
 assert.equal(c.s.crystals,30,'three captured visible mines: 10 crystals each');
 assert.equal(c.s.moves,6,'mill movement bonus capped at two');
 assert.equal(c.s.mapFood,3,'unused mill provisions stored');
 c.applyVerifiedSiteTurn();
 assert.equal(c.s.crystals,60);
 assert.equal(c.s.moves,7,'movement never exceeds seven');
 assert.equal(c.s.mapFood,6,'food reserve increases when mills exceed consumption');
});
test('unclaimed locations provide no passive economy',()=>{
 const c=model();
 c.applyVerifiedSiteTurn();
 assert.equal(c.s.gold,0);assert.equal(c.s.crystals,0);assert.equal(c.s.moves,4);
});
