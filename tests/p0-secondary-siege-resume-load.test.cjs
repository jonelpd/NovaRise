'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'..','juego','index.html'),'utf8');
const start=html.indexOf('function resumeSecondarySiegeAfterLoad(');
const end=html.indexOf('function load(){',start);
assert.ok(start>0&&end>start);
function fixture(pending=true){
 const campaign={pendingSecondarySiege:pending?{commanderId:'fort-west'}:null};
 let callback=null,calls=0,recovered=0;
 const ctx={s:campaign,battle:null,rivalBusy:false,setTimeout:fn=>{callback=fn;return 1},recoverSecondarySiegeDecision:()=>{recovered++;return {}},promptSecondarySiegeDefense:()=>{calls++;return Promise.resolve(true)}};
 vm.createContext(ctx);vm.runInContext(html.slice(start,end),ctx);
 return {ctx,campaign,run:()=>callback?.(),scheduled:()=>!!callback,calls:()=>calls,recovered:()=>recovered};
}
test('reload schedules pending secondary defense without immediate modal',()=>{
 const f=fixture();f.ctx.resumeSecondarySiegeAfterLoad(f.campaign);
 assert.equal(f.scheduled(),true);assert.equal(f.calls(),0);
 f.run();assert.equal(f.calls(),1);assert.equal(f.recovered(),1);
});
test('reload ignores absent pending siege',()=>{
 const f=fixture(false);f.ctx.resumeSecondarySiegeAfterLoad(f.campaign);
 assert.equal(f.scheduled(),false);
});
test('reload does not reopen siege for a replaced campaign',()=>{
 const f=fixture();f.ctx.resumeSecondarySiegeAfterLoad(f.campaign);
 f.ctx.s={pendingSecondarySiege:{}};f.run();assert.equal(f.calls(),0);
});
test('reload does not interrupt ongoing battle or rival turn',()=>{
 for(const field of ['battle','rivalBusy']){
  const f=fixture();f.ctx.resumeSecondarySiegeAfterLoad(f.campaign);
  f.ctx[field]=field==='battle'?{}:true;f.run();assert.equal(f.calls(),0);
 }
});
