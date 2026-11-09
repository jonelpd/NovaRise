'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8'),start=html.indexOf('function load(){'),end=html.indexOf('function exportSave()',start);
 test(page+': corrupt primary save restores last valid campaign backup',()=>{
  assert(start>=0&&end>start);
  const saved=new Map([['campaign','{corrupt'],['campaign-backup',JSON.stringify({gold:78,ownedMines:['2,3'],turn:4})]]);
  let rendered=0,reset=0,notice='';
  const ctx={STORE:'campaign',s:null,selectedMine:'',localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)},validGame:g=>g.gold===78,start:()=>reset++,reveal:()=>{},render:()=>rendered++,message:m=>notice=m};
  vm.createContext(ctx);vm.runInContext(html.slice(start,end),ctx);ctx.load();
  assert.equal(ctx.s.gold,78);assert.equal(ctx.selectedMine,'2,3');assert.equal(rendered,1);assert.equal(reset,0);assert.match(notice,/recuperado/);
 });
}

for(const page of ['index.html','combate-demo.html']){
 test(page+': preserve corrupt primary bytes before restoring backup',()=>{
  const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
  const start=html.indexOf('function load(){'),end=html.indexOf('function exportSave()',start);
  const saved=new Map([['campaign','{broken save'],['campaign-backup',JSON.stringify({gold:78,ownedMines:[],turn:4})]]);
  const ctx={STORE:'campaign',s:null,selectedMine:'',localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)},validGame:g=>g.gold===78,start:()=>{throw Error('Unexpected reset')},reveal:()=>{},render:()=>{},message:()=>{},Date:{now:()=>123456}};
  vm.createContext(ctx);vm.runInContext(html.slice(start,end),ctx);ctx.load();
  assert.equal(saved.get('campaign-recovery-123456'),'{broken save');
  assert.equal(ctx.s.gold,78);
 });
}
