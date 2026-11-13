const test=require('node:test');
const assert=require('node:assert/strict');
const {applyMineCapture}=require('../server/nvra-authoritative-campaign-service.cjs');
const initial=()=>({status:'active',revision:1,hero_x:18.5,hero_y:46.5,moves:3,owned_mines:[]});
test('only persisted server state is read, and successful capture uses CAS',async()=>{
 let stored=initial(),writes=0;
 const repository={load:async()=>structuredClone(stored),compareAndSwap:async({expectedRevision,next})=>{if(stored.revision!==expectedRevision)return false;stored=next;writes++;return true}};
 const args={userId:'user1',campaignId:'campaign1',action:{type:'capture_mine',site_id:'mine-west',hero_x:18.5,hero_y:46.5},repository};
 const result=await applyMineCapture(args);
 assert.deepEqual(result,{ok:true,revision:2,site_id:'mine-west',points:0,verified:false});
 assert.equal(writes,1);
 assert.equal((await applyMineCapture(args)).reason,'already_owned');
});
test('concurrent attempts cannot both commit the same revision',async()=>{
 let stored=initial(),writes=0;
 const repository={load:async()=>structuredClone(stored),compareAndSwap:async({expectedRevision,next})=>{await Promise.resolve();if(stored.revision!==expectedRevision)return false;stored=next;writes++;return true}};
 const args={userId:'user1',campaignId:'campaign1',action:{type:'capture_mine',site_id:'mine-west'},repository};
 const results=await Promise.all([applyMineCapture(args),applyMineCapture(args)]);
 assert.equal(results.filter(r=>r.ok).length,1);
 assert.equal(results.filter(r=>r.reason==='revision_conflict').length,1);
 assert.equal(writes,1);
});
test('rejects invalid requests and never commits failed captures',async()=>{
 let writes=0;
 const repository={load:async()=>initial(),compareAndSwap:async()=>{writes++;return true}};
 const result=await applyMineCapture({userId:'user1',campaignId:'campaign1',action:{type:'capture_mine',site_id:'fake'},repository});
 assert.equal(result.reason,'unknown_mine');assert.equal(writes,0);
 assert.equal((await applyMineCapture({userId:'',campaignId:'campaign1',action:{},repository})).reason,'invalid_request');
});
