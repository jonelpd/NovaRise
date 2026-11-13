'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../juego/index.html'),'utf8');
const a=html.indexOf('function completeCampaignIfReady(){'),b=html.indexOf('function hitResolveVictory()',a);
assert.ok(a>=0&&b>a);
const fn=html.slice(a,b);
function run(level,options={}){
 const original={campaignLevel:level,done:false,soldiers:options.soldiers??17,archers:options.archers??8,griffins:options.griffins??3,dragons:options.dragons??1,experience:options.experience??1234,gold:options.gold??270,faction:'Guardianes del Bosque'};
 const enemy={defeated:true,soldiers:5,archers:2,gold:60};
 const owners={rival:'player'};
 const ctx={s:original,battle:null,rivalEpoch:0,rivalBusy:false,walkEpoch:0,walking:false,selectedMine:'',
  verifiedSiteState:()=>owners,rivalState:()=>enemy,clearAdventureRoute:()=>{},fresh:()=>({campaignLevel:1,soldiers:4,archers:1,griffins:0,dragons:0,experience:0,gold:120,faction:'Alianza del Alba'}),
  reveal:()=>{},render:()=>{},$ :()=>({hidden:false}),document:undefined};
 vm.createContext(ctx);vm.runInContext(fn,ctx);
 const success=ctx.completeCampaignIfReady();
 return {success,ctx,original,enemy};
}
test('levels 1–49 preserve veteran units, experience and faction and scale the rival',()=>{
 for(let level=1;level<50;level++){
  const {success,ctx,enemy}=run(level);
  assert.equal(success,true);
  assert.equal(ctx.s.campaignLevel,level+1);
  for(const k of ['soldiers','archers','griffins','dragons','experience','faction','gold'])assert.equal(ctx.s[k],{soldiers:17,archers:8,griffins:3,dragons:1,experience:1234,faction:'Guardianes del Bosque',gold:270}[k],k+' level '+level);
  assert.equal(enemy.soldiers,5+4*level);
  assert.equal(enemy.archers,2+2*level);
  assert.equal(enemy.gold,60+80*level);
 }
});
test('gold carryover retains minimum starting funds and caps overflow',()=>{
 assert.equal(run(12,{gold:0}).ctx.s.gold,120);
 assert.equal(run(12,{gold:200000000}).ctx.s.gold,100000000);
});
test('level 50 ends the campaign instead of creating level 51',()=>{
 const {success,ctx,original}=run(50);
 assert.equal(success,true);
 assert.equal(ctx.s,original);
 assert.equal(ctx.s.done,true);
 assert.equal(ctx.s.campaignLevel,50);
});
test('unfulfilled objective prevents a premature campaign transition',()=>{
 const {ctx}=run(8);
 ctx.s.campaignLevel=8;
 ctx.verifiedSiteState=()=>({rival:'rival'});
 assert.equal(ctx.completeCampaignIfReady(),false);
 assert.equal(ctx.s.campaignLevel,8);
});

test('defeating the commander without conquering the rival castle never advances',()=>{
 for(const level of [1,10,25,49,50]){
  const {ctx}=run(level);
  ctx.s.campaignLevel=level;ctx.s.done=false;
  ctx.verifiedSiteState=()=>({rival:'rival'});
  ctx.rivalState=()=>({defeated:true});
  assert.equal(ctx.completeCampaignIfReady(),false);
  assert.equal(ctx.s.campaignLevel,level);
  assert.equal(ctx.s.done,false);
 }
});
test('conquering the castle without defeating the commander never advances',()=>{
 for(const level of [1,10,25,49,50]){
  const {ctx}=run(level);
  ctx.s.campaignLevel=level;ctx.s.done=false;
  ctx.verifiedSiteState=()=>({rival:'player'});
  ctx.rivalState=()=>({defeated:false});
  assert.equal(ctx.completeCampaignIfReady(),false);
  assert.equal(ctx.s.campaignLevel,level);
  assert.equal(ctx.s.done,false);
 }
});
test('completed campaign cannot advance again or duplicate rewards',()=>{
 const {ctx}=run(50);
 assert.equal(ctx.completeCampaignIfReady(),false);
 assert.equal(ctx.s.campaignLevel,50);
});
