const test=require('node:test');
const assert=require('node:assert/strict');
const {createCampaignRepository}=require('../server/nvra-supabase-campaign-repository.cjs');
test('repository reads authoritative navigation fields without writing',async()=>{
 const calls=[];
 const row={revision:2,status:'active',hero_x:10,hero_y:20,nav_x:null,nav_y:null,moves:4,owned_mines:[]};
 const chain={
  select(fields){calls.push(['select',fields]);return this},
  eq(key,value){calls.push(['eq',key,value]);return this},
  async maybeSingle(){return {data:row,error:null}}
 };
 const db={from(table){calls.push(['from',table]);return chain},rpc(){throw Error('unexpected write')}};
 const repo=createCampaignRepository(db);
 assert.equal(await repo.load('user','campaign'),row);
 assert.ok(calls.some(c=>c[0]==='select'&&c[1].includes('nav_x,nav_y')));
 assert.deepEqual(calls.filter(c=>c[0]==='eq'),[['eq','user_id','user'],['eq','campaign_id','campaign']]);
});
test('repository does not synthesize an unverified navigation position',async()=>{
 const db={from(){return {select(){return this},eq(){return this},async maybeSingle(){return {data:{revision:1,status:'active',nav_x:null,nav_y:null},error:null}}}},rpc(){throw Error('unexpected')}};
 const state=await createCampaignRepository(db).load('u','c');
 assert.equal(state.nav_x,null);assert.equal(state.nav_y,null);
});
