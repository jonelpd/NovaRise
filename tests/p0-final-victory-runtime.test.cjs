'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 const begin=html.indexOf('function completeCampaignIfReady(){');
 const end=html.indexOf('\nfunction hitResolveVictory()',begin);
 assert.ok(begin>=0&&end>begin,page+': campaign completion function missing');
 const source=html.slice(begin,end);
 const validateStart=html.indexOf('function validGame(g){');
 const validateEnd=html.indexOf('\n}',validateStart)+2;
 assert.ok(validateStart>=0&&validateEnd>validateStart,page+': save validator missing');
 test(page+': level 50 completion is terminal and idempotent at runtime',()=>{
  const state={campaignLevel:50,done:false,soldiers:8,archers:3,griffins:1,dragons:0,experience:250,gold:300};
  let dialogs=0,renders=0,freshCalls=0;
  const ctx={s:state,battle:{rival:true},verifiedSiteState:()=>({rival:'player'}),rivalState:()=>({defeated:true}),
   $:()=>({hidden:false}),render:()=>{renders++},realmDialog:()=>{dialogs++;return Promise.resolve(true)},
   document:{},fresh:()=>{freshCalls++;return {}},clearAdventureRoute:()=>{}};
  vm.createContext(ctx);vm.runInContext(source,ctx);
  assert.equal(ctx.completeCampaignIfReady(),true);
  assert.equal(ctx.s.done,true);
  assert.equal(ctx.s.campaignLevel,50);
  assert.equal(ctx.battle,null);
  assert.equal(ctx.completeCampaignIfReady(),false);
  assert.equal(dialogs,1);
  assert.equal(renders,1);
  assert.equal(freshCalls,0);
 });
 test(page+': runtime validator rejects forged level and landmark rewards',()=>{
  const ctx={};vm.createContext(ctx);vm.runInContext(html.slice(validateStart,validateEnd),ctx);
  const game={x:1,y:1,turn:2,moves:4,gold:120,crystals:0,seasonPoints:0,
   soldiers:4,archers:1,griffins:0,dragons:0,experience:0,seen:[],taken:[],
   claimed:[],ownedMines:[],buildings:[],rewardClaims:[],mineLevels:{},miners:{},
   faction:'Alianza del Alba',campaignLevel:50,
   landmarkRewards:{'relic-desert-well':true}};
  assert.equal(ctx.validGame(game),true);
  for(const mutation of [
   {campaignLevel:51},{campaignLevel:0},{campaignLevel:1.5},
   {landmarkRewards:{'fictional-site':true}},
   {landmarkRewards:{'relic-desert-well':false}},
   {landmarkRewards:['relic-desert-well']}
  ])assert.equal(ctx.validGame({...game,...mutation}),false,JSON.stringify(mutation));
 });
}
