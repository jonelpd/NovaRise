const test=require('node:test');
const assert=require('node:assert/strict');
const {createCampaignRepository}=require('../server/nvra-supabase-campaign-repository.cjs');
test('server adapter loads only matching user and campaign',async()=>{
 const filters=[];
 const client={from(table){assert.equal(table,'nvr_authoritative_campaigns');return {select(cols){assert.match(cols,/owned_mines/);return {eq(key,value){filters.push([key,value]);return this},async maybeSingle(){return {data:{revision:1,status:'active',hero_x:18.5,hero_y:46.5,moves:3,owned_mines:[]},error:null}}}}}},rpc:async()=>({data:true,error:null})};
 const r=createCampaignRepository(client);
 assert.equal((await r.load('u1','c1')).revision,1);
 assert.deepEqual(filters,[['user_id','u1'],['campaign_id','c1']]);
});
test('CAS adapter passes exact revision and mine id to server-only RPC',async()=>{
 let seen;
 const r=createCampaignRepository({from:()=>({}),rpc:async(name,args)=>{seen={name,args};return {data:true,error:null}}});
 assert.equal(await r.compareAndSwap({userId:'u1',campaignId:'c1',expectedRevision:4,next:{owned_mines:['mine-west']}}),true);
 assert.deepEqual(seen,{name:'nvr_cas_authoritative_mine_capture',args:{p_user_id:'u1',p_campaign_id:'c1',p_expected_revision:4,p_site_id:'mine-west'}});
 assert.equal(await r.compareAndSwap({userId:'u1',campaignId:'c1',expectedRevision:4,next:{owned_mines:[]}}),false);
});
