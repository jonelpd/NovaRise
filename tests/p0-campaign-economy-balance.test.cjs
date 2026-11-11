const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 const extract=(begin,end)=>{const i=html.indexOf(begin);const j=html.indexOf(end,i+begin.length);assert.ok(i>=0&&j>i,page+': '+begin);return html.slice(i,j)};
 const gold=extract('function campaignGoldFactor(){','function applyVerifiedSiteTurn(){');
 const xp=extract('function awardHeroExperience(amount){','function battleMagicCast(spell){');
 for(const [level,factor] of [[1,1],[2,.92],[3,.84],[4,.76],[5,.68],[6,.6],[7,.52],[8,.45],[20,.45]]){
  test(page+' level '+level+' gold and experience rewards scale consistently',()=>{
   const ctx={s:{campaignLevel:level,experience:0},heroLevel(){return 1}};
   vm.createContext(ctx);vm.runInContext(gold+'\n'+xp,ctx);
   assert.equal(ctx.campaignGoldIncome(100),Math.floor(100*factor));
   ctx.awardHeroExperience(100);
   assert.equal(ctx.s.experience,Math.floor(100*factor));
   ctx.awardHeroExperience(1);
   assert.equal(ctx.s.experience,Math.floor(100*factor)+1);
  });
 }
 test(page+' legacy save defaults to level 1',()=>{
  const ctx={s:{experience:20},heroLevel(){return 1}};
  vm.createContext(ctx);vm.runInContext(gold+'\n'+xp,ctx);
  assert.equal(ctx.campaignGoldIncome(100),100);ctx.awardHeroExperience(100);assert.equal(ctx.s.experience,120);
 });
}

for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 test(page+' recovered rival hero retains campaign difficulty',()=>{
  assert.match(html,/v\.soldiers=4\+4\*\(campaign-1\);v\.archers=1\+2\*\(campaign-1\)/);
  assert.doesNotMatch(html,/v\.defeated=false;v\.recovery=0;v\.soldiers=4;v\.archers=1;/);
  for(const level of [1,5,10,20]){
   const campaign=Math.max(1,Math.min(50,level));
   assert.ok(4+4*(campaign-1)>=4);
   assert.ok(1+2*(campaign-1)>=1);
  }
 });
}

for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 test(page+' recruitment costs and baseline income stay viable at levels 5, 10 and 20',()=>{
  const match=html.match(/const CASTLE_RECRUIT_COST=\{soldiers:(\d+),archers:(\d+),griffins:(\d+),dragons:(\d+)\}/);
  assert.ok(match,'Recruitment costs must be inspectable');
  const costs=match.slice(1).map(Number);
  assert.ok(costs.every(c=>c>0));
  for(const level of [5,10,20]){
   const factor=Math.max(.45,1-.08*Math.min(7,level-1));
   const income=Math.floor(40*factor);
   const soldierTurns=Math.ceil(costs[0]/income);
   const archerTurns=Math.ceil(costs[1]/income);
   assert.ok(income>=18,'Base income must not fall below 18 gold per turn');
   assert.ok(soldierTurns<=2,'A basic soldier must be affordable within two baseline income turns');
   assert.ok(archerTurns<=3,'A basic archer must be affordable within three baseline income turns');
  }
 });
}

test('main game secondary commanders recover with level-scaled armies',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../juego/index.html'),'utf8');
 assert.match(html,/h\.soldiers=Math\.max\(1,Math\.floor\(\(CASTLE_PROFILES\[site\.id\]\?\.guard\.soldiers\|\|4\)\/2\)\)\+2\*extra;/);
 assert.match(html,/h\.archers=Math\.max\(0,Math\.floor\(\(CASTLE_PROFILES\[site\.id\]\?\.guard\.archers\|\|0\)\/2\)\)\+extra;/);
 assert.doesNotMatch(html,/h\.soldiers=3;h\.archers=1;h\.gold=0;h\.moves=0;/);
});

test('secondary commanders can continue recruiting beyond level-one caps',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../juego/index.html'),'utf8');
 assert.match(html,/const soldierLimit=40\+2\*campaignExtra,archerLimit=15\+campaignExtra;/);
 assert.match(html,/h\.soldiers<soldierLimit/);
 assert.match(html,/h\.archers<archerLimit/);
 for(const level of [1,5,10,20,50]){
  const extra=level-1;
  assert.ok(40+2*extra>=40);
  assert.ok(15+extra>=15);
 }
});

test('level 50 is a final victory, not an infinite campaign loop',()=>{
 for(const page of ['index.html','combate-demo.html']){
  const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
  const start=html.indexOf('function completeCampaignIfReady()');
  assert.ok(start>=0,page);
  const section=html.slice(start,start+2200);
  assert.match(section,/if\(completed>=50\)\{/);
  assert.match(section,/s\.done=true;battle=null;/);
  assert.match(section,/return true;/);
  assert.ok(section.indexOf('if(completed>=50)')<section.indexOf('s=fresh()'));
 }
});
