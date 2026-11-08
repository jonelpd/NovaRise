'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'..','juego',page),'utf8');
 test(page+': turn remains locked throughout the asynchronous siege decision',()=>{
  const start=html.indexOf('async function rivalTurn(){');
  const end=html.indexOf('function updateSiegeReport(){',start);
  assert.ok(start>=0&&end>start);
  const turn=html.slice(start,end);
  const finallyStart=turn.indexOf('}finally{');
  const decision=turn.indexOf('await realmConfirm(',finallyStart);
  const release=turn.indexOf('rivalBusy=false;',finallyStart);
  assert.ok(finallyStart>=0&&decision>finallyStart&&release>decision,
    'rivalBusy must remain true until the siege dialogue has completed');
  assert.match(turn,/rivalBusy=false;\s*if\(!battle&&s\.rivalEncounterPending\)/,
    'encounter can start only after turn is unlocked');
  assert.match(turn,/else rivalBusy=false;/,
    'aborted turns must also release the lock');
 });
 test(page+': empty garrison does not overwrite player army',()=>{
  const start=html.indexOf('function launchDefensiveSiege(site){');
  const end=html.indexOf('function rivalCastleConquest(){',start);
  assert.ok(start>=0&&end>start);
  const snippet=html.slice(start,end);
  const state={autoResolveDefensiveSiege:false,message:'',soldiers:25,archers:9,griffins:2,dragons:1};
  const garrison={defenders:{soldiers:0,archers:0,griffins:0,dragons:0}};
  let automatic=0,rendered=0,showed=0;
  const context={
   s:state,
   CASTLE_RECRUIT_COST:{soldiers:30,archers:50,griffins:110,dragons:300},
   siteGarrison:()=>garrison,
   rivalCastleConquest:()=>{automatic++;assert.equal(state.autoResolveDefensiveSiege,true);return 'Automatic defense';},
   render:()=>{rendered++;},
   showBattle:()=>{showed++;},
   rivalState:()=>({soldiers:4,archers:1}),
   battle:null
  };
  vm.createContext(context);
  vm.runInContext(snippet,context);
  context.launchDefensiveSiege({id:'fort-west'});
  assert.equal(automatic,1);
  assert.equal(rendered,1);
  assert.equal(showed,0);
  assert.equal(context.battle,null);
  assert.equal(state.autoResolveDefensiveSiege,false);
  assert.equal(state.soldiers,25);
  assert.equal(state.archers,9);
  assert.equal(state.griffins,2);
  assert.equal(state.dragons,1);
 });
}
