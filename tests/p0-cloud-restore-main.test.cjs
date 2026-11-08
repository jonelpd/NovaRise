'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../juego/index.html'),'utf8');
const start=html.indexOf("el('online-load').onclick=()=>run(async()=>{");
const end=html.indexOf("db.auth.onAuthStateChange",start);
assert(start>=0&&end>start,'Cloud restore handler must exist');
const handler=html.slice(start,end);
async function scenario(failKey,remoteChanged=false){
 const values=new Map([['SAVE',JSON.stringify({gold:77})],['OWNER','player-a']]);
 let reloaded=false, error=null;
 const elements={'modal':{hidden:true},'online-load':{}};let reads=0;
 const ctx={
  el:id=>elements[id]||{}, s:{gold:77},currentUser:{id:'player-a'},
  db:{from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:{save_data:{gold:99},updated_at:'2026-11-03T09:00:00Z',revision:remoteChanged&&++reads>1?2:1},error:null})})})})},
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
 const conflict=await scenario(null,true);assert.equal(conflict.reloaded,false,'Changed cloud revision must cancel restore');assert(conflict.error,'Changed cloud revision must be reported');assert.equal(JSON.parse(conflict.values.get('SAVE')).gold,77,'Keep local progress on remote conflict');
 console.log('PASS: cloud restore, save failure rollback, owner failure rollback, remote revision conflict');
})().catch(e=>{console.error(e);process.exitCode=1});
