'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

for(const page of ['index.html','combate-demo.html']){
 test(page+': invalid local save remains intact and recovery is attempted',()=>{
  const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
  const start=html.indexOf('function load(){');
  const end=html.indexOf('function exportSave()',start);
  assert(start>=0&&end>start);
  const original='{broken json';
  const values=new Map([['campaign',original]]);
  const ctx={
   STORE:'campaign',s:null,selectedMine:null,
   localStorage:{
    getItem:k=>values.get(k)??null,
    setItem:(k,v)=>values.set(k,v)
   },
   validGame:()=>false,
   start:()=>{if(ctx.STORE)values.set(ctx.STORE,'NEW GAME')},
   message:()=>{},reveal:()=>{},render:()=>{}
  };
  vm.createContext(ctx);
  vm.runInContext(html.slice(start,end),ctx);
  ctx.load();
  assert.equal(values.get('campaign'),original);
  assert.equal(ctx.STORE,null);
  assert([...values.keys()].some(k=>k.startsWith('campaign-recovery-')));
 });
 test(page+': valid local save restores instead of resetting',()=>{
  const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
  const start=html.indexOf('function load(){');
  const end=html.indexOf('function exportSave()',start);
  const game={gold:44,ownedMines:[]};
  let reset=false,rendered=false;
  const ctx={
   STORE:'campaign',s:null,selectedMine:null,
   localStorage:{getItem:()=>JSON.stringify(game),setItem:()=>{}},
   validGame:g=>g.gold===44,
   start:()=>{reset=true},message:()=>{},reveal:()=>{},render:()=>{rendered=true}
  };
  vm.createContext(ctx);vm.runInContext(html.slice(start,end),ctx);ctx.load();
  assert.equal(ctx.s.gold,44);assert.equal(reset,false);assert.equal(rendered,true);
 });
}
