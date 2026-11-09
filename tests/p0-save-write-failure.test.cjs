'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 const start=html.indexOf('function persistGame(){'),end=html.indexOf('function save(){',start);
 test(page+': storage quota failure never reports a successful save',()=>{
  const old=JSON.stringify({gold:100}),data=new Map([['campaign',old]]);
  const ctx={STORE:'campaign',battle:null,rivalBusy:false,s:{gold:200},window:{nvrScheduleCloudSave:()=>{throw Error('cloud should not be scheduled')}},
   validGame:g=>g.gold>=0,localStorage:{getItem:k=>data.get(k)??null,setItem:(k,v)=>{if(k==='campaign')throw Error('QuotaExceededError');data.set(k,v)}}};
  vm.createContext(ctx);vm.runInContext(html.slice(start,end),ctx);
  assert.equal(ctx.persistGame(),false);
  assert.equal(data.get('campaign'),old);
  assert.equal(data.get('campaign-backup'),old);
 });
 test(page+': backup quota failure preserves previous campaign',()=>{
  const old=JSON.stringify({gold:100}),data=new Map([['campaign',old]]);
  const ctx={STORE:'campaign',battle:null,rivalBusy:false,s:{gold:200},window:{nvrScheduleCloudSave:()=>{}},
   validGame:g=>g.gold>=0,localStorage:{getItem:k=>data.get(k)??null,setItem:(k,v)=>{if(k==='campaign-backup')throw Error('QuotaExceededError');data.set(k,v)}}};
  vm.createContext(ctx);vm.runInContext(html.slice(start,end),ctx);
  assert.equal(ctx.persistGame(),false);
  assert.equal(data.get('campaign'),old);
 });
}
