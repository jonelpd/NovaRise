'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 const start=html.indexOf('function persistGame(){'),end=html.indexOf('function load(){',start);
 test(page+': autosave preserves previous valid snapshot and rejects invalid game',()=>{
  assert(start>=0&&end>start);
  const store=new Map(),s={gold:100,turn:2},ctx={s,STORE:'campaign',battle:null,rivalBusy:false,validGame:g=>Number.isInteger(g.gold)&&g.gold>=0,message:()=>{},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)}};
  vm.createContext(ctx);vm.runInContext(html.slice(start,end),ctx);
  assert.equal(ctx.persistGame(),true);
  s.gold=150;assert.equal(ctx.persistGame(),true);
  assert.equal(JSON.parse(store.get('campaign')).gold,150);
  assert.equal(JSON.parse(store.get('campaign-backup')).gold,100);
  s.gold=-1;assert.equal(ctx.persistGame(),false);
  assert.equal(JSON.parse(store.get('campaign')).gold,150);
  s.gold=160;ctx.battle={};assert.equal(ctx.persistGame(),false);
  ctx.battle=null;ctx.rivalBusy=true;assert.equal(ctx.persistGame(),false);
  assert.equal(JSON.parse(store.get('campaign')).gold,150);
 });
}
