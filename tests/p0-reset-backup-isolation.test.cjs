'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 const start=html.indexOf("$('reset').onclick=");
 const end=html.indexOf(";$('attack').onclick",start);
 test(page+': new campaign removes stale backup as well as primary save',async()=>{
  assert(start>=0&&end>start);
  const store=new Map([['campaign','old save'],['campaign-backup','older campaign']]);
  let started=0;
  const buttons={reset:{}};
  const state={gold:20};
  const ctx={$:id=>buttons[id]??(buttons[id]={}),rivalBusy:false,walking:false,battle:null,STORE:'campaign',s:state,
   realmConfirm:async()=>true,message:()=>{},start:()=>{started++},
   localStorage:{getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,value),removeItem:key=>store.delete(key)}};
  vm.createContext(ctx);vm.runInContext(html.slice(start,end),ctx);
  await buttons.reset.onclick();
  assert.equal(started,1);
  assert.equal(store.has('campaign'),false);
  assert.equal(store.has('campaign-backup'),false);
 });
 test(page+': cancelled new campaign preserves primary and backup',async()=>{
  const store=new Map([['campaign','old save'],['campaign-backup','older campaign']]);
  const buttons={reset:{}};let started=0;
  const ctx={$:id=>buttons[id]??(buttons[id]={}),rivalBusy:false,walking:false,battle:null,STORE:'campaign',s:{gold:20},
   realmConfirm:async()=>false,message:()=>{},start:()=>{started++},localStorage:{getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,value),removeItem:key=>store.delete(key)}};
  vm.createContext(ctx);vm.runInContext(html.slice(start,end),ctx);
  await buttons.reset.onclick();
  assert.equal(started,0);
  assert.equal(store.get('campaign'),'old save');
  assert.equal(store.get('campaign-backup'),'older campaign');
 });
 test(page+': failed primary removal restores the previous backup and aborts reset',async()=>{
  const store=new Map([['campaign','old save'],['campaign-backup','older campaign']]);
  const buttons={reset:{}};let started=0,notice='';
  const ctx={$:id=>buttons[id]??(buttons[id]={}),rivalBusy:false,walking:false,battle:null,STORE:'campaign',s:{gold:20},
   realmConfirm:async()=>true,message:t=>{notice=t},start:()=>{started++},
   localStorage:{getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,value),
    removeItem:key=>{if(key==='campaign')throw Error('blocked');store.delete(key)}}};
  vm.createContext(ctx);vm.runInContext(html.slice(start,end),ctx);
  await buttons.reset.onclick();
  assert.equal(started,0);
  assert.equal(store.get('campaign'),'old save');
  assert.equal(store.get('campaign-backup'),'older campaign');
  assert.match(notice,/No se pudo limpiar/);
 });
}
