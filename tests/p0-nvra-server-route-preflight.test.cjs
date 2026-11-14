const test=require('node:test');
const assert=require('node:assert/strict');
const {validateServerRoutePreflight}=require('../server/nvra-server-route-preflight.cjs');
const mask={size:80,blocked:Buffer.alloc(800).toString('base64')};
const state={status:'active',revision:5,nav_x:30,nav_y:30,moves:4};
const action={type:'move',expectedRevision:5,route:[{x:30,y:30},{x:31,y:30}]};
test('preflight requires server-owned origin and revision',()=>{
 assert.equal(validateServerRoutePreflight(state,{...action,expectedRevision:4},mask).reason,'stale_or_invalid_revision');
 assert.equal(validateServerRoutePreflight(state,{...action,route:[{x:29,y:30},{x:30,y:30}]},mask).reason,'origin_mismatch');
 assert.equal(validateServerRoutePreflight({...state,nav_x:undefined},action,mask).reason,'missing_authoritative_position');
 assert.equal(validateServerRoutePreflight({...state,status:'finished'},action,mask).reason,'inactive_campaign');
});
test('preflight never authorizes commit or NVRA reward',()=>{
 const result=validateServerRoutePreflight(state,action,mask);
 assert.deepEqual(result,{ok:true,requires_authoritative_encounter_and_atomic_commit:true,steps:1});
 assert.equal(validateServerRoutePreflight({...state,moves:0},action,mask).reason,'insufficient_moves');
 assert.deepEqual(state,{status:'active',revision:5,nav_x:30,nav_y:30,moves:4});
});
