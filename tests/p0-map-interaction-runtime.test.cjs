'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const html=fs.readFileSync(path.join(__dirname,'../juego/index.html'),'utf8');
const begin=html.indexOf('function interactVerifiedSite(site){');
const end=html.indexOf('\nfunction rivalResourceCapture()',begin);
assert.ok(begin>=0&&end>begin,'Map interaction function must exist');
const source=html.slice(begin,end);
const sitesStart=html.indexOf('const VERIFIED_MAP_SITES=');
const sitesEnd=html.indexOf('\n];',sitesStart)+3;
assert.ok(sitesStart>=0&&sitesEnd>sitesStart,'Original map site catalog must exist');
const catalog=vm.runInNewContext(html.slice(sitesStart,sitesEnd)+'\nVERIFIED_MAP_SITES');
function setup(){
 const s={done:false,moves:4,gold:120,soldiers:4,experience:0,turn:1,crystals:0,landmarkRewards:{}};
 let notice='';
 const ctx={s,battle:null,walking:false,rivalBusy:false,heroVisualPosition:()=>[50,50],
  verifiedSiteState:()=>ctx.owners,owners:{},message:m=>{notice=m;return m},
  awardHeroExperience:n=>{s.experience+=n;return ''},campaignGoldIncome:n=>n};
 vm.createContext(ctx);vm.runInContext(source,ctx);
 return {ctx,s,notice:()=>notice};
}
test('all five mapped relics grant exactly one reward per level',()=>{
 const relics=catalog.filter(s=>s.kind==='relic');
 assert.equal(relics.length,5);
 for(const site of relics){
  const {ctx,s,notice}=setup();
  ctx.heroVisualPosition=()=>[site.x,site.y];
  ctx.interactVerifiedSite(site);
  assert.equal(s.landmarkRewards[site.id],true,site.id);
  const after=[s.gold,s.soldiers,s.experience];
  ctx.interactVerifiedSite(site);
  assert.deepEqual([s.gold,s.soldiers,s.experience],after,site.id+' duplicated reward');
  assert.match(notice(),/Ya has explorado/);
 }
});
test('mapped mines transfer ownership without issuing NVRA',()=>{
 const site=catalog.find(s=>s.kind==='mine');
 assert.ok(site);
 const {ctx,notice}=setup();ctx.heroVisualPosition=()=>[site.x,site.y];
 ctx.interactVerifiedSite(site);
 assert.equal(ctx.owners[site.id],'player');
 assert.match(notice(),/no son NVRA/);
 ctx.interactVerifiedSite(site);
 assert.equal(ctx.owners[site.id],'player');
});
test('mapped mills do not pay twice in the same week',()=>{
 const site=catalog.find(s=>s.kind==='mill');
 assert.ok(site);
 const {ctx,s,notice}=setup();ctx.heroVisualPosition=()=>[site.x,site.y];
 ctx.interactVerifiedSite(site);
 assert.equal(ctx.owners[site.id],'player');
 ctx.interactVerifiedSite(site);
 const after=[s.gold,s.crystals];
 ctx.interactVerifiedSite(site);
 assert.deepEqual([s.gold,s.crystals],after);
 assert.match(notice(),/esta semana/);
 s.turn=8;ctx.interactVerifiedSite(site);
 assert.ok(s.gold>after[0]||s.crystals>after[1]);
});
