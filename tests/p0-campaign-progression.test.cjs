const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
for(const file of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',file),'utf8');
 const start=html.indexOf('function completeCampaignIfReady(){');
 const end=html.indexOf('\nfunction battleAttackDamage(',start);
 assert.ok(start>=0&&end>start,file+' campaign logic must exist');
 const source=html.slice(start,end);
 function setup({heroDefeated=false,castleOwned=false,level=1,battle={rivalCastle:true}}={}){
  const ctx={s:{campaignLevel:level,soldiers:7,archers:3,griffins:2,dragons:1,experience:220,gold:450,faction:'Alianza del Alba',moves:3},battle,rivalEpoch:0,rivalBusy:false,walkEpoch:0,walking:false,selectedMine:'mine',clearAdventureRoute(){},verifiedSiteState(){return ctx.s.sites||(ctx.s.sites={rival:castleOwned?'player':'rival'})},rivalState(){return ctx.s.rival||(ctx.s.rival={defeated:heroDefeated,soldiers:6,archers:2,gold:160})},awardHeroExperience(n){ctx.s.experience+=n;return ''},fresh(){return {done:false,moves:4,soldiers:4,archers:1,griffins:0,dragons:0,experience:0,gold:120,faction:'Alianza del Alba'}},reveal(){},render(){ctx.renders++},renders:0,$(){return {hidden:false}},document:{},realmDialog(title){ctx.dialogs.push(title);return Promise.resolve(true)},dialogs:[]};
  vm.createContext(ctx);vm.runInContext(source,ctx);return ctx;
 }
 test(file+': castle alone is not campaign victory',()=>{
  const c=setup();c.hitResolveVictory();assert.equal(c.s.campaignLevel,1);assert.equal(c.s.sites.rival,'player');assert.equal(c.s.rival.defeated,false);assert.equal(c.dialogs.length,0);
 });
 test(file+': defeated hero plus castle advances campaign',()=>{
  const c=setup({heroDefeated:true});c.hitResolveVictory();assert.equal(c.s.campaignLevel,2);assert.equal(c.s.done,false);assert.equal(c.s.experience,320);assert.equal(c.s.soldiers,7);assert.equal(c.s.gold,450);assert.equal(c.dialogs.length,1);
 });
 test(file+': hero alone is not campaign victory',()=>{
  const c=setup({battle:{rival:true}});c.hitResolveVictory();assert.equal(c.s.campaignLevel,1);assert.equal(c.s.rival.defeated,true);assert.equal(c.dialogs.length,0);
 });
 test(file+': castle first then hero advances campaign',()=>{
  const c=setup({castleOwned:true,battle:{rival:true}});c.hitResolveVictory();assert.equal(c.s.campaignLevel,2);assert.equal(c.dialogs.length,1);
 });
 test(file+': castle defender defeat requires a subsequent siege',()=>{
  const c=setup({battle:{rivalCastle:true,castleHeroDefender:true}});c.hitResolveVictory();assert.equal(c.s.campaignLevel,1);assert.equal(c.s.rival.defeated,true);assert.notEqual(c.s.sites?.rival,'player');assert.equal(c.dialogs.length,0);
 });
}
