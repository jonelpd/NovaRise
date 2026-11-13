'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const original=new Set(['relic-desert-well','relic-north-cabin','relic-east-ruin','relic-desert-hut','relic-mountain-hut']);
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 const a=html.indexOf('const VERIFIED_MAP_SITES='),b=html.indexOf('\n];',a)+3;
 const c=html.indexOf('function interactVerifiedSite(site){'),d=html.indexOf('\nfunction rivalResourceCapture()',c);
 assert.ok(a>=0&&b>a&&c>=0&&d>c);
 const catalog=vm.runInNewContext(html.slice(a,b)+'\nVERIFIED_MAP_SITES');
 test(page+': original and new landmark rewards stay distinct and cannot repeat',()=>{
  const relics=catalog.filter(x=>x.kind==='relic');
  assert.equal(relics.filter(x=>original.has(x.id)).length,5);
  assert.equal(relics.filter(x=>!original.has(x.id)).length,10);
  for(const site of relics){
   const s={done:false,moves:4,gold:0,soldiers:0,experience:0,landmarkRewards:{}};
   const ctx={s,battle:null,walking:false,rivalBusy:false,heroVisualPosition:()=>[site.x,site.y],
    verifiedSiteState:()=>({}),message:()=>{},awardHeroExperience:n=>{s.experience+=n;return ''},
    campaignGoldIncome:n=>n};
   vm.createContext(ctx);vm.runInContext(html.slice(c,d),ctx);
   ctx.interactVerifiedSite(site);
   const old=original.has(site.id);
   const expected=site.reward==='soldiers'?[0,old?3:2,0]:site.reward==='experience'?[0,0,old?55:45]:[old?100:80,0,0];
   assert.deepEqual([s.gold,s.soldiers,s.experience],expected,site.id);
   ctx.interactVerifiedSite(site);
   assert.deepEqual([s.gold,s.soldiers,s.experience],expected,site.id+' must not pay twice');
  }
 });
}
