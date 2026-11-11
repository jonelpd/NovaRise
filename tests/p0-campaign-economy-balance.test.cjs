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
