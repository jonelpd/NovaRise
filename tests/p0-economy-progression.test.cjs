'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../juego/index.html'),'utf8');
function extract(a,b){const start=html.indexOf(a),end=html.indexOf(b,start+a.length);assert.ok(start>=0&&end>start,a);return html.slice(start,end)}
const code=extract('function campaignGoldFactor(){','function applyVerifiedSiteTurn(){');
const catalog=extract('const VERIFIED_MAP_SITES=','\n];')+'\n];';
const recruit=extract('const CASTLE_RECRUIT_COST=','const CASTLE_UNIT_NAMES=');
function scenario(level,forts,claims,market,forest){
 const s={campaignLevel:level};
 const c={s};vm.createContext(c);
 vm.runInContext(code+catalog+recruit,c);
 const base=40+25*claims+(market?30:0)+(forest?15:0);
 const turn=c.campaignGoldIncome(base)+c.campaignGoldIncome(forts*15);
 const costs=vm.runInContext('CASTLE_RECRUIT_COST',c);
 return {turn,turnsSoldier:Math.ceil(costs.soldiers/turn),turnsArcher:Math.ceil(costs.archers/turn),turnsGriffin:Math.ceil(costs.griffins/turn),turnsDragon:Math.ceil(costs.dragons/turn)};
}
test('economic scenarios: no negative passive income at any campaign level',()=>{
 for(let level=1;level<=50;level++){
  for(const [forts,claims,market,forest] of [[0,0,false,false],[1,1,false,false],[3,3,true,false],[5,5,true,true]]){
   const x=scenario(level,forts,claims,market,forest);
   assert.ok(x.turn>=0&&Number.isFinite(x.turn));
   assert.ok(x.turnsSoldier>=1&&x.turnsDragon>=x.turnsGriffin);
  }
 }
});
test('higher castle control improves purchasing power without bypassing costs',()=>{
 for(const level of [1,10,25,50]){
  const low=scenario(level,0,0,false,false);
  const high=scenario(level,5,5,true,true);
  assert.ok(high.turn>low.turn);
  assert.ok(high.turnsDragon<=low.turnsDragon);
 }
});
test('campaign income scaling bottoms out but never reaches zero',()=>{
 const level1=scenario(1,0,0,false,false);
 const level50=scenario(50,0,0,false,false);
 assert.equal(level1.turn,40);
 assert.equal(level50.turn,18);
 assert.equal(scenario(50,5,5,true,true).turn,128);
});
