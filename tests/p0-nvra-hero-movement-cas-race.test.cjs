const test=require('node:test');
const assert=require('node:assert/strict');
const {createHeroMovementRepository}=require('../server/nvra-hero-movement-repository.cjs');

// Simulated atomic Postgres CAS: a single revision can be committed once.
// This is NOT a live Supabase concurrency test.
test('two simultaneous CAS requests cannot spend the same revision in simulated adapter',async()=>{
 let revision=7,nav_x=30,nav_y=30,moves=3;
 const db={async rpc(name,p){
  assert.equal(name,'nvr_cas_authoritative_hero_move');
  await Promise.resolve();
  if(p.p_expected_revision!==revision||p.p_from_x!==nav_x||p.p_from_y!==nav_y||moves<p.p_cost)return {data:false,error:null};
  revision++;nav_x=p.p_to_x;nav_y=p.p_to_y;moves-=p.p_cost;
  return {data:true,error:null};
 }};
 const repo=createHeroMovementRepository(db);
 const base={userId:'test',campaignId:'test',expectedRevision:7,from:{x:30,y:30},cost:2};
 const results=await Promise.all([
  repo.compareAndSwapMove({...base,to:{x:31,y:30}}),
  repo.compareAndSwapMove({...base,to:{x:30,y:31}})
 ]);
 assert.deepEqual(results.sort(),[false,true]);
 assert.equal(revision,8);
 assert.equal(moves,1);
});
