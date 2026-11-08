'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../juego/index.html'),'utf8');
const start=html.indexOf("el('online-load').onclick=()=>run(async()=>{");
const end=html.indexOf("db.auth.onAuthStateChange",start);
assert(start>=0&&end>start,'Cloud restore handler must exist');
const handler=html.slice(start,end);
async function scenario(failKey){
 const values=new Map([['SAVE',JSON.stringify({gold:77})],['OWNER','player-a']]);
 let reloaded=false, error=null;
 const elements={'modal':{hidden:true},'online-load':{}};
 const ctx={
  el:id=>elements[id]||{}, s:{gold:77},currentUser:{id:'player-a'},
  db:{from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:{save_data:{gold:99},updated_at:'2026-11-03T09:00:00Z',revision:1},error:null})})})})},
  validGame:()=>true,
  localStorage:{
   getItem:key=>values.has(key)?values.get(key):null,
   setItem:(key,value)=>{if(key===failKey)throw Error('storage blocked');values.set(key,value)},
   removeItem:key=>values.delete(key)
  },
  OWNER:'OWNER',SAVE:'SAVE',rivalBusy:false,realmConfirm:async()=>true,
  location:{reload:()=>{reloaded=true}},
  run:async fn=>{try{await fn()}catch(e){error=e}}
 };
 vm.runInNewContext(handler,ctx);
 await elements['online-load'].onclick();
 return {values,reloaded,error};
}
(async()=>{
 for(const key of [null,'SAVE','OWNER']){
  const r=await scenario(key);
  assert.equal(r.reloaded,key===null,'Reload only after successful restore');
  assert.equal(Boolean(r.error),key!==null,'Storage failure must be reported');
  assert.equal(JSON.parse(r.values.get('SAVE')).gold,key===null?99:77,'Do not lose local progress');
  assert.equal(r.values.get('OWNER'),'player-a','Keep account ownership');
  assert(r.values.has('SAVE-before-cloud-restore'),'Backup must exist');
 }
 console.log('PASS: cloud restore, save failure rollback, owner failure rollback');
})().catch(e=>{console.error(e);process.exitCode=1});
