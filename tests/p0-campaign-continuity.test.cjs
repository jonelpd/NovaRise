'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 const saveStart=html.indexOf('function persistGame(){');
 const saveEnd=html.indexOf('function save(){',saveStart);
 const loadStart=html.indexOf('function load(){');
 const loadEnd=html.indexOf('function exportSave()',loadStart);
 const validatorStart=html.indexOf('function validGame(');
 const validatorEnd=Math.min(...[html.indexOf('function load(){',validatorStart),html.indexOf('function validImport(',validatorStart)].filter(i=>i>validatorStart));
 const validatorSource=validatorStart>=0&&validatorEnd>validatorStart?html.slice(validatorStart,validatorEnd):'';
 const validGame=vm.runInNewContext(validatorSource+';validGame');

 function campaign(){
  return {x:4,y:5,turn:9,moves:3,gold:1234,crystals:220,seasonPoints:5,
   soldiers:12,archers:8,griffins:2,dragons:1,experience:85,
   faction:'Alianza del Alba',seen:['4,5','4,4'],taken:['2,1'],
   claimed:['3,3'],ownedMines:['2,3'],buildings:['barracks'],
   rewardClaims:['reward-1'],mineLevels:{'2,3':2},miners:{'2,3':1},
   rival:{x:7,y:7,claimed:['8,8']},castleGarrisons:{'3,3':{soldiers:4}},
   message:'Campaña en progreso'};
 }
 function environment(store,state){
  const ctx={STORE:'campaign',s:state,selectedMine:'',battle:null,rivalBusy:false,
   window:{nvrScheduleCloudSave:()=>{}},
   localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,v)},
   validGame,start:()=>{throw Error('Unexpected campaign reset')},
   reveal:()=>{},render:()=>{},message:()=>{}};
  vm.createContext(ctx);
  vm.runInContext(html.slice(saveStart,saveEnd),ctx);
  vm.runInContext(html.slice(loadStart,loadEnd),ctx);
  return ctx;
 }
 test(page+': campaign progress survives save, browser restart and second save',()=>{
  assert(saveStart>=0&&saveEnd>saveStart&&loadStart>=0&&loadEnd>loadStart);
  const storage=new Map();
  const original=campaign();
  assert.equal(validGame(original),true);
  const first=environment(storage,original);
  assert.equal(first.persistGame(),true);
  const snapshot=storage.get('campaign');
  const reopened=environment(storage,null);
  reopened.load();
  assert.equal(JSON.stringify(reopened.s),snapshot);
  assert.equal(reopened.selectedMine,'2,3');
  reopened.s.gold+=50;
  reopened.s.turn++;
  reopened.s.claimed.push('6,6');
  assert.equal(reopened.persistGame(),true);
  assert.equal(storage.get('campaign-backup'),snapshot);
  const third=environment(storage,null);
  third.load();
  assert.equal(third.s.gold,1284);
  assert.equal(third.s.turn,10);
  assert.deepEqual(Array.from(third.s.claimed),['3,3','6,6']);
  assert.equal(third.s.rival.claimed[0],'8,8');
  assert.equal(third.s.castleGarrisons['3,3'].soldiers,4);
 });
 test(page+': interrupted primary write recovers the previous full campaign',()=>{
  const storage=new Map();
  const original=campaign();
  const first=environment(storage,original);
  assert.equal(first.persistGame(),true);
  const backup=storage.get('campaign');
  first.s.gold=1500;
  assert.equal(first.persistGame(),true);
  storage.set('campaign','{interrupted write');
  const recovered=environment(storage,null);
  let notice='';
  recovered.message=m=>{notice=m};
  recovered.load();
  assert.equal(recovered.s.gold,1234);
  assert.equal(recovered.s.turn,9);
  assert.equal(recovered.s.ownedMines[0],'2,3');
  assert.equal(recovered.s.castleGarrisons['3,3'].soldiers,4);
  assert.equal(storage.get('campaign-backup'),backup);
  assert.match(notice,/recuperado/);
 });
}
