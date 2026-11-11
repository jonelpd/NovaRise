const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../juego/index.html'),'utf8');
const start=html.indexOf('function hitResolveVictory(){');
const end=html.indexOf('\nfunction ',start+1);
assert.ok(start>=0&&end>start,'Victory handler must be extractable');
const source=html.slice(start,end);

test('conquering rival castle starts harder level without locking campaign',()=>{
 const saved=[],old={campaignLevel:1,soldiers:7,archers:3,griffins:2,dragons:1,experience:220,gold:450,faction:'Alianza del Alba',moves:3};
 const ctx={s:old,battle:{rivalCastle:true},rivalEpoch:0,rivalBusy:false,walkEpoch:0,walking:false,selectedMine:'mine',clearAdventureRoute(){},verifiedSiteState(){return {}},rivalState(){return ctx.s.rival||(ctx.s.rival={soldiers:6,archers:2,gold:160})},awardHeroExperience(n){ctx.s.experience+=n;return ''},fresh(){return {done:false,moves:4,soldiers:4,archers:1,griffins:0,dragons:0,experience:0,gold:120,faction:'Alianza del Alba'}},reveal(){},render(){saved.push({...ctx.s})},$(id){return {hidden:false}}};
 vm.createContext(ctx);vm.runInContext(source,ctx);ctx.hitResolveVictory();
 assert.equal(ctx.s.campaignLevel,2);assert.equal(ctx.s.done,false);
 assert.equal(ctx.s.soldiers,7);assert.equal(ctx.s.archers,3);assert.equal(ctx.s.griffins,2);assert.equal(ctx.s.dragons,1);
 assert.equal(ctx.s.experience,320);assert.equal(ctx.s.gold,450);
 assert.equal(ctx.s.rival.soldiers,10);assert.equal(ctx.s.rival.archers,4);assert.equal(ctx.s.rival.gold,240);
 assert.equal(ctx.battle,null);assert.equal(saved.length,1);
});
test('old saves start at level one and advance to two',()=>{
 const ctx={s:{soldiers:1,archers:0,griffins:0,dragons:0,experience:0,gold:0,moves:2,faction:'Alianza del Alba'},battle:{rivalCastle:true},rivalEpoch:0,walkEpoch:0,clearAdventureRoute(){},verifiedSiteState(){return {}},rivalState(){return ctx.s.rival||(ctx.s.rival={soldiers:6,archers:2,gold:160})},awardHeroExperience(){return ''},fresh(){return {done:false,soldiers:4,archers:1,griffins:0,dragons:0,experience:0,gold:120,faction:'Alianza del Alba'}},reveal(){},render(){},$(){return {hidden:false}}};
 vm.createContext(ctx);vm.runInContext(source,ctx);ctx.hitResolveVictory();
 assert.equal(ctx.s.campaignLevel,2);assert.equal(ctx.s.done,false);
});
