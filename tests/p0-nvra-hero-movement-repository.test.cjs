const test=require('node:test');
const assert=require('node:assert/strict');
const {createHeroMovementRepository}=require('../server/nvra-hero-movement-repository.cjs');
test('trusted adapter passes exact CAS inputs',async()=>{
 let name,args;
 const db={async rpc(n,a){name=n;args=a;return {data:true,error:null}}};
 const repo=createHeroMovementRepository(db);
 assert.equal(await repo.compareAndSwapMove({userId:'u',campaignId:'c',expectedRevision:3,from:{x:20,y:30},to:{x:21,y:30},cost:2}),true);
 assert.equal(name,'nvr_cas_authoritative_hero_move');
 assert.deepEqual(args,{p_user_id:'u',p_campaign_id:'c',p_expected_revision:3,p_from_x:20,p_from_y:30,p_to_x:21,p_to_y:30,p_cost:2});
});
test('adapter rejects malformed coordinates without database calls',async()=>{
 let calls=0;
 const repo=createHeroMovementRepository({async rpc(){calls++;return {data:true,error:null}}});
 assert.equal(await repo.compareAndSwapMove({userId:'u',campaignId:'c',expectedRevision:3,from:{x:0,y:30},to:{x:21,y:30},cost:1}),false);
 assert.equal(calls,0);
});
test('adapter reports CAS conflicts and database errors',async()=>{
 const params={userId:'u',campaignId:'c',expectedRevision:3,from:{x:20,y:30},to:{x:21,y:30},cost:1};
 assert.equal(await createHeroMovementRepository({async rpc(){return {data:false,error:null}}}).compareAndSwapMove(params),false);
 await assert.rejects(()=>createHeroMovementRepository({async rpc(){return {data:null,error:new Error('db')}}}).compareAndSwapMove(params),/db/);
});
