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
test('all fifteen mapped relics grant exactly one reward per level',()=>{
 const relics=catalog.filter(s=>s.kind==='relic');
 assert.equal(relics.length,15);
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

test('distant landmark selects a reachable tile and queues interaction',()=>{
 const site=catalog.find(v=>v.id==='relic-far-southeast-house');
 assert.ok(site);
 const {ctx}=setup();
 ctx.heroVisualPosition=()=>[10,10];
 ctx.W=10;ctx.H=10;ctx.safeHeroPoint=(x,y)=>[x*10+5,y*10+5];
 ctx.findRoute=(x,y)=>x===9&&y===9?[[2,2],[9,9]]:null;
 ctx.movementCost=()=>1;
 ctx.walkTo=(x,y)=>{ctx.walkDestination=[x,y]};
 ctx.s.x=1;ctx.s.y=1;
 ctx.interactVerifiedSite(site);
 assert.equal(ctx.pendingSiteInteraction.id,site.id);
 assert.equal(ctx.pendingSiteInteraction.x,9);
 assert.equal(ctx.pendingSiteInteraction.y,9);
 assert.equal(ctx.walkDestination[0],9);
 assert.equal(ctx.walkDestination[1],9);
 assert.equal(ctx.s.landmarkRewards[site.id],undefined,'do not award before arriving');
});
test('inaccessible landmark never grants rewards or teleports the hero',()=>{
 const site=catalog.find(v=>v.id==='relic-far-southeast-house');
 const {ctx,s,notice}=setup();
 ctx.heroVisualPosition=()=>[10,10];
 ctx.W=10;ctx.H=10;ctx.safeHeroPoint=()=>null;ctx.findRoute=()=>null;
 ctx.interactVerifiedSite(site);
 assert.match(notice(),/No hay un camino transitable/);
 assert.equal(s.landmarkRewards[site.id],undefined);
 assert.equal(ctx.pendingSiteInteraction,undefined);
});
