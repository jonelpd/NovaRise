'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 const start=html.indexOf('function heroSkillMilestones(){');
 const end=html.indexOf('function heroStats(){',start);
 test(page+': third hero milestone unlocks only at level six',()=>{
  assert(start>=0&&end>start);
  for(const spec of ['warrior','mage','guardian']){
   const ctx={s:{experience:399,heroSpecialization:spec},heroSpecialization:()=>spec};
   vm.createContext(ctx);vm.runInContext(html.slice(start,end),ctx);
   let skills=ctx.heroSkillMilestones();
   assert.equal(skills.length,3);
   assert.equal(skills[0].unlocked,true);
   assert.equal(skills[1].unlocked,true);
   assert.equal(skills[2].unlocked,false);
   ctx.s.experience=500;
   skills=ctx.heroSkillMilestones();
   assert.equal(skills[2].required,6);
   assert.equal(skills[2].unlocked,true);
  }
 });
 test(page+': new milestone has a matching battle effect',()=>{
  assert.match(html,/heroSpecialization\(\)==='warrior'&&heroSkillUnlocked\(6\)\?1:0/);
  assert.match(html,/heroSpecialization\(\)==='guardian'&&heroSkillUnlocked\(6\)\?1:0/);
  assert.match(html,/heroSpecialization\(\)==='mage'&&heroSkillUnlocked\(6\)\?2:0/);
 });
}
