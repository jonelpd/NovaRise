const test=require('node:test');
const assert=require('node:assert/strict');
const {validatePreciseRoute}=require('../server/nvra-precise-route.cjs');
const mask=(blocked)=>{const b=Buffer.alloc(800);for(const [x,y] of blocked){const i=y*80+x;b[i>>3]|=128>>(i&7)}return {size:80,blocked:b.toString('base64')}};
test('rejects route jumps, missing paths and blocked cells',()=>{
 const m=mask([[3,2]]);
 assert.equal(validatePreciseRoute([{x:1,y:1},{x:4,y:1}],m).reason,'non_adjacent_step');
 assert.equal(validatePreciseRoute([{x:2,y:2},{x:3,y:2}],m).reason,'blocked_or_invalid_cell');
 assert.equal(validatePreciseRoute([{x:1,y:1}],m).reason,'invalid_route');
 assert.equal(validatePreciseRoute([{x:0,y:0},{x:80,y:0}],m).reason,'blocked_or_invalid_cell');
});
test('blocks diagonal squeezing between obstacles',()=>{
 const m=mask([[2,1],[1,2]]);
 assert.equal(validatePreciseRoute([{x:1,y:1},{x:2,y:2}],m).reason,'blocked_diagonal_corner');
 assert.equal(validatePreciseRoute([{x:1,y:1},{x:2,y:2}],mask([[2,1]])).ok,true);
});
test('open route is only a precheck, not permission to move or mine',()=>{
 assert.deepEqual(validatePreciseRoute([{x:1,y:1},{x:2,y:1},{x:2,y:2}],mask([])),{ok:true,requires_server_state_and_encounter_validation:true,steps:2});
 assert.equal(validatePreciseRoute([{x:1,y:1},{x:2,y:1}],{size:80,blocked:'bad'}).reason,'invalid_navigation_mask');
});
