'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 const start=html.indexOf('function heroLevel(){'),end=html.indexOf('function battleMagicCast(',start);
 test(page+': hero experience levels and saved-game maximum remain compatible',()=>{
  assert(start>=0&&end>start);
  const ctx={s:{experience:99},heroSpecializationBonus:()=>({might:0,arcana:0,mana:0}),mapTreasureEquipment:()=>({mana:0})};
  vm.createContext(ctx);vm.runInContext(html.slice(start,end),ctx);
  assert.equal(ctx.heroLevel(),1);
  assert.match(ctx.awardHeroExperience(1),/nivel 2/);
  assert.equal(ctx.s.experience,100);
  assert.equal(ctx.heroLevel(),2);
  assert.equal(ctx.awardHeroExperience(0),'');
  assert.equal(ctx.awardHeroExperience(-10),'');
  assert.equal(ctx.awardHeroExperience(NaN),'');
  assert.equal(ctx.awardHeroExperience(1.5),'');
  assert.equal(ctx.s.experience,100);
  ctx.s.experience=99999999;
  ctx.awardHeroExperience(1000);
  assert.equal(ctx.s.experience,100000000);
  assert.equal(ctx.awardHeroExperience(1000),'');
  assert.equal(ctx.s.experience,100000000);
 });
}
