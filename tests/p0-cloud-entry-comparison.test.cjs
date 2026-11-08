'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../juego/index.html'),'utf8');
const begin=html.indexOf('async function inspectCloudOnEntry(userId){'),end=html.indexOf('async function refresh(){',begin);
assert(begin>=0&&end>begin);
const code=html.slice(begin,end);
async function scenario({local={gold:12},remote={gold:22},switchUser=false,changeLocal=false,fail=false}={}){
 const userId='player-a',key='novarise-reinos-reset-20261103-user-'+userId,store=new Map();
 if(local!==null)store.set(key,JSON.stringify(local));
 let writes=0,infoText='';
 const ctx={currentUser:{id:userId},localStorage:{getItem:k=>store.get(k)||null,setItem:()=>{writes++}},validGame:v=>v&&Number.isInteger(v.gold),info:v=>{infoText=v}};
 ctx.db={from:()=>({select:()=>({eq:()=>({maybeSingle:async function(){
  if(switchUser)ctx.currentUser={id:'player-b'};
  if(changeLocal)store.set(key,JSON.stringify({gold:99}));
  return {data:remote?{save_data:remote,updated_at:'2026-11-08T20:00:00Z',revision:2}:null,error:fail?{message:'offline'}:null};
 }})})})};
 vm.createContext(ctx);vm.runInContext(code,ctx);await ctx.inspectCloudOnEntry(userId);
 return {writes,infoText,store};
}
test('divergent campaigns are never replaced automatically',async()=>{
 const r=await scenario();assert.equal(r.writes,0);assert.equal(JSON.parse(r.store.values().next().value).gold,12);assert.match(r.infoText,/dos partidas diferentes/);
});
test('cloud-only campaign is announced without automatic restore',async()=>{
 const r=await scenario({local:null});assert.equal(r.writes,0);assert.match(r.infoText,/Usa «Recuperar»/);
});
test('matching campaigns and absent cloud are explained',async()=>{
 assert.match((await scenario({remote:{gold:12}})).infoText,/coinciden/);
 assert.match((await scenario({remote:null})).infoText,/No hay una partida/);
});
test('account changes or local progress changes cancel stale comparison',async()=>{
 assert.equal((await scenario({switchUser:true})).infoText,'');
 assert.equal((await scenario({changeLocal:true})).infoText,'');
});
test('network errors preserve local campaign',async()=>{
 const r=await scenario({fail:true});assert.match(r.infoText,/No se pudo comparar/);assert.equal(r.writes,0);
});
